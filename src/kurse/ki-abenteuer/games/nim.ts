import { clear, h } from '../../engine/dom';
import { solved } from '../../engine/ui';
import type { GameMount } from '../../types';
import { bitMove, moves, winningTake } from '../../gemeinsam/models/nim';

/**
 * Spiel „Bit rechnet voraus“: Steine-Spiel gegen Bit. Wer den letzten Stein
 * nimmt, gewinnt; je Zug 1 bis 3 Steine. Runde 1: Bit schaut nur einen Zug
 * voraus. Danach rechnet er alle Möglichkeiten durch (wie ein Schachcomputer).
 * Ziel: Bit auch dann schlagen – mit dem Vierer-Trick. Nach Niederlagen
 * kommen Tipps.
 */
const START = 10;

const game: GameMount<void> = (host, ctx) => {
  const { tx } = ctx;
  let stones = START;
  let mode: 'kurz' | 'voll' = 'kurz';
  let losses = 0;
  let busy = false;
  let finished = false;
  let timer = 0;

  const modeEl = h('p', { class: 'kpanel__title' });
  const pile = h('div', { class: 'knim__pile', attrs: { role: 'img' } });
  const status = h('p', { class: 'kvote', attrs: { 'aria-live': 'polite' } });
  const buttons = h('div', { class: 'krow knim__take' });
  const log = h('ol', { class: 'ktrace' });
  const again = h('button', { class: 'kbtn', attrs: { type: 'button', hidden: true }, text: `↺ ${tx({ de: 'Neue Runde', en: 'New round' })}` });
  host.append(h('div', { class: 'kpanel' }, modeEl, pile, status, buttons, h('div', { class: 'krow' }, again)), h('div', { class: 'kpanel' }, h('p', { class: 'kpanel__title', text: tx({ de: 'Spielverlauf', en: 'Moves so far' }) }), log));

  const hint = (): number => (mode === 'voll' && losses >= 3 ? winningTake(stones) : 0);

  function render(): void {
    modeEl.textContent = mode === 'kurz' ? `🙂 ${tx({ de: 'Runde 1: Bit schaut nur einen Zug voraus', en: 'Round 1: Bit only looks one move ahead' })}` : `🧠 ${tx({ de: 'Bit rechnet jetzt alle Möglichkeiten durch', en: 'Bit now calculates every possibility' })}`;
    clear(pile);
    for (let i = 0; i < stones; i++) pile.append(h('span', { class: 'knim__stone', attrs: { 'aria-hidden': 'true' } }));
    pile.setAttribute('aria-label', tx({ de: `${stones} Steine übrig`, en: `${stones} stones left` }));
    clear(buttons);
    const tip = hint();
    for (const k of moves(stones)) {
      const b = h('button', { class: `kbtn kbtn--main${tip === k ? ' is-hint' : ''}`, attrs: { type: 'button' }, text: tx({ de: `${k} nehmen`, en: `take ${k}` }) });
      b.disabled = busy;
      b.addEventListener('click', () => playerTakes(k));
      buttons.append(b);
    }
    if (stones === 0) clear(buttons);
  }

  function entry(text: string): void {
    log.append(h('li', { text }));
  }

  function playerTakes(k: number): void {
    if (busy || stones === 0) return;
    stones -= k;
    entry(tx({ de: `Du nimmst ${k} → ${stones} übrig`, en: `You take ${k} → ${stones} left` }));
    if (stones === 0) return end(true);
    busy = true;
    render();
    status.textContent = `🤖 ${tx({ de: 'Bit rechnet …', en: 'Bit is calculating …' })}`;
    timer = window.setTimeout(() => {
      const { take, nodes } = bitMove(stones, mode);
      stones -= take;
      busy = false;
      entry(tx({ de: `Bit nimmt ${take} → ${stones} übrig (${nodes} Stellungen durchgerechnet)`, en: `Bit takes ${take} → ${stones} left (${nodes} positions calculated)` }));
      if (stones === 0) return end(false);
      status.textContent = mode === 'voll' ? tx({ de: `Bit hat ${nodes} mögliche Stellungen im Kopf durchgespielt. Du bist dran.`, en: `Bit played through ${nodes} possible positions in his head. Your turn.` }) : tx({ de: 'Du bist dran.', en: 'Your turn.' });
      render();
      buttons.querySelector<HTMLButtonElement>('button')?.focus();
    }, ctx.reducedMotion ? 0 : 700);
  }

  function end(playerWon: boolean): void {
    busy = false;
    render();
    again.hidden = false;
    if (playerWon && mode === 'kurz') {
      status.textContent = `🎉 ${tx({ de: 'Gewonnen! Bit hat nicht weit genug gedacht.', en: 'You won! Bit didn’t think far enough ahead.' })}`;
      ctx.say({ de: 'Na gut, jetzt rechne ich ALLES durch. Wie ein Schachcomputer. Noch eine Runde!', en: 'All right, now I’ll calculate EVERYTHING. Like a chess computer. One more round!' }, 'wink');
      mode = 'voll';
    } else if (playerWon) {
      status.textContent = `🏆 ${tx({ de: 'Du hast Bit geschlagen, obwohl er alles durchgerechnet hat!', en: 'You beat Bit even though he calculated everything!' })}`;
      if (!finished) {
        finished = true;
        ctx.say({ de: 'Wow! Du hast den Trick gefunden: Lass mir immer 4 oder 8 Steine. Dann kann ich rechnen, so viel ich will.', en: 'Wow! You found the trick: always leave me 4 or 8 stones. Then I can calculate as much as I like.' }, 'wow');
        host.append(solved(tx({ de: 'Bit geschlagen!', en: 'Bit beaten!' })));
        ctx.finish();
      }
    } else {
      status.textContent = `🤖 ${tx({ de: 'Bit hat den letzten Stein genommen.', en: 'Bit took the last stone.' })}`;
      if (mode === 'voll' && !finished) {
        losses += 1;
        if (losses <= 3) ctx.mistake();
        const tips = [
          { de: 'Ich habe alle Zugfolgen ausprobiert, bevor ich gezogen habe. Versuch’s nochmal!', en: 'I tried every sequence of moves before moving. Try again!' },
          { de: 'Tipp: Achte darauf, wie viele Steine du mir übrig lässt. Bei 4 Steinen verliere ich immer!', en: 'Tip: watch how many stones you leave me. With 4 stones I always lose!' },
          { de: 'Großer Tipp: Lass mir 8 Steine, dann 4. Der leuchtende Knopf hilft dir.', en: 'Big tip: leave me 8 stones, then 4. The glowing button helps you.' },
        ];
        ctx.say(tips[Math.min(losses, tips.length) - 1]!, 'think');
      }
    }
    again.focus();
  }

  again.addEventListener('click', () => {
    stones = START;
    again.hidden = true;
    clear(log);
    status.textContent = tx({ de: 'Du fängst an.', en: 'You start.' });
    render();
    buttons.querySelector<HTMLButtonElement>('button')?.focus();
  });

  status.textContent = tx({ de: 'Du fängst an.', en: 'You start.' });
  render();
  return { destroy: () => clearTimeout(timer) };
};

export default game;
