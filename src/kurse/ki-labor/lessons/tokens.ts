import { L } from '../../../curriculum/helpers';
import type { LessonContent } from '../../types';

const lesson: LessonContent = {
  takeaway: L('Sprachmodelle lesen Tokens: häufige Wortteile, die Byte-Pair-Encoding aus Zählungen bildet. So passt jedes Wort in ein festes Vokabular.', 'Language models read tokens: frequent word pieces that byte-pair encoding builds from counts. That way every word fits into a fixed vocabulary.'),
  steps: [
    { kind: 'say', mood: 'happy', text: L('Ein Sprachmodell rechnet nur mit Zahlen. Zuerst wird Text also in Stücke zerlegt, die je eine Nummer bekommen: Tokens. Aber welche Stücke? Buchstaben? Ganze Wörter?', 'A language model only computes with numbers. So text is first split into pieces that each get a number: tokens. But which pieces? Letters? Whole words?') },
    {
      kind: 'predict',
      question: L('Was spricht gegen ganze Wörter als Tokens?', 'What speaks against whole words as tokens?'),
      options: [
        { text: L('Es gibt unendlich viele Wörter, auch neue und falsch geschriebene.', 'There are endlessly many words, including new and misspelled ones.') },
        { text: L('Wörter sind zu kurz.', 'Words are too short.') },
        { text: L('Nichts, so machen es alle.', 'Nothing, everybody does it that way.') },
      ],
      reveal: L('Und Buchstaben machen die Texte sehr lang. Die Lösung liegt dazwischen – baue sie selbst.', 'And letters make texts very long. The solution lies in between – build it yourself.'),
    },
    { kind: 'game', game: 'bpe', intro: L('Am Anfang ist jeder Buchstabe ein Token. Verschmilz in jeder Runde das häufigste Paar. Die Zahl hinter jedem Wort sagt, wie oft es im Text vorkommt.', 'At the start every letter is a token. In every round, merge the most frequent pair. The number after each word says how often it occurs in the text.') },
    {
      kind: 'info',
      title: L('Tokens in echten Modellen', 'Tokens in real models'),
      text: L(
        'Große Sprachmodelle haben Wortschätze aus etwa 30 000 bis über 200 000 Tokens, gelernt auf riesigen Textmengen. Häufige englische Wörter sind oft ein einziges Token, seltene oder lange Wörter werden zerlegt. Darum brauchen Texte in manchen Sprachen mehr Tokens als in anderen – und kosten bei Bezahldiensten mehr.',
        'Large language models have vocabularies of roughly 30,000 to over 200,000 tokens, learned on huge amounts of text. Frequent English words are often a single token; rare or long words are split up. That’s why texts in some languages need more tokens than in others – and cost more with paid services.',
      ),
    },
    {
      kind: 'choice',
      question: L('Ein Sprachmodell soll zählen, wie oft „r“ in „Erdbeere“ vorkommt, und irrt sich. Was ist eine plausible Erklärung?', 'A language model is asked how many times “r” occurs in “strawberry” and gets it wrong. What is a plausible explanation?'),
      options: [
        { text: L('Es sieht das Wort als wenige Tokens, nicht als einzelne Buchstaben.', 'It sees the word as a few tokens, not as individual letters.'), correct: true, feedback: L('Genau – die Buchstaben stecken unsichtbar in den Tokens.', 'Exactly – the letters are hidden inside the tokens.') },
        { text: L('Es kann nicht bis drei zählen.', 'It can’t count to three.'), feedback: L('Zählen geht – aber es „sieht“ die Buchstaben nicht direkt.', 'Counting works – but it doesn’t directly “see” the letters.') },
        { text: L('Es will die Nutzer ärgern.', 'It wants to annoy users.'), feedback: L('Programme wollen nichts.', 'Programs don’t want anything.') },
      ],
    },
    { kind: 'say', mood: 'wink', text: L('Jetzt hat jedes Token eine Nummer. Aber Nummern sagen nichts über Bedeutung: Token 4711 ist nicht „ähnlicher“ zu 4712 als zu 9. Dafür gibt es Einbettungen.', 'Now every token has a number. But numbers say nothing about meaning: token 4711 isn’t “more similar” to 4712 than to 9. That’s what embeddings are for.') },
  ],
};

export default lesson;
