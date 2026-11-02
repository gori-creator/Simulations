import { describe, expect, it } from 'vitest';
import { LANGS } from '../src/i18n/config';
import { COURSES, lessonsOf } from '../src/kurse';
import { hasGame, hasLesson, loadLesson } from '../src/kurse/loaders';
import { KS } from '../src/kurse/strings';
import type { Step } from '../src/kurse/types';

/** Konsistenz der Kurse: Inhalte vorhanden, Spiele vorhanden, Texte zweisprachig. */
const texts = (step: Step): string[] => {
  const all = (l: { de: string; en: string } | undefined) => (l ? [l.de, l.en] : []);
  switch (step.kind) {
    case 'say':
      return all(step.text);
    case 'info':
      return [...all(step.title), ...all(step.text)];
    case 'choice':
      return [...all(step.question), ...all(step.explain), ...step.options.flatMap((o) => [...all(o.text), ...all(o.feedback)])];
    case 'predict':
      return [...all(step.question), ...all(step.reveal), ...step.options.flatMap((o) => [...all(o.text), ...all(o.feedback)])];
    case 'game':
      return all(step.intro);
  }
};

describe('Kurse', () => {
  it('Oberflächentexte in beiden Sprachen', () => {
    for (const [key, value] of Object.entries(KS)) for (const lang of LANGS) expect(value[lang].trim(), key).not.toBe('');
  });

  for (const course of COURSES) {
    const lessons = lessonsOf(course);

    it(`${course.id}: eindeutige IDs und Adressen`, () => {
      expect(new Set(lessons.map((l) => l.id)).size).toBe(lessons.length);
      for (const lang of LANGS) expect(new Set(lessons.map((l) => l.slug[lang])).size).toBe(lessons.length);
      for (const l of lessons) for (const lang of LANGS) expect(l.slug[lang]).toMatch(/^[a-z0-9-]+$/);
    });

    it(`${course.id}: jede fertige Lektion hat Inhalt`, () => {
      for (const l of lessons) if (l.status === 'ready') expect(hasLesson(course.id, l.id), l.id).toBe(true);
    });

    it(`${course.id}: Kursangaben, Welten und Wissenskarten`, () => {
      expect(course.levels.length).toBeGreaterThanOrEqual(5);
      expect(course.grades[0]).toBeLessThanOrEqual(course.grades[1]);
      for (const lang of LANGS) {
        for (const text of [course.title, course.tagline, course.description, course.audience, course.voice.perfect, course.voice.done, course.finalBadge.title, ...course.levels]) expect(text[lang].trim()).not.toBe('');
      }
      expect(new Set(course.chapters.map((c) => c.id)).size).toBe(course.chapters.length);
      for (const chapter of course.chapters) {
        expect(chapter.icon.trim(), chapter.id).not.toBe('');
        expect(chapter.lessons.length, chapter.id).toBeGreaterThan(0);
      }
      // Jede fertige Lektion bringt eine Wissenskarte mit Jahr (Zeitstrahl)
      for (const l of lessons.filter((x) => x.status === 'ready')) {
        expect(l.card, l.id).toBeDefined();
        expect(l.card!.year, l.id).toBeGreaterThanOrEqual(1700);
        expect(l.card!.year, l.id).toBeLessThanOrEqual(2030);
        for (const lang of LANGS) {
          expect(l.card!.title[lang].trim(), l.id).not.toBe('');
          expect(l.card!.text[lang].length, l.id).toBeGreaterThan(40);
        }
        // Quelle zu jedem historischen Meilenstein (nicht zur Karte „heute“)
        if (l.card!.year < 2026) {
          const source = l.card!.source;
          expect(source, `Quelle fehlt: ${l.id}`).toBeDefined();
          for (const lang of LANGS) {
            const text = typeof source === 'string' ? source : source![lang];
            expect(text.length, l.id).toBeGreaterThan(20);
            expect(text, `Quelle nennt kein Jahr: ${l.id}`).toMatch(/1[7-9]\d\d|20[0-2]\d/);
          }
        }
      }
    });

    for (const l of lessons.filter((x) => x.status === 'ready')) {
      it(`${course.id}/${l.id}: Schritte, Spiele und Texte`, async () => {
        const { steps } = await loadLesson(course.id, l.id);
        expect(steps.length).toBeGreaterThan(2);
        for (const step of steps) {
          if (step.kind === 'game') expect(hasGame(course.id, step.game), step.game).toBe(true);
          if (step.kind === 'choice') {
            expect(step.options.filter((o) => o.correct)).toHaveLength(1);
            expect(step.options.length).toBeGreaterThanOrEqual(2);
          }
          if (step.kind === 'predict') expect(step.options.length).toBeGreaterThanOrEqual(2);
          for (const text of texts(step)) expect(text.trim()).not.toBe('');
        }
        for (const lang of LANGS) {
          expect(l.title[lang].trim()).not.toBe('');
          expect(l.teaser[lang].trim()).not.toBe('');
        }
      });
    }
  }
});
