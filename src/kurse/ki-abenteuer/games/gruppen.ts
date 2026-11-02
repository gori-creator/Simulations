import { L } from '../../../curriculum/helpers';
import { clear, h, s } from '../../engine/dom';
import { solved } from '../../engine/ui';
import type { GameMount } from '../../types';
import { assign, FRUITS, moveFlags, pure, START_FLAGS, type Flag } from '../models/kmeans';
import { scatter, sx, sy } from '../parts/scatter';

/**
 * Spiel „Gruppen ohne Etiketten“: k-Means zum Mitmachen. Abwechselnd
 * „Zuordnen“ (jede Frucht zum nächsten Fähnchen) und „Fähnchen in die Mitte“.
 * Wenn sich nichts mehr ändert, deckt Bit auf, was in den Gruppen steckt.
 */
const COLORS = ['kgrp--a', 'kgrp--b', 'kgrp--c'];

const game: GameMount<void> = (host, ctx) => {
  const { tx } = ctx;
  let flags: Flag[] = START_FLAGS.map((f) => ({ ...f }));
  let groups: number[] | null = null;
  let rounds = 0;
  let revealed = false;
  let finished = false;

  const plot = scatter(tx(L('Unbekannte Früchte nach Größe und Süße', 'Unknown fruits by size and sweetness')), tx(L('Größe', 'Size')), tx(L('Süße', 'Sweetness')));
  const assignBtn = h('button', { class: 'kbtn kbtn--main', attrs: { type: 'button' }, text: `1️⃣ ${tx(L('Zum nächsten Fähnchen', 'To the nearest flag'))}` });
  const moveBtn = h('button', { class: 'kbtn kbtn--main', attrs: { type: 'button' }, text: `2️⃣ ${tx(L('Fähnchen in die Mitte', 'Flags to the middle'))}` });
  const status = h('p', { class: 'kvote', attrs: { 'aria-live': 'polite' } });
  host.append(h('div', { class: 'kpanel' }, plot.svg, h('div', { class: 'krow' }, assignBtn, moveBtn), status));

  function draw(): void {
    clear(plot.points);
    clear(plot.over);
    FRUITS.forEach((f, i) => {
      const g = groups ? groups[i]! : -1;
      if (revealed) plot.points.append(s('text', { class: 'kgrp__emoji', x: sx(f.x), y: sy(f.y) + 7, 'text-anchor': 'middle' }, f.emoji));
      else plot.points.append(s('circle', { class: `kgrp__dot ${g >= 0 ? COLORS[g] : ''}`, cx: sx(f.x), cy: sy(f.y), r: 8 }));
    });
    flags.forEach((f, i) => plot.over.append(s('text', { class: `kgrp__flag ${COLORS[i]}`, x: sx(f.x), y: sy(f.y), 'text-anchor': 'middle' }, '🚩')));
  }

  assignBtn.addEventListener('click', () => {
    const next = assign(FRUITS, flags);
    const changed = !groups || next.some((g, i) => g !== groups![i]);
    groups = next;
    draw();
    status.textContent = changed ? tx(L('Jede Frucht gehört jetzt zum nächsten Fähnchen. Jetzt die Fähnchen verschieben!', 'Every fruit now belongs to its nearest flag. Now move the flags!')) : tx(L('Nichts hat sich geändert – die Gruppen stehen fest!', 'Nothing changed – the groups are settled!'));
    if (!changed && rounds > 0) reveal();
  });

  moveBtn.addEventListener('click', () => {
    if (!groups) {
      ctx.say(L('Erst zuordnen, dann verschieben!', 'First assign, then move!'), 'think');
      return;
    }
    flags = moveFlags(FRUITS, groups, flags);
    rounds += 1;
    draw();
    status.textContent = tx(L(`Runde ${rounds}: Jedes Fähnchen steht in der Mitte seiner Gruppe. Jetzt wieder zuordnen.`, `Round ${rounds}: every flag stands in the middle of its group. Now assign again.`));
  });

  function reveal(): void {
    if (revealed) return;
    revealed = true;
    draw();
    const ok = pure(groups!);
    ctx.say(ok ? L('Ich habe drei Gruppen gefunden – ohne dass mir jemand gesagt hat, was was ist. Jetzt sehe ich: Heidelbeeren, Zitronen und Melonen! Die Namen kommen von dir.', 'I found three groups – without anyone telling me what is what. Now I can see: blueberries, lemons and melons! The names come from you.') : L('Drei Gruppen gefunden! Nicht ganz sauber – aber ich habe nie ein Etikett gesehen.', 'Three groups found! Not perfectly clean – but I never saw a single label.'), 'wow');
    if (!finished) {
      finished = true;
      host.append(solved(tx(L('Gruppen gefunden!', 'Groups found!'))));
      ctx.finish();
    }
  }

  status.textContent = tx(L('Drück abwechselnd 1️⃣ und 2️⃣, bis sich nichts mehr ändert.', 'Press 1️⃣ and 2️⃣ in turn until nothing changes any more.'));
  draw();
};

export default game;
