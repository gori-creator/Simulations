import { describe, expect, it } from 'vitest';
import { isReadoutHidden, isTaskHidden } from '../src/sim-core/task-mode';

const state = (hideFlag: boolean, resultsOff: boolean, revealed: string[] = []) => ({ hideFlag, resultsOff, revealed: new Set(revealed) });

describe('Aufgabenmodus', () => {
  it('ist ohne _hide und mit eingeschaltetem Ergebnis-Schalter aus', () => {
    expect(isTaskHidden(state(false, false))).toBe(false);
    expect(isReadoutHidden(state(false, false), 'trip')).toBe(false);
  });

  it('verdeckt mit _hide, bis etwas aufgedeckt wird', () => {
    expect(isTaskHidden(state(true, false))).toBe(true);
    expect(isTaskHidden(state(true, false, ['trip']))).toBe(false);
    expect(isReadoutHidden(state(true, false, ['trip']), 'trip')).toBe(false);
    expect(isReadoutHidden(state(true, false, ['trip']), 'table')).toBe(true);
  });

  it('verdeckt, solange der Schalter resultsParam aus ist', () => {
    expect(isTaskHidden(state(false, true))).toBe(true);
    expect(isTaskHidden(state(true, true, ['trip']))).toBe(true);
    expect(isReadoutHidden(state(false, true), 'trip')).toBe(true);
  });
});
