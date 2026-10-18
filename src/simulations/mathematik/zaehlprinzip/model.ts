/**
 * Rechenlogik für „Zählprinzip und Baumdiagramm“: Produktregel, Variationen
 * mit und ohne Wiederholung, Fakultät, Liste der Pfade und eine Auswahl der
 * Pfade, die im Baumdiagramm noch gezeichnet werden können.
 *
 * Ein Zufalls- bzw. Auswahlvorgang besteht aus k Stufen. Ein Pfad ist die
 * Folge der gewählten Möglichkeiten (Indizes) je Stufe.
 *
 * - Unabhängige Stufen (z. B. Hose × T-Shirt × Mütze): Stufe i hat eigene
 *   `counts[i]` Möglichkeiten.
 * - Gemeinsamer Vorrat (Eiskugeln, Ziffern, Läufer): Jede Stufe wählt aus
 *   denselben n Dingen; „ohne Wiederholung“ darf jedes Ding nur einmal
 *   vorkommen, die Auswahl wird je Stufe um 1 kleiner.
 */

export interface Plan {
  /** Möglichkeiten je Stufe bei unabhängigen Stufen (bei Vorrat: n je Stufe). */
  options: number[];
  /** Alle Stufen wählen aus demselben Vorrat (sonst unabhängige Stufen). */
  pool: boolean;
  /** Mit Wiederholung (nur bei gemeinsamem Vorrat von Bedeutung). */
  rep: boolean;
}

/** Plan für unabhängige Stufen (Produktregel). */
export function independentPlan(counts: number[]): Plan {
  return { options: counts.map((c) => Math.max(0, Math.floor(c))), pool: false, rep: true };
}

/** Plan für k Stufen aus einem Vorrat von n Dingen. */
export function poolPlan(n: number, k: number, rep: boolean): Plan {
  const nn = Math.max(0, Math.floor(n));
  return { options: Array.from({ length: Math.max(0, Math.floor(k)) }, () => nn), pool: true, rep };
}

/** Anzahl der Stufen. */
export const stageCount = (plan: Plan): number => plan.options.length;

/** Anzahl der Möglichkeiten je Stufe (ohne Wiederholung: n, n − 1, n − 2, …; nie negativ). */
export function stageCounts(plan: Plan): number[] {
  if (!plan.pool || plan.rep) return plan.options.slice();
  return plan.options.map((n, i) => Math.max(0, n - i));
}

/** Produktregel: Anzahl aller Pfade = Produkt der Anzahlen je Stufe (leeres Produkt = 1). */
export function productRule(counts: readonly number[]): number {
  return counts.reduce((p, c) => p * c, 1);
}

/** Anzahl aller Ergebnisse eines Plans. */
export const totalPaths = (plan: Plan): number => productRule(stageCounts(plan));

/** Fakultät n! = 1 · 2 · … · n (0! = 1). */
export function factorial(n: number): number {
  let f = 1;
  for (let i = 2; i <= n; i++) f *= i;
  return f;
}

/** Variation mit Wiederholung: k Stufen aus n Dingen, n^k Möglichkeiten. */
export function variationsWithRep(n: number, k: number): number {
  return n ** k;
}

/** Variation ohne Wiederholung: n · (n − 1) · … · (n − k + 1) = n! / (n − k)!; 0, wenn k > n. */
export function variationsWithoutRep(n: number, k: number): number {
  if (k > n) return 0;
  let v = 1;
  for (let i = 0; i < k; i++) v *= n - i;
  return v;
}

/** Permutationen: Anzahl der Reihenfolgen von n Dingen = n!. */
export const permutations = (n: number): number => factorial(n);

/** Möglichkeiten (Indizes) der nächsten Stufe nach dem Teilpfad `prefix`. */
export function childOptions(plan: Plan, prefix: readonly number[]): number[] {
  const level = prefix.length;
  if (level >= plan.options.length) return [];
  const n = plan.options[level]!;
  const all = Array.from({ length: n }, (_, i) => i);
  if (!plan.pool || plan.rep) return all;
  return all.filter((i) => !prefix.includes(i));
}

/** Anzahl der vollständigen Pfade unterhalb eines Teilpfads (hängt nur von seiner Länge ab). */
export function pathsBelow(plan: Plan, depth: number): number {
  return productRule(stageCounts(plan).slice(depth));
}

/** Die ersten `limit` Pfade in systematischer (lexikografischer) Reihenfolge. */
export function enumeratePaths(plan: Plan, limit = Infinity): number[][] {
  const out: number[][] = [];
  const k = plan.options.length;
  if (k === 0 || totalPaths(plan) === 0) return out;
  const walk = (prefix: number[]) => {
    if (out.length >= limit) return;
    if (prefix.length === k) {
      out.push(prefix.slice());
      return;
    }
    for (const o of childOptions(plan, prefix)) {
      prefix.push(o);
      walk(prefix);
      prefix.pop();
      if (out.length >= limit) return;
    }
  };
  walk([]);
  return out;
}

/** Die ersten `limit` Pfade, die mit `prefix` beginnen. */
export function pathsWithPrefix(plan: Plan, prefix: readonly number[], limit = Infinity): number[][] {
  const out: number[][] = [];
  const k = plan.options.length;
  const walk = (p: number[]) => {
    if (out.length >= limit) return;
    if (p.length === k) {
      out.push(p.slice());
      return;
    }
    for (const o of childOptions(plan, p)) {
      p.push(o);
      walk(p);
      p.pop();
      if (out.length >= limit) return;
    }
  };
  walk(prefix.slice());
  return out;
}

/** Schlüssel eines (Teil-)Pfads, z. B. „2.0.1“ (Wurzel: „“). */
export const pathKey = (path: readonly number[]): string => path.join('.');

/** Knoten des gezeichneten Baums. */
export interface TreeNode {
  key: string;
  path: number[];
  /** Stufe (0 = Start, 1 = erste Stufe, …). */
  level: number;
  parent: string | null;
  /** Kinder, die gezeichnet werden (leer bei Blatt, Sammelast, Sackgasse und „weitere“). */
  children: string[];
  /** Zeile (für Blätter, Sammeläste, Sackgassen und „weitere“), sonst −1. */
  row: number;
  /**
   * inner: aufgeklappter Knoten, leaf: vollständiger Pfad, stub: Knoten, dessen
   * Teilbaum zugeklappt ist, more: mehrere zusammengefasste Geschwister,
   * dead: Sackgasse (keine Möglichkeit mehr übrig).
   */
  kind: 'inner' | 'leaf' | 'stub' | 'more' | 'dead';
  /** Bei stub und more: Anzahl der nicht gezeichneten vollständigen Pfade. */
  hidden: number;
  /** Bei more: Anzahl der zusammengefassten Geschwister. */
  siblings: number;
}

export interface VisibleTree {
  nodes: TreeNode[];
  byKey: Map<string, TreeNode>;
  /** Anzahl der Zeilen (Blätter, Sammeläste, „weitere“, Sackgassen). */
  rows: number;
  /** Gezeichnete vollständige Pfade, systematisch geordnet (ein Anfangsstück aller Pfade). */
  leaves: number[][];
  /** Anzahl aller Pfade. */
  total: number;
}

/**
 * Wie viele Knoten je Stufe entlang des ersten Pfads einzeln gezeichnet
 * werden, damit höchstens `budget` Zeilen entstehen. Vorrang hat die letzte
 * Stufe (die Ergebnisse), dann die erste, dann reihum die mittleren.
 */
export function spineCounts(counts: readonly number[], budget: number): number[] {
  const k = counts.length;
  const s = counts.map((c) => Math.min(1, c));
  const cost = () => s.reduce((r, sd, i) => r + (i < k - 1 ? sd - 1 : sd) + (sd < counts[i]! ? 1 : 0), 0);
  const grow = (d: number): boolean => {
    if (s[d]! >= counts[d]!) return false;
    s[d]!++;
    if (cost() > budget) {
      s[d]!--;
      return false;
    }
    return true;
  };
  if (k === 0) return s;
  while (grow(k - 1));
  while (grow(0));
  let more = true;
  while (more) {
    more = false;
    for (let d = 1; d < k - 1; d++) if (grow(d)) more = true;
  }
  return s;
}

/**
 * Baum für die Darstellung mit höchstens etwa `budget` Zeilen.
 *
 * Passt ein Teilbaum ganz hinein, wird er ganz gezeichnet. Sonst wird der
 * erste Ast weiter aufgeklappt (je Stufe so viele Knoten, wie `spineCounts`
 * erlaubt), weitere Geschwister werden ganz gezeichnet, solange Platz ist,
 * danach zugeklappt; was nicht mehr einzeln passt, wird zu „+ m weitere“
 * zusammengefasst. So bilden die gezeichneten Blätter immer den Anfang der
 * systematischen Liste aller Pfade.
 */
export function visibleTree(plan: Plan, budget: number): VisibleTree {
  const k = plan.options.length;
  const counts = stageCounts(plan);
  const nodes: TreeNode[] = [];
  const byKey = new Map<string, TreeNode>();
  const leaves: number[][] = [];
  let row = 0;
  const below = (depth: number) => productRule(counts.slice(depth));
  /** Zeilen, die ein vollständig gezeichneter Teilbaum der Tiefe `depth` braucht. */
  const fullRows = (depth: number): number => {
    let rows = 1;
    for (let d = depth; d < k; d++) {
      if (counts[d] === 0) return rows;
      rows *= counts[d]!;
    }
    return rows;
  };
  const spine = spineCounts(counts, Math.max(1, budget));

  const add = (path: number[], parent: string | null, kind: TreeNode['kind'], key = pathKey(path)): TreeNode => {
    const node: TreeNode = { key, path, level: path.length, parent, children: [], row: -1, kind, hidden: 0, siblings: 0 };
    nodes.push(node);
    byKey.set(node.key, node);
    if (parent !== null) byKey.get(parent)!.children.push(node.key);
    return node;
  };

  const full = (node: TreeNode): number => {
    if (node.level === k) {
      node.kind = 'leaf';
      node.row = row++;
      leaves.push(node.path);
      return 1;
    }
    const opts = childOptions(plan, node.path);
    if (opts.length === 0) {
      node.kind = 'dead';
      node.row = row++;
      return 1;
    }
    let used = 0;
    for (const o of opts) used += full(add([...node.path, o], node.key, 'inner'));
    return used;
  };

  /** Teilbaum zeichnen; `room` = verfügbare Zeilen. Gibt die verbrauchten Zeilen zurück. */
  const build = (node: TreeNode, room: number): number => {
    const depth = node.level;
    if (depth === k || fullRows(depth) <= room) return full(node);
    const opts = childOptions(plan, node.path);
    if (opts.length === 0) return full(node);
    const shown = opts.slice(0, Math.max(1, spine[depth] ?? 1));
    const rest = opts.length - shown.length;
    let left = room - (rest > 0 ? 1 : 0);
    let open = true;
    let used = 0;
    shown.forEach((o, i) => {
      const child = add([...node.path, o], node.key, 'inner');
      const avail = Math.max(1, left - (shown.length - 1 - i));
      let u: number;
      if (depth + 1 === k || (open && fullRows(depth + 1) <= avail)) u = full(child);
      else if (i === 0) {
        u = build(child, avail);
        open = false;
      } else {
        child.kind = 'stub';
        child.hidden = below(depth + 1);
        child.row = row++;
        u = 1;
        open = false;
      }
      left -= u;
      used += u;
    });
    if (rest > 0) {
      const more = add([...node.path], node.key, 'more', `${node.key}+`);
      more.level = depth + 1;
      more.siblings = rest;
      more.hidden = rest * below(depth + 1);
      more.row = row++;
      used += 1;
    }
    return used;
  };

  add([], null, 'inner');
  if (k > 0) build(nodes[0]!, Math.max(1, budget));
  return { nodes, byKey, rows: row, leaves, total: totalPaths(plan) };
}

/** Ganze Zahl mit Tausendertrennung (DE: schmales Leerzeichen ab 10 000, EN: Komma ab 10,000). */
export function groupDigits(n: number, lang: 'de' | 'en'): string {
  const s = String(Math.round(Math.abs(n)));
  const sign = n < 0 ? '−' : '';
  if (s.length <= 4) return sign + s;
  const sep = lang === 'de' ? ' ' : ',';
  return sign + s.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
}
