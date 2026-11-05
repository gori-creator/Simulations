import { L } from '../../curriculum/helpers';
import type { Localized } from '../../i18n/config';
import { isPrime } from './model';
import { START_COINS, STARTER_PARTS } from './parts';

/**
 * Aufträge an der Basis (offene Welt): „Liefere 10-mal die 4“, „Liefere
 * 15 Primzahlen“ … Jeder geschaffte Auftrag bringt Münzen und schaltet
 * neue Teile frei. Danach geht es mit immer neuen Aufträgen weiter.
 *
 * Münzen gibt es außerdem für jede gelieferte Zahl – nicht nach ihrer Größe
 * (sonst ließen sich mit Malnehmen beliebig viele Münzen machen), sondern
 * 1 Münze je Zahl und 4 extra, wenn sie zum aktuellen Auftrag passt.
 */
export type OrderKind = 'any' | 'exact' | 'even' | 'odd' | 'multiple' | 'prime' | 'square' | 'greater';

export interface Order {
  kind: OrderKind;
  /** Zahl zum Auftrag (genau diese Zahl, Vielfache von n, größer als n). */
  n?: number;
  /** So viele passende Zahlen. */
  count: number;
  /** Nur passende Zahlen hintereinander: eine andere setzt auf 0 zurück. */
  streak?: boolean;
  reward: number;
  /** Teile, die der Auftrag freischaltet (Kennungen aus parts.ts). */
  unlock: string[];
}

/** Die ersten Aufträge: führen Schritt für Schritt an alle Teile heran. */
export const ORDERS: Order[] = [
  { kind: 'any', count: 10, reward: 30, unlock: ['bridge'] },
  { kind: 'greater', n: 12, count: 10, reward: 50, unlock: ['merge−'] },
  { kind: 'even', count: 15, reward: 60, unlock: ['even'] },
  { kind: 'exact', n: 10, count: 10, reward: 80, unlock: ['merge×'] },
  { kind: 'multiple', n: 6, count: 15, reward: 100, unlock: ['div3'] },
  { kind: 'greater', n: 50, count: 15, reward: 120, unlock: ['gt50'] },
  { kind: 'exact', n: 1, count: 10, reward: 140, unlock: ['merge÷'] },
  { kind: 'odd', count: 20, reward: 150, unlock: ['prime'] },
  { kind: 'prime', count: 15, reward: 200, unlock: ['square'] },
  { kind: 'square', count: 10, reward: 250, unlock: [] },
  { kind: 'prime', count: 20, streak: true, reward: 300, unlock: [] },
  { kind: 'exact', n: 24, count: 15, reward: 350, unlock: [] },
  { kind: 'exact', n: 100, count: 10, reward: 400, unlock: [] },
];

/** Auftrag Nummer i (ab 0). Nach der Liste kommen immer neue, etwas schwerere. */
export function orderAt(i: number): Order {
  if (i < ORDERS.length) return ORDERS[i]!;
  const k = i - ORDERS.length;
  const round = Math.floor(k / 5);
  const reward = 500 + 100 * k;
  switch (k % 5) {
    case 0:
      return { kind: 'exact', n: 12 * (round + 2), count: 20 + 5 * round, reward, unlock: [] };
    case 1:
      return { kind: 'multiple', n: [4, 6, 7, 9, 11][round % 5]!, count: 25 + 5 * round, reward, unlock: [] };
    case 2:
      return { kind: 'prime', count: 20 + 5 * round, streak: true, reward, unlock: [] };
    case 3:
      return { kind: 'square', count: 15 + 5 * round, reward, unlock: [] };
    default:
      return { kind: 'greater', n: 200 * (round + 1), count: 10 + 5 * round, reward, unlock: [] };
  }
}

const isSquare = (v: number) => Number.isInteger(v) && v >= 0 && Number.isInteger(Math.sqrt(v));

export function matches(order: Order, v: number): boolean {
  switch (order.kind) {
    case 'any':
      return true;
    case 'exact':
      return v === order.n;
    case 'even':
      return v % 2 === 0;
    case 'odd':
      return Math.abs(v % 2) === 1;
    case 'multiple':
      return v % order.n! === 0;
    case 'prime':
      return isPrime(v);
    case 'square':
      return isSquare(v);
    case 'greater':
      return v > order.n!;
  }
}

/** Münzen, Gesamtsumme und Stand beim aktuellen Auftrag (wird gespeichert). */
export interface Economy {
  coins: number;
  /** Zahl aller je gelieferten Zahlen. */
  total: number;
  /** Nummer des aktuellen Auftrags (ab 0) = Zahl der geschafften Aufträge. */
  order: number;
  /** Passende Lieferungen zum aktuellen Auftrag. */
  progress: number;
  /** Freigekaufte Gebiete der Karte (0 = nur das Startgebiet). */
  zone: number;
}

export function newEconomy(): Economy {
  return { coins: START_COINS, total: 0, order: 0, progress: 0, zone: 0 };
}

/** Münzen für eine gelieferte Zahl: 1, und 4 extra, wenn sie zum Auftrag passt (nie nach Größe). */
export const COIN_EACH = 1;
export const COIN_MATCH = 4;
export const coinsFor = (matched: boolean) => COIN_EACH + (matched ? COIN_MATCH : 0);

/**
 * Gelieferte Zahlen verbuchen (in der Reihenfolge der Lieferung). Gibt den
 * neuen Stand und die dabei geschafften Aufträge zurück.
 */
export function deliver(econ: Economy, values: readonly number[]): { econ: Economy; completed: Order[] } {
  const e = { ...econ };
  const completed: Order[] = [];
  for (const v of values) {
    const order = orderAt(e.order);
    const hit = matches(order, v);
    e.coins += coinsFor(hit);
    e.total += 1;
    if (hit) e.progress += 1;
    else if (order.streak) e.progress = 0;
    if (e.progress >= order.count) {
      e.coins += order.reward;
      completed.push(order);
      e.order += 1;
      e.progress = 0;
    }
  }
  return { econ: e, completed };
}

/** Freigeschaltete Teile nach `done` geschafften Aufträgen. */
export function unlockedParts(done: number): Set<string> {
  const set = new Set(STARTER_PARTS);
  for (let i = 0; i < Math.min(done, ORDERS.length); i++) for (const id of ORDERS[i]!.unlock) set.add(id);
  return set;
}

/** Welcher Auftrag schaltet das Teil frei? (Nummer ab 0, oder −1 = von Anfang an.) */
export function unlockedBy(id: string): number {
  if (STARTER_PARTS.includes(id)) return -1;
  return ORDERS.findIndex((o) => o.unlock.includes(id));
}

/** Auftrag als Satz, z. B. „Liefere 10-mal die 4.“ */
export function orderText(order: Order, fmt: (n: number) => string = String): Localized {
  const c = fmt(order.count);
  const n = fmt(order.n ?? 0);
  switch (order.kind) {
    case 'any':
      return L(`Bring ${c} Zahlen zur Basis.`, `Bring ${c} numbers to the base.`);
    case 'exact':
      return L(`Liefere ${c}-mal die ${n}.`, `Deliver the number ${n}, ${c} times.`);
    case 'even':
      return L(`Liefere ${c} gerade Zahlen.`, `Deliver ${c} even numbers.`);
    case 'odd':
      return L(`Liefere ${c} ungerade Zahlen.`, `Deliver ${c} odd numbers.`);
    case 'multiple':
      return L(`Liefere ${c} Vielfache von ${n}.`, `Deliver ${c} multiples of ${n}.`);
    case 'prime':
      return order.streak
        ? L(`Liefere nur Primzahlen: ${c} hintereinander.`, `Deliver only primes: ${c} in a row.`)
        : L(`Liefere ${c} Primzahlen.`, `Deliver ${c} prime numbers.`);
    case 'square':
      return L(`Liefere ${c} Quadratzahlen (1, 4, 9, 16 …).`, `Deliver ${c} square numbers (1, 4, 9, 16 …).`);
    case 'greater':
      return L(`Liefere ${c} Zahlen größer als ${n}.`, `Deliver ${c} numbers greater than ${n}.`);
  }
}
