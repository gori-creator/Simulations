import { L } from '../../../curriculum/helpers';
import type { LessonContent } from '../../types';

const lesson: LessonContent = {
  steps: [
    { kind: 'say', mood: 'happy', text: L('Ich habe 24 Früchte gemessen: wie groß und wie süß sie sind. Jede Frucht ist ein Punkt im Bild.', 'I measured 24 fruits: how big and how sweet they are. Each fruit is a dot in the picture.') },
    { kind: 'say', mood: 'think', text: L('Kreise sind Zitronen, Rauten sind Orangen. Zitronen sind eher klein und sauer – sie liegen links unten.', 'Circles are lemons, diamonds are oranges. Lemons tend to be small and sour – they sit at the bottom left.') },
    { kind: 'game', game: 'grenze', intro: L('Zieh die Linie so, dass auf jeder Seite nur eine Sorte liegt. Die Farbe im Hintergrund zeigt, was ich dort raten würde.', 'Move the line so that each side has only one kind. The background colour shows what I would guess there.') },
    {
      kind: 'choice',
      question: L('Eine neue Frucht ist groß und sehr süß. Was sagt Bit mit deiner Linie?', 'A new fruit is big and very sweet. What does Bit say with your line?'),
      options: [
        { text: L('Orange', 'Orange'), correct: true, feedback: L('Richtig – sie liegt oben rechts, auf der Orangen-Seite.', 'Right – it lands at the top right, on the orange side.') },
        { text: L('Zitrone', 'Lemon'), feedback: L('Groß und süß liegt oben rechts. Dort sind die Orangen.', 'Big and sweet is at the top right. That’s where the oranges are.') },
        { text: L('Das kann Bit nicht wissen.', 'Bit can’t know that.'), feedback: L('Doch: Mit der Linie kann ich jede neue Frucht einordnen.', 'Yes I can: with the line I can place any new fruit.') },
      ],
    },
    {
      kind: 'info',
      title: L('Daten als Punkte', 'Data as dots'),
      text: L(
        'Viele KIs machen genau das: Sie stellen Beispiele als Punkte dar und suchen eine Grenze zwischen den Gruppen. Echte KIs nutzen oft hunderte Merkmale statt zwei – das kann man nicht mehr zeichnen, aber die Idee bleibt gleich.',
        'Many AIs do exactly this: they turn examples into dots and look for a border between the groups. Real AIs often use hundreds of features instead of two – you can’t draw that any more, but the idea stays the same.',
      ),
    },
    { kind: 'say', mood: 'wow', text: L('Mit der Grenze kann ich Früchte einordnen, die ich noch nie gesehen habe. Das ist Lernen!', 'With the border I can sort fruit I’ve never seen before. That’s learning!') },
  ],
};

export default lesson;
