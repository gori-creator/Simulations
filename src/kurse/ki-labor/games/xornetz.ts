import { clear, h, s } from '../../engine/dom';
import { meter, solved } from '../../engine/ui';
import type { GameMount } from '../../types';
import { plot } from '../parts/plot';
import { INPUTS, TARGET, xorMatches, xorNet } from '../models/neuronen';

/**
 * Spiel „Die verborgene Schicht“: Zwei verborgene Neuronen ziehen je eine
 * Gerade x₁ + x₂ = t. Links der Eingaberaum, rechts der Raum der verborgenen
 * Neuronen (h₁, h₂): Dort lassen sich die XOR-Punkte mit einer Geraden trennen.
 */
const STEPS = [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25];

const game: GameMount<void> = (host, ctx) => {
  const { tx } = ctx;
  let t1 = 0.25;
  let t2 = 0.75;
  let finished = false;

  const inp = plot({ x: [-0.4, 1.4], y: [-0.4, 1.4], xStep: 0.5, yStep: 0.5, xLabel: 'x₁', yLabel: 'x₂', label: tx({ de: 'Eingaberaum mit zwei Geraden', en: 'Input space with two lines' }), width: 300, height: 300, fmt: (v) => ctx.num(v, 1) });
  const hid = plot({ x: [-0.4, 1.4], y: [-0.4, 1.4], xStep: 0.5, yStep: 0.5, xLabel: 'h₁', yLabel: 'h₂', label: tx({ de: 'Raum der verborgenen Neuronen', en: 'Space of the hidden neurons' }), width: 300, height: 300, fmt: (v) => ctx.num(v, 1) });
  const band = s('polygon', { class: 'klogic__shade' });
  const l1 = s('line', { class: 'kplot__line kplot__line--a' });
  const l2 = s('line', { class: 'kplot__line kplot__line--b' });
  const inDots = s('g');
  inp.back.append(band);
  inp.mid.append(l1, l2);
  inp.front.append(inDots);
  const outLine = s('line', { class: 'kplot__line' });
  const hidDots = s('g');
  hid.mid.append(outLine);
  hid.front.append(hidDots);
  // Ausgabeneuron: h₁ − h₂ ≥ 0,5
  outLine.setAttribute('x1', String(hid.px(0.5)));
  outLine.setAttribute('y1', String(hid.py(0)));
  outLine.setAttribute('x2', String(hid.px(1.4)));
  outLine.setAttribute('y2', String(hid.py(0.9)));

  const sliders = h('div', { class: 'kneuron__controls' });
  const tbody = h('tbody');
  const table = h('table', { class: 'ktable' }, h('thead', {}, h('tr', {}, h('th', { text: 'x₁ x₂' }), h('th', { text: 'h₁' }), h('th', { text: 'h₂' }), h('th', { text: tx({ de: 'Ausgabe', en: 'output' }) }), h('th', { text: 'XOR' }))), tbody);
  const score = meter(tx({ de: 'XOR richtig', en: 'XOR correct' }));
  host.append(
    h('div', { class: 'kpanel kgrid-2' }, inp.svg, hid.svg),
    h('div', { class: 'kpanel kgrid-2' }, h('div', {}, sliders, h('p', { class: 'khint', text: tx({ de: 'Ausgabeneuron (fest): feuert, wenn h₁ − h₂ ≥ 0,5 – also „h₁ und nicht h₂“.', en: 'Output neuron (fixed): fires when h₁ − h₂ ≥ 0.5 – i.e. “h₁ and not h₂”.' }) }), h('div', { class: 'khint' }, score.el)), h('div', { class: 'ktable-wrap' }, table)),
  );

  const slider = (label: string, get: () => number, set: (v: number) => void) => {
    const out = h('output', { class: 'kstep__value' });
    const minus = h('button', { class: 'kbtn kstep__btn', attrs: { type: 'button', 'aria-label': `${label} −` }, text: '−' });
    const plus = h('button', { class: 'kbtn kstep__btn', attrs: { type: 'button', 'aria-label': `${label} +` }, text: '+' });
    const move = (d: number) => {
      const i = STEPS.indexOf(get());
      set(STEPS[Math.max(0, Math.min(STEPS.length - 1, i + d))]!);
      render();
    };
    minus.addEventListener('click', () => move(-1));
    plus.addEventListener('click', () => move(1));
    sliders.append(h('div', { class: 'kneuron__row' }, h('span', { text: label }), h('div', { class: 'kstep' }, minus, out, plus)));
    return () => {
      out.textContent = ctx.num(get(), 2);
    };
  };
  const syncs = [slider(tx({ de: 'Schwelle t₁ (Neuron h₁)', en: 'threshold t₁ (neuron h₁)' }), () => t1, (v) => (t1 = v)), slider(tx({ de: 'Schwelle t₂ (Neuron h₂)', en: 'threshold t₂ (neuron h₂)' }), () => t2, (v) => (t2 = v))];

  const diag = (line: SVGLineElement, t: number) => {
    // Gerade x₁ + x₂ = t
    line.setAttribute('x1', String(inp.px(-0.4)));
    line.setAttribute('y1', String(inp.py(t + 0.4)));
    line.setAttribute('x2', String(inp.px(1.4)));
    line.setAttribute('y2', String(inp.py(t - 1.4)));
  };

  function render(): void {
    for (const sync of syncs) sync();
    diag(l1, t1);
    diag(l2, t2);
    // Band, in dem die Ausgabe feuert: t1 ≤ x₁ + x₂ < t2
    const lo = -0.4;
    const hi = 1.4;
    const pts: { x: number; y: number }[] = [];
    if (t2 > t1) {
      for (const [a, b] of [[t1, t2]] as const) {
        pts.push({ x: lo, y: a - lo }, { x: hi, y: a - hi }, { x: hi, y: b - hi }, { x: lo, y: b - lo });
      }
    }
    band.setAttribute('points', pts.map((q) => `${inp.px(q.x)},${inp.py(q.y)}`).join(' '));
    clear(inDots);
    clear(hidDots);
    clear(tbody);
    const seen = new Map<string, number>();
    INPUTS.forEach((x, i) => {
      const r = xorNet(t1, t2, x);
      const target = TARGET.xor[i]!;
      const ok = r.out === target;
      inDots.append(s('circle', { class: target ? 'kplot__a' : 'kplot__b', cx: inp.px(x[0]), cy: inp.py(x[1]), r: 10 }), s('text', { class: `kmark ${ok ? 'kmark--ok' : 'kmark--bad'}`, x: inp.px(x[0]) + 13, y: inp.py(x[1]) - 9 }, ok ? '✓' : '✗'));
      const key = `${r.h1}${r.h2}`;
      const n = seen.get(key) ?? 0;
      seen.set(key, n + 1);
      hidDots.append(s('circle', { class: target ? 'kplot__a' : 'kplot__b', cx: hid.px(r.h1) + n * 14, cy: hid.py(r.h2) - n * 10, r: 9 }));
      tbody.append(h('tr', { class: ok ? 'is-right' : 'is-wrong' }, h('td', { text: `${x[0]} ${x[1]}` }), h('td', { text: String(r.h1) }), h('td', { text: String(r.h2) }), h('td', { text: String(r.out) }), h('td', { text: `${target} ${ok ? '✓' : '✗'}` })));
    });
    const m = xorMatches(t1, t2);
    score.set(m, 4, `${m} / 4`, m === 4);
    if (m === 4 && !finished) {
      finished = true;
      ctx.say({ de: 'XOR gelöst! Rechts siehst du warum: Die verborgene Schicht legt (0,1) und (1,0) auf denselben Punkt – dort trennt eine einzige Gerade.', en: 'XOR solved! On the right you see why: the hidden layer maps (0,1) and (1,0) to the same point – there a single line separates.' }, 'wow');
      host.append(solved(tx({ de: 'XOR mit verborgener Schicht!', en: 'XOR with a hidden layer!' })));
      ctx.finish();
    }
  }

  render();
};

export default game;
