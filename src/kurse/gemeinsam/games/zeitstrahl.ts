import type { Localized } from '../../../i18n/config';
import { clear, h, shuffle } from '../../engine/dom';
import { meter, solved } from '../../engine/ui';
import type { GameMount } from '../../types';

/**
 * Zeitstrahl: Ereignisse vom ältesten zum neuesten antippen. Wer ein jüngeres
 * Ereignis zu früh wählt, bekommt einen Hinweis (zählt als Fehler, wenn
 * `scored` nicht `false` ist). Die Jahreszahl erscheint erst auf dem Strahl.
 */
export interface TimelineEvent {
  year: number;
  icon: string;
  text: Localized;
}

export interface ZeitstrahlProps {
  events: TimelineEvent[];
  scored?: boolean;
  done: Localized;
}

const game: GameMount<ZeitstrahlProps> = (host, ctx, props) => {
  const { tx } = ctx;
  const sorted = [...props.events].sort((a, b) => a.year - b.year);
  let pool = shuffle(props.events);
  const placed: TimelineEvent[] = [];
  const progress = meter(tx({ de: 'Auf dem Zeitstrahl', en: 'On the timeline' }));
  const line = h('ol', { class: 'ktimeline', attrs: { 'aria-label': tx({ de: 'Zeitstrahl', en: 'Timeline' }) } });
  const cards = h('div', { class: 'kitems ktimeline__pool' });
  host.append(
    h('div', { class: 'kpanel' }, h('p', { class: 'kpanel__title', text: tx({ de: 'Tippe die Ereignisse vom ältesten zum neuesten an.', en: 'Tap the events from oldest to newest.' }) }), line),
    h('div', { class: 'kpanel' }, cards, h('div', { class: 'khint' }, progress.el)),
  );

  function render(): void {
    clear(line);
    for (const e of placed) line.append(h('li', { class: 'ktimeline__item' }, h('span', { class: 'ktimeline__year', text: String(e.year) }), h('span', { class: 'ktimeline__icon', attrs: { 'aria-hidden': 'true' }, text: e.icon }), h('span', { text: tx(e.text) })));
    if (placed.length === 0) line.append(h('li', { class: 'ktimeline__empty', text: tx({ de: 'Noch leer – was kam zuerst?', en: 'Still empty – what came first?' }) }));
    clear(cards);
    for (const e of pool) {
      const b = h('button', { class: 'kitem', attrs: { type: 'button' } }, h('span', { class: 'kitem__emoji', attrs: { 'aria-hidden': 'true' }, text: e.icon }), h('span', { text: tx(e.text) }));
      b.addEventListener('click', () => pick(e, b));
      cards.append(b);
    }
    progress.set(placed.length, sorted.length, `${placed.length} / ${sorted.length}`, placed.length === sorted.length);
  }

  function pick(e: TimelineEvent, button: HTMLButtonElement): void {
    const oldest = pool.reduce((a, b) => (b.year < a.year ? b : a));
    if (e.year === oldest.year) {
      placed.push(e);
      pool = pool.filter((x) => x !== e);
      ctx.say({ de: `${e.year}: richtig!`, en: `${e.year}: correct!` }, 'happy');
      render();
      if (pool.length === 0) {
        cards.append(solved(tx({ de: 'Zeitstrahl komplett!', en: 'Timeline complete!' })));
        ctx.say(props.done, 'wow');
        ctx.finish();
      } else {
        cards.querySelector<HTMLButtonElement>('button')?.focus();
      }
      return;
    }
    if (props.scored !== false) ctx.mistake();
    button.classList.add('is-wrong');
    button.disabled = true;
    window.setTimeout(() => {
      button.classList.remove('is-wrong');
      button.disabled = false;
    }, 900);
    ctx.say({ de: 'Das kam später. Es gibt noch etwas Älteres.', en: 'That came later. There is something older.' }, 'think');
  }

  render();
};

export default game;
