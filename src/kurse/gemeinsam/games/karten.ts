import type { Localized } from '../../../i18n/config';
import { clear, h } from '../../engine/dom';
import { meter, solved } from '../../engine/ui';
import type { GameMount } from '../../types';

/**
 * Kartenspiel: Eine Karte nach der anderen einer von zwei Seiten zuordnen
 * (z. B. „KI“ / „keine KI“). Nach jeder Karte erklärt Bit die Antwort.
 */
export interface Card {
  emoji: string;
  text: Localized;
  answer: 'a' | 'b';
  why: Localized;
}

export interface KartenProps {
  a: Localized;
  b: Localized;
  aIcon: string;
  bIcon: string;
  cards: Card[];
  /** Bit-Satz am Ende; {n} = richtige, {total} = alle. */
  done: Localized;
}

const game: GameMount<KartenProps> = (host, ctx, props) => {
  const { tx } = ctx;
  const { cards } = props;
  let index = 0;
  let right = 0;
  const answers: boolean[] = [];

  const score = meter(tx({ de: 'Richtig', en: 'Correct' }));
  score.set(0, cards.length, `0 / ${cards.length}`);
  const stage = h('div', { class: 'kcard-stage' });
  host.append(h('div', { class: 'kpanel' }, stage, h('div', { class: 'khint' }, score.el)));

  function show(): void {
    clear(stage);
    const card = cards[index]!;
    const why = h('p', { class: 'kcard__why', attrs: { hidden: true } });
    const btnA = h('button', { class: 'kbtn kbtn--a kcard__btn', attrs: { type: 'button' } }, `${props.aIcon} ${tx(props.a)}`);
    const btnB = h('button', { class: 'kbtn kbtn--b kcard__btn', attrs: { type: 'button' } }, `${props.bIcon} ${tx(props.b)}`);
    const nextBtn = h('button', { class: 'kbtn kbtn--main', attrs: { type: 'button', hidden: true } }, index < cards.length - 1 ? tx({ de: 'Nächste Karte →', en: 'Next card →' }) : tx({ de: 'Auswerten', en: 'See result' }));
    const el = h(
      'div',
      { class: 'kcard' },
      h('span', { class: 'kcard__count', text: `${index + 1} / ${cards.length}` }),
      h('span', { class: 'kcard__emoji', attrs: { 'aria-hidden': 'true' }, text: card.emoji }),
      h('p', { class: 'kcard__text', text: tx(card.text) }),
      why,
    );
    const choose = (pick: 'a' | 'b') => {
      const ok = pick === card.answer;
      answers.push(ok);
      if (ok) right += 1;
      else ctx.mistake();
      btnA.disabled = true;
      btnB.disabled = true;
      (pick === 'a' ? btnA : btnB).setAttribute('aria-pressed', 'true');
      el.classList.add(ok ? 'is-right' : 'is-wrong');
      why.textContent = `${ok ? '✓' : '✗'} ${tx(card.answer === 'a' ? props.a : props.b)}: ${tx(card.why)}`;
      why.hidden = false;
      ctx.say(card.why, ok ? 'happy' : 'think');
      score.set(right, cards.length, `${right} / ${cards.length}`);
      nextBtn.hidden = false;
      nextBtn.focus();
    };
    btnA.addEventListener('click', () => choose('a'));
    btnB.addEventListener('click', () => choose('b'));
    nextBtn.addEventListener('click', () => {
      index += 1;
      if (index < cards.length) show();
      else end();
    });
    stage.append(el, h('div', { class: 'kcard__actions' }, btnA, btnB, nextBtn));
    if (index > 0) btnA.focus();
  }

  function end(): void {
    clear(stage);
    const list = h('div', { class: 'kitems' });
    cards.forEach((card, i) => {
      list.append(
        h(
          'div',
          { class: `kitem ${card.answer === 'a' ? 'is-a' : 'is-b'}` },
          h('span', { class: 'kitem__mark', text: answers[i] ? '✓' : '✗' }),
          h('span', { class: 'kitem__emoji', attrs: { 'aria-hidden': 'true' }, text: card.emoji }),
          h('span', { text: tx(card.text) }),
          h('span', { class: 'kitem__tag', text: `${card.answer === 'a' ? props.aIcon : props.bIcon} ${tx(card.answer === 'a' ? props.a : props.b)}` }),
        ),
      );
    });
    stage.append(list, solved(`${right} / ${cards.length}`));
    const text = tx(props.done).replace('{n}', String(right)).replace('{total}', String(cards.length));
    ctx.say(text, right === cards.length ? 'wow' : 'happy');
    ctx.finish();
  }

  show();
};

export default game;
