import { describe, expect, it } from 'vitest';
import { KeyTargetNav, type KeyTarget } from '../src/sim-core/key-targets';

function targets(log: string[], disabled: string[] = []): KeyTarget[] {
  return ['a', 'b', 'c'].map((id) => ({ id, label: `Objekt ${id}`, disabled: disabled.includes(id), activate: () => log.push(id) }));
}

describe('Tastaturbedienung der Zeichenfläche', () => {
  it('wählt mit Pfeiltasten (mit Umlauf) und löst mit Enter/Leertaste aus', () => {
    const log: string[] = [];
    const nav = new KeyTargetNav();
    nav.setTargets(targets(log));
    expect(nav.selected).toBeNull();
    expect(nav.key('ArrowRight')).toBe('move');
    expect(nav.selected?.id).toBe('a');
    nav.key('ArrowDown');
    expect(nav.selected?.id).toBe('b');
    nav.key('ArrowLeft');
    nav.key('ArrowUp');
    expect(nav.selected?.id).toBe('c');
    expect(nav.key('Enter')).toBe('activate');
    expect(nav.key(' ')).toBe('activate');
    expect(log).toEqual(['c', 'c']);
    nav.key('Home');
    expect(nav.selected?.id).toBe('a');
    nav.key('End');
    expect(nav.selected?.id).toBe('c');
  });

  it('wählt bei Enter ohne Auswahl erst das erste Objekt', () => {
    const log: string[] = [];
    const nav = new KeyTargetNav();
    nav.setTargets(targets(log));
    expect(nav.key('Enter')).toBe('move');
    expect(log).toEqual([]);
    expect(nav.selected?.id).toBe('a');
  });

  it('überspringt gesperrte Objekte und behält die Auswahl beim Neumelden', () => {
    const log: string[] = [];
    const nav = new KeyTargetNav();
    nav.setTargets(targets(log, ['b']));
    nav.key('ArrowRight');
    nav.key('ArrowRight');
    expect(nav.selected?.id).toBe('c');
    nav.setTargets(targets(log));
    expect(nav.selected?.id).toBe('c');
    // Ausgewähltes Objekt wird gesperrt → nächstes freies
    nav.setTargets(targets(log, ['c']));
    expect(nav.selected?.id).toBe('a');
  });

  it('ignoriert fremde Tasten und leere Listen', () => {
    const nav = new KeyTargetNav();
    expect(nav.key('ArrowRight')).toBeNull();
    nav.setTargets(targets([]));
    expect(nav.key('a')).toBeNull();
    expect(nav.key('Tab')).toBeNull();
    nav.setTargets(targets([], ['a', 'b', 'c']));
    expect(nav.key('ArrowRight')).toBeNull();
  });

  it('wählt bei genau einem Ziel beim Fokussieren gleich aus, so dass ein Enter auslöst', () => {
    const log: string[] = [];
    const nav = new KeyTargetNav();
    nav.setTargets([{ id: 'probe', label: 'Probe', activate: () => log.push('probe') }]);
    expect(nav.selected).toBeNull();
    expect(nav.focus()).toBe(true);
    expect(nav.selected?.id).toBe('probe');
    expect(nav.key('Enter')).toBe('activate');
    expect(log).toEqual(['probe']);
    // erneutes Fokussieren ändert nichts
    expect(nav.focus()).toBe(false);
    // gesperrtes einzelnes Ziel wird nicht ausgewählt
    const other = new KeyTargetNav();
    other.setTargets([{ id: 'x', label: 'X', disabled: true, activate: () => log.push('x') }]);
    expect(other.focus()).toBe(false);
    expect(other.selected).toBeNull();
  });

  it('lässt bei mehreren Zielen die Auswahl beim Fokussieren unverändert', () => {
    const log: string[] = [];
    const nav = new KeyTargetNav();
    nav.setTargets(targets(log));
    expect(nav.focus()).toBe(false);
    expect(nav.selected).toBeNull();
    expect(nav.key('Enter')).toBe('move');
    expect(log).toEqual([]);
  });
});
