import { L } from '../../../curriculum/helpers';
import type { LessonContent } from '../../types';

const lesson: LessonContent = {
  steps: [
    { kind: 'say', mood: 'happy', text: L('Willkommen auf dem Netz-Spielplatz! Hier trainiert ein echtes neuronales Netz direkt in deinem Browser – mit allem, was du in dieser Welt gelernt hast.', 'Welcome to the network playground! Here a real neural network trains right in your browser – with everything you learned in this world.') },
    {
      kind: 'info',
      title: L('Was du einstellen kannst', 'What you can set'),
      text: L(
        'Verborgene Schichten und Neuronen bestimmen, wie beweglich die Grenze werden kann. Die Aktivierung (tanh, ReLU, Sigmoid) bestimmt die Form der Bausteine. Die Lernrate bestimmt die Schrittweite. Eine Epoche heißt: alle 200 Trainingspunkte einmal gesehen. Gemessen wird an 100 Testpunkten (Ringe), die nie zum Training benutzt werden.',
        'Hidden layers and neurons determine how flexible the boundary can become. The activation (tanh, ReLU, sigmoid) determines the shape of the building blocks. The learning rate determines the step size. One epoch means: all 200 training points seen once. Performance is measured on 100 test points (rings) that are never used for training.',
      ),
    },
    {
      kind: 'predict',
      question: L('Wie viele verborgene Neuronen braucht ein Netz mindestens, um den Kreis zu lernen?', 'How many hidden neurons does a network need at least to learn the circle?'),
      options: [
        { text: L('1', '1') },
        { text: L('3', '3') },
        { text: L('8', '8') },
      ],
      reveal: L('Ein Neuron zieht nur eine Gerade. Für eine geschlossene Grenze braucht es mindestens drei (ein Dreieck). Probier es aus!', 'One neuron draws only one line. A closed boundary needs at least three (a triangle). Try it!'),
    },
    { kind: 'game', game: 'spielplatz', intro: L('Wähle Daten und Netz, dann ▶ Trainieren. Das Wärmebild zeigt, was das Netz an jeder Stelle vorhersagt.', 'Choose data and network, then ▶ Train. The heat map shows what the network predicts everywhere.') },
    {
      kind: 'info',
      title: L('Universelle Approximation', 'Universal approximation'),
      text: L(
        '1989 bewies George Cybenko: Ein Netz mit einer einzigen verborgenen Schicht kann jede stetige Funktion beliebig genau annähern – wenn es genug Neuronen hat. Der Satz sagt aber nicht, wie viele es sind und ob das Training sie findet. In der Praxis sind tiefe Netze oft viel sparsamer als breite.',
        'In 1989 George Cybenko proved: a network with a single hidden layer can approximate any continuous function arbitrarily well – given enough neurons. But the theorem doesn’t say how many, nor whether training will find them. In practice deep networks are often far more economical than wide ones.',
      ),
    },
    {
      kind: 'choice',
      question: L('Du trainierst die Spirale lange; der Trainingsverlust sinkt weiter, die Testgenauigkeit fällt aber wieder. Was passiert?', 'You train the spiral for a long time; the training loss keeps falling, but the test accuracy drops again. What is happening?'),
      options: [
        { text: L('Überanpassung: Das Netz lernt Eigenheiten der Trainingspunkte auswendig.', 'Overfitting: the network memorises quirks of the training points.'), correct: true, feedback: L('Genau – darum hört man oft früh auf (early stopping), wenn der Testfehler steigt.', 'Exactly – that’s why one often stops early (early stopping) when the test error rises.') },
        { text: L('Die Lernrate ist zu klein.', 'The learning rate is too small.'), feedback: L('Dann würde der Trainingsverlust nicht so schön sinken.', 'Then the training loss wouldn’t fall so nicely.') },
        { text: L('Die Testdaten sind falsch.', 'The test data are wrong.'), feedback: L('Die Testdaten sind in Ordnung – sie zeigen ehrlich, wie gut das Netz verallgemeinert.', 'The test data are fine – they honestly show how well the network generalises.') },
      ],
    },
    { kind: 'say', mood: 'wink', text: L('Mit diesen Bausteinen eroberten Netze ab 2012 das Sehen. Wie ein Netz Bilder anschaut, zeigt die nächste Welt.', 'With these building blocks, networks conquered vision from 2012 onwards. The next world shows how a network looks at images.') },
  ],
};

export default lesson;
