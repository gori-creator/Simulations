import { allOps, type KitItem } from './kit';
import { accepts, apply, sourceValue, targetsOf, totalNeed, type Level, type Op } from './model';

/**
 * Kleiner Löser für Rechenketten: Welche Maschinen nacheinander machen aus den
 * Zahlen der Quelle genau das, was das Lager will? Für Tipps und das
 * Tagesrätsel. Durchsucht alle Ketten bis zur Länge `max` (Breitensuche, also
 * zuerst die kürzesten).
 */
const LIMIT = 100000;

/** Lässt sich das Level als einfache Kette lösen (ein Lager, keine Weichen, keine vorgegebenen Teile)? */
export function chainLevel(level: Level): boolean {
  return targetsOf(level).length === 1 && !level.fixed?.length && !level.source.pick && level.emit === undefined && !level.more?.length;
}

/** Kürzeste Lösungen (höchstens `want` Stück) mit den Maschinen aus `kit`. */
export function solveChain(level: Level, kit: KitItem[], max: number, want = 2): Op[][] {
  const ops = allOps(kit);
  const target = targetsOf(level)[0]!;
  const n = totalNeed(level);
  const start = Array.from({ length: n }, (_, i) => sourceValue(level, i));
  const ok = (vals: number[]) => vals.every((v, i) => accepts(target, v, i));
  if (ok(start)) return [[]];
  let frontier: { vals: number[]; chain: Op[] }[] = [{ vals: start, chain: [] }];
  for (let len = 1; len <= max; len++) {
    const found: Op[][] = [];
    const next: typeof frontier = [];
    for (const f of frontier) {
      for (const op of ops) {
        const vals: number[] = [];
        let bad = false;
        for (const v of f.vals) {
          const w = apply(op, v);
          if (w === null || Math.abs(w) > LIMIT) {
            bad = true;
            break;
          }
          vals.push(w);
        }
        if (bad) continue;
        const chain = [...f.chain, op];
        if (ok(vals)) {
          found.push(chain);
          if (found.length >= want) return found;
        } else if (len < max) next.push({ vals, chain });
      }
    }
    if (found.length) return found;
    frontier = next;
  }
  return [];
}

/** Zufallszahlen aus einem Startwert (immer dieselbe Folge, z. B. für das Tagesrätsel). */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Rätsel „Aus a wird b“ mit genau einem Weg aus drei Maschinen (und keinem
 * kürzeren). Probiert Startzahlen, bis es eines findet.
 */
export function makeRiddle(seed: number, kit: KitItem[]): { from: number; to: number; chain: Op[] } {
  const random = rng(seed);
  // nur ganze Zahlen (Bruch- und Kehrwert-Maschine bleiben bei diesen Rätseln außen vor)
  const ops = allOps(kit).filter((o) => o.sym !== ':' && o.sym !== '⅟');
  for (let attempt = 0; attempt < 40; attempt++) {
    const from = 2 + Math.floor(random() * 60);
    // Wie oft wird jede Zahl erreicht, und wie kurz geht es?
    const count = new Map<number, number>();
    const shortest = new Map<number, number>();
    const only = new Map<number, Op[]>();
    let frontier: { v: number; chain: Op[] }[] = [{ v: from, chain: [] }];
    for (let len = 1; len <= 3; len++) {
      const next: typeof frontier = [];
      for (const f of frontier) {
        for (const op of ops) {
          const w = apply(op, f.v);
          if (w === null || Math.abs(w) > 20000) continue;
          const chain = [...f.chain, op];
          count.set(w, (count.get(w) ?? 0) + 1);
          if (!shortest.has(w)) shortest.set(w, len);
          only.set(w, chain);
          if (len < 3) next.push({ v: w, chain });
        }
      }
      frontier = next;
    }
    const plain = (c: Op[]) => c.every((o) => o.sym === '+' || o.sym === '−');
    const options = [...count]
      .filter(([t, c]) => c === 1 && shortest.get(t) === 3 && t !== from && Math.abs(t) <= 5000 && !plain(only.get(t)!))
      .map(([t]) => t)
      .sort((a, b) => a - b);
    if (options.length) {
      const to = options[Math.floor(random() * options.length)]!;
      return { from, to, chain: only.get(to)! };
    }
  }
  return { from: 2, to: 329, chain: [{ sym: '×', n: 9 }, { sym: '²', n: 2 }, { sym: '+', n: 5 }] };
}
