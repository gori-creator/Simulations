import { L } from '../../../curriculum/helpers';
import { clear, h, s } from '../../engine/dom';
import { meter, solved } from '../../engine/ui';
import type { GameMount } from '../../types';
import { bestSplit, side, type Pt } from '../models/linie';
import { CITRUS } from '../models/zitrus';
import { legend, marker, paintShade, scatter, sx, sy } from '../parts/scatter';

/** Spiel „Die Grenze finden“: Gerade an zwei Griffen ziehen, bis sie Zitronen und Orangen trennt. */
const game: GameMount<void> = (host, ctx) => {
  const { tx } = ctx;
  const p: Pt = { x: 1.5, y: 8 };
  const q: Pt = { x: 8.5, y: 8.6 };
  let finished = false;

  const plot = scatter(tx(L('Zitronen und Orangen nach Größe und Süße', 'Lemons and oranges by size and sweetness')), tx(L('Größe', 'Size')), tx(L('Süße', 'Sweetness')));
  for (const f of CITRUS) plot.points.append(marker(f.x, f.y, f.label === 'lemon' ? 'a' : 'b'));
  const line = s('line', { class: 'kplot__line' });
  plot.under.append(line);

  const handles = [p, q].map((pt, i) => {
    const el = s('circle', { class: 'kplot__handle', r: 11, tabindex: 0, role: 'slider', 'aria-label': tx(L(`Griff ${i + 1} der Linie (Pfeiltasten)`, `Line handle ${i + 1} (arrow keys)`)) });
    plot.over.append(el);
    el.addEventListener('pointerdown', (event) => {
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
        el.removeEventListener('pointercancel', up);
      };
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerup', up);
      el.addEventListener('pointercancel', up);
    });
    el.addEventListener('keydown', (event) => {
      const d = event.shiftKey ? 1 : 0.25;
      const moves: Record<string, [number, number]> = { ArrowLeft: [-d, 0], ArrowRight: [d, 0], ArrowUp: [0, d], ArrowDown: [0, -d] };
      const m = moves[event.key];
      if (!m) return;
      event.preventDefault();
      pt.x = Math.max(0, Math.min(10, pt.x + m[0]));
      pt.y = Math.max(0, Math.min(10, pt.y + m[1]));
      update();
    });
    return el;
  });

  const result = meter(tx(L('Richtig getrennt', 'Correctly separated')), tx(L('Ziel: alle 24', 'Goal: all 24')));
  const panel = h('div', { class: 'kpanel' }, plot.svg, legend(tx(L('Zitronen', 'Lemons')), tx(L('Orangen', 'Oranges'))), h('div', { class: 'khint' }, result.el), h('p', { class: 'khint', text: tx(L('Zieh an den weißen Griffen. Mit der Tastatur: Griff antippen, dann Pfeiltasten.', 'Drag the white handles. With the keyboard: focus a handle, then use the arrow keys.')) }));
  host.append(panel);

  let lastCorrect = -1;
  function update(): void {
    // Gerade über die ganze Fläche verlängern
    const dx = q.x - p.x;
    const dy = q.y - p.y;
    const len = Math.hypot(dx, dy) || 1;
    const ext = 20 / len;
    line.setAttribute('x1', String(sx(p.x - dx * ext)));
    line.setAttribute('y1', String(sy(p.y - dy * ext)));
    line.setAttribute('x2', String(sx(q.x + dx * ext)));
    line.setAttribute('y2', String(sy(q.y + dy * ext)));
    handles[0]!.setAttribute('cx', String(sx(p.x)));
    handles[0]!.setAttribute('cy', String(sy(p.y)));
    handles[1]!.setAttribute('cx', String(sx(q.x)));
    handles[1]!.setAttribute('cy', String(sy(q.y)));
    handles.forEach((el, i) => el.setAttribute('aria-valuetext', `${ctx.num([p, q][i]!.x, 1)} | ${ctx.num([p, q][i]!.y, 1)}`));
    const split = bestSplit(p, q, CITRUS, 'lemon', 'orange');
    paintShade(plot.shade, (x, y) => {
      const v = side(p, q, { x, y });
      if (v === 0) return null;
      return (v > 0 ? split.left : split.right) === 'lemon' ? 'a' : 'b';
    });
    const all = split.correct === split.total;
    result.set(split.correct, split.total, `${split.correct} / ${split.total}`, all);
    if (split.correct !== lastCorrect) {
      lastCorrect = split.correct;
      if (all) ctx.say(L('Perfekt! Auf der einen Seite nur Zitronen, auf der anderen nur Orangen.', 'Perfect! Only lemons on one side, only oranges on the other.'), 'wow');
      else if (split.correct >= 20) ctx.say(L(`${split.correct} von 24 – fast! Nur noch ${24 - split.correct} auf der falschen Seite.`, `${split.correct} of 24 – nearly! Only ${24 - split.correct} on the wrong side.`), 'happy');
    }
    if (all && !finished) {
      finished = true;
      panel.append(solved(tx(L('Grenze gefunden!', 'Border found!'))));
      ctx.finish();
    }
  }

  clear(plot.shade);
  update();
};

export default game;
