import { L } from '../../../curriculum/helpers';
import type { LessonContent } from '../../types';

const lesson: LessonContent = {
  takeaway: L('Naiver Bayes verrechnet Vorwissen mit Wortwahrscheinlichkeiten, als wären die Wörter unabhängig – einfach und oft erstaunlich gut.', 'Naive Bayes combines prior knowledge with word probabilities as if the words were independent – simple and often surprisingly good.'),
  steps: [
    { kind: 'say', mood: 'happy', text: L('Thomas Bayes war Pfarrer und Mathematiker. Sein Satz sagt, wie man eine Vermutung anpasst, wenn neue Beobachtungen dazukommen. Genau das macht ein Spamfilter mit jedem Wort einer Mail.', 'Thomas Bayes was a clergyman and mathematician. His theorem says how to update a belief when new observations come in. That’s exactly what a spam filter does with every word of an email.') },
    {
      kind: 'info',
      title: L('Satz von Bayes', 'Bayes’ theorem'),
      text: L(
        'P(Spam | Wort) = P(Wort | Spam) · P(Spam) / P(Wort). Praktischer ist die Chancen-Form: Neue Chancen = alte Chancen · Likelihood-Verhältnis. Der „naive“ Bayes-Filter tut so, als wären die Wörter unabhängig – dann multipliziert man einfach die Faktoren aller Wörter. Das ist fast immer falsch, funktioniert aber erstaunlich gut.',
        'P(spam | word) = P(word | spam) · P(spam) / P(word). More practical is the odds form: new odds = old odds · likelihood ratio. The “naive” Bayes filter pretends the words are independent – then you simply multiply the factors of all words. That is almost always wrong, but works surprisingly well.',
      ),
      formula: 'P(S)/P(H) · Π P(wᵢ|S)/P(wᵢ|H) = P(S|Mail)/P(H|Mail)',
    },
    {
      kind: 'choice',
      question: L('Ein Wort kam in 3 von 5 Spam-Mails und in 1 von 7 normalen Mails vor. Was macht es mit den Spam-Chancen? (Mit Glättung: (3+1)/(5+2) und (1+1)/(7+2).)', 'A word appeared in 3 of 5 spam mails and in 1 of 7 normal mails. What does it do to the spam odds? (With smoothing: (3+1)/(5+2) and (1+1)/(7+2).)'),
      options: [
        { text: L('Sie werden etwa mit 2,6 multipliziert.', 'They are multiplied by about 2.6.'), correct: true, feedback: L('Richtig: (4/7) / (2/9) ≈ 2,57.', 'Right: (4/7) / (2/9) ≈ 2.57.') },
        { text: L('Sie steigen um 3.', 'They increase by 3.'), feedback: L('Es wird multipliziert, nicht addiert.', 'It multiplies, it doesn’t add.') },
        { text: L('Sie werden halbiert.', 'They are halved.'), feedback: L('Das Wort ist im Spam häufiger – die Chancen steigen.', 'The word is more common in spam – the odds go up.') },
      ],
    },
    { kind: 'game', game: 'bayes', intro: L('Stell aus Wörtern eine neue Mail zusammen und beobachte die Spam-Wahrscheinlichkeit. Ändere auch den Anteil Spam vorab.', 'Put together a new mail from words and watch the spam probability. Also change the prior share of spam.') },
    {
      kind: 'info',
      title: L('Warum glätten?', 'Why smooth?'),
      text: L(
        '„Gewinn“ kam in keiner normalen Mail vor. Ohne Glättung wäre P(Gewinn | kein Spam) = 0 – eine einzige normale Mail mit „Gewinn“ wäre dann zu 100 % Spam, egal was sonst drinsteht. Laplace-Glättung zählt zu jedem Wort einen gedachten Fall dazu. So bleibt der Filter vorsichtig bei seltenen Wörtern.',
        '“Prize” never appeared in a normal mail. Without smoothing P(prize | no spam) = 0 – a single normal mail containing “prize” would then be 100% spam, no matter what else it says. Laplace smoothing adds one imagined case to every word. That keeps the filter careful with rare words.',
      ),
    },
    {
      kind: 'choice',
      question: L('Der Filter verschiebt bei 50 % Wahrscheinlichkeit in den Spamordner. Warum setzen echte Filter die Schwelle oft höher, z. B. bei 90 %?', 'The filter moves mails to spam at 50% probability. Why do real filters often set the threshold higher, e.g. at 90%?'),
      options: [
        { text: L('Eine wichtige Mail im Spamordner (falsch positiv) ist schlimmer als eine Werbung im Posteingang (falsch negativ).', 'An important mail in the spam folder (false positive) is worse than an ad in the inbox (false negative).'), correct: true, feedback: L('Genau: Die Schwelle hängt davon ab, welche Fehler wie teuer sind.', 'Exactly: the threshold depends on how costly each kind of error is.') },
        { text: L('Weil Wahrscheinlichkeiten unter 90 % falsch berechnet sind.', 'Because probabilities below 90% are computed wrongly.'), feedback: L('Die Rechnung stimmt – es geht um die Folgen der Entscheidung.', 'The calculation is fine – it’s about the consequences of the decision.') },
      ],
    },
    {
      kind: 'choice',
      question: L('Ein Test auf eine seltene Krankheit (1 von 1000) erkennt Kranke zu 99 % und meldet Gesunde zu 1 % fälschlich. Der Test ist positiv. Wie wahrscheinlich ist man krank?', 'A test for a rare disease (1 in 1000) detects sick people 99% of the time and falsely flags healthy people 1% of the time. The test is positive. How likely are you to be sick?'),
      options: [
        { text: L('99 %', '99%'), feedback: L('Das vergisst die Grundrate: Unter 1000 Menschen ist nur einer krank, aber etwa zehn Gesunde werden fälschlich positiv getestet.', 'That ignores the base rate: among 1000 people only one is sick, but about ten healthy people test positive by mistake.') },
        { text: L('Etwa 9 %', 'About 9%'), correct: true, feedback: L('Richtig: 0,99 / (0,99 + 9,99) ≈ 9 %. Dieselbe Rechnung wie im Spamfilter.', 'Right: 0.99 / (0.99 + 9.99) ≈ 9%. The same calculation as in the spam filter.') },
        { text: L('1 %', '1%'), feedback: L('Der positive Test erhöht die Wahrscheinlichkeit schon deutlich – nur nicht auf 99 %.', 'The positive test does raise the probability a lot – just not to 99%.') },
      ],
    },
    { kind: 'say', mood: 'wink', text: L('Wahrscheinlichkeit misst Unsicherheit. Information misst, wie viel Unsicherheit eine Frage beseitigt. Damit baut die Mission dieser Welt einen Entscheidungsbaum.', 'Probability measures uncertainty. Information measures how much uncertainty a question removes. With that, this world’s mission builds a decision tree.') },
  ],
};

export default lesson;
