import { L } from '../../../curriculum/helpers';
import type { Localized } from '../../../i18n/config';
import { clear, h } from '../../engine/dom';
import { meter, solved } from '../../engine/ui';
import type { GameMount } from '../../types';
import { GRID, recognise, SYMBOLS, TEMPLATES, TEST_DRAWINGS, type Drawing, type Symbol } from '../models/zeichen';
import { paintGrid } from '../parts/grid';

/**
 * Spiel „Zeichen erkennen“: Zeichnungen als Beispiele speichern, dann macht
 * Bit eine Probe mit verwackelten Zeichnungen. Zum Schluss rät Bit live.
 */
const NAME: Record<Symbol, Localized> = { cross: L('Kreuz', 'cross'), circle: L('Kreis', 'circle'), line: L('Strich', 'line') };
const ICON: Record<Symbol, string> = { cross: '✖️', circle: '⭕', line: '➖' };

const game: GameMount<void> = (host, ctx) => {
  const { tx } = ctx;
  const examples: Drawing[] = [];
  let finished = false;

  const live = h('p', { class: 'kvote', attrs: { 'aria-live': 'polite' } });
  const grid = paintGrid(GRID, tx(L('Malfläche 5 mal 5', 'Drawing grid 5 by 5')), (cells) => {
    if (!cells.some(Boolean)) {
      live.textContent = tx(L('Mal ein Zeichen …', 'Draw a symbol …'));
      return;
    }
    const r = recognise(cells, examples);
    live.textContent = r ? tx(L(`Bit tippt auf: ${tx(NAME[r.label])} ${ICON[r.label]}`, `Bit’s guess: ${NAME[r.label].en} ${ICON[r.label]}`)) : tx(L('Bit kennt noch kein Beispiel.', 'Bit doesn’t know any examples yet.'));
  });
  const counts = h('p', { class: 'khint' });
  const store = SYMBOLS.map((sym) => {
    const b = h('button', { class: 'kbtn', attrs: { type: 'button' }, text: tx(L(`${ICON[sym]} als ${NAME[sym].de} speichern`, `${ICON[sym]} save as ${NAME[sym].en}`)) });
    b.addEventListener('click', () => {
      const cells = grid.get();
      if (!cells.some(Boolean)) {
        ctx.say(L('Die Fläche ist noch leer – mal erst etwas!', 'The grid is still empty – draw something first!'), 'think');
        return;
      }
      examples.push({ label: sym, cells });
      grid.set(new Array(GRID * GRID).fill(0));
      ctx.say(L(`Danke! Ich kenne jetzt ${examples.length} Beispiel${examples.length === 1 ? '' : 'e'}.`, `Thanks! I now know ${examples.length} example${examples.length === 1 ? '' : 's'}.`), 'happy');
      sync();
    });
    return b;
  });
  const templates = SYMBOLS.map((sym) => {
    const b = h('button', { class: 'kbtn', attrs: { type: 'button' }, text: `${ICON[sym]} ${tx(L('Vorlage', 'template'))}` });
    b.addEventListener('click', () => grid.set(TEMPLATES[sym]));
    return b;
  });
  const clearBtn = h('button', { class: 'kbtn', attrs: { type: 'button' }, text: tx(L('🧽 Leeren', '🧽 Clear')) });
  clearBtn.addEventListener('click', () => grid.set(new Array(GRID * GRID).fill(0)));

  const testBtn = h('button', { class: 'kbtn kbtn--main', attrs: { type: 'button', disabled: true }, text: tx(L('📝 Bits Probe starten', '📝 Start Bit’s test')) });
  const testRow = h('div', { class: 'kitems' });
  const result = meter(tx(L('Probe', 'Test')), tx(L('Ziel: mindestens 5 von 6', 'Goal: at least 5 of 6')));
  result.set(0, TEST_DRAWINGS.length, `– / ${TEST_DRAWINGS.length}`);

  host.append(
    h(
      'div',
      { class: 'kpanel' },
      h('p', { class: 'kpanel__title', text: tx(L('1. Zeichnen und als Beispiel speichern', '1. Draw and save as an example')) }),
      h('div', { class: 'kpair' }, grid.el, h('div', { class: 'kzeichen__tools' }, h('div', { class: 'krow' }, ...store), h('p', { class: 'khint', text: tx(L('Keine Lust zu malen? Lade eine Vorlage:', 'Don’t feel like drawing? Load a template:')) }), h('div', { class: 'krow' }, ...templates, clearBtn))),
      live,
      counts,
    ),
    h('div', { class: 'kpanel' }, h('p', { class: 'kpanel__title', text: tx(L('2. Bits Probe mit verwackelten Zeichnungen', '2. Bit’s test with wobbly drawings')) }), h('div', { class: 'krow' }, testBtn), testRow, h('div', { class: 'khint' }, result.el)),
  );

  function sync(): void {
    const per = SYMBOLS.map((sym) => examples.filter((e) => e.label === sym).length);
    counts.textContent = SYMBOLS.map((sym, i) => `${ICON[sym]} ${per[i]}`).join('   ');
    testBtn.disabled = per.some((n) => n === 0);
    if (testBtn.disabled) testBtn.title = tx(L('Erst zu jedem Zeichen ein Beispiel speichern', 'Save one example of each symbol first'));
    else testBtn.removeAttribute('title');
  }

  testBtn.addEventListener('click', () => {
    clear(testRow);
    let right = 0;
    for (const d of TEST_DRAWINGS) {
      const r = recognise(d.cells, examples)!;
      const ok = r.label === d.label;
      if (ok) right++;
      const mini = paintGrid(GRID, tx(NAME[d.label]), () => undefined, true);
      mini.set(d.cells);
      testRow.append(h('div', { class: `kitem ${ok ? 'is-right' : 'is-wrong'}` }, h('span', { class: 'kitem__mark', text: ok ? '✓' : '✗' }), mini.el, h('span', { class: 'kitem__tag', text: `Bit: ${ICON[r.label]} ${tx(NAME[r.label])}` })));
    }
    result.set(right, TEST_DRAWINGS.length, `${right} / ${TEST_DRAWINGS.length}`, right >= 5);
    if (right >= 5) {
      ctx.say(L(`${right} von 6 erkannt! Probier jetzt oben: Mal etwas, und ich rate sofort.`, `Recognised ${right} of 6! Now try above: draw something and I’ll guess right away.`), 'wow');
      if (!finished) {
        finished = true;
        host.append(solved(tx(L('Bit erkennt Zeichen!', 'Bit recognises symbols!'))));
        ctx.finish();
      }
    } else {
      ctx.say(L(`Nur ${right} von 6. Zeig mir mehr Beispiele – auch etwas schiefe!`, `Only ${right} of 6. Show me more examples – slightly wonky ones too!`), 'think');
    }
  });

  sync();
  live.textContent = tx(L('Mal ein Zeichen …', 'Draw a symbol …'));
};

export default game;
