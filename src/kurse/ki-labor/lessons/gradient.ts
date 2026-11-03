import { L } from '../../../curriculum/helpers';
import type { LessonContent } from '../../types';

const lesson: LessonContent = {
  takeaway: L('Gradientenabstieg geht schrittweise gegen den Gradienten. Die Lernrate entscheidet: zu klein ist langsam, zu groß schaukelt sich auf.', 'Gradient descent steps against the gradient. The learning rate decides: too small is slow, too large blows up.'),
  steps: [
    { kind: 'say', mood: 'happy', text: L('Stell dir die MSE als Landschaft vor: Jeder Punkt (m, b) hat eine Höhe – den Fehler. Das Training soll ins tiefste Tal. Aber man sieht nur die Steigung genau dort, wo man steht.', 'Imagine the MSE as a landscape: every point (m, b) has a height – the error. Training should reach the deepest valley. But you can only see the slope exactly where you stand.') },
    {
      kind: 'info',
      title: L('Der Gradient', 'The gradient'),
      text: L(
        'Der Gradient ∇L fasst die partiellen Ableitungen zusammen und zeigt in die Richtung des steilsten Anstiegs. Also geht man ein Stück in die Gegenrichtung. Die Schrittweite heißt Lernrate η. Neuronale Netze machen genau das – nur mit Milliarden Parametern statt zweien.',
        'The gradient ∇L collects the partial derivatives and points in the direction of steepest ascent. So you take a step in the opposite direction. The step size is called the learning rate η. Neural networks do exactly this – just with billions of parameters instead of two.',
      ),
      formula: '(m, b) ← (m, b) − η · ∇L,   ∂L/∂m = (2/n) Σ (m·xᵢ + b − yᵢ) · xᵢ,   ∂L/∂b = (2/n) Σ (m·xᵢ + b − yᵢ)',
    },
    {
      kind: 'predict',
      question: L('Was passiert mit einer sehr großen Lernrate?', 'What happens with a very large learning rate?'),
      options: [
        { text: L('Man ist schneller im Tal.', 'You reach the valley faster.') },
        { text: L('Man springt hin und her und kommt vielleicht nie an.', 'You bounce back and forth and may never arrive.') },
        { text: L('Gar nichts Besonderes.', 'Nothing special.') },
      ],
      reveal: L('Probier alle drei Lernraten aus.', 'Try all three learning rates.'),
    },
    { kind: 'game', game: 'gradient', intro: L('Wähle eine Lernrate und geh bergab. Der rote Pfeil zeigt die Richtung des steilsten Abstiegs, ✕ markiert das Minimum.', 'Choose a learning rate and walk downhill. The red arrow shows the direction of steepest descent, ✕ marks the minimum.') },
    {
      kind: 'info',
      title: L('Warum es bei 0,2 explodiert', 'Why it explodes at 0.2'),
      text: L(
        'Die Krümmung der Landschaft bestimmt, wie groß Schritte sein dürfen. Hier ist die stärkste Krümmung (größter Eigenwert der Hesse-Matrix) etwa λ ≈ 13,7. Ist η > 2/λ ≈ 0,146, wird jeder Schritt in dieser Richtung größer als der vorige. Das schmale, schräge Tal erklärt auch, warum kleine Lernraten so lange brauchen.',
        'The curvature of the landscape determines how large steps may be. Here the strongest curvature (largest eigenvalue of the Hessian) is about λ ≈ 13.7. If η > 2/λ ≈ 0.146, every step in that direction becomes larger than the last. The narrow, slanted valley also explains why small learning rates take so long.',
      ),
    },
    {
      kind: 'choice',
      question: L('Beim Training großer Netze berechnet man den Gradienten oft nur für einen kleinen Teil der Daten (Mini-Batch). Warum?', 'When training large networks, the gradient is often computed on only a small part of the data (mini-batch). Why?'),
      options: [
        { text: L('Ein Schritt mit allen Milliarden Beispielen wäre viel zu teuer; die Schätzung aus wenigen Beispielen zeigt im Mittel in die richtige Richtung.', 'A step with all the billions of examples would be far too expensive; the estimate from a few examples points the right way on average.'), correct: true, feedback: L('Genau – stochastischer Gradientenabstieg.', 'Exactly – stochastic gradient descent.') },
        { text: L('Weil die übrigen Daten falsch sind.', 'Because the rest of the data is wrong.'), feedback: L('Nein, alle Daten kommen nach und nach an die Reihe.', 'No, all data take their turn eventually.') },
        { text: L('Damit das Ergebnis exakt wird.', 'So the result becomes exact.'), feedback: L('Im Gegenteil, es wird verrauscht – aber viel schneller.', 'On the contrary, it becomes noisy – but much faster.') },
      ],
    },
    {
      kind: 'choice',
      question: L('Diese Landschaft hat genau ein Tal. Was kann bei neuronalen Netzen anders sein?', 'This landscape has exactly one valley. What can be different for neural networks?'),
      options: [
        { text: L('Die Landschaft hat viele Täler und Sattelpunkte; man landet nicht sicher im tiefsten.', 'The landscape has many valleys and saddle points; you don’t surely land in the deepest.'), correct: true, feedback: L('Richtig. Erstaunlicherweise sind viele dieser Täler in der Praxis gut genug.', 'Right. Surprisingly, many of these valleys are good enough in practice.') },
        { text: L('Es gibt gar keine Landschaft.', 'There is no landscape at all.'), feedback: L('Doch – nur in Milliarden Dimensionen.', 'There is – just in billions of dimensions.') },
      ],
    },
    {
      kind: 'calc',
      question: L('Verlust L(w) = (w − 3)², Start bei w = 0, Lernrate η = 0,1. Wo steht w nach einem Schritt Gradientenabstieg?', 'Loss L(w) = (w − 3)², start at w = 0, learning rate η = 0.1. Where is w after one step of gradient descent?'),
      answer: 0.6,
      tolerance: 0.001,
      hint: L('L′(w) = 2·(w − 3); dann w ← w − η·L′(w).', 'L′(w) = 2·(w − 3); then w ← w − η·L′(w).'),
      solution: L('L′(0) = 2·(0 − 3) = −6. w ← 0 − 0,1·(−6) = 0,6. Der Schritt geht bergab in Richtung des Minimums bei w = 3.', 'L′(0) = 2·(0 − 3) = −6. w ← 0 − 0.1·(−6) = 0.6. The step goes downhill towards the minimum at w = 3.'),
    },
    { kind: 'say', mood: 'wink', text: L('Ein Modell, das die Trainingsdaten perfekt trifft, klingt toll. Ist es aber oft nicht. Warum, zeigt das nächste Experiment.', 'A model that fits the training data perfectly sounds great. Often it isn’t. The next experiment shows why.') },
  ],
};

export default lesson;
