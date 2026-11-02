import { clear, h, s } from '../../engine/dom';
import { solved } from '../../engine/ui';
import type { GameMount } from '../../types';
import { plot } from '../parts/plot';
import { add, DIMS, nearest, sub, vec, WORDS } from '../../gemeinsam/models/vektoren';

/**
 * Spiel „Wörter als Vektoren“: Wortvektoren in zwei wählbaren Richtungen
 * anzeigen und mit ihnen rechnen: A − B + C. Das Ergebnis wird mit der
 * Kosinus-Ähnlichkeit mit allen Wörtern verglichen.
 * Mission: drei Analogien mit Ähnlichkeit ≥ 0,95 finden.
 */
const game: GameMount<void> = (host, ctx) => {
  const { tx } = ctx;
  let dx = 2;
  let dy = 3;
  const slots: (string | null)[] = [null, null, null];
  const found = new Set<string>();
  let finished = false;

  const p = plot({ x: [-0.4, 1.4], y: [-0.4, 1.4], xStep: 0.5, yStep: 0.5, xLabel: tx(DIMS[dx]!), yLabel: tx(DIMS[dy]!), label: tx({ de: 'Wörter in zwei Bedeutungsrichtungen', en: 'Words in two directions of meaning' }), width: 380, height: 340, fmt: (v) => ctx.num(v, 1) });
  const axisRow = h('div', { class: 'kgrid-2' });
  const chips = h('div', { class: 'kfacts kfacts--pick', attrs: { role: 'group', 'aria-label': tx({ de: 'Wörter', en: 'Words' }) } });
  const eq = h('p', { class: 'kformula', attrs: { 'aria-live': 'polite' } });
  const result = h('ol', { class: 'ktrace' });
  const clearBtn = h('button', { class: 'kbtn kbtn--small', attrs: { type: 'button' }, text: `↺ ${tx({ de: 'Leeren', en: 'Clear' })}` });
  const goals = h('ul', { class: 'kgoals' });
  host.append(
    h('div', { class: 'kpanel kgrid-2' }, h('div', {}, p.svg, axisRow), h('div', {}, h('p', { class: 'kpanel__title', text: tx({ de: 'Rechne mit Bedeutungen: tippe A, dann B, dann C', en: 'Calculate with meanings: tap A, then B, then C' }) }), chips, eq, h('div', { class: 'krow' }, clearBtn), result)),
    h('div', { class: 'kpanel' }, goals),
  );

  const dimSelect = (label: string, get: () => number, set: (v: number) => void) => {
    const sel = h('select', { class: 'input', attrs: { 'aria-label': label } });
    DIMS.forEach((d, i) => sel.append(h('option', { attrs: { value: i, selected: i === get() }, text: tx(d) })));
    sel.addEventListener('change', () => {
      set(Number(sel.value));
      redrawPlot();
    });
    return h('label', { class: 'kslider' }, h('span', { class: 'kslider__label', text: label }), sel);
  };
  axisRow.append(dimSelect(tx({ de: 'Achse nach rechts', en: 'Axis to the right' }), () => dx, (v) => (dx = v)), dimSelect(tx({ de: 'Achse nach oben', en: 'Axis upwards' }), () => dy, (v) => (dy = v)));

  let plotRef = p;
  function redrawPlot(): void {
    const np = plot({ x: [-0.4, 1.4], y: [-0.4, 1.4], xStep: 0.5, yStep: 0.5, xLabel: tx(DIMS[dx]!), yLabel: tx(DIMS[dy]!), label: tx({ de: 'Wörter in zwei Bedeutungsrichtungen', en: 'Words in two directions of meaning' }), width: 380, height: 340, fmt: (v) => ctx.num(v, 1) });
    plotRef.svg.replaceWith(np.svg);
    plotRef = np;
    drawWords();
  }

  function drawWords(): void {
    const g = s('g');
    plotRef.front.append(g);
    const res = resultVec();
    for (const w of WORDS) {
      const x = plotRef.px(w.v[dx]!);
      const y = plotRef.py(w.v[dy]!);
      const inSlot = slots.includes(w.id);
      g.append(s('circle', { class: `kvec__dot${inSlot ? ' is-slot' : ''}`, cx: x, cy: y, r: 13 }), s('text', { class: 'kvec__icon', x, y: y + 6, 'text-anchor': 'middle' }, w.icon));
    }
    if (res) {
      const x = plotRef.px(res[dx]!);
      const y = plotRef.py(res[dy]!);
      g.append(s('circle', { class: 'kvec__result', cx: x, cy: y, r: 18 }));
      const [a, b, c] = slots.map((id) => vec(id!));
      // Pfeil von C nach C + (A − B)
      g.append(s('line', { class: 'kplot__arrow', x1: plotRef.px(c![dx]!), y1: plotRef.py(c![dy]!), x2: x, y2: y }));
      g.append(s('line', { class: 'kvec__guide', x1: plotRef.px(b![dx]!), y1: plotRef.py(b![dy]!), x2: plotRef.px(a![dx]!), y2: plotRef.py(a![dy]!) }));
    }
  }

  function resultVec(): number[] | null {
    if (slots.some((x) => x === null)) return null;
    return add(sub(vec(slots[0]!), vec(slots[1]!)), vec(slots[2]!));
  }

  function render(): void {
    const name = (id: string | null | undefined) => (id ? tx(WORDS.find((w) => w.id === id)!.name) : '…');
    eq.textContent = `${name(slots[0])} − ${name(slots[1])} + ${name(slots[2])} = ?`;
    clear(result);
    const res = resultVec();
    if (res) {
      const near = nearest(res, slots as string[], 3);
      for (const n of near) result.append(h('li', { text: `${n.word.icon} ${tx(n.word.name)}: cos = ${ctx.num(n.sim, 3)}` }));
      const top = near[0]!;
      const key = slots.join('-');
      if (top.sim >= 0.95 && !found.has(key)) {
        found.add(key);
        ctx.say({ de: `${name(slots[0])} − ${name(slots[1])} + ${name(slots[2])} ≈ ${tx(top.word.name)} (cos ${ctx.num(top.sim, 2)}). Die Richtung zwischen B und A trägt eine Bedeutung.`, en: `${name(slots[0])} − ${name(slots[1])} + ${name(slots[2])} ≈ ${tx(top.word.name)} (cos ${ctx.num(top.sim, 2)}). The direction from B to A carries a meaning.` }, 'wow');
      } else if (top.sim < 0.95) ctx.say({ de: 'Kein Wort liegt genau dort. Nicht jede Rechnung ergibt Sinn – probier eine Analogie wie „König − Mann + Frau“.', en: 'No word lies exactly there. Not every calculation makes sense – try an analogy like “king − man + woman”.' }, 'think');
    }
    redrawPlot();
    clear(goals);
    goals.append(h('li', { class: found.size >= 3 ? 'is-done' : '' }, `${found.size >= 3 ? '✅' : '⬜'} ${tx({ de: `Finde drei Analogien mit Ähnlichkeit ≥ 0,95 (${Math.min(3, found.size)} / 3).`, en: `Find three analogies with similarity ≥ 0.95 (${Math.min(3, found.size)} / 3).` })}`));
    if (!finished && found.size >= 3) {
      finished = true;
      host.append(solved(tx({ de: 'Mit Bedeutungen gerechnet!', en: 'Calculated with meanings!' })));
      ctx.finish();
    }
  }

  for (const w of WORDS) {
    const b = h('button', { class: 'kfact kfact--btn', attrs: { type: 'button' }, text: `${w.icon} ${tx(w.name)}` });
    b.addEventListener('click', () => {
      const free = slots.indexOf(null);
      if (free < 0) {
        slots.splice(0, 3, w.id, null, null);
      } else slots[free] = w.id;
      render();
    });
    chips.append(b);
  }
  clearBtn.addEventListener('click', () => {
    slots.splice(0, 3, null, null, null);
    render();
  });
  render();
};

export default game;
