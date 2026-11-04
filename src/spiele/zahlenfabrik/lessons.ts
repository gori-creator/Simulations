import { L } from '../../curriculum/helpers';
import type { Lang, Localized } from '../../i18n/config';
import { art, imageFor } from './art';
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
  /** Weiche: Zahlen hinein, ✓ geradeaus, ✗ zur Seite. */
  | { kind: 'sort'; label: string; input: string; yes: string; no: string }
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
  const local = (t: string) => (lang === 'en' ? t.replace('gerade?', 'even?').replace('Prim?', 'prime?') : t);
  const box = (kind: 'source' | 'machine' | 'target' | 'sort', text: string, dir?: 0) => {
    const c = el('div', `zf-intro__box zf-intro__box--${kind}`);
    c.append(art(kind, 52, dir), el('span', '', local(text)));
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
    const src = imageFor(s.part);
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
    row = el('div', 'zf-intro__scene zf-lesson-sort');
    const outs = el('div', 'zf-lesson-sort__outs');
    outs.append(el('span', 'zf-lesson-sort__yes', `✓ ${s.yes}`), el('span', 'zf-lesson-sort__no', `✗ ${s.no}`));
    row.append(el('span', 'zf-lesson-sort__in', s.input), belt(), box('sort', s.label, 0), outs);
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
export function showLessons(root: HTMLElement, lang: Lang, ids: LessonId[], onClose: () => void = () => {}): void {
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
    const parts: HTMLElement[] = [el('p', 'zf-intro__tag', tx(tag)), dots];
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
