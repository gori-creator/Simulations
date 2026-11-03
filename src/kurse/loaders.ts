import type { CheckQuestion, GameMount, GlossaryEntry, LessonContent } from './types';

/**
 * Inhalte und Spiele werden erst auf der Lektionsseite geladen (eigene
 * JavaScript-Dateien). Ordner: src/kurse/<kurs>/lessons/<id>.ts und
 * src/kurse/<kurs>/games/<name>.ts – ein Test prüft, dass alles da ist.
 * Spiele, die mehrere Kurse nutzen (Kartenspiel, Zeitstrahl, Sortieren …),
 * liegen in src/kurse/gemeinsam/games/ und werden gefunden, wenn der Kurs
 * kein eigenes Spiel dieses Namens hat.
 */
const lessonModules = import.meta.glob<{ default: LessonContent }>('./*/lessons/*.ts');
const gameModules = import.meta.glob<{ default: GameMount<never> }>('./*/games/*.ts');
const glossaryModules = import.meta.glob<{ GLOSSARY: GlossaryEntry[] }>('./*/woerter.ts');
const checkModules = import.meta.glob<{ CHECK: CheckQuestion[] }>('./*/check.ts');

/** Ordner mit gemeinsamen Spielen. */
export const SHARED = 'gemeinsam';

const keyOf = (file: string) => {
  const [, course, , name] = file.split('/');
  return `${course}/${name!.replace(/\.ts$/, '')}`;
};

const lessons = Object.fromEntries(Object.entries(lessonModules).map(([file, load]) => [keyOf(file), load]));
const games = Object.fromEntries(Object.entries(gameModules).map(([file, load]) => [keyOf(file), load]));

const gameKey = (courseId: string, game: string) => (`${courseId}/${game}` in games ? `${courseId}/${game}` : `${SHARED}/${game}`);

export function hasLesson(courseId: string, lessonId: string): boolean {
  return `${courseId}/${lessonId}` in lessons;
}

export function hasGame(courseId: string, game: string): boolean {
  return gameKey(courseId, game) in games;
}

export async function loadLesson(courseId: string, lessonId: string): Promise<LessonContent> {
  const load = lessons[`${courseId}/${lessonId}`];
  if (!load) throw new Error(`Lektion fehlt: ${courseId}/${lessonId}`);
  return (await load()).default;
}

export async function loadGame(courseId: string, game: string): Promise<GameMount<never>> {
  const load = games[gameKey(courseId, game)];
  if (!load) throw new Error(`Spiel fehlt: ${courseId}/${game}`);
  return (await load()).default;
}

/** KI-Wörterbuch eines Kurses (leer, wenn es keins gibt). */
export async function loadGlossary(courseId: string): Promise<GlossaryEntry[]> {
  const load = glossaryModules[`./${courseId}/woerter.ts`];
  return load ? (await load()).GLOSSARY : [];
}

/** Fragen des Vorher-Nachher-Checks (leer, wenn es keinen gibt). */
export async function loadCheck(courseId: string): Promise<CheckQuestion[]> {
  const load = checkModules[`./${courseId}/check.ts`];
  return load ? (await load()).CHECK : [];
}
