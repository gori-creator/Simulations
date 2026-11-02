import { clear, h, s, seeded } from '../../engine/dom';
import { solved } from '../../engine/ui';
import type { GameMount } from '../../types';
import { averageEpsilon, estimate, pull, type ArmStats } from '../../gemeinsam/models/bandit';

/**
 * Spiel „Erkunden oder ausnutzen“: Ein Online-Shop testet vier Startseiten mit
 * unbekannter Kaufquote. Du entscheidest 40 Besuchern, welche Seite sie sehen.
 * Danach: Wie schneidet die ε-gierige Strategie je nach ε ab (200 Besucher,
 * gemittelt über viele Durchläufe)?
 */
const PROBS = [0.2, 0.35, 0.55, 0.3];
const ROUNDS = 40;
const EPS = [0, 0.05, 0.1, 0.2, 0.5, 1];

const game: GameMount<void> = (host, ctx) => {
  const { tx } = ctx;
  const rnd = seeded(Date.now() % 9973);
  const stats: ArmStats[] = PROBS.map(() => ({ pulls: 0, wins: 0 }));
  let total = 0;
  let curveShown = false;
  let finished = false;

  const arms = h('div', { class: 'kbandit' });
  const status = h('p', { class: 'kvote', attrs: { 'aria-live': 'polite' } });
  const curveBox = h('div', { class: 'kpanel', attrs: { hidden: true } });
  const curveBtn = h('button', { class: 'kbtn kbtn--main', attrs: { type: 'button', hidden: true }, text: `📈 ${tx({ de: 'Strategie ε-gierig vergleichen', en: 'Compare the ε-greedy strategy' })}` });
  host.append(h('div', { class: 'kpanel' }, h('p', { class: 'kpanel__title', text: tx({ de: 'Vier Startseiten, unbekannte Kaufquoten. Wähle für jeden Besucher eine Seite.', en: 'Four home pages, unknown purchase rates. Choose a page for each visitor.' }) }), arms, status, h('div', { class: 'krow' }, curveBtn)), curveBox);

  function render(): void {
    clear(arms);
    const used = stats.reduce((sum, st) => sum + st.pulls, 0);
    PROBS.forEach((p, i) => {
      const st = stats[i]!;
      const b = h('button', { class: 'kbandit__arm', attrs: { type: 'button' } }, h('strong', { text: `${tx({ de: 'Seite', en: 'Page' })} ${'ABCD'[i]}` }), h('span', { text: tx({ de: `${st.wins} Käufe / ${st.pulls} Besucher`, en: `${st.wins} sales / ${st.pulls} visitors` }) }), h('span', { class: 'kbandit__rate', text: st.pulls ? `≈ ${ctx.percent(estimate(st))}` : '?' }));
      b.disabled = used >= ROUNDS;
      b.addEventListener('click', () => {
        const r = pull(p, rnd);
        st.pulls += 1;
        st.wins += r;
        total += r;
        render();
      });
      arms.append(b);
    });
    status.textContent = used < ROUNDS ? tx({ de: `Besucher ${used} von ${ROUNDS} · Käufe bisher: ${total}`, en: `Visitor ${used} of ${ROUNDS} · sales so far: ${total}` }) : tx({ de: `Fertig: ${total} Käufe bei ${ROUNDS} Besuchern. Hättest du immer die beste Seite gezeigt, wären es im Mittel ${ctx.num(ROUNDS * Math.max(...PROBS), 0)} gewesen.`, en: `Done: ${total} sales from ${ROUNDS} visitors. Had you always shown the best page, it would have been ${ctx.num(ROUNDS * Math.max(...PROBS), 0)} on average.` });
    if (used >= ROUNDS && curveBtn.hidden) {
      curveBtn.hidden = false;
      ctx.say({ de: `Die wahren Quoten waren ${PROBS.map((q, i) => `${'ABCD'[i]}: ${ctx.percent(q)}`).join(', ')}. Hast du zu früh aufgehört zu erkunden – oder zu lange?`, en: `The true rates were ${PROBS.map((q, i) => `${'ABCD'[i]}: ${ctx.percent(q)}`).join(', ')}. Did you stop exploring too early – or too late?` }, 'wink');
    }
  }

  curveBtn.addEventListener('click', () => {
    curveBox.hidden = false;
    clear(curveBox);
    const W = 460;
    const H = 220;
    const vals = EPS.map((e) => averageEpsilon(PROBS, 200, e, 300, rnd));
    const max = 200 * Math.max(...PROBS);
    const svg = s('svg', { class: 'kbars', viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': tx({ de: 'Mittlere Käufe je ε', en: 'Average sales per ε' }) });
    vals.forEach((v, i) => {
      const x = 40 + i * ((W - 60) / EPS.length);
      const bw = (W - 60) / EPS.length - 14;
      const y = H - 30 - (v / max) * (H - 60);
      svg.append(s('rect', { class: 'kbars__bar', x, y, width: bw, height: H - 30 - y, rx: 4 }), s('text', { class: 'kbars__val', x: x + bw / 2, y: y - 5, 'text-anchor': 'middle' }, ctx.num(v, 0)), s('text', { class: 'kplot__tick', x: x + bw / 2, y: H - 12, 'text-anchor': 'middle' }, `ε = ${ctx.num(EPS[i]!, 2)}`));
    });
    const yMax = H - 30 - (H - 60);
    svg.append(s('line', { class: 'kbars__human', x1: 30, x2: W - 10, y1: yMax, y2: yMax }), s('text', { class: 'kbars__humantext', x: W - 12, y: yMax - 6, 'text-anchor': 'end' }, tx({ de: `immer die beste Seite: ${ctx.num(max, 0)}`, en: `always the best page: ${ctx.num(max, 0)}` })));
    curveBox.append(h('p', { class: 'kpanel__title', text: tx({ de: 'Mittlere Käufe bei 200 Besuchern, je nach ε (300 Durchläufe gemittelt)', en: 'Average sales from 200 visitors, depending on ε (averaged over 300 runs)' }) }), svg);
    if (!curveShown) {
      curveShown = true;
      ctx.say({ de: 'ε = 0 bleibt oft bei einer mittelmäßigen Seite hängen, ε = 1 erkundet nur. Am besten ist ein wenig Neugier – etwa 10 bis 20 % Zufall.', en: 'ε = 0 often gets stuck on a mediocre page, ε = 1 only explores. Best is a little curiosity – about 10 to 20% randomness.' }, 'wow');
    }
    if (!finished) {
      finished = true;
      host.append(solved(tx({ de: 'Erkunden und Ausnutzen abgewogen!', en: 'Exploration and exploitation balanced!' })));
      ctx.finish();
    }
  });

  render();
};

export default game;
