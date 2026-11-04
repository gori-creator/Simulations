import { L } from '../../curriculum/helpers';
import type { Lang, Localized } from '../../i18n/config';
import { WORLD_1, type LevelInfo } from './levels';
import { canPlace, DX, DY, EMIT_EVERY, key, opLabel, start, starsFor, step, type Dir, type Grid, type Op, type State } from './model';

/**
 * Zahlenfabrik (Probe, Welt 1): Raster, Werkzeugleiste, Takt-Ablauf.
 * Bauen: Werkzeug wählen, Feld antippen; nochmal antippen dreht das Teil.
 */
const ARROW = ['→', '↓', '←', '↑'];
const STORE = 'spiel:zahlenfabrik';

type Tool = { kind: 'belt' } | { kind: 'op'; op: Op } | { kind: 'erase' };

interface Saved {
  stars: Record<string, number>;
}

function load(): Saved {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE) ?? '{}') as Partial<Saved>;
    const stars: Record<string, number> = {};
    for (const [k, v] of Object.entries(raw.stars ?? {})) if (typeof v === 'number' && v >= 1 && v <= 3) stars[k] = v;
    return { stars };
  } catch {
    return { stars: {} };
  }
}

function save(s: Saved): void {
  try {
    localStorage.setItem(STORE, JSON.stringify(s));
  } catch {
    // ohne Speicher: nur für diesen Besuch
  }
}

const T = {
  start: L('▶ Start', '▶ Start'),
  pause: L('⏸ Pause', '⏸ Pause'),
  stepBtn: L('⏭ Ein Takt', '⏭ One tick'),
  fast: L('⏩ Schnell', '⏩ Fast'),
  stop: L('⏹ Stopp', '⏹ Stop'),
  clear: L('🗑️ Alles abbauen', '🗑️ Clear all'),
  belt: L('Band', 'Belt'),
  erase: L('Entfernen', 'Remove'),
  source: L('Quelle', 'Source'),
  target: L('Lager', 'Storage'),
  next: L('Nächstes Level →', 'Next level →'),
  parts: L('Teile', 'Parts'),
  delivered: L('Geliefert', 'Delivered'),
  levels: L('Level', 'Levels'),
  howto: L('Werkzeug wählen, dann Feld antippen. Nochmal antippen dreht das Teil.', 'Pick a tool, then tap a square. Tap again to turn the part.'),
  won: L('Auftrag erfüllt!', 'Order complete!'),
  fell: L('Die {v} ist vom Band gefallen! Dort fehlt ein Teil oder es zeigt in die falsche Richtung.', 'The {v} fell off the belt! A part is missing there or points the wrong way.'),
  wrong: L('Das Lager will {t}, aber es kam {v} an.', 'The storage wants {t}, but {v} arrived.'),
  divide: L('{v} lässt sich hier nicht glatt teilen.', '{v} can’t be divided evenly here.'),
  timeout: L('Die Zahlen kommen nie im Lager an – fahren sie im Kreis?', 'The numbers never reach the storage – are they going round in circles?'),
  starsPar: L('Stern 2: höchstens {n} Teile', 'Star 2: at most {n} parts'),
  starsFirst: L('Stern 3: gleich beim ersten Start', 'Star 3: on the first run'),
  editLocked: L('Erst stoppen, dann umbauen.', 'Stop first, then rebuild.'),
};

export function initFactory(root: HTMLElement): void {
  const lang = (root.dataset.lang === 'en' ? 'en' : 'de') satisfies Lang;
  const tx = (t: Localized, vars: Record<string, string | number> = {}) => t[lang].replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saved = load();
  const q = <E extends Element>(sel: string) => root.querySelector<E>(sel)!;

  const levelBar = q<HTMLElement>('[data-levels]');
  const title = q<HTMLElement>('[data-title]');
  const hint = q<HTMLElement>('[data-hint]');
  const board = q<HTMLElement>('[data-board]');
  const toolsEl = q<HTMLElement>('[data-tools]');
  const controls = q<HTMLElement>('[data-controls]');
  const status = q<HTMLElement>('[data-status]');
  const info = q<HTMLElement>('[data-info]');

  let index = Math.max(0, WORLD_1.findIndex((l) => !saved.stars[l.id]));
  if (index < 0) index = 0;
  let level: LevelInfo = WORLD_1[index]!;
  let grid: Grid = new Map();
  let tool: Tool = { kind: 'belt' };
  let state: State = start();
  let running = false;
  let fast = false;
  let timer = 0;
  let failedRuns = 0;
  let hasRun = false;

  const btn = (label: string, cls = 'zf-btn') => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = cls;
    b.textContent = label;
    return b;
  };

  // ---------- Level-Auswahl ----------
  function renderLevels(): void {
    levelBar.replaceChildren(
      ...WORLD_1.map((l, i) => {
        const stars = saved.stars[l.id] ?? 0;
        const b = btn(`${i + 1} ${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}`, 'zf-level');
        b.setAttribute('aria-pressed', String(i === index));
        b.setAttribute('aria-label', `${tx(T.levels)} ${i + 1}: ${tx(l.title)}, ${stars}/3 ★`);
        b.addEventListener('click', () => openLevel(i));
        return b;
      }),
    );
  }

  // ---------- Werkzeuge ----------
  function renderTools(): void {
    const tools: [Tool, string][] = [[{ kind: 'belt' }, `→ ${tx(T.belt)}`], ...level.tools.map((op) => [{ kind: 'op', op }, opLabel(op)] as [Tool, string]), [{ kind: 'erase' }, `🧽 ${tx(T.erase)}`]];
    toolsEl.replaceChildren(
      ...tools.map(([t, label]) => {
        const b = btn(label, `zf-tool${t.kind === 'op' ? ' zf-tool--op' : ''}`);
        const same = t.kind === tool.kind && (t.kind !== 'op' || (tool.kind === 'op' && opLabel(t.op) === opLabel(tool.op)));
        b.setAttribute('aria-pressed', String(same));
        b.addEventListener('click', () => {
          tool = t;
          renderTools();
        });
        return b;
      }),
    );
  }

  // ---------- Spielfeld ----------
  function renderBoard(): void {
    board.style.setProperty('--cols', String(level.cols));
    board.style.setProperty('--rows', String(level.rows));
    const cells: HTMLElement[] = [];
    for (let y = 0; y < level.rows; y++) {
      for (let x = 0; x < level.cols; x++) {
        const c = document.createElement('button');
        c.type = 'button';
        c.className = 'zf-cell';
        c.dataset.x = String(x);
        c.dataset.y = String(y);
        const part = grid.get(key(x, y));
        if (x === level.source.x && y === level.source.y) {
          c.classList.add('zf-cell--source');
          c.append(span('zf-cell__big', String(level.source.value)), span('zf-cell__small', `🏭 ${ARROW[level.source.dir]}`));
          c.setAttribute('aria-label', `${tx(T.source)} ${level.source.value} ${ARROW[level.source.dir]}`);
          c.title = tx(T.source);
          c.disabled = true;
        } else if (x === level.target.x && y === level.target.y) {
          c.classList.add('zf-cell--target');
          c.append(span('zf-cell__big', String(level.target.value)), span('zf-cell__small', `📦 ${state.delivered}/${level.need}`));
          c.setAttribute('aria-label', `${tx(T.target)} ${level.target.value}`);
          c.title = tx(T.target);
          c.disabled = true;
        } else if (level.walls.some(([wx, wy]) => wx === x && wy === y)) {
          c.classList.add('zf-cell--wall');
          c.disabled = true;
          c.setAttribute('aria-label', '🧱');
        } else if (part) {
          c.classList.add(part.op ? 'zf-cell--op' : 'zf-cell--belt');
          c.dataset.dir = String(part.dir);
          if (part.op) c.append(span('zf-cell__big', opLabel(part.op)), span('zf-cell__small', ARROW[part.dir]!));
          else c.append(span('zf-cell__arrow', ARROW[part.dir]!));
          c.setAttribute('aria-label', `${part.op ? opLabel(part.op) : tx(T.belt)} ${ARROW[part.dir]}`);
        } else {
          c.setAttribute('aria-label', `${x + 1}/${y + 1}`);
        }
        if (state.error && state.error.x === x && state.error.y === y) c.classList.add('zf-cell--error');
        c.addEventListener('click', () => tap(x, y));
        cells.push(c);
      }
    }
    const layer = document.createElement('div');
    layer.className = 'zf-items';
    for (const item of state.items) {
      const el = span('zf-item', String(item.value));
      el.dataset.id = String(item.id);
      el.style.setProperty('--x', String(item.x));
      el.style.setProperty('--y', String(item.y));
      layer.append(el);
    }
    board.replaceChildren(...cells, layer);
  }

  /** Nur die Zahlen bewegen (weiche Übergänge). */
  function moveItems(): void {
    const layer = board.querySelector('.zf-items');
    if (!layer) return renderBoard();
    const old = new Map([...layer.querySelectorAll<HTMLElement>('.zf-item')].map((el) => [el.dataset.id!, el]));
    for (const item of state.items) {
      let el = old.get(String(item.id));
      if (!el) {
        el = span('zf-item zf-item--new', String(item.value));
        el.dataset.id = String(item.id);
        layer.append(el);
      }
      old.delete(String(item.id));
      if (el.textContent !== String(item.value)) {
        el.textContent = String(item.value);
        el.classList.remove('zf-item--pop');
        void el.offsetWidth;
        el.classList.add('zf-item--pop');
      }
      el.style.setProperty('--x', String(item.x));
      el.style.setProperty('--y', String(item.y));
    }
    for (const el of old.values()) el.remove();
    const tgt = board.querySelector(`.zf-cell--target .zf-cell__small`);
    if (tgt) tgt.textContent = `📦 ${state.delivered}/${level.need}`;
  }

  function span(cls: string, text: string): HTMLElement {
    const s = document.createElement('span');
    s.className = cls;
    s.textContent = text;
    return s;
  }

  function tap(x: number, y: number): void {
    if (running || hasRun) {
      if (running) {
        say(tx(T.editLocked), 'warn');
        return;
      }
      resetRun();
    }
    if (!canPlace(level, x, y)) return;
    const k = key(x, y);
    const part = grid.get(k);
    if (tool.kind === 'erase') grid.delete(k);
    else {
      const op = tool.kind === 'op' ? tool.op : null;
      const sameKind = part && (part.op ? opLabel(part.op) : 'belt') === (op ? opLabel(op) : 'belt');
      if (part && sameKind) part.dir = ((part.dir + 1) % 4) as Dir;
      else grid.set(k, { op, dir: guessDir(x, y) });
    }
    renderBoard();
    renderInfo();
    board.querySelector<HTMLElement>(`[data-x="${x}"][data-y="${y}"]`)?.focus();
  }

  /**
   * Neue Teile zeigen so, dass sie den Weg fortsetzen: in die Richtung des
   * Nachbarn, der hierher zeigt – außer es geht dort nicht weiter (Rand,
   * Mauer); dann zur Seite, möglichst Richtung Lager.
   */
  function guessDir(x: number, y: number): Dir {
    const dirs = [0, 1, 2, 3] as Dir[];
    for (const t of dirs) if (x + DX[t] === level.target.x && y + DY[t] === level.target.y) return t;
    const open = (d: Dir) => {
      const nx = x + DX[d];
      const ny = y + DY[d];
      return canPlace(level, nx, ny) || (nx === level.target.x && ny === level.target.y);
    };
    const toward = (d: Dir) => Math.abs(x + DX[d] - level.target.x) + Math.abs(y + DY[d] - level.target.y);
    for (const d of dirs) {
      const fx = x - DX[d];
      const fy = y - DY[d];
      const from = fx === level.source.x && fy === level.source.y ? level.source.dir : grid.get(key(fx, fy))?.dir;
      if (from !== d) continue;
      if (open(d)) return d;
      const sides = dirs.filter((t) => t !== ((d + 2) % 4) && open(t)).sort((a, c) => toward(a) - toward(c));
      return sides[0] ?? d;
    }
    return 0;
  }

  // ---------- Ablauf ----------
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
    info.replaceChildren(
      span('', `${tx(T.parts)}: ${grid.size}`),
      span('', `${tx(T.delivered)}: ${state.delivered}/${level.need}`),
      span('zf-goal', tx(T.starsPar, { n: level.par })),
      span('zf-goal', tx(T.starsFirst)),
    );
  }

  function tick(): void {
    state = step(level, grid, state);
    hasRun = true;
    if (state.error) {
      stopTimer();
      failedRuns += 1;
      const e = state.error;
      const msg = e.kind === 'fell' ? T.fell : e.kind === 'wrong' ? T.wrong : e.kind === 'divide' ? T.divide : T.timeout;
      say(`✗ ${tx(msg, { v: e.value, t: level.target.value })}`, 'bad');
      renderBoard();
      return;
    }
    if (state.won) {
      stopTimer();
      const stars = starsFor(level, grid.size, failedRuns);
      saved.stars[level.id] = Math.max(saved.stars[level.id] ?? 0, stars);
      save(saved);
      say(`✓ ${tx(T.won)} ${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}`, 'good');
      renderLevels();
      moveItems();
      if (index < WORLD_1.length - 1) {
        const n = btn(tx(T.next), 'zf-btn zf-btn--main');
        n.addEventListener('click', () => openLevel(index + 1));
        status.append(' ', n);
        n.focus();
      }
      renderInfo();
      return;
    }
    moveItems();
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
    renderBoard();
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
    hint.textContent = `💡 ${tx(level.hint)} ${tx(T.howto)}`;
    say('');
    renderLevels();
    renderTools();
    renderBoard();
    renderInfo();
  }

  root.style.setProperty('--zf-emit', String(EMIT_EVERY));
  openLevel(index);
  root.classList.add('is-ready');
}
