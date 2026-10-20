import { defineSimulation, ease, mixColor, Plot, prefersReducedMotion, roundRect, Surface, withAlpha, type Rect } from '../../../sim-core';
import { formula, type FormulaBox, type FormulaStyle } from './formula';
import {
  APPS,
  chainFn,
  DEFAULT_COEFFS,
  dq,
  features,
  mathFn,
  oneSided,
  powFn,
  PROD,
  productIncrement,
  quotientTable,
  rangeOf,
  rateSketch,
  secantEnds,
  signTable,
  spline,
  SUM,
  type AppKey,
  type Coeffs,
  type Features,
  type Fn,
  type FnKey,
  type Rating,
  type RuleKey,
  type Side,
  type SignInterval,
} from './model';

const L = (de: string, en: string) => ({ de, en });
type Txt = { de: string; en: string };
/** Deutscher Text mit Dezimalkomma → englische Fassung mit Dezimalpunkt. */
const D = (de: string): Txt => ({ de, en: de.replace(/(\d),(\d)/g, '$1.$2') });
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const clamp01 = (t: number) => clamp(t, 0, 1);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const TAU = Math.PI * 2;

type Mode = 'trace' | 'sek' | 'feat' | 'draw' | 'rule';
type Kind = 'math' | 'app';
type Lng = 'de' | 'en';
const MODES: Mode[] = ['trace', 'sek', 'feat', 'draw', 'rule'];
const COEF_KEYS = ['pa', 'pb', 'pc', 'k3', 'k2', 'k1', 'k0', 'u4', 'u3', 'u2', 'u1', 'u0', 'sa', 'sb', 'ea', 'eb', 'la', 'wa', 'aa', 'ab', 'ia', 'w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'w7'] as const;
type CoefKey = (typeof COEF_KEYS)[number];
const SK_KEYS = ['s1', 's2', 's3', 's4', 's5', 's6', 's7'] as const;
const OWN_IDX = [0, 1, 2, 3, 4, 5, 6];
const SWEEP_MS = 5600;
const H_MIN = 0.001;
/** Schritte der Tabelle „h → 0“. */
const H_TAB = [1, 0.5, 0.1, 0.01, 0.001];

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

/** Texte und Einheiten eines Alltagsbeispiels. */
interface AppMeta {
  title: Txt;
  /** Name der Variablen (t oder x) und ihre Einheit */
  v: string;
  uX: Txt;
  /** Bestand f, Änderungsrate f′ und deren Änderung f″: Namen und Einheiten */
  f: string;
  uF: Txt;
  d: string;
  uD: Txt;
  dd: string;
  uDD: Txt;
  /** rechte Seiten der Terme (Kurzschrift) */
  fSrc: Txt;
  dSrc: Txt;
  ddSrc: Txt;
  /** Bedeutung der drei Größen */
  fName: Txt;
  dName: Txt;
  ddName: Txt;
  note: Txt;
  /** Zusatz zur Änderungsrate: km/h oder Steigung in % */
  extra?: 'kmh' | 'pct';
}

const APP_META: Record<AppKey, AppMeta> = {
  car: {
    title: L('Auto: Weg → Geschwindigkeit', 'Car: distance → velocity'),
    v: 't',
    uX: L('s', 's'),
    f: 's',
    uF: L('m', 'm'),
    d: 'v',
    uD: L('m/s', 'm/s'),
    dd: 'a',
    uDD: L('m/s²', 'm/s²'),
    fSrc: D('−0,05t³ + 1,5t²'),
    dSrc: D('−0,15t² + 3t'),
    ddSrc: D('−0,3t + 3'),
    fName: L('zurückgelegter Weg', 'distance travelled'),
    dName: L('Geschwindigkeit', 'velocity'),
    ddName: L('Beschleunigung', 'acceleration'),
    note: L('Das Auto fährt an und bremst bis zum Stillstand. Nach 10 s fährt es am schnellsten (15 m/s = 54 km/h) – dort ist a = 0 und s hat einen Wendepunkt.', 'The car starts off and brakes to a standstill. After 10 s it is fastest (15 m/s = 54 km/h) – there a = 0 and s has a point of inflection.'),
    extra: 'kmh',
  },
  sprint: {
    title: L('100-m-Lauf: Weg → Geschwindigkeit', '100 m sprint: distance → velocity'),
    v: 't',
    uX: L('s', 's'),
    f: 's',
    uF: L('m', 'm'),
    d: 'v',
    uD: L('m/s', 'm/s'),
    dd: 'a',
    uDD: L('m/s²', 'm/s²'),
    fSrc: D('11,5 · (t − 1,25 · (1 − \\t{e}^{−0,8t}))'),
    dSrc: D('11,5 · (1 − \\t{e}^{−0,8t})'),
    ddSrc: D('9,2 · \\t{e}^{−0,8t}'),
    fName: L('Weg ab dem Start', 'distance from the start'),
    dName: L('Geschwindigkeit', 'velocity'),
    ddName: L('Beschleunigung', 'acceleration'),
    note: L('Vereinfachtes Modell einer Spitzenläuferin: Am Start beschleunigt sie mit über 9 m/s², dann wird sie kaum noch schneller (fast 11,5 m/s ≈ 41 km/h). Nach etwa 9,9 s ist sie im Ziel.', 'Simplified model of a top sprinter: at the start she accelerates at more than 9 m/s², then she hardly gets any faster (almost 11.5 m/s ≈ 41 km/h). After about 9.9 s she crosses the line.'),
    extra: 'kmh',
  },
  lift: {
    title: L('Fahrstuhl: Höhe → Geschwindigkeit', 'Lift: height → velocity'),
    v: 't',
    uX: L('s', 's'),
    f: 'h',
    uF: L('m', 'm'),
    d: 'v',
    uD: L('m/s', 'm/s'),
    dd: 'a',
    uDD: L('m/s²', 'm/s²'),
    fSrc: D('10 · (1 − \\t{cos}(\\f{π}{16}t))'),
    dSrc: D('\\f{5π}{8} · \\t{sin}(\\f{π}{16}t)'),
    ddSrc: D('\\f{5π²}{128} · \\t{cos}(\\f{π}{16}t)'),
    fName: L('Höhe der Kabine', 'height of the car'),
    dName: L('Geschwindigkeit', 'velocity'),
    ddName: L('Beschleunigung', 'acceleration'),
    note: L('Vom Erdgeschoss in den 5. Stock (20 m) in 16 s, sanft anfahren und bremsen. In der Mitte der Fahrt ist der Fahrstuhl am schnellsten – dort ist die Beschleunigung null.', 'From the ground floor to the 5th floor (20 m) in 16 s, starting and braking gently. Halfway the lift is fastest – there the acceleration is zero.'),
  },
  ball: {
    title: L('Hochwurf: Höhe → Geschwindigkeit', 'Vertical throw: height → velocity'),
    v: 't',
    uX: L('s', 's'),
    f: 'h',
    uF: L('m', 'm'),
    d: 'v',
    uD: L('m/s', 'm/s'),
    dd: 'a',
    uDD: L('m/s²', 'm/s²'),
    fSrc: D('1,5 + 12t − 4,905t²'),
    dSrc: D('12 − 9,81t'),
    ddSrc: D('−9,81'),
    fName: L('Höhe des Balls', 'height of the ball'),
    dName: L('Geschwindigkeit (+ aufwärts)', 'velocity (+ upwards)'),
    ddName: L('Beschleunigung', 'acceleration'),
    note: L('Ein Ball wird aus 1,5 m Höhe mit 12 m/s senkrecht nach oben geworfen (ohne Luftwiderstand). Im höchsten Punkt ist v = 0; die Beschleunigung ist immer −9,81 m/s².', 'A ball is thrown straight up from 1.5 m at 12 m/s (no air resistance). At the highest point v = 0; the acceleration is always −9.81 m/s².'),
  },
  temp: {
    title: L('Temperatur über den Tag', 'Temperature during the day'),
    v: 't',
    uX: L('h (Uhrzeit)', 'h (time of day)'),
    f: 'T',
    uF: L('°C', '°C'),
    d: 'T′',
    uD: L('K/h', 'K/h'),
    dd: 'T″',
    uDD: L('K/h²', 'K/h²'),
    fSrc: L('14 + 6 · \\t{sin}(\\f{π}{12}(t − 9))', '14 + 6 · \\t{sin}(\\f{π}{12}(t − 9))'),
    dSrc: L('\\f{π}{2} · \\t{cos}(\\f{π}{12}(t − 9))', '\\f{π}{2} · \\t{cos}(\\f{π}{12}(t − 9))'),
    ddSrc: L('−\\f{π²}{24} · \\t{sin}(\\f{π}{12}(t − 9))', '−\\f{π²}{24} · \\t{sin}(\\f{π}{12}(t − 9))'),
    fName: L('Lufttemperatur', 'air temperature'),
    dName: L('Änderungsrate der Temperatur', 'rate of change of the temperature'),
    ddName: L('Änderung der Änderungsrate', 'change of the rate of change'),
    note: L('Sommertag (vereinfachtes Modell): am kältesten um 3 Uhr (8 °C), am wärmsten um 15 Uhr (20 °C). Am schnellsten wird es um 9 Uhr wärmer.', 'Summer day (simplified model): coldest at 3 a.m. (8 °C), warmest at 3 p.m. (20 °C). It warms up fastest at 9 a.m.'),
  },
  pop: {
    title: L('Epidemie: Fälle → neue Fälle pro Tag', 'Epidemic: cases → new cases per day'),
    v: 't',
    uX: L('Tage', 'days'),
    f: 'N',
    uF: L('Fälle', 'cases'),
    d: 'N′',
    uD: L('Fälle/Tag', 'cases/day'),
    dd: 'N″',
    uDD: L('Fälle/Tag²', 'cases/day²'),
    fSrc: L('\\f{10 000}{1 + 199 · \\t{e}^{−0,4t}}', '\\f{10,000}{1 + 199 · \\t{e}^{−0.4t}}'),
    dSrc: L('0,4 · N · (1 − \\f{N}{10 000})', '0.4 · N · (1 − \\f{N}{10,000})'),
    ddSrc: L('0,4 · N′ · (1 − \\f{2N}{10 000})', '0.4 · N′ · (1 − \\f{2N}{10,000})'),
    fName: L('bisher gemeldete Fälle', 'cases reported so far'),
    dName: L('neue Fälle pro Tag', 'new cases per day'),
    ddName: L('Zu- oder Abnahme der neuen Fälle', 'growth or decline of new cases'),
    note: L('Logistisches Modell: 50 Fälle am Anfang, höchstens 10 000. Die meisten neuen Fälle pro Tag gibt es am Wendepunkt nach gut 13 Tagen – danach flacht die Kurve ab.', 'Logistic model: 50 cases at the start, at most 10,000. The most new cases per day occur at the point of inflection after about 13 days – afterwards the curve flattens.'),
  },
  cost: {
    title: L('Kosten → Grenzkosten', 'Cost → marginal cost'),
    v: 'x',
    uX: L('ME', 'units'),
    f: 'K',
    uF: L('GE', 'MU'),
    d: 'K′',
    uD: L('GE/ME', 'MU/unit'),
    dd: 'K″',
    uDD: L('GE/ME²', 'MU/unit²'),
    fSrc: D('0,1x³ − 1,5x² + 10x + 20'),
    dSrc: D('0,3x² − 3x + 10'),
    ddSrc: D('0,6x − 3'),
    fName: L('Gesamtkosten', 'total cost'),
    dName: L('Grenzkosten', 'marginal cost'),
    ddName: L('Änderung der Grenzkosten', 'change of the marginal cost'),
    note: L('Fixkosten 20 GE. Die Grenzkosten geben ungefähr an, was eine weitere Mengeneinheit kostet. Am Minimum der Grenzkosten (x = 5) wechselt K die Krümmung (Kostenkehre).', 'Fixed cost 20 MU. The marginal cost tells roughly what one more unit costs. At the minimum of the marginal cost (x = 5) K changes its curvature.'),
  },
  hike: {
    title: L('Wanderung: Höhenprofil → Steigung', 'Hike: elevation profile → gradient'),
    v: 'x',
    uX: L('km', 'km'),
    f: 'h',
    uF: L('m', 'm'),
    d: 'h′',
    uD: L('m/km', 'm/km'),
    dd: 'h″',
    uDD: L('m/km²', 'm/km²'),
    fSrc: L('800 + 400 · \\t{e}^{−\\f{(x − 5)²}{4}}', '800 + 400 · \\t{e}^{−\\f{(x − 5)²}{4}}'),
    dSrc: L('−200 · (x − 5) · \\t{e}^{−\\f{(x − 5)²}{4}}', '−200 · (x − 5) · \\t{e}^{−\\f{(x − 5)²}{4}}'),
    ddSrc: L('(100 · (x − 5)² − 200) · \\t{e}^{−\\f{(x − 5)²}{4}}', '(100 · (x − 5)² − 200) · \\t{e}^{−\\f{(x − 5)²}{4}}'),
    fName: L('Höhe über dem Meer', 'height above sea level'),
    dName: L('Steigung (100 m/km = 10 %)', 'gradient (100 m/km = 10 %)'),
    ddName: L('Änderung der Steigung', 'change of the gradient'),
    note: L('Gipfel auf 1200 m nach 5 km. 100 m Höhe auf 1 km Weg sind 10 % Steigung. Am steilsten ist der Weg an den Wendepunkten des Profils.', 'Summit at 1200 m after 5 km. 100 m of height over 1 km is a 10 % gradient. The path is steepest at the inflection points of the profile.'),
    extra: 'pct',
  },
  tank: {
    title: L('Badewanne: Wassermenge → Zufluss', 'Bathtub: amount of water → inflow'),
    v: 't',
    uX: L('min', 'min'),
    f: 'V',
    uF: L('L', 'L'),
    d: 'V′',
    uD: L('L/min', 'L/min'),
    dd: 'V″',
    uDD: L('L/min²', 'L/min²'),
    fSrc: D('75 · (1 − \\t{cos}(\\f{π}{10}t))'),
    dSrc: D('7,5π · \\t{sin}(\\f{π}{10}t)'),
    ddSrc: D('0,75π² · \\t{cos}(\\f{π}{10}t)'),
    fName: L('Wasser in der Wanne', 'water in the tub'),
    dName: L('Zufluss (negativ: Abfluss)', 'inflow (negative: outflow)'),
    ddName: L('Änderung des Zuflusses', 'change of the inflow'),
    note: L('Erst wird die Wanne gefüllt (V′ > 0), nach 10 min ist sie mit 150 L voll und wird wieder abgelassen (V′ < 0).', 'First the tub is filled (V′ > 0); after 10 min it is full with 150 L and is drained again (V′ < 0).'),
  },
};

/**
 * Ableitungsfunktion grafisch: Aus dem Graphen von f entsteht der Graph von f′
 * (und f″). Fünf Ansichten: Tangente läuft (Steigungsdreieck mit Δx, f′ und f″
 * entstehen als Spur), Sekante → Tangente (h → 0, Differenzenquotient von links,
 * rechts und beidseitig, Konvergenzdiagramm, Knick bei |x|), Merkmale f ↔ f′ ↔ f″
 * (Monotonie, Krümmung, Hoch-, Tief-, Wende- und Sattelpunkte, Vorzeichentabelle),
 * ein Aufgabenmodus („Skizziere f′“ mit sieben ziehbaren Punkten und Vergleich)
 * und die Ableitungsregeln anschaulich (Faktor-, Summen-, Potenz-, Produkt- und
 * Kettenregel). Elf mathematische Funktionen mit Koeffizienten und neun
 * Alltagsbeispiele mit Einheiten.
 */
export default defineSimulation({
  id: 'ableitungsfunktion',
  dragHint: true,
  layout: { aspect: 1.55, aspectNarrow: 0.4 },
  groups: [
    { id: 'coef', label: L('Koeffizienten von f', 'Coefficients of f') },
    { id: 'own', label: L('Eigene Funktion f: Werte an x = −3 … 3', 'Own function f: values at x = −3 … 3') },
    { id: 'sk', label: L('Deine Skizze von f′: Höhen der sieben Punkte', 'Your sketch of f′: heights of the seven points') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Ansicht', 'View'),
      options: [
        { value: 'trace', label: L('Tangente läuft: f′ entsteht', 'Running tangent: f′ appears') },
        { value: 'sek', label: L('Sekante → Tangente (h → 0)', 'Secant → tangent (h → 0)') },
        { value: 'feat', label: L('Merkmale f, f′, f″', 'Features f, f′, f″') },
        { value: 'draw', label: L('Aufgabe: f′ skizzieren', 'Task: sketch f′') },
        { value: 'rule', label: L('Ableitungsregeln', 'Rules of differentiation') },
      ],
      default: 'trace',
    },
    {
      key: 'rule',
      type: 'choice',
      label: L('Regel', 'Rule'),
      options: [
        { value: 'fak', label: L('Faktorregel', 'Constant multiple rule') },
        { value: 'sum', label: L('Summenregel', 'Sum rule') },
        { value: 'pow', label: L('Potenzregel', 'Power rule') },
        { value: 'prod', label: L('Produktregel', 'Product rule') },
        { value: 'chain', label: L('Kettenregel', 'Chain rule') },
      ],
      default: 'fak',
      visibleIf: (v) => v.mode === 'rule',
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
      visibleIf: (v) => v.mode !== 'rule' || v.rule === 'fak',
    },
    {
      key: 'fn',
      type: 'choice',
      label: L('Funktion f', 'Function f'),
      options: [
        { value: 'par', label: L('Parabel', 'Parabola') },
        { value: 'cub', label: L('Polynom 3. Grades', 'Cubic') },
        { value: 'quart', label: L('Polynom 4. Grades', 'Quartic') },
        { value: 'sin', label: L('Sinus', 'Sine') },
        { value: 'cos', label: L('Kosinus', 'Cosine') },
        { value: 'exp', label: L('e-Funktion', 'Exponential') },
        { value: 'ln', label: L('ln x', 'ln x') },
        { value: 'sqrt', label: L('√x', '√x') },
        { value: 'abs', label: L('Betrag |x| (Knick)', 'Absolute value |x| (kink)') },
        { value: 'inv', label: L('1/x (Polstelle)', '1/x (pole)') },
        { value: 'own', label: L('selbst gezeichnet', 'drawn by you') },
      ],
      default: 'cub',
      visibleIf: (v) => v.kind === 'math' && (v.mode !== 'rule' || v.rule === 'fak'),
    },
    {
      key: 'app',
      type: 'choice',
      label: L('Beispiel aus dem Alltag', 'Everyday example'),
      options: [
        { value: 'car', label: L('Auto', 'Car') },
        { value: 'sprint', label: L('100-m-Lauf', '100 m sprint') },
        { value: 'lift', label: L('Fahrstuhl', 'Lift') },
        { value: 'ball', label: L('Hochwurf', 'Vertical throw') },
        { value: 'temp', label: L('Temperatur am Tag', 'Daily temperature') },
        { value: 'pop', label: L('Epidemie', 'Epidemic') },
        { value: 'cost', label: L('Kosten', 'Cost') },
        { value: 'hike', label: L('Wanderung', 'Hike') },
        { value: 'tank', label: L('Badewanne', 'Bathtub') },
      ],
      default: 'car',
      visibleIf: (v) => v.kind === 'app' && (v.mode !== 'rule' || v.rule === 'fak'),
    },
    { key: 'pa', type: 'number', group: 'coef', label: L('Koeffizient a bei x²', 'Coefficient a of x²'), help: L('f(x) = a · x² + b · x + c', 'f(x) = a · x² + b · x + c'), min: -3, max: 3, step: 0.05, default: 0.5, visibleIf: (v) => v.kind === 'math' && v.fn === 'par' && (v.mode !== 'rule' || v.rule === 'fak') },
    { key: 'pb', type: 'number', group: 'coef', label: L('Koeffizient b bei x', 'Coefficient b of x'), min: -4, max: 4, step: 0.1, default: 0, visibleIf: (v) => v.kind === 'math' && v.fn === 'par' && (v.mode !== 'rule' || v.rule === 'fak') },
    { key: 'pc', type: 'number', group: 'coef', label: L('Absolutglied c', 'Constant term c'), help: L('Verschiebt f nach oben – f′ ändert sich nicht.', 'Shifts f upwards – f′ does not change.'), min: -4, max: 4, step: 0.1, default: -2, visibleIf: (v) => v.kind === 'math' && v.fn === 'par' && (v.mode !== 'rule' || v.rule === 'fak') },
    { key: 'k3', type: 'number', group: 'coef', label: L('Koeffizient bei x³', 'Coefficient of x³'), help: L('f(x) = k₃x³ + k₂x² + k₁x + k₀', 'f(x) = k₃x³ + k₂x² + k₁x + k₀'), min: -1, max: 1, step: 0.05, default: 0.25, visibleIf: (v) => v.kind === 'math' && v.fn === 'cub' && (v.mode !== 'rule' || v.rule === 'fak') },
    { key: 'k2', type: 'number', group: 'coef', label: L('Koeffizient bei x²', 'Coefficient of x²'), min: -3, max: 3, step: 0.05, default: 0, visibleIf: (v) => v.kind === 'math' && v.fn === 'cub' && (v.mode !== 'rule' || v.rule === 'fak') },
    { key: 'k1', type: 'number', group: 'coef', label: L('Koeffizient bei x', 'Coefficient of x'), min: -4, max: 4, step: 0.1, default: -1.5, visibleIf: (v) => v.kind === 'math' && v.fn === 'cub' && (v.mode !== 'rule' || v.rule === 'fak') },
    { key: 'k0', type: 'number', group: 'coef', label: L('Absolutglied', 'Constant term'), min: -4, max: 4, step: 0.1, default: 0, visibleIf: (v) => v.kind === 'math' && v.fn === 'cub' && (v.mode !== 'rule' || v.rule === 'fak') },
    { key: 'u4', type: 'number', group: 'coef', label: L('Koeffizient bei x⁴', 'Coefficient of x⁴'), help: L('f(x) = u₄x⁴ + u₃x³ + u₂x² + u₁x + u₀', 'f(x) = u₄x⁴ + u₃x³ + u₂x² + u₁x + u₀'), min: -0.5, max: 0.5, step: 0.01, default: 0.1, visibleIf: (v) => v.kind === 'math' && v.fn === 'quart' && (v.mode !== 'rule' || v.rule === 'fak') },
    { key: 'u3', type: 'number', group: 'coef', label: L('Koeffizient bei x³', 'Coefficient of x³'), min: -1, max: 1, step: 0.05, default: 0, visibleIf: (v) => v.kind === 'math' && v.fn === 'quart' && (v.mode !== 'rule' || v.rule === 'fak') },
    { key: 'u2', type: 'number', group: 'coef', label: L('Koeffizient bei x²', 'Coefficient of x²'), min: -3, max: 3, step: 0.05, default: -1, visibleIf: (v) => v.kind === 'math' && v.fn === 'quart' && (v.mode !== 'rule' || v.rule === 'fak') },
    { key: 'u1', type: 'number', group: 'coef', label: L('Koeffizient bei x', 'Coefficient of x'), min: -4, max: 4, step: 0.1, default: 0, visibleIf: (v) => v.kind === 'math' && v.fn === 'quart' && (v.mode !== 'rule' || v.rule === 'fak') },
    { key: 'u0', type: 'number', group: 'coef', label: L('Absolutglied', 'Constant term'), min: -4, max: 4, step: 0.1, default: 1, visibleIf: (v) => v.kind === 'math' && v.fn === 'quart' && (v.mode !== 'rule' || v.rule === 'fak') },
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
      visibleIf: (v) => v.kind === 'math' && (v.fn === 'sin' || v.fn === 'cos') && (v.mode !== 'rule' || v.rule === 'fak'),
    },
    { key: 'sb', type: 'number', group: 'coef', label: L('Frequenz b', 'Frequency b'), min: 0.2, max: 3, step: 0.1, default: 1, visibleIf: (v) => v.kind === 'math' && (v.fn === 'sin' || v.fn === 'cos') && (v.mode !== 'rule' || v.rule === 'fak') },
    { key: 'ea', type: 'number', group: 'coef', label: L('Faktor c', 'Factor c'), help: L('f(x) = c · e^(kx)', 'f(x) = c · e^(kx)'), min: -3, max: 3, step: 0.1, default: 1, visibleIf: (v) => v.kind === 'math' && v.fn === 'exp' && (v.mode !== 'rule' || v.rule === 'fak') },
    { key: 'eb', type: 'number', group: 'coef', label: L('Wachstumskonstante k', 'Growth constant k'), min: -1.5, max: 1.5, step: 0.05, default: 1, visibleIf: (v) => v.kind === 'math' && v.fn === 'exp' && (v.mode !== 'rule' || v.rule === 'fak') },
    { key: 'la', type: 'number', group: 'coef', label: L('Faktor a', 'Factor a'), help: L('f(x) = a · ln x für x > 0', 'f(x) = a · ln x for x > 0'), min: -3, max: 3, step: 0.1, default: 1, visibleIf: (v) => v.kind === 'math' && v.fn === 'ln' && (v.mode !== 'rule' || v.rule === 'fak') },
    { key: 'wa', type: 'number', group: 'coef', label: L('Faktor a', 'Factor a'), help: L('f(x) = a · √x für x ≥ 0', 'f(x) = a · √x for x ≥ 0'), min: -3, max: 3, step: 0.1, default: 1, visibleIf: (v) => v.kind === 'math' && v.fn === 'sqrt' && (v.mode !== 'rule' || v.rule === 'fak') },
    { key: 'aa', type: 'number', group: 'coef', label: L('Faktor a', 'Factor a'), help: L('f(x) = a · |x − s|', 'f(x) = a · |x − s|'), min: -2, max: 2, step: 0.1, default: 1, visibleIf: (v) => v.kind === 'math' && v.fn === 'abs' && (v.mode !== 'rule' || v.rule === 'fak') },
    { key: 'ab', type: 'number', group: 'coef', label: L('Knickstelle s', 'Kink position s'), min: -3, max: 3, step: 0.1, default: 0, visibleIf: (v) => v.kind === 'math' && v.fn === 'abs' && (v.mode !== 'rule' || v.rule === 'fak') },
    { key: 'ia', type: 'number', group: 'coef', label: L('Zähler c', 'Numerator c'), help: L('f(x) = c/x für x ≠ 0', 'f(x) = c/x for x ≠ 0'), min: -3, max: 3, step: 0.1, default: 1, visibleIf: (v) => v.kind === 'math' && v.fn === 'inv' && (v.mode !== 'rule' || v.rule === 'fak') },
    ...([1, 2, 3, 4, 5, 6, 7] as const).map((k) => ({
      key: `w${k}` as `w${typeof k}`,
      type: 'number' as const,
      group: 'own',
      label: L(`f(${k - 4 < 0 ? '−' : ''}${Math.abs(k - 4)})`, `f(${k - 4 < 0 ? '−' : ''}${Math.abs(k - 4)})`),
      help: k === 1 ? L('Auch die blauen Punkte im oberen Bild ziehen.', 'You can also drag the blue points in the upper picture.') : undefined,
      min: -3,
      max: 3,
      step: 0.05,
      default: [-1, 1, 1.5, 0.5, -1, -0.5, 1][k - 1]!,
      visibleIf: (v: Record<string, unknown>) => v.kind === 'math' && v.fn === 'own' && (v.mode !== 'rule' || v.rule === 'fak'),
    })),
    {
      key: 'x',
      type: 'number',
      label: L('Stelle x von P', 'Position x of P'),
      help: L('Auch P auf dem Graphen ziehen.', 'You can also drag P along the graph.'),
      min: -6.5,
      max: 30,
      step: 0.05,
      default: -2.5,
      visibleIf: (v) => v.mode !== 'feat' && v.mode !== 'draw',
    },
    {
      key: 'dx',
      type: 'number',
      label: L('Breite Δx des Steigungsdreiecks', 'Width Δx of the slope triangle'),
      help: L('Höhe Δy = f′(x) · Δx. Bei Δx = 1 ist die Höhe genau die Steigung.', 'Height Δy = f′(x) · Δx. For Δx = 1 the height is exactly the slope.'),
      min: 0.1,
      max: 4,
      step: 0.05,
      default: 1,
      visibleIf: (v) => (v.mode === 'trace' && v.tri === true) || (v.mode === 'rule' && v.rule !== 'sum'),
    },
    {
      key: 'h',
      type: 'number',
      label: L('Abstand h von P zu Q', 'Distance h from P to Q'),
      help: L('Auch Q oben oder den Punkt im unteren Bild ziehen.', 'You can also drag Q above or the point in the lower picture.'),
      min: H_MIN,
      max: 3,
      step: 0.001,
      default: 1,
      visibleIf: (v) => v.mode === 'sek',
    },
    {
      key: 'side',
      type: 'choice',
      label: L('Differenzenquotient', 'Difference quotient'),
      options: [
        { value: 'r', label: L('rechts: Q = x + h', 'right: Q = x + h') },
        { value: 'l', label: L('links: Q = x − h', 'left: Q = x − h') },
        { value: 'c', label: L('beidseitig', 'symmetric') },
      ],
      default: 'r',
      visibleIf: (v) => v.mode === 'sek',
    },
    {
      key: 'rk',
      type: 'number',
      label: L('Faktor a bzw. innerer Faktor k', 'Factor a or inner factor k'),
      help: L('Faktorregel: a · f(x). Kettenregel: sin(k · x).', 'Constant multiple rule: a · f(x). Chain rule: sin(k · x).'),
      min: -3,
      max: 3,
      step: 0.1,
      default: 2,
      visibleIf: (v) => v.mode === 'rule' && (v.rule === 'fak' || v.rule === 'chain'),
    },
    { key: 'pn', type: 'number', label: L('Hochzahl n', 'Exponent n'), help: L('f(x) = xⁿ; für n < 0 nur x > 0.', 'f(x) = xⁿ; for n < 0 only x > 0.'), min: -2, max: 5, step: 1, default: 3, visibleIf: (v) => v.mode === 'rule' && v.rule === 'pow' },
    ...([1, 2, 3, 4, 5, 6, 7] as const).map((k) => ({
      key: `s${k}` as `s${typeof k}`,
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
    { key: 'full', type: 'boolean', group: 'view', label: L('Graph von f′ ganz zeigen', 'Show all of the graph of f′'), help: L('Aus: f′ entsteht nur dort, wo P schon war.', 'Off: f′ only appears where P has been.'), default: false, visibleIf: (v) => v.mode === 'trace' },
    { key: 'marks', type: 'boolean', group: 'view', label: L('Extrem- und Wendestellen markieren', 'Mark extrema and inflection points'), default: true, visibleIf: (v) => v.mode === 'trace' || v.mode === 'draw' },
    { key: 'd2', type: 'boolean', group: 'view', label: L('Zweite Ableitung f″ zeigen', 'Show the second derivative f″'), help: L('Drittes Bild: die Steigung von f′.', 'Third picture: the slope of f′.'), default: false, visibleIf: (v) => v.mode === 'trace' || v.mode === 'feat' },
    { key: 'tri', type: 'boolean', group: 'view', label: L('Steigungsdreieck', 'Slope triangle'), default: true, visibleIf: (v) => v.mode === 'trace' || v.mode === 'sek' },
    { key: 'show', type: 'boolean', group: 'view', label: L('Terme und Werte zeigen', 'Show terms and values'), help: L('Aus: Ergebnisse im Bild durch „?“ ersetzt (für Aufgaben).', 'Off: results in the picture replaced by “?” (for tasks).'), default: true },
    { key: 'sol', type: 'boolean', group: 'view', label: L('Lösung zeigen', 'Show the solution'), default: false, visibleIf: (v) => v.mode === 'draw' },
  ],
  actions: [
    { id: 'sweep', label: L('P durchlaufen lassen', 'Let P run along'), primary: true, visibleIf: (v) => v.mode === 'trace' || v.mode === 'rule' },
    { id: 'clear', label: L('Spur löschen', 'Clear the trace'), visibleIf: (v) => v.mode === 'trace' },
    { id: 'shrink', label: L('h gegen 0 gehen lassen', 'Let h tend to 0'), primary: true, visibleIf: (v) => v.mode === 'sek' },
    { id: 'grow', label: L('h wieder auf 1', 'Set h back to 1'), visibleIf: (v) => v.mode === 'sek' },
    { id: 'steps', label: L('Merkmale Schritt für Schritt', 'Features step by step'), primary: true, visibleIf: (v) => v.mode === 'feat' },
    { id: 'reveal', label: L('Lösung aufdecken', 'Reveal the solution'), primary: true, visibleIf: (v) => v.mode === 'draw' },
    { id: 'reset', label: L('Skizze zurücksetzen', 'Reset the sketch'), visibleIf: (v) => v.mode === 'draw' },
  ],
  readouts: [
    { key: 'slope', label: L('Steigung in P', 'Slope at P'), spoiler: true },
    { key: 'deriv', label: L('Ableitungsfunktion', 'Derivative'), spoiler: true },
    { key: 'dq', label: L('Differenzenquotient', 'Difference quotient'), spoiler: true },
    { key: 'feat', label: L('Merkmale von f', 'Features of f'), spoiler: true },
    { key: 'dev', label: L('Deine Skizze', 'Your sketch') },
    { key: 'rule', label: L('Regel', 'Rule'), spoiler: true },
    { key: 'sit', label: L('Im Alltag', 'In everyday life'), spoiler: true },
  ],
  resultsParam: 'show',
  presets: [
    { id: 'cub', label: L('Polynom 3. Grades', 'Cubic'), values: {} },
    { id: 'x3', label: L('f(x) = x³ − 3x: Hoch-, Tief- und Wendepunkt', 'f(x) = x³ − 3x: maximum, minimum, inflection'), values: { mode: 'feat', k3: 1, k2: 0, k1: -3, k0: 0, d2: true } },
    { id: 'par', label: L('Parabel → Gerade', 'Parabola → line'), values: { fn: 'par', x: -3 } },
    { id: 'quart', label: L('Polynom 4. Grades: drei Extrema', 'Quartic: three extrema'), values: { fn: 'quart', x: -3.4 } },
    { id: 'sin', label: L('Sinus → Kosinus', 'Sine → cosine'), values: { fn: 'sin', x: -6 } },
    { id: 'exp', label: L('eˣ ist seine eigene Ableitung', 'eˣ is its own derivative'), values: { fn: 'exp', x: -3.5, full: true } },
    { id: 'ln', label: L('ln x → 1/x', 'ln x → 1/x'), values: { fn: 'ln', x: 0.5, d2: true } },
    { id: 'sek', label: L('Sekante → Tangente: x² an der Stelle 1', 'Secant → tangent: x² at x = 1'), values: { mode: 'sek', fn: 'par', pa: 1, pb: 0, pc: 0, x: 1, h: 1 } },
    { id: 'abs', label: L('|x|: Knick – links −1, rechts 1', '|x|: kink – left −1, right 1'), values: { mode: 'sek', fn: 'abs', x: 0, h: 1.5, side: 'l' } },
    { id: 'sattel', label: L('x³: Sattelpunkt (Terrassenpunkt)', 'x³: saddle point'), values: { mode: 'feat', k3: 1, k2: 0, k1: 0, k0: 0, d2: true } },
    { id: 'draw', label: L('Aufgabe: Skizziere f′ zum Polynom', 'Task: sketch f′ for the cubic'), values: { mode: 'draw' } },
    { id: 'fak', label: L('Faktorregel: (2 · sin x)′ = 2 · cos x', 'Constant multiple: (2 · sin x)′ = 2 · cos x'), values: { mode: 'rule', rule: 'fak', fn: 'sin', rk: 2, x: 0.5 } },
    { id: 'sum', label: L('Summenregel: Steigungen addieren sich', 'Sum rule: slopes add up'), values: { mode: 'rule', rule: 'sum', x: 1 } },
    { id: 'pow', label: L('Potenzregel: (x³)′ = 3x²', 'Power rule: (x³)′ = 3x²'), values: { mode: 'rule', rule: 'pow', pn: 3, x: 1, dx: 0.5 } },
    { id: 'prod', label: L('Produktregel als Rechteckfläche', 'Product rule as a rectangle'), values: { mode: 'rule', rule: 'prod', x: 2, dx: 0.5 } },
    { id: 'chain', label: L('Kettenregel: (sin 2x)′ = 2 cos 2x', 'Chain rule: (sin 2x)′ = 2 cos 2x'), values: { mode: 'rule', rule: 'chain', rk: 2, x: 0.5 } },
    { id: 'car', label: L('Auto: Geschwindigkeit aus dem Weg', 'Car: velocity from distance'), values: { kind: 'app', app: 'car', x: 0, d2: true } },
    { id: 'sprint', label: L('100-m-Lauf: Beschleunigung am Start', '100 m sprint: acceleration at the start'), values: { kind: 'app', app: 'sprint', x: 0, d2: true } },
    { id: 'lift', label: L('Fahrstuhl: wann am schnellsten?', 'Lift: when is it fastest?'), values: { mode: 'feat', kind: 'app', app: 'lift', d2: true } },
    { id: 'ball', label: L('Hochwurf: v = 0 im höchsten Punkt', 'Vertical throw: v = 0 at the top'), values: { mode: 'feat', kind: 'app', app: 'ball', d2: true } },
    { id: 'temp', label: L('Temperatur: wann wird es am schnellsten wärmer?', 'Temperature: when does it warm up fastest?'), values: { kind: 'app', app: 'temp', x: 0 } },
    { id: 'pop', label: L('Epidemie: Wendepunkt = meiste neue Fälle', 'Epidemic: inflection = most new cases'), values: { mode: 'feat', kind: 'app', app: 'pop', d2: true } },
    { id: 'cost', label: L('Grenzkosten und Kostenkehre', 'Marginal cost and the inflection of cost'), values: { mode: 'feat', kind: 'app', app: 'cost' } },
    { id: 'hike', label: L('Wanderung: Steigung in Prozent', 'Hike: gradient in percent'), values: { kind: 'app', app: 'hike', x: 0 } },
    { id: 'tank', label: L('Badewanne: Zufluss aus der Wassermenge', 'Bathtub: inflow from the amount of water'), values: { mode: 'sek', kind: 'app', app: 'tank', x: 5, h: 2 } },
  ],
  strings: {
    de: {
      canvas:
        'Oben der Graph einer Funktion f, darunter der Graph der Ableitungsfunktion f′ und auf Wunsch der zweiten Ableitung f″. Je nach Ansicht läuft ein Punkt P mit Tangente und Steigungsdreieck über f und zeichnet f′ als Spur, eine Sekante durch P und Q wird für h → 0 zur Tangente (mit Diagramm des Differenzenquotienten), Hoch-, Tief-, Wende- und Sattelpunkte werden mit Hilfslinien über alle Bilder verbunden, man skizziert f′ selbst mit sieben ziehbaren Punkten, oder Faktor-, Summen-, Potenz-, Produkt- und Kettenregel werden anschaulich gezeigt. Rechts Karten mit Rechnung, Tabelle und Deutung.',
    },
    en: {
      canvas:
        'At the top the graph of a function f, below the graph of the derivative f′ and, if wanted, of the second derivative f″. Depending on the view, a point P with tangent and slope triangle runs along f and draws f′ as a trace, a secant through P and Q becomes the tangent as h → 0 (with a chart of the difference quotient), maxima, minima, inflection and saddle points are linked across all pictures, you sketch f′ yourself with seven draggable points, or the constant multiple, sum, power, product and chain rules are shown visually. On the right cards with working, table and interpretation.',
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
    const rule = () => p.rule as RuleKey;
    const side = () => p.side as Side;
    const isApp = () => kind() === 'app' && (mode() !== 'rule' || rule() === 'fak');
    const meta = () => (isApp() ? APP_META[appKey()] : null);
    const setP = (vals: Record<string, number | boolean | string>) => ctx.set(vals as never);

    /* ---------- Farben ---------- */
    const col = {
      f: () => th().series[0]!,
      d: () => th().series[3]!,
      dd: () => th().series[5]!,
      t: () => th().series[4]!,
      pos: () => th().series[2]!,
      neg: () => th().series[1]!,
      s: () => th().series[1]!,
      l: () => th().series[5]!,
      c: () => th().series[2]!,
      sk: () => th().series[4]!,
    };

    /* ---------- Zahlen ---------- */
    const clean = (v: number, d: number) => (Math.abs(v) < 0.5 * 10 ** -d ? 0 : v);
    const N = (v: number, d = 2) => (Number.isFinite(v) ? fmt.num(clean(v, d), d) : '–');
    /** Stellen nach Größe: große Werte mit weniger Nachkommastellen. */
    const nd = (v: number) => (Math.abs(v) >= 1000 ? 0 : Math.abs(v) >= 100 ? 1 : 2);
    const NV = (v: number) => N(v, nd(v));
    const isExact = (v: number, d = 2) => Math.abs(v * 10 ** d - Math.round(v * 10 ** d)) < 1e-6;
    const eq = (v: number, d = 2) => (isExact(v, d) ? '=' : '≈');
    const show = () => p.show;
    const S = (s: string) => (show() ? s : '?');

    /* ---------- Funktionen ---------- */
    const coefNow = (): Coeffs => {
      const c = { ...DEFAULT_COEFFS };
      for (const k of COEF_KEYS) c[k] = p[k] as number;
      return c;
    };
    function buildBase(k: Kind, f: FnKey, a: AppKey, c: Coeffs): Fn {
      return k === 'app' ? APPS[a] : mathFn(f, c);
    }
    /** Funktion der Regel-Ansicht. */
    function ruleFn(r: RuleKey, base: Fn, a: number, n: number): Fn {
      switch (r) {
        case 'fak':
          return { ...base, f: (x) => a * base.f(x), d1: (x) => a * base.d1(x), d2: (x) => a * base.d2(x) };
        case 'sum':
          return { f: (x) => SUM.g(x) + SUM.h(x), d1: (x) => SUM.dg(x) + SUM.dh(x), d2: (x) => 0.5 - Math.sin(x), x: SUM.x, dom: SUM.x, nodes: [-3, -2, -1, 0, 1, 2, 3] };
        case 'pow':
          return powFn(Math.round(n));
        case 'prod':
          return { f: (x) => PROD.u(x) * PROD.v(x), d1: (x) => PROD.du() * PROD.v(x) + PROD.u(x) * PROD.dv(x), d2: (x) => 0.75 * x + 0.5, x: PROD.x, dom: [0, 3.5], nodes: [0, 0.5, 1, 1.5, 2, 3, 4] };
        case 'chain':
          return chainFn(a);
      }
    }
    const exactBase = (): Fn => buildBase(kind(), fnKey(), appKey(), coefNow());
    const exactFn = (): Fn => (mode() === 'rule' ? ruleFn(rule(), exactBase(), p.rk, p.pn) : exactBase());
    /** Stelle im Definitionsbereich, nicht auf einer Polstelle. */
    function limFor(fn: Fn, v: number): number {
      let x = clamp(v, fn.dom[0], fn.dom[1]);
      for (const pole of fn.poles ?? []) if (Math.abs(x - pole) < 0.15) x = pole + (x >= pole ? 0.15 : -0.15);
      return x;
    }
    const lim = (v: number) => limFor(exactFn(), v);

    /* Angezeigte Koeffizienten gleiten; beim Wechsel der Funktion wird überblendet. */
    const CC = Object.fromEntries(COEF_KEYS.map((k) => [k, new Chan(p[k] as number)])) as Record<CoefKey, Chan>;
    const coefShown = (): Coeffs => {
      const c = { ...DEFAULT_COEFFS };
      for (const k of COEF_KEYS) c[k] = CC[k].v;
      return c;
    };
    const RK = new Chan(p.rk);
    let morph: { from: Fn; fromBase: Fn; t0: number; dur: number } | null = null;
    let morphK = 1;
    function blend(old: Fn, cur: Fn, k: number): Fn {
      const mix = (u: number, v: number) => (Number.isFinite(u) && Number.isFinite(v) ? lerp(u, v, k) : v);
      return {
        ...cur,
        f: (x) => mix(old.f(x), cur.f(x)),
        d1: (x) => mix(old.d1(x), cur.d1(x)),
        d2: (x) => mix(old.d2(x), cur.d2(x)),
        kinks: k < 0.5 ? old.kinks : cur.kinks,
        poles: k < 0.5 ? old.poles : cur.poles,
      };
    }
    function shownBase(): Fn {
      const cur = buildBase(kind(), fnKey(), appKey(), coefShown());
      return morph && morphK < 1 ? blend(morph.fromBase, cur, morphK) : cur;
    }
    function shownFn(): Fn {
      const base = buildBase(kind(), fnKey(), appKey(), coefShown());
      const cur = mode() === 'rule' ? ruleFn(rule(), base, RK.v, p.pn) : base;
      return morph && morphK < 1 ? blend(morph.from, cur, morphK) : cur;
    }

    /* ---------- angezeigter Zustand ---------- */
    const X = new Chan(lim(p.x));
    const DX = new Chan(p.dx);
    const Hc = new Chan(p.h);
    const SK = SK_KEYS.map((k) => new Chan(p[k] as number));
    const rng = {
      x0: new Chan(-4),
      x1: new Chan(4),
      fy0: new Chan(-2),
      fy1: new Chan(2),
      dy0: new Chan(-2),
      dy1: new Chan(2),
      ddy0: new Chan(-2),
      ddy1: new Chan(2),
      qh: new Chan(1.3),
      qy0: new Chan(-2),
      qy1: new Chan(2),
      rx0: new Chan(-4),
      rx1: new Chan(4),
      ry0: new Chan(-2),
      ry1: new Chan(2),
      rdy0: new Chan(-2),
      rdy1: new Chan(2),
    };
    const mw = Object.fromEntries(MODES.map((m) => [m, new Chan(m === p.mode ? 1 : 0)])) as Record<Mode, Chan>;
    const d2Goal = () => (p.d2 && (mode() === 'trace' || mode() === 'feat') ? 1 : 0);
    const kD2 = new Chan(d2Goal());
    const kFull = new Chan(p.full ? 1 : 0);
    const kMarks = new Chan(p.marks ? 1 : 0);
    const kTri = new Chan(p.tri ? 1 : 0);
    const kSol = new Chan(p.sol ? 1 : 0);
    const kSide = { r: new Chan(p.side === 'r' ? 1 : 0), l: new Chan(p.side === 'l' ? 1 : 0), c: new Chan(p.side === 'c' ? 1 : 0) };
    let intro: number | null = null;
    let sweep: { t0: number; dur: number; from: number; to: number } | null = null;
    let shrink: { t0: number; dur: number; from: number } | null = null;
    let steps: { t0: number } | null = null;
    let reveal: { t0: number; dur: number } | null = null;
    let cardFade: number | null = null;
    let topFade: { t0: number; from: string } | null = null;
    let secFade: { t0: number; from: string } | null = null;
    let lastTime = performance.now();
    let lastDrag = -Infinity;
    const dragging = () => performance.now() - lastDrag < 250;
    const grab = () => {
      lastDrag = performance.now();
    };
    /** Bereich, den P schon überstrichen hat (Spur von f′ und f″). */
    const vis = { lo: lim(p.x), hi: lim(p.x) };
    let feat: Features = features(exactFn());
    let table: SignInterval[] = signTable(exactFn());
    let rating: Rating | null = null;
    let prevMode: Mode = mode();
    let frameNow = performance.now();
    let frameDt = 0;
    let numsBusy = false;
    const topId = () => (mode() === 'rule' ? `R:${rule()}` : 'F');
    const secId = () => (mode() === 'rule' ? `R:${rule()}` : mode() === 'sek' ? 'Q' : 'D');
    let prevTop = topId();
    let prevSec = secId();

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
        // nach einem Sprung über eine Polstelle nicht lange „herunterzählen“
        if (!Number.isFinite(e.c.v) || Math.abs(e.c.v - v) > 40 * Math.max(1, Math.abs(v))) e.c.jump(v);
        e.c.follow(v, dragging() || sweep ? 0.04 : 0.17);
        if (e.c.step(frameNow, frameDt)) numsBusy = true;
      }
      return e.c.v;
    }

    /* ---------- Aufteilung ---------- */
    const isWide = () => surface.width >= 640 || surface.width >= surface.height * 1.3;
    const sm = () => surface.width < 560;
    const fs = (big: number, small: number) => (sm() ? small : big);
    function regions(): { stack: Rect; col: Rect; wide: boolean } {
      const w = surface.width;
      const h = surface.height;
      if (isWide()) {
        const cw = Math.round(clamp(w * 0.33, 230, 360));
        return { stack: { x: 0, y: 0, w: w - cw - 10, h }, col: { x: w - cw, y: 0, w: cw, h }, wide: true };
      }
      const ph = Math.round(clamp(h * (0.56 + 0.08 * kD2.v), 320, w * (1.45 + 0.4 * kD2.v)));
      return { stack: { x: 0, y: 0, w, h: ph }, col: { x: 0, y: ph + 10, w, h: h - ph - 10 }, wide: false };
    }
    const HIDDEN: Rect = { x: -40, y: -40, w: 10, h: 10 };
    function panels(): { top: Rect; mid: Rect; bot: Rect | null } {
      const S0 = regions().stack;
      const w3 = kD2.v * 0.8;
      const gap = 6;
      const gap2 = gap * clamp01(w3 * 5);
      const avail = S0.h - gap - gap2;
      const total = 1 + 0.92 + w3;
      const h1 = Math.round((avail * 1) / total);
      const h2 = Math.round((avail * 0.92) / total);
      const h3 = avail - h1 - h2;
      const top = { x: S0.x, y: S0.y, w: S0.w, h: h1 };
      const mid = { x: S0.x, y: S0.y + h1 + gap, w: S0.w, h: h2 };
      const bot = h3 > 30 ? { x: S0.x, y: mid.y + h2 + gap2, w: S0.w, h: h3 } : null;
      return { top, mid, bot };
    }
    const PAD = () => ({ left: fs(50, 42), bottom: fs(24, 22), top: fs(40, 36), right: fs(16, 12) });
    const plot = new Plot(surface, { x: [-4, 4], y: [-3, 3], equalAspect: false, pan: false, zoom: false, controls: false, region: () => panels().top });
    const plotD = new Plot(surface, { x: [-4, 4], y: [-3, 3], equalAspect: false, pan: false, zoom: false, controls: false, region: () => panels().mid });
    const plotDD = new Plot(surface, { x: [-4, 4], y: [-3, 3], equalAspect: false, pan: false, zoom: false, controls: false, region: () => panels().bot ?? HIDDEN });

    /* ---------- Griffe ---------- */
    // P auf dem Graphen von f
    plot.addHandle({
      get: () => [X.v, shownFn().f(X.v)],
      set: (x) => {
        grab();
        setP({ x: Math.round(lim(x) * 20) / 20 });
      },
      axis: 'x',
      enabled: () => editable() && !sweep && (mode() === 'trace' || mode() === 'sek' || (mode() === 'rule' && rule() !== 'prod')),
      color: () => col.f(),
    });
    // Q (Sekante)
    plot.addHandle({
      get: () => {
        const [a, b] = secantEnds(X.v, shownH(frameNow), side());
        const q = side() === 'l' ? a : b;
        return [q, shownFn().f(q)];
      },
      set: (x) => {
        grab();
        setP({ h: Math.round(clamp(Math.abs(x - p.x), H_MIN, 3) * 1000) / 1000 });
      },
      axis: 'x',
      enabled: () => editable() && mode() === 'sek' && !shrink,
      color: () => col.s(),
    });
    // Stützpunkte der selbst gezeichneten Funktion f
    OWN_IDX.forEach((i) => {
      plot.addHandle({
        get: () => [i - 3, CC[`w${i + 1}` as CoefKey].v],
        set: (_x, y) => {
          grab();
          setP({ [`w${i + 1}`]: Math.round(clamp(y, -3, 3) * 20) / 20 });
        },
        axis: 'y',
        enabled: () => editable() && kind() === 'math' && fnKey() === 'own' && (mode() !== 'rule' || rule() === 'fak') && mode() !== 'draw' && !sweep,
        color: () => col.f(),
      });
    });
    // Produktregel: Ecke des Rechtecks
    plot.addHandle({
      get: () => [PROD.u(X.v), PROD.v(X.v)],
      set: (u) => {
        grab();
        setP({ x: Math.round(clamp((u - 1) / 0.5, 0, 3.5) * 20) / 20 });
      },
      axis: 'x',
      enabled: () => editable() && mode() === 'rule' && rule() === 'prod' && !sweep,
      color: () => col.f(),
    });
    // Punkt auf f′ (Spur bzw. Regel)
    plotD.addHandle({
      get: () => [X.v, shownFn().d1(X.v)],
      set: (x) => {
        grab();
        setP({ x: Math.round(lim(x) * 20) / 20 });
      },
      axis: 'x',
      enabled: () => editable() && !sweep && (mode() === 'trace' || mode() === 'rule'),
      color: () => col.d(),
    });
    // Differenzenquotient über h
    plotD.addHandle({
      get: () => {
        const h = shownH(frameNow);
        const fn = shownFn();
        const hs = side() === 'l' ? -h : h;
        return [hs, side() === 'c' ? dq(fn.f, X.v, h, 'c') : dq(fn.f, X.v, h, side())];
      },
      set: (x) => {
        grab();
        setP({ h: Math.round(clamp(Math.abs(x), H_MIN, 3) * 1000) / 1000 });
      },
      axis: 'x',
      enabled: () => editable() && mode() === 'sek' && !shrink,
      color: () => col.s(),
    });
    // sieben Punkte der eigenen Skizze von f′
    SK_KEYS.forEach((key, i) => {
      plotD.addHandle({
        get: () => [shownFn().nodes[i]!, SK[i]!.v],
        set: (_x, y) => {
          grab();
          setP({ [key]: Math.round(clamp(y, -2000, 2000) * 100) / 100 });
        },
        axis: 'y',
        enabled: () => editable() && mode() === 'draw' && !reveal,
        color: () => col.sk(),
      });
    });

    /* ---------- Formeln ---------- */
    const fstyle = (size: number, color = th().text, weight = 600): FormulaStyle => ({
      size,
      font: th().font,
      mathFont: th().mathFont,
      color,
      weight,
      palette: { f: col.f(), d: col.d(), D: col.dd(), t: col.t(), p: col.pos(), n: col.neg(), s: col.s(), l: col.l(), c: col.c(), k: col.sk(), m: th().muted, g: th().series[2]!, h: th().series[5]!, u: th().series[3]!, v: th().series[4]! },
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
    /** Faktor vor einer Funktion (1 → leer, −1 → −); 0 wird gesondert behandelt. */
    const fac = (c: number, tail = ' · ') => (Math.abs(c - 1) < 1e-12 ? '' : Math.abs(c + 1) < 1e-12 ? '−' : `${q(c)}${tail}`);
    const term = (c: number, body: string) => (Math.abs(c) < 1e-12 ? '0' : `${fac(c)}${body}`);
    /** Bruch c/Nenner mit Vorzeichen vor dem Bruch. */
    const fracSrc = (c: number, den: string) => (Math.abs(c) < 1e-12 ? '0' : `${c < 0 ? '−' : ''}\\f{${q(Math.abs(c))}}{${den}}`);

    /** Namen: f, f′, f″, Variable und Einheiten. */
    function names(): { f: string; d: string; dd: string; v: string; uX: string; uF: string; uD: string; uDD: string } {
      const m = meta();
      if (!m) return { f: 'f', d: 'f′', dd: 'f″', v: 'x', uX: '', uF: '', uD: '', uDD: '' };
      return { f: m.f, d: m.d, dd: m.dd, v: m.v, uX: say(m.uX), uF: say(m.uF), uD: say(m.uD), uDD: say(m.uDD) };
    }
    const unit = (u: string) => (u ? ` \\t{${u}}` : '');

    /** f, f′ und f″ als rechte Seiten (Kurzschrift aus formula.ts). */
    function fnSrc(): { f: string; d: string; dd: string; note: string | null } {
      const m = meta();
      if (m) return { f: say(m.fSrc), d: say(m.dSrc), dd: say(m.ddSrc), note: null };
      const c = coefNow();
      switch (fnKey()) {
        case 'par':
          return { f: polySrc([[c.pa, 'x²'], [c.pb, 'x'], [c.pc, '']]), d: polySrc([[2 * c.pa, 'x'], [c.pb, '']]), dd: polySrc([[2 * c.pa, '']]), note: null };
        case 'cub':
          return {
            f: polySrc([[c.k3, 'x³'], [c.k2, 'x²'], [c.k1, 'x'], [c.k0, '']]),
            d: polySrc([[3 * c.k3, 'x²'], [2 * c.k2, 'x'], [c.k1, '']]),
            dd: polySrc([[6 * c.k3, 'x'], [2 * c.k2, '']]),
            note: null,
          };
        case 'quart':
          return {
            f: polySrc([[c.u4, 'x⁴'], [c.u3, 'x³'], [c.u2, 'x²'], [c.u1, 'x'], [c.u0, '']]),
            d: polySrc([[4 * c.u4, 'x³'], [3 * c.u3, 'x²'], [2 * c.u2, 'x'], [c.u1, '']]),
            dd: polySrc([[12 * c.u4, 'x²'], [6 * c.u3, 'x'], [2 * c.u2, '']]),
            note: null,
          };
        case 'sin': {
          const bx = Math.abs(c.sb - 1) < 1e-12 ? 'x' : `${q(c.sb)}x`;
          return { f: term(c.sa, `\\t{sin}(${bx})`), d: term(c.sa * c.sb, `\\t{cos}(${bx})`), dd: term(-c.sa * c.sb * c.sb, `\\t{sin}(${bx})`), note: null };
        }
        case 'cos': {
          const bx = Math.abs(c.sb - 1) < 1e-12 ? 'x' : `${q(c.sb)}x`;
          return { f: term(c.sa, `\\t{cos}(${bx})`), d: term(-c.sa * c.sb, `\\t{sin}(${bx})`), dd: term(-c.sa * c.sb * c.sb, `\\t{cos}(${bx})`), note: null };
        }
        case 'exp': {
          if (Math.abs(c.eb) < 1e-12) return { f: q(c.ea), d: '0', dd: '0', note: null };
          const kx = Math.abs(c.eb - 1) < 1e-12 ? 'x' : `${q(c.eb)}x`;
          return { f: term(c.ea, `\\t{e}^{${kx}}`), d: term(c.ea * c.eb, `\\t{e}^{${kx}}`), dd: term(c.ea * c.eb * c.eb, `\\t{e}^{${kx}}`), note: null };
        }
        case 'ln':
          return { f: term(c.la, '\\t{ln} x'), d: fracSrc(c.la, 'x'), dd: fracSrc(-c.la, 'x²'), note: say(L('für x > 0', 'for x > 0')) };
        case 'sqrt':
          return { f: term(c.wa, '\\r{x}'), d: fracSrc(c.wa, '2\\r{x}'), dd: fracSrc(-c.wa, '4x\\r{x}'), note: say(L('f′ und f″ nur für x > 0', 'f′ and f″ only for x > 0')) };
        case 'abs': {
          const s = c.ab;
          const inner = Math.abs(s) < 1e-12 ? 'x' : `x ${s > 0 ? '−' : '+'} ${q(Math.abs(s))}`;
          return {
            f: term(c.aa, `|${inner}|`),
            d: `${q(c.aa)} \\c{m}{(x > ${q(s)})},  ${q(-c.aa)} \\c{m}{(x < ${q(s)})}`,
            dd: `0 \\c{m}{(x ≠ ${q(s)})}`,
            note: say(L(`Knick bei x = ${N(s, 2)}: dort nicht differenzierbar`, `kink at x = ${N(s, 2)}: not differentiable there`)),
          };
        }
        case 'inv':
          return { f: fracSrc(c.ia, 'x'), d: fracSrc(-c.ia, 'x²'), dd: fracSrc(2 * c.ia, 'x³'), note: say(L('für x ≠ 0 (Polstelle bei 0)', 'for x ≠ 0 (pole at 0)')) };
        case 'own':
          return {
            f: say(L('\\t{selbst gezeichnet (7 Punkte)}', '\\t{drawn by you (7 points)}')),
            d: say(L('\\t{nur grafisch}', '\\t{graphically only}')),
            dd: say(L('\\t{nur grafisch}', '\\t{graphically only}')),
            note: say(L('glatte Kurve durch die Punkte – ohne Term ableiten', 'smooth curve through the points – differentiate without a formula')),
          };
      }
    }
    /** „f(x) = …“, „f′(x) = …“, „f″(x) = …“. */
    function fullSrc(): { f: string; d: string; dd: string } {
      const s = fnSrc();
      const nm = names();
      return { f: `${nm.f}(${nm.v}) = ${s.f}`, d: `${nm.d}(${nm.v}) = ${s.d}`, dd: `${nm.dd}(${nm.v}) = ${s.dd}` };
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
      if (r <= 0.2 || alpha <= 0.01 || !Number.isFinite(y) || !Number.isFinite(x)) return;
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
    /** Leuchtender Hof um einen Punkt. */
    function halo(x: number, y: number, color: string, r: number, alpha: number): void {
      if (alpha <= 0.01 || !Number.isFinite(y) || !Number.isFinite(x)) return;
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

    /** Werte einer Funktion als Pixelpunkte; an Sprung- und Polstellen wird die Linie unterbrochen. */
    function sample(pl: Plot, f: (x: number) => number, x0: number, x1: number, breaks: number[] = []): [number, number][] {
      const out: [number, number][] = [];
      if (!(x1 > x0)) return out;
      const r = pl.rect;
      const count = Math.round(clamp(Math.abs(pl.px(x1) - pl.px(x0)) * 0.9, 16, 900));
      const lim2 = r.h * 3;
      const js = breaks.filter((j) => j > x0 && j < x1).sort((u, v) => u - v);
      const segs: [number, number][] = [];
      let s0 = x0;
      for (const j of js) {
        segs.push([s0, j - 1e-9]);
        s0 = j + 1e-9;
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
    const breaksF = (fn: Fn) => fn.poles ?? [];
    const breaksD = (fn: Fn) => [...(fn.poles ?? []), ...(fn.kinks ?? [])];
    const breaksDD = (fn: Fn) => [...(fn.poles ?? []), ...(fn.kinks ?? []), ...(fn.jumps2 ?? [])];

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
      if (alpha <= 0.01 || !Number.isFinite(px)) return;
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

    /** Steigungsdreieck an einer Geraden durch (x | y) mit Steigung m: waagrecht Δx, senkrecht m·Δx. */
    function slopeTriangle(pl: Plot, x: number, y: number, m: number, dX: number, color: string, alpha: number, labels: { dx?: string; dy?: string } = {}): void {
      if (alpha <= 0.01 || !Number.isFinite(m) || !Number.isFinite(y)) return;
      const g = surface.g;
      const r = pl.rect;
      const x2 = x + dX;
      const y2 = y + m * dX;
      g.save();
      g.globalAlpha *= alpha;
      g.fillStyle = withAlpha(color, th().dark ? 0.2 : 0.12);
      g.beginPath();
      g.moveTo(pl.px(x), pl.py(y));
      g.lineTo(pl.px(x2), pl.py(y));
      g.lineTo(pl.px(x2), pl.py(y2));
      g.closePath();
      g.fill();
      g.lineCap = 'round';
      g.strokeStyle = withAlpha(th().muted, 0.95);
      g.lineWidth = 1.8;
      g.beginPath();
      g.moveTo(pl.px(x), pl.py(y));
      g.lineTo(pl.px(x2), pl.py(y));
      g.stroke();
      g.strokeStyle = color;
      g.lineWidth = 3.4;
      g.beginPath();
      g.moveTo(pl.px(x2), pl.py(y));
      g.lineTo(pl.px(x2), pl.py(y2));
      g.stroke();
      g.restore();
      const sz = fs(11.5, 11);
      if (labels.dx) fpill((pl.px(x) + pl.px(x2)) / 2, pl.py(y) + (m >= 0 ? 15 : -15), `\\c{m}{${labels.dx}}`, { size: sz, alpha: alpha * 0.92, color: th().muted, bounds: r });
      if (labels.dy && Math.abs(pl.py(y2) - pl.py(y)) > 16) {
        const right = dX > 0 ? pl.px(x2) < r.x + r.w - 120 : pl.px(x2) < r.x + 120;
        fpill(pl.px(x2) + (right ? 10 : -10), clamp((pl.py(y) + pl.py(y2)) / 2, r.y + 44, r.y + r.h - 14), labels.dy, { align: right ? 'left' : 'right', size: sz, alpha, bounds: r, border: withAlpha(color, 0.55) });
      }
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

    /** Fläche zwischen g und der x-Achse auf [lo; hi], grün oberhalb, rot unterhalb. */
    function fillSigned(pl: Plot, g0: (x: number) => number, lo: number, hi: number, alpha: number, breaks: number[] = []): void {
      if (!(hi > lo) || alpha <= 0.01) return;
      const g = surface.g;
      const dark = th().dark;
      const y0 = pl.py(0);
      const r = pl.rect;
      for (const sign of [1, -1]) {
        const color = sign > 0 ? col.pos() : col.neg();
        const pts = sample(pl, (x) => (sign > 0 ? Math.max(g0(x), 0) : Math.min(g0(x), 0)), lo, hi, breaks);
        g.save();
        g.globalAlpha *= alpha;
        const grad = g.createLinearGradient(0, sign > 0 ? r.y : r.y + r.h, 0, y0);
        grad.addColorStop(0, withAlpha(color, dark ? 0.42 : 0.3));
        grad.addColorStop(1, withAlpha(color, dark ? 0.16 : 0.1));
        g.fillStyle = grad;
        g.beginPath();
        let open = false;
        let lastX = 0;
        for (const [px, py] of pts) {
          if (!Number.isFinite(py)) {
            if (open) {
              g.lineTo(lastX, y0);
              g.closePath();
              open = false;
            }
            continue;
          }
          if (!open) {
            g.moveTo(px, y0);
            open = true;
          }
          g.lineTo(px, py);
          lastX = px;
        }
        if (open) {
          g.lineTo(lastX, y0);
          g.closePath();
        }
        g.fill();
        g.restore();
      }
    }

    /* ---------- Einstieg ---------- */
    interface Intro {
      panel: number;
      /** Graph von f zeichnet sich von links nach rechts */
      reveal: number;
      /** Graph von f′ (bzw. Diagramm unten) erscheint */
      dReveal: number;
      labels: number;
      cards: number;
      stagger: number;
    }
    const DONE: Intro = { panel: 1, reveal: 1, dReveal: 1, labels: 1, cards: 1, stagger: 1 };
    function introState(now: number): Intro {
      if (intro === null) return DONE;
      const t = now - intro;
      if (t > 3300) {
        intro = null;
        return DONE;
      }
      return {
        panel: ease.outCubic(clamp01(t / 450)),
        reveal: ease.inOutCubic(clamp01((t - 100) / 1100)),
        dReveal: ease.inOutCubic(clamp01((t - 1000) / 1300)),
        labels: ease.outCubic(clamp01((t - 1900) / 600)),
        cards: clamp01((t - 250) / 900),
        stagger: clamp01((t - 800) / 1500),
      };
    }

    /* ---------- Zustand pro Bild ---------- */
    interface View {
      fn: Fn;
      base: Fn;
      x: number;
      dX: number;
      h: number;
      sk: number[];
    }
    function shownX(now: number): number {
      if (!sweep) return X.v;
      const t = clamp01((now - sweep.t0) / sweep.dur);
      return lerp(sweep.from, sweep.to, ease.inOutCubic(t));
    }
    function shownH(now: number): number {
      if (!shrink) return Hc.v;
      const t = clamp01((now - shrink.t0) / shrink.dur);
      // geometrisch kleiner werden, damit man auch die kleinen h sieht
      return Math.exp(lerp(Math.log(shrink.from), Math.log(H_MIN), ease.inOutCubic(t)));
    }
    function viewOf(now: number): View {
      return { fn: shownFn(), base: shownBase(), x: shownX(now), dX: DX.v, h: shownH(now), sk: SK.map((c) => c.v) };
    }

    /* ---------- Bereiche ---------- */
    /**
     * Wertebereich für die Achse: ganze Kurve, wenn sie nicht viel weiter ausschlägt
     * als der Hauptteil; sonst nur der Hauptteil (Ränder dürfen hinauslaufen).
     * Die wichtigen Werte sind immer enthalten.
     */
    function robustRange(f: (x: number) => number, x0: number, x1: number, must: number[]): { lo: number; hi: number } {
      const ys: number[] = [];
      for (let i = 0; i <= 300; i++) {
        const y = f(x0 + ((x1 - x0) * i) / 300);
        if (Number.isFinite(y)) ys.push(y);
      }
      if (!ys.length) return { lo: -1, hi: 1 };
      ys.sort((u, v) => u - v);
      const q0 = ys[Math.floor(ys.length * 0.08)]!;
      const q1 = ys[Math.ceil(ys.length * 0.92) - 1]!;
      const span = Math.max(1e-6, q1 - q0);
      const mn = ys[0]!;
      const mx = ys[ys.length - 1]!;
      let lo = mn >= q0 - 0.4 * span ? mn : q0 - 0.2 * span;
      let hi = mx <= q1 + 0.4 * span ? mx : q1 + 0.2 * span;
      for (const v of must) if (Number.isFinite(v)) {
        lo = Math.min(lo, v);
        hi = Math.max(hi, v);
      }
      return { lo, hi };
    }
    /** Bereich mit Rand (oben etwas mehr Platz für die Legende), Null immer enthalten. */
    function padded(r: { lo: number; hi: number }, withZero = true): [number, number] {
      const lo = withZero ? Math.min(0, r.lo) : r.lo;
      const hi = withZero ? Math.max(0, r.hi) : r.hi;
      const span = Math.max(0.5, hi - lo);
      return [lo - span * 0.1, hi + span * 0.16];
    }
    function qFns(fn: Fn, x: number): { one: (h: number) => number; cen: (h: number) => number } {
      return { one: (h) => (Math.abs(h) < 1e-12 ? NaN : (fn.f(x + h) - fn.f(x)) / h), cen: (h) => (Math.abs(h) < 1e-12 ? NaN : (fn.f(x + h) - fn.f(x - h)) / (2 * h)) };
    }
    function retargetRanges(now: number, instant: boolean): void {
      const goals: [Chan, number][] = [];
      const base = exactBase();
      const fn = exactFn();
      const xNow = lim(p.x);
      if (mode() !== 'rule') {
        let [x0, x1] = fn.x;
        const keys = [xNow, ...feat.ext.map((e) => e.x), ...feat.infl.map((e) => e.x)];
        let fKeys = keys;
        if (mode() === 'sek') {
          // Ausschnitt um P: Sekante und Steigungsdreieck groß im Bild
          const hh = Math.max(p.h, shrink ? shrink.from : 0, 0.5);
          const half = clamp(hh * 1.9 + 0.6, 1.2, (fn.x[1] - fn.x[0]) / 2);
          const g0 = rng.x0.goal;
          const g1 = rng.x1.goal;
          const keep = dragging() && xNow > g0 + 0.15 * (g1 - g0) && xNow < g1 - 0.15 * (g1 - g0) && g1 - g0 >= 2 * half - 1e-9;
          if (keep) {
            x0 = g0;
            x1 = g1;
          } else {
            let a = xNow - half;
            let b = xNow + half;
            if (a < fn.x[0]) {
              b += fn.x[0] - a;
              a = fn.x[0];
            }
            if (b > fn.x[1]) {
              a -= b - fn.x[1];
              b = fn.x[1];
            }
            x0 = Math.max(fn.x[0], a);
            x1 = Math.min(fn.x[1], b);
          }
          const [qa, qb] = secantEnds(xNow, p.h, side());
          fKeys = [xNow, qa, qb];
        }
        const fr = robustRange(fn.f, x0, x1, fKeys.map((t) => fn.f(t)));
        const fy = padded(fr, fnKey() !== 'own' || kind() === 'app' ? !isApp() : true);
        const dMust = keys.map((t) => fn.d1(t));
        if (mode() === 'draw') for (const k of SK_KEYS) dMust.push(p[k] as number);
        if (mode() === 'sek') {
          const os = oneSided(fn, xNow);
          dMust.push(os.left, os.right);
        }
        const dr = robustRange(fn.d1, x0, x1, dMust);
        const ddr = robustRange(fn.d2, x0, x1, keys.map((t) => fn.d2(t)));
        const dy = padded(dr);
        const ddy = padded(ddr);
        goals.push([rng.x0, x0], [rng.x1, x1], [rng.fy0, fy[0]], [rng.fy1, fy[1]], [rng.dy0, dy[0]], [rng.dy1, dy[1]], [rng.ddy0, ddy[0]], [rng.ddy1, ddy[1]]);
        // Diagramm des Differenzenquotienten
        const H = clamp(Math.max(p.h, shrink ? shrink.from : 0) * 1.3, 0.5, 3.2);
        const qf = qFns(fn, xNow);
        const os = oneSided(fn, xNow);
        const qr = robustRange((h) => (h < 0 ? qf.one(h) : side() === 'c' ? qf.cen(h) : qf.one(h)), -H, H, [os.left, os.right, qf.cen(H), qf.one(H), qf.one(-H)]);
        const qy = padded(qr, false);
        goals.push([rng.qh, H], [rng.qy0, qy[0]], [rng.qy1, qy[1]]);
      } else {
        const r = rule();
        let rx: [number, number] = fn.x;
        let ry: [number, number];
        let rdy: [number, number];
        if (r === 'prod') {
          rx = [0, 3.2];
          ry = [0, 4.7];
          rdy = padded(rangeOf(fn.d1, 0, 4));
        } else if (r === 'fak') {
          const a = robustRange(base.f, rx[0], rx[1], []);
          const b = robustRange(fn.f, rx[0], rx[1], [fn.f(xNow)]);
          ry = padded({ lo: Math.min(a.lo, b.lo), hi: Math.max(a.hi, b.hi) }, !isApp());
          const c = robustRange(base.d1, rx[0], rx[1], []);
          const d = robustRange(fn.d1, rx[0], rx[1], [fn.d1(xNow)]);
          rdy = padded({ lo: Math.min(c.lo, d.lo), hi: Math.max(c.hi, d.hi) });
        } else if (r === 'sum') {
          const a = rangeOf((x) => Math.min(SUM.g(x), SUM.h(x), fn.f(x)), rx[0], rx[1]);
          const b = rangeOf((x) => Math.max(SUM.g(x), SUM.h(x), fn.f(x)), rx[0], rx[1]);
          ry = padded({ lo: a.lo, hi: b.hi });
          const c = rangeOf((x) => Math.min(SUM.dg(x), SUM.dh(x), fn.d1(x)), rx[0], rx[1]);
          const d = rangeOf((x) => Math.max(SUM.dg(x), SUM.dh(x), fn.d1(x)), rx[0], rx[1]);
          rdy = padded({ lo: c.lo, hi: d.hi });
        } else if (r === 'chain') {
          ry = padded({ lo: -1, hi: 1 });
          const k = Math.max(1, Math.abs(p.rk));
          rdy = padded({ lo: -k, hi: k });
        } else {
          ry = padded(robustRange(fn.f, rx[0], rx[1], [fn.f(xNow)]));
          rdy = padded(robustRange(fn.d1, rx[0], rx[1], [fn.d1(xNow)]));
        }
        goals.push([rng.rx0, rx[0]], [rng.rx1, rx[1]], [rng.ry0, ry[0]], [rng.ry1, ry[1]], [rng.rdy0, rdy[0]], [rng.rdy1, rdy[1]]);
      }
      for (const [ch, v] of goals) {
        if (!Number.isFinite(v)) continue;
        if (instant || reduced()) ch.jump(v);
        else if (dragging()) ch.follow(v, 0.3);
        else if (ch.goal !== v) ch.glide(v, 750, 0, now);
      }
    }

    /* ---------- Achsen ---------- */
    function axisNames(): { x: string; f: string; d: string; dd: string } {
      const m = meta();
      if (!m) return { x: 'x', f: 'y', d: 'y', dd: 'y' };
      return { x: `${m.v} in ${say(m.uX)}`, f: `${m.f} in ${say(m.uF)}`, d: `${m.d} in ${say(m.uD)}`, dd: `${m.dd} in ${say(m.uDD)}` };
    }

    /* =====================================================================
     * Oberes Bild: Graph von f
     * ===================================================================== */
    function drawTopF(V: View, now: number, k: Intro, alpha: number): void {
      const g = surface.g;
      const an = axisNames();
      plot.setAxes({ x: { label: an.x }, y: { label: an.f } });
      // Merkmale: unten Platz für die Bänder (steigt/fällt, Krümmung)
      const pad = PAD();
      plot.setRangePadded([rng.x0.v, rng.x1.v], [rng.fy0.v, rng.fy1.v], { ...pad, bottom: pad.bottom + Math.round(fs(44, 40) * mw.feat.v) });
      plot.resize();
      g.save();
      g.globalAlpha *= alpha;
      plot.begin();
      plot.grid();
      plot.axes();
      const r = plot.rect;
      const w = (m: Mode) => mw[m].v;
      const [x0, x1] = [rng.x0.v, rng.x1.v];
      // Merkmale: Bänder steigt/fällt und Krümmung
      const kFeat = w('feat') * k.labels;
      if (kFeat > 0.01) drawBandsTop(now, kFeat);
      // Graph von f (beim Einstieg von links nach rechts)
      const xr = lerp(x0, x1, k.reveal);
      strokePts(sample(plot, V.fn.f, x0, xr, breaksF(V.fn)), col.f(), fs(3.2, 2.7), { glow: true });
      // Stützpunkte der gezeichneten Funktion
      if (kind() === 'math' && fnKey() === 'own') {
        for (const i of OWN_IDX) dot(plot.px(i - 3), plot.py(CC[`w${i + 1}` as CoefKey].v), col.f(), 5.5, k.labels * (1 - w('draw') * 0.4));
      }
      // Extrem- und Wendestellen
      const kMk = Math.max(kFeat, (w('trace') + w('draw')) * kMarks.v * k.labels);
      if (kMk > 0.01) drawFeaturesTop(V, now, kMk, kFeat > 0.5);
      // Tangente mit Steigungsdreieck
      const kt = w('trace') * k.labels;
      if (kt > 0.01) drawTangentTop(V, kt);
      // Sekante
      const ks = w('sek') * k.labels;
      if (ks > 0.01) drawSecantTop(V, ks);
      // Legende
      const src = fullSrc();
      const leg = show() ? `\\c{f}{${src.f}}` : `\\c{f}{${names().f}(${names().v})}`;
      const l1 = legendLeft(plot, an.f, pillW(leg, fs(13, 12)));
      fpill(l1, r.y + 18, leg, { align: 'left', size: fs(13, 12), alpha: k.panel, border: withAlpha(col.f(), 0.5), maxW: r.x + r.w - 26 - l1 });
      plot.end();
      g.restore();
    }

    /** Bänder unten im oberen Bild: f steigt/fällt (Vorzeichen von f′) und Krümmung (Vorzeichen von f″). */
    function drawBandsTop(now: number, alpha: number): void {
      const g = surface.g;
      const theme = th();
      const r = plot.rect;
      const sk = stepsK(now);
      const h = fs(16, 14);
      const yB1 = r.y + r.h - 2 * h - 8;
      const yB2 = r.y + r.h - h - 5;
      g.save();
      g.globalAlpha *= alpha;
      g.fillStyle = theme.bg;
      g.fillRect(r.x, yB1 - 5, r.w, r.y + r.h - yB1 + 5);
      g.restore();
      const rows: [number, number, (s: SignInterval) => -1 | 0 | 1, (v: -1 | 0 | 1) => string, (v: -1 | 0 | 1) => string][] = [
        [yB1, sk.bands, (s) => s.d1, (v) => (v > 0 ? col.pos() : v < 0 ? col.neg() : theme.muted), (v) => (v > 0 ? say(L('↗ steigt', '↗ increases')) : v < 0 ? say(L('↘ fällt', '↘ decreases')) : '→')],
        [yB2, sk.curv, (s) => s.d2, (v) => (v > 0 ? col.dd() : v < 0 ? mixColor(col.dd(), theme.muted, 0.6) : theme.muted), (v) => (v > 0 ? say(L('∪ links', '∪ left')) : v < 0 ? say(L('∩ rechts', '∩ right')) : '')],
      ];
      for (const [y, kk, get, color, label] of rows) {
        const a = alpha * kk;
        if (a <= 0.01) continue;
        g.save();
        g.globalAlpha *= a;
        for (const s of table) {
          const xa = Math.max(r.x, plot.px(s.a));
          const xb = Math.min(r.x + r.w, plot.px(s.b));
          if (xb - xa < 2) continue;
          const v = get(s);
          g.fillStyle = withAlpha(color(v), theme.dark ? 0.55 : 0.4);
          roundRect(g, xa + 1, y, xb - xa - 2, h, h / 2);
          g.fill();
          let txt = label(v);
          g.font = `700 ${fs(11, 10.5)}px ${theme.font}`;
          if (txt && g.measureText(txt).width >= xb - xa - 8) txt = txt.slice(0, 1);
          if (txt && g.measureText(txt).width < xb - xa - 6) {
            g.fillStyle = theme.dark ? '#f4f7fb' : '#1b2533';
            g.textAlign = 'center';
            g.textBaseline = 'middle';
            g.fillText(txt, (xa + xb) / 2, y + h / 2 + 0.5);
          }
        }
        g.restore();
      }
    }

    /** Viele Merkmale (z. B. sin(3x)): nur Punkte, keine Beschriftungen. */
    const crowded = () => feat.ext.length + feat.infl.length > 6;

    /** Hoch-, Tief-, Wende- und Sattelpunkte von f. */
    function drawFeaturesTop(V: View, now: number, alpha: number, story: boolean): void {
      const r = plot.rect;
      const sk = story ? stepsK(now) : { ext: 1, infl: 1 };
      for (const e of feat.ext) {
        const a = alpha * sk.ext;
        const y = V.fn.f(e.x);
        const color = e.kind === 'saddle' ? col.t() : e.kind === 'max' ? col.pos() : col.neg();
        dot(plot.px(e.x), plot.py(y), color, 5.5 * ease.outBack(clamp01(sk.ext * 1.2)), a);
        const lab = e.kind === 'saddle' ? say(L('SP', 'SP')) : e.kind === 'max' ? say(L('HP', 'max')) : say(L('TP', 'min'));
        const up = e.kind !== 'min';
        if (!crowded()) fpill(plot.px(e.x), plot.py(y) + (up ? -19 : 19), `\\t{${lab}${e.kink ? say(L(' (Knick)', ' (kink)')) : ''}}`, { size: fs(11.5, 11), alpha: a * 0.95, color, border: withAlpha(color, 0.5), bounds: r });
      }
      for (const w of feat.infl) {
        if (w.saddle) continue;
        const a = alpha * sk.infl;
        const y = V.fn.f(w.x);
        dot(plot.px(w.x), plot.py(y), col.dd(), 5 * ease.outBack(clamp01(sk.infl * 1.2)), a, true);
        const m = V.fn.d1(w.x);
        if (!crowded()) fpill(plot.px(w.x) + (m >= 0 ? -12 : 12), plot.py(y) - 16, `\\t{${say(L('WP', 'infl.'))}}`, { align: m >= 0 ? 'right' : 'left', size: fs(11.5, 11), alpha: a * 0.95, color: col.dd(), border: withAlpha(col.dd(), 0.5), bounds: r });
      }
    }

    /** Ansicht „Tangente läuft“: P, Tangente und Steigungsdreieck. */
    function drawTangentTop(V: View, alpha: number): void {
      const r = plot.rect;
      const x = V.x;
      const y = V.fn.f(x);
      const m = V.fn.d1(x);
      if (!Number.isFinite(y)) return;
      const nm = names();
      const span = (rng.x1.v - rng.x0.v) * 0.2;
      const g = surface.g;
      if (Number.isFinite(m)) {
        g.save();
        g.globalAlpha *= alpha;
        plot.segment([x - span, y - m * span], [x + span, y + m * span], { color: col.t(), width: 2.4 });
        g.restore();
        const D0 = V.fn.dom;
        const dX = V.dX;
        const dir = x + dX <= D0[1] + 1e-9 ? 1 : -1;
        const mv = cnt('top.m', m);
        slopeTriangle(plot, x, y, m, dir * dX, col.t(), alpha * kTri.v, {
          dx: `Δ${nm.v} = ${N(dX, 2)}`,
          dy: `\\c{t}{Δy ${show() ? `≈ ${NV(mv * dX)}` : '= ?'}}`,
        });
        if (show()) {
          const right = plot.px(x) < r.x + r.w * 0.62;
          const yy = clamp(plot.py(y) + (m > 0 ? 34 : -34), r.y + 48, r.y + r.h - 16);
          fpill(plot.px(x) + (right ? 14 : -14), yy, `\\c{t}{m ≈ ${NV(mv)}}`, { align: right ? 'left' : 'right', size: fs(12, 11), alpha: alpha * (1 - kTri.v * 0.999), bounds: r, border: withAlpha(col.t(), 0.5) });
        }
      } else {
        fpill(plot.px(x), plot.py(y) - 34, `\\c{n}{${say(L('keine Tangente (Knick)', 'no tangent (kink)'))}}`, { size: fs(11.5, 11), alpha, bounds: r, border: withAlpha(col.neg(), 0.5) });
      }
      halo(plot.px(x), plot.py(y), col.f(), 18, alpha * (sweep ? 1 : 0.55));
      dot(plot.px(x), plot.py(y), col.f(), 6.5, alpha);
      fpill(plot.px(x) - 12, plot.py(y) - 18, '\\c{f}{P}', { align: 'right', size: fs(12.5, 11.5), alpha: alpha * 0.95, color: col.f(), bounds: r });
    }

    /** Ansicht „Sekante → Tangente“: P, Q, Sekante, Tangente und Steigungsdreieck. */
    function drawSecantTop(V: View, alpha: number): void {
      const g = surface.g;
      const r = plot.rect;
      const fn = V.fn;
      const x = V.x;
      const h = V.h;
      const sd = side();
      const [xa, xb] = secantEnds(x, h, sd);
      const ya = fn.f(xa);
      const yb = fn.f(xb);
      const yP = fn.f(x);
      const nm = names();
      const os = oneSided(fn, x);
      // Tangente bzw. einseitige Tangenten (gestrichelt)
      const span = (rng.x1.v - rng.x0.v) * 0.6;
      g.save();
      g.globalAlpha *= alpha;
      if (os.differentiable) plot.segment([x - span, yP - os.right * span], [x + span, yP + os.right * span], { color: withAlpha(col.t(), 0.9), width: 2, dash: [7, 5] });
      else {
        plot.segment([x, yP], [x + span, yP + os.right * span], { color: withAlpha(col.t(), 0.9), width: 2, dash: [7, 5] });
        plot.segment([x - span, yP - os.left * span], [x, yP], { color: withAlpha(col.l(), 0.9), width: 2, dash: [7, 5] });
      }
      g.restore();
      if (!Number.isFinite(ya) || !Number.isFinite(yb)) {
        fpill(plot.px(x), plot.py(yP) - 40, `\\c{n}{${say(L('Q liegt außerhalb des Definitionsbereichs', 'Q lies outside the domain'))}}`, { size: fs(11.5, 11), alpha, bounds: r, border: withAlpha(col.neg(), 0.5) });
      } else {
        const ms = (yb - ya) / (xb - xa);
        const msC = cnt('sek.m', ms);
        // Sekante (über die ganze Breite)
        const L0 = rng.x0.v;
        const L1 = rng.x1.v;
        g.save();
        g.globalAlpha *= alpha;
        plot.segment([L0, ya + ms * (L0 - xa)], [L1, ya + ms * (L1 - xa)], { color: col.s(), width: 2.6 });
        g.restore();
        // Steigungsdreieck zwischen den Sekantenpunkten
        const ta = alpha * kTri.v;
        if (ta > 0.01 && Math.abs(plot.px(xb) - plot.px(xa)) > 6) {
          g.save();
          g.globalAlpha *= ta;
          g.fillStyle = withAlpha(col.s(), th().dark ? 0.18 : 0.1);
          g.beginPath();
          g.moveTo(plot.px(xa), plot.py(ya));
          g.lineTo(plot.px(xb), plot.py(ya));
          g.lineTo(plot.px(xb), plot.py(yb));
          g.closePath();
          g.fill();
          g.lineCap = 'round';
          g.strokeStyle = withAlpha(th().muted, 0.95);
          g.lineWidth = 1.8;
          g.beginPath();
          g.moveTo(plot.px(xa), plot.py(ya));
          g.lineTo(plot.px(xb), plot.py(ya));
          g.stroke();
          g.strokeStyle = col.s();
          g.lineWidth = 3.4;
          g.beginPath();
          g.moveTo(plot.px(xb), plot.py(ya));
          g.lineTo(plot.px(xb), plot.py(yb));
          g.stroke();
          g.restore();
          const sz = fs(11.5, 11);
          if (Math.abs(plot.px(xb) - plot.px(xa)) > 50) fpill((plot.px(xa) + plot.px(xb)) / 2, plot.py(ya) + (ms >= 0 ? 15 : -15), `\\c{m}{Δ${nm.v} = ${sd === 'c' ? '2h' : 'h'} = ${N(xb - xa, 3)}}`, { size: sz, alpha: ta * 0.92, color: th().muted, bounds: r });
          if (Math.abs(plot.py(yb) - plot.py(ya)) > 18) {
            const right = plot.px(xb) < r.x + r.w - 120;
            fpill(plot.px(xb) + (right ? 10 : -10), clamp((plot.py(ya) + plot.py(yb)) / 2, r.y + 44, r.y + r.h - 14), `\\c{s}{Δy ${show() ? `≈ ${NV(yb - ya)}` : '= ?'}}`, { align: right ? 'left' : 'right', size: sz, alpha: ta, bounds: r, border: withAlpha(col.s(), 0.55) });
          }
        }
        // Punkte
        const qs = sd === 'r' ? [xb] : sd === 'l' ? [xa] : [xa, xb];
        for (const qx of qs) {
          halo(plot.px(qx), plot.py(fn.f(qx)), col.s(), 16, alpha * 0.6);
          dot(plot.px(qx), plot.py(fn.f(qx)), col.s(), 6, alpha);
        }
        const qMain = sd === 'l' ? xa : xb;
        fpill(plot.px(qMain) + (qMain >= x ? 12 : -12), plot.py(fn.f(qMain)) - 18, sd === 'c' ? '\\c{s}{Q_2}' : '\\c{s}{Q}', { align: qMain >= x ? 'left' : 'right', size: fs(12.5, 11.5), alpha: alpha * 0.95, color: col.s(), bounds: r });
        if (sd === 'c') fpill(plot.px(xa) - 12, plot.py(ya) - 18, '\\c{s}{Q_1}', { align: 'right', size: fs(12.5, 11.5), alpha: alpha * 0.95, color: col.s(), bounds: r });
        // Steigung der Sekante (Pille oben rechts)
        const src = `\\c{s}{m_s ${show() ? `≈ ${NV(msC)}` : '= ?'}}   \\c{t}{m_t ${show() ? (os.differentiable ? `≈ ${NV(cnt('sek.mt', os.right))}` : say(L('existiert nicht', 'does not exist'))) : '= ?'}}`;
        fpill(r.x + r.w - 10, r.y + 52, src, { align: 'right', size: fs(12, 11), alpha, bounds: r });
      }
      halo(plot.px(x), plot.py(yP), col.f(), 18, alpha * 0.55);
      dot(plot.px(x), plot.py(yP), col.f(), 6.5, alpha);
      fpill(plot.px(x) + (sd === 'l' ? 12 : -12), plot.py(yP) + 18, '\\c{f}{P}', { align: sd === 'l' ? 'left' : 'right', size: fs(12.5, 11.5), alpha: alpha * 0.95, color: col.f(), bounds: r });
    }

    /* =====================================================================
     * Zweites Bild: Graph von f′ (Spur, Merkmale, eigene Skizze)
     * ===================================================================== */
    function drawSecondD(V: View, now: number, k: Intro, alpha: number): void {
      const g = surface.g;
      const theme = th();
      const an = axisNames();
      plotD.setAxes({ x: { label: an.x }, y: { label: an.d } });
      plotD.setRangePadded([rng.x0.v, rng.x1.v], [rng.dy0.v, rng.dy1.v], PAD());
      plotD.resize();
      g.save();
      g.globalAlpha *= alpha;
      plotD.begin();
      plotD.grid();
      plotD.axes();
      const r = plotD.rect;
      const w = (m: Mode) => mw[m].v;
      const [x0, x1] = [rng.x0.v, rng.x1.v];
      const fn = V.fn;
      const br = breaksD(fn);
      const sk = stepsK(now);
      // Merkmale: Vorzeichen von f′ als Fläche, ganzer Graph
      const kFeat = w('feat');
      if (kFeat > 0.01) {
        fillSigned(plotD, fn.d1, x0, lerp(x0, x1, k.dReveal), kFeat * sk.bands, br);
        strokePts(sample(plotD, fn.d1, x0, lerp(x0, x1, k.dReveal), br), col.d(), fs(3.2, 2.7), { glow: true, alpha: kFeat });
      }
      // Spur (Tangente läuft)
      const kTr = w('trace');
      if (kTr > 0.01) {
        if (kFull.v > 0.01) strokePts(sample(plotD, fn.d1, x0, x1, br), withAlpha(col.d(), 0.5), 2, { dash: [6, 5], alpha: kTr * kFull.v });
        const lo = Math.max(vis.lo, x0);
        const hi = Math.min(vis.hi, x1);
        fillSigned(plotD, fn.d1, lo, hi, kTr * 0.6, br);
        strokePts(sample(plotD, fn.d1, lo, hi, br), col.d(), fs(3.4, 2.8), { glow: true, alpha: kTr });
      }
      // Extrem- und Wendestellen (Nullstellen und Extrema von f′)
      const kMk = Math.max(kFeat * k.labels, (kTr + w('draw') * kSol.v) * kMarks.v * k.labels);
      if (kMk > 0.01) drawFeaturesD(V, now, kMk, kFeat > 0.5);
      // eigene Skizze
      if (w('draw') > 0.01) drawSketch(V, now, w('draw') * k.dReveal, k);
      // Punkt (x | f′(x)) mit Balken
      if (kTr > 0.01) drawPointD(V, kTr * k.labels);
      // Legende
      const src = fullSrc();
      const hide = !show() || (w('draw') > 0.5 && kSol.v < 0.5);
      const leg = hide ? `\\c{d}{${names().d}(${names().v}) = ?}` : `\\c{d}{${src.d}}`;
      const l2 = legendLeft(plotD, an.d, pillW(leg, fs(13, 12)));
      fpill(l2, r.y + 18, leg, { align: 'left', size: fs(13, 12), alpha: k.panel, border: withAlpha(col.d(), 0.5), maxW: r.x + r.w - 26 - l2 });
      void theme;
      plotD.end();
      g.restore();
    }

    /** Punkt (x | f′(x)), Balken der Höhe f′(x) und, mit f″, die Tangente an f′. */
    function drawPointD(V: View, alpha: number): void {
      const g = surface.g;
      const r = plotD.rect;
      const x = V.x;
      const d = V.fn.d1(x);
      if (!Number.isFinite(d)) return;
      const px = plotD.px(x);
      const py = plotD.py(d);
      const y0 = plotD.py(0);
      // Balken: Höhe = Steigung (gleiche Farbe wie die senkrechte Kathete oben)
      g.save();
      g.globalAlpha *= alpha;
      const grad = g.createLinearGradient(0, py, 0, y0);
      grad.addColorStop(0, col.t());
      grad.addColorStop(1, withAlpha(col.t(), 0.3));
      g.fillStyle = grad;
      roundRect(g, px - 3, Math.min(py, y0), 6, Math.abs(y0 - py), 3);
      g.fill();
      g.restore();
      // Tangente an f′ (Steigung f″), wenn f″ gezeigt wird
      const dd = V.fn.d2(x);
      if (kD2.v > 0.01 && Number.isFinite(dd)) {
        const span = (rng.x1.v - rng.x0.v) * 0.12;
        g.save();
        g.globalAlpha *= alpha * kD2.v;
        plotD.segment([x - span, d - dd * span], [x + span, d + dd * span], { color: col.dd(), width: 2.2 });
        g.restore();
      }
      halo(px, py, col.d(), 18, alpha * (sweep ? 1 : 0.55));
      dot(px, py, col.d(), 6.5, alpha);
      if (show()) {
        const nm = names();
        const v = cnt('d.pt', d);
        const right = px < r.x + r.w * 0.66;
        fpill(px + (right ? 14 : -14), clamp(py + (d >= 0 ? -20 : 20), r.y + 48, r.y + r.h - 18), `\\c{d}{(${N(x, 2)} | ${NV(v)})}`, { align: right ? 'left' : 'right', size: fs(12, 11), alpha, bounds: r, border: withAlpha(col.d(), 0.5) });
        void nm;
      }
    }

    /** Nullstellen von f′ (Extremstellen von f) und Extrema von f′ (Wendestellen von f). */
    function drawFeaturesD(V: View, now: number, alpha: number, story: boolean): void {
      const r = plotD.rect;
      const sk = story ? stepsK(now) : { ext: 1, infl: 1 };
      const fn = V.fn;
      for (const e of feat.ext) {
        const a = alpha * sk.ext;
        const color = e.kind === 'saddle' ? col.t() : e.kind === 'max' ? col.pos() : col.neg();
        if (e.kink) {
          // f′ springt: offene Punkte links und rechts
          const l = fn.d1(e.x - 1e-6);
          const rr = fn.d1(e.x + 1e-6);
          dot(plotD.px(e.x), plotD.py(l), col.d(), 5, a, true);
          dot(plotD.px(e.x), plotD.py(rr), col.d(), 5, a, true);
          if (!crowded()) fpill(plotD.px(e.x), plotD.py(0) + 18, `\\t{${say(L('Sprung von f′', 'jump of f′'))}}`, { size: fs(11, 10.5), alpha: a * 0.95, color, bounds: r });
          continue;
        }
        dot(plotD.px(e.x), plotD.py(0), color, 5.5, a, true);
        const lab = e.kind === 'saddle' ? say(L('ohne VZW', 'no sign change')) : e.kind === 'max' ? '+ → −' : '− → +';
        const below = fn.d1(e.x + (rng.x1.v - rng.x0.v) * 0.02) > 0 || e.kind === 'saddle';
        if (!crowded()) fpill(plotD.px(e.x), plotD.py(0) + (below ? 18 : -18), `\\t{${lab}}`, { size: fs(11, 10.5), alpha: a * 0.95, color, bounds: r });
      }
      for (const w of feat.infl) {
        const a = alpha * sk.infl;
        const y = fn.d1(w.x);
        dot(plotD.px(w.x), plotD.py(y), col.dd(), 5, a);
        const max = fn.d2(w.x - 1e-4) > 0;
        if (!w.saddle && !crowded()) fpill(plotD.px(w.x), plotD.py(y) + (max ? -17 : 17), `\\t{${max ? say(L('HP von f′', 'max of f′')) : say(L('TP von f′', 'min of f′'))}}`, { size: fs(11, 10.5), alpha: a * 0.9, color: col.dd(), bounds: r });
      }
    }

    /** Aufgabenmodus: eigene Skizze von f′, Lösung, Abweichung und Prüfung je Punkt. */
    function drawSketch(V: View, now: number, alpha: number, k: Intro): void {
      const g = surface.g;
      const theme = th();
      const r = plotD.rect;
      const nodes = V.fn.nodes;
      for (const xn of nodes) vguide(plotD.px(xn), r.y + 34, r.y + r.h, theme.muted, 0.35 * alpha, [2, 5]);
      const sp = spline(nodes, V.sk);
      const a = nodes[0]!;
      const b = nodes[nodes.length - 1]!;
      const ks = kSol.v;
      let hi = rng.x1.v;
      if (reveal) {
        const t = ease.inOutCubic(clamp01((now - reveal.t0) / reveal.dur));
        hi = lerp(rng.x0.v, rng.x1.v, t);
      }
      if (ks > 0.01) {
        const L0 = a;
        const H0 = Math.min(hi, b);
        if (H0 > L0) {
          const top = sample(plotD, sp.f, L0, H0, []).filter(([, y]) => Number.isFinite(y));
          const bot = sample(plotD, V.fn.d1, L0, H0, breaksD(V.fn))
            .filter(([, y]) => Number.isFinite(y))
            .reverse();
          g.save();
          g.globalAlpha *= alpha * ks;
          g.fillStyle = withAlpha(col.neg(), theme.dark ? 0.22 : 0.12);
          g.beginPath();
          [...top, ...bot].forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
          g.closePath();
          g.fill();
          g.restore();
        }
        strokePts(sample(plotD, V.fn.d1, rng.x0.v, hi, breaksD(V.fn)), col.d(), fs(3.2, 2.7), { glow: true, alpha: alpha * ks });
      }
      strokePts(sample(plotD, sp.f, a, lerp(a, b, k.dReveal), []), col.sk(), fs(3, 2.6), { glow: true, alpha, dash: ks > 0.5 ? [8, 5] : undefined });
      nodes.forEach((xn, i) => {
        const py = plotD.py(V.sk[i]!);
        halo(plotD.px(xn), py, col.sk(), 15, alpha * 0.5);
        dot(plotD.px(xn), py, col.sk(), 6, alpha * ease.outBack(clamp01(k.stagger * 3 - i * 0.2)));
      });
      if (rating && ks > 0.5) {
        rating.checks.forEach((c, i) => {
          const ym = Math.max(c.got, Number.isFinite(c.want) ? c.want : c.got);
          const color = c.ok ? col.pos() : col.neg();
          fpill(plotD.px(c.x), plotD.py(ym) - 20, `\\t{${c.ok ? '✓' : '✗'}}`, { size: fs(12, 11), alpha: alpha * (ks - 0.5) * 2 * clamp01(k.stagger * 4 - i * 0.3), color, border: withAlpha(color, 0.6), bounds: r });
        });
      }
    }

    /* =====================================================================
     * Drittes Bild: f″
     * ===================================================================== */
    function drawThirdDD(V: View, now: number, k: Intro, alpha: number): void {
      if (!panels().bot || alpha <= 0.01) return;
      const g = surface.g;
      const an = axisNames();
      plotDD.setAxes({ x: { label: an.x }, y: { label: an.dd } });
      plotDD.setRangePadded([rng.x0.v, rng.x1.v], [rng.ddy0.v, rng.ddy1.v], { ...PAD(), top: fs(36, 32) });
      plotDD.resize();
      g.save();
      g.globalAlpha *= alpha;
      plotDD.begin();
      plotDD.grid();
      plotDD.axes();
      const r = plotDD.rect;
      const w = (m: Mode) => mw[m].v;
      const [x0, x1] = [rng.x0.v, rng.x1.v];
      const fn = V.fn;
      const br = breaksDD(fn);
      const sk = stepsK(now);
      const kFeat = w('feat');
      if (kFeat > 0.01) {
        fillSigned(plotDD, fn.d2, x0, lerp(x0, x1, k.dReveal), kFeat * sk.curv, br);
        strokePts(sample(plotDD, fn.d2, x0, lerp(x0, x1, k.dReveal), br), col.dd(), fs(3, 2.6), { glow: true, alpha: kFeat });
        for (const wp of feat.infl) {
          dot(plotDD.px(wp.x), plotDD.py(0), col.dd(), 5, kFeat * sk.infl * k.labels, true);
        }
      }
      const kTr = w('trace');
      if (kTr > 0.01) {
        if (kFull.v > 0.01) strokePts(sample(plotDD, fn.d2, x0, x1, br), withAlpha(col.dd(), 0.5), 1.8, { dash: [6, 5], alpha: kTr * kFull.v });
        const lo = Math.max(vis.lo, x0);
        const hi = Math.min(vis.hi, x1);
        strokePts(sample(plotDD, fn.d2, lo, hi, br), col.dd(), fs(3, 2.6), { glow: true, alpha: kTr });
        const x = V.x;
        const dd = fn.d2(x);
        if (Number.isFinite(dd)) {
          halo(plotDD.px(x), plotDD.py(dd), col.dd(), 16, kTr * 0.5);
          dot(plotDD.px(x), plotDD.py(dd), col.dd(), 5.5, kTr * k.labels);
          if (show()) {
            const right = plotDD.px(x) < r.x + r.w * 0.66;
            fpill(plotDD.px(x) + (right ? 12 : -12), clamp(plotDD.py(dd) + (dd >= 0 ? -18 : 18), r.y + 44, r.y + r.h - 16), `\\c{D}{${names().dd}(${N(x, 2)}) ≈ ${NV(cnt('dd.pt', dd))}}`, { align: right ? 'left' : 'right', size: fs(11.5, 11), alpha: kTr * k.labels, bounds: r });
          }
        }
      }
      const src = fullSrc();
      const leg = show() ? `\\c{D}{${src.dd}}` : `\\c{D}{${names().dd}(${names().v}) = ?}`;
      const l3 = legendLeft(plotDD, an.dd, pillW(leg, fs(12.5, 11.5)));
      fpill(l3, r.y + 17, leg, { align: 'left', size: fs(12.5, 11.5), alpha: k.panel, border: withAlpha(col.dd(), 0.5), maxW: r.x + r.w - 26 - l3 });
      plotDD.end();
      g.restore();
    }

    /* =====================================================================
     * Zweites Bild in „Sekante → Tangente“: Differenzenquotient über h
     * ===================================================================== */
    function drawSecondQ(V: View, k: Intro, alpha: number): void {
      const g = surface.g;
      const theme = th();
      const nm = names();
      plotD.setAxes({ x: { label: 'h' }, y: { label: meta() ? `m in ${nm.uD}` : 'm' } });
      const H = rng.qh.v;
      plotD.setRangePadded([-H, H], [rng.qy0.v, rng.qy1.v], PAD());
      plotD.resize();
      g.save();
      g.globalAlpha *= alpha;
      plotD.begin();
      plotD.grid();
      plotD.axes();
      const r = plotD.rect;
      const fn = V.fn;
      const x = V.x;
      const qf = qFns(fn, x);
      const os = oneSided(fn, x);
      const sd = side();
      const rev = k.dReveal;
      // Grenzwert(e)
      const limCol = col.t();
      g.save();
      g.globalAlpha *= k.labels;
      if (os.differentiable) plotD.hline(os.right, { color: withAlpha(limCol, 0.85), width: 1.6, dash: [6, 5] });
      else {
        plotD.segment([0, os.right], [H, os.right], { color: withAlpha(limCol, 0.85), width: 1.6, dash: [6, 5] });
        plotD.segment([-H, os.left], [0, os.left], { color: withAlpha(col.l(), 0.85), width: 1.6, dash: [6, 5] });
      }
      g.restore();
      // beidseitiger Quotient (gerade Funktion von h)
      const kc = kSide.c.v;
      strokePts(sample(plotD, qf.cen, -H * rev, H * rev, [0]), col.c(), kc > 0.5 ? 2.8 : 1.6, { dash: kc > 0.5 ? undefined : [5, 5], alpha: 0.45 + 0.55 * kc, glow: kc > 0.5 });
      // einseitige Quotienten: links (h < 0) und rechts (h > 0)
      strokePts(sample(plotD, qf.one, -H * rev, -1e-9, []), col.l(), kSide.l.v > 0.5 ? 3 : 2, { glow: kSide.l.v > 0.5, alpha: 0.55 + 0.45 * kSide.l.v });
      strokePts(sample(plotD, qf.one, 1e-9, H * rev, []), col.s(), kSide.r.v > 0.5 ? 3 : 2, { glow: kSide.r.v > 0.5, alpha: 0.55 + 0.45 * kSide.r.v });
      // offene Punkte bei h = 0 (dort ist der Quotient nicht definiert)
      dot(plotD.px(0), plotD.py(os.right), os.differentiable ? limCol : col.s(), 5.5, k.labels, true);
      if (!os.differentiable) dot(plotD.px(0), plotD.py(os.left), col.l(), 5.5, k.labels, true);
      // aktueller Punkt
      const h = V.h;
      const hs = sd === 'l' ? -h : h;
      const m = sd === 'c' ? qf.cen(h) : qf.one(hs);
      const color = sd === 'r' ? col.s() : sd === 'l' ? col.l() : col.c();
      if (Number.isFinite(m)) {
        vguide(plotD.px(hs), plotD.py(m), plotD.py(0), color, 0.6 * k.labels);
        halo(plotD.px(hs), plotD.py(m), color, 18, k.labels * (shrink ? 1 : 0.6));
        dot(plotD.px(hs), plotD.py(m), color, 6.5, k.labels);
        const right = plotD.px(hs) < r.x + r.w * 0.62;
        const mv = cnt('q.m', m);
        fpill(plotD.px(hs) + (right ? 14 : -14), clamp(plotD.py(m) - 22, r.y + 46, r.y + r.h - 18), `\\c{${sd === 'r' ? 's' : sd === 'l' ? 'l' : 'c'}}{h = ${N(h, 3)}: m_s ${show() ? `≈ ${N(mv, 4)}` : '= ?'}}`, { align: right ? 'left' : 'right', size: fs(12, 11), alpha: k.labels, bounds: r, border: withAlpha(color, 0.55) });
      }
      // Beschriftung des Grenzwerts
      const lab = os.differentiable
        ? `\\c{t}{h → 0:  m_s → ${nm.d}(${N(x, 2)}) ${show() ? `${eq(os.right, 3)} ${N(cnt('q.lim', os.right), 3)}` : '= ?'}}`
        : `\\c{n}{${say(L('links', 'left'))} ${show() ? N(os.left, 2) : '?'} ≠ ${say(L('rechts', 'right'))} ${show() ? N(os.right, 2) : '?'}}`;
      fpill(r.x + r.w - 10, r.y + 18, lab, { align: 'right', size: fs(12, 11), alpha: k.labels, bounds: r, border: withAlpha(os.differentiable ? limCol : col.neg(), 0.55), maxW: r.w * 0.62 });
      fpill(r.x + 10, r.y + 18, say(L('Differenzenquotient m_s über h', 'Difference quotient m_s against h')), { align: 'left', size: fs(12.5, 11.5), alpha: k.panel, border: withAlpha(col.s(), 0.5), maxW: r.w * 0.36 });
      void theme;
      plotD.end();
      g.restore();
    }

    /* =====================================================================
     * Regeln: oberes und unteres Bild
     * ===================================================================== */
    function drawTopR(V: View, r0: RuleKey, k: Intro, alpha: number): void {
      const g = surface.g;
      const isProd = r0 === 'prod';
      const an = axisNames();
      plot.setAxes({ x: { label: isProd ? 'u' : r0 === 'fak' ? an.x : 'x' }, y: { label: isProd ? 'v' : r0 === 'fak' ? an.f : 'y' } });
      plot.setRangePadded([rng.rx0.v, rng.rx1.v], [rng.ry0.v, rng.ry1.v], PAD());
      plot.resize();
      g.save();
      g.globalAlpha *= alpha;
      plot.begin();
      plot.grid();
      plot.axes();
      const r = plot.rect;
      const [x0, x1] = [rng.rx0.v, rng.rx1.v];
      const xr = lerp(x0, x1, k.reveal);
      const x = V.x;
      const la = k.labels;
      const sz = fs(12, 11);
      if (r0 === 'fak') {
        const a = RK.v;
        strokePts(sample(plot, V.base.f, x0, xr, breaksF(V.base)), withAlpha(col.f(), 0.55), 2.2, { dash: [7, 5] });
        strokePts(sample(plot, V.fn.f, x0, xr, breaksF(V.fn)), col.f(), fs(3.2, 2.7), { glow: true });
        const yb = V.base.f(x);
        const ya = V.fn.f(x);
        const mb = V.base.d1(x);
        const dX = V.dX;
        slopeTriangle(plot, x, yb, mb, dX, th().muted, la * 0.8, { dy: `\\c{m}{Δy = ${N(mb * dX, 2)}}` });
        slopeTriangle(plot, x, ya, a * mb, dX, col.t(), la, { dx: `Δx = ${N(dX, 2)}`, dy: `\\c{t}{Δy = ${N(a, 2)} · ${N(mb * dX, 2)} ${eq(a * mb * dX)} ${N(a * mb * dX, 2)}}` });
        dot(plot.px(x), plot.py(yb), withAlpha(col.f(), 0.8), 5, la);
        dot(plot.px(x), plot.py(ya), col.f(), 6.5, la);
        const fs0 = fullSrc();
        fpill(r.x + 10, r.y + 18, `\\c{f}{y = ${N(a, 2)} · ${names().f}(${names().v})}   \\c{m}{${fs0.f}}`, { align: 'left', size: fs(13, 12), alpha: k.panel, border: withAlpha(col.f(), 0.5), maxW: r.w - 30 });
      } else if (r0 === 'sum') {
        strokePts(sample(plot, SUM.g, x0, xr), th().series[2]!, 2.2, { alpha: 0.85 });
        strokePts(sample(plot, SUM.h, x0, xr), th().series[5]!, 2.2, { alpha: 0.85 });
        strokePts(sample(plot, V.fn.f, x0, xr), col.f(), fs(3.2, 2.7), { glow: true });
        const dX = 1;
        const gy = SUM.g(x);
        const hy = SUM.h(x);
        const gm = SUM.dg(x);
        const hm = SUM.dh(x);
        const y = gy + hy;
        // Tangenten an g und h und an die Summe
        const span = (x1 - x0) * 0.12;
        g.save();
        g.globalAlpha *= la;
        plot.segment([x - span, gy - gm * span], [x + span, gy + gm * span], { color: th().series[2]!, width: 1.8 });
        plot.segment([x - span, hy - hm * span], [x + span, hy + hm * span], { color: th().series[5]!, width: 1.8 });
        plot.segment([x - span * 1.4, y - (gm + hm) * span * 1.4], [x + span * 1.4, y + (gm + hm) * span * 1.4], { color: col.t(), width: 2.4 });
        // Steigungsdreieck der Summe: senkrechte Kathete aus zwei Teilen
        g.fillStyle = withAlpha(col.t(), th().dark ? 0.16 : 0.09);
        g.beginPath();
        g.moveTo(plot.px(x), plot.py(y));
        g.lineTo(plot.px(x + dX), plot.py(y));
        g.lineTo(plot.px(x + dX), plot.py(y + gm + hm));
        g.closePath();
        g.fill();
        g.lineCap = 'round';
        g.strokeStyle = withAlpha(th().muted, 0.9);
        g.lineWidth = 1.6;
        g.beginPath();
        g.moveTo(plot.px(x), plot.py(y));
        g.lineTo(plot.px(x + dX), plot.py(y));
        g.stroke();
        g.lineWidth = 4;
        g.strokeStyle = th().series[2]!;
        g.beginPath();
        g.moveTo(plot.px(x + dX), plot.py(y));
        g.lineTo(plot.px(x + dX), plot.py(y + gm));
        g.stroke();
        g.strokeStyle = th().series[5]!;
        g.beginPath();
        g.moveTo(plot.px(x + dX), plot.py(y + gm));
        g.lineTo(plot.px(x + dX), plot.py(y + gm + hm));
        g.stroke();
        g.restore();
        dot(plot.px(x), plot.py(gy), th().series[2]!, 5, la);
        dot(plot.px(x), plot.py(hy), th().series[5]!, 5, la);
        dot(plot.px(x), plot.py(y), col.f(), 6.5, la);
        const right = plot.px(x + dX) < r.x + r.w - 150;
        // Beschriftungen der beiden Kathetenstücke, mindestens 26 px auseinander
        let yg = plot.py(y + gm / 2);
        let yh = plot.py(y + gm + hm / 2);
        if (Math.abs(yg - yh) < 26) {
          const mid = (yg + yh) / 2;
          const up = yh <= yg ? -1 : 1;
          yh = mid + up * 13;
          yg = mid - up * 13;
        }
        fpill(plot.px(x + dX) + (right ? 12 : -12), clamp(yg, r.y + 44, r.y + r.h - 14), `\\c{g}{Δg = g′ · 1 = ${N(gm, 2)}}`, { align: right ? 'left' : 'right', size: sz, alpha: la, bounds: r });
        fpill(plot.px(x + dX) + (right ? 12 : -12), clamp(yh, r.y + 44, r.y + r.h - 14), `\\c{h}{Δh = h′ · 1 = ${N(hm, 2)}}`, { align: right ? 'left' : 'right', size: sz, alpha: la, bounds: r });
        fpill(r.x + 10, r.y + 18, '\\c{g}{g(x) = 0,25x²}   \\c{h}{h(x) = \\t{sin} x}   \\c{f}{f = g + h}'.replace('0,25', lang === 'de' ? '0,25' : '0.25'), { align: 'left', size: fs(12.5, 11.5), alpha: k.panel, border: withAlpha(col.f(), 0.5), maxW: r.w - 30 });
      } else if (r0 === 'pow') {
        const n = Math.round(p.pn);
        strokePts(sample(plot, V.fn.f, x0, xr), col.f(), fs(3.2, 2.7), { glow: true });
        const y = V.fn.f(x);
        const m = V.fn.d1(x);
        const span = (x1 - x0) * 0.18;
        g.save();
        g.globalAlpha *= la;
        plot.segment([x - span, y - m * span], [x + span, y + m * span], { color: col.t(), width: 2.4 });
        g.restore();
        const dX = V.dX;
        const dir = x + dX <= V.fn.dom[1] + 1e-9 ? 1 : -1;
        slopeTriangle(plot, x, y, m, dir * dX, col.t(), la, { dx: `Δx = ${N(dX, 2)}`, dy: `\\c{t}{Δy ${eq(m * dX)} ${N(m * dX, 2)}}` });
        halo(plot.px(x), plot.py(y), col.f(), 18, la * 0.55);
        dot(plot.px(x), plot.py(y), col.f(), 6.5, la);
        fpill(r.x + 10, r.y + 18, `\\c{f}{f(x) = ${n === 0 ? '1 = x^0' : n === 1 ? 'x' : `x^{${n < 0 ? `−${-n}` : n}}`}}`, { align: 'left', size: fs(13, 12), alpha: k.panel, border: withAlpha(col.f(), 0.5) });
      } else if (r0 === 'prod') {
        drawProduct(V, k);
      } else {
        const kk = RK.v;
        strokePts(sample(plot, Math.sin, x0, xr), withAlpha(col.f(), 0.5), 2, { dash: [7, 5] });
        strokePts(sample(plot, V.fn.f, x0, xr), col.f(), fs(3.2, 2.7), { glow: true });
        const y = V.fn.f(x);
        const m = V.fn.d1(x);
        const dX = V.dX;
        const dir = x + dX <= x1 - 0.05 ? 1 : -1;
        slopeTriangle(plot, x, y, m, dir * dX, col.t(), la, { dx: `Δx = ${N(dX, 2)}`, dy: `\\c{t}{Δy ${eq(m * dX)} ${N(m * dX, 2)}}` });
        // gleicher Punkt der äußeren Funktion: u = k·x auf sin u
        const u = kk * x;
        if (u > x0 && u < x1 && Math.abs(kk) > 0.05) {
          const yu = Math.sin(u);
          const mu = Math.cos(u);
          const span = (x1 - x0) * 0.1;
          g.save();
          g.globalAlpha *= la * 0.85;
          plot.segment([u - span, yu - mu * span], [u + span, yu + mu * span], { color: th().muted, width: 1.8 });
          g.setLineDash([2, 4]);
          g.strokeStyle = withAlpha(th().muted, 0.8);
          g.lineWidth = 1.2;
          g.beginPath();
          g.moveTo(plot.px(x), plot.py(y));
          g.lineTo(plot.px(u), plot.py(yu));
          g.stroke();
          g.restore();
          dot(plot.px(u), plot.py(yu), th().muted, 5, la);
          fpill(plot.px(u), plot.py(yu) + (yu > 0 ? 18 : -18), `\\c{m}{u = k·x = ${N(u, 2)}}`, { size: fs(11, 10.5), alpha: la * 0.9, color: th().muted, bounds: r });
        }
        halo(plot.px(x), plot.py(y), col.f(), 18, la * 0.55);
        dot(plot.px(x), plot.py(y), col.f(), 6.5, la);
        fpill(r.x + 10, r.y + 18, `\\c{f}{f(x) = \\t{sin}(${N(kk, 2)}x)}   \\c{m}{\\t{sin} x}`, { align: 'left', size: fs(13, 12), alpha: k.panel, border: withAlpha(col.f(), 0.5) });
      }
      plot.end();
      g.restore();
    }

    /** Produktregel: Rechteck mit Breite u(x) und Höhe v(x), Zuwachs als drei Streifen. */
    function drawProduct(V: View, k: Intro): void {
      const g = surface.g;
      const theme = th();
      const r = plot.rect;
      const x = V.x;
      const dX = Math.min(V.dX, 4 - x);
      const inc = productIncrement(x, Math.max(0, dX));
      const { u, v, du, dv } = inc;
      const P = (a: number, b: number): [number, number] => [plot.px(a), plot.py(b)];
      const rect = (a0: number, b0: number, a1: number, b1: number, fill: string, stroke: string) => {
        const [px0, py0] = P(a0, b0);
        const [px1, py1] = P(a1, b1);
        g.fillStyle = fill;
        g.fillRect(Math.min(px0, px1), Math.min(py0, py1), Math.abs(px1 - px0), Math.abs(py1 - py0));
        g.strokeStyle = stroke;
        g.lineWidth = 1.6;
        g.strokeRect(Math.min(px0, px1) + 0.5, Math.min(py0, py1) + 0.5, Math.abs(px1 - px0), Math.abs(py1 - py0));
      };
      const grow = k.reveal;
      g.save();
      // Grundrechteck u · v
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.18)';
      g.shadowBlur = 10;
      g.shadowOffsetY = 3;
      rect(0, 0, u * grow, v * grow, withAlpha(col.f(), theme.dark ? 0.4 : 0.26), col.f());
      g.restore();
      const kl = k.labels;
      g.globalAlpha *= kl;
      rect(u, 0, u + du, v, withAlpha(th().series[3]!, theme.dark ? 0.5 : 0.36), th().series[3]!);
      rect(0, v, u, v + dv, withAlpha(th().series[4]!, theme.dark ? 0.5 : 0.36), th().series[4]!);
      rect(u, v, u + du, v + dv, withAlpha(col.neg(), theme.dark ? 0.55 : 0.4), col.neg());
      g.restore();
      const sz = fs(12, 11);
      const [cx, cy] = P(u / 2, v / 2);
      fpill(cx, cy, `\\c{f}{u · v ${show() ? `= ${N(u * v, 2)}` : ''}}`, { size: fs(13, 12), alpha: kl, bounds: r });
      const [sx, sy] = P(u + du / 2, v / 2);
      if (Math.abs(plot.px(u + du) - plot.px(u)) > 30) fpill(sx, sy, `\\c{u}{v · Δu}`, { size: sz, alpha: kl, bounds: r });
      else fpill(plot.px(u + du) + 10, sy, `\\c{u}{v · Δu}`, { align: 'left', size: sz, alpha: kl, bounds: r });
      const [tx, ty] = P(u / 2, v + dv / 2);
      if (Math.abs(plot.py(v + dv) - plot.py(v)) > 22) fpill(tx, ty, `\\c{v}{u · Δv}`, { size: sz, alpha: kl, bounds: r });
      else fpill(tx, plot.py(v + dv) - 14, `\\c{v}{u · Δv}`, { size: sz, alpha: kl, bounds: r });
      fpill(plot.px(u + du) + 10, plot.py(v + dv) - 14, `\\c{n}{Δu · Δv}`, { align: 'left', size: sz, alpha: kl * 0.95, bounds: r });
      // Maße
      fpill(plot.px(u / 2), plot.py(0) + 14, `u(x) = ${N(u, 2)}`, { size: fs(11, 10.5), alpha: kl, color: th().muted, bounds: r });
      fpill(r.x + 10, r.y + 18, `\\c{f}{f(x) = u(x) · v(x)}   \\c{m}{u = 1 + 0,5x,  v = 1 + 0,25x²}`.replace(/(\d),(\d)/g, lang === 'de' ? '$1,$2' : '$1.$2'), { align: 'left', size: fs(12.5, 11.5), alpha: k.panel, border: withAlpha(col.f(), 0.5), maxW: r.w - 30 });
      fpill(r.x + r.w - 10, r.y + 52, `x = ${N(x, 2)},  Δx = ${N(dX, 2)}`, { align: 'right', size: sz, alpha: kl, bounds: r });
    }

    function drawSecondR(V: View, r0: RuleKey, k: Intro, alpha: number): void {
      const g = surface.g;
      const an = axisNames();
      plotD.setAxes({ x: { label: r0 === 'fak' ? an.x : 'x' }, y: { label: r0 === 'fak' ? an.d : 'y' } });
      plotD.setRangePadded([r0 === 'prod' ? 0 : rng.rx0.v, r0 === 'prod' ? 4 : rng.rx1.v], [rng.rdy0.v, rng.rdy1.v], PAD());
      plotD.resize();
      g.save();
      g.globalAlpha *= alpha;
      plotD.begin();
      plotD.grid();
      plotD.axes();
      const r = plotD.rect;
      const x0 = r0 === 'prod' ? 0 : rng.rx0.v;
      const x1 = r0 === 'prod' ? 4 : rng.rx1.v;
      const xr = lerp(x0, x1, k.dReveal);
      const x = V.x;
      const la = k.labels;
      const sz = fs(12, 11);
      const fn = V.fn;
      let leg = '';
      if (r0 === 'fak') {
        strokePts(sample(plotD, V.base.d1, x0, xr, breaksD(V.base)), withAlpha(col.d(), 0.55), 2.2, { dash: [7, 5] });
        strokePts(sample(plotD, fn.d1, x0, xr, breaksD(fn)), col.d(), fs(3.2, 2.7), { glow: true });
        const yb = V.base.d1(x);
        const ya = fn.d1(x);
        if (Number.isFinite(ya) && Number.isFinite(yb)) {
          g.save();
          g.globalAlpha *= la;
          arrowPx(plotD.px(x) + 14, plotD.py(yb), plotD.px(x) + 14, plotD.py(ya), col.t(), 2, 8);
          g.restore();
          dot(plotD.px(x), plotD.py(yb), withAlpha(col.d(), 0.8), 5, la);
          dot(plotD.px(x), plotD.py(ya), col.d(), 6.5, la);
          fpill(plotD.px(x) + 24, (plotD.py(ya) + plotD.py(yb)) / 2, `\\c{t}{· ${N(RK.v, 2)}}`, { align: 'left', size: sz, alpha: la, bounds: r });
        }
        leg = `\\c{d}{y = ${N(RK.v, 2)} · ${names().d}(${names().v})}`;
      } else if (r0 === 'sum') {
        strokePts(sample(plotD, SUM.dg, x0, xr), th().series[2]!, 2.2, { alpha: 0.85 });
        strokePts(sample(plotD, SUM.dh, x0, xr), th().series[5]!, 2.2, { alpha: 0.85 });
        strokePts(sample(plotD, fn.d1, x0, xr), col.d(), fs(3.2, 2.7), { glow: true });
        const gm = SUM.dg(x);
        const hm = SUM.dh(x);
        const px = plotD.px(x);
        g.save();
        g.globalAlpha *= la;
        g.lineCap = 'round';
        g.lineWidth = 6;
        g.strokeStyle = th().series[2]!;
        g.beginPath();
        g.moveTo(px, plotD.py(0));
        g.lineTo(px, plotD.py(gm));
        g.stroke();
        g.strokeStyle = th().series[5]!;
        g.beginPath();
        g.moveTo(px, plotD.py(gm));
        g.lineTo(px, plotD.py(gm + hm));
        g.stroke();
        g.restore();
        dot(px, plotD.py(gm + hm), col.d(), 6.5, la);
        const right = px < r.x + r.w * 0.6;
        fpill(px + (right ? 14 : -14), clamp(plotD.py(gm + hm) - 18, r.y + 44, r.y + r.h - 16), `\\c{g}{${N(gm, 2)}} + \\c{h}{${N(hm, 2)}} = \\c{d}{${N(gm + hm, 2)}}`, { align: right ? 'left' : 'right', size: sz, alpha: la, bounds: r });
        leg = `\\c{g}{g′ = 0,5x}   \\c{h}{h′ = \\t{cos} x}   \\c{d}{f′ = g′ + h′}`.replace('0,5', lang === 'de' ? '0,5' : '0.5');
      } else if (r0 === 'pow') {
        const n = Math.round(p.pn);
        strokePts(sample(plotD, fn.d1, x0, xr), col.d(), fs(3.2, 2.7), { glow: true });
        const d = fn.d1(x);
        dot(plotD.px(x), plotD.py(d), col.d(), 6.5, la);
        const right = plotD.px(x) < r.x + r.w * 0.6;
        fpill(plotD.px(x) + (right ? 14 : -14), clamp(plotD.py(d) - 18, r.y + 44, r.y + r.h - 16), `\\c{d}{${n} · ${N(x, 2)}^{${n - 1 < 0 ? `−${1 - n}` : n - 1}} ${eq(d)} ${N(d, 2)}}`, { align: right ? 'left' : 'right', size: sz, alpha: la, bounds: r });
        leg = `\\c{d}{f′(x) = ${n === 0 ? '0' : n === 1 ? '1' : `${n} · x^{${n - 1 < 0 ? `−${1 - n}` : n - 1}}`}}`;
      } else if (r0 === 'prod') {
        strokePts(sample(plotD, fn.d1, x0, xr), col.d(), fs(3.2, 2.7), { glow: true });
        const dX = Math.min(V.dX, 4 - x);
        const d = fn.d1(x);
        const dqv = dX > 1e-9 ? productIncrement(x, dX).total / dX : d;
        dot(plotD.px(x), plotD.py(dqv), th().series[3]!, 5, la, true);
        dot(plotD.px(x), plotD.py(d), col.d(), 6.5, la);
        vguide(plotD.px(x), plotD.py(Math.max(d, dqv)), plotD.py(Math.min(d, dqv)), th().muted, la);
        const right = plotD.px(x) < r.x + r.w * 0.6;
        fpill(plotD.px(x) + (right ? 14 : -14), clamp(plotD.py(dqv) - 18, r.y + 44, r.y + r.h - 16), `\\c{u}{\\f{Δf}{Δx} ≈ ${N(dqv, 3)}}`, { align: right ? 'left' : 'right', size: sz, alpha: la, bounds: r });
        fpill(plotD.px(x) + (right ? 14 : -14), clamp(plotD.py(d) + 20, r.y + 44, r.y + r.h - 16), `\\c{d}{f′(${N(x, 2)}) = ${N(d, 3)}}`, { align: right ? 'left' : 'right', size: sz, alpha: la, bounds: r });
        leg = `\\c{d}{f′ = u′ · v + u · v′}`;
      } else {
        strokePts(sample(plotD, (t) => Math.cos(RK.v * t), x0, xr), withAlpha(col.d(), 0.5), 2, { dash: [7, 5] });
        strokePts(sample(plotD, fn.d1, x0, xr), col.d(), fs(3.2, 2.7), { glow: true });
        const d = fn.d1(x);
        const c0 = Math.cos(RK.v * x);
        g.save();
        g.globalAlpha *= la;
        arrowPx(plotD.px(x) + 14, plotD.py(c0), plotD.px(x) + 14, plotD.py(d), col.t(), 2, 8);
        g.restore();
        dot(plotD.px(x), plotD.py(c0), withAlpha(col.d(), 0.8), 5, la);
        dot(plotD.px(x), plotD.py(d), col.d(), 6.5, la);
        fpill(plotD.px(x) + 24, (plotD.py(c0) + plotD.py(d)) / 2, `\\c{t}{· k = ${N(RK.v, 2)}}`, { align: 'left', size: sz, alpha: la, bounds: r });
        leg = `\\c{d}{f′(x) = ${N(RK.v, 2)} · \\t{cos}(${N(RK.v, 2)}x)}   \\c{m}{\\t{cos}(kx)}`;
      }
      fpill(r.x + 10, r.y + 18, leg, { align: 'left', size: fs(12.5, 11.5), alpha: k.panel, border: withAlpha(col.d(), 0.5), maxW: r.w - 30 });
      plotD.end();
      g.restore();
    }

    /* ---------- Hilfslinien zwischen den Bildern ---------- */
    function drawLinks(V: View, k: Intro): void {
      const w = (m: Mode) => mw[m].v;
      const P = panels();
      const bottom = (P.bot ?? P.mid).y + (P.bot ?? P.mid).h;
      // Stelle x: von P bis ins untere Bild
      const a = (w('trace') + w('rule') * (rule() === 'prod' ? 0 : 1)) * k.labels;
      if (a > 0.01 && V.x >= rng.x0.v && V.x <= rng.x1.v) {
        const yv = V.fn.f(V.x);
        if (Number.isFinite(yv)) vguide(plot.px(V.x), plot.py(yv), bottom, col.t(), 0.42 * a, [2, 4]);
      }
      // Merkmale: Hilfslinien über alle Bilder
      const km = Math.max(w('feat'), (w('trace') + w('draw') * kSol.v) * kMarks.v) * k.labels * (1 - w('sek')) * (1 - w('rule'));
      if (km > 0.01) {
        const sk = w('feat') > 0.5 ? stepsK(frameNow) : { ext: 1, infl: 1 };
        const top = P.top.y + 34;
        for (const e of feat.ext) {
          const color = e.kind === 'saddle' ? col.t() : e.kind === 'max' ? col.pos() : col.neg();
          vguide(plot.px(e.x), top, bottom, color, 0.6 * km * sk.ext);
        }
        for (const wp of feat.infl) if (!wp.saddle) vguide(plot.px(wp.x), top, bottom, col.dd(), 0.6 * km * sk.infl);
      }
    }

    /* ---------- Fortschritt der Geschichten ---------- */
    /** „Merkmale Schritt für Schritt“: Monotonie, Extremstellen, Wendestellen, Krümmung. */
    function stepsK(now: number): { bands: number; ext: number; infl: number; curv: number; table: number } {
      if (!steps) return { bands: 1, ext: 1, infl: 1, curv: 1, table: 1 };
      const t = now - steps.t0;
      const e = (a: number, d: number) => ease.outCubic(clamp01((t - a) / d));
      return { bands: e(150, 800), ext: e(1200, 900), infl: e(2600, 900), curv: e(4000, 800), table: e(150, 4600) };
    }

    /* =====================================================================
     * Karten
     * ===================================================================== */
    type CardFn = (R: Rect, measure: boolean) => number;
    /** Zeile einer Karte: Formel (Kurzschrift) oder, mit `text`, umbrechender Fließtext. */
    type RowSpec = { src: string; color?: string; size?: number; weight?: number; gap?: number; at?: number; hl?: string; text?: boolean };
    const rowH = (b: FormulaBox) => Math.max(b.asc + b.desc, 15);

    /** Karte aus Formel- und Textzeilen (mit gestaffeltem Einblenden und Hervorhebung). */
    function formulaCard(R: Rect, measure: boolean, k: Intro, title: string, accent: string, rows: RowSpec[], right?: string): number {
      const g = surface.g;
      const pad = fs(14, 12);
      const maxW = R.w - 2 * pad - 4;
      const items = rows.map((r) => {
        const size = r.size ?? fs(13.5, 12.5);
        if (r.text) {
          const font = `${r.weight ?? 550} ${size}px ${th().font}`;
          const lines = wrapText(r.src, maxW, font);
          return { box: null, lines, font, h: lines.length * size * 1.3 };
        }
        const box = fit(r.src, maxW, size, r.color ?? th().text, r.weight ?? 600);
        return { box, lines: [] as string[], font: '', h: rowH(box) };
      });
      const h = 36 + items.reduce((s, it, i) => s + it.h + (rows[i]!.gap ?? 8), 0) + 4;
      if (measure) return h;
      card({ ...R, h }, accent);
      cardTitle(R, title, accent, right);
      let y = R.y + 36;
      items.forEach((it, i) => {
        const row = rows[i]!;
        const a = row.at ?? clamp01(k.stagger * (rows.length + 2) - i);
        g.save();
        g.globalAlpha *= ease.outCubic(a);
        if (row.hl) {
          g.fillStyle = withAlpha(row.hl, th().dark ? 0.2 : 0.12);
          roundRect(g, R.x + pad - 6, y - 3, R.w - 2 * pad + 12, it.h + 6, 7);
          g.fill();
        }
        const dx = (1 - ease.outCubic(a)) * 10;
        if (it.box) it.box.draw(g, R.x + pad + dx, y + it.box.asc);
        else {
          const size = row.size ?? fs(13.5, 12.5);
          g.font = it.font;
          g.fillStyle = row.color ?? th().text;
          g.textAlign = 'left';
          g.textBaseline = 'middle';
          it.lines.forEach((ln, j) => g.fillText(ln, R.x + pad + dx, y + size * 0.65 + j * size * 1.3));
        }
        g.restore();
        y += it.h + (row.gap ?? 8);
      });
      return h;
    }
    /** Fließtext-Zeile für Karten (gedämpft). */
    const note = (de: string, en: string, size = fs(12, 11)): RowSpec => ({ src: say(L(de, en)), text: true, size, color: th().muted, gap: 6 });

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

    /** f′(x) bzw. v(t) = s′(t) als Name an einer Stelle. */
    function dAt(x: number): string {
      const nm = names();
      return meta() ? `${nm.d}(${N(x, 2)}) = ${nm.f}′(${N(x, 2)})` : `${nm.d}(${N(x, 2)})`;
    }
    /** Zusatz: km/h oder Prozent. */
    function extraOf(v: number): string {
      const m = meta();
      if (!m?.extra || !show()) return '';
      return m.extra === 'kmh' ? `  \\c{m}{(≈ ${N(v * 3.6, 1)} km/h)}` : `  \\c{m}{(≈ ${N(v / 10, 1)} %)}`;
    }

    function fnCard(k: Intro): CardFn {
      return (R, measure) => {
        const src = fullSrc();
        const s = fnSrc();
        const rows: RowSpec[] = [
          { src: show() ? `\\c{f}{${src.f}}` : `\\c{f}{f(x)}`, size: fs(13.5, 12.5) },
          { src: show() ? `\\c{d}{${src.d}}` : `\\c{d}{f′(x) = ?}`, size: fs(13.5, 12.5) },
          { src: show() ? `\\c{D}{${src.dd}}` : `\\c{D}{f″(x) = ?}`, size: fs(13, 12) },
        ];
        if (s.note) rows.push({ src: s.note, text: true, size: fs(12, 11), color: th().muted });
        return formulaCard(R, measure, k, say(L('Funktion und Ableitungen', 'Function and derivatives')), col.d(), rows);
      };
    }

    /** Tangente läuft: Werte an der Stelle P. */
    function pointCard(V: View, k: Intro): CardFn {
      return (R, measure) => {
        const nm = names();
        const x = V.x;
        const fv = V.fn.f(x);
        const m = V.fn.d1(x);
        const dd = V.fn.d2(x);
        const fC = cnt('c.pt.f', fv);
        const mC = cnt('c.pt.m', m);
        const ddC = cnt('c.pt.dd', dd);
        const dX = V.dX;
        const ok = Number.isFinite(m);
        const state = !ok
          ? say(L('Knick: keine Tangente, nicht differenzierbar', 'kink: no tangent, not differentiable'))
          : Math.abs(m) < 1e-3 * Math.max(1, Math.abs(rng.dy1.goal - rng.dy0.goal))
            ? say(L('f′ = 0: waagrechte Tangente', 'f′ = 0: horizontal tangent'))
            : m > 0
              ? say(L('f′ > 0: f steigt', 'f′ > 0: f increases'))
              : say(L('f′ < 0: f fällt', 'f′ < 0: f decreases'));
        const stCol = !ok ? col.neg() : m > 0 ? col.pos() : m < 0 ? col.neg() : th().muted;
        const rows: RowSpec[] = [
          { src: `${nm.v} = ${N(x, 2)}${unit(nm.uX)}   \\c{f}{${nm.f}(${N(x, 2)}) ${show() ? `≈ ${NV(fC)}` : '= ?'}${unit(nm.uF)}}`, size: fs(13, 12) },
        ];
        if (kTri.v > 0.5 && ok) rows.push({ src: `\\c{t}{Δ${nm.v} = ${N(dX, 2)},  Δy = m · Δ${nm.v} ${show() ? `≈ ${NV(mC * dX)}` : '= ?'}}`, size: fs(13, 12) });
        rows.push({ src: `\\b{\\c{d}{${dAt(x)}} = \\c{t}{m} ${ok ? (show() ? `≈ ${NV(mC)}` : '= ?') : '–'}}${unit(nm.uD)}${ok ? extraOf(mC) : ''}`, size: fs(14.5, 13), hl: col.d() });
        if (kD2.v > 0.5 && Number.isFinite(dd)) rows.push({ src: `\\c{D}{${nm.dd}(${N(x, 2)}) ${show() ? `≈ ${NV(ddC)}` : '= ?'}}${unit(nm.uDD)}  \\c{m}{${say(L('(Steigung von f′)', '(slope of f′)'))}}`, size: fs(13, 12) });
        rows.push({ src: `\\t{${state}}`, size: fs(12.5, 11.5), color: stCol, hl: stCol, weight: 700 });
        return formulaCard(R, measure, k, say(L('An der Stelle P', 'At the point P')), col.t(), rows);
      };
    }

    /** Die Zusammenhänge f ↔ f′ mit Hervorhebung des gerade passenden. */
    function rulesCard(V: View, k: Intro): CardFn {
      return (R, measure) => {
        const x = V.x;
        const m = V.fn.d1(x);
        const D0 = V.fn.dom;
        const tol = (D0[1] - D0[0]) * 0.03;
        const nearExt = feat.ext.some((e) => e.kind !== 'saddle' && Math.abs(e.x - x) < tol);
        const nearSad = feat.ext.some((e) => e.kind === 'saddle' && Math.abs(e.x - x) < tol);
        const nearInfl = feat.infl.some((e) => Math.abs(e.x - x) < tol);
        const lines = [
          say(L('f′ > 0  ⇔  f steigt', 'f′ > 0  ⇔  f increases')),
          say(L('f′ < 0  ⇔  f fällt', 'f′ < 0  ⇔  f decreases')),
          say(L('f′ = 0 mit VZW  ⇒  Extremstelle', 'f′ = 0, sign change  ⇒  extremum')),
          say(L('f′ = 0 ohne VZW  ⇒  Terrassenpunkt', 'f′ = 0, no sign change  ⇒  saddle')),
          say(L('f′ extremal  ⇒  Wendestelle von f', 'f′ extremal  ⇒  inflection of f')),
        ];
        const act = [m > 0 && !nearExt && !nearSad, m < 0 && !nearExt && !nearSad, nearExt, nearSad, nearInfl];
        const hlCol = [col.pos(), col.neg(), col.d(), col.t(), col.dd()];
        const rows: RowSpec[] = lines.map((s, i) => ({ src: `\\t{${s}}`, size: fs(12.5, 11.5), weight: act[i] ? 700 : 600, color: act[i] ? th().text : withAlpha(th().text, 0.72), hl: act[i] ? hlCol[i] : undefined, gap: 9 }));
        if (kD2.v > 0.5) rows.push({ src: `\\c{D}{f″ > 0}: ∪ ${say(L('links', 'left'))},  \\c{D}{f″ < 0}: ∩ ${say(L('rechts', 'right'))}`, size: fs(12.5, 11.5) });
        return formulaCard(R, measure, k, say(L('Zusammenhänge', 'Relationships')), col.d(), rows);
      };
    }

    /** Sekante → Tangente: Differenzenquotient mit eingesetzten Zahlen. */
    function dqCard(V: View, k: Intro): CardFn {
      return (R, measure) => {
        const nm = names();
        const fn = V.fn;
        const x = V.x;
        const h = V.h;
        const sd = side();
        const [xa, xb] = secantEnds(x, h, sd);
        const fa = fn.f(xa);
        const fb = fn.f(xb);
        const ms = (fb - fa) / (xb - xa);
        const msC = cnt('c.dq.m', ms);
        const os = oneSided(fn, x);
        const def: Record<Side, string> = {
          r: `m_s = \\f{${nm.f}(${nm.v} + h) − ${nm.f}(${nm.v})}{h}`,
          l: `m_s = \\f{${nm.f}(${nm.v}) − ${nm.f}(${nm.v} − h)}{h}`,
          c: `m_s = \\f{${nm.f}(${nm.v} + h) − ${nm.f}(${nm.v} − h)}{2h}`,
        };
        const den = sd === 'c' ? N(2 * h, 3) : N(h, 3);
        const dig = clamp(Math.ceil(-Math.log10(Math.max(h, 1e-9))) + 2, 2, 6);
        const NF = (v: number) => (Math.abs(v) >= 100 ? NV(v) : N(v, dig));
        const okQ = Number.isFinite(fa) && Number.isFinite(fb);
        const rows: RowSpec[] = [
          { src: `\\c{s}{${def[sd]}}`, size: fs(14, 13), gap: 10 },
          okQ
            ? { src: `= \\f{${S(NF(fb))} − ${fa < 0 && show() ? `(${NF(fa)})` : S(NF(fa))}}{${den}} ${show() ? `${eq(ms, 4)} \\b{${N(msC, 4)}}` : '= ?'}`, size: fs(13.5, 12.5), gap: 10 }
            : { src: `\\c{n}{${say(L('Q außerhalb des Definitionsbereichs', 'Q outside the domain'))}}`, size: fs(12.5, 11.5) },
          {
            src: os.differentiable ? `\\c{t}{m_t = ${nm.d}(${N(x, 2)}) ${show() ? `${eq(os.right, 3)} ${N(cnt('c.dq.t', os.right), 3)}` : '= ?'}}${unit(nm.uD)}` : `\\c{n}{${say(L('keine Tangente: Knick', 'no tangent: kink'))}}`,
            size: fs(13.5, 12.5),
            hl: os.differentiable ? col.t() : col.neg(),
          },
        ];
        if (okQ && os.differentiable) rows.push({ src: `\\c{m}{${say(L('Abweichung', 'error'))} m_s − m_t ${show() ? `≈ ${fmt.signed(clean(ms - os.right, 4), 4)}` : '= ?'}}`, size: fs(12.5, 11.5), color: th().muted });
        rows.push(note('h → 0: Q wandert zu P, die Sekante dreht sich in die Tangente.', 'h → 0: Q moves to P, the secant turns into the tangent.'));
        return formulaCard(R, measure, k, say(L('Differenzenquotient', 'Difference quotient')), col.s(), rows, `h = ${N(h, 3)}`);
      };
    }

    /** Tabelle: h → 0, rechts, links, beidseitig. */
    function quotTableCard(V: View, k: Intro): CardFn {
      return (R, measure) => {
        const g = surface.g;
        const theme = th();
        const pad = fs(14, 12);
        const tab = quotientTable(V.fn.f, V.x, H_TAB);
        const rH = fs(21, 19);
        const h = 58 + (tab.length + 1) * rH + 6;
        if (measure) return h;
        card({ ...R, h }, col.s());
        cardTitle(R, say(L('Tabelle: h → 0', 'Table: h → 0')), col.s());
        const inner = R.w - 2 * pad;
        const cols = [R.x + pad, R.x + pad + inner * 0.47, R.x + pad + inner * 0.74, R.x + R.w - pad];
        const hy = R.y + 42;
        g.font = `700 ${fs(11.5, 11)}px ${theme.font}`;
        g.textBaseline = 'middle';
        g.textAlign = 'left';
        g.fillStyle = theme.muted;
        g.fillText('h', cols[0]!, hy);
        g.textAlign = 'right';
        g.fillStyle = col.s();
        g.fillText(say(L('rechts', 'right')), cols[1]!, hy);
        g.fillStyle = col.l();
        g.fillText(say(L('links', 'left')), cols[2]!, hy);
        g.fillStyle = col.c();
        g.fillText(say(L('beids.', 'sym.')), cols[3]!, hy);
        let best = 0;
        tab.forEach((t, i) => {
          if (Math.abs(Math.log(t.h / V.h)) < Math.abs(Math.log(tab[best]!.h / V.h))) best = i;
        });
        const val = (v: number) => (!show() ? '?' : Number.isFinite(v) ? fmt.num(clean(v, 4), 4) : '–');
        tab.forEach((t, i) => {
          const y = hy + 20 + i * rH;
          const a = clamp01(k.stagger * (tab.length + 2) - i);
          g.save();
          g.globalAlpha *= ease.outCubic(a);
          if (i === best) {
            g.fillStyle = withAlpha(col.s(), theme.dark ? 0.2 : 0.11);
            roundRect(g, R.x + pad - 6, y - rH / 2 + 1, inner + 12, rH - 2, 7);
            g.fill();
          }
          g.font = `650 ${fs(12, 11)}px ${theme.font}`;
          g.fillStyle = theme.text;
          g.textAlign = 'left';
          g.fillText(fmt.num(t.h, 3), cols[0]!, y);
          g.textAlign = 'right';
          g.fillText(val(t.r), cols[1]!, y);
          g.fillText(val(t.l), cols[2]!, y);
          g.fillText(val(t.c), cols[3]!, y);
          g.restore();
        });
        // Grenzwerte
        const os = oneSided(V.fn, V.x);
        const y = hy + 20 + tab.length * rH + 2;
        g.strokeStyle = withAlpha(theme.text, 0.22);
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(R.x + pad, y - rH / 2);
        g.lineTo(R.x + R.w - pad, y - rH / 2);
        g.stroke();
        g.font = `750 ${fs(12, 11)}px ${theme.font}`;
        g.textAlign = 'left';
        g.fillStyle = col.t();
        g.fillText('h → 0', cols[0]!, y + 2);
        g.textAlign = 'right';
        g.fillText(val(os.right), cols[1]!, y + 2);
        g.fillText(val(os.left), cols[2]!, y + 2);
        g.fillText(os.differentiable ? val(os.right) : '–', cols[3]!, y + 2);
        return h;
      };
    }

    /** Grenzwert und Differenzierbarkeit. */
    function limitCard(V: View, k: Intro): CardFn {
      return (R, measure) => {
        const os = oneSided(V.fn, V.x);
        const nm = names();
        const x = V.x;
        const rows: RowSpec[] = [
          { src: `\\c{s}{${say(L('rechts', 'right'))}: \\t{lim}_{h → 0^+} m_s ${show() ? `= ${N(os.right, 3)}` : '= ?'}}`, size: fs(13, 12) },
          { src: `\\c{l}{${say(L('links', 'left'))}: \\t{lim}_{h → 0^+} \\f{${nm.f}(${nm.v}) − ${nm.f}(${nm.v} − h)}{h} ${show() ? `= ${N(os.left, 3)}` : '= ?'}}`, size: fs(13, 12) },
        ];
        if (os.differentiable)
          rows.push({ src: `\\c{p}{✓} ${say(L('gleich: differenzierbar,', 'equal: differentiable,'))} \\c{d}{${nm.d}(${N(x, 2)}) ${show() ? `= ${N(os.right, 3)}` : '= ?'}}`, size: fs(13, 12), hl: col.pos() });
        else rows.push({ src: say(L('✗ verschieden: Knick – f ist an dieser Stelle nicht differenzierbar', '✗ different: kink – f is not differentiable at this point')), text: true, weight: 700, size: fs(12.5, 11.5), color: col.neg(), hl: col.neg() });
        rows.push(note('Beidseitig ist der Fehler etwa proportional zu h², einseitig zu h – darum nähert der beidseitige Quotient schneller.', 'The symmetric quotient’s error is roughly proportional to h², the one-sided one’s to h – so the symmetric quotient approaches faster.'));
        return formulaCard(R, measure, k, say(L('Grenzwert h → 0', 'Limit h → 0')), col.t(), rows);
      };
    }

    /** Merkmale: Vorzeichentabelle mit f′, f, f″ und Krümmung. */
    function signCard(V: View, now: number, k: Intro): CardFn {
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
        const cols = [R.x + pad, R.x + pad + inner * 0.44, R.x + pad + inner * 0.56, R.x + pad + inner * 0.69, R.x + R.w - pad];
        const hy = R.y + 42;
        const nm = names();
        g.font = `700 ${fs(11.5, 11)}px ${theme.font}`;
        g.fillStyle = theme.muted;
        g.textBaseline = 'middle';
        g.textAlign = 'left';
        g.fillText(say(L('Intervall', 'interval')), cols[0]!, hy);
        g.textAlign = 'center';
        g.fillStyle = col.d();
        g.fillText(nm.d, cols[1]!, hy);
        g.fillStyle = col.f();
        g.fillText(nm.f, cols[2]!, hy);
        g.fillStyle = col.dd();
        g.fillText(nm.dd, cols[3]!, hy);
        g.textAlign = 'right';
        g.fillStyle = theme.muted;
        const kw = say(L('Krümmung', 'curvature'));
        g.fillText(g.measureText(kw).width < cols[4]! - cols[3]! - 14 ? kw : '∪/∩', cols[4]!, hy);
        const sk = stepsK(now);
        const iv = (s: SignInterval) => {
          const lo = N(s.a, s.a <= V.fn.dom[0] + 1e-9 ? 1 : 2);
          const hi = N(s.b, 2);
          return lang === 'de' ? `]${lo}; ${hi}[` : `(${lo}, ${hi})`;
        };
        rows.forEach((s, i) => {
          const y = hy + 20 + i * rH;
          const a = Math.min(clamp01(k.stagger * (rows.length + 2) - i), clamp01(sk.table * (rows.length + 1) - i));
          g.save();
          g.globalAlpha *= ease.outCubic(a);
          g.font = `600 ${fs(12, 11)}px ${theme.font}`;
          g.fillStyle = theme.text;
          g.textAlign = 'left';
          let ivs = iv(s);
          while (g.measureText(ivs).width > cols[1]! - cols[0]! - 16 && ivs.length > 6) ivs = `${ivs.slice(0, -3)}…`;
          g.fillText(ivs, cols[0]!, y);
          g.textAlign = 'center';
          g.font = `800 ${fs(13, 12)}px ${theme.font}`;
          g.fillStyle = s.d1 > 0 ? col.pos() : s.d1 < 0 ? col.neg() : theme.muted;
          g.fillText(s.d1 > 0 ? '+' : s.d1 < 0 ? '−' : '0', cols[1]!, y);
          g.fillText(s.d1 > 0 ? '↗' : s.d1 < 0 ? '↘' : '→', cols[2]!, y);
          g.fillStyle = s.d2 > 0 ? col.dd() : s.d2 < 0 ? mixColor(col.dd(), theme.muted, 0.5) : theme.muted;
          g.fillText(s.d2 > 0 ? '+' : s.d2 < 0 ? '−' : '0', cols[3]!, y);
          g.textAlign = 'right';
          g.font = `600 ${fs(12, 11)}px ${theme.font}`;
          g.fillStyle = s.d2 > 0 ? col.dd() : theme.text;
          g.fillText(s.d2 > 0 ? say(L('∪ links', '∪ left')) : s.d2 < 0 ? say(L('∩ rechts', '∩ right')) : '–', cols[4]!, y);
          g.restore();
        });
        return h;
      };
    }

    /** Merkmale von f mit Begründung über f′ und f″. */
    function featCard(V: View, now: number, k: Intro): CardFn {
      return (R, measure) => {
        const nm = names();
        const sk = stepsK(now);
        const rows: RowSpec[] = [];
        for (const e of feat.ext.slice(0, 4)) {
          const xv = show() ? N(e.x, 2) : '?';
          const yv = show() ? NV(V.fn.f(e.x)) : '?';
          if (e.kind === 'saddle') rows.push({ src: `\\c{t}{${say(L('SP', 'SP'))}(${xv} | ${yv})}  \\c{m}{${nm.d} = 0, ${say(L('ohne VZW', 'no sign change'))}}`, size: fs(12.5, 11.5), at: sk.ext });
          else
            rows.push({
              src: `\\c{${e.kind === 'max' ? 'p' : 'n'}}{${e.kind === 'max' ? say(L('HP', 'Max')) : say(L('TP', 'Min'))}(${xv} | ${yv})}  \\c{m}{${e.kink ? say(L('Knick, f′ springt', 'kink, f′ jumps')) : `${nm.d} = 0, ${e.kind === 'max' ? '+ → −' : '− → +'}`}}`,
              size: fs(12.5, 11.5),
              at: sk.ext,
            });
        }
        for (const w of feat.infl.filter((q) => !q.saddle).slice(0, 3)) {
          const xv = show() ? N(w.x, 2) : '?';
          const yv = show() ? NV(V.fn.f(w.x)) : '?';
          const sl = show() ? NV(V.fn.d1(w.x)) : '?';
          rows.push({ src: `\\c{D}{WP(${xv} | ${yv})}  \\c{m}{${nm.dd} = 0 ${say(L('mit VZW', 'with sign change'))}, ${say(L('Steigung', 'slope'))} ${sl}}`, size: fs(12.5, 11.5), at: sk.infl });
        }
        if (!rows.length) rows.push(note('Keine Extrem- und Wendestellen im Bereich: f ist streng monoton, ohne Krümmungswechsel.', 'No extrema or inflection points in the range: f is strictly monotonic without a change of curvature.'));
        const nE = feat.ext.filter((e) => e.kind !== 'saddle').length;
        const nW = feat.infl.length;
        rows.push({ src: `\\c{m}{${nE} ${say(L(nE === 1 ? 'Extremstelle' : 'Extremstellen', nE === 1 ? 'extremum' : 'extrema'))}, ${nW} ${say(L(nW === 1 ? 'Wendestelle' : 'Wendestellen', nW === 1 ? 'inflection point' : 'inflection points'))}}`, size: fs(12, 11), color: th().muted, at: sk.infl });
        return formulaCard(R, measure, k, say(L('Merkmale von f', 'Features of f')), col.dd(), rows);
      };
    }

    /** Aufgabenmodus: Rückmeldung zur eigenen Skizze von f′. */
    function sketchCard(V: View, k: Intro): CardFn {
      return (R, measure) => {
        const nm = names();
        const nodes = V.fn.nodes;
        // Vorzeichenwechsel der Skizze zählen
        let skZ = 0;
        let last = 0;
        for (const v of V.sk) {
          const s = Math.abs(v) < 1e-9 ? 0 : Math.sign(v);
          if (s !== 0) {
            if (last !== 0 && s !== last) skZ++;
            last = s;
          }
        }
        const want = feat.ext.filter((e) => e.kind !== 'saddle' && !e.kink && e.x > nodes[0]! && e.x < nodes[nodes.length - 1]!).length;
        const r0 = rangeOf(V.fn.d1, nodes[0]!, nodes[nodes.length - 1]!, 80);
        const tolS = 0.06 * Math.max(r0.hi - r0.lo, 0.5);
        const signOk = nodes.filter((xn, i) => {
          const w = V.fn.d1(xn);
          const s = V.sk[i]!;
          return Number.isFinite(w) && (Math.abs(w) < tolS ? Math.abs(s) < 2 * tolS : Math.sign(w) === Math.sign(s) && Math.abs(s) > 1e-9);
        }).length;
        const rows: RowSpec[] = [];
        if (kSol.v < 0.5) {
          rows.push(note('Zieh die 7 Punkte im unteren Bild auf die Höhe der Steigung von f.', 'Drag the 7 points in the lower picture to the height of the slope of f.'));
          rows.push({ src: `${skZ === want ? '\\c{p}{✓}' : '\\c{n}{✗}'} ${say(L('Vorzeichenwechsel', 'sign changes'))}: ${say(L('deine', 'yours'))} ${skZ}, ${say(L('gesucht', 'wanted'))} ${want}`, size: fs(13, 12) });
          rows.push({ src: `${signOk >= nodes.length - 1 ? '\\c{p}{✓}' : '\\c{n}{✗}'} ${say(L('Vorzeichen stimmt an', 'sign is right at'))} ${signOk} ${say(L('von', 'of'))} ${nodes.length} ${say(L('Stellen', 'points'))}`, size: fs(13, 12) });
          rows.push(note('Tipp: Wo f steigt, liegt f′ über der x-Achse; wo f waagrecht ist, schneidet f′ die Achse.', 'Tip: where f increases, f′ lies above the x-axis; where f is level, f′ crosses the axis.'));
          return formulaCard(R, measure, k, say(L('Deine Skizze von f′', 'Your sketch of f′')), col.sk(), rows);
        }
        const rt = rating;
        if (!rt) return 0;
        const grades = [L('noch weit weg', 'still far off'), L('ungefähr', 'roughly'), L('gut', 'good'), L('sehr gut', 'very good')];
        const gc = [col.neg(), col.d(), col.pos(), col.pos()][rt.grade]!;
        const meanC = cnt('c.sk.mean', rt.mean);
        const okN = rt.checks.filter((c) => c.ok).length;
        rows.push({ src: `\\b{${say(grades[rt.grade]!)}}`, size: fs(16, 14), color: gc, hl: gc });
        rows.push({ src: `${say(L('mittlere Abweichung', 'mean deviation'))} ≈ ${NV(meanC)}${unit(nm.uD)}  \\c{m}{(${N(rt.rel * 100, 0)} %)}`, size: fs(13, 12) });
        rows.push({ src: `${say(L('Punkte', 'points'))}: ${okN} ${say(L('von', 'of'))} ${rt.checks.length} ${say(L('passen', 'fit'))},  ${skZ === want ? '\\c{p}{✓}' : '\\c{n}{✗}'} ${say(L('VZW', 'sign changes'))} ${skZ}/${want}`, size: fs(12.5, 11.5) });
        if (fnKey() !== 'own' || isApp()) rows.push({ src: `\\c{d}{${fullSrc().d}}`, size: fs(13, 12) });
        return formulaCard(R, measure, k, say(L('Vergleich mit f′', 'Comparison with f′')), gc, rows);
      };
    }

    /** Aufgabenmodus: Spickzettel. */
    function tipsCard(k: Intro): CardFn {
      return (R, measure) => {
        const rows: RowSpec[] = [
          { src: `${say(L('f steigt', 'f increases'))} ⇒ \\c{p}{f′ > 0},  ${say(L('f fällt', 'f decreases'))} ⇒ \\c{n}{f′ < 0}`, size: fs(12.5, 11.5) },
          { src: `${say(L('HP oder TP', 'max or min'))} ⇒ \\c{d}{${say(L('Nullstelle von f′', 'zero of f′'))}}`, size: fs(12.5, 11.5) },
          { src: `${say(L('Wendepunkt', 'inflection'))} ⇒ \\c{D}{${say(L('Extremum von f′', 'extremum of f′'))}}`, size: fs(12.5, 11.5) },
          note('Je steiler f, desto weiter ist f′ von der Achse entfernt. Die Höhe f(x) selbst spielt keine Rolle.', 'The steeper f, the further f′ is from the axis. The height f(x) itself does not matter.'),
        ];
        return formulaCard(R, measure, k, say(L('Spickzettel', 'Cheat sheet')), col.sk(), rows);
      };
    }

    /** Alltag: Größen, Einheiten, Deutung an der aktuellen Stelle. */
    function appCard(V: View, k: Intro): CardFn {
      return (R, measure) => {
        const m = meta();
        if (!m) return 0;
        const g = surface.g;
        const pad = fs(14, 12);
        const sz = fs(12.5, 11.5);
        const md = mode();
        const xAt = md === 'feat' || md === 'draw' ? NaN : V.x;
        const lines1 = `${m.f}: ${say(m.fName)} ${say(L('in', 'in'))} ${say(m.uF)}`;
        const lines2 = `${m.d} = ${m.f}′: ${say(m.dName)} ${say(L('in', 'in'))} ${say(m.uD)}`;
        const lines3 = `${m.dd} = ${m.f}″: ${say(m.ddName)} ${say(L('in', 'in'))} ${say(m.uDD)}`;
        let sentence = '';
        if (Number.isFinite(xAt)) {
          const fv = cnt('c.app.f', V.fn.f(xAt));
          const dv = cnt('c.app.d', V.fn.d1(xAt));
          const ex = m.extra === 'kmh' ? ` (≈ ${N(dv * 3.6, 1)} km/h)` : m.extra === 'pct' ? ` (≈ ${N(dv / 10, 1)} %)` : '';
          sentence = say(
            L(
              `Bei ${m.v} = ${N(xAt, 2)} ${say(m.uX)}: ${m.f} ≈ ${show() ? NV(fv) : '?'} ${say(m.uF)}, ${m.d} ≈ ${show() ? NV(dv) : '?'} ${say(m.uD)}${show() ? ex : ''}.`,
              `At ${m.v} = ${N(xAt, 2)} ${say(m.uX)}: ${m.f} ≈ ${show() ? NV(fv) : '?'} ${say(m.uF)}, ${m.d} ≈ ${show() ? NV(dv) : '?'} ${say(m.uD)}${show() ? ex : ''}.`,
            ),
          );
        }
        // wenig Platz (Handy): erst den Hinweis, dann den Satz weglassen
        let level = 2;
        const meas = (draw: boolean, y0: number) => {
          let y = y0;
          y += textBlock(R, y, lines1, col.f(), sz, draw, 650) + 2;
          y += textBlock(R, y, lines2, col.d(), sz, draw, 650) + 2;
          y += textBlock(R, y, lines3, col.dd(), sz, draw, 650) + (level > 0 ? 8 : 0);
          if (sentence && level >= 1) y += textBlock(R, y, sentence, th().text, sz + 0.5, draw, 650) + 6;
          if (level >= 2) y += textBlock(R, y, say(m.note), th().muted, sz - 0.5, draw, 500);
          return y - y0;
        };
        let h = 36 + meas(false, 0) + 10;
        while (h > R.h + 1 && level > 0) {
          level--;
          h = 36 + meas(false, 0) + 10;
        }
        if (measure) return h;
        card({ ...R, h }, col.d());
        cardTitle(R, say(m.title), col.d());
        g.save();
        g.globalAlpha *= ease.outCubic(k.stagger);
        meas(true, R.y + 36);
        g.restore();
        void pad;
        return h;
      };
    }

    /** Regel-Ansicht: Regel mit eingesetzten Zahlen. */
    function ruleCard(V: View, k: Intro): CardFn {
      return (R, measure) => {
        const r0 = rule();
        const x = V.x;
        const rows: RowSpec[] = [];
        let title = '';
        if (r0 === 'fak') {
          const a = RK.v;
          const fd = V.base.d1(x);
          title = say(L('Faktorregel', 'Constant multiple rule'));
          rows.push({ src: `\\b{(a · f(x))′ = a · f′(x)}`, size: fs(15, 13.5), hl: col.t() });
          rows.push({ src: `a = ${N(a, 2)},  \\c{d}{f′(${N(x, 2)}) ${S(`≈ ${N(fd, 3)}`)}}`, size: fs(13, 12) });
          rows.push({ src: `\\c{d}{(a · f)′(${N(x, 2)})} = ${N(a, 2)} · ${S(N(fd, 3))} ${show() ? `≈ \\b{${N(a * fd, 3)}}` : '= ?'}`, size: fs(13.5, 12.5) });
        } else if (r0 === 'sum') {
          const gm = SUM.dg(x);
          const hm = SUM.dh(x);
          title = say(L('Summenregel', 'Sum rule'));
          rows.push({ src: `\\b{(g + h)′ = g′ + h′}`, size: fs(15, 13.5), hl: col.t() });
          rows.push({ src: `\\c{g}{g′(x) = ${lang === 'de' ? '0,5' : '0.5'}x},  \\c{h}{h′(x) = \\t{cos} x}`, size: fs(13, 12) });
          rows.push({ src: `x = ${N(x, 2)}:  \\c{g}{${S(N(gm, 3))}} + \\c{h}{${S(N(hm, 3))}} ${show() ? `≈ \\b{\\c{d}{${N(gm + hm, 3)}}}` : '= ?'}`, size: fs(13.5, 12.5) });
        } else if (r0 === 'pow') {
          const n = Math.round(p.pn);
          const d = V.fn.d1(x);
          const e1 = n - 1 < 0 ? `−${1 - n}` : `${n - 1}`;
          title = say(L('Potenzregel', 'Power rule'));
          rows.push({ src: `\\b{(x^n)′ = n · x^{n − 1}}`, size: fs(15, 13.5), hl: col.t() });
          rows.push({ src: `n = ${n}:  \\c{d}{f′(x) = ${n === 0 ? '0' : `${n} · x^{${e1}}`}}`, size: fs(13.5, 12.5) });
          rows.push({ src: `\\c{d}{f′(${N(x, 2)})} ${show() ? `${eq(d)} \\b{${N(d, 3)}}` : '= ?'}`, size: fs(13.5, 12.5) });
          if (n === 2) rows.push({ src: `\\c{m}{\\f{(x + h)² − x²}{h} = 2x + h → 2x}`, size: fs(12.5, 11.5), color: th().muted });
          else if (n === 3) rows.push({ src: `\\c{m}{\\f{(x + h)³ − x³}{h} = 3x² + 3xh + h² → 3x²}`, size: fs(12.5, 11.5), color: th().muted });
        } else if (r0 === 'prod') {
          const u = PROD.u(x);
          const v = PROD.v(x);
          const du = PROD.du();
          const dv = PROD.dv(x);
          const d = du * v + u * dv;
          title = say(L('Produktregel', 'Product rule'));
          rows.push({ src: `\\b{(u · v)′ = u′ · v + u · v′}`, size: fs(15, 13.5), hl: col.t() });
          rows.push({ src: `u = ${N(u, 2)},  u′ = ${N(du, 2)},  v = ${N(v, 2)},  v′ = ${N(dv, 2)}`, size: fs(12.5, 11.5) });
          rows.push({ src: `\\c{d}{f′(${N(x, 2)})} = \\c{u}{${N(du, 2)} · ${N(v, 2)}} + \\c{v}{${N(u, 2)} · ${N(dv, 2)}} ${show() ? `${eq(d)} \\b{${N(d, 3)}}` : '= ?'}`, size: fs(13, 12) });
        } else {
          const kk = RK.v;
          const d = V.fn.d1(x);
          title = say(L('Kettenregel', 'Chain rule'));
          rows.push({ src: `\\b{(g(k · x))′ = k · g′(k · x)}`, size: fs(15, 13.5), hl: col.t() });
          rows.push({ src: `g = \\t{sin},  k = ${N(kk, 2)}:  \\c{d}{f′(x) = ${N(kk, 2)} · \\t{cos}(${N(kk, 2)}x)}`, size: fs(13, 12) });
          rows.push({ src: `\\c{d}{f′(${N(x, 2)})} = ${N(kk, 2)} · ${S(N(Math.cos(kk * x), 3))} ${show() ? `${eq(d)} \\b{${N(d, 3)}}` : '= ?'}`, size: fs(13.5, 12.5) });
        }
        return formulaCard(R, measure, k, title, col.t(), rows);
      };
    }

    /** Regel-Ansicht: Warum gilt die Regel? */
    function whyCard(V: View, k: Intro): CardFn {
      return (R, measure) => {
        const r0 = rule();
        const m = (de: string, en: string): RowSpec => note(de, en, fs(12.5, 11.5));
        const rows: RowSpec[] = [];
        if (r0 === 'fak') {
          rows.push(m('Alle Funktionswerte werden mit a multipliziert.', 'All function values are multiplied by a.'));
          rows.push(m('Im Steigungsdreieck bleibt Δx gleich, Δy wird a-mal so groß.', 'In the slope triangle Δx stays the same, Δy becomes a times as large.'));
          rows.push(m('a < 0: der Graph wird gespiegelt, alle Steigungen auch.', 'a < 0: the graph is reflected, all slopes as well.'));
        } else if (r0 === 'sum') {
          rows.push(m('Geht man um Δx weiter, wächst g um Δg und h um Δh.', 'Moving on by Δx, g grows by Δg and h by Δh.'));
          rows.push(m('Dann wächst g + h um Δg + Δh: die Kathete besteht aus zwei Stücken.', 'Then g + h grows by Δg + Δh: the leg consists of two pieces.'));
          rows.push(m('Teilen durch Δx und Δx → 0 ergibt g′ + h′.', 'Dividing by Δx and letting Δx → 0 gives g′ + h′.'));
        } else if (r0 === 'pow') {
          rows.push(m('Ausmultiplizieren: (x + h)ⁿ = xⁿ + n · xⁿ⁻¹ · h + Glieder mit h², h³ …', 'Expanding: (x + h)ⁿ = xⁿ + n · xⁿ⁻¹ · h + terms with h², h³ …'));
          rows.push(m('Nach dem Teilen durch h bleibt nur n · xⁿ⁻¹ übrig, der Rest geht gegen 0.', 'After dividing by h only n · xⁿ⁻¹ is left, the rest tends to 0.'));
          rows.push(m('Gilt auch für negative n (hier mit x > 0).', 'Also holds for negative n (here with x > 0).'));
        } else if (r0 === 'prod') {
          const dX = Math.min(V.dX, 4 - V.x);
          const inc = productIncrement(V.x, Math.max(0, dX));
          rows.push({ src: `Δf = \\c{u}{v · Δu} + \\c{v}{u · Δv} + \\c{n}{Δu · Δv}`, size: fs(13, 12) });
          rows.push({ src: `\\c{u}{${N(inc.vdu, 3)}} + \\c{v}{${N(inc.udv, 3)}} + \\c{n}{${N(inc.dudv, 3)}} = ${N(inc.total, 3)}`, size: fs(13, 12) });
          rows.push(m('Durch Δx teilen: das kleine Eckstück Δu · Δv / Δx geht für Δx → 0 gegen 0.', 'Divide by Δx: the small corner Δu · Δv / Δx tends to 0 as Δx → 0.'));
        } else {
          rows.push(m('sin(k · x) ist sin x, in x-Richtung mit dem Faktor 1/k gestaucht.', 'sin(k · x) is sin x compressed in x-direction by the factor 1/k.'));
          rows.push(m('Gleiche Höhenänderung auf k-mal kürzerem Weg: jede Steigung wird k-mal so groß.', 'Same change in height over a k times shorter distance: every slope becomes k times as large.'));
          rows.push(m('Innere Ableitung k mal äußere Ableitung cos(k · x).', 'Inner derivative k times outer derivative cos(k · x).'));
        }
        return formulaCard(R, measure, k, say(L('Warum?', 'Why?')), th().muted, rows);
      };
    }

    function cardsFor(m: Mode, V: View, now: number, k: Intro): CardFn[] {
      const tail = isApp() ? appCard(V, k) : fnCard(k);
      if (m === 'trace') return [pointCard(V, k), rulesCard(V, k), tail];
      if (m === 'sek') return [dqCard(V, k), quotTableCard(V, k), limitCard(V, k), ...(isApp() ? [appCard(V, k)] : [])];
      if (m === 'feat') return [signCard(V, now, k), featCard(V, now, k), tail];
      if (m === 'draw') return [sketchCard(V, k), tipsCard(k), ...(isApp() ? [appCard(V, k)] : [])];
      return [ruleCard(V, k), whyCard(V, k), ...(rule() === 'fak' ? [tail] : [])];
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
      const nm = names();
      const m = meta();
      const v = (t: string) => `<var>${t}</var>`;
      const x = lim(p.x);
      const md = mode();
      const d = fn.d1(x);
      const uD = m ? ` ${nm.uD}` : '';
      const dName = (t: string) => (m ? `${v(nm.d)}(${t})` : `${v('f')}′(${t})`);
      if (md === 'trace' || md === 'sek' || md === 'rule') {
        ctx.readout('slope', { html: Number.isFinite(d) ? `${dName(N(x, 2))} ${eq(d, 3)} ${N(d, 3)}${uD}` : say(L('nicht differenzierbar (Knick)', 'not differentiable (kink)')) });
      } else ctx.readout('slope', null);
      if (md === 'rule') ctx.readout('deriv', null);
      else ctx.readout('deriv', { html: `${toHtml(fullSrc().d)}${fnSrc().note ? ` (${fnSrc().note})` : ''}` });
      if (md === 'sek') {
        const os = oneSided(fn, x);
        const ms = dq(fn.f, x, p.h, side());
        ctx.readout('dq', {
          html: `${v('m')}<sub>s</sub> ≈ ${N(ms, 4)} (${v('h')} = ${N(p.h, 3)}) → ${os.differentiable ? `${dName(N(x, 2))} = ${N(os.right, 3)}` : say(L(`links ${N(os.left, 3)}, rechts ${N(os.right, 3)}: nicht differenzierbar`, `left ${N(os.left, 3)}, right ${N(os.right, 3)}: not differentiable`))}`,
        });
      } else ctx.readout('dq', null);
      if (md === 'feat' || md === 'trace') {
        const list = (xs: number[]) => (xs.length ? xs.map((t) => N(t, 3)).join('; ') : '–');
        const hp = feat.ext.filter((e) => e.kind === 'max').map((e) => e.x);
        const tp = feat.ext.filter((e) => e.kind === 'min').map((e) => e.x);
        const sp = feat.ext.filter((e) => e.kind === 'saddle').map((e) => e.x);
        ctx.readout('feat', {
          html: `${say(L('Hochstellen', 'Maxima'))}: ${list(hp)} · ${say(L('Tiefstellen', 'Minima'))}: ${list(tp)}${sp.length ? ` · ${say(L('Sattelstellen', 'Saddle points'))}: ${list(sp)}` : ''} · ${say(L('Wendestellen', 'Inflection points'))}: ${list(feat.infl.map((w) => w.x))}`,
        });
      } else ctx.readout('feat', null);
      if (md === 'draw' && rating) {
        const grades = [L('noch weit weg', 'still far off'), L('ungefähr', 'roughly'), L('gut', 'good'), L('sehr gut', 'very good')];
        ctx.readout('dev', {
          html: p.sol
            ? `<strong>${say(grades[rating.grade]!)}</strong> · ${say(L('mittlere Abweichung', 'mean deviation'))} ${NV(rating.mean)}${uD} · ${say(L('passende Punkte', 'fitting points'))} ${rating.checks.filter((c) => c.ok).length}/${rating.checks.length}`
            : say(L('Lösung noch verdeckt – „Lösung aufdecken“ vergleicht deine Skizze mit f′.', 'Solution still hidden – “Reveal the solution” compares your sketch with f′.')),
        });
      } else ctx.readout('dev', null);
      if (md === 'rule') {
        const r0 = rule();
        const txt: Record<RuleKey, string> = {
          fak: `(${v('a')} · ${v('f')})′ = ${v('a')} · ${v('f')}′: ${N(p.rk, 2)} · ${N(exactBase().d1(x), 3)} = ${N(d, 3)}`,
          sum: `(${v('g')} + ${v('h')})′ = ${v('g')}′ + ${v('h')}′: ${N(SUM.dg(x), 3)} + ${N(SUM.dh(x), 3)} = ${N(d, 3)}`,
          pow: `(${v('x')}<sup>${v('n')}</sup>)′ = ${v('n')} · ${v('x')}<sup>${v('n')} − 1</sup>; ${v('n')} = ${Math.round(p.pn)}: ${v('f')}′(${N(x, 2)}) = ${N(d, 3)}`,
          prod: `(${v('u')} · ${v('v')})′ = ${v('u')}′${v('v')} + ${v('u')}${v('v')}′ = ${N(PROD.du() * PROD.v(x), 3)} + ${N(PROD.u(x) * PROD.dv(x), 3)} = ${N(d, 3)}`,
          chain: `(sin(${v('k')}${v('x')}))′ = ${v('k')} · cos(${v('k')}${v('x')}): ${N(p.rk, 2)} · cos(${N(p.rk * x, 3)}) = ${N(d, 3)}`,
        };
        ctx.readout('rule', { html: txt[r0] });
      } else ctx.readout('rule', null);
      if (m) {
        const fe = feat;
        const parts: string[] = [];
        for (const e of fe.ext.filter((q) => q.kind !== 'saddle')) parts.push(`${e.kind === 'max' ? say(L('Maximum', 'maximum')) : say(L('Minimum', 'minimum'))} ${say(L('von', 'of'))} ${m.f} ${say(L('bei', 'at'))} ${m.v} ≈ ${N(e.x, 2)} ${say(m.uX)}`);
        for (const w of fe.infl) parts.push(`${say(L('stärkste Änderung', 'strongest change'))} (${m.d} = ${NV(fn.d1(w.x))} ${say(m.uD)}) ${say(L('bei', 'at'))} ${m.v} ≈ ${N(w.x, 2)} ${say(m.uX)}`);
        ctx.readout('sit', { html: parts.length ? parts.join(' · ') : say(L('keine Extrem- und Wendestellen im Bereich', 'no extrema or inflection points in the range')) });
      } else ctx.readout('sit', null);
    }

    /* ---------- Rendern ---------- */
    function contentFade(fade: { t0: number; from: string } | null, now: number): number {
      if (!fade) return 1;
      return ease.outCubic(clamp01((now - fade.t0) / 560));
    }
    function drawTop(id: string, V: View, now: number, k: Intro, alpha: number): void {
      if (id === 'F') drawTopF(V, now, k, alpha);
      else drawTopR(V, id.slice(2) as RuleKey, k, alpha);
    }
    function drawSecond(id: string, V: View, now: number, k: Intro, alpha: number): void {
      if (id === 'D') drawSecondD(V, now, k, alpha);
      else if (id === 'Q') drawSecondQ(V, k, alpha);
      else drawSecondR(V, id.slice(2) as RuleKey, k, alpha);
    }

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
      const chans: Chan[] = [X, DX, Hc, RK, kD2, kFull, kMarks, kTri, kSol, kSide.r, kSide.l, kSide.c, ...SK, ...Object.values(rng), ...Object.values(mw), ...Object.values(CC)];
      for (const c of chans) if (c.step(now, dt)) anim = true;
      if (sweep && now - sweep.t0 > sweep.dur) {
        sweep = null;
        X.jump(lim(p.x));
      }
      if (shrink && now - shrink.t0 > shrink.dur) {
        shrink = null;
        retargetRanges(now, false);
      }
      if (steps && now - steps.t0 > 5200) steps = null;
      if (reveal && now - reveal.t0 > reveal.dur) reveal = null;
      if (topFade && now - topFade.t0 > 560) topFade = null;
      if (secFade && now - secFade.t0 > 560) secFade = null;
      if (sweep || shrink || steps || reveal || topFade || secFade || intro !== null || dragging()) anim = true;
      const k = introState(now);
      const V = viewOf(now);
      if (mode() === 'trace') {
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
      // oberes Bild (beim Wechsel der Art überblendet)
      const tIn = contentFade(topFade, now);
      if (topFade && tIn < 1) {
        g.save();
        g.translate(0, -tIn * 8);
        drawTop(topFade.from, V, now, k, 1 - tIn);
        g.restore();
      }
      g.save();
      g.translate(0, (1 - tIn) * 12);
      drawTop(topId(), V, now, k, tIn);
      g.restore();
      // zweites Bild
      const sIn = contentFade(secFade, now);
      if (secFade && sIn < 1) {
        g.save();
        g.translate(0, -sIn * 8);
        drawSecond(secFade.from, V, now, k, 1 - sIn);
        g.restore();
      }
      g.save();
      g.translate(0, (1 - sIn) * 12);
      drawSecond(secId(), V, now, k, sIn);
      g.restore();
      // drittes Bild: f″
      if (kD2.v > 0.02) drawThirdDD(V, now, k, clamp01(kD2.v * 1.4));
      if (mode() !== 'rule' || rule() !== 'prod') drawLinks(V, k);
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
      morph = { from: shownFn(), fromBase: shownBase(), t0: now, dur };
      morphK = 0;
    }

    function retargetAll(now: number, instant: boolean, source: string, changed: ReadonlySet<string>): void {
      const quick = source !== 'replace';
      COEF_KEYS.forEach((key) => {
        const v = p[key] as number;
        if (instant || reduced()) CC[key].jump(v);
        else if (quick) CC[key].follow(v, dragging() ? 0.05 : 0.16);
        else CC[key].glide(v, 700, 0, now);
      });
      SK_KEYS.forEach((key, i) => {
        const v = p[key] as number;
        const c = SK[i]!;
        if (instant || reduced()) c.jump(v);
        else if (dragging()) c.follow(v, 0.04);
        else if (c.goal !== v) c.glide(v, 650, quick ? 0 : i * 60, now);
      });
      const x = lim(p.x);
      const scal: [Chan, number][] = [
        [DX, p.dx],
        [Hc, p.h],
        [RK, p.rk],
      ];
      if (instant || reduced()) {
        X.jump(x);
        for (const [c, v] of scal) c.jump(v);
      } else if (source === 'replace' || changed.has('kind') || changed.has('app') || changed.has('fn') || changed.has('mode') || changed.has('rule')) {
        X.glide(x, 900, 120, now);
        for (const [c, v] of scal) c.glide(v, 800, 60, now);
      } else {
        const tau = dragging() ? 0.04 : 0.22;
        X.follow(x, tau);
        for (const [c, v] of scal) if (!(c === Hc && shrink)) c.follow(v, tau);
      }
      for (const m of MODES) {
        const goal = m === mode() ? 1 : 0;
        if (instant || reduced()) mw[m].jump(goal);
        else if (mw[m].goal !== goal) mw[m].glide(goal, 560, goal ? 120 : 0, now);
      }
      const flags: [Chan, number][] = [
        [kD2, d2Goal()],
        [kFull, p.full ? 1 : 0],
        [kMarks, p.marks ? 1 : 0],
        [kTri, p.tri ? 1 : 0],
        [kSol, p.sol ? 1 : 0],
        [kSide.r, p.side === 'r' ? 1 : 0],
        [kSide.l, p.side === 'l' ? 1 : 0],
        [kSide.c, p.side === 'c' ? 1 : 0],
      ];
      for (const [c, goal] of flags) {
        if (instant || reduced()) c.jump(goal);
        else if (c === kD2) {
          if (c.goal !== goal) c.glide(goal, 650, 0, now);
        } else c.follow(goal, 0.2);
      }
    }

    function cancelStories(): void {
      if (sweep) {
        sweep = null;
        X.jump(lim(p.x));
      }
      shrink = null;
      steps = null;
      reveal = null;
    }

    /** Skizze auf die x-Achse legen (nur bei eigener Eingabe). */
    function flatSketch(): void {
      const vals: Record<string, number | boolean> = { sol: false };
      for (const key of SK_KEYS) vals[key] = 0;
      setP(vals);
    }

    return {
      update(changed, source) {
        const now = performance.now();
        const fnChanged = changed.has('kind') || changed.has('fn') || changed.has('app');
        const user = source === 'input' || source === 'replace';
        if (user && [...changed].some((key) => !['show', 'full', 'marks', 'd2', 'tri', 'sol'].includes(key))) {
          if (!(changed.size === 1 && changed.has('sol'))) cancelStories();
        }
        if (source === 'input') {
          // Stelle x im Bereich halten
          const x = lim(p.x);
          if (Math.abs(x - p.x) > 1e-9) setP({ x: Math.round(x * 20) / 20 });
          // neue Funktion oder Aufgabenmodus: Skizze neu beginnen
          if (mode() === 'draw' && (fnChanged || changed.has('mode') || COEF_KEYS.some((key) => changed.has(key)))) flatSketch();
          if (fnChanged && isApp()) setP({ x: exactFn().dom[0] });
        }
        const instant = source === 'init';
        if ((fnChanged || changed.has('pn')) && !instant) startMorph(now, source === 'replace' ? 850 : 750);
        retargetAll(now, instant, source, changed);
        if (!instant && !reduced()) {
          if (topId() !== prevTop) topFade = { t0: now, from: prevTop };
          if (secId() !== prevSec) secFade = { t0: now, from: prevSec };
          if (changed.has('mode') && mode() !== prevMode) cardFade = now;
        }
        // Spur neu beginnen
        if (instant || fnChanged || (changed.has('mode') && mode() !== prevMode) || source === 'replace') {
          const D0 = exactFn().dom;
          const x = lim(p.x);
          vis.lo = show() ? D0[0] : x;
          vis.hi = Math.max(vis.lo, x);
        }
        const fn = exactFn();
        feat = features(fn);
        table = signTable(fn);
        rating = rateSketch(fn, fn.nodes, SK_KEYS.map((key) => p[key] as number));
        retargetRanges(now, instant);
        if (source === 'init' && !reduced()) {
          intro = now;
          // Einstieg: P läuft vom linken Rand bis zur Stelle x, f′ entsteht als Spur
          const D0 = fn.dom;
          if (mode() === 'trace' && show()) {
            X.jump(D0[0]);
            X.glide(lim(p.x), 1500, 1000, now);
            vis.lo = D0[0];
            vis.hi = D0[0];
          }
        }
        prevMode = mode();
        prevTop = topId();
        prevSec = secId();
        updateReadouts();
        ctx.requestRender();
      },

      action(id) {
        if (ctx.locked) return;
        const now = performance.now();
        cancelStories();
        const fn = exactFn();
        const D0 = fn.dom;
        if (id === 'sweep') {
          const to = Math.round(D0[1] * 20) / 20;
          const from = D0[0];
          vis.lo = from;
          vis.hi = from;
          if (!reduced()) sweep = { t0: now, dur: SWEEP_MS, from, to };
          else vis.hi = D0[1];
          setP({ x: to });
        } else if (id === 'clear') {
          vis.lo = X.v;
          vis.hi = X.v;
        } else if (id === 'shrink') {
          const from = Math.max(p.h, 0.05);
          if (!reduced()) shrink = { t0: now, dur: 3800, from };
          setP({ h: H_MIN });
          Hc.jump(H_MIN);
          retargetRanges(now, false);
        } else if (id === 'grow') {
          setP({ h: 1 });
        } else if (id === 'steps') {
          if (!reduced()) steps = { t0: now };
        } else if (id === 'reveal') {
          if (!reduced()) reveal = { t0: now, dur: 1700 };
          setP({ sol: true });
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
