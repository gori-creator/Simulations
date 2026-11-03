import { clear, h } from '../../engine/dom';
import { solved } from '../../engine/ui';
import type { GameMount } from '../../types';
import { encode, initial, merge, topPairs } from '../models/bpe';

/**
 * Spiel „Tokens“: Byte-Pair-Encoding von Hand. In jeder Runde das häufigste
 * benachbarte Paar wählen (Anzahl gewichtet mit der Worthäufigkeit; bei
 * Gleichstand zählt jedes der häufigsten). Nach 6 Runden: eigene Wörter mit
 * den gelernten Verschmelzungen zerlegen.
 */
const ROUNDS = 6;

const game: GameMount<void> = (host, ctx) => {
  const { tx } = ctx;
  let words = initial(ctx.lang);
  const merges: [string, string][] = [];
  let showCounts = false;
  let finished = false;

  const wordsEl = h('div', { class: 'ktok-words' });
  const choices = h('div', { class: 'krow' });
  const vocab = h('p', { class: 'khint' });
  const status = h('p', { class: 'kpanel__title' });
  const countBtn = h('button', { class: 'kbtn kbtn--small', attrs: { type: 'button', 'aria-pressed': 'false' }, text: `🔢 ${tx({ de: 'Zählung zeigen', en: 'Show counts' })}` });
  const tryIn = h('input', { class: 'input', attrs: { type: 'text', maxlength: 40, 'aria-label': tx({ de: 'Eigenes Wort zerlegen', en: 'Split your own word' }), placeholder: tx({ de: 'Probier ein Wort, z. B. „gerechnet“', en: 'Try a word, e.g. “replayed”' }) } });
  const tryOut = h('p', { class: 'kformula' });
  const tryBox = h('div', { class: 'kpanel', attrs: { hidden: true } }, h('p', { class: 'kpanel__title', text: tx({ de: 'Dein Tokenizer: Tippe ein Wort', en: 'Your tokenizer: type a word' }) }), tryIn, tryOut);
  host.append(h('div', { class: 'kpanel' }, status, wordsEl, h('div', { class: 'krow' }, countBtn), choices, vocab), tryBox);

  const tokenChips = (seg: string[], fresh: string) => h('span', { class: 'ktok' }, ...seg.map((t) => h('span', { class: `ktok__t${t.length > 1 ? ' is-merged' : ''}${t === fresh ? ' is-new' : ''}`, text: t })));

  /** Wo kommt das Paar vor? Beim Zeigen auf einen Kandidaten leuchten alle Stellen auf – hilft beim Zählen. */
  function highlight(pair: [string, string] | null): void {
    for (const row of wordsEl.querySelectorAll<HTMLElement>('.ktok')) {
      const chips = [...row.children] as HTMLElement[];
      chips.forEach((c) => c.classList.remove('is-pair'));
      if (!pair) continue;
      for (let i = 0; i + 1 < chips.length; i++) {
        // wie beim Zählen: jede Stelle, auch überlappend
        if (chips[i]!.textContent === pair[0] && chips[i + 1]!.textContent === pair[1]) {
          chips[i]!.classList.add('is-pair');
          chips[i + 1]!.classList.add('is-pair');
        }
      }
    }
  }

  function render(fresh = ''): void {
    clear(wordsEl);
    for (const w of words) wordsEl.append(h('div', { class: 'ktok-row' }, tokenChips(w.seg, fresh), h('small', { text: `× ${w.count}` })));
    const total = words.reduce((s, w) => s + w.seg.length * w.count, 0);
    status.textContent = merges.length < ROUNDS ? tx({ de: `Runde ${merges.length + 1} von ${ROUNDS}: Welches Paar kommt am häufigsten vor? (Tokens im Text: ${total})`, en: `Round ${merges.length + 1} of ${ROUNDS}: which pair occurs most often? (tokens in the text: ${total})` }) : tx({ de: `Fertig! Tokens im Text: ${total} statt ${initial(ctx.lang).reduce((s, w) => s + w.seg.length * w.count, 0)} am Anfang.`, en: `Done! Tokens in the text: ${total} instead of ${initial(ctx.lang).reduce((s, w) => s + w.seg.length * w.count, 0)} at the start.` });
    vocab.textContent = merges.length ? `${tx({ de: 'Neue Tokens', en: 'New tokens' })}: ${merges.map((m) => m.join('')).join(', ')}` : '';
    clear(choices);
    if (merges.length >= ROUNDS) return;
    const top = topPairs(words);
    const best = top[0]!.count;
    // Kandidaten: alle häufigsten und ein paar weitere, gemischt nach Alphabet
    const shown = top.slice(0, 6).sort((a, b) => a.pair.join('').localeCompare(b.pair.join('')));
    for (const cand of shown) {
      const b = h('button', { class: 'kbtn', attrs: { type: 'button' }, text: `${cand.pair[0]} + ${cand.pair[1]}${showCounts ? ` (${cand.count})` : ''}` });
      b.addEventListener('pointerenter', () => highlight(cand.pair));
      b.addEventListener('focus', () => highlight(cand.pair));
      b.addEventListener('pointerleave', () => highlight(null));
      b.addEventListener('blur', () => highlight(null));
      b.addEventListener('click', () => {
        if (cand.count < best) {
          ctx.mistake();
          b.disabled = true;
          ctx.say({ de: `„${cand.pair.join('')}“ kommt ${cand.count}-mal vor – es gibt ein häufigeres Paar. Zähle mit den Häufigkeiten der Wörter!`, en: `“${cand.pair.join('')}” occurs ${cand.count} times – there is a more frequent pair. Count with the word frequencies!` }, 'think');
          return;
        }
        merges.push(cand.pair);
        words = merge(words, cand.pair);
        ctx.say({ de: `„${cand.pair.join('')}“ (${cand.count}-mal) wird ein Token.`, en: `“${cand.pair.join('')}” (${cand.count} times) becomes a token.` }, 'happy');
        render(cand.pair.join(''));
        if (merges.length >= ROUNDS) done();
      });
      choices.append(b);
    }
  }

  function done(): void {
    tryBox.hidden = false;
    const sample = ctx.lang === 'de' ? 'gerechnet' : 'replayed';
    tryOut.textContent = encode(sample, merges).join(' · ');
    if (!finished) {
      finished = true;
      ctx.say({ de: 'Häufige Wortteile wie Wortstämme und Endungen sind jetzt einzelne Tokens. Seltene Wörter werden in bekannte Stücke zerlegt – so kommt das Modell mit jedem Wort zurecht.', en: 'Frequent word parts like stems and endings are now single tokens. Rare words are split into known pieces – so the model can handle any word.' }, 'wow');
      host.append(solved(tx({ de: 'Tokenizer gebaut!', en: 'Tokenizer built!' })));
      ctx.finish();
    }
  }

  countBtn.addEventListener('click', () => {
    showCounts = !showCounts;
    countBtn.setAttribute('aria-pressed', String(showCounts));
    render();
  });
  tryIn.addEventListener('input', () => {
    const w = tryIn.value.toLowerCase().replace(/[^\p{L}]/gu, '');
    tryOut.textContent = w ? `${encode(w, merges).join(' · ')}   (${encode(w, merges).length} ${tx({ de: 'Tokens', en: 'tokens' })})` : '';
  });
  render();
};

export default game;
