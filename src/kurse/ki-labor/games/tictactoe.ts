import { clear, h } from '../../engine/dom';
import { solved } from '../../engine/ui';
import type { GameMount } from '../../types';
import { decide, freeCells, full, winner, WIN, type Board } from '../models/tictactoe';

/**
 * Spiel „Minimax und Alpha-Beta“: Tic-Tac-Toe gegen Ada. Suchtiefe und
 * Alpha-Beta lassen sich umstellen; nach jedem Zug von Ada stehen ihre
 * Bewertungen auf den Feldern und die Zahl der untersuchten Knoten darunter.
 * Missionen: gegen die volle Suche nicht verlieren; Knoten mit und ohne
 * Alpha-Beta vergleichen. Bonus: Ada bei Suchtiefe 1 schlagen.
 */
const DEPTHS = [1, 2, 9];

const game: GameMount<void> = (host, ctx) => {
  const { tx } = ctx;
  let board: Board = Array(9).fill(null);
  let depth = 1;
  let alphaBeta = false;
  let over = false;
  let busy = false;
  let losses = 0;
  let timer = 0;
  const mission = { bonus: false, draw: false, noAb: 0, ab: 0 };
  let finished = false;
  let lastEvals = new Map<number, number>();
  let lastChoice = -1;

  const depthRow = h('div', { class: 'krow', attrs: { role: 'group', 'aria-label': tx({ de: 'Suchtiefe', en: 'Search depth' }) } });
  const abBtn = h('button', { class: 'kbtn', attrs: { type: 'button', 'aria-pressed': 'false' }, text: `✂️ Alpha-Beta` });
  const boardEl = h('div', { class: 'kttt', attrs: { role: 'grid', 'aria-label': tx({ de: 'Spielfeld', en: 'Board' }) } });
  const status = h('p', { class: 'kvote', attrs: { 'aria-live': 'polite' } });
  const stats = h('p', { class: 'khint' });
  const again = h('button', { class: 'kbtn', attrs: { type: 'button' }, text: `↺ ${tx({ de: 'Neues Spiel', en: 'New game' })}` });
  const goals = h('ul', { class: 'kgoals' });
  const evalBoard = h('div', { class: 'kttt kttt--mini', attrs: { 'aria-label': tx({ de: 'Adas Bewertung ihrer möglichen Züge', en: 'Ada’s evaluation of her possible moves' }) } });
  const evalBox = h('div', { class: 'kttt-eval', attrs: { hidden: true } }, h('p', { class: 'khint', text: tx({ de: 'So hat Ada ihre möglichen Züge bewertet (aus ihrer Sicht):', en: 'How Ada rated her possible moves (from her point of view):' }) }), evalBoard);
  host.append(
    h('div', { class: 'kpanel kttt-wrap' }, h('div', {}, h('p', { class: 'kpanel__title', text: tx({ de: 'Adas Suchtiefe (Halbzüge)', en: 'Ada’s search depth (plies)' }) }), depthRow, h('div', { class: 'krow' }, abBtn), status, stats, h('div', { class: 'krow' }, again)), h('div', {}, boardEl, evalBox)),
    h('div', { class: 'kpanel' }, h('p', { class: 'kpanel__title', text: tx({ de: 'Missionen', en: 'Missions' }) }), goals),
  );

  for (const d of DEPTHS) {
    const b = h('button', { class: 'kbtn', attrs: { type: 'button', 'aria-pressed': String(d === depth), 'data-depth': d }, text: d === 9 ? tx({ de: '9 (alles)', en: '9 (all)' }) : String(d) });
    b.addEventListener('click', () => {
      depth = d;
      for (const x of depthRow.querySelectorAll('button')) x.setAttribute('aria-pressed', String(Number(x.dataset.depth) === depth));
      newGame();
    });
    depthRow.append(b);
  }
  abBtn.addEventListener('click', () => {
    alphaBeta = !alphaBeta;
    abBtn.setAttribute('aria-pressed', String(alphaBeta));
    renderGoals();
  });

  const fmtValue = (v: number) => (v >= WIN - 9 ? tx({ de: 'Sieg', en: 'win' }) : v <= -WIN + 9 ? tx({ de: 'Verlust', en: 'loss' }) : ctx.num(v));

  function renderBoard(): void {
    clear(boardEl);
    board.forEach((c, i) => {
      const cell = h('button', { class: `kttt__cell${c ? ` is-${c.toLowerCase()}` : ''}`, attrs: { type: 'button', role: 'gridcell', 'aria-label': c ? `${tx({ de: 'Feld', en: 'Cell' })} ${i + 1}: ${c}` : `${tx({ de: 'Feld', en: 'Cell' })} ${i + 1} ${tx({ de: 'frei', en: 'empty' })}` } }, c ?? '');
      cell.disabled = !!c || over || busy;
      cell.addEventListener('click', () => humanMove(i));
      boardEl.append(cell);
    });
    clear(evalBoard);
    evalBox.hidden = lastEvals.size === 0;
    for (let i = 0; i < 9; i++) {
      const value = lastEvals.get(i);
      const text = i === lastChoice ? `✓ ${value !== undefined ? fmtValue(value) : ''}` : value !== undefined ? fmtValue(value) : '';
      evalBoard.append(h('span', { class: `kttt__cell kttt__cell--mini${i === lastChoice ? ' is-chosen' : ''}`, text }));
    }
  }

  function renderGoals(): void {
    clear(goals);
    const item = (ok: boolean, text: string) => goals.append(h('li', { class: ok ? 'is-done' : '' }, `${ok ? '✅' : '⬜'} ${text}`));
    item(mission.draw, tx({ de: 'Spiel gegen Suchtiefe 9 – und verliere nicht.', en: 'Play against depth 9 – and don’t lose.' }));
    item(mission.noAb > 0 && mission.ab > 0, tx({ de: `Lass Ada einmal ohne und einmal mit Alpha-Beta bei Tiefe 9 rechnen${mission.noAb && mission.ab ? `: ${ctx.num(mission.noAb)} gegen ${ctx.num(mission.ab)} Knoten` : ''}.`, en: `Let Ada search at depth 9 once without and once with alpha-beta${mission.noAb && mission.ab ? `: ${ctx.num(mission.noAb)} vs ${ctx.num(mission.ab)} nodes` : ''}.` }));
    item(mission.bonus, tx({ de: 'Bonus: Schlag Ada bei Suchtiefe 1.', en: 'Bonus: beat Ada at depth 1.' }));
    if (!finished && mission.draw && mission.noAb > 0 && mission.ab > 0) {
      finished = true;
      host.append(solved(tx({ de: 'Spielbaum gemeistert!', en: 'Game tree mastered!' })));
      ctx.say({ de: 'Gegen die volle Suche gibt es nur Unentschieden. Und Alpha-Beta spart dabei einen Großteil der Arbeit – bei exakt gleichem Ergebnis.', en: 'Against the full search the best you can get is a draw. And alpha-beta saves most of the work – with exactly the same result.' }, 'wow');
      ctx.finish();
    }
  }

  function checkEnd(): boolean {
    const w = winner(board);
    if (!w && !full(board)) return false;
    over = true;
    if (w === 'X') {
      status.textContent = `🎉 ${tx({ de: 'Du hast gewonnen!', en: 'You won!' })}`;
      if (depth === 1) mission.bonus = true;
      if (depth === 9) mission.draw = true;
      ctx.say(depth === 1 ? { de: 'Bei Tiefe 1 sehe ich deine Gabel nicht kommen. Stell mich auf 9!', en: 'At depth 1 I can’t see your fork coming. Set me to 9!' } : { de: 'Gewonnen gegen mich? Dann habe ich zu kurz gedacht.', en: 'You beat me? Then I didn’t think far enough ahead.' }, 'sad');
    } else if (w === 'O') {
      status.textContent = `🤖 ${tx({ de: 'Ada hat gewonnen.', en: 'Ada won.' })}`;
      if (depth === 9) {
        losses += 1;
        if (losses <= 2) ctx.mistake();
      }
      ctx.say({ de: 'Drei in einer Reihe. Probier es nochmal – mit der Mitte oder einer Ecke anfangen hilft.', en: 'Three in a row. Try again – starting in the centre or a corner helps.' }, 'wink');
    } else {
      status.textContent = `🤝 ${tx({ de: 'Unentschieden.', en: 'Draw.' })}`;
      if (depth === 9) mission.draw = true;
      ctx.say({ de: 'Unentschieden: Bei perfektem Spiel beider Seiten endet Tic-Tac-Toe immer so.', en: 'A draw: with perfect play on both sides, noughts and crosses always ends like this.' }, 'happy');
    }
    renderBoard();
    renderGoals();
    return true;
  }

  function humanMove(i: number): void {
    if (over || busy || board[i]) return;
    board[i] = 'X';
    renderBoard();
    if (checkEnd()) return;
    busy = true;
    status.textContent = `🤖 ${tx({ de: 'Ada durchsucht den Spielbaum …', en: 'Ada is searching the game tree …' })}`;
    timer = window.setTimeout(() => {
      const d = decide(board, Math.min(depth, freeCells(board).length), alphaBeta);
      board[d.best] = 'O';
      lastEvals = new Map(d.evals.map((e) => [e.move, e.value]));
      lastChoice = d.best;
      busy = false;
      stats.textContent = tx({ de: `Untersuchte Knoten: ${ctx.num(d.nodes)} · Bewertung des gewählten Zugs: ${fmtValue(d.value)}. Rechts unten siehst du Adas Bewertung aller möglichen Züge.`, en: `Nodes examined: ${ctx.num(d.nodes)} · value of the chosen move: ${fmtValue(d.value)}. Bottom right you see Ada’s rating of every possible move.` });
      if (depth === 9 && freeCells(board).length >= 6) {
        if (alphaBeta) mission.ab = d.nodes;
        else mission.noAb = d.nodes;
      }
      if (!checkEnd()) status.textContent = tx({ de: 'Du bist dran (X).', en: 'Your turn (X).' });
      renderBoard();
      renderGoals();
    }, ctx.reducedMotion ? 0 : 350);
  }

  function newGame(): void {
    clearTimeout(timer);
    board = Array(9).fill(null);
    lastEvals = new Map();
    lastChoice = -1;
    over = false;
    busy = false;
    status.textContent = tx({ de: 'Du beginnst (X).', en: 'You start (X).' });
    stats.textContent = '';
    renderBoard();
  }

  again.addEventListener('click', newGame);
  newGame();
  renderGoals();
  return { destroy: () => clearTimeout(timer) };
};

export default game;
