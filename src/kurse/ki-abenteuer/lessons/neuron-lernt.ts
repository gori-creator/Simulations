import { L } from '../../../curriculum/helpers';
import type { LessonContent } from '../../types';

const lesson: LessonContent = {
  takeaway: L('Lernen heißt hier: Nach jedem Fehler werden die Gewichte ein kleines Stück verstellt.', 'Learning here means: after every mistake the weights are adjusted a little.'),
  steps: [
    { kind: 'say', mood: 'happy', text: L('Erinnerst du dich an die Zitronen und Orangen? Diesmal ziehst du die Linie nicht selbst. Mein Neuron lernt sie!', 'Remember the lemons and oranges? This time you don’t draw the line. My neuron learns it!') },
    { kind: 'say', mood: 'think', text: L('Mein Trick: Ich schaue mir eine Frucht an, die ich falsch einordne. Dann verändere ich meine Gewichte ein kleines bisschen, damit es bei ihr besser passt. Und dann die nächste.', 'My trick: I look at a fruit I place wrongly. Then I change my weights a tiny bit so that it fits better for that one. And then the next one.') },
    { kind: 'game', game: 'perzeptron', intro: L('Drück „Ein Lernschritt“ und schau, wie sich meine Linie dreht. Oder lass mich mit „Bis fertig“ allein üben.', 'Press “One learning step” and watch my line turn. Or let me practise on my own with “Until done”.') },
    {
      kind: 'choice',
      question: L('Woraus hat das Neuron gelernt?', 'What did the neuron learn from?'),
      options: [
        { text: L('Aus seinen Fehlern – Schritt für Schritt.', 'From its mistakes – step by step.'), correct: true, feedback: L('Genau! Jeder Fehler hat die Linie ein Stück verbessert.', 'Exactly! Every mistake improved the line a little.') },
        { text: L('Jemand hat ihm die richtige Linie verraten.', 'Someone told it the correct line.'), feedback: L('Nein, die Linie hat niemand vorgegeben.', 'No, nobody gave it the line.') },
        { text: L('Es hat zufällig geraten, bis es passte.', 'It guessed randomly until it fitted.'), feedback: L('Nicht zufällig: Jede Änderung ging in die Richtung, die den Fehler kleiner macht.', 'Not randomly: every change went in the direction that makes the mistake smaller.') },
      ],
    },
    {
      kind: 'info',
      title: L('Training', 'Training'),
      text: L(
        'So trainiert man neuronale Netze: Beispiel zeigen, Fehler messen, Gewichte ein wenig anpassen – und das millionenfach. Große Sprach-KIs werden wochenlang auf tausenden Computern trainiert.',
        'This is how neural networks are trained: show an example, measure the mistake, adjust the weights a little – millions of times. Big language AIs are trained for weeks on thousands of computers.',
      ),
    },
    { kind: 'say', mood: 'wow', text: L('Lernen heißt für mich: Gewichte verändern, bis die Fehler verschwinden. Aber wie groß soll so ein Schritt sein? Das finden wir als Nächstes heraus.', 'For me, learning means changing weights until the mistakes disappear. But how big should such a step be? We’ll find out next.') },
  ],
};

export default lesson;
