/**
 * Lektion „Gruppen ohne Etiketten“: k-Means mit drei Fähnchen.
 * Schritt 1: Jede Frucht gehört zum nächsten Fähnchen. Schritt 2: Jedes
 * Fähnchen wandert in die Mitte seiner Gruppe. Wiederholen, bis sich nichts
 * mehr ändert. Bit kennt dabei keine Namen – nur Größe und Süße.
 */
export interface Fruit {
  x: number;
  y: number;
  /** Nur zum Aufdecken am Ende; Bit sieht es nicht. */
  emoji: string;
}

const F = (x: number, y: number, emoji: string): Fruit => ({ x, y, emoji });

export const FRUITS: Fruit[] = [
  F(1.2, 6.8, '🫐'), F(1.8, 7.6, '🫐'), F(0.9, 7.9, '🫐'), F(2.1, 6.6, '🫐'), F(1.5, 8.4, '🫐'), F(2.5, 7.4, '🫐'), F(1.1, 7.2, '🫐'), F(2.0, 8.1, '🫐'),
  F(4.6, 1.8, '🍋'), F(5.3, 2.4, '🍋'), F(4.9, 1.2, '🍋'), F(5.8, 1.7, '🍋'), F(4.4, 2.6, '🍋'), F(5.5, 3.0, '🍋'), F(6.1, 2.2, '🍋'), F(5.0, 2.0, '🍋'),
  F(8.2, 7.9, '🍉'), F(8.8, 8.6, '🍉'), F(7.6, 8.4, '🍉'), F(9.1, 7.4, '🍉'), F(8.4, 6.9, '🍉'), F(7.9, 7.6, '🍉'), F(8.9, 8.0, '🍉'), F(8.5, 8.9, '🍉'),
];

export interface Flag {
  x: number;
  y: number;
}

/** Startfähnchen absichtlich ungünstig, damit man das Wandern sieht. */
export const START_FLAGS: Flag[] = [
  { x: 3.5, y: 5.5 },
  { x: 5, y: 5.5 },
  { x: 6.5, y: 5.5 },
];

export function assign(points: readonly { x: number; y: number }[], flags: readonly Flag[]): number[] {
  return points.map((p) => {
    let best = 0;
    let bd = Infinity;
    flags.forEach((f, i) => {
      const d = (p.x - f.x) ** 2 + (p.y - f.y) ** 2;
      if (d < bd) {
        bd = d;
        best = i;
      }
    });
    return best;
  });
}

export function moveFlags(points: readonly { x: number; y: number }[], groups: readonly number[], flags: readonly Flag[]): Flag[] {
  return flags.map((f, i) => {
    const mine = points.filter((_, k) => groups[k] === i);
    if (!mine.length) return { ...f };
    return { x: mine.reduce((s, p) => s + p.x, 0) / mine.length, y: mine.reduce((s, p) => s + p.y, 0) / mine.length };
  });
}

/** Sind die Gruppen „rein“ (jede Gruppe nur eine Fruchtsorte)? */
export function pure(groups: readonly number[], points: readonly Fruit[] = FRUITS): boolean {
  const byGroup = new Map<number, Set<string>>();
  groups.forEach((g, i) => {
    const s = byGroup.get(g) ?? new Set<string>();
    s.add(points[i]!.emoji);
    byGroup.set(g, s);
  });
  return [...byGroup.values()].every((s) => s.size === 1) && byGroup.size === 3;
}
