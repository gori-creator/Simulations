import { L } from '../../../curriculum/helpers';
import type { ZeitstrahlProps } from '../../gemeinsam/games/zeitstrahl';
import type { LessonContent } from '../../types';

const timeline: ZeitstrahlProps = {
  events: [
    { year: 1943, icon: '🔣', text: L('Das erste künstliche Neuron', 'The first artificial neuron') },
    { year: 1950, icon: '🎭', text: L('Turing schlägt das Imitationsspiel vor', 'Turing proposes the imitation game') },
    { year: 1958, icon: '🎯', text: L('Rosenblatts lernendes Perzeptron', 'Rosenblatt’s learning perceptron') },
    { year: 1966, icon: '💭', text: L('ELIZA chattet mit Regeln', 'ELIZA chats with rules') },
    { year: 1969, icon: '❄️', text: L('„Perceptrons“ – der erste Winter naht', '“Perceptrons” – the first winter approaches') },
    { year: 1986, icon: '🔁', text: L('Backpropagation macht Schichten lernbar', 'Backpropagation makes layers trainable') },
    { year: 1997, icon: '♟️', text: L('Deep Blue schlägt Kasparow', 'Deep Blue beats Kasparov') },
    { year: 2012, icon: '🚀', text: L('AlexNet gewinnt ImageNet', 'AlexNet wins ImageNet') },
    { year: 2016, icon: '⚪', text: L('AlphaGo besiegt Lee Sedol', 'AlphaGo defeats Lee Sedol') },
    { year: 2017, icon: '🔦', text: L('Der Transformer: „Attention Is All You Need“', 'The transformer: “Attention Is All You Need”') },
    { year: 2022, icon: '🧑‍🏫', text: L('ChatGPT erscheint', 'ChatGPT is released') },
  ],
  done: L('Achtzig Jahre in elf Schritten – und du hast fast jeden davon selbst nachgebaut.', 'Eighty years in eleven steps – and you rebuilt almost every one of them yourself.'),
};

const lesson: LessonContent = {
  takeaway: L('KI ist Mathematik mit Daten – mächtig, aber nicht magisch. Wer sie versteht, kann mitreden und mitentscheiden.', 'AI is mathematics with data – powerful but not magic. Whoever understands it can join the debate and the decisions.'),
  steps: [
    { kind: 'say', mood: 'happy', text: L('Letzte Mission! Du hast Regeln geschrieben, Bäume durchsucht, Geraden angepasst, Netze trainiert, Bilder gefaltet, Tokens gebaut, Agenten belohnt und Fairness gemessen. Zeit, alles zusammenzusetzen.', 'Final mission! You’ve written rules, searched trees, fitted lines, trained networks, convolved images, built tokens, rewarded agents and measured fairness. Time to put it all together.') },
    { kind: 'game', game: 'zeitstrahl', props: timeline, intro: L('Bring die großen Meilensteine in die richtige Reihenfolge.', 'Put the great milestones in the right order.') },
    {
      kind: 'choice',
      question: L('Was haben fast alle heutigen KI-Erfolge gemeinsam?', 'What do almost all of today’s AI successes have in common?'),
      options: [
        { text: L('Viele Daten, viel Rechenleistung und Gradientenabstieg auf einer Fehlerfunktion.', 'Lots of data, lots of computing power and gradient descent on a loss function.'), correct: true, feedback: L('Genau – plus eine passende Bauart wie Faltung oder Attention.', 'Exactly – plus a suitable architecture such as convolution or attention.') },
        { text: L('Von Hand geschriebene Regeln.', 'Hand-written rules.'), feedback: L('Das war die Linie der 1970er und 80er.', 'That was the approach of the 1970s and 80s.') },
        { text: L('Ein künstliches Bewusstsein.', 'An artificial consciousness.'), feedback: L('Dafür gibt es keinen Beleg – es sind Rechenverfahren.', 'There is no evidence of that – they are computational methods.') },
      ],
    },
    {
      kind: 'info',
      title: L('Offene Fragen', 'Open questions'),
      text: L(
        'Energie: Nach einer Schätzung von 2021 verbrauchte schon das Training von GPT-3 rund 1300 Megawattstunden Strom; heutige Modelle sind viel größer, und alle Rechenzentren der Welt brauchten 2024 rund 1,5 % des Stroms (Internationale Energieagentur). Arbeit: Welche Tätigkeiten ändern sich, welche fallen weg? Wahrheit: Wie gehen wir mit täuschend echten Fälschungen um? Kontrolle: 2023 forderten Tausende in einem offenen Brief eine Pause beim Training noch größerer Modelle; andere hielten das für übertrieben. Auf keine dieser Fragen gibt es eine Rechnung als Antwort.',
        'Energy: according to a 2021 estimate, training GPT-3 alone used about 1,300 megawatt hours of electricity; today’s models are much larger, and all the world’s data centres used about 1.5% of its electricity in 2024 (International Energy Agency). Work: which jobs change, which disappear? Truth: how do we deal with deceptively real fakes? Control: in 2023 thousands signed an open letter calling for a pause in training even larger models; others thought that exaggerated. None of these questions has a calculation as its answer.',
      ),
    },
    {
      kind: 'calc',
      question: L('Ein deutscher Haushalt braucht etwa 3 500 kWh Strom im Jahr. Wie viele Haushalte könnte man mit den 1 300 MWh für das Training von GPT-3 ein Jahr lang versorgen?', 'A German household uses about 3,500 kWh of electricity a year. How many households could the 1,300 MWh used to train GPT-3 supply for a year?'),
      answer: 371,
      tolerance: 2,
      hint: L('1 MWh = 1 000 kWh.', '1 MWh = 1,000 kWh.'),
      solution: L('1 300 MWh = 1 300 000 kWh. 1 300 000 : 3 500 ≈ 371 Haushalte – nur für ein einziges Training. Dazu kommt der Strom für jede Nutzung.', '1,300 MWh = 1,300,000 kWh. 1,300,000 ÷ 3,500 ≈ 371 households – for a single training run. On top of that comes the electricity for every use.'),
    },
    {
      kind: 'predict',
      question: L('Deine Position: Sollte eine KI allein entscheiden dürfen, wer zu einem Vorstellungsgespräch eingeladen wird?', 'Your position: should an AI alone be allowed to decide who is invited to a job interview?'),
      options: [
        { text: L('Ja, sie ist wenigstens konsequent.', 'Yes, at least it’s consistent.') },
        { text: L('Nur mit menschlicher Prüfung und Einspruchsmöglichkeit.', 'Only with human review and a way to object.') },
        { text: L('Nein, das sollen Menschen entscheiden.', 'No, people should decide that.') },
      ],
      reveal: L('Hier gibt es kein Richtig oder Falsch – aber gute und schlechte Begründungen. Der AI Act verlangt für solche Systeme menschliche Aufsicht.', 'There is no right or wrong here – but good and bad reasons. The AI Act requires human oversight for such systems.'),
    },
    {
      kind: 'predict',
      question: L('Deine Position: Wie solltest du selbst KI beim Lernen nutzen?', 'Your position: how should you use AI for learning yourself?'),
      options: [
        { text: L('Gar nicht.', 'Not at all.') },
        { text: L('Als Hilfe zum Erklären und Üben – aber selbst denken und Antworten prüfen.', 'As help for explaining and practising – but think for yourself and check answers.') },
        { text: L('Für alles, dann spare ich Zeit.', 'For everything, then I save time.') },
      ],
      reveal: L('Du weißt jetzt, wie Sprachmodelle Antworten erzeugen – und warum sie überzeugend klingen, auch wenn sie irren. Das ist der beste Schutz.', 'You now know how language models produce answers – and why they sound convincing even when they’re wrong. That’s the best protection.'),
    },
    { kind: 'say', mood: 'wow', text: L('Laborabschluss! Du verstehst jetzt, was in KI-Systemen wirklich passiert – und kannst mitreden, wenn es darum geht, wofür wir sie einsetzen. Die nächsten Kapitel der Geschichte schreiben Menschen wie du.', 'Lab graduation! You now understand what really happens inside AI systems – and can join the debate about what we use them for. The next chapters of the story will be written by people like you.') },
  ],
};

export default lesson;
