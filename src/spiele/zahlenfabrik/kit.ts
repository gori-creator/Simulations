import { L } from '../../curriculum/helpers';
import type { Localized } from '../../i18n/config';
import type { Op, Test } from './model';
import type { PartSpec } from './parts';

/**
 * Werkzeugkasten der Level: Jedes Kapitel bringt ein neues Bauteil (oder eine
 * neue Spielregel) mit einer kurzen Erklärung. Bauteile behält man für alle
 * späteren Kapitel – so verraten die Werkzeuge nicht mehr die Lösung, und man
 * muss selbst herausfinden, was man braucht.
 *
 * Maschinen und Weichen sind einstellbar: Welche Zahl die Plus-Maschine
 * addiert oder durch welche Zahl die Weiche prüft, wählt man selbst.
 */
export type KitId = 'plus' | 'minus' | 'times' | 'divide' | 'square' | 'even' | 'div' | 'gt' | 'prime';

/** Was ein Kapitel neu einführt: ein Bauteil oder eine Spielregel. */
export type LessonId = 'belt' | KitId | 'pick' | 'seq';

export interface KitItem {
  id: KitId;
  kind: 'op' | 'sort';
  /** Maschine: Rechenzeichen. */
  sym?: Op['sym'];
  /** Weiche: Art der Prüfung. */
  test?: Test['kind'];
  /** Einstellbare Zahl (von, bis); ohne: nicht einstellbar (x², gerade?, Primzahl?). */
  range?: [number, number];
  /** Zahl beim ersten Wählen. */
  start: number;
  name: Localized;
}

/** Alle Bauteile in der Reihenfolge des Werkzeugkastens. */
export const KIT: KitItem[] = [
  { id: 'plus', kind: 'op', sym: '+', range: [1, 10], start: 1, name: L('Plus-Maschine', 'Plus machine') },
  { id: 'minus', kind: 'op', sym: '−', range: [1, 10], start: 1, name: L('Minus-Maschine', 'Minus machine') },
  { id: 'times', kind: 'op', sym: '×', range: [2, 10], start: 2, name: L('Mal-Maschine', 'Times machine') },
  { id: 'divide', kind: 'op', sym: '÷', range: [2, 10], start: 2, name: L('Geteilt-Maschine', 'Divide machine') },
  { id: 'square', kind: 'op', sym: '²', start: 2, name: L('Quadrat-Maschine', 'Square machine') },
  { id: 'even', kind: 'sort', test: 'even', start: 0, name: L('Weiche „gerade?“', 'Switch “even?”') },
  { id: 'div', kind: 'sort', test: 'div', range: [2, 10], start: 3, name: L('Weiche „teilbar durch …?“', 'Switch “divisible by …?”') },
  { id: 'gt', kind: 'sort', test: 'gt', range: [0, 100], start: 10, name: L('Weiche „größer als …?“', 'Switch “greater than …?”') },
  { id: 'prime', kind: 'sort', test: 'prime', start: 0, name: L('Weiche „Primzahl?“', 'Switch “prime?”') },
];

export const kitItem = (id: KitId) => KIT.find((k) => k.id === id)!;
export const isKitId = (id: LessonId): id is KitId => KIT.some((k) => k.id === id);

/** Zahl in den erlaubten Bereich bringen (ganzzahlig). */
export function clampNum(item: KitItem, n: number): number {
  if (!item.range) return item.start;
  const v = Number.isFinite(n) ? Math.round(n) : item.start;
  return Math.min(item.range[1], Math.max(item.range[0], v));
}

/** Maschine bzw. Weiche mit eingestellter Zahl als Bauteil (im Level kostenlos). */
export function specFor(item: KitItem, n: number): PartSpec {
  const v = clampNum(item, n);
  if (item.kind === 'op') {
    const op: Op = { sym: item.sym!, n: item.sym === '²' ? 2 : v };
    return { id: item.sym === '²' ? '²2' : `${item.sym}${v}`, kind: 'op', op, price: 0 };
  }
  const test: Test = item.test === 'even' ? { kind: 'even' } : item.test === 'prime' ? { kind: 'prime' } : item.test === 'div' ? { kind: 'div', n: v } : { kind: 'gt', n: v };
  const id = test.kind === 'even' ? 'even' : test.kind === 'prime' ? 'prime' : `${test.kind}${v}`;
  return { id, kind: 'sort', test, price: 0 };
}

/** Gehört die Maschine zum Bauteil und liegt ihre Zahl im erlaubten Bereich? */
export function opAllowed(item: KitItem, op: Op): boolean {
  if (item.kind !== 'op' || item.sym !== op.sym) return false;
  if (!item.range) return true;
  return Number.isInteger(op.n) && op.n >= item.range[0] && op.n <= item.range[1];
}

/** Gehört die Weiche zum Bauteil und liegt ihre Zahl im erlaubten Bereich? */
export function testAllowed(item: KitItem, test: Test): boolean {
  if (item.kind !== 'sort' || item.test !== test.kind) return false;
  if (!item.range || (test.kind !== 'div' && test.kind !== 'gt')) return true;
  return Number.isInteger(test.n) && test.n >= item.range[0] && test.n <= item.range[1];
}

/** Alle Maschinen eines Werkzeugkastens mit allen erlaubten Zahlen (für Tests und Löser). */
export function allOps(items: KitItem[]): Op[] {
  return items.flatMap((k): Op[] => {
    if (k.kind !== 'op') return [];
    if (!k.range) return [{ sym: k.sym!, n: 2 }];
    return Array.from({ length: k.range[1] - k.range[0] + 1 }, (_, i) => ({ sym: k.sym!, n: k.range![0] + i }));
  });
}
