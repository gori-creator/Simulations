import { L } from '../../../curriculum/helpers';
import type { LessonContent } from '../../types';

const lesson: LessonContent = {
  steps: [
    { kind: 'say', mood: 'happy', text: L('Jedes Sprachmodell – vom winzigen bis zum riesigen – macht im Kern dasselbe: Es berechnet eine Wahrscheinlichkeitsverteilung für das nächste Token und zieht daraus.', 'Every language model – from tiny to huge – does the same thing at its core: it computes a probability distribution for the next token and draws from it.') },
    {
      kind: 'info',
      title: L('n-Gramme und Temperatur', 'n-grams and temperature'),
      text: L(
        'Ein n-Gramm-Modell schätzt die Wahrscheinlichkeit des nächsten Wortes aus Zählungen: Wie oft folgte es auf die letzten n − 1 Wörter? Große Modelle berechnen die Verteilung stattdessen mit einem Netz, das Tausende vorige Tokens berücksichtigt. Die Temperatur T verändert die Verteilung vor dem Ziehen: klein → fast immer das wahrscheinlichste Wort, groß → mehr Zufall.',
        'An n-gram model estimates the probability of the next word from counts: how often did it follow the last n − 1 words? Large models instead compute the distribution with a network that takes thousands of previous tokens into account. The temperature T changes the distribution before drawing: small → almost always the most likely word, large → more randomness.',
      ),
      formula: 'P(w | Kontext) ∝ Anzahl(Kontext, w)^(1/T)',
    },
    {
      kind: 'predict',
      question: L('Was passiert bei Temperatur 0?', 'What happens at temperature 0?'),
      options: [
        { text: L('Jedes Mal derselbe Text', 'The same text every time') },
        { text: L('Völlig zufällige Wörter', 'Completely random words') },
        { text: L('Das Modell schweigt', 'The model stays silent') },
      ],
      reveal: L('Probier es aus – und dann das Gegenteil.', 'Try it – and then the opposite.'),
    },
    { kind: 'game', game: 'sprachmodell', intro: L('Ziehe Wort für Wort oder lass ganze Sätze entstehen. Die Balken zeigen die Wahrscheinlichkeiten für das nächste Wort.', 'Draw word by word or let whole sentences emerge. The bars show the probabilities for the next word.') },
    {
      kind: 'choice',
      question: L('Das Modell schrieb einen Satz wie „Der Mond ist ein Planet“. Warum?', 'The model wrote a sentence like “The moon is a planet”. Why?'),
      options: [
        { text: L('Es setzt häufige Wortfolgen neu zusammen; ob das Ergebnis wahr ist, prüft es nicht.', 'It recombines frequent word sequences; it doesn’t check whether the result is true.'), correct: true, feedback: L('Genau – plausibel klingend ist nicht dasselbe wie wahr.', 'Exactly – sounding plausible is not the same as being true.') },
        { text: L('Im Trainingstext stand das so.', 'The training text said so.'), feedback: L('Nein, dort steht „Die Erde ist ein Planet“ und „Der Mond ist kleiner als die Erde“.', 'No, it says “The earth is a planet” and “The moon is smaller than the earth”.') },
        { text: L('Es lügt absichtlich.', 'It lies on purpose.'), feedback: L('Lügen setzt Absicht voraus – das Modell zieht nur Wörter.', 'Lying requires intent – the model only draws words.') },
      ],
      explain: L('Große Modelle machen dasselbe auf höherem Niveau. Darum erfinden sie manchmal Quellen, Zitate oder Zahlen („Halluzinationen“) – und klingen dabei überzeugt.', 'Large models do the same at a higher level. That’s why they sometimes invent sources, quotes or numbers (“hallucinations”) – and sound confident while doing it.'),
    },
    {
      kind: 'choice',
      question: L('Mit mehr Kontext wurden die Sätze besser – aber oft wörtlich kopiert. Was folgt daraus für große Modelle?', 'With more context the sentences got better – but were often copied verbatim. What follows for large models?'),
      options: [
        { text: L('Sie können Teile ihrer Trainingstexte wiedergeben – ein Thema für Urheberrecht und Datenschutz.', 'They can reproduce parts of their training texts – an issue for copyright and privacy.'), correct: true, feedback: L('Genau. Darum testet man Modelle auch darauf, was sie auswendig gelernt haben.', 'Exactly. That’s why models are also tested for what they have memorised.') },
        { text: L('Große Modelle kopieren nie.', 'Large models never copy.'), feedback: L('Selten, aber es kommt vor – besonders bei häufig vorkommenden Texten.', 'Rarely, but it happens – especially with texts that occur often.') },
      ],
    },
    { kind: 'say', mood: 'wink', text: L('Ein n-Gramm-Modell sieht nur die letzten ein, zwei Wörter. Echte Sprache braucht mehr: Worauf bezieht sich „er“ zehn Wörter später? Dafür gibt es Aufmerksamkeit.', 'An n-gram model only sees the last one or two words. Real language needs more: what does “it” refer to ten words later? That’s what attention is for.') },
  ],
};

export default lesson;
