import type { GameMount, LessonContent } from './types';

/**
 * Inhalte und Spiele werden erst auf der Lektionsseite geladen (eigene
 * JavaScript-Dateien). Ordner: src/kurse/<kurs>/lessons/<id>.ts und
 * src/kurse/<kurs>/games/<name>.ts – ein Test prüft, dass alles da ist.
 */
const lessonModules = import.meta.glob<{ default: LessonContent }>('./*/lessons/*.ts');
const gameModules = import.meta.glob<{ default: GameMount<never> }>('./*/games/*.ts');

const keyOf = (file: string) => {
  const [, course, , name] = file.split('/');
  return `${course}/${name!.replace(/\.ts$/, '')}`;
};

const lessons = Object.fromEntries(Object.entries(lessonModules).map(([file, load]) => [keyOf(file), load]));
const games = Object.fromEntries(Object.entries(gameModules).map(([file, load]) => [keyOf(file), load]));

export function hasLesson(courseId: string, lessonId: string): boolean {
  return `${courseId}/${lessonId}` in lessons;
}

export function hasGame(courseId: string, game: string): boolean {
  return `${courseId}/${game}` in games;
}

export async function loadLesson(courseId: string, lessonId: string): Promise<LessonContent> {
  const load = lessons[`${courseId}/${lessonId}`];
  if (!load) throw new Error(`Lektion fehlt: ${courseId}/${lessonId}`);
  return (await load()).default;
}

export async function loadGame(courseId: string, game: string): Promise<GameMount<never>> {
  const load = games[`${courseId}/${game}`];
  if (!load) throw new Error(`Spiel fehlt: ${courseId}/${game}`);
  return (await load()).default;
}
