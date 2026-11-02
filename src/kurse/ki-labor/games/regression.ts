import { clear, h, s } from '../../engine/dom';
import { meter, solved } from '../../engine/ui';
import type { GameMount } from '../../types';
import { plot } from '../parts/plot';
import { DATA, fit, mse } from '../models/regression';

/**
 * Spiel „Die beste Gerade“: Zwei Griffe legen die Gerade fest (bei x = 0,25
 * und x = 4,25). Zu jedem Punkt erscheint das Quadrat seiner Abweichung;
 * die mittlere Fläche ist die MSE. Ziel: höchstens 10 % über dem Optimum.
 * Griffe auch mit den Pfeiltasten bewegbar.
 */
const XA = 0.25;
const XB = 4.25;

const game: GameMount<void> = (host, ctx) => {
  const { tx } = ctx;
  const best = fit();
  const bestMse = mse(best.m, best.b);
  let ya = 70;
  let yb = 40;
  let finished = false;
  let showBest = false;

  const p = plot({ x: [0, 4.5], y: [0, 100], xStep: 0.5, yStep: 20, xLabel: tx({ de: 'Lernzeit in Stunden', en: 'study time in hours' }), yLabel: tx({ de: 'Punkte', en: 'points' }), label: tx({ de: 'Lernzeit und Punkte mit einer Geraden', en: 'Study time and points with a line' }), fmt: (v) => ctx.num(v, v % 1 ? 1 : 0) });
  const squares = s('g');
  const resid = s('g');
  const line = s('line', { class: 'kplot__line' });
  const bestLine = s('line', { class: 'kplot__best' });
  p.back.append(squares);
  p.mid.append(resid, bestLine, line);
  for (const d of DATA) p.front.append(s('circle', { class: 'kplot__a', cx: p.px(d.x), cy: p.py(d.y), r: 6 }));
  const handle = (label: string) => s('circle', { class: 'kplot__handle', r: 10, tabindex: 0, role: 'slider', 'aria-label': label, 'aria-valuemin': 0, 'aria-valuemax': 100 });
  const ha = handle(tx({ de: 'Linker Griff der Geraden', en: 'Left handle of the line' }));
  const hb = handle(tx({ de: 'Rechter Griff der Geraden', en: 'Right handle of the line' }));
  p.front.append(ha, hb);

  const formula = h('p', { class: 'kformula' });
  const score = meter(tx({ de: 'Nähe zur besten Geraden', en: 'Closeness to the best line' }), tx({ de: 'Ziel: höchstens 10 % mehr Fehler als das Optimum', en: 'Goal: at most 10% more error than the optimum' }));
  const reveal = h('button', { class: 'kbtn', attrs: { type: 'button', hidden: true }, text: `🧮 ${tx({ de: 'Beste Gerade berechnen', en: 'Compute the best line' })}` });
  host.append(h('div', { class: 'kpanel' }, p.svg, formula, h('div', { class: 'khint' }, score.el), h('div', { class: 'krow' }, reveal)));

  const mb = () => {
    const m = (yb - ya) / (XB - XA);
    return { m, b: ya - m * XA };
  };

  function draw(): void {
    const { m, b } = mb();
    const e = mse(m, b);
    line.setAttribute('x1', String(p.px(0)));
    line.setAttribute('y1', String(p.py(b)));
    line.setAttribute('x2', String(p.px(4.5)));
    line.setAttribute('y2', String(p.py(m * 4.5 + b)));
    for (const [el, x, y] of [[ha, XA, ya], [hb, XB, yb]] as const) {
      el.setAttribute('cx', String(p.px(x)));
      el.setAttribute('cy', String(p.py(y)));
      el.setAttribute('aria-valuenow', String(Math.round(y)));
      el.setAttribute('aria-valuetext', `${ctx.num(y, 0)} ${tx({ de: 'Punkte', en: 'points' })}`);
    }
    clear(squares);
    clear(resid);
    for (const d of DATA) {
      const yHat = m * d.x + b;
      const side = Math.abs(p.py(yHat) - p.py(d.y));
      const top = Math.min(p.py(yHat), p.py(d.y));
      squares.append(s('rect', { class: `kplot__sq${d.y > yHat ? ' is-above' : ''}`, x: p.px(d.x), y: top, width: side, height: side }));
      resid.append(s('line', { class: 'kplot__res', x1: p.px(d.x), x2: p.px(d.x), y1: p.py(d.y), y2: p.py(yHat) }));
    }
    if (showBest) {
      bestLine.setAttribute('x1', String(p.px(0)));
      bestLine.setAttribute('y1', String(p.py(best.b)));
      bestLine.setAttribute('x2', String(p.px(4.5)));
      bestLine.setAttribute('y2', String(p.py(best.m * 4.5 + best.b)));
    }
    formula.textContent = `y = ${ctx.num(m, 1)} · x ${b < 0 ? '−' : '+'} ${ctx.num(Math.abs(b), 1)}    MSE = ${ctx.num(e, 1)}${showBest ? `    (${tx({ de: 'Optimum', en: 'optimum' })}: ${ctx.num(bestMse, 1)})` : ''}`;
    const ratio = Math.min(1, bestMse / e);
    score.set(Math.round(ratio * 100), 100, ctx.percent(ratio), e <= 1.1 * bestMse);
    if (e <= 1.1 * bestMse && !finished) {
      finished = true;
      reveal.hidden = false;
      ctx.say({ de: `Sehr gut: MSE ${ctx.num(e, 1)}, das Optimum liegt bei ${ctx.num(bestMse, 1)}. Lass es dir berechnen!`, en: `Very good: MSE ${ctx.num(e, 1)}, the optimum is ${ctx.num(bestMse, 1)}. Let it be computed!` }, 'wow');
      host.append(solved(tx({ de: 'Gerade gefunden!', en: 'Line found!' })));
      ctx.finish();
    }
  }

  const drag = (el: SVGCircleElement, side: 'a' | 'b') => {
    el.addEventListener('pointerdown', (event: PointerEvent) => {
      el.setPointerCapture(event.pointerId);
      const move = (e: PointerEvent) => {
        const y = Math.max(0, Math.min(100, p.toWorld(e).y));
        if (side === 'a') ya = y;
        else yb = y;
        draw();
      };
      const up = () => {
        el.removeEventListener('pointermove', move);
        el.removeEventListener('pointerup', up);
      };
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerup', up);
    });
    el.addEventListener('keydown', (event: KeyboardEvent) => {
      const step = event.shiftKey ? 5 : 1;
      const delta = event.key === 'ArrowUp' ? step : event.key === 'ArrowDown' ? -step : 0;
      if (!delta) return;
      event.preventDefault();
      if (side === 'a') ya = Math.max(0, Math.min(100, ya + delta));
      else yb = Math.max(0, Math.min(100, yb + delta));
      draw();
    });
  };
  drag(ha, 'a');
  drag(hb, 'b');

  reveal.addEventListener('click', () => {
    showBest = true;
    reveal.disabled = true;
    ctx.say({ de: `Die Normalgleichung liefert m = ${ctx.num(best.m, 2)} und b = ${ctx.num(best.b, 2)}: pro Stunde Lernen rund ${ctx.num(best.m, 0)} Punkte mehr.`, en: `The normal equation gives m = ${ctx.num(best.m, 2)} and b = ${ctx.num(best.b, 2)}: about ${ctx.num(best.m, 0)} more points per hour of study.` }, 'happy');
    draw();
  });

  draw();
};

export default game;
