import { L } from '../../../curriculum/helpers';
import type { LessonContent } from '../../types';

const lesson: LessonContent = {
  steps: [
    { kind: 'say', mood: 'happy', text: L('Heute lerne ich wie eine echte KI: aus Beispielen. Mein Ziel: Äpfel und Birnen unterscheiden.', 'Today I’ll learn like a real AI: from examples. My goal: telling apples from pears.') },
    { kind: 'say', mood: 'think', text: L('Ich achte auf zwei Dinge: die Farbe und die Form. Bei einer neuen Frucht suche ich das ähnlichste Beispiel, das ich kenne.', 'I pay attention to two things: colour and shape. For a new fruit I look for the most similar example I know.') },
    { kind: 'game', game: 'beispiele', intro: L('Zeig mir ein Beispiel nach dem anderen. Nach jedem mache ich eine Probe mit sechs neuen Früchten.', 'Show me one example after another. After each one I’ll take a test with six new fruits.') },
    { kind: 'say', mood: 'think', text: L('Hast du es bemerkt? Wenn ich nur rote Äpfel kenne, halte ich einen grünen Apfel schnell für eine Birne.', 'Did you notice? If I only know red apples, I easily take a green apple for a pear.') },
    {
      kind: 'choice',
      question: L('Was hilft Bit am meisten beim Lernen?', 'What helps Bit most when learning?'),
      options: [
        { text: L('Zehnmal derselbe rote Apfel.', 'The same red apple ten times.'), feedback: L('Dann kenne ich rote Äpfel super – aber grüne immer noch nicht.', 'Then I know red apples really well – but still not green ones.') },
        { text: L('Viele verschiedene Beispiele: rot, gelb, grün, rund und länglich.', 'Many different examples: red, yellow, green, round and long.'), correct: true, feedback: L('Genau! Vielfalt macht mich schlauer.', 'Exactly! Variety makes me smarter.') },
        { text: L('Gar keine Beispiele, ich rate einfach.', 'No examples, I’ll just guess.'), feedback: L('Raten klappt nur zur Hälfte. Ich brauche Beispiele.', 'Guessing only works half the time. I need examples.') },
      ],
    },
    {
      kind: 'info',
      title: L('Trainingsdaten', 'Training data'),
      text: L(
        'Die Beispiele, aus denen eine KI lernt, heißen Trainingsdaten. Bei dir waren es sechs Früchte. Große KIs lernen aus Millionen Bildern oder Texten. Damit sie danach gut sind, müssen die Beispiele vielfältig und richtig beschriftet sein.',
        'The examples an AI learns from are called training data. In your case they were six fruits. Big AIs learn from millions of pictures or texts. To be good afterwards, the examples must be varied and correctly labelled.',
      ),
    },
    { kind: 'say', mood: 'wow', text: L('Bereich 1 geschafft! Du weißt jetzt: KI lernt aus Beispielen. Als Nächstes schauen wir uns diese Beispiele – die Daten – genauer an.', 'Chapter 1 complete! You now know: AI learns from examples. Next we’ll take a closer look at those examples – the data.') },
  ],
};

export default lesson;
