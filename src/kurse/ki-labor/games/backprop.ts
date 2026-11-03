import type { Localized } from '../../../i18n/config';
import { clear, h, s } from '../../engine/dom';
import { solved } from '../../engine/ui';
import type { GameMount } from '../../types';
import { ETA, numericGrad, pass, SAMPLE, START, step, type Params } from '../models/backprop';

/**
 * Spiel „Backpropagation“: ein Neuron als Rechengraph x → z = w·x + b →
 * a = σ(z) → L = (a − y)². Erst vorwärts rechnen, dann rückwärts die lokalen
 * Ableitungen wählen (Kettenregel), mit der numerischen Ableitung
 * vergleichen und schließlich trainieren, bis der Fehler klein ist.
 */
interface Local {
  key: 'dLda' | 'dadz' | 'dzdw' | 'dzdb';
  label: string;
  options: string[];
  correct: number;
  why: Localized;
}

const LOCALS: Local[] = [
  { key: 'dLda', label: '∂L/∂a', options: ['(a − y)²', '2·(a − y)', '2·a'], correct: 1, why: { de: 'Ableitung von (a − y)² nach a: 2·(a − y).', en: 'Derivative of (a − y)² with respect to a: 2·(a − y).' } },
  { key: 'dadz', label: '∂a/∂z', options: ['a·(1 − a)', 'σ(z) + 1', '1 / a'], correct: 0, why: { de: 'Die Sigmoidfunktion hat die schöne Ableitung σ′(z) = σ(z)·(1 − σ(z)) = a·(1 − a).', en: 'The sigmoid has the neat derivative σ′(z) = σ(z)·(1 − σ(z)) = a·(1 − a).' } },
  { key: 'dzdw', label: '∂z/∂w', options: ['w', 'b', 'x'], correct: 2, why: { de: 'z = w·x + b, also ändert sich z pro Einheit w um x.', en: 'z = w·x + b, so z changes by x per unit of w.' } },
  { key: 'dzdb', label: '∂z/∂b', options: ['0', '1', 'x'], correct: 1, why: { de: 'b wird einfach addiert: Ableitung 1.', en: 'b is simply added: derivative 1.' } },
];

const game: GameMount<void> = (host, ctx) => {
  const { tx } = ctx;
  let params: Params = { ...START };
  let forwardStep = 0;
  let backIndex = 0;
  const losses: number[] = [];
  let finished = false;
  const n = (v: number) => ctx.num(v, 3);

  const svg = s('svg', { class: 'kgraph', viewBox: '0 0 720 170', role: 'img', 'aria-label': tx({ de: 'Rechengraph eines Neurons', en: 'Computation graph of a neuron' }) });
  const work = h('div', { class: 'kpanel' });
  host.append(h('div', { class: 'kpanel' }, svg), work);

  /** fresh.fwd: gerade berechneter Knoten (Signal läuft nach rechts); fresh.back: neuer Gradient (läuft nach links). */
  function graph(fresh: { fwd?: number; back?: number } = {}): void {
    clear(svg);
    const P = pass(params);
    const nodes = [
      { x: 60, label: 'x', value: SAMPLE.x, show: true },
      { x: 230, label: 'z = w·x + b', value: P.z, show: forwardStep >= 1 },
      { x: 420, label: 'a = σ(z)', value: P.a, show: forwardStep >= 2 },
      { x: 620, label: `L = (a − y)²,  y = ${SAMPLE.y}`, value: P.L, show: forwardStep >= 3 },
    ];
    for (let k = 0; k < nodes.length - 1; k++) {
      svg.append(s('line', { class: 'kgraph__edge', x1: nodes[k]!.x + 46, y1: 70, x2: nodes[k + 1]!.x - 46, y2: 70 }));
    }
    // w und b als Eingänge von z
    svg.append(s('text', { class: 'kgraph__param', x: 230, y: 16, 'text-anchor': 'middle' }, `w = ${n(params.w)}   b = ${n(params.b)}`));
    nodes.forEach((node, k) => {
      const isNew = fresh.fwd === k ? ' is-new' : '';
      svg.append(s('rect', { class: `kgraph__node${node.show ? ' is-known' : ''}${isNew}`, x: node.x - 46, y: 44, width: 92, height: 52, rx: 12 }));
      svg.append(s('text', { class: `kgraph__value${isNew}`, x: node.x, y: 76, 'text-anchor': 'middle' }, node.show ? n(node.value) : '?'));
      svg.append(s('text', { class: 'kgraph__label', x: node.x, y: 116, 'text-anchor': 'middle' }, node.label));
    });
    // Signal auf der Kante: vorwärts zum neuen Knoten, rückwärts (rot) zum Knoten davor
    const edge = (k: number) => [nodes[k]!.x + 46, nodes[k + 1]!.x - 46] as const;
    const dot = (from: number, to: number, back: boolean) => {
      const c = s('circle', { class: `kgraph__pulse${back ? ' is-back' : ''}`, cx: from, cy: 70, r: 7 });
      c.style.setProperty('--dx', `${to - from}px`);
      svg.append(c);
    };
    if (fresh.fwd) dot(...edge(fresh.fwd - 1), false);
    if (fresh.back) {
      const [x1, x2] = edge(Math.max(0, 3 - fresh.back));
      dot(x2, x1, true);
    }
    // Gradienten rückwärts (unter den Kanten)
    const back: [number, string, boolean][] = [
      [520, `∂L/∂a = ${n(P.dLda)}`, backIndex >= 1],
      [325, `∂L/∂z = ${n(P.dLdz)}`, backIndex >= 2],
      [140, `∂L/∂w = ${n(P.dLdw)}`, backIndex >= 3],
      [140, `∂L/∂b = ${n(P.dLdb)}`, backIndex >= 4],
    ];
    back.forEach(([x, text, show], i) => {
      if (show) svg.append(s('text', { class: `kgraph__grad${fresh.back === i + 1 ? ' is-new' : ''}`, x, y: i === 3 ? 160 : 142, 'text-anchor': 'middle' }, `← ${text}`));
    });
  }

  function forwardPhase(): void {
    clear(work);
    const labels = [tx({ de: 'z berechnen', en: 'compute z' }), tx({ de: 'a berechnen', en: 'compute a' }), tx({ de: 'Verlust L berechnen', en: 'compute loss L' })];
    const b = h('button', { class: 'kbtn kbtn--main', attrs: { type: 'button' }, text: `▶ ${labels[forwardStep]}` });
    b.addEventListener('click', () => {
      forwardStep += 1;
      graph({ fwd: forwardStep });
      const P = pass(params);
      const msgs: Localized[] = [
        { de: `z = ${n(params.w)} · ${n(SAMPLE.x)} + (${n(params.b)}) = ${n(P.z)}`, en: `z = ${n(params.w)} · ${n(SAMPLE.x)} + (${n(params.b)}) = ${n(P.z)}` },
        { de: `a = σ(${n(P.z)}) = 1 / (1 + e^(−z)) = ${n(P.a)}. Das Neuron ist zu ${ctx.percent(P.a)} „an“ – gewünscht ist 0.`, en: `a = σ(${n(P.z)}) = 1 / (1 + e^(−z)) = ${n(P.a)}. The neuron is ${ctx.percent(P.a)} “on” – the target is 0.` },
        { de: `L = (${n(P.a)} − 0)² = ${n(P.L)}. Jetzt die Frage: Wie muss ich w und b ändern, damit L kleiner wird?`, en: `L = (${n(P.a)} − 0)² = ${n(P.L)}. Now the question: how should w and b change so that L gets smaller?` },
      ];
      ctx.say(msgs[forwardStep - 1]!, 'think');
      if (forwardStep >= 3) backwardPhase();
      else forwardPhase();
    });
    work.append(h('p', { class: 'kpanel__title', text: tx({ de: '1. Vorwärts: von links nach rechts rechnen', en: '1. Forward: compute from left to right' }) }), h('div', { class: 'krow' }, b));
    b.focus();
  }

  function backwardPhase(): void {
    clear(work);
    if (backIndex >= LOCALS.length) return checkPhase();
    const local = LOCALS[backIndex]!;
    work.append(h('p', { class: 'kpanel__title', text: tx({ de: `2. Rückwärts (Kettenregel): Welche lokale Ableitung ist ${local.label}?`, en: `2. Backward (chain rule): which local derivative is ${local.label}?` }) }));
    const row = h('div', { class: 'krow' });
    local.options.forEach((opt, i) => {
      const b = h('button', { class: 'kbtn', attrs: { type: 'button' }, text: `${local.label} = ${opt}` });
      b.addEventListener('click', () => {
        if (i !== local.correct) {
          ctx.mistake();
          b.disabled = true;
          ctx.say({ de: 'Nicht ganz. Leite den Ausdruck im Knoten nach der Größe davor ab.', en: 'Not quite. Differentiate the node’s expression with respect to the quantity before it.' }, 'sad');
          return;
        }
        backIndex += 1;
        graph({ back: backIndex });
        const P = pass(params);
        const extra: Record<Local['key'], Localized> = {
          dLda: { de: `= 2 · ${n(P.a)} = ${n(P.dLda)}`, en: `= 2 · ${n(P.a)} = ${n(P.dLda)}` },
          dadz: { de: `= ${n(P.dadz)}. Kettenregel: ∂L/∂z = ${n(P.dLda)} · ${n(P.dadz)} = ${n(P.dLdz)}`, en: `= ${n(P.dadz)}. Chain rule: ∂L/∂z = ${n(P.dLda)} · ${n(P.dadz)} = ${n(P.dLdz)}` },
          dzdw: { de: `= ${n(SAMPLE.x)}, also ∂L/∂w = ${n(P.dLdz)} · ${n(SAMPLE.x)} = ${n(P.dLdw)}`, en: `= ${n(SAMPLE.x)}, so ∂L/∂w = ${n(P.dLdz)} · ${n(SAMPLE.x)} = ${n(P.dLdw)}` },
          dzdb: { de: `, also ∂L/∂b = ${n(P.dLdb)}`, en: `, so ∂L/∂b = ${n(P.dLdb)}` },
        };
        ctx.say({ de: `${tx(local.why)} ${extra[local.key].de}`, en: `${tx(local.why)} ${extra[local.key].en}` }, 'happy');
        backwardPhase();
      });
      row.append(b);
    });
    work.append(row);
  }

  function checkPhase(): void {
    clear(work);
    const P = pass(params);
    const num = numericGrad(params);
    work.append(
      h('p', { class: 'kpanel__title', text: tx({ de: '3. Probe: Stimmt die Rückwärtsrechnung?', en: '3. Check: is the backward pass right?' }) }),
      h('p', { class: 'kformula', text: `∂L/∂w: ${n(P.dLdw)} (Backprop)  ≈  ${n(num.dw)} (${tx({ de: 'Differenzenquotient', en: 'difference quotient' })})` }),
      h('p', { class: 'kformula', text: `∂L/∂b: ${n(P.dLdb)} (Backprop)  ≈  ${n(num.db)} (${tx({ de: 'Differenzenquotient', en: 'difference quotient' })})` }),
    );
    const go = h('button', { class: 'kbtn kbtn--main', attrs: { type: 'button' }, text: `${tx({ de: 'Jetzt lernen', en: 'Now learn' })} →` });
    go.addEventListener('click', trainPhase);
    work.append(h('div', { class: 'krow' }, go));
    ctx.say({ de: 'Beide Wege liefern dasselbe. Aber Backprop braucht nur einen Durchgang rückwärts – egal wie viele Gewichte es gibt. Der Differenzenquotient bräuchte zwei Rechnungen pro Gewicht.', en: 'Both ways give the same result. But backprop needs only one backward pass – no matter how many weights there are. The difference quotient would need two computations per weight.' }, 'wow');
    go.focus();
  }

  function trainPhase(): void {
    clear(work);
    const chart = s('svg', { class: 'kspark', viewBox: '0 0 300 80', role: 'img', 'aria-label': tx({ de: 'Verlauf des Verlusts', en: 'Loss over time' }) });
    const info = h('p', { class: 'kformula', attrs: { 'aria-live': 'polite' } });
    const one = h('button', { class: 'kbtn kbtn--main', attrs: { type: 'button' }, text: `w ← w − ${ctx.num(ETA, 1)} · ∂L/∂w` });
    const ten = h('button', { class: 'kbtn', attrs: { type: 'button' }, text: `⏩ ${tx({ de: '10 Schritte', en: '10 steps' })}` });
    const draw = () => {
      graph();
      const P = pass(params);
      info.textContent = `w = ${n(params.w)},  b = ${n(params.b)},  a = ${n(P.a)},  L = ${n(P.L)}   (${tx({ de: 'Schritt', en: 'step' })} ${losses.length})`;
      clear(chart);
      const max = Math.max(...losses, P.L);
      const pts = [...losses, P.L].map((l, i, arr) => `${(i / Math.max(1, arr.length - 1)) * 290 + 5},${75 - (l / max) * 65}`).join(' ');
      chart.append(s('polyline', { class: 'kplot__curve', points: pts }));
      if (P.L < 0.1 && !finished) {
        finished = true;
        ctx.say({ de: `Verlust unter 0,1 nach ${losses.length} Schritten. Genau so lernt jedes neuronale Netz: vorwärts, rückwärts, Gewichte ein Stück bergab – milliardenfach.`, en: `Loss below 0.1 after ${losses.length} steps. That is exactly how every neural network learns: forward, backward, weights a little downhill – billions of times.` }, 'wow');
        work.append(solved(tx({ de: 'Backpropagation gemeistert!', en: 'Backpropagation mastered!' })));
        ctx.finish();
      }
    };
    const doStep = () => {
      losses.push(pass(params).L);
      params = step(params);
    };
    one.addEventListener('click', () => {
      doStep();
      draw();
    });
    ten.addEventListener('click', () => {
      for (let k = 0; k < 10; k++) doStep();
      draw();
    });
    work.append(h('p', { class: 'kpanel__title', text: tx({ de: '4. Lernen: Gewichte gegen den Gradienten verschieben, bis L < 0,1', en: '4. Learn: move the weights against the gradient until L < 0.1' }) }), h('div', { class: 'krow' }, one, ten), info, chart);
    draw();
  }

  graph();
  forwardPhase();
};

export default game;
