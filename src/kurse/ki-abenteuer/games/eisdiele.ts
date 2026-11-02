import { L } from '../../../curriculum/helpers';
import { clear, h, seeded } from '../../engine/dom';
import { solved } from '../../engine/ui';
import type { GameMount } from '../../types';
import { averageEpsilon, averageSticky, pull } from '../../gemeinsam/models/bandit';

/**
 * Spiel „Ausprobieren oder Bewährtes?“: Drei Eisdielen, unbekannt, wie oft das
 * Eis lecker ist. 20 Tage lang wählt man eine Eisdiele. Danach vergleicht Bit
 * drei Strategien: beim ersten leckeren Eis bleiben, immer zufällig, meistens
 * die bisher beste und ab und zu zufällig (ε-gierig).
 */
const SHOPS = [
  { icon: '🍨', name: L('Eis-Ecke', 'Ice Corner'), p: 0.4 },
  { icon: '🍦', name: L('Gelato Sole', 'Gelato Sole'), p: 0.8 },
  { icon: '🧁', name: L('Kühle Kugel', 'Cool Scoop'), p: 0.5 },
];
const DAYS = 20;

const game: GameMount<void> = (host, ctx) => {
  const { tx } = ctx;
  const rnd = seeded(Date.now() % 7777);
  const tries = SHOPS.map(() => ({ n: 0, yum: 0 }));
  let day = 0;
  let total = 0;
  let finished = false;

  const shops = h('div', { class: 'kbandit' });
  const status = h('p', { class: 'kvote', attrs: { 'aria-live': 'polite' } });
  const compare = h('div', { class: 'kpanel', attrs: { hidden: true } });
  host.append(h('div', { class: 'kpanel' }, shops, status), compare);

  function render(): void {
    clear(shops);
    SHOPS.forEach((shop, i) => {
      const t = tries[i]!;
      const b = h('button', { class: 'kbandit__arm', attrs: { type: 'button' } }, h('span', { class: 'kbandit__icon', attrs: { 'aria-hidden': 'true' }, text: shop.icon }), h('strong', { text: tx(shop.name) }), h('span', { text: t.n ? `${'😋'.repeat(t.yum)}${'😖'.repeat(t.n - t.yum)}` : tx(L('noch nie probiert', 'never tried')) }));
      b.disabled = day >= DAYS;
      b.addEventListener('click', () => {
        const yum = pull(shop.p, rnd);
        t.n += 1;
        t.yum += yum;
        total += yum;
        day += 1;
        ctx.say(yum ? L(`${shop.icon} Lecker!`, `${shop.icon} Yummy!`) : L(`${shop.icon} Bäh, heute nicht so gut.`, `${shop.icon} Yuck, not great today.`), yum ? 'happy' : 'sad');
        render();
        if (day >= DAYS) end();
      });
      shops.append(b);
    });
    status.textContent = day < DAYS ? tx(L(`Tag ${day + 1} von ${DAYS}: Welche Eisdiele heute? Leckere Eis bisher: ${total}`, `Day ${day + 1} of ${DAYS}: which shop today? Yummy ice creams so far: ${total}`)) : tx(L(`Fertig! ${total} leckere Eis in ${DAYS} Tagen.`, `Done! ${total} yummy ice creams in ${DAYS} days.`));
  }

  function end(): void {
    compare.hidden = false;
    const probs = SHOPS.map((s) => s.p);
    const same = averageSticky(probs, DAYS, 2000, rnd);
    const random = averageEpsilon(probs, DAYS, 1, 2000, rnd);
    const smart = averageEpsilon(probs, DAYS, 0.1, 2000, rnd);
    const row = (icon: string, text: string, v: number) => h('li', {}, `${icon} ${text}: ${tx(L('im Schnitt', 'on average'))} ${ctx.num(v, 1)}`);
    clear(compare);
    compare.append(
      h('p', { class: 'kpanel__title', text: tx(L('So hätten drei Strategien abgeschnitten (viele Durchläufe):', 'How three strategies would have done (many runs):')) }),
      h('ul', { class: 'kscore' }, row('🔁', tx(L('Beim ersten leckeren Eis bleiben', 'Stick with the first yummy ice cream')), same), row('🎲', tx(L('Jeden Tag zufällig', 'Random every day')), random), row('🧠', tx(L('Jede einmal probieren, dann meistens die bisher beste – und ab und zu zufällig', 'Try each once, then mostly the best so far – and now and then at random')), smart)),
      h('p', { class: 'khint', text: tx(L(`Die Wahrheit: ${SHOPS.map((s) => `${s.icon} ${ctx.percent(s.p)}`).join(' · ')} leckere Tage.`, `The truth: ${SHOPS.map((s) => `${s.icon} ${ctx.percent(s.p)}`).join(' · ')} yummy days.`)) }),
    );
    ctx.say(L('Am besten ist eine Mischung: meistens das Bewährte, ab und zu etwas Neues ausprobieren. Genau so lernen auch Maschinen durch Belohnung.', 'The best is a mix: mostly what works, and now and then trying something new. That’s exactly how machines learn from rewards.'), 'wow');
    if (!finished) {
      finished = true;
      host.append(solved(tx(L('Eis-Strategie gefunden!', 'Ice cream strategy found!'))));
      ctx.finish();
    }
  }

  render();
};

export default game;
