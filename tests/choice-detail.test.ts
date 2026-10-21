import { describe, expect, it } from 'vitest';
import { L } from '../src/curriculum/helpers';
import { choiceOptionLabel } from '../src/sim-core/controls';
import { NBSP } from '../src/sim-core/format';
import type { ChoiceOption } from '../src/sim-core/types';

describe('Zusatzangaben bei Auswahl-Optionen (Aufgabenmodus)', () => {
  const rn: ChoiceOption = { value: 'rn220', label: L('Rn-220', 'Rn-220'), detail: L('T½ = 55,6 s', 'T½ = 55.6 s') };

  it('hängt die Zusatzangabe in Klammern an (Zahl und Einheit ohne Umbruch)', () => {
    expect(choiceOptionLabel(rn, 'de', false)).toBe(`Rn-220 (T½ = 55,6${NBSP}s)`);
    expect(choiceOptionLabel(rn, 'en', false)).toBe(`Rn-220 (T½ = 55.6${NBSP}s)`);
  });

  it('lässt die Zusatzangabe im Aufgabenmodus weg', () => {
    expect(choiceOptionLabel(rn, 'de', true)).toBe('Rn-220');
    expect(choiceOptionLabel(rn, 'en', true)).toBe('Rn-220');
  });

  it('ändert Optionen ohne Zusatzangabe nicht', () => {
    const plain: ChoiceOption = { value: 'a', label: L('Fall F_G', 'Case F_G') };
    expect(choiceOptionLabel(plain, 'de', false)).toBe('Fall F_G');
    expect(choiceOptionLabel(plain, 'de', true)).toBe('Fall F_G');
    expect(choiceOptionLabel({ ...plain, detail: L(' ', '') }, 'de', false)).toBe('Fall F_G');
  });
});
