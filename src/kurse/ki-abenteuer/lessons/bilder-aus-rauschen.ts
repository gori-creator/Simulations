import { L } from '../../../curriculum/helpers';
import type { LessonContent } from '../../types';

const lesson: LessonContent = {
  steps: [
    { kind: 'say', mood: 'happy', text: L('Bildgeneratoren malen Bilder aus einer Beschreibung – zum Beispiel „ein Haus im Schnee“. Aber sie malen nicht mit einem Pinsel. Sie fangen mit Kriselkram an, wie bei einem Fernseher ohne Empfang.', 'Image generators paint pictures from a description – for example “a house in the snow”. But they don’t paint with a brush. They start with fuzz, like a TV without reception.') },
    {
      kind: 'predict',
      question: L('Wie wird aus Kriselkram ein Bild?', 'How does fuzz become a picture?'),
      options: [
        { text: L('Auf einmal, mit einem Zauberspruch.', 'All at once, with a magic spell.') },
        { text: L('Schritt für Schritt wird das Rauschen weggeräumt.', 'Step by step the noise is cleaned away.') },
        { text: L('Es wird ein fertiges Foto aus dem Internet geholt.', 'A finished photo is fetched from the internet.') },
      ],
      reveal: L('Probier es mit mir aus!', 'Try it with me!'),
    },
    { kind: 'game', game: 'rauschen', intro: L('Erst machst du ein Bild kaputt. Dann räumen wir zusammen Kriselkram auf – zweimal.', 'First you break a picture. Then we clean up fuzz together – twice.') },
    {
      kind: 'info',
      tone: 'plain',
      title: L('Woher kennt der Generator Häuser?', 'How does the generator know houses?'),
      text: L('Er hat beim Training Millionen Bilder mit Beschreibungen gesehen und gelernt, wie man Rauschen aus ihnen entfernt. Ich kenne nur vier kleine Bilder – darum male ich immer eines davon. Große Generatoren mischen das Gelernte zu neuen Bildern. Wem die Bilder gehören, mit denen sie trainiert wurden, ist ein großer Streit.', 'During training it saw millions of pictures with descriptions and learned how to remove noise from them. I only know four little pictures – that’s why I always paint one of them. Big generators mix what they learned into new pictures. Who owns the pictures they were trained on is a big dispute.'),
    },
    {
      kind: 'choice',
      question: L('Darf man mit einem Bildgenerator ein Foto von einer echten Person aus deiner Klasse fälschen?', 'May you use an image generator to fake a photo of a real person from your class?'),
      options: [
        { text: L('Nein – das kann die Person verletzen und ist oft sogar verboten.', 'No – it can hurt the person and is often even illegal.'), correct: true, feedback: L('Genau. Gefälschte Bilder von echten Menschen können Mobbing sein. Wenn dir so etwas passiert: Hol dir Hilfe bei Erwachsenen, denen du vertraust.', 'Exactly. Fake pictures of real people can be bullying. If it happens to you: get help from adults you trust.') },
        { text: L('Ja, ist ja nur Spaß.', 'Yes, it’s only a joke.'), feedback: L('Für die Person ist es oft gar kein Spaß.', 'For the person it’s often no joke at all.') },
      ],
    },
    { kind: 'say', mood: 'wink', text: L('Weil Bilder so echt aussehen können, ist die nächste Frage wichtig: Wie erkennst du, ob ein Bild echt ist?', 'Because pictures can look so real, the next question is important: how can you tell whether a picture is real?') },
  ],
};

export default lesson;
