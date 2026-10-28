/**
 * Bewegung auf der Startseite: Skulptur, Münze und Achterbahn hören auf einen
 * gemeinsamen Pausenzustand. Er startet pausiert, wenn das System reduzierte
 * Bewegung wünscht (`prefers-reduced-motion`), und lässt sich über den Knopf in
 * der Kopfleiste (`[data-motion-toggle]`) umschalten. Gemerkt wird nichts.
 */
type Listener = (paused: boolean) => void;

const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const listeners = new Set<Listener>();
let paused = reduced.matches;

export const motion = {
  get paused(): boolean {
    return paused;
  },
  /** Wünscht das System reduzierte Bewegung? */
  get reduced(): boolean {
    return reduced.matches;
  },
  set(value: boolean): void {
    if (value === paused) return;
    paused = value;
    for (const listener of listeners) listener(paused);
  },
  /** Auf Änderungen hören; gibt eine Funktion zum Abmelden zurück. */
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  /** Änderungen der Systemeinstellung „reduzierte Bewegung“. */
  onReducedChange(listener: (reduced: boolean) => void): () => void {
    const handler = () => listener(reduced.matches);
    reduced.addEventListener('change', handler);
    return () => reduced.removeEventListener('change', handler);
  },
};

/** Knopf „Bewegung pausieren/fortsetzen“ anbinden; gibt das Abmelden zurück. */
export function bindMotionToggle(button: HTMLButtonElement): () => void {
  const sync = (value: boolean) => {
    button.setAttribute('aria-pressed', String(value));
    const label = (value ? button.dataset.labelResume : button.dataset.labelPause) ?? '';
    button.setAttribute('aria-label', label);
    button.title = label;
    button.classList.toggle('is-paused', value);
    document.documentElement.classList.toggle('motion-paused', value);
  };
  const onClick = () => motion.set(!motion.paused);
  button.addEventListener('click', onClick);
  const unsubscribe = motion.subscribe(sync);
  const unReduced = motion.onReducedChange((value) => motion.set(value));
  button.hidden = false;
  sync(motion.paused);
  return () => {
    button.removeEventListener('click', onClick);
    unsubscribe();
    unReduced();
  };
}
