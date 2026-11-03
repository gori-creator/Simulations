import { L } from '../../../curriculum/helpers';
import type { KartenProps } from '../../gemeinsam/games/karten';
import type { LessonContent } from '../../types';

/**
 * Lektion „KI braucht Strom“: Rechenzentren, Training gegen Nutzung, sparsam
 * nutzen. Zahlen mit Quelle (vorsichtig gerundet): IEA (2025) „Energy and AI“
 * – Rechenzentren 2024 rund 415 TWh, etwa 1,5 % des Stromverbrauchs der Welt;
 * Google (2025) – mittlerer Gemini-Text-Prompt etwa 0,24 Wh; Patterson et al.
 * (2021) – Training von GPT-3 etwa 1 300 MWh.
 */
const cards: KartenProps = {
  a: L('Stimmt', 'True'),
  b: L('Stimmt nicht', 'False'),
  aIcon: '✅',
  bIcon: '❌',
  done: L('{n} von {total} richtig! Du weißt, was hinter KI steckt: Computer, Strom und Kühlung.', '{n} of {total} correct! You know what is behind AI: computers, power and cooling.'),
  cards: [
    { emoji: '☁️', text: L('KI ist nur Software in der „Cloud“ – Strom braucht sie keinen.', 'AI is just software in the “cloud” – it needs no power.'), answer: 'b', why: L('Die „Cloud“ sind echte Computer in riesigen Hallen, den Rechenzentren. Sie laufen Tag und Nacht mit Strom.', 'The “cloud” is real computers in huge halls called data centres. They run day and night on electricity.') },
    { emoji: '🏋️', text: L('Das Training eines großen KI-Modells braucht viel mehr Strom als eine einzelne Frage an den fertigen Chatbot.', 'Training a large AI model needs far more power than a single question to the finished chatbot.'), answer: 'a', why: L('Beim Training rechnen Tausende Computer wochenlang. Eine einzelne Frage ist dagegen winzig – aber es gibt Milliarden davon.', 'During training thousands of computers calculate for weeks. A single question is tiny in comparison – but there are billions of them.') },
    { emoji: '💧', text: L('Viele Rechenzentren brauchen auch Wasser, um ihre Computer zu kühlen.', 'Many data centres also need water to cool their computers.'), answer: 'a', why: L('Computer werden heiß. Viele Rechenzentren kühlen mit Wasser – das ist an trockenen Orten ein Problem.', 'Computers get hot. Many data centres cool with water – which is a problem in dry places.') },
    { emoji: '📺', text: L('Eine einfache Textfrage an einen Chatbot braucht ungefähr so viel Strom wie ein paar Sekunden Fernsehen.', 'A simple text question to a chatbot uses about as much power as a few seconds of TV.'), answer: 'a', why: L('So schätzte es Google 2025 für seinen Chatbot. Bilder und Videos zu erzeugen braucht deutlich mehr.', 'That is what Google estimated in 2025 for its chatbot. Creating pictures and videos needs a lot more.') },
    { emoji: '🌍', text: L('Rechenzentren brauchen zusammen schon gut die Hälfte des Stroms der ganzen Welt.', 'Data centres together already use well over half of the whole world’s electricity.'), answer: 'b', why: L('Es ist viel weniger: 2024 etwa 1,5 %. Aber der Bedarf wächst schnell – vor allem wegen KI.', 'It is much less: about 1.5% in 2024. But demand is growing fast – mainly because of AI.') },
    { emoji: '🎨', text: L('Für jede Kleinigkeit ein neues Bild erzeugen zu lassen kostet nichts – es ist ja nur ein Klick.', 'Having a new picture generated for every little thing costs nothing – it is just one click.'), answer: 'b', why: L('Jeder Klick lässt Computer im Rechenzentrum arbeiten. Ein Bild braucht viel mehr Strom als eine Textfrage.', 'Every click makes computers in a data centre work. A picture needs much more power than a text question.') },
  ],
};

const lesson: LessonContent = {
  takeaway: L('KI läuft auf Computern in Rechenzentren und braucht Strom – am meisten beim Training. Sparsam nutzen heißt: KI fragen, wenn sie wirklich hilft.', 'AI runs on computers in data centres and needs power – most of all for training. Using it sparingly means asking AI when it really helps.'),
  steps: [
    { kind: 'say', mood: 'happy', text: L('Ich wohne nicht in deinem Handy. Wenn du einen Chatbot fragst, rechnen Computer in einem großen Rechenzentrum – irgendwo auf der Welt.', 'I don’t live in your phone. When you ask a chatbot, computers in a big data centre do the calculating – somewhere in the world.') },
    {
      kind: 'predict',
      question: L('Was braucht mehr Strom: eine Frage an einen Chatbot – oder das Training des Chatbots, bevor er fertig ist?', 'What needs more power: one question to a chatbot – or training the chatbot before it is finished?'),
      options: [{ text: L('Die eine Frage', 'The one question') }, { text: L('Das Training', 'The training') }, { text: L('Beides gleich viel', 'Both the same') }],
      reveal: L('Probier es mit den Karten aus – eine davon verrät es.', 'Try it with the cards – one of them gives it away.'),
    },
    { kind: 'game', game: 'karten', props: cards, intro: L('Stimmt das? Entscheide bei jeder Karte.', 'Is it true? Decide for each card.') },
    {
      kind: 'info',
      tone: 'plain',
      title: L('Training und Nutzung', 'Training and use'),
      text: L(
        'Fürs Training rechnen Tausende Spezialcomputer oft wochenlang. Für ein großes Sprachmodell von 2020 schätzten Forschende etwa so viel Strom, wie über 300 Haushalte in Deutschland in einem Jahr brauchen. Eine einzelne Textfrage braucht dagegen nur etwa so viel wie ein paar Sekunden Fernsehen. Weil aber jeden Tag Milliarden Fragen gestellt werden, zählt beides.',
        'For training, thousands of special computers often calculate for weeks. For a large language model from 2020, researchers estimated about as much electricity as more than 300 German households use in a year. A single text question, by contrast, needs only about as much as a few seconds of TV. But because billions of questions are asked every day, both matter.',
      ),
    },
    {
      kind: 'calc',
      question: L('Eine Textfrage an einen Chatbot braucht etwa 0,3 Wattstunden. Wie viele Wattstunden brauchen 1 000 solche Fragen?', 'A text question to a chatbot needs about 0.3 watt-hours. How many watt-hours do 1,000 such questions need?'),
      answer: 300,
      tolerance: 0.5,
      unit: 'Wh',
      hint: L('Rechne 0,3 mal 1 000.', 'Work out 0.3 times 1,000.'),
      solution: L('0,3 · 1 000 = 300 Wattstunden. Damit leuchtet eine LED-Lampe (10 Watt) etwa 30 Stunden lang.', '0.3 · 1,000 = 300 watt-hours. That keeps an LED bulb (10 watts) lit for about 30 hours.'),
    },
    {
      kind: 'choice',
      question: L('Wie nutzt du KI sparsam?', 'How do you use AI sparingly?'),
      options: [
        { text: L('Ich frage sie, wenn sie mir wirklich hilft – und denke vorher über eine gute Frage nach.', 'I ask it when it really helps me – and think about a good question first.'), correct: true, feedback: L('Genau. Eine gute Frage spart zehn ungefähre.', 'Exactly. One good question saves ten vague ones.') },
        { text: L('Ich lasse mir zum Spaß hundert Bilder hintereinander erzeugen.', 'I have a hundred pictures generated in a row for fun.'), feedback: L('Jedes Bild lässt Computer im Rechenzentrum arbeiten – das läppert sich.', 'Every picture makes computers in a data centre work – it adds up.') },
        { text: L('Das ist egal, KI braucht keinen Strom.', 'It doesn’t matter, AI needs no power.'), feedback: L('Doch: Hinter jeder Antwort stehen Computer, die Strom und oft auch Kühlwasser brauchen.', 'It does: behind every answer there are computers that need power and often cooling water too.') },
      ],
    },
    { kind: 'say', mood: 'wink', text: L('Jetzt kennst du auch die Rückseite der KI: Strom, Wasser, Rechenzentren. Bereit für die große Abschlussmission?', 'Now you know the other side of AI too: power, water, data centres. Ready for the big final mission?') },
  ],
};

export default lesson;
