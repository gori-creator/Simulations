import { clear, h, s, seeded } from '../../engine/dom';
import { solved } from '../../engine/ui';
import type { GameMount } from '../../types';
import { bestAction, episode, greedyPath, newQ, parseWorld, type QTable } from '../../gemeinsam/models/gitterwelt';

/**
 * Spiel „Q-Lernen“: Ein Agent lernt in einer Gitterwelt mit nahem Keks (+3),
 * fernem Schatz (+10) und einer Falle (−10). Jeder Schritt kostet 1.
 * Dreiecke zeigen die Q-Werte je Richtung, Pfeile die beste Aktion.
 * Missionen: Agent holt den Schatz; Agent nimmt bewusst den Keks (kleines γ).
 */
const MAP = ['.K....', '.##.#.', 'S....Z', '.#F#..', '......'];
const C = 64;

const game: GameMount<void> = (host, ctx) => {
  const { tx } = ctx;
  const world = parseWorld(MAP);
  const KEKS = 1;
  const SCHATZ = 17;
  let gamma = 0.99;
  let eps = 0.2;
  const alpha = 0.5;
  let q: QTable = newQ(world);
  let episodes = 0;
  let rnd = seeded(3);
  const done = { schatz: false, keks: false };
  let finished = false;

  const svg = s('svg', { class: 'kq', viewBox: `0 0 ${world.w * C} ${world.h * C}`, role: 'img', 'aria-label': tx({ de: 'Gitterwelt mit gelernten Q-Werten', en: 'Grid world with learned Q-values' }) });
  const gRow = h('div', { class: 'krow', attrs: { role: 'group', 'aria-label': 'γ' } });
  const eRow = h('div', { class: 'krow', attrs: { role: 'group', 'aria-label': 'ε' } });
  const runRow = h('div', { class: 'krow' });
  const info = h('p', { class: 'kformula kformula--wrap', attrs: { 'aria-live': 'polite' } });
  const goals = h('ul', { class: 'kgoals' });
  host.append(h('div', { class: 'kpanel kgrid-2' }, svg, h('div', {}, h('p', { class: 'kpanel__title', text: tx({ de: 'Diskontfaktor γ (wie viel ist Belohnung später wert?)', en: 'Discount factor γ (how much is later reward worth?)' }) }), gRow, h('p', { class: 'kpanel__title', text: tx({ de: 'Erkundung ε', en: 'Exploration ε' }) }), eRow, h('p', { class: 'kpanel__title', text: tx({ de: 'Trainieren', en: 'Train' }) }), runRow, info)), h('div', { class: 'kpanel' }, goals));

  const toggle = (row: HTMLElement, items: number[], get: () => number, set: (v: number) => void) => {
    clear(row);
    for (const v of items) {
      const b = h('button', { class: 'kbtn kbtn--small', attrs: { type: 'button', 'aria-pressed': String(v === get()) }, text: ctx.num(v, 2) });
      b.addEventListener('click', () => {
        set(v);
        reset();
        toggle(row, items, get, set);
      });
      row.append(b);
    }
  };
  toggle(gRow, [0.5, 0.9, 0.99], () => gamma, (v) => (gamma = v));
  toggle(eRow, [0.05, 0.2, 0.5], () => eps, (v) => (eps = v));
  for (const n of [1, 10, 100, 1000]) {
    const b = h('button', { class: 'kbtn kbtn--main kbtn--small', attrs: { type: 'button' }, text: `+${ctx.num(n)} ${tx(n === 1 ? { de: 'Episode', en: 'episode' } : { de: 'Episoden', en: 'episodes' })}` });
    b.addEventListener('click', () => void train(n));
    runRow.append(b);
  }
  const resetBtn = h('button', { class: 'kbtn kbtn--small', attrs: { type: 'button' }, text: `↺ ${tx({ de: 'Vergessen', en: 'Forget' })}` });
  resetBtn.addEventListener('click', reset);
  runRow.append(resetBtn);

  function reset(): void {
    q = newQ(world);
    episodes = 0;
    rnd = seeded(3 + Math.floor(gamma * 100) + Math.floor(eps * 1000));
    draw();
  }

  // Agent als eigene Figur: Bei einer einzelnen Episode läuft er seinen Weg sichtbar ab
  const walker = s('text', { class: 'kq__icon kq__walker', x: 0, y: 0, 'text-anchor': 'middle' }, '🤖');
  let walking = false;
  const place = (cell: number, smooth: boolean) => {
    walker.classList.toggle('is-moving', smooth);
    walker.style.transform = `translate(${(cell % world.w) * C + C / 2}px, ${Math.floor(cell / world.w) * C + C / 2 + 7}px)`;
  };
  async function walk(cells: readonly number[]): Promise<void> {
    if (ctx.reducedMotion || cells.length < 2) return;
    walking = true;
    const buttons = [...host.querySelectorAll<HTMLButtonElement>('button')];
    for (const b of buttons) b.disabled = true;
    const ms = Math.max(40, Math.min(200, 2400 / cells.length));
    walker.style.setProperty('--step', `${ms}ms`);
    place(cells[0]!, false);
    for (const cell of cells.slice(1)) {
      await new Promise((r) => setTimeout(r, 30));
      place(cell, true);
      await new Promise((r) => setTimeout(r, ms));
    }
    await new Promise((r) => setTimeout(r, 300));
    for (const b of buttons) b.disabled = false;
    walking = false;
  }

  async function train(n: number): Promise<void> {
    if (walking) return;
    let lastEnd = -1;
    let visited: number[] = [];
    for (let k = 0; k < n; k++) {
      visited = n === 1 ? [] : visited;
      lastEnd = episode(world, q, alpha, gamma, eps, rnd, 100, n === 1 ? visited : undefined).end;
      episodes += 1;
    }
    if (n === 1) await walk(visited);
    draw(lastEnd);
  }

  function draw(lastEnd = -1): void {
    clear(svg);
    const allQ = q.flat();
    const maxAbs = Math.max(1, ...allQ.map(Math.abs));
    const path = episodes ? greedyPath(world, q) : [];
    for (let i = 0; i < world.w * world.h; i++) {
      const x = (i % world.w) * C;
      const y = Math.floor(i / world.w) * C;
      if (world.walls.has(i)) {
        svg.append(s('rect', { class: 'kq__wall', x: x + 1, y: y + 1, width: C - 2, height: C - 2, rx: 6 }));
        continue;
      }
      const term = world.terminals.get(i);
      if (term !== undefined) {
        svg.append(s('rect', { class: `kq__term ${term > 0 ? 'is-good' : 'is-bad'}`, x: x + 1, y: y + 1, width: C - 2, height: C - 2, rx: 6 }), s('text', { class: 'kq__icon', x: x + C / 2, y: y + C / 2 + 2, 'text-anchor': 'middle' }, i === KEKS ? '🍪' : i === SCHATZ ? '💎' : '🕳️'), s('text', { class: 'kq__val', x: x + C / 2, y: y + C - 8, 'text-anchor': 'middle' }, term > 0 ? `+${term}` : String(term)));
        continue;
      }
      const cx = x + C / 2;
      const cy = y + C / 2;
      const tri = [
        `${x + 2},${y + 2} ${x + C - 2},${y + 2} ${cx},${cy}`,
        `${x + C - 2},${y + 2} ${x + C - 2},${y + C - 2} ${cx},${cy}`,
        `${x + C - 2},${y + C - 2} ${x + 2},${y + C - 2} ${cx},${cy}`,
        `${x + 2},${y + C - 2} ${x + 2},${y + 2} ${cx},${cy}`,
      ];
      q[i]!.forEach((v, a) => {
        const poly = s('polygon', { class: `kq__tri ${v >= 0 ? 'is-pos' : 'is-neg'}`, points: tri[a]! });
        poly.style.setProperty('--v', String(Math.min(1, Math.abs(v) / maxAbs)));
        svg.append(poly);
      });
      if (episodes) {
        const a = bestAction(q, i);
        const dx = [0, 1, 0, -1][a]! * 14;
        const dy = [-1, 0, 1, 0][a]! * 14;
        svg.append(s('line', { class: `kq__arrow${path.includes(i) ? ' is-path' : ''}`, x1: cx - dx, y1: cy - dy, x2: cx + dx, y2: cy + dy }), s('circle', { class: `kq__head${path.includes(i) ? ' is-path' : ''}`, cx: cx + dx, cy: cy + dy, r: path.includes(i) ? 5 : 4 }));
      }
    }
    svg.append(walker);
    place(world.start, false);
    const end = path.at(-1);
    info.textContent = episodes === 0 ? tx({ de: 'Noch nichts gelernt: Alle Q-Werte sind 0.', en: 'Nothing learned yet: all Q-values are 0.' }) : `${tx({ de: 'Episoden', en: 'episodes' })}: ${episodes} · Q(Start) = [${q[world.start]!.map((v) => ctx.num(v, 1)).join('; ')}] · ${tx({ de: 'gelernter Weg endet bei', en: 'learned path ends at' })} ${end === SCHATZ ? '💎' : end === KEKS ? '🍪' : end === 14 ? '🕳️' : '…'}`;
    if (end === SCHATZ && !done.schatz) {
      done.schatz = true;
      ctx.say({ de: `Der Agent holt den Schatz! Mit γ = ${ctx.num(gamma, 2)} sind die +10 in fünf Schritten mehr wert als der Keks.`, en: `The agent fetches the treasure! With γ = ${ctx.num(gamma, 2)} the +10 five steps away are worth more than the cookie.` }, 'wow');
    } else if (end === KEKS && gamma <= 0.5 && !done.keks) {
      done.keks = true;
      ctx.say({ de: 'Mit γ = 0,5 zählt die Zukunft wenig: Der nahe Keks ist dem Agenten lieber als der ferne Schatz. Kurzsichtig – aber folgerichtig.', en: 'With γ = 0.5 the future counts for little: the agent prefers the nearby cookie to the distant treasure. Short-sighted – but consistent.' }, 'think');
    } else if (end === KEKS && gamma > 0.5 && episodes >= 100 && eps <= 0.05) {
      ctx.say({ de: 'Hängt am Keks fest? Bei so wenig Erkundung findet der Agent den Schatz vielleicht nie. Mehr ε!', en: 'Stuck on the cookie? With so little exploration the agent may never find the treasure. More ε!' }, 'think');
    }
    if (lastEnd === 14 && episodes < 20) ctx.say({ de: 'In die Falle getappt – −10. Daraus lernt der Agent: Diese Richtung ist schlecht.', en: 'Fell into the trap – −10. The agent learns from it: this direction is bad.' }, 'sad');
    clear(goals);
    const item = (ok: boolean, text: string) => goals.append(h('li', { class: ok ? 'is-done' : '' }, `${ok ? '✅' : '⬜'} ${text}`));
    item(done.schatz, tx({ de: 'Bring den Agenten dazu, den Schatz 💎 zu holen.', en: 'Get the agent to fetch the treasure 💎.' }));
    item(done.keks, tx({ de: 'Stell γ so ein, dass der Agent lieber den nahen Keks 🍪 nimmt.', en: 'Set γ so that the agent prefers the nearby cookie 🍪.' }));
    if (!finished && done.schatz && done.keks) {
      finished = true;
      host.append(solved(tx({ de: 'Q-Lernen gemeistert!', en: 'Q-learning mastered!' })));
      ctx.finish();
    }
  }

  draw();
};

export default game;
