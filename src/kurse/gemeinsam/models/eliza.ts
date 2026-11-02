import type { Lang, Localized } from '../../../i18n/config';

/**
 * ELIZA (Joseph Weizenbaum, 1966), stark vereinfacht nachgebaut: Das Programm
 * sucht Schlüsselwörter, nimmt den Rest des Satzes, tauscht die Pronomen
 * („ich“ ↔ „du“) und setzt ihn in eine Antwortvorlage ein. Es versteht nichts.
 *
 * Eine Schutzregel hat Vorrang vor allem: Wer über Selbstverletzung oder
 * Gewalt schreibt, bekommt keinen Spiegel-Satz, sondern den Hinweis auf
 * Menschen, die helfen (Nummer gegen Kummer). Es wird nichts gespeichert oder
 * gesendet. Getestet in tests/kurs-sprache.test.ts.
 */
export interface ElizaRule {
  id: string;
  /** Anzeige im Blick unter die Haube, z. B. „ich bin …“. */
  label: Localized;
  /** Muster je Sprache; Gruppe 1 (falls vorhanden) wird gespiegelt eingesetzt. */
  pattern: Record<Lang, RegExp>;
  /** Vorlagen je Sprache; {1} = gespiegelter Satzrest. Werden der Reihe nach benutzt. */
  replies: Record<Lang, string[]>;
  priority: number;
  /** Schutzregel: Antwort ohne Spiegeln, im Spiel hervorgehoben. */
  safety?: boolean;
}

const R = (id: string, label: [string, string], de: RegExp, en: RegExp, deReplies: string[], enReplies: string[], priority: number, safety = false): ElizaRule => ({
  id,
  label: { de: label[0], en: label[1] },
  pattern: { de, en },
  replies: { de: deReplies, en: enReplies },
  priority,
  safety,
});

export const ELIZA_RULES: ElizaRule[] = [
  R(
    'hilfe',
    ['Schutzregel', 'Safety rule'],
    /\b(sterben|umbringen|selbstmord|suizid|ritze|ritzen|nicht mehr leben|tot sein|missbrauch\w*|schlägt mich|schlaegt mich|verprügelt|verpruegelt)\b/i,
    /\b(kill myself|suicide|want to die|self.?harm|cut myself|abuse\w*|hits me|beats me)\b/i,
    ['Das klingt ernst. Ich bin nur ein Programm und kann dir nicht helfen. Bitte sprich mit einem Menschen, dem du vertraust – oder ruf die Nummer gegen Kummer an: 116 111 (kostenlos, anonym).'],
    ['That sounds serious. I’m only a program and can’t help you. Please talk to a person you trust – or call a helpline for young people in your country.'],
    100,
    true,
  ),
  R('name', ['Frage nach dem Namen', 'question about the name'], /\b(wie heißt du|wie heisst du|wer bist du|dein name)\b/i, /\b(what is your name|what's your name|who are you|your name)\b/i, ['Ich heiße ELIZA. Ich bin ein Programm aus ein paar Regeln.', 'Mein Name ist ELIZA. Und wie heißt du?'], ['My name is ELIZA. I am a program made of a few rules.', 'I am ELIZA. And what is your name?'], 20),
  R('maschine', ['Schlüsselwort Computer/Maschine', 'keyword computer/machine'], /\b(computer|maschinen?|roboter|programm|ki|handy)\b/i, /\b(computers?|machines?|robots?|programs?|ai|phone)\b/i, ['Machen dir Maschinen Sorgen?', 'Warum sprichst du über Computer?', 'Was denkst du über Maschinen?'], ['Do machines worry you?', 'Why do you mention computers?', 'What do you think about machines?'], 15),
  R('entschuldigung', ['Schlüsselwort Entschuldigung', 'keyword sorry'], /\b(entschuldigung|tut mir leid|sorry)\b/i, /\b(sorry|apologi[sz]e)\b/i, ['Du musst dich nicht entschuldigen.', 'Entschuldigungen sind nicht nötig.'], ['Please don’t apologise.', 'Apologies are not necessary.'], 12),
  R('traum', ['Schlüsselwort Traum', 'keyword dream'], /\b(traum|träume|träumte|geträumt)\b/i, /\b(dreams?|dreamt|dreamed)\b/i, ['Was bedeutet dieser Traum für dich?', 'Träumst du oft?'], ['What does that dream mean to you?', 'Do you dream often?'], 12),
  R('ich-bin', ['„ich bin …“', '“I am …”'], /\bich bin (.+)/i, /\bi(?: am|'m) (.+)/i, ['Warum bist du {1}?', 'Wie lange bist du schon {1}?', 'Glaubst du, es ist normal, {1} zu sein?'], ['Why are you {1}?', 'How long have you been {1}?', 'Do you believe it is normal to be {1}?'], 10),
  R('ich-fuehle', ['„ich fühle mich …“', '“I feel …”'], /\bich fühle mich (.+)/i, /\bi feel (.+)/i, ['Wie oft fühlst du dich {1}?', 'Was gibt dir das Gefühl, {1} zu sein?'], ['How often do you feel {1}?', 'What makes you feel {1}?'], 10),
  R('ich-will', ['„ich will …“', '“I want …”'], /\bich (?:will|möchte|moechte) (.+)/i, /\bi (?:want|would like) (.+)/i, ['Warum willst du {1}?', 'Was hindert dich daran?'], ['Why do you want {1}?', 'What stops you?'], 10),
  R('du-bist', ['„du bist …“', '“you are …”'], /\bdu bist (.+)/i, /\byou(?: are|'re) (.+)/i, ['Warum glaubst du, dass ich {1} bin?', 'Gefällt es dir, zu denken, ich sei {1}?'], ['Why do you think I am {1}?', 'Does it please you to believe I am {1}?'], 10),
  R('familie', ['Schlüsselwort Familie', 'keyword family'], /\b(mutter|mama|vater|papa|eltern|bruder|schwester|familie|oma|opa|geschwister)\b/i, /\b(mother|mum|mom|father|dad|parents|brother|sister|family|grandma|grandpa)\b/i, ['Erzähl mir mehr über deine Familie.', 'Wer in deiner Familie ist dir am wichtigsten?'], ['Tell me more about your family.', 'Who in your family matters most to you?'], 9),
  R('weil', ['Schlüsselwort weil', 'keyword because'], /\bweil\b/i, /\bbecause\b/i, ['Ist das der wahre Grund?', 'Fallen dir noch andere Gründe ein?'], ['Is that the real reason?', 'Can you think of any other reasons?'], 8),
  R('warum', ['Schlüsselwort warum', 'keyword why'], /\bwarum\b/i, /\bwhy\b/i, ['Warum fragst du?', 'Was glaubst du selbst?'], ['Why do you ask?', 'What do you think yourself?'], 8),
  R('immer', ['Schlüsselwort immer', 'keyword always'], /\bimmer\b/i, /\balways\b/i, ['Fällt dir ein bestimmtes Beispiel ein?', 'Wirklich immer?'], ['Can you think of a specific example?', 'Really always?'], 8),
  R('alle', ['Schlüsselwort alle/niemand', 'keyword everyone/nobody'], /\b(alle|jeder|niemand|keiner)\b/i, /\b(everyone|everybody|nobody|no one)\b/i, ['Wirklich {1}?', 'Denkst du an jemand Bestimmten?'], ['Really {1}?', 'Are you thinking of someone in particular?'], 7),
  R('schule', ['Schlüsselwort Schule', 'keyword school'], /\b(schule|lehrer\w*|hausaufgaben|klassenarbeit|prüfung|test|noten?)\b/i, /\b(school|teachers?|homework|exams?|tests?|grades?)\b/i, ['Wie läuft es in der Schule?', 'Was beschäftigt dich an der Schule?'], ['How are things at school?', 'What is on your mind about school?'], 7),
  R('freunde', ['Schlüsselwort Freunde', 'keyword friends'], /\b(freund\w*)\b/i, /\b(friends?)\b/i, ['Erzähl mir von deinen Freunden.', 'Warum denkst du gerade an deine Freunde?'], ['Tell me about your friends.', 'Why are you thinking of your friends right now?'], 7),
  R('gefuehl', ['Gefühlswort', 'feeling word'], /\b(traurig|unglücklich|einsam|wütend|sauer|müde|glücklich|froh|fröhlich)\b/i, /\b(sad|unhappy|lonely|angry|tired|happy|glad|cheerful)\b/i, ['Seit wann fühlst du dich {1}?', 'Was macht dich {1}?'], ['Since when have you felt {1}?', 'What makes you {1}?'], 6),
  R('mein', ['„mein …“', '“my …”'], /\b((?:meine?[nmrs]?)\s.+)/i, /\b(my\s.+)/i, ['Warum sagst du, {1}?', 'Ist es wichtig für dich, dass {1}?'], ['Why do you say {1}?', 'Is it important to you that {1}?'], 5),
  R('ja', ['„ja“', '“yes”'], /^\s*(ja|jo|jep|klar)\b/i, /^\s*(yes|yeah|yep|sure)\b/i, ['Du klingst sehr sicher.', 'Verstehe.'], ['You seem quite sure.', 'I see.'], 4),
  R('nein', ['„nein“', '“no”'], /^\s*(nein|nö|ne)\b/i, /^\s*(no|nope|nah)\b/i, ['Warum nicht?', 'Du klingst sehr bestimmt.'], ['Why not?', 'You sound very certain.'], 4),
  R('vielleicht', ['Schlüsselwort vielleicht', 'keyword perhaps'], /\b(vielleicht|eventuell|weiß nicht|weiss nicht)\b/i, /\b(perhaps|maybe|don't know|dont know)\b/i, ['Du klingst unsicher.', 'Warum bist du dir nicht sicher?'], ['You don’t seem quite certain.', 'Why are you unsure?'], 4),
  R('hallo', ['Begrüßung', 'greeting'], /\b(hallo|hi|hey|moin|servus|guten (?:tag|morgen|abend))\b/i, /\b(hello|hi|hey|good (?:morning|afternoon|evening))\b/i, ['Hallo. Was beschäftigt dich?', 'Hallo! Erzähl mir, wie es dir geht.'], ['Hello. What is on your mind?', 'Hi! Tell me how you are.'], 3),
  R('sonst', ['keine Regel passt', 'no rule matches'], /[\s\S]*/, /[\s\S]*/, ['Erzähl mir mehr.', 'Verstehe. Und weiter?', 'Was bedeutet das für dich?', 'Das ist interessant. Erzähl weiter.'], ['Tell me more.', 'I see. Go on.', 'What does that mean to you?', 'That is interesting. Please go on.'], 0),
];

/** Pronomen und Verbformen, die beim Spiegeln getauscht werden. */
const REFLECT: Record<Lang, Record<string, string>> = {
  de: {
    ich: 'du', du: 'ich', mich: 'dich', dich: 'mich', mir: 'dir', dir: 'mir',
    mein: 'dein', meine: 'deine', meinen: 'deinen', meinem: 'deinem', meiner: 'deiner', meines: 'deines',
    dein: 'mein', deine: 'meine', deinen: 'meinen', deinem: 'meinem', deiner: 'meiner', deines: 'meines',
    bin: 'bist', bist: 'bin', habe: 'hast', hab: 'hast', hast: 'habe', war: 'warst', warst: 'war',
    kann: 'kannst', kannst: 'kann', will: 'willst', willst: 'will', mag: 'magst', magst: 'mag', muss: 'musst', musst: 'muss',
  },
  en: {
    i: 'you', me: 'you', my: 'your', mine: 'yours', myself: 'yourself', am: 'are', was: 'were', "i'm": 'you are', "i've": 'you have',
    you: 'I', your: 'my', yours: 'mine', yourself: 'myself', are: 'am', "you're": 'I am',
  },
};

/** Satzrest spiegeln: „meine Schwester nervt mich“ → „deine Schwester nervt dich“. */
export function reflect(text: string, lang: Lang): string {
  const map = REFLECT[lang];
  return text
    .trim()
    .replace(/[.!?]+$/, '')
    .split(/\s+/)
    .map((word) => {
      const swap = map[word.toLowerCase()];
      return swap ?? word;
    })
    .join(' ');
}

export interface ElizaAnswer {
  reply: string;
  rule: ElizaRule;
  /** Vorlage, die benutzt wurde. */
  template: string;
  /** Eingefangener Satzrest (vor und nach dem Spiegeln). */
  captured?: string;
  reflected?: string;
}

export interface ElizaState {
  /** Wie oft jede Regel schon geantwortet hat (für wechselnde Vorlagen). */
  used: Record<string, number>;
}

export function newElizaState(): ElizaState {
  return { used: {} };
}

/** Antwort auf eine Eingabe; `state` zählt mit, damit sich Antworten abwechseln. */
export function elizaReply(input: string, lang: Lang, state: ElizaState): ElizaAnswer {
  const text = input.replace(/\s+/g, ' ').trim();
  let best: { rule: ElizaRule; match: RegExpMatchArray } | null = null;
  for (const rule of ELIZA_RULES) {
    const match = text.match(rule.pattern[lang]);
    if (!match) continue;
    if (!best || rule.priority > best.rule.priority) best = { rule, match };
  }
  const { rule, match } = best!;
  const count = state.used[rule.id] ?? 0;
  state.used[rule.id] = count + 1;
  const replies = rule.replies[lang];
  const template = replies[count % replies.length]!;
  if (rule.safety) return { reply: template, rule, template };
  const captured = match[1]?.replace(/[.!?]+$/, '').trim();
  const reflected = captured ? reflect(captured, lang) : undefined;
  const reply = template.replace('{1}', reflected ?? '');
  return { reply, rule, template, captured, reflected };
}
