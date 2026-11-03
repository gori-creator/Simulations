import { L } from '../../curriculum/helpers';
import type { CheckQuestion } from '../types';

/**
 * Vorher-Nachher-Check im KI-Labor: eine Frage je Welt, eigene
 * Formulierungen (Transfer statt Wiedererkennen). Die falschen Antworten
 * greifen typische Fehlvorstellungen auf.
 */
export const CHECK: CheckQuestion[] = [
  {
    world: 'intelligenz',
    question: L('Ein Programm besteht einen Turing-Test. Was ist damit gezeigt?', 'A program passes a Turing test. What has been shown?'),
    options: [
      { text: L('Im Gespräch war es von einem Menschen nicht zu unterscheiden – mehr nicht.', 'In conversation it could not be told apart from a human – nothing more.'), correct: true },
      { text: L('Es versteht, was es sagt, und hat ein Bewusstsein.', 'It understands what it says and is conscious.') },
      { text: L('Es ist in jedem Fachgebiet mindestens so gut wie ein Mensch.', 'It is at least as good as a human in every field.') },
    ],
    explain: L('Turing ersetzte 1950 die Frage „Können Maschinen denken?“ durch einen Verhaltenstest. Ob Verhalten Verstehen beweist, ist umstritten – Searles „Chinesisches Zimmer“ (1980) bestreitet es.', 'In 1950 Turing replaced the question “Can machines think?” with a test of behaviour. Whether behaviour proves understanding is disputed – Searle’s “Chinese Room” (1980) denies it.'),
  },
  {
    world: 'suche',
    question: L('Warum findet die A*-Suche einen kürzesten Weg oft viel schneller als die Breitensuche?', 'Why does A* search often find a shortest path much faster than breadth-first search?'),
    options: [
      { text: L('Sie schätzt die Restentfernung (Heuristik) und untersucht Vielversprechendes zuerst.', 'It estimates the remaining distance (heuristic) and explores promising nodes first.'), correct: true },
      { text: L('Sie geht immer zuerst so tief wie möglich in eine Richtung.', 'It always goes as deep as possible in one direction first.') },
      { text: L('Sie untersucht alle Knoten gleichzeitig statt nacheinander.', 'It explores all nodes at the same time instead of one after another.') },
    ],
    explain: L('A* sortiert nach f(n) = g(n) + h(n): bisherige Kosten plus geschätzte Restkosten. Überschätzt h die Restkosten nie, ist der gefundene Weg trotzdem optimal.', 'A* sorts by f(n) = g(n) + h(n): cost so far plus estimated remaining cost. If h never overestimates the remaining cost, the path found is still optimal.'),
  },
  {
    world: 'daten',
    question: L('Ein Modell erkennt seine Trainingsbilder zu 100 % richtig, neue Bilder aber nur zu 60 %. Was ist am wahrscheinlichsten passiert?', 'A model recognises its training images 100% correctly, but new images only 60%. What has most likely happened?'),
    options: [
      { text: L('Überanpassung: Es hat die Trainingsbilder auswendig gelernt statt allgemeiner Muster.', 'Overfitting: it memorised the training images instead of general patterns.'), correct: true },
      { text: L('Unteranpassung: Das Modell ist zu einfach, um Muster zu erkennen.', 'Underfitting: the model is too simple to recognise patterns.') },
      { text: L('Das Modell braucht bei neuen Bildern einfach mehr Rechenzeit.', 'The model simply needs more computing time for new images.') },
    ],
    explain: L('Sehr gut auf Trainingsdaten, deutlich schlechter auf neuen Daten – das typische Zeichen für Überanpassung. Gegenmittel: mehr und vielfältigere Daten, einfachere Modelle, Regularisierung, früher aufhören.', 'Very good on training data, clearly worse on new data – the typical sign of overfitting. Remedies: more and more varied data, simpler models, regularisation, stopping earlier.'),
  },
  {
    world: 'netze',
    question: L('Warum kann ein einzelnes Perzeptron die XOR-Funktion nicht lernen?', 'Why can a single perceptron not learn the XOR function?'),
    options: [
      { text: L('Es trennt nur mit einer Geraden, XOR ist aber nicht linear trennbar.', 'It only separates with a straight line, but XOR is not linearly separable.'), correct: true },
      { text: L('XOR hat mehr Eingaben, als ein Perzeptron verarbeiten kann.', 'XOR has more inputs than a perceptron can handle.') },
      { text: L('Mit genug Trainingsrunden würde es XOR irgendwann lernen.', 'With enough training rounds it would learn XOR eventually.') },
    ],
    explain: L('Ein Perzeptron zieht eine Gerade (allgemein eine Hyperebene). Bei XOR liegen die Klassen über Kreuz – dafür braucht man mindestens eine verborgene Schicht.', 'A perceptron draws a straight line (in general, a hyperplane). With XOR the classes lie crosswise – you need at least one hidden layer for that.'),
  },
  {
    world: 'sehen',
    question: L('Was macht ein Faltungsfilter in einem Bilderkennungsnetz?', 'What does a convolution filter do in an image recognition network?'),
    options: [
      { text: L('Er gleitet übers Bild und findet mit gewichteten Summen Muster wie Kanten.', 'It slides over the image and finds patterns such as edges with weighted sums.'), correct: true },
      { text: L('Er faltet das Bild zusammen, damit es weniger Speicher braucht.', 'It folds the image up so that it needs less memory.') },
      { text: L('Er vergleicht das ganze Bild mit einer Datenbank fertiger Fotos.', 'It compares the whole image with a database of finished photos.') },
    ],
    explain: L('Derselbe kleine Filter wird an jeder Bildstelle angewendet; seine Gewichte werden gelernt. Frühe Schichten finden Kanten, spätere setzen daraus Formen und Objekte zusammen.', 'The same small filter is applied at every position in the image; its weights are learned. Early layers find edges, later ones combine them into shapes and objects.'),
  },
  {
    world: 'sprache',
    question: L('Was berechnet ein großes Sprachmodell im Kern bei jedem Schritt?', 'At its core, what does a large language model compute at every step?'),
    options: [
      { text: L('Wahrscheinlichkeiten für das nächste Token – eins davon wird gewählt.', 'Probabilities for the next token – one of them is then chosen.'), correct: true },
      { text: L('Die eine richtige Antwort, die in seiner Datenbank steht.', 'The one correct answer stored in its database.') },
      { text: L('Eine Suche im Internet nach Sätzen, die zur Frage passen.', 'A search on the internet for sentences that fit the question.') },
    ],
    explain: L('Ein Sprachmodell setzt Text Token für Token fort. Weil es Wahrscheinlichkeiten aus Mustern berechnet und nicht nachschlägt, kann es flüssig und trotzdem falsch formulieren.', 'A language model continues text token by token. Because it computes probabilities from patterns rather than looking things up, it can write fluently and still be wrong.'),
  },
  {
    world: 'belohnung',
    question: L('Was ist beim bestärkenden Lernen mit „Erkunden oder Ausnutzen“ gemeint?', 'In reinforcement learning, what is meant by “explore or exploit”?'),
    options: [
      { text: L('Das bisher Beste wählen oder Neues ausprobieren, das vielleicht besser ist.', 'Choosing the best so far or trying something new that might be better.'), correct: true },
      { text: L('Ob man den Agenten mit mehr oder mit weniger Daten trainiert.', 'Whether the agent is trained with more or with less data.') },
      { text: L('Ob der Agent Fehler im Spiel ausnutzen darf, um zu gewinnen.', 'Whether the agent may exploit bugs in the game in order to win.') },
    ],
    explain: L('Wer nur ausnutzt, bleibt beim Erstbesten hängen; wer nur erkundet, sammelt den Gewinn nie ein. Verfahren wie ε-greedy mischen beides.', 'If you only exploit, you get stuck with the first good option; if you only explore, you never collect the reward. Methods like ε-greedy mix both.'),
  },
  {
    world: 'verantwortung',
    question: L('Nach welchem Grundsatz regelt der europäische AI Act künstliche Intelligenz?', 'On what principle does the European AI Act regulate artificial intelligence?'),
    options: [
      { text: L('Nach dem Risiko der Anwendung: je gefährlicher, desto strenger die Pflichten.', 'By the risk of the application: the more dangerous, the stricter the obligations.'), correct: true },
      { text: L('Er verbietet alle KI-Systeme, die selbstständig lernen können.', 'It bans all AI systems that can learn on their own.') },
      { text: L('Er schreibt vor, mit welcher Programmiersprache KI gebaut werden muss.', 'It prescribes which programming language AI must be built with.') },
    ],
    explain: L('Der AI Act (in Kraft seit August 2024) unterscheidet unannehmbares, hohes, begrenztes und minimales Risiko. Social Scoring ist zum Beispiel verboten; KI bei der Auswahl von Bewerbungen gilt als hochriskant.', 'The AI Act (in force since August 2024) distinguishes unacceptable, high, limited and minimal risk. Social scoring, for example, is banned; AI used to screen job applications counts as high-risk.'),
  },
];
