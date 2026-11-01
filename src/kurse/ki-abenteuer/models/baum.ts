/**
 * Lektion „Der Fragen-Baum“: Mit Ja-Nein-Fragen Tiere in Vögel, Fische und
 * Säugetiere einteilen. Ein Ast ist fertig, wenn darin nur eine Gruppe übrig ist.
 */
export type Klass = 'bird' | 'fish' | 'mammal';
export type Question = 'feathers' | 'water' | 'flies' | 'fur' | 'gills';

export interface Beast {
  id: string;
  klass: Klass;
  yes: Record<Question, boolean>;
}

const b = (id: string, klass: Klass, feathers: number, water: number, flies: number, fur: number, gills: number): Beast => ({
  id,
  klass,
  yes: { feathers: !!feathers, water: !!water, flies: !!flies, fur: !!fur, gills: !!gills },
});

export const BEASTS: Beast[] = [
  b('spatz', 'bird', 1, 0, 1, 0, 0),
  b('pinguin', 'bird', 1, 1, 0, 0, 0),
  b('goldfisch', 'fish', 0, 1, 0, 0, 1),
  b('hai', 'fish', 0, 1, 0, 0, 1),
  b('hund', 'mammal', 0, 0, 0, 1, 0),
  b('fledermaus', 'mammal', 0, 0, 1, 1, 0),
  b('delfin', 'mammal', 0, 1, 0, 0, 0),
];

export const QUESTIONS: Question[] = ['water', 'flies', 'fur', 'feathers', 'gills'];

export interface TreeNode {
  items: Beast[];
  question?: Question;
  yes?: TreeNode;
  no?: TreeNode;
}

/** Nur eine Gruppe übrig? */
export function isPure(items: readonly Beast[]): boolean {
  return new Set(items.map((x) => x.klass)).size <= 1;
}

/** Teilt die Frage die Tiere überhaupt (beide Seiten nicht leer)? */
export function splits(items: readonly Beast[], q: Question): boolean {
  const yes = items.filter((x) => x.yes[q]).length;
  return yes > 0 && yes < items.length;
}

/** Frage an einen Knoten hängen: zwei neue Äste. */
export function ask(node: TreeNode, q: Question): void {
  node.question = q;
  node.yes = { items: node.items.filter((x) => x.yes[q]) };
  node.no = { items: node.items.filter((x) => !x.yes[q]) };
}

/** Zahl der gestellten Fragen im Baum. */
export function countQuestions(node: TreeNode | undefined): number {
  if (!node?.question) return 0;
  return 1 + countQuestions(node.yes) + countQuestions(node.no);
}

/** Fertig, wenn alle Blätter rein sind. */
export function isDone(node: TreeNode): boolean {
  if (!node.question) return isPure(node.items);
  return isDone(node.yes!) && isDone(node.no!);
}

/** Kleinste Zahl an Fragen für einen fertigen Baum (Durchprobieren). */
export function fewestQuestions(items: readonly Beast[] = BEASTS): number {
  if (isPure(items)) return 0;
  let best = Infinity;
  for (const q of QUESTIONS) {
    if (!splits(items, q)) continue;
    best = Math.min(best, 1 + fewestQuestions(items.filter((x) => x.yes[q])) + fewestQuestions(items.filter((x) => !x.yes[q])));
  }
  return best;
}
