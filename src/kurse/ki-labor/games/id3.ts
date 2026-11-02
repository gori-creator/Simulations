import { clear, h } from '../../engine/dom';
import { solved } from '../../engine/ui';
import type { GameMount } from '../../types';
import { ATTRS, bestAttr, DAYS, entropy, gain, NAMES, split, type Attr, type Day } from '../models/id3';

/**
 * Spiel „Bäume aus Information“: Den Entscheidungsbaum wie ID3 bauen. Für den
 * aktuellen (noch gemischten) Knoten zeigt jede Merkmals-Karte, wie sich die
 * Tage aufteilen würden. Gewählt werden soll das Merkmal mit dem größten
 * Informationsgewinn; danach erscheinen alle Gewinne zum Vergleich.
 */
interface TreeNode {
  days: Day[];
  attrs: Attr[];
  split?: Attr;
  children?: Map<string, TreeNode>;
  label: string;
}

const game: GameMount<void> = (host, ctx) => {
  const { tx } = ctx;
  const name = (k: string) => tx(NAMES[k]!);
  const root: TreeNode = { days: DAYS, attrs: [...ATTRS], label: tx({ de: 'alle Tage', en: 'all days' }) };
  let finished = false;

  const treeEl = h('div', { class: 'ktree3' });
  const work = h('div', { class: 'kpanel' });
  host.append(h('div', { class: 'kpanel' }, h('p', { class: 'kpanel__title', text: `🌳 ${tx({ de: 'Dein Baum', en: 'Your tree' })}` }), treeEl), work);

  const counts = (days: readonly Day[]) => {
    const yes = days.filter((d) => d.spielen).length;
    return `${yes}✓ ${days.length - yes}✗`;
  };
  const pure = (n: TreeNode) => entropy(n.days) === 0;

  function activeNode(n: TreeNode): TreeNode | null {
    const queue = [n];
    while (queue.length) {
      const x = queue.shift()!;
      if (!x.split && !pure(x)) return x;
      if (x.children) queue.push(...x.children.values());
    }
    return null;
  }

  function renderTree(n: TreeNode, active: TreeNode | null): HTMLElement {
    const head = n.split
      ? h('span', { class: 'ktree3__q', text: `${name(n.split)}?` })
      : pure(n)
        ? h('span', { class: `ktree3__leaf ${n.days[0]!.spielen ? 'is-yes' : 'is-no'}`, text: n.days[0]!.spielen ? tx({ de: '✓ spielen', en: '✓ play' }) : tx({ de: '✗ nicht spielen', en: '✗ don’t play' }) })
        : h('span', { class: `ktree3__open${n === active ? ' is-active' : ''}`, text: tx({ de: 'gemischt – welche Frage?', en: 'mixed – which question?' }) });
    const el = h('div', { class: 'ktree3__node' }, h('span', { class: 'ktree3__label', text: `${n.label} (${counts(n.days)})` }), ' ', head);
    if (n.children) {
      const kids = h('div', { class: 'ktree3__kids' });
      for (const child of n.children.values()) kids.append(renderTree(child, active));
      el.append(kids);
    }
    return el;
  }

  function render(): void {
    const active = activeNode(root);
    clear(treeEl);
    treeEl.append(renderTree(root, active));
    clear(work);
    if (!active) return done();
    const H = entropy(active.days);
    work.append(
      h('p', { class: 'kpanel__title', text: tx({ de: `Knoten „${active.label}“: ${active.days.length} Tage, ${counts(active.days)} – Entropie ${ctx.num(H, 3)} Bit`, en: `Node “${active.label}”: ${active.days.length} days, ${counts(active.days)} – entropy ${ctx.num(H, 3)} bits` }) }),
      h('p', { class: 'khint', text: tx({ de: 'Welches Merkmal trennt am besten? Die Karten zeigen die Aufteilung (✓ = gespielt, ✗ = nicht).', en: 'Which feature separates best? The cards show the split (✓ = played, ✗ = not).' }) }),
    );
    const cards = h('div', { class: 'kitems kitems--wide' });
    for (const a of active.attrs) {
      const parts = split(active.days, a);
      const b = h('button', { class: 'kitem kitem--split', attrs: { type: 'button' } }, h('strong', { text: name(a) }), ...[...parts.entries()].map(([v, ds]) => h('span', { class: 'kitem__tag', text: `${name(v)}: ${counts(ds)}` })));
      b.addEventListener('click', () => choose(active, a));
      cards.append(b);
    }
    work.append(cards);
  }

  function choose(node: TreeNode, a: Attr): void {
    const best = bestAttr(node.days, node.attrs);
    const gains = node.attrs.map((x) => `${name(x)} ${ctx.num(gain(node.days, x), 3)}`).join(' · ');
    if (a !== best) {
      ctx.mistake();
      ctx.say({ de: `${name(a)} bringt weniger. Gewinne: ${gains}. ID3 nimmt das Größte.`, en: `${name(a)} gains less. Gains: ${gains}. ID3 takes the largest.` }, 'think');
      return;
    }
    node.split = a;
    node.children = new Map([...split(node.days, a).entries()].map(([v, ds]) => [v, { days: ds, attrs: node.attrs.filter((x) => x !== a), label: `${name(a)} = ${name(v)}` }]));
    ctx.say({ de: `Richtig! Gewinne: ${gains}. ${name(a)} verrät am meisten.`, en: `Right! Gains: ${gains}. ${name(a)} reveals the most.` }, 'happy');
    render();
  }

  function classify(n: TreeNode, d: Partial<Day>): { path: string[]; yes: boolean } {
    const path: string[] = [];
    let x = n;
    while (x.split && x.children) {
      const v = d[x.split] as string;
      path.push(`${name(x.split)} = ${name(v)}`);
      x = x.children.get(v)!;
    }
    return { path, yes: x.days[0]!.spielen };
  }

  function done(): void {
    if (finished) return;
    finished = true;
    const day: Partial<Day> = { wetter: 'sonnig', temperatur: 'kuehl', feuchte: 'hoch', wind: 'stark' };
    const r = classify(root, day);
    work.append(
      h('p', { class: 'kpanel__title', text: tx({ de: 'Fertig! Neuer Tag: sonnig, kühl, hohe Luftfeuchte, starker Wind.', en: 'Done! New day: sunny, cool, high humidity, strong wind.' }) }),
      h('p', { class: 'kformula', text: `${r.path.join('  →  ')}  →  ${r.yes ? tx({ de: '✓ spielen', en: '✓ play' }) : tx({ de: '✗ nicht spielen', en: '✗ don’t play' })}` }),
      solved(tx({ de: 'Baum mit ID3 gebaut!', en: 'Tree built with ID3!' })),
    );
    ctx.say({ de: 'Die Temperatur kommt in deinem Baum gar nicht vor – sie verrät hier zu wenig. Der Baum ist kurz, genau und erklärbar.', en: 'Temperature doesn’t appear in your tree at all – it reveals too little here. The tree is short, accurate and explainable.' }, 'wow');
    ctx.finish();
  }

  render();
};

export default game;
