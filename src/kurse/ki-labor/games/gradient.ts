import { clear, h, s } from '../../engine/dom';
import { solved } from '../../engine/ui';
import type { GameMount } from '../../types';
import { plot, polyline } from '../parts/plot';
import { DATA, descend, ETAS, fit, gradient, mse } from '../models/regression';

/**
 * Spiel „Gradientenabstieg“: Links die Fehlerlandschaft MSE(m, b) als
 * Wärmebild (dunkel = großer Fehler), rechts die Daten mit der aktuellen
 * Geraden. Jeder Schritt geht um η · Gradient bergab. Missionen: mit einer
 * passenden Lernrate in höchstens 60 Schritten ins Tal; mit einer zu großen
 * Lernrate das Explodieren beobachten.
 */
const M_RANGE: [number, number] = [-5, 30];
const B_RANGE: [number, number] = [-10, 70];

const game: GameMount<void> = (host, ctx) => {
  const { tx } = ctx;
  const best = fit();
  const minMse = mse(best.m, best.b);
  let eta: number = ETAS[1];
  let pos = { m: 0, b: 0 };
  let path = [pos];
  let steps = 0;
  const done = { valley: false, boom: false };
  let finished = false;

  const land = plot({ x: M_RANGE, y: B_RANGE, xStep: 5, yStep: 10, xLabel: tx({ de: 'Steigung m', en: 'slope m' }), yLabel: tx({ de: 'Achsenabschnitt b', en: 'intercept b' }), label: tx({ de: 'Fehlerlandschaft über m und b', en: 'Loss landscape over m and b' }), width: 420, height: 340, fmt: (v) => ctx.num(v) });
  const NX = 42;
  const NY = 36;
  const logMin = Math.log(minMse);
  const logMax = Math.log(mse(M_RANGE[1], B_RANGE[1]));
  for (let i = 0; i < NX; i++) {
    for (let j = 0; j < NY; j++) {
      const m0 = M_RANGE[0] + (i / NX) * (M_RANGE[1] - M_RANGE[0]);
      const b0 = B_RANGE[0] + (j / NY) * (B_RANGE[1] - B_RANGE[0]);
      const m1 = M_RANGE[0] + ((i + 1) / NX) * (M_RANGE[1] - M_RANGE[0]);
      const b1 = B_RANGE[0] + ((j + 1) / NY) * (B_RANGE[1] - B_RANGE[0]);
      const v = (Math.log(mse((m0 + m1) / 2, (b0 + b1) / 2)) - logMin) / (logMax - logMin);
      land.back.append(s('rect', { class: 'kheat', x: land.px(m0), y: land.py(b1), width: land.px(m1) - land.px(m0) + 0.5, height: land.py(b0) - land.py(b1) + 0.5, 'fill-opacity': Math.max(0.03, Math.min(0.92, v)).toFixed(3) }));
    }
  }
  land.mid.append(s('text', { class: 'kplot__goal', x: land.px(best.m), y: land.py(best.b) + 6, 'text-anchor': 'middle' }, '✕'));
  const trail = s('polyline', { class: 'kplot__trail' });
  const dot = s('circle', { class: 'kplot__handle', r: 7 });
  const arrow = s('line', { class: 'kplot__arrow' });
  land.mid.append(trail, arrow);
  land.front.append(dot);

  const data = plot({ x: [0, 4.5], y: [0, 100], xStep: 1, yStep: 20, xLabel: tx({ de: 'Stunden', en: 'hours' }), yLabel: tx({ de: 'Punkte', en: 'points' }), label: tx({ de: 'Daten und aktuelle Gerade', en: 'Data and current line' }), width: 300, height: 240, fmt: (v) => ctx.num(v) });
  for (const d of DATA) data.front.append(s('circle', { class: 'kplot__a', cx: data.px(d.x), cy: data.py(d.y), r: 5 }));
  const line = s('line', { class: 'kplot__line' });
  data.mid.append(line);

  const etaRow = h('div', { class: 'krow', attrs: { role: 'group', 'aria-label': tx({ de: 'Lernrate', en: 'Learning rate' }) } });
  const stepBtn = h('button', { class: 'kbtn kbtn--main', attrs: { type: 'button' }, text: `👣 ${tx({ de: '1 Schritt', en: '1 step' })}` });
  const tenBtn = h('button', { class: 'kbtn kbtn--main', attrs: { type: 'button' }, text: `⏩ ${tx({ de: '10 Schritte', en: '10 steps' })}` });
  const resetBtn = h('button', { class: 'kbtn', attrs: { type: 'button' }, text: `↺ ${tx({ de: 'Neustart bei (0 | 0)', en: 'Restart at (0 | 0)' })}` });
  const readout = h('p', { class: 'kformula', attrs: { 'aria-live': 'polite' } });
  const goals = h('ul', { class: 'kgoals' });
  host.append(
    h('div', { class: 'kpanel kgrid-2' }, land.svg, data.svg),
    h('div', { class: 'kpanel' }, h('p', { class: 'kpanel__title', text: tx({ de: 'Lernrate η', en: 'Learning rate η' }) }), etaRow, h('div', { class: 'krow' }, stepBtn, tenBtn, resetBtn), readout, goals),
  );

  for (const e of ETAS) {
    const b = h('button', { class: 'kbtn', attrs: { type: 'button', 'aria-pressed': String(e === eta), 'data-eta': e }, text: ctx.num(e, 2) });
    b.addEventListener('click', () => {
      eta = e;
      for (const x of etaRow.querySelectorAll('button')) x.setAttribute('aria-pressed', String(Number(x.dataset.eta) === eta));
      reset();
    });
    etaRow.append(b);
  }

  const inView = (q: { m: number; b: number }) => ({ x: Math.max(M_RANGE[0], Math.min(M_RANGE[1], q.m)), y: Math.max(B_RANGE[0], Math.min(B_RANGE[1], q.b)) });

  function renderGoals(): void {
    clear(goals);
    goals.append(h('li', { class: done.valley ? 'is-done' : '' }, `${done.valley ? '✅' : '⬜'} ${tx({ de: 'Erreiche das Tal (MSE höchstens 10 % über dem Minimum) in höchstens 60 Schritten.', en: 'Reach the valley (MSE at most 10% above the minimum) in at most 60 steps.' })}`));
    goals.append(h('li', { class: done.boom ? 'is-done' : '' }, `${done.boom ? '✅' : '⬜'} ${tx({ de: 'Finde eine Lernrate, bei der der Fehler explodiert.', en: 'Find a learning rate at which the error explodes.' })}`));
    if (!finished && done.valley && done.boom) {
      finished = true;
      host.append(solved(tx({ de: 'Abstieg gemeistert!', en: 'Descent mastered!' })));
      ctx.say({ de: 'Zu klein: ewig unterwegs. Zu groß: Du springst über das Tal hinaus, immer weiter. Die Lernrate ist eine der wichtigsten Stellschrauben beim Training.', en: 'Too small: forever on the way. Too large: you jump over the valley, further and further. The learning rate is one of the most important knobs in training.' }, 'wow');
      ctx.finish();
    }
  }

  function draw(): void {
    const e = mse(pos.m, pos.b);
    const g = gradient(pos.m, pos.b);
    const v = inView(pos);
    dot.setAttribute('cx', String(land.px(v.x)));
    dot.setAttribute('cy', String(land.py(v.y)));
    trail.setAttribute('points', polyline(land, path.map(inView)));
    const len = Math.hypot(g.dm, g.db) || 1;
    arrow.setAttribute('x1', String(land.px(v.x)));
    arrow.setAttribute('y1', String(land.py(v.y)));
    arrow.setAttribute('x2', String(land.px(v.x) - (g.dm / len) * 30));
    arrow.setAttribute('y2', String(land.py(v.y) + (g.db / len) * 30));
    line.setAttribute('x1', String(data.px(0)));
    line.setAttribute('y1', String(data.py(pos.b)));
    line.setAttribute('x2', String(data.px(4.5)));
    line.setAttribute('y2', String(data.py(pos.m * 4.5 + pos.b)));
    const big = !Number.isFinite(e) || e > 1e9;
    readout.textContent = big
      ? tx({ de: `Schritt ${steps}: Der Fehler ist explodiert (über eine Milliarde)!`, en: `Step ${steps}: the error has exploded (over a billion)!` })
      : `${tx({ de: 'Schritt', en: 'step' })} ${steps}:  m = ${ctx.num(pos.m, 2)},  b = ${ctx.num(pos.b, 2)},  MSE = ${ctx.num(e, 1)},  ∂L/∂m = ${ctx.num(g.dm, 1)},  ∂L/∂b = ${ctx.num(g.db, 1)}`;
    if (!done.valley && e <= 1.1 * minMse && steps <= 60) {
      done.valley = true;
      ctx.say({ de: `Im Tal nach ${steps} Schritten! Der Pfeil zeigt immer gegen den Gradienten – steil bergab.`, en: `In the valley after ${steps} steps! The arrow always points against the gradient – steeply downhill.` }, 'happy');
    }
    if (!done.boom && (big || (steps >= 3 && e > 10 * mse(0, 0)))) {
      done.boom = true;
      ctx.say({ de: 'Boom! Jeder Schritt landet höher am gegenüberliegenden Hang. Der Abstieg schaukelt sich auf.', en: 'Boom! Every step lands higher up the opposite slope. The descent swings out of control.' }, 'wow');
    }
    stepBtn.disabled = big;
    tenBtn.disabled = big;
    renderGoals();
  }

  function stepOnce(): void {
    pos = descend(pos.m, pos.b, eta);
    steps += 1;
    path.push(pos);
  }

  function reset(): void {
    pos = { m: 0, b: 0 };
    path = [pos];
    steps = 0;
    draw();
  }

  stepBtn.addEventListener('click', () => {
    stepOnce();
    draw();
  });
  tenBtn.addEventListener('click', () => {
    for (let k = 0; k < 10; k++) stepOnce();
    draw();
  });
  resetBtn.addEventListener('click', reset);
  reset();
};

export default game;
