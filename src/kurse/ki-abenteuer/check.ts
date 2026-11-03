import { L } from '../../curriculum/helpers';
import type { CheckQuestion } from '../types';

/**
 * Vorher-Nachher-Check im KI-Abenteuer: eine Frage je Welt, eigene
 * Formulierungen (nicht wortgleich mit den Lektionen), damit der Endcheck
 * Verständnis zeigt und nicht nur Wiedererkennen. Die falschen Antworten
 * greifen typische Fehlvorstellungen auf (KI als Gehirn, Computer sind neutral …).
 */
export const CHECK: CheckQuestion[] = [
  {
    world: 'erwachen',
    question: L('Was unterscheidet eine lernende KI von einem normalen Computerprogramm?', 'What makes a learning AI different from a normal computer program?'),
    options: [
      { text: L('Sie findet die Regeln selbst – aus vielen Beispielen.', 'It finds the rules itself – from lots of examples.'), correct: true },
      { text: L('Sie hat ein eigenes Gehirn wie ein Mensch.', 'It has its own brain like a human.') },
      { text: L('Sie weiß von Anfang an alles, was es gibt.', 'It knows everything there is right from the start.') },
    ],
    explain: L('Ein normales Programm folgt Regeln, die Menschen aufgeschrieben haben. Eine lernende KI sucht sich die Regeln selbst aus Beispielen. Ein Gehirn hat sie nicht.', 'A normal program follows rules that people wrote down. A learning AI works out the rules itself from examples. It does not have a brain.'),
  },
  {
    world: 'vorfahren',
    question: L('Ein Chatbot schreibt so, dass viele ihn für einen Menschen halten. Was zeigt das?', 'A chatbot writes in a way that makes many people think it is human. What does that show?'),
    options: [
      { text: L('Er kann gut so tun, als wäre er ein Mensch.', 'It is good at pretending to be human.'), correct: true },
      { text: L('Er denkt und fühlt genau wie ein Mensch.', 'It thinks and feels just like a human.') },
      { text: L('In ihm sitzt heimlich ein Mensch, der tippt.', 'A person is secretly hiding inside it and typing.') },
    ],
    explain: L('Schon 1966 hielten Menschen den einfachen Chatbot ELIZA für verständnisvoll – dabei setzte er nur Wörter in Vorlagen ein. Menschlich klingen und menschlich sein ist nicht dasselbe.', 'As early as 1966 people thought the simple chatbot ELIZA was understanding – yet it only put words into templates. Sounding human and being human are not the same.'),
  },
  {
    world: 'daten',
    question: L('Eine KI lernt aus Beispielen, von denen viele falsch beschriftet sind. Was passiert?', 'An AI learns from examples, and many of them are labelled wrongly. What happens?'),
    options: [
      { text: L('Sie lernt die Fehler mit und liegt später öfter daneben.', 'It learns the mistakes too and is wrong more often later.'), correct: true },
      { text: L('Sie bemerkt die Fehler und lernt trotzdem alles richtig.', 'It notices the mistakes and still learns everything correctly.') },
      { text: L('Nichts – Hauptsache, es sind viele Beispiele.', 'Nothing – as long as there are lots of examples.') },
    ],
    explain: L('Eine KI kann nicht wissen, welche Beispiele falsch sind. Aus schlechten Daten werden schlechte Vorhersagen. Deshalb prüfen und säubern Fachleute ihre Daten.', 'An AI cannot know which examples are wrong. Bad data leads to bad predictions. That is why experts check and clean their data.'),
  },
  {
    world: 'lernen',
    question: L('Wie prüft man ehrlich, wie gut eine KI ist?', 'How do you test fairly how good an AI is?'),
    options: [
      { text: L('Mit neuen Beispielen, die sie beim Lernen nie gesehen hat.', 'With new examples it never saw while learning.'), correct: true },
      { text: L('Mit genau den Beispielen, aus denen sie gelernt hat.', 'With exactly the examples it learned from.') },
      { text: L('Man fragt die KI selbst, wie gut sie ist.', 'You ask the AI itself how good it is.') },
    ],
    explain: L('Wie bei einer Probe: Wer nur die Übungsaufgaben auswendig kann, scheitert an neuen Aufgaben. Darum testet man mit Daten, die die KI nicht kennt.', 'Like a test at school: if you only memorised the practice questions, you fail on new ones. That is why an AI is tested with data it does not know.'),
  },
  {
    world: 'netze',
    question: L('Was ist ein künstliches Neuron?', 'What is an artificial neuron?'),
    options: [
      { text: L('Eine kleine Rechnung: Eingaben mal Gewichte zusammenzählen, mit einer Schwelle vergleichen.', 'A small calculation: add up inputs times weights, compare with a threshold.'), correct: true },
      { text: L('Eine winzige echte Nervenzelle, die in den Computer eingebaut ist.', 'A tiny real nerve cell that is built into the computer.') },
      { text: L('Ein Speicherplatz, in dem genau ein Wort oder ein Bild liegt.', 'A storage place that holds exactly one word or one picture.') },
    ],
    explain: L('Künstliche Neuronen sind nur nach dem Vorbild der Nervenzellen benannt. In Wirklichkeit sind sie Rechnungen mit Zahlen – und viele davon zusammen bilden ein neuronales Netz.', 'Artificial neurons are only named after nerve cells. In reality they are calculations with numbers – and many of them together make a neural network.'),
  },
  {
    world: 'bilder-sprache',
    question: L('Was „sieht“ eine KI, wenn sie ein Foto bekommt?', 'What does an AI “see” when it gets a photo?'),
    options: [
      { text: L('Eine lange Liste von Zahlen – eine für jeden Bildpunkt.', 'A long list of numbers – one for each pixel.'), correct: true },
      { text: L('Das Bild genau so, wie du es mit deinen Augen siehst.', 'The picture exactly as you see it with your eyes.') },
      { text: L('Nur den Namen und die Größe der Datei.', 'Only the name and the size of the file.') },
    ],
    explain: L('Ein Foto besteht aus Pixeln. Jedes Pixel ist für den Computer eine Zahl, bei Farbbildern drei: Rot, Grün und Blau. In diesen Zahlen sucht die KI nach Mustern.', 'A photo is made of pixels. To the computer each pixel is a number, or three for colour pictures: red, green and blue. The AI looks for patterns in these numbers.'),
  },
  {
    world: 'belohnung',
    question: L('Wie kann ein Computer ein Spiel durch Belohnung lernen?', 'How can a computer learn a game through rewards?'),
    options: [
      { text: L('Er probiert viele Züge aus und macht öfter, was zum Gewinnen geführt hat.', 'It tries lots of moves and does more often what led to winning.'), correct: true },
      { text: L('Ein Mensch verrät ihm bei jedem einzelnen Zug, welcher der beste ist.', 'A person tells it for every single move which one is best.') },
      { text: L('Er lernt die Spielregeln auswendig und weiß dann, wie man gewinnt.', 'It memorises the rules and then knows how to win.') },
    ],
    explain: L('Beim Lernen durch Belohnung probiert die KI aus. Was zu einer Belohnung führt, zum Beispiel zu einem Sieg, macht sie öfter – was schiefgeht, seltener. Die „Belohnung“ ist dabei nur eine Zahl.', 'When learning through rewards, the AI tries things out. What leads to a reward, such as a win, it does more often – what goes wrong, less often. The “reward” is just a number.'),
  },
  {
    world: 'kreativ',
    question: L('Wie erzeugt eine Bild-KI ein ganz neues Bild?', 'How does an image AI create a brand-new picture?'),
    options: [
      { text: L('Sie startet mit Rauschen und entfernt es Schritt für Schritt.', 'It starts with noise and removes it step by step.'), correct: true },
      { text: L('Sie sucht ein passendes Foto im Internet und schickt es dir.', 'It searches the internet for a matching photo and sends it to you.') },
      { text: L('Sie klebt Stücke aus gespeicherten Fotos zu einer Collage zusammen.', 'It glues pieces of stored photos together into a collage.') },
    ],
    explain: L('Bildgeneratoren haben an sehr vielen Bildern geübt, Rauschen zu entfernen. Startet man mit reinem Rauschen, entsteht so Schritt für Schritt ein neues Bild – das es vorher nirgends gab.', 'Image generators practised removing noise on huge numbers of pictures. Starting from pure noise, a new picture appears step by step – one that did not exist anywhere before.'),
  },
  {
    world: 'wir',
    question: L('Eine Gesichtserkennung hat fast nur mit Fotos hellhäutiger Menschen gelernt. Was ist zu erwarten?', 'A face recognition system learned almost only from photos of light-skinned people. What would you expect?'),
    options: [
      { text: L('Bei Menschen mit dunkler Haut macht sie mehr Fehler.', 'It makes more mistakes with people who have dark skin.'), correct: true },
      { text: L('Sie erkennt alle Menschen gleich gut – Computer sind ja neutral.', 'It recognises everyone equally well – computers are neutral, after all.') },
      { text: L('Sie erkennt Menschen mit dunkler Haut sogar besser.', 'It recognises people with dark skin even better.') },
    ],
    explain: L('Eine KI ist nur so fair wie ihre Daten. Fehlt eine Gruppe in den Beispielen, macht sie bei dieser Gruppe mehr Fehler. Das zeigte 2018 die Studie „Gender Shades“.', 'An AI is only as fair as its data. If a group is missing from the examples, it makes more mistakes for that group. The 2018 study “Gender Shades” showed this.'),
  },
];
