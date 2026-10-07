import { describe, expect, it } from 'vitest';
import { convertVolume, cubeCell, fillPlan, planDuration, stageCount, stageOf, volume } from '../src/simulations/mathematik/quader-volumen/model';

describe('Quader-Volumen', () => {
  it('berechnet das Volumen als Anzahl der Einheitswürfel', () => {
    expect(volume(5, 3, 4)).toBe(60);
    expect(stageCount('reihe', 5, 3, 4)).toBe(5);
    expect(stageCount('schicht', 5, 3, 4)).toBe(15);
    expect(stageCount('voll', 5, 3, 4)).toBe(60);
    expect(stageOf(15, 5, 3, 4)).toBe('schicht');
    expect(stageOf(16, 5, 3, 4)).toBeNull();
    expect(stageOf(5, 5, 1, 1)).toBe('voll');
  });

  it('füllt Reihe für Reihe und Schicht für Schicht', () => {
    expect(cubeCell(0, 5, 3)).toEqual({ col: 0, row: 0, layer: 0 });
    expect(cubeCell(7, 5, 3)).toEqual({ col: 2, row: 1, layer: 0 });
    expect(cubeCell(16, 5, 3)).toEqual({ col: 1, row: 0, layer: 1 });
    // jede Zelle genau einmal
    const seen = new Set<string>();
    for (let k = 0; k < 60; k++) {
      const { col, row, layer } = cubeCell(k, 5, 3);
      seen.add(`${col},${row},${layer}`);
    }
    expect(seen.size).toBe(60);
  });

  it('plant erst einzelne Würfel, dann Reihen, dann Schichten', () => {
    const plan = fillPlan(5, 3, 4, 0, 60);
    expect(plan.filter((i) => i.kind === 'cube')).toHaveLength(5);
    expect(plan.filter((i) => i.kind === 'row')).toHaveLength(2);
    expect(plan.filter((i) => i.kind === 'layer')).toHaveLength(3);
    // lückenlos und in Reihenfolge
    let k = 0;
    for (const item of plan) {
      expect(item.from).toBe(k);
      k = item.to;
    }
    expect(k).toBe(60);
    for (let i = 1; i < plan.length; i++) expect(plan[i]!.start).toBeGreaterThan(plan[i - 1]!.start);
    expect(planDuration(plan)).toBeLessThan(12);
  });

  it('setzt ab einem Zwischenstand fort', () => {
    const plan = fillPlan(5, 3, 4, 15, 60);
    expect(plan.map((i) => i.kind)).toEqual(['layer', 'layer', 'layer']);
    expect(fillPlan(5, 3, 4, 3, 5).map((i) => [i.from, i.to])).toEqual([
      [3, 4],
      [4, 5],
    ]);
    expect(fillPlan(5, 3, 4, 7, 15)).toEqual([expect.objectContaining({ from: 7, to: 10, kind: 'row' }), expect.objectContaining({ from: 10, to: 15, kind: 'row' })]);
    expect(fillPlan(5, 3, 4, 60, 60)).toEqual([]);
    // große Quader dauern nicht zu lange
    expect(planDuration(fillPlan(10, 10, 10, 0, 1000))).toBeLessThan(13);
  });

  it('rechnet Volumeneinheiten um', () => {
    expect(convertVolume(60, 'cm')).toMatchObject({ dm3: 0.06, l: 0.06, ml: 60 });
    expect(convertVolume(72, 'dm')).toMatchObject({ l: 72, cm3: 72000, m3: 0.072 });
    expect(convertVolume(2, 'm')).toMatchObject({ dm3: 2000, l: 2000 });
  });
});
