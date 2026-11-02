import { L } from '../../../curriculum/helpers';
import { clear, h, s, seeded } from '../../engine/dom';
import { solved } from '../../engine/ui';
import type { GameMount } from '../../types';
import { bestAction, episode, greedyPath, move, newQ, parseWorld, type QTable } from '../../gemeinsam/models/gitterwelt';

/**
 * Spiel „Das Labyrinth“: Bit sucht den Keks. Am Anfang irrt er zufällig
 * umher; nach jeder Runde merkt er sich, welche Richtung sich lohnt
 * (Q-Lernen, kindgerecht als „Spur“). Ziel: Bit findet den kürzesten Weg.
 */
const MAP = ['S..#.', '.#...', '.#.#.', '...#.', '#.F.K'];
const C = 70;

function shortest(rows: readonly string[]): number {
  const world = parseWorld(rows);
  const goal = [...world.terminals.entries()].find(([, r]) => r > 0)![0];
  const dist = new Map<number, number>([[world.start, 0]]);
  const queue = [world.start];
  while (queue.length) {
    const cur = queue.shift()!;
    for (let a = 0; a < 4; a++) {
      const n = move(world, cur, a);
      if (dist.has(n) || (world.terminals.has(n) && n !== goal)) continue;
      dist.set(n, dist.get(cur)! + 1);
      queue.push(n);
    }
  }
  return dist.get(goal)!;
}

const game: GameMount<void> = (host, ctx) => {
  const { tx } = ctx;
  const world = parseWorld(MAP, { K: 10, F: -10 });
  const goal = [...world.terminals.entries()].find(([, r]) => r > 0)![0];
  const best = shortest(MAP);
  let q: QTable = newQ(world);
  let rnd = seeded(11);
  const history: number[] = [];
  let finished = false;

  const svg = s('svg', { class: 'kq kq--kids', viewBox: `0 0 ${world.w * C} ${world.h * C}`, role: 'img', 'aria-label': tx(L('Labyrinth mit Bits Spur', 'Maze with Bit’s trail')) });
  const bars = s('svg', { class: 'kspark', viewBox: '0 0 300 70', role: 'img', 'aria-label': tx(L('Schritte pro Runde', 'Steps per round')) });
  const status = h('p', { class: 'kvote', attrs: { 'aria-live': 'polite' } });
  const one = h('button', { class: 'kbtn kbtn--main', attrs: { type: 'button' }, text: `▶ ${tx(L('1 Runde', '1 round'))}` });
  const ten = h('button', { class: 'kbtn kbtn--main', attrs: { type: 'button' }, text: `⏩ ${tx(L('10 Runden', '10 rounds'))}` });
  const forget = h('button', { class: 'kbtn', attrs: { type: 'button' }, text: `↺ ${tx(L('Alles vergessen', 'Forget everything'))}` });
  const show = h('button', { class: 'kbtn', attrs: { type: 'button', hidden: true }, text: `🚶 ${tx(L('Bit zeigt seinen Weg', 'Bit shows his way'))}` });
  // Bit als eigene Figur, die über die Felder läuft (CSS-Übergang zwischen den Feldern)
  const walker = s('text', { class: 'kq__icon kq__icon--big kq__walker', x: 0, y: 0, 'text-anchor': 'middle' }, '🤖');
  let walking = false;
  host.append(h('div', { class: 'kpanel kgrid-2' }, svg, h('div', {}, h('div', { class: 'krow' }, one, ten, forget, show), status, h('p', { class: 'khint', text: tx(L('Schritte pro Runde (weniger ist besser):', 'Steps per round (fewer is better):')) }), bars)));

  function draw(): void {
    clear(svg);
    const max = Math.max(1, ...q.flat().map(Math.abs));
    const path = history.length ? greedyPath(world, q) : [];
    for (let i = 0; i < world.w * world.h; i++) {
      const x = (i % world.w) * C;
      const y = Math.floor(i / world.w) * C;
      if (world.walls.has(i)) {
        svg.append(s('rect', { class: 'kq__wall', x: x + 2, y: y + 2, width: C - 4, height: C - 4, rx: 10 }));
        continue;
      }
      const v = Math.max(...q[i]!);
      const cell = s('rect', { class: 'kq__floor', x: x + 2, y: y + 2, width: C - 4, height: C - 4, rx: 10 });
      cell.style.setProperty('--v', String(Math.max(0, v) / max));
      svg.append(cell);
      const term = world.terminals.get(i);
      if (term !== undefined) {
        svg.append(s('text', { class: 'kq__icon kq__icon--big', x: x + C / 2, y: y + C / 2 + 10, 'text-anchor': 'middle' }, term > 0 ? '🍪' : '💧'));
        continue;
      }
      if (history.length && Math.max(...q[i]!) > 0) {
        const a = bestAction(q, i);
        const arrow = ['⬆️', '➡️', '⬇️', '⬅️'][a]!;
        svg.append(s('text', { class: `kq__trail${path.includes(i) ? ' is-path' : ''}`, x: x + C / 2, y: y + C / 2 + 8, 'text-anchor': 'middle' }, arrow));
      }
    }
    svg.append(walker);
    if (!walking) place(world.start, false);
    show.hidden = path.at(-1) !== goal;
    clear(bars);
    const shown = history.slice(-30);
    const hmax = Math.max(10, ...shown);
    shown.forEach((n, k) => bars.append(s('rect', { class: 'kbars__bar', x: 4 + k * 9.8, y: 66 - (n / hmax) * 60, width: 7, height: (n / hmax) * 60, rx: 2 })));
    const last = history.at(-1);
    const reaches = path.at(-1) === goal;
    status.textContent = !history.length ? tx(L('Bit kennt das Labyrinth noch nicht. Starte eine Runde!', 'Bit doesn’t know the maze yet. Start a round!')) : tx(L(`Runde ${history.length}: ${last} Schritte. ${reaches ? `Bits Spur führt in ${path.length - 1} Schritten zum Keks.` : 'Bits Spur führt noch nicht zum Keks.'}`, `Round ${history.length}: ${last} steps. ${reaches ? `Bit’s trail leads to the cookie in ${path.length - 1} steps.` : 'Bit’s trail doesn’t lead to the cookie yet.'}`));
    if (reaches && path.length - 1 === best && !finished) {
      finished = true;
      ctx.say(L(`Ich kenne jetzt den kürzesten Weg – ${best} Schritte! Niemand hat ihn mir gezeigt. Ich habe nur ausprobiert und mir gemerkt, was belohnt wurde.`, `I now know the shortest way – ${best} steps! Nobody showed me. I just tried things and remembered what was rewarded.`), 'wow');
      host.append(solved(tx(L('Bit hat den Weg gelernt!', 'Bit learned the way!'))));
      ctx.finish();
    }
  }

  /** Bit auf ein Feld setzen (mit oder ohne Übergang). */
  function place(cell: number, smooth = true): void {
    const x = (cell % world.w) * C + C / 2;
    const y = Math.floor(cell / world.w) * C + C - 8;
    walker.classList.toggle('is-moving', smooth);
    walker.style.transform = `translate(${x}px, ${y}px)`;
  }

  /** Bit läuft die Felder nacheinander ab; lange Irrwege werden schneller gezeigt. */
  async function walk(cells: readonly number[]): Promise<void> {
    if (ctx.reducedMotion || cells.length < 2) return;
    walking = true;
    for (const b of [one, ten, forget, show]) b.disabled = true;
    const ms = Math.max(45, Math.min(220, 2600 / cells.length));
    walker.style.setProperty('--step', `${ms}ms`);
    place(cells[0]!, false);
    for (const cell of cells.slice(1)) {
      await new Promise((r) => setTimeout(r, 30));
      place(cell);
      await new Promise((r) => setTimeout(r, ms));
    }
    await new Promise((r) => setTimeout(r, 350));
    walking = false;
    for (const b of [one, ten, forget, show]) b.disabled = false;
  }

  async function rounds(n: number): Promise<void> {
    let lastPath: number[] = [];
    for (let k = 0; k < n; k++) {
      const visited: number[] = [];
      const r = episode(world, q, 0.5, 0.9, 0.2, rnd, 200, visited);
      history.push(r.steps);
      lastPath = visited;
      if (r.end !== goal && history.length < 3) ctx.say(L('Platsch, in die Pfütze! Das merke ich mir.', 'Splash, into the puddle! I’ll remember that.'), 'sad');
    }
    if (history.length <= 2) ctx.say(L('Am Anfang irre ich herum. Aber jede Runde hinterlässt eine Spur.', 'At first I wander around. But every round leaves a trail.'), 'think');
    // Bei einer einzelnen Runde sieht man Bit laufen – erst wild, später gezielt
    if (n === 1) await walk(lastPath);
    draw();
  }

  one.addEventListener('click', () => void rounds(1));
  ten.addEventListener('click', () => void rounds(10));
  show.addEventListener('click', () => {
    void walk(greedyPath(world, q)).then(() => ctx.say(L('Hier ist der Keks! Ich folge einfach meiner Spur.', 'Here is the cookie! I just follow my trail.'), 'happy'));
  });
  forget.addEventListener('click', () => {
    q = newQ(world);
    rnd = seeded(11 + history.length);
    history.length = 0;
    draw();
  });
  draw();
};

export default game;
