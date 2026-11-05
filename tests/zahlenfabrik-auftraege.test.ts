import { describe, expect, it } from 'vitest';
import { isPrime, passes } from '../src/spiele/zahlenfabrik/model';
import { coinsFor, deliver, matches, newEconomy, orderAt, orderText, ORDERS, unlockedBy, unlockedParts } from '../src/spiele/zahlenfabrik/orders';
import { makePart, partId, priceOf, specById, START_COINS, STARTER_PARTS, WORLD_PARTS } from '../src/spiele/zahlenfabrik/parts';

describe('Zahlenfabrik: Weichen-Prüfungen', () => {
  it('Primzahlen', () => {
    const primes = Array.from({ length: 60 }, (_, i) => i).filter(isPrime);
    expect(primes).toEqual([2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59]);
    expect(isPrime(-7)).toBe(false);
    expect(isPrime(1)).toBe(false);
    expect(isPrime(97)).toBe(true);
    expect(isPrime(91)).toBe(false); // 7 · 13
  });
  it('gerade, teilbar, größer als', () => {
    expect(passes({ kind: 'even' }, 0)).toBe(true);
    expect(passes({ kind: 'even' }, -4)).toBe(true);
    expect(passes({ kind: 'even' }, 7)).toBe(false);
    expect(passes({ kind: 'div', n: 3 }, 12)).toBe(true);
    expect(passes({ kind: 'div', n: 3 }, 13)).toBe(false);
    expect(passes({ kind: 'gt', n: 50 }, 50)).toBe(false);
    expect(passes({ kind: 'gt', n: 50 }, 51)).toBe(true);
  });
});

describe('Zahlenfabrik: Bauteile', () => {
  it('jedes Teil lässt sich bauen und wird wiedererkannt (Speichern)', () => {
    for (const spec of WORLD_PARTS) {
      const part = makePart(spec, 2, 3);
      expect(partId(part)).toBe(spec.id);
      expect(priceOf(part)).toBe(spec.price);
      expect(spec.price).toBeGreaterThan(0);
    }
    expect(new Set(WORLD_PARTS.map((s) => s.id)).size).toBe(WORLD_PARTS.length);
  });
  it('Start: Band und Zusammenführer „Summe“, 40 Münzen; keine Maschinen für einzelne Zahlen', () => {
    for (const spec of WORLD_PARTS) expect(spec.kind).not.toBe('op');
    expect([...unlockedParts(0)].sort()).toEqual([...STARTER_PARTS].sort());
    expect(newEconomy().coins).toBe(START_COINS);
  });
  it('jedes Teil wird irgendwann freigeschaltet, alle Kennungen gibt es', () => {
    const all = unlockedParts(ORDERS.length);
    for (const spec of WORLD_PARTS) expect(all.has(spec.id)).toBe(true);
    for (const o of ORDERS) for (const id of o.unlock) expect(specById(id)).toBeDefined();
    expect(unlockedBy('belt')).toBe(-1);
    expect(unlockedBy('bridge')).toBe(0);
    expect(unlockedBy('merge+')).toBe(-1);
  });
});

describe('Zahlenfabrik: Aufträge', () => {
  it('passende Zahlen', () => {
    expect(matches({ kind: 'exact', n: 12, count: 1, reward: 0, unlock: [] }, 12)).toBe(true);
    expect(matches({ kind: 'exact', n: 12, count: 1, reward: 0, unlock: [] }, 13)).toBe(false);
    expect(matches({ kind: 'odd', count: 1, reward: 0, unlock: [] }, -3)).toBe(true);
    expect(matches({ kind: 'odd', count: 1, reward: 0, unlock: [] }, 4)).toBe(false);
    expect(matches({ kind: 'square', count: 1, reward: 0, unlock: [] }, 49)).toBe(true);
    expect(matches({ kind: 'square', count: 1, reward: 0, unlock: [] }, 50)).toBe(false);
    expect(matches({ kind: 'multiple', n: 3, count: 1, reward: 0, unlock: [] }, 0)).toBe(true);
    expect(matches({ kind: 'greater', n: 500, count: 1, reward: 0, unlock: [] }, 500)).toBe(false);
  });
  it('Münzen: nie nach Größe – 1 je Zahl, 5 für eine passende', () => {
    expect(coinsFor(false)).toBe(1);
    expect(coinsFor(true)).toBe(5);
    // riesige Zahlen bringen nicht mehr als kleine
    const big = deliver({ ...newEconomy(), order: 3 }, [999999]).econ.coins;
    const small = deliver({ ...newEconomy(), order: 3 }, [7]).econ.coins;
    expect(big).toBe(small);
  });
  it('erster Auftrag: 10 beliebige Zahlen → 10 × 5 + 30 Münzen, Brücke frei', () => {
    const { econ, completed } = deliver(newEconomy(), Array(10).fill(3));
    expect(completed).toHaveLength(1);
    expect(econ.coins).toBe(START_COINS + 50 + 30);
    expect(econ.order).toBe(1);
    expect(econ.progress).toBe(0);
    expect(econ.total).toBe(10);
    expect(unlockedParts(econ.order).has('bridge')).toBe(true);
  });
  it('„Liefere 10-mal die 10“: andere Zahlen bringen 1 Münze, zählen aber nicht', () => {
    let e = { ...newEconomy(), order: 3 };
    e = deliver(e, [10, 5, 10, 7]).econ;
    expect(e.progress).toBe(2);
    expect(e.coins).toBe(START_COINS + 5 + 1 + 5 + 1);
  });
  it('„nur Primzahlen hintereinander“: eine andere Zahl setzt auf 0 zurück', () => {
    const i = ORDERS.findIndex((o) => o.streak);
    let e = { ...newEconomy(), order: i };
    e = deliver(e, [2, 3, 5]).econ;
    expect(e.progress).toBe(3);
    e = deliver(e, [9]).econ;
    expect(e.progress).toBe(0);
    const done = deliver(e, Array(ORDERS[i]!.count).fill(7));
    expect(done.completed).toHaveLength(1);
    expect(done.econ.order).toBe(i + 1);
  });
  it('mehrere Aufträge in einem Rutsch, Überschuss zählt für den nächsten', () => {
    const { econ, completed } = deliver(newEconomy(), [...Array(10).fill(1), ...Array(3).fill(14)]);
    expect(completed).toHaveLength(1);
    expect(econ.order).toBe(1);
    expect(econ.progress).toBe(3);
  });
  it('nach der Liste geht es endlos weiter, mit sinnvollen Aufträgen', () => {
    for (let i = 0; i < 60; i++) {
      const o = orderAt(i);
      expect(o.count).toBeGreaterThan(0);
      expect(o.reward).toBeGreaterThan(0);
      if (o.kind === 'multiple' || o.kind === 'greater') expect(o.n).toBeGreaterThan(1);
      if (o.kind === 'exact') expect(o.n).toBeGreaterThanOrEqual(1);
      expect(orderText(o).de.length).toBeGreaterThan(5);
      expect(orderText(o).en.length).toBeGreaterThan(5);
    }
    expect(orderAt(ORDERS.length + 7)).toEqual(orderAt(ORDERS.length + 7));
  });
  it('Texte', () => {
    expect(orderText(ORDERS[3]!).de).toBe('Liefere 10-mal die 10.');
    expect(orderText(ORDERS[3]!).en).toBe('Deliver the number 10, 10 times.');
  });
});
