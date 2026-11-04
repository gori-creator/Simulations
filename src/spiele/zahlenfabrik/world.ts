import { apply, DX, DY, key, outputs, passes, type Dir, type Grid, type Item, type Op } from './model';

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

export interface OpenWorld {
  id: string;
  cols: number;
  rows: number;
  spawners: Spawner[];
  base: { x: number; y: number; w: number; h: number };
  walls: [number, number][];
  tools: Op[];
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
}

export const WORLD_EMIT = 3;
/** Zu große Zahlen (z. B. aus Kreisen mit ×10) gehen verloren. */
export const MAX_VALUE = 1_000_000;
/** Höchstens so viele Zahlen gleichzeitig unterwegs. */
export const MAX_ITEMS = 400;

export function worldStart(): WorldState {
  return { tick: 0, items: [], nextId: 1, score: 0, count: 0, lost: 0, lostAt: [], delivered: [], mergedAt: [] };
}

export const inBase = (w: OpenWorld, x: number, y: number) => x >= w.base.x && y >= w.base.y && x < w.base.x + w.base.w && y < w.base.y + w.base.h;
export const spawnerAt = (w: OpenWorld, x: number, y: number) => w.spawners.find((s) => s.x === x && s.y === y);
const wallAt = (w: OpenWorld, x: number, y: number) => w.walls.some(([a, b]) => a === x && b === y);

/** Bauen erlaubt: in der Karte, nicht auf Basis, Quelle oder Fels. */
export function canBuildWorld(w: OpenWorld, x: number, y: number): boolean {
  if (x < 0 || y < 0 || x >= w.cols || y >= w.rows) return false;
  return !inBase(w, x, y) && !spawnerAt(w, x, y) && !wallAt(w, x, y);
}

/** Plan einer Zahl für diesen Takt. */
interface Plan {
  item: Item;
  kind: 'stay' | 'move' | 'absorb' | 'lose';
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
export function worldStep(w: OpenWorld, grid: Grid, state: WorldState): WorldState {
  const s: WorldState = { ...state, tick: state.tick + 1, items: [], lostAt: [], delivered: [], mergedAt: [] };
  const lose = (x: number, y: number) => {
    s.lost += 1;
    s.lostAt.push([x, y]);
  };
  const at = new Map<string, Item>();
  for (const item of state.items) at.set(key(item.x, item.y), item);

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
    if (dir === undefined && here) dir = here.sort ? outputs(here)[passes(here.sort, item.value) ? 0 : 1] : here.dir;
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
    if (!grid.has(key(x, y)) || !canBuildWorld(w, x, y)) {
      plan.kind = 'lose';
      continue;
    }
    Object.assign(plan, { kind: 'move', tx: x, ty: y, dir });
  }

  // 2. Vorfahrt: je Ziel-Feld so viele Zahlen, wie dort Platz haben
  const claims = new Map<string, Plan[]>();
  for (const plan of plans.values()) {
    if (plan.kind !== 'move') continue;
    const k = key(plan.tx, plan.ty);
    const list = claims.get(k);
    if (list) list.push(plan);
    else claims.set(k, [plan]);
  }
  for (const [k, list] of claims) {
    const part = grid.get(k)!;
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

  // 3. Wer kann wirklich weiter? (Das Ziel-Feld muss frei sein oder frei werden.)
  const verdict = new Map<number, boolean>();
  const stack: number[] = [];
  function moves(p: Plan): boolean {
    if (p.kind === 'absorb' || p.kind === 'lose') return true;
    if (p.kind === 'stay' || !p.accepted) return false;
    const known = verdict.get(p.item.id);
    if (known !== undefined) return known;
    const pos = stack.indexOf(p.item.id);
    // Kreis: ab drei Zahlen rücken alle weiter, zwei Gegenüber blockieren sich
    if (pos >= 0) return stack.length - pos > 2;
    stack.push(p.item.id);
    const occ = at.get(key(p.tx, p.ty));
    const part = grid.get(key(p.tx, p.ty))!;
    let ok = true;
    if (occ && !(part.merge && occ.wait)) ok = moves(plans.get(occ.id)!);
    stack.pop();
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
    const moved: Item = { id: item.id, x: plan.tx, y: plan.ty, value };
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
    const value = part.merge === '+' ? a.value + b.value : a.value * b.value;
    s.mergedAt.push([a.x, a.y]);
    if (Math.abs(value) > MAX_VALUE) {
      lose(a.x, a.y);
      continue;
    }
    s.items.push({ id: a.id, x: a.x, y: a.y, value });
  }
  // Wer nicht weiterkam, bleibt stehen (auch wartende Zahlen)
  for (const item of state.items) {
    const kind = plans.get(item.id)!.kind;
    if (!consumed.has(item.id) && (kind === 'stay' || kind === 'move')) s.items.push(item);
  }

  // Quellen geben nur aus, wenn vor ihnen ein Teil oder die Basis liegt und ihr Feld frei ist
  const taken = new Set(s.items.map((i) => key(i.x, i.y)));
  w.spawners.forEach((sp, i) => {
    if ((state.tick + i) % WORLD_EMIT !== 0 || taken.has(key(sp.x, sp.y))) return;
    const fx = sp.x + DX[sp.dir];
    const fy = sp.y + DY[sp.dir];
    if (!grid.has(key(fx, fy)) && !inBase(w, fx, fy)) return;
    s.items.push({ id: s.nextId, x: sp.x, y: sp.y, value: sp.value });
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

/**
 * Die offene Welt (immer gleich, damit man sich auskennt): Quellen in der
 * Nähe der Basis geben kleine Zahlen, weiter weg größere. Felsen in Gruppen.
 */
export function makeWorld(seed = 7): OpenWorld {
  const random = seeded(seed);
  const cols = 40;
  const rows = 28;
  const base = { x: 24, y: 15, w: 3, h: 3 };
  const w: OpenWorld = {
    id: 'welt',
    cols,
    rows,
    spawners: [],
    base,
    walls: [],
    tools: [
      { sym: '+', n: 1 },
      { sym: '+', n: 5 },
      { sym: '−', n: 1 },
      { sym: '×', n: 2 },
      { sym: '×', n: 3 },
      { sym: '×', n: 10 },
      { sym: '÷', n: 2 },
    ],
  };
  const cx = base.x + 1;
  const cy = base.y + 1;
  const nearBase = (x: number, y: number, r: number) => x >= base.x - r && x < base.x + base.w + r && y >= base.y - r && y < base.y + base.h + r;
  const taken = new Set<string>();
  const free = (x: number, y: number, r: number) => {
    for (let dx = -r; dx <= r; dx++) for (let dy = -r; dy <= r; dy++) if (taken.has(key(x + dx, y + dy))) return false;
    return true;
  };
  // Quellen
  for (let tries = 0; w.spawners.length < 20 && tries < 5000; tries++) {
    const x = 1 + Math.floor(random() * (cols - 2));
    const y = 1 + Math.floor(random() * (rows - 2));
    if (nearBase(x, y, 3) || !free(x, y, 2)) continue;
    const d = Math.hypot(x - cx, y - cy);
    const value = d < 9 ? 1 + Math.floor(random() * 3) : d < 16 ? 2 + Math.floor(random() * 5) : 4 + Math.floor(random() * 6);
    // Richtung grob zur Basis, damit der Weg nicht hinter die Quelle führt
    const dir: Dir = Math.abs(cx - x) > Math.abs(cy - y) ? (cx > x ? 0 : 2) : cy > y ? 1 : 3;
    w.spawners.push({ x, y, dir, value });
    taken.add(key(x, y));
    taken.add(key(x + DX[dir], y + DY[dir]));
  }
  // Felsgruppen
  for (let g = 0; g < 14; g++) {
    const gx = Math.floor(random() * cols);
    const gy = Math.floor(random() * rows);
    const size = 2 + Math.floor(random() * 5);
    let x = gx;
    let y = gy;
    for (let i = 0; i < size; i++) {
      if (x >= 0 && y >= 0 && x < cols && y < rows && !nearBase(x, y, 1) && free(x, y, 1)) w.walls.push([x, y]);
      if (random() < 0.5) x += random() < 0.5 ? 1 : -1;
      else y += random() < 0.5 ? 1 : -1;
    }
  }
  return w;
}
