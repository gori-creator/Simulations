import { L } from '../../../curriculum/helpers';
import type { LessonContent } from '../../types';

const lesson: LessonContent = {
  takeaway: L('Mehr Parameter senken den Trainingsfehler, aber nicht unbedingt den Testfehler. Kreuzvalidierung findet das passende Maß.', 'More parameters lower the training error, but not necessarily the test error. Cross-validation finds the right complexity.'),
  steps: [
    { kind: 'say', mood: 'happy', text: L('Je beweglicher ein Modell ist, desto besser kann es die Trainingsdaten treffen. Ein Polynom vom Grad 9 hat 10 Parameter – genug, um durch 10 Punkte exakt hindurchzugehen.', 'The more flexible a model, the better it can fit the training data. A degree-9 polynomial has 10 parameters – enough to pass exactly through 10 points.') },
    {
      kind: 'predict',
      question: L('Welcher Grad sagt neue Messwerte (die Ringe) am besten voraus?', 'Which degree predicts new measurements (the rings) best?'),
      options: [
        { text: L('Grad 1 – einfach ist besser', 'Degree 1 – simple is better') },
        { text: L('Ein mittlerer Grad', 'A medium degree') },
        { text: L('Grad 9 – der trifft ja alles', 'Degree 9 – it hits everything') },
      ],
      reveal: L('Probier alle Grade aus und vergleiche Trainings- und Testfehler.', 'Try every degree and compare training and test error.'),
    },
    { kind: 'game', game: 'polyfit', intro: L('Wähle den Grad. Gefüllte Punkte sind Trainingsdaten, Ringe sind Testdaten, die das Modell nie gesehen hat.', 'Choose the degree. Filled points are training data, rings are test data the model has never seen.') },
    {
      kind: 'info',
      title: L('Verzerrung und Varianz', 'Bias and variance'),
      text: L(
        'Ein zu starres Modell (kleiner Grad) liegt systematisch daneben: hohe Verzerrung (Bias), Unteranpassung. Ein zu bewegliches Modell lernt das Rauschen der Trainingsdaten mit: hohe Varianz, Überanpassung. Der Testfehler ist eine U-Kurve; der Trainingsfehler sinkt immer weiter. Gegenmittel: mehr Daten, einfachere Modelle, Regularisierung (Strafterm für große Koeffizienten) und ehrliches Testen mit getrennten Daten.',
        'A model that is too rigid (low degree) is systematically off: high bias, underfitting. A model that is too flexible also learns the noise of the training data: high variance, overfitting. The test error is a U-curve; the training error keeps falling. Remedies: more data, simpler models, regularisation (a penalty for large coefficients) and honest testing with separate data.',
      ),
      formula: L('Testfehler ≈ Bias² + Varianz + Rauschen', 'test error ≈ bias² + variance + noise'),
    },
    {
      kind: 'choice',
      question: L('Ein Modell hat 0 % Fehler auf den Trainingsdaten. Was weißt du über seine Qualität?', 'A model has 0% error on the training data. What do you know about its quality?'),
      options: [
        { text: L('Es ist perfekt.', 'It is perfect.'), feedback: L('Grad 9 hatte Trainingsfehler 0 – und war im Test am schlechtesten.', 'Degree 9 had training error 0 – and was worst on the test.') },
        { text: L('Fast nichts – entscheidend ist der Fehler auf Daten, die es nicht kannte.', 'Almost nothing – what matters is the error on data it didn’t know.'), correct: true, feedback: L('Genau. Darum hält man Testdaten streng getrennt.', 'Exactly. That’s why test data are kept strictly separate.') },
        { text: L('Es hat sicher zu wenige Parameter.', 'It certainly has too few parameters.'), feedback: L('Eher im Gegenteil.', 'Rather the opposite.') },
      ],
    },
    {
      kind: 'choice',
      question: L('Große Sprachmodelle haben Milliarden Parameter. Warum überangepassen sie nicht einfach?', 'Large language models have billions of parameters. Why don’t they simply overfit?'),
      options: [
        { text: L('Sie werden mit riesigen Datenmengen trainiert, regularisiert und mit getrennten Daten geprüft – ganz frei davon sind sie aber nicht: Manchmal geben sie Trainingstexte wörtlich wieder.', 'They are trained on huge amounts of data, regularised and checked with separate data – but they aren’t completely free of it: sometimes they reproduce training text word for word.'), correct: true, feedback: L('Genau. Das Auswendiglernen von Trainingsdaten ist ein echtes Thema, auch für Datenschutz und Urheberrecht.', 'Exactly. Memorising training data is a real issue, also for privacy and copyright.') },
        { text: L('Weil Parameter keine Rolle spielen.', 'Because parameters don’t matter.'), feedback: L('Doch – aber die Datenmenge wächst mit.', 'They do – but the amount of data grows too.') },
      ],
    },
    { kind: 'say', mood: 'wink', text: L('Bisher haben wir Zahlen vorhergesagt. Jetzt sortieren wir: Spam oder nicht? Und zwar mit Wahrscheinlichkeiten – und einem Pfarrer aus dem 18. Jahrhundert.', 'So far we predicted numbers. Now we classify: spam or not? With probabilities – and an 18th-century clergyman.') },
  ],
};

export default lesson;
