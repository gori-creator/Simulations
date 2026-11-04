import { L } from '../../curriculum/helpers';
import type { Lang, Localized } from '../../i18n/config';
import { WORLD_1, type LevelInfo } from './levels';
import { canPlace, DX, DY, isFixed, isWall, key, opLabel, start, starsFor, step, withFixed, type Dir, type Grid, type Op, type State } from './model';

/**
 * Zahlenfabrik (Probe, Welt 1): freie Fläche aus Kästchen, die man mit der
 * Hand verschiebt und zoomt. Aus dem Inventar zieht (oder tippt) man Bänder
 * und Maschinen auf die Karte; mit dem Band-Werkzeug zieht man ganze Wege.
 */
const ARROW = ['→', '↓', '←', '↑'];
const STORE = 'spiel:zahlenfabrik';
const CELL = 64;
const MIN_ZOOM = 0.45;
const MAX_ZOOM = 1.8;

type Tool = { kind: 'hand' } | { kind: 'belt' } | { kind: 'op'; op: Op } | { kind: 'erase' };

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
};

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
  q<HTMLElement>('[data-howto]').textContent = tx(T.howto);

  const world = el('div', 'zf-world');
  const cellsLayer = el('div', 'zf-cells');
  const itemsLayer = el('div', 'zf-items');
  world.append(cellsLayer, itemsLayer);
  const zoomBar = el('div', 'zf-zoom');
  viewport.append(world, zoomBar);

  let index = Math.max(0, WORLD_1.findIndex((l) => !stars[l.id]));
  let level: LevelInfo = WORLD_1[index]!;
  let grid: Grid = new Map();
  let tool: Tool = { kind: 'belt' };
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
    const pts = [[level.source.x, level.source.y], [level.target.x, level.target.y], ...(level.fixed ?? []).map((f) => [f.x, f.y])];
    const xs = pts.map((p) => p[0]!);
    const ys = pts.map((p) => p[1]!);
    const x0 = Math.max(0, Math.min(...xs) - 1);
    const x1 = Math.min(level.cols, Math.max(...xs) + 2);
    const y0 = Math.max(0, Math.min(...ys) - 1);
    const y1 = Math.min(level.rows, Math.max(...ys) + 2);
    const s = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.min(box.width / ((x1 - x0) * CELL), box.height / ((y1 - y0) * CELL), 1.2)));
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
    return x >= 0 && y >= 0 && x < level.cols && y < level.rows ? [x, y] : null;
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
    const mode = panButton || tool.kind === 'hand' ? 'pan' : tool.kind === 'belt' ? 'draw' : tool.kind === 'erase' ? 'erase' : 'tap';
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
  }

  /** Band-Weg ziehen: das letzte Feld zeigt aufs neue, das neue bekommt dieselbe Richtung. */
  function drawBelt(from: [number, number] | null, to: [number, number]): void {
    if (!editable()) return;
    if (from) {
      const d = ([0, 1, 2, 3] as Dir[]).find((dd) => from[0] + DX[dd] === to[0] && from[1] + DY[dd] === to[1]);
      if (d === undefined) return;
      const part = grid.get(key(...from));
      if (part) part.dir = d;
      if (canPlace(level, ...to)) {
        const existing = grid.get(key(...to));
        if (existing) existing.dir = d;
        else grid.set(key(...to), { op: null, dir: d });
      }
    }
    changed();
  }

  function eraseAt(x: number, y: number): void {
    if (!grid.has(key(x, y)) || !editable()) return;
    grid.delete(key(x, y));
    changed();
  }

  function placeOp(op: Op | null, x: number, y: number): void {
    if (!canPlace(level, x, y) || !editable()) return;
    const k = key(x, y);
    const part = grid.get(k);
    const same = part && (part.op ? opLabel(part.op) : 'belt') === (op ? opLabel(op) : 'belt');
    if (part && same) part.dir = ((part.dir + 1) % 4) as Dir;
    else grid.set(k, { op, dir: part?.dir ?? guessDir(x, y) });
    changed();
  }

  function tap(x: number, y: number): void {
    if (tool.kind === 'hand') return;
    if (tool.kind === 'erase') return eraseAt(x, y);
    placeOp(tool.kind === 'op' ? tool.op : null, x, y);
  }

  /** Neue Teile setzen den Weg fort; geht es geradeaus nicht weiter, dann zur Seite Richtung Lager. */
  function guessDir(x: number, y: number): Dir {
    const dirs = [0, 1, 2, 3] as Dir[];
    for (const t of dirs) if (x + DX[t] === level.target.x && y + DY[t] === level.target.y) return t;
    const all = withFixed(level, grid);
    const open = (d: Dir) => {
      const nx = x + DX[d];
      const ny = y + DY[d];
      return canPlace(level, nx, ny) || (nx === level.target.x && ny === level.target.y);
    };
    const toward = (d: Dir) => Math.abs(x + DX[d] - level.target.x) + Math.abs(y + DY[d] - level.target.y);
    for (const d of dirs) {
      const fx = x - DX[d];
      const fy = y - DY[d];
      const from = fx === level.source.x && fy === level.source.y ? level.source.dir : all.get(key(fx, fy))?.dir;
      if (from !== d) continue;
      if (open(d)) return d;
      return dirs.filter((t) => t !== (d + 2) % 4 && open(t)).sort((a, c) => toward(a) - toward(c))[0] ?? d;
    }
    return dirs.filter(open).sort((a, c) => toward(a) - toward(c))[0] ?? 0;
  }

  // ---------- Zeichnen ----------
  function renderCells(): void {
    world.style.width = `${level.cols * CELL}px`;
    world.style.height = `${level.rows * CELL}px`;
    const all = withFixed(level, grid);
    const frag = document.createDocumentFragment();
    for (let y = 0; y < level.rows; y++) {
      for (let x = 0; x < level.cols; x++) {
        const c = el('div', 'zf-cell');
        c.style.left = `${x * CELL}px`;
        c.style.top = `${y * CELL}px`;
        const part = all.get(key(x, y));
        if (x === level.source.x && y === level.source.y) {
          c.classList.add('zf-cell--source');
          c.append(el('span', 'zf-cell__big', String(level.source.value)), el('span', 'zf-cell__small', `🏭 ${ARROW[level.source.dir]}`));
          c.title = tx(T.source);
        } else if (x === level.target.x && y === level.target.y) {
          c.classList.add('zf-cell--target');
          c.append(el('span', 'zf-cell__big', String(level.target.value)), el('span', 'zf-cell__small zf-target-count', `📦 ${state.delivered}/${level.need}`));
          c.title = tx(T.target);
        } else if (isWall(level, x, y)) {
          c.classList.add('zf-cell--rock');
          c.append(el('span', 'zf-cell__rock', '🪨'));
        } else if (part) {
          c.classList.add(part.op ? 'zf-cell--op' : 'zf-cell--belt');
          if (isFixed(level, x, y)) c.classList.add('zf-cell--fixed');
          c.dataset.dir = String(part.dir);
          if (part.op) c.append(el('span', 'zf-cell__big', opLabel(part.op)), el('span', 'zf-cell__small', ARROW[part.dir]!));
          else c.append(el('span', 'zf-cell__arrow', ARROW[part.dir]!));
          if (isFixed(level, x, y)) c.append(el('span', 'zf-cell__lock', '🔒'));
        }
        if (state.error && state.error.x === x && state.error.y === y) c.classList.add('zf-cell--error');
        frag.append(c);
      }
    }
    cellsLayer.replaceChildren(frag);
  }

  function renderItems(): void {
    const old = new Map([...itemsLayer.querySelectorAll<HTMLElement>('.zf-item')].map((e) => [e.dataset.id!, e]));
    for (const item of state.items) {
      let e = old.get(String(item.id));
      if (!e) {
        e = el('span', 'zf-item', String(item.value));
        e.dataset.id = String(item.id);
        e.style.left = `${item.x * CELL + CELL / 2}px`;
        e.style.top = `${item.y * CELL + CELL / 2}px`;
        itemsLayer.append(e);
      }
      old.delete(String(item.id));
      if (e.textContent !== String(item.value)) {
        e.textContent = String(item.value);
        e.classList.remove('zf-item--pop');
        void e.offsetWidth;
        e.classList.add('zf-item--pop');
      }
      e.style.left = `${item.x * CELL + CELL / 2}px`;
      e.style.top = `${item.y * CELL + CELL / 2}px`;
    }
    for (const e of old.values()) e.remove();
    const count = cellsLayer.querySelector('.zf-target-count');
    if (count) count.textContent = `📦 ${state.delivered}/${level.need}`;
  }

  // ---------- Inventar ----------
  function renderTools(): void {
    const list: [Tool, string, string][] = [
      [{ kind: 'hand' }, '✋', tx(T.hand)],
      [{ kind: 'belt' }, '→', tx(T.belt)],
      ...level.tools.map((op) => [{ kind: 'op', op }, opLabel(op), ''] as [Tool, string, string]),
      [{ kind: 'erase' }, '🧽', tx(T.erase)],
    ];
    toolsEl.replaceChildren(
      ...list.map(([t, icon, label]) => {
        const b = el('button', `zf-tool${t.kind === 'op' ? ' zf-tool--op' : ''}`);
        b.type = 'button';
        b.append(el('span', 'zf-tool__icon', icon), label ? el('span', 'zf-tool__label', label) : '');
        const same = t.kind === tool.kind && (t.kind !== 'op' || (tool.kind === 'op' && opLabel(t.op) === opLabel(tool.op)));
        b.setAttribute('aria-pressed', String(same));
        b.setAttribute('aria-label', label || icon);
        if (t.kind === 'op' || t.kind === 'belt') bindDrag(b, t.kind === 'op' ? t.op : null);
        b.addEventListener('click', () => {
          tool = t;
          renderTools();
        });
        return b;
      }),
    );
  }

  /** Teil aus dem Inventar auf die Karte ziehen. */
  function bindDrag(button: HTMLElement, op: Op | null): void {
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
        ghost = el('div', `zf-ghost${op ? ' zf-ghost--op' : ''}`, op ? opLabel(op) : '→');
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
      if (cell && inside) placeOp(op, ...cell);
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
  controls.append(runBtn, stepBtn, fastBtn, stopBtn, clearBtn);

  function say(text: string, kind: 'info' | 'warn' | 'good' | 'bad' = 'info'): void {
    status.textContent = text;
    status.dataset.kind = kind;
  }

  function renderInfo(): void {
    info.replaceChildren(el('span', '', `${tx(T.parts)}: ${grid.size}`), el('span', '', `${tx(T.delivered)}: ${state.delivered}/${level.need}`), el('span', 'zf-goal', tx(T.starsPar, { n: level.par })), el('span', 'zf-goal', tx(T.starsFirst)));
  }

  function tick(): void {
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
    clearInterval(timer);
    timer = 0;
    runBtn.textContent = tx(T.start);
  }

  function startTimer(): void {
    if (state.error || state.won) resetRun();
    running = true;
    runBtn.textContent = tx(T.pause);
    say('');
    clearInterval(timer);
    timer = window.setInterval(tick, fast ? 120 : reduced ? 500 : 420);
    tick();
  }

  function resetRun(): void {
    stopTimer();
    state = start();
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
    grid = new Map();
    resetRun();
  });

  // ---------- Level ----------
  function renderLevels(): void {
    levelBar.replaceChildren(
      ...WORLD_1.map((l, i) => {
        const n = stars[l.id] ?? 0;
        const b = btn(`${i + 1} ${'★'.repeat(n)}${'☆'.repeat(3 - n)}`, 'zf-level');
        b.setAttribute('aria-pressed', String(i === index));
        b.setAttribute('aria-label', `${tx(T.levels)} ${i + 1}: ${tx(l.title)}, ${n}/3 ★`);
        b.addEventListener('click', () => openLevel(i));
        return b;
      }),
    );
  }

  function openLevel(i: number): void {
    stopTimer();
    index = i;
    level = WORLD_1[i]!;
    grid = new Map();
    tool = { kind: 'belt' };
    state = start();
    failedRuns = 0;
    hasRun = false;
    title.textContent = `${i + 1}. ${tx(level.title)}`;
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
