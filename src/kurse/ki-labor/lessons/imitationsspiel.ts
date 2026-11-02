import { L } from '../../../curriculum/helpers';
import type { TuringProps } from '../../gemeinsam/games/turing';
import type { LessonContent } from '../../types';

const rounds: TuringProps = {
  scored: false,
  rounds: [
    {
      lines: [
        { who: 'judge', text: L('Ich habe heute meine Physikklausur verhauen.', 'I flunked my physics exam today.') },
        { who: 'x', text: L('Warum sagst du, du hast heute deine Physikklausur verhauen?', 'Why do you say you flunked your physics exam today?') },
        { who: 'judge', text: L('Weil ich zu wenig gelernt habe.', 'Because I didn’t study enough.') },
        { who: 'x', text: L('Ist das der wahre Grund?', 'Is that the real reason?') },
      ],
      answer: 'machine',
      why: L('X spiegelt nur Satzteile und reagiert auf das Schlüsselwort „weil“ – genau so arbeitete ELIZA (1966).', 'X only mirrors phrases and reacts to the keyword “because” – exactly how ELIZA (1966) worked.'),
    },
    {
      lines: [
        { who: 'judge', text: L('Was ist 3456 mal 789?', 'What is 3456 times 789?') },
        { who: 'x', text: L('Ohne Taschenrechner? Grob 2,7 Millionen. Genauer hab ich gerade keine Lust.', 'Without a calculator? Roughly 2.7 million. I can’t be bothered to be more precise.') },
      ],
      answer: 'human',
      why: L('Eine grobe Schätzung und keine Lust auf Kopfrechnen: sehr menschlich. Turing schrieb schon 1950, eine Maschine müsste genau so etwas vortäuschen – absichtlich langsam und ungenau.', 'A rough estimate and no desire for mental arithmetic: very human. Turing wrote in 1950 that a machine would have to fake exactly this – deliberately slow and imprecise.'),
    },
    {
      lines: [
        { who: 'judge', text: L('Kannst du mir Lektüre zum Turing-Test empfehlen?', 'Can you recommend some reading on the Turing test?') },
        { who: 'x', text: L('Gern! Turing beschreibt den Test 1950 in „Computing Machinery and Intelligence“. Lesenswert ist auch sein zweites Buch „Maschinen mit Gefühl“ von 1953.', 'Sure! Turing describes the test in 1950 in “Computing Machinery and Intelligence”. His second book “Machines with Feelings” from 1953 is also worth reading.') },
      ],
      answer: 'machine',
      why: L('Der Aufsatz stimmt, das Buch gibt es nicht. Flüssig formulierte, aber erfundene Quellen sind typisch für Sprachmodelle: Sie erzeugen wahrscheinliche Wörter, nicht geprüfte Fakten.', 'The paper is real, the book doesn’t exist. Fluent but invented sources are typical of language models: they produce probable words, not checked facts.'),
    },
    {
      lines: [
        { who: 'judge', text: L('Beschreib mal, wie sich Muskelkater anfühlt.', 'Describe what sore muscles feel like.') },
        { who: 'x', text: L('Als würde jede Treppenstufe dich persönlich hassen 😩 hab gestern Beinpresse gemacht, nie wieder', 'Like every single stair hates you personally 😩 did leg press yesterday, never again') },
      ],
      answer: 'human',
      why: L('Ein Mensch mit eigenem Erlebnis. Aber Vorsicht: Heutige Sprachmodelle können genau solche Sätze sehr gut nachahmen. Sicher erkennen kann man es oft nicht.', 'A person with their own experience. But careful: today’s language models can imitate exactly such sentences very well. Often you can’t tell for sure.'),
    },
    {
      lines: [
        { who: 'judge', text: L('Welche Farbe hat ein Schimmel?', 'What colour is a grey horse?') },
        { who: 'x', text: L('Haha, ich bin 13 und komme aus Odessa, Pferde sind nicht so mein Ding. Was machst du eigentlich beruflich?', 'Haha, I’m 13 and from Odessa, horses aren’t really my thing. What do you do for a living, by the way?') },
      ],
      answer: 'machine',
      why: L('Ausweichen, Themenwechsel und eine eingebaute Ausrede (jung, andere Muttersprache): Mit diesem Trick hielt ein Drittel der Jury 2014 den Chatbot „Eugene Goostman“ für einen Jungen.', 'Dodging, changing the subject and a built-in excuse (young, different first language): with this trick a third of the judges in 2014 took the chatbot “Eugene Goostman” for a boy.'),
    },
    {
      lines: [
        { who: 'judge', text: L('Schläger und Ball kosten zusammen 1,10 €. Der Schläger kostet 1 € mehr als der Ball. Was kostet der Ball?', 'A bat and a ball cost €1.10 together. The bat costs €1 more than the ball. How much is the ball?') },
        { who: 'x', text: L('10 Cent, oder? … nee, warte. Dann wär der Schläger ja 1,10. Also 5 Cent!', '10 cents, right? … no, wait. Then the bat would be 1.10. So 5 cents!') },
      ],
      answer: 'human',
      why: L('Erst die schnelle, falsche Antwort, dann die Korrektur – ein typischer menschlicher Denkweg, den die Psychologie gut kennt. (Ball 0,05 €, Schläger 1,05 €.)', 'First the quick, wrong answer, then the correction – a typical human way of thinking that psychology knows well. (Ball €0.05, bat €1.05.)'),
    },
  ],
  done: L('{n} von {total} richtig. Merkst du, wie unsicher das Urteil oft ist? Genau deshalb ist der Test so umstritten.', '{n} of {total} correct. Notice how uncertain the verdict often is? That’s exactly why the test is so controversial.'),
};

const lesson: LessonContent = {
  steps: [
    { kind: 'say', mood: 'happy', text: L('Willkommen im KI-Labor! Ich bin Ada – benannt nach Ada Lovelace, die 1843 als Erste ein Programm für eine Rechenmaschine beschrieb.', 'Welcome to the AI Lab! I’m Ada – named after Ada Lovelace, who in 1843 was the first to describe a program for a computing machine.') },
    {
      kind: 'info',
      tone: 'plain',
      title: L('Wer hier spricht', 'Who is talking here'),
      text: L(
        'Ich bin ein kleines Programm in deinem Browser, kein Wesen. Wenn ich „ich denke“ sage, ist das eine Redeweise: In Wahrheit wird gerechnet. Genau darum geht es in diesem Kurs – was dabei wirklich passiert.',
        'I’m a small program in your browser, not a being. When I say “I think”, it’s a figure of speech: in reality, numbers are being crunched. That’s exactly what this course is about – what really happens.',
      ),
    },
    { kind: 'say', mood: 'think', text: L('1950 stellte Alan Turing die Frage: Können Maschinen denken? Weil „denken“ kaum zu definieren ist, ersetzte er sie durch ein Spiel. Eine Jury chattet mit X – und soll herausfinden, ob X ein Mensch ist.', 'In 1950 Alan Turing asked: can machines think? Because “thinking” is so hard to define, he replaced the question with a game. A judge chats with X – and has to find out whether X is human.') },
    {
      kind: 'predict',
      question: L('Woran erkennt man am ehesten, dass im Chat eine Maschine schreibt?', 'What is the best sign that a machine is writing in a chat?'),
      options: [
        { text: L('An fehlenden Tippfehlern', 'No typos') },
        { text: L('An zu schnellen, perfekten Antworten', 'Answers that are too fast and perfect') },
        { text: L('Am Ausweichen bei Fragen', 'Dodging questions') },
        { text: L('Gar nicht zuverlässig', 'Not reliably at all') },
      ],
      reveal: L('Probier es aus: Du bist die Jury in sechs echten Situationen.', 'Try it: you’re the judge in six real situations.'),
    },
    { kind: 'game', game: 'turing', props: rounds, intro: L('Lies jeden Chat und entscheide: Mensch oder Maschine? Hier zählt kein Fehler – es geht ums Urteil.', 'Read each chat and decide: human or machine? No mistakes count here – it’s about judgement.') },
    {
      kind: 'info',
      title: L('Wie Turing es sich genau dachte', 'What Turing actually proposed'),
      text: L(
        'Im ursprünglichen „Imitationsspiel“ versucht ein Mann, die Jury zu täuschen, er sei eine Frau; dann nimmt eine Maschine seinen Platz ein. Turing sagte voraus, dass um das Jahr 2000 eine durchschnittliche Jury nach fünf Minuten in höchstens 70 % der Fälle richtig liegt. 2014 täuschte „Eugene Goostman“ mit Tricks ein Drittel einer Jury. 2025 berichteten Forschende der University of California San Diego, dass ein großes Sprachmodell in Fünf-Minuten-Chats öfter für den Menschen gehalten wurde als der echte Mensch.',
        'In the original “imitation game” a man tries to fool the judge into thinking he is a woman; then a machine takes his place. Turing predicted that around the year 2000 an average judge would be right in at most 70% of cases after five minutes. In 2014 “Eugene Goostman” fooled a third of a jury with tricks. In 2025 researchers at the University of California San Diego reported that a large language model was judged to be the human more often than the real human in five-minute chats.',
      ),
    },
    {
      kind: 'choice',
      question: L('Ein Programm besteht den Turing-Test. Was ist damit gezeigt?', 'A program passes the Turing test. What has been shown?'),
      options: [
        { text: L('Es versteht, was es schreibt.', 'It understands what it writes.'), feedback: L('Der Test prüft nur Verhalten im Chat – nicht, was innen passiert.', 'The test only checks behaviour in a chat – not what happens inside.') },
        { text: L('Es kann eine Jury im Chat darüber täuschen, was es ist.', 'It can fool a judge in a chat about what it is.'), correct: true, feedback: L('Genau. Der Test misst Nachahmung, nicht Verstehen.', 'Exactly. The test measures imitation, not understanding.') },
        { text: L('Es hat ein Bewusstsein.', 'It is conscious.'), feedback: L('Dafür liefert der Test keinerlei Beleg.', 'The test gives no evidence at all for that.') },
      ],
    },
    { kind: 'say', mood: 'think', text: L('1980 antwortete der Philosoph John Searle mit einem Gedankenexperiment: Du sitzt in einem Zimmer mit einem riesigen Regelbuch. Durch einen Schlitz kommen chinesische Zeichen; das Buch sagt dir, welche Zeichen du zurückschiebst. Draußen glaubt man, du sprichst perfekt Chinesisch.', 'In 1980 the philosopher John Searle replied with a thought experiment: you sit in a room with a huge rule book. Chinese characters come in through a slot; the book tells you which characters to push back out. Outside, people believe you speak perfect Chinese.') },
    {
      kind: 'choice',
      question: L('Was folgert Searle aus seinem „Chinesischen Zimmer“?', 'What does Searle conclude from his “Chinese room”?'),
      options: [
        { text: L('Richtiges Verhalten allein beweist noch kein Verstehen.', 'Correct behaviour alone does not prove understanding.'), correct: true, feedback: L('Ja: Zeichen nach Regeln umformen ist nicht dasselbe wie ihre Bedeutung kennen.', 'Yes: rearranging symbols by rules is not the same as knowing what they mean.') },
        { text: L('Computer können niemals übersetzen.', 'Computers can never translate.'), feedback: L('Übersetzen können sie – die Frage ist, ob sie dabei verstehen.', 'They can translate – the question is whether they understand.') },
        { text: L('Menschen verstehen Sprache auch nur mit Regelbüchern.', 'Humans understand language only with rule books, too.'), feedback: L('Das wäre eher ein Gegenargument zu Searle.', 'That would be more of a counter-argument to Searle.') },
      ],
      explain: L('Kritiker antworten, vielleicht verstehe das ganze System (Mensch + Buch + Zimmer) Chinesisch, auch wenn der Mensch allein es nicht tut. Die Debatte ist bis heute offen – und mit großen Sprachmodellen aktueller denn je.', 'Critics reply that perhaps the whole system (person + book + room) understands Chinese, even if the person alone does not. The debate is still open – and more topical than ever with large language models.'),
    },
    {
      kind: 'info',
      title: L('Starke und schwache KI', 'Strong and weak AI'),
      text: L(
        'Schwache KI löst einzelne Aufgaben, für die man beim Menschen Intelligenz bräuchte: Schach, Übersetzen, Bilder erkennen. Starke KI hätte Verstand und Bewusstsein wie ein Mensch – so etwas gibt es nicht. Die Informatikerin Elaine Rich schrieb 1983 sogar: KI ist, Computer Dinge tun zu lassen, die Menschen im Moment noch besser können. Das Ziel verschiebt sich also ständig.',
        'Weak AI solves single tasks that would require intelligence in humans: chess, translating, recognising images. Strong AI would have a mind and consciousness like a human – nothing like that exists. The computer scientist Elaine Rich even wrote in 1983: AI is getting computers to do things at which, at the moment, people are better. So the goal keeps moving.',
      ),
    },
    {
      kind: 'choice',
      question: L('Ein Schachprogramm schlägt jeden Großmeister. Wie ordnest du es ein?', 'A chess program beats every grandmaster. How do you classify it?'),
      options: [
        { text: L('Schwache KI', 'Weak AI'), correct: true, feedback: L('Richtig: Es löst eine einzige Aufgabe übermenschlich gut – sonst nichts.', 'Right: it solves a single task superhumanly well – nothing else.') },
        { text: L('Starke KI', 'Strong AI'), feedback: L('Es kann weder Kaffee kochen noch eine Frage zum Wetter beantworten.', 'It can neither make coffee nor answer a question about the weather.') },
        { text: L('Gar keine KI', 'No AI at all'), feedback: L('Schach galt lange als Paradebeispiel für Intelligenz – es zählt dazu.', 'Chess was long seen as the prime example of intelligence – it counts.') },
      ],
    },
    { kind: 'say', mood: 'wink', text: L('Merke: Der Turing-Test misst Täuschung, nicht Verstehen. Im nächsten Experiment schaust du einem Chatbot von 1966 direkt in die Regeln.', 'Remember: the Turing test measures deception, not understanding. In the next experiment you look straight into the rules of a chatbot from 1966.') },
  ],
};

export default lesson;
