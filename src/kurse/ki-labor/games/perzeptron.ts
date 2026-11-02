import { clear, h, s } from '../../engine/dom';
import { solved } from '../../engine/ui';
import type { GameMount } from '../../types';
import { plot } from '../parts/plot';
import { epoch, errors, nextMistake, NOT_SEPARABLE, predict, SEPARABLE, START, update, type LabeledPoint, type Perceptron } from '../models/neuronen';

/**
 * Spiel „Rosenblatts Perzeptron“: Die Lernregel w ← w + η·c·x Schritt für
 * Schritt an falsch eingeordneten Punkten anwenden und zusehen, wie sich die
 * Gerade dreht. Mit einem Ausreißer (nicht trennbar) hört das Lernen nie auf.
 */
const ETA = 0.1;

const game: GameMount<void> = (host, ctx) => {
  const { tx } = ctx;
  let data: LabeledPoint[] = SEPARABLE;
  let p: Perceptron = { ...START };
  let updates = 0;
  let cursor = 0;
  let highlight = -1;
  const done = { converged: false, endless: false };
  let finished = false;

  const pl = plot({ x: [0, 10], y: [0, 10], xStep: 2, yStep: 2, xLabel: 'x₁', yLabel: 'x₂', label: tx({ de: 'Zwei Klassen und die Trenngerade des Perzeptrons', en: 'Two classes and the perceptron’s separating line' }), width: 420, height: 380, fmt: (v) => ctx.num(v) });
  const shade = s('polygon', { class: 'klogic__shade' });
  const line = s('line', { class: 'kplot__line' });
  const normal = s('line', { class: 'kplot__arrow' });
  const dots = s('g');
  pl.back.append(shade);
  pl.mid.append(line, normal);
  pl.front.append(dots);

  const readout = h('p', { class: 'kformula', attrs: { 'aria-live': 'polite' } });
  const one = h('button', { class: 'kbtn kbtn--main', attrs: { type: 'button' }, text: `🎯 ${tx({ de: 'Nächsten Fehler korrigieren', en: 'Fix the next mistake' })}` });
  const ep = h('button', { class: 'kbtn kbtn--main', attrs: { type: 'button' }, text: `🔁 ${tx({ de: 'Eine Epoche', en: 'One epoch' })}` });
  const all = h('button', { class: 'kbtn', attrs: { type: 'button' }, text: `⏩ ${tx({ de: '100 Epochen', en: '100 epochs' })}` });
  const reset = h('button', { class: 'kbtn', attrs: { type: 'button' }, text: `↺ ${tx({ de: 'Neustart', en: 'Restart' })}` });
  const dataBtn = h('button', { class: 'kbtn', attrs: { type: 'button', 'aria-pressed': 'false' }, text: `➕ ${tx({ de: 'Ausreißer dazunehmen', en: 'Add an outlier' })}` });
  const goals = h('ul', { class: 'kgoals' });
  host.append(h('div', { class: 'kpanel' }, pl.svg, readout, h('div', { class: 'krow' }, one, ep, all, reset), h('div', { class: 'krow' }, dataBtn)), h('div', { class: 'kpanel' }, goals));

  function draw(): void {
    const lo = 0;
    const hi = 10;
    const f = (q: { x: number; y: number }) => p.w1 * q.x + p.w2 * q.y + p.b;
    const corners = [{ x: lo, y: lo }, { x: hi, y: lo }, { x: hi, y: hi }, { x: lo, y: hi }];
    const poly: { x: number; y: number }[] = [];
    for (let k = 0; k < 4; k++) {
      const a = corners[k]!;
      const b = corners[(k + 1) % 4]!;
      if (f(a) >= 0) poly.push(a);
      if (f(a) * f(b) < 0) {
        const t = f(a) / (f(a) - f(b));
        poly.push({ x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y) });
      }
    }
    shade.setAttribute('points', poly.map((q) => `${pl.px(q.x)},${pl.py(q.y)}`).join(' '));
    if (Math.abs(p.w2) > 1e-9) {
      line.setAttribute('x1', String(pl.px(lo)));
      line.setAttribute('y1', String(pl.py(-(p.b + p.w1 * lo) / p.w2)));
      line.setAttribute('x2', String(pl.px(hi)));
      line.setAttribute('y2', String(pl.py(-(p.b + p.w1 * hi) / p.w2)));
    }
    // Normalenvektor (w1, w2) vom Mittelpunkt der sichtbaren Geraden aus
    const mx = 5;
    const my = Math.abs(p.w2) > 1e-9 ? -(p.b + p.w1 * mx) / p.w2 : 5;
    const len = Math.hypot(p.w1, p.w2) || 1;
    normal.setAttribute('x1', String(pl.px(mx)));
    normal.setAttribute('y1', String(pl.py(my)));
    normal.setAttribute('x2', String(pl.px(mx + (p.w1 / len) * 1.2)));
    normal.setAttribute('y2', String(pl.py(my + (p.w2 / len) * 1.2)));
    clear(dots);
    data.forEach((q, i) => {
      const ok = predict(p, q) === q.c;
      const cx = pl.px(q.x);
      const cy = pl.py(q.y);
      if (q.c === 1) dots.append(s('circle', { class: 'kplot__a', cx, cy, r: 7 }));
      else dots.append(s('path', { class: 'kplot__b', d: `M${cx} ${cy - 9}L${cx + 9} ${cy}L${cx} ${cy + 9}L${cx - 9} ${cy}Z` }));
      if (!ok) dots.append(s('circle', { class: 'kplot__bad', cx, cy, r: 12 }));
      if (i === highlight) dots.append(s('circle', { class: 'kplot__ring kplot__ring--learn', cx, cy, r: 16 }));
    });
    const e = errors(p, data);
    readout.textContent = `w₁ = ${ctx.num(p.w1, 2)},  w₂ = ${ctx.num(p.w2, 2)},  b = ${ctx.num(p.b, 2)}   ·   ${tx({ de: 'Fehler', en: 'errors' })}: ${e}   ·   ${tx({ de: 'Korrekturen', en: 'updates' })}: ${updates}`;
    if (e === 0 && data === SEPARABLE && !done.converged) {
      done.converged = true;
      ctx.say({ de: `Keine Fehler mehr nach ${updates} Korrekturen! Rosenblatt bewies: Wenn eine Trenngerade existiert, findet die Regel sie nach endlich vielen Schritten.`, en: `No errors left after ${updates} updates! Rosenblatt proved: if a separating line exists, the rule finds it in finitely many steps.` }, 'wow');
    }
    clear(goals);
    goals.append(h('li', { class: done.converged ? 'is-done' : '' }, `${done.converged ? '✅' : '⬜'} ${tx({ de: 'Trainiere, bis kein Punkt mehr falsch liegt.', en: 'Train until no point is wrong.' })}`));
    goals.append(h('li', { class: done.endless ? 'is-done' : '' }, `${done.endless ? '✅' : '⬜'} ${tx({ de: 'Nimm den Ausreißer dazu und lass 100 Epochen laufen.', en: 'Add the outlier and run 100 epochs.' })}`));
    if (!finished && done.converged && done.endless) {
      finished = true;
      host.append(solved(tx({ de: 'Perzeptron verstanden!', en: 'Perceptron understood!' })));
      ctx.finish();
    }
  }

  one.addEventListener('click', () => {
    const i = nextMistake(p, data, cursor);
    if (i < 0) {
      ctx.say({ de: 'Kein Punkt liegt mehr falsch.', en: 'No point is wrong any more.' }, 'happy');
      return;
    }
    const q = data[i]!;
    p = update(p, q, ETA);
    updates += 1;
    cursor = i + 1;
    highlight = i;
    ctx.say({ de: `Punkt (${ctx.num(q.x, 1)} | ${ctx.num(q.y, 1)}) lag falsch. Neu: w ← w ${q.c > 0 ? '+' : '−'} ${ctx.num(ETA, 1)} · (${ctx.num(q.x, 1)}, ${ctx.num(q.y, 1)}, 1). Die Gerade dreht sich zu ihm hin.`, en: `Point (${ctx.num(q.x, 1)} | ${ctx.num(q.y, 1)}) was wrong. New: w ← w ${q.c > 0 ? '+' : '−'} ${ctx.num(ETA, 1)} · (${ctx.num(q.x, 1)}, ${ctx.num(q.y, 1)}, 1). The line turns towards it.` }, 'think');
    draw();
  });
  ep.addEventListener('click', () => {
    const r = epoch(p, data, ETA);
    p = r.p;
    updates += r.updates;
    highlight = -1;
    draw();
  });
  all.addEventListener('click', () => {
    let lastErrors = 0;
    for (let k = 0; k < 100; k++) {
      const r = epoch(p, data, ETA);
      p = r.p;
      updates += r.updates;
      if (r.updates === 0) break;
      lastErrors = r.updates;
    }
    highlight = -1;
    if (data === NOT_SEPARABLE && !done.endless) {
      done.endless = true;
      ctx.say({ de: `Nach 100 Epochen wird immer noch korrigiert (zuletzt ${lastErrors}-mal pro Epoche). Ohne trennende Gerade pendelt die Regel endlos hin und her.`, en: `After 100 epochs it is still correcting (last ${lastErrors} times per epoch). Without a separating line the rule swings back and forth forever.` }, 'sad');
    }
    draw();
  });
  reset.addEventListener('click', () => {
    p = { ...START };
    updates = 0;
    cursor = 0;
    highlight = -1;
    draw();
  });
  dataBtn.addEventListener('click', () => {
    data = data === SEPARABLE ? NOT_SEPARABLE : SEPARABLE;
    dataBtn.setAttribute('aria-pressed', String(data === NOT_SEPARABLE));
    p = { ...START };
    updates = 0;
    cursor = 0;
    highlight = -1;
    draw();
  });
  draw();
};

export default game;
