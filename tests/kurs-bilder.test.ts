import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { COURSES, lessonsOf } from '../src/kurse';
import { artPath } from '../src/kurse/art';

/** Bilderliste der Kurse (scripts/kurs-bilder.json, Prompts in docs/KI-KURS-BILDER.md). */
const list: { id: string; path: string; width: number; height: number }[] = JSON.parse(readFileSync('scripts/kurs-bilder.json', 'utf8'));
const doc = readFileSync('docs/KI-KURS-BILDER.md', 'utf8');

describe('Kursbilder', () => {
  it('jede Welt, jede Wissenskarte und jeder Kurs hat genau einen Eintrag', () => {
    const paths = list.map((e) => e.path);
    expect(new Set(paths).size).toBe(paths.length);
    expect(new Set(list.map((e) => e.id)).size).toBe(list.length);
    for (const course of COURSES) {
      expect(paths).toContain(artPath.cover(course.id));
      for (const chapter of course.chapters) expect(paths, chapter.id).toContain(artPath.world(course.id, chapter.id));
      for (const lesson of lessonsOf(course)) if (lesson.card) expect(paths, lesson.id).toContain(artPath.card(course.id, lesson.id));
    }
    const expected = COURSES.reduce((n, c) => n + 1 + c.chapters.length + lessonsOf(c).filter((l) => l.card).length, 0);
    expect(list.length).toBe(expected);
  });

  it('jeder Eintrag hat einen Prompt in der Doku', () => {
    for (const entry of list) {
      expect(doc, entry.id).toContain(`### ${entry.id} · `);
      expect(doc).toContain(`src/assets/kurse/${entry.path}.webp`);
    }
  });

  it('vorhandene Bilder liegen an bekannten Pfaden und sind höchstens 300 KB groß', () => {
    const dir = 'src/assets/kurse';
    if (!existsSync(dir)) return;
    const known = new Set(list.flatMap((e) => [`${e.path}.webp`, `${e.path}-dunkel.webp`]));
    const walk = (d: string): string[] => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
    for (const file of walk(dir)) {
      const rel = file.slice(dir.length + 1);
      expect(known.has(rel), rel).toBe(true);
      expect(statSync(file).size, rel).toBeLessThanOrEqual(300 * 1024);
    }
  });
});
