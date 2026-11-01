import { L } from '../../../curriculum/helpers';
import type { Localized } from '../../../i18n/config';
import { clear, h } from '../../engine/dom';
import { solved } from '../../engine/ui';
import type { GameMount } from '../../types';
import { ask, BEASTS, countQuestions, fewestQuestions, isDone, isPure, QUESTIONS, splits, type Klass, type Question, type TreeNode } from '../models/baum';

/** Spiel „Der Fragen-Baum“: Fragen stellen, bis jeder Ast nur noch eine Tiergruppe enthält. */
const EMOJI: Record<string, string> = { spatz: '🐦', pinguin: '🐧', goldfisch: '🐠', hai: '🦈', hund: '🐕', fledermaus: '🦇', delfin: '🐬' };
const NAME: Record<string, Localized> = {
  spatz: L('Spatz', 'Sparrow'),
  pinguin: L('Pinguin', 'Penguin'),
  goldfisch: L('Goldfisch', 'Goldfish'),
  hai: L('Hai', 'Shark'),
  hund: L('Hund', 'Dog'),
  fledermaus: L('Fledermaus', 'Bat'),
  delfin: L('Delfin', 'Dolphin'),
};
const Q: Record<Question, Localized> = {
  water: L('Lebt es im Wasser?', 'Does it live in water?'),
  flies: L('Kann es fliegen?', 'Can it fly?'),
  fur: L('Hat es Fell?', 'Does it have fur?'),
  feathers: L('Hat es Federn?', 'Does it have feathers?'),
  gills: L('Atmet es mit Kiemen?', 'Does it breathe with gills?'),
};
const KLASS: Record<Klass, Localized> = { bird: L('Vögel', 'Birds'), fish: L('Fische', 'Fish'), mammal: L('Säugetiere', 'Mammals') };

const game: GameMount<void> = (host, ctx) => {
  const { tx } = ctx;
  const best = fewestQuestions();
  let root: TreeNode = { items: BEASTS };
  let finished = false;

  const tree = h('div', { class: 'ktree' });
  const status = h('p', { class: 'khint' });
  const reset = h('button', { class: 'kbtn', attrs: { type: 'button' }, text: tx(L('↺ Neu anfangen', '↺ Start again')) });
  reset.addEventListener('click', () => {
    root = { items: BEASTS };
    render();
  });
  const panel = h('div', { class: 'kpanel' }, tree, h('div', { class: 'krow' }, reset), status);
  host.append(panel);

  function nodeEl(node: TreeNode, used: Question[], label?: string): HTMLElement {
    const animals = h('div', { class: 'ktree__animals' }, ...node.items.map((a) => h('span', { class: 'ktree__animal', attrs: { title: tx(NAME[a.id]!) } }, h('span', { attrs: { 'aria-hidden': 'true' }, text: EMOJI[a.id]! }), h('small', { text: tx(NAME[a.id]!) }))));
    const box = h('div', { class: 'ktree__node' }, label ? h('p', { class: 'ktree__answer', text: label }) : null, animals);
    if (node.question) {
      box.append(
        h('p', { class: 'ktree__q', text: `❓ ${tx(Q[node.question])}` }),
        h('div', { class: 'ktree__kids' }, nodeEl(node.yes!, [...used, node.question], `✔ ${tx(L('Ja', 'Yes'))}`), nodeEl(node.no!, [...used, node.question], `✘ ${tx(L('Nein', 'No'))}`)),
      );
    } else if (isPure(node.items)) {
      box.classList.add('is-pure');
      box.append(h('p', { class: 'ktree__done', text: `✓ ${tx(L('Nur', 'Only'))} ${tx(KLASS[node.items[0]!.klass])}` }));
    } else {
      box.append(h('p', { class: 'ktree__ask', text: tx(L('Noch gemischt. Welche Frage stellst du hier?', 'Still mixed. Which question do you ask here?')) }));
      const row = h('div', { class: 'krow' });
      for (const q of QUESTIONS.filter((x) => !used.includes(x))) {
        const b = h('button', { class: 'kbtn', attrs: { type: 'button' }, text: tx(Q[q]) });
        b.addEventListener('click', () => {
          if (!splits(node.items, q)) {
            ctx.mistake();
            ctx.say(L('Diese Frage beantworten hier alle Tiere gleich – sie teilt nichts. Nimm eine andere!', 'All the animals here answer this question the same way – it splits nothing. Pick another!'), 'sad');
            b.disabled = true;
            return;
          }
          ask(node, q);
          render();
        });
        row.append(b);
      }
      box.append(row);
    }
    return box;
  }

  function render(): void {
    clear(tree);
    tree.append(nodeEl(root, []));
    const n = countQuestions(root);
    status.textContent = tx(L(`Gestellte Fragen: ${n}`, `Questions asked: ${n}`));
    if (isDone(root)) {
      if (n <= best) ctx.say(L(`Fertig mit nur ${n} Fragen – kürzer geht es nicht!`, `Done with only ${n} questions – it can’t be shorter!`), 'wow');
      else ctx.say(L(`Fertig mit ${n} Fragen! Es geht sogar mit ${best}. Willst du es nochmal versuchen?`, `Done with ${n} questions! It even works with ${best}. Want to try again?`), 'happy');
      if (!finished) {
        finished = true;
        panel.append(solved(tx(L('Der Baum ist fertig!', 'The tree is complete!'))));
        ctx.finish();
      }
    } else if (n > 0) {
      ctx.say(L('Gut! Wo noch verschiedene Tiere zusammen sind, brauchen wir eine weitere Frage.', 'Good! Where different animals are still together, we need another question.'), 'think');
    }
  }

  render();
};

export default game;
