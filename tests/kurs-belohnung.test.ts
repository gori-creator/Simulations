import { describe, expect, it } from 'vitest';
import { seeded } from '../src/kurse/engine/dom';
import { averageEpsilon, greedyArm, runEpsilon } from '../src/kurse/gemeinsam/models/bandit';
import { closest, denoise, generate, noisy, PICTURES, ALPHA_BAR, STEPS, gaussian } from '../src/kurse/gemeinsam/models/diffusion';
import { episode, greedyPath, move, newQ, parseWorld } from '../src/kurse/gemeinsam/models/gitterwelt';
import { close, GROUP_A, GROUP_B, opportunityOk, parityOk, rates } from '../src/kurse/ki-labor/models/fairness';

/** Belohnungslernen, Diffusion und Fairness (beide Kurse). */
describe('Banditen', () => {
  const probs = [0.2, 0.35, 0.55, 0.3];
  it('etwas Erkundung schlägt keine und nur Erkundung', () => {
    const rnd = seeded(1);
    const none = averageEpsilon(probs, 200, 0, 300, rnd);
    const some = averageEpsilon(probs, 200, 0.1, 300, rnd);
    const all = averageEpsilon(probs, 200, 1, 300, rnd);
    expect(some).toBeGreaterThan(none);
    expect(some).toBeGreaterThan(all);
    expect(runEpsilon(probs, 10, 0, rnd)).toBeLessThanOrEqual(10);
  });

  it('probiert unbekannte Möglichkeiten zuerst', () => {
    const arm = greedyArm([{ pulls: 5, wins: 5 }, { pulls: 0, wins: 0 }], seeded(2));
    expect(arm).toBe(1);
  });
});

describe('Q-Lernen', () => {
  const map = ['.K....', '.##.#.', 'S....Z', '.#F#..', '......'];
  it('Mauern und Ränder blockieren', () => {
    const w = parseWorld(map);
    expect(move(w, w.start, 3)).toBe(w.start);
    expect(move(w, 7, 0)).toBe(1);
    expect(move(w, 1, 2)).toBe(1);
  });

  it('kleines γ nimmt den Keks, großes γ mit Erkundung den Schatz', () => {
    const short = parseWorld(map);
    const q1 = newQ(short);
    const r1 = seeded(3);
    for (let k = 0; k < 500; k++) episode(short, q1, 0.5, 0.5, 0.2, r1);
    expect(greedyPath(short, q1).at(-1)).toBe(1);

    const long = parseWorld(map);
    const q2 = newQ(long);
    const r2 = seeded(4);
    for (let k = 0; k < 2000; k++) episode(long, q2, 0.5, 0.99, 0.5, r2);
    expect(greedyPath(long, q2).at(-1)).toBe(17);
  });
});

describe('Diffusion', () => {
  it('Rauschplan: von 1 nach fast 0', () => {
    expect(ALPHA_BAR[0]).toBeCloseTo(1);
    expect(ALPHA_BAR[STEPS]!).toBeLessThan(0.01);
    for (let t = 1; t <= STEPS; t++) expect(ALPHA_BAR[t]!).toBeLessThan(ALPHA_BAR[t - 1]!);
  });

  it('Entrauscher erkennt das Bild bei wenig Rauschen', () => {
    const x0 = PICTURES[1]!.pic;
    const xt = noisy(x0, 3, gaussian(seeded(9)));
    const est = denoise(xt, 3, PICTURES.map((p) => p.pic));
    expect(closest(est).id).toBe(PICTURES[1]!.id);
  });

  it('erzeugt eines der Trainingsbilder, mit Prompt das gewünschte', () => {
    const rnd = seeded(7);
    for (let k = 0; k < 5; k++) expect(closest(generate(PICTURES.map((p) => p.pic), rnd).at(-1)!).dist).toBeLessThan(0.05);
    const only = PICTURES.find((p) => p.id === 'baum')!.pic;
    expect(closest(generate([only], rnd).at(-1)!).id).toBe('baum');
  });
});

describe('Fairness', () => {
  it('gleiche Schwelle: verschiedene Annahmequoten', () => {
    expect(close(rates(GROUP_A, 55).accept, rates(GROUP_B, 55).accept)).toBe(false);
  });

  it('beide Ziele sind einzeln erreichbar, aber nicht zugleich', () => {
    let parity = false;
    let opportunity = false;
    let both = false;
    for (let a = 0; a <= 100; a++)
      for (let b = 0; b <= 100; b++) {
        const ra = rates(GROUP_A, a);
        const rb = rates(GROUP_B, b);
        const p = parityOk(ra, rb);
        const o = opportunityOk(ra, rb);
        if (p) parity = true;
        if (o) opportunity = true;
        if (p && o) both = true;
      }
    expect(parity).toBe(true);
    expect(opportunity).toBe(true);
    expect(both).toBe(false);
  });
});
