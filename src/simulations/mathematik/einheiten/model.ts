/**
 * Rechenlogik „Einheiten umrechnen mit der Einheitentafel“:
 * Größenbereiche Länge, Masse, Zeit, Fläche und Volumen, exakte Umrechnung
 * über Ziffernfolgen (ganzzahlig skaliert mit BigInt, ohne Gleitkommafehler),
 * die Spalten der Einheitentafel, die Lage der Ziffern darin, die gemischte
 * Schreibweise bei Zeitangaben (135 min = 2 h 15 min) und Zufallsaufgaben.
 */

export type Lang = 'de' | 'en';
type Loc = { de: string; en: string };
const L = (de: string, en: string): Loc => ({ de, en });

export type QuantityId = 'len' | 'mass' | 'time' | 'area' | 'vol';

/** Eine Einheit eines Größenbereichs. */
export interface UnitDef {
  /** Schlüssel im Link, z. B. „km“, „m2“, „l“. */
  id: string;
  /** Schreibweise, z. B. „km“, „m²“, „l“. */
  sym: string;
  name: Loc;
  /**
   * Dezimale Größen: Zehnerpotenz relativ zur kleinsten Einheit
   * (1 km = 10⁶ mm → 6). Bei der Zeit: Sekunden pro Einheit.
   */
  exp: number;
  /** Zweite Schreibweise für eine Spalte der Tafel (l = dm³, ml = cm³). */
  aliasOf?: string;
}

export interface QuantityDef {
  id: QuantityId;
  name: Loc;
  /** Einheiten von klein nach groß. */
  units: UnitDef[];
  /** Zeit rechnet nicht im Zehnersystem (60, 60, 24). */
  decimal: boolean;
  /** Spalten der größten Einheit in der Tafel (H Z E bzw. Z E). */
  topCols: number;
}

export const QUANTITIES: Record<QuantityId, QuantityDef> = {
  len: {
    id: 'len',
    name: L('Länge', 'Length'),
    decimal: true,
    topCols: 3,
    units: [
      { id: 'mm', sym: 'mm', name: L('Millimeter', 'millimetre'), exp: 0 },
      { id: 'cm', sym: 'cm', name: L('Zentimeter', 'centimetre'), exp: 1 },
      { id: 'dm', sym: 'dm', name: L('Dezimeter', 'decimetre'), exp: 2 },
      { id: 'm', sym: 'm', name: L('Meter', 'metre'), exp: 3 },
      { id: 'km', sym: 'km', name: L('Kilometer', 'kilometre'), exp: 6 },
    ],
  },
  mass: {
    id: 'mass',
    name: L('Masse', 'Mass'),
    decimal: true,
    topCols: 3,
    units: [
      { id: 'mg', sym: 'mg', name: L('Milligramm', 'milligram'), exp: 0 },
      { id: 'g', sym: 'g', name: L('Gramm', 'gram'), exp: 3 },
      { id: 'kg', sym: 'kg', name: L('Kilogramm', 'kilogram'), exp: 6 },
      { id: 't', sym: 't', name: L('Tonne', 'tonne'), exp: 9 },
    ],
  },
  time: {
    id: 'time',
    name: L('Zeit', 'Time'),
    decimal: false,
    topCols: 1,
    units: [
      { id: 's', sym: 's', name: L('Sekunde', 'second'), exp: 1 },
      { id: 'min', sym: 'min', name: L('Minute', 'minute'), exp: 60 },
      { id: 'h', sym: 'h', name: L('Stunde', 'hour'), exp: 3600 },
      { id: 'd', sym: 'd', name: L('Tag', 'day'), exp: 86400 },
    ],
  },
  area: {
    id: 'area',
    name: L('Flächeninhalt', 'Area'),
    decimal: true,
    topCols: 2,
    units: [
      { id: 'mm2', sym: 'mm²', name: L('Quadratmillimeter', 'square millimetre'), exp: 0 },
      { id: 'cm2', sym: 'cm²', name: L('Quadratzentimeter', 'square centimetre'), exp: 2 },
      { id: 'dm2', sym: 'dm²', name: L('Quadratdezimeter', 'square decimetre'), exp: 4 },
      { id: 'm2', sym: 'm²', name: L('Quadratmeter', 'square metre'), exp: 6 },
      { id: 'a', sym: 'a', name: L('Ar', 'are'), exp: 8 },
      { id: 'ha', sym: 'ha', name: L('Hektar', 'hectare'), exp: 10 },
      { id: 'km2', sym: 'km²', name: L('Quadratkilometer', 'square kilometre'), exp: 12 },
    ],
  },
  vol: {
    id: 'vol',
    name: L('Volumen', 'Volume'),
    decimal: true,
    topCols: 3,
    units: [
      { id: 'mm3', sym: 'mm³', name: L('Kubikmillimeter', 'cubic millimetre'), exp: 0 },
      { id: 'cm3', sym: 'cm³', name: L('Kubikzentimeter', 'cubic centimetre'), exp: 3 },
      { id: 'ml', sym: 'ml', name: L('Milliliter', 'millilitre'), exp: 3, aliasOf: 'cm3' },
      { id: 'dm3', sym: 'dm³', name: L('Kubikdezimeter', 'cubic decimetre'), exp: 6 },
      { id: 'l', sym: 'l', name: L('Liter', 'litre'), exp: 6, aliasOf: 'dm3' },
      { id: 'm3', sym: 'm³', name: L('Kubikmeter', 'cubic metre'), exp: 9 },
    ],
  },
};

export const QUANTITY_IDS: QuantityId[] = ['len', 'mass', 'time', 'area', 'vol'];

export function unitOf(q: QuantityId, id: string): UnitDef | null {
  return QUANTITIES[q].units.find((u) => u.id === id) ?? null;
}

/** Einheiten mit eigenen Spalten (ohne l und ml), von klein nach groß. */
export function tableUnitList(q: QuantityId): UnitDef[] {
  return QUANTITIES[q].units.filter((u) => !u.aliasOf);
}

/** Die Einheit, deren Spalte eine Einheit benutzt (l → dm³). */
export function columnUnit(q: QuantityId, u: UnitDef): UnitDef {
  return u.aliasOf ? (unitOf(q, u.aliasOf) ?? u) : u;
}

/* ------------------------------------------------------------------ */
/* Dezimalzahlen exakt: Wert = n / 10^k                                */
/* ------------------------------------------------------------------ */

/** Nichtnegative Dezimalzahl n / 10^k (gekürzt: k = 0 oder n nicht durch 10 teilbar). */
export interface Dec {
  n: bigint;
  k: number;
}

export const MAX_INT_DIGITS = 9;
export const MAX_FRAC_DIGITS = 6;

const TEN = BigInt(10);
const ZERO = BigInt(0);
const ONE = BigInt(1);
const pow10 = (e: number): bigint => TEN ** BigInt(e);

/** Kürzt abschließende Nullen nach dem Komma. */
export function normalize(d: Dec): Dec {
  let { n, k } = d;
  if (n === ZERO) return { n: ZERO, k: 0 };
  while (k > 0 && n % TEN === ZERO) {
    n /= TEN;
    k--;
  }
  while (k < 0) {
    n *= TEN;
    k++;
  }
  return { n, k };
}

/**
 * Liest eine Eingabe wie „3,5“, „3.5“, „3 500“ oder „1.000,25“.
 * Leerzeichen gliedern nur. Ein Komma ist das Dezimalkomma (Punkte davor
 * gliedern dann Tausender); ohne Komma ist ein einzelner Punkt ein
 * Dezimalpunkt, mehrere Punkte gliedern. `null` bei ungültiger oder zu
 * langer Eingabe.
 */
export function parseAmount(input: string): Dec | null {
  let s = input.trim().replace(/[\s   '’_]/g, '');
  if (s.startsWith('+')) s = s.slice(1);
  if (!s) return null;
  let intPart: string;
  let fracPart = '';
  if (s.includes(',')) {
    const parts = s.split(',');
    if (parts.length !== 2) return null;
    intPart = parts[0]!.replace(/\./g, '');
    fracPart = parts[1]!;
  } else {
    const dots = s.split('.');
    if (dots.length === 2) {
      intPart = dots[0]!;
      fracPart = dots[1]!;
    } else intPart = dots.join('');
  }
  if (intPart === '' && fracPart === '') return null;
  if (intPart === '') intPart = '0';
  if (!/^\d+$/.test(intPart) || !/^\d*$/.test(fracPart)) return null;
  const int = intPart.replace(/^0+(?=\d)/, '');
  const frac = fracPart.replace(/0+$/, '');
  if (int.length > MAX_INT_DIGITS || frac.length > MAX_FRAC_DIGITS) return null;
  return normalize({ n: BigInt(int + frac), k: frac.length });
}

/** Ziffern vor und nach dem Komma (vor dem Komma mindestens „0“). */
export function digitsOf(d: Dec): { int: string; frac: string } {
  const x = normalize(d);
  const s = x.n.toString().padStart(x.k + 1, '0');
  return { int: s.slice(0, s.length - x.k), frac: s.slice(s.length - x.k) };
}

/** Schlichte Schreibweise mit Punkt, ohne Gliederung (für Tests und Links): „3500“, „0.045“. */
export function plain(d: Dec): string {
  const { int, frac } = digitsOf(d);
  return frac ? `${int}.${frac}` : int;
}

/** Ziffern in Dreiergruppen: DE schmales Leerzeichen, EN Komma. */
export function groupInt(int: string, lang: Lang): string {
  return int.replace(/\B(?=(\d{3})+(?!\d))/g, lang === 'de' ? ' ' : ',');
}

/** Dezimalzahl als Text: DE „3 500“, „0,045“; EN „3,500“, „0.045“. Ab 1 000 gegliedert. */
export function formatDec(d: Dec, lang: Lang): string {
  const { int, frac } = digitsOf(d);
  const i = groupInt(int, lang);
  if (!frac) return i;
  const f = frac.length > 4 ? frac.replace(/(\d{3})(?=\d)/g, '$1 ') : frac;
  return `${i}${lang === 'de' ? ',' : '.'}${f}`;
}

/** Eingabetext für das Textfeld (ohne Gliederung): DE „3,5“, EN „3.5“. */
export function inputText(d: Dec, lang: Lang): string {
  const { int, frac } = digitsOf(d);
  return frac ? `${int}${lang === 'de' ? ',' : '.'}${frac}` : int;
}

/** Multipliziert mit 10^s (s darf negativ sein). */
export function shiftDec(d: Dec, s: number): Dec {
  return s >= 0 ? normalize({ n: d.n * pow10(s), k: d.k }) : normalize({ n: d.n, k: d.k - s });
}

export function isZero(d: Dec): boolean {
  return d.n === ZERO;
}

export function decEquals(a: Dec, b: Dec): boolean {
  const x = normalize(a);
  const y = normalize(b);
  return x.n === y.n && x.k === y.k;
}

/** Zahlenwert (nur für Zeichnungen, gerechnet wird exakt). */
export function decValue(d: Dec): number {
  return Number(plain(d));
}

/* ------------------------------------------------------------------ */
/* Brüche (für die Zeit)                                               */
/* ------------------------------------------------------------------ */

export interface Ratio {
  num: bigint;
  den: bigint;
}

function gcd(a: bigint, b: bigint): bigint {
  let x = a < ZERO ? -a : a;
  let y = b < ZERO ? -b : b;
  while (y !== ZERO) [x, y] = [y, x % y];
  return x;
}

export function ratio(num: bigint, den: bigint): Ratio {
  const g = gcd(num, den) || ONE;
  return { num: num / g, den: den / g };
}

/**
 * Bruch als Dezimalzahl. `exact`: Der Bruch bricht nach höchstens `maxFrac`
 * Stellen ab (Nenner nur mit Faktoren 2 und 5). Sonst auf `maxFrac` Stellen
 * gerundet (5 wird aufgerundet).
 */
export function ratioToDec(r: Ratio, maxFrac = MAX_FRAC_DIGITS): { dec: Dec; exact: boolean } {
  const scaled = r.num * pow10(maxFrac);
  const q = scaled / r.den;
  const rem = scaled % r.den;
  if (rem === ZERO) return { dec: normalize({ n: q, k: maxFrac }), exact: true };
  const up = rem * BigInt(2) >= r.den ? ONE : ZERO;
  return { dec: normalize({ n: q + up, k: maxFrac }), exact: false };
}

/** Dezimalzahl als Bruch. */
export function decToRatio(d: Dec): Ratio {
  return ratio(d.n, pow10(d.k));
}

/* ------------------------------------------------------------------ */
/* Umrechnen                                                           */
/* ------------------------------------------------------------------ */

export interface Conversion {
  q: QuantityId;
  from: UnitDef;
  to: UnitDef;
  value: Dec;
  /** Ergebnis (bei der Zeit ggf. gerundet, dann `exact` = false). */
  result: Dec;
  exact: boolean;
  /** Dezimale Größen: Stellen, um die das Komma wandert (positiv = nach rechts). */
  shift: number;
  /** Umrechnungszahl: 1 große Einheit = factor kleine Einheiten. */
  factor: bigint;
  /** In die kleinere Einheit (mal Umrechnungszahl) oder in die größere (geteilt). */
  toSmaller: boolean;
  /** Zeit: Ergebnis als Bruch. */
  ratio: Ratio;
}

/** Rechnet einen Wert von einer Einheit in eine andere um (exakt). */
export function convert(q: QuantityId, value: Dec, fromId: string, toId: string): Conversion | null {
  const from = unitOf(q, fromId);
  const to = unitOf(q, toId);
  if (!from || !to) return null;
  const v = normalize(value);
  if (QUANTITIES[q].decimal) {
    const shift = from.exp - to.exp;
    const result = shiftDec(v, shift);
    return { q, from, to, value: v, result, exact: true, shift, factor: pow10(Math.abs(shift)), toSmaller: shift > 0, ratio: decToRatio(result) };
  }
  const r = ratio(v.n * BigInt(from.exp), pow10(v.k) * BigInt(to.exp));
  const { dec, exact } = ratioToDec(r);
  const big = Math.max(from.exp, to.exp);
  const small = Math.min(from.exp, to.exp);
  return { q, from, to, value: v, result: dec, exact, shift: 0, factor: BigInt(big / small), toSmaller: from.exp > to.exp, ratio: r };
}

/** „1 km = 1 000 m“: die Umrechnungszahl zwischen zwei Einheiten als Text. */
export function relationText(q: QuantityId, a: UnitDef, b: UnitDef, lang: Lang): string {
  const big = a.exp >= b.exp ? a : b;
  const small = big === a ? b : a;
  const f = QUANTITIES[q].decimal ? pow10(big.exp - small.exp) : BigInt(big.exp / small.exp);
  return `1 ${big.sym} = ${groupInt(f.toString(), lang)} ${small.sym}`;
}

/** Ganze Umrechnung als Text: „3,5 km = 3 500 m“ (gerundete Zeitangaben mit „≈“). */
export function conversionText(c: Conversion, lang: Lang): string {
  return `${formatDec(c.value, lang)} ${c.from.sym} ${c.exact ? '=' : '≈'} ${formatDec(c.result, lang)} ${c.to.sym}`;
}

/* ------------------------------------------------------------------ */
/* Zeit: Umrechnungskette und gemischte Schreibweise                   */
/* ------------------------------------------------------------------ */

/** Ein Schritt der Kette s – min – h – d: von `a` nach `b` mal bzw. geteilt durch `factor`. */
export interface ChainStep {
  from: UnitDef;
  to: UnitDef;
  factor: number;
  multiply: boolean;
  /** Wert nach diesem Schritt (Bruch, exakt). */
  value: Ratio;
}

/** Die Schritte von einer Zeiteinheit zur anderen über die Nachbareinheiten. */
export function timeChain(value: Dec, fromId: string, toId: string): ChainStep[] {
  const units = QUANTITIES.time.units;
  const i = units.findIndex((u) => u.id === fromId);
  const j = units.findIndex((u) => u.id === toId);
  if (i < 0 || j < 0) return [];
  const out: ChainStep[] = [];
  let cur = decToRatio(normalize(value));
  const dir = j > i ? 1 : -1;
  for (let k = i; k !== j; k += dir) {
    const a = units[k]!;
    const b = units[k + dir]!;
    const f = dir < 0 ? a.exp / b.exp : b.exp / a.exp;
    cur = dir < 0 ? ratio(cur.num * BigInt(f), cur.den) : ratio(cur.num, cur.den * BigInt(f));
    out.push({ from: a, to: b, factor: f, multiply: dir < 0, value: cur });
  }
  return out;
}

export interface MixedPart {
  unit: UnitDef;
  value: Dec;
}

/**
 * Gemischte Schreibweise einer Zeitspanne zwischen zwei Einheiten:
 * 135 min (oder 2,25 h) → 2 h 15 min. Von der größeren der beiden Einheiten
 * bis zur kleineren; Teile mit 0 entfallen (außer alles ist 0). Nur die
 * kleinste Einheit darf eine Dezimalzahl haben (2 h 15,5 min).
 */
export function mixedTime(value: Dec, fromId: string, toId: string): MixedPart[] {
  const units = QUANTITIES.time.units;
  const from = unitOf('time', fromId);
  const to = unitOf('time', toId);
  if (!from || !to) return [];
  const big = from.exp >= to.exp ? from : to;
  const small = big === from ? to : from;
  // Gesamtwert in der kleineren Einheit: exakt, weil from.exp / small.exp ganzzahlig ist
  const v = normalize(value);
  let rest: Dec = normalize({ n: v.n * BigInt(from.exp / small.exp), k: v.k });
  const chain = units.filter((u) => u.exp <= big.exp && u.exp >= small.exp).reverse();
  const parts: MixedPart[] = [];
  for (const u of chain) {
    if (u === small) {
      parts.push({ unit: u, value: rest });
      break;
    }
    const f = BigInt(u.exp / small.exp);
    const scale = pow10(rest.k);
    const count = rest.n / (f * scale);
    rest = normalize({ n: rest.n - count * f * scale, k: rest.k });
    parts.push({ unit: u, value: { n: count, k: 0 } });
  }
  const nonzero = parts.filter((p) => !isZero(p.value));
  return nonzero.length ? nonzero : [parts[0]!];
}

/** „2 h 15 min“. */
export function mixedText(parts: MixedPart[], lang: Lang): string {
  return parts.map((p) => `${formatDec(p.value, lang)} ${p.unit.sym}`).join(' ');
}

/* ------------------------------------------------------------------ */
/* Einheitentafel                                                      */
/* ------------------------------------------------------------------ */

/** Eine Einheit mit ihren Spalten (Hochzahlen hi … lo, links → rechts). */
export interface TableUnit {
  unit: UnitDef;
  hi: number;
  lo: number;
}

/** Die Einheiten der Tafel von groß nach klein mit ihren Spalten. */
export function tableUnits(q: QuantityId): TableUnit[] {
  const list = tableUnitList(q);
  const top = QUANTITIES[q].topCols;
  return list
    .map((u, i) => {
      const next = list[i + 1];
      return { unit: u, hi: next ? next.exp - 1 : u.exp + top - 1, lo: u.exp };
    })
    .reverse();
}

const PLACE_DE = ['E', 'Z', 'H', 'T', 'ZT', 'HT', 'M', 'ZM', 'HM'];
const PLACE_EN = ['O', 'T', 'H', 'Th', 'TTh', 'HTh', 'M', 'TM', 'HM'];
const FRAC_DE = ['z', 'h', 't', 'zt', 'ht', 'm'];
const FRAC_EN = ['t', 'h', 'th', 'tth', 'hth', 'm'];

/**
 * Beschriftung einer Spalte unter der Einheit: H, Z, E (EN: H, T, O).
 * Einheiten mit nur einer Spalte (dm, cm, mm) bekommen keine. Spalten
 * rechts der kleinsten Einheit: z, h, t (Zehntel, Hundertstel …).
 */
export function placeLabel(q: QuantityId, col: number, lang: Lang): string {
  if (col < 0) return (lang === 'de' ? FRAC_DE : FRAC_EN)[-col - 1] ?? '';
  const tu = tableUnits(q);
  const owner = tu.find((t) => col >= t.lo && col <= t.hi) ?? (col > tu[0]!.hi ? tu[0]! : null);
  if (!owner) return '';
  if (owner.hi === owner.lo && col <= owner.hi) return '';
  return (lang === 'de' ? PLACE_DE : PLACE_EN)[col - owner.lo] ?? '';
}

/** Ein Ziffernkärtchen in der Tafel: Spalte (Hochzahl) und Ziffer. */
export interface Placed {
  col: number;
  digit: string;
}

/** Legt eine Zahl in die Tafel: die Einerstelle kommt in die Spalte der Einheit. */
export function placeDigits(d: Dec, unitExp: number): Placed[] {
  const { int, frac } = digitsOf(d);
  const out: Placed[] = [];
  for (let i = 0; i < int.length; i++) out.push({ col: unitExp + int.length - 1 - i, digit: int[i]! });
  for (let i = 0; i < frac.length; i++) out.push({ col: unitExp - 1 - i, digit: frac[i]! });
  return out;
}

/**
 * Was nach dem Umrechnen in der Tafel steht: Spalten hi … lo des Ergebnisses
 * und je Spalte die Ziffer. `added`: blass ergänzte Nullen; `dropped`:
 * Kärtchen der Ausgangszahl, die wegfallen (führende oder abschließende Nullen).
 */
export function tableResult(d: Dec, fromExp: number, toExp: number): { hi: number; lo: number; cells: (Placed & { added: boolean })[]; dropped: Placed[] } {
  const given = placeDigits(d, fromExp);
  const nonzero = given.filter((p) => p.digit !== '0');
  const top = nonzero.length ? nonzero[0]!.col : toExp;
  const low = nonzero.length ? nonzero[nonzero.length - 1]!.col : toExp;
  const hi = Math.max(top, toExp);
  const lo = Math.min(low, toExp);
  const cells: (Placed & { added: boolean })[] = [];
  for (let c = hi; c >= lo; c--) {
    const g = given.find((p) => p.col === c);
    cells.push({ col: c, digit: g ? g.digit : '0', added: !g });
  }
  const dropped = given.filter((p) => p.col > hi || p.col < lo);
  return { hi, lo, cells, dropped };
}

/** Liest die Zahl aus der Tafel ab (Komma rechts der Spalte `unitExp`). */
export function readTable(cells: Placed[], unitExp: number): Dec {
  if (!cells.length) return { n: ZERO, k: 0 };
  const lo = Math.min(...cells.map((c) => c.col));
  const hi = Math.max(...cells.map((c) => c.col));
  let s = '';
  for (let c = hi; c >= lo; c--) s += cells.find((x) => x.col === c)?.digit ?? '0';
  return shiftDec({ n: BigInt(s), k: 0 }, lo - unitExp);
}

/* ------------------------------------------------------------------ */
/* Zufallsaufgaben                                                     */
/* ------------------------------------------------------------------ */

export interface Task {
  value: Dec;
  from: string;
  to: string;
}

const pick = <T>(list: readonly T[], rnd: () => number): T => list[Math.min(list.length - 1, Math.floor(rnd() * list.length))]!;

/** Passt eine Zahl gut in die Tafel? (höchstens 6 Stellen vor, 3 nach dem Komma) */
function fits(d: Dec, maxInt = 6, maxFrac = 3): boolean {
  const { int, frac } = digitsOf(d);
  return int.length <= maxInt && frac.length <= maxFrac;
}

/**
 * Eine sinnvolle Zufallsaufgabe: Nachbareinheiten oder zwei Stufen
 * auseinander, kleine Zahlen mit höchstens drei gültigen Ziffern; das
 * Ergebnis ist eine „schöne“ Zahl. Bei der Zeit geht die Rechnung glatt auf
 * (Viertel, Halbe, ganze Vielfache).
 */
export function randomTask(q: QuantityId, rnd: () => number): Task {
  const def = QUANTITIES[q];
  if (!def.decimal) {
    const units = def.units;
    for (let tries = 0; tries < 60; tries++) {
      const i = Math.floor(rnd() * units.length);
      const span = rnd() < 0.75 ? 1 : 2;
      const j = rnd() < 0.5 ? i + span : i - span;
      if (j < 0 || j >= units.length) continue;
      const from = units[i]!;
      const to = units[j]!;
      // Wert in der größeren Einheit: ganze Zahl oder mit Viertel/Halb
      const whole = Math.floor(rnd() * 4);
      const frac = pick([0, 25, 50, 75], rnd);
      const big: Dec = normalize({ n: BigInt(whole * 100 + frac), k: 2 });
      if (isZero(big)) continue;
      const value = from.exp > to.exp ? big : normalize({ n: big.n * BigInt(to.exp / from.exp), k: big.k });
      const c = convert(q, value, from.id, to.id);
      if (!c || !c.exact || !fits(value) || !fits(c.result) || value.k > 2) continue;
      return { value, from: from.id, to: to.id };
    }
    return { value: { n: BigInt(135), k: 0 }, from: 'min', to: 'h' };
  }
  const units = def.units.filter((u) => !u.aliasOf || rnd() < 0.5);
  for (let tries = 0; tries < 80; tries++) {
    const a = pick(units, rnd);
    const b = pick(units, rnd);
    const shift = a.exp - b.exp;
    if (shift === 0 || Math.abs(shift) > (q === 'len' ? 4 : 6)) continue;
    const digits = 1 + Math.floor(rnd() * 3);
    let m = 0;
    while (m === 0 || (digits > 1 && m % 10 === 0)) m = Math.floor(rnd() * 10 ** digits);
    const k = Math.floor(rnd() * 3);
    const value = normalize({ n: BigInt(m), k });
    const c = convert(q, value, a.id, b.id)!;
    if (!fits(value, 4, 3) || !fits(c.result, 7, 4)) continue;
    return { value, from: a.id, to: b.id };
  }
  return { value: { n: BigInt(35), k: 1 }, from: def.units[def.units.length - 1]!.id, to: def.units[def.units.length - 2]!.id };
}

/* ------------------------------------------------------------------ */
/* Anschauung: welches Einheitenpaar wird gezeichnet?                  */
/* ------------------------------------------------------------------ */

/**
 * Das Paar (große, kleine Einheit) für die Zeichnung: die kleinere der beiden
 * Einheiten und die größere – liegt dazwischen zu viel (Länge > 1 000,
 * Fläche > 10 000, sonst > 1 000), die direkt über der kleineren. Bei
 * gleichen Einheiten die nächstgrößere. Zeit: immer der Nachbar über der
 * kleineren Einheit.
 */
export function illustrationPair(q: QuantityId, fromId: string, toId: string): { big: UnitDef; small: UnitDef; factor: number } {
  const list = q === 'time' ? QUANTITIES.time.units : tableUnitList(q);
  const a = columnUnit(q, unitOf(q, fromId) ?? list[0]!);
  const b = columnUnit(q, unitOf(q, toId) ?? list[1]!);
  let small = a.exp <= b.exp ? a : b;
  let big = small === a ? b : a;
  const idx = list.findIndex((u) => u.id === small.id);
  const limit = q === 'area' ? 10000 : 1000;
  const ratioOf = (x: UnitDef, y: UnitDef) => (QUANTITIES[q].decimal ? 10 ** (x.exp - y.exp) : x.exp / y.exp);
  if (big.id === small.id || q === 'time' || ratioOf(big, small) > limit) {
    if (idx < list.length - 1) big = list[idx + 1]!;
    else {
      big = small;
      small = list[idx - 1]!;
    }
  }
  return { big, small, factor: ratioOf(big, small) };
}
