import { L } from '../../../curriculum/helpers';
import { clear, h, s } from '../../engine/dom';
import { meter, solved } from '../../engine/ui';
import type { GameMount } from '../../types';
import { boundary, errors, learnStep, predict, START, type Weights } from '../models/perzeptron';
import { CITRUS } from '../models/zitrus';
import { legend, marker, paintShade, scatter, sx, sy } from '../parts/scatter';

/** Spiel „Das Neuron lernt“: Lernschritt für Lernschritt dreht sich die Grenze, bis alle Früchte stimmen. */
const game: GameMount<void> = (host, ctx) => {
  const { tx } = ctx;
  let w: Weights = { ...START };
  let from = 0;
  let steps = 0;
  let timer = 0;
  let finished = false;

  const plot = scatter(tx(L('Das Neuron trennt Zitronen und Orangen', 'The neuron separates lemons and oranges')), tx(L('Größe', 'Size')), tx(L('Süße', 'Sweetness')));
  for (const f of CITRUS) plot.points.append(marker(f.x, f.y, f.label === 'lemon' ? 'a' : 'b'));
  const line = s('line', { class: 'kplot__line' });
  plot.under.append(line);

  const stepBtn = h('button', { class: 'kbtn kbtn--main', attrs: { type: 'button' }, text: tx(L('Ein Lernschritt', 'One learning step')) });
  const autoBtn = h('button', { class: 'kbtn', attrs: { type: 'button', 'aria-pressed': 'false' }, text: tx(L('▶ Bis fertig', '▶ Until done')) });
  const resetBtn = h('button', { class: 'kbtn', attrs: { type: 'button' }, text: tx(L('↺ Neu', '↺ Reset')) });
  const info = h('p', { class: 'khint' });
  const result = meter(tx(L('Richtig eingeordnet', 'Placed correctly')), tx(L('Ziel: alle 24', 'Goal: all 24')));
  const panel = h('div', { class: 'kpanel' }, plot.svg, legend(tx(L('Zitronen', 'Lemons')), tx(L('Orangen', 'Oranges'))), h('div', { class: 'krow' }, stepBtn, autoBtn, resetBtn), info, h('div', { class: 'khint' }, result.el));
  host.append(panel);

  function draw(learned = -1): void {
    const b = boundary(w);
    if (b) {
      line.setAttribute('x1', String(sx(b[0].x)));
      line.setAttribute('y1', String(sy(b[0].y)));
      line.setAttribute('x2', String(sx(b[1].x)));
      line.setAttribute('y2', String(sy(b[1].y)));
    }
    paintShade(plot.shade, (x, y) => (predict(w, { x, y }) === 1 ? 'b' : 'a'), 22);
    clear(plot.over);
    for (const f of CITRUS) {
      if (predict(w, f) !== (f.label === 'orange' ? 1 : -1)) plot.over.append(s('circle', { class: 'kplot__bad', cx: sx(f.x), cy: sy(f.y), r: 12 }));
    }
    if (learned >= 0) {
      const f = CITRUS[learned]!;
      plot.over.append(s('circle', { class: 'kplot__ring kplot__ring--learn', cx: sx(f.x), cy: sy(f.y), r: 17 }));
    }
    const wrong = errors(w, CITRUS);
    result.set(CITRUS.length - wrong, CITRUS.length, `${CITRUS.length - wrong} / ${CITRUS.length}`, wrong === 0);
    info.textContent = tx(L(`Lernschritte: ${steps} · Gewichte: ${ctx.num(w.w1, 2)} und ${ctx.num(w.w2, 2)}, Verschiebung ${ctx.num(w.b, 2)}`, `Learning steps: ${steps} · weights: ${ctx.num(w.w1, 2)} and ${ctx.num(w.w2, 2)}, bias ${ctx.num(w.b, 2)}`));
    if (wrong === 0 && !finished) {
      finished = true;
      stop();
      stepBtn.disabled = true;
      autoBtn.disabled = true;
      ctx.say(L(`Geschafft nach ${steps} Lernschritten! Niemand hat mir die Linie vorgegeben – ich habe sie aus meinen Fehlern gelernt.`, `Done after ${steps} learning steps! Nobody gave me the line – I learned it from my mistakes.`), 'wow');
      panel.append(solved(tx(L('Das Neuron hat gelernt!', 'The neuron has learned!'))));
      ctx.finish();
    }
  }

  function learnOnce(): boolean {
    const r = learnStep(w, CITRUS, from);
    if (r.index < 0) return false;
    w = r.weights;
    from = r.next;
    steps += 1;
    const fruit = CITRUS[r.index]!;
    if (!timer) ctx.say(fruit.label === 'lemon' ? L('Hier lag ich falsch: Das ist eine Zitrone. Ich drehe meine Linie ein kleines Stück.', 'I got this one wrong: it’s a lemon. I turn my line a little bit.') : L('Falsch geraten: Das ist eine Orange. Ich drehe meine Linie ein kleines Stück.', 'Wrong guess: it’s an orange. I turn my line a little bit.'), 'think');
    draw(r.index);
    return true;
  }

  function stop(): void {
    clearInterval(timer);
    timer = 0;
    autoBtn.setAttribute('aria-pressed', 'false');
    autoBtn.textContent = tx(L('▶ Bis fertig', '▶ Until done'));
  }

  stepBtn.addEventListener('click', () => {
    stop();
    learnOnce();
  });
  autoBtn.addEventListener('click', () => {
    if (timer) {
      stop();
      return;
    }
    autoBtn.setAttribute('aria-pressed', 'true');
    autoBtn.textContent = tx(L('⏸ Anhalten', '⏸ Pause'));
    ctx.say(L('Ich übe jetzt ganz schnell, Fehler für Fehler …', 'I’m practising really fast now, mistake by mistake …'), 'think');
    if (ctx.reducedMotion) {
      while (learnOnce());
      stop();
      return;
    }
    timer = window.setInterval(() => {
      if (!learnOnce()) stop();
    }, 180);
  });
  resetBtn.addEventListener('click', () => {
    stop();
    w = { ...START };
    from = 0;
    steps = 0;
    stepBtn.disabled = finished;
    draw();
  });

  draw();
  return { destroy: stop };
};

export default game;
