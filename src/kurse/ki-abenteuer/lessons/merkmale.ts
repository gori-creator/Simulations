import { L } from '../../../curriculum/helpers';
import type { LessonContent } from '../../types';

const lesson: LessonContent = {
  takeaway: L('Eine KI ist nur so gut wie ihre Merkmale: Federn verraten Vögel, die Farbe eines Fotos nicht.', 'An AI is only as good as its features: feathers give away birds, the colour of a photo doesn’t.'),
  steps: [
    { kind: 'say', mood: 'happy', text: L('Neue Welt, neue Aufgabe! Ich soll Vögel und Säugetiere auseinanderhalten.', 'New world, new task! I have to tell birds and mammals apart.') },
    { kind: 'say', mood: 'think', text: L('Über jedes Tier habe ich ein paar Angaben gespeichert. Solche Angaben heißen Merkmale. Aber welches Merkmal hilft mir wirklich?', 'For every animal I’ve stored a few facts. Facts like these are called features. But which feature really helps me?') },
    { kind: 'game', game: 'merkmale', intro: L('Tipp ein Merkmal an. Ich sortiere dann alle Tiere danach. Finde das beste!', 'Tap a feature. I’ll then sort all the animals by it. Find the best one!') },
    {
      kind: 'choice',
      question: L('Warum hilft „Foto am Wochenende gemacht“ nicht?', 'Why doesn’t “photo taken at the weekend” help?'),
      options: [
        { text: L('Es hat nichts damit zu tun, ob ein Tier ein Vogel ist.', 'It has nothing to do with whether an animal is a bird.'), correct: true, feedback: L('Genau. Solche Merkmale verwirren mich nur.', 'Exactly. Features like that only confuse me.') },
        { text: L('Am Wochenende gibt es weniger Vögel.', 'There are fewer birds at the weekend.'), feedback: L('Den Vögeln ist der Wochentag ziemlich egal!', 'Birds don’t care much what day it is!') },
        { text: L('Es hilft doch – es war fast perfekt.', 'It does help – it was almost perfect.'), feedback: L('Schau nochmal: Nur 6 von 10, kaum besser als Raten.', 'Look again: only 6 of 10, hardly better than guessing.') },
      ],
    },
    {
      kind: 'info',
      title: L('Merkmale', 'Features'),
      text: L(
        'Eine KI bekommt nie „das Tier“, sondern nur Angaben darüber: Zahlen, Farben, Wörter. Gute Merkmale haben wirklich etwas mit der Aufgabe zu tun. Schlechte Merkmale können eine KI sogar in die Irre führen – sie lernt dann Zufälle auswendig.',
        'An AI never gets “the animal”, only facts about it: numbers, colours, words. Good features really have something to do with the task. Bad features can even mislead an AI – it then memorises coincidences.',
      ),
    },
    { kind: 'say', mood: 'wow', text: L('Federn waren perfekt! Mit guten Merkmalen wird Lernen leicht.', 'Feathers were perfect! With good features, learning gets easy.') },
  ],
};

export default lesson;
