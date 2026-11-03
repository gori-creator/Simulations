import { L } from '../../../curriculum/helpers';
import type { LessonContent } from '../../types';

const lesson: LessonContent = {
  takeaway: L('Erkunden oder ausnutzen: ε-gierig probiert mit Wahrscheinlichkeit ε zufällig und nimmt sonst die bisher beste Wahl.', 'Explore or exploit: ε-greedy tries something random with probability ε and otherwise takes the best choice so far.'),
  steps: [
    { kind: 'say', mood: 'happy', text: L('Bisher kam die richtige Antwort immer mit den Daten. Beim bestärkenden Lernen gibt es nur eine Rückmeldung: Belohnung. Und man muss selbst ausprobieren, um sie zu bekommen.', 'So far the right answer always came with the data. In reinforcement learning there is only one kind of feedback: reward. And you have to try things yourself to get it.') },
    {
      kind: 'info',
      title: L('Das Dilemma', 'The dilemma'),
      text: L(
        'Nutzt man nur, was bisher am besten aussah, verpasst man vielleicht etwas Besseres. Probiert man ständig Neues, verschenkt man sichere Gewinne. Die ε-gierige Strategie wählt mit Wahrscheinlichkeit ε zufällig, sonst die bisher beste Möglichkeit. Der Name „Bandit“ kommt von Spielautomaten mit einem Arm – heute geht es eher um Werbeanzeigen, Webseiten oder medizinische Studien.',
        'If you only use what looked best so far, you may miss something better. If you constantly try new things, you give away sure gains. The ε-greedy strategy picks at random with probability ε, otherwise the best option so far. The name “bandit” comes from one-armed slot machines – today it’s more about ads, websites or clinical trials.',
      ),
      formula: L('a = zufällig mit Wahrscheinlichkeit ε,  sonst  argmaxᵢ Q̂ᵢ,   Q̂ᵢ = Erfolge / Versuche', 'a = random with probability ε,  else  argmaxᵢ Q̂ᵢ,   Q̂ᵢ = successes / tries'),
    },
    { kind: 'game', game: 'banditen', intro: L('Ein Online-Shop testet vier Startseiten. Zeige 40 Besuchern je eine Seite – und versuche, möglichst viele Käufe zu bekommen.', 'An online shop is testing four home pages. Show 40 visitors one page each – and try to get as many sales as possible.') },
    {
      kind: 'choice',
      question: L('Seite C hatte nach drei Besuchern 0 Käufe. Sollte man sie aufgeben?', 'After three visitors page C had 0 sales. Should you give up on it?'),
      options: [
        { text: L('Nein – drei Versuche sagen bei einer Quote um 50 % noch fast nichts; mit Wahrscheinlichkeit 1/8 passiert das auch bei der besten Seite.', 'No – three trials say almost nothing at a rate around 50%; with probability 1/8 it happens even with the best page.'), correct: true, feedback: L('Genau: 0,5³ = 0,125. Kleine Stichproben täuschen.', 'Exactly: 0.5³ = 0.125. Small samples deceive.') },
        { text: L('Ja, sie ist offensichtlich schlecht.', 'Yes, it’s obviously bad.'), feedback: L('Genau dieser Fehlschluss lässt ε = 0 an mittelmäßigen Seiten hängen bleiben.', 'Exactly this fallacy makes ε = 0 get stuck on mediocre pages.') },
      ],
    },
    {
      kind: 'info',
      tone: 'plain',
      title: L('Banditen in deinem Feed', 'Bandits in your feed'),
      text: L(
        'Apps testen ständig, welche Beiträge, Bilder oder Überschriften dich länger festhalten – mit genau solchen Verfahren. Die Belohnung ist dabei meist deine Aufmerksamkeit, nicht dein Wohlbefinden. Es lohnt sich zu fragen, wofür ein System eigentlich belohnt wird.',
        'Apps constantly test which posts, pictures or headlines keep you hooked longer – with exactly such methods. The reward is usually your attention, not your well-being. It’s worth asking what a system is actually rewarded for.',
      ),
    },
    {
      kind: 'choice',
      question: L('Was misst ein Empfehlungssystem in einer App meistens als „Belohnung“?', 'What does a recommender system in an app usually measure as its “reward”?'),
      options: [
        { text: L('Aufmerksamkeit: ob du klickst und wie lange du dranbleibst.', 'Attention: whether you click and how long you stay.'), correct: true, feedback: L('Genau. Das lässt sich leicht messen – ob es dir guttut, dagegen kaum.', 'Exactly. That is easy to measure – whether it is good for you hardly is.') },
        { text: L('Ob es dir nach dem Schauen besser geht.', 'Whether you feel better after watching.'), feedback: L('Das wäre schön, lässt sich aber kaum messen. Gezählt werden meist Klicks und Zeit.', 'That would be nice but is hard to measure. What usually counts are clicks and time.') },
        { text: L('Wie viele Beiträge es dir absichtlich nicht zeigt.', 'How many posts it deliberately doesn’t show you.'), feedback: L('Nein – belohnt wird, was dich in der App hält.', 'No – what gets rewarded is whatever keeps you in the app.') },
      ],
    },
    {
      kind: 'calc',
      question: L('Startseite A hatte 7 Käufe bei 10 Besuchern, B 2 Käufe bei 3. Mit ε = 0,1 (Zufallswahl unter beiden Seiten): Mit welcher Wahrscheinlichkeit zeigt ε-gierig als Nächstes A?', 'Home page A had 7 sales from 10 visitors, B 2 sales from 3. With ε = 0.1 (random choice among both pages): with what probability does ε-greedy show A next?'),
      answer: 95,
      tolerance: 0.5, unit: '%',
      hint: L('Erst die bisher beste Seite bestimmen; der Zufall wählt jede Seite mit ε/2.', 'First find the best page so far; randomness picks each page with ε/2.'),
      solution: L('A: 7/10 = 0,70 > B: 2/3 ≈ 0,67, also ist A die gierige Wahl. P(A) = (1 − ε) + ε/2 = 0,9 + 0,05 = 0,95 = 95 %.', 'A: 7/10 = 0.70 > B: 2/3 ≈ 0.67, so A is the greedy choice. P(A) = (1 − ε) + ε/2 = 0.9 + 0.05 = 0.95 = 95%.'),
    },
    { kind: 'say', mood: 'wink', text: L('Beim Banditen zählt nur der nächste Zug. Spannender wird es, wenn Belohnungen erst nach vielen Schritten kommen – wie im Labyrinth oder beim Go.', 'With the bandit only the next move counts. It gets more exciting when rewards come only after many steps – like in a maze or in Go.') },
  ],
};

export default lesson;
