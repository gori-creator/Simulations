import { L } from '../../../curriculum/helpers';
import type { LessonContent } from '../../types';

const lesson: LessonContent = {
  takeaway: L('Die Perzeptron-Regel verschiebt die Trenngerade bei jedem Fehler. Sind die Daten linear trennbar, endet sie nach endlich vielen Schritten.', 'The perceptron rule shifts the separating line after every mistake. If the data are linearly separable, it stops after finitely many steps.'),
  steps: [
    { kind: 'say', mood: 'happy', text: L('1958 stellte Frank Rosenblatt das Perzeptron vor – eine Maschine mit 400 Lichtsensoren und von Motoren verstellten Widerständen als Gewichten. Neu war: Die Gewichte stellten sich durch Fehler selbst ein.', 'In 1958 Frank Rosenblatt presented the perceptron – a machine with 400 light sensors and motor-driven resistors as weights. What was new: the weights adjusted themselves through errors.') },
    {
      kind: 'info',
      title: L('Die Lernregel', 'The learning rule'),
      text: L(
        'Klassen sind c = +1 oder −1. Liegt ein Punkt x auf der falschen Seite, addiert man ihn (mit Vorzeichen c) zum Gewichtsvektor: w ← w + η·c·x, ebenso b ← b + η·c. Geometrisch dreht sich die Gerade zum Punkt hin. Liegt alles richtig, ändert sich nichts mehr.',
        'Classes are c = +1 or −1. If a point x is on the wrong side, you add it (with sign c) to the weight vector: w ← w + η·c·x, likewise b ← b + η·c. Geometrically the line turns towards the point. When everything is right, nothing changes any more.',
      ),
      formula: L('ŷ = sign(w · x + b),   bei Fehler:  w ← w + η·c·x,   b ← b + η·c', 'ŷ = sign(w · x + b),   on error:  w ← w + η·c·x,   b ← b + η·c'),
    },
    {
      kind: 'predict',
      question: L('Was passiert, wenn es keine Gerade gibt, die beide Gruppen trennt?', 'What happens if there is no line that separates the two groups?'),
      options: [
        { text: L('Die Regel findet die beste mögliche Gerade.', 'The rule finds the best possible line.') },
        { text: L('Die Regel hört nie auf zu korrigieren.', 'The rule never stops correcting.') },
        { text: L('Der Computer stürzt ab.', 'The computer crashes.') },
      ],
      reveal: L('Probier es aus – erst mit trennbaren Daten, dann mit einem Ausreißer.', 'Try it – first with separable data, then with an outlier.'),
    },
    { kind: 'game', game: 'perzeptron', intro: L('Korrigiere Fehler einzeln oder lass ganze Epochen laufen. Der rote Pfeil ist der Gewichtsvektor – er steht senkrecht auf der Geraden.', 'Fix mistakes one at a time or run whole epochs. The red arrow is the weight vector – it is perpendicular to the line.') },
    {
      kind: 'info',
      title: L('Hebb und Rosenblatt', 'Hebb and Rosenblatt'),
      text: L(
        'Schon 1949 vermutete der Psychologe Donald Hebb, dass Verbindungen zwischen Nervenzellen stärker werden, wenn sie gemeinsam aktiv sind. Rosenblatts Regel ist strenger: Sie ändert Gewichte nur bei Fehlern. Sein Konvergenzsatz garantiert für linear trennbare Daten, dass nach endlich vielen Korrekturen alles stimmt.',
        'As early as 1949 the psychologist Donald Hebb suggested that connections between nerve cells grow stronger when they are active together. Rosenblatt’s rule is stricter: it changes weights only after mistakes. His convergence theorem guarantees for linearly separable data that everything is right after finitely many corrections.',
      ),
    },
    {
      kind: 'choice',
      question: L('Ein Punkt der Klasse +1 bei x = (2, 3) liegt falsch, η = 0,1. Wie ändern sich w₁ und w₂?', 'A point of class +1 at x = (2, 3) is misclassified, η = 0.1. How do w₁ and w₂ change?'),
      options: [
        { text: L('w₁ + 0,2 und w₂ + 0,3', 'w₁ + 0.2 and w₂ + 0.3'), correct: true, feedback: L('Richtig: η·c·x = 0,1 · 1 · (2, 3).', 'Right: η·c·x = 0.1 · 1 · (2, 3).') },
        { text: L('w₁ − 0,2 und w₂ − 0,3', 'w₁ − 0.2 and w₂ − 0.3'), feedback: L('Das wäre bei Klasse −1.', 'That would be for class −1.') },
        { text: L('Beide + 0,1', 'Both + 0.1'), feedback: L('Der Punkt selbst (2, 3) bestimmt die Änderung.', 'The point (2, 3) itself determines the change.') },
      ],
    },
    { kind: 'say', mood: 'think', text: L('Die Presse war begeistert: Die Navy erwarte bald eine Maschine, die laufen, sprechen und sehen könne. Doch eine kleine Logikaufgabe aus der letzten Lektion sollte das ganze Feld einfrieren …', 'The press was thrilled: the Navy expected a machine that could soon walk, talk and see. But a little logic problem from the last lesson was about to freeze the whole field …') },
  ],
};

export default lesson;
