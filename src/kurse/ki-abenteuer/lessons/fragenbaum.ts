import { L } from '../../../curriculum/helpers';
import type { LessonContent } from '../../types';

const lesson: LessonContent = {
  takeaway: L('Ein Entscheidungsbaum stellt nacheinander Fragen. Gute Fragen teilen die Beispiele möglichst sauber auf.', 'A decision tree asks questions one after another. Good questions split the examples as cleanly as possible.'),
  steps: [
    { kind: 'say', mood: 'happy', text: L('Kennst du das Spiel „Wer bin ich?“ Man stellt Ja-Nein-Fragen, bis man die Antwort weiß. So kann ich auch entscheiden!', 'Do you know the game “Who am I?” You ask yes/no questions until you know the answer. I can decide like that too!') },
    { kind: 'say', mood: 'think', text: L('Ich habe sieben Tiere. Am Ende soll jeder Ast nur noch Vögel, nur Fische oder nur Säugetiere enthalten. Mit möglichst wenigen Fragen!', 'I have seven animals. In the end, each branch should hold only birds, only fish or only mammals. With as few questions as possible!') },
    { kind: 'game', game: 'fragenbaum', intro: L('Wähle die erste Frage. Wo es noch gemischt ist, stellst du die nächste.', 'Choose the first question. Where it’s still mixed, ask the next one.') },
    {
      kind: 'choice',
      question: L('Was macht eine gute erste Frage aus?', 'What makes a good first question?'),
      options: [
        { text: L('Sie trennt viele Tiere sauber in Gruppen.', 'It splits many animals cleanly into groups.'), correct: true, feedback: L('Genau – „Hat es Federn?“ holt alle Vögel auf einmal heraus.', 'Exactly – “Does it have feathers?” pulls out all the birds at once.') },
        { text: L('Sie ist möglichst lang.', 'It is as long as possible.'), feedback: L('Die Länge der Frage ist egal. Wichtig ist, wie sie teilt.', 'The length doesn’t matter. What matters is how it splits.') },
        { text: L('Alle Tiere beantworten sie gleich.', 'All animals answer it the same way.'), feedback: L('Dann teilt sie gar nichts – die Frage wäre verschwendet.', 'Then it splits nothing – the question would be wasted.') },
      ],
    },
    {
      kind: 'info',
      title: L('Entscheidungsbäume', 'Decision trees'),
      text: L(
        'Was du gebaut hast, heißt Entscheidungsbaum. Eine KI kann so einen Baum selbst aus Beispielen lernen: Sie probiert alle Fragen aus und nimmt die, die am saubersten trennt. Banken und Ärzte nutzen solche Bäume, weil man jede Entscheidung nachvollziehen kann.',
        'What you built is called a decision tree. An AI can learn such a tree from examples by itself: it tries every question and takes the one that splits most cleanly. Banks and doctors use such trees because every decision can be traced.',
      ),
    },
    { kind: 'say', mood: 'wow', text: L('Ein Baum ist praktisch: Du kannst genau sehen, warum ich mich so entschieden habe.', 'A tree is handy: you can see exactly why I decided the way I did.') },
  ],
};

export default lesson;
