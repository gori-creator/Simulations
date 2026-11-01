import { L } from '../../../curriculum/helpers';
import { clear, h } from '../../engine/dom';
import { meter, solved } from '../../engine/ui';
import type { GameMount } from '../../types';
import { rowsOf, sameCells, SIZE, SMILEY } from '../models/pixel';
import { paintGrid } from '../parts/grid';

/** Spiel „Bilder sind Zahlen“: Bit schickt ein Bild als Zahlen – male es nach. */
const game: GameMount<void> = (host, ctx) => {
  const { tx } = ctx;
  let finished = false;

  const target = h('pre', { class: 'knumbers', attrs: { 'aria-label': tx(L('Bits Bild als Zahlen', 'Bit’s picture as numbers')) }, text: rowsOf(SMILEY).join('\n') });
  const mine = h('pre', { class: 'knumbers', attrs: { 'aria-label': tx(L('Dein Bild als Zahlen', 'Your picture as numbers')) } });
  const result = meter(tx(L('Kästchen richtig', 'Squares correct')), tx(L('Ziel: alle 49', 'Goal: all 49')));
  const grid = paintGrid(SIZE, tx(L('Malfläche 7 mal 7', 'Drawing grid 7 by 7')), update);

  host.append(
    h(
      'div',
      { class: 'kpanel' },
      h(
        'div',
        { class: 'kpair' },
        h('div', {}, h('strong', { text: tx(L('📨 Bits Nachricht', '📨 Bit’s message')) }), target),
        h('div', {}, h('strong', { text: tx(L('🖌️ Deine Malfläche', '🖌️ Your canvas')) }), grid.el),
        h('div', {}, h('strong', { text: tx(L('🔢 Dein Bild als Zahlen', '🔢 Your picture as numbers')) }), mine),
      ),
      h('p', { class: 'khint', text: tx(L('1 heißt: Kästchen ausmalen. 0 heißt: leer lassen. Du kannst auch über die Kästchen wischen.', '1 means: fill the square. 0 means: leave it empty. You can also swipe across the squares.')) }),
      h('div', { class: 'khint' }, result.el),
    ),
  );

  function update(cells: number[]): void {
    clear(mine);
    rowsOf(cells).forEach((row, r) => {
      row.split(' ').forEach((v, c) => {
        const diff = Number(v) !== SMILEY[r * SIZE + c];
        mine.append(diff ? h('span', { class: 'is-diff', text: v }) : v, c < SIZE - 1 ? ' ' : '');
      });
      if (r < SIZE - 1) mine.append('\n');
    });
    const same = sameCells(cells, SMILEY);
    result.set(same, SMILEY.length, `${same} / ${SMILEY.length}`, same === SMILEY.length);
    if (same === SMILEY.length && !finished) {
      finished = true;
      ctx.say(L('Ein Smiley! Du hast meine Zahlen in ein Bild verwandelt. Genau so speichert jeder Computer Bilder.', 'A smiley! You turned my numbers into a picture. That’s exactly how every computer stores pictures.'), 'wow');
      host.append(solved(tx(L('Bild entschlüsselt!', 'Picture decoded!'))));
      ctx.finish();
    }
  }

  update(grid.get());
};

export default game;
