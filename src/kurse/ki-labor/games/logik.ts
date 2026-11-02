import { clear, h, s } from '../../engine/dom';
import { solved } from '../../engine/ui';
import type { GameMount } from '../../types';
import { plot } from '../parts/plot';
import { fire, INPUTS, KNOB_VALUES, matches, TARGET, type Gate } from '../models/neuronen';

/**
 * Spiel „Neuronen als Logik“: Ein Schwellenneuron mit zwei Eingängen soll
 * UND, ODER und NAND berechnen; rechts die Geometrie (Trenngerade im
 * Einheitsquadrat). Zum Schluss XOR – höchstens 3 von 4 Zeilen sind möglich.
 */
const GATES: { id: Gate; name: string }[] = [
  { id: 'und', name: 'UND' },
  { id: 'oder', name: 'ODER' },
  { id: 'nand', name: 'NAND' },
  { id: 'xor', name: 'XOR' },
];

const game: GameMount<void> = (host, ctx) => {
  const { tx } = ctx;
  const gateName = (g: Gate) => (ctx.lang === 'en' ? { und: 'AND', oder: 'OR', nand: 'NAND', xor: 'XOR' }[g] : GATES.find((x) => x.id === g)!.name);
  let gate: Gate = 'und';
  let w1 = 0;
  let w2 = 0;
  let theta = 0.5;
  const solvedGates = new Set<Gate>();
  let xorGiveUp = false;
  let finished = false;

  const p = plot({ x: [-0.4, 1.4], y: [-0.4, 1.4], xStep: 0.5, yStep: 0.5, xLabel: 'x₁', yLabel: 'x₂', label: tx({ de: 'Eingaben im Einheitsquadrat mit Trenngerade', en: 'Inputs in the unit square with separating line' }), width: 300, height: 300, fmt: (v) => ctx.num(v, 1) });
  const shade = s('polygon', { class: 'klogic__shade' });
  const line = s('line', { class: 'kplot__line' });
  const dots = s('g');
  p.back.append(shade);
  p.mid.append(line);
  p.front.append(dots);

  const gateRow = h('div', { class: 'krow', attrs: { role: 'group', 'aria-label': tx({ de: 'Verknüpfung', en: 'Gate' }) } });
  const knobs = h('div', { class: 'kneuron__controls' });
  const tbody = h('tbody');
  const table = h('table', { class: 'ktable' }, h('thead', {}, h('tr', {}, h('th', { text: 'x₁' }), h('th', { text: 'x₂' }), h('th', { text: 'w₁x₁ + w₂x₂' }), h('th', { text: tx({ de: 'Neuron', en: 'neuron' }) }), h('th', { text: tx({ de: 'Ziel', en: 'target' }) }))), tbody);
  const giveUp = h('button', { class: 'kbtn', attrs: { type: 'button', hidden: true }, text: `🤔 ${tx({ de: 'Mehr als 3 von 4 geht nicht!', en: 'More than 3 of 4 is impossible!' })}` });
  const goals = h('ul', { class: 'kgoals' });
  host.append(h('div', { class: 'kpanel kgrid-2' }, h('div', {}, gateRow, knobs, h('div', { class: 'ktable-wrap' }, table), h('div', { class: 'krow' }, giveUp)), p.svg), h('div', { class: 'kpanel' }, goals));

  const knob = (label: string, get: () => number, set: (v: number) => void) => {
    const out = h('output', { class: 'kstep__value' });
    const minus = h('button', { class: 'kbtn kstep__btn', attrs: { type: 'button', 'aria-label': `${label} −` }, text: '−' });
    const plus = h('button', { class: 'kbtn kstep__btn', attrs: { type: 'button', 'aria-label': `${label} +` }, text: '+' });
    const move = (dir: number) => {
      const i = KNOB_VALUES.indexOf(get());
      const v = KNOB_VALUES[Math.max(0, Math.min(KNOB_VALUES.length - 1, i + dir))]!;
      set(v);
      render();
    };
    minus.addEventListener('click', () => move(-1));
    plus.addEventListener('click', () => move(1));
    knobs.append(h('div', { class: 'kneuron__row' }, h('span', { text: label }), h('div', { class: 'kstep' }, minus, out, plus)));
    return () => {
      out.textContent = ctx.num(get(), 1);
      minus.disabled = get() <= KNOB_VALUES[0]!;
      plus.disabled = get() >= KNOB_VALUES.at(-1)!;
    };
  };
  const syncs = [knob('w₁', () => w1, (v) => (w1 = v)), knob('w₂', () => w2, (v) => (w2 = v)), knob(tx({ de: 'Schwelle θ', en: 'threshold θ' }), () => theta, (v) => (theta = v))];

  for (const g of GATES) {
    const b = h('button', { class: 'kbtn', attrs: { type: 'button', 'aria-pressed': String(g.id === gate), 'data-gate': g.id }, text: gateName(g.id) });
    b.addEventListener('click', () => {
      if (g.id === 'xor' && solvedGates.size < 3) {
        ctx.say({ de: 'Erst UND, ODER und NAND – dann kommt XOR.', en: 'First AND, OR and NAND – then comes XOR.' }, 'wink');
        return;
      }
      gate = g.id;
      render();
    });
    gateRow.append(b);
  }

  function renderGeometry(): void {
    // Halbebene w1·x + w2·y ≥ θ einfärben (Polygon im sichtbaren Bereich)
    const lo = -0.4;
    const hi = 1.4;
    const corners = [
      { x: lo, y: lo },
      { x: hi, y: lo },
      { x: hi, y: hi },
      { x: lo, y: hi },
    ];
    const inside = (q: { x: number; y: number }) => w1 * q.x + w2 * q.y >= theta;
    const poly: { x: number; y: number }[] = [];
    for (let k = 0; k < 4; k++) {
      const a = corners[k]!;
      const b = corners[(k + 1) % 4]!;
      if (inside(a)) poly.push(a);
      const fa = w1 * a.x + w2 * a.y - theta;
      const fb = w1 * b.x + w2 * b.y - theta;
      if (fa * fb < 0) {
        const t = fa / (fa - fb);
        poly.push({ x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y) });
      }
    }
    shade.setAttribute('points', poly.map((q) => `${p.px(q.x)},${p.py(q.y)}`).join(' '));
    if (Math.abs(w2) > 1e-9) {
      line.setAttribute('x1', String(p.px(lo)));
      line.setAttribute('y1', String(p.py((theta - w1 * lo) / w2)));
      line.setAttribute('x2', String(p.px(hi)));
      line.setAttribute('y2', String(p.py((theta - w1 * hi) / w2)));
    } else if (Math.abs(w1) > 1e-9) {
      line.setAttribute('x1', String(p.px(theta / w1)));
      line.setAttribute('x2', String(p.px(theta / w1)));
      line.setAttribute('y1', String(p.py(lo)));
      line.setAttribute('y2', String(p.py(hi)));
    } else {
      line.setAttribute('x1', '0');
      line.setAttribute('x2', '0');
      line.setAttribute('y1', '0');
      line.setAttribute('y2', '0');
    }
    clear(dots);
    INPUTS.forEach((x, i) => {
      const t = TARGET[gate][i]!;
      const ok = fire(w1, w2, theta, x) === t;
      dots.append(s('circle', { class: t ? 'kplot__a' : 'kplot__b', cx: p.px(x[0]), cy: p.py(x[1]), r: 11 }));
      dots.append(s('text', { class: `kmark ${ok ? 'kmark--ok' : 'kmark--bad'}`, x: p.px(x[0]) + 14, y: p.py(x[1]) - 10 }, ok ? '✓' : '✗'));
    });
  }

  function render(): void {
    for (const sync of syncs) sync();
    for (const b of gateRow.querySelectorAll<HTMLButtonElement>('button')) b.setAttribute('aria-pressed', String(b.dataset.gate === gate));
    clear(tbody);
    INPUTS.forEach((x, i) => {
      const out = fire(w1, w2, theta, x);
      const ok = out === TARGET[gate][i];
      tbody.append(h('tr', { class: ok ? 'is-right' : 'is-wrong' }, h('td', { text: String(x[0]) }), h('td', { text: String(x[1]) }), h('td', { text: `${ctx.num(w1 * x[0] + w2 * x[1], 1)} ${out ? '≥' : '<'} ${ctx.num(theta, 1)}` }), h('td', { text: String(out) }), h('td', { text: `${TARGET[gate][i]} ${ok ? '✓' : '✗'}` })));
    });
    renderGeometry();
    const m = matches(gate, w1, w2, theta);
    if (m === 4 && gate !== 'xor' && !solvedGates.has(gate)) {
      solvedGates.add(gate);
      ctx.say({ de: `${gateName(gate)} geschafft: w₁ = ${ctx.num(w1, 1)}, w₂ = ${ctx.num(w2, 1)}, θ = ${ctx.num(theta, 1)}. Die Gerade trennt die blauen von den orangen Punkten.`, en: `${gateName(gate)} done: w₁ = ${ctx.num(w1, 1)}, w₂ = ${ctx.num(w2, 1)}, θ = ${ctx.num(theta, 1)}. The line separates the blue points from the orange ones.` }, 'happy');
    }
    giveUp.hidden = !(gate === 'xor' && m === 3) || xorGiveUp;
    clear(goals);
    for (const g of ['und', 'oder', 'nand'] as Gate[]) goals.append(h('li', { class: solvedGates.has(g) ? 'is-done' : '' }, `${solvedGates.has(g) ? '✅' : '⬜'} ${tx({ de: `Stell das Neuron auf ${gateName(g)} ein.`, en: `Set the neuron to ${gateName(g)}.` })}`));
    goals.append(h('li', { class: xorGiveUp ? 'is-done' : '' }, `${xorGiveUp ? '✅' : '⬜'} ${tx({ de: 'Versuch XOR. Wie viele Zeilen schaffst du höchstens?', en: 'Try XOR. How many rows can you get at most?' })}`));
  }

  giveUp.addEventListener('click', () => {
    xorGiveUp = true;
    giveUp.hidden = true;
    render();
    if (!finished) {
      finished = true;
      ctx.say({ de: 'Stimmt! Bei XOR liegen die blauen Punkte über Kreuz. Keine einzelne Gerade trennt sie – ein einzelnes Neuron kann XOR nicht.', en: 'Right! With XOR the blue points sit diagonally opposite. No single line separates them – a single neuron cannot do XOR.' }, 'wow');
      host.append(solved(tx({ de: 'Grenze eines Neurons gefunden!', en: 'Found the limit of one neuron!' })));
      ctx.finish();
    }
  });

  render();
};

export default game;
