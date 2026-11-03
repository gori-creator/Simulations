import { L } from '../../curriculum/helpers';
import { LEVEL_NAMES } from '../engine/progress';
import type { Course, KnowledgeCard, LessonMeta } from '../types';
import { SOURCES } from './quellen';

/**
 * KI-Abenteuer: Grundlagenkurs „Wie funktioniert KI?“ für Klasse 5 bis 10.
 * Roter Faden: Bit, ein kleiner Roboter, wacht ohne Wissen auf und wird von
 * den Schülerinnen und Schülern trainiert. Jede Lektion schenkt eine
 * Wissenskarte mit einem Meilenstein der KI-Geschichte (Zeitstrahl).
 * Konzept: docs/KI-KURS-KONZEPT.md.
 *
 * Inhalte der Lektionen: lessons/<id>.ts (Schritte), Spiele: games/<name>.ts.
 */
type Pair = [string, string];

const card = (year: number, title: Pair, text: Pair): KnowledgeCard => ({ year, title: L(...title), text: L(...text) });

/** Noch im Bau (erscheinen auf der Karte als „bald“). */
const SOON = new Set<string>([]);

const lesson = (id: string, slug: Pair, title: Pair, teaser: Pair, icon: string, minutes: number, c: KnowledgeCard, extra: Partial<LessonMeta> = {}): LessonMeta => ({
  id,
  status: SOON.has(id) ? 'planned' : 'ready',
  slug: L(...slug),
  title: L(...title),
  teaser: L(...teaser),
  icon,
  minutes,
  card: SOURCES[id] ? { ...c, source: SOURCES[id] } : c,
  ...extra,
});

export const kiAbenteuer: Course = {
  id: 'ki-abenteuer',
  slug: L('ki-abenteuer', 'ai-adventure'),
  title: L('KI-Abenteuer', 'AI Adventure'),
  tagline: L('Trainiere Bit, den kleinen Roboter – und finde heraus, wie Künstliche Intelligenz wirklich lernt.', 'Train Bit, the little robot – and find out how artificial intelligence really learns.'),
  description: L(
    'Ein Kurs für Klasse 5 bis 10: In kurzen Spielen bringst du Bit bei, Muster zu erkennen, aus Beispielen und Belohnungen zu lernen, Texte und Bilder zu erzeugen – und du reist durch die Geschichte der KI. Ohne Anmeldung, der Spielstand bleibt auf deinem Gerät.',
    'A course for years 5 to 10: in short games you teach Bit to spot patterns, learn from examples and rewards, create text and pictures – and you travel through the history of AI. No sign-up; your progress stays on your device.',
  ),
  audience: L('Klasse 5–10', 'Years 5–10'),
  grades: [5, 10],
  guide: 'bit',
  guideName: 'Bit',
  levels: LEVEL_NAMES,
  finalBadge: { icon: '🏆', title: L('Abenteuer bestanden', 'Adventure complete'), text: L('Alle Lektionen geschafft.', 'Finished every lesson.') },
  voice: {
    perfect: L('Wow, ganz ohne Fehler! Du bist ein toller Trainer.', 'Wow, no mistakes at all! You’re a great trainer.'),
    done: L('Geschafft! Meine Zahlen sind wieder ein bisschen besser eingestellt – danke!', 'Done! My numbers are tuned a little better again – thank you!'),
  },
  chapters: [
    {
      id: 'erwachen',
      icon: '🔌',
      title: L('Bit erwacht', 'Bit wakes up'),
      blurb: L('Was ist eigentlich KI? Regeln schreiben oder aus Beispielen lernen?', 'What is AI anyway? Writing rules or learning from examples?'),
      lessons: [
        lesson('hallo-bit', ['hallo-bit', 'hello-bit'], ['Hallo, ich bin Bit', 'Hello, I’m Bit'], ['Bit soll Katzen und Hunde auseinanderhalten. Reichen ein paar Regeln?', 'Bit has to tell cats from dogs. Are a few rules enough?'], '👋', 5,
          card(1956, ['Ein Name für ein neues Fach', 'A name for a new field'], ['Bei einem Sommertreffen in Dartmouth (USA) gibt eine Gruppe um John McCarthy dem Gebiet seinen Namen: Künstliche Intelligenz. Sie hofften, Maschinen in einem Sommer viel beizubringen – es dauerte Jahrzehnte.', 'At a summer meeting at Dartmouth (USA) a group around John McCarthy names the field: artificial intelligence. They hoped to teach machines a lot in one summer – it took decades.'])),
        lesson('ki-im-alltag', ['ki-im-alltag', 'ai-in-everyday-life'], ['KI im Alltag', 'AI in everyday life'], ['Steckt im Taschenrechner KI? Und im Handy? Sortiere mit Bit.', 'Is there AI in a calculator? And in a phone? Sort it out with Bit.'], '📱', 5,
          card(2011, ['KI in der Hosentasche', 'AI in your pocket'], ['Mit Siri kommt 2011 ein Sprachassistent aufs Handy. Heute stecken lernende Programme in Handys, Autos, Übersetzern und Lautsprechern – oft, ohne dass man es merkt.', 'In 2011 Siri brings a voice assistant to the phone. Today learning programs sit in phones, cars, translators and speakers – often without us noticing.'])),
        lesson('aus-beispielen', ['aus-beispielen', 'learning-from-examples'], ['Aus Beispielen lernen', 'Learning from examples'], ['Zeig Bit Äpfel und Birnen. Wie viele Beispiele braucht er?', 'Show Bit apples and pears. How many examples does he need?'], '🍎', 6,
          card(1951, ['Lernen am ähnlichsten Beispiel', 'Learning from the most similar example'], ['Evelyn Fix und Joseph Hodges beschreiben, wie man etwas Neues mit den ähnlichsten bekannten Beispielen vergleicht. Diese Idee nutzen Computer bis heute.', 'Evelyn Fix and Joseph Hodges describe how to compare something new with the most similar known examples. Computers still use this idea today.'])),
      ],
    },
    {
      id: 'vorfahren',
      icon: '🕰️',
      era: L('1950–1997', '1950–1997'),
      title: L('Bits Vorfahren', 'Bit’s ancestors'),
      blurb: L('Die ersten „denkenden“ Maschinen: Tests, Chatbots aus Regeln und Computer, die vorausrechnen.', 'The first “thinking” machines: tests, chatbots made of rules and computers that calculate ahead.'),
      lessons: [
        lesson('mensch-oder-maschine', ['mensch-oder-maschine', 'human-or-machine'], ['Mensch oder Maschine?', 'Human or machine?'], ['Wer schreibt hier – ein Mensch oder ein Programm? Spiel den Test von Alan Turing.', 'Who is writing – a person or a program? Play Alan Turing’s test.'], '🎭', 6,
          card(1950, ['Das Imitationsspiel', 'The imitation game'], ['Alan Turing fragt: Können Maschinen denken? Sein Vorschlag: Wenn man im Chat nicht erkennt, ob ein Mensch oder eine Maschine antwortet, hat die Maschine den Test bestanden. Ob das wirklich Denken ist, wird bis heute diskutiert.', 'Alan Turing asks: can machines think? His proposal: if you can’t tell in a chat whether a human or a machine is answering, the machine has passed the test. Whether that is really thinking is still debated today.'])),
        lesson('erster-chatbot', ['der-erste-chatbot', 'the-first-chatbot'], ['Der erste Chatbot', 'The first chatbot'], ['Schreib mit ELIZA, einem Chatbot von 1966. Versteht sie dich wirklich?', 'Chat with ELIZA, a chatbot from 1966. Does she really understand you?'], '💭', 7,
          card(1966, ['ELIZA', 'ELIZA'], ['Joseph Weizenbaum baut ELIZA: ein Programm, das nur Schlüsselwörter sucht und Sätze umdreht. Viele Menschen erzählten ihr trotzdem persönliche Dinge. Weizenbaum warnte: Das Programm versteht nichts.', 'Joseph Weizenbaum builds ELIZA: a program that only looks for keywords and turns sentences around. Many people still told it personal things. Weizenbaum warned: the program understands nothing.'])),
        lesson('vorausdenken', ['vorausrechnen', 'thinking-ahead'], ['Bit rechnet voraus', 'Bit calculates ahead'], ['Ein Spiel mit Steinen: Bit probiert im Kopf alle Züge aus. Kannst du ihn schlagen?', 'A game with stones: Bit tries every move in his head. Can you beat him?'], '♟️', 7,
          card(1997, ['Deep Blue schlägt Kasparow', 'Deep Blue beats Kasparov'], ['Der Schachcomputer Deep Blue gewinnt gegen Weltmeister Garri Kasparow. Er hat nicht gelernt wie ein Mensch, sondern rund 200 Millionen Stellungen pro Sekunde durchgerechnet.', 'The chess computer Deep Blue beats world champion Garry Kasparov. It didn’t learn like a person – it calculated about 200 million positions per second.']),
          { boss: true }),
      ],
    },
    {
      id: 'daten',
      icon: '📊',
      title: L('Daten und Muster', 'Data and patterns'),
      blurb: L('KI lernt aus Daten. Aber welche Daten helfen – und welche schaden?', 'AI learns from data. But which data help – and which do harm?'),
      lessons: [
        lesson('merkmale', ['merkmale', 'features'], ['Gute Merkmale', 'Good features'], ['Gewicht, Farbe oder Lieblingsessen? Finde heraus, was Bit wirklich hilft.', 'Weight, colour or favourite food? Find out what really helps Bit.'], '🔍', 6,
          card(1936, ['Blumen vermessen', 'Measuring flowers'], ['Ronald Fisher unterscheidet drei Arten von Schwertlilien nur anhand von vier Maßen ihrer Blüten. Gute Merkmale machen die Aufgabe leicht – der Datensatz wird bis heute zum Üben benutzt.', 'Ronald Fisher tells three kinds of iris apart using just four measurements of their flowers. Good features make the task easy – the data set is still used for practice today.'])),
        lesson('grenze', ['grenze-finden', 'find-the-border'], ['Die Grenze finden', 'Find the border'], ['Zieh eine Linie zwischen zwei Gruppen – so trennt eine KI Daten.', 'Draw a line between two groups – that’s how an AI separates data.'], '📈', 7,
          card(1995, ['Die breiteste Straße', 'The widest road'], ['Corinna Cortes und Vladimir Vapnik stellen die Support-Vektor-Maschine vor: Sie sucht die Grenze, die zu beiden Gruppen den größten Abstand hält – wie eine möglichst breite Straße.', 'Corinna Cortes and Vladimir Vapnik present the support vector machine: it looks for the border with the largest gap to both groups – like the widest possible road.'])),
        lesson('aufraeumen', ['falsche-daten', 'bad-data'], ['Falsche Daten', 'Bad data'], ['Jemand hat Fehler in Bits Daten versteckt. Findest du sie?', 'Someone hid mistakes in Bit’s data. Can you find them?'], '🧹', 6,
          card(2021, ['Fehler in berühmten Daten', 'Errors in famous data'], ['Forschende prüfen bekannte Test-Datensätze und finden: Im Schnitt sind rund 3 von 100 Beispielen falsch beschriftet. Selbst Profis müssen ihre Daten aufräumen.', 'Researchers check well-known test data sets and find that on average about 3 in 100 examples are labelled wrongly. Even experts have to clean their data.'])),
      ],
    },
    {
      id: 'lernen',
      icon: '🧭',
      title: L('Bit lernt', 'Bit learns'),
      blurb: L('Mit Etiketten, ohne Etiketten, üben und prüfen: wie eine Maschine aus Beispielen Entscheidungen lernt.', 'With labels, without labels, practising and testing: how a machine learns to decide from examples.'),
      lessons: [
        lesson('nachbarn', ['frag-die-nachbarn', 'ask-the-neighbours'], ['Frag die Nachbarn', 'Ask the neighbours'], ['Bit schaut, was die ähnlichsten Beispiele sind – und entscheidet wie die Mehrheit.', 'Bit looks at the most similar examples – and goes with the majority.'], '🏘️', 7,
          card(1967, ['Der Nachbar weiß Bescheid', 'Your neighbour knows'], ['Thomas Cover und Peter Hart zeigen: Mit genug Beispielen macht „Frag den nächsten Nachbarn“ höchstens doppelt so viele Fehler wie das bestmögliche Verfahren. Einfach, aber stark.', 'Thomas Cover and Peter Hart show: with enough examples, “ask the nearest neighbour” makes at most twice as many mistakes as the best possible method. Simple but strong.'])),
        lesson('fragenbaum', ['fragen-baum', 'question-tree'], ['Der Fragen-Baum', 'The question tree'], ['Mit wenigen Ja-Nein-Fragen zum richtigen Tier. Welche Frage zuerst?', 'Find the right animal with a few yes/no questions. Which question first?'], '🌳', 7,
          card(1986, ['Der Baum baut sich selbst', 'The tree builds itself'], ['Ross Quinlan stellt das Verfahren ID3 vor: Der Computer baut seinen Fragen-Baum selbst und stellt zuerst die Frage, die am meisten verrät.', 'Ross Quinlan presents the method ID3: the computer builds its own question tree and asks the most revealing question first.'])),
        lesson('gruppen-finden', ['gruppen-finden', 'finding-groups'], ['Gruppen ohne Etiketten', 'Groups without labels'], ['Niemand sagt Bit, was was ist. Findet er trotzdem Gruppen?', 'Nobody tells Bit what is what. Can he still find groups?'], '🫧', 7,
          card(1967, ['k-Means: Gruppen von selbst', 'k-means: groups by themselves'], ['James MacQueen gibt einem einfachen Verfahren seinen Namen: k-Means. Es sortiert Daten ohne Etiketten in Gruppen, indem es Mittelpunkte immer wieder verschiebt.', 'James MacQueen names a simple method: k-means. It sorts unlabelled data into groups by moving centre points again and again.'])),
        lesson('ueben-pruefen', ['ueben-und-pruefen', 'practice-and-test'], ['Üben und Prüfen', 'Practice and test'], ['Auswendig lernen oder verstehen? Bit schreibt eine Probe.', 'Memorise or understand? Bit takes a test.'], '📝', 6,
          card(1974, ['Fair prüfen', 'Testing fairly'], ['Der Statistiker Mervyn Stone beschreibt, wie man ein Modell ehrlich prüft: mit Daten, die es beim Üben nie gesehen hat. So merkt man, ob es nur auswendig gelernt hat.', 'The statistician Mervyn Stone describes how to test a model honestly: with data it never saw while practising. That shows whether it only memorised.'])),
        lesson('steckbrief', ['bits-steckbrief', 'bits-model-card'], ['Bits Steckbrief', 'Bit’s model card'], ['Bit wird veröffentlicht! Schreib ehrlich auf, was er kann – und was nicht.', 'Bit is going public! Write down honestly what he can do – and what he can’t.'], '🪪', 6,
          card(2019, ['Steckbriefe für Modelle', 'Model cards'], ['Margaret Mitchell und ihr Team schlagen „Model Cards“ vor: Zu jedem KI-Modell gehört ein Steckbrief mit Zweck, Daten, Genauigkeit und Grenzen.', 'Margaret Mitchell and her team propose “model cards”: every AI model should come with a card stating its purpose, data, accuracy and limits.']),
          { boss: true }),
      ],
    },
    {
      id: 'netze',
      icon: '🧠',
      title: L('Bits Gehirn', 'Bit’s brain'),
      blurb: L('Neuronale Netze: Wie aus vielen kleinen Rechnern eine lernende Maschine wird.', 'Neural networks: how many tiny calculators become a learning machine.'),
      lessons: [
        lesson('neuron', ['ein-neuron', 'one-neuron'], ['Ein Neuron', 'One neuron'], ['Soll Bit ins Kino gehen? Ein künstliches Neuron wägt ab.', 'Should Bit go to the cinema? An artificial neuron weighs it up.'], '⚡', 7,
          card(1943, ['Das erste künstliche Neuron', 'The first artificial neuron'], ['Warren McCulloch und Walter Pitts beschreiben eine Nervenzelle als kleine Rechnung: Eingänge zusammenzählen, mit einer Schwelle vergleichen, feuern oder nicht.', 'Warren McCulloch and Walter Pitts describe a nerve cell as a small calculation: add up the inputs, compare with a threshold, fire or not.'])),
        lesson('neuron-lernt', ['neuron-lernt', 'neuron-learns'], ['Das Neuron lernt', 'The neuron learns'], ['Bei jedem Fehler dreht Bit ein bisschen an den Reglern. Schau zu, wie er besser wird.', 'After every mistake Bit turns his dials a little. Watch him get better.'], '🎯', 7,
          card(1958, ['Das Perzeptron', 'The perceptron'], ['Frank Rosenblatt baut eine Maschine, die ihre Gewichte nach jedem Fehler selbst verstellt. Zeitungen jubeln, bald würden Maschinen sehen und sprechen. Ganz so schnell ging es nicht.', 'Frank Rosenblatt builds a machine that adjusts its own weights after every mistake. Newspapers cheer that machines will soon see and talk. It didn’t happen quite that fast.'])),
        lesson('bergab', ['bergab-lernen', 'learning-downhill'], ['Bergab lernen', 'Learning downhill'], ['Große oder kleine Schritte? Bring Bit ins Tal der kleinsten Fehler.', 'Big steps or small ones? Guide Bit into the valley of the smallest error.'], '⛰️', 6,
          card(1847, ['Immer bergab', 'Always downhill'], ['Der Mathematiker Augustin-Louis Cauchy beschreibt ein Rechenverfahren: Geh immer ein Stück in die Richtung, in der es am steilsten bergab geht. Heute trainiert man damit fast jede KI.', 'The mathematician Augustin-Louis Cauchy describes a method: always step in the direction that goes downhill most steeply. Today almost every AI is trained this way.'])),
        lesson('team-neuronen', ['neuronen-im-team', 'neurons-as-a-team'], ['Neuronen im Team', 'Neurons as a team'], ['Ein Neuron zieht nur eine gerade Linie. Was schaffen drei zusammen?', 'One neuron only draws one straight line. What can three do together?'], '🤝', 7,
          card(1986, ['Lernen in Schichten', 'Learning in layers'], ['David Rumelhart, Geoffrey Hinton und Ronald Williams zeigen, wie Netze mit mehreren Schichten lernen (Backpropagation). Damit beginnt die Rückkehr der neuronalen Netze.', 'David Rumelhart, Geoffrey Hinton and Ronald Williams show how networks with several layers learn (backpropagation). This starts the comeback of neural networks.'])),
      ],
    },
    {
      id: 'bilder-sprache',
      icon: '🖼️',
      title: L('Bilder und Sprache', 'Pictures and language'),
      blurb: L('Wie eine KI Bilder sieht und Texte schreibt – mit nichts als Zahlen.', 'How an AI sees pictures and writes text – using nothing but numbers.'),
      lessons: [
        lesson('pixel', ['bilder-sind-zahlen', 'pictures-are-numbers'], ['Bilder sind Zahlen', 'Pictures are numbers'], ['Mal ein Bild aus Kästchen – für Bit ist es eine Liste von Zahlen.', 'Paint a picture from squares – to Bit it’s a list of numbers.'], '🟦', 6,
          card(1957, ['Das erste Digitalfoto', 'The first digital photo'], ['Russell Kirsch scannt ein Foto seines kleinen Sohnes in einen Computer: 176 mal 176 Kästchen, jedes nur schwarz oder weiß. Seitdem sind Bilder für Computer Zahlen.', 'Russell Kirsch scans a photo of his baby son into a computer: 176 by 176 squares, each just black or white. Since then, pictures have been numbers to computers.'])),
        lesson('zeichen', ['zeichen-erkennen', 'recognising-symbols'], ['Zeichen erkennen', 'Recognising symbols'], ['Bring Bit bei, Kreuz, Kreis und Strich zu erkennen – mit deinen eigenen Zeichnungen.', 'Teach Bit to recognise cross, circle and line – using your own drawings.'], '🎨', 8,
          card(1989, ['Postleitzahlen lesen', 'Reading postcodes'], ['Yann LeCun und sein Team bringen einem Netz bei, handgeschriebene Postleitzahlen zu lesen. Später sortieren solche Netze Briefe und lesen Schecks.', 'Yann LeCun and his team teach a network to read handwritten postcodes. Later such networks sort letters and read cheques.'])),
        lesson('naechstes-wort', ['das-naechste-wort', 'the-next-word'], ['Das nächste Wort', 'The next word'], ['Wie Chatbots schreiben: Bit rät immer nur das nächste Wort.', 'How chatbots write: Bit only ever guesses the next word.'], '💬', 7,
          card(1948, ['Texte aus Zählungen', 'Text from counting'], ['Claude Shannon zählt, welches Wort wie oft auf ein anderes folgt, und lost danach neue Texte aus: Häufiges kommt öfter dran. Heutige Sprachmodelle machen im Kern dasselbe – nur viel, viel größer.', 'Claude Shannon counts how often each word follows another and then draws new texts by lot: frequent words come up more often. Today’s language models do the same at their core – just much, much bigger.'])),
        lesson('woerter-karte', ['woerter-landkarte', 'word-map'], ['Die Wörter-Landkarte', 'The word map'], ['Für Bit hat jedes Wort einen Ort auf einer Karte. Wer wohnt neben „Hund“?', 'To Bit every word has a place on a map. Who lives next to “dog”?'], '🗺️', 7,
          card(2013, ['Wörter als Zahlen', 'Words as numbers'], ['Ein Team bei Google um Tomáš Mikolov stellt word2vec vor: Jedes Wort bekommt Zahlen, ähnliche Wörter liegen nah beieinander. Sogar „König − Mann + Frau ≈ Königin“ klappt.', 'A Google team around Tomáš Mikolov presents word2vec: every word gets numbers, similar words lie close together. Even “king − man + woman ≈ queen” works.'])),
      ],
    },
    {
      id: 'belohnung',
      icon: '🍪',
      title: L('Lernen durch Belohnung', 'Learning from rewards'),
      blurb: L('Ausprobieren, Punkte bekommen, besser werden: So lernen Maschinen Spiele und Wege.', 'Try things out, get points, get better: how machines learn games and paths.'),
      lessons: [
        lesson('eisdiele', ['die-eisdiele', 'the-ice-cream-shops'], ['Ausprobieren oder Bewährtes?', 'Try something new or stick with it?'], ['Drei Eisdielen, aber welche ist die beste? Bit muss probieren – und klug wählen.', 'Three ice-cream shops, but which is best? Bit has to try – and choose wisely.'], '🍦', 6,
          card(1952, ['Neues probieren oder Bewährtes nehmen?', 'Explore or exploit?'], ['Der Mathematiker Herbert Robbins beschreibt genau diese Frage als Rechenaufgabe. Sie steckt heute in vielen lernenden Programmen, zum Beispiel in Empfehlungen.', 'The mathematician Herbert Robbins describes exactly this question as a maths problem. It is part of many learning programs today, for example in recommendations.'])),
        lesson('labyrinth', ['das-labyrinth', 'the-maze'], ['Das Labyrinth', 'The maze'], ['Bit sucht den Keks im Labyrinth. Mit jeder Runde merkt er sich bessere Wege.', 'Bit looks for the cookie in the maze. Every round he remembers better paths.'], '🧩', 8,
          card(2016, ['AlphaGo', 'AlphaGo'], ['Das Programm AlphaGo besiegt Lee Sedol, einen der besten Go-Spieler der Welt. Es hatte unter anderem gelernt, indem es Millionen Partien gegen sich selbst spielte und für Siege belohnt wurde.', 'The program AlphaGo beats Lee Sedol, one of the best Go players in the world. Among other things it had learned by playing millions of games against itself and being rewarded for wins.'])),
        lesson('streichhoelzer', ['das-streichholz-spiel', 'the-matchbox-game'], ['Das Streichholz-Spiel', 'The matchbox game'], ['Spiel gegen Bit! Am Anfang zieht er zufällig – aber er lernt aus jeder Niederlage.', 'Play against Bit! At first he moves at random – but he learns from every loss.'], '🔥', 8,
          card(1961, ['Lernen mit Streichholzschachteln', 'Learning with matchboxes'], ['Donald Michie baut MENACE aus 304 Streichholzschachteln mit bunten Perlen. Die Schachteln lernen Tic-Tac-Toe: Nach Siegen kommen Perlen dazu, nach Niederlagen werden welche weggenommen.', 'Donald Michie builds MENACE from 304 matchboxes with coloured beads. The boxes learn noughts and crosses: beads are added after wins and removed after losses.']),
          { boss: true }),
      ],
    },
    {
      id: 'kreativ',
      icon: '✨',
      title: L('Bit wird kreativ', 'Bit gets creative'),
      blurb: L('Generative KI: Wie Chatbots und Bildgeneratoren entstehen – und warum man ihnen nicht alles glauben darf.', 'Generative AI: how chatbots and image generators are made – and why you can’t believe everything they produce.'),
      lessons: [
        lesson('chatbot-bauen', ['bit-wird-chatbot', 'bit-becomes-a-chatbot'], ['Bit wird ein Chatbot', 'Bit becomes a chatbot'], ['Erst liest Bit ganz viel, dann gibst du ihm Daumen hoch oder runter. So entsteht ein Assistent.', 'First Bit reads a lot, then you give him thumbs up or down. That’s how an assistant is made.'], '🤖', 8,
          card(2022, ['ChatGPT', 'ChatGPT'], ['Im November erscheint ChatGPT und hat nach wenigen Wochen Millionen Nutzende. Das Sprachmodell wurde mit riesigen Textmengen trainiert und danach mit Bewertungen von Menschen verbessert.', 'In November ChatGPT is released and has millions of users within weeks. The language model was trained on huge amounts of text and then improved with ratings from people.'])),
        lesson('bilder-aus-rauschen', ['bilder-aus-rauschen', 'pictures-from-noise'], ['Bilder aus Rauschen', 'Pictures from noise'], ['Bildgeneratoren beginnen mit Kriselkram. Hilf Bit, Schritt für Schritt aufzuräumen.', 'Image generators start with fuzz. Help Bit clean it up step by step.'], '🌫️', 7,
          card(2022, ['Bilder aus Text', 'Pictures from text'], ['Bildgeneratoren wie DALL·E 2 und Stable Diffusion malen aus einer Beschreibung neue Bilder. Sie beginnen mit Rauschen und entfernen es Schritt für Schritt.', 'Image generators like DALL·E 2 and Stable Diffusion paint new pictures from a description. They start from noise and remove it step by step.'])),
        lesson('echt-oder-fake', ['echt-oder-fake', 'real-or-fake'], ['Echt oder Fake?', 'Real or fake?'], ['Ein Bild geht viral. Wie findest du heraus, ob es echt ist?', 'A picture goes viral. How do you find out whether it’s real?'], '🕵️', 6,
          card(2023, ['Der Papst im Daunenmantel', 'The Pope in a puffer jacket'], ['Ein mit KI erzeugtes Bild zeigt Papst Franziskus in einem weißen Daunenmantel. Es verbreitet sich rasend schnell, viele halten es für echt. Seitdem wissen viele: Fotos können täuschend echt erfunden sein.', 'An AI-generated picture shows Pope Francis in a white puffer jacket. It spreads like wildfire, and many people believe it is real. Since then many people know: photos can be invented and look completely real.'])),
      ],
    },
    {
      id: 'wir',
      icon: '🤝',
      title: L('KI und wir', 'AI and us'),
      blurb: L('Fair, wahr, sicher? Was KI mit uns macht – und wie du sie klug benutzt.', 'Fair, true, safe? What AI does to us – and how to use it wisely.'),
      lessons: [
        lesson('fair', ['ist-das-fair', 'is-it-fair'], ['Ist das fair?', 'Is it fair?'], ['Bit hat nur Sneaker gesehen. Was passiert bei Sandalen?', 'Bit has only seen sneakers. What happens with sandals?'], '⚖️', 6,
          card(2018, ['Gender Shades', 'Gender Shades'], ['Joy Buolamwini und Timnit Gebru testen Gesichtserkennung: Bei hellhäutigen Männern fast keine Fehler, bei dunkelhäutigen Frauen bis zu jeder dritte Versuch falsch. Der Grund: einseitige Trainingsdaten.', 'Joy Buolamwini and Timnit Gebru test face recognition: almost no errors for light-skinned men, but up to one in three wrong for dark-skinned women. The reason: one-sided training data.'])),
        lesson('mein-feed', ['mein-feed', 'my-feed'], ['Mein Feed', 'My feed'], ['Warum zeigt dir die App immer mehr vom Gleichen? Sei der Algorithmus.', 'Why does the app show you more and more of the same? Be the algorithm.'], '📲', 7,
          card(2006, ['Der Wettbewerb um Empfehlungen', 'The recommendation contest'], ['Netflix bietet eine Million Dollar für ein Programm, das besser vorhersagt, welche Filme jemandem gefallen. Empfehlungen aus Daten bestimmen heute, was wir in Apps sehen.', 'Netflix offers a million dollars for a program that better predicts which films someone will like. Recommendations from data now decide what we see in apps.'])),
        lesson('stimmt-das', ['stimmt-das', 'is-that-true'], ['Stimmt das?', 'Is that true?'], ['KI klingt sicher, auch wenn sie sich irrt. Prüfe Bits Antworten.', 'AI sounds sure even when it’s wrong. Check Bit’s answers.'], '✅', 6,
          card(2023, ['Erfundene Urteile', 'Made-up court cases'], ['Ein Anwalt in New York reicht Urteile ein, die ein Chatbot erfunden hatte. Sie klangen echt, gab es aber nicht. Das Gericht verhängte eine Geldstrafe – prüfen hätte geholfen.', 'A lawyer in New York submits court rulings that a chatbot had made up. They sounded real but didn’t exist. The court imposed a fine – checking would have helped.'])),
        lesson('meine-daten', ['meine-daten', 'my-data'], ['Meine Daten', 'My data'], ['Was darf eine KI über dich wissen? Entscheide mit Bit.', 'What should an AI know about you? Decide together with Bit.'], '🔒', 5,
          card(2018, ['Die DSGVO gilt', 'The GDPR applies'], ['In der EU gilt ab Mai die Datenschutz-Grundverordnung: Du darfst erfahren, welche Daten Firmen über dich speichern, und verlangen, dass sie gelöscht werden.', 'From May the General Data Protection Regulation applies in the EU: you may find out which data companies store about you and ask for it to be deleted.'])),
        lesson('schlau-nutzen', ['ki-schlau-nutzen', 'using-ai-wisely'], ['KI schlau nutzen', 'Using AI wisely'], ['Hausaufgaben mit KI: Wann hilft sie dir beim Lernen – und wann lernst du gar nichts?', 'Homework with AI: when does it help you learn – and when do you learn nothing at all?'], '🎒', 6,
          card(2024, ['Regeln für KI in Europa', 'Rules for AI in Europe'], ['Die EU beschließt den AI Act: Je gefährlicher eine KI-Anwendung ist, desto strengere Regeln gelten. Manche Anwendungen sind ganz verboten, Chatbots müssen sich zu erkennen geben.', 'The EU passes the AI Act: the more dangerous an AI application, the stricter the rules. Some uses are banned completely, and chatbots must say that they are chatbots.'])),
        lesson('energie', ['ki-braucht-strom', 'ai-needs-power'], ['KI braucht Strom', 'AI needs power'], ['Wie viel Energie steckt in einer Frage an einen Chatbot – und im Training?', 'How much energy goes into one question to a chatbot – and into training?'], '⚡', 6,
          card(2024, ['Strom für Rechenzentren', 'Power for data centres'], ['Rechenzentren brauchten 2024 rund 1,5 % des Stroms der Welt, schätzt die Internationale Energieagentur – und KI lässt den Bedarf schnell wachsen.', 'Data centres used around 1.5% of the world’s electricity in 2024, the International Energy Agency estimates – and AI is making demand grow fast.'])),
        lesson('zeitreise', ['bits-zeitreise', 'bits-time-travel'], ['Bits Zeitreise', 'Bit’s time travel'], ['Die große Abschlussmission: Bring die Geschichte der KI in die richtige Reihenfolge.', 'The big final mission: put the history of AI in the right order.'], '🚀', 8,
          card(2026, ['Und jetzt du', 'And now you'], ['Du weißt jetzt, wie KI aus Daten lernt, wo sie sich irrt und wer sie gebaut hat. Die nächsten Meilensteine schreiben Menschen, die das verstehen – vielleicht du.', 'You now know how AI learns from data, where it goes wrong and who built it. The next milestones will be written by people who understand this – maybe you.']),
          { boss: true }),
      ],
    },
  ],
};
