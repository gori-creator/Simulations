import { L } from '../../curriculum/helpers';
import type { Localized } from '../../i18n/config';
import type { Course } from '../types';

/**
 * Spielstand eines Kurses: XP, Sterne je Lektion, Abzeichen, Serie.
 *
 * Reine Rechenlogik ohne Browser-Zugriff (getestet in tests/kurs-progress.test.ts).
 * Gespeichert wird über einen `ProgressStore` (engine/store.ts) – heute im
 * Browser, später ggf. auf einem Server mit Konto, ohne dass sich hier etwas ändert.
 */
export interface LessonRecord {
  /** Beste Wertung: 1 bis 3 Sterne. */
  stars: 1 | 2 | 3;
  /** Wie oft geschafft. */
  plays: number;
}

export interface Progress {
  v: 1;
  xp: number;
  lessons: Record<string, LessonRecord>;
  badges: string[];
  /** Serie: letzter Spieltag (JJJJ-MM-TT) und Tage in Folge. */
  streak: { last: string; days: number };
  /** Alle fertigen Lektionen frei wählbar (Lehrkräfte, Neugierige). */
  free: boolean;
}

export function emptyProgress(): Progress {
  return { v: 1, xp: 0, lessons: {}, badges: [], streak: { last: '', days: 0 }, free: false };
}

/** Gespeicherte Daten prüfen; Unbekanntes oder Kaputtes wird verworfen. */
export function sanitizeProgress(raw: unknown): Progress {
  const p = emptyProgress();
  if (!raw || typeof raw !== 'object') return p;
  const r = raw as Record<string, unknown>;
  if (typeof r.xp === 'number' && Number.isFinite(r.xp)) p.xp = Math.max(0, Math.min(1e6, Math.round(r.xp)));
  if (r.lessons && typeof r.lessons === 'object') {
    for (const [id, rec] of Object.entries(r.lessons as Record<string, unknown>)) {
      if (!/^[a-z0-9-]{1,40}$/.test(id) || !rec || typeof rec !== 'object') continue;
      const { stars, plays } = rec as Record<string, unknown>;
      if (stars !== 1 && stars !== 2 && stars !== 3) continue;
      p.lessons[id] = { stars, plays: typeof plays === 'number' && plays >= 1 ? Math.min(9999, Math.round(plays)) : 1 };
    }
  }
  if (Array.isArray(r.badges)) p.badges = [...new Set(r.badges.filter((b): b is string => typeof b === 'string' && /^[a-z0-9-]{1,40}$/.test(b)))];
  if (r.streak && typeof r.streak === 'object') {
    const { last, days } = r.streak as Record<string, unknown>;
    if (typeof last === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(last) && typeof days === 'number' && days >= 1) {
      p.streak = { last, days: Math.min(9999, Math.round(days)) };
    }
  }
  p.free = r.free === true;
  return p;
}

// ---------- Stufen ----------

/** Namen der Stufen: Bit baut sich Stück für Stück zu einer klugen Maschine aus. */
export const LEVEL_NAMES: Localized[] = [
  L('Funke', 'Spark'),
  L('Schalter', 'Switch'),
  L('Chip', 'Chip'),
  L('Sensor', 'Sensor'),
  L('Rechner', 'Computer'),
  L('Netz', 'Network'),
  L('Lerner', 'Learner'),
  L('Denker', 'Thinker'),
  L('Profi', 'Pro'),
  L('Meister', 'Master'),
];

/** XP, die man von Stufe n zu n+1 braucht (n ab 1). */
export function xpForNext(level: number): number {
  return 40 + 20 * (level - 1);
}

export interface LevelInfo {
  level: number;
  name: Localized;
  /** XP innerhalb der aktuellen Stufe. */
  into: number;
  /** XP bis zur nächsten Stufe insgesamt (0 auf der höchsten Stufe). */
  need: number;
  max: boolean;
}

export function levelFor(xp: number): LevelInfo {
  let level = 1;
  let rest = Math.max(0, xp);
  while (level < LEVEL_NAMES.length && rest >= xpForNext(level)) {
    rest -= xpForNext(level);
    level += 1;
  }
  const max = level === LEVEL_NAMES.length;
  return { level, name: LEVEL_NAMES[level - 1]!, into: max ? 0 : rest, need: max ? 0 : xpForNext(level), max };
}

// ---------- Sterne und XP ----------

/** Sterne aus der Zahl der Fehler: 0 → 3, 1–2 → 2, sonst 1. */
export function starsFor(mistakes: number): 1 | 2 | 3 {
  if (mistakes <= 0) return 3;
  if (mistakes <= 2) return 2;
  return 1;
}

/** XP einer Lektion mit so vielen Sternen. */
export function lessonXp(stars: number): number {
  return 20 + 10 * stars;
}

/** XP für ein neues Abzeichen. */
export const BADGE_XP = 20;

// ---------- Abzeichen ----------

export interface BadgeDef {
  id: string;
  icon: string;
  title: Localized;
  text: Localized;
}

interface BadgeRule extends BadgeDef {
  earned(p: Progress, course: Course): boolean;
}

const readyLessons = (course: Course) => course.chapters.flatMap((c) => c.lessons.filter((l) => l.status === 'ready'));

/** Alle Abzeichen eines Kurses (Bereichs-Abzeichen ergeben sich aus den Bereichen). */
export function badgeRules(course: Course): BadgeRule[] {
  const rules: BadgeRule[] = [
    {
      id: 'erste-lektion',
      icon: '🚀',
      title: L('Gestartet', 'Lift-off'),
      text: L('Die erste Lektion geschafft.', 'Finished your first lesson.'),
      earned: (p) => Object.keys(p.lessons).length >= 1,
    },
    {
      id: 'fehlerfrei',
      icon: '⭐',
      title: L('Fehlerfrei', 'Flawless'),
      text: L('Eine Lektion ganz ohne Fehler.', 'A lesson without a single mistake.'),
      earned: (p) => Object.values(p.lessons).some((l) => l.stars === 3),
    },
    {
      id: 'sternensammler',
      icon: '🌟',
      title: L('Sternensammler', 'Star collector'),
      text: L('30 Sterne gesammelt.', 'Collected 30 stars.'),
      earned: (p) => Object.values(p.lessons).reduce((n, l) => n + l.stars, 0) >= 30,
    },
    {
      id: 'serie-3',
      icon: '🔥',
      title: L('Dranbleiber', 'Keep going'),
      text: L('An drei Tagen in Folge gespielt.', 'Played on three days in a row.'),
      earned: (p) => p.streak.days >= 3,
    },
    {
      id: 'wiederholer',
      icon: '🔁',
      title: L('Übung macht klug', 'Practice makes smart'),
      text: L('Eine Lektion nochmal gespielt.', 'Replayed a lesson.'),
      earned: (p) => Object.values(p.lessons).some((l) => l.plays >= 2),
    },
  ];
  course.chapters.forEach((chapter, i) => {
    const ids = chapter.lessons.filter((l) => l.status === 'ready').map((l) => l.id);
    if (ids.length === 0) return;
    rules.push({
      id: `bereich-${chapter.id}`,
      icon: ['🔌', '📊', '🧭', '🧠', '🖼️', '🤝'][i] ?? '🏅',
      title: chapter.title,
      text: L(`Bereich ${i + 1} komplett geschafft.`, `Finished all of chapter ${i + 1}.`),
      earned: (p) => ids.every((id) => p.lessons[id]),
    });
  });
  rules.push({
    id: 'abenteuer',
    icon: '🏆',
    title: L('Abenteuer bestanden', 'Adventure complete'),
    text: L('Alle Lektionen geschafft.', 'Finished every lesson.'),
    earned: (p, c) => {
      const all = readyLessons(c);
      return all.length > 0 && all.every((l) => p.lessons[l.id]);
    },
  });
  return rules;
}

// ---------- Freischalten ----------

/** Lektionen in Spielreihenfolge (nur fertige). */
export function lessonOrder(course: Course): string[] {
  return readyLessons(course).map((l) => l.id);
}

/** Frei, wenn sie die erste ist, die vorige geschafft wurde, sie selbst schon geschafft ist oder alles frei ist. */
export function isUnlocked(p: Progress, course: Course, lessonId: string): boolean {
  const order = lessonOrder(course);
  const i = order.indexOf(lessonId);
  if (i < 0) return false;
  if (p.free || i === 0 || p.lessons[lessonId]) return true;
  return !!p.lessons[order[i - 1]!];
}

/** Nächste Lektion zum Weiterspielen: die erste nicht geschaffte; alles geschafft → null. */
export function nextLesson(p: Progress, course: Course): string | null {
  return lessonOrder(course).find((id) => !p.lessons[id]) ?? null;
}

// ---------- Serie ----------

/** Datum als JJJJ-MM-TT in Ortszeit. */
export function dayKey(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function previousDay(key: string): string {
  const [y, m, d] = key.split('-').map(Number) as [number, number, number];
  return dayKey(new Date(y, m - 1, d - 1));
}

export function touchStreak(streak: Progress['streak'], today: string): Progress['streak'] {
  if (streak.last === today) return streak;
  if (streak.last && streak.last === previousDay(today)) return { last: today, days: streak.days + 1 };
  return { last: today, days: 1 };
}

// ---------- Lektion abschließen ----------

export interface FinishResult {
  progress: Progress;
  stars: 1 | 2 | 3;
  /** XP aus dieser Runde (Lektion + neue Abzeichen). */
  xpGained: number;
  newBadges: BadgeDef[];
  levelBefore: number;
  levelAfter: number;
}

/**
 * Lektion geschafft: Sterne merken (nur Verbesserungen bringen XP), Serie
 * weiterzählen, neue Abzeichen vergeben. `progress` bleibt unverändert.
 */
export function finishLesson(progress: Progress, course: Course, lessonId: string, mistakes: number, today: string): FinishResult {
  const p: Progress = structuredClone(progress);
  const stars = starsFor(mistakes);
  const before = p.lessons[lessonId];
  let xpGained = Math.max(0, lessonXp(stars) - (before ? lessonXp(before.stars) : 0));
  p.lessons[lessonId] = { stars: before ? (Math.max(before.stars, stars) as 1 | 2 | 3) : stars, plays: (before?.plays ?? 0) + 1 };
  p.streak = touchStreak(p.streak, today);
  const newBadges: BadgeDef[] = [];
  for (const rule of badgeRules(course)) {
    if (p.badges.includes(rule.id) || !rule.earned(p, course)) continue;
    p.badges.push(rule.id);
    newBadges.push({ id: rule.id, icon: rule.icon, title: rule.title, text: rule.text });
    xpGained += BADGE_XP;
  }
  const levelBefore = levelFor(p.xp).level;
  p.xp += xpGained;
  return { progress: p, stars, xpGained, newBadges, levelBefore, levelAfter: levelFor(p.xp).level };
}

// ---------- Mitnehmen per Code ----------

const CODE_PREFIX = 'SCI1';

function checksum(text: string): string {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36).padStart(7, '0').slice(-6);
}

function toBase64Url(text: string): string {
  return btoa(text).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(text: string): string {
  const b64 = text.replace(/-/g, '+').replace(/_/g, '/');
  return atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4));
}

/** Spielstand als Text-Code (nur ASCII; mit Prüfsumme gegen Tippfehler). */
export function exportCode(p: Progress): string {
  const body = toBase64Url(JSON.stringify(p));
  return `${CODE_PREFIX}.${body}.${checksum(body)}`;
}

/** Code einlesen; ungültig → null. */
export function importCode(code: string): Progress | null {
  const parts = code.trim().replace(/\s+/g, '').split('.');
  if (parts.length !== 3 || parts[0] !== CODE_PREFIX) return null;
  const [, body, sum] = parts as [string, string, string];
  if (!body || checksum(body) !== sum) return null;
  try {
    return sanitizeProgress(JSON.parse(fromBase64Url(body)));
  } catch {
    return null;
  }
}
