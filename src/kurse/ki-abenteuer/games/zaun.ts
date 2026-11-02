import { L } from '../../../curriculum/helpers';
import { clear, h, s } from '../../engine/dom';
import { meter, solved } from '../../engine/ui';
import type { GameMount } from '../../types';
import { side, type Pt } from '../models/linie';
import { marker, paintShade, scatter, sx, sy } from '../parts/scatter';

/**
 * Spiel „Neuronen im Team“: Schafe stehen in der Mitte, Wölfe drumherum.
 * Jedes Neuron ist ein gerader Zaun. Ein Neuron allein schafft es nicht; mit
 * drei Neuronen, die alle „Schaf“ sagen müssen (ein viertes Neuron verknüpft
 * sie mit UND), entsteht ein Dreieck, das alle Schafe einschließt.
 */
interface Animal extends Pt {
  sheep: boolean;
}

const SHEEP: Pt[] = [{ x: 5, y: 5 }, { x: 4.5, y: 5.5 }, { x: 5.6, y: 5.4 }, { x: 4.8, y: 4.2 }, { x: 5.4, y: 4.5 }, { x: 4.4, y: 4.8 }, { x: 5.2, y: 6.1 }, { x: 5.9, y: 4.8 }];
const WOLVES: Pt[] = [{ x: 1.5, y: 8.5 }, { x: 5, y: 9 }, { x: 8.6, y: 8.2 }, { x: 9, y: 5 }, { x: 8.4, y: 1.6 }, { x: 5, y: 1.2 }, { x: 1.4, y: 1.8 }, { x: 1, y: 5 }, { x: 2.6, y: 7.6 }, { x: 7.3, y: 7 }, { x: 7.2, y: 3 }, { x: 2.8, y: 3 }];
const ANIMALS: Animal[] = [...SHEEP.map((p) => ({ ...p, sheep: true })), ...WOLVES.map((p) => ({ ...p, sheep: false }))];
const CENTER: Pt = { x: 5, y: 5 };

const START: [Pt, Pt][] = [
  [{ x: 1, y: 3.4 }, { x: 9, y: 3.6 }],
  [{ x: 2.5, y: 9.5 }, { x: 3.2, y: 0.5 }],
  [{ x: 7.2, y: 9.5 }, { x: 7.6, y: 0.5 }],
];

const game: GameMount<void> = (host, ctx) => {
  const { tx } = ctx;
  const fences: [Pt, Pt][] = START.map(([a, b]) => [{ ...a }, { ...b }]);
  let active = 1;
  let finished = false;
  let bestOne = 0;

  const plot = scatter(tx(L('Schafe in der Mitte, Wölfe außen herum', 'Sheep in the middle, wolves around them')), 'x', 'y');
  const lines = fences.map(() => s('line', { class: 'kplot__line' }));
  for (const l of lines) plot.under.append(l);
  for (const a of ANIMALS) plot.points.append(s('text', { class: 'kzaun__animal', x: sx(a.x), y: sy(a.y) + 7, 'text-anchor': 'middle' }, a.sheep ? '🐑' : '🐺'));
  const result = meter(tx(L('Richtig eingezäunt', 'Correctly fenced in')), tx(L('Ziel: alle 20 Tiere richtig', 'Goal: all 20 animals right')));
  const nRow = h('div', { class: 'krow' });
  host.append(h('div', { class: 'kpanel' }, plot.svg, h('p', { class: 'kpanel__title', text: tx(L('Wie viele Neuronen (Zäune) darf Bit benutzen?', 'How many neurons (fences) may Bit use?')) }), nRow, h('div', { class: 'khint' }, result.el), h('p', { class: 'khint', text: tx(L('Zieh an den weißen Griffen. Ein Schaf ist nur sicher, wenn es auf der Innenseite ALLER Zäune steht.', 'Drag the white handles. A sheep is only safe if it is on the inner side of ALL fences.')) })));

  for (const n of [1, 3]) {
    const b = h('button', { class: 'kbtn', attrs: { type: 'button', 'aria-pressed': String(n === active), 'data-n': n }, text: tx(n === 1 ? L('1 Neuron', '1 neuron') : L('3 Neuronen', '3 neurons')) });
    b.addEventListener('click', () => {
      active = n;
      for (const x of nRow.querySelectorAll<HTMLButtonElement>('button')) x.setAttribute('aria-pressed', String(Number(x.dataset.n) === active));
      update();
    });
    nRow.append(b);
  }

  /** Neuron i sagt „Schaf“, wenn der Punkt auf derselben Seite wie die Mitte liegt. */
  const inside = (pt: Pt) => fences.slice(0, active).every(([a, b]) => side(a, b, pt) * side(a, b, CENTER) > 0);

  const handles = fences.flatMap((f, fi) =>
    f.map((pt, k) => {
      const el = s('circle', { class: 'kplot__handle', r: 10, tabindex: 0, role: 'slider', 'aria-label': tx(L(`Zaun ${fi + 1}, Griff ${k + 1} (Pfeiltasten)`, `Fence ${fi + 1}, handle ${k + 1} (arrow keys)`)) });
      el.addEventListener('pointerdown', (event: PointerEvent) => {
        event.preventDefault();
        el.setPointerCapture(event.pointerId);
        const move = (ev: PointerEvent) => {
          const w = plot.toWorld(ev);
          pt.x = w.x;
          pt.y = w.y;
          update();
        };
        const up = () => {
          el.removeEventListener('pointermove', move);
          el.removeEventListener('pointerup', up);
        };
        el.addEventListener('pointermove', move);
        el.addEventListener('pointerup', up);
      });
      el.addEventListener('keydown', (event: KeyboardEvent) => {
        const d = event.shiftKey ? 1 : 0.25;
        const m: Record<string, [number, number]> = { ArrowLeft: [-d, 0], ArrowRight: [d, 0], ArrowUp: [0, d], ArrowDown: [0, -d] };
        const mv = m[event.key];
        if (!mv) return;
        event.preventDefault();
        pt.x = Math.max(0, Math.min(10, pt.x + mv[0]));
        pt.y = Math.max(0, Math.min(10, pt.y + mv[1]));
        update();
      });
      plot.over.append(el);
      return { el, fi, pt };
    }),
  );

  function update(): void {
    fences.forEach(([a, b], i) => {
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const ext = 20 / (Math.hypot(dx, dy) || 1);
      const l = lines[i]!;
      const on = i < active;
      l.setAttribute('x1', String(sx(a.x - dx * ext)));
      l.setAttribute('y1', String(sy(a.y - dy * ext)));
      l.setAttribute('x2', String(sx(b.x + dx * ext)));
      l.setAttribute('y2', String(sy(b.y + dy * ext)));
      l.setAttribute('visibility', on ? 'visible' : 'hidden');
    });
    for (const hd of handles) {
      hd.el.setAttribute('cx', String(sx(hd.pt.x)));
      hd.el.setAttribute('cy', String(sy(hd.pt.y)));
      hd.el.setAttribute('visibility', hd.fi < active ? 'visible' : 'hidden');
    }
    paintShade(plot.shade, (x, y) => (inside({ x, y }) ? 'a' : null), 30);
    const correct = ANIMALS.filter((a) => inside(a) === a.sheep).length;
    result.set(correct, ANIMALS.length, `${correct} / ${ANIMALS.length}`, correct === ANIMALS.length);
    if (active === 1) {
      if (correct > bestOne) bestOne = correct;
      if (bestOne >= 14) ctx.say(L(`Mit einem Zaun schaffe ich höchstens ${bestOne} von 20 – irgendwo stehen immer Wölfe auf der Schafseite. Versuch es mit 3 Neuronen!`, `With one fence I manage at most ${bestOne} of 20 – there are always wolves on the sheep side. Try 3 neurons!`), 'think');
    }
    if (active === 3 && correct === ANIMALS.length && !finished) {
      finished = true;
      ctx.say(L('Geschafft! Drei Neuronen ziehen drei Zäune, ein viertes sagt nur „Schaf“, wenn alle drei zustimmen. Zusammen schaffen sie, was eines allein nie könnte.', 'Done! Three neurons draw three fences, a fourth only says “sheep” if all three agree. Together they manage what one alone never could.'), 'wow');
      host.append(solved(tx(L('Schafe in Sicherheit!', 'Sheep are safe!'))));
      ctx.finish();
    }
  }

  clear(plot.shade);
  update();
};

export default game;
