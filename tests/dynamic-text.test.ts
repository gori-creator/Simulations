import { describe, expect, it } from 'vitest';
import { L } from '../src/curriculum/helpers';
import { resolveText } from '../src/sim-core/params';
import { defineSimulation, type DynamicText } from '../src/sim-core';

describe('Tipp (`hint`) und Hilfetexte (`help`) abhängig von den Werten', () => {
  it('übernimmt feste Texte unverändert', () => {
    expect(resolveText(L('Tipp: ziehen', 'Tip: drag'), {}, 'de')).toBe('Tipp: ziehen');
    expect(resolveText(L('Tipp: ziehen', 'Tip: drag'), {}, 'en')).toBe('Tip: drag');
    expect(resolveText(undefined, {}, 'de')).toBeNull();
  });

  it('wertet Funktionen mit den aktuellen Werten aus', () => {
    const hint: DynamicText<{ mode: string }> = (v) =>
      v.mode === 'test' ? L('Drücke Stopp, sobald der Stab fällt.', 'Press stop as soon as the rod falls.') : L('Ziehe den Ball.', 'Drag the ball.');
    expect(resolveText(hint, { mode: 'test' }, 'de')).toBe('Drücke Stopp, sobald der Stab fällt.');
    expect(resolveText(hint, { mode: 'fall' }, 'en')).toBe('Drag the ball.');
  });

  it('blendet bei `null` oder leerem Text aus', () => {
    const help: DynamicText = (v) => (v.on ? L('Hilfe', 'Help') : null);
    expect(resolveText(help, { on: true }, 'de')).toBe('Hilfe');
    expect(resolveText(help, { on: false }, 'de')).toBeNull();
    expect(resolveText(L('  ', ''), {}, 'de')).toBeNull();
  });

  it('ist in Definitionen genau typisiert', () => {
    const def = defineSimulation({
      id: 'beispiel',
      params: [
        {
          key: 'mode',
          type: 'choice',
          label: L('Modus', 'Mode'),
          default: 'a',
          options: [
            { value: 'a', label: L('A', 'A') },
            { value: 'b', label: L('B', 'B') },
          ],
        },
        { key: 'n', type: 'number', label: L('n', 'n'), min: 0, max: 10, step: 1, default: 2, help: (v) => L(`n = ${String(v.n)}`, `n = ${String(v.n)}`) },
      ],
      hint: (v) => (v.mode === 'b' ? L('Modus B', 'Mode B') : null),
      mount: () => ({ render() {} }),
    });
    expect(resolveText(def.hint, { mode: 'b', n: 2 }, 'de')).toBe('Modus B');
    expect(resolveText(def.hint, { mode: 'a', n: 2 }, 'de')).toBeNull();
    expect(resolveText(def.params[1].help, { mode: 'a', n: 7 }, 'en')).toBe('n = 7');
  });
});
