import { L } from '../../../curriculum/helpers';
import { clear, h, s } from '../../engine/dom';
import { meter, solved } from '../../engine/ui';
import type { GameMount } from '../../types';
import { classify, nearest } from '../models/knn';
import { MYSTERY, PETS, type Pet } from '../models/nachbarn';
import { legend, marker, scatter, sx, sy, VIEW } from '../parts/scatter';

/**
 * Spiel „Frag die Nachbarn“: Zahl der Nachbarn wählen, ein Fragezeichen-Tier
 * antippen – Bit zeigt seine Nachbarn und stimmt ab. „Alle prüfen“ verrät die Lösung.
 */
const NAME: Record<Pet, { de: string; en: string }> = { rabbit: L('Kaninchen', 'rabbit'), guinea: L('Meerschweinchen', 'guinea pig') };

const game: GameMount<void> = (host, ctx) => {
  const { tx } = ctx;
  let k = 1;
  let selected = 0;
  let checked = false;
  let finished = false;
  const triedK = new Set<number>();

  const plot = scatter(tx(L('Kaninchen und Meerschweinchen nach Ohrlänge und Gewicht', 'Rabbits and guinea pigs by ear length and weight')), tx(L('Ohrlänge', 'Ear length')), tx(L('Gewicht', 'Weight')));
  for (const p of PETS) plot.points.append(marker(p.x, p.y, p.label === 'rabbit' ? 'a' : 'b'));

  const mysteries = MYSTERY.map((m, i) => {
    const g = s('g', { class: 'kpoint', tabindex: 0, role: 'button', 'aria-label': tx(L(`Unbekanntes Tier ${i + 1}`, `Unknown animal ${i + 1}`)) });
    g.append(s('circle', { class: 'kpoint__hit', cx: sx(m.x), cy: sy(m.y), r: 16 }), s('circle', { class: 'kplot__mystery', cx: sx(m.x), cy: sy(m.y), r: 11 }), s('text', { class: 'kplot__text', x: sx(m.x), y: sy(m.y) + 5, 'text-anchor': 'middle' }, String(i + 1)));
    const act = () => {
      selected = i;
      draw();
    };
    g.addEventListener('click', act);
    g.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        act();
      }
    });
    plot.over.append(g);
    return g;
  });

  const kButtons = [1, 3, 5].map((n) => {
    const b = h('button', { class: 'kbtn', attrs: { type: 'button', 'aria-pressed': String(n === k) }, text: String(n) });
    b.addEventListener('click', () => {
      k = n;
      checked = false;
      for (const x of kButtons) x.setAttribute('aria-pressed', String(x === b));
      draw();
    });
    return b;
  });
  const vote = h('p', { class: 'kvote', attrs: { 'aria-live': 'polite' } });
  const check = h('button', { class: 'kbtn kbtn--main', attrs: { type: 'button' }, text: tx(L('Alle prüfen', 'Check all')) });
  const result = meter(tx(L('Richtig erkannt', 'Recognised correctly')), tx(L('Ziel: alle 4', 'Goal: all 4')));
  result.set(0, 4, '– / 4');
  const panel = h(
    'div',
    { class: 'kpanel' },
    h('div', { class: 'krow' }, h('strong', { text: tx(L('Wie viele Nachbarn fragt Bit?', 'How many neighbours does Bit ask?')) }), ...kButtons),
    plot.svg,
    legend(tx(L('Kaninchen', 'Rabbits')), tx(L('Meerschweinchen', 'Guinea pigs'))),
    vote,
    h('div', { class: 'krow' }, check),
    h('div', { class: 'khint' }, result.el),
  );
  host.append(panel);

  function draw(grow = true): void {
    clear(plot.under);
    const m = MYSTERY[selected]!;
    const near = nearest(m, PETS, k);
    // Suchblase: wächst bis zum k-ten Nachbarn (Ellipse, weil die Achsen
    // verschieden gestreckt sind – in Weltkoordinaten ist es ein Kreis).
    const far = near[near.length - 1];
    if (far) {
      // Rand zwischen dem k-ten und dem nächsten Tier: nur Gezählte liegen drin
      const dk = Math.hypot(far.x - m.x, far.y - m.y);
      const next = nearest(m, PETS, k + 1)[k];
      const gap = next ? Math.hypot(next.x - m.x, next.y - m.y) - dk : 1;
      const d = dk + Math.min(0.35, gap / 2);
      plot.under.append(s('ellipse', { class: `kplot__search${grow ? ' is-grow' : ''}`, cx: sx(m.x), cy: sy(m.y), rx: (d / 10) * (VIEW.w - VIEW.left - VIEW.right), ry: (d / 10) * (VIEW.h - VIEW.top - VIEW.bottom) }));
    }
    near.forEach((n, i) => {
      const link = s('line', { class: `kplot__link${grow ? ' is-grow' : ''}`, x1: sx(m.x), y1: sy(m.y), x2: sx(n.x), y2: sy(n.y) });
      const ring = s('circle', { class: `kplot__ring${grow ? ' is-pop' : ''}`, cx: sx(n.x), cy: sy(n.y), r: 12 });
      for (const el of [link, ring]) el.style.setProperty('--d', String(i));
      link.style.setProperty('--ox', `${sx(m.x)}px`);
      link.style.setProperty('--oy', `${sy(m.y)}px`);
      plot.under.append(link, ring);
    });
    mysteries.forEach((g, i) => g.classList.toggle('is-selected', i === selected));
    const rabbits = near.filter((n) => n.label === 'rabbit').length;
    const guess = classify(m, PETS, k)!;
    vote.textContent = tx(
      L(
        `Tier ${selected + 1}: ${rabbits} Kaninchen, ${near.length - rabbits} Meerschweinchen → Bit sagt: ${NAME[guess].de}`,
        `Animal ${selected + 1}: ${rabbits} rabbit(s), ${near.length - rabbits} guinea pig(s) → Bit says: ${NAME[guess].en}`,
      ),
    );
    // Lösung nur nach „Alle prüfen“ zeigen
    for (const g of mysteries) g.querySelector('.kmark')?.remove();
    if (checked) {
      MYSTERY.forEach((mm, i) => {
        const ok = classify(mm, PETS, k) === mm.label;
        mysteries[i]!.append(s('text', { class: `kmark ${ok ? 'kmark--ok' : 'kmark--bad'}`, x: sx(mm.x) + 14, y: sy(mm.y) - 10 }, ok ? '✓' : '✗'));
      });
    }
  }

  check.addEventListener('click', () => {
    checked = true;
    triedK.add(k);
    const right = MYSTERY.filter((m) => classify(m, PETS, k) === m.label).length;
    result.set(right, 4, `${right} / 4`, right === 4);
    draw(false);
    if (right === 4) {
      ctx.say(L(`Alle 4 richtig mit ${k} Nachbarn! Das Zwergkaninchen kann mich jetzt nicht mehr täuschen.`, `All 4 correct with ${k} neighbours! The dwarf rabbit can’t fool me any more.`), 'wow');
      if (!finished) {
        finished = true;
        panel.append(solved(tx(L('Gut abgestimmt!', 'Good vote!'))));
        ctx.finish();
      }
    } else {
      ctx.say(L(`${right} von 4. Schau dir Tier 1 an: Sein nächster Nachbar ist ein Zwergkaninchen mit kurzen Ohren. Probier mehr Nachbarn!`, `${right} of 4. Look at animal 1: its nearest neighbour is a dwarf rabbit with short ears. Try more neighbours!`), 'think');
    }
  });

  draw();
};

export default game;
