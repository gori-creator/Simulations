import { L } from '../../../curriculum/helpers';
import type { LessonContent } from '../../types';

const lesson: LessonContent = {
  takeaway: L('Für den Computer ist ein Bild eine Tabelle aus Zahlen – eine Zahl für jedes Kästchen.', 'To a computer a picture is a table of numbers – one number for each square.'),
  steps: [
    { kind: 'say', mood: 'happy', text: L('Neue Welt! Jetzt verrate ich dir ein Geheimnis: Ich sehe gar keine Bilder. Ich sehe nur Zahlen.', 'New world! Now I’ll tell you a secret: I don’t see pictures at all. I only see numbers.') },
    { kind: 'say', mood: 'think', text: L('Jedes Bild besteht aus winzigen Kästchen, den Pixeln. Für jedes Pixel speichert der Computer eine Zahl.', 'Every picture is made of tiny squares called pixels. For every pixel the computer stores a number.') },
    { kind: 'game', game: 'pixel', intro: L('Ich habe dir ein Bild geschickt – aber nur als Zahlen. Mal es nach! Eine 1 heißt: ausmalen.', 'I sent you a picture – but only as numbers. Paint it! A 1 means: fill it in.') },
    {
      kind: 'choice',
      question: L('Ein Foto vom Handy hat etwa 12 Millionen Pixel. Was sieht eine KI davon?', 'A phone photo has about 12 million pixels. What does an AI see of it?'),
      options: [
        { text: L('Eine sehr lange Liste von Zahlen.', 'A very long list of numbers.'), correct: true, feedback: L('Genau. Und in diesen Zahlen sucht sie nach Mustern.', 'Exactly. And in these numbers it looks for patterns.') },
        { text: L('Das Bild genau so wie du.', 'The picture just like you do.'), feedback: L('Nein – sie bekommt nur Zahlen, keine Bilder.', 'No – it only gets numbers, not pictures.') },
        { text: L('Nur die Farbe Rot.', 'Only the colour red.'), feedback: L('Alle Farben sind dabei – auch als Zahlen.', 'All colours are included – as numbers too.') },
      ],
    },
    {
      kind: 'info',
      title: L('Farben als Zahlen', 'Colours as numbers'),
      text: L(
        'Bei Farbbildern hat jedes Pixel drei Zahlen: wie viel Rot, Grün und Blau darin steckt, jeweils von 0 bis 255. Ein reines Rot ist also (255, 0, 0). Eine Bilder-KI rechnet mit genau diesen Zahlen.',
        'In colour pictures every pixel has three numbers: how much red, green and blue it contains, each from 0 to 255. Pure red is (255, 0, 0). An image AI calculates with exactly these numbers.',
      ),
    },
    { kind: 'say', mood: 'wow', text: L('Wenn Bilder Zahlen sind, kann ich mit ihnen rechnen und vergleichen. Nächstes Mal bringst du mir bei, Zeichen zu erkennen!', 'If pictures are numbers, I can calculate with them and compare them. Next time you’ll teach me to recognise symbols!') },
  ],
};

export default lesson;
