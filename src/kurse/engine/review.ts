import type { Localized } from '../../i18n/config';
import type { LessonContent } from '../types';

/**
 * Wiederholen einer Welt (Abrufübung): Aus den Fragen der geschafften
 * Lektionen werden einige gemischt ausgewählt, die Antworten ebenfalls
 * gemischt. Reine Logik, getestet in tests/kurs-progress.test.ts.
 */
export interface ReviewQuestion {
  lessonId: string;
  question: Localized;
  options: { text: Localized; correct: boolean; feedback?: Localized }[];
}

/** Gleichmäßig gemischte Kopie (Fisher-Yates). */
export function shuffled<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

/** Alle Fragen mit genau einer richtigen Antwort aus diesen Lektionen. */
export function questionsOf(contents: readonly { id: string; content: LessonContent }[]): ReviewQuestion[] {
  const out: ReviewQuestion[] = [];
  for (const { id, content } of contents) {
    for (const step of content.steps) {
      if (step.kind !== 'choice') continue;
      const options = step.options.map((o) => ({ text: o.text, correct: o.correct === true, feedback: o.feedback }));
      if (options.filter((o) => o.correct).length !== 1 || options.length < 2) continue;
      out.push({ lessonId: id, question: step.question, options });
    }
  }
  return out;
}

/**
 * Bis zu `count` Fragen auswählen: möglichst aus verschiedenen Lektionen
 * (erst je Lektion eine, dann auffüllen), Antworten gemischt.
 */
export function pickQuestions(all: readonly ReviewQuestion[], count: number, random: () => number = Math.random): ReviewQuestion[] {
  const byLesson = new Map<string, ReviewQuestion[]>();
  for (const q of shuffled(all, random)) byLesson.set(q.lessonId, [...(byLesson.get(q.lessonId) ?? []), q]);
  const picked: ReviewQuestion[] = [];
  const queues = shuffled([...byLesson.values()], random);
  while (picked.length < count && queues.some((queue) => queue.length > 0)) {
    for (const queue of queues) {
      const next = queue.shift();
      if (next && picked.length < count) picked.push(next);
    }
  }
  return picked.map((q) => ({ ...q, options: shuffled(q.options, random) }));
}
