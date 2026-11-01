import { L } from '../../../curriculum/helpers';
import { clear, h, s } from '../../engine/dom';
import { solved } from '../../engine/ui';
import type { GameMount } from '../../types';
import { height, inValley, lost, MAX_STEPS, RATES, ROUNDS, START_W, step, VALLEY } from '../models/bergab';

/**
 * Spiel „Bergab lernen“: Bit steht auf einer Fehlerkurve und spürt nur die
 * Steigung. Mit der passenden Schrittweite kommt er in höchstens 10 Schritten
 * ins Tal. Zwei Täler: ein sanftes und ein steiles.
 */
const W = 440;
const H = 260;
const X0 = -6;
const X1 = 12;
const RATE_NAME = [L('winzig', 'tiny'), L('klein', 'small'), L('mittel', 'medium'), L('groß', 'big')];

const game: GameMount<void> = (host, ctx) => {
  const { tx } = ctx;
  let round = 0;
  let rateIndex = 1;
  let w = START_W;
  let trail: number[] = [START_W];
  let state: 'run' | 'won' | 'lost' | 'slow' = 'run';
  let finished = false;

  const svg = s('svg', { class: 'kplot kbergab', viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': tx(L('Fehlerkurve mit Bit als Kugel', 'Error curve with Bit as a ball')) });
  const rateBtns = RATES.map((r, i) => {
    const b = h('button', { class: 'kbtn', attrs: { type: 'button', 'aria-pressed': String(i === rateIndex) }, text: `${tx(RATE_NAME[i]!)} (${ctx.num(r, 2)})` });
    b.addEventListener('click', () => {
      rateIndex = i;
      for (const x of rateBtns) x.setAttribute('aria-pressed', String(x === b));
      restart();
    });
    return b;
  });
  const stepBtn = h('button', { class: 'kbtn kbtn--main', attrs: { type: 'button' }, text: tx(L('👣 Schritt', '👣 Step')) });
  const restartBtn = h('button', { class: 'kbtn', attrs: { type: 'button' }, text: tx(L('↺ Neu starten', '↺ Restart')) });
  const nextBtn = h('button', { class: 'kbtn kbtn--main', attrs: { type: 'button', hidden: true }, text: tx(L('Nächstes Tal →', 'Next valley →')) });
  const status = h('p', { class: 'kvote', attrs: { 'aria-live': 'polite' } });
  const roundLabel = h('p', { class: 'kpanel__title' });
  const panel = h(
    'div',
    { class: 'kpanel' },
    roundLabel,
    svg,
    h('p', { class: 'khint', text: tx(L('Schrittweite:', 'Step size:')) }),
    h('div', { class: 'krow' }, ...rateBtns),
    status,
    h('div', { class: 'krow' }, stepBtn, restartBtn, nextBtn),
  );
  host.append(panel);

  const terrain = () => ROUNDS[round]!;
  const ymax = () => height(terrain(), X0);
  const px = (x: number) => 20 + ((x - X0) / (X1 - X0)) * (W - 40);
  const py = (y: number) => H - 24 - (Math.min(y, ymax()) / ymax()) * (H - 50);

  function draw(): void {
    clear(svg);
    const t = terrain();
    let d = '';
    for (let i = 0; i <= 120; i++) {
      const x = X0 + ((X1 - X0) * i) / 120;
      d += `${i ? 'L' : 'M'}${px(x).toFixed(1)} ${py(height(t, x)).toFixed(1)}`;
    }
    svg.append(
      s('path', { class: 'kbergab__fill', d: `${d}L${px(X1)} ${H - 10}L${px(X0)} ${H - 10}Z` }),
      s('path', { class: 'kbergab__curve', d }),
      s('text', { class: 'kbergab__flag', x: px(VALLEY), y: py(height(t, VALLEY)) + 22, 'text-anchor': 'middle' }, '🏁'),
    );
    trail.forEach((tw, i) => {
      if (i === 0 || tw < X0 || tw > X1) return;
      const prev = trail[i - 1]!;
      if (prev < X0 || prev > X1) return;
      svg.append(s('line', { class: 'kbergab__jump', x1: px(prev), y1: py(height(t, prev)) - 12, x2: px(tw), y2: py(height(t, tw)) - 12 }));
    });
    for (const tw of trail.slice(0, -1)) if (tw >= X0 && tw <= X1) svg.append(s('circle', { class: 'kbergab__dot', cx: px(tw), cy: py(height(t, tw)) - 12, r: 4 }));
    if (w >= X0 && w <= X1) {
      svg.append(s('circle', { class: 'kbergab__ball', cx: px(w), cy: py(height(t, w)) - 12, r: 12 }));
      svg.append(s('text', { class: 'kbergab__face', x: px(w), y: py(height(t, w)) - 7, 'text-anchor': 'middle' }, state === 'lost' ? '😵' : '🤖'));
    }
    const n = trail.length - 1;
    roundLabel.textContent = tx(L(`Tal ${round + 1} von ${ROUNDS.length}${round === 1 ? ' – diesmal ist es steiler!' : ''}`, `Valley ${round + 1} of ${ROUNDS.length}${round === 1 ? ' – this one is steeper!' : ''}`));
    status.textContent = tx(L(`Schritte: ${n} von ${MAX_STEPS} · Fehler (Höhe): ${ctx.num(height(t, w), 1)}`, `Steps: ${n} of ${MAX_STEPS} · error (height): ${ctx.num(height(t, w), 1)}`));
    stepBtn.disabled = state !== 'run';
  }

  function restart(): void {
    w = START_W;
    trail = [START_W];
    state = 'run';
    nextBtn.hidden = true;
    draw();
  }

  stepBtn.addEventListener('click', () => {
    if (state !== 'run') return;
    w = step(terrain(), w, RATES[rateIndex]!);
    trail.push(w);
    const n = trail.length - 1;
    if (lost(w)) {
      state = 'lost';
      ctx.mistake();
      ctx.say(L('Hilfe! Meine Schritte werden immer größer und ich fliege aus dem Tal. Die Schrittweite ist hier zu groß – wähl eine andere!', 'Help! My steps keep getting bigger and I fly out of the valley. The step size is too big here – pick another one!'), 'sad');
    } else if (inValley(w)) {
      state = 'won';
      ctx.say(L(`Im Tal angekommen – nach ${n} Schritten!`, `Reached the valley – after ${n} steps!`), 'wow');
      if (round < ROUNDS.length - 1) nextBtn.hidden = false;
      else if (!finished) {
        finished = true;
        panel.append(solved(tx(L('Beide Täler geschafft!', 'Both valleys done!'))));
        ctx.finish();
      }
    } else if (n >= MAX_STEPS) {
      state = 'slow';
      ctx.say(L('Zehn Schritte und noch nicht im Tal. Mit dieser Schrittweite dauert es zu lange.', 'Ten steps and still not in the valley. With this step size it takes too long.'), 'sad');
    } else if (n > 1 && Math.sign(trail[n]! - VALLEY) !== Math.sign(trail[n - 1]! - VALLEY)) {
      ctx.say(L('Ich bin übers Tal hinausgesprungen und muss zurück!', 'I jumped past the valley and have to go back!'), 'think');
    } else {
      ctx.say(L('Ich spüre, wo es bergab geht, und mache einen Schritt.', 'I feel which way is downhill and take a step.'), 'happy');
    }
    draw();
  });
  restartBtn.addEventListener('click', restart);
  nextBtn.addEventListener('click', () => {
    round += 1;
    ctx.say(L('Dieses Tal ist viel steiler. Welche Schrittweite passt jetzt?', 'This valley is much steeper. Which step size works now?'), 'think');
    restart();
  });

  draw();
};

export default game;
