import { L } from '../../../curriculum/helpers';
import type { LessonContent } from '../../types';

const lesson: LessonContent = {
  steps: [
    { kind: 'say', mood: 'happy', text: L('Ein Entscheidungsbaum stellt Fragen, bis die Antwort klar ist. Aber welche Frage zuerst? Ross Quinlan hatte 1986 eine Antwort: die, die am meisten Information bringt.', 'A decision tree asks questions until the answer is clear. But which question first? In 1986 Ross Quinlan had an answer: the one that brings the most information.') },
    {
      kind: 'info',
      title: L('Entropie', 'Entropy'),
      text: L(
        'Die Entropie misst die Unordnung einer Menge in Bit: 0, wenn alle Beispiele zur selben Klasse gehören, 1, wenn es halb-halb steht. Der Informationsgewinn einer Frage ist die Entropie vorher minus die gewichtete Entropie der Teile nachher. ID3 wählt an jedem Knoten die Frage mit dem größten Gewinn.',
        'Entropy measures the disorder of a set in bits: 0 if all examples belong to the same class, 1 if it is half and half. The information gain of a question is the entropy before minus the weighted entropy of the parts afterwards. ID3 picks the question with the largest gain at every node.',
      ),
      formula: 'H(S) = −Σ pₖ·log₂ pₖ,   Gewinn(S, A) = H(S) − Σᵥ |Sᵥ|/|S| · H(Sᵥ)',
    },
    {
      kind: 'choice',
      question: L('An 9 von 14 Tagen wurde Tennis gespielt, an 5 nicht. Wie groß ist die Entropie ungefähr?', 'On 9 of 14 days tennis was played, on 5 not. What is the entropy, roughly?'),
      options: [
        { text: L('0 Bit', '0 bits'), feedback: L('0 wäre es nur, wenn alle Tage gleich wären.', 'It would only be 0 if all days were the same.') },
        { text: L('etwa 0,94 Bit', 'about 0.94 bits'), correct: true, feedback: L('Richtig: −(9/14)·log₂(9/14) − (5/14)·log₂(5/14) ≈ 0,940.', 'Right: −(9/14)·log₂(9/14) − (5/14)·log₂(5/14) ≈ 0.940.') },
        { text: L('genau 1 Bit', 'exactly 1 bit'), feedback: L('1 Bit wäre bei 7 zu 7 – hier ist es etwas weniger gemischt.', '1 bit would be 7 to 7 – this is a bit less mixed.') },
      ],
    },
    { kind: 'game', game: 'id3', intro: L('Das ist der berühmte Lehrbuch-Datensatz „Tennis spielen?“ mit 14 Tagen. Wähle an jedem gemischten Knoten die Frage mit dem größten Informationsgewinn.', 'This is the famous textbook data set “play tennis?” with 14 days. At every mixed node, choose the question with the largest information gain.') },
    {
      kind: 'choice',
      question: L('Warum nimmt man nicht einfach eine Frage nach dem Datum („Welcher Tag?“) – die trennt doch alles perfekt?', 'Why not simply ask for the date (“which day?”) – that separates everything perfectly?'),
      options: [
        { text: L('Sie hat zwar maximalen Gewinn, sagt aber über neue Tage nichts: reines Auswendiglernen.', 'It has maximal gain but says nothing about new days: pure memorisation.'), correct: true, feedback: L('Genau – Überanpassung. Nachfolger wie C4.5 verwenden deshalb das Gewinnverhältnis.', 'Exactly – overfitting. Successors like C4.5 therefore use the gain ratio.') },
        { text: L('Weil Daten keine Merkmale sein dürfen.', 'Because dates may not be features.'), feedback: L('Dürfen schon – nur nützt es hier nichts.', 'They may – it just doesn’t help here.') },
      ],
    },
    {
      kind: 'info',
      tone: 'plain',
      title: L('Symbolisch und gelernt zugleich', 'Symbolic and learned at once'),
      text: L(
        'Ein Entscheidungsbaum ist aus Daten gelernt – und trotzdem lesbar wie ein Regelwerk. Jeder Pfad ist eine Wenn-dann-Regel. Darum nutzt man Bäume gern, wo Entscheidungen erklärt werden müssen, etwa in Medizin oder Verwaltung. Neuronale Netze sind meist genauer, aber schwerer zu erklären.',
        'A decision tree is learned from data – and still readable like a rule book. Every path is an if-then rule. That’s why trees are popular where decisions must be explained, for example in medicine or administration. Neural networks are usually more accurate but harder to explain.',
      ),
    },
    { kind: 'say', mood: 'wink', text: L('Nächste Welt: das künstliche Neuron. Es ist älter als ID3 – und hatte einen tiefen Absturz, bevor es die Welt veränderte.', 'Next world: the artificial neuron. It is older than ID3 – and took a deep fall before it changed the world.') },
  ],
};

export default lesson;
