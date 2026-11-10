/**
 * Zahlenfabrik: Rechenlogik ohne Oberfläche (getestet in tests/zahlenfabrik.test.ts).
 *
 * Eine Quelle gibt Zahlen aus (immer dieselbe, eine Folge wie 1, 2, 3 … oder
 * eine selbst gewählte Startzahl). Bänder und Maschinen bringen sie Feld für
 * Feld weiter; betritt eine Zahl eine Maschine, wird sie verrechnet, eine
 * Weiche schickt sie je nach Prüfung geradeaus oder zur Seite. Jedes Lager
 * nimmt nur passende Zahlen an: eine bestimmte Zahl, Zahlen mit einer
 * Eigenschaft (z. B. Vielfache von 3) oder eine Wertetabelle der Reihe nach.
 */
export type Dir = 0 | 1 | 2 | 3; // rechts, unten, links, oben
export const DX = [1, 0, -1, 0] as const;
export const DY = [0, 1, 0, -1] as const;

/**
 * Rechenzeichen: Grundrechenarten, Quadrat, Rest (mod), Quersumme (Σ), Wurzel (√),
 * Vorzeichen wechseln (±), Betrag (|), Ziffern umdrehen (⇄), Runden auf 10ⁿ (≈),
 * Bruch (:), Kehrwert (⅟). Maschinen mit Gedächtnis: Zähler (cnt, gibt 1, 2, 3, …
 * aus) und Sammler (acc, Summe aller Zahlen bisher).
 */
export type Sym = '+' | '−' | '×' | '÷' | '²' | '%' | 'Σ' | '√' | '±' | '|' | '⇄' | '≈' | ':' | '⅟' | 'cnt' | 'acc';
export interface Op {
  sym: Sym;
  n: number;
}

/** Prüfung einer Weiche: Was sie bejaht, läuft geradeaus weiter, alles andere biegt ab. */
export type Test = { kind: 'even' } | { kind: 'div'; n: number } | { kind: 'prime' } | { kind: 'gt'; n: number } | { kind: 'square' };

export interface Part {
  /** Band (ohne Rechnung) oder Maschine. */
  op: Op | null;
  /** Ausgang (bei der Weiche: für „ja“). */
  dir: Dir;
  /** Weiche: Prüfung; „nein“ geht zur Seite `side` (1 = rechts, 3 = links, von der Laufrichtung aus). */
  sort?: Test;
  side?: 1 | 3;
  /** Verteiler: jede Zahl läuft als Kopie in beide Richtungen (geradeaus und zur Seite `side`). */
  split?: true;
  /** Wechsel-Weiche: die Zahlen gehen abwechselnd geradeaus und zur Seite `side` (die erste geradeaus). */
  alt?: true;
  /** Zusammenführen: zwei Zahlen werden zu Summe, Differenz (größere − kleinere), Produkt oder Quotient (größere ÷ kleinere). */
  merge?: MergeMode;
  /** Brücke: Zahlen laufen geradeaus darüber, waagerecht und senkrecht getrennt (zum Kreuzen). */
  bridge?: true;
}

export type MergeMode = '+' | '−' | '×' | '÷';

/**
 * Zwei Zahlen zusammenführen. Differenz und Quotient rechnen immer „größere
 * mit kleinerer“, damit die Reihenfolge egal ist; der Quotient nur, wenn er
 * glatt aufgeht (sonst null).
 */
export function combine(mode: MergeMode, a: number, b: number): number | null {
  const hi = Math.max(a, b);
  const lo = Math.min(a, b);
  switch (mode) {
    case '+':
      return a + b;
    case '−':
      return hi - lo;
    case '×':
      return a * b;
    case '÷':
      return lo !== 0 && hi % lo === 0 ? hi / lo : null;
  }
}

/** Primzahl? (Zahlen kleiner als 2 sind keine.) */
export function isPrime(n: number): boolean {
  if (!Number.isInteger(n) || n < 2) return false;
  if (n % 2 === 0) return n === 2;
  for (let d = 3; d * d <= n; d += 2) if (n % d === 0) return false;
  return true;
}

export function passes(test: Test, value: number): boolean {
  switch (test.kind) {
    case 'even':
      return value % 2 === 0;
    case 'div':
      return value % test.n === 0;
    case 'prime':
      return isPrime(value);
    case 'gt':
      return value > test.n;
    case 'square':
      return isSquare(value);
  }
}

/** Quadratzahl? (0, 1, 4, 9, …) */
export function isSquare(n: number): boolean {
  if (!Number.isInteger(n) || n < 0) return false;
  const r = Math.round(Math.sqrt(n));
  return r * r === n;
}

/** Quersumme (Summe der Ziffern, ohne Vorzeichen). */
export function digitSum(n: number): number {
  return String(Math.abs(Math.trunc(n)))
    .split('')
    .reduce((a, d) => a + Number(d), 0);
}

/** Ausgänge eines Teils: Weiche zwei (ja, nein), Verteiler zwei (beide), alle anderen einer. */
export function outputs(part: Part): Dir[] {
  return part.sort || part.split || part.alt ? [part.dir, ((part.dir + (part.side ?? 1)) % 4) as Dir] : [part.dir];
}

/** Was ein Lager annimmt. */
export type Accept =
  | { kind: 'value'; n: number }
  /** Zahlen, die die Prüfung bestehen (mit `not`: die sie nicht bestehen). */
  | { kind: 'test'; test: Test; not?: boolean }
  /** Die Werte der Reihe nach (Wertetabelle). */
  | { kind: 'seq'; values: number[] };

export interface Target {
  x: number;
  y: number;
  /** So viele Zahlen müssen hier ankommen. */
  need: number;
  accept: Accept;
}

export interface Level {
  id: string;
  cols: number;
  rows: number;
  /**
   * Quelle: gibt `value` aus, oder der Reihe nach die Zahlen aus `values`,
   * oder mit `pick` eine Startzahl, die man selbst wählt (Rückwärts rechnen).
   */
  source: { x: number; y: number; dir: Dir; value: number; values?: number[]; pick?: { min: number; max: number } };
  /** Ein Lager für genau eine Zahl (Welt 1); sonst `targets`. */
  target?: { x: number; y: number; value: number };
  /** So viele Zahlen müssen ankommen (zu `target`). */
  need?: number;
  /** Mehrere Lager mit eigenen Regeln. */
  targets?: Target[];
  walls: [number, number][];
  /** Mit so wenigen Teilen gibt es den zweiten Stern (vorgegebene Teile zählen nicht). */
  par: number;
  /** Teile, die schon auf der Karte stehen und sich nicht entfernen lassen. */
  fixed?: { x: number; y: number; part: Part }[];
  /** So viele Zahlen gibt die Quelle aus (ohne Angabe: so viele, wie die Lager brauchen). Für Verteiler und Zusammenführer. */
  emit?: number;
  /** Weitere Quellen (geben im selben Takt aus wie die erste, je ihre eigene Zahl bzw. Folge). */
  more?: { x: number; y: number; dir: Dir; value: number; values?: number[]; pick?: true }[];
}

/** Alle Quellen eines Levels (die erste zuerst). */
export const sourcesOf = (level: Level) => [level.source, ...(level.more ?? [])];
const sourceAt = (level: Level, x: number, y: number) => sourcesOf(level).find((sv) => sv.x === x && sv.y === y);

export type Grid = Map<string, Part>;
export const key = (x: number, y: number) => `${x},${y}`;

/** Alle Lager eines Levels (Welt 1: das eine Lager mit seiner Zahl). */
export function targetsOf(level: Level): Target[] {
  if (level.targets) return level.targets;
  const t = level.target!;
  return [{ x: t.x, y: t.y, need: level.need ?? 1, accept: { kind: 'value', n: t.value } }];
}

export const totalNeed = (level: Level) => targetsOf(level).reduce((a, t) => a + t.need, 0);

/** Nimmt das Lager diese Zahl an? `got`: so viele hat es schon (für die Wertetabelle). */
export function accepts(target: Target, value: number, got: number): boolean {
  const a = target.accept;
  switch (a.kind) {
    case 'value':
      return near(value, a.n);
    case 'test':
      return passes(a.test, value) !== !!a.not;
    case 'seq':
      return near(value, a.values[got % a.values.length]!);
  }
}

/** Zahl, die die Quelle als `index`-te ausgibt. */
export function sourceValue(level: Level, index: number, pick?: number): number {
  const sv = level.source;
  if (sv.values?.length) return sv.values[index % sv.values.length]!;
  if (sv.pick && pick !== undefined) return pick;
  return sv.value;
}

/** Gleich bis auf Rundungsfehler (Brüche wie 1/3 sind als Kommazahl nicht genau). */
export const near = (a: number, b: number) => Math.abs(a - b) < 1e-7;

/** Kommazahl als Bruch (Zähler, Nenner bis 1000) oder null, wenn es keiner ist. */
export function asFraction(v: number): { num: number; den: number } | null {
  if (Number.isInteger(v)) return { num: v, den: 1 };
  for (let den = 2; den <= 1000; den++) {
    const num = Math.round(v * den);
    if (Math.abs(num / den - v) < 1e-9) return { num, den };
  }
  return null;
}

/** Rundungsreste entfernen (0,30000000000000004 → 0,3; ganze Zahlen bleiben genau). */
const tidy = (v: number) => (Number.isInteger(v) ? v : Math.abs(v - Math.round(v)) < 1e-9 ? Math.round(v) : Math.round(v * 1e12) / 1e12);

export function apply(op: Op, value: number): number | null {
  const r = applyRaw(op, value);
  return r === null ? null : tidy(r);
}

/** Maschinen mit Gedächtnis: Sie merken sich etwas über die Zahlen, die schon durch sie gelaufen sind. */
export const isStateful = (sym: Sym) => sym === 'cnt' || sym === 'acc';

/**
 * Zahl in einer Maschine mit Gedächtnis verrechnen. `mem` ist der gemerkte
 * Stand (am Anfang 0): beim Zähler die Zahl der bisherigen Zahlen, beim
 * Sammler die Summe bisher. Zurück kommen Ergebnis und neuer Stand.
 */
export function applyMem(op: Op, value: number, mem: number): { value: number; mem: number } {
  switch (op.sym) {
    case 'cnt':
      return { value: mem + 1, mem: mem + 1 };
    case 'acc':
      return { value: tidy(mem + value), mem: tidy(mem + value) };
    default: {
      const r = apply(op, value);
      return { value: r ?? NaN, mem };
    }
  }
}

/**
 * Eine Maschine auf eine ganze Zahlenfolge anwenden (der Reihe nach, wie die
 * Zahlen aus der Quelle kommen). Nur so rechnen Maschinen mit Gedächtnis
 * richtig; `null` steht für „kann nicht rechnen“ (z. B. Teilen ohne Rest).
 */
export function applySeq(op: Op, values: readonly number[]): (number | null)[] {
  if (!isStateful(op.sym)) return values.map((v) => apply(op, v));
  let mem = 0;
  return values.map((v) => {
    const r = applyMem(op, v, mem);
    mem = r.mem;
    return r.value;
  });
}

function applyRaw(op: Op, value: number): number | null {
  switch (op.sym) {
    case '²':
      return value * value;
    case '+':
      return value + op.n;
    case '−':
      return value - op.n;
    case '×':
      return value * op.n;
    case '÷':
      return value % op.n === 0 ? value / op.n : null;
    case '%':
      return ((value % op.n) + op.n) % op.n;
    case 'Σ':
      return digitSum(value);
    case '√':
      return isSquare(value) ? Math.round(Math.sqrt(value)) : null;
    case '±':
      return value === 0 ? 0 : -value;
    case '|':
      return Math.abs(value);
    case '⇄':
      return reverseDigits(value);
    case '≈':
      return roundTo(value, 10 ** op.n);
    case ':':
      return value / op.n;
    case '⅟':
      return value === 0 ? null : 1 / value;
    // Gedächtnis-Maschinen ohne Vorgeschichte (erste Zahl): Zähler 1, Sammler die Zahl selbst
    case 'cnt':
      return 1;
    case 'acc':
      return value;
  }
}

/** Ziffern umdrehen (Vorzeichen bleibt): 123 → 321, 120 → 21. */
export function reverseDigits(n: number): number {
  const r = Number(String(Math.abs(Math.trunc(n))).split('').reverse().join(''));
  return n < 0 ? -r : r;
}

/** Kaufmännisch runden auf ein Vielfaches von `step` (bei negativen Zahlen gespiegelt): 45 → 50, −45 → −50. */
export function roundTo(n: number, step: number): number {
  const r = Math.floor(Math.abs(n) / step + 0.5) * step;
  return n < 0 && r !== 0 ? -r : r;
}

/** Kurze Aufschrift einer Maschine (passt auf ein Feld). */
export function opLabel(op: Op): string {
  switch (op.sym) {
    case '²':
      return 'x²';
    case '%':
      return `mod ${op.n}`;
    case 'Σ':
      return 'QS';
    case '√':
      return '√x';
    case '±':
      return '±';
    case '|':
      return '|x|';
    case '⇄':
      return '⇄';
    case '≈':
      return `≈${10 ** op.n}`;
    case ':':
      return `x/${op.n}`;
    case '⅟':
      return '1/x';
    case 'cnt':
      return '1,2,3';
    case 'acc':
      return 'Σx';
    default:
      return `${op.sym}${op.n}`;
  }
}

export interface Item {
  id: number;
  x: number;
  y: number;
  value: number;
  /** Wartet im Zusammenführer auf eine zweite Zahl (nur offene Welt). */
  wait?: boolean;
  /** Richtung des letzten Schritts (für die Brücke). */
  heading?: Dir;
  /** Im Zusammenführer: aus dieser Richtung gekommen (Level). */
  from?: Dir;
  /** Offene Welt: aus welchen Quellen die Zahl entstanden ist (Felder der Quellen). */
  src?: string[];
}

export type ErrorKind = 'fell' | 'wrong' | 'divide' | 'root' | 'timeout';

export interface State {
  tick: number;
  items: Item[];
  emitted: number;
  delivered: number;
  /** Angekommene Zahlen je Lager. */
  got: number[];
  nextId: number;
  /** Bei „wrong“: welches Lager (Nummer in targetsOf). */
  error: { kind: ErrorKind; x: number; y: number; value: number; target?: number } | null;
  won: boolean;
  /** Selbst gewählte Startzahl (Quelle mit `pick`). */
  pick?: number;
  /** Wechsel-Weichen: so viele Zahlen hat jede schon weitergegeben (Feld → Anzahl). */
  alt?: Record<string, number>;
  /** Maschinen mit Gedächtnis: gemerkter Stand je Feld (Zähler: Anzahl, Sammler: Summe). */
  mem?: Record<string, number>;
}

export const EMIT_EVERY = 2;
export const MAX_TICKS = 300;

export function start(pick?: number): State {
  return { tick: 0, items: [], emitted: 0, delivered: 0, got: [], nextId: 1, error: null, won: false, pick };
}

const isWall = (level: Level, x: number, y: number) => level.walls.some(([wx, wy]) => wx === x && wy === y);

const targetIndex = (level: Level, x: number, y: number) => targetsOf(level).findIndex((t) => t.x === x && t.y === y);

/**
 * Richtungen, in die ein Feld eine Zahl weitergibt (leer: kein Teil). Weichen
 * prüfen die Zahl, Verteiler geben in beide Richtungen, Brücken geradeaus.
 */
function dirsAt(level: Level, grid: Grid, item: Item, alt: Record<string, number>): Dir[] {
  const sv = sourceAt(level, item.x, item.y);
  if (sv) return [sv.dir];
  const part = grid.get(key(item.x, item.y));
  if (!part) return [];
  if (part.sort) return [outputs(part)[passes(part.sort, item.value) ? 0 : 1]!];
  if (part.split) return outputs(part);
  if (part.alt) return [outputs(part)[(alt[key(item.x, item.y)] ?? 0) % 2]!];
  if (part.bridge) return [item.heading ?? part.dir];
  return [part.dir];
}

/** So viele Zahlen gibt die Quelle insgesamt aus. */
export const emitCount = (level: Level) => level.emit ?? totalNeed(level);

/**
 * Ein Takt: alle Zahlen ein Feld weiter, dann ggf. eine neue aus der Quelle.
 * Im Zusammenführer wartet eine Zahl, bis aus einer anderen Richtung eine
 * zweite kommt (der Reihe nach); dann läuft die Summe bzw. das Produkt weiter.
 */
export function step(level: Level, grid: Grid, state: State): State {
  if (state.error || state.won) return state;
  const targets = targetsOf(level);
  const s: State = { ...state, tick: state.tick + 1, items: [], got: [...state.got], alt: { ...state.alt }, mem: { ...state.mem } };
  // Wartende Zahlen bleiben stehen
  for (const item of state.items) if (item.wait) s.items.push(item);
  for (const item of state.items) {
    if (item.wait) continue;
    const dirs = dirsAt(level, grid, item, s.alt!);
    // Wechsel-Weiche: nächste Zahl in die andere Richtung
    if (grid.get(key(item.x, item.y))?.alt) s.alt![key(item.x, item.y)] = (s.alt![key(item.x, item.y)] ?? 0) + 1;
    if (!dirs.length) {
      s.error = { kind: 'fell', x: item.x, y: item.y, value: item.value };
      return s;
    }
    for (const [i, dir] of dirs.entries()) {
      const x = item.x + DX[dir];
      const y = item.y + DY[dir];
      const ti = targetIndex(level, x, y);
      if (ti >= 0) {
        if (!accepts(targets[ti]!, item.value, s.got[ti] ?? 0)) {
          s.error = { kind: 'wrong', x, y, value: item.value, target: ti };
          return s;
        }
        s.got[ti] = (s.got[ti] ?? 0) + 1;
        s.delivered += 1;
        continue;
      }
      const part = grid.get(key(x, y));
      if (x < 0 || y < 0 || x >= level.cols || y >= level.rows || isWall(level, x, y) || !part || sourceAt(level, x, y)) {
        s.error = { kind: 'fell', x: item.x, y: item.y, value: item.value };
        return s;
      }
      let value = item.value;
      if (part.op && isStateful(part.op.sym)) {
        // Zähler und Sammler: merken sich je Feld, was bisher durchlief
        const r = applyMem(part.op, value, s.mem![key(x, y)] ?? 0);
        s.mem![key(x, y)] = r.mem;
        value = r.value;
      } else if (part.op) {
        const next = apply(part.op, value);
        if (next === null) {
          s.error = { kind: part.op.sym === '√' ? 'root' : 'divide', x, y, value };
          return s;
        }
        value = next;
      }
      // Verteiler: die zweite Kopie bekommt eine eigene Nummer
      const id = i === 0 ? item.id : s.nextId++;
      if (part.merge) {
        // Partner aus einer anderen Richtung, der schon wartet?
        const k = s.items.findIndex((o) => o.wait && o.x === x && o.y === y && o.from !== dir);
        if (k >= 0) {
          const other = s.items.splice(k, 1)[0]!;
          const merged = combine(part.merge, other.value, value);
          if (merged === null) {
            s.error = { kind: 'divide', x, y, value: Math.max(other.value, value) };
            return s;
          }
          s.items.push({ id, x, y, value: merged, heading: part.dir });
        } else s.items.push({ id, x, y, value, heading: dir, wait: true, from: dir });
        continue;
      }
      s.items.push({ id, x, y, value, heading: dir });
    }
  }
  if (targets.every((t, i) => (s.got[i] ?? 0) >= t.need)) {
    s.won = true;
    return s;
  }
  if (s.emitted < emitCount(level) && state.tick % EMIT_EVERY === 0) {
    s.items.push({ id: s.nextId, x: level.source.x, y: level.source.y, value: sourceValue(level, s.emitted, s.pick), heading: level.source.dir });
    s.nextId += 1;
    for (const m of level.more ?? []) {
      // Gleichungen: weitere Quelle mit derselben gewählten Zahl x
      const v = m.pick && s.pick !== undefined ? s.pick : m.values?.length ? m.values[s.emitted % m.values.length]! : m.value;
      s.items.push({ id: s.nextId, x: m.x, y: m.y, value: v, heading: m.dir });
      s.nextId += 1;
    }
    s.emitted += 1;
  }
  if (s.tick >= MAX_TICKS) s.error = { kind: 'timeout', x: level.source.x, y: level.source.y, value: level.source.value };
  return s;
}

/** Ein Schritt im Rechenweg: Maschine und Ergebnis. */
export interface TraceStep {
  label: string;
  value: number;
}

/**
 * Rechenweg einer Zahl von der Quelle aus (ohne Ablauf): welche Maschinen sie
 * nacheinander trifft und wo der Weg endet – im Lager (`target`), an einer
 * Weiche/einem Verteiler/Zusammenführer (`branch`), an einer Lücke (`gap`) oder
 * an einer Maschine, die nicht rechnen kann (`error`).
 */
export function trace(level: Level, grid: Grid, value: number): { steps: TraceStep[]; end: 'target' | 'branch' | 'gap' | 'error'; target?: number; value: number } {
  const steps: TraceStep[] = [];
  let x = level.source.x;
  let y = level.source.y;
  let dir: Dir = level.source.dir;
  let v = value;
  const seen = new Set<string>();
  for (let i = 0; i < 400; i++) {
    x += DX[dir];
    y += DY[dir];
    const ti = targetIndex(level, x, y);
    if (ti >= 0) return { steps, end: 'target', target: ti, value: v };
    const part = grid.get(key(x, y));
    if (!part || isWall(level, x, y) || seen.has(`${x},${y},${dir}`)) return { steps, end: 'gap', value: v };
    seen.add(`${x},${y},${dir}`);
    if (part.op) {
      const next = apply(part.op, v);
      if (next === null) return { steps, end: 'error', value: v };
      v = next;
      steps.push({ label: opLabel(part.op), value: v });
    }
    if (part.sort || part.split || part.merge || part.alt) return { steps, end: 'branch', value: v };
    if (!part.bridge) dir = part.dir;
  }
  return { steps, end: 'gap', value: v };
}

/** Ganz durchlaufen lassen (für Tests und „schnell“). */
export function run(level: Level, grid: Grid, pick?: number): State {
  let s = start(pick);
  while (!s.error && !s.won) s = step(level, grid, s);
  return s;
}

/** Ein Teil darf nur auf ein freies Feld (nicht Quelle, Lager, Fels, vorgegebenes Teil, außerhalb). */
export function canPlace(level: Level, x: number, y: number): boolean {
  if (x < 0 || y < 0 || x >= level.cols || y >= level.rows) return false;
  if (sourceAt(level, x, y)) return false;
  if (targetIndex(level, x, y) >= 0) return false;
  if (isFixed(level, x, y)) return false;
  return !isWall(level, x, y);
}

export function isFixed(level: Level, x: number, y: number): boolean {
  return !!level.fixed?.some((f) => f.x === x && f.y === y);
}

export { isWall };

/** Eigene Teile plus die vorgegebenen. */
export function withFixed(level: Level, grid: Grid): Grid {
  const all = new Map(grid);
  for (const f of level.fixed ?? []) all.set(key(f.x, f.y), f.part);
  return all;
}

/**
 * Kürzester Weg (Felder zwischen Quelle und Lager) um Felsen herum; vorgegebene
 * Teile gelten als frei. Ohne Angabe zum ersten Lager. Für Tests und Level-Planung.
 */
export function shortestPath(level: Level, to: { x: number; y: number } = targetsOf(level)[0]!, from?: [number, number]): [number, number][] | null {
  const start: [number, number] = from ?? [level.source.x + DX[level.source.dir], level.source.y + DY[level.source.dir]];
  const free = (x: number, y: number) =>
    x >= 0 && y >= 0 && x < level.cols && y < level.rows && !isWall(level, x, y) && !sourceAt(level, x, y) && targetIndex(level, x, y) < 0;
  if (!free(...start)) return null;
  const prev = new Map<string, string | null>([[key(...start), null]]);
  const queue: [number, number][] = [start];
  while (queue.length) {
    const [x, y] = queue.shift()!;
    for (const d of [0, 1, 2, 3] as Dir[]) {
      const nx = x + DX[d];
      const ny = y + DY[d];
      if (nx === to.x && ny === to.y) {
        const path: [number, number][] = [];
        let k: string | null = key(x, y);
        while (k) {
          const [px, py] = k.split(',').map(Number) as [number, number];
          path.unshift([px, py]);
          k = prev.get(k)!;
        }
        return path;
      }
      if (!free(nx, ny) || prev.has(key(nx, ny))) continue;
      prev.set(key(nx, ny), key(x, y));
      queue.push([nx, ny]);
    }
  }
  return null;
}

/** Sterne: geschafft 1, mit höchstens `par` Teilen +1, ohne Fehlversuch +1. */
export function starsFor(level: Level, parts: number, failedRuns: number): 1 | 2 | 3 {
  return (1 + (parts <= level.par ? 1 : 0) + (failedRuns === 0 ? 1 : 0)) as 1 | 2 | 3;
}
