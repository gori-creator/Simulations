import type { Localized } from '../../../i18n/config';
import { clear, h, s, seeded } from '../../engine/dom';
import { solved } from '../../engine/ui';
import type { GameMount } from '../../types';
import { accuracy, createNet, dataset, predictProb, trainEpoch, type Act, type DatasetId, type Net, type Sample } from '../models/mlp';

/**
 * Spiel „Netz-Spielplatz“: echte kleine Netze im Browser trainieren.
 * Datensatz, Schichten, Neuronen, Aktivierung und Lernrate wählen; das
 * Wärmebild zeigt, was das Netz für jeden Punkt vorhersagt, das Diagramm die
 * Gewichte (Farbe = Vorzeichen, Dicke = Betrag).
 * Missionen: Kreis ≥ 95 %; XOR ≥ 95 % mit höchstens 3 verborgenen Neuronen;
 * Bonus: Spirale ≥ 90 % (jeweils Genauigkeit auf Testdaten).
 */
const DATASETS: { id: DatasetId; name: Localized }[] = [
  { id: 'linie', name: { de: 'Linie', en: 'Line' } },
  { id: 'kreis', name: { de: 'Kreis', en: 'Circle' } },
  { id: 'xor', name: { de: 'XOR', en: 'XOR' } },
  { id: 'spirale', name: { de: 'Spirale', en: 'Spiral' } },
];
const ACTS: Act[] = ['tanh', 'relu', 'sigmoid'];
const RATES = [0.01, 0.03, 0.1, 0.3, 1];
const GRID = 48;
const MAX_EPOCHS = 3000;

const game: GameMount<void> = (host, ctx) => {
  const { tx } = ctx;
  let data: DatasetId = 'kreis';
  let layers = [3];
  let activation: Act = 'tanh';
  let lr = 0.1;
  let net: Net = createNet(layers, activation, 1);
  let sets = dataset(data);
  let epochs = 0;
  let loss = NaN;
  let history: number[] = [];
  let running = false;
  let raf = 0;
  let seed = 1;
  const rnd = seeded(7);
  const done = { kreis: false, xor: false, spirale: false };
  let finished = false;

  const canvas = h('canvas', { class: 'kplay__canvas', attrs: { width: GRID * 6, height: GRID * 6, role: 'img', 'aria-label': tx({ de: 'Vorhersage des Netzes als Wärmebild mit Datenpunkten', en: 'Network prediction as a heat map with data points' }) } });
  const g = canvas.getContext('2d')!;
  const netSvg = s('svg', { class: 'kplay__net', viewBox: '0 0 300 170', role: 'img', 'aria-label': tx({ de: 'Aufbau des Netzes mit Gewichten', en: 'Network structure with weights' }) });
  const spark = s('svg', { class: 'kspark', viewBox: '0 0 300 60', role: 'img', 'aria-label': tx({ de: 'Verlauf des Verlusts', en: 'Loss over time' }) });
  const stats = h('p', { class: 'kformula', attrs: { 'aria-live': 'off' } });
  const controls = h('div', { class: 'kplay__controls' });
  const goals = h('ul', { class: 'kgoals' });
  const play = h('button', { class: 'kbtn kbtn--main', attrs: { type: 'button' } });
  const plus10 = h('button', { class: 'kbtn', attrs: { type: 'button' }, text: `+10 ${tx({ de: 'Epochen', en: 'epochs' })}` });
  const reinit = h('button', { class: 'kbtn', attrs: { type: 'button' }, text: `↺ ${tx({ de: 'Neu würfeln', en: 'Re-initialise' })}` });
  host.append(
    h('div', { class: 'kpanel kplay' }, h('div', { class: 'kplay__left' }, canvas, stats, h('div', { class: 'krow' }, play, plus10, reinit), spark), h('div', { class: 'kplay__right' }, netSvg, controls)),
    h('div', { class: 'kpanel' }, h('p', { class: 'kpanel__title', text: tx({ de: 'Missionen (Genauigkeit auf Testdaten)', en: 'Missions (accuracy on test data)' }) }), goals),
  );

  // Farben aus dem Stylesheet (hell/dunkel)
  const probe = document.createElement('canvas').getContext('2d')!;
  const rgb = (cssVar: string, fallback: string): [number, number, number] => {
    probe.fillStyle = fallback;
    probe.fillStyle = getComputedStyle(host).getPropertyValue(cssVar).trim() || fallback;
    const hex = probe.fillStyle as string;
    if (hex.startsWith('#')) return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
    const m = hex.match(/\d+/g) ?? ['0', '0', '0'];
    return [Number(m[0]), Number(m[1]), Number(m[2])];
  };
  const colA = rgb('--k-a', '#2b5fd9');
  const colB = rgb('--k-b', '#d9480f');
  const colBg = rgb('--surface', '#ffffff');

  const group = (label: string, ...children: HTMLElement[]) => h('div', { class: 'kplay__group' }, h('span', { class: 'kplay__label', text: label }), h('div', { class: 'krow' }, ...children));
  const toggleRow = <T,>(items: T[], current: () => T, text: (v: T) => string, set: (v: T) => void) =>
    items.map((v) => {
      const b = h('button', { class: 'kbtn kbtn--small', attrs: { type: 'button', 'aria-pressed': String(v === current()) }, text: text(v) });
      b.addEventListener('click', () => {
        set(v);
        buildControls();
      });
      return b;
    });

  function rebuild(): void {
    net = createNet(layers, activation, seed);
    epochs = 0;
    loss = NaN;
    history = [];
    render();
  }

  function buildControls(): void {
    clear(controls);
    controls.append(
      group(tx({ de: 'Daten', en: 'Data' }), ...toggleRow(DATASETS, () => DATASETS.find((d) => d.id === data)!, (d) => tx(d.name), (d) => {
        data = d.id;
        sets = dataset(data);
        rebuild();
      })),
      group(tx({ de: 'Verborgene Schichten', en: 'Hidden layers' }), ...toggleRow([1, 2], () => layers.length, String, (n) => {
        layers = n === 1 ? [layers[0]!] : [layers[0]!, layers[1] ?? layers[0]!];
        rebuild();
      })),
    );
    layers.forEach((count, i) => {
      const minus = h('button', { class: 'kbtn kstep__btn', attrs: { type: 'button', 'aria-label': tx({ de: `Schicht ${i + 1}: Neuron weniger`, en: `Layer ${i + 1}: one neuron less` }) }, text: '−' });
      const plus = h('button', { class: 'kbtn kstep__btn', attrs: { type: 'button', 'aria-label': tx({ de: `Schicht ${i + 1}: Neuron mehr`, en: `Layer ${i + 1}: one neuron more` }) }, text: '+' });
      minus.disabled = count <= 1;
      plus.disabled = count >= 8;
      minus.addEventListener('click', () => {
        layers[i] = count - 1;
        rebuild();
        buildControls();
      });
      plus.addEventListener('click', () => {
        layers[i] = count + 1;
        rebuild();
        buildControls();
      });
      controls.append(group(tx({ de: `Neuronen in Schicht ${i + 1}`, en: `Neurons in layer ${i + 1}` }), h('div', { class: 'kstep' }, minus, h('output', { class: 'kstep__value', text: String(count) }), plus)));
    });
    controls.append(
      group(tx({ de: 'Aktivierung', en: 'Activation' }), ...toggleRow(ACTS, () => activation, (a) => (a === 'relu' ? 'ReLU' : a === 'sigmoid' ? 'Sigmoid' : 'tanh'), (a) => {
        activation = a;
        rebuild();
      })),
      group(tx({ de: 'Lernrate', en: 'Learning rate' }), ...toggleRow(RATES, () => lr, (r) => ctx.num(r, r < 0.1 ? 2 : 1), (r) => {
        lr = r;
      })),
    );
  }

  function drawCanvas(): void {
    const w = canvas.width;
    const cell = w / GRID;
    for (let i = 0; i < GRID; i++) {
      for (let j = 0; j < GRID; j++) {
        const x = -1 + ((i + 0.5) / GRID) * 2;
        const y = 1 - ((j + 0.5) / GRID) * 2;
        const p = predictProb(net, x, y);
        const t = Math.abs(p - 0.5) * 2 * 0.7;
        const c = p >= 0.5 ? colA : colB;
        g.fillStyle = `rgb(${c.map((v, k) => Math.round(colBg[k]! + (v - colBg[k]!) * t)).join(',')})`;
        g.fillRect(i * cell, j * cell, cell + 0.5, cell + 0.5);
      }
    }
    const dot = (q: Sample, test: boolean) => {
      const px = ((q.x + 1) / 2) * w;
      const py = ((1 - q.y) / 2) * w;
      g.beginPath();
      g.arc(px, py, test ? 3.2 : 3.8, 0, Math.PI * 2);
      const c = q.label ? colA : colB;
      if (test) {
        g.fillStyle = `rgb(${colBg.join(',')})`;
        g.fill();
        g.lineWidth = 2;
        g.strokeStyle = `rgb(${c.join(',')})`;
        g.stroke();
      } else {
        g.fillStyle = `rgb(${c.join(',')})`;
        g.fill();
        g.lineWidth = 1;
        g.strokeStyle = 'rgba(255,255,255,0.9)';
        g.stroke();
      }
    };
    for (const q of sets.train) dot(q, false);
    for (const q of sets.test) dot(q, true);
  }

  function drawNet(): void {
    clear(netSvg);
    const sizes = net.sizes;
    const colX = (l: number) => 24 + (l * (300 - 48)) / (sizes.length - 1);
    const rowY = (l: number, i: number) => 85 + (i - (sizes[l]! - 1) / 2) * 19;
    const maxW = Math.max(0.5, ...net.W.flat(2).map(Math.abs));
    net.W.forEach((m, l) =>
      m.forEach((row, j) =>
        row.forEach((wv, i) => {
          netSvg.append(s('line', { class: `kplay__w ${wv >= 0 ? 'is-pos' : 'is-neg'}`, x1: colX(l), y1: rowY(l, i), x2: colX(l + 1), y2: rowY(l + 1, j), 'stroke-width': (0.4 + (3.6 * Math.abs(wv)) / maxW).toFixed(2) }));
        }),
      ),
    );
    sizes.forEach((n, l) => {
      for (let i = 0; i < n; i++) netSvg.append(s('circle', { class: 'kplay__n', cx: colX(l), cy: rowY(l, i), r: 7 }));
    });
    netSvg.append(s('text', { class: 'kplot__tick', x: colX(0), y: 165, 'text-anchor': 'middle' }, 'x, y'), s('text', { class: 'kplot__tick', x: colX(sizes.length - 1), y: 165, 'text-anchor': 'middle' }, 'p'));
  }

  function drawSpark(): void {
    clear(spark);
    if (history.length < 2) return;
    const max = Math.max(...history);
    const pts = history.map((v, i) => `${(i / (history.length - 1)) * 296 + 2},${56 - (v / max) * 50}`).join(' ');
    spark.append(s('polyline', { class: 'kplot__curve', points: pts }));
  }

  function hiddenCount(): number {
    return layers.reduce((a, b) => a + b, 0);
  }

  function renderGoals(acc: number): void {
    if (data === 'kreis' && acc >= 0.95 && !done.kreis) {
      done.kreis = true;
      ctx.say({ de: 'Kreis geknackt! Mehrere Neuronen legen zusammen eine geschlossene Grenze – eine einzelne Gerade könnte das nie.', en: 'Circle cracked! Several neurons together form a closed boundary – a single line never could.' }, 'wow');
    }
    if (data === 'xor' && acc >= 0.95 && hiddenCount() <= 3 && !done.xor) {
      done.xor = true;
      ctx.say({ de: `XOR mit ${hiddenCount()} verborgenen Neuronen – das Netz hat die Faltung aus der letzten Lektion selbst gelernt.`, en: `XOR with ${hiddenCount()} hidden neurons – the network learned the fold from the last lesson by itself.` }, 'wow');
    }
    if (data === 'spirale' && acc >= 0.9 && !done.spirale) {
      done.spirale = true;
      ctx.say({ de: 'Die Spirale! Dafür braucht es mehr Neuronen und Geduld. Respekt.', en: 'The spiral! That takes more neurons and patience. Respect.' }, 'wow');
    }
    clear(goals);
    const item = (ok: boolean, text: string) => goals.append(h('li', { class: ok ? 'is-done' : '' }, `${ok ? '✅' : '⬜'} ${text}`));
    item(done.kreis, tx({ de: 'Kreis: mindestens 95 %.', en: 'Circle: at least 95%.' }));
    item(done.xor, tx({ de: 'XOR: mindestens 95 % mit höchstens 3 verborgenen Neuronen insgesamt.', en: 'XOR: at least 95% with at most 3 hidden neurons in total.' }));
    item(done.spirale, tx({ de: 'Bonus: Spirale mindestens 90 %.', en: 'Bonus: spiral at least 90%.' }));
    if (!finished && done.kreis && done.xor) {
      finished = true;
      host.append(solved(tx({ de: 'Netze trainiert!', en: 'Networks trained!' })));
      ctx.finish();
    }
  }

  function render(): void {
    drawCanvas();
    drawNet();
    drawSpark();
    const acc = accuracy(net, sets.test);
    stats.textContent = `${tx({ de: 'Epoche', en: 'epoch' })} ${epochs}  ·  ${tx({ de: 'Verlust', en: 'loss' })} ${Number.isFinite(loss) ? ctx.num(loss, 3) : '–'}  ·  ${tx({ de: 'Test', en: 'test' })} ${ctx.percent(acc)}`;
    play.textContent = running ? `⏸ ${tx({ de: 'Pause', en: 'Pause' })}` : `▶ ${tx({ de: 'Trainieren', en: 'Train' })}`;
    renderGoals(acc);
  }

  function trainSome(n: number): void {
    for (let k = 0; k < n && epochs < MAX_EPOCHS; k++) {
      loss = trainEpoch(net, sets.train, lr, 10, rnd);
      epochs += 1;
      if (epochs % 2 === 0) history.push(Number.isFinite(loss) ? loss : 10);
    }
    if (history.length > 300) history = history.filter((_, i) => i % 2 === 0);
  }

  function loop(): void {
    if (!running) return;
    trainSome(3);
    render();
    if (epochs >= MAX_EPOCHS) {
      running = false;
      render();
      return;
    }
    raf = requestAnimationFrame(loop);
  }

  play.addEventListener('click', () => {
    running = !running;
    render();
    if (running) raf = requestAnimationFrame(loop);
  });
  plus10.addEventListener('click', () => {
    trainSome(10);
    render();
  });
  reinit.addEventListener('click', () => {
    seed += 1;
    rebuild();
  });

  buildControls();
  render();
  return { destroy: () => cancelAnimationFrame(raf) };
};

export default game;
