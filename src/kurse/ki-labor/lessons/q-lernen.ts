import { L } from '../../../curriculum/helpers';
import type { LessonContent } from '../../types';

const lesson: LessonContent = {
  steps: [
    { kind: 'say', mood: 'happy', text: L('Ein Agent steht in einer Welt, wählt Aktionen und bekommt ab und zu eine Belohnung. Er soll lernen, welche Aktion in welchem Zustand langfristig am meisten bringt – ohne dass ihm jemand den Weg zeigt.', 'An agent stands in a world, chooses actions and now and then receives a reward. It should learn which action pays off most in the long run in each state – without anyone showing it the way.') },
    {
      kind: 'info',
      title: L('Die Q-Lernregel', 'The Q-learning rule'),
      text: L(
        'Q(s, a) schätzt, wie viel Belohnung insgesamt noch kommt, wenn man in Zustand s Aktion a wählt und danach gut weiterspielt. Nach jedem Schritt wird die Schätzung ein Stück (Lernrate α) in Richtung „erhaltene Belohnung + γ · bester Wert im neuen Zustand“ verschoben. Der Diskontfaktor γ < 1 macht spätere Belohnungen weniger wert. So sickert der Wert des Ziels Schritt für Schritt zum Start zurück.',
        'Q(s, a) estimates how much total reward is still to come if you choose action a in state s and play well afterwards. After every step the estimate moves a little (learning rate α) towards “reward received + γ · best value in the new state”. The discount factor γ < 1 makes later rewards worth less. This way the value of the goal seeps back to the start step by step.',
      ),
      formula: 'Q(s, a) ← Q(s, a) + α · ( r + γ · maxₐ′ Q(s′, a′) − Q(s, a) )',
    },
    {
      kind: 'predict',
      question: L('Keks (+3) in drei Schritten oder Schatz (+10) in fünf Schritten (jeder Schritt −1)? Was wählt ein Agent mit γ = 0,5?', 'Cookie (+3) in three steps or treasure (+10) in five steps (each step −1)? What does an agent with γ = 0.5 choose?'),
      options: [
        { text: L('Den Schatz', 'The treasure') },
        { text: L('Den Keks', 'The cookie') },
      ],
      reveal: L('Rechne nach oder probier es aus: Mit γ = 0,5 ist der Schatz in fünf Schritten nur noch etwa 0,56 wert.', 'Calculate or try it: with γ = 0.5 the treasure five steps away is only worth about 0.56.'),
    },
    { kind: 'game', game: 'qlernen', intro: L('Trainiere den Agenten mit verschiedenen γ und ε. Die Farben der Dreiecke zeigen die Q-Werte je Richtung, die dicken Pfeile den gelernten Weg.', 'Train the agent with different γ and ε. The colours of the triangles show the Q-values per direction, the thick arrows the learned path.') },
    {
      kind: 'choice',
      question: L('Mit γ = 0,99, aber ε = 0,05 blieb der Agent oft am Keks hängen. Warum?', 'With γ = 0.99 but ε = 0.05 the agent often got stuck at the cookie. Why?'),
      options: [
        { text: L('Er erkundet zu wenig und entdeckt den Schatz nie – also kann er ihn auch nicht lernen.', 'It explores too little and never discovers the treasure – so it can’t learn it either.'), correct: true, feedback: L('Genau – das Banditen-Dilemma im Großen.', 'Exactly – the bandit dilemma on a large scale.') },
        { text: L('γ = 0,99 bevorzugt nahe Belohnungen.', 'γ = 0.99 prefers nearby rewards.'), feedback: L('Umgekehrt: Großes γ macht die Zukunft wichtig.', 'The other way round: a large γ makes the future important.') },
        { text: L('Die Lernregel ist falsch.', 'The learning rule is wrong.'), feedback: L('Sie ist richtig – sie kann nur lernen, was sie erlebt.', 'It’s correct – it can only learn what it experiences.') },
      ],
    },
    {
      kind: 'info',
      title: L('Von der Tabelle zum Netz', 'From the table to the network'),
      text: L(
        'Hier passt Q in eine Tabelle mit 30 Feldern × 4 Aktionen. Bei Atari-Spielen sind die Zustände Bildschirmbilder – unendlich viele. 2013 ersetzte DeepMind die Tabelle durch ein Faltungsnetz (Deep Q-Network). AlphaGo und seine Nachfolger verbanden gelernte Bewertungen mit Baumsuche und lernten aus Millionen Spielen gegen sich selbst.',
        'Here Q fits in a table of 30 cells × 4 actions. In Atari games the states are screen images – endlessly many. In 2013 DeepMind replaced the table with a convolutional network (deep Q-network). AlphaGo and its successors combined learned evaluations with tree search and learned from millions of games against themselves.',
      ),
    },
    { kind: 'say', mood: 'wink', text: L('Die letzte Welt: Was passiert, wenn KI nicht nur erkennt und entscheidet, sondern Bilder erzeugt und über Menschen urteilt? Und wer setzt die Regeln?', 'The last world: what happens when AI doesn’t just recognise and decide, but generates images and judges people? And who sets the rules?') },
  ],
};

export default lesson;
