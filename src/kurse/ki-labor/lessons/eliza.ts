import { L } from '../../../curriculum/helpers';
import type { ElizaProps } from '../../gemeinsam/games/eliza';
import type { LessonContent } from '../../types';

const chat: ElizaProps = {
  inspect: 'always',
  goalMessages: 5,
  goalRules: 4,
  starters: [
    L('Ich bin ziemlich gestresst.', 'I am pretty stressed.'),
    L('Meine Schwester nervt mich.', 'My sister annoys me.'),
    L('Du bist nur eine Maschine.', 'You are just a machine.'),
    L('Ich fühle mich müde, weil ich zu wenig schlafe.', 'I feel tired because I don’t sleep enough.'),
    L('Was ist die Hauptstadt von Frankreich?', 'What is the capital of France?'),
  ],
  done: L('Du hast gesehen: Jede Antwort kommt aus einer Regel mit Vorlage. Kein Wissen, kein Gedächtnis, kein Verstehen.', 'You’ve seen it: every answer comes from a rule with a template. No knowledge, no memory, no understanding.'),
};

const lesson: LessonContent = {
  steps: [
    { kind: 'say', mood: 'happy', text: L('1966, MIT: Joseph Weizenbaum veröffentlicht ELIZA. Sein bekanntestes Skript, DOCTOR, ahmt eine Psychotherapeutin nach, die Aussagen als Fragen zurückgibt. Hier läuft ein Nachbau mit gut 20 Regeln.', '1966, MIT: Joseph Weizenbaum publishes ELIZA. Its best-known script, DOCTOR, imitates a psychotherapist who turns statements back into questions. Here is a rebuild with about 20 rules.') },
    {
      kind: 'predict',
      question: L('Wie viel braucht ein Chatbot, damit Menschen ihm Verständnis zuschreiben?', 'How much does a chatbot need for people to credit it with understanding?'),
      options: [
        { text: L('Ein Modell mit Milliarden Gewichten', 'A model with billions of weights') },
        { text: L('Ein großes Lexikon mit Weltwissen', 'A big encyclopedia of world knowledge') },
        { text: L('Ein paar Dutzend Regeln reichen oft', 'A few dozen rules are often enough') },
      ],
      reveal: L('Teste es selbst – und schau dabei unter jede Antwort.', 'Test it yourself – and look under every answer.'),
    },
    { kind: 'game', game: 'eliza', props: chat, intro: L('Schreib ELIZA mindestens fünf Nachrichten und bring vier verschiedene Regeln zum Antworten. Unter jeder Antwort steht, was passiert ist.', 'Send ELIZA at least five messages and get four different rules to answer. Under every answer you see what happened.') },
    {
      kind: 'info',
      title: L('Zerlegen und Zusammensetzen', 'Decomposition and reassembly'),
      text: L(
        'Weizenbaum nannte das Prinzip Zerlegungsmuster und Zusammensetzungsregel: Das Muster zerlegt die Eingabe in Teile, die Regel baut aus einem Teil die Antwort. Jedes Schlüsselwort hat einen Rang; passen mehrere, gewinnt der höchste. Vor dem Einsetzen werden Pronomen getauscht.',
        'Weizenbaum called the principle decomposition pattern and reassembly rule: the pattern breaks the input into parts, the rule builds the answer from one part. Every keyword has a rank; if several match, the highest wins. Pronouns are swapped before inserting.',
      ),
      formula: L('* ich bin {X}  ⟶  „Warum bist du {X′}?“   (X′ = X mit ich↔du, mein↔dein)', '* I am {X}  ⟶  “Why are you {X′}?”   (X′ = X with I↔you, my↔your)'),
    },
    {
      kind: 'choice',
      question: L('Eingabe: „Meine Mutter mag meine Musik nicht.“ Welche Regel antwortet in unserem Nachbau?', 'Input: “My mother doesn’t like my music.” Which rule answers in our rebuild?'),
      options: [
        { text: L('„mein …“ (Rang 5)', '“my …” (rank 5)'), feedback: L('Passt auch – aber es gibt ein Schlüsselwort mit höherem Rang.', 'It matches too – but there is a keyword with a higher rank.') },
        { text: L('Familie (Rang 9)', 'family (rank 9)'), correct: true, feedback: L('Richtig: „Mutter“ hat den höheren Rang und gewinnt.', 'Right: “mother” has the higher rank and wins.') },
        { text: L('Keine Regel passt', 'No rule matches'), feedback: L('Gleich zwei Regeln passen hier.', 'Two rules match here.') },
      ],
      explain: L('Probier es ruhig noch einmal im Chat aus: Die Antwort lautet „Erzähl mir mehr über deine Familie.“', 'Feel free to try it in the chat: the answer is “Tell me more about your family.”'),
    },
    {
      kind: 'choice',
      question: L('Wo stößt ELIZA an ihre Grenze?', 'Where does ELIZA hit its limit?'),
      options: [
        { text: L('Bei Sätzen mit „ich bin“', 'With sentences containing “I am”'), feedback: L('Die kann sie besonders gut umdrehen.', 'It’s especially good at turning those around.') },
        { text: L('Bei Fragen, die Wissen oder frühere Sätze brauchen', 'With questions that need knowledge or earlier sentences'), correct: true, feedback: L('Genau: Nach der Hauptstadt von Frankreich gefragt, antwortet sie nur mit einer Floskel wie „Erzähl mir mehr.“', 'Exactly: asked for the capital of France, it only answers with a stock phrase like “Tell me more.”') },
        { text: L('Bei langen Wörtern', 'With long words'), feedback: L('Die Länge spielt keine Rolle.', 'Length doesn’t matter.') },
      ],
    },
    {
      kind: 'info',
      tone: 'plain',
      title: L('Der ELIZA-Effekt', 'The ELIZA effect'),
      text: L(
        'Weizenbaums Sekretärin bat ihn, den Raum zu verlassen, um mit ELIZA allein zu sprechen. Dass Menschen einem Programm Gefühle und Verständnis zuschreiben, heißt seitdem ELIZA-Effekt. Weizenbaum warnte 1976 in seinem Buch „Die Macht der Computer und die Ohnmacht der Vernunft“ davor, Maschinen menschliche Urteile zu überlassen.',
        'Weizenbaum’s secretary asked him to leave the room so she could talk to ELIZA alone. People attributing feelings and understanding to a program has since been called the ELIZA effect. In his 1976 book “Computer Power and Human Reason”, Weizenbaum warned against leaving human judgement to machines.',
      ),
    },
    {
      kind: 'choice',
      question: L('Was unterscheidet ELIZA grundsätzlich von einem heutigen Sprachmodell?', 'What fundamentally distinguishes ELIZA from a modern language model?'),
      options: [
        { text: L('ELIZA folgt von Hand geschriebenen Regeln; ein Sprachmodell berechnet mit gelernten Gewichten Wahrscheinlichkeiten für das nächste Token.', 'ELIZA follows hand-written rules; a language model uses learned weights to compute probabilities for the next token.'), correct: true, feedback: L('Genau. Regeln schreiben gegen aus Daten lernen – der große Wechsel der KI-Geschichte.', 'Exactly. Writing rules versus learning from data – the big shift in AI history.') },
        { text: L('Es gibt keinen Unterschied.', 'There is no difference.'), feedback: L('Ein Sprachmodell hat keine Regelliste – seine Gewichte wurden aus Texten gelernt.', 'A language model has no list of rules – its weights were learned from text.') },
        { text: L('Sprachmodelle haben einfach mehr Wenn-dann-Regeln.', 'Language models simply have more if-then rules.'), feedback: L('Nein, niemand schreibt dort Regeln. Das Verhalten entsteht aus Milliarden gelernter Zahlen.', 'No, nobody writes rules there. The behaviour emerges from billions of learned numbers.') },
      ],
      explain: L('Ob große Sprachmodelle in irgendeinem Sinn „verstehen“, ist umstritten. Nach Searles Argument wäre auch ihr gutes Verhalten noch kein Beweis dafür.', 'Whether large language models “understand” in any sense is disputed. By Searle’s argument even their good behaviour would not prove it.'),
    },
    { kind: 'say', mood: 'wink', text: L('ELIZA hatte kein Wissen. In den 1970ern wollte man genau das ändern: Man schrieb Expertenwissen in Regeln. Das baust du als Nächstes.', 'ELIZA had no knowledge. In the 1970s people wanted to change exactly that: they wrote expert knowledge into rules. That’s what you build next.') },
  ],
};

export default lesson;
