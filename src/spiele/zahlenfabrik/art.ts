import type { Dir } from './model';

/**
 * Gezeichnete Grafik der Zahlenfabrik (eigene SVG-Formen, keine fremden
 * Bilder und keine Emojis, die auf jedem Gerät anders aussehen). Farben kommen
 * aus CSS-Klassen (zahlenfabrik.css), damit hell und dunkel passen.
 *
 * Die Zeichnungen liegen hinter der Aufschrift eines Feldes. Der kleine
 * Ausguss zeigt, in welche Richtung das Teil die Zahl weitergibt; er wird um
 * die Feldmitte gedreht.
 */
const NS = 'http://www.w3.org/2000/svg';

/**
 * Eigene Bilder (optional, `src/assets/zahlenfabrik/<name>.webp`, Prompts in
 * docs/ZAHLENFABRIK-BILDER.md). Gibt es eine Datei, nimmt das Spiel das Bild,
 * sonst die gezeichnete Grafik unten.
 */
const files = import.meta.glob<string>('../../assets/zahlenfabrik/*.webp', { eager: true, query: '?url', import: 'default' });
export const IMAGES: Record<string, string> = Object.fromEntries(Object.entries(files).map(([path, url]) => [path.split('/').pop()!.replace(/\.webp$/, ''), url]));

/** Dateinamen je Teil (mehrere = Varianten, je nach Feld gewählt). */
const FILES: Record<ArtKind, string[]> = {
  source: ['quelle'],
  machine: ['maschine'],
  sort: ['weiche'],
  merge: ['zusammenfuehren'],
  target: ['lager'],
  base: ['basis'],
  rock: ['fels-1', 'fels-2', 'fels-3'],
  bridge: ['bruecke'],
};

/** Bild-Adresse für ein Teil (oder undefined, wenn es kein Bild gibt). */
export function imageFor(kind: ArtKind, variant = 0): string | undefined {
  const names = FILES[kind].filter((n) => IMAGES[n]);
  return names.length ? IMAGES[names[variant % names.length]!] : undefined;
}

export type ArtKind = 'source' | 'machine' | 'sort' | 'merge' | 'target' | 'base' | 'rock' | 'bridge';

/** Ausguss an der rechten Kante (Richtung 0), wird je nach Richtung gedreht. */
const spout = (size: number) => {
  const m = size / 2;
  return `<path class="zf-art__spout" d="M${size - 3} ${m - 7}L${size + 6} ${m}L${size - 3} ${m + 7}Z"/>`;
};

/** Zeichnungen im Feld (Kasten 52 × 52, bei Basis und Fels ganze Fläche). */
const DRAW: Record<ArtKind, (size: number) => string> = {
  // Zahlenquelle: Trichter oben, Schornstein mit Rauchwölkchen
  source: (s) =>
    `<path class="zf-art__line" d="M8 9h${s - 16}l-7 9H15Z"/>` +
    `<rect class="zf-art__fill" x="${s - 14}" y="2" width="6" height="9" rx="1"/>` +
    `<circle class="zf-art__smoke" cx="${s - 9}" cy="-2" r="3"/><circle class="zf-art__smoke zf-art__smoke--2" cx="${s - 5}" cy="-7" r="2.2"/>`,
  // Rechenmaschine: Zahnrad im Hintergrund, Schrauben in den Ecken
  machine: (s) => {
    const c = s / 2;
    const teeth = Array.from({ length: 8 }, (_, i) => {
      const a = (i * Math.PI) / 4;
      const x = c + Math.cos(a) * 19;
      const y = c + Math.sin(a) * 19;
      return `<circle class="zf-art__gear" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4"/>`;
    }).join('');
    return `${teeth}<circle class="zf-art__gear" cx="${c}" cy="${c}" r="17"/>` + [[6, 6], [s - 6, 6], [6, s - 6], [s - 6, s - 6]].map(([x, y]) => `<circle class="zf-art__bolt" cx="${x}" cy="${y}" r="2.2"/>`).join('');
  },
  // Weiche: Gabel – ein Weg hinein, zwei hinaus
  sort: (s) => `<path class="zf-art__line zf-art__line--thick" d="M6 ${s / 2}H${s / 2}M${s / 2} ${s / 2}L${s - 8} 10M${s / 2} ${s / 2}L${s - 8} ${s - 10}"/>`,
  // Zusammenführen: zwei Wege laufen zu einem zusammen
  merge: (s) => `<path class="zf-art__line zf-art__line--thick" d="M8 10L${s / 2} ${s / 2}M8 ${s - 10}L${s / 2} ${s / 2}M${s / 2} ${s / 2}H${s - 6}"/>`,
  // Lager: Kiste mit Brettern
  target: (s) =>
    `<path class="zf-art__line" d="M4 ${s * 0.3}H${s - 4}M4 ${s * 0.7}H${s - 4}"/>` +
    [[8, s * 0.3], [s - 8, s * 0.3], [8, s * 0.7], [s - 8, s * 0.7]].map(([x, y]) => `<circle class="zf-art__bolt" cx="${x}" cy="${y}" r="1.6"/>`).join(''),
  // Basis: Haus mit Dach und Tür (über die ganze Basis)
  base: (s) =>
    `<path class="zf-art__roof" d="M${s * 0.12} ${s * 0.42}L${s / 2} ${s * 0.1}L${s * 0.88} ${s * 0.42}Z"/>` +
    `<rect class="zf-art__line" x="${s * 0.2}" y="${s * 0.42}" width="${s * 0.6}" height="${s * 0.46}" rx="4"/>` +
    `<rect class="zf-art__door" x="${s * 0.43}" y="${s * 0.64}" width="${s * 0.14}" height="${s * 0.24}" rx="2"/>`,
  // Fels: Brocken mit Licht- und Schattenseite
  rock: (s) =>
    `<path class="zf-art__rock" d="M${s * 0.14} ${s * 0.7}L${s * 0.24} ${s * 0.36}L${s * 0.48} ${s * 0.2}L${s * 0.74} ${s * 0.3}L${s * 0.88} ${s * 0.62}L${s * 0.7} ${s * 0.84}L${s * 0.3} ${s * 0.86}Z"/>` +
    `<path class="zf-art__rock-light" d="M${s * 0.24} ${s * 0.36}L${s * 0.48} ${s * 0.2}L${s * 0.56} ${s * 0.42}L${s * 0.34} ${s * 0.52}Z"/>` +
    `<path class="zf-art__rock-dark" d="M${s * 0.56} ${s * 0.42}L${s * 0.88} ${s * 0.62}L${s * 0.7} ${s * 0.84}L${s * 0.5} ${s * 0.7}Z"/>`,
  // Brücke: Bogen mit Geländer
  bridge: (s) => `<path class="zf-art__line zf-art__line--thick" d="M4 ${s * 0.78}Q${s / 2} ${s * 0.18} ${s - 4} ${s * 0.78}"/>`,
};

/**
 * SVG-Zeichnung für ein Feld. `size`: Kantenlänge in px (Kasten 52, ganze
 * Felder 64, Basis 3 × 64). `dir`: Richtung des Ausgusses (ohne: keiner).
 */
export function art(kind: ArtKind, size: number, dir?: Dir, variant = 0): SVGSVGElement | HTMLImageElement {
  const src = imageFor(kind, variant);
  if (src) {
    // Bild: Ausgang zeigt nach rechts, für andere Richtungen gedreht
    const img = document.createElement('img');
    img.className = `zf-art zf-art--img zf-art--${kind}`;
    img.src = src;
    img.alt = '';
    img.decoding = 'async';
    img.draggable = false;
    if (dir) img.style.rotate = `${dir * 90}deg`;
    return img;
  }
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', `zf-art zf-art--${kind}`);
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
  svg.setAttribute('width', String(size));
  svg.setAttribute('height', String(size));
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  const body = DRAW[kind](size);
  const turn = dir === undefined ? '' : `<g transform="rotate(${dir * 90} ${size / 2} ${size / 2})">${spout(size)}</g>`;
  svg.innerHTML = body + turn;
  return svg;
}
