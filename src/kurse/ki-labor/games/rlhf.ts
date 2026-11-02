import { clear, h } from '../../engine/dom';
import { solved } from '../../engine/ui';
import type { GameMount } from '../../types';
import { CHECKS, FEATURES, fitReward, lengthLover, PAIRS, reward, type Pair, type Preference } from '../models/belohnung';

/**
 * Spiel „Vom Modell zum Assistenten“: Du bewertest Antwortpaare. Aus deinen
 * Vorlieben lernt ein Belohnungsmodell Gewichte für Merkmale (stimmt, hilft,
 * höflich, ehrlich, Länge). Dann entscheidet es bei neuen Fragen. Zum Schluss:
 * Was lernt es von einem Bewerter, der einfach lange Antworten mag?
 */
const game: GameMount<void> = (host, ctx) => {
  const { tx } = ctx;
  const prefs: Preference[] = [];
  let index = 0;
  let finished = false;

  const stage = h('div', { class: 'kpanel' });
  host.append(stage);

  const weightBars = (theta: number[]) => {
    const max = Math.max(1, ...theta.map(Math.abs));
    return h(
      'div',
      { class: 'kprobs kprobs--wide' },
      ...theta.map((t, i) => {
        const fill = h('span', { class: `kprobs__fill${t < 0 ? ' is-neg' : ''}` });
        fill.style.setProperty('--p', `${Math.round((Math.abs(t) / max) * 100)}%`);
        return h('div', { class: 'kprobs__row' }, h('span', { class: 'kprobs__word', text: tx(FEATURES[i]!) }), h('span', { class: 'kprobs__bar' }, fill), h('span', { class: 'kprobs__p', text: ctx.num(t, 2) }));
      }),
    );
  };

  const checkCards = (theta: number[]) =>
    h(
      'div',
      { class: 'krlhf__checks' },
      ...CHECKS.map((c: Pair) => {
        const ra = reward(theta, c.a);
        const rb = reward(theta, c.b);
        const pick = ra >= rb ? c.a : c.b;
        return h('div', { class: 'kbox' }, h('p', { class: 'kbox__title', text: `❓ ${tx(c.prompt)}` }), h('p', { text: `🤖 ${tx(pick.text)}` }), h('p', { class: 'khint', text: tx({ de: `Belohnung: ${ctx.num(Math.max(ra, rb), 2)} gegen ${ctx.num(Math.min(ra, rb), 2)}`, en: `Reward: ${ctx.num(Math.max(ra, rb), 2)} vs ${ctx.num(Math.min(ra, rb), 2)}` }) }));
      }),
    );

  function showPair(): void {
    clear(stage);
    const pair = PAIRS[index]!;
    const card = (side: 'a' | 'b') =>
      h(
        'button',
        { class: 'krlhf__ans', attrs: { type: 'button' } },
        h('strong', { text: side === 'a' ? 'A' : 'B' }),
        h('span', { text: tx(pair[side].text) }),
      );
    const a = card('a');
    const b = card('b');
    const choose = (side: 'a' | 'b') => {
      prefs.push(side === 'a' ? { better: pair.a, worse: pair.b } : { better: pair.b, worse: pair.a });
      index += 1;
      if (index < PAIRS.length) showPair();
      else showModel();
    };
    a.addEventListener('click', () => choose('a'));
    b.addEventListener('click', () => choose('b'));
    stage.append(h('p', { class: 'kpanel__title', text: tx({ de: `Vergleich ${index + 1} von ${PAIRS.length}: Welche Antwort ist besser?`, en: `Comparison ${index + 1} of ${PAIRS.length}: which answer is better?` }) }), h('p', { class: 'kmail', text: `❓ ${tx(pair.prompt)}` }), h('div', { class: 'krlhf__pair' }, a, b));
    a.focus();
  }

  function showModel(): void {
    clear(stage);
    const theta = fitReward(prefs);
    const next = h('button', { class: 'kbtn kbtn--main', attrs: { type: 'button' }, text: `${tx({ de: 'Und wenn jemand anders bewertet hätte?', en: 'And what if someone else had rated?' })} →` });
    next.addEventListener('click', showHacking);
    stage.append(
      h('p', { class: 'kpanel__title', text: tx({ de: 'Was das Belohnungsmodell aus deinen Vorlieben gelernt hat (Gewichte θ):', en: 'What the reward model learned from your preferences (weights θ):' }) }),
      weightBars(theta),
      h('p', { class: 'kpanel__title', text: tx({ de: 'Neue Fragen – welche Antwort belohnt das Modell?', en: 'New questions – which answer does the model reward?' }) }),
      checkCards(theta),
      h('div', { class: 'krow' }, next),
    );
    ctx.say({ de: 'Aus nur sechs Vergleichen hat das Modell gelernt, worauf du Wert legst – und wendet das auf neue Fragen an. Beim echten RLHF sind es Hunderttausende Vergleiche, und das Sprachmodell wird dann so trainiert, dass es hohe Belohnung bekommt.', en: 'From only six comparisons the model learned what you value – and applies it to new questions. In real RLHF there are hundreds of thousands of comparisons, and the language model is then trained to earn high reward.' }, 'wow');
    next.focus();
  }

  function showHacking(): void {
    clear(stage);
    const theta = fitReward(lengthLover(PAIRS));
    stage.append(
      h('p', { class: 'kpanel__title', text: tx({ de: 'Ein Bewerter, der einfach immer die längere Antwort wählt:', en: 'A rater who simply always picks the longer answer:' }) }),
      weightBars(theta),
      checkCards(theta),
    );
    ctx.say({ de: 'Jetzt gewinnt die lange, falsche Antwort mit den „zwölf Kontinenten“! Das Modell optimiert die Belohnung, nicht die Wahrheit. Das nennt man Belohnungs-Hacking – ein echtes Problem.', en: 'Now the long, wrong answer about “twelve continents” wins! The model optimises the reward, not the truth. This is called reward hacking – a real problem.' }, 'sad');
    if (!finished) {
      finished = true;
      stage.append(solved(tx({ de: 'Belohnungsmodell trainiert – und ausgetrickst!', en: 'Reward model trained – and tricked!' })));
      ctx.finish();
    }
  }

  showPair();
};

export default game;
