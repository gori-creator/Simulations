import { L } from '../../../curriculum/helpers';
import type { Localized } from '../../../i18n/config';
import { clear, h } from '../../engine/dom';
import { meter, solved } from '../../engine/ui';
import type { GameMount } from '../../types';
import { CREATURES, FEATURES, featureScore, type FeatureId, type Group } from '../models/merkmale';

/** Spiel „Gute Merkmale“: Merkmal antippen, Bit sortiert danach und zeigt, wie gut es trennt. */
const ANIMAL: Record<string, { emoji: string; name: Localized }> = {
  amsel: { emoji: '🐦', name: L('Amsel', 'Blackbird') },
  pinguin: { emoji: '🐧', name: L('Pinguin', 'Penguin') },
  huhn: { emoji: '🐔', name: L('Huhn', 'Chicken') },
  adler: { emoji: '🦅', name: L('Adler', 'Eagle') },
  eule: { emoji: '🦉', name: L('Eule', 'Owl') },
  hund: { emoji: '🐕', name: L('Hund', 'Dog') },
  fledermaus: { emoji: '🦇', name: L('Fledermaus', 'Bat') },
  katze: { emoji: '🐈', name: L('Katze', 'Cat') },
  delfin: { emoji: '🐬', name: L('Delfin', 'Dolphin') },
  maus: { emoji: '🐭', name: L('Maus', 'Mouse') },
};

const FEATURE: Record<FeatureId, Localized> = {
  flies: L('Kann fliegen', 'Can fly'),
  brightPhoto: L('Foto ist hell', 'Photo is bright'),
  twoLegs: L('Hat zwei Beine', 'Has two legs'),
  weekend: L('Foto am Wochenende gemacht', 'Photo taken at the weekend'),
  feathers: L('Hat Federn', 'Has feathers'),
};

const GROUP: Record<Group, Localized> = { bird: L('Vogel', 'Bird'), mammal: L('Säugetier', 'Mammal') };

const game: GameMount<void> = (host, ctx) => {
  const { tx } = ctx;
  const tested = new Set<FeatureId>();
  let finished = false;

  const buttons = FEATURES.map((f) => {
    const b = h('button', { class: 'kbtn', attrs: { type: 'button', 'aria-pressed': 'false' }, text: tx(FEATURE[f]) });
    b.addEventListener('click', () => pick(f));
    return { f, b };
  });
  const boxes = h('div', { class: 'kgrid-2' });
  const result = meter(tx(L('Richtig sortiert', 'Sorted correctly')));
  result.set(0, CREATURES.length, `– / ${CREATURES.length}`);
  const table = h('ul', { class: 'kscore' });
  const panel = h(
    'div',
    { class: 'kpanel' },
    h('p', { class: 'kpanel__title', text: tx(L('Welches Merkmal soll Bit benutzen?', 'Which feature should Bit use?')) }),
    h('div', { class: 'krow' }, ...buttons.map((x) => x.b)),
  );
  const out = h('div', { class: 'kpanel' }, boxes, h('div', { class: 'khint' }, result.el), table);
  host.append(panel, out);

  function card(id: string, ok: boolean): HTMLElement {
    const a = CREATURES.find((x) => x.id === id)!;
    return h('div', { class: `kitem ${ok ? 'is-right' : 'is-wrong'}` }, h('span', { class: 'kitem__mark', text: ok ? '✓' : '✗' }), h('span', { class: 'kitem__emoji', attrs: { 'aria-hidden': 'true' }, text: ANIMAL[id]!.emoji }), h('strong', { text: tx(ANIMAL[id]!.name) }), h('span', { class: 'kitem__tag', text: tx(GROUP[a.group]) }));
  }

  function pick(f: FeatureId): void {
    for (const x of buttons) x.b.setAttribute('aria-pressed', String(x.f === f));
    const r = featureScore(f);
    const no: Group = r.yes === 'bird' ? 'mammal' : 'bird';
    clear(boxes);
    for (const answer of [true, false]) {
      const guess = answer ? r.yes : no;
      const items = CREATURES.filter((a) => a.has[f] === answer);
      boxes.append(
        h(
          'div',
          { class: 'kbox' },
          h('p', { class: 'kbox__title', text: `${answer ? tx(L('Ja', 'Yes')) : tx(L('Nein', 'No'))} → Bit: ${tx(GROUP[guess])}` }),
          h('div', { class: 'kitems' }, ...items.map((a) => card(a.id, a.group === guess))),
        ),
      );
    }
    result.set(r.correct, r.total, `${r.correct} / ${r.total}`, r.correct === r.total);
    if (!tested.has(f)) {
      tested.add(f);
      table.append(h('li', {}, h('span', { text: tx(FEATURE[f]) }), h('strong', { text: `${r.correct} / ${r.total}` })));
    }
    if (r.correct === r.total) ctx.say(L('Federn haben nur Vögel – damit liege ich immer richtig!', 'Only birds have feathers – with that I’m always right!'), 'wow');
    else if (r.correct >= 9) ctx.say(L('Fast perfekt. Nur die Fledermaus steht auch auf zwei Beinen.', 'Almost perfect. Only the bat also stands on two legs.'), 'happy');
    else if (r.correct >= 7) ctx.say(L('Ganz gut, aber Pinguine und Hühner fliegen nicht – und Fledermäuse schon.', 'Not bad, but penguins and chickens don’t fly – and bats do.'), 'think');
    else ctx.say(L(`Nur ${r.correct} von 10. Das hat mit Vögeln gar nichts zu tun – Zufall!`, `Only ${r.correct} of 10. That has nothing to do with birds – pure chance!`), 'sad');
    if (!finished && tested.has('feathers') && tested.size >= 3) {
      finished = true;
      out.append(solved(tx(L('Du hast das beste Merkmal gefunden!', 'You found the best feature!'))));
      ctx.finish();
    } else if (!finished && f === 'feathers') {
      ctx.say(L('Perfekt! Teste noch ein, zwei andere Merkmale zum Vergleich.', 'Perfect! Test one or two other features to compare.'), 'wow');
    }
  }
};

export default game;
