import type { Localized } from '../../../i18n/config';
import { clear, h } from '../../engine/dom';
import { meter, solved, stagger, stampCard } from '../../engine/ui';
import type { GameMount } from '../../types';

/**
 * Sortieren in mehrere Fächer: Eine Karte nach der anderen einem von zwei
 * bis vier Fächern zuordnen (z. B. Risikoklassen des AI Act). Nach jeder
 * Karte kommt die Begründung; am Ende die Übersicht nach Fächern.
 */
export interface SortBin {
  id: string;
  icon: string;
  label: Localized;
}

export interface SortItem {
  icon: string;
  text: Localized;
  bin: string;
  why: Localized;
}

export interface SortierenProps {
  bins: SortBin[];
  items: SortItem[];
  /** Satz am Ende; {n} = richtig, {total} = alle. */
  done: Localized;
}

const game: GameMount<SortierenProps> = (host, ctx, props) => {
  const { tx } = ctx;
  let index = 0;
  let right = 0;
  const score = meter(tx({ de: 'Richtig einsortiert', en: 'Sorted correctly' }));
  score.set(0, props.items.length, `0 / ${props.items.length}`);
  const stage = h('div', { class: 'kcard-stage' });
  host.append(h('div', { class: 'kpanel' }, stage, h('div', { class: 'khint' }, score.el)));
  const binOf = (id: string) => props.bins.find((b) => b.id === id)!;

  function show(): void {
    clear(stage);
    const item = props.items[index]!;
    const why = h('p', { class: 'kcard__why', attrs: { hidden: true } });
    const card = h('div', { class: 'kcard' }, h('span', { class: 'kcard__count', text: `${index + 1} / ${props.items.length}` }), h('span', { class: 'kcard__emoji', attrs: { 'aria-hidden': 'true' }, text: item.icon }), h('p', { class: 'kcard__text', text: tx(item.text) }), why);
    const next = h('button', { class: 'kbtn kbtn--main', attrs: { type: 'button', hidden: true }, text: index < props.items.length - 1 ? tx({ de: 'Nächste Karte →', en: 'Next card →' }) : tx({ de: 'Auswerten', en: 'See result' }) });
    const buttons = props.bins.map((bin) => {
      const b = h('button', { class: 'kbtn kcard__btn ksort__bin', attrs: { type: 'button' }, text: `${bin.icon} ${tx(bin.label)}` });
      b.addEventListener('click', () => {
        const ok = bin.id === item.bin;
        if (ok) right += 1;
        else ctx.mistake();
        for (const x of buttons) x.disabled = true;
        b.setAttribute('aria-pressed', 'true');
        card.classList.add(ok ? 'is-right' : 'is-wrong');
        stampCard(card, ok);
        const target = binOf(item.bin);
        why.textContent = `${ok ? '✓' : '✗'} ${target.icon} ${tx(target.label)}: ${tx(item.why)}`;
        why.hidden = false;
        ctx.say(item.why, ok ? 'happy' : 'think');
        score.set(right, props.items.length, `${right} / ${props.items.length}`);
        next.hidden = false;
        next.focus();
      });
      return b;
    });
    next.addEventListener('click', () => {
      index += 1;
      if (index < props.items.length) show();
      else end();
    });
    stage.append(card, h('div', { class: 'kcard__actions ksort__bins' }, ...buttons, next));
    if (index > 0) buttons[0]?.focus();
  }

  function end(): void {
    clear(stage);
    for (const bin of props.bins) {
      const items = props.items.filter((i) => i.bin === bin.id);
      if (items.length === 0) continue;
      stage.append(h('div', { class: 'kbox' }, h('p', { class: 'kbox__title', text: `${bin.icon} ${tx(bin.label)}` }), h('div', { class: 'kitems' }, ...items.map((i) => h('div', { class: 'kitem' }, h('span', { class: 'kitem__emoji', attrs: { 'aria-hidden': 'true' }, text: i.icon }), h('span', { text: tx(i.text) }))))));
    }
    stagger(stage.querySelectorAll<HTMLElement>('.kitem'));
    stage.append(solved(`${right} / ${props.items.length}`));
    ctx.say(tx(props.done).replace('{n}', String(right)).replace('{total}', String(props.items.length)), right === props.items.length ? 'wow' : 'happy');
    ctx.finish();
  }

  show();
};

export default game;
