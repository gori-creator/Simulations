import { L } from '../../curriculum/helpers';
import type { Course, KnowledgeCard, LessonMeta } from '../types';

/**
 * KI-Labor: Vertiefungskurs für die Oberstufe (Klasse 11–13). Roter Faden:
 * Ada, die Laborassistenz, führt durch die Geschichte der KI – von Turing bis
 * ChatGPT. In jeder Lektion wird eine große Idee mit echter Mathematik
 * nachgebaut (Ableitungen, Wahrscheinlichkeiten, Vektoren, Matrizen).
 * Grundlage u. a.: Vorlesungen „Einführung in die KI“ (TU Chemnitz) und
 * „Grundlagen der KI“ (HTWK Leipzig) – nur als Anregung, Texte eigen.
 * Konzept: docs/KI-KURS-KONZEPT.md.
 */
type Pair = [string, string];

const card = (year: number, title: Pair, text: Pair): KnowledgeCard => ({ year, title: L(...title), text: L(...text) });

/** Noch im Bau (erscheinen auf der Karte als „bald“). */
const SOON = new Set<string>([
  'logikneuron', 'perzeptron', 'ki-winter', 'xor-netz', 'backprop', 'spielplatz',
  'faltung', 'imagenet', 'taeuschung',
  'tokens', 'einbettungen', 'sprachmodell', 'aufmerksamkeit', 'assistent',
  'banditen', 'q-lernen',
  'diffusion', 'fairness', 'ai-act', 'abschluss',
]);

const lesson = (id: string, slug: Pair, title: Pair, teaser: Pair, icon: string, minutes: number, c: KnowledgeCard, extra: Partial<LessonMeta> = {}): LessonMeta => ({
  id,
  status: SOON.has(id) ? 'planned' : 'ready',
  slug: L(...slug),
  title: L(...title),
  teaser: L(...teaser),
  icon,
  minutes,
  card: c,
  ...extra,
});

export const kiLabor: Course = {
  id: 'ki-labor',
  slug: L('ki-labor', 'ai-lab'),
  title: L('KI-Labor', 'AI Lab'),
  tagline: L('Von Turing bis ChatGPT: Baue die großen Ideen der KI selbst nach – mit echter Mathematik.', 'From Turing to ChatGPT: rebuild the big ideas of AI yourself – with real maths.'),
  description: L(
    'Der Kurs für die Oberstufe: Suche und Spielbäume, Regression und Gradientenabstieg, Bayes, Entscheidungsbäume, neuronale Netze mit Backpropagation, Faltung, Tokens, Einbettungen, Attention, bestärkendes Lernen, Diffusion und Fairness – jede Idee zum Ausprobieren, eingeordnet in die Geschichte der KI. Ohne Anmeldung.',
    'The course for upper school: search and game trees, regression and gradient descent, Bayes, decision trees, neural networks with backpropagation, convolution, tokens, embeddings, attention, reinforcement learning, diffusion and fairness – every idea hands-on, placed in the history of AI. No sign-up.',
  ),
  audience: L('Klasse 11–13', 'Years 11–13'),
  grades: [11, 13],
  guide: 'ada',
  guideName: 'Ada',
  levels: [
    L('Lochkarte', 'Punch card'),
    L('Relais', 'Relay'),
    L('Röhre', 'Vacuum tube'),
    L('Transistor', 'Transistor'),
    L('Mikrochip', 'Microchip'),
    L('Prozessor', 'Processor'),
    L('Grafikprozessor', 'GPU'),
    L('Tensorchip', 'Tensor chip'),
    L('Rechenzentrum', 'Data centre'),
    L('Supercomputer', 'Supercomputer'),
  ],
  finalBadge: { icon: '🎓', title: L('Laborabschluss', 'Lab graduate'), text: L('Alle Experimente im KI-Labor geschafft.', 'Finished every experiment in the AI Lab.') },
  voice: {
    perfect: L('Fehlerfrei – das Experiment ist gelungen. Ich trage es ins Laborbuch ein.', 'Flawless – the experiment worked. I’m adding it to the lab book.'),
    done: L('Experiment abgeschlossen. Fehler gehören zur Forschung – du kannst es jederzeit wiederholen.', 'Experiment complete. Mistakes are part of research – you can repeat it any time.'),
  },
  chapters: [
    {
      id: 'intelligenz',
      icon: '🧩',
      era: L('1950–1980', '1950–1980'),
      title: L('Was heißt hier Intelligenz?', 'What do we mean by intelligence?'),
      blurb: L('Turing-Test, Chinesisches Zimmer, starke und schwache KI – und die ersten Programme, die mit Regeln „denken“.', 'Turing test, Chinese room, strong and weak AI – and the first programs that “think” with rules.'),
      lessons: [
        lesson('imitationsspiel', ['das-imitationsspiel', 'the-imitation-game'], ['Das Imitationsspiel', 'The imitation game'], ['Mensch oder Maschine? Sei die Jury im Turing-Test – und prüfe, was er wirklich misst.', 'Human or machine? Be the judge in the Turing test – and check what it really measures.'], '🎭', 10,
          card(1950, ['Computing Machinery and Intelligence', 'Computing Machinery and Intelligence'], ['Alan Turing ersetzt die Frage „Können Maschinen denken?“ durch ein überprüfbares Spiel. Er sagt voraus, dass um das Jahr 2000 eine Jury nach fünf Minuten Chat in höchstens 70 % der Fälle richtig liegt.', 'Alan Turing replaces the question “can machines think?” with a testable game. He predicts that around the year 2000 a judge will be right in at most 70% of cases after five minutes of chat.'])),
        lesson('eliza', ['eliza', 'eliza'], ['ELIZA unter der Haube', 'ELIZA under the hood'], ['Chatte mit dem Chatbot von 1966 – und sieh dir an, welche Regel gerade antwortet.', 'Chat with the 1966 chatbot – and watch which rule is answering.'], '💭', 10,
          card(1966, ['ELIZA', 'ELIZA'], ['Joseph Weizenbaum veröffentlicht ELIZA: Schlüsselwörter suchen, Satzteile umstellen, Pronomen tauschen. Dass Menschen dem Programm Gefühle zuschrieben, nennt man seitdem ELIZA-Effekt.', 'Joseph Weizenbaum publishes ELIZA: find keywords, rearrange phrases, swap pronouns. People attributing feelings to the program has since been called the ELIZA effect.'])),
        lesson('expertensystem', ['expertensystem', 'expert-system'], ['Wissen in Regeln', 'Knowledge in rules'], ['Ein Expertensystem schließt aus Fakten und Wenn-dann-Regeln. Bis ein neuer Fall alles durcheinanderbringt …', 'An expert system reasons from facts and if-then rules. Until a new case throws everything off …'], '📜', 12,
          card(1976, ['MYCIN', 'MYCIN'], ['An der Stanford University entsteht MYCIN: mehrere hundert Wenn-dann-Regeln für Infektionen und Antibiotika. In Tests war es so gut wie Fachleute – im Krankenhaus eingesetzt wurde es nie.', 'MYCIN is built at Stanford University: several hundred if-then rules for infections and antibiotics. In tests it was as good as specialists – yet it was never used in hospitals.']),
          { boss: true }),
      ],
    },
    {
      id: 'suche',
      icon: '♟️',
      era: L('1956–2016', '1956–2016'),
      title: L('Suchen und Spielen', 'Search and games'),
      blurb: L('Probleme als Zustände und Züge: Breitensuche, A*, Minimax, Alpha-Beta und Monte-Carlo-Spiele.', 'Problems as states and moves: breadth-first search, A*, minimax, alpha-beta and Monte Carlo playouts.'),
      lessons: [
        lesson('wegsuche', ['wegsuche', 'path-search'], ['Den Weg finden', 'Finding the way'], ['Breitensuche, Tiefensuche oder A*? Vergleiche, wie viele Felder jede Suche anfassen muss.', 'Breadth-first, depth-first or A*? Compare how many cells each search has to touch.'], '🧭', 12,
          card(1968, ['A*', 'A*'], ['Peter Hart, Nils Nilsson und Bertram Raphael entwickeln für den Roboter Shakey die A*-Suche: bisherige Kosten plus geschätzte Restkosten. Navis und Spiele nutzen sie bis heute.', 'Peter Hart, Nils Nilsson and Bertram Raphael develop A* search for the robot Shakey: cost so far plus estimated remaining cost. Navigation and games still use it.'])),
        lesson('minimax', ['minimax', 'minimax'], ['Minimax und Alpha-Beta', 'Minimax and alpha-beta'], ['Tic-Tac-Toe gegen einen Spielbaum: Wie tief muss er rechnen, um unschlagbar zu sein?', 'Noughts and crosses against a game tree: how deep must it calculate to be unbeatable?'], '⭕', 12,
          card(1997, ['Deep Blue', 'Deep Blue'], ['IBMs Deep Blue besiegt Schachweltmeister Garri Kasparow mit 3,5 : 2,5. Seine Stärke: Alpha-Beta-Suche auf Spezialchips, 100 bis 200 Millionen Stellungen pro Sekunde, und eine von Hand gebaute Stellungsbewertung.', 'IBM’s Deep Blue beats world chess champion Garry Kasparov 3.5 to 2.5. Its strength: alpha-beta search on special chips, 100 to 200 million positions per second, and a hand-built evaluation function.'])),
        lesson('monte-carlo', ['monte-carlo-suche', 'monte-carlo-search'], ['Zufall als Ratgeber', 'Randomness as adviser'], ['Wenn der Baum zu groß ist: Spiel tausend zufällige Partien und zähl die Siege.', 'When the tree is too big: play a thousand random games and count the wins.'], '🎲', 12,
          card(2016, ['AlphaGo', 'AlphaGo'], ['AlphaGo besiegt Lee Sedol im Go mit 4 : 1. Es verbindet Monte-Carlo-Baumsuche mit zwei neuronalen Netzen (welcher Zug? wie gut steht es?), trainiert mit Profipartien und Spielen gegen sich selbst.', 'AlphaGo beats Lee Sedol at Go 4 to 1. It combines Monte Carlo tree search with two neural networks (which move? how good is the position?), trained on expert games and self-play.']),
          { boss: true }),
      ],
    },
    {
      id: 'daten',
      icon: '📈',
      era: L('1763–1995', '1763–1995'),
      title: L('Lernen aus Daten', 'Learning from data'),
      blurb: L('Statistisches Lernen: Fehlerfunktion, Gradientenabstieg, Überanpassung, Bayes und Information.', 'Statistical learning: loss function, gradient descent, overfitting, Bayes and information.'),
      lessons: [
        lesson('regression', ['die-beste-gerade', 'the-best-line'], ['Die beste Gerade', 'The best line'], ['Leg eine Gerade durch Messpunkte. Die Quadrate der Abweichungen zeigen, wie gut sie passt.', 'Fit a line through data points. The squares of the residuals show how well it fits.'], '📏', 10,
          card(1805, ['Methode der kleinsten Quadrate', 'Method of least squares'], ['Adrien-Marie Legendre veröffentlicht, wie man aus ungenauen Messungen die beste Bahn berechnet: Die Summe der quadrierten Abweichungen soll minimal sein. Gauß nutzte die Idee nach eigener Aussage schon vorher.', 'Adrien-Marie Legendre publishes how to compute the best curve from inaccurate measurements: minimise the sum of squared deviations. Gauss said he had used the idea before.'])),
        lesson('gradient', ['gradientenabstieg', 'gradient-descent'], ['Gradientenabstieg', 'Gradient descent'], ['Die Fehlerfunktion ist eine Landschaft. Die Ableitung zeigt bergab – aber wie groß darf der Schritt sein?', 'The loss function is a landscape. The derivative points downhill – but how big can the step be?'], '⛰️', 12,
          card(1847, ['Cauchys Abstiegsverfahren', 'Cauchy’s descent method'], ['Augustin-Louis Cauchy schlägt vor, Gleichungssysteme zu lösen, indem man immer in Richtung des steilsten Abstiegs geht. Heute trainiert dieses Verfahren Netze mit Milliarden Parametern.', 'Augustin-Louis Cauchy proposes solving systems of equations by always moving in the direction of steepest descent. Today this method trains networks with billions of parameters.'])),
        lesson('ueberanpassung', ['ueberanpassung', 'overfitting'], ['Überanpassung', 'Overfitting'], ['Ein Polynom vom Grad 9 trifft jeden Trainingspunkt – und versagt im Test. Finde den besten Grad.', 'A degree-9 polynomial hits every training point – and fails the test. Find the best degree.'], '🎢', 12,
          card(1974, ['Kreuzvalidierung', 'Cross-validation'], ['Mervyn Stone beschreibt, wie man ein Modell mit Daten bewertet, die beim Anpassen nicht benutzt wurden. Trainingsfehler und Testfehler zu trennen ist seitdem Grundregel des maschinellen Lernens.', 'Mervyn Stone describes how to assess a model with data not used for fitting. Separating training error from test error has been a basic rule of machine learning ever since.'])),
        lesson('bayes', ['der-spamfilter', 'the-spam-filter'], ['Der Spamfilter', 'The spam filter'], ['Mit dem Satz von Bayes rechnet ein Filter aus Wörtern eine Spam-Wahrscheinlichkeit aus.', 'With Bayes’ theorem a filter turns words into a spam probability.'], '📧', 12,
          card(1763, ['Der Satz von Bayes', 'Bayes’ theorem'], ['Richard Price veröffentlicht nach dem Tod von Thomas Bayes dessen Aufsatz über das Lernen aus Beobachtungen. 2002 macht Paul Graham den „Bayes-Filter“ gegen Spam bekannt.', 'Richard Price publishes Thomas Bayes’ essay on learning from observations after Bayes’ death. In 2002 Paul Graham popularises the “Bayesian filter” against spam.'])),
        lesson('entscheidungsbaum', ['entscheidungsbaum', 'decision-tree'], ['Bäume aus Information', 'Trees from information'], ['Welche Frage verrät am meisten? Entropie und Informationsgewinn bauen den Baum.', 'Which question reveals the most? Entropy and information gain build the tree.'], '🌳', 14,
          card(1986, ['ID3', 'ID3'], ['Ross Quinlan veröffentlicht ID3: Ein Entscheidungsbaum wächst, indem an jedem Knoten das Merkmal mit dem größten Informationsgewinn gewählt wird – gemessen mit Shannons Entropie von 1948.', 'Ross Quinlan publishes ID3: a decision tree grows by choosing, at each node, the feature with the largest information gain – measured with Shannon’s entropy from 1948.']),
          { boss: true }),
      ],
    },
    {
      id: 'netze',
      icon: '🧠',
      era: L('1943–1989', '1943–1989'),
      title: L('Neuronale Netze', 'Neural networks'),
      blurb: L('Vom Logik-Neuron über den ersten KI-Winter bis zu Backpropagation und tiefen Netzen.', 'From the logic neuron through the first AI winter to backpropagation and deep networks.'),
      lessons: [
        lesson('logikneuron', ['neuronen-als-logik', 'neurons-as-logic'], ['Neuronen als Logik', 'Neurons as logic'], ['Baue UND, ODER und NICHT aus Gewichten und Schwellen. Und dann: XOR.', 'Build AND, OR and NOT from weights and thresholds. And then: XOR.'], '🔣', 10,
          card(1943, ['McCulloch-Pitts-Neuron', 'McCulloch–Pitts neuron'], ['Warren McCulloch und Walter Pitts zeigen: Netze aus einfachen Schwellenneuronen können jede logische Verknüpfung berechnen. Das Gehirn als Rechenmaschine – eine folgenreiche Idee.', 'Warren McCulloch and Walter Pitts show that networks of simple threshold neurons can compute any logical function. The brain as a computing machine – an idea with big consequences.'])),
        lesson('perzeptron', ['das-perzeptron', 'the-perceptron'], ['Rosenblatts Perzeptron', 'Rosenblatt’s perceptron'], ['Die Lernregel w ← w + η·y·x dreht die Trenngerade, bis alles stimmt – wenn es geht.', 'The learning rule w ← w + η·y·x turns the separating line until everything is right – if possible.'], '🎯', 12,
          card(1958, ['Mark I Perceptron', 'Mark I Perceptron'], ['Frank Rosenblatt stellt das Perzeptron vor, das seine Gewichte aus Fehlern lernt. Die New York Times berichtet, die Navy erwarte eine Maschine, die laufen, sprechen und sehen kann.', 'Frank Rosenblatt presents the perceptron, which learns its weights from errors. The New York Times reports that the Navy expects a machine that can walk, talk and see.'])),
        lesson('ki-winter', ['der-ki-winter', 'the-ai-winter'], ['Der erste KI-Winter', 'The first AI winter'], ['Eine Gerade kann XOR nicht trennen. Was folgte, waren gekürzte Gelder – und viel Zweifel.', 'A line cannot separate XOR. What followed were funding cuts – and a lot of doubt.'], '❄️', 10,
          card(1969, ['„Perceptrons“', '“Perceptrons”'], ['Marvin Minsky und Seymour Papert beweisen die Grenzen einschichtiger Perzeptronen, etwa beim XOR-Problem. Zusammen mit dem kritischen Lighthill-Bericht (1973) folgt eine lange Flaute für neuronale Netze.', 'Marvin Minsky and Seymour Papert prove the limits of single-layer perceptrons, for example on XOR. Together with the critical Lighthill report (1973), a long slump for neural networks follows.'])),
        lesson('xor-netz', ['die-verborgene-schicht', 'the-hidden-layer'], ['Die verborgene Schicht', 'The hidden layer'], ['Zwei verborgene Neuronen falten den Raum um – plötzlich lässt sich XOR mit einer Geraden trennen.', 'Two hidden neurons fold space – suddenly XOR can be separated by a line.'], '🪄', 12,
          card(1986, ['Gelernte Darstellungen', 'Learned representations'], ['Rumelhart, Hinton und Williams zeigen in „Learning representations by back-propagating errors“, dass verborgene Neuronen selbst nützliche Merkmale lernen. Die neuronalen Netze kehren zurück.', 'Rumelhart, Hinton and Williams show in “Learning representations by back-propagating errors” that hidden units learn useful features by themselves. Neural networks return.'])),
        lesson('backprop', ['backpropagation', 'backpropagation'], ['Backpropagation', 'Backpropagation'], ['Die Kettenregel als Staffellauf: Der Fehler läuft rückwärts durch das Netz, Knoten für Knoten.', 'The chain rule as a relay: the error runs backwards through the network, node by node.'], '🔁', 14,
          card(1970, ['Rückwärts ableiten', 'Differentiating backwards'], ['Seppo Linnainmaa beschreibt in seiner Masterarbeit, wie man Ableitungen langer Rechenketten effizient rückwärts berechnet. Genau das macht Backpropagation in neuronalen Netzen.', 'In his master’s thesis Seppo Linnainmaa describes how to compute derivatives of long chains of calculations efficiently backwards. That is exactly what backpropagation does in neural networks.'])),
        lesson('spielplatz', ['netz-spielplatz', 'network-playground'], ['Netz-Spielplatz', 'Network playground'], ['Trainiere echte Netze auf Kreisen, XOR und Spiralen. Wie klein darf das Netz sein?', 'Train real networks on circles, XOR and spirals. How small can the network be?'], '🕹️', 15,
          card(1989, ['Der Approximationssatz', 'The approximation theorem'], ['George Cybenko beweist: Schon ein Netz mit einer verborgenen Schicht kann jede stetige Funktion beliebig genau annähern – wenn es genug Neuronen hat. Wie man sie findet, sagt der Satz nicht.', 'George Cybenko proves that a network with a single hidden layer can approximate any continuous function arbitrarily well – given enough neurons. How to find them, the theorem doesn’t say.']),
          { boss: true }),
      ],
    },
    {
      id: 'sehen',
      icon: '👁️',
      era: L('1959–2015', '1959–2015'),
      title: L('Maschinen sehen', 'Machines that see'),
      blurb: L('Faltung und Filter, der ImageNet-Durchbruch – und Bilder, die ein Netz gezielt täuschen.', 'Convolution and filters, the ImageNet breakthrough – and images that deliberately fool a network.'),
      lessons: [
        lesson('faltung', ['faltung', 'convolution'], ['Faltung: Filter für Bilder', 'Convolution: filters for images'], ['Ein 3×3-Filter wandert über das Bild und findet Kanten. Entwirf deinen eigenen.', 'A 3×3 filter slides over the image and finds edges. Design your own.'], '🔲', 12,
          card(1959, ['Kantenzellen im Gehirn', 'Edge cells in the brain'], ['David Hubel und Torsten Wiesel finden in der Sehrinde von Katzen Nervenzellen, die auf Kanten in bestimmter Richtung reagieren (Nobelpreis 1981). Faltungsnetze lernen ganz ähnliche Filter.', 'David Hubel and Torsten Wiesel find nerve cells in the visual cortex of cats that respond to edges in a particular direction (Nobel Prize 1981). Convolutional networks learn very similar filters.'])),
        lesson('imagenet', ['der-durchbruch-2012', 'the-2012-breakthrough'], ['Der Durchbruch 2012', 'The 2012 breakthrough'], ['Daten, Grafikkarten, tiefe Netze: Warum die Fehlerquote plötzlich abstürzte.', 'Data, graphics cards, deep networks: why the error rate suddenly crashed.'], '🚀', 10,
          card(2012, ['AlexNet', 'AlexNet'], ['Alex Krizhevsky, Ilya Sutskever und Geoffrey Hinton gewinnen den ImageNet-Wettbewerb mit einem tiefen Faltungsnetz, trainiert auf zwei Grafikkarten: 15,3 % Fehler statt 26,2 % beim Zweitplatzierten.', 'Alex Krizhevsky, Ilya Sutskever and Geoffrey Hinton win the ImageNet competition with a deep convolutional network trained on two graphics cards: 15.3% error versus 26.2% for second place.'])),
        lesson('taeuschung', ['optische-taeuschung-fuer-ki', 'fooling-the-network'], ['Täuschung für Netze', 'Fooling the network'], ['Ein paar winzige Änderungen, und aus „Kreis“ wird „Kreuz“. Finde die Schwachstelle.', 'A few tiny changes and “circle” becomes “cross”. Find the weak spot.'], '🎯', 12,
          card(2013, ['Gegnerische Beispiele', 'Adversarial examples'], ['Christian Szegedy und Kollegen zeigen: Kaum sichtbare Änderungen an einem Bild können ein Netz völlig in die Irre führen. Seitdem ist Robustheit ein eigenes Forschungsgebiet.', 'Christian Szegedy and colleagues show that barely visible changes to an image can completely mislead a network. Robustness has been a research field of its own ever since.']),
          { boss: true }),
      ],
    },
    {
      id: 'sprache',
      icon: '💬',
      era: L('1948–2022', '1948–2022'),
      title: L('Maschinen sprechen', 'Machines that talk'),
      blurb: L('Tokens, Einbettungen, Wahrscheinlichkeiten fürs nächste Token, Attention – und wie aus einem Sprachmodell ein Assistent wird.', 'Tokens, embeddings, probabilities for the next token, attention – and how a language model becomes an assistant.'),
      lessons: [
        lesson('tokens', ['tokens', 'tokens'], ['Tokens', 'Tokens'], ['Sprachmodelle lesen keine Wörter, sondern Tokens. Bau sie selbst mit Byte-Pair-Encoding.', 'Language models don’t read words but tokens. Build them yourself with byte-pair encoding.'], '🧱', 12,
          card(2016, ['Teilwörter für Übersetzer', 'Subwords for translators'], ['Rico Sennrich, Barry Haddow und Alexandra Birch übertragen Byte-Pair-Encoding, ein Kompressionsverfahren von 1994, auf Sprache. Seitdem zerlegen fast alle Sprachmodelle Text in Teilwörter.', 'Rico Sennrich, Barry Haddow and Alexandra Birch apply byte-pair encoding, a compression method from 1994, to language. Since then almost all language models split text into subwords.'])),
        lesson('einbettungen', ['woerter-als-vektoren', 'words-as-vectors'], ['Wörter als Vektoren', 'Words as vectors'], ['König − Mann + Frau = ? Rechne mit Bedeutungen und miss Ähnlichkeit mit dem Kosinus.', 'King − man + woman = ? Calculate with meanings and measure similarity with the cosine.'], '🧭', 12,
          card(2013, ['word2vec', 'word2vec'], ['Tomáš Mikolov und Kollegen bei Google lernen Wortvektoren aus Milliarden Wörtern. Richtungen im Raum tragen Bedeutung – und spiegeln auch Vorurteile aus den Texten.', 'Tomáš Mikolov and colleagues at Google learn word vectors from billions of words. Directions in the space carry meaning – and also mirror prejudices from the texts.'])),
        lesson('sprachmodell', ['das-naechste-token', 'the-next-token'], ['Das nächste Token', 'The next token'], ['Ein n-Gramm-Modell mit Temperatur: von langweilig bis wirr. Und warum es Fakten erfinden kann.', 'An n-gram model with temperature: from boring to garbled. And why it can make up facts.'], '🌡️', 14,
          card(1948, ['Eine Theorie der Information', 'A theory of information'], ['Claude Shannon erzeugt Texte aus Wahrscheinlichkeiten für das nächste Wort. Schon 1913 hatte Andrei Markow Buchstabenfolgen in Puschkins „Eugen Onegin“ gezählt.', 'Claude Shannon generates text from probabilities for the next word. As early as 1913 Andrey Markov had counted letter sequences in Pushkin’s “Eugene Onegin”.'])),
        lesson('aufmerksamkeit', ['aufmerksamkeit', 'attention'], ['Aufmerksamkeit', 'Attention'], ['Worauf bezieht sich „er“? Query mal Key, Softmax – und das Wort findet seinen Bezug.', 'What does “it” refer to? Query times key, softmax – and the word finds what it refers to.'], '🔦', 14,
          card(2017, ['Attention Is All You Need', 'Attention Is All You Need'], ['Ein Team bei Google stellt den Transformer vor: Jedes Token gewichtet alle anderen Tokens mit Aufmerksamkeit. Auf dieser Bauart beruhen GPT und fast alle heutigen Sprachmodelle.', 'A team at Google introduces the transformer: every token weighs all other tokens with attention. GPT and almost all of today’s language models are built this way.'])),
        lesson('assistent', ['vom-modell-zum-assistenten', 'from-model-to-assistant'], ['Vom Modell zum Assistenten', 'From model to assistant'], ['Du bewertest Antworten, ein Belohnungsmodell lernt deine Vorlieben. Was kann dabei schiefgehen?', 'You rate answers, a reward model learns your preferences. What can go wrong?'], '🧑‍🏫', 14,
          card(2022, ['ChatGPT', 'ChatGPT'], ['OpenAI veröffentlicht ChatGPT. Das Sprachmodell wurde nach dem Vortraining mit Beispielantworten und mit Bewertungen von Menschen weiter trainiert (RLHF) – erst dadurch wurde es zum hilfreichen Gesprächspartner.', 'OpenAI releases ChatGPT. After pre-training, the language model was trained further with example answers and human ratings (RLHF) – only then did it become a helpful conversational partner.']),
          { boss: true }),
      ],
    },
    {
      id: 'belohnung',
      icon: '🎮',
      era: L('1952–2016', '1952–2016'),
      title: L('Lernen durch Belohnung', 'Learning from rewards'),
      blurb: L('Bestärkendes Lernen: Erkunden gegen Ausnutzen, Q-Werte, Diskontierung.', 'Reinforcement learning: explore versus exploit, Q-values, discounting.'),
      lessons: [
        lesson('banditen', ['erkunden-oder-ausnutzen', 'explore-or-exploit'], ['Erkunden oder ausnutzen', 'Explore or exploit'], ['Vier Automaten mit unbekannten Chancen. Schlägst du die ε-gierige Strategie?', 'Four machines with unknown odds. Can you beat the ε-greedy strategy?'], '🎰', 12,
          card(1952, ['Das Banditen-Problem', 'The bandit problem'], ['Herbert Robbins formuliert, wie man zwischen unbekannten Möglichkeiten wählt und dabei möglichst wenig verliert. Online-Werbung, Studien und Empfehlungen nutzen solche Verfahren.', 'Herbert Robbins formulates how to choose between unknown options while losing as little as possible. Online advertising, trials and recommendations use such methods.'])),
        lesson('q-lernen', ['q-lernen', 'q-learning'], ['Q-Lernen', 'Q-learning'], ['Ein Agent lernt im Gitter: Q(s,a) ← Q + α(r + γ·max Q′ − Q). Wie weit denkt er voraus?', 'An agent learns in a grid: Q(s,a) ← Q + α(r + γ·max Q′ − Q). How far ahead does it look?'], '🤖', 15,
          card(1989, ['Q-Lernen', 'Q-learning'], ['Chris Watkins beschreibt in seiner Doktorarbeit das Q-Lernen. 2013 lernt ein Programm von DeepMind damit Atari-Spiele direkt aus den Bildschirmpunkten.', 'Chris Watkins describes Q-learning in his PhD thesis. In 2013 a DeepMind program uses it to learn Atari games directly from the screen pixels.']),
          { boss: true }),
      ],
    },
    {
      id: 'verantwortung',
      icon: '⚖️',
      era: L('2014–heute', '2014–today'),
      title: L('Generative KI und Verantwortung', 'Generative AI and responsibility'),
      blurb: L('Bilder aus Rauschen, Fairness messen, Regeln für KI – und deine eigene Position.', 'Images from noise, measuring fairness, rules for AI – and your own position.'),
      lessons: [
        lesson('diffusion', ['aus-rauschen-wird-bild', 'from-noise-to-image'], ['Aus Rauschen wird Bild', 'From noise to image'], ['Ein Diffusionsmodell entrauscht Schritt für Schritt. Was kann es erzeugen – und was nicht?', 'A diffusion model denoises step by step. What can it create – and what not?'], '🌫️', 14,
          card(2020, ['Diffusionsmodelle', 'Diffusion models'], ['Jonathan Ho, Ajay Jain und Pieter Abbeel zeigen, dass Netze, die Rauschen schrittweise entfernen, hochwertige Bilder erzeugen. Die Idee stammt von 2015; bald folgen Bildgeneratoren aus Text.', 'Jonathan Ho, Ajay Jain and Pieter Abbeel show that networks which remove noise step by step can generate high-quality images. The idea dates from 2015; text-to-image generators soon follow.'])),
        lesson('fairness', ['fairness-messen', 'measuring-fairness'], ['Fairness messen', 'Measuring fairness'], ['Zwei Gruppen, eine Schwelle: Gleiche Quoten oder gleiche Fehler? Beides zugleich geht oft nicht.', 'Two groups, one threshold: equal rates or equal errors? Often you can’t have both.'], '📊', 14,
          card(2016, ['COMPAS', 'COMPAS'], ['Die Redaktion ProPublica untersucht COMPAS, ein Programm, das in den USA die Rückfallgefahr Angeklagter schätzt. Ergebnis: ungleiche Fehlerraten für Schwarze und weiße Angeklagte – und ein Streit darüber, was „fair“ bedeutet.', 'The newsroom ProPublica examines COMPAS, a program used in the US to estimate defendants’ risk of reoffending. Result: unequal error rates for Black and white defendants – and a dispute about what “fair” means.'])),
        lesson('ai-act', ['regeln-fuer-ki', 'rules-for-ai'], ['Regeln für KI', 'Rules for AI'], ['Verboten, Hochrisiko, Transparenz, minimal: Ordne Anwendungen nach dem AI Act ein.', 'Banned, high-risk, transparency, minimal: classify applications under the AI Act.'], '🇪🇺', 10,
          card(2024, ['Der AI Act', 'The AI Act'], ['Die EU-Verordnung über künstliche Intelligenz tritt am 1. August in Kraft – das erste umfassende KI-Gesetz der Welt. Ihre Pflichten gelten schrittweise in den Jahren danach.', 'The EU regulation on artificial intelligence enters into force on 1 August – the world’s first comprehensive AI law. Its obligations apply step by step in the following years.'])),
        lesson('abschluss', ['die-letzte-mission', 'the-final-mission'], ['Die letzte Mission', 'The final mission'], ['Der ganze Zeitstrahl, die großen Streitfragen und deine Position: Was soll KI dürfen?', 'The whole timeline, the big debates and your position: what should AI be allowed to do?'], '🎓', 15,
          card(2026, ['Deine Position', 'Your position'], ['Ob Arbeit, Wahrheit, Kontrolle oder Klima: Wie KI eingesetzt wird, ist keine Naturgewalt, sondern eine Entscheidung von Menschen. Du weißt jetzt genug, um mitzuentscheiden.', 'Work, truth, control or climate: how AI is used is not a force of nature but a human decision. You now know enough to have your say.']),
          { boss: true }),
      ],
    },
  ],
};
