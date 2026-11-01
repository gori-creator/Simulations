import { L } from '../../../curriculum/helpers';
import type { Localized } from '../../../i18n/config';
import { h } from '../../engine/dom';
import { meter, solved } from '../../engine/ui';
import type { GameMount } from '../../types';
import { accuracy, classify } from '../models/knn';
import { EXAMPLES, TESTS, type Color, type Fruit, type FruitSample } from '../models/obst';

/** Spiel „Aus Beispielen lernen“: Beispiele zeigen, Bit macht danach jedes Mal eine Probe. */
const FRUIT: Record<Fruit, Localized> = { apple: L('Apfel', 'Apple'), pear: L('Birne', 'Pear') };
const COLOR: Record<Color, Localized> = { red: L('rot', 'red'), yellow: L('gelb', 'yellow'), green: L('grün', 'green') };
const EMOJI = (f: FruitSample) => (f.label === 'pear' ? '🍐' : f.color === 'green' ? '🍏' : '🍎');

const game: GameMount<void> = (host, ctx) => {
  const { tx } = ctx;
  const shown: FruitSample[] = [];
  let finished = false;

  const fruitBody = (f: FruitSample, name: boolean) => [
    h('span', { class: `kfruit kfruit--${f.color}`, attrs: { 'aria-hidden': 'true' }, text: EMOJI(f) }),
    name ? h('strong', { text: tx(FRUIT[f.label]) }) : null,
    h('span', { class: 'kitem__tag', text: `${tx(COLOR[f.color])} · ${f.x > 0.7 ? tx(L('rund', 'round')) : tx(L('länglich', 'long'))}` }),
  ];

  // Beispiel-Korb
  const pool = EXAMPLES.map((f) => {
    const b = h('button', { class: 'kitem', attrs: { type: 'button', 'aria-pressed': 'false' } }, ...fruitBody(f, true));
    b.addEventListener('click', () => {
      if (shown.includes(f)) return;
      shown.push(f);
      b.setAttribute('aria-pressed', 'true');
      b.classList.add('is-picked');
      b.disabled = true;
      check();
    });
    return b;
  });

  // Probe
  const tests = TESTS.map((f) => {
    const guess = h('span', { class: 'kitem__tag', text: tx(L('Bit: ?', 'Bit: ?')) });
    const mark = h('span', { class: 'kitem__mark' });
    const el = h('div', { class: 'kitem' }, mark, ...fruitBody(f, false), guess);
    return { f, el, guess, mark };
  });

  const result = meter(tx(L('Bits Probe', 'Bit’s test')), tx(L('Ziel: alle 6 richtig', 'Goal: all 6 correct')));
  result.set(0, TESTS.length, `– / ${TESTS.length}`);
  const count = h('p', { class: 'khint', text: tx(L('Noch kein Beispiel gezeigt.', 'No examples shown yet.')) });

  host.append(
    h('div', { class: 'kpanel' }, h('p', { class: 'kpanel__title', text: tx(L('1. Zeig Bit ein Beispiel (antippen)', '1. Show Bit an example (tap)')) }), h('div', { class: 'kitems' }, ...pool), count),
    h('div', { class: 'kpanel' }, h('p', { class: 'kpanel__title', text: tx(L('2. Bits Probe: Apfel oder Birne?', '2. Bit’s test: apple or pear?')) }), h('div', { class: 'kitems' }, ...tests.map((t) => t.el)), h('div', { class: 'khint' }, result.el)),
  );

  function check(): void {
    for (const t of tests) {
      const said = classify(t.f, shown, 1)!;
      const ok = said === t.f.label;
      t.guess.textContent = `Bit: ${tx(FRUIT[said])}`;
      t.el.classList.toggle('is-right', ok);
      t.el.classList.toggle('is-wrong', !ok);
      t.mark.textContent = ok ? '✓' : '✗';
    }
    const share = accuracy(TESTS, shown, 1);
    const right = Math.round(share * TESTS.length);
    result.set(right, TESTS.length, `${right} / ${TESTS.length}`, right === TESTS.length);
    count.textContent = tx(L(`${shown.length} von ${EXAMPLES.length} Beispielen gezeigt.`, `${shown.length} of ${EXAMPLES.length} examples shown.`));
    if (shown.length === 1) {
      ctx.say(L(`Ich kenne nur ein Beispiel. Also sage ich überall „${FRUIT[shown[0]!.label].de}“. Zeig mir mehr!`, `I only know one example, so I say “${FRUIT[shown[0]!.label].en.toLowerCase()}” for everything. Show me more!`), 'think');
    } else if (right === TESTS.length) {
      ctx.say(L(`Alle richtig – mit ${shown.length} Beispielen! Verschiedene Farben haben mir geholfen.`, `All correct – with ${shown.length} examples! Different colours helped me.`), 'wow');
    } else {
      const wrong = tests.find((t) => t.el.classList.contains('is-wrong'))!;
      const adj = COLOR[wrong.f.color].de;
      const what = wrong.f.label === 'apple' ? `den ${adj}en Apfel` : `die ${adj}e Birne`;
      ctx.say(L(`${right} von 6. Noch verwechsle ich ${what}. Ich brauche ein ähnliches Beispiel.`, `${right} of 6. I still mix up the ${COLOR[wrong.f.color].en} ${FRUIT[wrong.f.label].en.toLowerCase()}. I need a similar example.`), 'think');
    }
    if (!finished && right === TESTS.length) {
      finished = true;
      host.append(solved(tx(L('Bit hat aus deinen Beispielen gelernt!', 'Bit learned from your examples!'))));
      ctx.finish();
    }
  }
};

export default game;
