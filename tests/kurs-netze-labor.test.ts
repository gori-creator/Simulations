import { describe, expect, it } from 'vitest';
import { seeded } from '../src/kurse/engine/dom';
import { numericGrad, pass, START, step } from '../src/kurse/ki-labor/models/backprop';
import { accuracy, createNet, dataset, forward, trainEpoch } from '../src/kurse/ki-labor/models/mlp';
import { bestPossible, epoch, errors, matches, NOT_SEPARABLE, SEPARABLE, START as PSTART, xorMatches } from '../src/kurse/ki-labor/models/neuronen';

/** KI-Labor, Welt „Neuronale Netze“. */
describe('Schwellenneuronen', () => {
  it('UND, ODER, NAND sind einstellbar, XOR höchstens 3 von 4', () => {
    expect(matches('und', 1, 1, 1.5)).toBe(4);
    expect(matches('oder', 1, 1, 0.5)).toBe(4);
    expect(matches('nand', -1, -1, -1.5)).toBe(4);
    expect(bestPossible('und')).toBe(4);
    expect(bestPossible('xor')).toBe(3);
  });

  it('XOR mit verborgener Schicht', () => {
    expect(xorMatches(0.5, 1.5)).toBe(4);
    expect(xorMatches(1, 2)).toBe(4);
    expect(xorMatches(0.25, 0.75)).toBeLessThan(4);
  });
});

describe('Perzeptron', () => {
  it('konvergiert auf trennbaren Daten', () => {
    let p = PSTART;
    let k = 0;
    for (; k < 200; k++) {
      const r = epoch(p, SEPARABLE, 0.1);
      p = r.p;
      if (r.updates === 0) break;
    }
    expect(errors(p, SEPARABLE)).toBe(0);
    expect(k).toBeLessThan(200);
  });

  it('kommt ohne Trennbarkeit nie zur Ruhe', () => {
    let p = PSTART;
    let last = 0;
    for (let k = 0; k < 100; k++) {
      const r = epoch(p, NOT_SEPARABLE, 0.1);
      p = r.p;
      last = r.updates;
    }
    expect(last).toBeGreaterThan(0);
  });
});

describe('Backpropagation', () => {
  it('stimmt mit dem Differenzenquotienten überein', () => {
    const P = pass(START);
    const num = numericGrad(START);
    expect(P.dLdw).toBeCloseTo(num.dw, 6);
    expect(P.dLdb).toBeCloseTo(num.db, 6);
    expect(P.z).toBeCloseTo(1, 10);
  });

  it('Lernen senkt den Verlust unter 0,1', () => {
    let p = START;
    let k = 0;
    for (; k < 200 && pass(p).L >= 0.1; k++) p = step(p);
    expect(pass(p).L).toBeLessThan(0.1);
    expect(k).toBeLessThan(80);
  });
});

describe('Netz-Spielplatz', () => {
  it('Vorwärtsrechnung liefert Wahrscheinlichkeiten', () => {
    const net = createNet([3, 2], 'tanh', 1);
    const out = forward(net, 0.3, -0.2);
    expect(out.map((l) => l.length)).toEqual([2, 3, 2, 1]);
    expect(out[3]![0]).toBeGreaterThan(0);
    expect(out[3]![0]).toBeLessThan(1);
  });

  it('lernt Kreis und XOR in wenigen Epochen', () => {
    for (const [id, hidden] of [['kreis', [4]], ['xor', [3]]] as const) {
      const { train, test } = dataset(id);
      const net = createNet([...hidden], 'tanh', 1);
      const rnd = seeded(5);
      for (let e = 0; e < 200 && accuracy(net, test) < 0.95; e++) trainEpoch(net, train, 0.3, 10, rnd);
      expect(accuracy(net, test), id).toBeGreaterThanOrEqual(0.95);
    }
  });

  it('ein einzelnes Neuron schafft den Kreis nicht', () => {
    const { train, test } = dataset('kreis');
    const net = createNet([1], 'tanh', 1);
    const rnd = seeded(5);
    for (let e = 0; e < 200; e++) trainEpoch(net, train, 0.3, 10, rnd);
    expect(accuracy(net, test)).toBeLessThan(0.85);
  });
});
