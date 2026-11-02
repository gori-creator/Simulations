import { L } from '../../../curriculum/helpers';
import type { LessonContent } from '../../types';

const lesson: LessonContent = {
  steps: [
    { kind: 'say', mood: 'happy', text: L('Irgendwo im Labyrinth liegt ein Keks 🍪. Und eine Pfütze 💧, in die ich nicht fallen will. Ich kenne den Weg nicht. Niemand zeigt ihn mir.', 'Somewhere in the maze there’s a cookie 🍪. And a puddle 💧 I don’t want to fall into. I don’t know the way. Nobody shows it to me.') },
    { kind: 'say', mood: 'think', text: L('Also laufe ich los und probiere. Wenn ich den Keks finde, merke ich mir: Der letzte Schritt war gut. Und der davor auch ein bisschen. Und der davor …', 'So I set off and try. When I find the cookie I remember: the last step was good. And the one before it a little too. And the one before that …') },
    { kind: 'game', game: 'labyrinth', intro: L('Lass mich Runde um Runde laufen. Die Pfeile zeigen meine Spur: wohin es sich zu gehen lohnt.', 'Let me run round after round. The arrows show my trail: where it’s worth going.') },
    {
      kind: 'info',
      tone: 'plain',
      title: L('Was Bit sich wirklich merkt', 'What Bit really remembers'),
      text: L('Ich speichere für jedes Feld und jede Richtung eine Zahl: Wie viel Belohnung kommt noch, wenn ich hier so gehe? Nach jedem Schritt passe ich die Zahl ein wenig an. Mit der Zeit zeigen die größten Zahlen den Weg zum Keks. Das nennt man Q-Lernen.', 'For every square and every direction I store a number: how much reward is still to come if I go this way here? After every step I adjust the number a little. Over time the biggest numbers show the way to the cookie. This is called Q-learning.'),
    },
    {
      kind: 'choice',
      question: L('Warum hat Bit am Anfang so viele Schritte gebraucht?', 'Why did Bit need so many steps at the start?'),
      options: [
        { text: L('Er kannte den Weg nicht und musste erst ausprobieren.', 'He didn’t know the way and had to try things first.'), correct: true, feedback: L('Genau – Lernen durch Belohnung braucht viele Versuche.', 'Exactly – learning from rewards needs lots of tries.') },
        { text: L('Er war müde.', 'He was tired.'), feedback: L('Programme werden nicht müde.', 'Programs don’t get tired.') },
        { text: L('Das Labyrinth hat sich verändert.', 'The maze changed.'), feedback: L('Nein, es blieb immer gleich.', 'No, it always stayed the same.') },
      ],
    },
    { kind: 'say', mood: 'wink', text: L('So hat auch das Programm AlphaGo gelernt – nur mit Millionen Partien Go statt einem kleinen Labyrinth. Jetzt die Mission: Spiel gegen mich!', 'That’s also how the program AlphaGo learned – just with millions of games of Go instead of a little maze. Now the mission: play against me!') },
  ],
};

export default lesson;
