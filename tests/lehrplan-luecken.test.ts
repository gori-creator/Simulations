import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { curriculumGaps, curriculumGapsMarkdown } from '../src/curriculum/lehrplaene/luecken';

const FILE = 'docs/LEHRPLAN-LUECKEN.md';
// `npm run lehrplan:luecken` schreibt die Datei neu, sonst wird nur verglichen
const UPDATE = process.env.npm_lifecycle_event === 'lehrplan:luecken';

describe('Lehrplan-Lücken', () => {
  it('listet nur Lernbereiche ohne Simulation', () => {
    for (const gap of curriculumGaps()) expect(gap.unit.simulations?.length ?? 0, gap.unit.code).toBe(0);
  });

  it(`${FILE} ist aktuell (sonst: npm run lehrplan:luecken)`, () => {
    const text = `${curriculumGapsMarkdown()}\n`;
    if (UPDATE) writeFileSync(FILE, text);
    expect(existsSync(FILE), FILE).toBe(true);
    expect(readFileSync(FILE, 'utf8') === text, `${FILE} ist veraltet – bitte \`npm run lehrplan:luecken\` ausführen`).toBe(true);
  });
});
