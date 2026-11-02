import { L } from '../../../curriculum/helpers';
import type { LessonContent } from '../../types';

const lesson: LessonContent = {
  steps: [
    { kind: 'say', mood: 'wink', text: L('Hallo! Ich bin Bit, ein kleiner Roboter. Ich bin gerade erst aufgewacht und weiß noch gar nichts.', 'Hello! I’m Bit, a little robot. I’ve only just woken up and I don’t know anything yet.') },
    { kind: 'say', text: L('Du wirst meine Trainerin oder mein Trainer. Gemeinsam finden wir heraus, wie eine Maschine schlau wird.', 'You’ll be my trainer. Together we’ll find out how a machine becomes smart.') },
    { kind: 'say', mood: 'think', text: L('Meine erste Aufgabe: Ich soll Katzen und Hunde auseinanderhalten. Du schaffst das in einer Sekunde. Ich nicht.', 'My first task: I have to tell cats and dogs apart. You can do that in a second. I can’t.') },
    {
      kind: 'game',
      game: 'regeln',
      intro: L('Gib mir eine Regel! Wähle Merkmale aus und drück auf „Bit testen“. Probier ruhig mehrere Regeln.', 'Give me a rule! Pick features and press “Test Bit”. Feel free to try several rules.'),
    },
    { kind: 'say', mood: 'think', text: L('Egal welche Regel: Es gibt immer Ausnahmen. Die Faltohrkatze hat Hängeohren, der Husky ist groß und flauschig.', 'Whatever the rule, there are always exceptions. The fold-eared cat has floppy ears, the husky is big and fluffy.') },
    {
      kind: 'choice',
      question: L('Wie hast du selbst gelernt, Katzen zu erkennen?', 'How did you learn to recognise cats?'),
      options: [
        { text: L('Jemand hat mir eine Liste mit Regeln gegeben.', 'Someone gave me a list of rules.'), feedback: L('Wirklich? Ich glaube eher nicht. Niemand lernt Katzen mit einer Regel-Liste.', 'Really? I doubt it. Nobody learns cats from a list of rules.') },
        { text: L('Ich habe viele Katzen und Hunde gesehen.', 'I’ve seen lots of cats and dogs.'), correct: true, feedback: L('Genau! Du hast so viele Beispiele gesehen, dass du es einfach erkennst.', 'Exactly! You’ve seen so many examples that you simply recognise them.') },
        { text: L('Das wusste ich schon bei meiner Geburt.', 'I knew it when I was born.'), feedback: L('Babys können das noch nicht. Sie lernen es erst.', 'Babies can’t do it yet. They have to learn it.') },
      ],
    },
    { kind: 'say', mood: 'wow', text: L('So funktioniert auch KI: Statt Regeln zu schreiben, zeigt man ihr viele Beispiele. Daraus findet sie selbst heraus, worauf es ankommt.', 'That’s how AI works too: instead of writing rules, you show it lots of examples. From them it works out by itself what matters.') },
    {
      kind: 'info',
      tone: 'plain',
      title: L('Wer ist Bit?', 'Who is Bit?'),
      text: L('Ich rede wie ein kleiner Roboter, der „weiß“ und „denkt“. In Wahrheit bin ich ein Programm, das mit Zahlen rechnet. Wenn ich „ich lerne“ sage, heißt das: Meine Zahlen werden besser eingestellt. Achte in diesen Kästen darauf, was wirklich passiert.', 'I talk like a little robot who “knows” and “thinks”. In truth I’m a program that calculates with numbers. When I say “I learn”, it means: my numbers are getting set better. Watch these boxes to see what really happens.'),
    },
    {
      kind: 'info',
      title: L('Was heißt KI?', 'What does AI mean?'),
      text: L(
        'KI steht für Künstliche Intelligenz. Gemeint sind Computerprogramme, die Aufgaben lösen, für die Menschen nachdenken müssen: Bilder erkennen, Sprache verstehen, Texte schreiben. Die meisten heutigen KIs lernen aus Beispielen. Das nennt man maschinelles Lernen.',
        'AI stands for artificial intelligence. It means computer programs that solve tasks people need to think about: recognising pictures, understanding speech, writing texts. Most of today’s AIs learn from examples. This is called machine learning.',
      ),
    },
    {
      kind: 'choice',
      question: L('Ein normales Programm folgt Regeln, die ein Mensch geschrieben hat. Und eine lernende KI?', 'A normal program follows rules a person wrote. And a learning AI?'),
      options: [
        { text: L('Sie findet die Regeln selbst – aus Beispielen.', 'It finds the rules itself – from examples.'), correct: true },
        { text: L('Sie braucht gar keine Daten.', 'It doesn’t need any data at all.'), feedback: L('Doch! Ohne Beispiele kann ich nichts lernen.', 'Oh yes it does! Without examples I can’t learn anything.') },
        { text: L('Sie weiß von Anfang an alles.', 'It knows everything from the start.'), feedback: L('Schön wär’s! Ich wusste am Anfang gar nichts.', 'If only! At the start I knew nothing.') },
      ],
      explain: L('Darum sind Beispiele (Daten) für eine KI so wichtig – darum geht es im nächsten Bereich.', 'That’s why examples (data) matter so much to an AI – more on that soon.'),
    },
    { kind: 'say', mood: 'happy', text: L('Danke für meinen ersten Trainingstag! Als Nächstes schauen wir, wo überall schon KI steckt.', 'Thanks for my first day of training! Next, let’s see where AI is already hiding.') },
  ],
};

export default lesson;
