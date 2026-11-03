import { L } from '../../../curriculum/helpers';
import type { Localized } from '../../../i18n/config';
import { clear, h, seeded } from '../../engine/dom';
import { solved, stagger } from '../../engine/ui';
import type { GameMount } from '../../types';
import { bubble, feed, mix, startWeights, TOPICS, watch, type Topic, type Weights } from '../models/feed';

/**
 * Spiel „Mein Feed“: Tippe Videos an, die du anschauen würdest. Der
 * Algorithmus lernt mit und zeigt mehr vom Gleichen – bis der Feed fast nur
 * noch ein Thema hat (Filterblase). Danach: Vielfalt-Regler.
 */
const INFO: Record<Topic, { icon: string; name: Localized; titles: Localized[] }> = {
  fussball: { icon: '⚽', name: L('Fußball', 'Football'), titles: [L('Die 10 besten Tore', 'The 10 best goals'), L('Trick-Schüsse', 'Trick shots'), L('Elfmeter-Drama', 'Penalty drama')] },
  tiere: { icon: '🐶', name: L('Tiere', 'Animals'), titles: [L('Welpe sieht zum ersten Mal Schnee', 'Puppy sees snow for the first time'), L('Katze gegen Gurke', 'Cat versus cucumber'), L('Lustige Ziegen', 'Funny goats')] },
  musik: { icon: '🎵', name: L('Musik', 'Music'), titles: [L('Neuer Song!', 'New song!'), L('Gitarre in 5 Minuten', 'Guitar in 5 minutes'), L('Live-Konzert', 'Live concert')] },
  gaming: { icon: '🎮', name: L('Spiele', 'Gaming'), titles: [L('Geheimes Level entdeckt', 'Secret level found'), L('Speedrun-Rekord', 'Speedrun record'), L('Lustige Fehler', 'Funny glitches')] },
  natur: { icon: '🌋', name: L('Natur', 'Nature'), titles: [L('Vulkan bricht aus', 'Volcano erupts'), L('Tiefsee-Monster', 'Deep-sea monsters'), L('Polarlichter', 'Northern lights')] },
  wissen: { icon: '🔬', name: L('Wissen', 'Science'), titles: [L('Warum ist der Himmel blau?', 'Why is the sky blue?'), L('Experiment mit Cola', 'Cola experiment'), L('Wie funktioniert KI?', 'How does AI work?')] },
};

const game: GameMount<void> = (host, ctx) => {
  const { tx } = ctx;
  const rnd = seeded(Date.now() % 3571);
  let w: Weights = startWeights();
  let variety = 0;
  let watched = 0;
  let sawBubble = false;
  let triedVariety = false;
  let finished = false;
  let items: Topic[] = feed(w, variety, 6, rnd);

  const feedEl = h('div', { class: 'kfeed' });
  const meterEl = h('div', { class: 'kprobs' });
  const status = h('p', { class: 'kvote', attrs: { 'aria-live': 'polite' } });
  const varietyBtn = h('button', { class: 'kbtn', attrs: { type: 'button', 'aria-pressed': 'false' }, text: `🌈 ${tx(L('Mehr Vielfalt einschalten', 'Turn on more variety'))}` });
  host.append(h('div', { class: 'kpanel kgrid-2' }, h('div', {}, h('p', { class: 'kpanel__title', text: tx(L('Dein Feed – tippe an, was du anschauen würdest', 'Your feed – tap what you would watch')) }), feedEl), h('div', {}, h('p', { class: 'kpanel__title', text: tx(L('Was der Algorithmus dir als Nächstes zeigt', 'What the algorithm shows you next')) }), meterEl, status, h('div', { class: 'krow' }, varietyBtn))));

  // Balken bleiben stehen und wachsen/schrumpfen fließend – so sieht man den Algorithmus lernen
  const rows = new Map(
    TOPICS.map((t) => {
      const fill = h('span', { class: 'kprobs__fill kprobs__fill--slow' });
      const pct = h('span', { class: 'kprobs__p' });
      meterEl.append(h('div', { class: 'kprobs__row' }, h('span', { class: 'kprobs__word', text: `${INFO[t].icon} ${tx(INFO[t].name)}` }), h('span', { class: 'kprobs__bar' }, fill), pct));
      return [t, { fill, pct }] as const;
    }),
  );

  function render(): void {
    clear(feedEl);
    items.forEach((t, i) => {
      const info = INFO[t];
      const title = info.titles[(i + watched) % info.titles.length]!;
      const b = h('button', { class: 'kfeed__item', attrs: { type: 'button' } }, h('span', { class: 'kfeed__icon', attrs: { 'aria-hidden': 'true' }, text: info.icon }), h('span', {}, h('strong', { text: tx(title) }), h('small', { text: tx(info.name) })));
      b.addEventListener('click', () => {
        w = watch(w, t);
        watched += 1;
        items = feed(w, variety, 6, rnd);
        render();
      });
      feedEl.append(b);
    });
    stagger(feedEl.children as HTMLCollectionOf<HTMLElement>);
    const m = mix(w, variety);
    const top = TOPICS.reduce((a, b) => (m[b] > m[a] ? b : a));
    for (const t of TOPICS) {
      const row = rows.get(t)!;
      row.fill.style.setProperty('--p', `${Math.round(m[t] * 100)}%`);
      row.fill.classList.toggle('is-top', t === top);
      row.pct.textContent = ctx.percent(m[t]);
    }
    const b = bubble(w, variety);
    status.textContent = tx(L(`Angeschaut: ${watched} · Größtes Thema: ${ctx.percent(b)} deines Feeds`, `Watched: ${watched} · Biggest topic: ${ctx.percent(b)} of your feed`));
    if (!sawBubble && b >= 0.6 && variety === 0) {
      sawBubble = true;
      ctx.say(L('Siehst du? Weil du etwas angeschaut hast, zeigt dir der Algorithmus immer mehr davon. Bald siehst du fast nichts anderes mehr – das nennt man Filterblase.', 'See? Because you watched something, the algorithm shows you more and more of it. Soon you hardly see anything else – that’s called a filter bubble.'), 'wow');
    }
    if (variety > 0 && sawBubble && !triedVariety) {
      triedVariety = true;
      ctx.say(L('Mit Vielfalt mischt der Algorithmus andere Themen dazu. Manche Apps lassen dich das einstellen – oder du suchst selbst gezielt nach Neuem.', 'With variety the algorithm mixes in other topics. Some apps let you set this – or you look for new things yourself on purpose.'), 'happy');
    }
    if (!finished && sawBubble && triedVariety) {
      finished = true;
      host.append(solved(tx(L('Filterblase durchschaut!', 'Filter bubble seen through!'))));
      ctx.finish();
    }
  }

  varietyBtn.addEventListener('click', () => {
    variety = variety ? 0 : 0.5;
    varietyBtn.setAttribute('aria-pressed', String(variety > 0));
    items = feed(w, variety, 6, rnd);
    render();
  });

  render();
};

export default game;
