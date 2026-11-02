import { clear, h, s } from '../../engine/dom';
import { solved } from '../../engine/ui';
import type { GameMount } from '../../types';

/**
 * Spiel „Der Durchbruch 2012“: Fehlerquoten (Top-5) der Sieger im
 * ImageNet-Wettbewerb. 2010 und 2011 sind bekannt; die Werte für 2012 und
 * 2015 schätzt man mit einem Regler, dann wird aufgedeckt.
 * Quellen der Zahlen: Ergebnisse des ILSVRC; menschliche Fehlerquote nach
 * der Schätzung von Andrej Karpathy (2014).
 */
interface Bar {
  year: number;
  value: number;
  who: string;
  guess?: boolean;
}

const BARS: Bar[] = [
  { year: 2010, value: 28.2, who: 'NEC-UIUC' },
  { year: 2011, value: 25.8, who: 'XRCE' },
  { year: 2012, value: 15.3, who: 'AlexNet', guess: true },
  { year: 2013, value: 11.7, who: 'Clarifai' },
  { year: 2014, value: 6.7, who: 'GoogLeNet' },
  { year: 2015, value: 3.6, who: 'ResNet', guess: true },
];
const HUMAN = 5.1;

const game: GameMount<void> = (host, ctx) => {
  const { tx } = ctx;
  const guesses = new Map<number, number>([[2012, 25], [2015, 15]]);
  const revealed = new Set<number>();
  let finished = false;

  const W = 520;
  const H = 260;
  const svg = s('svg', { class: 'kbars', viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': tx({ de: 'Fehlerquoten im ImageNet-Wettbewerb', en: 'Error rates in the ImageNet competition' }) });
  const controls = h('div', { class: 'kgrid-2' });
  host.append(h('div', { class: 'kpanel' }, svg), h('div', { class: 'kpanel' }, controls));

  const y = (v: number) => H - 36 - (v / 30) * (H - 60);

  function draw(): void {
    clear(svg);
    for (const v of [0, 10, 20, 30]) {
      svg.append(s('line', { class: 'kplot__grid', x1: 40, x2: W - 10, y1: y(v), y2: y(v) }), s('text', { class: 'kplot__tick', x: 34, y: y(v) + 4, 'text-anchor': 'end' }, `${v} %`));
    }
    svg.append(s('line', { class: 'kbars__human', x1: 40, x2: W - 10, y1: y(HUMAN), y2: y(HUMAN) }), s('text', { class: 'kbars__humantext', x: W - 12, y: y(HUMAN) - 6, 'text-anchor': 'end' }, tx({ de: `Mensch ≈ ${ctx.num(HUMAN, 1)} %`, en: `human ≈ ${ctx.num(HUMAN, 1)}%` })));
    BARS.forEach((b, i) => {
      const x = 60 + i * ((W - 80) / BARS.length);
      const bw = (W - 80) / BARS.length - 18;
      const hidden = b.guess && !revealed.has(b.year);
      const v = hidden ? guesses.get(b.year)! : b.value;
      svg.append(s('rect', { class: `kbars__bar${hidden ? ' is-guess' : b.guess ? ' is-revealed' : ''}`, x, y: y(v), width: bw, height: y(0) - y(v), rx: 4 }));
      svg.append(s('text', { class: 'kbars__val', x: x + bw / 2, y: y(v) - 6, 'text-anchor': 'middle' }, hidden ? `? ${ctx.num(v, 0)} %` : `${ctx.num(v, 1)} %`));
      svg.append(s('text', { class: 'kplot__tick', x: x + bw / 2, y: H - 20, 'text-anchor': 'middle' }, String(b.year)));
      svg.append(s('text', { class: 'kplot__tick', x: x + bw / 2, y: H - 6, 'text-anchor': 'middle' }, hidden ? '' : b.who));
      if (b.guess && revealed.has(b.year)) svg.append(s('line', { class: 'kbars__guess', x1: x - 4, x2: x + bw + 4, y1: y(guesses.get(b.year)!), y2: y(guesses.get(b.year)!) }));
    });
  }

  function buildControls(): void {
    clear(controls);
    for (const year of [2012, 2015]) {
      const bar = BARS.find((b) => b.year === year)!;
      const out = h('output', { text: `${ctx.num(guesses.get(year)!, 0)} %` });
      const range = h('input', { class: 'kslider__input', attrs: { type: 'range', min: 0, max: 30, step: 1, value: guesses.get(year)!, 'aria-label': tx({ de: `Schätzung für ${year}`, en: `Estimate for ${year}` }) } });
      const btn = h('button', { class: 'kbtn kbtn--main', attrs: { type: 'button' }, text: tx({ de: 'Aufdecken', en: 'Reveal' }) });
      range.disabled = revealed.has(year) || (year === 2015 && !revealed.has(2012));
      btn.disabled = range.disabled;
      range.addEventListener('input', () => {
        guesses.set(year, Number(range.value));
        out.textContent = `${ctx.num(Number(range.value), 0)} %`;
        draw();
      });
      btn.addEventListener('click', () => {
        revealed.add(year);
        const diff = Math.abs(guesses.get(year)! - bar.value);
        if (year === 2012) ctx.say({ de: `${ctx.num(bar.value, 1)} %! Fast 11 Prozentpunkte besser als der Zweitplatzierte (26,2 %). Deine Schätzung lag ${ctx.num(diff, 1)} Punkte daneben. So einen Sprung hatte niemand erwartet.`, en: `${ctx.num(bar.value, 1)}%! Almost 11 percentage points better than second place (26.2%). Your estimate was ${ctx.num(diff, 1)} points off. Nobody had expected such a jump.` }, 'wow');
        else ctx.say({ de: `${ctx.num(bar.value, 1)} % – unter der geschätzten menschlichen Fehlerquote von etwa 5 %. Allerdings nur bei genau dieser Aufgabe und diesen Bildern.`, en: `${ctx.num(bar.value, 1)}% – below the estimated human error rate of about 5%. But only for exactly this task and these images.` }, 'wow');
        buildControls();
        draw();
        if (revealed.size === 2 && !finished) {
          finished = true;
          host.append(solved(tx({ de: 'Durchbruch erlebt!', en: 'Breakthrough witnessed!' })));
          ctx.finish();
        }
      });
      controls.append(h('div', { class: 'kslider' }, h('span', { class: 'kslider__label' }, h('span', { text: tx({ de: `Deine Schätzung für ${year}`, en: `Your estimate for ${year}` }) }), out), range, h('div', { class: 'krow' }, btn)));
    }
  }

  buildControls();
  draw();
};

export default game;
