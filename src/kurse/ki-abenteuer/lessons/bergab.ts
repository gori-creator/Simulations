import { L } from '../../../curriculum/helpers';
import type { LessonContent } from '../../types';

const lesson: LessonContent = {
  takeaway: L('Training ist wie Bergabgehen im Nebel: immer ein Schritt dahin, wo der Fehler kleiner wird. Zu große Schritte schießen übers Ziel hinaus.', 'Training is like walking downhill in fog: always a step towards a smaller error. Steps that are too big overshoot.'),
  steps: [
    { kind: 'say', mood: 'think', text: L('Stell dir vor, du stehst nachts im Nebel auf einem Berg. Du willst ins Tal, siehst aber nichts. Was machst du?', 'Imagine standing on a mountain at night in fog. You want to get down to the valley, but you can’t see anything. What do you do?') },
    {
      kind: 'choice',
      question: L('Wie findest du im Nebel ins Tal?', 'How do you find the valley in the fog?'),
      options: [
        { text: L('Ich spüre mit den Füßen, wo es bergab geht, und gehe in diese Richtung.', 'I feel with my feet which way is downhill and go that way.'), correct: true, feedback: L('Genau so mache ich es beim Lernen auch!', 'That’s exactly how I do it when learning!') },
        { text: L('Ich laufe irgendwohin.', 'I walk anywhere.'), feedback: L('Dann landest du vielleicht wieder oben.', 'Then you might end up back at the top.') },
        { text: L('Ich bleibe stehen.', 'I stay where I am.'), feedback: L('Dann kommst du nie an.', 'Then you’ll never get there.') },
      ],
    },
    { kind: 'say', mood: 'happy', text: L('Beim Lernen ist der Berg mein Fehler. Unten im Tal ist der Fehler am kleinsten. Ich spüre nur, wie steil es an meiner Stelle ist – und mache einen Schritt bergab.', 'When I learn, the mountain is my error. Down in the valley the error is smallest. I can only feel how steep it is where I stand – and take a step downhill.') },
    { kind: 'game', game: 'bergab', intro: L('Wähle die Schrittweite und lass mich Schritt für Schritt gehen. Schaffst du beide Täler in höchstens 10 Schritten?', 'Choose the step size and let me walk step by step. Can you manage both valleys in 10 steps or fewer?') },
    {
      kind: 'info',
      title: L('Gradientenabstieg', 'Gradient descent'),
      text: L(
        'Fachleute nennen das Gradientenabstieg. Die Schrittweite heißt Lernrate. Ist sie zu klein, lernt die KI sehr langsam. Ist sie zu groß, springt sie über das Ziel hinaus – oder fliegt ganz davon. Die richtige Lernrate zu finden, gehört zur Arbeit von KI-Fachleuten.',
        'Experts call this gradient descent. The step size is called the learning rate. If it’s too small, the AI learns very slowly. If it’s too big, it jumps past the goal – or flies off completely. Finding the right learning rate is part of the job of AI experts.',
      ),
    },
    { kind: 'say', mood: 'wow', text: L('Du weißt jetzt, wie ein Neuron lernt: Schritt für Schritt bergab. Aber was schaffen viele Neuronen zusammen? Das probieren wir als Nächstes aus.', 'You now know how a neuron learns: step by step downhill. But what can many neurons do together? That’s what we try next.') },
  ],
};

export default lesson;
