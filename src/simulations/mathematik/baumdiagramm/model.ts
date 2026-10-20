/**
 * Rechenlogik für „Mehrstufige Zufallsexperimente und Pfadregeln“: Ziehen
 * aus einer Urne mit bzw. ohne Zurücklegen, Baumdiagramm mit exakten
 * Bruch-Wahrscheinlichkeiten, 1. Pfadregel (Produkt entlang eines Pfades),
 * 2. Pfadregel (Summe der Pfade eines Ereignisses), Ereignisse und
 * Simulation. Keine Zeichenbefehle.
 */

export type Color = 'r' | 'b' | 'g';
export const COLORS: readonly Color[] = ['r', 'b', 'g'];

/* ------------------------------------------------------------------ */
/* Brüche                                                              */
/* ------------------------------------------------------------------ */

export interface Frac {
  n: number;
  d: number;
}

export function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

/** Gekürzter Bruch (Nenner positiv; 0 wird zu 0/1). */
export function frac(n: number, d: number): Frac {
  if (d === 0) return { n: 0, d: 1 };
  if (n === 0) return { n: 0, d: 1 };
  const s = d < 0 ? -1 : 1;
  const g = gcd(n, d);
  return { n: (s * n) / g, d: (s * d) / g };
}

export const fmul = (a: Frac, b: Frac): Frac => frac(a.n * b.n, a.d * b.d);
export const fadd = (a: Frac, b: Frac): Frac => frac(a.n * b.d + b.n * a.d, a.d * b.d);
export const fsub = (a: Frac, b: Frac): Frac => frac(a.n * b.d - b.n * a.d, a.d * b.d);
export const fval = (a: Frac): number => a.n / a.d;
export const ONE: Frac = { n: 1, d: 1 };
export const ZERO: Frac = { n: 0, d: 1 };

/** Ungekürztes Produkt der Zähler und Nenner (für die Anzeige „3·2 / 7·6“). */
export function rawProduct(fs: readonly Frac[]): { n: number; d: number } {
  return fs.reduce((acc, f) => ({ n: acc.n * f.n, d: acc.d * f.d }), { n: 1, d: 1 });
}

/* ------------------------------------------------------------------ */
/* Urne und Baum                                                       */
/* ------------------------------------------------------------------ */

export type Urn = Record<Color, number>;

export const urnTotal = (u: Urn): number => u.r + u.b + u.g;

/** Farben, die in der Urne vorkommen (in fester Reihenfolge). */
export const urnColors = (u: Urn): Color[] => COLORS.filter((c) => u[c] > 0);

/** Urne nach dem Ziehen der Farben in `path` (ohne Zurücklegen). */
export function urnAfter(u: Urn, path: string, replace: boolean): Urn {
  if (replace) return { ...u };
  const next = { ...u };
  for (const ch of path) next[ch as Color] = Math.max(0, next[ch as Color] - 1);
  return next;
}

/**
 * Wahrscheinlichkeit, als Nächstes die Farbe c zu ziehen, nachdem schon
 * `path` gezogen wurde. Als Bruch mit dem *ungekürzten* Nenner
 * „Kugeln in der Urne“ (für die Beschriftung am Ast, z. B. 3/7).
 */
export function branchRaw(u: Urn, path: string, c: Color, replace: boolean): { n: number; d: number } {
  const now = urnAfter(u, path, replace);
  return { n: now[c], d: urnTotal(now) };
}

export interface TreeNode {
  /** Bisher gezogene Farben, z. B. "rb". */
  path: string;
  /** Wahrscheinlichkeit am Ast zu diesem Knoten (ungekürzt für die Anzeige). */
  edge: { n: number; d: number };
  /** Pfadwahrscheinlichkeit (gekürzt). */
  prob: Frac;
  children: TreeNode[];
}

/**
 * Baumdiagramm mit `stages` Stufen. Äste mit Wahrscheinlichkeit 0 (Farbe
 * aufgebraucht) werden weggelassen.
 */
export function buildTree(u: Urn, stages: number, replace: boolean): TreeNode {
  const make = (path: string, edge: { n: number; d: number }, prob: Frac): TreeNode => {
    const node: TreeNode = { path, edge, prob, children: [] };
    if (path.length < stages) {
      for (const c of COLORS) {
        const e = branchRaw(u, path, c, replace);
        if (e.n <= 0 || e.d <= 0) continue;
        node.children.push(make(path + c, e, fmul(prob, frac(e.n, e.d))));
      }
    }
    return node;
  };
  return make('', { n: 1, d: 1 }, ONE);
}

/** Alle Blätter (Ergebnisse) von oben nach unten. */
export function leaves(t: TreeNode): TreeNode[] {
  if (!t.children.length) return [t];
  return t.children.flatMap(leaves);
}

/** Die Äste (ungekürzt) entlang eines Pfades. */
export function pathEdges(u: Urn, path: string, replace: boolean): { n: number; d: number }[] {
  const out: { n: number; d: number }[] = [];
  for (let i = 0; i < path.length; i++) out.push(branchRaw(u, path.slice(0, i), path[i] as Color, replace));
  return out;
}

/** 1. Pfadregel: Wahrscheinlichkeit eines Pfades = Produkt der Astwahrscheinlichkeiten. */
export function pathProb(u: Urn, path: string, replace: boolean): Frac {
  return pathEdges(u, path, replace).reduce((p, e) => fmul(p, frac(e.n, e.d)), ONE);
}

/* ------------------------------------------------------------------ */
/* Ereignisse                                                          */
/* ------------------------------------------------------------------ */

export type EventId = 'none' | 'same' | 'diff' | 'oneR' | 'minR' | 'noR' | 'firstR' | 'custom';

/** Gehört das Ergebnis `path` zum Ereignis? (`sel`: gewählte Pfade bei „custom“) */
export function inEvent(ev: EventId, path: string, sel: readonly string[] = []): boolean {
  const reds = [...path].filter((c) => c === 'r').length;
  switch (ev) {
    case 'same':
      return new Set(path).size === 1;
    case 'diff':
      return new Set(path).size === path.length;
    case 'oneR':
      return reds === 1;
    case 'minR':
      return reds >= 1;
    case 'noR':
      return reds === 0;
    case 'firstR':
      return path[0] === 'r';
    case 'custom':
      return sel.includes(path);
    default:
      return false;
  }
}

/** 2. Pfadregel: P(E) = Summe der Wahrscheinlichkeiten der Pfade, die zu E gehören. */
export function eventProb(t: TreeNode, ev: EventId, sel: readonly string[] = []): Frac {
  return leaves(t)
    .filter((l) => inEvent(ev, l.path, sel))
    .reduce((s, l) => fadd(s, l.prob), ZERO);
}

/** Auswahl aus dem Text „rb,br“ lesen (nur gültige Pfade). */
export function parseSel(text: string, valid: readonly string[]): string[] {
  const set = new Set(
    text
      .split(/[,;\s]+/)
      .map((s) => s.trim().toLowerCase())
      .filter((s) => valid.includes(s)),
  );
  return valid.filter((v) => set.has(v));
}

/* ------------------------------------------------------------------ */
/* Simulation                                                          */
/* ------------------------------------------------------------------ */

/** Ein Durchgang: `stages` Kugeln ziehen (mit/ohne Zurücklegen). `rnd` liefert Zahlen in [0, 1). */
export function drawPath(u: Urn, stages: number, replace: boolean, rnd: () => number): string {
  let path = '';
  for (let i = 0; i < stages; i++) {
    const now = urnAfter(u, path, replace);
    const total = urnTotal(now);
    if (total <= 0) break;
    let x = rnd() * total;
    let pick: Color = 'r';
    for (const c of COLORS) {
      if (x < now[c]) {
        pick = c;
        break;
      }
      x -= now[c];
    }
    path += pick;
  }
  return path;
}

/** Größte sinnvolle Stufenzahl: ohne Zurücklegen höchstens so viele, wie Kugeln da sind. */
export function maxStages(u: Urn, replace: boolean, cap = 3): number {
  return replace ? cap : Math.max(1, Math.min(cap, urnTotal(u)));
}

/* ------------------------------------------------------------------ */
/* Ergänzungen: Sonderfälle, Gegenereignis, Häufigkeiten              */
/* ------------------------------------------------------------------ */

/**
 * Farben, die an einem Knoten (nach `path`) aufgebraucht sind, obwohl sie
 * anfangs in der Urne waren – dort endet ein Ast mit Wahrscheinlichkeit 0.
 */
export function exhaustedColors(u: Urn, path: string, replace: boolean): Color[] {
  if (replace) return [];
  const now = urnAfter(u, path, false);
  return urnColors(u).filter((c) => now[c] === 0);
}

/** Nach wie vielen Zügen ist die Urne ohne Zurücklegen leer? (mit Zurücklegen: nie) */
export const emptyAfter = (u: Urn, replace: boolean): number => (replace ? Infinity : urnTotal(u));

/** Gegenereignis: P(Ē) = 1 − P(E). */
export function complementProb(t: TreeNode, ev: EventId, sel: readonly string[] = []): Frac {
  return fsub(ONE, eventProb(t, ev, sel));
}

/** Pfade eines Ereignisses und seines Gegenereignisses (für „Rechnen über das Gegenereignis“). */
export function splitPaths(t: TreeNode, ev: EventId, sel: readonly string[] = []): { inside: string[]; outside: string[] } {
  const all = leaves(t).map((l) => l.path);
  return { inside: all.filter((p) => inEvent(ev, p, sel)), outside: all.filter((p) => !inEvent(ev, p, sel)) };
}

/** 95-%-Bereich der relativen Häufigkeit nach N Versuchen. */
export function band95(p: number, N: number): [number, number] {
  if (N <= 0) return [0, 1];
  const h = 1.96 * Math.sqrt((p * (1 - p)) / N);
  return [Math.max(0, p - h), Math.min(1, p + h)];
}
