import { L } from '../../../curriculum/helpers';
import type { LessonContent } from '../../types';

const lesson: LessonContent = {
  steps: [
    { kind: 'say', mood: 'happy', text: L('Letzter Bereich! Ich arbeite jetzt in einem Schuhgeschäft und soll erkennen, ob etwas ein Schuh ist.', 'Last chapter! I now work in a shoe shop and have to recognise whether something is a shoe.') },
    { kind: 'say', mood: 'think', text: L('Beim Training hat man mir allerdings nur Turnschuhe gezeigt. Mal sehen, wie ich mich in der Prüfung schlage …', 'During training, though, I was only shown sneakers. Let’s see how I do in the exam …') },
    { kind: 'game', game: 'fair', intro: L('Schau dir meine Prüfung an. Wo liege ich falsch? Zeig mir passende Beispiele, bis ich alle Gruppen richtig erkenne.', 'Look at my exam. Where am I wrong? Show me fitting examples until I get every group right.') },
    {
      kind: 'choice',
      question: L('Warum hat Bit die Sandalen anfangs nicht erkannt?', 'Why didn’t Bit recognise the sandals at first?'),
      options: [
        { text: L('Sandalen sind keine richtigen Schuhe.', 'Sandals aren’t real shoes.'), feedback: L('Doch, sind sie! Mir fehlten nur die Beispiele.', 'Yes, they are! I was just missing examples.') },
        { text: L('In seinen Trainingsdaten kamen keine Sandalen vor.', 'There were no sandals in his training data.'), correct: true, feedback: L('Genau. Was ich nie gesehen habe, kenne ich nicht.', 'Exactly. What I’ve never seen, I don’t know.') },
        { text: L('Bit mag keine Sandalen.', 'Bit doesn’t like sandals.'), feedback: L('Ich habe keinen Geschmack – nur Daten.', 'I have no taste – only data.') },
      ],
    },
    {
      kind: 'info',
      title: L('Wenn KI unfair wird', 'When AI becomes unfair'),
      text: L(
        'Bei Schuhen ist das harmlos. Aber es gab Gesichtserkennungen, die bei Menschen mit dunkler Haut viel öfter falschlagen – weil sie fast nur mit Fotos hellhäutiger Menschen trainiert wurden. Fehlt eine Gruppe in den Daten, behandelt die KI sie schlechter. Darum müssen Trainingsdaten alle Menschen fair abbilden.',
        'With shoes that’s harmless. But there have been face recognition systems that were wrong much more often for people with dark skin – because they were trained almost only with photos of light-skinned people. If a group is missing from the data, the AI treats it worse. That’s why training data must represent everyone fairly.',
      ),
    },
    {
      kind: 'choice',
      question: L('Was hilft am besten gegen solche Fehler?', 'What helps most against such mistakes?'),
      options: [
        { text: L('Vielfältige Trainingsdaten, in denen alle Gruppen vorkommen.', 'Varied training data that includes every group.'), correct: true },
        { text: L('Noch mehr Beispiele von der Gruppe, die schon gut erkannt wird.', 'Even more examples of the group that’s already recognised well.'), feedback: L('Mehr Turnschuhe haben mir bei Sandalen nicht geholfen, oder?', 'More sneakers didn’t help me with sandals, did they?') },
        { text: L('Der KI einfach vertrauen.', 'Just trust the AI.'), feedback: L('Besser nicht – man muss prüfen, ob sie für alle gut funktioniert.', 'Better not – you have to check that it works well for everyone.') },
      ],
    },
    { kind: 'say', mood: 'wow', text: L('Eine KI ist nur so fair wie ihre Daten. Das merke ich mir!', 'An AI is only as fair as its data. I’ll remember that!') },
  ],
};

export default lesson;
