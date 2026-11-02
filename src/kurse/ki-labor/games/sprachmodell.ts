import { clear, h, seeded } from '../../engine/dom';
import { solved } from '../../engine/ui';
import type { GameMount } from '../../types';
import { CORPUS, END, isCopied, nextDistribution, sample, train, type NGram } from '../../gemeinsam/models/ngramm';

/**
 * Spiel „Das nächste Token“: ein n-Gramm-Modell aus 18 Sätzen. Kontextlänge
 * (1 oder 2 Wörter) und Temperatur wählen, Wort für Wort ziehen oder ganze
 * Sätze erzeugen. Missionen: Text mit T ≈ 0, mit T ≥ 1,5 und mit langem
 * Kontext erzeugen; einen neuen, aber falschen Satz finden.
 */
const TEMPS = [0, 0.5, 1, 1.5, 2.5];

const game: GameMount<void> = (host, ctx) => {
  const { tx } = ctx;
  const rnd = seeded(Date.now() % 100000);
  let ctxLen = 1;
  let temp = 1;
  let model: NGram = train(CORPUS[ctx.lang], ctxLen + 1);
  let words: string[] = [];
  const done = { cold: false, hot: false, long: false, novel: false };
  let finished = false;

  const sentenceEl = h('p', { class: 'kgen', attrs: { 'aria-live': 'polite' } });
  const bars = h('div', { class: 'kprobs' });
  const ctxRow = h('div', { class: 'krow', attrs: { role: 'group', 'aria-label': tx({ de: 'Kontextlänge', en: 'Context length' }) } });
  const tRow = h('div', { class: 'krow', attrs: { role: 'group', 'aria-label': tx({ de: 'Temperatur', en: 'Temperature' }) } });
  const stepBtn = h('button', { class: 'kbtn kbtn--main', attrs: { type: 'button' }, text: `🎲 ${tx({ de: 'Nächstes Wort ziehen', en: 'Draw next word' })}` });
  const fullBtn = h('button', { class: 'kbtn kbtn--main', attrs: { type: 'button' }, text: `⏩ ${tx({ de: 'Ganzen Satz', en: 'Whole sentence' })}` });
  const newBtn = h('button', { class: 'kbtn', attrs: { type: 'button' }, text: `↺ ${tx({ de: 'Neuer Satz', en: 'New sentence' })}` });
  const verdict = h('p', { class: 'khint' });
  const history = h('ol', { class: 'ktrace' });
  const goals = h('ul', { class: 'kgoals' });
  const corpusBox = h('details', { class: 'kinfo' }, h('summary', { text: tx({ de: 'Trainingstext (18 Sätze)', en: 'Training text (18 sentences)' }) }), h('p', { text: CORPUS[ctx.lang].join(' ') }));
  host.append(
    h('div', { class: 'kpanel' }, sentenceEl, bars, h('div', { class: 'krow' }, stepBtn, fullBtn, newBtn), verdict),
    h('div', { class: 'kpanel kgrid-2' }, h('div', {}, h('p', { class: 'kpanel__title', text: tx({ de: 'Kontext: so viele vorige Wörter zählen', en: 'Context: this many previous words count' }) }), ctxRow, h('p', { class: 'kpanel__title', text: tx({ de: 'Temperatur T', en: 'Temperature T' }) }), tRow, corpusBox), h('div', {}, h('p', { class: 'kpanel__title', text: tx({ de: 'Deine Sätze', en: 'Your sentences' }) }), history)),
    h('div', { class: 'kpanel' }, goals),
  );

  const toggle = <T,>(row: HTMLElement, items: T[], get: () => T, label: (v: T) => string, set: (v: T) => void) => {
    clear(row);
    for (const v of items) {
      const b = h('button', { class: 'kbtn kbtn--small', attrs: { type: 'button', 'aria-pressed': String(v === get()) }, text: label(v) });
      b.addEventListener('click', () => {
        set(v);
        toggle(row, items, get, label, set);
        render();
      });
      row.append(b);
    }
  };
  toggle(ctxRow, [1, 2], () => ctxLen, (n) => tx(n === 1 ? { de: '1 Wort', en: '1 word' } : { de: '2 Wörter', en: '2 words' }), (n) => {
    ctxLen = n;
    model = train(CORPUS[ctx.lang], ctxLen + 1);
    words = [];
  });
  toggle(tRow, TEMPS, () => temp, (t) => (t === 0 ? '0' : ctx.num(t, 1)), (t) => (temp = t));

  function render(): void {
    sentenceEl.textContent = words.length ? `${words.join(' ')} …` : tx({ de: '(Satzanfang)', en: '(start of sentence)' });
    clear(bars);
    const dist = nextDistribution(model, words, temp).slice(0, 7);
    for (const c of dist) {
      const fill = h('span', { class: 'kprobs__fill' });
      fill.style.setProperty('--p', `${Math.round(c.p * 100)}%`);
      bars.append(h('div', { class: 'kprobs__row' }, h('span', { class: 'kprobs__word', text: c.word === END ? tx({ de: '(Ende)', en: '(end)' }) : c.word }), h('span', { class: 'kprobs__bar' }, fill), h('span', { class: 'kprobs__p', text: `${ctx.percent(c.p)} (${c.count}×)` })));
    }
    clear(goals);
    const item = (ok: boolean, text: string) => goals.append(h('li', { class: ok ? 'is-done' : '' }, `${ok ? '✅' : '⬜'} ${text}`));
    item(done.cold, tx({ de: 'Erzeuge einen ganzen Satz mit T = 0.', en: 'Generate a whole sentence with T = 0.' }));
    item(done.hot, tx({ de: 'Erzeuge einen ganzen Satz mit T ≥ 1,5.', en: 'Generate a whole sentence with T ≥ 1.5.' }));
    item(done.long, tx({ de: 'Erzeuge einen ganzen Satz mit 2 Wörtern Kontext.', en: 'Generate a whole sentence with 2 words of context.' }));
    item(done.novel, tx({ de: 'Erzeuge einen Satz, der nicht im Trainingstext steht.', en: 'Generate a sentence that isn’t in the training text.' }));
    if (!finished && done.cold && done.hot && done.long && done.novel) {
      finished = true;
      host.append(solved(tx({ de: 'Sprachmodell durchschaut!', en: 'Language model understood!' })));
      ctx.finish();
    }
  }

  function step(): boolean {
    const w = sample(nextDistribution(model, words, temp), rnd);
    if (w === END || words.length >= 16) {
      finishSentence();
      return false;
    }
    words.push(w);
    return true;
  }

  function finishSentence(): void {
    if (!words.length) return;
    const copied = isCopied(model, words);
    history.prepend(h('li', { text: `${words.join(' ')}.  [n = ${ctxLen + 1}, T = ${ctx.num(temp, 1)}] ${copied ? tx({ de: '– wörtlich aus dem Training', en: '– verbatim from training' }) : tx({ de: '– neu', en: '– new' })}` }));
    verdict.textContent = copied ? tx({ de: '📋 Diesen Satz gibt es genau so im Trainingstext.', en: '📋 This exact sentence is in the training text.' }) : tx({ de: '✨ Diesen Satz gibt es im Trainingstext nicht. Klingt er richtig? Ist er wahr?', en: '✨ This sentence isn’t in the training text. Does it sound right? Is it true?' });
    if (temp === 0) {
      if (!done.cold) ctx.say({ de: 'Bei T = 0 nimmt das Modell immer das häufigste Wort: Es kommt jedes Mal derselbe Satz heraus.', en: 'At T = 0 the model always takes the most frequent word: the same sentence comes out every time.' }, 'think');
      done.cold = true;
    }
    if (temp >= 1.5) {
      if (!done.hot) ctx.say({ de: 'Bei hoher Temperatur bekommen seltene Wörter mehr Chancen: abwechslungsreich, aber auch seltsamer.', en: 'At high temperature rare words get more chances: varied, but also stranger.' }, 'wink');
      done.hot = true;
    }
    if (ctxLen === 2) {
      if (!done.long) ctx.say({ de: 'Mit mehr Kontext klingen die Sätze besser – aber oft sind sie wörtlich aus dem Training kopiert. Das Modell hat dann einfach auswendig gelernt.', en: 'With more context the sentences sound better – but often they are copied verbatim from training. The model has simply memorised them.' }, 'think');
      done.long = true;
    }
    if (!copied && !done.novel) {
      done.novel = true;
      ctx.say({ de: `„${words.join(' ')}“ stand nirgends im Training. Das Modell setzt Stücke neu zusammen – flüssig, aber ohne zu prüfen, ob es stimmt. So entstehen „Halluzinationen“.`, en: `“${words.join(' ')}” appeared nowhere in training. The model recombines pieces – fluently, but without checking whether it’s true. That’s how “hallucinations” arise.` }, 'wow');
    }
    words = [];
  }

  stepBtn.addEventListener('click', () => {
    step();
    render();
  });
  fullBtn.addEventListener('click', () => {
    words = [];
    while (step());
    render();
  });
  newBtn.addEventListener('click', () => {
    words = [];
    verdict.textContent = '';
    render();
  });
  render();
};

export default game;
