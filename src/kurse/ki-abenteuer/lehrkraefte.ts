import { L } from '../../curriculum/helpers';
import type { WorldGuide } from '../types';

/**
 * Handreichung für Lehrkräfte zum KI-Abenteuer (Seite …/ki-abenteuer/lehrkraefte/).
 * Je Welt: Lernziele, typische Fehlvorstellung, Gesprächsimpulse, eine Idee
 * ohne Computer. Fehlvorstellungen nach Mertala, Fagerlund & Calderon (2022)
 * und Marx, Leonhardt & Bergner (2023); Ideen ohne Computer angelehnt an
 * „AI Unplugged“ (Lindner, Seegerer & Romeike 2019) – in eigenen Worten.
 */
export const GUIDES: Record<string, WorldGuide> = {
  erwachen: {
    goals: [
      L('den Unterschied zwischen fest geschriebenen Regeln und Lernen aus Beispielen erklären', 'explain the difference between hand-written rules and learning from examples'),
      L('KI-Anwendungen im Alltag erkennen (Sprachassistent, Gesichtserkennung, Übersetzer, Empfehlungen)', 'recognise AI applications in everyday life (voice assistants, face recognition, translators, recommendations)'),
      L('begründen, warum mehr und vielfältigere Beispiele ein Modell verbessern', 'explain why more and more varied examples improve a model'),
    ],
    misconceptions: [
      { wrong: L('KI ist ein Roboter mit eigenem Willen.', 'AI is a robot with a will of its own.'), right: L('KI ist meist unsichtbare Software, die aus Daten gelernt hat. Bit ist nur eine gezeichnete Figur.', 'AI is usually invisible software that has learned from data. Bit is just a drawn character.') },
      { wrong: L('Jedes Computerprogramm ist KI.', 'Every computer program is AI.'), right: L('Ein Taschenrechner folgt festen Regeln. Von KI spricht man meist, wenn ein Programm aus Daten gelernt hat.', 'A calculator follows fixed rules. People usually speak of AI when a program has learned from data.') },
    ],
    talk: [
      L('Wo seid ihr heute schon KI begegnet? Woran habt ihr es gemerkt – oder nicht gemerkt?', 'Where have you already met AI today? How did you notice it – or not?'),
      L('Warum ist es so schwer, eine Katze mit Regeln zu beschreiben?', 'Why is it so hard to describe a cat with rules?'),
    ],
    unplugged: L('Regel-Wettbewerb: Gruppen schreiben Regeln, die Katzen von Hunden unterscheiden; die anderen suchen Gegenbeispiele (Fotos, Zeichnungen). Danach sortiert die Klasse neue Bilder nur nach Ähnlichkeit zu Beispielen – ohne Regeln.', 'Rule contest: groups write rules that tell cats from dogs; the others look for counter-examples (photos, drawings). Then the class sorts new pictures only by similarity to examples – without rules.'),
  },
  vorfahren: {
    goals: [
      L('den Turing-Test beschreiben und sagen, was er misst und was nicht', 'describe the Turing test and say what it measures and what it doesn’t'),
      L('erklären, wie ELIZA mit Regeln antwortet, ohne etwas zu verstehen', 'explain how ELIZA answers with rules without understanding anything'),
      L('erkennen, dass Spielcomputer durch Vorausrechnen vieler Züge spielen', 'recognise that game computers play by calculating many moves ahead'),
    ],
    misconceptions: [
      { wrong: L('Wenn ein Chatbot wie ein Mensch schreibt, versteht er auch, was er sagt.', 'If a chatbot writes like a person, it also understands what it says.'), right: L('Überzeugend klingen heißt nicht verstehen. Schon ELIZA (1966) hat Menschen mit einfachen Regeln getäuscht.', 'Sounding convincing doesn’t mean understanding. ELIZA (1966) already fooled people with simple rules.') },
    ],
    talk: [
      L('Würdet ihr merken, ob ihr mit einem Menschen oder einem Programm chattet? Woran?', 'Would you notice whether you are chatting with a person or a program? How?'),
      L('Warum fühlten sich Menschen von ELIZA verstanden, obwohl sie nur Regeln abarbeitete?', 'Why did people feel understood by ELIZA although it only followed rules?'),
    ],
    unplugged: L('Turing-Spiel im Klassenraum: Zwei Freiwillige beantworten schriftlich Fragen der Klasse, eine davon nur mit einer Karte fester Regeln („Wenn jemand ‚Ich bin …‘ schreibt, antworte ‚Warum bist du …?‘“). Die Klasse rät, wer wer ist.', 'Turing game in class: two volunteers answer the class’s questions in writing, one of them only with a card of fixed rules (“If someone writes ‘I am …’, answer ‘Why are you …?’”). The class guesses who is who.'),
  },
  daten: {
    goals: [
      L('Merkmale wählen, die Gruppen gut trennen, und nutzlose Merkmale erkennen', 'choose features that separate groups well and recognise useless ones'),
      L('ein Punktdiagramm lesen und eine Trennlinie zwischen zwei Gruppen ziehen', 'read a scatter plot and draw a dividing line between two groups'),
      L('erklären, wie falsch beschriftete Daten ein Modell verschlechtern', 'explain how wrongly labelled data make a model worse'),
    ],
    misconceptions: [
      { wrong: L('Die KI weiß selbst, worauf es ankommt.', 'The AI knows by itself what matters.'), right: L('Welche Merkmale und Beispiele ein Modell bekommt, entscheiden Menschen. Schlechte Merkmale oder falsche Etiketten führen zu schlechter KI.', 'People decide which features and examples a model gets. Poor features or wrong labels lead to poor AI.') },
    ],
    talk: [
      L('Welche Merkmale würdet ihr nehmen, um Äpfel und Birnen zu unterscheiden? Welche wären nutzlos?', 'Which features would you use to tell apples from pears? Which would be useless?'),
      L('Wer schreibt eigentlich die Etiketten an Trainingsdaten – und was passiert, wenn sich jemand irrt?', 'Who actually writes the labels on training data – and what happens if someone makes a mistake?'),
    ],
    unplugged: L('Obst vermessen: Die Klasse misst echtes Obst (Länge, Breite), trägt jedes Stück als Punkt an der Tafel ein und sucht eine Trennlinie. Ein absichtlich falsch beschriftetes Stück zeigt, was falsche Daten anrichten.', 'Measuring fruit: the class measures real fruit (length, width), plots each piece as a point on the board and looks for a dividing line. One deliberately mislabelled piece shows what wrong data can do.'),
  },
  lernen: {
    goals: [
      L('das Nächste-Nachbarn-Verfahren anwenden und die Wahl von k begründen', 'apply the nearest-neighbour method and justify the choice of k'),
      L('einen Entscheidungsbaum mit wenigen, guten Fragen bauen', 'build a decision tree with a few good questions'),
      L('Lernen mit Etiketten von Gruppenfinden ohne Etiketten (k-Means) unterscheiden', 'distinguish learning with labels from finding groups without labels (k-means)'),
      L('erklären, warum man mit neuen Daten prüft, und einen ehrlichen Modell-Steckbrief ausfüllen', 'explain why we test with new data and fill in an honest model card'),
    ],
    misconceptions: [
      { wrong: L('Wenn eine KI beim Üben alles richtig hat, ist sie perfekt.', 'If an AI gets everything right in practice, it is perfect.'), right: L('Erst die Probe mit neuen Beispielen zeigt, was sie kann. Auswendig gelernte Beispiele helfen dort nicht (Überanpassung).', 'Only a test with new examples shows what it can do. Memorised examples don’t help there (overfitting).') },
    ],
    talk: [
      L('Warum ist es klug, mehr als einen Nachbarn zu fragen – und wann wären zu viele Nachbarn schlecht?', 'Why is it wise to ask more than one neighbour – and when would too many neighbours be bad?'),
      L('Was müsste auf dem Steckbrief einer KI stehen, die Hausaufgaben bewertet?', 'What should be on the model card of an AI that marks homework?'),
    ],
    unplugged: L('Fragenbaum-Spiel: Eine Person denkt an ein Tier, die Klasse findet es mit möglichst wenigen Ja-Nein-Fragen; an der Tafel wächst der Baum. Welche Fragen teilen die Möglichkeiten am besten?', 'Question-tree game: one person thinks of an animal, the class finds it with as few yes/no questions as possible while the tree grows on the board. Which questions split the possibilities best?'),
  },
  netze: {
    goals: [
      L('ein künstliches Neuron als „Eingaben mal Gewichte, zusammenzählen, mit der Schwelle vergleichen“ beschreiben', 'describe an artificial neuron as “inputs times weights, add up, compare with the threshold”'),
      L('Lernen als schrittweises Verstellen der Gewichte nach Fehlern erklären', 'explain learning as adjusting the weights step by step after mistakes'),
      L('Gradientenabstieg als Bergabgehen veranschaulichen und die Rolle der Schrittweite nennen', 'illustrate gradient descent as walking downhill and name the role of the step size'),
      L('begründen, warum mehrere Neuronen zusammen mehr können als eines', 'explain why several neurons together can do more than one'),
    ],
    misconceptions: [
      { wrong: L('Künstliche neuronale Netze funktionieren wie ein Gehirn.', 'Artificial neural networks work like a brain.'), right: L('Sie sind nur grob vom Gehirn angeregt. Sie rechnen mit Zahlen und Gewichten – ohne Gedanken oder Gefühle.', 'They are only loosely inspired by the brain. They calculate with numbers and weights – without thoughts or feelings.') },
    ],
    talk: [
      L('Welche Gewichte würdest du dir selbst für die Kino-Entscheidung geben? Warum hat jeder andere?', 'Which weights would you give yourself for the cinema decision? Why does everyone have different ones?'),
      L('Warum kann ein zu großer Schritt beim Bergabgehen schaden?', 'Why can a step that is too big hurt when walking downhill?'),
    ],
    unplugged: L('Menschliches Neuron: Drei Kinder halten Eingabe-Karten (0 oder 1), ein Kind rechnet mit Gewichts-Karten die Summe und hebt die Hand, wenn die Schwelle erreicht ist. Bei einem Fehler werden die Gewichts-Karten ein Stück verändert.', 'Human neuron: three children hold input cards (0 or 1), one child adds them up with weight cards and raises a hand when the threshold is reached. After a mistake the weight cards are changed a little.'),
  },
  'bilder-sprache': {
    goals: [
      L('erklären, dass Bilder für Computer Tabellen aus Zahlen sind', 'explain that pictures are tables of numbers to a computer'),
      L('begründen, warum Zeichenerkennung bei ungewohnten Zeichnungen scheitern kann', 'explain why character recognition can fail on unusual drawings'),
      L('beschreiben, wie ein einfaches Sprachmodell das nächste Wort aus Häufigkeiten wählt', 'describe how a simple language model picks the next word from frequencies'),
      L('zeigen, dass ähnliche Wörter für eine KI nah beieinander liegen', 'show that similar words lie close together for an AI'),
    ],
    misconceptions: [
      { wrong: L('Ein Sprachmodell weiß, ob ein Satz wahr ist.', 'A language model knows whether a sentence is true.'), right: L('Es wählt wahrscheinliche Wörter. Ob der Satz stimmt, prüft es dabei nicht.', 'It picks likely words. It doesn’t check whether the sentence is true.') },
    ],
    talk: [
      L('Warum klingt ein von Bit erfundener Satz richtig, obwohl er Unsinn sein kann?', 'Why does a sentence invented by Bit sound right even though it can be nonsense?'),
      L('Welche Wörter liegen auf der Wörter-Landkarte wohl nah an „Schule“?', 'Which words might lie close to “school” on the word map?'),
    ],
    unplugged: L('Pixel-Diktat: Ein Kind diktiert Nullen und Einsen für ein 8 × 8-Raster, die anderen malen Kästchen aus – erst danach wird verraten, was es ist. Wort-Kette: Die Klasse zählt in einem kurzen Text, welches Wort auf welches folgt, und würfelt neue Sätze.', 'Pixel dictation: one child dictates zeros and ones for an 8 × 8 grid, the others colour squares – only then is it revealed what it is. Word chain: the class counts in a short text which word follows which and rolls dice to make new sentences.'),
  },
  belohnung: {
    goals: [
      L('das Abwägen zwischen Ausprobieren und Bewährtem erklären', 'explain the trade-off between trying new things and sticking with what works'),
      L('Lernen durch Belohnung am Labyrinth beschreiben', 'describe learning from rewards using the maze'),
      L('nachvollziehen, wie Streichholzschachteln mit Perlen ein Spiel lernen', 'follow how matchboxes with beads learn a game'),
    ],
    misconceptions: [
      { wrong: L('Beim Lernen durch Belohnung zeigt jemand der KI den richtigen Weg.', 'In learning from rewards someone shows the AI the right way.'), right: L('Niemand zeigt den Weg. Die KI probiert aus und verstärkt, was zur Belohnung geführt hat.', 'Nobody shows the way. The AI tries things and reinforces whatever led to the reward.') },
    ],
    talk: [
      L('Wann probiert ihr lieber etwas Neues, wann nehmt ihr das Bewährte?', 'When do you prefer trying something new, and when do you stick with what works?'),
      L('Was passiert, wenn eine Belohnung für das Falsche vergeben wird?', 'What happens if a reward is given for the wrong thing?'),
    ],
    unplugged: L('Streichholz-KI bauen: Für ein kleines Spiel (z. B. Nim mit 8 Steinen) bekommt jede Spielstellung eine Schachtel mit bunten Perlen für die möglichen Züge. Gewinnzüge bekommen Perlen dazu, Verlustzüge verlieren welche – nach einigen Partien spielt die Schachtel-KI deutlich besser.', 'Build a matchbox AI: for a small game (e.g. Nim with 8 stones) every position gets a box with coloured beads for the possible moves. Winning moves get extra beads, losing moves lose some – after a few games the box AI plays much better.'),
  },
  kreativ: {
    goals: [
      L('die zwei Schritte beschreiben, in denen ein Chatbot entsteht: viel lesen (Vortraining) und Rückmeldung von Menschen', 'describe the two steps that make a chatbot: reading a lot (pre-training) and feedback from people'),
      L('erklären, dass Bildgeneratoren Rauschen Schritt für Schritt entfernen', 'explain that image generators remove noise step by step'),
      L('Bilder auf Hinweise für Fälschungen prüfen und Prüfwege kennen (Quelle, Rückwärtssuche, andere Berichte)', 'check pictures for signs of fakes and know ways to verify (source, reverse image search, other reports)'),
    ],
    misconceptions: [
      { wrong: L('Was ein freundlicher Chatbot sagt, stimmt.', 'What a friendly chatbot says is true.'), right: L('Freundlich und richtig sind zwei verschiedene Dinge. Bewertungen von Menschen formen den Ton, nicht das Wissen.', 'Friendly and correct are two different things. People’s ratings shape the tone, not the knowledge.') },
    ],
    talk: [
      L('Woran erkennt man ein gefälschtes Bild – und warum reicht genaues Hinsehen immer weniger?', 'How can you spot a fake picture – and why is looking closely less and less enough?'),
      L('Wem gehört ein Bild, das eine KI gemalt hat? (offene Frage, auch rechtlich umstritten)', 'Who owns a picture painted by an AI? (an open question, also disputed in law)'),
    ],
    unplugged: L('Rauschen-Stille-Post: Ein einfaches Bild wird von Kind zu Kind immer ungenauer abgezeichnet. Danach versucht die Klasse, aus der letzten Version rückwärts das Original zu erraten – so ähnlich arbeitet ein Bildgenerator.', 'Noise telephone: a simple picture is copied from child to child, getting less exact each time. Then the class tries to guess the original backwards from the last version – a bit like an image generator works.'),
  },
  wir: {
    goals: [
      L('erklären, wie einseitige Daten zu unfairen Ergebnissen führen', 'explain how one-sided data lead to unfair results'),
      L('beschreiben, wie Empfehlungen eine Filterblase erzeugen können', 'describe how recommendations can create a filter bubble'),
      L('KI-Antworten mit einer zweiten Quelle prüfen und persönliche Daten schützen', 'check AI answers with a second source and protect personal data'),
      L('KI so nutzen, dass sie beim Lernen hilft, und Meilensteine der KI-Geschichte ordnen', 'use AI in a way that helps learning, and put milestones of AI history in order'),
    ],
    misconceptions: [
      { wrong: L('Computer sind neutral, deshalb entscheiden sie fair.', 'Computers are neutral, so their decisions are fair.'), right: L('Ein Modell übernimmt die Lücken und Verzerrungen seiner Daten. Fairness muss man prüfen und gestalten.', 'A model takes on the gaps and biases of its data. Fairness has to be checked and designed.') },
      { wrong: L('Was eine KI sicher formuliert, wird schon stimmen.', 'If an AI says it confidently, it must be right.'), right: L('Sprachmodelle können Quellen und Fakten erfinden. Wichtiges immer nachprüfen.', 'Language models can invent sources and facts. Always check important things.') },
    ],
    talk: [
      L('Wer trägt die Verantwortung, wenn eine KI einen Fehler macht?', 'Who is responsible when an AI makes a mistake?'),
      L('Welche Regeln für KI-Hilfe bei Hausaufgaben findet ihr fair?', 'Which rules for AI help with homework do you think are fair?'),
    ],
    unplugged: L('Feed-Spiel: Jedes Kind zieht Themenkarten; wer eine Karte „anschaut“, bekommt zwei weitere vom selben Thema. Nach fünf Runden vergleicht die Klasse die Stapel – so entsteht eine Filterblase.', 'Feed game: every child draws topic cards; whoever “watches” a card gets two more on the same topic. After five rounds the class compares the piles – that is how a filter bubble forms.'),
  },
};
