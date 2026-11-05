import { L } from '../../curriculum/helpers';
import type { Localized } from '../../i18n/config';
import { opLabel, type Dir, type MergeMode, type Op, type Part, type Test } from './model';

/**
 * Bauteile der offenen Welt mit Preis (in Münzen). Jedes Teil hat eine feste
 * Kennung (`id`), unter der es gespeichert und freigeschaltet wird.
 */
export type PartSpec =
  | { id: string; kind: 'belt'; price: number }
  | { id: string; kind: 'op'; op: Op; price: number }
  | { id: string; kind: 'sort'; test: Test; price: number }
  | { id: string; kind: 'merge'; mode: MergeMode; price: number }
  | { id: string; kind: 'split'; price: number }
  | { id: string; kind: 'alt'; price: number }
  | { id: string; kind: 'bridge'; price: number };

const sort = (id: string, test: Test, price: number): PartSpec => ({ id, kind: 'sort', test, price });
const merge = (mode: MergeMode, price: number): PartSpec => ({ id: `merge${mode}`, kind: 'merge', mode, price });

/**
 * Alle Teile der offenen Welt in der Reihenfolge des Inventars. Es gibt keine
 * Maschinen, die eine einzelne Zahl verändern (wie ×3): Zahlen entstehen nur,
 * indem man zwei Ströme zusammenführt, und Weichen filtern sie.
 */
export const WORLD_PARTS: PartSpec[] = [
  // Preise bewusst hoch: Man soll auf neue Teile sparen müssen
  { id: 'belt', kind: 'belt', price: 2 },
  { id: 'bridge', kind: 'bridge', price: 50 },
  merge('+', 60),
  merge('−', 120),
  merge('×', 250),
  merge('÷', 300),
  sort('even', { kind: 'even' }, 150),
  sort('div3', { kind: 'div', n: 3 }, 250),
  sort('gt50', { kind: 'gt', n: 50 }, 250),
  sort('prime', { kind: 'prime' }, 400),
  sort('square', { kind: 'square' }, 400),
];

/** Von Anfang an im Inventar; alles andere schalten Aufträge frei. */
export const STARTER_PARTS = ['belt', 'merge+'];
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
  if (part.alt) return 'alt';
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
    case 'alt':
      return { op: null, dir, alt: true, side };
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
      return L(`a${spec.mode}b`, `a${spec.mode}b`);
    case 'split':
      return L('Kopie', 'Copy');
    case 'alt':
      return L('Wechsel', 'Alternate');
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
    case 'alt':
      return L('Wechsel-Weiche (abwechselnd geradeaus und zur Seite)', 'Alternator (straight and to the side in turn)');
    case 'merge':
      return spec.mode === '+'
        ? L('Zusammenführen: Summe', 'Merger: sum')
        : spec.mode === '−'
          ? L('Zusammenführen: Differenz (größere − kleinere)', 'Merger: difference (bigger − smaller)')
          : spec.mode === '×'
            ? L('Zusammenführen: Produkt', 'Merger: product')
            : L('Zusammenführen: Quotient (größere ÷ kleinere)', 'Merger: quotient (bigger ÷ smaller)');
    case 'bridge':
      return L('Brücke (zum Kreuzen)', 'Bridge (for crossing)');
  }
}
