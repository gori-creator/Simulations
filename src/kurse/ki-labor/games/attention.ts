import { clear, h, s } from '../../engine/dom';
import { solved } from '../../engine/ui';
import type { GameMount } from '../../types';
import { matrix, PRONOUN, scores, sentence, weights, type Adj } from '../models/attention';

/**
 * Spiel „Aufmerksamkeit“: Selbstaufmerksamkeit im Satz „Der Ball passte nicht
 * in den Koffer, weil er zu groß/klein war.“ Bögen zeigen, wie stark das
 * gewählte Token auf die anderen achtet (softmax(q·k/√d)). Ein Token antippen
 * wählt es aus; „groß/klein“ umschalten verschiebt die Aufmerksamkeit von „er“.
 */
const game: GameMount<void> = (host, ctx) => {
  const { tx } = ctx;
  let adj: Adj = 'gross';
  let sel = PRONOUN;
  let showMatrix = false;
  const seen = { gross: false, klein: false };
  let finished = false;

  const W = 720;
  const arcs = s('svg', { class: 'katt', viewBox: `0 0 ${W} 150`, role: 'img', 'aria-label': tx({ de: 'Aufmerksamkeit des gewählten Wortes auf alle Wörter', en: 'Attention of the selected word to all words' }) });
  const toks = h('div', { class: 'katt__toks' });
  const calc = h('p', { class: 'kformula' });
  const adjRow = h('div', { class: 'krow' });
  const matBtn = h('button', { class: 'kbtn kbtn--small', attrs: { type: 'button', 'aria-pressed': 'false' }, text: `🧮 ${tx({ de: 'Ganze Matrix zeigen', en: 'Show the whole matrix' })}` });
  const mat = h('div', { class: 'ktable-wrap', attrs: { hidden: true } });
  const goals = h('ul', { class: 'kgoals' });
  host.append(h('div', { class: 'kpanel' }, arcs, toks, calc, adjRow, h('div', { class: 'krow' }, matBtn), mat), h('div', { class: 'kpanel' }, goals));

  for (const a of ['gross', 'klein'] as Adj[]) {
    const b = h('button', { class: 'kbtn', attrs: { type: 'button', 'aria-pressed': String(a === adj), 'data-adj': a }, text: a === 'gross' ? tx({ de: '… zu groß war', en: '… was too big' }) : tx({ de: '… zu klein war', en: '… was too small' }) });
    b.addEventListener('click', () => {
      adj = a;
      for (const x of adjRow.querySelectorAll<HTMLButtonElement>('button')) x.setAttribute('aria-pressed', String(x.dataset.adj === adj));
      render();
    });
    adjRow.append(b);
  }

  function render(): void {
    const t = sentence(adj);
    const w = weights(t, sel);
    const n = t.length;
    const x = (i: number) => 30 + (i * (W - 60)) / (n - 1);
    clear(arcs);
    t.forEach((_, j) => {
      if (j === sel) return;
      const x1 = x(sel);
      const x2 = x(j);
      const hgt = 18 + Math.abs(x2 - x1) * 0.28;
      arcs.append(s('path', { class: 'katt__arc', d: `M${x1} 140 Q${(x1 + x2) / 2} ${140 - hgt * 1.6} ${x2} 140`, 'stroke-width': (1 + w[j]! * 14).toFixed(1), 'stroke-opacity': (0.15 + w[j]! * 0.85).toFixed(2) }));
    });
    clear(toks);
    t.forEach((tok, j) => {
      const b = h('button', { class: `katt__tok${j === sel ? ' is-sel' : ''}`, attrs: { type: 'button', 'aria-pressed': String(j === sel) } }, h('span', { text: tok.text[ctx.lang] }), h('small', { text: j === sel ? '—' : ctx.percent(w[j]!) }));
      b.style.setProperty('--w', String(j === sel ? 0 : w[j]!));
      b.addEventListener('click', () => {
        sel = j;
        render();
      });
      toks.append(b);
    });
    const top = w.map((v, j) => ({ v, j })).filter((e) => e.j !== sel).sort((a, b) => b.v - a.v)[0]!;
    const sc = scores(t, sel);
    const q = t[sel]!.q;
    const k = t[top.j]!.k;
    const quote = (text: string) => (ctx.lang === 'de' ? `„${text}“` : `“${text}”`);
    calc.textContent = `${quote(t[sel]!.text[ctx.lang])} → ${quote(t[top.j]!.text[ctx.lang])}:  q·k/√2 = (${ctx.num(q[0], 1)}·${ctx.num(k[0], 1)} + ${ctx.num(q[1], 1)}·${ctx.num(k[1], 1)}) / ${ctx.num(Math.SQRT2, 2)} = ${ctx.num(sc[top.j]!, 2)}   ⇒   softmax = ${ctx.percent(top.v)}`;
    if (sel === PRONOUN) {
      if (!seen[adj]) {
        seen[adj] = true;
        ctx.say(adj === 'gross' ? { de: '„er“ schaut vor allem auf „Ball“: Was zu groß ist, passt nicht hinein.', en: '“it” mostly looks at “ball”: what is too big doesn’t fit in.' } : { de: 'Ein Wort geändert – und „er“ schaut jetzt auf „Koffer“: Was zu klein ist, kann nichts aufnehmen.', en: 'One word changed – and “it” now looks at “suitcase”: what is too small can’t hold anything.' }, 'wow');
      }
    }
    if (showMatrix) {
      clear(mat);
      const M = matrix(t);
      const head = h('tr', {}, h('th', { text: '' }), ...t.map((tok) => h('th', { class: 'katt__mh', text: tok.text[ctx.lang] })));
      const body = M.map((row, i) => h('tr', {}, h('th', { text: t[i]!.text[ctx.lang] }), ...row.map((v) => {
        const td = h('td', { class: 'katt__cell', text: Math.round(v * 100).toString() });
        td.style.setProperty('--w', String(v));
        return td;
      })));
      mat.append(h('table', { class: 'ktable katt__matrix' }, h('thead', {}, head), h('tbody', {}, ...body)));
    }
    clear(goals);
    const item = (ok: boolean, text: string) => goals.append(h('li', { class: ok ? 'is-done' : '' }, `${ok ? '✅' : '⬜'} ${text}`));
    item(seen.gross && seen.klein, tx({ de: 'Sieh dir die Aufmerksamkeit von „er“ bei „groß“ und bei „klein“ an.', en: 'Look at the attention of “it” for “too big” and for “too small”.' }));
    item(showMatrix, tx({ de: 'Öffne die ganze Matrix: Jedes Wort achtet auf jedes.', en: 'Open the whole matrix: every word attends to every word.' }));
    if (!finished && seen.gross && seen.klein && showMatrix) {
      finished = true;
      host.append(solved(tx({ de: 'Aufmerksamkeit verstanden!', en: 'Attention understood!' })));
      ctx.finish();
    }
  }

  matBtn.addEventListener('click', () => {
    showMatrix = !showMatrix;
    matBtn.setAttribute('aria-pressed', String(showMatrix));
    mat.hidden = !showMatrix;
    render();
  });
  render();
};

export default game;
