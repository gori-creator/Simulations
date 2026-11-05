import { L } from '../../curriculum/helpers';
import type { Localized } from '../../i18n/config';
import { opLabel, type Dir, type Op, type Part, type Test } from './model';

/**
 * Bauteile der offenen Welt mit Preis (in Münzen). Jedes Teil hat eine feste
 * Kennung (`id`), unter der es gespeichert und freigeschaltet wird.
 */
export type PartSpec =
  | { id: string; kind: 'belt'; price: number }
  | { id: string; kind: 'op'; op: Op; price: number }
  | { id: string; kind: 'sort'; test: Test; price: number }
  | { id: string; kind: 'merge'; mode: '+' | '×'; price: number }
  | { id: string; kind: 'split'; price: number }
  | { id: string; kind: 'bridge'; price: number };

const op = (sym: Op['sym'], n: number, price: number): PartSpec => ({ id: `${sym}${n}`, kind: 'op', op: { sym, n }, price });
const sort = (id: string, test: Test, price: number): PartSpec => ({ id, kind: 'sort', test, price });

/** Alle Teile in der Reihenfolge des Inventars. */
export const WORLD_PARTS: PartSpec[] = [
  { id: 'belt', kind: 'belt', price: 1 },
  { id: 'bridge', kind: 'bridge', price: 15 },
  op('+', 1, 8),
  op('−', 1, 8),
  op('×', 2, 30),
  op('÷', 2, 20),
  op('+', 5, 25),
  op('×', 3, 60),
  op('×', 10, 250),
  sort('even', { kind: 'even' }, 40),
  sort('div3', { kind: 'div', n: 3 }, 70),
  sort('prime', { kind: 'prime' }, 120),
  sort('gt50', { kind: 'gt', n: 50 }, 90),
  { id: 'merge+', kind: 'merge', mode: '+', price: 100 },
  { id: 'merge×', kind: 'merge', mode: '×', price: 200 },
];

/** Von Anfang an im Inventar; alles andere schalten Aufträge frei. */
export const STARTER_PARTS = ['belt', '+1'];
export const START_COINS = 40;

export function specById(id: string): PartSpec | undefined {
  return WORLD_PARTS.find((s) => s.id === id);
}

/** Kennung eines gebauten Teils (passend zu WORLD_PARTS). */
export function partId(part: Part): string {
  if (part.op) return opLabel(part.op);
  if (part.sort) {
    const t = part.sort;
    return t.kind === 'even' || t.kind === 'prime' || t.kind === 'square' ? t.kind : t.kind === 'div' ? `div${t.n}` : `gt${t.n}`;
  }
  if (part.merge) return `merge${part.merge}`;
  if (part.split) return 'split';
  if (part.bridge) return 'bridge';
  return 'belt';
}

export function makePart(spec: PartSpec, dir: Dir, side: 1 | 3 = 1): Part {
  switch (spec.kind) {
    case 'belt':
      return { op: null, dir };
    case 'op':
      return { op: spec.op, dir };
    case 'sort':
      return { op: null, dir, sort: spec.test, side };
    case 'merge':
      return { op: null, dir, merge: spec.mode };
    case 'split':
      return { op: null, dir, split: true, side };
    case 'bridge':
      return { op: null, dir, bridge: true };
  }
}

export function priceOf(part: Part): number {
  return specById(partId(part))?.price ?? 0;
}

/** Kurze Aufschrift (passt auf ein Feld). */
export function testLabel(test: Test): Localized {
  switch (test.kind) {
    case 'even':
      return L('gerade?', 'even?');
    case 'div':
      return L(`÷${test.n}?`, `÷${test.n}?`);
    case 'prime':
      return L('Prim?', 'prime?');
    case 'gt':
      return L(`>${test.n}?`, `>${test.n}?`);
    case 'square':
      return L('Quadrat?', 'square?');
  }
}

export function specLabel(spec: PartSpec): Localized {
  switch (spec.kind) {
    case 'belt':
      return L('Band', 'Belt');
    case 'op':
      return L(opLabel(spec.op), opLabel(spec.op));
    case 'sort':
      return testLabel(spec.test);
    case 'merge':
      return spec.mode === '+' ? L('a+b', 'a+b') : L('a×b', 'a×b');
    case 'split':
      return L('Kopie', 'Copy');
    case 'bridge':
      return L('Brücke', 'Bridge');
  }
}

/** Ausführlicher Name (für Hinweise, Beschriftungen und Vorlesen). */
export function specName(spec: PartSpec): Localized {
  switch (spec.kind) {
    case 'belt':
      return L('Band', 'Belt');
    case 'op':
      return L(`Maschine ${opLabel(spec.op)}`, `Machine ${opLabel(spec.op)}`);
    case 'sort': {
      const t = spec.test;
      if (t.kind === 'even') return L('Weiche „gerade?“', 'Switch “even?”');
      if (t.kind === 'prime') return L('Weiche „Primzahl?“', 'Switch “prime?”');
      if (t.kind === 'div') return L(`Weiche „teilbar durch ${t.n}?“`, `Switch “divisible by ${t.n}?”`);
      if (t.kind === 'square') return L('Weiche „Quadratzahl?“', 'Switch “square number?”');
      return L(`Weiche „größer als ${t.n}?“`, `Switch “greater than ${t.n}?”`);
    }
    case 'split':
      return L('Verteiler (Kopie in zwei Richtungen)', 'Splitter (copy in two directions)');
    case 'merge':
      return spec.mode === '+' ? L('Zusammenführen: Summe', 'Merger: sum') : L('Zusammenführen: Produkt', 'Merger: product');
    case 'bridge':
      return L('Brücke (zum Kreuzen)', 'Bridge (for crossing)');
  }
}
