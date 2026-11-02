import { L } from '../../../curriculum/helpers';
import { clear, h, seeded } from '../../engine/dom';
import { solved } from '../../engine/ui';
import type { GameMount } from '../../types';
import { bitTake, learn, newBoxes, practiceGame, smartShare, START, type Boxes, type Move } from '../models/menace';

/**
 * Spiel „Das Streichholz-Spiel“: 9 Hölzer, je Zug 1 oder 2, wer das letzte
 * nimmt, gewinnt. Du fängst an. Bit zieht Perlen aus Schachteln (MENACE) und
 * lernt nach jedem Spiel. Man sieht die Schachteln und ihre Perlen.
 * Ziel: 5 Spiele spielen und Bit einmal allein üben lassen.
 */
const game: GameMount<void> = (host, ctx) => {
  const { tx } = ctx;
  const rnd = seeded(Date.now() % 4999);
  let boxes: Boxes = newBoxes();
  let sticks = START;
  let bitMoves: Move[] = [];
  let busy = false;
  const results: ('bit' | 'du')[] = [];
  let practiced = false;
  let finished = false;
  let timer = 0;

  const pile = h('div', { class: 'knim__pile knim__pile--sticks', attrs: { role: 'img' } });
  const status = h('p', { class: 'kvote', attrs: { 'aria-live': 'polite' } });
  const take = h('div', { class: 'krow' });
  const again = h('button', { class: 'kbtn', attrs: { type: 'button', hidden: true }, text: `↺ ${tx(L('Noch ein Spiel', 'Another game'))}` });
  const practice = h('button', { class: 'kbtn', attrs: { type: 'button' }, text: `🏋️ ${tx(L('Bit 30 Spiele allein üben lassen', 'Let Bit practise 30 games alone'))}` });
  const boxesEl = h('div', { class: 'kboxes' });
  const score = h('p', { class: 'khint' });
  host.append(h('div', { class: 'kpanel' }, pile, status, take, h('div', { class: 'krow' }, again, practice), score), h('div', { class: 'kpanel' }, h('p', { class: 'kpanel__title', text: tx(L('Bits Schachteln: 🔵 = 1 nehmen, 🔴 = 2 nehmen', 'Bit’s boxes: 🔵 = take 1, 🔴 = take 2')) }), boxesEl));

  function renderBoxes(): void {
    clear(boxesEl);
    for (let n = START; n >= 1; n--) {
      const [a, b] = boxes[n]!;
      boxesEl.append(h('div', { class: `kboxes__box${n === sticks && !busy ? ' is-now' : ''}` }, h('strong', { text: tx(L(`${n} Hölzer`, `${n} sticks`)) }), h('span', { text: `${'🔵'.repeat(Math.min(a, 12))}${a > 12 ? `+${a - 12}` : ''}` }), h('span', { text: `${'🔴'.repeat(Math.min(b, 12))}${b > 12 ? `+${b - 12}` : ''}` })));
    }
  }

  function render(): void {
    clear(pile);
    for (let i = 0; i < sticks; i++) pile.append(h('span', { class: 'knim__stick', attrs: { 'aria-hidden': 'true' } }));
    pile.setAttribute('aria-label', tx(L(`${sticks} Hölzer übrig`, `${sticks} sticks left`)));
    clear(take);
    if (sticks > 0) {
      for (const k of [1, 2]) {
        if (k > sticks) continue;
        const b = h('button', { class: 'kbtn kbtn--main', attrs: { type: 'button' }, text: tx(L(`${k} nehmen`, `take ${k}`)) });
        b.disabled = busy;
        b.addEventListener('click', () => player(k as 1 | 2));
        take.append(b);
      }
    }
    const last5 = results.slice(-5);
    score.textContent = results.length ? tx(L(`Gespielt: ${results.length} · Bit hat ${results.filter((r) => r === 'bit').length}-mal gewonnen · letzte Spiele: ${last5.map((r) => (r === 'bit' ? '🤖' : '🙂')).join(' ')}`, `Played: ${results.length} · Bit won ${results.filter((r) => r === 'bit').length} times · last games: ${last5.map((r) => (r === 'bit' ? '🤖' : '🙂')).join(' ')}`)) : '';
    renderBoxes();
  }

  function player(k: 1 | 2): void {
    if (busy || sticks <= 0) return;
    sticks -= k;
    if (sticks === 0) return end('du');
    busy = true;
    render();
    status.textContent = tx(L('Bit greift in die Schachtel …', 'Bit reaches into the box …'));
    timer = window.setTimeout(() => {
      const t = Math.min(sticks, bitTake(boxes, sticks, rnd)) as 1 | 2;
      bitMoves.push({ sticks, take: t });
      status.textContent = tx(L(`Bit zieht eine ${t === 1 ? '🔵' : '🔴'} Perle und nimmt ${t}.`, `Bit draws a ${t === 1 ? '🔵' : '🔴'} bead and takes ${t}.`));
      sticks -= t;
      busy = false;
      if (sticks === 0) return end('bit');
      render();
    }, ctx.reducedMotion ? 0 : 600);
  }

  function end(winner: 'bit' | 'du'): void {
    busy = false;
    boxes = learn(boxes, bitMoves, winner === 'bit');
    results.push(winner);
    status.textContent = winner === 'du' ? tx(L('Du hast das letzte Holz genommen – gewonnen! Bit nimmt aus seinen Schachteln die Perlen der Züge, die zur Niederlage führten.', 'You took the last stick – you win! Bit removes the beads of the moves that led to the loss.')) : tx(L('Bit hat das letzte Holz genommen. Er legt für jeden seiner Züge eine Perle dazu.', 'Bit took the last stick. He adds a bead for each of his moves.'));
    ctx.say(winner === 'du' ? L('Verloren – aber ich lerne daraus!', 'Lost – but I learn from it!') : L('Gewonnen! Diese Züge merke ich mir.', 'Won! I’ll remember these moves.'), winner === 'du' ? 'sad' : 'happy');
    again.hidden = false;
    render();
    check();
    again.focus();
  }

  function check(): void {
    if (!finished && results.length >= 5 && practiced) {
      finished = true;
      const share = ctx.percent(smartShare(boxes));
      ctx.say(L(`Schau in die Schachteln: ${share} meiner Perlen liegen jetzt auf dem klugen Zug – dem, der dir 3 oder 6 Hölzer übrig lässt. Je mehr ich spiele, desto mehr werden es. So hat MENACE 1961 Tic-Tac-Toe gelernt – mit Schachteln statt Computer.`, `Look into the boxes: ${share} of my beads are now on the smart move – the one that leaves you 3 or 6 sticks. The more I play, the more there are. That’s how MENACE learned noughts and crosses in 1961 – with boxes instead of a computer.`), 'wow');
      host.append(solved(tx(L('Bit hat aus Belohnung gelernt!', 'Bit learned from rewards!'))));
      ctx.finish();
    }
  }

  again.addEventListener('click', () => {
    sticks = START;
    bitMoves = [];
    again.hidden = true;
    status.textContent = tx(L('Du fängst an.', 'You start.'));
    render();
  });
  practice.addEventListener('click', () => {
    let wins = 0;
    for (let k = 0; k < 30; k++) {
      const r = practiceGame(boxes, rnd);
      boxes = r.boxes;
      if (r.bitWon) wins += 1;
    }
    practiced = true;
    ctx.say(L(`30 Übungsspiele gegen einen Zufallsspieler: ${wins} gewonnen. ${ctx.percent(smartShare(boxes))} meiner Perlen stecken jetzt in klugen Zügen.`, `30 practice games against a random player: ${wins} won. ${ctx.percent(smartShare(boxes))} of my beads are now on smart moves.`), 'wink');
    render();
    check();
  });

  status.textContent = tx(L('Du fängst an. Nimm 1 oder 2 Hölzer.', 'You start. Take 1 or 2 sticks.'));
  render();
  return { destroy: () => clearTimeout(timer) };
};

export default game;
