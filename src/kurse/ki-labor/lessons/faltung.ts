import { L } from '../../../curriculum/helpers';
import type { LessonContent } from '../../types';

const lesson: LessonContent = {
  takeaway: L('Eine Faltung schiebt einen kleinen Filter über das Bild. Gelernte Filter finden erst Kanten, dann Formen, dann Objekte.', 'A convolution slides a small filter over the image. Learned filters find edges first, then shapes, then objects.'),
  steps: [
    { kind: 'say', mood: 'happy', text: L('Ein Foto mit 1000 × 1000 Pixeln hat eine Million Eingaben. Würde jedes Neuron mit jedem Pixel verbunden, gäbe es Milliarden Gewichte schon in der ersten Schicht. Die Lösung: kleine Filter, die über das Bild wandern.', 'A photo with 1000 × 1000 pixels has a million inputs. If every neuron were connected to every pixel, there would be billions of weights in the first layer alone. The solution: small filters that slide across the image.') },
    {
      kind: 'info',
      title: L('Faltung', 'Convolution'),
      text: L(
        'Ein 3×3-Filter hat nur 9 Gewichte. Er wird an jede Stelle des Bildes gelegt; dort werden die 9 Pixel mit den 9 Gewichten multipliziert und addiert. Das Ergebnis ist eine Merkmalskarte: Sie zeigt, wo im Bild das Muster des Filters vorkommt. Dieselben 9 Gewichte gelten überall – eine Kante oben links ist dieselbe Kante wie unten rechts.',
        'A 3×3 filter has only 9 weights. It is placed at every position of the image; there the 9 pixels are multiplied by the 9 weights and added up. The result is a feature map: it shows where in the image the filter’s pattern occurs. The same 9 weights apply everywhere – an edge at the top left is the same edge as one at the bottom right.',
      ),
      formula: 'M(x, y) = Σᵢ Σⱼ B(x + i, y + j) · K(i, j),   i, j ∈ {−1, 0, 1}',
    },
    { kind: 'game', game: 'faltung', intro: L('Wähle Bild und Filter, fahre über das Bild und sieh dir die Rechnung an. Dann bau selbst einen Filter für waagerechte Kanten.', 'Choose an image and a filter, hover over the image and look at the calculation. Then build your own filter for horizontal edges.') },
    {
      kind: 'info',
      title: L('Vom Filter zum Netz', 'From filter to network'),
      text: L(
        'In einem Faltungsnetz (CNN) sind die Filterzahlen Gewichte, die per Backpropagation gelernt werden. Die erste Schicht lernt typischerweise Kanten- und Farbfilter – erstaunlich ähnlich den Zellen, die Hubel und Wiesel 1959 in der Sehrinde fanden. Spätere Schichten kombinieren sie zu Ecken, Texturen, Augen, Rädern. Dazwischen verkleinert „Pooling“ die Karten.',
        'In a convolutional network (CNN) the filter numbers are weights learned by backpropagation. The first layer typically learns edge and colour filters – strikingly similar to the cells Hubel and Wiesel found in the visual cortex in 1959. Later layers combine them into corners, textures, eyes, wheels. In between, “pooling” shrinks the maps.',
      ),
    },
    {
      kind: 'choice',
      question: L('Warum ist die Summe der Zahlen in einem Kantenfilter 0?', 'Why do the numbers in an edge filter add up to 0?'),
      options: [
        { text: L('Auf einer gleichmäßigen Fläche heben sich die Beiträge auf – der Filter meldet nur Helligkeitssprünge.', 'On a flat area the contributions cancel – the filter only reports changes in brightness.'), correct: true, feedback: L('Genau.', 'Exactly.') },
        { text: L('Damit das Bild dunkler wird.', 'To make the image darker.'), feedback: L('Es geht nicht ums Abdunkeln, sondern ums Finden von Sprüngen.', 'It’s not about darkening, it’s about finding jumps.') },
        { text: L('Das ist Zufall.', 'That’s a coincidence.'), feedback: L('Kein Zufall – genau das macht ihn zum Kantenfilter.', 'No coincidence – that’s exactly what makes it an edge filter.') },
      ],
    },
    {
      kind: 'choice',
      question: L('Wie viele Gewichte hat eine Faltungsschicht mit 64 Filtern der Größe 3 × 3 auf einem Graustufenbild – unabhängig von der Bildgröße?', 'How many weights does a convolutional layer with 64 filters of size 3 × 3 have on a greyscale image – regardless of the image size?'),
      options: [
        { text: L('576 (plus 64 Verschiebungen)', '576 (plus 64 biases)'), correct: true, feedback: L('Richtig: 64 · 9. Ob das Bild 100 oder 1000 Pixel breit ist, spielt keine Rolle.', 'Right: 64 · 9. Whether the image is 100 or 1000 pixels wide doesn’t matter.') },
        { text: L('64 Millionen', '64 million'), feedback: L('So viele bräuchte eine vollständig verbundene Schicht.', 'That’s what a fully connected layer would need.') },
        { text: L('9', '9'), feedback: L('9 pro Filter – und es sind 64 Filter.', '9 per filter – and there are 64 filters.') },
      ],
    },
    {
      kind: 'calc',
      question: L('Der Kern K = [−1 0 1; −1 0 1; −1 0 1] liegt auf dem Bildausschnitt [0 0 9; 0 0 9; 0 0 9]. Welcher Wert entsteht?', 'The kernel K = [−1 0 1; −1 0 1; −1 0 1] lies on the image patch [0 0 9; 0 0 9; 0 0 9]. Which value results?'),
      answer: 27,
      tolerance: 0.001,
      hint: L('Feld für Feld multiplizieren und alles addieren.', 'Multiply cell by cell and add everything up.'),
      solution: L('Jede Zeile ergibt (−1)·0 + 0·0 + 1·9 = 9, drei Zeilen also 27. Ein großer Wert: Hier ist eine senkrechte Kante von dunkel nach hell.', 'Each row gives (−1)·0 + 0·0 + 1·9 = 9, so three rows give 27. A large value: there is a vertical edge from dark to bright here.'),
    },
    { kind: 'say', mood: 'wink', text: L('Die Idee gab es seit 1989. Doch lange blieben Faltungsnetze eine Nische. Dann kam das Jahr 2012.', 'The idea had existed since 1989. But for a long time convolutional networks remained a niche. Then came 2012.') },
  ],
};

export default lesson;
