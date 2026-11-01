import type { Lang, Localized } from '../i18n/config';

/** Stimmung von Bit, dem Roboter, der durch den Kurs führt. */
export type Mood = 'happy' | 'think' | 'wow' | 'sad' | 'wink';

/** Hilfen, die ein Spiel von der Lektion bekommt. */
export interface GameCtx {
  lang: Lang;
  /** Zweisprachigen Text in die aktuelle Sprache übersetzen. */
  tx(text: Localized): string;
  /** Bit sagt etwas (Sprechblase). */
  say(text: Localized | string, mood?: Mood): void;
  /** Ein Fehler zählt für die Sterne. */
  mistake(): void;
  /** Das Spiel ist geschafft: „Weiter“ wird frei. */
  finish(): void;
  /** Zahl sprachrichtig (Dezimalkomma im Deutschen). */
  num(value: number, digits?: number): string;
  /** Anteil 0…1 als Prozent ohne Nachkommastellen. */
  percent(share: number): string;
  /** Reduzierte Bewegung eingestellt: Animationen überspringen. */
  reducedMotion: boolean;
}

export interface GameInstance {
  destroy?(): void;
}

/** Ein Spiel baut seine Oberfläche in `host`. */
export type GameMount<P> = (host: HTMLElement, ctx: GameCtx, props: P) => GameInstance | void;

export interface ChoiceOption {
  text: Localized;
  correct?: boolean;
  /** Rückmeldung von Bit nach dem Antippen. */
  feedback?: Localized;
}

export type Step =
  /** Bit erzählt; „Weiter“ geht sofort. */
  | { kind: 'say'; text: Localized; mood?: Mood }
  /** Frage; falsche Antworten zählen als Fehler, man darf erneut wählen. */
  | { kind: 'choice'; question: Localized; options: ChoiceOption[]; explain?: Localized; mood?: Mood }
  /** Spiel aus `games/<game>.ts`. */
  | { kind: 'game'; game: string; intro?: Localized; props?: unknown; mood?: Mood }
  /** Wissenskasten „Für Neugierige“ (ohne Wertung). */
  | { kind: 'info'; title: Localized; text: Localized };

export interface LessonMeta {
  id: string;
  status: 'ready' | 'planned';
  slug: Localized;
  title: Localized;
  /** Ein Satz für die Karte. */
  teaser: Localized;
  /** Ein Zeichen (Emoji) als Symbol auf der Karte. */
  icon: string;
  /** Grobe Dauer in Minuten. */
  minutes: number;
}

export interface Chapter {
  id: string;
  title: Localized;
  blurb: Localized;
  lessons: LessonMeta[];
}

export interface Course {
  id: string;
  slug: Localized;
  title: Localized;
  tagline: Localized;
  description: Localized;
  chapters: Chapter[];
}

/** Inhalt einer Lektion (wird erst auf der Lektionsseite geladen). */
export interface LessonContent {
  steps: Step[];
}
