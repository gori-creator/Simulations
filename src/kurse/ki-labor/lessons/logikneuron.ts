import { L } from '../../../curriculum/helpers';
import type { LessonContent } from '../../types';

const lesson: LessonContent = {
  steps: [
    { kind: 'say', mood: 'happy', text: L('1943 beschrieben der Neurologe Warren McCulloch und der Logiker Walter Pitts eine Nervenzelle als Rechenbaustein: Eingänge mit Gewichten zusammenzählen, mit einer Schwelle vergleichen, 0 oder 1 ausgeben.', 'In 1943 the neurologist Warren McCulloch and the logician Walter Pitts described a nerve cell as a computing unit: add up weighted inputs, compare with a threshold, output 0 or 1.') },
    {
      kind: 'info',
      title: L('Ein Neuron ist eine Gerade', 'A neuron is a line'),
      text: L(
        'Das Neuron feuert genau dann, wenn w₁x₁ + w₂x₂ ≥ θ. Die Grenze w₁x₁ + w₂x₂ = θ ist eine Gerade im Eingaberaum: auf der einen Seite 1, auf der anderen 0. Mit passenden Gewichten wird das Neuron zu einem Logikgatter – Netze solcher Neuronen können jede logische Verknüpfung berechnen.',
        'The neuron fires exactly when w₁x₁ + w₂x₂ ≥ θ. The boundary w₁x₁ + w₂x₂ = θ is a line in input space: 1 on one side, 0 on the other. With suitable weights the neuron becomes a logic gate – networks of such neurons can compute any logical function.',
      ),
      formula: L('y = 1, falls w₁·x₁ + w₂·x₂ ≥ θ, sonst y = 0', 'y = 1 if w₁·x₁ + w₂·x₂ ≥ θ, else y = 0'),
    },
    { kind: 'game', game: 'logik', intro: L('Stell w₁, w₂ und die Schwelle θ so ein, dass das Neuron UND, ODER und NAND berechnet. Danach wartet XOR.', 'Set w₁, w₂ and the threshold θ so the neuron computes AND, OR and NAND. Then XOR is waiting.') },
    {
      kind: 'choice',
      question: L('Warum ist NAND besonders wichtig?', 'Why is NAND especially important?'),
      options: [
        { text: L('Aus NAND-Gattern allein lässt sich jede logische Schaltung bauen – also auch jeder Computer.', 'Any logic circuit – and so any computer – can be built from NAND gates alone.'), correct: true, feedback: L('Genau: NAND ist funktional vollständig.', 'Exactly: NAND is functionally complete.') },
        { text: L('Es ist das einzige Gatter mit negativen Gewichten.', 'It is the only gate with negative weights.'), feedback: L('Negative Gewichte hat es, aber das ist nicht der Grund.', 'It does have negative weights, but that’s not the reason.') },
      ],
    },
    {
      kind: 'choice',
      question: L('Warum schafft ein einzelnes Neuron XOR nicht?', 'Why can’t a single neuron do XOR?'),
      options: [
        { text: L('Die Gewichte reichen nicht bis 2.', 'The weights don’t go up to 2.'), feedback: L('Auch mit beliebigen Gewichten geht es nicht.', 'It doesn’t work with any weights.') },
        { text: L('Die Einsen liegen über Kreuz; keine Gerade trennt sie von den Nullen.', 'The ones sit diagonally opposite; no line separates them from the zeros.'), correct: true, feedback: L('Genau – XOR ist nicht linear trennbar.', 'Exactly – XOR is not linearly separable.') },
        { text: L('Weil XOR in der Logik nicht vorkommt.', 'Because XOR doesn’t exist in logic.'), feedback: L('XOR („entweder … oder“) ist eine ganz normale Verknüpfung.', 'XOR (“either … or”) is a perfectly normal function.') },
      ],
    },
    { kind: 'say', mood: 'wink', text: L('McCulloch und Pitts stellten die Gewichte von Hand ein. 15 Jahre später kam jemand auf die Idee, sie lernen zu lassen.', 'McCulloch and Pitts set the weights by hand. Fifteen years later someone had the idea of letting them be learned.') },
  ],
};

export default lesson;
