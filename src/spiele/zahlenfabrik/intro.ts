import { L } from '../../curriculum/helpers';
import type { Lang, Localized } from '../../i18n/config';
import { art } from './art';

/**
 * Kurze Einführung beim ersten Start (ohne Spielfigur): vier Karten mit einer
 * kleinen gezeichneten Fabrik. Danach merkt sich der Browser, dass sie
 * gesehen wurde; über „Anleitung“ lässt sie sich wieder öffnen.
 */
const STORE = 'spiel:zahlenfabrik:intro';

interface Slide {
  title: Localized;
  text: Localized;
  /** Kleine Fabrik: Quelle, Maschine, Lager mit Zahlen (ohne Maschine: nur Band). */
  scene: { from: string; op?: string; to: string };
}

const SLIDES: Slide[] = [
  {
    title: L('Willkommen in der Zahlenfabrik!', 'Welcome to the Number Factory!'),
    text: L('Zahlenquellen geben Zahlen aus. Förderbänder bringen sie Feld für Feld weiter – bis ins Lager.', 'Number sources give out numbers. Conveyor belts carry them square by square – all the way to the storage.'),
    scene: { from: '3', to: '3' },
  },
  {
    title: L('Bänder ziehen', 'Drawing belts'),
    text: L('Wähle „Band“ und zieh mit dem Finger oder der Maus über die Kästchen – von der Quelle bis zum Lager. Ein Band nochmal antippen dreht es.', 'Choose “Belt” and drag with your finger or the mouse across the squares – from the source to the storage. Tap a belt again to turn it.'),
    scene: { from: '3', to: '3' },
  },
  {
    title: L('Maschinen rechnen', 'Machines calculate'),
    text: L('Setz Maschinen auf das Band. Jede Zahl, die hindurchläuft, wird verrechnet: Aus 3 wird mit +2 die 5.', 'Put machines on the belt. Every number that runs through is calculated: with +2, 3 becomes 5.'),
    scene: { from: '3', op: '+2', to: '5' },
  },
  {
    title: L('Aufträge erfüllen', 'Complete orders'),
    text: L('Jedes Lager will bestimmte Zahlen. Drück ▶ Start und schau zu! In der offenen Welt 🌍 sammelst du Münzen und schaltest neue Maschinen frei.', 'Every storage wants certain numbers. Press ▶ Start and watch! In the open world 🌍 you collect coins and unlock new machines.'),
    scene: { from: '3', op: '+2', to: '5' },
  },
];

const T = {
  skip: L('Überspringen', 'Skip'),
  back: L('← Zurück', '← Back'),
  next: L('Weiter →', 'Next →'),
  go: L('Los geht’s!', 'Let’s go!'),
  label: L('Einführung in die Zahlenfabrik', 'Introduction to the Number Factory'),
  step: L('Schritt {n} von {m}', 'Step {n} of {m}'),
};

export function introSeen(): boolean {
  try {
    return localStorage.getItem(STORE) === '1';
  } catch {
    return true;
  }
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls = '', text?: string): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

/** Einführung zeigen; `onClose` wird beim Schließen aufgerufen. */
export function showIntro(root: HTMLElement, lang: Lang, onClose: () => void = () => {}): void {
  const tx = (t: Localized, vars: Record<string, string | number> = {}) => t[lang].replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
  const before = document.activeElement as HTMLElement | null;
  const shade = el('div', 'zf-intro');
  const card = el('div', 'zf-intro__card');
  card.setAttribute('role', 'dialog');
  card.setAttribute('aria-modal', 'true');
  card.setAttribute('aria-label', tx(T.label));
  shade.append(card);
  let i = 0;

  function scene(s: Slide['scene']): HTMLElement {
    const row = el('div', 'zf-intro__scene');
    row.setAttribute('aria-hidden', 'true');
    const box = (kind: 'source' | 'machine' | 'target', text: string) => {
      const c = el('div', `zf-intro__box zf-intro__box--${kind}`);
      c.append(art(kind, 52, kind === 'target' ? undefined : 0), el('span', '', text));
      return c;
    };
    const belt = () => el('div', 'zf-intro__belt');
    row.append(box('source', s.from), belt());
    if (s.op) row.append(box('machine', s.op), belt());
    row.append(box('target', s.to));
    // Wandernde Zahl: vor der Maschine die Startzahl, dahinter das Ergebnis
    if (s.op) {
      row.append(el('span', 'zf-intro__dot zf-intro__dot--a', s.from), el('span', 'zf-intro__dot zf-intro__dot--b', s.to));
    } else row.append(el('span', 'zf-intro__dot', s.from));
    return row;
  }

  function close(): void {
    try {
      localStorage.setItem(STORE, '1');
    } catch {
      // ohne Speicher: kommt beim nächsten Besuch wieder
    }
    shade.remove();
    document.removeEventListener('keydown', onKey);
    before?.focus?.();
    onClose();
  }

  function onKey(event: KeyboardEvent): void {
    if (event.key === 'Escape') close();
    else if (event.key === 'ArrowRight' && i < SLIDES.length - 1) show(i + 1);
    else if (event.key === 'ArrowLeft' && i > 0) show(i - 1);
  }

  function show(n: number): void {
    i = n;
    const s = SLIDES[n]!;
    const dots = el('div', 'zf-intro__steps');
    dots.setAttribute('aria-label', tx(T.step, { n: n + 1, m: SLIDES.length }));
    SLIDES.forEach((_, k) => dots.append(el('span', k === n ? 'is-on' : '')));
    const nav = el('div', 'zf-intro__nav');
    const skip = el('button', 'zf-btn zf-intro__skip', tx(T.skip));
    skip.type = 'button';
    skip.addEventListener('click', close);
    nav.append(skip);
    if (n > 0) {
      const back = el('button', 'zf-btn', tx(T.back));
      back.type = 'button';
      back.addEventListener('click', () => show(n - 1));
      nav.append(back);
    }
    const last = n === SLIDES.length - 1;
    const next = el('button', 'zf-btn zf-btn--main', tx(last ? T.go : T.next));
    next.type = 'button';
    next.addEventListener('click', () => (last ? close() : show(n + 1)));
    nav.append(next);
    const h = el('h2', 'zf-intro__title', tx(s.title));
    h.id = 'zf-intro-title';
    card.setAttribute('aria-labelledby', h.id);
    card.replaceChildren(dots, scene(s.scene), h, el('p', 'zf-intro__text', tx(s.text)), nav);
    next.focus();
  }

  document.addEventListener('keydown', onKey);
  shade.addEventListener('click', (event) => {
    if (event.target === shade) close();
  });
  root.append(shade);
  show(0);
}
