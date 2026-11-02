import { L } from '../../../curriculum/helpers';
import type { LessonContent } from '../../types';

const lesson: LessonContent = {
  takeaway: L('Eine KI erkennt Zeichen, die ihren Übungsbeispielen ähneln. Ganz anders Gezeichnetes erkennt sie oft nicht.', 'An AI recognises characters that look like its practice examples. It often fails on something drawn very differently.'),
  steps: [
    { kind: 'say', mood: 'happy', text: L('Heute lerne ich drei Zeichen: Kreuz, Kreis und Strich. Du bist meine Zeichenlehrerin oder mein Zeichenlehrer!', 'Today I’ll learn three symbols: cross, circle and line. You’re my drawing teacher!') },
    { kind: 'say', mood: 'think', text: L('Mein Plan: Ich vergleiche eine neue Zeichnung Kästchen für Kästchen mit deinen Beispielen. Das Beispiel mit den wenigsten Unterschieden gewinnt.', 'My plan: I compare a new drawing square by square with your examples. The example with the fewest differences wins.') },
    { kind: 'game', game: 'zeichen', intro: L('Mal jedes Zeichen mindestens einmal und speichere es. Wenn dir das Malen zu lange dauert, nimm eine Vorlage. Dann starte meine Probe!', 'Draw each symbol at least once and save it. If drawing takes too long, use a template. Then start my test!') },
    {
      kind: 'choice',
      question: L('Bit hat nur ordentliche, gerade Zeichnungen gesehen. Was passiert bei einer sehr schiefen Zeichnung?', 'Bit has only seen neat, straight drawings. What happens with a very wonky drawing?'),
      options: [
        { text: L('Er erkennt sie vielleicht nicht – sie ist zu anders als die Beispiele.', 'He might not recognise it – it’s too different from the examples.'), correct: true, feedback: L('Genau. Darum brauche ich auch schiefe Beispiele.', 'Exactly. That’s why I need wonky examples too.') },
        { text: L('Er erkennt sie immer, er ist ja eine KI.', 'He always recognises it, he’s an AI after all.'), feedback: L('Leider nicht. Ich kenne nur, was ich gelernt habe.', 'Sadly not. I only know what I’ve learned.') },
      ],
    },
    {
      kind: 'info',
      title: L('Echte Bilderkennung', 'Real image recognition'),
      text: L(
        'Echte KIs erkennen Ziffern, Gesichter oder Tiere mit neuronalen Netzen. Sie lernen aus Millionen Bildern – und finden selbst heraus, auf welche Kästchenmuster es ankommt: Kanten, Rundungen, Ecken.',
        'Real AIs recognise digits, faces or animals with neural networks. They learn from millions of pictures – and work out by themselves which pixel patterns matter: edges, curves, corners.',
      ),
    },
    { kind: 'say', mood: 'wow', text: L('Ich kann jetzt Zeichen lesen! Als Nächstes schreibe ich selbst – Wort für Wort, wie ein Chatbot.', 'I can read symbols now! Next I’ll write myself – word by word, like a chatbot.') },
  ],
};

export default lesson;
