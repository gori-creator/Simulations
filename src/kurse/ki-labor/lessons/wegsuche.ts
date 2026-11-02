import { L } from '../../../curriculum/helpers';
import type { LessonContent } from '../../types';

const lesson: LessonContent = {
  takeaway: L('A* wählt nach f = g + h. Mit einer zulässigen Schätzung h findet es den kürzesten Weg und untersucht meist viel weniger Felder als die Breitensuche.', 'A* chooses by f = g + h. With an admissible estimate h it finds the shortest path and usually explores far fewer cells than breadth-first search.'),
  steps: [
    { kind: 'say', mood: 'happy', text: L('Viele KI-Probleme sind in Wahrheit Suchprobleme: Es gibt Zustände, Züge zwischen ihnen, einen Start und ein Ziel. Gesucht ist ein Weg – beim Navi, beim Roboter, beim Puzzle.', 'Many AI problems are really search problems: there are states, moves between them, a start and a goal. You are looking for a path – in satnavs, robots, puzzles.') },
    {
      kind: 'info',
      title: L('Zustandsraum', 'State space'),
      text: L(
        'Formal: eine Menge V von Zuständen, Übergänge E ⊆ V × V, ein Startzustand s und eine Menge Z von Zielzuständen. Eine Lösung ist eine Folge von Zuständen von s nach Z. Alle Suchverfahren arbeiten mit einer Agenda – der Liste der Zustände, die noch untersucht werden sollen. Sie unterscheiden sich nur darin, welchen Eintrag sie als Nächstes nehmen.',
        'Formally: a set V of states, transitions E ⊆ V × V, a start state s and a set Z of goal states. A solution is a sequence of states from s into Z. All search methods work with an agenda – the list of states still to be examined. They only differ in which entry they take next.',
      ),
    },
    {
      kind: 'predict',
      question: L('Welches Verfahren findet den kürzesten Weg und schaut dabei die wenigsten Felder an?', 'Which method finds the shortest path while examining the fewest cells?'),
      options: [
        { text: L('Breitensuche', 'Breadth-first search') },
        { text: L('Tiefensuche', 'Depth-first search') },
        { text: L('Gierige Suche', 'Greedy search') },
        { text: L('A*', 'A*') },
      ],
      reveal: L('Lass alle vier im selben Labyrinth laufen.', 'Run all four in the same maze.'),
    },
    { kind: 'game', game: 'suche', intro: L('Starte jedes Verfahren einmal. Die Zahlen zeigen, in welcher Reihenfolge die Felder untersucht werden.', 'Start each method once. The numbers show the order in which cells are expanded.') },
    {
      kind: 'info',
      title: L('Warum A* klappt', 'Why A* works'),
      text: L(
        'A* sortiert die Agenda nach f(n) = g(n) + h(n): bisherige Kosten plus geschätzte Restkosten. Unterschätzt die Schätzung h die wahren Restkosten nie (sie ist „zulässig“), findet A* garantiert einen kürzesten Weg. Die Manhattan-Distanz ist im Gitter zulässig: Kein Weg kann kürzer sein als die Summe der waagerechten und senkrechten Abstände.',
        'A* orders the agenda by f(n) = g(n) + h(n): cost so far plus estimated remaining cost. If the estimate h never overestimates the true remaining cost (it is “admissible”), A* is guaranteed to find a shortest path. The Manhattan distance is admissible on a grid: no path can be shorter than the sum of horizontal and vertical distances.',
      ),
      formula: L('f(n) = g(n) + h(n),   h(n) = |x − x_Z| + |y − y_Z|   (Z = Ziel)', 'f(n) = g(n) + h(n),   h(n) = |x − x_G| + |y − y_G|   (G = goal)'),
    },
    {
      kind: 'choice',
      question: L('Die gierige Suche sortiert nur nach h(n). Warum fand sie einen längeren Weg?', 'Greedy search orders only by h(n). Why did it find a longer path?'),
      options: [
        { text: L('Sie beachtet die schon gegangenen Schritte g(n) nicht und lässt sich von der Luftlinie in die Sackgasse locken.', 'It ignores the steps already taken, g(n), and is lured into the dead end by the straight-line distance.'), correct: true, feedback: L('Genau. Schnell, aber ohne Garantie.', 'Exactly. Fast, but without a guarantee.') },
        { text: L('Ihre Schätzung ist nicht zulässig.', 'Its estimate is not admissible.'), feedback: L('Es ist dieselbe Manhattan-Schätzung wie bei A* – entscheidend ist, dass g fehlt.', 'It’s the same Manhattan estimate as in A* – what matters is that g is missing.') },
        { text: L('Sie hat sich verrechnet.', 'It made a calculation error.'), feedback: L('Sie rechnet richtig, folgt aber einer zu einfachen Regel.', 'It calculates correctly, but follows too simple a rule.') },
      ],
    },
    {
      kind: 'choice',
      question: L('Wofür eignet sich die Breitensuche schlecht?', 'What is breadth-first search bad at?'),
      options: [
        { text: L('Für sehr große Zustandsräume wie Schach: Die Agenda wächst exponentiell mit der Tiefe.', 'For very large state spaces such as chess: the agenda grows exponentially with depth.'), correct: true, feedback: L('Richtig – bei Verzweigungsgrad b und Tiefe t sind es bis zu bᵗ Zustände.', 'Right – with branching factor b and depth t there can be up to bᵗ states.') },
        { text: L('Um den kürzesten Weg zu finden.', 'To find the shortest path.'), feedback: L('Das kann sie gerade (bei gleichen Kosten je Schritt).', 'That is exactly what it can do (with equal cost per step).') },
        { text: L('Für Labyrinthe.', 'For mazes.'), feedback: L('Für kleine Labyrinthe ist sie völlig in Ordnung.', 'For small mazes it’s perfectly fine.') },
      ],
    },
    { kind: 'say', mood: 'wink', text: L('Bisher war die Welt still. Spannend wird es, wenn ein Gegner mitspielt und deine Züge durchkreuzt. Dafür braucht man Spielbäume.', 'So far the world was passive. It gets exciting when an opponent plays along and counters your moves. For that you need game trees.') },
  ],
};

export default lesson;
