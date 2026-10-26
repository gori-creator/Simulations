import { describe, expect, it } from 'vitest';
import { formatGrades } from '../src/i18n/utils';

describe('formatGrades', () => {
  it('nennt Spannen, einzelne Stufen und die Uni', () => {
    expect(formatGrades('de', [7, 9])).toBe('Klasse 7–9');
    expect(formatGrades('de', [9, 9])).toBe('Klasse 9');
    expect(formatGrades('de', [12, 14])).toBe('Klasse 12–13 · Uni');
    expect(formatGrades('de', [14, 14])).toBe('Uni');
  });

  it('schreibt bei 13 bis Uni nicht „13–13“', () => {
    expect(formatGrades('de', [13, 14])).toBe('Klasse 13 · Uni');
    expect(formatGrades('en', [13, 14])).not.toContain('13–13');
  });
});
