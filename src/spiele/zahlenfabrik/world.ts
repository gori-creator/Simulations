import { apply, combine, DX, DY, isPrime, isSquare, key, outputs, passes, type Dir, type Grid, type Item, type Op } from './model';

/**
 * Offene Welt: Auf einer großen Karte stehen viele Zahlenquellen, die ohne
 * Ende Zahlen ausgeben, sobald ein Band vor ihnen liegt. Irgendwo steht die
 * eigene Basis. Alles, was dort ankommt, wird gesammelt (Summe der Zahlen).
 * Zahlen, die vom Band fallen oder sich nicht teilen lassen, gehen verloren –
 * das Spiel läuft trotzdem weiter.
 */
export interface Spawner {
  x: number;
  y: number;
  dir: Dir;
  value: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Abnehmer am Kartenrand: kaufen nur bestimmte Zahlen und zahlen dafür
 * Münzen. Sie arbeiten erst ab einem späteren Auftrag und nur in
 * freigekauftem Land; andere Zahlen nehmen sie nicht an (gehen verloren).
 */
export interface Buyer extends Rect {
  rule: { kind: 'exact' | 'prime' | 'square' | 'multiple' | 'greater'; n?: number };
  /** Münzen je passender Zahl. */
  pay: number;
}

/** Ab so vielen geschafften Aufträgen arbeiten die Abnehmer. */
export const BUYERS_FROM = 6;

export function buyerWants(b: Buyer, v: number): boolean {
  const r = b.rule;
  switch (r.kind) {
    case 'exact':
      return v === r.n;
    case 'prime':
      return isPrime(v);
    case 'square':
      return isSquare(v);
    case 'multiple':
      return Number.isInteger(v) && v !== 0 && v % r.n! === 0;
    case 'greater':
      return v > r.n!;
  }
}

export interface OpenWorld {
  id: string;
  cols: number;
  rows: number;
  spawners: Spawner[];
  base: Rect;
  walls: [number, number][];
  tools: Op[];
  /**
   * Gebiete, die man nach und nach freikauft (ineinander, das erste ist das
   * Startgebiet). Ohne Angabe ist die ganze Karte offen.
   */
  zones?: Rect[];
  /** Abnehmer am Kartenrand (siehe Buyer). */
  buyers?: Buyer[];
}

/** Preis der Gebiete in Münzen (das erste gibt es umsonst). */
export const ZONE_PRICES = [0, 400, 2500];

/** Offenes Gebiet bei Ausbaustufe `zone` (ohne Gebiete: die ganze Karte). */
export function zoneRect(w: OpenWorld, zone = Infinity): Rect {
  const z = w.zones;
  if (!z?.length) return { x: 0, y: 0, w: w.cols, h: w.rows };
  return z[Math.max(0, Math.min(zone, z.length - 1))]!;
}

export const inRect = (r: Rect, x: number, y: number) => x >= r.x && y >= r.y && x < r.x + r.w && y < r.y + r.h;

/** Schnelle Nachschlage-Tabellen je Welt (Felsen, Quellen). */
const lookup = new WeakMap<OpenWorld, { walls: Set<string>; spawners: Map<string, Spawner> }>();
function index(w: OpenWorld) {
  let i = lookup.get(w);
  if (!i) {
    i = { walls: new Set(w.walls.map(([x, y]) => key(x, y))), spawners: new Map(w.spawners.map((sp) => [key(sp.x, sp.y), sp])) };
    lookup.set(w, i);
  }
  return i;
}

export interface WorldState {
  tick: number;
  items: Item[];
  nextId: number;
  /** Summe aller gesammelten Zahlen (in diesem Lauf). */
  score: number;
  /** Zahl der gesammelten Zahlen. */
  count: number;
  lost: number;
  /** Wo in diesem Takt Zahlen verloren gingen (für einen kleinen Effekt). */
  lostAt: [number, number][];
  /** In diesem Takt in der Basis angekommene Zahlen (für Münzen und Aufträge). */
  delivered: number[];
  /** Wo in diesem Takt zwei Zahlen zusammengeführt wurden (für einen kleinen Effekt). */
  mergedAt: [number, number][];
  /** An Abnehmer verkaufte Zahlen in diesem Takt: [Nummer des Abnehmers, Zahl]. */
  sold: [number, number][];
}

export const WORLD_EMIT = 3;
/** Zu große Zahlen (z. B. aus Kreisen mit ×10) gehen verloren. */
export const MAX_VALUE = 1_000_000;
/** Höchstens so viele Zahlen gleichzeitig unterwegs. */
export const MAX_ITEMS = 600;

export function worldStart(): WorldState {
  return { tick: 0, items: [], nextId: 1, score: 0, count: 0, lost: 0, lostAt: [], delivered: [], mergedAt: [], sold: [] };
}

export const inBase = (w: OpenWorld, x: number, y: number) => x >= w.base.x && y >= w.base.y && x < w.base.x + w.base.w && y < w.base.y + w.base.h;
export const spawnerAt = (w: OpenWorld, x: number, y: number) => index(w).spawners.get(key(x, y));
const wallAt = (w: OpenWorld, x: number, y: number) => index(w).walls.has(key(x, y));
/** Abnehmer auf diesem Feld (Nummer) oder −1. */
export const buyerAt = (w: OpenWorld, x: number, y: number) => (w.buyers ?? []).findIndex((b) => inRect(b, x, y));

/** Bauen erlaubt: im offenen Gebiet, nicht auf Basis, Quelle oder Fels. */
export function canBuildWorld(w: OpenWorld, x: number, y: number, zone = Infinity): boolean {
  if (x < 0 || y < 0 || x >= w.cols || y >= w.rows || !inRect(zoneRect(w, zone), x, y)) return false;
  return !inBase(w, x, y) && !spawnerAt(w, x, y) && !wallAt(w, x, y) && buyerAt(w, x, y) < 0;
}

/** Achse einer Laufrichtung (für die Brücke: waagerecht und senkrecht getrennt). */
const axis = (d: Dir) => (d % 2 === 0 ? 'h' : 'v');

/** Plan einer Zahl für diesen Takt. */
interface Plan {
  item: Item;
  kind: 'stay' | 'move' | 'absorb' | 'lose' | 'sell';
  /** Abnehmer (bei „sell“). */
  buyer?: number;
  /** Ziel-Feld (bei „move“). */
  tx: number;
  ty: number;
  /** Laufrichtung (bei „move“). */
  dir: Dir;
  /** Darf aufs Ziel-Feld (nach der Vorfahrt). */
  accepted: boolean;
}

/**
 * Ein Takt der offenen Welt. Auf jedem Feld liegt höchstens eine Zahl: Ist
 * das nächste Feld belegt und wird nicht frei, wartet die Zahl (Stau). Wollen
 * zwei Zahlen aufs selbe Feld, hat die von hinten Vorrang, sonst wechseln
 * sich die Seiten ab. In einem vollen Kreis (ab drei Feldern) rücken alle
 * gemeinsam weiter; zwei Zahlen, die sich gegenüberstehen, blockieren sich.
 *
 * Weiche: Zahlen, die die Prüfung bestehen, laufen geradeaus, die anderen
 * biegen zur Seite ab. Zusammenführen: Die erste Zahl wartet, die zweite wird
 * mit ihr zur Summe bzw. zum Produkt; das Ergebnis läuft weiter.
 */
export function worldStep(w: OpenWorld, grid: Grid, state: WorldState, zone = Infinity, buyersOn = true): WorldState {
  const s: WorldState = { ...state, tick: state.tick + 1, items: [], lostAt: [], delivered: [], mergedAt: [], sold: [] };
  const lose = (x: number, y: number) => {
    s.lost += 1;
    s.lostAt.push([x, y]);
  };
  const open = zoneRect(w, zone);
  /** Platz einer Zahl: das Feld, auf der Brücke getrennt nach waagerecht/senkrecht. */
  const slot = (x: number, y: number, d: Dir) => (grid.get(key(x, y))?.bridge ? `${key(x, y)}${axis(d)}` : key(x, y));
  const heading = (item: Item): Dir => item.heading ?? spawnerAt(w, item.x, item.y)?.dir ?? grid.get(key(item.x, item.y))?.dir ?? 0;
  const at = new Map<string, Item>();
  for (const item of state.items) at.set(slot(item.x, item.y, heading(item)), item);

  // 1. Wohin will jede Zahl?
  const plans = new Map<number, Plan>();
  for (const item of state.items) {
    const plan: Plan = { item, kind: 'stay', tx: item.x, ty: item.y, dir: 0, accepted: false };
    plans.set(item.id, plan);
    const here = grid.get(key(item.x, item.y));
    // Wartet im Zusammenführer (wurde der abgebaut, läuft die Zahl normal weiter bzw. fällt herunter)
    if (item.wait && here?.merge) continue;
    const sp = spawnerAt(w, item.x, item.y);
    let dir: Dir | undefined = sp?.dir;
    // Brücke: geradeaus weiter in Laufrichtung; Weiche: je nach Prüfung
    if (dir === undefined && here) dir = here.bridge ? heading(item) : here.sort ? outputs(here)[passes(here.sort, item.value) ? 0 : 1] : here.dir;
    if (dir === undefined) {
      plan.kind = 'lose';
      continue;
    }
    const x = item.x + DX[dir];
    const y = item.y + DY[dir];
    if (inBase(w, x, y)) {
      plan.kind = 'absorb';
      continue;
    }
    // Abnehmer: kauft passende Zahlen (wenn er schon arbeitet und im offenen Land steht)
    const bi = buyerAt(w, x, y);
    if (bi >= 0) {
      const b = w.buyers![bi]!;
      const ok = buyersOn && inRect(open, b.x, b.y) && buyerWants(b, item.value);
      Object.assign(plan, ok ? { kind: 'sell', buyer: bi } : { kind: 'lose' });
      continue;
    }
    if (!grid.has(key(x, y)) || !canBuildWorld(w, x, y, zone)) {
      plan.kind = 'lose';
      continue;
    }
    Object.assign(plan, { kind: 'move', tx: x, ty: y, dir });
  }

  // 2. Vorfahrt: je Ziel-Platz so viele Zahlen, wie dort Platz haben
  const claims = new Map<string, Plan[]>();
  for (const plan of plans.values()) {
    if (plan.kind !== 'move') continue;
    const k = slot(plan.tx, plan.ty, plan.dir);
    const list = claims.get(k);
    if (list) list.push(plan);
    else claims.set(k, [plan]);
  }
  for (const [k, list] of claims) {
    const part = grid.get(key(list[0]!.tx, list[0]!.ty))!;
    const occ = at.get(k);
    // von hinten zuerst, dann reihum (je Takt eine andere Seite)
    list.sort((a, b) => rank(a) - rank(b) || a.item.id - b.item.id);
    const room = part.merge ? (occ?.wait ? 1 : 2) : 1;
    list.slice(0, room).forEach((p) => (p.accepted = true));
  }
  function rank(p: Plan): number {
    const part = grid.get(key(p.tx, p.ty))!;
    return p.dir === part.dir ? -1 : (p.dir - state.tick + 400) % 4;
  }

  // 3. Wer kann wirklich weiter? (Der Ziel-Platz muss frei sein oder frei werden.)
  const verdict = new Map<number, boolean>();
  const onStack = new Map<number, number>();
  function moves(p: Plan): boolean {
    if (p.kind === 'absorb' || p.kind === 'lose' || p.kind === 'sell') return true;
    if (p.kind === 'stay' || !p.accepted) return false;
    const known = verdict.get(p.item.id);
    if (known !== undefined) return known;
    const pos = onStack.get(p.item.id);
    // Kreis: ab drei Zahlen rücken alle weiter, zwei Gegenüber blockieren sich
    if (pos !== undefined) return onStack.size - pos > 2;
    onStack.set(p.item.id, onStack.size);
    const occ = at.get(slot(p.tx, p.ty, p.dir));
    const part = grid.get(key(p.tx, p.ty))!;
    let ok = true;
    if (occ && !(part.merge && occ.wait)) ok = moves(plans.get(occ.id)!);
    onStack.delete(p.item.id);
    verdict.set(p.item.id, ok);
    return ok;
  }

  // 4. Ausführen
  const arrivals = new Map<string, Item[]>();
  const consumed = new Set<number>();
  for (const plan of plans.values()) {
    const { item } = plan;
    if (plan.kind === 'lose') {
      lose(item.x, item.y);
      continue;
    }
    if (plan.kind === 'sell') {
      s.sold.push([plan.buyer!, item.value]);
      continue;
    }
    if (plan.kind === 'absorb') {
      s.score += item.value;
      s.count += 1;
      s.delivered.push(item.value);
      continue;
    }
    if (plan.kind === 'stay' || !moves(plan)) continue;
    const k = key(plan.tx, plan.ty);
    const part = grid.get(k)!;
    let value = item.value;
    if (part.op) {
      const next = apply(part.op, value);
      if (next === null || Math.abs(next) > MAX_VALUE) {
        lose(plan.tx, plan.ty);
        consumed.add(item.id);
        continue;
      }
      value = next;
    }
    const moved: Item = { id: item.id, x: plan.tx, y: plan.ty, value, heading: plan.dir };
    consumed.add(item.id);
    if (part.merge) {
      const list = arrivals.get(k);
      if (list) list.push(moved);
      else arrivals.set(k, [moved]);
    } else s.items.push(moved);
  }
  // Zusammenführen: wartende Zahl plus Neuankömmlinge
  for (const [k, list] of arrivals) {
    const part = grid.get(k)!;
    const waiting = at.get(k);
    const group = waiting?.wait ? [waiting, ...list] : list;
    if (waiting?.wait) consumed.add(waiting.id);
    const [a, b] = group as [Item, Item | undefined];
    if (!b) {
      s.items.push({ ...a, wait: true });
      continue;
    }
    const value = combine(part.merge!, a.value, b.value);
    s.mergedAt.push([a.x, a.y]);
    if (value === null || Math.abs(value) > MAX_VALUE) {
      lose(a.x, a.y);
      continue;
    }
    s.items.push({ id: a.id, x: a.x, y: a.y, value, heading: part.dir });
  }
  // Wer nicht weiterkam, bleibt stehen (auch wartende Zahlen)
  for (const item of state.items) {
    const kind = plans.get(item.id)!.kind;
    if (!consumed.has(item.id) && (kind === 'stay' || kind === 'move')) s.items.push(item);
  }

  // Quellen im offenen Gebiet geben aus, wenn vor ihnen ein Teil oder die Basis liegt und ihr Feld frei ist
  const taken = new Set(s.items.map((i) => key(i.x, i.y)));
  w.spawners.forEach((sp, i) => {
    if ((state.tick + i) % WORLD_EMIT !== 0 || taken.has(key(sp.x, sp.y)) || !inRect(open, sp.x, sp.y)) return;
    const fx = sp.x + DX[sp.dir];
    const fy = sp.y + DY[sp.dir];
    if (!grid.has(key(fx, fy)) && !inBase(w, fx, fy)) return;
    s.items.push({ id: s.nextId, x: sp.x, y: sp.y, value: sp.value, heading: sp.dir });
    s.nextId += 1;
  });
  if (s.items.length > MAX_ITEMS) {
    const drop = s.items.length - MAX_ITEMS;
    for (const it of s.items.slice(0, drop)) lose(it.x, it.y);
    s.items = s.items.slice(drop);
  }
  return s;
}

/** Wiederholbare Zufallszahlen (mulberry32). */
function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Richtung grob zur Basis, damit der Weg nicht hinter die Quelle führt. */
function toward(x: number, y: number, cx: number, cy: number): Dir {
  return Math.abs(cx - x) > Math.abs(cy - y) ? (cx > x ? 0 : 2) : cy > y ? 1 : 3;
}

/** Startgebiet: die ursprüngliche Karte (40 × 28, Basis bei 24/15), damit alte Spielstände passen. */
function startArea(seed: number): Pick<OpenWorld, 'spawners' | 'walls'> {
  const random = seeded(seed);
  const cols = 40;
  const rows = 28;
  const base = { x: 24, y: 15, w: 3, h: 3 };
  const out: Pick<OpenWorld, 'spawners' | 'walls'> = { spawners: [], walls: [] };
  const cx = base.x + 1;
  const cy = base.y + 1;
  const nearBase = (x: number, y: number, r: number) => x >= base.x - r && x < base.x + base.w + r && y >= base.y - r && y < base.y + base.h + r;
  const taken = new Set<string>();
  const free = (x: number, y: number, r: number) => {
    for (let dx = -r; dx <= r; dx++) for (let dy = -r; dy <= r; dy++) if (taken.has(key(x + dx, y + dy))) return false;
    return true;
  };
  for (let tries = 0; out.spawners.length < 20 && tries < 5000; tries++) {
    const x = 1 + Math.floor(random() * (cols - 2));
    const y = 1 + Math.floor(random() * (rows - 2));
    if (nearBase(x, y, 3) || !free(x, y, 2)) continue;
    const d = Math.hypot(x - cx, y - cy);
    const value = d < 9 ? 1 + Math.floor(random() * 3) : d < 16 ? 2 + Math.floor(random() * 5) : 4 + Math.floor(random() * 6);
    const dir = toward(x, y, cx, cy);
    out.spawners.push({ x, y, dir, value });
    taken.add(key(x, y));
    taken.add(key(x + DX[dir], y + DY[dir]));
  }
  for (let g = 0; g < 14; g++) {
    const gx = Math.floor(random() * cols);
    const gy = Math.floor(random() * rows);
    const size = 2 + Math.floor(random() * 5);
    let x = gx;
    let y = gy;
    for (let i = 0; i < size; i++) {
      if (x >= 0 && y >= 0 && x < cols && y < rows && !nearBase(x, y, 1) && free(x, y, 1)) out.walls.push([x, y]);
      if (random() < 0.5) x += random() < 0.5 ? 1 : -1;
      else y += random() < 0.5 ? 1 : -1;
    }
  }
  return out;
}

/** Verschiebung des Startgebiets in der großen Karte (alte Spielstände werden so umgerechnet). */
export const START_OFFSET: [number, number] = [16, 12];

/**
 * Die offene Welt (immer gleich, damit man sich auskennt): 72 × 52 Felder in
 * drei Gebieten. Das Startgebiet (40 × 28) ist offen, die beiden Ringe darum
 * kauft man mit Münzen frei. Je weiter weg von der Basis, desto größer die
 * Zahlen der Quellen. Felsen liegen in Gruppen.
 */
export function makeWorld(seed = 7): OpenWorld {
  const [ox, oy] = START_OFFSET;
  const inner = startArea(seed);
  const cols = 72;
  const rows = 52;
  const base = { x: 24 + ox, y: 15 + oy, w: 3, h: 3 };
  const zones: Rect[] = [
    { x: ox, y: oy, w: 40, h: 28 },
    { x: 8, y: 6, w: 56, h: 40 },
    { x: 0, y: 0, w: cols, h: rows },
  ];
  const w: OpenWorld = {
    id: 'welt',
    cols,
    rows,
    spawners: inner.spawners.map((sp) => ({ ...sp, x: sp.x + ox, y: sp.y + oy })),
    base,
    walls: inner.walls.map(([x, y]) => [x + ox, y + oy]),
    tools: [],
    zones,
  };
  const random = seeded(seed * 31 + 1);
  const cx = base.x + 1;
  const cy = base.y + 1;
  const taken = new Set<string>();
  for (const sp of w.spawners) {
    taken.add(key(sp.x, sp.y));
    taken.add(key(sp.x + DX[sp.dir], sp.y + DY[sp.dir]));
  }
  for (const [x, y] of w.walls) taken.add(key(x, y));
  const free = (x: number, y: number, r: number) => {
    for (let dx = -r; dx <= r; dx++) for (let dy = -r; dy <= r; dy++) if (taken.has(key(x + dx, y + dy))) return false;
    return true;
  };
  // Neue Quellen nur in den Ringen (nicht im Startgebiet und nicht direkt an seinem Rand)
  const ring = (i: number, x: number, y: number) => inRect(zones[i]!, x, y) && !inRect({ x: zones[i - 1]!.x - 1, y: zones[i - 1]!.y - 1, w: zones[i - 1]!.w + 2, h: zones[i - 1]!.h + 2 }, x, y);
  const valueAt = (d: number) => (d < 24 ? 5 + Math.floor(random() * 10) : d < 30 ? 8 + Math.floor(random() * 17) : 12 + Math.floor(random() * 39));
  for (const [i, n] of [[1, 14], [2, 18]] as const) {
    let made = 0;
    for (let tries = 0; made < n && tries < 20000; tries++) {
      const x = 1 + Math.floor(random() * (cols - 2));
      const y = 1 + Math.floor(random() * (rows - 2));
      if (!ring(i, x, y) || !free(x, y, 2)) continue;
      const dir = toward(x, y, cx, cy);
      const fx = x + DX[dir];
      const fy = y + DY[dir];
      if (!inRect(zones[i]!, fx, fy)) continue;
      w.spawners.push({ x, y, dir, value: valueAt(Math.hypot(x - cx, y - cy)) });
      taken.add(key(x, y));
      taken.add(key(fx, fy));
      made += 1;
    }
  }
  // Felsgruppen in den Ringen
  for (let g = 0; g < 30; g++) {
    let x = Math.floor(random() * cols);
    let y = Math.floor(random() * rows);
    const size = 2 + Math.floor(random() * 6);
    for (let k = 0; k < size; k++) {
      if (x >= 0 && y >= 0 && x < cols && y < rows && !inRect(zones[0]!, x, y) && free(x, y, 1) && !w.walls.some(([a, b]) => a === x && b === y)) w.walls.push([x, y]);
      if (random() < 0.5) x += random() < 0.5 ? 1 : -1;
      else y += random() < 0.5 ? 1 : -1;
    }
  }
  // Abnehmer am Kartenrand (im ersten und zweiten Ring), Platz um sie herum frei
  const spots: [number, number, Buyer['rule'], number][] = [
    [9, 7, { kind: 'exact', n: 24 }, 12],
    [61, 7, { kind: 'square' }, 10],
    [61, 43, { kind: 'prime' }, 8],
    [9, 43, { kind: 'multiple', n: 7 }, 8],
    [1, 1, { kind: 'exact', n: 100 }, 25],
    [69, 49, { kind: 'greater', n: 200 }, 12],
  ];
  w.buyers = [];
  for (const [bx, by, rule, pay] of spots) {
    const b: Buyer = { x: bx, y: by, w: 2, h: 2, rule, pay };
    const near = (x: number, y: number) => x >= bx - 1 && y >= by - 1 && x <= bx + 2 && y <= by + 2;
    if (w.spawners.some((sp) => near(sp.x, sp.y))) continue;
    w.walls = w.walls.filter(([x, y]) => !near(x, y));
    w.buyers.push(b);
  }
  return w;
}
