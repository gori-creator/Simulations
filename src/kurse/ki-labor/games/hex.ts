import { clear, h, s } from '../../engine/dom';
import { solved } from '../../engine/ui';
import type { GameMount } from '../../types';
import { monteCarlo, SIZE, winnerOf, type Stone } from '../models/hex';

/**
 * Spiel „Zufall als Ratgeber“: Hex 5×5 gegen Ada, die mit Monte-Carlo-
 * Probespielen zieht. Nach jedem Zug zeigt eine Wärmekarte Adas geschätzte
 * Siegquote je Feld. Missionen: Ada mit 10 Probespielen je Feld schlagen;
 * eine Partie gegen 300 Probespiele je Feld spielen.
 */
const R = 22;
const W = Math.sqrt(3) * R;

const game: GameMount<void> = (host, ctx) => {
  const { tx } = ctx;
  let board: Stone[] = Array(SIZE * SIZE).fill(null);
  let n = 10;
  let over = false;
  let busy = false;
  let rates = new Map<number, number>();
  let timer = 0;
  const done = { easy: false, hard: false };
  let finished = false;

  const cx = (i: number) => 40 + W * ((i % SIZE) + Math.floor(i / SIZE) / 2);
  const cy = (i: number) => 40 + 1.5 * R * Math.floor(i / SIZE);
  const width = cx(SIZE * SIZE - 1) + 40;
  const height = cy(SIZE * SIZE - 1) + 40;
  const svg = s('svg', { class: 'khex', viewBox: `0 0 ${width} ${height}`, role: 'group', 'aria-label': tx({ de: 'Hex-Spielbrett 5 × 5', en: 'Hex board 5 × 5' }) });
  const nRow = h('div', { class: 'krow', attrs: { role: 'group', 'aria-label': tx({ de: 'Probespiele je Feld', en: 'Playouts per cell' }) } });
  const status = h('p', { class: 'kvote', attrs: { 'aria-live': 'polite' } });
  const stats = h('p', { class: 'khint' });
  const again = h('button', { class: 'kbtn', attrs: { type: 'button' }, text: `↺ ${tx({ de: 'Neue Partie', en: 'New game' })}` });
  const goals = h('ul', { class: 'kgoals' });
  host.append(
    h('div', { class: 'kpanel' }, h('p', { class: 'kpanel__title', text: tx({ de: 'Du (blau) verbindest links und rechts, Ada (orange) oben und unten.', en: 'You (blue) connect left and right, Ada (orange) top and bottom.' }) }), svg, status, stats),
    h('div', { class: 'kpanel' }, h('p', { class: 'kpanel__title', text: tx({ de: 'Probespiele, die Ada je Feld zu Ende spielt', en: 'Random games Ada plays to the end per cell' }) }), nRow, h('div', { class: 'krow' }, again), goals),
  );

  for (const k of [10, 300]) {
    const b = h('button', { class: 'kbtn', attrs: { type: 'button', 'aria-pressed': String(k === n), 'data-n': k }, text: ctx.num(k) });
    b.addEventListener('click', () => {
      n = k;
      for (const x of nRow.querySelectorAll('button')) x.setAttribute('aria-pressed', String(Number(x.dataset.n) === n));
      newGame();
    });
    nRow.append(b);
  }

  const hexPath = (x: number, y: number) => {
    const pts: string[] = [];
    for (let k = 0; k < 6; k++) {
      const a = (Math.PI / 180) * (60 * k - 30);
      pts.push(`${(x + R * Math.cos(a)).toFixed(1)},${(y + R * Math.sin(a)).toFixed(1)}`);
    }
    return pts.join(' ');
  };

  function render(): void {
    clear(svg);
    // Ränder: links/rechts blau, oben/unten orange
    const edge = (a: number, b: number, cls: string, dx: number, dy: number) => svg.append(s('line', { class: cls, x1: cx(a) + dx, y1: cy(a) + dy, x2: cx(b) + dx, y2: cy(b) + dy }));
    edge(0, SIZE - 1, 'khex__edge--o', 0, -R - 4);
    edge(SIZE * (SIZE - 1), SIZE * SIZE - 1, 'khex__edge--o', 0, R + 4);
    edge(0, SIZE * (SIZE - 1), 'khex__edge--b', -W / 2 - 6, 0);
    edge(SIZE - 1, SIZE * SIZE - 1, 'khex__edge--b', W / 2 + 6, 0);
    board.forEach((stone, i) => {
      const rate = rates.get(i);
      const g = s('g', { class: `khex__cell${stone ? ` is-${stone}` : ''}`, tabindex: stone || over || busy ? -1 : 0, role: 'button', 'aria-label': `${tx({ de: 'Feld', en: 'Cell' })} ${Math.floor(i / SIZE) + 1}/${(i % SIZE) + 1}${stone ? `: ${stone === 'blue' ? tx({ de: 'blau', en: 'blue' }) : tx({ de: 'orange', en: 'orange' })}` : ''}${rate !== undefined ? ` – Ada: ${ctx.percent(rate)}` : ''}` });
      const poly = s('polygon', { points: hexPath(cx(i), cy(i)) });
      if (!stone && rate !== undefined) poly.style.setProperty('--heat', String(rate));
      g.append(poly);
      if (!stone && rate !== undefined) g.append(s('text', { class: 'khex__rate', x: cx(i), y: cy(i) + 4, 'text-anchor': 'middle' }, String(Math.round(rate * 100))));
      const act = () => play(i);
      g.addEventListener('click', act);
      g.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          act();
        }
      });
      svg.append(g);
    });
  }

  function renderGoals(): void {
    clear(goals);
    goals.append(h('li', { class: done.easy ? 'is-done' : '' }, `${done.easy ? '✅' : '⬜'} ${tx({ de: 'Schlag Ada bei 10 Probespielen je Feld.', en: 'Beat Ada at 10 playouts per cell.' })}`));
    goals.append(h('li', { class: done.hard ? 'is-done' : '' }, `${done.hard ? '✅' : '⬜'} ${tx({ de: 'Spiel eine Partie gegen 300 Probespiele je Feld (Ergebnis egal).', en: 'Play a game against 300 playouts per cell (any result).' })}`));
    if (!finished && done.easy && done.hard) {
      finished = true;
      host.append(solved(tx({ de: 'Monte-Carlo verstanden!', en: 'Monte Carlo understood!' })));
      ctx.say({ de: 'Mehr Probespiele, bessere Schätzung, stärkeres Spiel – ganz ohne Spielbaum bis zum Ende und ohne eigene Bewertungsregeln.', en: 'More playouts, better estimates, stronger play – without searching the tree to the end and without hand-made evaluation rules.' }, 'wow');
      ctx.finish();
    }
  }

  function end(): boolean {
    const w = winnerOf(board);
    if (!w) return false;
    over = true;
    if (w === 'blue') {
      status.textContent = `🎉 ${tx({ de: 'Du hast gewonnen!', en: 'You won!' })}`;
      if (n === 10) done.easy = true;
      ctx.say(n === 10 ? { de: 'Mit nur 10 Zufallspartien je Feld sind meine Schätzungen sehr ungenau. Stell auf 300!', en: 'With only 10 random games per cell my estimates are very rough. Switch to 300!' } : { de: 'Stark! Auch 300 Probespiele je Feld haben nicht gereicht.', en: 'Impressive! Even 300 playouts per cell weren’t enough.' }, n === 10 ? 'wink' : 'wow');
    } else {
      status.textContent = `🤖 ${tx({ de: 'Ada hat oben und unten verbunden.', en: 'Ada connected top and bottom.' })}`;
      ctx.say({ de: 'Diesmal habe ich gewonnen. Tipp: Die Mitte ist in Hex besonders wertvoll.', en: 'I won this time. Tip: the centre is especially valuable in Hex.' }, 'happy');
    }
    if (n === 300) done.hard = true;
    render();
    renderGoals();
    return true;
  }

  function play(i: number): void {
    if (over || busy || board[i]) return;
    board[i] = 'blue';
    rates = new Map();
    render();
    if (end()) return;
    busy = true;
    status.textContent = `🎲 ${tx({ de: 'Ada spielt Zufallspartien …', en: 'Ada is playing random games …' })}`;
    timer = window.setTimeout(() => {
      const t0 = performance.now();
      const r = monteCarlo(board, n);
      board[r.best] = 'orange';
      rates = r.rates;
      rates.delete(r.best);
      busy = false;
      stats.textContent = tx({ de: `Ada hat ${ctx.num(r.games)} Zufallspartien gespielt (${ctx.num(performance.now() - t0)} ms). Die Zahlen sind ihre geschätzten Siegchancen in Prozent, falls sie dorthin gezogen wäre.`, en: `Ada played ${ctx.num(r.games)} random games (${ctx.num(performance.now() - t0)} ms). The numbers are her estimated chances of winning in percent, had she played there.` });
      if (!end()) status.textContent = tx({ de: 'Du bist dran.', en: 'Your turn.' });
      render();
    }, ctx.reducedMotion ? 0 : 200);
  }

  function newGame(): void {
    clearTimeout(timer);
    board = Array(SIZE * SIZE).fill(null);
    rates = new Map();
    over = false;
    busy = false;
    status.textContent = tx({ de: 'Du beginnst. Tippe auf ein Feld.', en: 'You start. Tap a cell.' });
    stats.textContent = '';
    render();
  }

  again.addEventListener('click', newGame);
  newGame();
  renderGoals();
  return { destroy: () => clearTimeout(timer) };
};

export default game;
