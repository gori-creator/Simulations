import { L } from '../../../curriculum/helpers';
import type { ZeitstrahlProps } from '../../gemeinsam/games/zeitstrahl';
import type { LessonContent } from '../../types';

const pipeline: ZeitstrahlProps = {
  scored: true,
  events: [
    { year: 1, icon: '📚', text: L('Vortraining: Nächstes Token vorhersagen, auf riesigen Textmengen', 'Pre-training: predict the next token on huge amounts of text') },
    { year: 2, icon: '✍️', text: L('Feinabstimmung mit Beispielantworten, die Menschen geschrieben haben', 'Fine-tuning with example answers written by people') },
    { year: 3, icon: '⚖️', text: L('Menschen vergleichen Antworten; ein Belohnungsmodell lernt ihre Vorlieben', 'People compare answers; a reward model learns their preferences') },
    { year: 4, icon: '🎯', text: L('Das Sprachmodell wird auf hohe Belohnung optimiert', 'The language model is optimised for high reward') },
  ],
  done: L('Genau in dieser Reihenfolge entstand aus GPT-3 das Modell hinter ChatGPT.', 'In exactly this order the model behind ChatGPT was made from GPT-3.'),
};

const lesson: LessonContent = {
  steps: [
    { kind: 'say', mood: 'happy', text: L('Ein frisch vortrainiertes Sprachmodell setzt Text fort. Fragst du „Wie backe ich Brot?“, schreibt es vielleicht weitere Fragen aus einem Forum. Damit daraus ein hilfreicher Assistent wird, braucht es Menschen.', 'A freshly pre-trained language model continues text. Ask “How do I bake bread?” and it may write more questions from a forum. To turn it into a helpful assistant, you need people.') },
    { kind: 'game', game: 'zeitstrahl', props: pipeline, intro: L('Bring die Schritte vom Rohmodell zum Assistenten in die richtige Reihenfolge (die Zahlen zeigen am Ende die Schrittnummer).', 'Put the steps from raw model to assistant in the right order (the numbers show the step number at the end).') },
    { kind: 'say', mood: 'think', text: L('Jetzt bist du die Person, die Antworten vergleicht. Aus deinen Entscheidungen lernt ein Belohnungsmodell, was „gut“ heißt.', 'Now you are the person comparing answers. From your decisions a reward model learns what “good” means.') },
    { kind: 'game', game: 'rlhf', intro: L('Wähle bei jedem Paar die bessere Antwort – nach deinem eigenen Urteil.', 'For each pair, choose the better answer – by your own judgement.') },
    {
      kind: 'info',
      title: L('Bradley-Terry-Modell', 'Bradley–Terry model'),
      text: L(
        'Das Belohnungsmodell gibt jeder Antwort eine Zahl r. Die Wahrscheinlichkeit, dass Menschen A vorziehen, wird als σ(r(A) − r(B)) angesetzt. Die Gewichte werden so gelernt, dass die beobachteten Vorlieben möglichst wahrscheinlich sind – logistische Regression auf Differenzen. Inzwischen gibt es auch Verfahren, die die Vorlieben direkt ins Sprachmodell trainieren, und solche, bei denen zum Teil KI-Systeme nach festgelegten Grundsätzen bewerten.',
        'The reward model gives every answer a number r. The probability that people prefer A is modelled as σ(r(A) − r(B)). The weights are learned to make the observed preferences as likely as possible – logistic regression on differences. There are now also methods that train the preferences directly into the language model, and ones where AI systems partly do the rating according to set principles.',
      ),
      formula: 'P(A ≻ B) = σ( r(A) − r(B) ),   r(x) = θ · x',
    },
    {
      kind: 'choice',
      question: L('Welche Gefahr zeigte der Bewerter, der lange Antworten mag?', 'What danger did the rater who likes long answers reveal?'),
      options: [
        { text: L('Das Modell lernt, was belohnt wird – auch wenn das nicht das ist, was man eigentlich will.', 'The model learns what is rewarded – even if that isn’t what you actually want.'), correct: true, feedback: L('Genau: Belohnungs-Hacking. Darum sind die Bewertungsregeln und die Auswahl der Bewerter so wichtig.', 'Exactly: reward hacking. That’s why rating guidelines and the choice of raters matter so much.') },
        { text: L('Lange Antworten sind immer falsch.', 'Long answers are always wrong.'), feedback: L('Nein – aber Länge allein ist kein Maß für Qualität.', 'No – but length alone is no measure of quality.') },
        { text: L('Belohnungsmodelle funktionieren grundsätzlich nicht.', 'Reward models fundamentally don’t work.'), feedback: L('Mit guten Bewertungen funktionierten sie bei dir ja.', 'With good ratings they worked for you.') },
      ],
    },
    {
      kind: 'info',
      tone: 'plain',
      title: L('Wessen Werte?', 'Whose values?'),
      text: L(
        'Was ein Assistent für „hilfreich“, „höflich“ oder „angemessen“ hält, haben Menschen festgelegt – über Richtlinien und Bewertungen. Andere Menschen hätten anders entschieden. Darum ist es berechtigt zu fragen, wer diese Regeln schreibt.',
        'What an assistant considers “helpful”, “polite” or “appropriate” was decided by people – through guidelines and ratings. Other people would have decided differently. So it’s fair to ask who writes these rules.',
      ),
    },
    { kind: 'say', mood: 'wink', text: L('Belohnung war hier ein Werkzeug fürs Feintuning. In der nächsten Welt ist sie das Hauptwerkzeug: Agenten, die nur durch Ausprobieren und Belohnung lernen.', 'Here reward was a tool for fine-tuning. In the next world it is the main tool: agents that learn only by trial and reward.') },
  ],
};

export default lesson;
