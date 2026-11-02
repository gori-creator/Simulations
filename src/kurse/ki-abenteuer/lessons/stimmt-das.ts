import { L } from '../../../curriculum/helpers';
import type { LessonContent } from '../../types';
import type { KartenProps } from '../../gemeinsam/games/karten';

const cards: KartenProps = {
  a: L('Stimmt', 'True'),
  b: L('Stimmt nicht', 'False'),
  aIcon: '✅',
  bIcon: '❌',
  done: L('{n} von {total} richtig geprüft! Du lässt dir nichts erzählen.', 'You checked {n} of {total} correctly! Nobody fools you.'),
  cards: [
    { emoji: '🗼', text: L('Bit sagt: „Der Eiffelturm steht in Paris.“', 'Bit says: “The Eiffel Tower is in Paris.”'), answer: 'a', why: L('Stimmt – das kann man in jedem Atlas nachschlagen.', 'True – you can look it up in any atlas.') },
    { emoji: '🐬', text: L('Bit sagt: „Delfine sind Fische.“', 'Bit says: “Dolphins are fish.”'), answer: 'b', why: L('Delfine sind Säugetiere. Sie atmen Luft und säugen ihre Jungen.', 'Dolphins are mammals. They breathe air and feed their young milk.') },
    { emoji: '🕷️', text: L('Bit sagt: „Spinnen haben sechs Beine.“', 'Bit says: “Spiders have six legs.”'), answer: 'b', why: L('Spinnen haben acht Beine. Sechs Beine haben Insekten.', 'Spiders have eight legs. Insects have six.') },
    { emoji: '🌍', text: L('Bit sagt: „Die Erde braucht ein Jahr für eine Runde um die Sonne.“', 'Bit says: “The Earth takes a year to go once around the Sun.”'), answer: 'a', why: L('Stimmt – genau daher kommt unser Jahr.', 'True – that’s exactly where our year comes from.') },
    { emoji: '📞', text: L('Bit sagt: „Albert Einstein hat das Telefon erfunden.“', 'Bit says: “Albert Einstein invented the telephone.”'), answer: 'b', why: L('Klingt schlau, ist aber falsch. Das Telefon wurde lange vor Einsteins Ruhm entwickelt, unter anderem von Philipp Reis und Alexander Graham Bell.', 'Sounds clever, but it’s wrong. The telephone was developed long before Einstein became famous, among others by Philipp Reis and Alexander Graham Bell.') },
    { emoji: '💧', text: L('Bit sagt: „Wasser kocht auf Meereshöhe bei 100 Grad Celsius.“', 'Bit says: “At sea level, water boils at 100 degrees Celsius.”'), answer: 'a', why: L('Stimmt. Auf hohen Bergen kocht es schon früher.', 'True. On high mountains it boils earlier.') },
    { emoji: '⛰️', text: L('Bit sagt: „Der Mount Everest ist der höchste Berg Deutschlands.“', 'Bit says: “Mount Everest is the highest mountain in Germany.”'), answer: 'b', why: L('Der Everest steht im Himalaya. Der höchste Berg Deutschlands ist die Zugspitze.', 'Everest is in the Himalayas. Germany’s highest mountain is the Zugspitze.') },
  ],
};

const lesson: LessonContent = {
  takeaway: L('KI-Antworten können erfunden sein, auch wenn sie sicher klingen. Wichtiges immer mit einer zweiten Quelle prüfen.', 'AI answers can be made up even when they sound sure. Always check important things with a second source.'),
  steps: [
    { kind: 'say', mood: 'happy', text: L('Ich habe so viel gelesen, dass ich zu allem etwas sagen kann. Klingt gut, oder?', 'I’ve read so much that I can say something about everything. Sounds good, right?') },
    { kind: 'say', mood: 'wink', text: L('Aber erinnerst du dich? Ich baue Sätze aus Wörtern, die oft zusammen vorkommen. Manchmal klingt das sicher – und ist trotzdem falsch. Prüf mich!', 'But remember? I build sentences from words that often go together. Sometimes that sounds certain – and is still wrong. Check me!') },
    { kind: 'game', game: 'karten', props: cards, intro: L('Stimmt das, was ich sage? Entscheide bei jeder Karte.', 'Is what I say true? Decide for each card.') },
    {
      kind: 'choice',
      question: L('Eine KI nennt dir eine Zahl für dein Referat. Was machst du?', 'An AI gives you a number for your presentation. What do you do?'),
      options: [
        { text: L('Ich übernehme sie, KI weiß ja alles.', 'I use it, AI knows everything.'), feedback: L('Ich weiß nicht alles – und ich gebe es nicht immer zu.', 'I don’t know everything – and I don’t always admit it.') },
        { text: L('Ich prüfe sie in einer zweiten, verlässlichen Quelle.', 'I check it in a second, reliable source.'), correct: true, feedback: L('Sehr gut. Lexikon, Schulbuch oder eine bekannte Website – am besten zwei.', 'Very good. An encyclopedia, a school book or a well-known website – ideally two.') },
        { text: L('Ich frage die KI, ob sie sicher ist.', 'I ask the AI whether it’s sure.'), feedback: L('Ich sage dann oft „Ja“ – auch wenn ich falschliege.', 'I’ll often say “yes” – even when I’m wrong.') },
      ],
    },
    {
      kind: 'info',
      title: L('Erfundene Antworten', 'Made-up answers'),
      text: L(
        'Wenn eine Sprach-KI etwas erfindet, das echt klingt, sagen Fachleute „sie halluziniert“. Das passiert besonders bei Zahlen, Namen, Zitaten und Quellenangaben. Deshalb gilt: KI-Antworten sind ein Vorschlag, kein Beweis.',
        'When a language AI makes up something that sounds real, experts say it is “hallucinating”. This happens especially with numbers, names, quotes and references. So the rule is: AI answers are a suggestion, not proof.',
      ),
    },
    { kind: 'say', mood: 'wow', text: L('Du bist ein guter Faktenprüfer! Eine letzte Lektion noch – über deine Daten.', 'You’re a great fact-checker! One last lesson – about your data.') },
  ],
};

export default lesson;
