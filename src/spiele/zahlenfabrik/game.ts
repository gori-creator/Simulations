import { L } from '../../curriculum/helpers';
import type { Lang, Localized } from '../../i18n/config';
import { WORLD_1, type LevelInfo } from './levels';
import { canPlace, DX, DY, key, opLabel, outputs, start, starsFor, step, withFixed, type Dir, type Grid, type Item, type Part, type State } from './model';
import { deliver, newEconomy, orderAt, orderText, unlockedBy, unlockedParts, type Economy, type Order } from './orders';
import { makePart, partId, priceOf, specById, specLabel, specName, testLabel, WORLD_PARTS, type PartSpec } from './parts';
import { canBuildWorld, inRect, makeWorld, START_OFFSET, worldStart, worldStep, ZONE_PRICES, zoneRect, type OpenWorld, type WorldState } from './world';

/**
 * Zahlenfabrik (Probe, Welt 1): freie Fläche aus Kästchen, die man mit der
 * Hand verschiebt und zoomt. Aus dem Inventar zieht (oder tippt) man Bänder
 * und Maschinen auf die Karte; mit dem Band-Werkzeug zieht man ganze Wege.
 */
const ARROW = ['→', '↓', '←', '↑'];
const STORE = 'spiel:zahlenfabrik';
const WORLD_STORE = 'spiel:zahlenfabrik:welt';
const CELL = 64;
const MIN_ZOOM = 0.2;
const FIT_MIN_ZOOM = 0.45;
const MAX_ZOOM = 1.8;
const SVG_NS = 'http://www.w3.org/2000/svg';
/** Mitte der Feldkante in Richtung d (relativ zur Feldecke). */
const EDGE: [number, number][] = [
  [CELL, CELL / 2],
  [CELL / 2, CELL],
  [0, CELL / 2],
  [CELL / 2, 0],
];

type Tool = { kind: 'hand' } | { kind: 'part'; spec: PartSpec } | { kind: 'erase' };
const BELT: PartSpec = { id: 'belt', kind: 'belt', price: 1 };
const isBelt = (t: Tool) => t.kind === 'part' && t.spec.kind === 'belt';

const T = {
  start: L('▶ Start', '▶ Start'),
  pause: L('⏸ Pause', '⏸ Pause'),
  stepBtn: L('⏭ Ein Takt', '⏭ One tick'),
  fast: L('⏩ Schnell', '⏩ Fast'),
  stop: L('⏹ Stopp', '⏹ Stop'),
  clear: L('🗑️ Alles abbauen', '🗑️ Clear all'),
  hand: L('Hand', 'Hand'),
  belt: L('Band', 'Belt'),
  erase: L('Abbauen', 'Remove'),
  source: L('Quelle', 'Source'),
  target: L('Lager', 'Storage'),
  next: L('Nächstes Level →', 'Next level →'),
  parts: L('Teile', 'Parts'),
  delivered: L('Geliefert', 'Delivered'),
  levels: L('Level', 'Levels'),
  zoomIn: L('Hineinzoomen', 'Zoom in'),
  zoomOut: L('Herauszoomen', 'Zoom out'),
  fit: L('Alles zeigen', 'Show all'),
  inventory: L('Inventar', 'Inventory'),
  howto: L(
    '✋ Hand: Karte verschieben (zwei Finger oder Mausrad: zoomen). → Band: über die Kästchen ziehen. Maschinen: aus dem Inventar auf die Karte ziehen oder antippen und dann ein Kästchen antippen. Ein Teil nochmal antippen dreht es.',
    '✋ Hand: move the map (two fingers or mouse wheel: zoom). → Belt: drag across the squares. Machines: drag from the inventory onto the map, or tap them and then tap a square. Tap a part again to turn it.',
  ),
  won: L('Auftrag erfüllt!', 'Order complete!'),
  fell: L('Die {v} ist vom Band gefallen! Dort fehlt ein Teil oder es zeigt in die falsche Richtung.', 'The {v} fell off the belt! A part is missing there or points the wrong way.'),
  wrong: L('Das Lager will {t}, aber es kam {v} an.', 'The storage wants {t}, but {v} arrived.'),
  divide: L('{v} lässt sich hier nicht glatt teilen.', '{v} can’t be divided evenly here.'),
  timeout: L('Die Zahlen kommen nie im Lager an – fahren sie im Kreis?', 'The numbers never reach the storage – are they going round in circles?'),
  starsPar: L('★ 2: höchstens {n} Teile', '★ 2: at most {n} parts'),
  starsFirst: L('★ 3: gleich beim ersten Start', '★ 3: on the first run'),
  editLocked: L('Erst stoppen, dann umbauen.', 'Stop first, then rebuild.'),
  fixed: L('schon da', 'already here'),
  world: L('🌍 Offene Welt', '🌍 Open world'),
  worldTitle: L('Offene Welt', 'Open world'),
  worldHint: L(
    'Leg Bänder von den Zahlenquellen zu deiner Basis 🏠. Jede Zahl bringt so viele Münzen, wie sie groß ist. Aufträge schalten neue Teile frei.',
    'Lay belts from the number sources to your base 🏠. Every number earns as many coins as it is big. Orders unlock new parts.',
  ),
  eyebrowLevels: L('🏭 Zahlenfabrik · Welt 1: Grundrechnen', '🏭 Number Factory · World 1: basic arithmetic'),
  eyebrowWorld: L('🏭 Zahlenfabrik · Offene Welt', '🏭 Number Factory · Open world'),
  score: L('Gesammelt: {n}', 'Collected: {n}'),
  count: L('{n} Zahlen', '{n} numbers'),
  lost: L('verloren: {n}', 'lost: {n}'),
  base: L('Basis', 'Base'),
  resetWorld: L('↺ Welt neu', '↺ New world'),
  resetConfirm: L('Alle Bänder und Maschinen abbauen? Du bekommst die Münzen dafür zurück.', 'Remove all belts and machines? You get the coins back.'),
  coins: L('🪙 {n} Münzen', '🪙 {n} coins'),
  total: L('Insgesamt geliefert: {n}', 'Delivered in total: {n}'),
  order: L('Auftrag {n}', 'Order {n}'),
  reward: L('Belohnung: {n} 🪙', 'Reward: {n} 🪙'),
  rewardNew: L('neu: {p}', 'new: {p}'),
  streakHint: L('Eine andere Zahl setzt auf 0 zurück.', 'Any other number resets to 0.'),
  orderDone: L('🎉 Auftrag geschafft! +{n} 🪙', '🎉 Order complete! +{n} 🪙'),
  unlocked: L('Neu im Inventar: {p}', 'New in your inventory: {p}'),
  tooPoor: L('Dafür fehlen dir {n} Münzen. Liefere mehr Zahlen zur Basis!', 'You need {n} more coins. Deliver more numbers to the base!'),
  locked: L('🔒 {p} gibt es nach Auftrag {n}.', '🔒 {p} unlocks after order {n}.'),
  lockedShort: L('Auftrag {n}', 'Order {n}'),
  price: L('{n} Münzen', '{n} coins'),
  sourceLocked: L('Diese Quelle liegt in einem Gebiet, das du noch freikaufen musst.', 'This source is in an area you still have to unlock.'),
  bridgeHelp: L('Brücke: Zahlen laufen geradeaus darüber – waagerecht und senkrecht, ohne sich zu stören. So kreuzen sich zwei Bänder.', 'Bridge: numbers run straight across – horizontally and vertically, without getting in each other’s way. This is how two belts cross.'),
  expand: L('🗺️ Neues Gebiet · {n} 🪙', '🗺️ New area · {n} 🪙'),
  fogLabel: L('🔒 Mehr Land für {n} 🪙', '🔒 More land for {n} 🪙'),
  expandDone: L('🗺️ Neues Land frei! Weiter draußen geben die Quellen größere Zahlen.', '🗺️ New land unlocked! Further out, the sources give bigger numbers.'),
  sortHelp: L('Weiche: Was die Frage erfüllt, läuft geradeaus (✓), alles andere biegt ab (✗). Antippen dreht sie, nach vier Drehungen wechselt die Seite.', 'Switch: numbers that pass go straight (✓), all others turn (✗). Tap to turn it; after four turns the side switches.'),
  mergeHelp: L('Zusammenführen: Die erste Zahl wartet, bis eine zweite kommt. Dann laufen beide als Summe (bzw. Produkt) weiter.', 'Merger: the first number waits for a second one. Then both continue as their sum (or product).'),
  worldHowto: L(
    '✋ Hand: Karte verschieben (zwei Finger oder Mausrad: zoomen). → Band: über die Kästchen ziehen. Teile kosten Münzen, Abbauen gibt sie zurück. Ein Teil nochmal antippen dreht es. Was vom Band fällt, ist weg. Du kannst bauen, während die Fabrik läuft.',
    '✋ Hand: move the map (two fingers or mouse wheel: zoom). → Belt: drag across the squares. Parts cost coins; removing them gives the coins back. Tap a part again to turn it. Whatever falls off the belt is gone. You can build while the factory is running.',
  ),
};

/**
 * Gespeicherte offene Welt: gebaute Teile (x, y, Richtung, Kennung, Seite der
 * Weiche) und Münzen/Aufträge. Ältere Spielstände (Teile mit Maschinen-Aufschrift
 * oder null für Bänder, dazu `best`) werden übernommen.
 */
interface SavedWorld {
  v?: number;
  parts: [number, number, Dir, string | null, (1 | 3)?][];
  econ?: Partial<Economy>;
  best?: number;
}

const nonNeg = (v: unknown, fallback: number) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? Math.floor(v) : fallback);

function loadWorld(w: OpenWorld): { grid: Grid; econ: Economy } {
  const grid: Grid = new Map();
  const fresh = newEconomy();
  try {
    const raw = JSON.parse(localStorage.getItem(WORLD_STORE) ?? '{}') as Partial<SavedWorld>;
    // Bis Version 2 war die Karte nur das heutige Startgebiet: Teile dorthin verschieben
    const [ox, oy] = (raw.v ?? 1) < 3 ? START_OFFSET : [0, 0];
    const zone = Math.min(nonNeg(raw.econ?.zone, 0), ZONE_PRICES.length - 1);
    for (const entry of raw.parts ?? []) {
      const [x0, y0, dir, id, side] = entry;
      const x = x0 + ox;
      const y = y0 + oy;
      if (!canBuildWorld(w, x, y, zone) || ![0, 1, 2, 3].includes(dir)) continue;
      const spec = specById(id ?? 'belt');
      if (!spec) continue;
      grid.set(key(x, y), makePart(spec, dir, side === 3 ? 3 : 1));
    }
    const e = raw.econ ?? {};
    const econ: Economy = {
      coins: nonNeg(e.coins, fresh.coins),
      total: nonNeg(e.total, nonNeg(raw.best, 0)),
      order: nonNeg(e.order, 0),
      progress: nonNeg(e.progress, 0),
      zone,
    };
    return { grid, econ };
  } catch {
    return { grid, econ: fresh };
  }
}

function saveWorld(grid: Grid, econ: Economy): void {
  try {
    const parts = [...grid].map(([k, p]): SavedWorld['parts'][number] => {
      const [x, y] = k.split(',').map(Number) as [number, number];
      return p.sort ? [x, y, p.dir, partId(p), p.side ?? 1] : [x, y, p.dir, partId(p)];
    });
    localStorage.setItem(WORLD_STORE, JSON.stringify({ v: 3, parts, econ } satisfies SavedWorld));
  } catch {
    // ohne Speicher: nur für diesen Besuch
  }
}

/**
 * Gemeinsame Sicht auf ein Level oder die offene Welt: Größe, Quellen,
 * Ziel (Lager oder Basis), Felsen, vorgegebene Teile, Werkzeuge.
 */
interface Board {
  cols: number;
  rows: number;
  sources: { x: number; y: number; dir: Dir; value: number }[];
  base: { x: number; y: number; w: number; h: number };
  walls: Set<string>;
  fixed: Map<string, Part>;
  /** Teile im Inventar (ohne Band). */
  tools: PartSpec[];
}

function boardOfLevel(l: LevelInfo): Board {
  return {
    cols: l.cols,
    rows: l.rows,
    sources: [l.source],
    base: { x: l.target.x, y: l.target.y, w: 1, h: 1 },
    walls: new Set(l.walls.map(([x, y]) => key(x, y))),
    fixed: new Map((l.fixed ?? []).map((f) => [key(f.x, f.y), f.part])),
    tools: l.tools.map((op): PartSpec => ({ id: opLabel(op), kind: 'op', op, price: 0 })),
  };
}

function boardOfWorld(w: OpenWorld): Board {
  return { cols: w.cols, rows: w.rows, sources: w.spawners, base: w.base, walls: new Set(w.walls.map(([x, y]) => key(x, y))), fixed: new Map(), tools: WORLD_PARTS.filter((p) => p.kind !== 'belt') };
}

function load(): Record<string, number> {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE) ?? '{}') as { stars?: Record<string, unknown> };
    const stars: Record<string, number> = {};
    for (const [k, v] of Object.entries(raw.stars ?? {})) if (typeof v === 'number' && v >= 1 && v <= 3) stars[k] = v;
    return stars;
  } catch {
    return {};
  }
}

function save(stars: Record<string, number>): void {
  try {
    localStorage.setItem(STORE, JSON.stringify({ stars }));
  } catch {
    // ohne Speicher: nur für diesen Besuch
  }
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls = '', text?: string): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

export function initFactory(root: HTMLElement): void {
  const lang = (root.dataset.lang === 'en' ? 'en' : 'de') satisfies Lang;
  const tx = (t: Localized, vars: Record<string, string | number> = {}) => t[lang].replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stars = load();
  const q = <E extends Element>(sel: string) => root.querySelector<E>(sel)!;

  const levelBar = q<HTMLElement>('[data-levels]');
  const title = q<HTMLElement>('[data-title]');
  const hint = q<HTMLElement>('[data-hint]');
  const viewport = q<HTMLElement>('[data-board]');
  const toolsEl = q<HTMLElement>('[data-tools]');
  const controls = q<HTMLElement>('[data-controls]');
  const status = q<HTMLElement>('[data-status]');
  const info = q<HTMLElement>('[data-info]');
  const orderEl = q<HTMLElement>('[data-order]');
  const howto = q<HTMLElement>('[data-howto]');
  const eyebrow = q<HTMLElement>('[data-eyebrow]');
  howto.textContent = tx(T.howto);

  const world = el('div', 'zf-world');
  const beltLayer = document.createElementNS(SVG_NS, 'svg');
  beltLayer.setAttribute('class', 'zf-belts');
  beltLayer.setAttribute('aria-hidden', 'true');
  const cellsLayer = el('div', 'zf-cells');
  const itemsLayer = el('div', 'zf-items');
  world.append(beltLayer, cellsLayer, itemsLayer);
  const zoomBar = el('div', 'zf-zoom');
  // Anzeige im Spielfeld (offene Welt): Münzen und Stand beim Auftrag
  const hud = el('div', 'zf-hud');
  hud.setAttribute('aria-hidden', 'true');
  hud.hidden = true;
  viewport.append(world, zoomBar, hud);

  let index = Math.max(0, WORLD_1.findIndex((l) => !stars[l.id]));
  let level: LevelInfo = WORLD_1[index]!;
  const openWorld = makeWorld();
  let mode: 'level' | 'world' = 'level';
  let board: Board = boardOfLevel(level);
  let wstate: WorldState = worldStart();
  let econ: Economy = newEconomy();
  let saveCounter = 0;
  const sourceAt = (x: number, y: number) => board.sources.find((sp) => sp.x === x && sp.y === y);
  const baseAt = (x: number, y: number) => x >= board.base.x && y >= board.base.y && x < board.base.x + board.base.w && y < board.base.y + board.base.h;
  const canBuild = (x: number, y: number) => (mode === 'level' ? canPlace(level, x, y) : canBuildWorld(openWorld, x, y, econ.zone));
  const allParts = (): Grid => (mode === 'level' ? withFixed(level, grid) : grid);
  const items = (): Item[] => (mode === 'level' ? state.items : wstate.items);
  let grid: Grid = new Map();
  let tool: Tool = { kind: 'part', spec: BELT };
  let state: State = start();
  let running = false;
  let fast = false;
  let timer = 0;
  let failedRuns = 0;
  let hasRun = false;
  const view = { x: 0, y: 0, s: 1 };

  // ---------- Ansicht (verschieben, zoomen) ----------
  function applyView(): void {
    world.style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.s})`;
  }

  function zoomAt(factor: number, cx: number, cy: number): void {
    const s = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, view.s * factor));
    const k = s / view.s;
    view.x = cx - (cx - view.x) * k;
    view.y = cy - (cy - view.y) * k;
    view.s = s;
    applyView();
  }

  /** Quelle, Lager und vorgegebene Teile ins Bild holen. */
  function fit(): void {
    const box = viewport.getBoundingClientRect();
    // Level: Quelle, Lager, vorgegebene Teile; Welt: die Umgebung der Basis
    const pts =
      mode === 'level'
        ? [[level.source.x, level.source.y], [level.target.x, level.target.y], ...(level.fixed ?? []).map((f) => [f.x, f.y])]
        : [[board.base.x - 5, board.base.y - 4], [board.base.x + board.base.w + 4, board.base.y + board.base.h + 3]];
    const xs = pts.map((p) => p[0]!);
    const ys = pts.map((p) => p[1]!);
    const x0 = Math.max(0, Math.min(...xs) - 1);
    const x1 = Math.min(board.cols, Math.max(...xs) + 2);
    const y0 = Math.max(0, Math.min(...ys) - 1);
    const y1 = Math.min(board.rows, Math.max(...ys) + 2);
    // Beim Einpassen nicht zu klein (Felder sollen sich noch antippen lassen); weiter heraus zoomt man selbst
    const s = Math.min(MAX_ZOOM, Math.max(FIT_MIN_ZOOM, Math.min(box.width / ((x1 - x0) * CELL), box.height / ((y1 - y0) * CELL), 1.2)));
    view.s = s;
    view.x = box.width / 2 - ((x0 + x1) / 2) * CELL * s;
    view.y = box.height / 2 - ((y0 + y1) / 2) * CELL * s;
    applyView();
  }

  /** Bildschirmpunkt → Kästchen (oder null außerhalb der Karte). */
  function cellAt(clientX: number, clientY: number): [number, number] | null {
    const box = viewport.getBoundingClientRect();
    const x = Math.floor((clientX - box.left - view.x) / (CELL * view.s));
    const y = Math.floor((clientY - box.top - view.y) / (CELL * view.s));
    return x >= 0 && y >= 0 && x < board.cols && y < board.rows ? [x, y] : null;
  }

  const zoomBtn = (label: string, aria: string, act: () => void) => {
    const b = el('button', 'zf-zoom__btn', label);
    b.type = 'button';
    b.setAttribute('aria-label', aria);
    b.title = aria;
    b.addEventListener('click', act);
    zoomBar.append(b);
  };
  const center = () => {
    const box = viewport.getBoundingClientRect();
    return [box.width / 2, box.height / 2] as const;
  };
  zoomBtn('+', tx(T.zoomIn), () => zoomAt(1.25, ...center()));
  zoomBtn('−', tx(T.zoomOut), () => zoomAt(0.8, ...center()));
  zoomBtn('⌖', tx(T.fit), fit);

  viewport.addEventListener(
    'wheel',
    (event) => {
      event.preventDefault();
      const box = viewport.getBoundingClientRect();
      zoomAt(event.deltaY < 0 ? 1.12 : 1 / 1.12, event.clientX - box.left, event.clientY - box.top);
    },
    { passive: false },
  );

  // ---------- Zeiger auf der Karte ----------
  const pointers = new Map<number, { x: number; y: number }>();
  let gesture: { mode: 'pan' | 'draw' | 'erase' | 'tap'; startX: number; startY: number; moved: boolean; last: [number, number] | null } | null = null;
  let pinch: { dist: number; mx: number; my: number } | null = null;

  viewport.addEventListener('pointerdown', (event) => {
    if ((event.target as Element).closest('.zf-zoom')) return;
    viewport.setPointerCapture(event.pointerId);
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()] as [{ x: number; y: number }, { x: number; y: number }];
      pinch = { dist: Math.hypot(a.x - b.x, a.y - b.y), mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 };
      gesture = null;
      return;
    }
    const panButton = event.button === 1 || event.button === 2;
    const mode = panButton || tool.kind === 'hand' ? 'pan' : isBelt(tool) ? 'draw' : tool.kind === 'erase' ? 'erase' : 'tap';
    gesture = { mode, startX: event.clientX, startY: event.clientY, moved: false, last: cellAt(event.clientX, event.clientY) };
    if (mode === 'erase' && gesture.last) eraseAt(...gesture.last);
    event.preventDefault();
  });

  viewport.addEventListener('pointermove', (event) => {
    if (!pointers.has(event.pointerId)) return;
    const prev = pointers.get(event.pointerId)!;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pinch && pointers.size >= 2) {
      const [a, b] = [...pointers.values()] as [{ x: number; y: number }, { x: number; y: number }];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2;
      const box = viewport.getBoundingClientRect();
      view.x += mx - pinch.mx;
      view.y += my - pinch.my;
      zoomAt(dist / (pinch.dist || 1), mx - box.left, my - box.top);
      pinch = { dist, mx, my };
      return;
    }
    if (!gesture) return;
    if (Math.hypot(event.clientX - gesture.startX, event.clientY - gesture.startY) > 6) gesture.moved = true;
    if (gesture.mode === 'pan' || (gesture.mode === 'tap' && gesture.moved)) {
      gesture.mode = 'pan';
      view.x += event.clientX - prev.x;
      view.y += event.clientY - prev.y;
      applyView();
      return;
    }
    const cell = cellAt(event.clientX, event.clientY);
    if (!cell || (gesture.last && cell[0] === gesture.last[0] && cell[1] === gesture.last[1])) return;
    if (gesture.mode === 'erase') eraseAt(...cell);
    if (gesture.mode === 'draw') drawBelt(gesture.last, cell);
    gesture.last = cell;
  });

  const endPointer = (event: PointerEvent) => {
    pointers.delete(event.pointerId);
    if (pointers.size < 2) pinch = null;
    if (!gesture || pointers.size > 0) return;
    const g = gesture;
    gesture = null;
    if (!g.moved && (g.mode === 'tap' || g.mode === 'draw')) {
      const cell = cellAt(event.clientX, event.clientY);
      if (cell) tap(...cell);
    }
  };
  viewport.addEventListener('pointerup', endPointer);
  viewport.addEventListener('pointercancel', endPointer);
  viewport.addEventListener('contextmenu', (event) => event.preventDefault());

  // ---------- Bauen ----------
  function editable(): boolean {
    if (mode === 'world') return true;
    if (running) {
      say(tx(T.editLocked), 'warn');
      return false;
    }
    if (hasRun) resetRun();
    return true;
  }

  function changed(): void {
    renderCells();
    renderInfo();
    if (mode === 'world') saveWorld(grid, econ);
  }

  /** In der offenen Welt bezahlen (im Level ist alles umsonst); false, wenn das Geld nicht reicht. */
  function pay(price: number): boolean {
    if (mode !== 'world') return true;
    if (price > 0 && econ.coins < price) {
      say(tx(T.tooPoor, { n: ctxNum(price - econ.coins) }), 'warn');
      return false;
    }
    econ.coins -= price;
    return true;
  }

  /** Band-Weg ziehen: das letzte Feld zeigt aufs neue, das neue bekommt dieselbe Richtung. */
  function drawBelt(from: [number, number] | null, to: [number, number]): void {
    if (!editable()) return;
    if (from) {
      const d = ([0, 1, 2, 3] as Dir[]).find((dd) => from[0] + DX[dd] === to[0] && from[1] + DY[dd] === to[1]);
      if (d === undefined) return;
      const part = grid.get(key(...from));
      if (part) part.dir = d;
      // Auch das Start-Kästchen bekommt ein Band (nicht nur die folgenden)
      else if (canBuild(...from) && pay(BELT.price)) grid.set(key(...from), { op: null, dir: d });
      if (canBuild(...to)) {
        const existing = grid.get(key(...to));
        if (existing) existing.dir = d;
        else if (pay(BELT.price)) grid.set(key(...to), { op: null, dir: d });
      }
    }
    changed();
  }

  function eraseAt(x: number, y: number): void {
    const part = grid.get(key(x, y));
    if (!part || !editable()) return;
    grid.delete(key(x, y));
    if (mode === 'world') econ.coins += priceOf(part);
    changed();
  }

  /** Teil setzen; steht dort schon dasselbe, wird es gedreht (Weiche: nach vier Drehungen wechselt die Seite). */
  function placeSpec(spec: PartSpec, x: number, y: number): void {
    if (!canBuild(x, y) || !editable()) return;
    const k = key(x, y);
    const part = grid.get(k);
    if (part && partId(part) === spec.id) {
      if (part.sort) {
        const r = (part.dir + (part.side === 3 ? 4 : 0) + 1) % 8;
        part.dir = (r % 4) as Dir;
        part.side = r < 4 ? 1 : 3;
      } else part.dir = ((part.dir + 1) % 4) as Dir;
    } else {
      if (mode === 'world' && !unlockedParts(econ.order).has(spec.id)) return lockedInfo(spec);
      if (!pay(spec.price - (part && mode === 'world' ? priceOf(part) : 0))) return;
      grid.set(k, makePart(spec, part?.dir ?? guessDir(x, y)));
      if (spec.kind === 'sort') say(tx(T.sortHelp));
      if (spec.kind === 'merge') say(tx(T.mergeHelp));
      if (spec.kind === 'bridge') say(tx(T.bridgeHelp));
    }
    changed();
  }

  function lockedInfo(spec: PartSpec): void {
    say(tx(T.locked, { p: tx(specName(spec)), n: unlockedBy(spec.id) + 1 }), 'warn');
  }

  function tap(x: number, y: number): void {
    if (tool.kind === 'hand') return;
    if (tool.kind === 'erase') return eraseAt(x, y);
    placeSpec(tool.spec, x, y);
  }

  /** Neue Teile setzen den Weg fort; geht es geradeaus nicht weiter, dann zur Seite Richtung Lager. */
  function guessDir(x: number, y: number): Dir {
    const dirs = [0, 1, 2, 3] as Dir[];
    for (const t of dirs) if (baseAt(x + DX[t], y + DY[t])) return t;
    const all = allParts();
    const tx0 = board.base.x + (board.base.w - 1) / 2;
    const ty0 = board.base.y + (board.base.h - 1) / 2;
    const open = (d: Dir) => canBuild(x + DX[d], y + DY[d]) || baseAt(x + DX[d], y + DY[d]);
    const toward = (d: Dir) => Math.abs(x + DX[d] - tx0) + Math.abs(y + DY[d] - ty0);
    for (const d of dirs) {
      if (!outsAt(all, x - DX[d], y - DY[d]).includes(d)) continue;
      if (open(d)) return d;
      return dirs.filter((t) => t !== (d + 2) % 4 && open(t)).sort((a, c) => toward(a) - toward(c))[0] ?? d;
    }
    return dirs.filter(open).sort((a, c) => toward(a) - toward(c))[0] ?? 0;
  }

  /** Ausgänge eines Feldes (Quelle oder Teil). */
  function outsAt(all: Grid, x: number, y: number, depth = 0): Dir[] {
    const sp = sourceAt(x, y);
    if (sp) return [sp.dir];
    const part = all.get(key(x, y));
    if (!part) return [];
    // Brücke: gibt in die Richtungen weiter, aus denen auf der Gegenseite etwas hineinläuft
    if (part.bridge) return depth > 6 ? [] : ([0, 1, 2, 3] as Dir[]).filter((d) => outsAt(all, x - DX[d], y - DY[d], depth + 1).includes(d));
    return outputs(part);
  }

  /** Aus welchen Richtungen kommen Zahlen auf dieses Feld? */
  function insAt(all: Grid, x: number, y: number): Dir[] {
    return ([0, 1, 2, 3] as Dir[]).filter((d) => outsAt(all, x - DX[d], y - DY[d]).includes(d));
  }

  // ---------- Zeichnen ----------
  /**
   * Bänder als schmaler Streifen durch die Feldmitte: von der Kante, aus der
   * die Zahl kommt, zur Kante, in die sie weiterläuft – so entstehen auch
   * Kurven. Die laufenden Streifen (stroke-dashoffset in zahlenfabrik.css)
   * zeigen die Laufrichtung. Jedes Stück ist genau eine Feldbreite lang,
   * damit das Muster nahtlos ins nächste Feld übergeht.
   */
  function renderBelts(all: Grid): void {
    beltLayer.setAttribute('width', String(board.cols * CELL));
    beltLayer.setAttribute('height', String(board.rows * CELL));
    const paths: string[] = [];
    const cx = (x: number) => x * CELL + CELL / 2;
    const cy = (y: number) => y * CELL + CELL / 2;
    const edge = (x: number, y: number, d: Dir) => `${x * CELL + EDGE[d]![0]} ${y * CELL + EDGE[d]![1]}`;
    const over: string[] = [];
    for (const [k, part] of all) {
      const [x, y] = k.split(',').map(Number) as [number, number];
      if (part.bridge) {
        // Brücke: waagerecht unten, senkrecht oben drüber (eigene Ebene)
        paths.push(`M${edge(x, y, 2)}L${edge(x, y, 0)}`);
        over.push(`M${edge(x, y, 3)}L${edge(x, y, 1)}`);
        continue;
      }
      const ins = insAt(all, x, y);
      const outs = outputs(part);
      if (ins.length <= 1 && outs.length === 1) {
        // ein Weg hinein, einer hinaus: ein durchgehender Streifen (auch um die Ecke)
        const from = ((ins[0] ?? part.dir) + 2) % 4;
        paths.push(`M${edge(x, y, from as Dir)}L${cx(x)} ${cy(y)}L${edge(x, y, outs[0]!)}`);
        continue;
      }
      // Weiche oder Zusammenführen: jeder Eingang zur Mitte, von der Mitte zu jedem Ausgang
      for (const d of ins.length ? ins : [part.dir]) paths.push(`M${edge(x, y, ((d + 2) % 4) as Dir)}L${cx(x)} ${cy(y)}`);
      for (const d of outs) paths.push(`M${cx(x)} ${cy(y)}L${edge(x, y, d)}`);
    }
    // Stummel aus den Quellen heraus (nur wenn angeschlossen) und ins Ziel hinein
    for (const { x, y, dir } of board.sources) {
      if (mode === 'world' && !all.has(key(x + DX[dir], y + DY[dir])) && !baseAt(x + DX[dir], y + DY[dir])) continue;
      paths.push(`M${cx(x)} ${cy(y)}L${edge(x, y, dir)}`);
    }
    for (let bx0 = board.base.x; bx0 < board.base.x + board.base.w; bx0++) {
      for (let by0 = board.base.y; by0 < board.base.y + board.base.h; by0++) {
        for (const into of insAt(all, bx0, by0)) {
          const [ax, ay] = EDGE[(into + 2) % 4]!;
          const [ex, ey] = EDGE[into]!;
          paths.push(`M${bx0 * CELL + ax} ${by0 * CELL + ay}L${bx0 * CELL + (ax + ex) / 2 + (ex - ax) * 0.1} ${by0 * CELL + (ay + ey) / 2 + (ey - ay) * 0.1}`);
        }
      }
    }
    const d = paths.join('');
    const mk = (cls: string) => {
      const p = document.createElementNS(SVG_NS, 'path');
      p.setAttribute('class', cls);
      p.setAttribute('d', d);
      return p;
    };
    const mkOver = (cls: string) => {
      const p = document.createElementNS(SVG_NS, 'path');
      p.setAttribute('class', `${cls} zf-belt--over`);
      p.setAttribute('d', over.join(''));
      return p;
    };
    beltLayer.replaceChildren(mk('zf-belt__edge'), mk('zf-belt__base'), mk('zf-belt__run'), ...(over.length ? [mkOver('zf-belt__shadow'), mkOver('zf-belt__edge'), mkOver('zf-belt__base'), mkOver('zf-belt__run')] : []));
    beltLayer.classList.toggle('is-running', running);
  }

  function renderCells(): void {
    world.style.width = `${board.cols * CELL}px`;
    world.style.height = `${board.rows * CELL}px`;
    const all = allParts();
    renderBelts(all);
    const frag = document.createDocumentFragment();
    const at = (x: number, y: number, cls: string) => {
      const c = el('div', `zf-cell ${cls}`);
      c.style.left = `${x * CELL}px`;
      c.style.top = `${y * CELL}px`;
      frag.append(c);
      return c;
    };
    const open = mode === 'world' ? zoneRect(openWorld, econ.zone) : null;
    for (const sp of board.sources) {
      const c = at(sp.x, sp.y, 'zf-cell--source');
      c.append(el('span', 'zf-cell__big', String(sp.value)), el('span', 'zf-cell__small', `🏭 ${ARROW[sp.dir]}`));
      c.title = tx(T.source);
      if (open && !inRect(open, sp.x, sp.y)) {
        c.classList.add('is-locked');
        c.title = tx(T.sourceLocked);
      }
    }
    if (mode === 'level') {
      const c = at(level.target.x, level.target.y, 'zf-cell--target');
      c.append(el('span', 'zf-cell__big', String(level.target.value)), el('span', 'zf-cell__small zf-target-count', `📦 ${state.delivered}/${level.need}`));
      c.title = tx(T.target);
    } else {
      const c = at(board.base.x, board.base.y, 'zf-cell--base');
      c.style.width = `${board.base.w * CELL - 12}px`;
      c.style.height = `${board.base.h * CELL - 12}px`;
      c.append(el('span', 'zf-base__icon', '🏠'), el('span', 'zf-cell__big zf-base-score', baseLine()), el('span', 'zf-cell__small', tx(T.base)));
      c.title = tx(T.base);
    }
    for (const k of board.walls) {
      const [x, y] = k.split(',').map(Number) as [number, number];
      at(x, y, 'zf-cell--rock').append(el('span', 'zf-cell__rock', '🪨'));
    }
    for (const [k, part] of all) {
      if (!part.op && !part.sort && !part.merge && !part.bridge) continue;
      const [x, y] = k.split(',').map(Number) as [number, number];
      const fixed = board.fixed.has(k);
      if (part.sort) {
        const c = at(x, y, 'zf-cell--op zf-cell--sort');
        const [yes, no] = outputs(part) as [Dir, Dir];
        c.append(el('span', 'zf-cell__mid', tx(testLabel(part.sort))), el('span', 'zf-cell__small', `✓${ARROW[yes]} ✗${ARROW[no]}`));
        c.title = tx(T.sortHelp);
        continue;
      }
      if (part.bridge) {
        at(x, y, 'zf-cell--bridge').title = tx(T.bridgeHelp);
        continue;
      }
      if (part.merge) {
        const c = at(x, y, 'zf-cell--op zf-cell--merge');
        c.append(el('span', 'zf-cell__mid', part.merge === '+' ? 'a+b' : 'a×b'), el('span', 'zf-cell__small', ARROW[part.dir]!));
        c.title = tx(T.mergeHelp);
        continue;
      }
      const c = at(x, y, 'zf-cell--op');
      if (fixed) c.classList.add('zf-cell--fixed');
      c.append(el('span', 'zf-cell__big', opLabel(part.op!)), el('span', 'zf-cell__small', ARROW[part.dir]!));
      if (fixed) c.append(el('span', 'zf-cell__lock', '🔒'));
    }
    if (mode === 'level' && state.error) at(state.error.x, state.error.y, 'zf-cell--error');
    // Noch nicht freigekauftes Land: Nebel außerhalb des offenen Gebiets
    if (open && (open.w < board.cols || open.h < board.rows)) {
      const fog = el('div', 'zf-fog');
      Object.assign(fog.style, { left: `${open.x * CELL}px`, top: `${open.y * CELL}px`, width: `${open.w * CELL}px`, height: `${open.h * CELL}px` });
      const price = ZONE_PRICES[econ.zone + 1];
      if (price !== undefined) fog.append(el('span', 'zf-fog__label', tx(T.fogLabel, { n: ctxNum(price) })));
      frag.append(fog);
    }
    cellsLayer.replaceChildren(frag);
    renderExpand();
  }

  const numberFormat = new Intl.NumberFormat(lang === 'de' ? 'de-DE' : 'en-GB');
  function ctxNum(n: number): string {
    return numberFormat.format(n).replace('-', '−');
  }

  /** Aufschrift der Basis: Stand beim aktuellen Auftrag. */
  function baseLine(): string {
    return `${ctxNum(econ.progress)}/${ctxNum(orderAt(econ.order).count)}`;
  }

  /** Kurzer Effekt an einem Feld (nur ohne reduzierte Bewegung). */
  function effect(x: number, y: number, text: string, cls: string, ms = 700): void {
    if (reduced) return;
    const e = el('span', cls, text);
    e.style.left = `${x * CELL + CELL / 2}px`;
    e.style.top = `${y * CELL + CELL / 2}px`;
    itemsLayer.append(e);
    setTimeout(() => e.remove(), ms);
  }

  function renderItems(): void {
    const old = new Map([...itemsLayer.querySelectorAll<HTMLElement>('.zf-item')].map((e) => [e.dataset.id!, e]));
    for (const item of items()) {
      let e = old.get(String(item.id));
      if (!e) {
        e = el('span', 'zf-item', ctxNum(item.value));
        e.dataset.id = String(item.id);
        e.style.left = `${item.x * CELL + CELL / 2}px`;
        e.style.top = `${item.y * CELL + CELL / 2}px`;
        itemsLayer.append(e);
      }
      old.delete(String(item.id));
      const label = ctxNum(item.value);
      if (e.textContent !== label) {
        e.textContent = label;
        e.classList.remove('zf-item--pop');
        void e.offsetWidth;
        e.classList.add('zf-item--pop');
      }
      e.classList.toggle('zf-item--wait', !!item.wait);
      // Auf der Brücke liegen zwei Zahlen übereinander: leicht versetzt zeigen
      const onBridge = mode === 'world' && !!grid.get(key(item.x, item.y))?.bridge;
      e.classList.toggle('zf-item--over', onBridge && item.heading !== undefined && item.heading % 2 === 1);
      e.classList.toggle('zf-item--under', onBridge && item.heading !== undefined && item.heading % 2 === 0);
      e.classList.toggle('zf-item--long', label.length > 4);
      e.style.left = `${item.x * CELL + CELL / 2}px`;
      e.style.top = `${item.y * CELL + CELL / 2}px`;
    }
    for (const e of old.values()) e.remove();
    const count = cellsLayer.querySelector('.zf-target-count');
    if (count) count.textContent = `📦 ${state.delivered}/${level.need}`;
    const score = cellsLayer.querySelector('.zf-base-score');
    if (score) score.textContent = baseLine();
    if (mode !== 'world') return;
    // Verlorene Zahlen: Wölkchen; Zusammenführen: Funke; Münzen an der Basis
    for (const [x, y] of wstate.lostAt.slice(0, 12)) effect(x, y, '💨', 'zf-poof', 600);
    for (const [x, y] of wstate.mergedAt.slice(0, 12)) effect(x, y, '✨', 'zf-poof', 600);
    const coins = wstate.delivered.reduce((a, v) => a + Math.max(0, v), 0);
    if (coins > 0) effect(board.base.x + 1, board.base.y, `+${ctxNum(coins)} 🪙`, 'zf-coin-float', 900);
  }

  // ---------- Inventar ----------
  /** Merkmal, ob sich Preise/Freischaltungen geändert haben (dann Inventar neu zeichnen). */
  let toolsKey = '';
  function renderTools(): void {
    const world = mode === 'world';
    const open = world ? unlockedParts(econ.order) : null;
    // Gesperrte Teile nur zeigen, wenn der aktuelle Auftrag sie freischaltet (als Vorschau)
    const soon = new Set(world ? orderAt(econ.order).unlock : []);
    const shown = board.tools.filter((spec) => !open || open.has(spec.id) || soon.has(spec.id));
    const list: Tool[] = [{ kind: 'hand' }, { kind: 'part', spec: BELT }, ...shown.map((spec): Tool => ({ kind: 'part', spec })), { kind: 'erase' }];
    toolsKey = toolsSignature();
    toolsEl.classList.toggle('zf-tools--world', world);
    toolsEl.replaceChildren(
      ...list.map((t) => {
        const spec = t.kind === 'part' ? t.spec : null;
        const locked = !!(spec && open && !open.has(spec.id));
        const b = el('button', `zf-tool${spec && spec.kind !== 'belt' ? ` zf-tool--op zf-tool--${spec.kind}` : ''}`);
        b.type = 'button';
        const icon = t.kind === 'hand' ? '✋' : t.kind === 'erase' ? '🧽' : spec!.kind === 'belt' ? '→' : tx(specLabel(spec!));
        const label = t.kind === 'hand' ? tx(T.hand) : t.kind === 'erase' ? tx(T.erase) : spec!.kind === 'belt' ? tx(T.belt) : '';
        b.append(el('span', 'zf-tool__icon', locked ? `🔒 ${icon}` : icon));
        if (label) b.append(el('span', 'zf-tool__label', label));
        if (world && spec) {
          const tag = locked ? tx(T.lockedShort, { n: unlockedBy(spec.id) + 1 }) : `🪙 ${ctxNum(spec.price)}`;
          b.append(el('span', `zf-tool__price${!locked && econ.coins < spec.price ? ' is-poor' : ''}`, tag));
        }
        if (locked) b.classList.add('is-locked');
        const same = t.kind === tool.kind && (t.kind !== 'part' || (tool.kind === 'part' && t.spec.id === tool.spec.id));
        b.setAttribute('aria-pressed', String(same));
        const name = spec ? tx(specName(spec)) : label;
        b.setAttribute('aria-label', world && spec ? `${name}, ${locked ? tx(T.lockedShort, { n: unlockedBy(spec.id) + 1 }) : tx(T.price, { n: ctxNum(spec.price) })}` : name);
        b.title = b.getAttribute('aria-label')!;
        if (spec && !locked) bindDrag(b, spec);
        b.addEventListener('click', () => {
          if (spec && locked) return lockedInfo(spec);
          tool = t;
          if (spec?.kind === 'sort') say(tx(T.sortHelp));
          else if (spec?.kind === 'merge') say(tx(T.mergeHelp));
          renderTools();
        });
        return b;
      }),
    );
  }

  /** Was das Aussehen des Inventars bestimmt: freigeschaltet und bezahlbar. */
  function toolsSignature(): string {
    if (mode !== 'world') return 'level';
    return `${econ.order}|${WORLD_PARTS.filter((p) => econ.coins >= p.price).length}`;
  }

  /** Teil aus dem Inventar auf die Karte ziehen. */
  function bindDrag(button: HTMLElement, spec: PartSpec): void {
    let ghost: HTMLElement | null = null;
    let sx = 0;
    let sy = 0;
    button.addEventListener('pointerdown', (event) => {
      sx = event.clientX;
      sy = event.clientY;
      button.setPointerCapture(event.pointerId);
    });
    button.addEventListener('pointermove', (event) => {
      if (!button.hasPointerCapture(event.pointerId)) return;
      if (!ghost && Math.hypot(event.clientX - sx, event.clientY - sy) < 8) return;
      if (!ghost) {
        ghost = el('div', `zf-ghost${spec.kind !== 'belt' ? ` zf-ghost--op zf-ghost--${spec.kind}` : ''}`, spec.kind === 'belt' ? '→' : tx(specLabel(spec)));
        document.body.append(ghost);
      }
      ghost.style.left = `${event.clientX}px`;
      ghost.style.top = `${event.clientY}px`;
    });
    const end = (event: PointerEvent) => {
      if (!ghost) return;
      ghost.remove();
      ghost = null;
      const cell = cellAt(event.clientX, event.clientY);
      const box = viewport.getBoundingClientRect();
      const inside = event.clientX >= box.left && event.clientX <= box.right && event.clientY >= box.top && event.clientY <= box.bottom;
      if (cell && inside) placeSpec(spec, ...cell);
      // Klick nach dem Ziehen nicht als Werkzeugwahl werten
      button.addEventListener('click', (e) => e.stopImmediatePropagation(), { once: true, capture: true });
    };
    button.addEventListener('pointerup', end);
    button.addEventListener('pointercancel', end);
  }

  // ---------- Ablauf ----------
  const btn = (label: string, cls = 'zf-btn') => {
    const b = el('button', cls, label);
    b.type = 'button';
    return b;
  };
  const runBtn = btn(tx(T.start), 'zf-btn zf-btn--main');
  const stepBtn = btn(tx(T.stepBtn));
  const fastBtn = btn(tx(T.fast));
  const stopBtn = btn(tx(T.stop));
  const clearBtn = btn(tx(T.clear));
  fastBtn.setAttribute('aria-pressed', 'false');
  const expandBtn = btn('', 'zf-btn zf-btn--expand');
  controls.append(runBtn, stepBtn, fastBtn, stopBtn, clearBtn, expandBtn);

  /** Knopf „Neues Gebiet“: nur in der offenen Welt, solange es noch Land gibt. */
  function renderExpand(): void {
    const next = econ.zone + 1;
    expandBtn.hidden = mode !== 'world' || next >= ZONE_PRICES.length;
    if (expandBtn.hidden) return;
    const price = ZONE_PRICES[next]!;
    expandBtn.textContent = tx(T.expand, { n: ctxNum(price) });
    expandBtn.classList.toggle('is-poor', econ.coins < price);
  }

  expandBtn.addEventListener('click', () => {
    const next = econ.zone + 1;
    const price = ZONE_PRICES[next];
    if (price === undefined || !pay(price)) return;
    econ.zone = next;
    say(tx(T.expandDone), 'good');
    saveWorld(grid, econ);
    renderCells();
    renderInfo();
    renderTools();
  });

  function say(text: string, kind: 'info' | 'warn' | 'good' | 'bad' = 'info'): void {
    status.textContent = text;
    status.dataset.kind = kind;
  }

  function renderInfo(): void {
    if (mode === 'world') {
      info.replaceChildren(
        el('strong', 'zf-coins', tx(T.coins, { n: ctxNum(econ.coins) })),
        el('span', '', tx(T.total, { n: ctxNum(econ.total) })),
        el('span', 'zf-goal', tx(T.lost, { n: ctxNum(wstate.lost) })),
        el('span', 'zf-goal', `${tx(T.parts)}: ${grid.size}`),
      );
      renderOrder();
      hud.hidden = false;
      hud.textContent = `🪙 ${ctxNum(econ.coins)} · 📋 ${baseLine()}`;
      if (!expandBtn.hidden) expandBtn.classList.toggle('is-poor', econ.coins < (ZONE_PRICES[econ.zone + 1] ?? 0));
      if (toolsSignature() !== toolsKey) renderTools();
      return;
    }
    hud.hidden = true;
    info.replaceChildren(el('span', '', `${tx(T.parts)}: ${grid.size}`), el('span', '', `${tx(T.delivered)}: ${state.delivered}/${level.need}`), el('span', 'zf-goal', tx(T.starsPar, { n: level.par })), el('span', 'zf-goal', tx(T.starsFirst)));
  }

  /** Aktueller Auftrag mit Fortschritt, Belohnung und dem, was er freischaltet. */
  function renderOrder(): void {
    orderEl.hidden = mode !== 'world';
    if (mode !== 'world') return;
    const o = orderAt(econ.order);
    const pct = Math.min(100, (100 * econ.progress) / o.count);
    const bar = el('span', 'zf-order__bar');
    const fill = el('span', 'zf-order__fill');
    fill.style.width = `${pct}%`;
    bar.append(fill);
    bar.setAttribute('role', 'progressbar');
    bar.setAttribute('aria-valuemin', '0');
    bar.setAttribute('aria-valuemax', String(o.count));
    bar.setAttribute('aria-valuenow', String(econ.progress));
    bar.setAttribute('aria-label', tx(T.order, { n: econ.order + 1 }));
    const unlock = o.unlock.map((id) => tx(specName(specById(id)!))).join(', ');
    const reward = tx(T.reward, { n: ctxNum(o.reward) }) + (unlock ? ` · ${tx(T.rewardNew, { p: unlock })}` : '');
    orderEl.replaceChildren(
      el('span', 'zf-order__tag', `📋 ${tx(T.order, { n: econ.order + 1 })}`),
      el('strong', 'zf-order__text', tx(orderText(o, ctxNum))),
      el('span', 'zf-order__count', `${ctxNum(econ.progress)}/${ctxNum(o.count)}`),
      bar,
      el('span', 'zf-order__reward', o.streak ? `${reward} · ${tx(T.streakHint)}` : reward),
    );
  }

  /** Geschaffte Aufträge melden: Münzen, neue Teile, kurzer Jubel an der Basis. */
  function celebrate(done: Order[]): void {
    const coins = done.reduce((a, o) => a + o.reward, 0);
    const parts = done.flatMap((o) => o.unlock).map((id) => tx(specName(specById(id)!)));
    say(`${tx(T.orderDone, { n: ctxNum(coins) })}${parts.length ? ` ${tx(T.unlocked, { p: parts.join(', ') })}` : ''}`, 'good');
    const baseEl = cellsLayer.querySelector<HTMLElement>('.zf-cell--base');
    if (baseEl && !reduced) {
      baseEl.classList.remove('is-cheering');
      void baseEl.offsetWidth;
      baseEl.classList.add('is-cheering');
    }
    effect(board.base.x + 1, board.base.y + 1, '🎉', 'zf-coin-float zf-coin-float--big', 1200);
    renderTools();
    saveWorld(grid, econ);
  }

  function tick(): void {
    if (mode === 'world') {
      wstate = worldStep(openWorld, grid, wstate, econ.zone);
      if (wstate.delivered.length) {
        const r = deliver(econ, wstate.delivered);
        econ = r.econ;
        if (r.completed.length) celebrate(r.completed);
      }
      renderItems();
      renderInfo();
      if (++saveCounter % 25 === 0) saveWorld(grid, econ);
      return;
    }
    state = step(level, withFixed(level, grid), state);
    hasRun = true;
    if (state.error) {
      stopTimer();
      failedRuns += 1;
      const e = state.error;
      const msg = e.kind === 'fell' ? T.fell : e.kind === 'wrong' ? T.wrong : e.kind === 'divide' ? T.divide : T.timeout;
      say(`✗ ${tx(msg, { v: e.value, t: level.target.value })}`, 'bad');
      renderItems();
      renderCells();
      return;
    }
    renderItems();
    if (state.won) {
      stopTimer();
      const got = starsFor(level, grid.size, failedRuns);
      stars[level.id] = Math.max(stars[level.id] ?? 0, got);
      save(stars);
      say(`✓ ${tx(T.won)} ${'★'.repeat(got)}${'☆'.repeat(3 - got)}`, 'good');
      renderLevels();
      if (index < WORLD_1.length - 1) {
        const n = btn(tx(T.next), 'zf-btn zf-btn--main');
        n.addEventListener('click', () => openLevel(index + 1));
        status.append(' ', n);
        n.focus();
      }
    }
    renderInfo();
  }

  function stopTimer(): void {
    running = false;
    beltLayer.classList.remove('is-running');
    clearInterval(timer);
    timer = 0;
    runBtn.textContent = tx(T.start);
  }

  function startTimer(): void {
    if (state.error || state.won) resetRun();
    running = true;
    beltLayer.classList.add('is-running');
    beltLayer.classList.toggle('is-fast', fast);
    runBtn.textContent = tx(T.pause);
    say('');
    clearInterval(timer);
    timer = window.setInterval(tick, fast ? 120 : reduced ? 500 : 420);
    tick();
  }

  function resetRun(): void {
    stopTimer();
    state = start();
    wstate = worldStart();
    hasRun = false;
    say('');
    itemsLayer.replaceChildren();
    renderCells();
    renderInfo();
  }

  runBtn.addEventListener('click', () => (running ? stopTimer() : startTimer()));
  stepBtn.addEventListener('click', () => {
    if (running) stopTimer();
    if (state.error || state.won) resetRun();
    tick();
  });
  fastBtn.addEventListener('click', () => {
    fast = !fast;
    fastBtn.setAttribute('aria-pressed', String(fast));
    if (running) startTimer();
  });
  stopBtn.addEventListener('click', resetRun);
  clearBtn.addEventListener('click', () => {
    if (mode === 'world' && grid.size > 0 && !confirm(tx(T.resetConfirm))) return;
    if (mode === 'world') for (const part of grid.values()) econ.coins += priceOf(part);
    grid = new Map();
    resetRun();
    if (mode === 'world') {
      saveWorld(grid, econ);
      renderTools();
    }
  });

  // ---------- Level ----------
  function renderLevels(): void {
    levelBar.replaceChildren(
      ...WORLD_1.map((l, i) => {
        const n = stars[l.id] ?? 0;
        const b = btn(`${i + 1} ${'★'.repeat(n)}${'☆'.repeat(3 - n)}`, 'zf-level');
        b.setAttribute('aria-pressed', String(mode === 'level' && i === index));
        b.setAttribute('aria-label', `${tx(T.levels)} ${i + 1}: ${tx(l.title)}, ${n}/3 ★`);
        b.addEventListener('click', () => openLevel(i));
        return b;
      }),
    );
    const w = btn(tx(T.world), 'zf-level zf-level--world');
    w.setAttribute('aria-pressed', String(mode === 'world'));
    w.addEventListener('click', openWorldMode);
    levelBar.append(w);
  }

  function openWorldMode(): void {
    if (mode === 'world') return;
    stopTimer();
    mode = 'world';
    board = boardOfWorld(openWorld);
    const saved = loadWorld(openWorld);
    grid = saved.grid;
    econ = saved.econ;
    wstate = worldStart();
    tool = { kind: 'part', spec: BELT };
    title.textContent = tx(T.worldTitle);
    hint.textContent = `💡 ${tx(T.worldHint)}`;
    howto.textContent = tx(T.worldHowto);
    eyebrow.textContent = tx(T.eyebrowWorld);
    stepBtn.hidden = true;
    say('');
    itemsLayer.replaceChildren();
    renderLevels();
    renderTools();
    renderCells();
    renderInfo();
    fit();
  }

  function openLevel(i: number): void {
    stopTimer();
    if (mode === 'world') saveWorld(grid, econ);
    mode = 'level';
    stepBtn.hidden = false;
    index = i;
    level = WORLD_1[i]!;
    board = boardOfLevel(level);
    grid = new Map();
    tool = { kind: 'part', spec: BELT };
    state = start();
    failedRuns = 0;
    hasRun = false;
    title.textContent = `${i + 1}. ${tx(level.title)}`;
    howto.textContent = tx(T.howto);
    eyebrow.textContent = tx(T.eyebrowLevels);
    renderOrder();
    hint.textContent = `💡 ${tx(level.hint)}`;
    say('');
    itemsLayer.replaceChildren();
    renderLevels();
    renderTools();
    renderCells();
    renderInfo();
    fit();
  }

  openLevel(index);
  addEventListener('resize', () => applyView());
  root.classList.add('is-ready');
}
