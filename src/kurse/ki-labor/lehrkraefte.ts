import { L } from '../../curriculum/helpers';
import type { WorldGuide } from '../types';

/**
 * Handreichung für Lehrkräfte zum KI-Labor (Seite …/ki-labor/lehrkraefte/).
 * Je Welt: Lernziele, typische Fehlvorstellung, Gesprächsimpulse, eine Idee
 * ohne Computer – in eigenen Worten.
 */
export const GUIDES: Record<string, WorldGuide> = {
  intelligenz: {
    goals: [
      L('das Imitationsspiel darstellen und Einwände diskutieren (chinesisches Zimmer)', 'present the imitation game and discuss objections (Chinese room)'),
      L('ELIZA als Muster-Antwort-System mit Rangfolge und Pronomen-Spiegelung analysieren', 'analyse ELIZA as a pattern–response system with ranks and pronoun mirroring'),
      L('Vorwärtsverkettung in einem kleinen Expertensystem ausführen und den Engpass beim Wissenserwerb benennen', 'run forward chaining in a small expert system and name the knowledge-acquisition bottleneck'),
    ],
    misconceptions: [
      { wrong: L('Wer den Turing-Test besteht, ist intelligent.', 'Passing the Turing test proves intelligence.'), right: L('Der Test misst Ununterscheidbarkeit im Verhalten. Ob dahinter Verstehen steckt, bleibt eine philosophische Frage.', 'The test measures indistinguishable behaviour. Whether there is understanding behind it remains a philosophical question.') },
    ],
    talk: [
      L('Überzeugt Searles Argument? Was entgegnet die „System-Antwort“?', 'Is Searle’s argument convincing? What does the “systems reply” say?'),
      L('Warum scheiterten Expertensysteme oft an der Pflege ihrer Regeln?', 'Why did expert systems often fail at maintaining their rules?'),
    ],
    unplugged: L('Chinesisches Zimmer nachspielen: Eine Gruppe beantwortet Karten in einer unbekannten Schrift nur mit Hilfe eines Regelbuchs, die andere beurteilt die Antworten. Danach: Hat die erste Gruppe etwas verstanden?', 'Act out the Chinese room: one group answers cards in an unknown script using only a rule book, the other judges the answers. Afterwards: did the first group understand anything?'),
  },
  suche: {
    goals: [
      L('Breiten-, Tiefen-, gierige Suche und A* nach untersuchten Feldern und Weglänge vergleichen', 'compare breadth-first, depth-first, greedy search and A* by explored cells and path length'),
      L('Minimax-Werte berechnen und Alpha-Beta-Schnitte begründen', 'compute minimax values and justify alpha-beta cuts'),
      L('Monte-Carlo-Schätzungen bei großen Spielbäumen begründen (Fehler ∝ 1/√n)', 'justify Monte Carlo estimates for large game trees (error ∝ 1/√n)'),
    ],
    misconceptions: [
      { wrong: L('Gierige Suche findet immer den kürzesten Weg, weil sie direkt aufs Ziel zusteuert.', 'Greedy search always finds the shortest path because it heads straight for the goal.'), right: L('Ohne die bisherigen Kosten g(n) kann sie Umwege nehmen. A* ist mit einer zulässigen Heuristik optimal.', 'Without the cost so far g(n) it can take detours. A* is optimal with an admissible heuristic.') },
    ],
    talk: [
      L('Warum ist die Manhattan-Distanz im Gitter zulässig – und welche Schätzung wäre es nicht?', 'Why is the Manhattan distance admissible on the grid – and which estimate would not be?'),
      L('Was bedeutet es, dass Schach im Prinzip lösbar, praktisch aber nicht gelöst ist?', 'What does it mean that chess is solvable in principle but not solved in practice?'),
    ],
    unplugged: L('Suche von Hand: Auf Karopapier führen Gruppen Breitensuche und A* mit einer Warteschlange aus Zetteln aus, nummerieren die untersuchten Felder und vergleichen.', 'Search by hand: on squared paper groups run breadth-first search and A* with a queue of paper slips, number the explored cells and compare.'),
  },
  daten: {
    goals: [
      L('die Ausgleichsgerade über kleinste Quadrate bestimmen', 'determine the regression line by least squares'),
      L('Gradientenabstieg erklären und den Einfluss der Lernrate begründen (zu groß: Divergenz)', 'explain gradient descent and the influence of the learning rate (too large: divergence)'),
      L('Trainings- und Testfehler unterscheiden und Kreuzvalidierung begründen', 'distinguish training and test error and justify cross-validation'),
      L('einen naiven Bayes-Filter rechnen sowie Entropie und Informationsgewinn (ID3) bestimmen', 'compute a naive Bayes filter and determine entropy and information gain (ID3)'),
    ],
    misconceptions: [
      { wrong: L('Ein komplexeres Modell ist immer besser.', 'A more complex model is always better.'), right: L('Mehr Parameter senken den Trainingsfehler; der Testfehler steigt ab einem Punkt wieder (Überanpassung).', 'More parameters lower the training error; beyond some point the test error rises again (overfitting).') },
    ],
    talk: [
      L('Warum quadriert man die Abweichungen, statt Beträge zu nehmen?', 'Why do we square the deviations instead of taking absolute values?'),
      L('Welche Annahme macht naiver Bayes – und warum funktioniert er trotzdem oft?', 'Which assumption does naive Bayes make – and why does it still work so often?'),
    ],
    unplugged: L('Kreuzvalidierung mit Karten: Datenpunkte stehen auf Karten, die in fünf Stapel geteilt werden; reihum ist ein Stapel der Test. Die Klasse vergleicht die Fehler einer Geraden und einer stark gekrümmten Kurve.', 'Cross-validation with cards: data points are written on cards split into five piles; in turn one pile is the test. The class compares the errors of a straight line and a very wiggly curve.'),
  },
  netze: {
    goals: [
      L('UND, ODER und NICHT mit Schwellenneuronen umsetzen und begründen, warum XOR nicht geht', 'implement AND, OR and NOT with threshold neurons and explain why XOR is impossible'),
      L('die Perzeptron-Lernregel anwenden und den ersten KI-Winter einordnen', 'apply the perceptron learning rule and place the first AI winter in context'),
      L('XOR mit einer verborgenen Schicht lösen und Gradienten per Kettenregel auf einem Rechengraphen berechnen', 'solve XOR with a hidden layer and compute gradients with the chain rule on a computation graph'),
      L('mit Netzgröße, Aktivierung und Lernrate experimentieren und Ergebnisse deuten', 'experiment with network size, activation and learning rate and interpret the results'),
    ],
    misconceptions: [
      { wrong: L('Mehr Neuronen und Schichten lösen jedes Problem.', 'More neurons and layers solve any problem.'), right: L('Größere Netze können mehr darstellen, brauchen aber passende Daten, Lernrate und Training – sonst lernen sie schlecht oder überanpassen.', 'Larger networks can represent more but need suitable data, learning rate and training – otherwise they learn badly or overfit.') },
    ],
    talk: [
      L('Warum war das XOR-Argument von Minsky und Papert so folgenreich, obwohl mehrschichtige Netze das Problem lösen?', 'Why was Minsky and Papert’s XOR argument so consequential although multi-layer networks solve the problem?'),
      L('Was unterscheidet Backpropagation von blindem Ausprobieren der Gewichte?', 'What distinguishes backpropagation from blindly trying out weights?'),
    ],
    unplugged: L('Backpropagation an der Tafel: Ein kleiner Rechengraph, jede Gruppe ist ein Knoten. Erst wird vorwärts gerechnet, dann reicht jede Gruppe ihre Ableitung rückwärts weiter (Kettenregel).', 'Backpropagation on the board: a small computation graph, each group is one node. First compute forwards, then each group passes its derivative backwards (chain rule).'),
  },
  sehen: {
    goals: [
      L('Faltungsfilter auf Pixelbilder anwenden und Kantenbilder deuten', 'apply convolution filters to pixel images and interpret edge images'),
      L('den ImageNet-Durchbruch 2012 einordnen (große Datensätze, Grafikkarten, tiefe Netze)', 'place the 2012 ImageNet breakthrough in context (large data sets, graphics cards, deep networks)'),
      L('ein gegnerisches Beispiel erzeugen und Robustheit diskutieren', 'create an adversarial example and discuss robustness'),
    ],
    misconceptions: [
      { wrong: L('Ein Netz mit 99 % Genauigkeit sieht wie ein Mensch.', 'A network with 99% accuracy sees like a human.'), right: L('Es kann auf Merkmale reagieren, die Menschen nicht beachten. Kleine gezielte Störungen genügen, um es zu täuschen.', 'It can react to features people don’t notice. Small targeted perturbations are enough to fool it.') },
    ],
    talk: [
      L('Warum gelang der Durchbruch gerade 2012 – was kam zusammen?', 'Why did the breakthrough happen in 2012 – what came together?'),
      L('Wo wären gegnerische Beispiele gefährlich (Verkehrsschilder, Gesichtserkennung, Medizin)?', 'Where would adversarial examples be dangerous (traffic signs, face recognition, medicine)?'),
    ],
    unplugged: L('Faltung mit Folie: Ein 3 × 3-Raster auf Folie wird über ein Zahlenbild auf Papier geschoben; die Klasse rechnet Feld für Feld das Ergebnisbild aus.', 'Convolution with a transparency: a 3 × 3 grid on a transparent sheet is slid over a number picture on paper; the class computes the output picture cell by cell.'),
  },
  sprache: {
    goals: [
      L('Byte-Pair-Encoding von Hand durchführen', 'carry out byte-pair encoding by hand'),
      L('mit Wortvektoren und Kosinus-Ähnlichkeit rechnen', 'calculate with word vectors and cosine similarity'),
      L('die Temperatur beim Ziehen des nächsten Tokens erklären und Aufmerksamkeitsgewichte softmax(q·k/√d) berechnen', 'explain the temperature when sampling the next token and compute attention weights softmax(q·k/√d)'),
      L('beschreiben, wie Rückmeldungen von Menschen (RLHF) aus einem Sprachmodell einen Assistenten machen, und Belohnungs-Hacking erklären', 'describe how human feedback (RLHF) turns a language model into an assistant, and explain reward hacking'),
    ],
    misconceptions: [
      { wrong: L('Sprachmodelle schlagen Antworten in einer Datenbank nach.', 'Language models look up answers in a database.'), right: L('Sie erzeugen Token für Token aus gelernten Wahrscheinlichkeiten. Deshalb antworten sie flüssig – und manchmal flüssig falsch.', 'They generate token by token from learned probabilities. That is why they answer fluently – and sometimes fluently wrong.') },
    ],
    talk: [
      L('Warum sind Tokens Wortteile – und keine ganzen Wörter oder einzelnen Buchstaben?', 'Why are tokens word pieces – and not whole words or single letters?'),
      L('Welche Werte stecken in einem Belohnungsmodell – und wessen Werte sind das?', 'Which values are built into a reward model – and whose values are they?'),
    ],
    unplugged: L('Aufmerksamkeit mit Fäden: Wortkarten eines Satzes hängen an der Tafel; für ein Pronomen spannt die Klasse Fäden unterschiedlicher Dicke zu den Wörtern, auf die es sich beziehen könnte, und ändert dann ein Wort im Satz.', 'Attention with strings: the word cards of a sentence hang on the board; for a pronoun the class stretches strings of different thickness to the words it might refer to, then changes one word of the sentence.'),
  },
  belohnung: {
    goals: [
      L('Strategien für mehrarmige Banditen vergleichen (ε-gierig) und Erkundung begründen', 'compare strategies for multi-armed bandits (ε-greedy) and justify exploration'),
      L('Q-Lernen-Aktualisierungen durchführen und die Rolle von γ und ε deuten', 'carry out Q-learning updates and interpret the role of γ and ε'),
    ],
    misconceptions: [
      { wrong: L('Ein Agent ohne Erkundung (ε = 0) lernt am schnellsten, weil er keine Zeit verschwendet.', 'An agent without exploration (ε = 0) learns fastest because it wastes no time.'), right: L('Ohne Erkundung kann er an einer mittelmäßigen Wahl hängen bleiben; etwas Zufall findet bessere Wege.', 'Without exploration it can get stuck on a mediocre choice; a little randomness finds better paths.') },
    ],
    talk: [
      L('Wofür werden Empfehlungssysteme belohnt – und was folgt daraus für uns?', 'What are recommender systems rewarded for – and what follows for us?'),
      L('Wie sollte man γ wählen, wenn eine große Belohnung erst spät kommt?', 'How should γ be chosen when a large reward comes only late?'),
    ],
    unplugged: L('Banditen mit Losen: Drei Becher enthalten unterschiedlich viele Gewinnlose (unbekannt). Gruppen spielen 20 Züge mit verschiedenen Strategien (immer derselbe Becher, zufällig, ε-gierig) und vergleichen ihre Gewinne.', 'Bandits with tickets: three cups hold different (unknown) numbers of winning tickets. Groups play 20 turns with different strategies (always the same cup, random, ε-greedy) and compare their winnings.'),
  },
  verantwortung: {
    goals: [
      L('Diffusionsmodelle als schrittweises Entrauschen beschreiben', 'describe diffusion models as step-by-step denoising'),
      L('Fairness-Maße (Annahmequote, Trefferquote) berechnen und das Fairness-Dilemma bei verschiedenen Grundraten begründen', 'compute fairness measures (acceptance rate, true positive rate) and justify the fairness dilemma for different base rates'),
      L('Anwendungen den Risikoklassen des AI Act zuordnen und begründet Position beziehen', 'classify applications into the risk classes of the AI Act and take a reasoned position'),
    ],
    misconceptions: [
      { wrong: L('Ob ein Modell fair ist, lässt sich eindeutig ausrechnen.', 'Whether a model is fair can be calculated unambiguously.'), right: L('Es gibt mehrere Fairness-Maße, die sich bei verschiedenen Grundraten widersprechen. Welches gilt, ist eine Wertentscheidung.', 'There are several fairness measures that contradict each other when base rates differ. Which one applies is a decision about values.') },
    ],
    talk: [
      L('Welches Fairness-Maß wäre bei der Kreditvergabe angemessen, welches bei einem medizinischen Test?', 'Which fairness measure would suit lending, and which a medical test?'),
      L('Welche KI-Anwendungen sollten verboten sein? Vergleicht eure Liste mit dem AI Act.', 'Which AI applications should be banned? Compare your list with the AI Act.'),
    ],
    unplugged: L('Fairness-Rollenspiel: Gruppen vertreten Bank, Antragstellende und Aufsicht und verhandeln mit ausgedruckten Zahlen aus dem Spiel, welche Schwellen fair sind.', 'Fairness role play: groups represent the bank, applicants and the regulator and negotiate with printed numbers from the game which thresholds are fair.'),
  },
};
