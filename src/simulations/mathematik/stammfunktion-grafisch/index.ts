import { defineSimulation, ease, mixColor, Plot, prefersReducedMotion, roundRect, Surface, textOn, withAlpha, type Rect } from '../../../sim-core';
import { formula, type FormulaBox, type FormulaStyle } from './formula';
import {
  APPS,
  constantFor,
  DEFAULT_COEFFS,
  features,
  mathFn,
  pieces,
  rangeOf,
  rateSketch,
  signTable,
  spline,
  type AppKey,
  type Coeffs,
  type Features,
  type Fn,
  type FnKey,
  type Piece,
  type Rating,
  type SignInterval,
} from './model';

const L = (de: string, en: string) => ({ de, en });
type Txt = { de: string; en: string };
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const clamp01 = (t: number) => clamp(t, 0, 1);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const TAU = Math.PI * 2;

type Mode = 'trace' | 'feld' | 'feat' | 'area' | 'back' | 'draw';
type Kind = 'math' | 'app';
type Lng = 'de' | 'en';
const MODES: Mode[] = ['trace', 'feld', 'feat', 'area', 'back', 'draw'];
const COEF_KEYS = ['lm', 'lt', 'pa', 'pb', 'pc', 'k3', 'k2', 'k1', 'k0', 'sa', 'sb', 'ea', 'eb', 'gs', 's1', 's2', 's3', 'j1', 'j2', 'q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7'] as const;
type CoefKey = (typeof COEF_KEYS)[number];
const SK_KEYS = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7'] as const;
const SWEEP_MS = 5600;

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
    if (Math.abs(this.goal - this.v) <= 1e-5 * (1 + Math.abs(this.goal))) this.v = this.goal;
    return true;
  }
}

/** Texte und Einheiten einer Anwendung. */
interface AppMeta {
  title: Txt;
  /** Name der Variablen (t) */
  v: string;
  uX: Txt;
  /** Name und Einheit der Änderungsrate */
  f: string;
  uF: Txt;
  /** Name und Einheit des Bestands */
  F: string;
  uI: Txt;
  /** rechte Seiten der Terme (Kurzschrift) */
  fSrc: Txt;
  FSrc: Txt;
  rate: Txt;
  amount: Txt;
  note: Txt;
}

const APP_META: Record<AppKey, AppMeta> = {
  pool: {
    title: L('Regenbecken: Zufluss → Wassermenge', 'Storage basin: inflow → amount of water'),
    v: 't',
    uX: L('h', 'h'),
    f: 'q',
    uF: L('m³/h', 'm³/h'),
    F: 'V',
    uI: L('m³', 'm³'),
    fSrc: L('−0,5t² + 4t − 3,5', '−0.5t² + 4t − 3.5'),
    FSrc: L('−\\f{1}{6}t³ + 2t² − 3,5t', '−\\f{1}{6}t³ + 2t² − 3.5t'),
    rate: L('Netto-Zufluss (Regen minus Pumpe)', 'net inflow (rain minus pump)'),
    amount: L('Wassermenge im Becken', 'amount of water in the basin'),
    note: L('Anfangs pumpt die Pumpe mehr ab, als zufließt. Dann setzt starker Regen ein, der wieder nachlässt.', 'At first the pump removes more than flows in. Then heavy rain sets in and eases off again.'),
  },
  konto: {
    title: L('Sparkonto: Einzahlungsrate → Kontostand', 'Savings account: deposit rate → balance'),
    v: 't',
    uX: L('Monate', 'months'),
    f: 'r',
    uF: L('€/Monat', '€/month'),
    F: 'K',
    uI: L('€', '€'),
    fSrc: L('100 − 20t', '100 − 20t'),
    FSrc: L('100t − 10t²', '100t − 10t²'),
    rate: L('Einzahlungsrate (negativ: Abhebung)', 'deposit rate (negative: withdrawal)'),
    amount: L('Kontostand', 'balance'),
    note: L('Die Einzahlungen werden jeden Monat kleiner, später wird Geld abgehoben.', 'The deposits get smaller every month; later money is withdrawn.'),
  },
  ballon: {
    title: L('Heißluftballon: Steiggeschwindigkeit → Höhe', 'Hot-air balloon: climb rate → height'),
    v: 't',
    uX: L('min', 'min'),
    f: 'v',
    uF: L('m/min', 'm/min'),
    F: 'h',
    uI: L('m', 'm'),
    fSrc: L('30 · \\t{sin}(\\f{π}{10}t)', '30 · \\t{sin}(\\f{π}{10}t)'),
    FSrc: L('−\\f{300}{π} · \\t{cos}(\\f{π}{10}t)', '−\\f{300}{π} · \\t{cos}(\\f{π}{10}t)'),
    rate: L('Steiggeschwindigkeit (negativ: sinken)', 'climb rate (negative: sinking)'),
    amount: L('Höhe über dem Startplatz', 'height above the launch site'),
    note: L('Der Brenner heizt: Der Ballon steigt erst immer schneller, dann langsamer – danach sinkt er wieder.', 'The burner heats: the balloon climbs faster and faster, then more slowly – afterwards it sinks again.'),
  },
  lift: {
    title: L('Aufzug: Geschwindigkeit → Höhe', 'Lift: velocity → height'),
    v: 't',
    uX: L('s', 's'),
    f: 'v',
    uF: L('m/s', 'm/s'),
    F: 'h',
    uI: L('m', 'm'),
    fSrc: L('\\t{anfahren, fahren, bremsen}', '\\t{start, travel, brake}'),
    FSrc: L('\\i{0}{t} v(u) du', '\\i{0}{t} v(u) du'),
    rate: L('Geschwindigkeit (negativ: abwärts)', 'velocity (negative: downwards)'),
    amount: L('Höhe der Kabine', 'height of the car'),
    note: L('Ein Stockwerk ist 4 m hoch. Die Fläche unter v ist die Höhenänderung (abwärts negativ).', 'One floor is 4 m high. The area under v is the change in height (negative downwards).'),
  },
  heat: {
    title: L('Zimmer heizen: Temperaturänderung → Temperatur', 'Heating a room: rate of change → temperature'),
    v: 't',
    uX: L('h', 'h'),
    f: 'T′',
    uF: L('K/h', 'K/h'),
    F: 'T',
    uI: L('°C', '°C'),
    fSrc: L('4 · \\t{e}^{−0,5t} − 0,5', '4 · \\t{e}^{−0.5t} − 0.5'),
    FSrc: L('−8 · \\t{e}^{−0,5t} − 0,5t', '−8 · \\t{e}^{−0.5t} − 0.5t'),
    rate: L('Temperaturänderung (Heizung minus Wärmeverlust)', 'rate of change (heating minus heat loss)'),
    amount: L('Raumtemperatur', 'room temperature'),
    note: L('Die Heizung wirkt anfangs stark und lässt dann nach; durch Wände und Fenster gehen ständig 0,5 K pro Stunde verloren.', 'The heating is strong at first and then weakens; walls and windows constantly lose 0.5 K per hour.'),
  },
  akku: {
    title: L('Handy-Akku: Ladestrom → Ladung', 'Phone battery: charging current → charge'),
    v: 't',
    uX: L('h', 'h'),
    f: 'I',
    uF: L('A', 'A'),
    F: 'Q',
    uI: L('Ah', 'Ah'),
    fSrc: L('2 · \\t{e}^{−0,5t}', '2 · \\t{e}^{−0.5t}'),
    FSrc: L('−4 · \\t{e}^{−0,5t}', '−4 · \\t{e}^{−0.5t}'),
    rate: L('Ladestrom', 'charging current'),
    amount: L('Ladung im Akku', 'charge in the battery'),
    note: L('Der Ladestrom sinkt, je voller der Akku wird. 1 Ah = 1000 mAh; ein Handy-Akku hat etwa 4,5 Ah.', 'The current drops as the battery fills up. 1 Ah = 1000 mAh; a phone battery holds about 4.5 Ah.'),
  },
  park: {
    title: L('Parkhaus: Ein- und Ausfahrten → belegte Plätze', 'Car park: arrivals and departures → occupied spaces'),
    v: 't',
    uX: L('h (Uhrzeit)', 'h (time of day)'),
    f: 'r',
    uF: L('Autos/h', 'cars/h'),
    F: 'N',
    uI: L('Autos', 'cars'),
    fSrc: L('100 · \\t{sin}(\\f{π}{10}(t − 7))', '100 · \\t{sin}(\\f{π}{10}(t − 7))'),
    FSrc: L('−\\f{1000}{π} · \\t{cos}(\\f{π}{10}(t − 7))', '−\\f{1000}{π} · \\t{cos}(\\f{π}{10}(t − 7))'),
    rate: L('Einfahrten minus Ausfahrten pro Stunde', 'arrivals minus departures per hour'),
    amount: L('belegte Plätze', 'occupied spaces'),
    note: L('Um 6 Uhr stehen 40 Autos im Parkhaus. Zwischen 7 und 17 Uhr fahren mehr Autos ein als aus, davor und danach umgekehrt.', 'At 6 a.m. there are 40 cars in the car park. Between 7 a.m. and 5 p.m. more cars arrive than leave, before and after that the other way round.'),
  },
  co2: {
    title: L('Klassenzimmer: CO₂-Änderung → CO₂-Gehalt', 'Classroom: change of CO₂ → CO₂ level'),
    v: 't',
    uX: L('min', 'min'),
    f: 'r',
    uF: L('ppm/min', 'ppm/min'),
    F: 'K',
    uI: L('ppm', 'ppm'),
    fSrc: L('20 \\c{m}{(Unterricht)},  −160 \\c{m}{(Lüften)}', '20 \\c{m}{(lesson)},  −160 \\c{m}{(airing)}'),
    FSrc: L('\\i{0}{t} r(u) du', '\\i{0}{t} r(u) du'),
    rate: L('Änderung des CO₂-Gehalts', 'change of the CO₂ level'),
    amount: L('CO₂-Gehalt der Luft', 'CO₂ level of the air'),
    note: L('Außenluft hat etwa 400 ppm. Ab etwa 1000 ppm sollte gelüftet werden – Stoßlüften senkt den Wert schnell.', 'Outdoor air has about 400 ppm. Above about 1000 ppm the room should be aired – opening the windows wide lowers the level quickly.'),
  },
};

/**
 * Vom Graphen zur Stammfunktion: grafisches Aufleiten. Oben der Graph von f,
 * darunter Stammfunktionen F = F₀ + C. Sechs Ansichten: Steigung übertragen
 * (P läuft über f, F entsteht als Spur mit Steigungsdreieck), Richtungsfeld mit
 * Kurvenschar und ziehbarem Anfangspunkt (Anfangswertproblem), Merkmale
 * (Monotonie, Extrem-, Wende- und Terrassenpunkte mit Vorzeichentabelle),
 * Flächenstücke als Höhenänderungen, umgekehrt F → f mit laufender Tangente
 * und ein Aufgabenmodus, in dem man F selbst skizziert und vergleicht.
 * Zehn mathematische Funktionen (mit Koeffizienten, Treppe und selbst
 * gezeichneter Funktion) und acht Anwendungen mit Einheiten.
 */
export default defineSimulation({
  id: 'stammfunktion-grafisch',
  dragHint: true,
  hint: { de: 'Tipp: Zieh den Punkt über f – seine Höhe wird zur Steigung von F.', en: 'Tip: Drag the point along f – its height becomes the slope of F.' },
  layout: { aspect: 1.55, aspectNarrow: 0.4 },
  groups: [
    { id: 'coef', label: L('Koeffizienten von f', 'Coefficients of f') },
    { id: 'own', label: L('Eigene Funktion f: Werte an x = −3 … 3', 'Own function f: values at x = −3 … 3') },
    { id: 'sk', label: L('Deine Skizze von F: Höhen der sieben Punkte', 'Your sketch of F: heights of the seven points') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Ansicht', 'View'),
      options: [
        { value: 'trace', label: L('Steigung übertragen', 'Transfer the slope') },
        { value: 'feld', label: L('Richtungsfeld und F + C', 'Slope field and F + C') },
        { value: 'feat', label: L('Merkmale', 'Features') },
        { value: 'area', label: L('Flächenstücke', 'Area pieces') },
        { value: 'back', label: L('Umgekehrt: F → f', 'Reverse: F → f') },
        { value: 'draw', label: L('Aufgabe: F skizzieren', 'Task: sketch F') },
      ],
      default: 'trace',
    },
    {
      key: 'kind',
      type: 'choice',
      label: L('Funktion aus', 'Function from'),
      options: [
        { value: 'math', label: L('Mathematik', 'Mathematics') },
        { value: 'app', label: L('Alltag', 'Everyday life') },
      ],
      default: 'math',
    },
    {
      key: 'fn',
      type: 'choice',
      label: L('Funktion f', 'Function f'),
      options: [
        { value: 'lin', label: L('Gerade', 'Line') },
        { value: 'par', label: L('Parabel', 'Parabola') },
        { value: 'cub', label: L('Polynom 3. Grades', 'Cubic') },
        { value: 'sin', label: L('sin', 'sin') },
        { value: 'cos', label: L('cos', 'cos') },
        { value: 'exp', label: L('eˣ', 'eˣ') },
        { value: 'gauss', label: L('x · e^(−x²/2)', 'x · e^(−x²/2)') },
        { value: 'bell', label: L('Glocke', 'Bell curve') },
        { value: 'step', label: L('Treppe', 'Steps') },
        { value: 'own', label: L('selbst gezeichnet', 'drawn by you') },
      ],
      default: 'par',
      visibleIf: (v) => v.kind === 'math',
    },
    {
      key: 'app',
      type: 'choice',
      label: L('Beispiel aus dem Alltag', 'Everyday example'),
      options: [
        { value: 'pool', label: L('Regenbecken', 'Storage basin') },
        { value: 'konto', label: L('Sparkonto', 'Savings account') },
        { value: 'ballon', label: L('Heißluftballon', 'Hot-air balloon') },
        { value: 'lift', label: L('Aufzug', 'Lift') },
        { value: 'heat', label: L('Heizung', 'Heating') },
        { value: 'akku', label: L('Akku', 'Battery') },
        { value: 'park', label: L('Parkhaus', 'Car park') },
        { value: 'co2', label: L('CO₂ im Klassenzimmer', 'CO₂ in the classroom') },
      ],
      default: 'pool',
      visibleIf: (v) => v.kind === 'app',
    },
    { key: 'lm', type: 'number', group: 'coef', label: L('Steigung m', 'Slope m'), help: L('f(x) = m · x + t', 'f(x) = m · x + t'), min: -3, max: 3, step: 0.1, default: 0.5, visibleIf: (v) => v.kind === 'math' && v.fn === 'lin' },
    { key: 'lt', type: 'number', group: 'coef', label: L('y-Abschnitt t', 'y-intercept t'), min: -4, max: 4, step: 0.1, default: 0, visibleIf: (v) => v.kind === 'math' && v.fn === 'lin' },
    { key: 'pa', type: 'number', group: 'coef', label: L('Koeffizient a bei x²', 'Coefficient a of x²'), help: L('f(x) = a · x² + b · x + c', 'f(x) = a · x² + b · x + c'), min: -3, max: 3, step: 0.1, default: 1, visibleIf: (v) => v.kind === 'math' && v.fn === 'par' },
    { key: 'pb', type: 'number', group: 'coef', label: L('Koeffizient b bei x', 'Coefficient b of x'), min: -4, max: 4, step: 0.1, default: 0, visibleIf: (v) => v.kind === 'math' && v.fn === 'par' },
    { key: 'pc', type: 'number', group: 'coef', label: L('Absolutglied c', 'Constant term c'), min: -4, max: 4, step: 0.1, default: -1, visibleIf: (v) => v.kind === 'math' && v.fn === 'par' },
    { key: 'k3', type: 'number', group: 'coef', label: L('Koeffizient bei x³', 'Coefficient of x³'), help: L('f(x) = k₃x³ + k₂x² + k₁x + k₀', 'f(x) = k₃x³ + k₂x² + k₁x + k₀'), min: -1, max: 1, step: 0.05, default: 0.25, visibleIf: (v) => v.kind === 'math' && v.fn === 'cub' },
    { key: 'k2', type: 'number', group: 'coef', label: L('Koeffizient bei x²', 'Coefficient of x²'), min: -3, max: 3, step: 0.05, default: 0, visibleIf: (v) => v.kind === 'math' && v.fn === 'cub' },
    { key: 'k1', type: 'number', group: 'coef', label: L('Koeffizient bei x', 'Coefficient of x'), min: -4, max: 4, step: 0.1, default: -1, visibleIf: (v) => v.kind === 'math' && v.fn === 'cub' },
    { key: 'k0', type: 'number', group: 'coef', label: L('Absolutglied', 'Constant term'), min: -4, max: 4, step: 0.1, default: 0, visibleIf: (v) => v.kind === 'math' && v.fn === 'cub' },
    {
      key: 'sa',
      type: 'number',
      group: 'coef',
      label: L('Amplitude A', 'Amplitude A'),
      help: L('f(x) = A · sin(bx) bzw. A · cos(bx)', 'f(x) = A · sin(bx) or A · cos(bx)'),
      min: -3,
      max: 3,
      step: 0.1,
      default: 1,
      visibleIf: (v) => v.kind === 'math' && (v.fn === 'sin' || v.fn === 'cos'),
    },
    { key: 'sb', type: 'number', group: 'coef', label: L('Faktor b (Periode 2π/b)', 'Factor b (period 2π/b)'), min: 0.2, max: 3, step: 0.1, default: 1, visibleIf: (v) => v.kind === 'math' && (v.fn === 'sin' || v.fn === 'cos') },
    { key: 'ea', type: 'number', group: 'coef', label: L('Faktor c', 'Factor c'), help: L('f(x) = c · e^(kx)', 'f(x) = c · e^(kx)'), min: -3, max: 3, step: 0.1, default: 1, visibleIf: (v) => v.kind === 'math' && v.fn === 'exp' },
    { key: 'eb', type: 'number', group: 'coef', label: L('Wachstumskonstante k', 'Growth constant k'), min: -1.5, max: 1.5, step: 0.05, default: 1, visibleIf: (v) => v.kind === 'math' && v.fn === 'exp' },
    { key: 'gs', type: 'number', group: 'coef', label: L('Breite σ', 'Width σ'), help: L('Streckt die Glocke in x-Richtung.', 'Stretches the bell in x-direction.'), min: 0.4, max: 2, step: 0.05, default: 1, visibleIf: (v) => v.kind === 'math' && (v.fn === 'gauss' || v.fn === 'bell') },
    { key: 's1', type: 'number', group: 'coef', label: L('Wert links', 'Value on the left'), min: -3, max: 3, step: 0.5, default: 1, visibleIf: (v) => v.kind === 'math' && v.fn === 'step' },
    { key: 's2', type: 'number', group: 'coef', label: L('Wert in der Mitte', 'Value in the middle'), min: -3, max: 3, step: 0.5, default: -1, visibleIf: (v) => v.kind === 'math' && v.fn === 'step' },
    { key: 's3', type: 'number', group: 'coef', label: L('Wert rechts', 'Value on the right'), min: -3, max: 3, step: 0.5, default: 0.5, visibleIf: (v) => v.kind === 'math' && v.fn === 'step' },
    { key: 'j1', type: 'number', group: 'coef', label: L('erste Sprungstelle', 'First jump'), min: -3.5, max: 3.5, step: 0.1, default: -1, visibleIf: (v) => v.kind === 'math' && v.fn === 'step' },
    { key: 'j2', type: 'number', group: 'coef', label: L('zweite Sprungstelle', 'Second jump'), min: -3.5, max: 3.5, step: 0.1, default: 1.5, visibleIf: (v) => v.kind === 'math' && v.fn === 'step' },
    ...([1, 2, 3, 4, 5, 6, 7] as const).map((k) => ({
      key: `q${k}` as `q${typeof k}`,
      type: 'number' as const,
      group: 'own',
      label: L(`f(${k - 4 < 0 ? '−' : ''}${Math.abs(k - 4)})`, `f(${k - 4 < 0 ? '−' : ''}${Math.abs(k - 4)})`),
      help: k === 1 ? L('Auch die blauen Punkte im oberen Bild ziehen.', 'You can also drag the blue points in the upper picture.') : undefined,
      min: -3,
      max: 3,
      step: 0.05,
      default: [-1.5, 0, 1.5, 1, -0.5, -1, 0.5][k - 1]!,
      visibleIf: (v: Record<string, unknown>) => v.kind === 'math' && v.fn === 'own',
    })),
    {
      key: 'x',
      type: 'number',
      label: L('Stelle x (Punkt P bzw. Tangente)', 'Position x (point P or tangent)'),
      help: L('Auch den Punkt im Bild ziehen.', 'You can also drag the point in the picture.'),
      min: -6.5,
      max: 60,
      step: 0.05,
      default: 2,
      visibleIf: (v) => v.mode === 'trace' || v.mode === 'back',
    },
    {
      key: 'x0',
      type: 'number',
      label: L('Anfangsstelle x₀', 'Initial point x₀'),
      help: L('Auch den Anfangspunkt im unteren Bild ziehen.', 'You can also drag the initial point in the lower picture.'),
      min: -6.5,
      max: 6.5,
      step: 0.05,
      default: 0,
      visibleIf: (v) => v.kind === 'math',
    },
    {
      key: 'c',
      type: 'number',
      label: L('Anfangswert y₀ = F(x₀)', 'Initial value y₀ = F(x₀)'),
      help: L('Legt die Konstante C fest: C = y₀ − F₀(x₀).', 'Fixes the constant C: C = y₀ − F₀(x₀).'),
      min: -20,
      max: 20,
      step: 0.1,
      default: 0,
      visibleIf: (v) => v.kind === 'math',
    },
    {
      key: 'dc',
      type: 'number',
      label: L('Anfangsbestand verschieben (Stufen)', 'Shift the initial amount (steps)'),
      help: L('In Stufen der Anwendung, z. B. 50 € oder 1 °C. Auch den Anfangspunkt ziehen.', 'In steps of the example, e.g. €50 or 1 °C. You can also drag the initial point.'),
      min: -10,
      max: 10,
      step: 1,
      default: 0,
      visibleIf: (v) => v.kind === 'app',
    },
    ...([1, 2, 3, 4, 5, 6, 7] as const).map((k) => ({
      key: `p${k}` as `p${typeof k}`,
      type: 'number' as const,
      group: 'sk',
      label: L(`Punkt ${k}`, `Point ${k}`),
      help: k === 1 ? L('Am besten die Punkte im unteren Bild ziehen.', 'Best drag the points in the lower picture.') : undefined,
      min: -2000,
      max: 2000,
      step: 0.01,
      default: 0,
      visibleIf: (v: Record<string, unknown>) => v.mode === 'draw',
    })),
    { key: 'fam', type: 'boolean', group: 'view', label: L('Schar F + C zeigen', 'Show the family F + C'), default: true, visibleIf: (v) => v.mode !== 'draw' },
    { key: 'fld', type: 'boolean', group: 'view', label: L('Richtungsfeld zeigen', 'Show the slope field'), help: L('Kleine Striche mit der Steigung f(x) – eine Hilfe zum Skizzieren.', 'Short strokes with slope f(x) – a help for sketching.'), default: false, visibleIf: (v) => v.mode !== 'feld' },
    { key: 'full', type: 'boolean', group: 'view', label: L('ganzen Graphen blass zeigen', 'Show the whole graph faintly'), help: L('Aus: Der Graph entsteht nur dort, wo der Punkt schon war.', 'Off: the graph only appears where the point has been.'), default: false, visibleIf: (v) => v.mode === 'trace' || v.mode === 'back' },
    { key: 'show', type: 'boolean', group: 'view', label: L('Werte zeigen', 'Show values'), help: L('Aus: Ergebnisse im Bild durch „?“ ersetzt (für Aufgaben).', 'Off: results in the picture replaced by “?” (for tasks).'), default: true },
    { key: 'sol', type: 'boolean', group: 'view', label: L('Lösung zeigen', 'Show the solution'), default: false, visibleIf: (v) => v.mode === 'draw' },
  ],
  actions: [
    { id: 'sweep', label: L('P durchlaufen lassen', 'Let P run along'), primary: true, visibleIf: (v) => v.mode === 'trace' },
    { id: 'tang', label: L('Tangente laufen lassen', 'Let the tangent run'), primary: true, visibleIf: (v) => v.mode === 'back' },
    { id: 'clear', label: L('Spur löschen', 'Clear the trace'), visibleIf: (v) => v.mode === 'trace' || v.mode === 'back' },
    { id: 'grow', label: L('Lösungskurve wachsen lassen', 'Let the solution curve grow'), primary: true, visibleIf: (v) => v.mode === 'feld' },
    { id: 'wave', label: L('C durchprobieren', 'Try different C'), visibleIf: (v) => v.mode === 'feld' },
    { id: 'steps', label: L('Merkmale Schritt für Schritt', 'Features step by step'), primary: true, visibleIf: (v) => v.mode === 'feat' },
    { id: 'stack', label: L('Flächen übertragen', 'Transfer the areas'), primary: true, visibleIf: (v) => v.mode === 'area' },
    { id: 'reveal', label: L('Lösung aufdecken', 'Reveal the solution'), primary: true, visibleIf: (v) => v.mode === 'draw' },
    { id: 'reset', label: L('Skizze zurücksetzen', 'Reset the sketch'), visibleIf: (v) => v.mode === 'draw' },
  ],
  readouts: [
    { key: 'fn', label: L('Funktion und Stammfunktionen', 'Function and antiderivatives') },
    { key: 'ivp', label: L('Anfangswertproblem', 'Initial value problem'), spoiler: true },
    { key: 'at', label: L('An der Stelle x', 'At position x'), spoiler: true },
    { key: 'feat', label: L('Merkmale von F', 'Features of F'), spoiler: true },
    { key: 'area', label: L('Flächenstücke', 'Area pieces'), spoiler: true },
    { key: 'dev', label: L('Deine Skizze', 'Your sketch') },
    { key: 'sit', label: L('Im Alltag', 'In everyday life'), spoiler: true },
  ],
  resultsParam: 'show',
  presets: [
    { id: 'par', label: L('Parabel → Polynom 3. Grades', 'Parabola → cubic'), values: {} },
    { id: 'field', label: L('Richtungsfeld: alle Stammfunktionen sind parallel', 'Slope field: all antiderivatives are parallel'), values: { mode: 'feld' } },
    { id: 'ivp', label: L('Anfangswert: f(x) = 3x² − 2 mit F(1) = 4', 'Initial value: f(x) = 3x² − 2 with F(1) = 4'), values: { mode: 'feld', pa: 3, pb: 0, pc: -2, x0: 1, c: 4 } },
    { id: 'cos', label: L('cos → sin x + 1 mit F(0) = 1', 'cos → sin x + 1 with F(0) = 1'), values: { mode: 'feld', fn: 'cos', x0: 0, c: 1 } },
    { id: 'exp', label: L('eˣ durch den Punkt (0 | 3)', 'eˣ through the point (0 | 3)'), values: { mode: 'feld', fn: 'exp', x0: 0, c: 3 } },
    { id: 'feat', label: L('Merkmale: Hoch-, Tief- und Wendepunkt', 'Features: maximum, minimum, inflection'), values: { mode: 'feat' } },
    { id: 'terr', label: L('Nullstelle ohne Vorzeichenwechsel: Terrassenpunkt', 'Zero without sign change: saddle point'), values: { mode: 'feat', pa: 1, pb: 0, pc: 0 } },
    { id: 'sin', label: L('sin: jedes Flächenstück ist 2', 'sin: every area piece is 2'), values: { mode: 'area', fn: 'sin' } },
    { id: 'back', label: L('Umgekehrt: aus F den Graphen von f ablesen', 'Reverse: read off f from the graph of F'), values: { mode: 'back', fn: 'cub', x: -3.2 } },
    { id: 'draw', label: L('Aufgabe: Skizziere F zu f(x) = 2x − 4', 'Task: sketch F for f(x) = 2x − 4'), values: { mode: 'draw', fn: 'lin', lm: 2, lt: -4 } },
    { id: 'step', label: L('Treppe: F hat Knicke', 'Steps: F has kinks'), values: { fn: 'step', x: -4 } },
    { id: 'own', label: L('Selbst gezeichnete Funktion aufleiten', 'Integrate a function you drew'), values: { fn: 'own', x: -3 } },
    { id: 'bell', label: L('Glockenkurve → S-Kurve', 'Bell curve → S-curve'), values: { mode: 'feat', fn: 'bell' } },
    { id: 'pool', label: L('Regenbecken: wann ist am meisten Wasser drin?', 'Storage basin: when is it fullest?'), values: { mode: 'feat', kind: 'app', app: 'pool' } },
    { id: 'konto', label: L('Sparkonto: anderer Anfangsbestand', 'Savings account: another starting balance'), values: { mode: 'feld', kind: 'app', app: 'konto', dc: 2 } },
    { id: 'ballon', label: L('Heißluftballon: Höhe aus der Steiggeschwindigkeit', 'Hot-air balloon: height from the climb rate'), values: { kind: 'app', app: 'ballon', x: 0 } },
    { id: 'lift', label: L('Aufzug: Stockwerke aus der Geschwindigkeit', 'Lift: floors from the velocity'), values: { mode: 'area', kind: 'app', app: 'lift' } },
    { id: 'heat', label: L('Heizung: wann ist es am wärmsten?', 'Heating: when is it warmest?'), values: { mode: 'feat', kind: 'app', app: 'heat' } },
    { id: 'akku', label: L('Handy-Akku laden', 'Charging a phone battery'), values: { kind: 'app', app: 'akku', x: 0 } },
    { id: 'park', label: L('Parkhaus: aus der Belegung die Rate ablesen', 'Car park: read the rate off the occupancy'), values: { mode: 'back', kind: 'app', app: 'park', x: 6 } },
    { id: 'co2', label: L('CO₂ im Klassenzimmer: Stoßlüften', 'CO₂ in the classroom: airing'), values: { mode: 'area', kind: 'app', app: 'co2' } },
  ],
  strings: {
    de: {
      canvas:
        'Oben der Graph einer Funktion f, unten Stammfunktionen F = F₀ + C. Je nach Ansicht läuft ein Punkt über f und überträgt die Höhe f(x) als Steigung auf F, ein Richtungsfeld zeigt die Steigungen mit der Schar F + C und einem ziehbaren Anfangspunkt, Merkmale wie Nullstellen und Extremstellen von f werden zu Extrem- und Wendestellen von F, Flächenstücke werden zu Höhenänderungen, eine Tangente an F liefert umgekehrt den Graphen von f, oder man skizziert F selbst mit sieben ziehbaren Punkten. Rechts Karten mit Rechnung, Tabelle und Deutung.',
    },
    en: {
      canvas:
        'At the top the graph of a function f, below antiderivatives F = F₀ + C. Depending on the view, a point runs along f and transfers the height f(x) as the slope of F, a slope field shows the slopes with the family F + C and a draggable initial point, features such as zeros and extrema of f become extrema and inflection points of F, area pieces become changes in height, a tangent to F gives back the graph of f, or you sketch F yourself with seven draggable points. On the right cards with working, table and interpretation.',
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
    const editable = () => !ctx.locked;
    const mode = () => p.mode as Mode;
    const kind = () => p.kind as Kind;
    const fnKey = () => p.fn as FnKey;
    const appKey = () => p.app as AppKey;
    const meta = () => (kind() === 'app' ? APP_META[appKey()] : null);
    const setP = (vals: Record<string, number | boolean | string>) => ctx.set(vals as never);

    /* ---------- Farben ---------- */
    const col = {
      f: () => th().series[0]!,
      F: () => th().series[3]!,
      pos: () => th().series[2]!,
      neg: () => th().series[1]!,
      t: () => th().series[4]!,
      s: () => th().series[5]!,
    };

    /* ---------- Zahlen ---------- */
    const clean = (v: number, d: number) => (Math.abs(v) < 0.5 * 10 ** -d ? 0 : v);
    const N = (v: number, d = 2) => fmt.num(clean(v, d), d);
    /** Stellen nach Größe: große Werte mit weniger Nachkommastellen. */
    const nd = (v: number) => (Math.abs(v) >= 100 ? 1 : Math.abs(v) >= 10 ? 2 : 2);
    const NV = (v: number) => N(v, nd(v));
    const isExact = (v: number, d = 2) => ctx.fmt.isExact(v, d);
    const eq = (v: number, d = 2) => ctx.fmt.rel(v, d);

    /* ---------- Funktionen ---------- */
    const coefNow = (): Coeffs => {
      const c = { ...DEFAULT_COEFFS };
      for (const k of COEF_KEYS) c[k] = p[k] as number;
      return c;
    };
    function build(k: Kind, f: FnKey, a: AppKey, c: Coeffs): Fn {
      return k === 'app' ? APPS[a] : mathFn(f, c);
    }
    const exactFn = (): Fn => build(kind(), fnKey(), appKey(), coefNow());
    const lim = (v: number) => {
      const D = exactFn().x;
      return clamp(v, D[0], D[1]);
    };
    /** Anfangsbedingung F(x₀) = y₀ (exakt, aus den Reglern). */
    function startExact(): { x0: number; y0: number } {
      if (kind() === 'app') {
        const ap = APPS[appKey()];
        return { x0: ap.t0, y0: ap.y0 + p.dc * ap.step };
      }
      return { x0: lim(p.x0), y0: p.c };
    }

    /* Angezeigte Koeffizienten gleiten; beim Wechsel der Funktion wird überblendet. */
    const CC = Object.fromEntries(COEF_KEYS.map((k) => [k, new Chan(p[k] as number)])) as Record<CoefKey, Chan>;
    const coefShown = (): Coeffs => {
      const c = { ...DEFAULT_COEFFS };
      for (const k of COEF_KEYS) c[k] = CC[k].v;
      return c;
    };
    let morph: { from: Fn; t0: number; dur: number } | null = null;
    let morphK = 1;
    function shownFn(): Fn {
      const cur = build(kind(), fnKey(), appKey(), coefShown());
      if (!morph || morphK >= 1) return cur;
      const old = morph.from;
      const k = morphK;
      const mix = (u: number, v: number) => (Number.isFinite(u) ? lerp(u, v, k) : v);
      return {
        f: (x) => mix(old.f(x), cur.f(x)),
        F: (x) => mix(old.F(x), cur.F(x)),
        x: cur.x,
        nodes: cur.nodes,
        jumps: k < 0.5 ? old.jumps : cur.jumps,
        kinks: cur.kinks,
      };
    }

    /* ---------- angezeigter Zustand ---------- */
    const st0 = startExact();
    const X = new Chan(lim(p.x));
    const X0 = new Chan(st0.x0);
    const Y0 = new Chan(st0.y0);
    const SK = SK_KEYS.map((k) => new Chan(p[k] as number));
    const rng = { x0: new Chan(-3), x1: new Chan(3), fy0: new Chan(-2), fy1: new Chan(2), Fy0: new Chan(-3), Fy1: new Chan(3), fam: new Chan(1) };
    const mw = Object.fromEntries(MODES.map((m) => [m, new Chan(m === p.mode ? 1 : 0)])) as Record<Mode, Chan>;
    const kFam = new Chan(p.fam ? 1 : 0);
    const kFld = new Chan(p.fld ? 1 : 0);
    const kFull = new Chan(p.full ? 1 : 0);
    const kSol = new Chan(p.sol ? 1 : 0);
    let intro: number | null = null;
    let sweep: { t0: number; dur: number; from: number; to: number } | null = null;
    let grow: { t0: number; dur: number } | null = null;
    let wave: { t0: number; dur: number; amp: number } | null = null;
    let steps: { t0: number } | null = null;
    let stack: { t0: number; slot: number; n: number } | null = null;
    let reveal: { t0: number; dur: number } | null = null;
    let cardFade: number | null = null;
    let lastTime = performance.now();
    let lastDrag = -Infinity;
    const dragging = () => performance.now() - lastDrag < 250;
    const grab = () => {
      lastDrag = performance.now();
    };
    /** Bereich, den der Punkt schon überstrichen hat (Spur in „Steigung übertragen“ und „F → f“). */
    const vis = { lo: lim(p.x), hi: lim(p.x) };
    let feat: Features = features(exactFn());
    let table: SignInterval[] = signTable(exactFn());
    let pcs: Piece[] = pieces(exactFn());
    let rating: Rating | null = null;
    let prevMode: Mode = mode();
    let frameNow = performance.now();
    let frameDt = 0;
    let numsBusy = false;

    /* ---------- weich zählende Zahlen ---------- */
    const nums = new Map<string, { c: Chan; at: number }>();
    /** Zahl, die im Bild und in den Karten weich zu ihrem Wert zählt. */
    function cnt(key: string, v: number): number {
      if (!Number.isFinite(v) || reduced()) return v;
      let e = nums.get(key);
      if (!e) {
        e = { c: new Chan(intro !== null ? 0 : v), at: -1 };
        nums.set(key, e);
      }
      if (e.at !== frameNow) {
        e.at = frameNow;
        e.c.follow(v, dragging() ? 0.04 : 0.17);
        if (e.c.step(frameNow, frameDt)) numsBusy = true;
      }
      return e.c.v;
    }

    /* ---------- Aufteilung ---------- */
    const isWide = () => surface.width >= 640 || surface.width >= surface.height * 1.3;
    const sm = () => surface.width < 560;
    const fs = (big: number, small: number) => (sm() ? small : big);
    function regions(): { top: Rect; bot: Rect; col: Rect; wide: boolean } {
      const w = surface.width;
      const h = surface.height;
      if (isWide()) {
        const cw = Math.round(clamp(w * 0.33, 230, 360));
        const lw = w - cw - 10;
        const t1 = Math.round(h * 0.46);
        return { top: { x: 0, y: 0, w: lw, h: t1 }, bot: { x: 0, y: t1 + 6, w: lw, h: h - t1 - 6 }, col: { x: w - cw, y: 0, w: cw, h }, wide: true };
      }
      const ph = Math.round(clamp(h * 0.56, 320, w * 1.45));
      const t1 = Math.round(ph * 0.46);
      return { top: { x: 0, y: 0, w, h: t1 }, bot: { x: 0, y: t1 + 6, w, h: ph - t1 - 6 }, col: { x: 0, y: ph + 10, w, h: h - ph - 10 }, wide: false };
    }
    const PAD = () => ({ left: fs(48, 40), bottom: fs(24, 22), top: fs(40, 36), right: fs(16, 12) });
    const plot = new Plot(surface, { x: [-3, 3], y: [-2, 2], equalAspect: false, pan: false, zoom: false, controls: false, region: () => regions().top });
    const plotB = new Plot(surface, { x: [-3, 3], y: [-3, 3], equalAspect: false, pan: false, zoom: false, controls: false, region: () => regions().bot });

    /* ---------- Griffe ---------- */
    // P auf dem Graphen von f (Steigung übertragen)
    plot.addHandle({
      get: () => [X.v, shownFn().f(X.v)],
      set: (x) => {
        grab();
        setP({ x: Math.round(lim(x) * 20) / 20 });
      },
      axis: 'x',
      enabled: () => editable() && mode() === 'trace' && !sweep,
      color: () => col.f(),
    });
    // Stützpunkte der selbst gezeichneten Funktion f
    OWN_IDX.forEach((i) => {
      plot.addHandle({
        get: () => [i - 3, CC[`q${i + 1}` as CoefKey].v],
        set: (_x, y) => {
          grab();
          setP({ [`q${i + 1}`]: Math.round(clamp(y, -3, 3) * 20) / 20 });
        },
        axis: 'y',
        enabled: () => editable() && kind() === 'math' && fnKey() === 'own' && !sweep,
        color: () => col.f(),
      });
    });
    // Anfangspunkt P₀(x₀ | y₀)
    plotB.addHandle({
      get: () => [X0.v, Y0.v],
      set: (x, y) => {
        grab();
        if (kind() === 'app') {
          const ap = APPS[appKey()];
          setP({ dc: clamp(Math.round((y - ap.y0) / ap.step), -10, 10) });
        } else setP({ x0: Math.round(lim(x) * 20) / 20, c: Math.round(clamp(y, -20, 20) * 10) / 10 });
      },
      axis: 'both',
      enabled: () => editable() && mode() !== 'draw' && !wave,
      color: () => col.F(),
    });
    // Punkt auf F (Steigung übertragen bzw. Tangente)
    plotB.addHandle({
      get: () => [X.v, G(X.v)],
      set: (x) => {
        grab();
        setP({ x: Math.round(lim(x) * 20) / 20 });
      },
      axis: 'x',
      enabled: () => editable() && (mode() === 'trace' || mode() === 'back') && !sweep,
      color: () => col.t(),
    });
    // sieben Punkte der eigenen Skizze
    SK_KEYS.forEach((key, i) => {
      plotB.addHandle({
        get: () => [shownFn().nodes[i]!, SK[i]!.v],
        set: (_x, y) => {
          grab();
          setP({ [key]: Math.round(clamp(y, -2000, 2000) * 100) / 100 });
        },
        axis: 'y',
        enabled: () => editable() && mode() === 'draw' && !reveal,
        color: () => col.s(),
      });
    });

    /** Angezeigte Stammfunktion (durch den angezeigten Anfangspunkt). */
    function curC(fn: Fn = shownFn()): number {
      return Y0.v + waveOffset(frameNow) - fn.F(X0.v);
    }
    function G(x: number): number {
      const fn = shownFn();
      return fn.F(x) + curC(fn);
    }
    function waveOffset(now: number): number {
      if (!wave) return 0;
      const t = clamp01((now - wave.t0) / wave.dur);
      return wave.amp * Math.sin(TAU * 1.5 * t) * Math.sin(Math.PI * t);
    }

    /* ---------- Formeln ---------- */
    const fstyle = (size: number, color = th().text, weight = 600): FormulaStyle => ({
      size,
      font: th().font,
      mathFont: th().mathFont,
      color,
      weight,
      palette: { f: col.f(), F: col.F(), p: col.pos(), n: col.neg(), t: col.t(), s: col.s(), m: th().muted },
    });
    function fit(src: string, maxW: number, size: number, color = th().text, weight = 600): FormulaBox {
      const g = surface.g;
      let s = size;
      let box = formula(g, src, fstyle(s, color, weight));
      while (box.w > maxW && s > 9.5) {
        s -= 0.5;
        box = formula(g, src, fstyle(s, color, weight));
      }
      return box;
    }

    /** Zahl als Formeltext: abbrechende Dezimalzahl oder kleiner Bruch. */
    function q(v: number): string {
      if (isExact(v, 3)) return N(v, 3);
      for (let d = 2; d <= 24; d++) {
        const n0 = v * d;
        if (Math.abs(n0 - Math.round(n0)) < 1e-7) return `${v < 0 ? '−' : ''}\\f{${Math.abs(Math.round(n0))}}{${d}}`;
      }
      return N(v, 3);
    }
    /** Summe von Gliedern c·Potenz (Nullen fallen weg, Einsen vor x auch). */
    function polySrc(terms: [number, string][]): string {
      let s = '';
      for (const [c, v] of terms) {
        if (Math.abs(c) < 1e-12) continue;
        const neg = c < 0;
        const abs = q(Math.abs(c));
        const num = v && abs === '1' ? '' : abs;
        s += s ? ` ${neg ? '−' : '+'} ${num}${v}` : `${neg ? '−' : ''}${num}${v}`;
      }
      return s || '0';
    }
    /** Faktor vor einer Funktion (1 → leer, −1 → −). */
    const fac = (c: number, tail = ' · ') => (Math.abs(c - 1) < 1e-12 ? '' : Math.abs(c + 1) < 1e-12 ? '−' : `${q(c)}${tail}`);
    /** „ + 5“ bzw. „ − 2,5“ für die Konstante. */
    const cTail = (C: number) => (Math.abs(C) < 5e-4 ? '' : ` ${C < 0 ? '−' : '+'} ${q(Math.abs(Math.round(C * 1000) / 1000))}`);

    /** Namen: f, F, Variable und Einheiten. */
    function names(): { f: string; F: string; v: string; uX: string; uF: string; uI: string } {
      const m = meta();
      if (!m) return { f: 'f', F: 'F', v: 'x', uX: '', uF: '', uI: '' };
      return { f: m.f, F: m.F, v: m.v, uX: say(m.uX), uF: say(m.uF), uI: say(m.uI) };
    }
    const unitI = () => (meta() ? ` \\t{${names().uI}}` : '');
    const unitF = () => (meta() ? ` \\t{${names().uF}}` : '');

    /** f und die Grundstammfunktion F₀ als rechte Seiten (Kurzschrift aus formula.ts). */
    function fnSrc(): { f: string; F: string; note: string | null; closed: boolean } {
      const m = meta();
      if (m) {
        const closed = !(appKey() === 'lift' || appKey() === 'co2');
        return { f: say(m.fSrc), F: say(m.FSrc), note: closed ? null : say(L('abschnittsweise – Fläche unter dem Graphen', 'piecewise – area under the graph')), closed };
      }
      const c = coefNow();
      switch (fnKey()) {
        case 'lin':
          return { f: polySrc([[c.lm, 'x'], [c.lt, '']]), F: polySrc([[c.lm / 2, 'x²'], [c.lt, 'x']]), note: null, closed: true };
        case 'par':
          return { f: polySrc([[c.pa, 'x²'], [c.pb, 'x'], [c.pc, '']]), F: polySrc([[c.pa / 3, 'x³'], [c.pb / 2, 'x²'], [c.pc, 'x']]), note: null, closed: true };
        case 'cub':
          return {
            f: polySrc([[c.k3, 'x³'], [c.k2, 'x²'], [c.k1, 'x'], [c.k0, '']]),
            F: polySrc([[c.k3 / 4, 'x⁴'], [c.k2 / 3, 'x³'], [c.k1 / 2, 'x²'], [c.k0, 'x']]),
            note: null,
            closed: true,
          };
        case 'sin': {
          const bx = Math.abs(c.sb - 1) < 1e-12 ? 'x' : `${q(c.sb)}x`;
          return { f: `${fac(c.sa)}\\t{sin}(${bx})`, F: `${fac(-c.sa / c.sb)}\\t{cos}(${bx})`, note: null, closed: true };
        }
        case 'cos': {
          const bx = Math.abs(c.sb - 1) < 1e-12 ? 'x' : `${q(c.sb)}x`;
          return { f: `${fac(c.sa)}\\t{cos}(${bx})`, F: `${fac(c.sa / c.sb)}\\t{sin}(${bx})`, note: null, closed: true };
        }
        case 'exp': {
          if (Math.abs(c.eb) < 1e-12) return { f: q(c.ea), F: polySrc([[c.ea, 'x']]), note: null, closed: true };
          const kx = Math.abs(c.eb - 1) < 1e-12 ? 'x' : `${q(c.eb)}x`;
          return { f: `${fac(c.ea)}\\t{e}^{${kx}}`, F: `${fac(c.ea / c.eb)}\\t{e}^{${kx}}`, note: null, closed: true };
        }
        case 'gauss': {
          const s2 = c.gs * c.gs;
          const den = Math.abs(2 * s2 - 2) < 1e-9 ? '2' : q(2 * s2);
          return { f: `x · \\t{e}^{−\\f{x²}{${den}}}`, F: `${fac(-s2)}\\t{e}^{−\\f{x²}{${den}}}`, note: null, closed: true };
        }
        case 'bell': {
          const s2 = c.gs * c.gs;
          const den = Math.abs(2 * s2 - 2) < 1e-9 ? '2' : q(2 * s2);
          return {
            f: `\\t{e}^{−\\f{x²}{${den}}}`,
            F: `${fac(c.gs)}\\r{\\f{π}{2}} · \\t{erf}(\\f{x}{${Math.abs(c.gs - 1) < 1e-9 ? '' : q(c.gs)}\\r{2}})`,
            note: say(L('keine elementare Stammfunktion (Fehlerfunktion erf) – grafisch geht es trotzdem!', 'no elementary antiderivative (error function erf) – graphically it still works!')),
            closed: true,
          };
        }
        case 'step': {
          const a = Math.min(c.j1, c.j2);
          const b = Math.max(c.j1, c.j2);
          return {
            f: `${q(c.s1)} \\c{m}{(x < ${q(a)})},  ${q(c.s2)},  ${q(c.s3)} \\c{m}{(x ≥ ${q(b)})}`,
            F: '\\i{0}{x} f(t) dt',
            note: say(L('abschnittsweise linear, Knicke an den Sprungstellen', 'piecewise linear, kinks at the jumps')),
            closed: false,
          };
        }
        case 'own':
          return {
            f: say(L('\\t{selbst gezeichnet (7 Punkte)}', '\\t{drawn by you (7 points)}')),
            F: '\\i{0}{x} f(t) dt',
            note: say(L('ohne Term – nur grafisch aufleiten', 'no formula – integrate graphically')),
            closed: false,
          };
      }
    }
    /** „f(x) = …“ und „F(x) = … + C“. */
    /**
     * Stammfunktion verdecken: bei „Werte zeigen“ aus (Aufgaben) und in der
     * Ansicht „Aufgabe: F skizzieren“, solange die Lösung nicht aufgedeckt ist.
     */
    function antiHidden(): boolean {
      return mode() === 'draw' ? !p.sol : !p.show;
    }

    function fullSrc(C: number | null): { f: string; F: string } {
      const s = fnSrc();
      const nm = names();
      const tail = C === null ? ' + C' : cTail(C);
      const rhs = s.F === '0' ? (C === null ? 'C' : q(C)) : `${s.F}${tail}`;
      return { f: `${nm.f}(${nm.v}) = ${s.f}`, F: `${nm.F}(${nm.v}) = ${rhs}` };
    }

    /** Kurzschrift → HTML für die Ergebnisse unter der Bühne. */
    function toHtml(src: string): string {
      let i = 0;
      const group = (): string => {
        if (src[i] !== '{') return src[i++] ?? '';
        i++;
        const out = seq('}');
        i++;
        return out;
      };
      const seq = (end?: string): string => {
        let out = '';
        let buf = '';
        const flush = () => {
          out += buf.replace(/(^|[^\p{L}])(\p{L})(?![\p{L}])/gu, (_, pre: string, ch: string) => (ch === 'π' || ch === 'e' ? `${pre}${ch}` : `${pre}<var>${ch}</var>`));
          buf = '';
        };
        while (i < src.length && src[i] !== end) {
          const ch = src[i]!;
          if (ch === '\\' && 'frcbti'.includes(src[i + 1] ?? '')) {
            const cmd = src[i + 1]!;
            i += 2;
            flush();
            if (cmd === 'f') {
              const a = group();
              out += `<span class="frac"><span>${a}</span><span>${group()}</span></span>`;
            } else if (cmd === 'r') out += `√(${group()})`;
            else if (cmd === 'i') {
              const lo = group();
              out += `∫<sub>${lo}</sub><sup>${group()}</sup>`;
            } else if (cmd === 'c') {
              group();
              out += group();
            } else if (cmd === 'b') out += `<strong>${group()}</strong>`;
            else out += group();
          } else if (ch === '_' || ch === '^') {
            flush();
            i++;
            out += ch === '_' ? `<sub>${group()}</sub>` : `<sup>${group()}</sup>`;
          } else {
            buf += ch;
            i++;
          }
        }
        flush();
        return out;
      };
      return seq();
    }

    /* ---------- Zeichenhilfen ---------- */
    function fpill(x: number, y: number, src: string, opts: { color?: string; border?: string; align?: 'left' | 'center' | 'right'; size?: number; alpha?: number; maxW?: number; bounds?: Rect; weight?: number } = {}): Rect {
      const g = surface.g;
      const size = opts.size ?? fs(13, 12);
      const color = opts.color ?? th().text;
      const wgt = opts.weight ?? 700;
      const box = opts.maxW ? fit(src, opts.maxW, size, color, wgt) : formula(g, src, fstyle(size, color, wgt));
      const align = opts.align ?? 'center';
      let left = align === 'left' ? x : align === 'right' ? x - box.w : x - box.w / 2;
      if (opts.bounds) left = clamp(left, opts.bounds.x + 10, opts.bounds.x + opts.bounds.w - box.w - 10);
      let base = y + (box.asc - box.desc) / 2;
      if (opts.bounds) base = clamp(base, opts.bounds.y + box.asc + 7, opts.bounds.y + opts.bounds.h - box.desc - 7);
      const rr = { x: left - 8, y: base - box.asc - 5, w: box.w + 16, h: box.asc + box.desc + 10 };
      const a = opts.alpha ?? 1;
      if (a <= 0.01) return rr;
      g.save();
      g.globalAlpha *= a;
      g.save();
      g.fillStyle = th().dark ? 'rgba(15,20,30,0.9)' : 'rgba(255,255,255,0.94)';
      g.shadowColor = th().dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.14)';
      g.shadowBlur = 8;
      g.shadowOffsetY = 2;
      roundRect(g, rr.x, rr.y, rr.w, rr.h, Math.min(11, rr.h / 2));
      g.fill();
      g.restore();
      if (opts.border) {
        g.strokeStyle = opts.border;
        g.lineWidth = 1.3;
        roundRect(g, rr.x + 0.5, rr.y + 0.5, rr.w - 1, rr.h - 1, Math.min(11, rr.h / 2));
        g.stroke();
      }
      box.draw(g, left, base);
      g.restore();
      return rr;
    }
    const pillW = (src: string, size: number) => formula(surface.g, src, fstyle(size, th().text, 700)).w + 16;

    function dot(x: number, y: number, color: string, r: number, alpha = 1, hollow = false): void {
      const g = surface.g;
      if (r <= 0.2 || alpha <= 0.01 || !Number.isFinite(y)) return;
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
    /** Leuchtender Hof um einen Punkt (Kopf der Spur, aktiver Punkt). */
    function halo(x: number, y: number, color: string, r: number, alpha: number): void {
      if (alpha <= 0.01 || !Number.isFinite(y)) return;
      const g = surface.g;
      g.save();
      const grad = g.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, withAlpha(color, 0.38 * alpha));
      grad.addColorStop(1, withAlpha(color, 0));
      g.fillStyle = grad;
      g.beginPath();
      g.arc(x, y, r, 0, TAU);
      g.fill();
      g.restore();
    }

    /** Kurve in Pixeln (mit weichem Schatten und Glanzlicht). */
    function strokePts(pts: [number, number][], color: string, width: number, opts: { glow?: boolean; dash?: number[]; alpha?: number } = {}): void {
      if (pts.length < 2) return;
      const a = opts.alpha ?? 1;
      if (a <= 0.01) return;
      const g = surface.g;
      g.save();
      g.globalAlpha *= a;
      g.lineJoin = 'round';
      g.lineCap = 'round';
      if (opts.dash) g.setLineDash(opts.dash);
      const path = () => {
        g.beginPath();
        let pen = false;
        for (const [x, y] of pts) {
          if (!Number.isFinite(y)) {
            pen = false;
            continue;
          }
          if (pen) g.lineTo(x, y);
          else g.moveTo(x, y);
          pen = true;
        }
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

    /** Werte einer Funktion als Pixelpunkte; an Sprungstellen wird die Linie unterbrochen. */
    function sample(pl: Plot, f: (x: number) => number, x0: number, x1: number, jumps: number[] = []): [number, number][] {
      const out: [number, number][] = [];
      if (!(x1 > x0)) return out;
      const r = pl.rect;
      const count = Math.round(clamp(Math.abs(pl.px(x1) - pl.px(x0)) * 0.9, 16, 900));
      const lim2 = r.h * 3;
      const js = jumps.filter((j) => j > x0 && j < x1).sort((u, v) => u - v);
      const segs: [number, number][] = [];
      let s0 = x0;
      for (const j of js) {
        segs.push([s0, j - 1e-9]);
        s0 = j;
      }
      segs.push([s0, x1]);
      segs.forEach(([u0, u1], si) => {
        if (si > 0) out.push([NaN, NaN]);
        const c = Math.max(4, Math.round((count * (u1 - u0)) / (x1 - x0)));
        for (let i = 0; i <= c; i++) {
          const x = u0 + ((u1 - u0) * i) / c;
          const y = f(x);
          out.push([pl.px(x), Number.isFinite(y) ? clamp(pl.py(y), r.y - lim2, r.y + r.h + lim2) : NaN]);
        }
      });
      return out;
    }

    function arrowPx(x0: number, y0: number, x1: number, y1: number, color: string, width: number, head = 8): void {
      const g = surface.g;
      const len = Math.hypot(x1 - x0, y1 - y0);
      if (len < 1.5) return;
      const ux = (x1 - x0) / len;
      const uy = (y1 - y0) / len;
      const hd = Math.min(head, len * 0.5);
      g.strokeStyle = color;
      g.lineWidth = width;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(x0, y0);
      g.lineTo(x1 - ux * hd * 0.7, y1 - uy * hd * 0.7);
      g.stroke();
      g.fillStyle = color;
      g.beginPath();
      g.moveTo(x1, y1);
      g.lineTo(x1 - ux * hd - uy * hd * 0.5, y1 - uy * hd + ux * hd * 0.5);
      g.lineTo(x1 - ux * hd + uy * hd * 0.5, y1 - uy * hd - ux * hd * 0.5);
      g.closePath();
      g.fill();
    }

    function vguide(px: number, y0: number, y1: number, color: string, alpha: number, dash: number[] = [3, 4]): void {
      if (alpha <= 0.01) return;
      const g = surface.g;
      g.save();
      g.globalAlpha *= alpha;
      g.strokeStyle = color;
      g.lineWidth = 1.2;
      g.setLineDash(dash);
      g.beginPath();
      g.moveTo(Math.round(px) + 0.5, y0);
      g.lineTo(Math.round(px) + 0.5, y1);
      g.stroke();
      g.restore();
    }

    function card(r: Rect, accent?: string): void {
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
      g.strokeStyle = theme.dark ? '#273142' : '#e1e6ee';
      g.lineWidth = 1.2;
      roundRect(g, r.x + 1.5, r.y + 1.5, r.w - 3, r.h - 3, 12);
      g.stroke();
    }

    function cardTitle(R: Rect, title: string, color: string, right?: string): number {
      const g = surface.g;
      const pad = fs(14, 12);
      const ty = R.y + pad + 7;
      g.fillStyle = color;
      g.beginPath();
      g.arc(R.x + pad + 4.5, ty, 4.5, 0, TAU);
      g.fill();
      let tsz = fs(13.5, 12.5);
      const room0 = R.w - 2 * pad - 15;
      g.font = `750 ${tsz}px ${th().font}`;
      while (g.measureText(title).width > room0 && tsz > 10.5) {
        tsz -= 0.5;
        g.font = `750 ${tsz}px ${th().font}`;
      }
      let shown = title;
      while (g.measureText(shown).width > room0 && shown.length > 4) shown = `${shown.slice(0, -2).trimEnd()}…`;
      g.textAlign = 'left';
      g.textBaseline = 'middle';
      g.fillStyle = th().text;
      g.fillText(shown, R.x + pad + 15, ty);
      const tw = g.measureText(shown).width;
      if (right) {
        const rb = formula(g, right, fstyle(fs(12, 11), color, 700));
        if (R.x + pad + 15 + tw + 12 + rb.w < R.x + R.w - pad) rb.draw(g, R.x + R.w - pad - rb.w, ty + (rb.asc - rb.desc) / 2);
      }
      return ty;
    }

    function wrapText(str: string, maxW: number, font: string): string[] {
      const g = surface.g;
      g.font = font;
      const words = str.split(' ');
      const lines: string[] = [];
      let cur = '';
      for (const w of words) {
        const test = cur ? `${cur} ${w}` : w;
        if (g.measureText(test).width > maxW && cur) {
          lines.push(cur);
          cur = w;
        } else cur = test;
      }
      if (cur) lines.push(cur);
      return lines;
    }

    /* ---------- Einstieg ---------- */
    interface Intro {
      panel: number;
      /** Graph von f zeichnet sich von links nach rechts */
      reveal: number;
      /** Richtungsfeld wächst ein */
      field: number;
      /** Graph von F erscheint von links nach rechts */
      Freveal: number;
      labels: number;
      cards: number;
      stagger: number;
    }
    const DONE: Intro = { panel: 1, reveal: 1, field: 1, Freveal: 1, labels: 1, cards: 1, stagger: 1 };
    function introState(now: number): Intro {
      if (intro === null) return DONE;
      const t = now - intro;
      if (t > 3200) {
        intro = null;
        return DONE;
      }
      return {
        panel: ease.outCubic(clamp01(t / 450)),
        reveal: ease.inOutCubic(clamp01((t - 100) / 1100)),
        field: clamp01((t - 550) / 1100),
        Freveal: ease.inOutCubic(clamp01((t - 1000) / 1300)),
        labels: ease.outCubic(clamp01((t - 1900) / 600)),
        cards: clamp01((t - 250) / 900),
        stagger: clamp01((t - 800) / 1500),
      };
    }

    /* ---------- Zustand pro Bild ---------- */
    interface View {
      fn: Fn;
      /** Stelle von P bzw. der Tangente */
      x: number;
      x0: number;
      y0: number;
      C: number;
      G: (t: number) => number;
      sk: number[];
    }
    function shownX(now: number): number {
      if (!sweep) return X.v;
      const t = clamp01((now - sweep.t0) / sweep.dur);
      return lerp(sweep.from, sweep.to, ease.inOutCubic(t));
    }
    function viewOf(now: number): View {
      const fn = shownFn();
      const y0 = Y0.v + waveOffset(now);
      const C = y0 - fn.F(X0.v);
      return { fn, x: shownX(now), x0: X0.v, y0, C, G: (t) => fn.F(t) + C, sk: SK.map((c) => c.v) };
    }

    /* ---------- Bereiche ---------- */
    /** Abstand der Kurven in der Schar F + C (runde Zahl). */
    function famSpacing(fn: Fn): number {
      if (kind() === 'app') return APPS[appKey()].step * 2;
      const r = rangeOf(fn.F, fn.x[0], fn.x[1], 200);
      const span = Math.max(1, r.hi - r.lo);
      const raw = span / 3;
      const pw = 10 ** Math.floor(Math.log10(raw));
      const m = raw / pw;
      return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * pw;
    }
    function retargetRanges(now: number, instant: boolean): void {
      const fn = exactFn();
      const [x0, x1] = fn.x;
      const fr = rangeOf(fn.f, x0, x1, 300);
      const fLo = Math.min(0, fr.lo);
      const fHi = Math.max(0, fr.hi);
      const fSpan = Math.max(0.5, fHi - fLo);
      const st = startExact();
      const C = constantFor(fn, st.x0, st.y0);
      const Fr = rangeOf((t) => fn.F(t) + C, x0, x1, 300);
      const famS = famSpacing(fn);
      let lo = Math.min(Fr.lo, st.y0);
      let hi = Math.max(Fr.hi, st.y0);
      if (mode() === 'feld' || (p.fam && mode() !== 'draw')) {
        lo -= famS * 0.35;
        hi += famS * 0.35;
      }
      if (mode() === 'draw') for (const k of SK_KEYS) {
        lo = Math.min(lo, p[k] as number);
        hi = Math.max(hi, p[k] as number);
      }
      const span = Math.max(0.5, hi - lo);
      let gLo = lo - span * 0.1;
      let gHi = hi + span * 0.16;
      // Beim Ziehen nur erweitern, damit das Bild nicht unter dem Finger wegläuft
      if (dragging() && !instant) {
        gLo = Math.min(gLo, rng.Fy0.goal);
        gHi = Math.max(gHi, rng.Fy1.goal);
      }
      const goals: [Chan, number][] = [
        [rng.x0, x0],
        [rng.x1, x1],
        [rng.fy0, fLo - fSpan * 0.1],
        [rng.fy1, fHi + fSpan * 0.14],
        [rng.Fy0, gLo],
        [rng.Fy1, gHi],
        [rng.fam, famS],
      ];
      for (const [ch, v] of goals) {
        if (instant || reduced()) ch.jump(v);
        else if (dragging()) ch.follow(v, 0.3);
        else if (ch.goal !== v) ch.glide(v, 750, 0, now);
      }
    }

    /* =====================================================================
     * Oberes Bild: Graph von f
     * ===================================================================== */
    function axisNames(): { x: string; f: string; F: string } {
      const m = meta();
      if (!m) return { x: 'x', f: 'y', F: 'y' };
      return { x: `${m.v} in ${say(m.uX)}`, f: `${m.f} in ${say(m.uF)}`, F: `${m.F} in ${say(m.uI)}` };
    }

    /** Fläche zwischen f und x-Achse auf [lo; hi], grün oberhalb, rot unterhalb. */
    function fillSigned(V: View, lo: number, hi: number, alpha: number, strong = 1): void {
      if (!(hi > lo) || alpha <= 0.01) return;
      const g = surface.g;
      const dark = th().dark;
      const y0 = plot.py(0);
      for (const sign of [1, -1]) {
        const color = sign > 0 ? col.pos() : col.neg();
        const pts = sample(plot, (x) => (sign > 0 ? Math.max(V.fn.f(x), 0) : Math.min(V.fn.f(x), 0)), lo, hi, V.fn.jumps);
        g.save();
        g.globalAlpha *= alpha;
        const top = sign > 0 ? plot.py(rng.fy1.v) : plot.py(rng.fy0.v);
        const grad = g.createLinearGradient(0, top, 0, y0);
        grad.addColorStop(0, withAlpha(color, (dark ? 0.55 : 0.42) * strong));
        grad.addColorStop(1, withAlpha(color, (dark ? 0.22 : 0.14) * strong));
        g.fillStyle = grad;
        g.beginPath();
        g.moveTo(plot.px(lo), y0);
        for (const [px, py] of pts) if (Number.isFinite(py)) g.lineTo(px, py);
        g.lineTo(plot.px(hi), y0);
        g.closePath();
        g.fill();
        g.restore();
      }
    }

    function drawTop(V: View, now: number, k: Intro): void {
      const g = surface.g;
      const theme = th();
      const an = axisNames();
      plot.setAxes({ x: { label: an.x }, y: { label: an.f } });
      plot.setRangePadded([rng.x0.v, rng.x1.v], [rng.fy0.v, rng.fy1.v], PAD());
      plot.resize();
      plot.begin();
      plot.grid();
      plot.axes();
      const r = plot.rect;
      const w = (m: Mode) => mw[m].v;
      const [x0, x1] = [rng.x0.v, rng.x1.v];
      const D = V.fn.x;
      // Merkmale: Vorzeichen von f als Fläche
      const sk = stepsK(now);
      const kFeat = w('feat') * k.labels;
      if (kFeat > 0.01) fillSigned(V, D[0], D[1], kFeat * sk.bands, 0.85);
      // Flächenstücke
      if (w('area') > 0.01) drawPiecesTop(V, now, w('area') * k.labels);
      // Steigung übertragen: Fläche bis P nur angedeutet? Nein – die Höhe ist der Schlüssel.
      // Graph von f (in „F → f“ nur als Spur)
      const kb = w('back');
      const fullA = 1 - kb * (1 - 0.32 * kFull.v);
      const xr = lerp(x0, x1, k.reveal);
      strokePts(sample(plot, V.fn.f, x0, xr, V.fn.jumps), col.f(), fs(3.2, 2.7), { glow: fullA > 0.9, alpha: fullA, dash: fullA < 0.9 ? [7, 6] : undefined });
      if (kb > 0.01) {
        const lo = Math.max(vis.lo, x0);
        const hi = Math.min(vis.hi, x1);
        strokePts(sample(plot, V.fn.f, lo, hi, V.fn.jumps), col.f(), fs(3.4, 2.8), { glow: true, alpha: kb });
      }
      // Sprungstellen: gefüllter und leerer Punkt
      for (const j of V.fn.jumps ?? []) {
        if (j < x0 || j > xr) continue;
        const ja = fullA * (kb > 0.5 && (j < vis.lo || j > vis.hi) ? 0.4 : 1);
        dot(plot.px(j), plot.py(V.fn.f(j - 1e-9)), col.f(), 4.5, ja, true);
        dot(plot.px(j), plot.py(V.fn.f(j)), col.f(), 4.5, ja);
      }
      // Stützpunkte der gezeichneten Funktion
      if (kind() === 'math' && fnKey() === 'own') {
        for (const i of OWN_IDX) {
          const px = plot.px(i - 3);
          const py = plot.py(CC[`q${i + 1}` as CoefKey].v);
          dot(px, py, col.f(), 5.5, k.labels * (1 - kb * 0.7));
        }
      }
      // Merkmale von f
      if (kFeat > 0.01) drawFeaturesTop(V, now, kFeat);
      // Steigung übertragen: Höhe f(x) als Balken; F → f: abgelesener Punkt
      const kt = (w('trace') + w('back')) * k.labels;
      if (kt > 0.01) drawSlopeBar(V, kt, w('back') > 0.5);
      // Anfangsstelle x₀
      const kx0 = w('feld') * k.labels;
      if (kx0 > 0.01) {
        const px = plot.px(V.x0);
        const fv = V.fn.f(V.x0);
        vguide(px, r.y + 34, r.y + r.h, col.F(), 0.7 * kx0);
        g.save();
        g.globalAlpha *= kx0;
        plot.segment([V.x0, 0], [V.x0, fv], { color: col.t(), width: 3.2 });
        g.restore();
        dot(px, plot.py(fv), col.t(), 5.5, kx0);
        const nm = names();
        const v = cnt('top.fx0', fv);
        const right = px < r.x + r.w * 0.68;
        fpill(px + (right ? 12 : -12), clamp(plot.py(fv) - 18, r.y + 48, r.y + r.h - 22), `\\c{t}{${nm.f}(${N(V.x0, 2)}) ${p.show ? `${eq(fv)} ${NV(v)}` : '= ?'}}`, { align: right ? 'left' : 'right', size: fs(12, 11), alpha: kx0, bounds: r });
      }
      // Legende
      const src = fullSrc(null);
      const kbLeg = kb > 0.5 && !kFull.v ? `\\c{f}{${names().f}(${names().v}) = ?}` : `\\c{f}{${src.f}}`;
      const l1 = legendLeft(plot, an.f, pillW(kbLeg, fs(13, 12)));
      fpill(l1, r.y + 18, kbLeg, { align: 'left', size: fs(13, 12), alpha: k.panel, border: withAlpha(col.f(), 0.5), maxW: r.x + r.w - 26 - l1 });
      void theme;
      plot.end();
    }

    /** Linker Rand der Legende: nicht über der Beschriftung der y-Achse. */
    function legendLeft(pl: Plot, label: string, w: number): number {
      const r = pl.rect;
      const l0 = r.x + 10;
      const ax = pl.px(0);
      if (ax < r.x - 2 || ax > r.x + r.w) return l0;
      const g = surface.g;
      g.font = label.length <= 2 ? `italic 15px ${th().mathFont}` : `600 13px ${th().font}`;
      const lw = g.measureText(label).width;
      if (l0 + Math.min(w, r.w - 40) < ax + 4) return l0;
      return Math.min(ax + 9 + lw + 12, r.x + r.w * 0.45);
    }

    /** Höhe f(x) als senkrechter Balken (gleiche Farbe wie die Steigung unten). */
    function drawSlopeBar(V: View, alpha: number, reading: boolean): void {
      const g = surface.g;
      const r = plot.rect;
      const x = V.x;
      const fv = V.fn.f(x);
      const px = plot.px(x);
      const py = plot.py(fv);
      const y0 = plot.py(0);
      g.save();
      g.globalAlpha *= alpha;
      const grad = g.createLinearGradient(0, py, 0, y0);
      grad.addColorStop(0, col.t());
      grad.addColorStop(1, withAlpha(col.t(), 0.35));
      g.fillStyle = grad;
      roundRect(g, px - 3, Math.min(py, y0), 6, Math.abs(y0 - py), 3);
      g.fill();
      g.restore();
      vguide(px, py, r.y + r.h, col.t(), 0.5 * alpha);
      halo(px, py, reading ? col.t() : col.f(), 18, alpha * (sweep ? 1 : 0.6));
      dot(px, py, reading ? col.t() : col.f(), 6.5, alpha);
      const nm = names();
      const v = cnt('top.fx', fv);
      const right = px < r.x + r.w * 0.66;
      const lab = reading ? `\\c{t}{${nm.f}(${N(x, 2)}) = ${nm.F}′(${N(x, 2)}) ${p.show ? `≈ ${NV(v)}` : '= ?'}}` : `\\c{t}{${nm.f}(${N(x, 2)}) ${p.show ? `≈ ${NV(v)}` : '= ?'}}`;
      fpill(px + (right ? 14 : -14), clamp(py + (fv >= 0 ? -20 : 20), r.y + 48, r.y + r.h - 20), lab, { align: right ? 'left' : 'right', size: fs(12.5, 11.5), alpha, bounds: r, border: withAlpha(col.t(), 0.5) });
    }

    /** Merkmale von f: Nullstellen mit Vorzeichenwechsel, Extremstellen. */
    function drawFeaturesTop(V: View, now: number, alpha: number): void {
      const r = plot.rect;
      const sk = stepsK(now);
      const az = alpha * sk.zeros;
      const ae = alpha * sk.ext;
      for (const z of feat.zeros) {
        const px = plot.px(z.x);
        const color = z.sign === 0 ? th().muted : z.sign < 0 ? col.pos() : col.neg();
        dot(px, plot.py(0), color, 5.5, az, true);
        const lab = z.sign === 0 ? say(L('ohne VZW', 'no sign change')) : z.sign < 0 ? '+ → −' : '− → +';
        fpill(px, plot.py(0) + (V.fn.f(z.x + 0.05 * (r.w > 0 ? 1 : 1)) > 0 ? 18 : -18), `\\t{${lab}}`, { size: fs(11.5, 11), alpha: az * 0.95, color, bounds: r });
      }
      for (const e of feat.ext) {
        const y = V.fn.f(e.x);
        dot(plot.px(e.x), plot.py(y), col.t(), 5, ae);
        const lab = e.kind === 'max' ? say(L('HP von f', 'max of f')) : say(L('TP von f', 'min of f'));
        fpill(plot.px(e.x), plot.py(y) + (e.kind === 'max' ? -18 : 18), `\\t{${lab}}`, { size: fs(11.5, 11), alpha: ae * 0.95, color: col.t(), bounds: r });
      }
    }

    /** Flächenstücke zwischen den Vorzeichenwechseln mit ihrem Wert. */
    function drawPiecesTop(V: View, now: number, alpha: number): void {
      const r = plot.rect;
      const cur = stackSlot(now);
      pcs.forEach((pc, i) => {
        const hot = cur === i ? 1 : 0;
        const done = stack ? (cur > i || cur < 0 ? 1 : 0.55) : 1;
        fillSigned(V, pc.a, pc.b, alpha * (0.55 + 0.45 * done + 0.25 * hot), 1 + 0.35 * hot);
        const mid = (pc.a + pc.b) / 2;
        const fm = V.fn.f(mid);
        const y0 = plot.py(0);
        const pyMid = (plot.py(fm) + y0) / 2;
        const v = cnt(`pc.top.${i}`, pc.area);
        const src = `${pc.area >= 0 ? '+' : '−'}${p.show ? NV(Math.abs(v)) : '?'}${unitI()}`;
        const wpx = Math.abs(plot.px(pc.b) - plot.px(pc.a));
        if (wpx < pillW(src, fs(12, 11)) - 6 && !hot) return;
        const inside = Math.abs(plot.py(fm) - y0) > 44;
        const py = inside ? pyMid : fm >= 0 ? Math.min(plot.py(fm), y0) - 16 : Math.max(plot.py(fm), y0) + 16;
        fpill(plot.px(mid), py, src, { size: fs(12, 11), alpha: alpha * (0.85 + 0.15 * hot), color: pc.area >= 0 ? mixColor(col.pos(), th().text, 0.25) : mixColor(col.neg(), th().text, 0.2), border: withAlpha(pc.area >= 0 ? col.pos() : col.neg(), 0.6), bounds: r });
      });
    }

    /* =====================================================================
     * Unteres Bild: Stammfunktionen
     * ===================================================================== */
    function drawBottom(V: View, now: number, k: Intro): void {
      const theme = th();
      const an = axisNames();
      plotB.setAxes({ x: { label: an.x }, y: { label: an.F } });
      plotB.setRangePadded([rng.x0.v, rng.x1.v], [rng.Fy0.v, rng.Fy1.v], PAD());
      plotB.resize();
      plotB.begin();
      plotB.grid();
      plotB.axes();
      const r = plotB.rect;
      const w = (m: Mode) => mw[m].v;
      const [x0, x1] = [rng.x0.v, rng.x1.v];
      // Merkmale: Bänder unten (steigt/fällt, Krümmung)
      const kFeat = w('feat') * k.labels;
      // Richtungsfeld
      const kField = Math.max(w('feld'), kFld.v * (1 - w('feld'))) * k.field;
      if (kField > 0.001) drawField(V, kField, w('feld'));
      // Schar F + C
      const kf = kFam.v * (1 - w('draw')) * k.labels;
      const famS = rng.fam.v;
      if (kf > 0.01 || w('feld') > 0.01) {
        const a = Math.max(kf, w('feld') * k.Freveal);
        for (let j = -4; j <= 4; j++) {
          if (j === 0) continue;
          const cc = V.C + j * famS;
          const fade = clamp01(1.35 - Math.abs(j) * 0.22);
          strokePts(sample(plotB, (t) => V.fn.F(t) + cc, x0, lerp(x0, x1, k.Freveal), V.fn.jumps), withAlpha(col.F(), theme.dark ? 0.42 : 0.34), 1.4, { alpha: a * fade });
        }
        // Beschriftung der Schar (nur Richtungsfeld)
        const kl = w('feld') * k.labels;
        if (kl > 0.01 && r.w > 300) {
          for (const j of [-2, -1, 1, 2]) {
            const cc = V.C + j * famS;
            const yv = V.fn.F(x1) + cc;
            const py = plotB.py(yv);
            if (py < r.y + 40 || py > r.y + r.h - 14) continue;
            fpill(r.x + r.w - 8, py, `\\c{m}{C ${j > 0 ? '+' : '−'} ${N(Math.abs(j * famS), 2)}}`, { align: 'right', size: fs(11, 10.5), alpha: kl * 0.8, color: theme.muted, bounds: r });
          }
        }
      }
      // Graph von F
      const D = V.fn.x;
      const wTr = w('trace');
      const wFullBold = w('feld') + w('feat') + w('area') + w('back');
      if (wTr > 0.01) {
        if (kFull.v > 0.01) strokePts(sample(plotB, V.G, x0, x1, []), withAlpha(col.F(), 0.5), 2, { dash: [6, 5], alpha: wTr * kFull.v });
        const lo = Math.max(vis.lo, x0);
        const hi = Math.min(vis.hi, x1);
        strokePts(sample(plotB, V.G, lo, hi, []), col.F(), fs(3.4, 2.8), { glow: true, alpha: wTr });
      }
      if (wFullBold > 0.01) {
        let lo = x0;
        let hi = lerp(x0, x1, k.Freveal);
        if (grow) {
          const t = ease.inOutCubic(clamp01((now - grow.t0) / grow.dur));
          const reach = (D[1] - D[0]) * t;
          lo = Math.max(x0, V.x0 - reach);
          hi = Math.min(x1, V.x0 + reach);
        }
        strokePts(sample(plotB, V.G, lo, hi, []), col.F(), fs(3.4, 2.8), { glow: true, alpha: wFullBold });
        if (grow) {
          for (const e of [lo, hi]) {
            if (e <= x0 + 1e-9 || e >= x1 - 1e-9) continue;
            halo(plotB.px(e), plotB.py(V.G(e)), col.F(), 16, wFullBold);
            dot(plotB.px(e), plotB.py(V.G(e)), col.F(), 4.5, wFullBold);
          }
        }
      }
      // Merkmale am Graphen von F
      if (kFeat > 0.01) {
        drawBands(now, kFeat);
        drawFeaturesF(V, now, kFeat);
      }
      // Flächenstücke als Zuwachspfeile
      if (w('area') > 0.01) drawStairs(V, now, w('area') * k.labels);
      // Tangente mit Steigungsdreieck
      const kt = (wTr + w('back')) * k.labels;
      if (kt > 0.01) drawTangent(V, kt, w('back') > 0.5);
      // eigene Skizze
      if (w('draw') > 0.01) drawSketch(V, now, w('draw') * k.Freveal, k);
      // Anfangspunkt
      drawStart(V, k, 1 - w('draw') * 0.35, 1 - w('feat') - w('area'));
      // Legende
      const C = V.C;
      const Cv = cnt('leg.C', C);
      const leg = (w('draw') > 0.5 && kSol.v < 0.5) || (mode() !== 'draw' && !p.show) ? `\\c{F}{${names().F}(${names().v}) = ?}` : `\\c{F}{${fullSrc(null).F}}`;
      const l2 = legendLeft(plotB, an.F, pillW(leg, fs(13, 12)));
      const lr = fpill(l2, r.y + 18, leg, { align: 'left', size: fs(13, 12), alpha: k.panel, border: withAlpha(col.F(), 0.5), maxW: Math.max(120, r.x + r.w * 0.66 - l2) });
      const showC = !(w('draw') > 0.5 && kSol.v < 0.5);
      if (showC && r.w > 330) fpill(Math.max(r.x + r.w - 10, lr.x + lr.w + 10), r.y + 18, `\\c{F}{C ${p.show ? `${eq(C)} ${NV(Cv)}` : '= ?'}}`, { align: 'right', size: fs(12, 11), alpha: k.labels, color: col.F(), bounds: r });
      plotB.end();
    }

    /** Richtungsfeld: kurze Striche mit der Steigung f(x); in jeder Spalte gleich. */
    function drawField(V: View, alpha: number, emph: number): void {
      const g = surface.g;
      const theme = th();
      const r = plotB.rect;
      const top = r.y + 32;
      const nCols = Math.round(clamp(r.w / 30, 9, 30));
      const nRows = Math.round(clamp((r.h - 32) / 27, 5, 16));
      const cw = r.w / nCols;
      const rh = (r.h - 32) / nRows;
      const sx = plotB.px(1) - plotB.px(0);
      const sy = plotB.py(0) - plotB.py(1);
      const half = Math.min(cw, rh) * 0.36;
      const x0px = plotB.px(V.x0);
      const base = withAlpha(theme.dark ? '#c8d2e4' : '#3e4c63', theme.dark ? 0.5 : 0.42);
      g.save();
      g.lineCap = 'round';
      for (let i = 0; i < nCols; i++) {
        const cx = r.x + (i + 0.5) * cw;
        const xw = plotB.toWorld(cx, 0)[0];
        const m = V.fn.f(xw);
        if (!Number.isFinite(m)) continue;
        let dx = sx;
        let dy = -m * sy;
        const len = Math.hypot(dx, dy) || 1;
        dx = (dx / len) * half;
        dy = (dy / len) * half;
        // Einwachsen: Spalte für Spalte von links
        const kc = ease.outCubic(clamp01(alpha * (nCols + 6) / 6 - (i / nCols) * ((nCols + 6) / 6 - 1)));
        if (kc <= 0.01) continue;
        const near = Math.abs(cx - x0px) < cw * 0.5 ? emph : 0;
        g.strokeStyle = near > 0.01 ? mixColor(base, col.t(), near) : base;
        g.lineWidth = near > 0.01 ? 2.2 : 1.5;
        g.globalAlpha = clamp01(alpha * 1.4) * (near > 0.01 ? 1 : 0.95);
        g.beginPath();
        for (let j = 0; j < nRows; j++) {
          const cy = top + (j + 0.5) * rh;
          g.moveTo(cx - dx * kc, cy - dy * kc);
          g.lineTo(cx + dx * kc, cy + dy * kc);
        }
        g.stroke();
      }
      g.restore();
    }

    /** Tangente an F in x mit Steigungsdreieck (Δx rund, Höhe = f(x) · Δx). */
    function drawTangent(V: View, alpha: number, reading: boolean): void {
      const g = surface.g;
      const r = plotB.rect;
      const x = V.x;
      const y = V.G(x);
      const m = V.fn.f(x);
      const pxU = Math.abs(plotB.px(1) - plotB.px(0));
      const dxs = [0.1, 0.2, 0.25, 0.5, 1, 2, 5, 10];
      let dX = 1;
      for (const c of dxs) if (c * pxU <= 95) dX = c;
      if (dX * pxU < 30) dX = dxs.find((c) => c * pxU >= 30) ?? dX;
      const D = V.fn.x;
      const dir = x + dX <= D[1] ? 1 : -1;
      const x2 = x + dir * dX;
      const y2 = y + m * dir * dX;
      const span = (rng.x1.v - rng.x0.v) * 0.16;
      g.save();
      g.globalAlpha *= alpha;
      plotB.segment([x - span, y - m * span], [x + span, y + m * span], { color: withAlpha(col.t(), 0.9), width: 2.2 });
      // Steigungsdreieck
      g.fillStyle = withAlpha(col.t(), th().dark ? 0.2 : 0.12);
      g.beginPath();
      g.moveTo(plotB.px(x), plotB.py(y));
      g.lineTo(plotB.px(x2), plotB.py(y));
      g.lineTo(plotB.px(x2), plotB.py(y2));
      g.closePath();
      g.fill();
      plotB.segment([x, y], [x2, y], { color: withAlpha(th().muted, 0.9), width: 1.6 });
      g.restore();
      // senkrechte Kathete = f(x) · Δx in der Farbe des Balkens oben
      g.save();
      g.globalAlpha *= alpha;
      g.lineCap = 'round';
      g.strokeStyle = col.t();
      g.lineWidth = 4;
      g.beginPath();
      g.moveTo(plotB.px(x2), plotB.py(y));
      g.lineTo(plotB.px(x2), plotB.py(y2));
      g.stroke();
      g.restore();
      const sz = fs(11.5, 11);
      const dxLab = `Δ${names().v} = ${N(dX, 2)}`;
      fpill((plotB.px(x) + plotB.px(x2)) / 2, plotB.py(y) + (m >= 0 ? 15 : -15), `\\c{m}{${dxLab}}`, { size: sz, alpha: alpha * 0.92, color: th().muted, bounds: r });
      const mv = cnt('bot.m', m);
      const mTxt = p.show ? NV(mv) : '?';
      const right = dir > 0 ? plotB.px(x2) < r.x + r.w - 150 : plotB.px(x2) < r.x + 150;
      const lab = reading ? `\\c{t}{m ≈ ${mTxt}}` : `\\c{t}{m = ${names().f}(${N(x, 2)}) ≈ ${mTxt}}`;
      fpill(plotB.px(x2) + (right ? 12 : -12), clamp((plotB.py(y) + plotB.py(y2)) / 2, r.y + 46, r.y + r.h - 16), lab, { align: right ? 'left' : 'right', size: fs(12, 11), alpha, border: withAlpha(col.t(), 0.55), bounds: r });
      // Punkt auf F
      const py = plotB.py(y);
      halo(plotB.px(x), py, col.F(), 18, alpha * (sweep ? 1 : 0.55));
      dot(plotB.px(x), py, col.F(), 6.5, alpha);
      if (!reading && p.show) {
        const v = cnt('bot.Fx', y);
        const up = m < 0;
        fpill(plotB.px(x) + (dir > 0 ? -12 : 12), clamp(py + (up ? -20 : 20), r.y + 46, r.y + r.h - 14), `\\c{F}{${names().F}(${N(x, 2)}) ≈ ${NV(v)}}`, { align: dir > 0 ? 'right' : 'left', size: fs(11.5, 11), alpha: alpha * 0.95, color: col.F(), bounds: r });
      }
    }

    /** Anfangspunkt P₀(x₀ | y₀) mit Beschriftung. */
    function drawStart(V: View, k: Intro, alpha: number, labelA: number): void {
      const r = plotB.rect;
      const px = plotB.px(V.x0);
      const py = plotB.py(V.y0);
      if (py < r.y - 10 || py > r.y + r.h + 10) return;
      const a = alpha * k.labels;
      halo(px, py, col.F(), 20, a * (dragging() || wave ? 1 : 0.5));
      g_ring(px, py, a);
      const nm = names();
      const yv = cnt('start.y', V.y0);
      const lab = `\\c{F}{${nm.F}(${N(V.x0, 2)}) = ${N(yv, nd(yv))}${unitI()}}`;
      const right = px < r.x + r.w * 0.6;
      const below = py < r.y + 70;
      if (labelA > 0.01) fpill(px + (right ? 14 : -14), py + (below ? 22 : -22), lab, { align: right ? 'left' : 'right', size: fs(12, 11), alpha: a * labelA, border: withAlpha(col.F(), 0.55), bounds: r });
    }
    /** Ring um den Anfangspunkt (zeigt: hier kann man ziehen). */
    function g_ring(px: number, py: number, a: number): void {
      const g = surface.g;
      if (a <= 0.01) return;
      g.save();
      g.globalAlpha *= a;
      g.strokeStyle = col.F();
      g.lineWidth = 2;
      g.setLineDash([3, 3]);
      g.beginPath();
      g.arc(px, py, 11, 0, TAU);
      g.stroke();
      g.restore();
      dot(px, py, col.F(), 6.5, a);
    }

    /** Bänder unter dem Graphen von F: steigt/fällt und Krümmung (Vorzeichentabelle als Bild). */
    function drawBands(now: number, alpha: number): void {
      const g = surface.g;
      const theme = th();
      const r = plotB.rect;
      const sk = stepsK(now);
      const h = fs(16, 14);
      const yB1 = r.y + r.h - 2 * h - 24;
      const yB2 = r.y + r.h - h - 20;
      const rows: [number, number, (s: SignInterval) => -1 | 0 | 1, (v: -1 | 0 | 1) => string, (v: -1 | 0 | 1) => string][] = [
        [yB1, sk.bands, (s) => s.f, (v) => (v > 0 ? col.pos() : v < 0 ? col.neg() : theme.muted), (v) => (v > 0 ? '↗' : v < 0 ? '↘' : '→')],
        [yB2, sk.curv, (s) => s.d, (v) => (v > 0 ? col.t() : v < 0 ? mixColor(col.t(), theme.muted, 0.55) : theme.muted), (v) => (v > 0 ? say(L('∪ links', '∪ left')) : v < 0 ? say(L('∩ rechts', '∩ right')) : '')],
      ];
      for (const [y, k, get, color, label] of rows) {
        const a = alpha * k;
        if (a <= 0.01) continue;
        g.save();
        g.globalAlpha *= a;
        for (const s of table) {
          const xa = Math.max(r.x, plotB.px(s.a));
          const xb = Math.min(r.x + r.w, plotB.px(s.b));
          if (xb - xa < 2) continue;
          const v = get(s);
          g.fillStyle = withAlpha(color(v), theme.dark ? 0.55 : 0.4);
          roundRect(g, xa + 1, y, xb - xa - 2, h, h / 2);
          g.fill();
          const txt = label(v);
          g.font = `700 ${fs(11, 10.5)}px ${theme.font}`;
          if (txt && g.measureText(txt).width < xb - xa - 8) {
            // Dunkelmodus: hell auf der Bandfarbe, sonst dunkle Schrift (Kontrast)
            g.fillStyle = theme.dark ? textOn(color(v), theme, '#f4f7fb') : '#1b2533';
            g.textAlign = 'center';
            g.textBaseline = 'middle';
            g.fillText(txt, (xa + xb) / 2, y + h / 2 + 0.5);
          }
        }
        g.restore();
      }
    }

    /** Hoch-, Tief-, Wende- und Terrassenpunkte von F mit Hilfslinien zum Graphen von f. */
    function drawFeaturesF(V: View, now: number, alpha: number): void {
      const r = plotB.rect;
      const topR = plot.rect;
      const sk = stepsK(now);
      const az = alpha * sk.zeros;
      const ae = alpha * sk.ext;
      for (const z of feat.zeros) {
        const y = V.G(z.x);
        const px = plotB.px(z.x);
        const color = z.sign === 0 ? th().muted : z.sign < 0 ? col.pos() : col.neg();
        vguide(px, topR.y + 34, plotB.py(y), color, az * 0.75);
        dot(px, plotB.py(y), col.F(), 6 * ease.outBack(clamp01(sk.zeros * 1.2)), az);
        const lab = z.sign === 0 ? say(L('Terrassenpunkt', 'saddle point')) : z.sign < 0 ? say(L('HP', 'max')) : say(L('TP', 'min'));
        const extra = z.jump ? say(L(' (Knick)', ' (kink)')) : '';
        fpill(px, plotB.py(y) + (z.sign < 0 ? -20 : 20), `\\t{${lab}${extra}}`, { size: fs(12, 11), alpha: az, color, border: withAlpha(color, 0.55), bounds: r });
      }
      for (const e of feat.ext) {
        const y = V.G(e.x);
        const px = plotB.px(e.x);
        vguide(px, topR.y + 34, plotB.py(y), col.t(), ae * 0.75);
        dot(px, plotB.py(y), col.t(), 5.5 * ease.outBack(clamp01(sk.ext * 1.2)), ae, true);
        const m = V.fn.f(e.x);
        fpill(px + (m >= 0 ? -14 : 14), plotB.py(y) + (m >= 0 ? -16 : -16), `\\t{${say(L('WP', 'infl.'))}}`, { align: m >= 0 ? 'right' : 'left', size: fs(12, 11), alpha: ae, color: col.t(), border: withAlpha(col.t(), 0.5), bounds: r });
      }
    }

    /** Flächenstücke als Treppe: Zuwachspfeile ΔF = Fläche des Stücks. */
    function drawStairs(V: View, now: number, alpha: number): void {
      const g = surface.g;
      const r = plotB.rect;
      const cur = stackSlot(now);
      pcs.forEach((pc, i) => {
        let k = 1;
        if (stack) {
          if (cur < 0) k = 1;
          else if (i < cur) k = 1;
          else if (i > cur) k = 0;
          else k = ease.inOutCubic(clamp01((now - stack.t0 - i * stack.slot - 150) / (stack.slot * 0.7)));
        }
        if (k <= 0.01) return;
        const ya = V.G(pc.a);
        const yb = lerp(ya, V.G(pc.b), k);
        const pa = plotB.px(pc.a);
        const pb = plotB.px(pc.b);
        const color = pc.area >= 0 ? col.pos() : col.neg();
        g.save();
        g.globalAlpha *= alpha;
        g.strokeStyle = withAlpha(color, 0.75);
        g.lineWidth = 1.4;
        g.setLineDash([4, 4]);
        g.beginPath();
        g.moveTo(pa, plotB.py(ya));
        g.lineTo(lerp(pa, pb, Math.min(1, k * 1.6)), plotB.py(ya));
        g.stroke();
        g.setLineDash([]);
        g.fillStyle = withAlpha(color, th().dark ? 0.28 : 0.16);
        const top = Math.min(plotB.py(ya), plotB.py(yb));
        roundRect(g, pb - 7, top, 14, Math.abs(plotB.py(yb) - plotB.py(ya)), 6);
        g.fill();
        arrowPx(pb, plotB.py(ya), pb, plotB.py(yb), color, 2.6, 9);
        g.restore();
        const v = cnt(`pc.bot.${i}`, pc.area * k);
        const src = `\\c{${pc.area >= 0 ? 'p' : 'n'}}{Δ${names().F} = ${pc.area >= 0 ? '+' : '−'}${p.show ? NV(Math.abs(v)) : '?'}}`;
        const inside = pb - pa > pillW(src, fs(11.5, 11)) + 20;
        const right = !inside && pb < r.x + r.w - 110;
        if (Math.abs(plotB.py(yb) - plotB.py(ya)) > 12 || k < 1) fpill(pb + (right ? 12 : -12), clamp((plotB.py(ya) + plotB.py(yb)) / 2, r.y + 46, r.y + r.h - 14), src, { align: right ? 'left' : 'right', size: fs(11.5, 11), alpha: alpha * k, border: withAlpha(color, 0.55), bounds: r });
        dot(pa, plotB.py(ya), col.F(), 4, alpha);
      });
    }

    /** Aufgabenmodus: eigene Skizze, Lösung, Abweichung und Steigungs-Check. */
    function drawSketch(V: View, now: number, alpha: number, k: Intro): void {
      const g = surface.g;
      const theme = th();
      const r = plotB.rect;
      const nodes = V.fn.nodes;
      // Hilfslinien an den Stützstellen
      for (const xn of nodes) vguide(plotB.px(xn), r.y + 34, r.y + r.h, theme.muted, 0.35 * alpha, [2, 5]);
      const sp = spline(nodes, V.sk, nodes[0]);
      const a = nodes[0]!;
      const b = nodes[nodes.length - 1]!;
      // Lösung (aufgedeckt): wächst vom Anfangspunkt aus
      const ks = kSol.v;
      let lo = a;
      let hi = b;
      if (reveal) {
        const t = ease.inOutCubic(clamp01((now - reveal.t0) / reveal.dur));
        const reach = (rng.x1.v - rng.x0.v) * t;
        lo = Math.max(rng.x0.v, V.x0 - reach);
        hi = Math.min(rng.x1.v, V.x0 + reach);
      } else {
        lo = rng.x0.v;
        hi = rng.x1.v;
      }
      if (ks > 0.01) {
        // Abweichung als Fläche zwischen Skizze und Lösung
        const L0 = Math.max(lo, a);
        const H0 = Math.min(hi, b);
        if (H0 > L0) {
          const top = sample(plotB, sp.f, L0, H0, []);
          const bot = sample(plotB, V.G, L0, H0, []).reverse();
          g.save();
          g.globalAlpha *= alpha * ks;
          g.fillStyle = withAlpha(col.neg(), theme.dark ? 0.24 : 0.14);
          g.beginPath();
          [...top, ...bot].forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
          g.closePath();
          g.fill();
          g.restore();
        }
        strokePts(sample(plotB, V.G, lo, hi, []), col.F(), fs(3.2, 2.7), { glow: true, alpha: alpha * ks });
      }
      // Skizze
      strokePts(sample(plotB, sp.f, a, lerp(a, b, k.Freveal), []), col.s(), fs(3.2, 2.7), { glow: true, alpha });
      nodes.forEach((xn, i) => {
        const py = plotB.py(V.sk[i]!);
        halo(plotB.px(xn), py, col.s(), 15, alpha * 0.5);
        dot(plotB.px(xn), py, col.s(), 6, alpha * ease.outBack(clamp01(k.stagger * 3 - i * 0.2)));
      });
      // Steigungs-Check nach dem Aufdecken
      if (rating && ks > 0.5) {
        rating.checks.forEach((c, i) => {
          const xm = (c.a + c.b) / 2;
          const ym = Math.max(sp.f(xm), V.G(xm));
          const color = c.ok ? col.pos() : col.neg();
          fpill(plotB.px(xm), plotB.py(ym) - 18, `\\t{${c.ok ? '✓' : '✗'}}`, { size: fs(12, 11), alpha: alpha * (ks - 0.5) * 2 * clamp01(k.stagger * 4 - i * 0.3), color, border: withAlpha(color, 0.6), bounds: r });
        });
      }
    }

    /* ---------- Hilfsfunktionen der Geschichten ---------- */
    /** Fortschritt „Merkmale Schritt für Schritt“: Bänder, Nullstellen → Extrema, Extrema → Wendepunkte, Krümmung. */
    function stepsK(now: number): { bands: number; zeros: number; ext: number; curv: number; table: number } {
      if (!steps) return { bands: 1, zeros: 1, ext: 1, curv: 1, table: 1 };
      const t = now - steps.t0;
      const e = (a: number, d: number) => ease.outCubic(clamp01((t - a) / d));
      return { bands: e(150, 800), zeros: e(1200, 900), ext: e(2600, 900), curv: e(4000, 800), table: e(150, 4600) };
    }
    /** Aktuelles Stück beim „Flächen übertragen“ (−1: fertig). */
    function stackSlot(now: number): number {
      if (!stack) return -1;
      const i = Math.floor((now - stack.t0) / stack.slot);
      return i >= stack.n ? -1 : i;
    }

    /** Senkrechte Verbindung zwischen den beiden Bildern an der Stelle x. */
    function drawLink(V: View, k: Intro): void {
      const w = (m: Mode) => mw[m].v;
      const a = (w('trace') + w('back')) * k.labels;
      if (a > 0.01) {
        const px = plot.px(V.x);
        vguide(px, plot.py(0), plotB.rect.y + 34, col.t(), 0.45 * a, [2, 4]);
      }
      const b = w('feld') * k.labels;
      if (b > 0.01) vguide(plot.px(V.x0), plot.rect.y + plot.rect.h, plotB.rect.y + 34, col.F(), 0.45 * b, [2, 4]);
    }

    /* =====================================================================
     * Karten
     * ===================================================================== */
    type CardFn = (R: Rect, measure: boolean) => number;
    type RowSpec = { src: string; color?: string; size?: number; weight?: number; gap?: number; at?: number; hl?: string };
    const rowH = (b: FormulaBox) => Math.max(b.asc + b.desc, 15);

    /** Karte aus Formelzeilen (mit gestaffeltem Einblenden und Hervorhebung). */
    function formulaCard(R: Rect, measure: boolean, k: Intro, title: string, accent: string, rows: RowSpec[], right?: string): number {
      const g = surface.g;
      const pad = fs(14, 12);
      const maxW = R.w - 2 * pad - 4;
      const boxes = rows.map((r) => fit(r.src, maxW, r.size ?? fs(13.5, 12.5), r.color ?? th().text, r.weight ?? 600));
      const h = 36 + boxes.reduce((s, b, i) => s + rowH(b) + (rows[i]!.gap ?? 8), 0) + 4;
      if (measure) return h;
      card({ ...R, h }, accent);
      cardTitle(R, title, accent, right);
      let y = R.y + 36;
      boxes.forEach((b, i) => {
        const a = rows[i]!.at ?? clamp01(k.stagger * (rows.length + 2) - i);
        const hl = rows[i]!.hl;
        g.save();
        g.globalAlpha *= ease.outCubic(a);
        if (hl) {
          g.fillStyle = withAlpha(hl, th().dark ? 0.2 : 0.12);
          roundRect(g, R.x + pad - 6, y - 3, R.w - 2 * pad + 12, rowH(b) + 6, 7);
          g.fill();
        }
        b.draw(g, R.x + pad + (1 - ease.outCubic(a)) * 10, y + b.asc);
        g.restore();
        y += rowH(b) + (rows[i]!.gap ?? 8);
      });
      return h;
    }

    /** Fließtext-Zeilen (umbrechend) für Karten. */
    function textBlock(R: Rect, y: number, str: string, color: string, size: number, draw: boolean, weight = 500): number {
      const pad = fs(14, 12);
      const font = `${weight} ${size}px ${th().font}`;
      const lines = wrapText(str, R.w - 2 * pad, font);
      const lh = size * 1.32;
      if (draw) {
        const g = surface.g;
        g.font = font;
        g.fillStyle = color;
        g.textAlign = 'left';
        g.textBaseline = 'middle';
        lines.forEach((ln, i) => g.fillText(ln, R.x + pad, y + lh / 2 + i * lh));
      }
      return lines.length * lh;
    }

    function fnCard(V: View, k: Intro): CardFn {
      return (R, measure) => {
        const src = fullSrc(null);
        const s = fnSrc();
        const nm = names();
        const rows: RowSpec[] = [
          { src: mode() === 'back' && !p.full ? `\\c{f}{${nm.f}(${nm.v}) = ?}` : `\\c{f}{${src.f}}`, size: fs(13.5, 12.5) },
          { src: `\\c{F}{${antiHidden() ? `${nm.F}(${nm.v}) = ?` : src.F}}`, size: fs(13.5, 12.5) },
          { src: `\\c{m}{${nm.F}′(${nm.v}) = ${nm.f}(${nm.v}),  C ∈ ℝ}`, size: fs(12, 11), color: th().muted },
        ];
        if (s.note) rows.push({ src: `\\c{m}{${s.note}}`, size: fs(12, 11), color: th().muted });
        void V;
        return formulaCard(R, measure, k, say(L('Funktion und Stammfunktionen', 'Function and antiderivatives')), col.F(), rows);
      };
    }

    /** Steigung übertragen: Höhe von f = Steigung von F. */
    function transferCard(V: View, k: Intro): CardFn {
      return (R, measure) => {
        const nm = names();
        const x = V.x;
        const fv = V.fn.f(x);
        const Fv = V.G(x);
        const fvC = cnt('c.tr.f', fv);
        const FvC = cnt('c.tr.F', Fv);
        const state = fv > 1e-9 ? say(L('f > 0: F steigt', 'f > 0: F increases')) : fv < -1e-9 ? say(L('f < 0: F fällt', 'f < 0: F decreases')) : say(L('f = 0: waagrechte Tangente', 'f = 0: horizontal tangent'));
        const stCol = fv > 1e-9 ? col.pos() : fv < -1e-9 ? col.neg() : th().muted;
        const rows: RowSpec[] = [
          { src: `\\c{f}{${nm.f}(${N(x, 2)})} ${p.show ? `≈ ${NV(fvC)}` : '= ?'}${unitF()}  \\c{m}{${say(L('(Höhe oben)', '(height above)'))}}`, size: fs(13.5, 12.5) },
          { src: `\\b{\\c{F}{${nm.F}′(${nm.v})} = \\c{f}{${nm.f}(${nm.v})}}`, size: fs(16, 14) },
          { src: `\\c{t}{m = ${p.show ? NV(fvC) : '?'}}  \\c{m}{${say(L('(Steigung unten)', '(slope below)'))}}`, size: fs(13.5, 12.5) },
          { src: `\\c{F}{${nm.F}(${N(x, 2)})} ${p.show ? `≈ ${NV(FvC)}` : '= ?'}${unitI()}`, size: fs(13.5, 12.5) },
          { src: `\\c{${fv > 1e-9 ? 'p' : fv < -1e-9 ? 'n' : 'm'}}{${state}}`, size: fs(13, 12), hl: stCol },
        ];
        return formulaCard(R, measure, k, say(L('Steigung übertragen', 'Transfer the slope')), col.t(), rows);
      };
    }

    /** Die vier Zusammenhänge mit Hervorhebung des gerade passenden. */
    function rulesCard(V: View, k: Intro, reverse: boolean): CardFn {
      return (R, measure) => {
        const x = V.x;
        const v = V.fn.f(x);
        const D = V.fn.x;
        const tol = (D[1] - D[0]) * 0.03;
        const nearZero = feat.zeros.some((z) => z.sign !== 0 && Math.abs(z.x - x) < tol);
        const nearExt = feat.ext.some((e) => Math.abs(e.x - x) < tol);
        const fwd = [
          say(L('f > 0  ⇔  F steigt', 'f > 0  ⇔  F increases')),
          say(L('f < 0  ⇔  F fällt', 'f < 0  ⇔  F decreases')),
          say(L('Nullstelle mit VZW  ⇒  Extremstelle von F', 'zero with sign change  ⇒  extremum of F')),
          say(L('Extremstelle von f  ⇒  Wendestelle von F', 'extremum of f  ⇒  inflection point of F')),
        ];
        const bwd = [
          say(L('F steigt  ⇒  f ≥ 0', 'F increases  ⇒  f ≥ 0')),
          say(L('F fällt  ⇒  f ≤ 0', 'F decreases  ⇒  f ≤ 0')),
          say(L('HP/TP von F  ⇒  Nullstelle von f', 'max/min of F  ⇒  zero of f')),
          say(L('WP von F  ⇒  Extremstelle von f', 'inflection of F  ⇒  extremum of f')),
        ];
        const lines = reverse ? bwd : fwd;
        const act = [v > 1e-6 && !nearZero, v < -1e-6 && !nearZero, nearZero, nearExt];
        const hlCol = [col.pos(), col.neg(), col.F(), col.t()];
        const rows: RowSpec[] = lines.map((s, i) => ({ src: `\\t{${s}}`, size: fs(12.5, 11.5), weight: act[i] ? 700 : 600, color: act[i] ? th().text : withAlpha(th().text, 0.72), hl: act[i] ? hlCol[i] : undefined, gap: 9 }));
        if (reverse) rows.push({ src: `\\c{m}{${say(L('F + C hat dieselbe Ableitung f – C ändert f nicht.', 'F + C has the same derivative f – C does not change f.'))}}`, size: fs(12, 11), color: th().muted });
        return formulaCard(R, measure, k, say(L('Zusammenhänge', 'Relationships')), col.F(), rows);
      };
    }

    /** Anfangswertproblem: C aus F(x₀) = y₀. */
    function ivpCard(V: View, k: Intro): CardFn {
      return (R, measure) => {
        const nm = names();
        const s = fnSrc();
        const F0 = V.fn.F(V.x0);
        const F0c = cnt('c.ivp.F0', F0);
        const y0c = cnt('c.ivp.y0', V.y0);
        const Cc = cnt('c.ivp.C', V.C);
        const fx = `${N(V.x0, 2)}`;
        const F0name = `${nm.F}_0`;
        const rows: RowSpec[] = [
          { src: `\\c{m}{${nm.F}′ = ${nm.f},  ${nm.F}(${nm.v}_0) = ${nm.v === 'x' ? 'y' : nm.F}_0}`, size: fs(12, 11), color: th().muted, gap: 6 },
          { src: `\\c{F}{${nm.F}(${nm.v}) = ${s.F === '0' ? '' : `${F0name}(${nm.v})`} + C}`, size: fs(13.5, 12.5) },
          { src: `${F0name}(${fx}) ${p.show ? `${eq(F0)} ${NV(F0c)}` : '= ?'}`, size: fs(13, 12) },
          { src: `C = ${N(y0c, nd(y0c))} − ${p.show ? (F0 < 0 ? `(${NV(F0c)})` : NV(F0c)) : '?'} ${p.show ? `${eq(V.C)} \\b{${NV(Cc)}}` : '= ?'}`, size: fs(14, 13), hl: col.F() },
          { src: `\\c{F}{${p.show ? fullSrc(V.C).F : `${nm.F}(${nm.v}) = ?`}}`, size: fs(13.5, 12.5) },
        ];
        if (!s.closed) rows.splice(2, 1);
        return formulaCard(R, measure, k, say(L('Anfangswertproblem', 'Initial value problem')), col.F(), rows, `${nm.F}(${fx}) = ${N(V.y0, nd(V.y0))}`);
      };
    }

    /** Die Schar F + C: parallel verschoben, gleiche Steigung an derselben Stelle. */
    function famCard(V: View, k: Intro): CardFn {
      return (R, measure) => {
        const nm = names();
        const rows: RowSpec[] = [
          { src: `\\c{F}{${nm.F}_0(${nm.v}) + C},  C ∈ ℝ`, size: fs(13.5, 12.5) },
          { src: `\\c{m}{${say(L('an derselben Stelle: dieselbe Steigung', 'at the same position: the same slope'))}}`, size: fs(12, 11), color: th().muted },
          { src: `\\c{m}{${say(L('→ Graphen nur senkrecht verschoben', '→ graphs only shifted vertically'))}}`, size: fs(12, 11), color: th().muted },
          { src: `\\c{m}{${say(L('Richtungsfeld: Striche hängen nur von x ab', 'slope field: strokes only depend on x'))}}`, size: fs(12, 11), color: th().muted },
          { src: `\\c{m}{${say(L('Abstand der gezeigten Kurven', 'spacing of the curves shown'))}: ΔC = ${N(rng.fam.goal, 2)}${unitI()}}`, size: fs(12, 11), color: th().muted },
        ];
        void V;
        return formulaCard(R, measure, k, say(L('Kurvenschar F + C', 'Family F + C')), col.t(), rows);
      };
    }

    /** Vorzeichentabelle: Intervalle mit f, F und Krümmung. */
    function tableCard(V: View, now: number, k: Intro): CardFn {
      return (R, measure) => {
        const g = surface.g;
        const theme = th();
        const pad = fs(14, 12);
        const rows = table.slice(0, 7);
        const rH = fs(22, 20);
        const h = 58 + rows.length * rH + 8;
        if (measure) return h;
        card({ ...R, h }, col.pos());
        cardTitle(R, say(L('Vorzeichentabelle', 'Sign chart')), col.pos());
        const inner = R.w - 2 * pad;
        const cols = [R.x + pad, R.x + pad + inner * 0.44, R.x + pad + inner * 0.6, R.x + R.w - pad];
        const hy = R.y + 42;
        const nm = names();
        g.font = `700 ${fs(11.5, 11)}px ${theme.font}`;
        g.fillStyle = theme.muted;
        g.textBaseline = 'middle';
        g.textAlign = 'left';
        g.fillText(say(L('Intervall', 'interval')), cols[0]!, hy);
        g.textAlign = 'center';
        g.fillText(nm.f, cols[1]!, hy);
        g.fillText(nm.F, cols[2]!, hy);
        g.textAlign = 'right';
        const kw = say(L('Krümmung', 'curvature'));
        g.fillText(g.measureText(kw).width < cols[3]! - cols[2]! - 14 ? kw : '∪ / ∩', cols[3]!, hy);
        const sk = stepsK(now);
        const iv = (s: SignInterval) => {
          // Bei „Werte zeigen“ aus verraten die inneren Grenzen die Lösung (Nullstellen von f)
          const loEdge = s.a <= V.fn.x[0] + 1e-9;
          const hiEdge = s.b >= V.fn.x[1] - 1e-9;
          const lo = loEdge ? `${N(s.a, 1)}` : p.show ? N(s.a, 2) : '?';
          const hi = hiEdge || p.show ? N(s.b, 2) : '?';
          return lang === 'de' ? `]${lo}; ${hi}[` : `(${lo}, ${hi})`;
        };
        const xNow = mode() === 'trace' || mode() === 'back' ? V.x : NaN;
        rows.forEach((s, i) => {
          const y = hy + 20 + i * rH;
          const a = Math.min(clamp01(k.stagger * (rows.length + 2) - i), clamp01(sk.table * (rows.length + 1) - i));
          g.save();
          g.globalAlpha *= ease.outCubic(a);
          if (xNow >= s.a && xNow <= s.b) {
            g.fillStyle = withAlpha(col.t(), theme.dark ? 0.18 : 0.1);
            roundRect(g, R.x + pad - 6, y - rH / 2 + 1, inner + 12, rH - 2, 7);
            g.fill();
          }
          g.font = `600 ${fs(12, 11)}px ${theme.font}`;
          g.fillStyle = theme.text;
          g.textAlign = 'left';
          let ivs = iv(s);
          while (g.measureText(ivs).width > cols[1]! - cols[0]! - 14 && ivs.length > 6) ivs = `${ivs.slice(0, -3)}…`;
          g.fillText(ivs, cols[0]!, y);
          g.textAlign = 'center';
          g.font = `800 ${fs(13, 12)}px ${theme.font}`;
          g.fillStyle = s.f > 0 ? col.pos() : s.f < 0 ? col.neg() : theme.muted;
          g.fillText(s.f > 0 ? '+' : s.f < 0 ? '−' : '0', cols[1]!, y);
          g.fillText(s.f > 0 ? '↗' : s.f < 0 ? '↘' : '→', cols[2]!, y);
          g.textAlign = 'right';
          g.font = `600 ${fs(12, 11)}px ${theme.font}`;
          g.fillStyle = s.d > 0 ? col.t() : theme.text;
          g.fillText(s.d > 0 ? say(L('∪ links', '∪ left')) : s.d < 0 ? say(L('∩ rechts', '∩ right')) : '–', cols[3]!, y);
          g.restore();
        });
        return h;
      };
    }

    /** Liste der Merkmale von F mit Begründung. */
    function featCard(V: View, now: number, k: Intro): CardFn {
      return (R, measure) => {
        const nm = names();
        const sk = stepsK(now);
        const unit = meta() ? ` ${nm.uX}` : '';
        const rows: RowSpec[] = [];
        for (const z of feat.zeros.slice(0, 4)) {
          const xv = p.show ? N(z.x, 2) : '?';
          const yv = p.show ? NV(V.G(z.x)) : '?';
          if (z.sign === 0) rows.push({ src: `\\c{m}{${say(L('Terrassenpunkt', 'Saddle point'))}} ${nm.v} ≈ ${xv}${unit}  \\c{m}{(${say(L('ohne VZW', 'no sign change'))})}`, size: fs(12.5, 11.5), at: sk.zeros });
          else
            rows.push({
              src: `\\c{${z.sign < 0 ? 'p' : 'n'}}{${z.sign < 0 ? say(L('HP', 'Max')) : say(L('TP', 'Min'))}(${xv} | ${yv})}  \\c{m}{${nm.f}: ${z.sign < 0 ? '+ → −' : '− → +'}${z.jump ? say(L(', Sprung', ', jump')) : ''}}`,
              size: fs(12.5, 11.5),
              at: sk.zeros,
            });
        }
        for (const e of feat.ext.slice(0, 3)) {
          const xv = p.show ? N(e.x, 2) : '?';
          rows.push({ src: `\\c{t}{WP} ${nm.v} ≈ ${xv}${unit}  \\c{m}{(${e.kind === 'max' ? say(L('HP von f', 'max of f')) : say(L('TP von f', 'min of f'))})}`, size: fs(12.5, 11.5), at: sk.ext });
        }
        if (!rows.length) rows.push({ src: `\\c{m}{${say(L('f hat keinen Vorzeichenwechsel und kein Extremum: F ist streng monoton ohne Wendepunkt.', 'f has no sign change and no extremum: F is strictly monotonic without inflection.'))}}`, size: fs(12, 11), color: th().muted });
        const nZ = feat.zeros.filter((z) => z.sign !== 0).length;
        rows.push({ src: `\\c{m}{${nZ} ${say(L(nZ === 1 ? 'Extremstelle' : 'Extremstellen', nZ === 1 ? 'extremum' : 'extrema'))}, ${feat.ext.length} ${say(L(feat.ext.length === 1 ? 'Wendestelle' : 'Wendestellen', feat.ext.length === 1 ? 'inflection point' : 'inflection points'))}}`, size: fs(12, 11), color: th().muted, at: sk.ext });
        return formulaCard(R, measure, k, say(L('Merkmale von F', 'Features of F')), col.t(), rows);
      };
    }

    /** Flächenstücke: Tabelle mit Fläche und Höhenänderung, Summe. */
    function piecesCard(V: View, now: number, k: Intro): CardFn {
      return (R, measure) => {
        const g = surface.g;
        const theme = th();
        const pad = fs(14, 12);
        const list = pcs.slice(0, 7);
        const rH = fs(22, 20);
        const h = 58 + list.length * rH + 34;
        if (measure) return h;
        card({ ...R, h }, col.pos());
        cardTitle(R, say(L('Flächenstücke → Höhenänderung', 'Area pieces → change in height')), col.pos());
        const inner = R.w - 2 * pad;
        const cols = [R.x + pad, R.x + pad + inner * 0.6, R.x + R.w - pad];
        const hy = R.y + 42;
        const nm = names();
        g.font = `700 ${fs(11.5, 11)}px ${theme.font}`;
        g.fillStyle = theme.muted;
        g.textBaseline = 'middle';
        g.textAlign = 'left';
        g.fillText(say(L('Stück', 'piece')), cols[0]!, hy);
        g.textAlign = 'right';
        g.fillText(say(L('Fläche', 'area')), cols[1]!, hy);
        g.fillText(`${nm.F} ${say(L('ändert sich', 'changes'))}`, cols[2]!, hy);
        const cur = stackSlot(now);
        list.forEach((pc, i) => {
          const y = hy + 20 + i * rH;
          const a = clamp01(k.stagger * (list.length + 2) - i) * (stack && cur >= 0 && i > cur ? 0.35 : 1);
          g.save();
          g.globalAlpha *= ease.outCubic(a);
          const color = pc.area >= 0 ? col.pos() : col.neg();
          if (cur === i) {
            g.fillStyle = withAlpha(color, theme.dark ? 0.22 : 0.12);
            roundRect(g, R.x + pad - 6, y - rH / 2 + 1, inner + 12, rH - 2, 7);
            g.fill();
          }
          g.font = `600 ${fs(12, 11)}px ${theme.font}`;
          g.fillStyle = theme.text;
          g.textAlign = 'left';
          g.fillText(lang === 'de' ? `[${N(pc.a, 2)}; ${N(pc.b, 2)}]` : `[${N(pc.a, 2)}, ${N(pc.b, 2)}]`, cols[0]!, y);
          g.textAlign = 'right';
          const v = cnt(`c.pc.${i}`, pc.area);
          g.fillStyle = color;
          g.font = `700 ${fs(12, 11)}px ${theme.font}`;
          g.fillText(p.show ? fmt.signed(clean(v, 2), nd(v)) : '?', cols[1]!, y);
          g.fillText(p.show ? `${pc.area >= 0 ? '↑' : '↓'} ${N(Math.abs(v), nd(v))}` : '?', cols[2]!, y);
          g.restore();
        });
        // Summe
        const D = V.fn.x;
        const tot = list.reduce((s, pc) => s + pc.area, 0);
        const tv = cnt('c.pc.sum', tot);
        const sy = hy + 20 + list.length * rH + 6;
        g.strokeStyle = withAlpha(theme.text, 0.25);
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(R.x + pad, sy - 10);
        g.lineTo(R.x + R.w - pad, sy - 10);
        g.stroke();
        const sb = fit(`${nm.F}(${N(D[1], 2)}) − ${nm.F}(${N(D[0], 2)}) = \\b{${p.show ? fmt.signed(clean(tv, 2), nd(tv)) : '?'}}${unitI()}`, inner, fs(12.5, 11.5), theme.text, 650);
        sb.draw(g, R.x + pad, sy + 6 + (sb.asc - sb.desc) / 2);
        return h;
      };
    }

    /** F → f: Steigung der Tangente ablesen. */
    function readCard(V: View, k: Intro): CardFn {
      return (R, measure) => {
        const nm = names();
        const x = V.x;
        const m = V.fn.f(x);
        const mC = cnt('c.rd.m', m);
        const FC = cnt('c.rd.F', V.G(x));
        const rows: RowSpec[] = [
          { src: `\\c{F}{${nm.F}(${N(x, 2)})} ${p.show ? `≈ ${NV(FC)}` : '= ?'}${unitI()}`, size: fs(13.5, 12.5) },
          { src: `\\c{t}{${say(L('Steigung der Tangente', 'slope of the tangent'))}: m ${p.show ? `≈ ${NV(mC)}` : '= ?'}}`, size: fs(13.5, 12.5) },
          { src: `\\b{\\c{f}{${nm.f}(${N(x, 2)})} = \\c{F}{${nm.F}′(${N(x, 2)})} ${p.show ? `≈ ${NV(mC)}` : '= ?'}}${unitF()}`, size: fs(14.5, 13), hl: col.t() },
          { src: `\\c{m}{${say(L('Punkt nach oben übertragen – so entsteht f', 'carry the point up – that is how f appears'))}}`, size: fs(12, 11), color: th().muted },
        ];
        return formulaCard(R, measure, k, say(L('Tangente ablesen', 'Read off the tangent')), col.t(), rows);
      };
    }

    /** Aufgabenmodus: Rückmeldung zur eigenen Skizze. */
    function sketchCard(V: View, k: Intro): CardFn {
      return (R, measure) => {
        const nm = names();
        const nodes = V.fn.nodes;
        const sp = spline(nodes, V.sk, nodes[0]);
        // Extremstellen der Skizze zählen (Vorzeichenwechsel der Steigung zwischen den Punkten)
        let skExt = 0;
        let last = 0;
        for (let i = 0; i + 1 < V.sk.length; i++) {
          const d = V.sk[i + 1]! - V.sk[i]!;
          const s = Math.abs(d) < 1e-9 ? 0 : Math.sign(d);
          if (s !== 0) {
            if (last !== 0 && s !== last) skExt++;
            last = s;
          }
        }
        const want = feat.zeros.filter((z) => z.sign !== 0 && z.x > nodes[0]! && z.x < nodes[nodes.length - 1]!).length;
        const r0 = rangeOf(V.G, nodes[0]!, nodes[nodes.length - 1]!, 80);
        const tolS = 0.05 * Math.max(r0.hi - r0.lo, 0.5);
        const hitStart = Math.abs(sp.f(V.x0) - V.y0) <= tolS;
        const rows: RowSpec[] = [];
        if (kSol.v < 0.5) {
          rows.push({ src: `\\c{m}{${say(L('Zieh die 7 Punkte.', 'Drag the 7 points.'))}}`, size: fs(12, 11), color: th().muted });
          rows.push({ src: `${hitStart ? '\\c{p}{✓}' : '\\c{n}{✗}'} ${say(L('Anfangspunkt', 'initial point'))} \\c{F}{${nm.F}(${N(V.x0, 2)}) = ${N(V.y0, nd(V.y0))}}`, size: fs(13, 12) });
          const okExt = skExt === want;
          rows.push({ src: `${okExt ? '\\c{p}{✓}' : '\\c{n}{✗}'} ${say(L('Extremstellen', 'extrema'))}: ${say(L('deine', 'yours'))} ${skExt}, ${say(L('gesucht', 'wanted'))} ${want}`, size: fs(13, 12) });
          rows.push({ src: `\\c{m}{${say(L('Tipp: Wo f > 0, muss deine Kurve steigen.', 'Tip: where f > 0 your curve must rise.'))}}`, size: fs(12, 11), color: th().muted });
          return formulaCard(R, measure, k, say(L('Deine Skizze von F', 'Your sketch of F')), col.s(), rows);
        }
        const rt = rating;
        if (!rt) return 0;
        const grades = [L('noch weit weg', 'still far off'), L('ungefähr', 'roughly'), L('gut', 'good'), L('sehr gut', 'very good')];
        const gc = [col.neg(), col.F(), col.pos(), col.pos()][rt.grade]!;
        const meanC = cnt('c.sk.mean', rt.mean);
        const okN = rt.checks.filter((c) => c.ok).length;
        rows.push({ src: `\\b{${say(grades[rt.grade]!)}}`, size: fs(16, 14), color: gc, hl: gc });
        rows.push({ src: `${say(L('mittlere Abweichung', 'mean deviation'))} ≈ ${NV(meanC)}${unitI()}  \\c{m}{(${N(rt.rel * 100, 0)} %)}`, size: fs(13, 12) });
        rows.push({ src: `${say(L('Steigungen', 'slopes'))}: ${okN} ${say(L('von', 'of'))} ${rt.checks.length} ${say(L('Abschnitten passen', 'sections fit'))}`, size: fs(13, 12) });
        rows.push({ src: `${hitStart ? '\\c{p}{✓}' : '\\c{n}{✗}'} ${say(L('Anfangspunkt', 'initial point'))},  ${skExt === want ? '\\c{p}{✓}' : '\\c{n}{✗}'} ${say(L('Extremstellen', 'extrema'))} ${skExt}/${want}`, size: fs(12.5, 11.5) });
        rows.push({ src: `\\c{F}{${fullSrc(V.C).F}}`, size: fs(13, 12) });
        return formulaCard(R, measure, k, say(L('Vergleich mit der Lösung', 'Comparison with the solution')), gc, rows);
      };
    }

    /** Aufgabenmodus: Regeln als Spickzettel. */
    function tipsCard(k: Intro): CardFn {
      return (R, measure) => {
        const rows: RowSpec[] = [
          { src: `\\c{p}{f > 0} ⇒ ${say(L('F steigt', 'F increases'))},  \\c{n}{f < 0} ⇒ ${say(L('F fällt', 'F decreases'))}`, size: fs(12.5, 11.5) },
          { src: `\\c{m}{${say(L('f = 0 mit VZW', 'f = 0 with sign change'))}} ⇒ ${say(L('HP oder TP', 'max or min'))}`, size: fs(12.5, 11.5) },
          { src: `\\c{m}{${say(L('Extremum von f', 'extremum of f'))}} ⇒ \\c{t}{${say(L('Wendepunkt', 'inflection'))}}`, size: fs(12.5, 11.5) },
          { src: `\\c{m}{${say(L('|f| groß ⇒ F steil', '|f| large ⇒ F steep'))}}`, size: fs(12.5, 11.5) },
        ];
        return formulaCard(R, measure, k, say(L('Spickzettel', 'Cheat sheet')), col.s(), rows);
      };
    }

    /** Anwendung: Größen, Einheiten, Deutung an der aktuellen Stelle. */
    function appCard(V: View, k: Intro): CardFn {
      return (R, measure) => {
        const m = meta();
        if (!m) return 0;
        const g = surface.g;
        const pad = fs(14, 12);
        const sz = fs(12.5, 11.5);
        const md = mode();
        const xAt = md === 'trace' || md === 'back' ? V.x : md === 'feld' ? V.x0 : V.fn.x[1];
        const Fv = cnt('c.app.F', V.G(xAt));
        const fv = cnt('c.app.f', V.fn.f(xAt));
        const rate = `${m.f}: ${say(m.rate)} ${say(L('in', 'in'))} ${say(m.uF)}`;
        const amt = `${m.F}: ${say(m.amount)} ${say(L('in', 'in'))} ${say(m.uI)}`;
        const sentence =
          md === 'trace' || md === 'back'
            ? say(L(`Bei ${m.v} = ${N(xAt, 2)} ${say(m.uX)}: ${m.f} ≈ ${p.show ? NV(fv) : '?'} ${say(m.uF)}, ${m.F} ≈ ${p.show ? NV(Fv) : '?'} ${say(m.uI)}.`, `At ${m.v} = ${N(xAt, 2)} ${say(m.uX)}: ${m.f} ≈ ${p.show ? NV(fv) : '?'} ${say(m.uF)}, ${m.F} ≈ ${p.show ? NV(Fv) : '?'} ${say(m.uI)}.`))
            : md === 'feld'
              ? say(L(`Start (${m.v} = ${N(xAt, 2)} ${say(m.uX)}): ${m.F} = ${NV(Fv)} ${say(m.uI)}.`, `Start (${m.v} = ${N(xAt, 2)} ${say(m.uX)}): ${m.F} = ${NV(Fv)} ${say(m.uI)}.`))
              : say(L(`Am Ende (${m.v} = ${N(xAt, 2)} ${say(m.uX)}): ${m.F} ≈ ${p.show ? NV(Fv) : '?'} ${say(m.uI)}.`, `At the end (${m.v} = ${N(xAt, 2)} ${say(m.uX)}): ${m.F} ≈ ${p.show ? NV(Fv) : '?'} ${say(m.uI)}.`));
        const meas = (draw: boolean, y0: number) => {
          let y = y0;
          y += textBlock(R, y, rate, col.f(), sz, draw, 650) + 2;
          y += textBlock(R, y, amt, col.F(), sz, draw, 650) + 8;
          y += textBlock(R, y, sentence, th().text, sz + 0.5, draw, 650) + 6;
          y += textBlock(R, y, say(m.note), th().muted, sz - 0.5, draw, 500);
          return y - y0;
        };
        const barH = 12;
        const h = 36 + meas(false, 0) + barH + 22;
        if (measure) return h;
        card({ ...R, h }, col.F());
        cardTitle(R, say(m.title), col.F());
        g.save();
        g.globalAlpha *= ease.outCubic(k.stagger);
        let y = R.y + 36;
        const D = V.fn.x;
        const rr = rangeOf(V.G, D[0], D[1], 120);
        const lo = Math.min(0, rr.lo);
        const frac = clamp01((V.G(xAt) - lo) / Math.max(1e-9, rr.hi - lo));
        const x0 = R.x + pad;
        const x1 = R.x + R.w - pad;
        g.fillStyle = withAlpha(th().muted, 0.15);
        roundRect(g, x0, y, x1 - x0, barH, barH / 2);
        g.fill();
        const grad = g.createLinearGradient(x0, 0, x1, 0);
        grad.addColorStop(0, mixColor(col.F(), '#ffffff', 0.3));
        grad.addColorStop(1, col.F());
        g.fillStyle = grad;
        roundRect(g, x0, y, Math.max(barH, (x1 - x0) * frac), barH, barH / 2);
        if (frac > 0.002) g.fill();
        y += barH + 12;
        meas(true, y);
        g.restore();
        return h;
      };
    }

    function cardsFor(m: Mode, V: View, now: number, k: Intro): CardFn[] {
      const app = kind() === 'app';
      const tail = app ? appCard(V, k) : fnCard(V, k);
      if (m === 'trace') return [transferCard(V, k), rulesCard(V, k, false), tail];
      if (m === 'feld') return [ivpCard(V, k), famCard(V, k), tail];
      if (m === 'feat') return [tableCard(V, now, k), featCard(V, now, k), tail];
      if (m === 'area') return [piecesCard(V, now, k), tail];
      if (m === 'back') return [readCard(V, k), rulesCard(V, k, true), tail];
      return [sketchCard(V, k), tipsCard(k), ...(app ? [appCard(V, k)] : [])];
    }

    function drawColumn(C: Rect, V: View, now: number, k: Intro): void {
      const g = surface.g;
      const list = cardsFor(mode(), V, now, k);
      const gap = fs(10, 8);
      let fadeK = 1;
      if (cardFade !== null) {
        const t = (now - cardFade) / 520;
        if (t >= 1) cardFade = null;
        else fadeK = clamp01(t);
      }
      const two = !regions().wide && C.w >= 420;
      const place = (fn: CardFn, R: Rect, i: number) => {
        const hh = fn(R, true);
        if (hh <= 0 || hh > R.h + 1) return -1;
        g.save();
        const a = clamp01(k.cards * 1.6 - i * 0.25) * clamp01(fadeK * 2.2 - i * 0.35);
        g.globalAlpha *= ease.outCubic(a);
        g.translate((1 - ease.outCubic(a)) * 18, 0);
        fn({ ...R, h: Math.min(hh, R.h) }, false);
        g.restore();
        return hh;
      };
      if (two) {
        const cw = (C.w - gap) / 2;
        let yL = C.y;
        let yR = C.y;
        list.forEach((fn, i) => {
          if (i === 0) {
            const hh = place(fn, { x: C.x, y: C.y, w: C.w, h: C.h }, i);
            if (hh >= 0) yL = yR = C.y + hh + gap;
            return;
          }
          const leftCol = yL <= yR;
          const x = leftCol ? C.x : C.x + cw + gap;
          const y = leftCol ? yL : yR;
          const hh = place(fn, { x, y, w: cw, h: C.y + C.h - y }, i);
          if (hh < 0) return;
          if (leftCol) yL += hh + gap;
          else yR += hh + gap;
        });
        return;
      }
      let y = C.y;
      list.forEach((fn, i) => {
        const hh = place(fn, { x: C.x, y, w: C.w, h: C.y + C.h - y }, i);
        if (hh >= 0) y += hh + gap;
      });
    }

    /* ---------- Ergebnisse ---------- */
    function updateReadouts(): void {
      const fn = exactFn();
      const st = startExact();
      const C = constantFor(fn, st.x0, st.y0);
      const s = fnSrc();
      const src = fullSrc(null);
      const nm = names();
      const m = meta();
      const u = m ? ` ${nm.uI}` : '';
      const v = (t: string) => `<var>${t}</var>`;
      const hideF = antiHidden();
      const Fq = `${v(nm.F)}(${v(nm.v)}) = ?`;
      ctx.readout('fn', { html: `${toHtml(src.f)}<br>${hideF ? Fq : toHtml(src.F)}${s.note ? ` (${s.note})` : ''}` });
      const F0 = fn.F(st.x0);
      // Im Skizziermodus vor dem Aufdecken nur den Anfangswert nennen
      ctx.readout('ivp', {
        html:
          mode() === 'draw' && !p.sol
            ? `${v(nm.F)}(${N(st.x0, 2)}) = ${NV(st.y0)}${u}; ${v('C')} = ?; ${Fq}`
            : `${v(nm.F)}(${N(st.x0, 2)}) = ${NV(st.y0)}${u} ⇒ ${v('C')} = ${NV(st.y0)} − ${F0 < 0 ? `(${NV(F0)})` : NV(F0)} ${eq(C)} <strong>${NV(C)}</strong>; ${toHtml(fullSrc(C).F)}`,
      });
      const md = mode();
      if (md === 'trace' || md === 'back') {
        const x = lim(p.x);
        const fv = fn.f(x);
        ctx.readout('at', { html: `${v(nm.f)}(${N(x, 2)}) ${eq(fv)} ${NV(fv)}${m ? ` ${nm.uF}` : ''} = ${say(L('Steigung von', 'slope of'))} ${v(nm.F)} ${say(L('an der Stelle', 'at'))} ${N(x, 2)}; ${v(nm.F)}(${N(x, 2)}) ${eq(fn.F(x) + C)} ${NV(fn.F(x) + C)}${u}` });
      } else ctx.readout('at', null);
      if (md === 'feat' || md === 'back' || md === 'trace') {
        const list = (xs: number[]) => (xs.length ? xs.map((x) => N(x, 3)).join('; ') : '–');
        const hp = feat.zeros.filter((z) => z.sign < 0).map((z) => z.x);
        const tp = feat.zeros.filter((z) => z.sign > 0).map((z) => z.x);
        const tr = feat.zeros.filter((z) => z.sign === 0).map((z) => z.x);
        ctx.readout('feat', {
          html: `${say(L('Hochstellen', 'Maxima'))}: ${list(hp)}; ${say(L('Tiefstellen', 'Minima'))}: ${list(tp)}${tr.length ? `; ${say(L('Terrassenstellen', 'Saddle points'))}: ${list(tr)}` : ''}; ${say(L('Wendestellen', 'Inflection points'))}: ${list(feat.ext.map((e) => e.x))}`,
        });
      } else ctx.readout('feat', null);
      if (md === 'area') {
        const parts = pcs.map((pc) => `[${N(pc.a, 2)}; ${N(pc.b, 2)}]: ${fmt.signed(clean(pc.area, 3), 3)}`);
        const tot = pcs.reduce((sum, pc) => sum + pc.area, 0);
        ctx.readout('area', { html: `${parts.join('; ')} → ${say(L('Summe', 'sum'))} ${fmt.signed(clean(tot, 3), 3)}${u}` });
      } else ctx.readout('area', null);
      if (md === 'draw' && rating) {
        const grades = [L('noch weit weg', 'still far off'), L('ungefähr', 'roughly'), L('gut', 'good'), L('sehr gut', 'very good')];
        ctx.readout('dev', {
          html: p.sol
            ? `<strong>${say(grades[rating.grade]!)}</strong> · ${say(L('mittlere Abweichung', 'mean deviation'))} ${NV(rating.mean)}${u} · ${say(L('passende Abschnitte', 'fitting sections'))} ${rating.checks.filter((c) => c.ok).length}/${rating.checks.length}`
            : say(L('Lösung noch verdeckt – „Lösung aufdecken“ vergleicht deine Skizze.', 'Solution still hidden – “Reveal the solution” compares your sketch.')),
        });
      } else ctx.readout('dev', null);
      if (m) {
        const D = fn.x;
        const fe = feat.zeros.filter((z) => z.sign !== 0);
        const best = fe.length ? fe.map((z) => `${z.sign < 0 ? say(L('Maximum', 'maximum')) : say(L('Minimum', 'minimum'))} ${say(L('bei', 'at'))} ${m.v} ≈ ${N(z.x, 2)} ${say(m.uX)}: ${NV(fn.F(z.x) + C)}${u}`).join('; ') : say(L('kein Extremum im Bereich', 'no extremum in the range'));
        ctx.readout('sit', { html: `${say(m.amount)}: ${say(L('Start', 'start'))} ${NV(st.y0)}${u}, ${say(L('Ende', 'end'))} (${m.v} = ${N(D[1], 2)} ${say(m.uX)}) ${NV(fn.F(D[1]) + C)}${u}; ${best}` });
      } else ctx.readout('sit', null);
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
        const t = (now - morph.t0) / morph.dur;
        if (t >= 1) {
          morph = null;
          morphK = 1;
        } else {
          morphK = ease.inOutCubic(clamp01(t));
          anim = true;
        }
      }
      const chans: Chan[] = [X, X0, Y0, kFam, kFld, kFull, kSol, ...SK, ...Object.values(rng), ...Object.values(mw), ...Object.values(CC)];
      for (const c of chans) if (c.step(now, dt)) anim = true;
      if (sweep && now - sweep.t0 > sweep.dur) {
        sweep = null;
        X.jump(lim(p.x));
      }
      if (grow && now - grow.t0 > grow.dur) grow = null;
      if (wave && now - wave.t0 > wave.dur) wave = null;
      if (steps && now - steps.t0 > 5200) steps = null;
      if (stack && now - stack.t0 > stack.slot * stack.n + 500) stack = null;
      if (reveal && now - reveal.t0 > reveal.dur) reveal = null;
      if (sweep || grow || wave || steps || stack || reveal || intro !== null || dragging()) anim = true;
      const k = introState(now);
      const V = viewOf(now);
      // Spur: Bereich, den P schon überstrichen hat
      if (mode() === 'trace' || mode() === 'back') {
        vis.lo = Math.min(vis.lo, V.x);
        vis.hi = Math.max(vis.hi, V.x);
      }
      const R = regions();
      surface.begin();
      const g = surface.g;
      g.fillStyle = th().bg;
      g.fillRect(0, 0, surface.width, surface.height);
      g.save();
      g.globalAlpha = k.panel;
      g.translate(0, (1 - k.panel) * 10);
      drawTop(V, now, k);
      drawBottom(V, now, k);
      drawLink(V, k);
      g.restore();
      drawColumn(R.col, V, now, k);
      if (cardFade !== null || numsBusy) anim = true;
      if (anim) ctx.requestRender();
    }

    /* ---------- Übergänge ---------- */
    function startMorph(now: number, dur = 750): void {
      if (reduced()) {
        morph = null;
        morphK = 1;
        return;
      }
      morph = { from: shownFn(), t0: now, dur };
      morphK = 0;
    }

    function retargetAll(now: number, instant: boolean, source: string, changed: ReadonlySet<string>): void {
      const quick = source !== 'replace';
      // Koeffizienten
      COEF_KEYS.forEach((key) => {
        const v = p[key] as number;
        if (instant || reduced()) CC[key].jump(v);
        else if (quick) CC[key].follow(v, dragging() ? 0.05 : 0.16);
        else CC[key].glide(v, 700, 0, now);
      });
      // Skizze
      SK_KEYS.forEach((key, i) => {
        const v = p[key] as number;
        const c = SK[i]!;
        if (instant || reduced()) c.jump(v);
        else if (dragging()) c.follow(v, 0.04);
        else if (c.goal !== v) c.glide(v, 650, quick ? 0 : i * 60, now);
      });
      // Stelle x und Anfangspunkt
      const st = startExact();
      const x = lim(p.x);
      if (instant || reduced()) {
        X.jump(x);
        X0.jump(st.x0);
        Y0.jump(st.y0);
      } else if (source === 'replace' || changed.has('kind') || changed.has('app') || changed.has('fn')) {
        X.glide(x, 900, 120, now);
        X0.glide(st.x0, 800, 0, now);
        Y0.glide(st.y0, 800, 60, now);
      } else {
        const tau = dragging() ? 0.04 : 0.22;
        X.follow(x, tau);
        X0.follow(st.x0, tau);
        Y0.follow(st.y0, dragging() ? 0.04 : 0.3);
      }
      // Ansichten und Schalter
      for (const m of MODES) {
        const goal = m === mode() ? 1 : 0;
        if (instant || reduced()) mw[m].jump(goal);
        else if (mw[m].goal !== goal) mw[m].glide(goal, 560, goal ? 120 : 0, now);
      }
      const flags: [Chan, boolean][] = [
        [kFam, p.fam],
        [kFld, p.fld],
        [kFull, p.full],
        [kSol, p.sol],
      ];
      for (const [c, on] of flags) {
        if (instant || reduced()) c.jump(on ? 1 : 0);
        else c.follow(on ? 1 : 0, 0.2);
      }
    }

    function cancelStories(): void {
      if (sweep) {
        sweep = null;
        X.jump(lim(p.x));
      }
      grow = null;
      wave = null;
      steps = null;
      stack = null;
      reveal = null;
    }

    /** Skizze auf eine waagrechte Linie durch den Anfangswert setzen (nur bei eigener Eingabe). */
    function flatSketch(): void {
      const st = startExact();
      const vals: Record<string, number | boolean> = { sol: false };
      for (const key of SK_KEYS) vals[key] = Math.round(st.y0 * 100) / 100;
      setP(vals);
    }

    return {
      update(changed, source) {
        const now = performance.now();
        const fnChanged = changed.has('kind') || changed.has('fn') || changed.has('app');
        const user = source === 'input' || source === 'replace';
        if (user && [...changed].some((key) => key !== 'show' && key !== 'full' && key !== 'fam' && key !== 'fld')) {
          if (!(changed.size === 1 && changed.has('sol'))) cancelStories();
        }
        // Stelle x im Bereich halten (nur bei eigener Eingabe)
        if (source === 'input') {
          const x = lim(p.x);
          if (Math.abs(x - p.x) > 1e-9) setP({ x });
          if (kind() === 'math') {
            const x0 = lim(p.x0);
            if (Math.abs(x0 - p.x0) > 1e-9) setP({ x0 });
          }
          // neue Funktion oder Aufgabenmodus: Skizze neu beginnen
          if (mode() === 'draw' && (fnChanged || changed.has('mode') || changed.has('x0') || changed.has('c') || changed.has('dc') || COEF_KEYS.some((key) => changed.has(key)))) flatSketch();
          if (fnChanged && kind() === 'app') {
            const D = exactFn().x;
            setP({ x: D[0] });
          }
        }
        const instant = source === 'init';
        if (fnChanged && !instant) startMorph(now, source === 'replace' ? 850 : 750);
        retargetAll(now, instant, source, changed);
        if (changed.has('mode') && !instant && mode() !== prevMode && !reduced()) cardFade = now;
        // Spur neu beginnen
        if (instant || fnChanged || (changed.has('mode') && mode() !== prevMode)) {
          const D = exactFn().x;
          vis.lo = D[0];
          vis.hi = lim(p.x);
          if (vis.hi < vis.lo) vis.hi = vis.lo;
        }
        const fn = exactFn();
        feat = features(fn);
        table = signTable(fn);
        pcs = pieces(fn);
        const st = startExact();
        rating = rateSketch(fn, constantFor(fn, st.x0, st.y0), fn.nodes, SK_KEYS.map((key) => p[key] as number));
        retargetRanges(now, instant);
        if (source === 'init' && !reduced()) {
          intro = now;
          // Einstieg: P läuft vom linken Rand bis zur Stelle x, F entsteht mit Spur
          const D = fn.x;
          if (mode() === 'trace' || mode() === 'back') {
            X.jump(D[0]);
            X.glide(lim(p.x), 1500, 1000, now);
            vis.lo = D[0];
            vis.hi = D[0];
          }
        }
        prevMode = mode();
        updateReadouts();
        ctx.requestRender();
      },

      action(id) {
        if (ctx.locked) return;
        const now = performance.now();
        cancelStories();
        const fn = exactFn();
        const D = fn.x;
        if (id === 'sweep' || id === 'tang') {
          const to = Math.round(D[1] * 20) / 20;
          vis.lo = D[0];
          vis.hi = D[0];
          if (!reduced()) sweep = { t0: now, dur: SWEEP_MS, from: D[0], to };
          else {
            vis.hi = D[1];
          }
          setP({ x: to });
        } else if (id === 'clear') {
          vis.lo = X.v;
          vis.hi = X.v;
        } else if (id === 'grow') {
          if (!reduced()) grow = { t0: now, dur: 2600 };
        } else if (id === 'wave') {
          if (!reduced()) wave = { t0: now, dur: 4200, amp: 2 * famSpacing(fn) };
        } else if (id === 'steps') {
          if (!reduced()) steps = { t0: now };
        } else if (id === 'stack') {
          if (!reduced() && pcs.length) stack = { t0: now, slot: 1100, n: pcs.length };
        } else if (id === 'reveal') {
          if (!reduced()) reveal = { t0: now, dur: 1700 };
          // Lösung aufdecken zeigt auch die Werte im Bild (Aufgabenlink mit show=0)
          setP({ sol: true, show: true });
        } else if (id === 'reset') {
          flatSketch();
        }
        ctx.requestRender();
      },

      render,
      destroy: () => surface.destroy(),
    };
  },
});

/** Indizes 0 … 6 der Stützstellen der gezeichneten Funktion. */
const OWN_IDX = [0, 1, 2, 3, 4, 5, 6];
