import type { Lang, Localized } from '../i18n/config';

/** Stimmung der Figur, die durch den Kurs führt. */
export type Mood = 'happy' | 'think' | 'wow' | 'sad' | 'wink';

/** Figur eines Kurses: Bit (Roboter, Klasse 5–10) oder Ada (Laborassistenz, Oberstufe). */
export type GuideId = 'bit' | 'ada';

/** Hilfen, die ein Spiel von der Lektion bekommt. */
export interface GameCtx {
  lang: Lang;
  /** Zweisprachigen Text in die aktuelle Sprache übersetzen. */
  tx(text: Localized): string;
  /** Die Figur sagt etwas (Sprechblase). */
  say(text: Localized | string, mood?: Mood): void;
  /** Ein Fehler zählt für die Sterne. */
  mistake(): void;
  /** Das Spiel ist geschafft: „Weiter“ wird frei. */
  finish(): void;
  /** Zahl sprachrichtig (Dezimalkomma im Deutschen, Minus als −). */
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
  /** Rückmeldung nach dem Antippen. */
  feedback?: Localized;
}

export type Step =
  /** Die Figur erzählt; „Weiter“ geht sofort. */
  | { kind: 'say'; text: Localized; mood?: Mood }
  /** Frage; falsche Antworten zählen als Fehler, man darf erneut wählen. */
  | { kind: 'choice'; question: Localized; options: ChoiceOption[]; explain?: Localized; mood?: Mood }
  /**
   * Vermutung vor dem Ausprobieren: jede Antwort ist erlaubt, nichts zählt als
   * Fehler. Danach `reveal` (die Auflösung kommt meist im nächsten Spiel).
   */
  | { kind: 'predict'; question: Localized; options: { text: Localized; feedback?: Localized }[]; reveal?: Localized }
  /** Spiel aus `games/<game>.ts` (Kurs) oder `gemeinsam/games/<game>.ts`. */
  | { kind: 'game'; game: string; intro?: Localized; props?: unknown; mood?: Mood }
  /**
   * Wissenskasten ohne Wertung. `curious` (Standard): „Für Neugierige“.
   * `plain`: „Klartext“ – was wirklich passiert, ohne Vermenschlichung
   * („Bit denkt“ → „das Programm rechnet“). `formula`: eine Formelzeile.
   */
  | { kind: 'info'; title: Localized; text: Localized; formula?: string; tone?: 'curious' | 'plain' };

/** Sammelkarte einer Lektion: ein Meilenstein der KI-Geschichte und was man mitnimmt. */
export interface KnowledgeCard {
  /** Jahr des Meilensteins (für den Zeitstrahl im Album). */
  year: number;
  title: Localized;
  /** Ein bis zwei Sätze: Was geschah damals – und was hat das mit der Lektion zu tun? */
  text: Localized;
}

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
  /** Sammelkarte, die man beim ersten Schaffen bekommt (Pflicht für fertige Lektionen). */
  card?: KnowledgeCard;
  /** Abschlussmission einer Welt (größerer Knoten auf der Karte). */
  boss?: boolean;
}

export interface Chapter {
  id: string;
  title: Localized;
  blurb: Localized;
  /** Wappen der Welt und Symbol ihres Abzeichens. */
  icon: string;
  /** Zeitraum, um den es geht (z. B. „1943–1969“), nur Anzeige. */
  era?: Localized;
  lessons: LessonMeta[];
}

export interface Course {
  id: string;
  slug: Localized;
  title: Localized;
  tagline: Localized;
  description: Localized;
  /** Zielgruppe in Worten, z. B. „Klasse 5–10“. */
  audience: Localized;
  /** Klassenstufen von–bis (für die Übersicht). */
  grades: [number, number];
  guide: GuideId;
  /** Name der Figur in Sprechblasen und Bildbeschreibungen. */
  guideName: string;
  /** Namen der Stufen (Anzahl = höchste Stufe). */
  levels: Localized[];
  /** Abzeichen für den ganzen Kurs. */
  finalBadge: { icon: string; title: Localized; text: Localized };
  /** Sätze der Figur am Ende einer Lektion. */
  voice: { perfect: Localized; done: Localized };
  chapters: Chapter[];
}

/** Inhalt einer Lektion (wird erst auf der Lektionsseite geladen). */
export interface LessonContent {
  steps: Step[];
}
