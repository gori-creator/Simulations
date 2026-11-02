import { L } from '../../../curriculum/helpers';
import type { LessonContent } from '../../types';

const lesson: LessonContent = {
  steps: [
    { kind: 'say', mood: 'think', text: L('2013 entdeckten Forschende etwas Beunruhigendes: Man kann ein Bild so minimal verändern, dass ein Mensch keinen Unterschied sieht – und das Netz trotzdem etwas völlig anderes erkennt.', 'In 2013 researchers discovered something unsettling: you can change an image so slightly that a person sees no difference – and the network still recognises something completely different.') },
    {
      kind: 'predict',
      question: L('Wie viele Pixel muss man in einem 8 × 8-Bild ändern, damit aus „Kreis“ „Kreuz“ wird?', 'How many pixels do you have to change in an 8 × 8 image to turn “circle” into “cross”?'),
      options: [
        { text: L('Mindestens die Hälfte', 'At least half') },
        { text: L('Etwa 10', 'About 10') },
        { text: L('Nur ganz wenige', 'Just a very few') },
      ],
      reveal: L('Versuch es selbst.', 'Try it yourself.'),
    },
    { kind: 'game', game: 'taeuschung', intro: L('Ein trainiertes Modell erkennt hier sicher einen Kreis. Bring es mit möglichst wenigen Änderungen dazu, „Kreuz“ zu sagen.', 'A trained model is sure this is a circle. Get it to say “cross” with as few changes as possible.') },
    {
      kind: 'info',
      title: L('Warum das so leicht geht', 'Why it’s so easy'),
      text: L(
        'Ein lineares Modell rechnet w · x. Verschiebt man jedes Pixel um ε in Richtung des Vorzeichens seines Gewichts, ändert sich das Ergebnis um ε · Σ|wᵢ|. Diese Summe wächst mit der Zahl der Pixel. Hier (64 Pixel) brauchte es ε ≈ 0,27. Bei einem Farbfoto mit 150 000 Werten reichen Änderungen in der Größenordnung der feinsten Helligkeitsstufe des Bildformats – unsichtbar für Menschen. Ian Goodfellow beschrieb 2014 genau diesen Effekt und das Verfahren (FGSM).',
        'A linear model computes w · x. If you shift every pixel by ε in the direction of its weight’s sign, the result changes by ε · Σ|wᵢ|. This sum grows with the number of pixels. Here (64 pixels) it took ε ≈ 0.27. For a colour photo with 150,000 values, changes on the order of the image format’s finest brightness step are enough – invisible to people. In 2014 Ian Goodfellow described exactly this effect and the method (FGSM).',
      ),
      formula: 'x′ = x + ε · sign(∇ₓL)   ⇒   Δ(w · x) = ε · Σ |wᵢ|',
    },
    {
      kind: 'choice',
      question: L('Forschende klebten kleine Aufkleber auf ein Stoppschild, und ein Erkennungsmodell las „Tempo 45“. Was folgt daraus?', 'Researchers put small stickers on a stop sign, and a recognition model read “speed limit 45”. What follows?'),
      options: [
        { text: L('Bildmodelle in sicherheitskritischen Anwendungen müssen gegen gezielte Täuschung geprüft und abgesichert werden.', 'Image models in safety-critical applications must be tested and protected against deliberate deception.'), correct: true, feedback: L('Genau – darum ist Robustheit ein eigenes Forschungsfeld und Teil von Regeln wie dem AI Act.', 'Exactly – that’s why robustness is a research field of its own and part of rules like the AI Act.') },
        { text: L('Stoppschilder sind schlecht gestaltet.', 'Stop signs are badly designed.'), feedback: L('Menschen erkennen das Schild problemlos – das Problem liegt beim Modell.', 'People recognise the sign without trouble – the problem lies with the model.') },
        { text: L('Netze sind nutzlos.', 'Networks are useless.'), feedback: L('Sie sind sehr nützlich – aber anders verwundbar als Menschen.', 'They are very useful – but vulnerable in different ways than humans.') },
      ],
    },
    {
      kind: 'info',
      tone: 'plain',
      title: L('Netze sehen anders als wir', 'Networks see differently from us'),
      text: L(
        'Ein Netz „sieht“ keinen Kreis. Es verrechnet Zahlen und folgt Mustern, die in den Trainingsdaten mit „Kreis“ zusammenhingen – manchmal ganz andere, als ein Mensch erwartet. Gegnerische Beispiele machen diesen Unterschied sichtbar.',
        'A network doesn’t “see” a circle. It crunches numbers and follows patterns that went together with “circle” in the training data – sometimes quite different ones than a person would expect. Adversarial examples make this difference visible.',
      ),
    },
    { kind: 'say', mood: 'wink', text: L('Bilder waren der erste große Erfolg. Der nächste war Sprache – und dafür muss man erst einmal Wörter in Zahlen verwandeln.', 'Images were the first big success. The next was language – and for that you first have to turn words into numbers.') },
  ],
};

export default lesson;
