import { kiAbenteuer } from './ki-abenteuer';
import { kiLabor } from './ki-labor';
import type { Chapter, Course, LessonMeta } from './types';

export type * from './types';

/** Alle Kurse: KI-Abenteuer (Klasse 5–10) und KI-Labor (Klasse 11–13). */
export const COURSES: Course[] = [kiAbenteuer, kiLabor];

export function getCourse(id: string): Course {
  const course = COURSES.find((c) => c.id === id);
  if (!course) throw new Error(`Unbekannter Kurs: ${id}`);
  return course;
}

export interface LessonEntry extends LessonMeta {
  chapter: Chapter;
  /** Nummer des Bereichs (ab 1) und der Lektion im ganzen Kurs (ab 1). */
  chapterNo: number;
  no: number;
}

/** Alle Lektionen eines Kurses in Spielreihenfolge. */
export function lessonsOf(course: Course): LessonEntry[] {
  let no = 0;
  return course.chapters.flatMap((chapter, i) => chapter.lessons.map((l) => ({ ...l, chapter, chapterNo: i + 1, no: ++no })));
}

export function getLesson(courseId: string, lessonId: string): LessonEntry {
  const lesson = lessonsOf(getCourse(courseId)).find((l) => l.id === lessonId);
  if (!lesson) throw new Error(`Unbekannte Lektion: ${courseId}/${lessonId}`);
  return lesson;
}

/**
 * Kurse öffentlich zeigen (Link in der Kopfleiste, Aufnahme in Suchmaschinen)?
 * Bis zur Freigabe durch die Projektleitung nur über die direkte Adresse erreichbar.
 */
export const COURSES_PUBLIC = false;
