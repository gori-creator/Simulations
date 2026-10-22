import { describe, expect, it } from 'vitest';
import { isReadoutHidden, isReadoutTaskHidden, isTaskHidden, spoilerChanges } from '../src/sim-core/task-mode';

const state = (hideFlag: boolean, resultsOff: boolean, revealed: string[] = [], spoilers: string[] = ['trip']) => ({
  hideFlag,
  resultsOff,
  revealed: new Set(revealed),
  spoilers,
});

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

  it('bleibt mit _hide verdeckt, bis alle angezeigten Spoiler aufgedeckt sind', () => {
    const spoilers = ['trip', 'table', 'law'];
    expect(isTaskHidden(state(true, false, [], spoilers))).toBe(true);
    expect(isTaskHidden(state(true, false, ['trip'], spoilers))).toBe(true);
    expect(isTaskHidden(state(true, false, ['trip', 'table'], spoilers))).toBe(true);
    expect(isTaskHidden(state(true, false, ['trip', 'table', 'law'], spoilers))).toBe(false);
    // Einzelne Ergebnisse folgen weiterhin nur ihrem eigenen Aufdecken
    expect(isReadoutHidden(state(true, false, ['trip'], spoilers), 'trip')).toBe(false);
    expect(isReadoutHidden(state(true, false, ['trip'], spoilers), 'law')).toBe(true);
  });

  it('zählt nur angezeigte Spoiler, ohne Aufdecken bleibt es verdeckt', () => {
    // „table“ ist gerade ausgeblendet (ctx.readout(key, null)) und lässt sich nicht aufdecken
    expect(isTaskHidden(state(true, false, ['trip'], ['trip']))).toBe(false);
    // Kein Spoiler sichtbar und nichts aufgedeckt: weiter verdeckt
    expect(isTaskHidden(state(true, false, [], []))).toBe(true);
    // Ohne Liste (ältere Aufrufer): aufgedeckt heißt sichtbar
    expect(isTaskHidden({ hideFlag: true, resultsOff: false, revealed: new Set(['trip']) })).toBe(false);
  });
});

describe('spoilerChange: Wechsel einzelner Ergebnisse', () => {
  it('meldet jedes Aufdecken einzeln, auch wenn ctx.hidden gleich bleibt', () => {
    const keys = ['trip', 'table', 'law'];
    const last = new Map<string, boolean>();
    // Start: nur vermerken, nichts melden
    expect(spoilerChanges(state(true, false, [], keys), keys, last)).toEqual([]);
    // „trip“ aufgedeckt: ctx.hidden bleibt wahr, trotzdem eine Meldung
    expect(isTaskHidden(state(true, false, ['trip'], keys))).toBe(true);
    expect(spoilerChanges(state(true, false, ['trip'], keys), keys, last)).toEqual([['trip', false]]);
    // unverändert: keine Meldung
    expect(spoilerChanges(state(true, false, ['trip'], keys), keys, last)).toEqual([]);
    // Schalter resultsParam aus: alle drei wieder verdeckt, „trip“ wechselt
    expect(spoilerChanges(state(true, true, ['trip'], keys), keys, last)).toEqual([['trip', true]]);
    // Link ohne _hide und Schalter an: alle aufgedeckt
    expect(spoilerChanges(state(false, false, [], keys), keys, last)).toEqual([
      ['trip', false],
      ['table', false],
      ['law', false],
    ]);
  });
});

describe('Nur Aufgabenmodus (ctx.isHiddenByTask)', () => {
  it('trennt _hide=1 vom Schalter resultsParam', () => {
    // Schalter aus, kein _hide: isHidden ja, nur Aufgabenmodus nein
    expect(isReadoutHidden(state(false, true), 'shape')).toBe(true);
    expect(isReadoutTaskHidden(state(false, true), 'shape')).toBe(false);
    // _hide=1: verdeckt bis zum Aufdecken
    expect(isReadoutTaskHidden(state(true, false), 'shape')).toBe(true);
    expect(isReadoutTaskHidden(state(true, false, ['shape']), 'shape')).toBe(false);
    expect(isReadoutTaskHidden(state(true, true), 'shape')).toBe(true);
  });
});
