import { L } from '../../../curriculum/helpers';
import { clear, h } from '../../engine/dom';
import { solved } from '../../engine/ui';
import type { GameMount } from '../../types';
import { candidates, CORPUS, END, inCorpus, join, sample, START, train } from '../models/woerter';

/**
 * Spiel „Das nächste Wort“: Satz Wort für Wort bauen. Bit zeigt, welche
 * Wörter nach seinen gezählten Wortpaaren folgen könnten, und wie oft.
 */
const GOAL = 2;

const game: GameMount<void> = (host, ctx) => {
  const { tx, lang } = ctx;
  const model = train(CORPUS[lang]);
  let words: string[] = [];
  let done = 0;
  let finished = false;

  const sentence = h('p', { class: 'ksentence', attrs: { 'aria-live': 'polite' } });
  const options = h('div', { class: 'kwords' });
  const dice = h('button', { class: 'kbtn kbtn--main', attrs: { type: 'button' }, text: tx(L('🎲 Bit wählt', '🎲 Bit picks')) });
  const auto = h('button', { class: 'kbtn', attrs: { type: 'button' }, text: tx(L('✍️ Bit schreibt den ganzen Satz', '✍️ Bit writes the whole sentence')) });
  const reset = h('button', { class: 'kbtn', attrs: { type: 'button' }, text: tx(L('🧽 Neuer Satz', '🧽 New sentence')) });
  const list = h('ul', { class: 'kscore' });
  const corpusBox = h('details', { class: 'kinfo' }, h('summary', { text: tx(L('📖 Diese Sätze hat Bit gelesen', '📖 The sentences Bit has read')) }), h('ul', {}, ...CORPUS[lang].map((s) => h('li', { text: s }))));
  const panel = h(
    'div',
    { class: 'kpanel' },
    sentence,
    h('p', { class: 'khint', text: tx(L('Welches Wort kommt als Nächstes? Die Balken zeigen, wie oft Bit dieses Wort nach dem letzten Wort gelesen hat.', 'Which word comes next? The bars show how often Bit read this word after the last one.')) }),
    options,
    h('div', { class: 'krow' }, dice, auto, reset),
    h('p', { class: 'kpanel__title khint', text: tx(L('Fertige Sätze', 'Finished sentences')) }),
    list,
  );
  host.append(panel, h('div', { class: 'khint' }, corpusBox));

  const last = () => (words.length ? words[words.length - 1]! : START);

  function add(word: string): void {
    words.push(word);
    if (word === END) complete();
    else render();
  }

  function complete(): void {
    const text = join(words);
    const known = inCorpus(text, lang);
    done += 1;
    list.append(h('li', {}, h('span', { text }), h('strong', { text: known ? tx(L('📖 stand so im Text', '📖 was in the text')) : tx(L('✨ neu erfunden', '✨ newly made up')) })));
    if (known) ctx.say(L('Diesen Satz kannte ich schon genau so.', 'I already knew this exact sentence.'), 'happy');
    else ctx.say(L('Diesen Satz habe ich nie gelesen! Ich habe ihn nur aus Wortpaaren gebaut. Er klingt richtig – aber ob er stimmt, weiß ich nicht.', 'I never read this sentence! I only built it from word pairs. It sounds right – but I don’t know whether it’s true.'), 'wink');
    words = [];
    if (done >= GOAL && !finished) {
      finished = true;
      panel.append(solved(tx(L('Zwei Sätze geschrieben!', 'Two sentences written!'))));
      ctx.finish();
    }
    render();
  }

  function render(): void {
    sentence.textContent = words.length ? `${join(words)} …` : tx(L('(Satzanfang) …', '(start of sentence) …'));
    clear(options);
    for (const c of candidates(model, last())) {
      const label = c.word === END ? tx(L('. (Satzende)', '. (end)')) : c.word;
      const b = h('button', { class: 'kword', attrs: { type: 'button' } }, h('span', { class: 'kword__text', text: label }), h('span', { class: 'kword__p', text: ctx.percent(c.p) }));
      b.style.setProperty('--p', `${Math.round(c.p * 100)}%`);
      b.addEventListener('click', () => add(c.word));
      options.append(b);
    }
  }

  dice.addEventListener('click', () => {
    const next = candidates(model, last());
    if (next.length) add(sample(next, Math.random()));
  });
  auto.addEventListener('click', () => {
    for (let i = 0; i < 14; i++) {
      const next = candidates(model, last());
      if (!next.length) break;
      const w = sample(next, Math.random());
      add(w);
      if (w === END) break;
    }
  });
  reset.addEventListener('click', () => {
    words = [];
    render();
  });

  render();
};

export default game;
