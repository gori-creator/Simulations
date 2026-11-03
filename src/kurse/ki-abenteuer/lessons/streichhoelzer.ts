import { L } from '../../../curriculum/helpers';
import type { LessonContent } from '../../types';

const lesson: LessonContent = {
  takeaway: L('Schon Streichholzschachteln mit Perlen können ein Spiel lernen: Gute Züge bekommen mehr Perlen, schlechte weniger.', 'Even matchboxes with beads can learn a game: good moves get more beads, bad ones fewer.'),
  steps: [
    { kind: 'say', mood: 'happy', text: L('1961 baute der Forscher Donald Michie eine lernende Maschine – ganz ohne Computer! Sie bestand aus 304 Streichholzschachteln voller bunter Perlen.', 'In 1961 the researcher Donald Michie built a learning machine – without any computer! It was made of 304 matchboxes full of coloured beads.') },
    { kind: 'say', mood: 'think', text: L('Ich mache es genauso. Unser Spiel: 9 Hölzer, jeder nimmt 1 oder 2, wer das letzte nimmt, gewinnt. Für jede Zahl von Hölzern habe ich eine Schachtel. Ich ziehe blind eine Perle: 🔵 heißt „1 nehmen“, 🔴 heißt „2 nehmen“.', 'I do it the same way. Our game: 9 sticks, each takes 1 or 2, whoever takes the last one wins. For every number of sticks I have a box. I draw a bead without looking: 🔵 means “take 1”, 🔴 means “take 2”.') },
    {
      kind: 'predict',
      question: L('Am Anfang ziehe ich völlig zufällig. Was passiert, wenn wir oft spielen?', 'At first I draw completely at random. What happens if we play often?'),
      options: [
        { text: L('Bit bleibt zufällig', 'Bit stays random') },
        { text: L('Bit wird besser', 'Bit gets better') },
        { text: L('Bit wird schlechter', 'Bit gets worse') },
      ],
      reveal: L('Nach jedem Sieg lege ich Perlen dazu, nach jeder Niederlage nehme ich welche weg. Schau, was passiert!', 'After every win I add beads, after every loss I take some away. Watch what happens!'),
    },
    { kind: 'game', game: 'streichhoelzer', intro: L('Du fängst an. Spiel mindestens 5-mal gegen mich – und lass mich zwischendurch allein üben.', 'You start. Play against me at least 5 times – and let me practise alone in between.') },
    {
      kind: 'info',
      tone: 'plain',
      title: L('Lernen ohne Nachdenken', 'Learning without thinking'),
      text: L('Die Schachteln denken nicht. Sie verändern nur, wie viele Perlen von jeder Farbe drin sind. Gute Züge werden wahrscheinlicher, schlechte seltener. Genau das passiert beim Lernen durch Belohnung – im Computer sind die Perlen einfach Zahlen.', 'The boxes don’t think. They only change how many beads of each colour are inside. Good moves become more likely, bad ones rarer. That’s exactly what happens in learning from rewards – in a computer the beads are just numbers.'),
    },
    {
      kind: 'choice',
      question: L('Was ist bei dieser Lernart die „Belohnung“?', 'What is the “reward” in this kind of learning?'),
      options: [
        { text: L('Ob Bit am Ende gewinnt oder verliert.', 'Whether Bit wins or loses in the end.'), correct: true, feedback: L('Genau. Niemand sagt mir, welcher einzelne Zug richtig war – nur das Ergebnis zählt.', 'Exactly. Nobody tells me which single move was right – only the result counts.') },
        { text: L('Ein echter Keks für Bit.', 'A real cookie for Bit.'), feedback: L('Schön wär’s! Die Belohnung ist hier nur eine Zahl: Sieg oder Niederlage.', 'If only! Here the reward is just a number: win or loss.') },
      ],
    },
    {
      kind: 'calc',
      question: L('In einer Schachtel liegen 3 rote Perlen („nimm 1“) und 1 blaue Perle („nimm 2“). Bit zieht blind eine Perle. Mit wie viel Prozent nimmt er 2 Hölzer?', 'A box holds 3 red beads (“take 1”) and 1 blue bead (“take 2”). Bit draws a bead without looking. With what percentage does he take 2 sticks?'),
      answer: 25,
      tolerance: 0.5, unit: '%',
      hint: L('Wie viele Perlen sind es insgesamt, wie viele davon blau?', 'How many beads are there in total, and how many are blue?'),
      solution: L('1 von 4 Perlen ist blau: 1 : 4 = 25 %. Gewinnt Bit mit diesem Zug, kommt eine blaue Perle dazu – dann sind es 2 von 5 = 40 %. So lernt die Schachtel.', '1 of 4 beads is blue: 1 ÷ 4 = 25%. If Bit wins with this move, a blue bead is added – then it is 2 of 5 = 40%. That is how the box learns.'),
    },
    { kind: 'say', mood: 'wow', text: L('Geschafft! Jetzt kenne ich alle drei Arten zu lernen: mit Etiketten, ohne Etiketten und durch Belohnung.', 'Done! Now I know all three ways of learning: with labels, without labels and from rewards.') },
  ],
};

export default lesson;
