import { L } from '../../../curriculum/helpers';
import type { LessonContent } from '../../types';

const lesson: LessonContent = {
  takeaway: L('Minimax bewertet den Spielbaum unter der Annahme bester Gegenzüge. Alpha-Beta schneidet Äste ab, ohne das Ergebnis zu ändern.', 'Minimax evaluates the game tree assuming the best replies. Alpha-beta prunes branches without changing the result.'),
  steps: [
    { kind: 'say', mood: 'happy', text: L('In einem Spiel für zwei will ich meinen Wert maximieren, du willst ihn minimieren. Minimax heißt: Ich nehme an, dass du immer den für mich schlechtesten Zug wählst – und suche den Zug, der dann am besten für mich ist.', 'In a two-player game I want to maximise my value and you want to minimise it. Minimax means: I assume you always pick the move that’s worst for me – and look for the move that is then best for me.') },
    {
      kind: 'info',
      title: L('Der Minimax-Wert', 'The minimax value'),
      text: L(
        'Blätter (Spielende) bekommen einen Wert: Sieg für Ada positiv, Niederlage negativ, Unentschieden 0. Nach oben gilt: An Adas Knoten das Maximum der Kinder, an deinen Knoten das Minimum. Ist der Baum zu tief, stoppt man bei einer Tiefengrenze und schätzt die Stellung mit einer Bewertungsfunktion – hier: offene Dreierlinien für Ada minus offene Dreierlinien für dich.',
        'Leaves (game over) get a value: a win for Ada positive, a loss negative, a draw 0. Going up: at Ada’s nodes take the maximum of the children, at yours the minimum. If the tree is too deep, you stop at a depth limit and estimate the position with an evaluation function – here: Ada’s open lines of three minus your open lines of three.',
      ),
      formula: L('v(n) = max v(Kind), wenn Ada am Zug ist;   v(n) = min v(Kind), wenn du am Zug bist', 'v(n) = max v(child) when Ada is to move;   v(n) = min v(child) when you are to move'),
    },
    {
      kind: 'predict',
      question: L('Tic-Tac-Toe hat vom leeren Brett aus wie viele Knoten im vollständigen Spielbaum?', 'How many nodes does the complete game tree of noughts and crosses have from the empty board?'),
      options: [
        { text: L('Rund 5 000', 'About 5,000') },
        { text: L('Rund 550 000', 'About 550,000') },
        { text: L('Rund 9 Milliarden', 'About 9 billion') },
      ],
      reveal: L('Es sind 549 946. Schach hätte schätzungsweise 10¹²⁰ mögliche Partien – mehr als Atome im beobachtbaren Universum.', 'It’s 549,946. Chess is estimated to have 10¹²⁰ possible games – more than atoms in the observable universe.'),
    },
    { kind: 'game', game: 'tictactoe', intro: L('Spiel gegen mich. Stell meine Suchtiefe ein und schalte Alpha-Beta an und aus. Schau dir an, wie viele Knoten ich untersuche.', 'Play against me. Set my search depth and switch alpha-beta on and off. Watch how many nodes I examine.') },
    {
      kind: 'info',
      title: L('Alpha-Beta-Suche', 'Alpha-beta search'),
      text: L(
        'Alpha ist der Wert, den Ada sicher schon erreichen kann, Beta der Wert, den du ihr höchstens lässt. Sobald Alpha ≥ Beta, kann ein Ast das Ergebnis nicht mehr ändern – er wird abgeschnitten. Das Ergebnis ist exakt dasselbe wie bei Minimax. Mit guter Zugreihenfolge sinkt der Aufwand von etwa bᵗ auf etwa b^(t/2): Man kann bei gleicher Rechenzeit doppelt so tief schauen.',
        'Alpha is the value Ada can already guarantee, beta the value you allow her at most. As soon as alpha ≥ beta, a branch can no longer change the result – it is cut off. The result is exactly the same as with minimax. With good move ordering the effort drops from about bᵗ to about b^(t/2): with the same computing time you can look twice as deep.',
      ),
    },
    {
      kind: 'choice',
      question: L('Bei Suchtiefe 1 war Ada schlagbar. Warum?', 'At depth 1 Ada could be beaten. Why?'),
      options: [
        { text: L('Sie schaut nur ihren eigenen Zug an und sieht deine Antwort (etwa eine Gabel) nicht kommen.', 'She only looks at her own move and doesn’t see your reply (such as a fork) coming.'), correct: true, feedback: L('Genau: Der Horizont ist zu kurz.', 'Exactly: the horizon is too short.') },
        { text: L('Ihre Bewertungsfunktion ist falsch.', 'Her evaluation function is wrong.'), feedback: L('Die Bewertung ist nur eine Schätzung – mit mehr Tiefe wird sie weniger wichtig.', 'The evaluation is only an estimate – with more depth it matters less.') },
        { text: L('Alpha-Beta war ausgeschaltet.', 'Alpha-beta was switched off.'), feedback: L('Alpha-Beta ändert nie das Ergebnis, nur die Rechenzeit.', 'Alpha-beta never changes the result, only the computing time.') },
      ],
    },
    {
      kind: 'choice',
      question: L('Was macht Deep Blue (1997) im Kern?', 'What does Deep Blue (1997) do at its core?'),
      options: [
        { text: L('Es lernt Schach aus Millionen Partien.', 'It learns chess from millions of games.'), feedback: L('Das kam erst mit späteren Programmen wie AlphaZero.', 'That only came with later programs such as AlphaZero.') },
        { text: L('Alpha-Beta-Suche mit einer von Experten gebauten Bewertungsfunktion, extrem schnell auf Spezialchips.', 'Alpha-beta search with an expert-built evaluation function, extremely fast on special chips.'), correct: true, feedback: L('Genau – symbolische KI in Reinform.', 'Exactly – symbolic AI in its purest form.') },
        { text: L('Es spielt zufällige Züge.', 'It plays random moves.'), feedback: L('Zufall kommt in der nächsten Lektion – bei Go.', 'Randomness comes in the next lesson – with Go.') },
      ],
    },
    {
      kind: 'calc',
      question: L('Ada (max) hat zwei Züge. Nach Zug 1 kann der Gegner (min) zu Endwerten 3 oder 5 führen, nach Zug 2 zu 2 oder 9. Welchen Minimax-Wert hat Adas Stellung?', 'Ada (max) has two moves. After move 1 the opponent (min) can lead to final values 3 or 5, after move 2 to 2 or 9. What is the minimax value of Ada’s position?'),
      answer: 3,
      tolerance: 0.001,
      hint: L('Erst je Zug das Minimum (Gegner), dann das Maximum (Ada).', 'First the minimum for each move (opponent), then the maximum (Ada).'),
      solution: L('Zug 1: min(3, 5) = 3. Zug 2: min(2, 9) = 2. Ada wählt max(3, 2) = 3 – die verlockende 9 bekommt sie nie, weil der Gegner sie verhindert.', 'Move 1: min(3, 5) = 3. Move 2: min(2, 9) = 2. Ada picks max(3, 2) = 3 – she never gets the tempting 9 because the opponent prevents it.'),
    },
    { kind: 'say', mood: 'wink', text: L('Bei Go hilft das nicht: Es gibt rund 250 mögliche Züge pro Stellung, und eine gute Bewertungsfunktion konnte lange niemand bauen. Die Lösung klingt verrückt: Zufall.', 'For Go that doesn’t help: there are about 250 possible moves per position, and for a long time nobody could build a good evaluation function. The answer sounds crazy: randomness.') },
  ],
};

export default lesson;
