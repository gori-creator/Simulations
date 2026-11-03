import { describe, expect, it } from 'vitest';
import { COURSES, getCourse, lessonsOf } from '../src/kurse';
import { pickQuestions, questionsOf } from '../src/kurse/engine/review';
import { loadLesson } from '../src/kurse/loaders';
import {
  badgeRules,
  BADGE_XP,
  computeXp,
  daysBetween,
  earnedCards,
  finishCheck,
  finishReview,
  REVIEW_XP,
  mergeProgress,
  dayKey,
  emptyProgress,
  exportCode,
  finishLesson,
  importCode,
  isUnlocked,
  lessonOrder,
  lessonXp,
  levelFor,
  nextLesson,
  sanitizeProgress,
  starsFor,
  touchStreak,
  xpForNext,
} from '../src/kurse/engine/progress';
import type { Course } from '../src/kurse/types';

const course = getCourse('ki-abenteuer');
/** Testkurs mit drei fertigen Lektionen in zwei Bereichen. */
const mini: Course = {
  ...course,
  chapters: [
    { ...course.chapters[0]!, id: 'a', lessons: [{ ...lessonsOf(course)[0]!, id: 'l1', status: 'ready' }, { ...lessonsOf(course)[0]!, id: 'l2', status: 'ready' }] },
    { ...course.chapters[1]!, id: 'b', lessons: [{ ...lessonsOf(course)[0]!, id: 'l3', status: 'ready' }, { ...lessonsOf(course)[0]!, id: 'lx', status: 'planned' }] },
  ],
};

describe('Spielstand', () => {
  it('Sterne aus Fehlern', () => {
    expect(starsFor(0)).toBe(3);
    expect(starsFor(1)).toBe(2);
    expect(starsFor(2)).toBe(2);
    expect(starsFor(3)).toBe(1);
    expect(lessonXp(3)).toBe(50);
    expect(lessonXp(1)).toBe(30);
  });

  it('Stufen', () => {
    expect(xpForNext(1)).toBe(40);
    expect(xpForNext(2)).toBe(60);
    expect(levelFor(0)).toMatchObject({ level: 1, into: 0, need: 40, max: false });
    expect(levelFor(39).level).toBe(1);
    expect(levelFor(40)).toMatchObject({ level: 2, into: 0, need: 60 });
    expect(levelFor(100).level).toBe(3);
    // Summe bis Stufe 10: 9·40 + 20·(0+…+8) = 360 + 720 = 1080
    expect(levelFor(1079).level).toBe(9);
    expect(levelFor(1080)).toMatchObject({ level: 10, max: true, need: 0 });
    expect(levelFor(99999).level).toBe(10);
  });

  it('Lektion abschließen: XP, Abzeichen, Verbesserung', () => {
    const first = finishLesson(emptyProgress(), mini, 'l1', 1, '2026-11-01');
    expect(first.stars).toBe(2);
    // 40 XP (2 Sterne) + Abzeichen „Gestartet“
    expect(first.newBadges.map((b) => b.id)).toEqual(['erste-lektion']);
    expect(first.xpGained).toBe(40 + BADGE_XP);
    expect(first.progress.lessons.l1).toEqual({ stars: 2, plays: 1 });

    // Nochmal mit 3 Sternen: nur die Differenz (10) + Abzeichen „Fehlerfrei“ und „Wiederholer“
    const again = finishLesson(first.progress, mini, 'l1', 0, '2026-11-01');
    expect(again.xpGained).toBe(10 + 2 * BADGE_XP);
    expect(again.newBadges.map((b) => b.id).sort()).toEqual(['fehlerfrei', 'wiederholer']);
    expect(again.progress.lessons.l1).toEqual({ stars: 3, plays: 2 });

    // Schlechter gespielt: Sterne bleiben, keine XP
    const worse = finishLesson(again.progress, mini, 'l1', 5, '2026-11-01');
    expect(worse.xpGained).toBe(0);
    expect(worse.progress.lessons.l1!.stars).toBe(3);
    // Eingabe bleibt unverändert
    expect(first.progress.lessons.l1!.stars).toBe(2);
  });

  it('Bereichs- und Kurs-Abzeichen', () => {
    let p = emptyProgress();
    p = finishLesson(p, mini, 'l1', 0, '2026-11-01').progress;
    const r = finishLesson(p, mini, 'l2', 0, '2026-11-01');
    expect(r.newBadges.map((b) => b.id)).toContain('bereich-a');
    const end = finishLesson(r.progress, mini, 'l3', 0, '2026-11-01');
    expect(end.newBadges.map((b) => b.id)).toEqual(expect.arrayContaining(['bereich-b', 'abenteuer']));
    // Abzeichen-IDs sind eindeutig
    const ids = badgeRules(course).map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('Freischalten und nächste Lektion', () => {
    const p = emptyProgress();
    expect(lessonOrder(mini)).toEqual(['l1', 'l2', 'l3']);
    expect(isUnlocked(p, mini, 'l1')).toBe(true);
    expect(isUnlocked(p, mini, 'l2')).toBe(false);
    expect(isUnlocked(p, mini, 'lx')).toBe(false);
    expect(nextLesson(p, mini)).toBe('l1');
    const after = finishLesson(p, mini, 'l1', 0, '2026-11-01').progress;
    expect(isUnlocked(after, mini, 'l2')).toBe(true);
    expect(isUnlocked(after, mini, 'l3')).toBe(false);
    expect(nextLesson(after, mini)).toBe('l2');
    expect(isUnlocked({ ...p, free: true }, mini, 'l3')).toBe(true);
  });

  it('Serie über Tage, auch über Monatsgrenzen', () => {
    expect(dayKey(new Date(2026, 0, 5))).toBe('2026-01-05');
    let s = touchStreak({ last: '', days: 0 }, '2026-10-31');
    expect(s).toEqual({ last: '2026-10-31', days: 1 });
    s = touchStreak(s, '2026-11-01');
    expect(s.days).toBe(2);
    s = touchStreak(s, '2026-11-01');
    expect(s.days).toBe(2);
    s = touchStreak(s, '2026-11-03');
    expect(s.days).toBe(1);
  });

  it('Code zum Mitnehmen', () => {
    const p = finishLesson(emptyProgress(), mini, 'l1', 0, '2026-11-01').progress;
    const code = exportCode(p);
    expect(code).toMatch(/^SCI1\.[A-Za-z0-9_-]+\.[a-z0-9]{6}$/);
    expect(importCode(code)).toEqual(p);
    expect(importCode(` ${code} `)).toEqual(p);
    expect(importCode(code.slice(0, -1) + (code.endsWith('a') ? 'b' : 'a'))).toBeNull();
    expect(importCode('Unsinn')).toBeNull();
  });

  it('XP lassen sich aus Sternen und Abzeichen neu berechnen', () => {
    let p = emptyProgress();
    for (const [id, m] of [['l1', 0], ['l2', 3], ['l1', 1], ['l3', 0]] as const) p = finishLesson(p, mini, id, m, '2026-11-01').progress;
    expect(computeXp(p)).toBe(p.xp);
  });

  it('Zusammenführen verliert nichts', () => {
    const a = finishLesson(emptyProgress(), mini, 'l1', 3, '2026-11-01').progress;
    let b = finishLesson(emptyProgress(), mini, 'l1', 0, '2026-11-02').progress;
    b = finishLesson(b, mini, 'l2', 0, '2026-11-02').progress;
    const m = mergeProgress(a, b);
    expect(m.lessons.l1!.stars).toBe(3);
    expect(m.lessons.l2).toBeDefined();
    expect(new Set(m.badges)).toEqual(new Set([...a.badges, ...b.badges]));
    expect(m.xp).toBe(computeXp(m));
    expect(m.streak.last).toBe('2026-11-02');
    expect(mergeProgress(m, m)).toEqual(m);
    // Unabhängig von der Reihenfolge
    expect(mergeProgress(b, a).lessons).toEqual(m.lessons);
  });

  it('Stufennamen je Kurs', () => {
    const labor = getCourse('ki-labor');
    expect(levelFor(0, labor.levels).name.de).toBe('Lochkarte');
    expect(levelFor(99999, labor.levels)).toMatchObject({ level: labor.levels.length, max: true });
  });

  it('Wissenskarten nach Jahr', () => {
    const withCards: Course = {
      ...mini,
      chapters: [{ ...mini.chapters[0]!, lessons: [
        { ...mini.chapters[0]!.lessons[0]!, card: { year: 1990, title: { de: 'b', en: 'b' }, text: { de: 'b', en: 'b' } } },
        { ...mini.chapters[0]!.lessons[1]!, card: { year: 1950, title: { de: 'a', en: 'a' }, text: { de: 'a', en: 'a' } } },
      ] }],
    };
    let p = finishLesson(emptyProgress(), withCards, 'l1', 0, '2026-11-01').progress;
    expect(earnedCards(p, withCards).map((l) => l.id)).toEqual(['l1']);
    p = finishLesson(p, withCards, 'l2', 0, '2026-11-01').progress;
    expect(earnedCards(p, withCards).map((l) => l.id)).toEqual(['l2', 'l1']);
  });

  it('verwirft kaputte Daten', () => {
    expect(sanitizeProgress(null)).toEqual(emptyProgress());
    const p = sanitizeProgress({ xp: -5, lessons: { ok: { stars: 2, plays: 3 }, 'BAD ID': { stars: 3 }, x: { stars: 7 } }, badges: ['a', 'a', 5], streak: { last: 'gestern', days: 2 }, free: 'ja' });
    expect(p.xp).toBe(0);
    expect(p.lessons).toEqual({ ok: { stars: 2, plays: 3 } });
    expect(p.badges).toEqual(['a']);
    expect(p.streak).toEqual({ last: '', days: 0 });
    expect(p.free).toBe(false);
  });
});

describe('Wiederholen', () => {
  const course = COURSES[0]!;
  const world = course.chapters[0]!;

  it('bestes Ergebnis zählt, XP nur für Verbesserungen, computeXp stimmt', () => {
    let p = emptyProgress();
    const first = finishReview(p, course, world.id, 3, 5, '2026-11-02');
    expect(first.improved).toBe(true);
    expect(first.xpGained).toBe(3 * REVIEW_XP);
    p = first.progress;
    const worse = finishReview(p, course, world.id, 2, 5, '2026-11-05');
    expect(worse.xpGained).toBe(0);
    expect(worse.progress.reviews[world.id]).toEqual({ best: 3, total: 5, last: '2026-11-05' });
    const perfect = finishReview(worse.progress, course, world.id, 5, 5, '2026-11-06');
    expect(perfect.newBadges.map((b) => b.id)).toContain('gedaechtnis');
    expect(perfect.xpGained).toBe(2 * REVIEW_XP + BADGE_XP);
    expect(computeXp(perfect.progress)).toBe(perfect.progress.xp);
  });

  it('übersteht Code und Zusammenführen', () => {
    const p = finishReview(emptyProgress(), course, world.id, 4, 5, '2026-11-02').progress;
    const back = importCode(exportCode(p))!;
    expect(back.reviews[world.id]).toEqual({ best: 4, total: 5, last: '2026-11-02' });
    const other = finishReview(emptyProgress(), course, world.id, 5, 5, '2026-11-01').progress;
    const merged = mergeProgress(p, other);
    expect(merged.reviews[world.id]).toEqual({ best: 5, total: 5, last: '2026-11-02' });
    expect(merged.xp).toBe(computeXp(merged));
    // ältere Stände ohne Wiederholungen bleiben gültig
    const old = sanitizeProgress({ v: 1, xp: 50, lessons: { 'hallo-bit': { stars: 3, plays: 1 } }, badges: [] });
    expect(old.reviews).toEqual({});
    expect(sanitizeProgress({ reviews: { x: { best: 7, total: 5, last: 'gestern' } } }).reviews).toEqual({});
  });

  it('Abstand in Tagen', () => {
    expect(daysBetween('2026-11-01', '2026-11-04')).toBe(3);
    expect(daysBetween('', '2026-11-04')).toBe(Infinity);
  });

  it('Fragen: genau eine richtige Antwort, möglichst aus verschiedenen Lektionen', async () => {
    const contents = await Promise.all(world.lessons.map(async (l) => ({ id: l.id, content: await loadLesson(course.id, l.id) })));
    const all = questionsOf(contents);
    expect(all.length).toBeGreaterThanOrEqual(world.lessons.length);
    let seed = 7;
    const random = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const picked = pickQuestions(all, 5, random);
    expect(picked.length).toBe(Math.min(5, all.length));
    for (const q of picked) {
      if (q.calc) expect(Number.isFinite(q.calc.answer)).toBe(true);
      else expect(q.options.filter((o) => o.correct).length).toBe(1);
    }
    const lessonsUsed = new Set(picked.slice(0, world.lessons.length).map((q) => q.lessonId));
    expect(lessonsUsed.size).toBe(Math.min(world.lessons.length, picked.length));
  });

  it('jede Welt beider Kurse hat genug Fragen zum Wiederholen', async () => {
    for (const c of COURSES) {
      for (const chapter of c.chapters) {
        const contents = await Promise.all(chapter.lessons.map(async (l) => ({ id: l.id, content: await loadLesson(c.id, l.id) })));
        expect(questionsOf(contents).length, `${c.id}/${chapter.id}`).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it('Rechenaufgaben kommen mit ins Wiederholen', async () => {
    const labor = getCourse('ki-labor');
    const chapter = labor.chapters.find((c) => c.id === 'belohnung')!;
    const contents = await Promise.all(chapter.lessons.map(async (l) => ({ id: l.id, content: await loadLesson(labor.id, l.id) })));
    const all = questionsOf(contents);
    expect(all.some((q) => q.calc && q.calc.answer === 5.5)).toBe(true);
  });
});

describe('Vorher-Nachher-Check', () => {
  const course = COURSES[0]!;

  it('erster Startcheck zählt, bester Endcheck zählt, Abzeichen nach beiden, computeXp stimmt', () => {
    const start = finishCheck(emptyProgress(), course, 'start', 3, 9, '2026-11-01');
    expect(start.progress.checks?.start).toEqual({ correct: 3, total: 9, day: '2026-11-01' });
    expect(start.newBadges.map((b) => b.id)).not.toContain('vorher-nachher');
    // ein zweiter Startcheck ändert das Vorwissen nicht
    const again = finishCheck(start.progress, course, 'start', 8, 9, '2026-11-02');
    expect(again.progress.checks?.start?.correct).toBe(3);
    const end = finishCheck(again.progress, course, 'end', 7, 9, '2026-11-20');
    expect(end.newBadges.map((b) => b.id)).toContain('vorher-nachher');
    expect(end.xpGained).toBe(BADGE_XP);
    const worse = finishCheck(end.progress, course, 'end', 5, 9, '2026-11-21');
    expect(worse.progress.checks?.end).toEqual({ correct: 7, total: 9, day: '2026-11-20' });
    expect(worse.xpGained).toBe(0);
    const better = finishCheck(worse.progress, course, 'end', 9, 9, '2026-11-22');
    expect(better.progress.checks?.end).toEqual({ correct: 9, total: 9, day: '2026-11-22' });
    expect(computeXp(better.progress)).toBe(better.progress.xp);
  });

  it('übersteht Code, Prüfung und Zusammenführen', () => {
    const a = finishCheck(emptyProgress(), course, 'start', 2, 9, '2026-11-03').progress;
    const back = importCode(exportCode(a))!;
    expect(back.checks?.start).toEqual({ correct: 2, total: 9, day: '2026-11-03' });
    let b = finishCheck(emptyProgress(), course, 'start', 5, 9, '2026-11-01').progress;
    b = finishCheck(b, course, 'end', 8, 9, '2026-11-25').progress;
    const merged = mergeProgress(a, b);
    // der frühere Startcheck zeigt das Vorwissen, der Endcheck kommt mit
    expect(merged.checks?.start).toEqual({ correct: 5, total: 9, day: '2026-11-01' });
    expect(merged.checks?.end).toEqual({ correct: 8, total: 9, day: '2026-11-25' });
    expect(merged.xp).toBe(computeXp(merged));
    // ältere Stände ohne Check bleiben gültig, Kaputtes wird verworfen
    expect(sanitizeProgress({ v: 1, xp: 0, lessons: {}, badges: [] }).checks).toEqual({});
    expect(sanitizeProgress({ checks: { start: { correct: 10, total: 9, day: '2026-11-01' }, end: { correct: 1, total: 9, day: 'morgen' } } }).checks).toEqual({ end: { correct: 1, total: 9, day: '' } });
  });

  it('jeder Kurs hat eine Check-Frage je Welt (in Reihenfolge), genau eine richtige Antwort, Erklärung in beiden Sprachen', async () => {
    const { loadCheck } = await import('../src/kurse/loaders');
    for (const c of COURSES) {
      const questions = await loadCheck(c.id);
      expect(questions.map((q) => q.world), c.id).toEqual(c.chapters.map((ch) => ch.id));
      for (const q of questions) {
        expect(q.options.length, q.world).toBeGreaterThanOrEqual(3);
        expect(q.options.filter((o) => o.correct).length, q.world).toBe(1);
        for (const lang of ['de', 'en'] as const) {
          expect(q.question[lang].trim().length, q.world).toBeGreaterThan(15);
          expect(q.explain[lang].length, q.world).toBeGreaterThan(60);
          for (const o of q.options) expect(o.text[lang].trim().length, q.world).toBeGreaterThan(3);
          // Die richtige Antwort verrät sich nicht durch ihre Länge
          const lengths = q.options.map((o) => o.text[lang].length);
          const right = q.options.findIndex((o) => o.correct);
          expect(lengths[right]!, `${c.id}/${q.world}/${lang}: richtige Antwort viel länger`).toBeLessThanOrEqual(1.5 * Math.max(...lengths.filter((_, i) => i !== right)));
        }
      }
    }
  });
});
