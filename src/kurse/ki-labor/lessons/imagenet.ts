import { L } from '../../../curriculum/helpers';
import type { LessonContent } from '../../types';

const lesson: LessonContent = {
  takeaway: L('2012 senkte ein tiefes Faltungsnetz auf Grafikkarten den Fehler im ImageNet-Wettbewerb von rund 26 auf 15 Prozent – der Beginn des Deep-Learning-Booms.', 'In 2012 a deep convolutional network on graphics cards cut the error in the ImageNet challenge from about 26 to 15 per cent – the start of the deep learning boom.'),
  steps: [
    { kind: 'say', mood: 'happy', text: L('Die Informatikerin Fei-Fei Li ließ ab 2007 Millionen Fotos von Menschen beschriften – ImageNet. Für den jährlichen Wettbewerb gab es 1,2 Millionen Trainingsbilder in 1000 Klassen, vom Dalmatiner bis zum Espresso.', 'From 2007 the computer scientist Fei-Fei Li had millions of photos labelled by people – ImageNet. The annual competition had 1.2 million training images in 1000 classes, from Dalmatian to espresso.') },
    {
      kind: 'info',
      title: L('Top-5-Fehler', 'Top-5 error'),
      text: L(
        'Ein Programm darf fünf Vermutungen abgeben. Ist die richtige Klasse nicht dabei, zählt es als Fehler. Bis 2011 nutzten die besten Programme von Hand entworfene Bildmerkmale und kamen auf gut 25 % Fehler.',
        'A program may give five guesses. If the right class is not among them, it counts as an error. Until 2011 the best programs used hand-designed image features and achieved a little over 25% error.',
      ),
    },
    { kind: 'game', game: 'imagenet', intro: L('Schätze, wo die Fehlerquote 2012 und 2015 lag – dann deck auf.', 'Estimate where the error rate was in 2012 and 2015 – then reveal.') },
    {
      kind: 'choice',
      question: L('Was ermöglichte den Sprung 2012 vor allem?', 'What mainly made the 2012 jump possible?'),
      options: [
        { text: L('Viele beschriftete Daten, Grafikkarten zum schnellen Rechnen und ein tiefes Faltungsnetz mit ReLU und Dropout.', 'Lots of labelled data, graphics cards for fast computing and a deep convolutional network with ReLU and dropout.'), correct: true, feedback: L('Genau – Daten, Rechenleistung und Bauart kamen zusammen.', 'Exactly – data, computing power and architecture came together.') },
        { text: L('Eine völlig neue Mathematik.', 'Completely new mathematics.'), feedback: L('Die Bausteine (Faltung, Backpropagation) gab es seit den 1980ern.', 'The building blocks (convolution, backpropagation) had existed since the 1980s.') },
        { text: L('Ein von Hand geschriebenes Regelwerk für Bilder.', 'A hand-written rule book for images.'), feedback: L('Im Gegenteil: Die Merkmale wurden nicht mehr von Hand entworfen, sondern gelernt.', 'On the contrary: features were no longer hand-designed but learned.') },
      ],
    },
    {
      kind: 'info',
      title: L('Warum Grafikkarten?', 'Why graphics cards?'),
      text: L(
        'Netze rechnen vor allem Matrixprodukte: sehr viele einfache Multiplikationen, die gleichzeitig ablaufen können. Grafikkarten sind genau dafür gebaut – für Spiele berechnen sie Millionen Bildpunkte parallel. AlexNet trainierte etwa eine Woche auf zwei Spiele-Grafikkarten. Heute laufen große Modelle auf Zehntausenden Spezialchips.',
        'Networks mostly compute matrix products: huge numbers of simple multiplications that can run at the same time. Graphics cards are built for exactly that – for games they compute millions of pixels in parallel. AlexNet trained for about a week on two gaming graphics cards. Today large models run on tens of thousands of special chips.',
      ),
    },
    {
      kind: 'choice',
      question: L('2015 lag die Fehlerquote unter der geschätzten menschlichen. Heißt das, Computer sehen besser als Menschen?', 'In 2015 the error rate was below the estimated human one. Does that mean computers see better than humans?'),
      options: [
        { text: L('Ja, in jeder Hinsicht.', 'Yes, in every respect.'), feedback: L('Nein – schon kleine Änderungen am Bild können Netze völlig verwirren (nächste Lektion).', 'No – even small changes to the image can completely confuse networks (next lesson).') },
        { text: L('Nur bei genau dieser Aufgabe mit genau diesen Bildern; außerhalb davon oft nicht.', 'Only on exactly this task with exactly these images; outside of that often not.'), correct: true, feedback: L('Genau – ein Prüfstein ist nicht die ganze Welt.', 'Exactly – one benchmark is not the whole world.') },
      ],
    },
    { kind: 'say', mood: 'wink', text: L('Die Mission dieser Welt: Finde heraus, wie leicht man so ein Netz hereinlegen kann.', 'This world’s mission: find out how easily such a network can be fooled.') },
  ],
};

export default lesson;
