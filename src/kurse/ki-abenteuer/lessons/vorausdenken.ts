import { L } from '../../../curriculum/helpers';
import type { LessonContent } from '../../types';

const lesson: LessonContent = {
  steps: [
    { kind: 'say', mood: 'happy', text: L('Lange bevor Computer lernen konnten, haben sie schon Spiele gewonnen. Ihr Trick: Sie probieren im Kopf alle Züge aus – und alle Antworten darauf – und alle Antworten darauf …', 'Long before computers could learn, they were already winning games. Their trick: they try every move in their head – and every reply to it – and every reply to that …') },
    { kind: 'say', mood: 'think', text: L('Unser Spiel: 10 Steine liegen auf dem Tisch. Wer dran ist, nimmt 1, 2 oder 3 Steine. Wer den letzten Stein nimmt, gewinnt!', 'Our game: 10 stones are on the table. Whoever’s turn it is takes 1, 2 or 3 stones. Whoever takes the last stone wins!') },
    {
      kind: 'predict',
      question: L('Kann man gegen einen Computer gewinnen, der alle Möglichkeiten durchrechnet?', 'Can you win against a computer that calculates every possibility?'),
      options: [
        { text: L('Nie, der Computer ist perfekt.', 'Never, the computer is perfect.') },
        { text: L('Ja, wenn man einen Trick kennt.', 'Yes, if you know a trick.') },
        { text: L('Nur mit Glück.', 'Only with luck.') },
      ],
      reveal: L('Spiel und finde es heraus!', 'Play and find out!'),
    },
    { kind: 'game', game: 'nim', intro: L('Du fängst an. In Runde 1 schaue ich nur einen Zug voraus. Danach rechne ich alles durch!', 'You start. In round 1 I only look one move ahead. After that I calculate everything!') },
    {
      kind: 'info',
      tone: 'plain',
      title: L('Was „vorausdenken“ hier heißt', 'What “thinking ahead” means here'),
      text: L('Bit hat nichts gelernt und nichts verstanden. Er hat nur sehr schnell alle möglichen Spielverläufe durchgezählt. Bei 10 Steinen sind das ein paar Hundert. Bei Schach wären es mehr Spielverläufe, als es Atome im Weltall gibt – deshalb brauchen Schachcomputer zusätzlich Regeln, welche Stellungen gut sind.', 'Bit learned nothing and understood nothing. He just counted through every possible game very quickly. With 10 stones that’s a few hundred. In chess there would be more possible games than there are atoms in the universe – that’s why chess computers also need rules for which positions are good.'),
    },
    {
      kind: 'choice',
      question: L('1997 schlug der Computer Deep Blue den Schachweltmeister. Wie hat er das gemacht?', 'In 1997 the computer Deep Blue beat the world chess champion. How did it do it?'),
      options: [
        { text: L('Er hat Schach von selbst gelernt wie ein Kind.', 'It learned chess by itself like a child.'), feedback: L('Das konnten erst viel spätere Programme.', 'Only much later programs could do that.') },
        { text: L('Er hat in jeder Sekunde Millionen Stellungen durchgerechnet.', 'It calculated millions of positions every second.'), correct: true, feedback: L('Genau: rund 200 Millionen pro Sekunde, mit Spezialchips.', 'Exactly: around 200 million per second, with special chips.') },
        { text: L('Er hat geschummelt.', 'It cheated.'), feedback: L('Kasparow war damals misstrauisch – beweisen ließ sich das nie.', 'Kasparov was suspicious at the time – it was never proven.') },
      ],
    },
    {
      kind: 'choice',
      question: L('Was ist der Gewinn-Trick in unserem Steine-Spiel?', 'What is the winning trick in our stone game?'),
      options: [
        { text: L('Immer 3 Steine nehmen.', 'Always take 3 stones.'), feedback: L('Probier es: Dann kann ich dir 4 übrig lassen.', 'Try it: then I can leave you 4.') },
        { text: L('Dem Gegner immer 4 oder 8 Steine übrig lassen.', 'Always leave your opponent 4 or 8 stones.'), correct: true, feedback: L('Genau! Dann kann ich nehmen, was ich will – du gewinnst.', 'Exactly! Then whatever I take – you win.') },
        { text: L('Möglichst lange warten.', 'Wait as long as possible.'), feedback: L('Warten hilft nicht, du musst ja ziehen.', 'Waiting doesn’t help, you have to move.') },
      ],
    },
    { kind: 'say', mood: 'wink', text: L('Regeln und Vorausrechnen – so arbeiteten meine Vorfahren. Ich dagegen lerne aus Daten. Wie das geht, zeige ich dir in der nächsten Welt!', 'Rules and calculating ahead – that’s how my ancestors worked. I, however, learn from data. I’ll show you how in the next world!') },
  ],
};

export default lesson;
