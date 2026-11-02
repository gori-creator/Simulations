import { L } from '../../../curriculum/helpers';
import type { LessonContent } from '../../types';

const lesson: LessonContent = {
  takeaway: L('Bei der Aufmerksamkeit gewichtet jedes Token alle anderen mit softmax(q·k/√d) – so hängt die Bedeutung von „er“ vom Zusammenhang ab.', 'In attention every token weighs all others with softmax(q·k/√d) – that is how the meaning of “it” depends on the context.'),
  steps: [
    { kind: 'say', mood: 'happy', text: L('„Der Ball passte nicht in den Koffer, weil er zu groß war.“ Du weißt sofort: „er“ ist der Ball. Ändere ein Wort – „zu klein“ – und „er“ ist der Koffer. Solche Sätze heißen Winograd-Schemata.', '“The ball didn’t fit into the suitcase because it was too big.” You immediately know: “it” is the ball. Change one word – “too small” – and “it” is the suitcase. Such sentences are called Winograd schemas.') },
    {
      kind: 'predict',
      question: L('Worauf bezieht sich „er“ in „… weil er zu klein war“?', 'What does “it” refer to in “… because it was too small”?'),
      options: [
        { text: L('Auf den Ball', 'The ball') },
        { text: L('Auf den Koffer', 'The suitcase') },
      ],
      reveal: L('Schau nach, wohin das Modell seine Aufmerksamkeit lenkt.', 'Look where the model directs its attention.'),
    },
    {
      kind: 'info',
      title: L('Abfrage, Schlüssel, Wert', 'Query, key, value'),
      text: L(
        'Jedes Token stellt eine Abfrage q („wonach suche ich?“) und bietet einen Schlüssel k an („was habe ich zu bieten?“). Das Skalarprodukt q · k misst, wie gut sie zusammenpassen; geteilt durch √d und durch Softmax werden daraus Gewichte, die sich zu 1 addieren. Mit ihnen mischt jedes Token die Werte v aller anderen in seine neue Darstellung.',
        'Every token makes a query q (“what am I looking for?”) and offers a key k (“what do I have to offer?”). The dot product q · k measures how well they match; divided by √d and passed through softmax they become weights that add up to 1. With them every token mixes the values v of all others into its new representation.',
      ),
      formula: 'Attention(Q, K, V) = softmax(Q·Kᵀ / √d) · V',
    },
    { kind: 'game', game: 'attention', intro: L('Die Bögen zeigen, wie stark das gewählte Wort auf die anderen achtet. Schalte zwischen „groß“ und „klein“ um und tippe andere Wörter an.', 'The arcs show how strongly the selected word attends to the others. Switch between “too big” and “too small” and tap other words.') },
    {
      kind: 'info',
      tone: 'plain',
      title: L('Was hier vereinfacht ist', 'What is simplified here'),
      text: L(
        'Die Zahlen sind von Hand gesetzt, und dass „er“ schon „weiß“, ob es um „groß“ oder „klein“ geht, haben wir vorausgesetzt. In einem echten Transformer entsteht das über viele Schichten mit je vielen Aufmerksamkeitsköpfen – gelernt aus Milliarden Sätzen, nicht programmiert.',
        'The numbers are set by hand, and we assumed that “it” already “knows” whether the sentence says “big” or “small”. In a real transformer this emerges over many layers with many attention heads each – learned from billions of sentences, not programmed.',
      ),
    },
    {
      kind: 'choice',
      question: L('Drei Rohwerte q·k/√d sind 2, 0 und 0. Welches Gewicht bekommt der erste nach Softmax?', 'Three raw scores q·k/√d are 2, 0 and 0. What weight does the first get after softmax?'),
      options: [
        { text: L('e² / (e² + 2) ≈ 0,79', 'e² / (e² + 2) ≈ 0.79'), correct: true, feedback: L('Richtig: e² ≈ 7,39, e⁰ = 1.', 'Right: e² ≈ 7.39, e⁰ = 1.') },
        { text: L('2 / 2 = 1', '2 / 2 = 1'), feedback: L('Softmax nimmt erst e hoch die Werte – auch die Nullen zählen dann mit 1.', 'Softmax first takes e to the power of the scores – the zeros then count as 1.') },
        { text: L('1/3', '1/3'), feedback: L('Das wäre bei drei gleichen Werten.', 'That would be for three equal scores.') },
      ],
    },
    {
      kind: 'choice',
      question: L('Warum war der Transformer (2017) so ein Durchbruch?', 'Why was the transformer (2017) such a breakthrough?'),
      options: [
        { text: L('Jedes Token kann direkt auf jedes andere achten, und alle Positionen lassen sich gleichzeitig auf Grafikkarten berechnen.', 'Every token can attend directly to every other one, and all positions can be computed at the same time on graphics cards.'), correct: true, feedback: L('Genau – weite Bezüge plus Parallelität machten riesige Modelle möglich.', 'Exactly – long-range references plus parallelism made huge models possible.') },
        { text: L('Er braucht keine Daten mehr.', 'It no longer needs data.'), feedback: L('Im Gegenteil: Er wurde mit immer mehr Daten immer besser.', 'On the contrary: it kept getting better with more and more data.') },
        { text: L('Er versteht Sprache wie ein Mensch.', 'It understands language like a human.'), feedback: L('Das ist eine Behauptung, die der Bau des Modells nicht belegt.', 'That’s a claim the model’s design doesn’t support.') },
      ],
    },
    { kind: 'say', mood: 'wink', text: L('Ein Transformer, mit einem großen Teil des Internets auf „nächstes Token“ trainiert, kann vieles – ist aber noch kein hilfreicher Assistent. Wie er dazu wird, zeigt die Mission dieser Welt.', 'A transformer trained on a large part of the internet to predict the “next token” can do a lot – but isn’t yet a helpful assistant. This world’s mission shows how it becomes one.') },
  ],
};

export default lesson;
