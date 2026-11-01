import { L } from '../../../curriculum/helpers';
import type { Localized } from '../../../i18n/config';
import { clear, h } from '../../engine/dom';
import { meter, solved } from '../../engine/ui';
import type { GameMount } from '../../types';
import { GROUPS, POOL, START, TEST, type Group, type Thing } from '../models/fair';
import { accuracy, classify } from '../models/knn';

/** Spiel „Ist das fair?“: Bit erkennt Schuhe – aber nur solche, die er schon kennt. */
const EMOJI: Record<string, string> = {
  sneaker: '👟',
  boot: '🥾',
  sandal: '👡',
  flipflop: '🩴',
  socke: '🧦',
  muetze: '🧢',
  rucksack: '🎒',
  handschuh: '🧤',
  schal: '🧣',
  kappe: '🧢',
};
const emoji = (x: Thing) => EMOJI[x.id.replace(/^t-/, '').replace(/-\d+$/, '')] ?? EMOJI[x.group] ?? '❓';
const GROUP: Record<Group, Localized> = { sneaker: L('Turnschuhe', 'Sneakers'), boot: L('Stiefel', 'Boots'), sandal: L('Sandalen', 'Sandals'), other: L('Kein Schuh', 'Not a shoe') };
const KIND = { shoe: L('Schuh', 'shoe'), other: L('kein Schuh', 'not a shoe') };

const game: GameMount<void> = (host, ctx) => {
  const { tx } = ctx;
  const data: Thing[] = [...START];
  let finished = false;

  const known = h('div', { class: 'kchips' });
  const pool = POOL.map((p) => {
    const b = h('button', { class: 'kitem', attrs: { type: 'button' } }, h('span', { class: 'kitem__emoji', attrs: { 'aria-hidden': 'true' }, text: emoji(p) }), h('strong', { text: tx(GROUP[p.group]) }), h('span', { class: 'kitem__tag', text: tx(L('Bit zeigen', 'Show Bit')) }));
    b.addEventListener('click', () => {
      data.push(p);
      b.disabled = true;
      b.classList.add('is-picked');
      update(p);
    });
    return b;
  });
  const tests = h('div', { class: 'kitems' });
  const meters = GROUPS.map((g) => ({ g, m: meter(tx(GROUP[g])) }));

  host.append(
    h('div', { class: 'kpanel' }, h('p', { class: 'kpanel__title', text: tx(L('Diese Beispiele kennt Bit', 'Examples Bit knows')) }), known, h('p', { class: 'kpanel__title khint', text: tx(L('Weitere Beispiele zeigen', 'Show more examples')) }), h('div', { class: 'kitems' }, ...pool)),
    h('div', { class: 'kpanel' }, h('p', { class: 'kpanel__title', text: tx(L('Bits Prüfung: Schuh oder kein Schuh?', 'Bit’s exam: shoe or not a shoe?')) }), tests, h('div', { class: 'kgrid-2 khint' }, ...meters.map((x) => x.m.el))),
  );

  function update(added?: Thing): void {
    clear(known);
    for (const d of data) known.append(h('span', { class: `kchip ${d.label === 'shoe' ? 'is-a' : 'is-b'}`, attrs: { title: tx(GROUP[d.group]) }, text: emoji(d) }));
    clear(tests);
    for (const x of TEST) {
      const said = classify(x, data, 1)!;
      const ok = said === x.label;
      tests.append(h('div', { class: `kitem ${ok ? 'is-right' : 'is-wrong'}` }, h('span', { class: 'kitem__mark', text: ok ? '✓' : '✗' }), h('span', { class: 'kitem__emoji', attrs: { 'aria-hidden': 'true' }, text: emoji(x) }), h('strong', { text: tx(GROUP[x.group]) }), h('span', { class: 'kitem__tag', text: `Bit: ${tx(KIND[said])}` })));
    }
    let all = true;
    for (const { g, m } of meters) {
      const share = accuracy(TEST.filter((x) => x.group === g), data, 1);
      if (share < 1) all = false;
      m.set(Math.round(share * 100), 100, ctx.percent(share), share === 1);
    }
    if (added) {
      if (added.group === 'sandal' && all) ctx.say(L('Ach so, Sandalen sind auch Schuhe! Jetzt erkenne ich alle. Ich kannte sie vorher einfach nicht.', 'Oh, sandals are shoes too! Now I recognise all of them. I just didn’t know them before.'), 'wow');
      else if (added.group === 'sandal') ctx.say(L('Eine Sandale! Das hilft mir schon.', 'A sandal! That already helps.'), 'happy');
      else ctx.say(L('Danke – aber bei den Sandalen hilft mir das nicht. Davon habe ich immer noch keine gesehen.', 'Thanks – but that doesn’t help with sandals. I still haven’t seen any.'), 'think');
    }
    if (all && !finished) {
      finished = true;
      host.append(solved(tx(L('Jetzt ist Bit fair zu allen Schuhen!', 'Now Bit is fair to all shoes!'))));
      ctx.finish();
    }
  }

  update();
};

export default game;
