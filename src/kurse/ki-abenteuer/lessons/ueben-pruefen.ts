import { L } from '../../../curriculum/helpers';
import type { LessonContent } from '../../types';

const lesson: LessonContent = {
  takeaway: L('Ob eine KI etwas kann, zeigt erst die Probe mit neuen Beispielen. Auswendiglernen hilft dort nicht.', 'Whether an AI can do something only shows in a test with new examples. Memorising doesn’t help there.'),
  steps: [
    { kind: 'say', mood: 'happy', text: L('Morgen schreibe ich eine Probe! Ich habe Übungsaufgaben bekommen. Die Probe hat aber neue Aufgaben.', 'Tomorrow I have a test! I got practice questions. But the test has new questions.') },
    {
      kind: 'choice',
      question: L('Wie lernst du am besten für eine Probe mit neuen Aufgaben?', 'What’s the best way to study for a test with new questions?'),
      options: [
        { text: L('Die Lösungen der Übungsaufgaben auswendig lernen.', 'Memorise the answers to the practice questions.'), feedback: L('Das hilft nur, wenn genau dieselben Aufgaben kommen.', 'That only helps if exactly the same questions come up.') },
        { text: L('Verstehen, wie die Aufgaben funktionieren.', 'Understand how the questions work.'), correct: true, feedback: L('Genau! Dann klappt es auch bei neuen Aufgaben.', 'Exactly! Then it works for new questions too.') },
        { text: L('Gar nicht lernen.', 'Not studying at all.'), feedback: L('Mutig … aber nicht klug.', 'Brave … but not smart.') },
      ],
    },
    { kind: 'game', game: 'ueben', intro: L('Stell ein, wie viele Nachbarn ich frage. Schau auf beide Balken: Übung und Probe.', 'Set how many neighbours I ask. Watch both bars: practice and test.') },
    { kind: 'say', mood: 'think', text: L('Mit einem Nachbarn war ich bei den Übungsaufgaben perfekt, in der Probe aber nicht. Ich hatte nur auswendig gelernt!', 'With one neighbour I was perfect on the practice questions, but not in the test. I had only memorised!') },
    {
      kind: 'info',
      title: L('Überanpassung', 'Overfitting'),
      text: L(
        'Wenn eine KI ihre Trainingsdaten zu genau lernt, merkt sie sich auch Zufälle und Fehler darin. Bei neuen Daten wird sie dann schlechter. Das heißt Überanpassung. Darum prüft man jede KI mit Daten, die sie beim Lernen nie gesehen hat.',
        'When an AI learns its training data too exactly, it also memorises coincidences and mistakes in it. With new data it then gets worse. This is called overfitting. That’s why every AI is tested with data it never saw while learning.',
      ),
    },
    {
      kind: 'choice',
      question: L('Womit sollte man eine KI testen?', 'What should you test an AI with?'),
      options: [
        { text: L('Mit denselben Daten, aus denen sie gelernt hat.', 'With the same data it learned from.'), feedback: L('Dann sieht man nur, ob sie auswendig gelernt hat.', 'Then you only see whether it memorised.') },
        { text: L('Mit neuen Daten, die sie noch nie gesehen hat.', 'With new data it has never seen.'), correct: true },
      ],
      explain: L('Wie bei dir in der Schule: Die Probe zeigt, ob du es verstanden hast.', 'Just like you at school: the test shows whether you understood.'),
    },
    { kind: 'say', mood: 'wow', text: L('Bereich 3 geschafft! Ich kann jetzt auf drei Arten lernen. Als Nächstes schauen wir in mein Gehirn – in ein neuronales Netz.', 'Chapter 3 done! I can now learn in three ways. Next we’ll look inside my brain – a neural network.') },
  ],
};

export default lesson;
