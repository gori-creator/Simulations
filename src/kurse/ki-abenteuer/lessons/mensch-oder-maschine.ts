import { L } from '../../../curriculum/helpers';
import type { TuringProps } from '../../gemeinsam/games/turing';
import type { LessonContent } from '../../types';

const rounds: TuringProps = {
  scored: false,
  rounds: [
    {
      lines: [
        { who: 'judge', text: L('Ich hatte heute einen blöden Tag.', 'I had a rubbish day today.') },
        { who: 'x', text: L('Erzähl mir mehr über deinen blöden Tag.', 'Tell me more about your rubbish day.') },
        { who: 'judge', text: L('Mein Fahrrad war kaputt.', 'My bike was broken.') },
        { who: 'x', text: L('Warum sagst du, dein Fahrrad war kaputt?', 'Why do you say your bike was broken?') },
      ],
      answer: 'machine',
      why: L('X dreht nur deine Sätze um. So hat der Chatbot ELIZA von 1966 geantwortet.', 'X just turns your sentences around. That’s how the chatbot ELIZA answered in 1966.'),
    },
    {
      lines: [
        { who: 'judge', text: L('Was ist 3456 mal 789?', 'What is 3456 times 789?') },
        { who: 'x', text: L('keine ahnung 😅 hab grad keinen taschenrechner', 'no idea 😅 don’t have a calculator right now') },
      ],
      answer: 'human',
      why: L('Ein Mensch rechnet so etwas nicht schnell im Kopf – und schreibt locker, ohne Großbuchstaben.', 'A person can’t do that in their head quickly – and writes casually, without capital letters.'),
    },
    {
      lines: [
        { who: 'judge', text: L('Was ist 3456 mal 789?', 'What is 3456 times 789?') },
        { who: 'x', text: L('2.726.784', '2,726,784') },
      ],
      answer: 'machine',
      why: L('Blitzschnell und genau richtig gerechnet. Aber Vorsicht: Eine schlaue Maschine könnte absichtlich so tun, als müsste sie überlegen!', 'Lightning-fast and exactly right. But careful: a clever machine could pretend to need time to think!'),
    },
    {
      lines: [
        { who: 'judge', text: L('Was hast du am Wochenende gemacht?', 'What did you do at the weekend?') },
        { who: 'x', text: L('Ich bin ein Computerprogramm und habe kein Wochenende. Aber ich kann dir Ideen für deins geben!', 'I’m a computer program and don’t have weekends. But I can give you ideas for yours!') },
      ],
      answer: 'machine',
      why: L('Hier verrät sich X selbst. In der EU müssen Chatbots sogar sagen, dass sie Chatbots sind.', 'Here X gives itself away. In the EU chatbots even have to say that they are chatbots.'),
    },
    {
      lines: [
        { who: 'judge', text: L('Erzähl mir einen Witz!', 'Tell me a joke!') },
        { who: 'x', text: L('Treffen sich zwei Magnete. Sagt der eine: „Was soll ich heute bloß anziehen?“ 😂 sorry, der ist alt', 'Two magnets meet. One says: “What on earth should I attract today?” 😂 sorry, it’s an old one') },
      ],
      answer: 'human',
      why: L('Das war ein Mensch – aber ein Chatbot hätte den Witz genauso schreiben können. Oft kann man es nicht sicher erkennen!', 'That was a person – but a chatbot could have written the same joke. Often you can’t tell for sure!'),
    },
  ],
  done: L('{n} von {total} richtig. Gar nicht so leicht, oder?', '{n} of {total} correct. Not that easy, is it?'),
};

const lesson: LessonContent = {
  takeaway: L('Der Turing-Test prüft, ob man Mensch und Maschine im Chat auseinanderhalten kann – nicht, ob die Maschine wirklich denkt.', 'The Turing test checks whether you can tell human and machine apart in a chat – not whether the machine really thinks.'),
  steps: [
    { kind: 'say', mood: 'happy', text: L('Ich habe Vorfahren! Schon vor über 70 Jahren haben Menschen überlegt, ob Maschinen denken können.', 'I have ancestors! More than 70 years ago people were already wondering whether machines can think.') },
    { kind: 'say', mood: 'think', text: L('Der Mathematiker Alan Turing hatte 1950 eine Idee: Du chattest mit jemandem, den du nicht siehst. Merkst du nicht, dass es eine Maschine ist, hat sie den Test bestanden.', 'In 1950 the mathematician Alan Turing had an idea: you chat with someone you can’t see. If you don’t notice that it’s a machine, it has passed the test.') },
    {
      kind: 'predict',
      question: L('Was glaubst du: Woran erkennst du eine Maschine im Chat?', 'What do you think: how can you spot a machine in a chat?'),
      options: [
        { text: L('Sie macht keine Tippfehler', 'It makes no typos') },
        { text: L('Sie rechnet blitzschnell', 'It calculates lightning-fast') },
        { text: L('Sie weicht Fragen aus', 'It dodges questions') },
        { text: L('Man erkennt es nicht sicher', 'You can’t tell for sure') },
      ],
      reveal: L('Probier es aus! Du bist die Jury.', 'Try it! You are the judge.'),
    },
    { kind: 'game', game: 'turing', props: rounds, intro: L('Lies jeden Chat. Hat ein Mensch oder eine Maschine geantwortet? Hier gibt es keine Minuspunkte.', 'Read each chat. Did a person or a machine answer? There are no minus points here.') },
    {
      kind: 'info',
      tone: 'plain',
      title: L('Klingt wie ein Mensch – ist aber keiner', 'Sounds like a person – but isn’t'),
      text: L('Ein Chatbot versteht nicht, was er schreibt. Er rechnet aus, welche Antwort gut passen könnte. Dass er klingt wie ein Mensch, heißt nicht, dass er denkt oder fühlt wie einer.', 'A chatbot doesn’t understand what it writes. It calculates which answer might fit well. Sounding like a person doesn’t mean it thinks or feels like one.'),
    },
    {
      kind: 'choice',
      question: L('Ein Chatbot hat 3 von 10 Leuten getäuscht. Was heißt das?', 'A chatbot fooled 3 out of 10 people. What does that mean?'),
      options: [
        { text: L('Er denkt wie ein Mensch.', 'It thinks like a person.'), feedback: L('Nein – der Test schaut nur auf die Antworten, nicht ins Innere.', 'No – the test only looks at the answers, not inside.') },
        { text: L('Er kann gut so tun, als wäre er ein Mensch.', 'It’s good at pretending to be a person.'), correct: true, feedback: L('Genau. Der Test misst, wie gut die Maschine nachmacht.', 'Exactly. The test measures how well the machine imitates.') },
        { text: L('Er hat Gefühle.', 'It has feelings.'), feedback: L('Dafür gibt der Test keinen Beweis.', 'The test gives no proof of that.') },
      ],
    },
    {
      kind: 'choice',
      question: L('Warum ist es wichtig zu wissen, ob du mit einer Maschine schreibst?', 'Why does it matter whether you are writing to a machine?'),
      options: [
        { text: L('Damit ich weiß, wem ich vertraue und was ich erzähle.', 'So I know whom I trust and what I share.'), correct: true, feedback: L('Genau! Deshalb müssen sich Chatbots in der EU zu erkennen geben.', 'Exactly! That’s why chatbots in the EU must say what they are.') },
        { text: L('Das ist egal.', 'It doesn’t matter.'), feedback: L('Doch: Einer Maschine erzählt man vielleicht Dinge, die sie speichert.', 'It does: you might tell a machine things that it stores.') },
        { text: L('Weil Maschinen immer lügen.', 'Because machines always lie.'), feedback: L('Nicht immer – aber sie können sich irren, ohne es zu merken.', 'Not always – but they can be wrong without noticing.') },
      ],
    },
    { kind: 'say', mood: 'wink', text: L('Als Nächstes triffst du ELIZA – einen der allerersten Chatbots, von 1966. Mal sehen, ob sie dich versteht …', 'Next you’ll meet ELIZA – one of the very first chatbots, from 1966. Let’s see whether she understands you …') },
  ],
};

export default lesson;
