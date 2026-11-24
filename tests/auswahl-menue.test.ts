import { describe, expect, it } from 'vitest';
import { choiceDisplay } from '../src/sim-core/controls';
import type { ChoiceParam } from '../src/sim-core/types';

const choice = (labels: string[], display?: 'buttons' | 'menu'): ChoiceParam => ({
  key: 'x',
  type: 'choice',
  label: { de: 'x', en: 'x' },
  options: labels.map((l, i) => ({ value: String(i), label: { de: l, en: l } })),
  default: '0',
  ...(display ? { display } : {}),
});

describe('Auswahl: Knöpfe oder Menü', () => {
  it('kurze Einträge bleiben Knöpfe', () => {
    expect(choiceDisplay(choice(['mm', 'cm', 'dm', 'm', 'km']))).toBe('buttons');
    expect(choiceDisplay(choice(['Gerade', 'Parabel', 'Sinus']))).toBe('buttons');
  });
  it('viele lange Einträge (Ansichten) werden ein Menü', () => {
    expect(choiceDisplay(choice(['Thaleskreis erkunden', 'Beweis Schritt für Schritt', 'Tangenten an einen Kreis', 'Dreieck konstruieren', 'Kreismitte finden']))).toBe('menu');
  });
  it('ab neun Einträgen immer ein Menü', () => {
    expect(choiceDisplay(choice(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i']))).toBe('menu');
  });
  it('feste Angabe gewinnt', () => {
    expect(choiceDisplay(choice(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'], 'buttons'))).toBe('buttons');
    expect(choiceDisplay(choice(['a', 'b'], 'menu'))).toBe('menu');
  });
});
