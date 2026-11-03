import { L } from '../../../curriculum/helpers';
import type { Localized } from '../../../i18n/config';
import { h } from '../../engine/dom';
import { meter, replay, solved } from '../../engine/ui';
import type { GameMount } from '../../types';
import { bestScore, classify, CONDITIONS, PETS, ruleKey, score, type Condition } from '../models/regeln';

/** Spiel „Regel-Roboter“: Bis zu zwei Bedingungen wählen, Bit sortiert die Tiere. */
const NAMES: Record<string, { emoji: string; name: Localized }> = {
  hauskatze: { emoji: '🐈', name: L('Hauskatze', 'House cat') },
  perser: { emoji: '🐱', name: L('Perserkatze', 'Persian cat') },
  mainecoon: { emoji: '🐈‍⬛', name: L('Maine-Coon-Katze', 'Maine Coon cat') },
  faltohr: { emoji: '😺', name: L('Faltohrkatze', 'Fold-eared cat') },
  dackel: { emoji: '🐕', name: L('Dackel', 'Dachshund') },
  husky: { emoji: '🐕‍🦺', name: L('Husky', 'Husky') },
  chihuahua: { emoji: '🐶', name: L('Chihuahua', 'Chihuahua') },
  labrador: { emoji: '🦮', name: L('Labrador', 'Labrador') },
  pudel: { emoji: '🐩', name: L('Pudel', 'Poodle') },
};

const VALUE: Record<string, Localized> = {
  'ears=pointy': L('spitze Ohren', 'pointy ears'),
  'ears=floppy': L('Hängeohren', 'floppy ears'),
  'size=small': L('klein', 'small'),
  'size=big': L('groß', 'big'),
  'fur=short': L('kurzes Fell', 'short fur'),
  'fur=long': L('langes Fell', 'long fur'),
};

const key = (c: Condition) => `${c.feature}=${c.value}`;

const game: GameMount<void> = (host, ctx) => {
  const { tx } = ctx;
  const best = bestScore();
  let rule: Condition[] = [];
  const tried = new Set<string>();
  let finished = false;

  // Regel-Baukasten
  const chips = CONDITIONS.map((c) => {
    const b = h('button', { class: 'kbtn', attrs: { type: 'button', 'aria-pressed': 'false' }, text: tx(VALUE[key(c)]!) });
    b.addEventListener('click', () => {
      const i = rule.findIndex((r) => key(r) === key(c));
      if (i >= 0) rule.splice(i, 1);
      else {
        // Zwei Bedingungen zum selben Merkmal schließen sich aus: die alte ersetzen
        rule = rule.filter((r) => r.feature !== c.feature);
        if (rule.length >= 2) rule.shift();
        rule.push(c);
      }
      sync();
    });
    return { c, b };
  });
  const ruleText = h('p', { class: 'kpanel__title' });
  const test = h('button', { class: 'kbtn kbtn--main', attrs: { type: 'button' }, text: tx(L('🤖 Bit testen', '🤖 Test Bit')) });
  const builder = h(
    'div',
    { class: 'kpanel' },
    ruleText,
    h('div', { class: 'krow' }, ...chips.map((x) => x.b)),
    h('p', { class: 'khint', text: tx(L('Wähle bis zu zwei Merkmale. Passt alles, sagt Bit „Katze“ – sonst „Hund“.', 'Pick up to two features. If all match, Bit says “cat” – otherwise “dog”.')) }),
    h('div', { class: 'krow' }, test),
  );

  // Tiere
  const cards = PETS.map((pet) => {
    const mark = h('span', { class: 'kitem__mark' });
    const guess = h('span', { class: 'kitem__tag' });
    const el = h(
      'div',
      { class: 'kitem' },
      mark,
      h('span', { class: 'kitem__emoji', attrs: { 'aria-hidden': 'true' }, text: NAMES[pet.id]!.emoji }),
      h('strong', { text: tx(NAMES[pet.id]!.name) }),
      h('span', { class: 'kitem__tag', text: [VALUE[`ears=${pet.ears}`], VALUE[`size=${pet.size}`], VALUE[`fur=${pet.fur}`]].map((v) => tx(v!)).join(' · ') }),
      guess,
    );
    return { pet, el, mark, guess };
  });
  const result = meter(tx(L('Richtig sortiert', 'Sorted correctly')), tx(L(`Schaffst du ${best} von ${PETS.length}?`, `Can you get ${best} of ${PETS.length}?`)));
  result.set(0, PETS.length, `– / ${PETS.length}`);
  const animals = h('div', { class: 'kpanel' }, h('div', { class: 'kitems' }, ...cards.map((x) => x.el)), h('div', { class: 'khint' }, result.el));
  host.append(builder, animals);

  function sync(): void {
    for (const { c, b } of chips) b.setAttribute('aria-pressed', String(rule.some((r) => key(r) === key(c))));
    const parts = rule.map((r) => tx(VALUE[key(r)]!));
    ruleText.textContent =
      parts.length === 0
        ? tx(L('Regel: Bit sagt immer „Katze“.', 'Rule: Bit always says “cat”.'))
        : tx(L(`Regel: Wenn ${parts.join(' und ')} → Katze, sonst Hund.`, `Rule: if ${parts.join(' and ')} → cat, otherwise dog.`));
  }

  test.addEventListener('click', () => {
    const points = score(rule);
    tried.add(ruleKey(rule));
    cards.forEach((card, i) => {
      const said = classify(card.pet, rule);
      const ok = said === card.pet.kind;
      // Karten drehen sich nacheinander um: Bit prüft Tier für Tier
      card.el.style.setProperty('--i', String(i));
      replay(card.el, 'is-flip-seq');
      card.el.classList.toggle('is-right', ok);
      card.el.classList.toggle('is-wrong', !ok);
      card.mark.textContent = ok ? '✓' : '✗';
      card.guess.textContent = tx(L(`Bit: ${said === 'cat' ? 'Katze' : 'Hund'}`, `Bit: ${said === 'cat' ? 'cat' : 'dog'}`));
    });
    result.set(points, PETS.length, `${points} / ${PETS.length}`, points >= best);
    if (points >= best) {
      ctx.say(L(`${points} von ${PETS.length}! Besser geht es mit diesen Merkmalen nicht. Aber ein paar Tiere erwische ich immer falsch.`, `${points} of ${PETS.length}! That’s the best these features allow. But I always get a few animals wrong.`), 'wow');
    } else if (tried.size === 1) {
      ctx.say(L(`${points} von ${PETS.length} richtig. Die roten Karten habe ich falsch einsortiert. Probier eine andere Regel!`, `${points} of ${PETS.length} correct. I sorted the red cards wrongly. Try another rule!`), 'think');
    } else {
      ctx.say(L(`${points} von ${PETS.length}. Hmm, immer gibt es Ausnahmen …`, `${points} of ${PETS.length}. Hmm, there are always exceptions …`), 'think');
    }
    if (!finished && (points >= best || tried.size >= 3)) {
      finished = true;
      animals.append(solved(tx(L('Gut getestet! Weiter geht’s.', 'Well tested! Let’s move on.'))));
      ctx.finish();
    }
  });

  sync();
};

export default game;
