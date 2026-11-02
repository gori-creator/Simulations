import { L } from '../../../curriculum/helpers';
import type { LessonContent } from '../../types';

const lesson: LessonContent = {
  steps: [
    { kind: 'say', mood: 'happy', text: L('Ein Neuron zieht eine Gerade. Zwei Neuronen ziehen zwei Geraden – und ein drittes Neuron kann ihre Ergebnisse verknüpfen. Das ist ein Netz mit einer verborgenen Schicht.', 'One neuron draws one line. Two neurons draw two lines – and a third neuron can combine their outputs. That is a network with one hidden layer.') },
    {
      kind: 'predict',
      question: L('Was tut die verborgene Schicht mit den Eingaben?', 'What does the hidden layer do with the inputs?'),
      options: [
        { text: L('Sie speichert sie.', 'It stores them.') },
        { text: L('Sie rechnet sie in einen neuen Raum um, in dem die Aufgabe leichter ist.', 'It transforms them into a new space where the task is easier.') },
        { text: L('Sie sortiert sie alphabetisch.', 'It sorts them alphabetically.') },
      ],
      reveal: L('Schau es dir in zwei Räumen gleichzeitig an.', 'Look at it in two spaces at once.'),
    },
    { kind: 'game', game: 'xornetz', intro: L('Verschiebe die beiden Geraden mit den Schwellen t₁ und t₂, bis das Netz XOR berechnet. Achte auf den rechten Raum.', 'Move the two lines with the thresholds t₁ and t₂ until the network computes XOR. Watch the space on the right.') },
    {
      kind: 'info',
      title: L('Darstellungen lernen', 'Learning representations'),
      text: L(
        'Im Raum der verborgenen Neuronen (h₁, h₂) fallen (0,1) und (1,0) auf denselben Punkt (1, 0). Dort genügt eine einzige Gerade. Tiefe Netze machen das in vielen Stufen: Jede Schicht rechnet die Daten in eine neue Darstellung um, bis die Aufgabe am Ende fast linear ist. Hier hast du die Gewichte von Hand gesetzt – 1986 zeigten Rumelhart, Hinton und Williams, wie ein Netz sie selbst lernt.',
        'In the space of the hidden neurons (h₁, h₂), (0,1) and (1,0) land on the same point (1, 0). There a single line is enough. Deep networks do this in many stages: every layer transforms the data into a new representation until the task is almost linear at the end. Here you set the weights by hand – in 1986 Rumelhart, Hinton and Williams showed how a network learns them itself.',
      ),
    },
    {
      kind: 'choice',
      question: L('Für die Lernregel brauchte man glatte Aktivierungen statt harter Schwellen. Warum?', 'The learning rule needed smooth activations instead of hard thresholds. Why?'),
      options: [
        { text: L('Eine Treppenfunktion hat fast überall Ableitung 0 – es gäbe keinen Gradienten, der zeigt, wohin man Gewichte schieben soll.', 'A step function has derivative 0 almost everywhere – there would be no gradient showing where to push the weights.'), correct: true, feedback: L('Genau. Darum Sigmoid, tanh oder ReLU.', 'Exactly. Hence sigmoid, tanh or ReLU.') },
        { text: L('Glatte Funktionen sehen schöner aus.', 'Smooth functions look nicer.'), feedback: L('Es geht um die Ableitung, nicht ums Aussehen.', 'It’s about the derivative, not the looks.') },
        { text: L('Schwellen sind zu langsam zu berechnen.', 'Thresholds are too slow to compute.'), feedback: L('Schwellen sind sogar besonders schnell.', 'Thresholds are actually especially fast.') },
      ],
    },
    { kind: 'say', mood: 'wink', text: L('Jetzt das Herzstück: Wie findet man für jedes Gewicht heraus, in welche Richtung es sich ändern soll? Mit der Kettenregel – rückwärts.', 'Now the heart of it: how do you find out, for every weight, which way it should change? With the chain rule – backwards.') },
  ],
};

export default lesson;
