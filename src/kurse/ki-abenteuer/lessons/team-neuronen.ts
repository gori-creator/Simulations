import { L } from '../../../curriculum/helpers';
import type { LessonContent } from '../../types';

const lesson: LessonContent = {
  takeaway: L('Ein Neuron zieht nur eine gerade Grenze. Mehrere Neuronen zusammen können sogar eine Insel einzäunen.', 'One neuron draws only one straight boundary. Several neurons together can even fence in an island.'),
  steps: [
    { kind: 'say', mood: 'happy', text: L('Weißt du noch? Ein Neuron rechnet Eingaben mal Gewichte und vergleicht mit einer Schwelle. Auf einer Karte heißt das: Es zieht eine gerade Linie. Auf der einen Seite sagt es „ja“, auf der anderen „nein“.', 'Remember? A neuron multiplies inputs by weights and compares with a threshold. On a map that means: it draws a straight line. On one side it says “yes”, on the other “no”.') },
    { kind: 'say', mood: 'think', text: L('Mein Problem: Die Schafe stehen in der Mitte der Wiese, die Wölfe ringsherum. Ich soll einen Zaun bauen, der nur Schafe einschließt.', 'My problem: the sheep stand in the middle of the meadow, the wolves all around. I have to build a fence that only encloses sheep.') },
    {
      kind: 'predict',
      question: L('Schafft ein einziges Neuron (ein gerader Zaun) das?', 'Can a single neuron (one straight fence) do it?'),
      options: [
        { text: L('Ja', 'Yes') },
        { text: L('Nein', 'No') },
      ],
      reveal: L('Probier erst einen Zaun – dann drei.', 'Try one fence first – then three.'),
    },
    { kind: 'game', game: 'zaun', intro: L('Zieh an den Griffen. Erst mit einem Neuron, dann mit drei. Ein Schaf ist nur sicher, wenn alle Zäune es schützen.', 'Drag the handles. First with one neuron, then with three. A sheep is only safe if every fence protects it.') },
    {
      kind: 'info',
      tone: 'plain',
      title: L('Ein Netz aus Neuronen', 'A network of neurons'),
      text: L('Drei Neuronen ziehen drei gerade Linien. Ein viertes Neuron schaut auf die drei und sagt nur „Schaf“, wenn alle drei „ja“ sagen. So entsteht ein Dreieck – eine Form, die ein Neuron allein nie zeichnen könnte. Echte Netze haben viele solcher Schichten mit Millionen Neuronen.', 'Three neurons draw three straight lines. A fourth neuron looks at the three and only says “sheep” if all three say “yes”. That makes a triangle – a shape a single neuron could never draw. Real networks have many such layers with millions of neurons.'),
    },
    {
      kind: 'choice',
      question: L('Warum haben große KIs so viele Neuronen?', 'Why do big AIs have so many neurons?'),
      options: [
        { text: L('Viele Neuronen zusammen können sehr verwickelte Grenzen ziehen – etwa zwischen Katzen- und Hundefotos.', 'Many neurons together can draw very complicated boundaries – for example between cat and dog photos.'), correct: true, feedback: L('Genau! Je schwieriger die Aufgabe, desto mehr Neuronen helfen.', 'Exactly! The harder the task, the more neurons help.') },
        { text: L('Damit sie schwerer sind.', 'So they are heavier.'), feedback: L('Neuronen sind nur Zahlen im Computer – sie wiegen nichts.', 'Neurons are just numbers in a computer – they weigh nothing.') },
        { text: L('Weil jedes Neuron ein Wort speichert.', 'Because every neuron stores one word.'), feedback: L('So einfach ist es nicht. Wissen ist über viele Gewichte verteilt.', 'It’s not that simple. Knowledge is spread over many weights.') },
      ],
    },
    { kind: 'say', mood: 'wink', text: L('1986 fanden Forschende heraus, wie so ein Netz seine vielen Gewichte selbst einstellen kann – mit dem Bergab-Lernen, das du schon kennst. In der nächsten Welt siehst du, was solche Netze mit Bildern und Wörtern machen.', 'In 1986 researchers found out how such a network can set its many weights itself – with the downhill learning you already know. In the next world you’ll see what such networks do with pictures and words.') },
  ],
};

export default lesson;
