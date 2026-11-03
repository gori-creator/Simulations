import { L } from '../../curriculum/helpers';
import type { Localized } from '../../i18n/config';
import type { Course, LessonMeta } from '../types';

/**
 * Spielstand eines Kurses: XP, Sterne je Lektion, Abzeichen, Serie.
 *
 * Reine Rechenlogik ohne Browser-Zugriff (getestet in tests/kurs-progress.test.ts).
 * Gespeichert wird über einen `ProgressStore` (engine/store.ts) – heute im
 * Browser, später ggf. auf einem Server mit Konto, ohne dass sich hier etwas ändert.
 * Für Konten wichtig: XP lassen sich aus Sternen und Abzeichen neu berechnen
 * (`computeXp`), zwei Stände lassen sich verlustfrei zusammenführen (`mergeProgress`).
 */
export interface LessonRecord {
  /** Beste Wertung: 1 bis 3 Sterne. */
  stars: 1 | 2 | 3;
  /** Wie oft geschafft. */
  plays: number;
}

/** Wiederholen einer Welt: bestes Ergebnis und letzter Tag. */
export interface ReviewRecord {
  /** Beste Zahl richtiger Antworten in einer Runde. */
  best: number;
  /** Fragen in dieser Runde. */
  total: number;
  /** Letzter Tag mit Wiederholung (JJJJ-MM-TT). */
  last: string;
}

/** Vorher-Nachher-Check: richtige Antworten, Fragen, Tag. */
export interface CheckRecord {
  correct: number;
  total: number;
  /** Tag (JJJJ-MM-TT). */
  day: string;
}

export interface Progress {
  v: 1;
  xp: number;
  lessons: Record<string, LessonRecord>;
  /** Wiederholungen je Welt (Schlüssel: Welt-ID). Fehlt in älteren Ständen. */
  reviews: Record<string, ReviewRecord>;
  badges: string[];
  /** Serie: letzter Spieltag (JJJJ-MM-TT) und Tage in Folge. */
  streak: { last: string; days: number };
  /** Alle fertigen Lektionen frei wählbar (Lehrkräfte, Neugierige). */
  free: boolean;
  /** Vorher-Nachher-Check: erster Startcheck, bester Endcheck. Fehlt in älteren Ständen. */
  checks?: { start?: CheckRecord; end?: CheckRecord };
}

/** Tiefe Kopie (reine JSON-Daten); ersetzt structuredClone, das ältere Safari-Versionen (vor 15.4) nicht kennen. */
export function cloneProgress(progress: Progress): Progress {
  return JSON.parse(JSON.stringify(progress)) as Progress;
}

export function emptyProgress(): Progress {
  return { v: 1, xp: 0, lessons: {}, reviews: {}, badges: [], streak: { last: '', days: 0 }, free: false, checks: {} };
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
  if (r.reviews && typeof r.reviews === 'object') {
    for (const [id, rec] of Object.entries(r.reviews as Record<string, unknown>)) {
      if (!/^[a-z0-9-]{1,40}$/.test(id) || !rec || typeof rec !== 'object') continue;
      const { best, total, last } = rec as Record<string, unknown>;
      if (typeof total !== 'number' || !Number.isInteger(total) || total < 1 || total > 50) continue;
      if (typeof best !== 'number' || !Number.isInteger(best) || best < 0 || best > total) continue;
      p.reviews[id] = { best, total, last: typeof last === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(last) ? last : '' };
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
  if (r.checks && typeof r.checks === 'object') {
    for (const kind of ['start', 'end'] as const) {
      const rec = (r.checks as Record<string, unknown>)[kind];
      if (!rec || typeof rec !== 'object') continue;
      const { correct, total, day } = rec as Record<string, unknown>;
      if (typeof total !== 'number' || !Number.isInteger(total) || total < 1 || total > 50) continue;
      if (typeof correct !== 'number' || !Number.isInteger(correct) || correct < 0 || correct > total) continue;
      p.checks![kind] = { correct, total, day: typeof day === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : '' };
    }
  }
  return p;
}

// ---------- Stufen ----------

/** Stufen im KI-Abenteuer: Bit baut sich Stück für Stück zu einer klugen Maschine aus. */
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

export function levelFor(xp: number, names: readonly Localized[] = LEVEL_NAMES): LevelInfo {
  let level = 1;
  let rest = Math.max(0, xp);
  while (level < names.length && rest >= xpForNext(level)) {
    rest -= xpForNext(level);
    level += 1;
  }
  const max = level === names.length;
  return { level, name: names[level - 1]!, into: max ? 0 : rest, need: max ? 0 : xpForNext(level), max };
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

/** XP je richtiger Antwort beim Wiederholen (bestes Ergebnis je Welt zählt). */
export const REVIEW_XP = 2;

/**
 * XP aus dem Spielstand neu berechnen: je Lektion die XP der besten Wertung,
 * je Abzeichen BADGE_XP. Stimmt mit dem überein, was `finishLesson` vergibt.
 */
export function computeXp(p: Progress): number {
  const reviews = Object.values(p.reviews ?? {}).reduce((sum, rec) => sum + rec.best * REVIEW_XP, 0);
  return Object.values(p.lessons).reduce((sum, rec) => sum + lessonXp(rec.stars), 0) + p.badges.length * BADGE_XP + reviews;
}

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

/** Alle Abzeichen eines Kurses (Welt-Abzeichen ergeben sich aus den Welten). */
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
      id: 'kartensammler',
      icon: '🃏',
      title: L('Zeitreisende', 'Time traveller'),
      text: L('10 Wissenskarten im Album.', '10 knowledge cards in your album.'),
      earned: (p, c) => readyLessons(c).filter((l) => l.card && p.lessons[l.id]).length >= 10,
    },
    {
      id: 'serie-3',
      icon: '🔥',
      title: L('Dranbleiber', 'Keep going'),
      text: L('An drei Tagen in Folge gespielt.', 'Played on three days in a row.'),
      earned: (p) => p.streak.days >= 3,
    },
    {
      id: 'gedaechtnis',
      icon: '🧠',
      title: L('Gutes Gedächtnis', 'Good memory'),
      text: L('Eine Welt ganz ohne Fehler wiederholt.', 'Reviewed a world without a single mistake.'),
      earned: (p) => Object.values(p.reviews ?? {}).some((r) => r.total >= 3 && r.best === r.total),
    },
    {
      id: 'vorher-nachher',
      icon: '📈',
      title: L('Lernsprung', 'Learning leap'),
      text: L('Start- und Endcheck gemacht – und gesehen, was dazukam.', 'Did the start and the final check – and saw how much you gained.'),
      earned: (p) => !!p.checks?.start && !!p.checks?.end,
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
      icon: chapter.icon,
      title: chapter.title,
      text: L(`Welt ${i + 1} komplett geschafft.`, `Finished all of world ${i + 1}.`),
      earned: (p) => ids.every((id) => p.lessons[id]),
    });
  });
  rules.push({
    id: 'abenteuer',
    icon: course.finalBadge.icon,
    title: course.finalBadge.title,
    text: course.finalBadge.text,
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

/** Sammelkarten, die schon im Album liegen (nach Jahr sortiert). */
export function earnedCards(p: Progress, course: Course): LessonMeta[] {
  return readyLessons(course)
    .filter((l) => l.card && p.lessons[l.id])
    .sort((a, b) => a.card!.year - b.card!.year);
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
  /** Zum ersten Mal geschafft (neue Sammelkarte). */
  firstTime: boolean;
  levelBefore: number;
  levelAfter: number;
}

/**
 * Lektion geschafft: Sterne merken (nur Verbesserungen bringen XP), Serie
 * weiterzählen, neue Abzeichen vergeben. `progress` bleibt unverändert.
 */
export function finishLesson(progress: Progress, course: Course, lessonId: string, mistakes: number, today: string): FinishResult {
  const p: Progress = cloneProgress(progress);
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
  const levels = course.levels;
  const levelBefore = levelFor(p.xp, levels).level;
  p.xp += xpGained;
  return { progress: p, stars, xpGained, newBadges, firstTime: !before, levelBefore, levelAfter: levelFor(p.xp, levels).level };
}

// ---------- Wiederholen ----------

export interface ReviewResult {
  progress: Progress;
  xpGained: number;
  newBadges: BadgeDef[];
  levelBefore: number;
  levelAfter: number;
  /** Neues bestes Ergebnis für diese Welt. */
  improved: boolean;
}

/**
 * Wiederholung einer Welt beendet: bestes Ergebnis und Tag merken, Serie
 * weiterzählen, Abzeichen prüfen. XP gibt es nur für Verbesserungen
 * (REVIEW_XP je zusätzlicher richtiger Antwort), damit `computeXp` stimmt.
 */
export function finishReview(progress: Progress, course: Course, worldId: string, correct: number, total: number, today: string): ReviewResult {
  const p: Progress = cloneProgress(progress);
  p.reviews = p.reviews ?? {};
  const right = Math.max(0, Math.min(total, Math.round(correct)));
  const before = p.reviews[worldId];
  const improved = !before || right > before.best;
  let xpGained = improved ? (right - (before?.best ?? 0)) * REVIEW_XP : 0;
  p.reviews[worldId] = { best: improved ? right : before!.best, total: improved ? total : before!.total, last: today };
  p.streak = touchStreak(p.streak, today);
  const newBadges: BadgeDef[] = [];
  for (const rule of badgeRules(course)) {
    if (p.badges.includes(rule.id) || !rule.earned(p, course)) continue;
    p.badges.push(rule.id);
    newBadges.push({ id: rule.id, icon: rule.icon, title: rule.title, text: rule.text });
    xpGained += BADGE_XP;
  }
  const levelBefore = levelFor(p.xp, course.levels).level;
  p.xp += xpGained;
  return { progress: p, xpGained, newBadges, levelBefore, levelAfter: levelFor(p.xp, course.levels).level, improved };
}

/** Tage zwischen zwei Tagen (JJJJ-MM-TT); leer → unendlich. */
export function daysBetween(from: string, to: string): number {
  if (!from) return Infinity;
  const parse = (key: string) => {
    const [y, m, d] = key.split('-').map(Number) as [number, number, number];
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((parse(to) - parse(from)) / 86400000);
}

// ---------- Vorher-Nachher-Check ----------

export interface CheckResult {
  progress: Progress;
  xpGained: number;
  newBadges: BadgeDef[];
  levelBefore: number;
  levelAfter: number;
}

/**
 * Check beendet. Startcheck: Es zählt der erste (er zeigt das Vorwissen),
 * spätere Versuche ändern nichts. Endcheck: Es zählt der beste. XP gibt es
 * nur über Abzeichen, damit `computeXp` stimmt.
 */
export function finishCheck(progress: Progress, course: Course, kind: 'start' | 'end', correct: number, total: number, today: string): CheckResult {
  const p: Progress = cloneProgress(progress);
  p.checks = p.checks ?? {};
  const right = Math.max(0, Math.min(total, Math.round(correct)));
  const before = p.checks[kind];
  if (kind === 'start' ? !before : !before || right > before.correct || (right === before.correct && total === before.total)) p.checks[kind] = { correct: right, total, day: today };
  p.streak = touchStreak(p.streak, today);
  let xpGained = 0;
  const newBadges: BadgeDef[] = [];
  for (const rule of badgeRules(course)) {
    if (p.badges.includes(rule.id) || !rule.earned(p, course)) continue;
    p.badges.push(rule.id);
    newBadges.push({ id: rule.id, icon: rule.icon, title: rule.title, text: rule.text });
    xpGained += BADGE_XP;
  }
  const levelBefore = levelFor(p.xp, course.levels).level;
  p.xp += xpGained;
  return { progress: p, xpGained, newBadges, levelBefore, levelAfter: levelFor(p.xp, course.levels).level };
}

// ---------- Zusammenführen (für Codes und spätere Konten) ----------

/**
 * Zwei Spielstände desselben Kurses verlustfrei vereinen: je Lektion die
 * bessere Wertung und die höhere Spielzahl, alle Abzeichen, die längere bzw.
 * jüngere Serie. XP werden neu berechnet (mindestens die höheren XP beider
 * Stände, falls ein Stand aus einer älteren Wertung stammt).
 */
export function mergeProgress(a: Progress, b: Progress): Progress {
  const p = cloneProgress(a);
  for (const [id, rec] of Object.entries(b.lessons)) {
    const mine = p.lessons[id];
    p.lessons[id] = mine ? { stars: Math.max(mine.stars, rec.stars) as 1 | 2 | 3, plays: Math.max(mine.plays, rec.plays) } : { ...rec };
  }
  p.reviews = { ...(a.reviews ?? {}) };
  for (const [id, rec] of Object.entries(b.reviews ?? {})) {
    const mine = p.reviews[id];
    if (!mine) p.reviews[id] = { ...rec };
    else {
      const better = rec.best / rec.total > mine.best / mine.total || (rec.best / rec.total === mine.best / mine.total && rec.best > mine.best) ? rec : mine;
      p.reviews[id] = { best: better.best, total: better.total, last: rec.last > mine.last ? rec.last : mine.last };
    }
  }
  p.badges = [...new Set([...a.badges, ...b.badges])];
  if (b.streak.last > p.streak.last || (b.streak.last === p.streak.last && b.streak.days > p.streak.days)) p.streak = { ...b.streak };
  p.free = a.free || b.free;
  // Check: der frühere Startcheck (Vorwissen), der bessere Endcheck
  const checks: NonNullable<Progress['checks']> = {};
  const [sa, sb] = [a.checks?.start, b.checks?.start];
  const start = sa && sb ? ((sb.day && (!sa.day || sb.day < sa.day)) ? sb : sa) : (sa ?? sb);
  if (start) checks.start = { ...start };
  const [ea, eb] = [a.checks?.end, b.checks?.end];
  const end = ea && eb ? (eb.correct / eb.total > ea.correct / ea.total || (eb.correct / eb.total === ea.correct / ea.total && eb.day > ea.day) ? eb : ea) : (ea ?? eb);
  if (end) checks.end = { ...end };
  p.checks = checks;
  p.xp = Math.max(computeXp(p), a.xp, b.xp);
  return p;
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
