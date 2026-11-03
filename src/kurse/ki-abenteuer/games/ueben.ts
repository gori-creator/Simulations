import { L } from '../../../curriculum/helpers';
import { clear, h, s } from '../../engine/dom';
import { meter, solved } from '../../engine/ui';
import type { GameMount } from '../../types';
import { accuracy, classify } from '../models/knn';
import { K_VALUES, TEST, TRAIN } from '../models/probe';
import { marker, paintShade, scatter, sx, sy } from '../parts/scatter';

/**
 * Spiel „Üben und Prüfen“: Wie viele Nachbarn fragt Bit? Mit einem lernt er
 * die Übungsaufgaben auswendig, mit sehr vielen wird er ungenau. Ziel: die
 * beste Note in der Probe mit neuen Aufgaben.
 */
const game: GameMount<void> = (host, ctx) => {
  const { tx } = ctx;
  const tests = K_VALUES.map((k) => accuracy(TEST, TRAIN, k));
  const bestTest = Math.max(...tests);
  let index = 0;
  let showTest = false;
  /** Probe-Aufgaben erscheinen beim Einschalten nacheinander. */
  let popTest = false;
  let finished = false;
  const tried = new Map<number, [number, number]>();

  const plot = scatter(tx(L('Übungsdaten und Bits Entscheidung', 'Practice data and Bit’s decision')), tx(L('Merkmal 1', 'Feature 1')), tx(L('Merkmal 2', 'Feature 2')));
  const slider = h('input', { attrs: { type: 'range', min: 0, max: K_VALUES.length - 1, step: 1, value: 0, 'aria-label': tx(L('Zahl der Nachbarn', 'Number of neighbours')) } });
  const kOut = h('strong');
  const toggle = h('button', { class: 'kbtn', attrs: { type: 'button', 'aria-pressed': 'false' }, text: tx(L('Probe-Aufgaben zeigen', 'Show test questions')) });
  const trainM = meter(tx(L('Übungsaufgaben (kennt Bit)', 'Practice questions (Bit knows them)')));
  const testM = meter(tx(L('Probe (neue Aufgaben)', 'Test (new questions)')), tx(L('Ziel: die beste Note in der Probe', 'Goal: the best score in the test')));
  const notes = h('ul', { class: 'kscore' });
  const panel = h(
    'div',
    { class: 'kpanel' },
    h('div', { class: 'kslider' }, h('label', { class: 'kslider__label' }, h('span', { text: tx(L('Wie viele Nachbarn fragt Bit?', 'How many neighbours does Bit ask?')) }), kOut), slider),
    plot.svg,
    h('p', { class: 'klegend' }, h('span', { class: 'klegend__a' }), tx(L(' Gruppe A', ' Group A')), h('span', { class: 'klegend__b' }), tx(L(' Gruppe B', ' Group B')), h('span', { class: 'klegend__test' }), tx(L(' Probe-Aufgabe', ' Test question'))),
    h('div', { class: 'krow' }, toggle),
    h('div', { class: 'kgrid-2 khint' }, trainM.el, testM.el),
    h('p', { class: 'kpanel__title khint', text: tx(L('Notizblock', 'Notepad')) }),
    notes,
  );
  host.append(panel);

  function draw(): void {
    const k = K_VALUES[index]!;
    kOut.textContent = String(k);
    slider.setAttribute('aria-valuetext', String(k));
    paintShade(plot.shade, (x, y) => classify({ x, y }, TRAIN, k), 22);
    clear(plot.points);
    for (const p of TRAIN) plot.points.append(marker(p.x, p.y, p.label, 6));
    clear(plot.over);
    if (showTest) {
      TEST.forEach((p, i) => {
        const ok = classify(p, TRAIN, k) === p.label;
        const dot = s('circle', { class: `kplot__test${ok ? '' : ' kplot__test--bad'}${popTest ? ' is-pop' : ''}`, cx: sx(p.x), cy: sy(p.y), r: 5 });
        dot.style.setProperty('--d', String(i));
        plot.over.append(dot);
      });
    }
    popTest = false;
    const train = accuracy(TRAIN, TRAIN, k);
    const test = tests[index]!;
    trainM.set(Math.round(train * 100), 100, ctx.percent(train));
    testM.set(Math.round(test * 100), 100, ctx.percent(test), test === bestTest);
    if (!tried.has(k)) {
      tried.set(k, [train, test]);
      clear(notes);
      for (const [kk, [a, b]] of [...tried].sort((x, y) => x[0] - y[0])) {
        notes.append(h('li', {}, h('span', { text: tx(L(`${kk} Nachbar${kk === 1 ? '' : 'n'}`, `${kk} neighbour${kk === 1 ? '' : 's'}`)) }), h('span', { text: tx(L(`Übung ${ctx.percent(a)} · Probe ${ctx.percent(b)}`, `Practice ${ctx.percent(a)} · Test ${ctx.percent(b)}`)) })));
      }
    }
    if (k === 1) ctx.say(L('Mit einem Nachbarn kann ich alle Übungsaufgaben auswendig – 100 %! Aber wie läuft die Probe?', 'With one neighbour I know all practice questions by heart – 100%! But how does the test go?'), 'wink');
    else if (test === bestTest) ctx.say(L(`Mit ${k} Nachbarn schaffe ich in der Probe ${ctx.percent(test)} – meine beste Note! Ich habe das Muster erkannt statt auswendig gelernt.`, `With ${k} neighbours I get ${ctx.percent(test)} in the test – my best score! I picked up the pattern instead of memorising.`), 'wow');
    else if (k >= 21) ctx.say(L('So viele Nachbarn? Jetzt frage ich halb die ganze Klasse und werde ungenau.', 'So many neighbours? Now I’m asking half the class and getting sloppy.'), 'sad');
    else ctx.say(L(`Probe: ${ctx.percent(test)}. Geht es noch besser?`, `Test: ${ctx.percent(test)}. Can it get better?`), 'think');
    if (!finished && test === bestTest && tried.has(1)) {
      finished = true;
      panel.append(solved(tx(L('Beste Einstellung gefunden!', 'Best setting found!'))));
      ctx.finish();
    }
  }

  slider.addEventListener('input', () => {
    index = Number(slider.value);
    draw();
  });
  toggle.addEventListener('click', () => {
    showTest = !showTest;
    popTest = showTest;
    toggle.setAttribute('aria-pressed', String(showTest));
    draw();
  });
  draw();
};

export default game;
