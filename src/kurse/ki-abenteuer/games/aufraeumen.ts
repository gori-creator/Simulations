import { L } from '../../../curriculum/helpers';
import { clear, h, s } from '../../engine/dom';
import { meter, solved } from '../../engine/ui';
import type { GameMount } from '../../types';
import { accuracy, classify, type Sample } from '../models/knn';
import { CITRUS, CITRUS_TEST, MISLABELED, withMistakes, type Citrus } from '../models/zitrus';
import { legend, marker, paintShade, scatter, sx, sy } from '../parts/scatter';

/**
 * Spiel „Falsche Daten“: Drei Früchte sind falsch beschriftet. Wer sie antippt,
 * korrigiert sie. Bit lernt mit dem nächsten Nachbarn; der Hintergrund zeigt,
 * was Bit gelernt hat, der Balken seine Probe mit neuen Früchten.
 */
const game: GameMount<void> = (host, ctx) => {
  const { tx } = ctx;
  const data: Sample<Citrus>[] = withMistakes();
  const fixed = new Set<number>();
  let finished = false;

  const plot = scatter(tx(L('Bits Trainingsdaten: Zitronen und Orangen', 'Bit’s training data: lemons and oranges')), tx(L('Größe', 'Size')), tx(L('Süße', 'Sweetness')));
  const result = meter(tx(L('Bits Probe mit neuen Früchten', 'Bit’s test with new fruit')), tx(L('Ziel: 100 %', 'Goal: 100%')));
  const found = h('p', { class: 'khint' });
  const panel = h('div', { class: 'kpanel' }, plot.svg, legend(tx(L('Zitrone', 'Lemon')), tx(L('Orange', 'Orange'))), found, h('div', { class: 'khint' }, result.el));
  host.append(panel);

  function draw(): void {
    clear(plot.points);
    data.forEach((f, i) => {
      const group = f.label === 'lemon' ? 'a' : 'b';
      const name = tx(f.label === 'lemon' ? L('Zitrone', 'Lemon') : L('Orange', 'Orange'));
      const g = s('g', { class: 'kpoint', tabindex: 0, role: 'button', 'aria-label': tx(L(`${name} bei Größe ${ctx.num(f.x, 1)}, Süße ${ctx.num(f.y, 1)} – antippen zum Umbeschriften`, `${name} at size ${ctx.num(f.x, 1)}, sweetness ${ctx.num(f.y, 1)} – tap to relabel`)) });
      g.append(s('circle', { class: 'kpoint__hit', cx: sx(f.x), cy: sy(f.y), r: 15 }), marker(f.x, f.y, group));
      if (fixed.has(i)) g.append(s('circle', { class: 'kpoint__ok', cx: sx(f.x), cy: sy(f.y), r: 13 }));
      const act = () => flip(i);
      g.addEventListener('click', act);
      g.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          act();
        }
      });
      plot.points.append(g);
    });
    paintShade(plot.shade, (x, y) => (classify({ x, y }, data, 1) === 'lemon' ? 'a' : 'b'));
    const share = accuracy(CITRUS_TEST, data, 1);
    result.set(Math.round(share * 100), 100, ctx.percent(share), share === 1);
    found.textContent = tx(L(`Gefunden: ${fixed.size} von ${MISLABELED.length} Fehlern`, `Found: ${fixed.size} of ${MISLABELED.length} mistakes`));
  }

  function flip(i: number): void {
    if (finished || fixed.has(i)) return;
    if ((MISLABELED as readonly number[]).includes(i)) {
      data[i] = { ...data[i]!, label: CITRUS[i]!.label };
      fixed.add(i);
      ctx.say(fixed.size < MISLABELED.length ? L('Gut erkannt! Die war falsch beschriftet. Schau, wie sich mein Bild verändert.', 'Well spotted! That one was labelled wrongly. Look how my picture changes.') : L('Alle Fehler gefunden! Jetzt lerne ich wieder richtig.', 'All mistakes found! Now I learn properly again.'), 'wow');
    } else {
      ctx.mistake();
      ctx.say(L('Die passt zu ihren Nachbarn – sie war richtig. Such Früchte, die mitten in der falschen Gruppe liegen.', 'That one fits its neighbours – it was correct. Look for fruit sitting in the middle of the wrong group.'), 'sad');
    }
    draw();
    const focusTarget = plot.points.children[i] as SVGGElement | undefined;
    focusTarget?.focus();
    if (fixed.size === MISLABELED.length && !finished) {
      finished = true;
      panel.append(solved(tx(L('Daten aufgeräumt!', 'Data cleaned up!'))));
      ctx.finish();
    }
  }

  draw();
};

export default game;
