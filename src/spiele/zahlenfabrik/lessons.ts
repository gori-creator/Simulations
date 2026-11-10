import { L } from '../../curriculum/helpers';
import type { Lang, Localized } from '../../i18n/config';
import { art, IMAGES, imageFor, machineFile, mergeFile, switchFile, symOfLabel } from './art';
import type { LessonId } from './kit';

/**
 * Erklärungen der Zahlenfabrik: beim ersten Start eine Einführung, danach zu
 * jedem neuen Bauteil (bzw. jeder neuen Spielregel) ein paar kurze Karten mit
 * einer kleinen laufenden Fabrik. Der Browser merkt sich, was schon gezeigt
 * wurde; über „Anleitung“ und „Neu: …“ lassen sie sich wieder öffnen.
 */
const STORE = 'spiel:zahlenfabrik:neu';
/** Die Einführung (Bänder) hatte schon früher einen eigenen Speicherplatz. */
const INTRO_STORE = 'spiel:zahlenfabrik:intro';

/** Kleine Szene über dem Text. */
type Scene =
  /** Quelle → (Maschine) → Lager, mit wandernder Zahl. */
  | { kind: 'chain'; from: string; op?: string; to: string }
  /** Werkzeug-Kachel mit Zahl-Einstellung. */
  | { kind: 'num'; part: 'machine' | 'sort'; label: string; n: string }
  /** Weiche: Zahlen hinein, ✓ geradeaus, ✗ zur Seite (Verteiler: `marks` → ↓, beide bekommen alles). */
  | { kind: 'sort'; label: string; input: string; yes: string; no: string; marks?: [string, string]; part?: 'sort' | 'split' | 'alt' }
  /** Zusammenführer: zwei Zahlen hinein, eine heraus. */
  | { kind: 'merge'; a: string; b: string; label: string; out: string }
  /** Brücke: zwei Bänder kreuzen sich. */
  | { kind: 'cross' }
  /** Wertetabelle: x → Maschine → Werte. */
  | { kind: 'table'; xs: string[]; op: string; ys: string[] }
  /** Werkzeugkasten, der wächst. */
  | { kind: 'kit'; labels: string[] };

interface Slide {
  title: Localized;
  text: Localized;
  scene?: Scene;
}

interface Lesson {
  /** Überschrift über den Karten („Neues Bauteil“ …). */
  tag: Localized;
  slides: Slide[];
}

const NEW_PART = L('Neues Bauteil', 'New part');
const NEW_RULE = L('Neue Spielregel', 'New rule');

/** Zweite Karte für einstellbare Teile: So stellt man die Zahl ein. */
const numSlide = (part: 'machine' | 'sort', label: string, n: string, range: Localized): Slide => ({
  title: L('Zahl einstellen', 'Setting the number'),
  text: L(
    `Tipp im Werkzeugkasten auf das Teil. Darunter stellst du mit − und + die Zahl ein (${range.de}). Dann tippst du aufs Band. Steht dort schon so ein Teil, bekommt es die neue Zahl – nochmal antippen dreht es.`,
    `Tap the part in the toolbox. Below it, set the number with − and + (${range.en}). Then tap the belt. If such a part is already there, it gets the new number – tap again to turn it.`,
  ),
  scene: { kind: 'num', part, label, n },
});

const LESSONS: Record<LessonId, Lesson> = {
  belt: {
    tag: L('Willkommen', 'Welcome'),
    slides: [
      {
        title: L('Willkommen in der Zahlenfabrik!', 'Welcome to the Number Factory!'),
        text: L('Zahlenquellen geben Zahlen aus. Förderbänder bringen sie Feld für Feld weiter – bis ins Lager.', 'Number sources give out numbers. Conveyor belts carry them square by square – all the way to the storage.'),
        scene: { kind: 'chain', from: '3', to: '3' },
      },
      {
        title: L('Bänder ziehen', 'Drawing belts'),
        text: L('Wähle „Band“ und zieh mit dem Finger oder der Maus über die Kästchen – von der Quelle bis zum Lager. Ein Band nochmal antippen dreht es. Dann drück auf Start und schau zu!', 'Choose “Belt” and drag with your finger or the mouse across the squares – from the source to the storage. Tap a belt again to turn it. Then press Start and watch!'),
        scene: { kind: 'chain', from: '3', to: '3' },
      },
      {
        title: L('Dein Werkzeugkasten wächst', 'Your toolbox grows'),
        text: L('Jedes Kapitel bringt ein neues Bauteil. Du behältst alle Bauteile – später musst du selbst herausfinden, welche du brauchst. Oft gibt es mehrere Wege!', 'Every chapter brings a new part. You keep all parts – later you have to find out yourself which ones you need. Often there are several ways!'),
        scene: { kind: 'kit', labels: ['+', '−', '×', '÷', 'x²', 'gerade?'] },
      },
    ],
  },
  plus: {
    tag: NEW_PART,
    slides: [
      {
        title: L('Die Plus-Maschine', 'The plus machine'),
        text: L('Jede Zahl, die hindurchläuft, bekommt etwas dazu: Aus 3 wird mit +2 die 5.', 'Every number that runs through gets something added: with +2, 3 becomes 5.'),
        scene: { kind: 'chain', from: '3', op: '+2', to: '5' },
      },
      numSlide('machine', '+2', '2', L('1 bis 10', '1 to 10')),
    ],
  },
  minus: {
    tag: NEW_PART,
    slides: [
      {
        title: L('Die Minus-Maschine', 'The minus machine'),
        text: L('Sie nimmt etwas weg: Aus 9 wird mit −5 die 4. Auch unter null geht es weiter.', 'It takes something away: with −5, 9 becomes 4. It even goes below zero.'),
        scene: { kind: 'chain', from: '9', op: '−5', to: '4' },
      },
      numSlide('machine', '−5', '5', L('1 bis 10', '1 to 10')),
    ],
  },
  times: {
    tag: NEW_PART,
    slides: [
      {
        title: L('Die Mal-Maschine', 'The times machine'),
        text: L('Sie nimmt die Zahl mal: Aus 4 wird mit ×3 die 12. So werden Zahlen schnell groß.', 'It multiplies the number: with ×3, 4 becomes 12. Numbers grow fast this way.'),
        scene: { kind: 'chain', from: '4', op: '×3', to: '12' },
      },
      numSlide('machine', '×3', '3', L('2 bis 10', '2 to 10')),
    ],
  },
  divide: {
    tag: NEW_PART,
    slides: [
      {
        title: L('Die Geteilt-Maschine', 'The divide machine'),
        text: L('Sie teilt die Zahl: Aus 20 wird mit ÷4 die 5. Aber nur, wenn es glatt aufgeht – sonst bleibt die Fabrik stehen.', 'It divides the number: with ÷4, 20 becomes 5. But only if it comes out even – otherwise the factory stops.'),
        scene: { kind: 'chain', from: '20', op: '÷4', to: '5' },
      },
      numSlide('machine', '÷4', '4', L('2 bis 10', '2 to 10')),
    ],
  },
  square: {
    tag: NEW_PART,
    slides: [
      {
        title: L('Die Quadrat-Maschine', 'The square machine'),
        text: L('Sie rechnet die Zahl mal sich selbst: Aus 5 wird 25, aus −3 wird 9. Sie hat keine Zahl zum Einstellen.', 'It multiplies the number by itself: 5 becomes 25, −3 becomes 9. It has no number to set.'),
        scene: { kind: 'chain', from: '5', op: 'x²', to: '25' },
      },
    ],
  },
  pick: {
    tag: NEW_RULE,
    slides: [
      {
        title: L('Rückwärts rechnen', 'Working backwards'),
        text: L('Jetzt stehen die Maschinen schon fest (Schloss). Du wählst, welche Zahl aus der Quelle kommt: Was muss hinein, damit im Lager die richtige Zahl ankommt?', 'Now the machines are already fixed (lock). You choose which number comes out of the source: what has to go in so the right number reaches the storage?'),
        scene: { kind: 'chain', from: '?', op: '+4', to: '9' },
      },
      {
        title: L('Startzahl einstellen', 'Setting the starting number'),
        text: L('Die Startzahl stellst du bei der Steuerung ein. Eigene Maschinen sind hier nicht erlaubt – nur Bänder. Tipp: Rechne von hinten nach vorne, mit der Umkehraufgabe.', 'You set the starting number next to the controls. Your own machines are not allowed here – only belts. Tip: work from back to front with the inverse operation.'),
        scene: { kind: 'chain', from: '5', op: '+4', to: '9' },
      },
    ],
  },
  even: {
    tag: NEW_PART,
    slides: [
      {
        title: L('Die Weiche „gerade?“', 'The switch “even?”'),
        text: L('Eine Weiche hat zwei Ausgänge: Gerade Zahlen laufen geradeaus weiter (✓), alle anderen biegen ab (✗).', 'A switch has two exits: even numbers go straight on (✓), all others turn off (✗).'),
        scene: { kind: 'sort', label: 'gerade?', input: '1 2 3 4', yes: '2 4', no: '1 3' },
      },
      {
        title: L('Mehrere Lager', 'Several storages'),
        text: L('Jetzt gibt es mehrere Lager mit eigenen Regeln, z. B. „✓ gerade?“ oder „✗ gerade?“ für den Rest. Antippen dreht die Weiche; nach vier Drehungen biegt ✗ zur anderen Seite ab.', 'Now there are several storages with their own rules, e.g. “✓ even?” or “✗ even?” for the rest. Tap to turn the switch; after four turns ✗ turns to the other side.'),
        scene: { kind: 'sort', label: 'gerade?', input: '5 6 7 8', yes: '6 8', no: '5 7' },
      },
    ],
  },
  div: {
    tag: NEW_PART,
    slides: [
      {
        title: L('Die Weiche „teilbar durch …?“', 'The switch “divisible by …?”'),
        text: L('Sie prüft, ob eine Zahl ohne Rest teilbar ist. Mit 3 eingestellt: 3 und 6 laufen geradeaus, 4 und 7 biegen ab.', 'It checks whether a number can be divided without remainder. Set to 3: 3 and 6 go straight, 4 and 7 turn off.'),
        scene: { kind: 'sort', label: '÷3?', input: '3 4 6 7', yes: '3 6', no: '4 7' },
      },
      numSlide('sort', '÷3?', '3', L('2 bis 10', '2 to 10')),
    ],
  },
  gt: {
    tag: NEW_PART,
    slides: [
      {
        title: L('Die Weiche „größer als …?“', 'The switch “greater than …?”'),
        text: L('Sie vergleicht: Mit 10 eingestellt laufen 12 und 20 geradeaus, 4 und 7 biegen ab. Die 10 selbst ist nicht größer als 10!', 'It compares: set to 10, 12 and 20 go straight, 4 and 7 turn off. 10 itself is not greater than 10!'),
        scene: { kind: 'sort', label: '>10?', input: '4 12 7 20', yes: '12 20', no: '4 7' },
      },
      numSlide('sort', '>10?', '10', L('0 bis 100', '0 to 100')),
    ],
  },
  prime: {
    tag: NEW_PART,
    slides: [
      {
        title: L('Die Weiche „Primzahl?“', 'The switch “prime?”'),
        text: L('Primzahlen laufen geradeaus. Eine Primzahl hat genau zwei Teiler: 1 und sich selbst – wie 2, 3, 5, 7, 11. Die 1 ist keine Primzahl.', 'Primes go straight on. A prime has exactly two divisors: 1 and itself – like 2, 3, 5, 7, 11. 1 is not a prime.'),
        scene: { kind: 'sort', label: 'Prim?', input: '2 4 7 9', yes: '2 7', no: '4 9' },
      },
    ],
  },
  mod: {
    tag: NEW_PART,
    slides: [
      {
        title: L('Die Rest-Maschine', 'The remainder machine'),
        text: L('Sie teilt und gibt nur den Rest weiter: 17 geteilt durch 5 ist 3 Rest 2 – also macht „mod 5“ aus 17 die 2. Rest 0 heißt: Die Zahl ist teilbar.', 'It divides and passes on only the remainder: 17 divided by 5 is 3 remainder 2 – so “mod 5” turns 17 into 2. Remainder 0 means: the number is divisible.'),
        scene: { kind: 'chain', from: '17', op: 'mod 5', to: '2' },
      },
      numSlide('machine', 'mod 5', '5', L('2 bis 10', '2 to 10')),
    ],
  },
  digits: {
    tag: NEW_PART,
    slides: [
      {
        title: L('Die Quersummen-Maschine', 'The digit-sum machine'),
        text: L('Sie addiert die Ziffern: Aus 1234 wird 1 + 2 + 3 + 4 = 10. Tipp: Ist die Quersumme durch 3 (oder 9) teilbar, dann auch die Zahl selbst.', 'It adds up the digits: 1234 becomes 1 + 2 + 3 + 4 = 10. Tip: if the digit sum is divisible by 3 (or 9), so is the number itself.'),
        scene: { kind: 'chain', from: '1234', op: 'QS', to: '10' },
      },
    ],
  },
  root: {
    tag: NEW_PART,
    slides: [
      {
        title: L('Die Wurzel-Maschine', 'The square-root machine'),
        text: L('Sie ist die Umkehrung der Quadrat-Maschine: Aus 25 wird 5, weil 5 · 5 = 25. Das geht nur bei Quadratzahlen – sonst bleibt die Fabrik stehen.', 'It is the reverse of the square machine: 25 becomes 5, because 5 · 5 = 25. This only works for square numbers – otherwise the factory stops.'),
        scene: { kind: 'chain', from: '25', op: '√x', to: '5' },
      },
    ],
  },
  issquare: {
    tag: NEW_PART,
    slides: [
      {
        title: L('Die Weiche „Quadratzahl?“', 'The switch “square number?”'),
        text: L('Quadratzahlen (1, 4, 9, 16, 25 …) laufen geradeaus, alle anderen biegen ab.', 'Square numbers (1, 4, 9, 16, 25 …) go straight on, all others turn off.'),
        scene: { kind: 'sort', label: 'Quadrat?', input: '4 6 9 10', yes: '4 9', no: '6 10' },
      },
    ],
  },
  sum: {
    tag: NEW_PART,
    slides: [
      {
        title: L('Zwei Quellen, ein Zusammenführer', 'Two sources, one merger'),
        text: L('Ab jetzt gibt es Level mit zwei Quellen. Ein Zusammenführer wartet, bis aus zwei Richtungen je eine Zahl kommt, und schickt dann eine Zahl weiter: 3 und 4 werden mit „a+b“ zu 7.', 'From now on there are levels with two sources. A merger waits until one number arrives from each of two directions and then sends one number on: with “a+b”, 3 and 4 become 7.'),
        scene: { kind: 'merge', a: '3', b: '4', label: 'a+b', out: '7' },
      },
      {
        title: L('Der Reihe nach', 'In order'),
        text: L('Geben beide Quellen Folgen aus (1, 2, 3 … und 10, 20, 30 …), werden immer die ersten, dann die zweiten Zahlen zusammengeführt. Zusammenführer zählen nicht als Maschine.', 'If both sources give out sequences (1, 2, 3 … and 10, 20, 30 …), first the first numbers, then the second ones are merged. Mergers do not count as machines.'),
        scene: { kind: 'merge', a: '2', b: '20', label: 'a+b', out: '22' },
      },
    ],
  },
  diff: {
    tag: NEW_PART,
    slides: [
      {
        title: L('Zusammenführer „Differenz“', 'Merger “difference”'),
        text: L('Er rechnet die größere minus die kleinere Zahl – egal, von welcher Seite sie kommt: 9 und 4 werden zu 5.', 'It calculates the bigger minus the smaller number – no matter which side it comes from: 9 and 4 become 5.'),
        scene: { kind: 'merge', a: '9', b: '4', label: 'a−b', out: '5' },
      },
    ],
  },
  product: {
    tag: NEW_PART,
    slides: [
      {
        title: L('Zusammenführer „Produkt“', 'Merger “product”'),
        text: L('Er nimmt die beiden Zahlen mal: 6 und 7 werden zu 42. Geben beide Quellen x aus, entsteht x · x.', 'It multiplies the two numbers: 6 and 7 become 42. If both sources give out x, you get x · x.'),
        scene: { kind: 'merge', a: '6', b: '7', label: 'a×b', out: '42' },
      },
    ],
  },
  quot: {
    tag: NEW_PART,
    slides: [
      {
        title: L('Zusammenführer „Quotient“', 'Merger “quotient”'),
        text: L('Er teilt die größere durch die kleinere Zahl: 12 und 3 werden zu 4. Geht es nicht glatt auf, bleibt die Fabrik stehen.', 'It divides the bigger by the smaller number: 12 and 3 become 4. If it does not divide evenly, the factory stops.'),
        scene: { kind: 'merge', a: '12', b: '3', label: 'a÷b', out: '4' },
      },
    ],
  },
  bridge: {
    tag: NEW_PART,
    slides: [
      {
        title: L('Die Brücke', 'The bridge'),
        text: L('Auf einer Brücke laufen Zahlen geradeaus weiter – waagerecht unten durch, senkrecht oben drüber. So können sich zwei Wege kreuzen, ohne sich zu stören.', 'On a bridge numbers keep going straight – horizontally underneath, vertically over the top. This way two paths can cross without getting in each other’s way.'),
        scene: { kind: 'cross' },
      },
    ],
  },
  neg: {
    tag: NEW_PART,
    slides: [
      {
        title: L('Die Vorzeichen-Maschine', 'The sign machine'),
        text: L('Sie dreht das Vorzeichen um: Aus 5 wird −5, aus −3 wird 3. Das ist dasselbe wie mal (−1).', 'It flips the sign: 5 becomes −5, −3 becomes 3. That is the same as times (−1).'),
        scene: { kind: 'chain', from: '5', op: '±', to: '−5' },
      },
    ],
  },
  abs: {
    tag: NEW_PART,
    slides: [
      {
        title: L('Die Betrags-Maschine', 'The absolute-value machine'),
        text: L('Sie nimmt den Abstand zur Null: Aus −7 wird 7, aus 7 bleibt 7. Mit „−10“ davor misst sie den Abstand zur 10.', 'It takes the distance from zero: −7 becomes 7, 7 stays 7. With “−10” in front it measures the distance from 10.'),
        scene: { kind: 'chain', from: '−7', op: '|x|', to: '7' },
      },
    ],
  },
  rev: {
    tag: NEW_PART,
    slides: [
      {
        title: L('Die Spiegel-Maschine', 'The mirror machine'),
        text: L('Sie liest die Ziffern rückwärts: Aus 123 wird 321, aus 120 wird 21. Mit zwei Quellen und einem Zusammenführer rechnest du x + Spiegelzahl.', 'It reads the digits backwards: 123 becomes 321, 120 becomes 21. With two sources and a merger you can calculate x + its mirror number.'),
        scene: { kind: 'chain', from: '123', op: '⇄', to: '321' },
      },
    ],
  },
  round: {
    tag: NEW_PART,
    slides: [
      {
        title: L('Die Runden-Maschine', 'The rounding machine'),
        text: L('Sie rundet auf Zehner, Hunderter oder Tausender: Aus 47 wird mit ≈10 die 50, aus 150 wird mit ≈100 die 200 (ab 5 wird aufgerundet).', 'It rounds to tens, hundreds or thousands: with ≈10, 47 becomes 50; with ≈100, 150 becomes 200 (from 5 upwards it rounds up).'),
        scene: { kind: 'chain', from: '47', op: '≈10', to: '50' },
      },
      numSlide('machine', '≈10', '10', L('10, 100 oder 1000', '10, 100 or 1000')),
    ],
  },
  alt: {
    tag: NEW_PART,
    slides: [
      {
        title: L('Die Wechsel-Weiche', 'The alternator'),
        text: L('Sie schaut nicht auf die Zahl, sondern wechselt ab: die 1. Zahl geradeaus, die 2. zur Seite, die 3. wieder geradeaus … So trennst du Zahlen nach ihrer Reihenfolge.', 'It does not look at the number but takes turns: the 1st number goes straight, the 2nd to the side, the 3rd straight again … This way you separate numbers by their order.'),
        scene: { kind: 'sort', label: '', input: '5 5 8 8', yes: '5 8', no: '5 8', marks: ['→', '↓'], part: 'alt' },
      },
      {
        title: L('Paare bilden', 'Making pairs'),
        text: L('Mit einem Zusammenführer dahinter werden je zwei Zahlen hintereinander verrechnet: 1 und 2, dann 3 und 4 …', 'With a merger behind it, every two numbers in a row are combined: 1 and 2, then 3 and 4 …'),
        scene: { kind: 'merge', a: '1', b: '2', label: 'a×b', out: '2' },
      },
    ],
  },
  frac: {
    tag: NEW_PART,
    slides: [
      {
        title: L('Die Bruch-Maschine', 'The fraction machine'),
        text: L('Sie teilt immer – auch wenn es nicht aufgeht. Dann kommt ein Bruch heraus: Aus 3 wird mit x/4 der Bruch 3/4. Brüche kürzt das Spiel von selbst: 6/9 ist 2/3.', 'It always divides – even if it does not come out even. Then a fraction comes out: with x/4, 3 becomes 3/4. The game reduces fractions by itself: 6/9 is 2/3.'),
        scene: { kind: 'chain', from: '3', op: 'x/4', to: '3/4' },
      },
      numSlide('machine', 'x/4', '4', L('2 bis 10', '2 to 10')),
    ],
  },
  inv: {
    tag: NEW_PART,
    slides: [
      {
        title: L('Die Kehrwert-Maschine', 'The reciprocal machine'),
        text: L('Sie stellt den Bruch auf den Kopf: Aus 4 wird 1/4, aus 2/3 wird 3/2. Mit zwei Quellen und einem Zusammenführer addierst du Brüche wie 1/2 + 1/3.', 'It turns the fraction upside down: 4 becomes 1/4, 2/3 becomes 3/2. With two sources and a merger you can add fractions like 1/2 + 1/3.'),
        scene: { kind: 'chain', from: '4', op: '1/x', to: '1/4' },
      },
    ],
  },
  count: {
    tag: NEW_PART,
    slides: [
      {
        title: L('Die Zähler-Maschine', 'The counter machine'),
        text: L('Sie zählt die Zahlen, die durch sie laufen, und gibt die Nummer weiter: Die erste Zahl wird zur 1, die zweite zur 2, die dritte zur 3 – egal, was hineinkommt.', 'It counts the numbers that run through it and passes on the position: the first number becomes 1, the second 2, the third 3 – whatever comes in.'),
        scene: { kind: 'table', xs: ['7', '7', '7', '7'], op: '1,2,3', ys: ['1', '2', '3', '4'] },
      },
      {
        title: L('Zählen und weiterrechnen', 'Count, then calculate'),
        text: L('Hinter dem Zähler kannst du weiterrechnen: ×2 macht aus 1, 2, 3 die Zweierreihe 2, 4, 6. Jede Zähler-Maschine zählt für sich – zwei Zähler zählen beide von 1 an.', 'After the counter you can keep calculating: ×2 turns 1, 2, 3 into 2, 4, 6. Every counter counts on its own – two counters both start at 1.'),
        scene: { kind: 'table', xs: ['4', '9', '2'], op: '1,2,3 ×2', ys: ['2', '4', '6'] },
      },
    ],
  },
  total: {
    tag: NEW_PART,
    slides: [
      {
        title: L('Die Sammel-Maschine', 'The collector machine'),
        text: L('Sie merkt sich alles, was bisher durchlief, und gibt die Summe weiter: Aus 1, 2, 3, 4 wird 1, 3, 6, 10 – die Dreieckszahlen. Σ ist das Zeichen für „Summe“.', 'It remembers everything that has run through and passes on the sum: 1, 2, 3, 4 becomes 1, 3, 6, 10 – the triangular numbers. Σ is the sign for “sum”.'),
        scene: { kind: 'table', xs: ['1', '2', '3', '4'], op: 'Σx', ys: ['1', '3', '6', '10'] },
      },
      {
        title: L('Immer dasselbe sammeln', 'Collecting the same thing'),
        text: L('Kommt immer dieselbe Zahl, entsteht eine Reihe: Aus 10, 10, 10 wird 10, 20, 30. Und aus den ungeraden Zahlen 1, 3, 5, 7 werden die Quadratzahlen 1, 4, 9, 16!', 'If the same number keeps coming, you get a sequence: 10, 10, 10 becomes 10, 20, 30. And the odd numbers 1, 3, 5, 7 become the square numbers 1, 4, 9, 16!'),
        scene: { kind: 'table', xs: ['1', '3', '5', '7'], op: 'Σx', ys: ['1', '4', '9', '16'] },
      },
    ],
  },
  buffer: {
    tag: NEW_PART,
    slides: [
      {
        title: L('Die Puffer-Maschine', 'The buffer machine'),
        text: L('Sie hält immer eine Zahl fest. Kommt die nächste, gibt sie die alte weiter und behält die neue. Am Anfang liegt eine 0 drin – die kommt als Erstes heraus.', 'It always holds one number. When the next one arrives, it passes on the old one and keeps the new one. At the start it holds a 0 – that comes out first.'),
        scene: { kind: 'table', xs: ['4', '9', '2', '7'], op: 'x₋₁', ys: ['0', '4', '9', '2'] },
      },
      {
        title: L('Nachbarn vergleichen', 'Comparing neighbours'),
        text: L('Mit zwei Quellen und einem Zusammenführer vergleichst du jede Zahl mit ihrer Vorgängerin: Die Abstände der Quadratzahlen 1, 4, 9, 16 sind 1, 3, 5, 7 – die ungeraden Zahlen!', 'With two sources and a merger you compare every number with the one before: the gaps between the square numbers 1, 4, 9, 16 are 1, 3, 5, 7 – the odd numbers!'),
        scene: { kind: 'merge', a: '9', b: '4', label: 'a−b', out: '5' },
      },
    ],
  },
  int: {
    tag: NEW_PART,
    slides: [
      {
        title: L('Die Weiche „ganze Zahl?“', 'The switch “whole number?”'),
        text: L('Ganze Zahlen laufen geradeaus, Brüche wie 1/2 oder 3/4 biegen ab. So trennst du, was beim Teilen aufgeht, von dem, was nicht aufgeht.', 'Whole numbers go straight on, fractions like 1/2 or 3/4 turn off. This is how you separate what divides evenly from what does not.'),
        scene: { kind: 'sort', label: 'ganz?', input: '3 1/2 8 3/4', yes: '3 8', no: '1/2 3/4' },
      },
    ],
  },
  split: {
    tag: NEW_PART,
    slides: [
      {
        title: L('Der Verteiler', 'The splitter'),
        text: L('Jede Zahl läuft als Kopie in beide Richtungen weiter – geradeaus und zur Seite. Antippen dreht ihn, nach vier Drehungen wechselt die Seite.', 'Every number continues as a copy in both directions – straight on and to the side. Tap to turn it; after four turns the side switches.'),
        scene: { kind: 'sort', label: 'Kopie', input: '3', yes: '3', no: '3', marks: ['→', '↓'], part: 'split' },
      },
      {
        title: L('Die Schleife', 'The loop'),
        text: L('Führ eine Kopie mit Bändern im Kreis zurück zum Verteiler – fertig ist die Schleife. Die Zahl läuft Runde um Runde, und jedes Mal geht eine Kopie ins Lager. Mit einer Maschine in der Schleife entsteht eine Folge: Aus 3 wird mit +2 die Reihe 3, 5, 7, 9 …', 'Lead one copy back round to the splitter with belts – that makes a loop. The number goes lap after lap, and every time a copy goes to the storage. With a machine in the loop you get a sequence: with +2, 3 becomes 3, 5, 7, 9 …'),
        scene: { kind: 'table', xs: ['1.', '2.', '3.', '4.'], op: '+2', ys: ['3', '5', '7', '9'] },
      },
    ],
  },
  rules: {
    tag: NEW_RULE,
    slides: [
      {
        title: L('Rätsel mit Regeln', 'Puzzles with rules'),
        text: L('Hier gelten Zusatzregeln: Manche Bauteile sind verboten und fehlen im Werkzeugkasten („ohne Mal-Maschine“). Oder du hast nur wenige Bänder – dann müssen Maschinen die Lücken füllen. Die Regel steht bei der Aufgabe.', 'Extra rules apply here: some parts are forbidden and missing from the toolbox (“without the times machine”). Or you only have a few belts – then machines have to fill the gaps. The rule is shown with the task.'),
        scene: { kind: 'kit', labels: ['x²', '+', '−', '÷', '⇄', '≈10'] },
      },
      {
        title: L('Geht es noch kleiner?', 'Can it be smaller?'),
        text: L('Nach jedem Sieg vergleicht das Spiel deine Fabrik mit der kleinsten bekannten: „Geht es mit 2 Teilen weniger?“ Dein Bestwert wird gespeichert – nur in deinem Browser.', 'After every win the game compares your factory with the smallest known one: “Can you do it with 2 parts fewer?” Your best result is saved – only in your browser.'),
        scene: { kind: 'chain', from: '4', op: 'x²', to: '16' },
      },
    ],
  },
  eq: {
    tag: NEW_RULE,
    slides: [
      {
        title: L('Gleichungen sind Waagen', 'Equations are scales'),
        text: L('Du suchst die Zahl x. Bei „3x + 5 = 20“ rechnen die Maschinen 3x + 5 aus, und im Lager muss 20 ankommen. Stell x ein und probier – oder rechne rückwärts.', 'You are looking for the number x. For “3x + 5 = 20” the machines calculate 3x + 5, and 20 has to arrive in the storage. Set x and try – or work backwards.'),
        scene: { kind: 'chain', from: 'x', op: '×3 +5', to: '20' },
      },
      {
        title: L('Beide Seiten', 'Both sides'),
        text: L('Bei „2x + 3 = x + 7“ geben zwei Quellen dasselbe x aus. Jede Seite wird ausgerechnet, der Zusammenführer „Differenz“ vergleicht: Kommt 0 an, sind beide Seiten gleich – dann stimmt dein x.', 'For “2x + 3 = x + 7” two sources give out the same x. Each side is calculated, the “difference” merger compares them: if 0 arrives, both sides are equal – then your x is right.'),
        scene: { kind: 'merge', a: '11', b: '11', label: 'a−b', out: '0' },
      },
    ],
  },
  seq: {
    tag: NEW_RULE,
    slides: [
      {
        title: L('Wertetabellen', 'Tables of values'),
        text: L('Die Quelle gibt der Reihe nach x = 1, 2, 3 … aus. Das Lager will die Ergebnisse genau in dieser Reihenfolge – wie in einer Wertetabelle.', 'The source gives x = 1, 2, 3 … in turn. The storage wants the results in exactly this order – like in a table of values.'),
        scene: { kind: 'table', xs: ['1', '2', '3'], op: '×2', ys: ['2', '4', '6'] },
      },
      {
        title: L('Die Regel finden', 'Finding the rule'),
        text: L('In der Aufgabe siehst du die Tabelle: was das Lager will und was schon angekommen ist. Such die Regel: Um wie viel wächst der Wert, wenn x um 1 wächst?', 'The task shows the table: what the storage wants and what has already arrived. Find the rule: by how much does the value grow when x grows by 1?'),
        scene: { kind: 'table', xs: ['1', '2', '3'], op: '×3 +1', ys: ['4', '7', '10'] },
      },
    ],
  },
};

const T = {
  skip: L('Überspringen', 'Skip'),
  back: L('← Zurück', '← Back'),
  next: L('Weiter →', 'Next →'),
  go: L('Los geht’s!', 'Let’s go!'),
  label: L('Erklärung', 'Explanation'),
  step: L('Schritt {n} von {m}', 'Step {n} of {m}'),
};

export const hasLesson = (id: LessonId) => !!LESSONS[id];

function seenSet(): Set<string> {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE) ?? '[]') as unknown;
    const set = new Set(Array.isArray(raw) ? raw.filter((x): x is string => typeof x === 'string') : []);
    if (localStorage.getItem(INTRO_STORE) === '1') set.add('belt');
    return set;
  } catch {
    // ohne Speicher nichts automatisch zeigen
    return new Set(Object.keys(LESSONS));
  }
}

export function lessonSeen(id: LessonId): boolean {
  return seenSet().has(id);
}

function markSeen(ids: LessonId[]): void {
  try {
    const set = seenSet();
    for (const id of ids) set.add(id);
    localStorage.setItem(STORE, JSON.stringify([...set]));
    if (ids.includes('belt')) localStorage.setItem(INTRO_STORE, '1');
  } catch {
    // ohne Speicher: kommt beim nächsten Besuch wieder
  }
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls = '', text?: string): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

/** Szene zeichnen (nur Schmuck, für Vorleseprogramme ausgeblendet). */
function scene(s: Scene, lang: Lang): HTMLElement {
  const local = (t: string) => (lang === 'en' ? t.replace('gerade?', 'even?').replace('Prim?', 'prime?').replace('Quadrat?', 'square?').replace('ganz?', 'whole?').replace('Kopie', 'copy') : t);
  const box = (kind: 'source' | 'machine' | 'target' | 'sort', text: string, dir?: 0) => {
    const c = el('div', `zf-intro__box zf-intro__box--${kind}`);
    // Maschinen mit eigenem Bild je Rechenart (aus der Aufschrift erkannt)
    const sym = kind === 'machine' ? symOfLabel(text.split(' ')[0]!) : undefined;
    c.append(art(kind, 52, dir, 0, false, sym ? machineFile(sym) : undefined), el('span', '', local(text)));
    return c;
  };
  const belt = () => el('div', 'zf-intro__belt');
  let row: HTMLElement;
  if (s.kind === 'chain') {
    row = el('div', 'zf-intro__scene');
    row.append(box('source', s.from, 0), belt());
    if (s.op) row.append(box('machine', s.op, 0), belt());
    row.append(box('target', s.to));
    // Wandernde Zahl: vor der Maschine die Startzahl, dahinter das Ergebnis
    if (s.op) row.append(el('span', 'zf-intro__dot zf-intro__dot--a', s.from), el('span', 'zf-intro__dot zf-intro__dot--b', s.to));
    else row.append(el('span', 'zf-intro__dot', s.from));
  } else if (s.kind === 'num') {
    row = el('div', 'zf-intro__scene zf-lesson-num');
    const tile = el('div', 'zf-lesson-num__tile');
    const pic = el('span', 'zf-tool__pic');
    const src = imageFor(s.part, 0, s.part === 'machine' ? machineFile(symOfLabel(s.label) ?? '') : switchFile(s.label.startsWith('÷') ? 'div' : s.label.startsWith('>') ? 'gt' : ''));
    if (src) {
      const img = el('img');
      img.src = src;
      img.alt = '';
      pic.append(img);
    } else pic.classList.add('is-plain');
    tile.append(pic, el('span', 'zf-tool__label zf-tool__label--math', local(s.label)));
    const stepper = el('div', 'zf-num zf-num--demo');
    stepper.append(el('span', 'zf-num__btn', '−'), el('span', 'zf-num__value', s.n), el('span', 'zf-num__btn', '+'));
    row.append(tile, stepper);
  } else if (s.kind === 'sort') {
    row = el('div', `zf-intro__scene zf-lesson-sort${s.part ? ` zf-lesson-sort--${s.part}` : ''}`);
    const outs = el('div', 'zf-lesson-sort__outs');
    const [m1, m2] = s.marks ?? ['✓', '✗'];
    outs.append(el('span', 'zf-lesson-sort__yes', `${m1} ${s.yes}`), el('span', 'zf-lesson-sort__no', `${m2} ${s.no}`));
    // Weiche mit eigenem Bild je Prüfung bzw. Wechsel-Weiche
    const test = s.label.startsWith('gerade') ? 'even' : s.label.startsWith('÷') ? 'div' : s.label.startsWith('>') ? 'gt' : s.label.startsWith('Prim') ? 'prime' : s.label.startsWith('Quadrat') ? 'square' : s.label.startsWith('ganz') ? 'int' : '';
    const sw = el('div', 'zf-intro__box zf-intro__box--sort');
    sw.append(art('sort', 52, 0, 0, false, s.part === 'alt' ? 'wechselweiche' : s.part === 'split' ? 'verteiler' : switchFile(test)), el('span', '', local(s.label)));
    row.append(el('span', 'zf-lesson-sort__in', s.input), belt(), sw, outs);
  } else if (s.kind === 'merge') {
    row = el('div', 'zf-intro__scene zf-lesson-merge');
    const ins = el('div', 'zf-lesson-merge__ins');
    ins.append(el('span', 'zf-lesson-sort__in', s.a), el('span', 'zf-lesson-sort__in', s.b));
    const m = el('div', 'zf-intro__box zf-intro__box--merge');
    m.append(art('merge', 52, 0, 0, false, mergeFile(s.label[1] ?? '+')), el('span', '', s.label));
    row.append(ins, belt(), m, belt(), box('target', s.out));
  } else if (s.kind === 'cross') {
    row = el('div', 'zf-intro__scene zf-lesson-cross');
    const h = el('div', 'zf-intro__belt zf-lesson-cross__h');
    const v = el('div', 'zf-intro__belt zf-lesson-cross__v');
    const b = el('div', 'zf-lesson-cross__bridge');
    b.append(art('bridge', 56));
    row.append(h, v, b, el('span', 'zf-intro__dot zf-lesson-cross__dot-h', '3'), el('span', 'zf-intro__dot zf-lesson-cross__dot-v', '5'));
  } else if (s.kind === 'table') {
    row = el('div', 'zf-intro__scene zf-lesson-table');
    const table = el('table');
    const tr = (head: string, cells: string[]) => {
      const r = el('tr');
      r.append(el('th', '', head), ...cells.map((c) => el('td', '', c)));
      return r;
    };
    table.append(tr('x', s.xs), tr(s.op, s.ys));
    row.append(table);
  } else {
    row = el('div', 'zf-intro__scene zf-lesson-kit');
    s.labels.forEach((label, i) => {
      const t = el('span', `zf-lesson-kit__tile${i === 0 ? ' is-new' : ''}`, local(label));
      t.style.setProperty('--i', String(i));
      row.append(t);
    });
  }
  row.setAttribute('aria-hidden', 'true');
  return row;
}

/**
 * Erklärkarten zu den genannten Bauteilen/Regeln zeigen (hintereinander);
 * `onClose` wird beim Schließen aufgerufen. Danach gelten sie als gesehen.
 */
export function showLessons(root: HTMLElement, lang: Lang, ids: LessonId[], onClose: () => void = () => {}, cover?: string): void {
  const list = ids.filter(hasLesson);
  const slides = list.flatMap((id) => LESSONS[id].slides.map((slide) => ({ slide, tag: LESSONS[id].tag })));
  if (!slides.length) return onClose();
  const tx = (t: Localized, vars: Record<string, string | number> = {}) => t[lang].replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
  const before = document.activeElement as HTMLElement | null;
  const shade = el('div', 'zf-intro');
  const card = el('div', 'zf-intro__card');
  card.setAttribute('role', 'dialog');
  card.setAttribute('aria-modal', 'true');
  card.setAttribute('aria-label', tx(T.label));
  shade.append(card);
  let i = 0;
  // Bild oben (Kapitelbild; bei der Einführung das Titelbild)
  const banner = cover ?? (list.includes('belt') ? IMAGES.titelbild : undefined);

  function close(): void {
    markSeen(list);
    shade.remove();
    document.removeEventListener('keydown', onKey);
    before?.focus?.();
    onClose();
  }

  function onKey(event: KeyboardEvent): void {
    if (event.key === 'Escape') close();
    else if (event.key === 'ArrowRight' && i < slides.length - 1) show(i + 1);
    else if (event.key === 'ArrowLeft' && i > 0) show(i - 1);
  }

  function show(n: number): void {
    i = n;
    const { slide, tag } = slides[n]!;
    const dots = el('div', 'zf-intro__steps');
    dots.setAttribute('aria-label', tx(T.step, { n: n + 1, m: slides.length }));
    if (slides.length > 1) slides.forEach((_, k) => dots.append(el('span', k === n ? 'is-on' : '')));
    const nav = el('div', 'zf-intro__nav');
    const last = n === slides.length - 1;
    if (!last) {
      const skip = el('button', 'zf-btn zf-intro__skip', tx(T.skip));
      skip.type = 'button';
      skip.addEventListener('click', close);
      nav.append(skip);
    }
    if (n > 0) {
      const back = el('button', 'zf-btn', tx(T.back));
      back.type = 'button';
      back.addEventListener('click', () => show(n - 1));
      nav.append(back);
    }
    const next = el('button', 'zf-btn zf-btn--main', tx(last ? T.go : T.next));
    next.type = 'button';
    next.addEventListener('click', () => (last ? close() : show(n + 1)));
    nav.append(next);
    const h = el('h2', 'zf-intro__title', tx(slide.title));
    h.id = 'zf-intro-title';
    card.setAttribute('aria-labelledby', h.id);
    const parts: HTMLElement[] = [];
    if (banner && n === 0) {
      const img = el('img', 'zf-intro__cover');
      img.src = banner;
      img.alt = '';
      parts.push(img);
    }
    parts.push(el('p', 'zf-intro__tag', tx(tag)), dots);
    if (slide.scene) parts.push(scene(slide.scene, lang));
    card.replaceChildren(...parts, h, el('p', 'zf-intro__text', tx(slide.text)), nav);
    next.focus();
  }

  document.addEventListener('keydown', onKey);
  shade.addEventListener('click', (event) => {
    if (event.target === shade) close();
  });
  root.append(shade);
  show(0);
}
