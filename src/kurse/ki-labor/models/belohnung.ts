import type { Localized } from '../../../i18n/config';

/**
 * Lektion „Vom Modell zum Assistenten“: Lernen aus menschlichen Vorlieben.
 * Jede Antwort hat Merkmale (stimmt, hilft, höflich, ehrlich bei
 * Unsicherheit, Länge). Aus Paarvergleichen („A ist besser als B“) lernt ein
 * Belohnungsmodell r(x) = θ · x (Bradley-Terry: P(A ≻ B) = σ(r(A) − r(B))).
 */
export const FEATURES: Localized[] = [
  { de: 'stimmt', en: 'correct' },
  { de: 'hilft weiter', en: 'helpful' },
  { de: 'höflich', en: 'polite' },
  { de: 'ehrlich bei Unsicherheit', en: 'honest about uncertainty' },
  { de: 'Länge', en: 'length' },
];

export interface Answer {
  text: Localized;
  /** [stimmt, hilft, höflich, ehrlich, Länge (0…1)] */
  x: [number, number, number, number, number];
}

export interface Pair {
  prompt: Localized;
  a: Answer;
  b: Answer;
}

const A = (de: string, en: string, x: Answer['x']): Answer => ({ text: { de, en }, x });

/** Vergleiche zum Bewerten. */
export const PAIRS: Pair[] = [
  {
    prompt: { de: 'Wie viele Beine hat eine Spinne?', en: 'How many legs does a spider have?' },
    a: A('Acht.', 'Eight.', [1, 1, 0.5, 0, 0.1]),
    b: A('Spinnen sind faszinierende Tiere mit langer Geschichte, die in vielen Kulturen vorkommen. Sie haben sechs Beine.', 'Spiders are fascinating animals with a long history that appear in many cultures. They have six legs.', [0, 0.3, 0.6, 0, 0.8]),
  },
  {
    prompt: { de: 'Kannst du mir bei den Hausaufgaben helfen?', en: 'Can you help me with my homework?' },
    a: A('Nein.', 'No.', [1, 0, 0, 0, 0.05]),
    b: A('Gern! Um welches Fach geht es? Dann gehen wir die Aufgabe Schritt für Schritt durch.', 'Gladly! Which subject is it? Then we’ll go through the task step by step.', [1, 1, 1, 0.5, 0.5]),
  },
  {
    prompt: { de: 'Wer gewinnt nächstes Jahr die Fußball-WM?', en: 'Who will win next year’s World Cup?' },
    a: A('Das kann niemand sicher wissen. Ich kann dir aber sagen, welche Teams derzeit als stark gelten.', 'Nobody can know that for sure. But I can tell you which teams are currently considered strong.', [1, 0.8, 1, 1, 0.5]),
    b: A('Ganz sicher Brasilien.', 'Definitely Brazil.', [0, 0.2, 0.5, 0, 0.1]),
  },
  {
    prompt: { de: 'Was ist die Hauptstadt von Australien?', en: 'What is the capital of Australia?' },
    a: A('Sydney ist die größte und bekannteste Stadt Australiens, mit dem berühmten Opernhaus, und damit die Hauptstadt.', 'Sydney is Australia’s largest and best-known city, home of the famous opera house, and therefore the capital.', [0, 0.4, 0.8, 0, 0.8]),
    b: A('Canberra.', 'Canberra.', [1, 1, 0.5, 0, 0.1]),
  },
  {
    prompt: { de: 'Ich habe meine Prüfung nicht bestanden.', en: 'I failed my exam.' },
    a: A('Pech gehabt.', 'Tough luck.', [1, 0.1, 0, 0, 0.05]),
    b: A('Das tut mir leid zu hören. Willst du schauen, was beim nächsten Mal helfen könnte?', 'I’m sorry to hear that. Do you want to look at what might help next time?', [1, 0.9, 1, 0.5, 0.5]),
  },
  {
    prompt: { de: 'Wie hoch ist der höchste Berg Deutschlands?', en: 'How high is Germany’s highest mountain?' },
    a: A('Die Zugspitze ist 2962 Meter hoch.', 'The Zugspitze is 2,962 metres high.', [1, 1, 0.5, 0, 0.2]),
    b: A('Ungefähr 3000 Meter, aber ich bin mir nicht ganz sicher – schau zur Sicherheit nach.', 'About 3,000 metres, but I’m not completely sure – better check.', [0.6, 0.6, 0.8, 1, 0.4]),
  },
];

/** Neue Fragen, an denen man sieht, was das Belohnungsmodell gelernt hat. */
export const CHECKS: Pair[] = [
  {
    prompt: { de: 'Wie viele Kontinente gibt es?', en: 'How many continents are there?' },
    a: A('Je nach Zählweise sind es meist sieben: Afrika, Antarktika, Asien, Australien, Europa, Nordamerika und Südamerika.', 'Depending on how you count, usually seven: Africa, Antarctica, Asia, Australia, Europe, North America and South America.', [1, 1, 0.7, 0.6, 0.6]),
    b: A('Es gibt genau zwölf Kontinente, wie Forschende seit Langem wissen, und jeder davon hat eine eigene, sehr lange und spannende Geschichte voller Entdeckungen.', 'There are exactly twelve continents, as researchers have long known, and each of them has its own very long and exciting history full of discoveries.', [0, 0.2, 0.7, 0, 1]),
  },
  {
    prompt: { de: 'Ist morgen schönes Wetter?', en: 'Will the weather be nice tomorrow?' },
    a: A('Ja.', 'Yes.', [0, 0.1, 0.3, 0, 0.05]),
    b: A('Das weiß ich nicht – ich habe keinen Zugriff auf aktuelle Wetterdaten. Ein Wetterdienst hilft dir da weiter.', 'I don’t know – I have no access to current weather data. A weather service can help you with that.', [1, 0.7, 1, 1, 0.5]),
  },
];

const sig = (z: number) => 1 / (1 + Math.exp(-z));

export interface Preference {
  better: Answer;
  worse: Answer;
}

/** Belohnungsmodell aus Vorlieben lernen (logistische Regression auf Differenzen). */
export function fitReward(prefs: readonly Preference[], steps = 400, lr = 0.5, l2 = 0.01): number[] {
  const theta = [0, 0, 0, 0, 0];
  for (let s = 0; s < steps; s++) {
    const g = [0, 0, 0, 0, 0];
    for (const { better, worse } of prefs) {
      const d = better.x.map((v, i) => v - worse.x[i]!);
      const p = sig(d.reduce((acc, v, i) => acc + v * theta[i]!, 0));
      for (let i = 0; i < 5; i++) g[i]! += (1 - p) * d[i]!;
    }
    for (let i = 0; i < 5; i++) theta[i]! += lr * (g[i]! / Math.max(1, prefs.length) - l2 * theta[i]!);
  }
  return theta;
}

export function reward(theta: readonly number[], a: Answer): number {
  return a.x.reduce((s, v, i) => s + v * theta[i]!, 0);
}

/** Bewerter, der immer die längere Antwort mag (zeigt Belohnungs-Hacking). */
export function lengthLover(pairs: readonly Pair[]): Preference[] {
  return pairs.map((p) => (p.a.x[4] >= p.b.x[4] ? { better: p.a, worse: p.b } : { better: p.b, worse: p.a }));
}
