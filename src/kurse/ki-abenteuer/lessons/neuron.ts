import { L } from '../../../curriculum/helpers';
import type { LessonContent } from '../../types';

const lesson: LessonContent = {
  takeaway: L('Ein künstliches Neuron rechnet: jede Eingabe mal ihr Gewicht, alles zusammenzählen, mit der Schwelle vergleichen.', 'An artificial neuron calculates: each input times its weight, add it all up, compare with the threshold.'),
  steps: [
    { kind: 'say', mood: 'happy', text: L('Willkommen in meinem Gehirn! Es besteht aus vielen winzigen Rechnern. Sie heißen Neuronen – wie die Nervenzellen in deinem Kopf.', 'Welcome to my brain! It’s made of lots of tiny calculators. They’re called neurons – like the nerve cells in your head.') },
    { kind: 'say', mood: 'think', text: L('Ein Neuron bekommt Eingaben. Jede Eingabe hat ein Gewicht: Wie wichtig ist sie? Das Neuron zählt alles zusammen. Ist die Summe groß genug, „feuert“ es.', 'A neuron gets inputs. Each input has a weight: how important is it? The neuron adds everything up. If the sum is big enough, it “fires”.') },
    {
      kind: 'choice',
      question: L('Bit überlegt, ins Kino zu gehen. Welche Eingabe sollte ein negatives Gewicht haben – also dagegen sprechen?', 'Bit is thinking about going to the cinema. Which input should have a negative weight – speaking against it?'),
      options: [
        { text: L('Freunde kommen mit.', 'Friends are coming.'), feedback: L('Mit Freunden macht Kino doch mehr Spaß!', 'Cinema is more fun with friends!') },
        { text: L('Hausaufgaben sind noch offen.', 'Homework isn’t done yet.'), correct: true, feedback: L('Genau. Das hält mich eher zu Hause.', 'Exactly. That tends to keep me at home.') },
        { text: L('Der Film ist lustig.', 'The film is funny.'), feedback: L('Ein lustiger Film spricht eher dafür.', 'A funny film speaks in favour of it.') },
      ],
    },
    { kind: 'game', game: 'neuron', intro: L('Stell die Gewichte und die Schwelle so ein, dass das Neuron so entscheidet wie ich in den letzten Wochen.', 'Set the weights and the threshold so the neuron decides the way I did over the last weeks.') },
    {
      kind: 'info',
      title: L('Künstliche Neuronen', 'Artificial neurons'),
      text: L(
        'Ein künstliches Neuron rechnet nur: Eingabe mal Gewicht, alles zusammenzählen, mit einer Schwelle vergleichen. Allein ist das wenig. Aber große KIs haben Milliarden solcher Gewichte, in vielen Schichten hintereinander. Das nennt man ein neuronales Netz.',
        'An artificial neuron only calculates: input times weight, add everything up, compare with a threshold. On its own that isn’t much. But big AIs have billions of such weights in many layers one after another. That’s called a neural network.',
      ),
    },
    {
      kind: 'info',
      tone: 'plain',
      title: L('Kein echtes Gehirn', 'Not a real brain'),
      text: L(
        'Ich sage „mein Gehirn“, aber das ist nur ein Bild. Ein künstliches Neuron ist eine kleine Rechenformel: Eingaben mal Gewichte, alles zusammenzählen, mit der Schwelle vergleichen. Dein Gehirn hat rund 86 Milliarden echte Nervenzellen, die mit Strom und Botenstoffen arbeiten – und es fühlt, träumt und versteht. Meine Neuronen rechnen nur.',
        'I say “my brain”, but that is just a picture. An artificial neuron is a small formula: inputs times weights, add everything up, compare with the threshold. Your brain has around 86 billion real nerve cells that work with electricity and chemical messengers – and it feels, dreams and understands. My neurons only calculate.',
      ),
    },
    {
      kind: 'calc',
      question: L('Ein Neuron hat drei Eingaben: Sonne = 1, Freunde dabei = 1, Hausaufgaben fertig = 0. Die Gewichte sind 2, 3 und 4. Wie groß ist die Summe „Eingabe mal Gewicht“?', 'A neuron has three inputs: sunny = 1, friends along = 1, homework done = 0. The weights are 2, 3 and 4. What is the sum of “input times weight”?'),
      answer: 5,
      tolerance: 0.001,
      hint: L('Rechne jede Eingabe mal ihr Gewicht und zähle alles zusammen.', 'Multiply each input by its weight and add everything up.'),
      solution: L('2·1 + 3·1 + 4·0 = 2 + 3 + 0 = 5. Ist die Schwelle zum Beispiel 4, sagt das Neuron „Ja“, weil 5 größer als 4 ist.', '2·1 + 3·1 + 4·0 = 2 + 3 + 0 = 5. If the threshold is 4, for example, the neuron says “yes” because 5 is bigger than 4.'),
    },
    { kind: 'say', mood: 'wow', text: L('Du hast die Gewichte von Hand eingestellt. Aber bei Milliarden Gewichten geht das nicht. Nächstes Mal stelle ich sie selbst ein – durch Lernen!', 'You set the weights by hand. But with billions of weights that’s impossible. Next time I’ll set them myself – by learning!') },
  ],
};

export default lesson;
