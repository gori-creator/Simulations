import { clear, h, s } from '../../engine/dom';
import { solved } from '../../engine/ui';
import type { GameMount } from '../../types';
import { close, GROUP_A, GROUP_B, opportunityOk, parityOk, rates, type Person } from '../models/fairness';

/**
 * Spiel „Fairness messen“: Kreditanträge zweier Gruppen mit verschiedenen
 * Grundraten. Punkte rechts der Schwelle werden angenommen; grün = zahlt
 * zurück, rot = zahlt nicht. Missionen: gleiche Annahmequoten herstellen;
 * gleiche Trefferquoten herstellen – und merken, dass beides zugleich nicht geht.
 */
const game: GameMount<void> = (host, ctx) => {
  const { tx } = ctx;
  let tA = 55;
  let tB = 55;
  let linked = true;
  const done = { parity: false, opportunity: false };
  let finished = false;

  const W = 640;
  const svg = s('svg', { class: 'kfair', viewBox: `0 0 ${W} 230`, role: 'img', 'aria-label': tx({ de: 'Punktzahlen der Anträge beider Gruppen mit Schwellen', en: 'Scores of both groups’ applications with thresholds' }) });
  const sliders = h('div', { class: 'kgrid-2' });
  const linkBtn = h('button', { class: 'kbtn kbtn--small', attrs: { type: 'button', 'aria-pressed': 'true' }, text: `🔗 ${tx({ de: 'Eine Schwelle für beide Gruppen', en: 'One threshold for both groups' })}` });
  const tbody = h('tbody');
  const table = h('table', { class: 'ktable' }, h('thead', {}, h('tr', {}, h('th', { text: '' }), h('th', { text: tx({ de: 'Gruppe A', en: 'Group A' }) }), h('th', { text: tx({ de: 'Gruppe B', en: 'Group B' }) }))), tbody);
  const goals = h('ul', { class: 'kgoals' });
  host.append(
    h('div', { class: 'kpanel' }, svg, h('p', { class: 'klegend' }, h('span', { class: 'klegend__dot is-good' }), ` ${tx({ de: 'zahlt zurück', en: 'repays' })}   `, h('span', { class: 'klegend__dot is-bad' }), ` ${tx({ de: 'zahlt nicht zurück', en: 'does not repay' })}   ▮ ${tx({ de: 'rechts der Linie: angenommen', en: 'right of the line: accepted' })}`), h('div', { class: 'krow' }, linkBtn), sliders),
    h('div', { class: 'kpanel kgrid-2' }, h('div', { class: 'ktable-wrap' }, table), goals),
  );

  const x = (score: number) => 30 + (score / 100) * (W - 60);

  const slider = (label: string, get: () => number, set: (v: number) => void) => {
    const out = h('output', { text: String(get()) });
    const r = h('input', { class: 'kslider__input', attrs: { type: 'range', min: 0, max: 100, step: 1, value: get(), 'aria-label': label } });
    r.addEventListener('input', () => {
      set(Number(r.value));
      render();
    });
    return { el: h('label', { class: 'kslider' }, h('span', { class: 'kslider__label' }, h('span', { text: label }), out), r), sync: () => ((r.value = String(get())), (out.textContent = String(get()))) };
  };
  const sa = slider(tx({ de: 'Schwelle Gruppe A', en: 'Threshold group A' }), () => tA, (v) => {
    tA = v;
    if (linked) tB = v;
  });
  const sb = slider(tx({ de: 'Schwelle Gruppe B', en: 'Threshold group B' }), () => tB, (v) => {
    tB = v;
    if (linked) tA = v;
  });
  sliders.append(sa.el, sb.el);

  linkBtn.addEventListener('click', () => {
    linked = !linked;
    linkBtn.setAttribute('aria-pressed', String(linked));
    if (linked) tB = tA;
    render();
  });

  function strip(people: readonly Person[], y0: number, threshold: number, name: string): void {
    svg.append(s('rect', { class: 'kfair__zone', x: x(threshold), y: y0, width: x(100) - x(threshold), height: 90, rx: 6 }));
    people.forEach((p, i) => {
      const jitter = ((i * 37) % 80) + 5;
      svg.append(s('circle', { class: p.good ? 'kfair__good' : 'kfair__bad', cx: x(p.score), cy: y0 + jitter, r: 4 }));
    });
    svg.append(s('line', { class: 'kfair__thr', x1: x(threshold), x2: x(threshold), y1: y0 - 4, y2: y0 + 94 }), s('text', { class: 'kfair__label', x: 32, y: y0 + 12 }, name));
  }

  function render(): void {
    sa.sync();
    sb.sync();
    clear(svg);
    strip(GROUP_A, 10, tA, tx({ de: 'Gruppe A', en: 'Group A' }));
    strip(GROUP_B, 125, tB, tx({ de: 'Gruppe B', en: 'Group B' }));
    const ra = rates(GROUP_A, tA);
    const rb = rates(GROUP_B, tB);
    clear(tbody);
    const row = (label: string, a: number, b: number, hint: string) => tbody.append(h('tr', { class: close(a, b) ? 'is-right' : '' }, h('td', { attrs: { title: hint }, text: label }), h('td', { text: ctx.percent(a) }), h('td', { text: ctx.percent(b) })));
    row(tx({ de: 'Annahmequote', en: 'Acceptance rate' }), ra.accept, rb.accept, tx({ de: 'Anteil aller Anträge, die angenommen werden', en: 'Share of all applications accepted' }));
    row(tx({ de: 'Trefferquote (Zuverlässige angenommen)', en: 'True positive rate (reliable accepted)' }), ra.tpr, rb.tpr, '');
    row(tx({ de: 'Fehlalarmquote (Unzuverlässige angenommen)', en: 'False positive rate (unreliable accepted)' }), ra.fpr, rb.fpr, '');
    tbody.append(h('tr', {}, h('td', { text: tx({ de: 'Grundrate (zahlt zurück)', en: 'Base rate (repays)' }) }), h('td', { text: ctx.percent(GROUP_A.filter((p) => p.good).length / GROUP_A.length) }), h('td', { text: ctx.percent(GROUP_B.filter((p) => p.good).length / GROUP_B.length) })));

    if (opportunityOk(ra, rb) && !done.opportunity) {
      done.opportunity = true;
      ctx.say({ de: `Gleiche Trefferquoten (${ctx.percent(ra.tpr)} und ${ctx.percent(rb.tpr)}): Wer zuverlässig ist, hat in beiden Gruppen dieselbe Chance. Aber schau auf die Annahmequoten – ${ctx.percent(ra.accept)} gegen ${ctx.percent(rb.accept)}, weil die Grundraten verschieden sind.`, en: `Equal true positive rates (${ctx.percent(ra.tpr)} and ${ctx.percent(rb.tpr)}): reliable people have the same chance in both groups. But look at the acceptance rates – ${ctx.percent(ra.accept)} vs ${ctx.percent(rb.accept)}, because the base rates differ.` }, 'think');
    } else if (!linked && parityOk(ra, rb) && !done.parity) {
      done.parity = true;
      ctx.say({ de: `Gleiche Annahmequoten (${ctx.percent(ra.accept)} und ${ctx.percent(rb.accept)}). Dafür sind jetzt die Trefferquoten verschieden: ${ctx.percent(ra.tpr)} gegen ${ctx.percent(rb.tpr)}.`, en: `Equal acceptance rates (${ctx.percent(ra.accept)} and ${ctx.percent(rb.accept)}). But now the true positive rates differ: ${ctx.percent(ra.tpr)} vs ${ctx.percent(rb.tpr)}.` }, 'think');
    }
    clear(goals);
    const item = (ok: boolean, text: string) => goals.append(h('li', { class: ok ? 'is-done' : '' }, `${ok ? '✅' : '⬜'} ${text}`));
    item(done.opportunity, tx({ de: 'Finde eine Einstellung mit gleichen Trefferquoten (±3 Punkte, 50 bis 95 % der Zuverlässigen angenommen).', en: 'Find a setting with equal true positive rates (±3 points, 50 to 95% of reliable people accepted).' }));
    item(done.parity, tx({ de: 'Löse die Kopplung und mach die Annahmequoten gleich (±3 Punkte, 30 bis 70 % angenommen).', en: 'Unlink and make the acceptance rates equal (±3 points, 30 to 70% accepted).' }));
    if (!finished && done.parity && done.opportunity) {
      finished = true;
      ctx.say({ de: 'Siehst du das Dilemma? Bei verschiedenen Grundraten kann man nicht alle Fairness-Maße zugleich erfüllen. Welches gelten soll, ist keine Rechenfrage, sondern eine Wertentscheidung.', en: 'See the dilemma? With different base rates you can’t satisfy every fairness measure at once. Which one should apply is not a maths question but a question of values.' }, 'wow');
      host.append(solved(tx({ de: 'Fairness-Dilemma entdeckt!', en: 'Fairness dilemma discovered!' })));
      ctx.finish();
    }
  }

  render();
};

export default game;
