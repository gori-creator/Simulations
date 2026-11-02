import { L } from '../../../curriculum/helpers';
import type { LessonContent } from '../../types';

const lesson: LessonContent = {
  steps: [
    { kind: 'say', mood: 'happy', text: L('Ein Netz ist eine lange Verkettung von Funktionen. Der Fehler L hängt über viele Zwischenschritte von jedem Gewicht ab. Die Kettenregel aus der Analysis sagt, wie man diese Abhängigkeit ausrechnet.', 'A network is a long chain of functions. The error L depends on every weight through many intermediate steps. The chain rule from calculus says how to compute this dependence.') },
    {
      kind: 'info',
      title: L('Kettenregel', 'Chain rule'),
      text: L(
        'Hängt L von a ab, a von z und z von w, dann gilt ∂L/∂w = ∂L/∂a · ∂a/∂z · ∂z/∂w. Backpropagation rechnet diese Produkte von hinten nach vorne aus und benutzt Zwischenergebnisse mehrfach. So kostet der ganze Gradient etwa so viel wie ein Vorwärtsdurchlauf – egal wie viele Gewichte es gibt.',
        'If L depends on a, a on z and z on w, then ∂L/∂w = ∂L/∂a · ∂a/∂z · ∂z/∂w. Backpropagation computes these products from back to front and reuses intermediate results. So the whole gradient costs about as much as one forward pass – no matter how many weights there are.',
      ),
      formula: '∂L/∂w = ∂L/∂a · ∂a/∂z · ∂z/∂w',
    },
    { kind: 'game', game: 'backprop', intro: L('Rechne erst vorwärts, dann rückwärts. Bei jedem Knoten wählst du die lokale Ableitung – den Rest erledigt die Kettenregel.', 'Compute forward first, then backward. At every node you choose the local derivative – the chain rule does the rest.') },
    {
      kind: 'choice',
      question: L('Ein Netz hat eine Milliarde Gewichte. Wie viele Rückwärtsdurchläufe braucht Backpropagation für den vollständigen Gradienten eines Beispiels?', 'A network has a billion weights. How many backward passes does backpropagation need for the full gradient of one example?'),
      options: [
        { text: L('Einen', 'One'), correct: true, feedback: L('Genau – das macht Training großer Netze überhaupt erst möglich.', 'Exactly – that’s what makes training large networks possible at all.') },
        { text: L('Eine Milliarde', 'A billion'), feedback: L('So viele bräuchte man mit Differenzenquotienten (sogar doppelt so viele).', 'That’s what difference quotients would need (twice as many, even).') },
        { text: L('So viele wie Schichten', 'As many as there are layers'), feedback: L('Ein Durchlauf geht durch alle Schichten.', 'One pass goes through all layers.') },
      ],
    },
    {
      kind: 'info',
      title: L('Verschwindende Gradienten', 'Vanishing gradients'),
      text: L(
        'Die Sigmoid-Ableitung a·(1 − a) ist höchstens 0,25. Bei zehn Schichten wird der Gradient vorne also mit bis zu 0,25¹⁰ ≈ 0,000001 multipliziert – die vorderen Schichten lernen kaum. Ein Grund, warum tiefe Netze lange als untrainierbar galten. Abhilfe: ReLU (Ableitung 1 für positive Werte), bessere Startgewichte, Abkürzungsverbindungen.',
        'The sigmoid derivative a·(1 − a) is at most 0.25. With ten layers the gradient at the front is multiplied by up to 0.25¹⁰ ≈ 0.000001 – the early layers barely learn. One reason deep networks were long considered untrainable. Remedies: ReLU (derivative 1 for positive values), better initial weights, shortcut connections.',
      ),
    },
    { kind: 'say', mood: 'wink', text: L('Jetzt hast du alle Teile: Neuronen, Schichten, Verlust, Gradient, Backpropagation. Zeit für die Mission dieser Welt – echte Netze trainieren.', 'Now you have all the parts: neurons, layers, loss, gradient, backpropagation. Time for this world’s mission – training real networks.') },
  ],
};

export default lesson;
