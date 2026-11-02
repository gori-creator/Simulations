import { L } from '../../../curriculum/helpers';
import type { ZeitstrahlProps } from '../../gemeinsam/games/zeitstrahl';
import type { LessonContent } from '../../types';

const timeline: ZeitstrahlProps = {
  events: [
    { year: 1956, icon: '🌞', text: L('Dartmouth: Man glaubt, die Kernprobleme der KI in einem Sommer zu lösen.', 'Dartmouth: people believe they can crack AI’s core problems in one summer.') },
    { year: 1958, icon: '📰', text: L('Das Perzeptron in der Zeitung: bald Maschinen, die sehen und sprechen?', 'The perceptron in the papers: soon machines that see and talk?') },
    { year: 1966, icon: '📉', text: L('ALPAC-Bericht: Maschinelle Übersetzung enttäuscht, die USA kürzen die Förderung.', 'ALPAC report: machine translation disappoints, the US cuts funding.') },
    { year: 1969, icon: '❌', text: L('Minsky und Papert: „Perceptrons“ zeigt die Grenzen einschichtiger Netze.', 'Minsky and Papert: “Perceptrons” shows the limits of single-layer networks.') },
    { year: 1973, icon: '❄️', text: L('Lighthill-Bericht: Großbritannien streicht fast alle KI-Gelder.', 'Lighthill report: Britain cuts almost all AI funding.') },
    { year: 1980, icon: '💼', text: L('Expertensysteme werden ein Geschäft – Firmen investieren Milliarden.', 'Expert systems become a business – companies invest billions.') },
    { year: 1987, icon: '🧊', text: L('Der Markt für Spezialrechner bricht ein: der zweite KI-Winter.', 'The market for specialised machines collapses: the second AI winter.') },
    { year: 2012, icon: '🚀', text: L('Ein tiefes Netz gewinnt ImageNet – der Deep-Learning-Boom beginnt.', 'A deep network wins ImageNet – the deep learning boom begins.') },
  ],
  done: L('Hoch, tief, hoch: Die KI-Geschichte verläuft in Wellen aus Begeisterung und Ernüchterung.', 'Up, down, up: AI history moves in waves of enthusiasm and disillusionment.'),
};

const lesson: LessonContent = {
  steps: [
    { kind: 'say', mood: 'think', text: L('1969 veröffentlichten Marvin Minsky und Seymour Papert das Buch „Perceptrons“. Sie bewiesen sauber, was einschichtige Perzeptronen nicht können – XOR ist das bekannteste Beispiel.', 'In 1969 Marvin Minsky and Seymour Papert published the book “Perceptrons”. They rigorously proved what single-layer perceptrons cannot do – XOR is the best-known example.') },
    {
      kind: 'info',
      title: L('Der Beweis in vier Zeilen', 'The proof in four lines'),
      text: L(
        'Angenommen, ein Neuron berechnet XOR. Aus (0,0) → 0 folgt 0 < θ. Aus (1,0) → 1 folgt w₁ ≥ θ, aus (0,1) → 1 folgt w₂ ≥ θ. Zusammen also w₁ + w₂ ≥ 2θ > θ. Aber (1,1) → 0 verlangt w₁ + w₂ < θ. Widerspruch – so ein Neuron gibt es nicht.',
        'Suppose a neuron computes XOR. From (0,0) → 0 we get 0 < θ. From (1,0) → 1 we get w₁ ≥ θ, from (0,1) → 1 we get w₂ ≥ θ. Together w₁ + w₂ ≥ 2θ > θ. But (1,1) → 0 requires w₁ + w₂ < θ. Contradiction – no such neuron exists.',
      ),
      formula: 'θ > 0,  w₁ ≥ θ,  w₂ ≥ θ  ⇒  w₁ + w₂ ≥ 2θ > θ   ↯   w₁ + w₂ < θ',
    },
    {
      kind: 'choice',
      question: L('Welcher Schritt im Beweis braucht die Annahme θ > 0?', 'Which step of the proof needs the assumption θ > 0?'),
      options: [
        { text: L('2θ > θ', '2θ > θ'), correct: true, feedback: L('Genau: Nur bei positivem θ ist das Doppelte größer.', 'Exactly: only for positive θ is twice as much bigger.') },
        { text: L('w₁ ≥ θ', 'w₁ ≥ θ'), feedback: L('Das folgt direkt aus (1,0) → 1.', 'That follows directly from (1,0) → 1.') },
        { text: L('w₁ + w₂ < θ', 'w₁ + w₂ < θ'), feedback: L('Das folgt aus (1,1) → 0.', 'That follows from (1,1) → 0.') },
      ],
    },
    {
      kind: 'choice',
      question: L('Minsky und Papert wussten, dass mehrschichtige Netze XOR können. Warum half das damals nicht?', 'Minsky and Papert knew that multi-layer networks can do XOR. Why didn’t that help back then?'),
      options: [
        { text: L('Es gab kein bekanntes Verfahren, die Gewichte der verborgenen Schichten zu lernen.', 'There was no known method to learn the weights of hidden layers.'), correct: true, feedback: L('Genau. Die Perzeptron-Regel braucht einen Fehler am Neuron – für verborgene Neuronen kennt man den nicht direkt.', 'Exactly. The perceptron rule needs an error at the neuron – for hidden neurons that isn’t known directly.') },
        { text: L('Mehrschichtige Netze waren verboten.', 'Multi-layer networks were banned.'), feedback: L('Nein – sie waren nur nicht trainierbar.', 'No – they just couldn’t be trained.') },
        { text: L('Es gab keinen Strom.', 'There was no electricity.'), feedback: L('Strom gab es, aber wenig Rechenleistung – das war nicht der Kern.', 'There was electricity, but little computing power – that wasn’t the core issue.') },
      ],
    },
    { kind: 'game', game: 'zeitstrahl', props: timeline, intro: L('Bring die Höhen und Tiefen der KI-Geschichte in die richtige Reihenfolge.', 'Put the highs and lows of AI history in the right order.') },
    {
      kind: 'info',
      tone: 'plain',
      title: L('Lehre aus den Wintern', 'The lesson of the winters'),
      text: L(
        'Jeder Winter folgte auf übertriebene Versprechen. Gelernt hat das Fach daraus: Behauptungen über KI an überprüfbaren Ergebnissen messen – nicht an Schlagzeilen. Das gilt heute genauso.',
        'Every winter followed exaggerated promises. The field learned from this: measure claims about AI against verifiable results – not headlines. That applies today just as much.',
      ),
    },
    { kind: 'say', mood: 'wink', text: L('Das Eis brach erst, als man lernte, verborgene Schichten zu trainieren. Bevor wir das tun, schau dir an, was eine verborgene Schicht überhaupt bewirkt.', 'The ice only broke when people learned to train hidden layers. Before we do that, see what a hidden layer actually does.') },
  ],
};

export default lesson;
