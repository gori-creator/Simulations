import { L } from '../../../curriculum/helpers';
import type { LessonContent } from '../../types';

const lesson: LessonContent = {
  takeaway: L('Die Ausgleichsgerade macht die Summe der Fehlerquadrate so klein wie möglich – dafür gibt es eine geschlossene Formel.', 'The regression line makes the sum of squared errors as small as possible – and there is a closed formula for it.'),
  steps: [
    { kind: 'say', mood: 'happy', text: L('Willkommen in der zweiten großen Linie der KI: Statt Wissen aufzuschreiben, lernt man es aus Daten. Das älteste Lernverfahren der Welt ist über 200 Jahre alt.', 'Welcome to the second great line of AI: instead of writing knowledge down, you learn it from data. The oldest learning method in the world is over 200 years old.') },
    { kind: 'say', mood: 'think', text: L('Zehn Schülerinnen und Schüler haben notiert, wie lange sie gelernt haben und wie viele Punkte sie im Test hatten. Gesucht ist ein Modell: eine Gerade y = m·x + b, die aus der Lernzeit die Punkte vorhersagt.', 'Ten students wrote down how long they studied and how many points they got in a test. We want a model: a line y = m·x + b that predicts the points from the study time.') },
    {
      kind: 'predict',
      question: L('Was macht eine Gerade zur „besten“?', 'What makes a line the “best”?'),
      options: [
        { text: L('Sie geht durch möglichst viele Punkte.', 'It goes through as many points as possible.') },
        { text: L('Die Summe der Abweichungen ist null.', 'The sum of the deviations is zero.') },
        { text: L('Die Summe der quadrierten Abweichungen ist minimal.', 'The sum of squared deviations is minimal.') },
      ],
      reveal: L('Das Quadrieren sorgt dafür, dass sich positive und negative Abweichungen nicht aufheben und große Fehler besonders zählen.', 'Squaring makes sure positive and negative deviations don’t cancel and big errors count extra.'),
    },
    { kind: 'game', game: 'regression', intro: L('Zieh die beiden Griffe (oder nutze die Pfeiltasten). Die Quadrate zeigen die Fehler – mach ihre Fläche möglichst klein.', 'Drag the two handles (or use the arrow keys). The squares show the errors – make their area as small as possible.') },
    {
      kind: 'info',
      title: L('Fehlerfunktion und Normalgleichung', 'Loss function and normal equation'),
      text: L(
        'Die mittlere quadratische Abweichung (MSE) misst, wie schlecht ein Modell passt. Lernen heißt hier: die Parameter m und b so wählen, dass die MSE minimal wird. Für die Gerade geht das exakt: Ableitungen nach m und b null setzen ergibt die Normalgleichung. Für neuronale Netze gibt es so eine Formel nicht – dort sucht man das Minimum Schritt für Schritt.',
        'The mean squared error (MSE) measures how badly a model fits. Learning here means choosing the parameters m and b so that the MSE is minimal. For a line this can be done exactly: setting the derivatives with respect to m and b to zero gives the normal equation. For neural networks there is no such formula – there you search for the minimum step by step.',
      ),
      formula: 'MSE(m, b) = (1/n) · Σ (yᵢ − (m·xᵢ + b))²,   m = Σ(xᵢ − x̄)(yᵢ − ȳ) / Σ(xᵢ − x̄)²,   b = ȳ − m·x̄',
    },
    {
      kind: 'choice',
      question: L('Das Modell sagt für 6 Stunden Lernzeit über 100 Punkte voraus. Was ist das Problem?', 'The model predicts over 100 points for 6 hours of study. What’s the problem?'),
      options: [
        { text: L('Es wird über den Bereich der Daten hinaus extrapoliert; dort gilt die Gerade nicht mehr.', 'It extrapolates beyond the range of the data, where the line no longer holds.'), correct: true, feedback: L('Genau. Ein Modell kennt nur den Bereich, aus dem es gelernt hat.', 'Exactly. A model only knows the range it learned from.') },
        { text: L('Die Rechnung ist falsch.', 'The calculation is wrong.'), feedback: L('Rechnerisch stimmt es – sinnvoll ist es trotzdem nicht.', 'Mathematically it’s right – it still doesn’t make sense.') },
        { text: L('Gar keins, mehr lernen bringt immer mehr Punkte.', 'None, more studying always means more points.'), feedback: L('Mehr als die volle Punktzahl gibt es nicht.', 'You can’t get more than full marks.') },
      ],
    },
    {
      kind: 'choice',
      question: L('Die Daten zeigen: Wer länger lernt, hat mehr Punkte. Folgt daraus, dass Lernen die Punkte verursacht?', 'The data show: those who study longer get more points. Does it follow that studying causes the points?'),
      options: [
        { text: L('Ja, eindeutig.', 'Yes, clearly.'), feedback: L('Aus Daten allein folgt nur ein Zusammenhang, keine Ursache.', 'Data alone only show a relationship, not a cause.') },
        { text: L('Nicht zwingend – Korrelation ist keine Kausalität; es könnte z. B. eine dritte Ursache geben.', 'Not necessarily – correlation is not causation; there could be a third cause, for example.'), correct: true, feedback: L('Genau. Lernende Systeme finden Zusammenhänge, nicht automatisch Ursachen.', 'Exactly. Learning systems find relationships, not automatically causes.') },
      ],
    },
    {
      kind: 'calc',
      question: L('Drei Messpunkte: (0 | 1), (1 | 2), (2 | 4). Welche Steigung m hat die Ausgleichsgerade?', 'Three data points: (0 | 1), (1 | 2), (2 | 4). What is the slope m of the regression line?'),
      answer: 1.5,
      tolerance: 0.001,
      hint: L('m = Σ(xᵢ − x̄)(yᵢ − ȳ) / Σ(xᵢ − x̄)² mit x̄ = 1 und ȳ = 7/3.', 'm = Σ(xᵢ − x̄)(yᵢ − ȳ) / Σ(xᵢ − x̄)² with x̄ = 1 and ȳ = 7/3.'),
      solution: L('x̄ = 1, ȳ = 7/3. Zähler: (−1)·(1 − 7/3) + 0 + 1·(4 − 7/3) = 4/3 + 5/3 = 3. Nenner: 1 + 0 + 1 = 2. m = 3/2 = 1,5; dazu b = ȳ − m·x̄ ≈ 0,83.', 'x̄ = 1, ȳ = 7/3. Numerator: (−1)·(1 − 7/3) + 0 + 1·(4 − 7/3) = 4/3 + 5/3 = 3. Denominator: 1 + 0 + 1 = 2. m = 3/2 = 1.5; and b = ȳ − m·x̄ ≈ 0.83.'),
    },
    { kind: 'say', mood: 'wink', text: L('Die Gerade hatte eine Formel. Für fast alle anderen Modelle nicht. Im nächsten Experiment suchst du das Minimum wie ein Netz: bergab, Schritt für Schritt.', 'The line had a formula. Almost all other models don’t. In the next experiment you look for the minimum like a network does: downhill, step by step.') },
  ],
};

export default lesson;
