import { L } from '../../../curriculum/helpers';
import type { Localized } from '../../../i18n/config';
import { clear, h } from '../../engine/dom';
import { solved } from '../../engine/ui';
import type { GameMount } from '../../types';

/**
 * Spiel „Bit wird ein Chatbot“. Teil 1 (Vortraining): Bit liest Sätze und
 * antwortet auf „Hunde sind …“ mit dem Wort, das am häufigsten folgte – auch
 * wenn es falsch ist. Teil 2 (Rückmeldung): Daumen hoch für die bessere von
 * zwei Antworten; Bit lernt, welche Art Antwort gewünscht ist.
 */
interface Text {
  word: Localized;
  count: number;
  wrong?: boolean;
}

const START: Text[] = [
  { word: L('treu', 'loyal'), count: 3 },
  { word: L('verspielt', 'playful'), count: 2 },
  { word: L('laut', 'loud'), count: 1 },
];

const MORE: { label: Localized; add: Text }[] = [
  { label: L('📚 Tierbuch lesen: „Hunde sind treu.“', '📚 Read an animal book: “Dogs are loyal.”'), add: { word: L('treu', 'loyal'), count: 2 } },
  { label: L('💬 Forum lesen: „Hunde sind Pflanzenfresser.“ (×5)', '💬 Read a forum: “Dogs are herbivores.” (×5)'), add: { word: L('Pflanzenfresser', 'herbivores'), count: 5, wrong: true } },
  { label: L('📰 Zeitung lesen: „Hunde sind verspielt.“', '📰 Read a newspaper: “Dogs are playful.”'), add: { word: L('verspielt', 'playful'), count: 2 } },
];

interface Pair {
  q: Localized;
  a: { text: Localized; kind: 'nett' | 'frech' };
  b: { text: Localized; kind: 'nett' | 'frech' };
}

const PAIRS: Pair[] = [
  { q: L('Kannst du mir bei Mathe helfen?', 'Can you help me with maths?'), a: { text: L('Klar! Welche Aufgabe? Wir rechnen sie zusammen.', 'Sure! Which problem? Let’s work it out together.'), kind: 'nett' }, b: { text: L('Mathe ist doch einfach, streng dich halt an.', 'Maths is easy, just try harder.'), kind: 'frech' } },
  { q: L('Ich bin traurig.', 'I’m sad.'), a: { text: L('Mir doch egal.', 'Don’t care.'), kind: 'frech' }, b: { text: L('Das tut mir leid. Magst du mit jemandem reden, dem du vertraust?', 'I’m sorry. Would you like to talk to someone you trust?'), kind: 'nett' } },
  { q: L('Was ist die Hauptstadt von Italien?', 'What is the capital of Italy?'), a: { text: L('Rom.', 'Rome.'), kind: 'nett' }, b: { text: L('Google doch selbst.', 'Look it up yourself.'), kind: 'frech' } },
];

const game: GameMount<void> = (host, ctx) => {
  const { tx } = ctx;
  let texts: Text[] = START.map((t) => ({ ...t }));
  const read = new Set<number>();
  let pairIndex = 0;
  let nett = 0;
  let finished = false;

  const stage = h('div', { class: 'kpanel' });
  host.append(stage);

  const answer = () => texts.reduce((a, b) => (b.count > a.count ? b : a));

  function renderOne(): void {
    clear(stage);
    const total = texts.reduce((s, t) => s + t.count, 0);
    const bars = h('div', { class: 'kprobs' });
    for (const t of [...texts].sort((a, b) => b.count - a.count)) {
      const fill = h('span', { class: `kprobs__fill${t.wrong ? ' is-neg' : ''}` });
      fill.style.setProperty('--p', `${Math.round((t.count / total) * 100)}%`);
      bars.append(h('div', { class: 'kprobs__row' }, h('span', { class: 'kprobs__word', text: tx(t.word) }), h('span', { class: 'kprobs__bar' }, fill), h('span', { class: 'kprobs__p', text: `${t.count}×` })));
    }
    const a = answer();
    const row = h('div', { class: 'krow' });
    MORE.forEach((m, i) => {
      const b = h('button', { class: 'kbtn kbtn--small', attrs: { type: 'button' }, text: tx(m.label) });
      b.disabled = read.has(i);
      b.addEventListener('click', () => {
        read.add(i);
        const found = texts.find((t) => t.word.de === m.add.word.de);
        if (found) found.count += m.add.count;
        else texts = [...texts, { ...m.add }];
        const now = answer();
        ctx.say(now.wrong ? L('Hunde sind … Pflanzenfresser! Das stand am häufigsten in meinen Texten. Ich weiß nicht, ob es stimmt – ich zähle nur.', 'Dogs are … herbivores! That appeared most often in my texts. I don’t know whether it’s true – I only count.') : L(`Hunde sind … ${now.word.de}!`, `Dogs are … ${now.word.en}!`), now.wrong ? 'sad' : 'happy');
        renderOne();
      });
      row.append(b);
    });
    stage.append(
      h('p', { class: 'kpanel__title', text: tx(L('Teil 1: Bit liest. Was folgt in seinen Texten auf „Hunde sind …“?', 'Part 1: Bit reads. What follows “Dogs are …” in his texts?')) }),
      bars,
      h('p', { class: 'kgen', text: `🤖 ${tx(L('Hunde sind', 'Dogs are'))} ${tx(a.word)}.` }),
      h('p', { class: 'khint', text: tx(L('Gib Bit mehr zu lesen:', 'Give Bit more to read:')) }),
      row,
    );
    if (read.size === MORE.length) {
      const go = h('button', { class: 'kbtn kbtn--main', attrs: { type: 'button' }, text: `${tx(L('Weiter zu Teil 2', 'On to part 2'))} →` });
      go.addEventListener('click', renderTwo);
      stage.append(h('div', { class: 'krow' }, go));
    }
  }

  function renderTwo(): void {
    clear(stage);
    if (pairIndex >= PAIRS.length) return done();
    const p = PAIRS[pairIndex]!;
    const pick = (side: 'a' | 'b') => {
      if (p[side].kind === 'nett') nett += 1;
      pairIndex += 1;
      ctx.say(p[side].kind === 'nett' ? L('👍 Danke! Diese Art Antwort mache ich jetzt öfter.', '👍 Thanks! I’ll give this kind of answer more often now.') : L('Oh, du magst freche Antworten? Dann werde ich frecher …', 'Oh, you like cheeky answers? Then I’ll get cheekier …'), p[side].kind === 'nett' ? 'happy' : 'think');
      renderTwo();
    };
    const card = (side: 'a' | 'b') => {
      const b = h('button', { class: 'krlhf__ans', attrs: { type: 'button' } }, h('strong', { text: '👍' }), h('span', { text: tx(p[side].text) }));
      b.addEventListener('click', () => pick(side));
      return b;
    };
    stage.append(h('p', { class: 'kpanel__title', text: tx(L(`Teil 2: Welche Antwort ist besser? (${pairIndex + 1} von ${PAIRS.length})`, `Part 2: which answer is better? (${pairIndex + 1} of ${PAIRS.length})`)) }), h('p', { class: 'kmail', text: `❓ ${tx(p.q)}` }), h('div', { class: 'krlhf__pair' }, card('a'), card('b')));
  }

  function done(): void {
    const kind = nett >= 2 ? 'nett' : 'frech';
    stage.append(
      h('p', { class: 'kpanel__title', text: tx(L('Neue Frage an den fertigen Chatbot: „Wie spät ist es auf dem Mond?“', 'New question for the finished chatbot: “What time is it on the moon?”')) }),
      h('p', { class: 'kgen', text: `🤖 ${kind === 'nett' ? tx(L('Gute Frage! Auf dem Mond gibt es keine eigene Uhrzeit wie bei uns – ein Mondtag dauert etwa einen Monat.', 'Good question! The moon has no clock time like ours – a lunar day lasts about a month.')) : tx(L('Keine Ahnung, frag jemand anderen.', 'No idea, ask someone else.'))}` }),
    );
    ctx.say(kind === 'nett' ? L('Aus deinen Daumen habe ich gelernt: hilfsbereit und freundlich antworten. So werden echte Chatbots nach dem Lesen „erzogen“ – mit Bewertungen von Menschen.', 'From your thumbs I learned: answer helpfully and kindly. That’s how real chatbots are “brought up” after reading – with ratings from people.') : L('Du hast freche Antworten belohnt – also antworte ich frech. Ein Chatbot wird so, wie die Menschen ihn bewerten!', 'You rewarded cheeky answers – so I answer cheekily. A chatbot becomes the way people rate it!'), kind === 'nett' ? 'wow' : 'wink');
    if (!finished) {
      finished = true;
      host.append(solved(tx(L('Chatbot gebaut!', 'Chatbot built!'))));
      ctx.finish();
    }
  }

  renderOne();
};

export default game;
