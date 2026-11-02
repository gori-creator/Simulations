import { clear, h } from '../../engine/dom';
import { meter, solved } from '../../engine/ui';
import type { GameMount } from '../../types';
import { posterior, priorSpam, TRAIN, VOCAB, WORD_NAMES, wordStats, type Word } from '../models/bayes';

/**
 * Spiel „Der Spamfilter“: Wörter antippen, die in einer neuen Mail stehen.
 * Der Filter rechnet mit dem Satz von Bayes die Spam-Wahrscheinlichkeit aus;
 * jedes Wort multipliziert die Chancen mit seinem Faktor P(w|S)/P(w|H).
 * Die A-priori-Wahrscheinlichkeit (Anteil Spam) lässt sich verstellen.
 */
const game: GameMount<void> = (host, ctx) => {
  const { tx } = ctx;
  const stats = wordStats();
  const trainPrior = priorSpam();
  const priors = [0.1, trainPrior, 0.8];
  let prior = trainPrior;
  const chosen = new Set<Word>();
  const done = { high: false, low: false, base: false };
  let finished = false;
  let lastPWithTrainPrior: number | null = null;

  const tbody = h('tbody');
  for (const st of stats) {
    tbody.append(h('tr', {}, h('td', { text: tx(WORD_NAMES[st.word]) }), h('td', { text: `${st.inSpam} / ${TRAIN.filter((m) => m.spam).length}` }), h('td', { text: `${st.inHam} / ${TRAIN.filter((m) => !m.spam).length}` }), h('td', { text: ctx.num(st.pSpam / st.pHam, 2) })));
  }
  const table = h('table', { class: 'ktable' }, h('thead', {}, h('tr', {}, h('th', { text: tx({ de: 'Wort', en: 'word' }) }), h('th', { text: tx({ de: 'in Spam', en: 'in spam' }) }), h('th', { text: tx({ de: 'in Nicht-Spam', en: 'in non-spam' }) }), h('th', { text: tx({ de: 'Faktor', en: 'factor' }) }))), tbody);

  const chips = h('div', { class: 'kfacts kfacts--pick', attrs: { role: 'group', 'aria-label': tx({ de: 'Wörter in der neuen Mail', en: 'Words in the new mail' }) } });
  const priorRow = h('div', { class: 'krow', attrs: { role: 'group', 'aria-label': tx({ de: 'Anteil Spam vorab', en: 'Share of spam beforehand' }) } });
  const mail = h('p', { class: 'kmail' });
  const calc = h('p', { class: 'kformula' });
  const gauge = meter(tx({ de: 'P(Spam | Mail)', en: 'P(spam | mail)' }));
  const goals = h('ul', { class: 'kgoals' });
  host.append(
    h('div', { class: 'kpanel' }, h('p', { class: 'kpanel__title', text: tx({ de: `Gelernt aus ${TRAIN.length} Mails (Laplace-geglättet)`, en: `Learned from ${TRAIN.length} mails (Laplace-smoothed)` }) }), h('div', { class: 'ktable-wrap' }, table)),
    h('div', { class: 'kpanel' }, h('p', { class: 'kpanel__title', text: tx({ de: 'Neue Mail: Welche Wörter stehen drin?', en: 'New mail: which words does it contain?' }) }), chips, mail, h('p', { class: 'kpanel__title', text: tx({ de: 'Anteil Spam im Postfach (A-priori)', en: 'Share of spam in the inbox (prior)' }) }), priorRow, calc, h('div', { class: 'khint' }, gauge.el), goals),
  );

  for (const w of VOCAB) {
    const b = h('button', { class: 'kfact kfact--btn', attrs: { type: 'button', 'aria-pressed': 'false' }, text: tx(WORD_NAMES[w]) });
    b.addEventListener('click', () => {
      if (chosen.has(w)) chosen.delete(w);
      else chosen.add(w);
      b.setAttribute('aria-pressed', String(chosen.has(w)));
      render();
    });
    chips.append(b);
  }
  for (const pr of priors) {
    const b = h('button', { class: 'kbtn', attrs: { type: 'button', 'aria-pressed': String(pr === prior), 'data-p': pr }, text: `${ctx.percent(pr)}${pr === trainPrior ? ` (${tx({ de: 'wie im Training', en: 'as in training' })})` : ''}` });
    b.addEventListener('click', () => {
      prior = pr;
      for (const x of priorRow.querySelectorAll<HTMLButtonElement>('button')) x.setAttribute('aria-pressed', String(Number(x.dataset.p) === prior));
      render();
    });
    priorRow.append(b);
  }

  function render(): void {
    const words = VOCAB.filter((w) => chosen.has(w));
    const post = posterior(words, prior, stats);
    mail.textContent = words.length ? `✉️ „… ${words.map((w) => tx(WORD_NAMES[w])).join(' … ')} …“` : tx({ de: '✉️ (noch leer – tippe Wörter an)', en: '✉️ (still empty – tap words)' });
    const priorOdds = prior / (1 - prior);
    const odds = post.p / (1 - post.p);
    calc.textContent = `${tx({ de: 'Chancen', en: 'odds' })} = ${ctx.num(priorOdds, 2)}${post.factors.map((f) => ` · ${ctx.num(f.ratio, 2)}`).join('')} = ${ctx.num(odds, 2)}   ⇒   P(Spam) = ${ctx.percent(post.p)}`;
    gauge.set(Math.round(post.p * 100), 100, ctx.percent(post.p), post.p < 0.5);
    if (prior === trainPrior && words.length) lastPWithTrainPrior = post.p;
    if (words.length && post.p > 0.95 && !done.high) {
      done.high = true;
      ctx.say({ de: 'Über 95 %! Jedes Spamwort vervielfacht die Chancen. Ab einer Schwelle landet die Mail im Spamordner.', en: 'Over 95%! Every spam word multiplies the odds. Above a threshold, the mail goes to the spam folder.' }, 'happy');
    }
    if (words.length && post.p < 0.05 && !done.low) {
      done.low = true;
      ctx.say({ de: 'Unter 5 % – eindeutig keine Werbung.', en: 'Under 5% – clearly not an ad.' }, 'happy');
    }
    if (words.length && prior !== trainPrior && lastPWithTrainPrior !== null && !done.base) {
      done.base = true;
      ctx.say({ de: `Dieselbe Mail, andere Ausgangslage: Mit ${ctx.percent(prior)} Spam vorab ergibt sich ${ctx.percent(post.p)} statt ${ctx.percent(lastPWithTrainPrior)}. Die Grundrate zählt!`, en: `Same mail, different starting point: with ${ctx.percent(prior)} spam beforehand you get ${ctx.percent(post.p)} instead of ${ctx.percent(lastPWithTrainPrior)}. The base rate matters!` }, 'wow');
    }
    clear(goals);
    const item = (ok: boolean, text: string) => goals.append(h('li', { class: ok ? 'is-done' : '' }, `${ok ? '✅' : '⬜'} ${text}`));
    item(done.high, tx({ de: 'Stell eine Mail mit über 95 % Spam-Wahrscheinlichkeit zusammen.', en: 'Put together a mail with over 95% spam probability.' }));
    item(done.low, tx({ de: 'Stell eine Mail mit unter 5 % zusammen.', en: 'Put together a mail with under 5%.' }));
    item(done.base, tx({ de: 'Ändere den Anteil Spam vorab und vergleiche dieselbe Mail.', en: 'Change the prior share of spam and compare the same mail.' }));
    if (!finished && done.high && done.low && done.base) {
      finished = true;
      host.append(solved(tx({ de: 'Bayes-Filter verstanden!', en: 'Bayes filter understood!' })));
      ctx.finish();
    }
  }

  render();
};

export default game;
