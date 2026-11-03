import { L } from '../../../curriculum/helpers';
import type { LessonContent } from '../../types';

const lesson: LessonContent = {
  takeaway: L('Ist der Baum zu groß, schätzen zufällige Partien den Wert eines Zuges. Der Fehler der Schätzung sinkt wie 1/√n.', 'When the tree is too big, random playouts estimate the value of a move. The error of the estimate shrinks like 1/√n.'),
  steps: [
    { kind: 'say', mood: 'happy', text: L('Was tun, wenn der Spielbaum zu groß ist und niemand weiß, wie man eine Stellung bewertet? Idee: Spiel von dort aus einfach viele zufällige Partien zu Ende und zähl, wie oft du gewinnst.', 'What do you do when the game tree is too big and nobody knows how to evaluate a position? Idea: from there, just play lots of random games to the end and count how often you win.') },
    {
      kind: 'info',
      title: L('Hex', 'Hex'),
      text: L(
        'Hex wurde 1942 von Piet Hein und 1948 unabhängig von John Nash erfunden. Wer zuerst seine beiden Seiten mit einer Kette verbindet, gewinnt. Unentschieden gibt es nie: Ist das Brett voll, hat genau eine Seite verbunden. Darum lassen sich Zufallspartien hier besonders einfach auswerten.',
        'Hex was invented in 1942 by Piet Hein and independently in 1948 by John Nash. Whoever first connects their two sides with a chain wins. There are never draws: when the board is full, exactly one side has connected. That makes random games especially easy to evaluate here.',
      ),
    },
    {
      kind: 'predict',
      question: L('Ada spielt für jeden möglichen Zug zufällige Partien zu Ende. Was passiert, wenn sie statt 10 jeweils 300 Partien spielt?', 'For every possible move Ada plays random games to the end. What happens if she plays 300 instead of 10 each?'),
      options: [
        { text: L('Nichts – Zufall bleibt Zufall.', 'Nothing – random is random.') },
        { text: L('Sie spielt deutlich stärker.', 'She plays much more strongly.') },
        { text: L('Sie spielt schwächer, weil sie verwirrt ist.', 'She plays worse because she gets confused.') },
      ],
      reveal: L('Teste beide Stufen gegen sie.', 'Test both levels against her.'),
    },
    { kind: 'game', game: 'hex', intro: L('Schlag mich zuerst bei 10 Probespielen je Feld. Dann spiel eine Partie gegen 300. Die Zahlen auf den Feldern sind meine geschätzten Siegchancen.', 'Beat me first at 10 playouts per cell. Then play a game against 300. The numbers on the cells are my estimated chances of winning.') },
    {
      kind: 'info',
      title: L('Gesetz der großen Zahlen', 'Law of large numbers'),
      text: L(
        'Jede Zufallspartie ist ein Bernoulli-Versuch: Sieg oder nicht. Die Siegquote aus n Partien schätzt die wahre Gewinnwahrscheinlichkeit p; ihr Standardfehler ist √(p(1−p)/n). Bei n = 10 und p = 0,5 sind das rund ±16 Prozentpunkte – viel zu ungenau, um gute von schlechten Zügen zu trennen. Bei n = 300 nur noch rund ±3 Prozentpunkte.',
        'Every random game is a Bernoulli trial: win or not. The win rate from n games estimates the true win probability p; its standard error is √(p(1−p)/n). With n = 10 and p = 0.5 that’s about ±16 percentage points – far too rough to tell good moves from bad. With n = 300 it’s only about ±3 percentage points.',
      ),
      formula: 'σ(p̂) = √( p(1 − p) / n )',
    },
    {
      kind: 'choice',
      question: L('Monte-Carlo-Baumsuche (MCTS) verbessert diese einfache Idee. Wie?', 'Monte Carlo tree search (MCTS) improves this simple idea. How?'),
      options: [
        { text: L('Sie baut einen Baum auf und steckt mehr Probespiele in vielversprechende Züge, ohne die anderen ganz zu vergessen.', 'It builds a tree and puts more playouts into promising moves without completely forgetting the others.'), correct: true, feedback: L('Genau – ein Gleichgewicht aus Erkunden und Ausnutzen (Formel UCB). Das Thema kommt im bestärkenden Lernen wieder.', 'Exactly – a balance of exploring and exploiting (the UCB formula). The topic returns in reinforcement learning.') },
        { text: L('Sie spielt die Probespiele schneller.', 'It plays the playouts faster.'), feedback: L('Schneller hilft, ist aber nicht die Idee.', 'Faster helps, but isn’t the idea.') },
        { text: L('Sie verzichtet ganz auf Zufall.', 'It does away with randomness altogether.'), feedback: L('Im Gegenteil, der Zufall bleibt das Herzstück.', 'On the contrary, randomness remains the heart of it.') },
      ],
    },
    {
      kind: 'choice',
      question: L('Was kam bei AlphaGo (2016) zur Baumsuche dazu?', 'What did AlphaGo (2016) add to tree search?'),
      options: [
        { text: L('Neuronale Netze, die gute Züge vorschlagen und Stellungen bewerten – trainiert mit Profipartien und Spielen gegen sich selbst.', 'Neural networks that suggest good moves and evaluate positions – trained on expert games and self-play.'), correct: true, feedback: L('Genau: Suche (symbolisch) + gelernte Bewertung (statistisch). Die beiden großen Linien der KI treffen sich.', 'Exactly: search (symbolic) + learned evaluation (statistical). The two great lines of AI meet.') },
        { text: L('Eine von Go-Profis geschriebene Regelsammlung.', 'A rule collection written by Go professionals.'), feedback: L('Genau das hatte lange nicht funktioniert.', 'That’s exactly what hadn’t worked for a long time.') },
        { text: L('Ein schnellerer Computer, sonst nichts.', 'A faster computer, nothing else.'), feedback: L('Rechenleistung half, entscheidend waren aber die gelernten Netze.', 'Computing power helped, but the learned networks were decisive.') },
      ],
    },
    {
      kind: 'calc',
      question: L('Ein Zug gewinnt 60 von 100 Zufallspartien (p̂ = 0,6). Wie groß ist der Standardfehler σ(p̂) = √(p(1 − p)/n)?', 'A move wins 60 of 100 random playouts (p̂ = 0.6). What is the standard error σ(p̂) = √(p(1 − p)/n)?'),
      answer: 0.049,
      tolerance: 0.002,
      hint: L('Setze p = 0,6 und n = 100 ein.', 'Use p = 0.6 and n = 100.'),
      solution: L('σ = √(0,6·0,4/100) = √0,0024 ≈ 0,049, also etwa ±5 Prozentpunkte. Für ±2,5 Punkte bräuchte man viermal so viele Partien.', 'σ = √(0.6·0.4/100) = √0.0024 ≈ 0.049, i.e. about ±5 percentage points. For ±2.5 points you would need four times as many playouts.'),
    },
    { kind: 'say', mood: 'wink', text: L('Gelernte Bewertungen – damit sind wir bei der zweiten großen Säule der KI: aus Daten lernen. Die nächste Welt beginnt im Jahr 1805.', 'Learned evaluations – that brings us to the second great pillar of AI: learning from data. The next world starts in the year 1805.') },
  ],
};

export default lesson;
