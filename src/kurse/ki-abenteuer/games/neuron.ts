import { L } from '../../../curriculum/helpers';
import type { Localized } from '../../../i18n/config';
import { clear, h, s } from '../../engine/dom';
import { meter, solved } from '../../engine/ui';
import type { GameMount } from '../../types';
import { fires, matches, SITUATIONS, THRESHOLD_RANGE, WEIGHT_RANGE, weightedSum } from '../models/neuron';

/** Spiel „Ein Neuron“: Gewichte und Schwelle einstellen, bis das Neuron wie Bit entscheidet. */
const INPUTS: { icon: string; name: Localized }[] = [
  { icon: '👫', name: L('Freunde kommen mit', 'Friends are coming') },
  { icon: '😂', name: L('Der Film ist lustig', 'The film is funny') },
  { icon: '📚', name: L('Hausaufgaben offen', 'Homework not done') },
];

const game: GameMount<void> = (host, ctx) => {
  const { tx } = ctx;
  const w = [0, 0, 0];
  let threshold = 1;
  let finished = false;
  let selected = 0;

  const stepper = (label: string, get: () => number, set: (v: number) => void, range: readonly [number, number]) => {
    const value = h('output', { class: 'kstep__value' });
    const minus = h('button', { class: 'kbtn kstep__btn', attrs: { type: 'button', 'aria-label': `${label} −1` }, text: '−' });
    const plus = h('button', { class: 'kbtn kstep__btn', attrs: { type: 'button', 'aria-label': `${label} +1` }, text: '+' });
    const sync = () => {
      value.textContent = ctx.num(get());
      minus.disabled = get() <= range[0];
      plus.disabled = get() >= range[1];
    };
    minus.addEventListener('click', () => {
      set(Math.max(range[0], get() - 1));
      update();
    });
    plus.addEventListener('click', () => {
      set(Math.min(range[1], get() + 1));
      update();
    });
    return { el: h('div', { class: 'kstep' }, minus, value, plus), sync };
  };

  const steppers = INPUTS.map((input, i) => ({ input, st: stepper(tx(L(`Gewicht ${tx(input.name)}`, `Weight ${tx(input.name)}`)), () => w[i]!, (v) => (w[i] = v), WEIGHT_RANGE) }));
  const th = stepper(tx(L('Schwelle', 'Threshold')), () => threshold, (v) => (threshold = v), THRESHOLD_RANGE);

  const diagram = s('svg', { class: 'kneuron', viewBox: '0 0 320 170', role: 'img', 'aria-label': tx(L('Neuron mit drei Eingängen', 'Neuron with three inputs')) });
  const calc = h('p', { class: 'kvote' });
  const rows = h('tbody');
  const table = h('table', { class: 'ktable' }, h('thead', {}, h('tr', {}, ...INPUTS.map((x) => h('th', { attrs: { title: tx(x.name) } }, x.icon)), h('th', { text: tx(L('Summe', 'Sum')) }), h('th', { text: tx(L('Neuron', 'Neuron')) }), h('th', { text: tx(L('Bit wollte', 'Bit wanted')) }))), rows);
  const result = meter(tx(L('Wie Bit entschieden', 'Decided like Bit')), tx(L('Ziel: alle 6', 'Goal: all 6')));

  host.append(
    h(
      'div',
      { class: 'kpanel kneuron-wrap' },
      diagram,
      h(
        'div',
        { class: 'kneuron__controls' },
        ...steppers.map(({ input, st }) => h('div', { class: 'kneuron__row' }, h('span', { text: `${input.icon} ${tx(input.name)}` }), st.el)),
        h('div', { class: 'kneuron__row kneuron__row--th' }, h('span', { text: `🎚️ ${tx(L('Schwelle', 'Threshold'))}` }), th.el),
      ),
    ),
    h('div', { class: 'kpanel' }, h('p', { class: 'kpanel__title', text: tx(L('Bits Entscheidungen der letzten Wochen (Zeile antippen für die Rechnung)', 'Bit’s decisions over the last weeks (tap a row for the sum)')) }), h('div', { class: 'ktable-wrap' }, table), calc, h('div', { class: 'khint' }, result.el)),
  );

  const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  let pulseFrame = 0;

  /**
   * Signale laufen über die aktiven Eingänge zum Neuron (rot bei negativem
   * Gewicht); danach „zuckt“ das Neuron kurz. Zeigt: Nur was „an“ ist, zählt.
   */
  function pulse(body: SVGElement, out: SVGElement): void {
    cancelAnimationFrame(pulseFrame);
    if (reduced) return;
    const ys = [30, 85, 140];
    const sit = SITUATIONS[selected]!;
    const dots = ys.flatMap((y, i) => (sit.x[i] === 1 && w[i] !== 0 ? [{ y, el: s('circle', { class: `kneuron__pulse${w[i]! < 0 ? ' is-neg' : ''}`, r: 3 + Math.min(4, Math.abs(w[i]!)), cx: 52, cy: y }) }] : []));
    for (const d of dots) diagram.append(d.el);
    const start = performance.now();
    const step = (now: number) => {
      const k = Math.min(1, (now - start) / 520);
      const e = k * k * (3 - 2 * k);
      for (const d of dots) {
        d.el.setAttribute('cx', String(52 + 148 * e));
        d.el.setAttribute('cy', String(d.y + (85 - d.y) * e));
      }
      if (k < 1) {
        pulseFrame = requestAnimationFrame(step);
        return;
      }
      for (const d of dots) d.el.remove();
      body.classList.add('is-pop');
      out.classList.add('is-pop');
    };
    pulseFrame = requestAnimationFrame(step);
  }

  function drawDiagram(fire: boolean): void {
    clear(diagram);
    const ys = [30, 85, 140];
    ys.forEach((y, i) => {
      const weight = w[i]!;
      const active = SITUATIONS[selected]!.x[i] === 1;
      diagram.append(
        s('line', { class: `kneuron__wire${weight < 0 ? ' is-neg' : ''}${active ? ' is-active' : ''}`, x1: 52, y1: y, x2: 200, y2: 85, 'stroke-width': 1.5 + Math.abs(weight) * 2.2 }),
        s('circle', { class: `kneuron__in${active ? ' is-on' : ''}`, cx: 34, cy: y, r: 18 }),
        s('text', { class: 'kneuron__icon', x: 34, y: y + 7, 'text-anchor': 'middle' }, INPUTS[i]!.icon),
        s('text', { class: 'kneuron__w', x: 120, y: y + (85 - y) * 0.45 - 8, 'text-anchor': 'middle' }, ctx.num(weight)),
      );
    });
    const body = s('circle', { class: `kneuron__body${fire ? ' is-fire' : ''}`, cx: 220, cy: 85, r: 34 });
    const out = s('text', { class: 'kneuron__icon kneuron__out', x: 300, y: 94, 'text-anchor': 'middle' }, fire ? '🍿' : '🏠');
    diagram.append(body, s('text', { class: 'kneuron__sum', x: 220, y: 92, 'text-anchor': 'middle' }, `≥ ${ctx.num(threshold)}`), s('line', { class: 'kneuron__wire', x1: 254, y1: 85, x2: 280, y2: 85 }), out);
    pulse(body, out);
  }

  function update(): void {
    for (const { st } of steppers) st.sync();
    th.sync();
    clear(rows);
    SITUATIONS.forEach((sit, i) => {
      const sum = weightedSum(w, sit.x);
      const out = fires(w, threshold, sit.x);
      const ok = out === sit.go;
      const tr = h(
        'tr',
        { class: `${ok ? 'is-right' : 'is-wrong'}${i === selected ? ' is-selected' : ''}`, attrs: { tabindex: 0 } },
        ...sit.x.map((v) => h('td', { text: v ? '✔' : '–' })),
        h('td', { text: ctx.num(sum) }),
        h('td', { text: out ? '🍿' : '🏠' }),
        h('td', { text: `${sit.go ? '🍿' : '🏠'} ${ok ? '✓' : '✗'}` }),
      );
      const act = () => {
        selected = i;
        update();
      };
      tr.addEventListener('click', act);
      tr.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          act();
        }
      });
      rows.append(tr);
    });
    const sit = SITUATIONS[selected]!;
    const sum = weightedSum(w, sit.x);
    const fire = fires(w, threshold, sit.x);
    calc.textContent = `${sit.x.map((v, i) => `${ctx.num(w[i]!)}·${v}`).join(' + ')} = ${ctx.num(sum)} ${fire ? '≥' : '<'} ${ctx.num(threshold)} → ${fire ? tx(L('Kino 🍿', 'cinema 🍿')) : tx(L('zu Hause 🏠', 'stay home 🏠'))}`;
    drawDiagram(fire);
    const m = matches(w, threshold);
    result.set(m, SITUATIONS.length, `${m} / ${SITUATIONS.length}`, m === SITUATIONS.length);
    if (m === SITUATIONS.length && !finished) {
      finished = true;
      ctx.say(L('Genau so hätte ich entschieden! Das Neuron rechnet jetzt meine Entscheidungen nach.', 'That’s exactly how I would have decided! The neuron now reproduces my decisions.'), 'wow');
      host.append(solved(tx(L('Neuron eingestellt!', 'Neuron tuned!'))));
      ctx.finish();
    } else if (!finished && m >= 4) {
      ctx.say(L(`${m} von 6 passen. Schau dir die roten Zeilen an.`, `${m} of 6 match. Look at the red rows.`), 'think');
    }
  }

  update();
};

export default game;
