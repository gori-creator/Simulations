import { L } from '../../../curriculum/helpers';
import { clear, h, s } from '../../engine/dom';
import { solved } from '../../engine/ui';
import type { GameMount } from '../../types';
import { analogy, WORDS } from '../../gemeinsam/models/vektoren';
import { groupAt, KNOWN, NEW_WORDS, type MapWord } from '../models/wortkarte';
import { scatter, sx, sy } from '../parts/scatter';

/**
 * Spiel „Die Wörter-Landkarte“: Bekannte Wörter haben ihren Platz. Vier neue
 * Wörter soll man in die richtige Gegend tippen. Danach Wörter-Rechnen:
 * König − Mann + Frau = ?
 */
const game: GameMount<void> = (host, ctx) => {
  const { tx } = ctx;
  let index = 0;
  const placed: string[] = [];
  let mathDone = false;
  let finished = false;

  const plot = scatter(tx(L('Wörter-Landkarte', 'Word map')), tx(L('Richtung 1', 'direction 1')), tx(L('Richtung 2', 'direction 2')));
  const prompt = h('p', { class: 'kvote', attrs: { 'aria-live': 'polite' } });
  const math = h('div', { class: 'kpanel', attrs: { hidden: true } });
  // Auch ohne Maus spielbar: Die vier Gegenden gibt es zusätzlich als Knöpfe
  // (beschriftet mit den Wörtern, die dort wohnen – wie auf der Karte).
  const areas = h('div', { class: 'krow', attrs: { role: 'group', 'aria-label': tx(L('Gegend wählen', 'Choose an area')) } });
  for (const group of ['tiere', 'essen', 'fahrzeuge', 'wetter'] as const) {
    const home = KNOWN.filter((w) => w.group === group);
    const b = h('button', { class: 'kbtn', attrs: { type: 'button', 'aria-label': tx(L(`Zu ${home.map((w) => w.name.de).join(', ')}`, `Next to ${home.map((w) => w.name.en).join(', ')}`)) }, text: `${tx(L('bei', 'near'))} ${home.map((w) => w.icon).join(' ')}` });
    b.addEventListener('click', () => place(group));
    areas.append(b);
  }
  host.append(h('div', { class: 'kpanel' }, prompt, plot.svg, h('p', { class: 'khint', text: tx(L('Tippe auf die Karte, wo das neue Wort hingehört – oder wähle die Gegend mit einem Knopf.', 'Tap the map where the new word belongs – or choose the area with a button.')) }), areas), math);

  function draw(): void {
    clear(plot.points);
    for (const w of KNOWN) plot.points.append(s('text', { class: 'kmapw', x: sx(w.x), y: sy(w.y) + 7, 'text-anchor': 'middle' }, w.icon), s('text', { class: 'kmapw__label', x: sx(w.x), y: sy(w.y) + 24, 'text-anchor': 'middle' }, tx(w.name)));
    // Richtig eingeordnete Wörter rücken an ihren Platz auf Bits Karte.
    for (const id of placed) {
      const w = NEW_WORDS.find((x) => x.id === id)!;
      plot.points.append(s('text', { class: 'kmapw is-new', x: sx(w.x), y: sy(w.y) + 7, 'text-anchor': 'middle' }, w.icon), s('text', { class: 'kmapw__label is-new', x: sx(w.x), y: sy(w.y) + 24, 'text-anchor': 'middle' }, tx(w.name)));
    }
    const next = NEW_WORDS[index];
    prompt.textContent = next ? tx(L(`Wo wohnt „${next.name.de}“ ${next.icon}?`, `Where does “${next.name.en}” ${next.icon} live?`)) : tx(L('Alle neuen Wörter haben einen Platz!', 'All new words have a place!'));
  }

  function place(group: MapWord['group']): void {
    const next = NEW_WORDS[index];
    if (!next) return;
    if (group === next.group) {
      placed.push(next.id);
      index += 1;
      ctx.say(L(`Ja! „${next.name.de}“ passt zu seinen Nachbarn – in Texten kommt es in ähnlichen Sätzen vor.`, `Yes! “${next.name.en}” fits with its neighbours – in texts it appears in similar sentences.`), 'happy');
      draw();
      if (index === NEW_WORDS.length) {
        areas.hidden = true;
        showMath();
      }
    } else {
      ctx.mistake();
      ctx.say(L(`Hm, dort wohnen ganz andere Wörter. Wozu passt „${next.name.de}“?`, `Hmm, quite different words live there. What does “${next.name.en}” go with?`), 'think');
    }
  }

  plot.svg.addEventListener('click', (event: MouseEvent) => {
    const w = plot.toWorld(event as PointerEvent);
    place(groupAt(w.x, w.y));
  });

  function showMath(): void {
    math.hidden = false;
    clear(math);
    const target = analogy('koenig', 'mann', 'frau').word.id;
    const options = ['prinz', 'koenigin', 'katze'].map((id) => WORDS.find((w) => w.id === id)!);
    math.append(h('p', { class: 'kpanel__title', text: tx(L('Wörter-Rechnen: Für mich ist jedes Wort eine Liste von Zahlen. Damit kann ich sogar rechnen!', 'Word maths: to me every word is a list of numbers. I can even calculate with them!')) }), h('p', { class: 'kformula', text: `🤴 ${tx(L('König', 'king'))} − 👨 ${tx(L('Mann', 'man'))} + 👩 ${tx(L('Frau', 'woman'))} = ?` }));
    const row = h('div', { class: 'krow' });
    for (const o of options) {
      const b = h('button', { class: 'kbtn', attrs: { type: 'button' }, text: `${o.icon} ${tx(o.name)}` });
      b.addEventListener('click', () => {
        if (mathDone) return;
        if (o.id !== target) {
          ctx.mistake();
          b.disabled = true;
          ctx.say(L('Nicht ganz. Was bleibt vom König, wenn man „Mann“ abzieht und „Frau“ dazutut?', 'Not quite. What’s left of a king if you take away “man” and add “woman”?'), 'think');
          return;
        }
        mathDone = true;
        b.classList.add('is-right');
        ctx.say(L('Königin! Der Unterschied zwischen „Mann“ und „Frau“ ist für mich eine Richtung auf der Karte – und die gilt auch für König und Königin.', 'Queen! The difference between “man” and “woman” is a direction on the map to me – and it works for king and queen too.'), 'wow');
        if (!finished) {
          finished = true;
          host.append(solved(tx(L('Wörter-Landkarte verstanden!', 'Word map understood!'))));
          ctx.finish();
        }
      });
      row.append(b);
    }
    math.append(row);
  }

  draw();
};

export default game;
