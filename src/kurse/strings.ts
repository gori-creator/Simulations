import { L } from '../curriculum/helpers';
import type { Lang, Localized } from '../i18n/config';

/**
 * Oberflächentexte der Kurse (Karte, Lektionsseite, Spielstand). Eigene Liste,
 * damit das Kursgerüst unabhängig von `src/i18n/ui.ts` bleibt und nur diese
 * Texte in den Browser geladen werden. Jeder Schlüssel hat beide Sprachen.
 */
export const KS = {
  next: L('Weiter', 'Next'),
  back: L('Zur Karte', 'Back to map'),
  again: L('Nochmal', 'Play again'),
  nextLesson: L('Nächste Lektion', 'Next lesson'),
  start: L('Los geht’s', 'Let’s go'),
  loading: L('Bit startet …', 'Bit is starting …'),
  noscript: L('Das Abenteuer braucht JavaScript. Bitte schalte es im Browser ein.', 'The adventure needs JavaScript. Please turn it on in your browser.'),
  loadError: L('Die Lektion konnte nicht geladen werden. Bitte lade die Seite neu.', 'The lesson could not be loaded. Please reload the page.'),
  stepOf: L('Schritt {n} von {total}', 'Step {n} of {total}'),
  forCurious: L('Für Neugierige', 'For the curious'),
  xp: L('{n} XP', '{n} XP'),
  level: L('Stufe {n}', 'Level {n}'),
  levelName: L('Stufe {n}: {name}', 'Level {n}: {name}'),
  levelNext: L('noch {n} XP bis Stufe {next}', '{n} XP to level {next}'),
  levelMax: L('Höchste Stufe erreicht!', 'Highest level reached!'),
  stars: L('{n} von 3 Sternen', '{n} of 3 stars'),
  xpGained: L('+{n} XP', '+{n} XP'),
  noXp: L('Keine neuen XP – du hattest schon so viele Sterne.', 'No new XP – you already had this many stars.'),
  levelUp: L('Neue Stufe: {name}!', 'New level: {name}!'),
  newBadge: L('Neues Abzeichen!', 'New badge!'),
  lessonDone: L('Lektion geschafft!', 'Lesson complete!'),
  mistakes0: L('Ganz ohne Fehler!', 'No mistakes at all!'),
  mistakes1: L('Nur ein Fehler.', 'Just one mistake.'),
  mistakesN: L('{n} Fehler – das gehört zum Lernen.', '{n} mistakes – that’s part of learning.'),
  locked: L('gesperrt', 'locked'),
  lockedHint: L('Schaffe erst die Lektion davor.', 'Finish the lesson before it first.'),
  soon: L('bald', 'soon'),
  minutes: L('{n} Min.', '{n} min'),
  badges: L('Abzeichen', 'Badges'),
  streak: L('{n} Tage in Folge', '{n} days in a row'),
  freeMode: L('Alle Lektionen freischalten', 'Unlock all lessons'),
  freeModeHint: L('Für Lehrkräfte und Neugierige: Jede fertige Lektion lässt sich sofort öffnen.', 'For teachers and the curious: every finished lesson can be opened right away.'),
  saveTitle: L('Spielstand mitnehmen', 'Take your progress with you'),
  saveText: L(
    'Dein Spielstand liegt nur in diesem Browser. Mit dem Code kannst du ihn auf ein anderes Gerät übertragen.',
    'Your progress is stored only in this browser. With the code you can move it to another device.',
  ),
  saveCopy: L('Code kopieren', 'Copy code'),
  saveCopied: L('Kopiert!', 'Copied!'),
  loadLabel: L('Code von einem anderen Gerät', 'Code from another device'),
  loadButton: L('Laden', 'Load'),
  loadOk: L('Spielstand geladen.', 'Progress loaded.'),
  loadBad: L('Der Code ist ungültig. Bitte prüfe ihn.', 'The code is not valid. Please check it.'),
  resetButton: L('Spielstand löschen', 'Delete progress'),
  resetConfirm: L('Wirklich den ganzen Spielstand löschen?', 'Really delete all your progress?'),
  privacy: L(
    'Kein Konto, keine Anmeldung: Der Spielstand bleibt auf deinem Gerät.',
    'No account, no sign-up: your progress stays on your device.',
  ),
  navLabel: L('KI-Abenteuer', 'AI Adventure'),
  home: L('Startseite', 'Home'),
  overall: L('{done} von {total} Lektionen geschafft', '{done} of {total} lessons done'),
  continueAt: L('Weiter mit: {title}', 'Continue: {title}'),
  startAt: L('Starte mit: {title}', 'Start: {title}'),
  allDone: L('Alles geschafft! Du kannst jede Lektion nochmal spielen.', 'All done! You can replay any lesson.'),
  chapter: L('Bereich {n}', 'Chapter {n}'),
  bitSays: L('Bit sagt', 'Bit says'),
  tryAgain: L('Versuch es nochmal!', 'Try again!'),
  correct: L('Richtig!', 'Correct!'),
  settings: L('Spielstand', 'Progress'),
} as const satisfies Record<string, Localized>;

export type KsKey = keyof typeof KS;

/** Text in einer Sprache; Platzhalter wie `{n}` werden ersetzt. */
export function ks(lang: Lang, key: KsKey, vars?: Record<string, string | number>): string {
  const text: string = KS[key][lang];
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (match, name: string) => (name in vars ? String(vars[name]) : match));
}
