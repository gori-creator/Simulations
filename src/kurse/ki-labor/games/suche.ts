import type { Localized } from '../../../i18n/config';
import { clear, h, s } from '../../engine/dom';
import { solved } from '../../engine/ui';
import type { GameMount } from '../../types';
import { MAP, parseMap, runSearch, type Algo, type SearchRun } from '../models/suche';

/**
 * Spiel „Den Weg finden“: Vier Suchverfahren im selben Labyrinth. Die
 * untersuchten Felder erscheinen der Reihe nach (Zahl = Reihenfolge), danach
 * der gefundene Weg. Ziel: alle vier laufen lassen und vergleichen.
 */
const ALGOS: { id: Algo; name: Localized; hint: Localized }[] = [
  { id: 'bfs', name: { de: 'Breitensuche', en: 'Breadth-first' }, hint: { de: 'Warteschlange: erst alle Felder im Abstand 1, dann 2, dann 3 …', en: 'Queue: first all cells at distance 1, then 2, then 3 …' } },
  { id: 'dfs', name: { de: 'Tiefensuche', en: 'Depth-first' }, hint: { de: 'Stapel: immer zuerst so weit wie möglich in eine Richtung.', en: 'Stack: always go as far as possible in one direction first.' } },
  { id: 'greedy', name: { de: 'Gierige Suche', en: 'Greedy search' }, hint: { de: 'Nimmt immer das Feld, das nach Luftlinie (Manhattan) am nächsten am Ziel liegt.', en: 'Always takes the cell that looks closest to the goal (Manhattan distance).' } },
  { id: 'astar', name: { de: 'A*', en: 'A*' }, hint: { de: 'Bisherige Schritte g plus geschätzte Reststrecke h – das Kleinste zuerst.', en: 'Steps so far g plus estimated remaining distance h – smallest first.' } },
];

const CELL = 34;

const game: GameMount<void> = (host, ctx) => {
  const { tx } = ctx;
  const grid = parseMap(MAP);
  const results = new Map<Algo, SearchRun>();
  let timer = 0;
  let finished = false;

  const svg = s('svg', { class: 'kmaze', viewBox: `0 0 ${grid.w * CELL} ${grid.h * CELL}`, role: 'img', 'aria-label': tx({ de: 'Labyrinth mit Start und Ziel', en: 'Maze with start and goal' }) });
  const cells: SVGRectElement[] = [];
  const labels: SVGTextElement[] = [];
  for (let i = 0; i < grid.w * grid.h; i++) {
    const x = (i % grid.w) * CELL;
    const y = Math.floor(i / grid.w) * CELL;
    const rect = s('rect', { class: `kmaze__cell${grid.walls.has(i) ? ' is-wall' : ''}`, x: x + 1, y: y + 1, width: CELL - 2, height: CELL - 2, rx: 5 });
    const text = s('text', { class: 'kmaze__n', x: x + CELL / 2, y: y + CELL / 2 + 4, 'text-anchor': 'middle' });
    cells.push(rect);
    labels.push(text);
    svg.append(rect, text);
  }
  const pathLine = s('polyline', { class: 'kmaze__path', points: '' });
  svg.append(pathLine);
  const mark = (i: number, icon: string) => svg.append(s('text', { class: 'kmaze__icon', x: (i % grid.w) * CELL + CELL / 2, y: Math.floor(i / grid.w) * CELL + CELL / 2 + 7, 'text-anchor': 'middle' }, icon));
  mark(grid.start, '🤖');
  mark(grid.goal, '🏁');

  const buttons = h('div', { class: 'krow' });
  const info = h('p', { class: 'kvote', attrs: { 'aria-live': 'polite' } });
  const tbody = h('tbody');
  const table = h('table', { class: 'ktable' }, h('thead', {}, h('tr', {}, h('th', { text: tx({ de: 'Verfahren', en: 'Method' }) }), h('th', { text: tx({ de: 'untersuchte Felder', en: 'cells expanded' }) }), h('th', { text: tx({ de: 'Weglänge', en: 'path length' }) }))), tbody);
  host.append(h('div', { class: 'kpanel' }, svg, buttons, info), h('div', { class: 'kpanel' }, h('p', { class: 'kpanel__title', text: tx({ de: 'Vergleich', en: 'Comparison' }) }), h('div', { class: 'ktable-wrap' }, table)));

  function reset(): void {
    clearInterval(timer);
    cells.forEach((c, i) => c.setAttribute('class', `kmaze__cell${grid.walls.has(i) ? ' is-wall' : ''}`));
    labels.forEach((l) => (l.textContent = ''));
    pathLine.setAttribute('points', '');
  }

  function showPath(run: SearchRun): void {
    pathLine.setAttribute('points', run.path.map((i) => `${(i % grid.w) * CELL + CELL / 2},${Math.floor(i / grid.w) * CELL + CELL / 2}`).join(' '));
    for (const i of run.path) cells[i]!.classList.add('is-path');
  }

  function renderTable(): void {
    clear(tbody);
    const best = Math.min(...[...results.values()].map((r) => r.path.length - 1));
    for (const a of ALGOS) {
      const r = results.get(a.id);
      if (!r) continue;
      const len = r.path.length - 1;
      tbody.append(h('tr', { class: len === best ? 'is-right' : '' }, h('td', { text: tx(a.name) }), h('td', { text: ctx.num(r.expanded.length) }), h('td', { text: `${ctx.num(len)}${len === best ? ' ✓' : ''}` })));
    }
  }

  function run(a: (typeof ALGOS)[number]): void {
    reset();
    const r = runSearch(grid, a.id);
    results.set(a.id, r);
    for (const b of buttons.querySelectorAll('button')) b.setAttribute('aria-pressed', String(b.dataset.algo === a.id));
    info.textContent = tx(a.hint);
    let k = 0;
    const tickOnce = () => {
      const i = r.expanded[k]!;
      cells[i]!.classList.add('is-seen');
      labels[i]!.textContent = String(k + 1);
      k += 1;
    };
    const end = () => {
      clearInterval(timer);
      showPath(r);
      info.textContent = `${tx(a.name)}: ${ctx.num(r.expanded.length)} ${tx({ de: 'Felder untersucht, Weg mit', en: 'cells expanded, path of' })} ${ctx.num(r.path.length - 1)} ${tx({ de: 'Schritten.', en: 'steps.' })}`;
      renderTable();
      comment(a.id, r);
    };
    if (ctx.reducedMotion) {
      while (k < r.expanded.length) tickOnce();
      end();
      return;
    }
    timer = window.setInterval(() => {
      if (k >= r.expanded.length) return end();
      tickOnce();
    }, 28);
  }

  function comment(id: Algo, r: SearchRun): void {
    const bfs = results.get('bfs');
    if (id === 'dfs') ctx.say({ de: 'Die Tiefensuche findet zwar einen Weg – aber einen ziemlichen Umweg. Sie garantiert nicht den kürzesten.', en: 'Depth-first finds a path – but a big detour. It doesn’t guarantee the shortest.' }, 'think');
    else if (id === 'greedy') ctx.say({ de: 'Gierig ist schnell, läuft aber in die Falle hinter der Mauer: Die Luftlinie lügt hier.', en: 'Greedy is fast but walks into the trap behind the wall: the straight-line distance misleads it here.' }, 'think');
    else if (id === 'astar' && bfs) ctx.say({ de: `A* findet denselben kürzesten Weg wie die Breitensuche, untersucht aber nur ${r.expanded.length} statt ${bfs.expanded.length} Felder.`, en: `A* finds the same shortest path as breadth-first but expands only ${r.expanded.length} instead of ${bfs.expanded.length} cells.` }, 'wow');
    else if (id === 'bfs') ctx.say({ de: 'Die Breitensuche findet sicher den kürzesten Weg – aber sie schaut fast überall nach.', en: 'Breadth-first surely finds the shortest path – but it looks almost everywhere.' }, 'happy');
    if (results.size === ALGOS.length && !finished) {
      finished = true;
      host.append(solved(tx({ de: 'Alle vier Verfahren verglichen!', en: 'All four methods compared!' })));
      ctx.finish();
    }
  }

  for (const a of ALGOS) {
    const b = h('button', { class: 'kbtn', attrs: { type: 'button', 'aria-pressed': 'false', 'data-algo': a.id }, text: `▶ ${tx(a.name)}` });
    b.addEventListener('click', () => run(a));
    buttons.append(b);
  }
  info.textContent = tx({ de: 'Wähle ein Suchverfahren. Die Zahlen zeigen, in welcher Reihenfolge Felder untersucht werden.', en: 'Choose a search method. The numbers show the order in which cells are expanded.' });
  return { destroy: () => clearInterval(timer) };
};

export default game;
