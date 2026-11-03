import { h } from './dom';

/**
 * Wiederkehrende Bausteine der Spiele: Trefferbalken, Hinweis „Geschafft“.
 * Aussehen in src/styles/kurs.css.
 */
export interface Meter {
  el: HTMLElement;
  /** Wert setzen; `good` färbt den Balken grün. */
  set(value: number, total: number, text: string, good?: boolean): void;
}

export function meter(label: string, goal?: string): Meter {
  const value = h('span');
  const fill = h('span', { class: 'kmeter__fill' });
  const bar = h('div', { class: 'kmeter__bar', attrs: { role: 'progressbar', 'aria-label': label, 'aria-valuemin': 0 } }, fill);
  const el = h('div', { class: 'kmeter' }, h('div', { class: 'kmeter__label' }, h('span', { text: label }), value), bar, goal ? h('span', { class: 'kmeter__goal', text: goal }) : null);
  return {
    el,
    set(v, total, text, good = false) {
      value.textContent = text;
      fill.style.setProperty('--p', `${total > 0 ? Math.round((100 * v) / total) : 0}%`);
      bar.setAttribute('aria-valuemax', String(total));
      bar.setAttribute('aria-valuenow', String(v));
      bar.setAttribute('aria-valuetext', text);
      el.classList.toggle('is-good', good);
    },
  };
}

/** Grüner Hinweis unter einem Spiel. */
export function solved(text: string): HTMLElement {
  return h('p', { class: 'ksolved', attrs: { role: 'status' }, text: `✓ ${text}` });
}

/**
 * Karte bewerten (Kartenspiel, Sortieren): Stempel ✓/✗ springt auf, die
 * Karte neigt sich zur gewählten Seite (−1 links, 1 rechts, 0 nur nicken).
 * Die Bewegung steckt im CSS und entfällt bei „Bewegung reduzieren“.
 */
export function stampCard(card: HTMLElement, ok: boolean, side: -1 | 0 | 1 = 0): void {
  card.append(h('span', { class: 'kcard__stamp', attrs: { 'aria-hidden': 'true' }, text: ok ? '✓' : '✗' }));
  card.classList.add(side < 0 ? 'is-sent-a' : side > 0 ? 'is-sent-b' : 'is-sent');
}

/** Liste am Ende nacheinander einblenden (Verzögerung je Eintrag über --i). */
export function stagger(items: Iterable<HTMLElement>): void {
  let i = 0;
  for (const el of items) {
    el.style.setProperty('--i', String(i));
    el.classList.add('is-stagger');
    i += 1;
  }
}
