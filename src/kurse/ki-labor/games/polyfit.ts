import { clear, h, s } from '../../engine/dom';
import { solved } from '../../engine/ui';
import type { GameMount } from '../../types';
import { plot } from '../parts/plot';
import { errorCurve, polyfit, TEST, TRAIN, TRAIN_BIG, X_RANGE } from '../models/polyfit';

/**
 * Spiel „Überanpassung“: Grad des Polynoms wählen, Kurve an Trainingspunkten
 * (gefüllt) anpassen, an Testpunkten (Ringe) prüfen. Rechts der Trainings- und
 * Testfehler für alle Grade (logarithmische Achse). Missionen: Grad 9 ansehen,
 * einen Grad mit fast minimalem Testfehler finden, mit 40 Trainingspunkten
 * erneut Grad 9 ansehen.
 */
const game: GameMount<void> = (host, ctx) => {
  const { tx } = ctx;
  let degree = 1;
  let big = false;
  const done = { nine: false, best: false, more: false };
  let finished = false;

  const p = plot({ x: X_RANGE, y: [0, 10], xStep: 2, yStep: 2, xLabel: 'x', yLabel: 'y', label: tx({ de: 'Messpunkte und angepasstes Polynom', en: 'Data points and fitted polynomial' }), width: 440, height: 300, fmt: (v) => ctx.num(v) });
  const curve = s('polyline', { class: 'kplot__curve' });
  const pts = s('g');
  p.mid.append(curve);
  p.front.append(pts);

  const e = plot({ x: [0, 9], y: [-2, 2], xStep: 1, yStep: 1, xLabel: tx({ de: 'Grad', en: 'degree' }), yLabel: tx({ de: 'Fehler (log₁₀ MSE)', en: 'error (log₁₀ MSE)' }), label: tx({ de: 'Trainings- und Testfehler je Grad', en: 'Training and test error per degree' }), width: 320, height: 300, fmt: (v) => ctx.num(v) });
  const trainLine = s('polyline', { class: 'kplot__curve kplot__curve--train' });
  const testLine = s('polyline', { class: 'kplot__curve kplot__curve--test' });
  const marker = s('line', { class: 'kplot__marker' });
  e.mid.append(marker, trainLine, testLine);

  const degRow = h('div', { class: 'krow', attrs: { role: 'group', 'aria-label': tx({ de: 'Grad des Polynoms', en: 'Degree of the polynomial' }) } });
  const moreBtn = h('button', { class: 'kbtn', attrs: { type: 'button', 'aria-pressed': 'false' }, text: `➕ ${tx({ de: '40 statt 10 Trainingspunkte', en: '40 instead of 10 training points' })}` });
  const readout = h('p', { class: 'kformula', attrs: { 'aria-live': 'polite' } });
  const goals = h('ul', { class: 'kgoals' });
  const legend = h('p', { class: 'klegend' }, h('span', { class: 'klegend__a' }), ` ${tx({ de: 'Training', en: 'training' })}   `, h('span', { class: 'klegend__test' }), ` ${tx({ de: 'Test', en: 'test' })}   `, h('span', { class: 'klegend__line klegend__line--train' }), ` ${tx({ de: 'Trainingsfehler', en: 'training error' })}   `, h('span', { class: 'klegend__line klegend__line--test' }), ` ${tx({ de: 'Testfehler', en: 'test error' })}`);
  host.append(h('div', { class: 'kpanel kgrid-2' }, p.svg, e.svg), h('div', { class: 'kpanel' }, legend, degRow, h('div', { class: 'krow' }, moreBtn), readout, goals));

  for (let d = 0; d <= 9; d++) {
    const b = h('button', { class: 'kbtn kbtn--sq', attrs: { type: 'button', 'aria-pressed': String(d === degree), 'data-deg': d }, text: String(d) });
    b.addEventListener('click', () => {
      degree = d;
      render();
    });
    degRow.append(b);
  }
  moreBtn.addEventListener('click', () => {
    big = !big;
    moreBtn.setAttribute('aria-pressed', String(big));
    render();
  });

  const lg = (v: number) => Math.max(-2, Math.min(2, Math.log10(Math.max(v, 1e-9))));

  function render(): void {
    const train = big ? TRAIN_BIG : TRAIN;
    const poly = polyfit(train, degree);
    for (const b of degRow.querySelectorAll<HTMLButtonElement>('button')) b.setAttribute('aria-pressed', String(Number(b.dataset.deg) === degree));
    const xs = Array.from({ length: 161 }, (_, k) => X_RANGE[0] + (k / 160) * (X_RANGE[1] - X_RANGE[0]));
    curve.setAttribute('points', xs.map((x) => `${p.px(x).toFixed(1)},${p.py(Math.max(-3, Math.min(13, poly.at(x)))).toFixed(1)}`).join(' '));
    clear(pts);
    for (const t of TEST) pts.append(s('circle', { class: 'kplot__test', cx: p.px(t.x), cy: p.py(t.y), r: 4 }));
    for (const t of train) pts.append(s('circle', { class: 'kplot__a', cx: p.px(t.x), cy: p.py(t.y), r: big ? 4 : 6 }));
    const rows = errorCurve(train);
    trainLine.setAttribute('points', rows.map((r) => `${e.px(r.degree)},${e.py(lg(r.train))}`).join(' '));
    testLine.setAttribute('points', rows.map((r) => `${e.px(r.degree)},${e.py(lg(r.test))}`).join(' '));
    marker.setAttribute('x1', String(e.px(degree)));
    marker.setAttribute('x2', String(e.px(degree)));
    marker.setAttribute('y1', String(e.py(-2)));
    marker.setAttribute('y2', String(e.py(2)));
    const row = rows[degree]!;
    const minTest = Math.min(...rows.map((r) => r.test));
    readout.textContent = `${tx({ de: 'Grad', en: 'degree' })} ${degree}:  ${tx({ de: 'Trainingsfehler', en: 'training error' })} ${ctx.num(row.train, 3)}   ·   ${tx({ de: 'Testfehler', en: 'test error' })} ${ctx.num(row.test, 3)}`;

    if (degree === 9 && !big && !done.nine) {
      done.nine = true;
      ctx.say({ de: 'Trainingsfehler 0 – die Kurve trifft jeden Punkt! Aber schau auf die Ringe: Bei neuen Daten liegt sie völlig daneben. Das ist Überanpassung.', en: 'Training error 0 – the curve hits every point! But look at the rings: on new data it is way off. That is overfitting.' }, 'wow');
    } else if (!big && done.nine && !done.best && row.test <= 1.05 * minTest) {
      done.best = true;
      ctx.say({ de: `Grad ${degree} ist ein guter Kompromiss: nicht zu starr, nicht zu wackelig. Und jetzt: mehr Daten!`, en: `Degree ${degree} is a good compromise: not too rigid, not too wiggly. And now: more data!` }, 'happy');
    } else if (big && degree === 9 && done.best && !done.more) {
      done.more = true;
      ctx.say({ de: 'Mit 40 Punkten kann auch Grad 9 nicht mehr jeden Ausreißer nachzeichnen. Mehr Daten zähmen Überanpassung.', en: 'With 40 points even degree 9 can no longer trace every outlier. More data tames overfitting.' }, 'wow');
    } else if (degree === 0) {
      ctx.say({ de: 'Grad 0 ist eine waagerechte Linie: viel zu starr. Das nennt man Unteranpassung.', en: 'Degree 0 is a horizontal line: far too rigid. That is called underfitting.' }, 'think');
    }
    clear(goals);
    const item = (ok: boolean, text: string) => goals.append(h('li', { class: ok ? 'is-done' : '' }, `${ok ? '✅' : '⬜'} ${text}`));
    item(done.nine, tx({ de: 'Sieh dir Grad 9 mit 10 Trainingspunkten an.', en: 'Look at degree 9 with 10 training points.' }));
    item(done.best, tx({ de: 'Finde einen Grad, dessen Testfehler höchstens 5 % über dem kleinsten liegt.', en: 'Find a degree whose test error is at most 5% above the smallest.' }));
    item(done.more, tx({ de: 'Schalte 40 Trainingspunkte ein und sieh dir Grad 9 noch einmal an.', en: 'Switch on 40 training points and look at degree 9 again.' }));
    if (!finished && done.nine && done.best && done.more) {
      finished = true;
      host.append(solved(tx({ de: 'Überanpassung durchschaut!', en: 'Overfitting understood!' })));
      ctx.finish();
    }
  }

  render();
};

export default game;
