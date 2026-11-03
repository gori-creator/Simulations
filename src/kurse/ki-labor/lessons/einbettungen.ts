import { L } from '../../../curriculum/helpers';
import type { LessonContent } from '../../types';

const lesson: LessonContent = {
  takeaway: L('Wortvektoren legen ähnliche Wörter nah zusammen, Richtungen tragen Bedeutung (König − Mann + Frau ≈ Königin).', 'Word vectors place similar words close together, and directions carry meaning (king − man + woman ≈ queen).'),
  steps: [
    { kind: 'say', mood: 'happy', text: L('Ein Wort ist ein Punkt in einem Raum mit vielen Richtungen. Wörter, die in ähnlichen Zusammenhängen vorkommen, liegen nah beieinander. „Du sollst ein Wort an seiner Gesellschaft erkennen“, schrieb der Sprachforscher John Firth schon 1957.', 'A word is a point in a space with many directions. Words that occur in similar contexts lie close together. “You shall know a word by the company it keeps,” the linguist John Firth wrote back in 1957.') },
    {
      kind: 'info',
      title: L('Kosinus-Ähnlichkeit', 'Cosine similarity'),
      text: L(
        'Wie ähnlich zwei Wortvektoren sind, misst man mit dem Winkel zwischen ihnen: cos = 1 heißt gleiche Richtung, 0 heißt rechtwinklig (nichts gemeinsam). Hier haben die Vektoren sechs benannte Richtungen, damit du sie lesen kannst. Echte Modelle lernen Hunderte bis Tausende Richtungen – ohne Namen.',
        'How similar two word vectors are is measured by the angle between them: cos = 1 means the same direction, 0 means perpendicular (nothing in common). Here the vectors have six named directions so you can read them. Real models learn hundreds to thousands of directions – without names.',
      ),
      formula: 'cos(a, b) = (a · b) / (|a| · |b|)',
    },
    { kind: 'game', game: 'vektoren', intro: L('Wähle die Achsen der Karte und rechne mit Wörtern: A − B + C. Die nächsten Wörter zum Ergebnis stehen darunter.', 'Choose the axes of the map and calculate with words: A − B + C. The words nearest to the result appear below.') },
    {
      kind: 'choice',
      question: L('a = (1, 0), b = (1, 1). Wie groß ist cos(a, b)?', 'a = (1, 0), b = (1, 1). What is cos(a, b)?'),
      options: [
        { text: L('1/√2 ≈ 0,71', '1/√2 ≈ 0.71'), correct: true, feedback: L('Richtig: a·b = 1, |a| = 1, |b| = √2 – der Winkel ist 45°.', 'Right: a·b = 1, |a| = 1, |b| = √2 – the angle is 45°.') },
        { text: L('1', '1'), feedback: L('Dann müssten sie in dieselbe Richtung zeigen.', 'Then they would have to point the same way.') },
        { text: L('0', '0'), feedback: L('Dann stünden sie senkrecht aufeinander.', 'Then they would be perpendicular.') },
      ],
    },
    {
      kind: 'info',
      tone: 'plain',
      title: L('Einbettungen lernen auch Vorurteile', 'Embeddings also learn prejudices'),
      text: L(
        'Wortvektoren werden aus echten Texten gelernt – mit allem, was darin steckt. 2016 zeigten Forschende um Tolga Bolukbasi, dass word2vec-Vektoren Analogien wie „Mann : Programmierer = Frau : Hausfrau“ enthielten. Das Modell hat kein Weltbild; es spiegelt die Häufigkeiten in seinen Daten.',
        'Word vectors are learned from real text – with everything in it. In 2016 researchers around Tolga Bolukbasi showed that word2vec vectors contained analogies like “man : computer programmer = woman : homemaker”. The model has no worldview; it mirrors the frequencies in its data.',
      ),
    },
    {
      kind: 'calc',
      question: L('Zwei Wortvektoren: a = (1; 2) und b = (2; 1). Wie groß ist ihre Kosinus-Ähnlichkeit?', 'Two word vectors: a = (1; 2) and b = (2; 1). What is their cosine similarity?'),
      answer: 0.8,
      tolerance: 0.005,
      hint: L('cos = (a·b) / (|a|·|b|).', 'cos = (a·b) / (|a|·|b|).'),
      solution: L('a·b = 1·2 + 2·1 = 4, |a| = |b| = √5. cos = 4 / 5 = 0,8: ziemlich ähnliche Richtungen.', 'a·b = 1·2 + 2·1 = 4, |a| = |b| = √5. cos = 4 / 5 = 0.8: fairly similar directions.'),
    },
    { kind: 'say', mood: 'wink', text: L('Mit Tokens und Vektoren kann ein Modell Text lesen. Aber wie schreibt es? Ein Wort nach dem anderen – nach Wahrscheinlichkeit.', 'With tokens and vectors a model can read text. But how does it write? One word after another – by probability.') },
  ],
};

export default lesson;
