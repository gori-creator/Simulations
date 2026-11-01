/**
 * Kleine Helfer zum Bauen von Oberflächen ohne innerHTML (Texte werden nie als
 * HTML gedeutet). Für Spiele und die Lektionsseite.
 */
type Child = Node | string | number | null | undefined | false;

export interface Props {
  class?: string;
  text?: string;
  attrs?: Record<string, string | number | boolean | undefined>;
  on?: Partial<Record<keyof HTMLElementEventMap, (event: never) => void>>;
}

function apply(el: Element, props: Props | undefined): void {
  if (!props) return;
  if (props.class) el.setAttribute('class', props.class);
  if (props.text !== undefined) el.textContent = props.text;
  for (const [key, value] of Object.entries(props.attrs ?? {})) {
    if (value === undefined || value === false) continue;
    el.setAttribute(key, value === true ? '' : String(value));
  }
  for (const [type, listener] of Object.entries(props.on ?? {})) {
    if (listener) el.addEventListener(type, listener as EventListener);
  }
}

function append(el: Element, children: Child[]): void {
  for (const child of children) {
    if (child === null || child === undefined || child === false) continue;
    el.append(typeof child === 'object' ? child : String(child));
  }
}

/** HTML-Element, z. B. `h('button', { class: 'btn', on: { click } }, 'Text')`. */
export function h<K extends keyof HTMLElementTagNameMap>(tag: K, props?: Props, ...children: Child[]): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  apply(el, props);
  append(el, children);
  return el;
}

const SVG_NS = 'http://www.w3.org/2000/svg';

/** SVG-Element, Attribute direkt als Objekt: `s('circle', { cx: 4, cy: 4, r: 2, class: 'dot' })`. */
export function s<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number | undefined> = {}, ...children: Child[]): SVGElementTagNameMap[K] {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [key, value] of Object.entries(attrs)) if (value !== undefined) el.setAttribute(key, String(value));
  append(el, children);
  return el;
}

/** Inhalt leeren. */
export function clear(el: Element): void {
  while (el.firstChild) el.firstChild.remove();
}

/** Zufällige Reihenfolge (Fisher-Yates) mit eigener Zufallsquelle. */
export function shuffle<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

/** Wiederholbare Zufallszahlen (mulberry32) für Spiele mit festen Daten. */
export function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
