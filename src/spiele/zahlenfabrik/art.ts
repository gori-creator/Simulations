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
  // Hindernisse: Felsen, Bäume, Busch, Kisten (bunt gemischt, je Feld fest)
  rock: ['fels-1', 'fels-2', 'fels-3', 'fels-4', 'fels-1', 'baum-1', 'fels-2', 'baum-2', 'fels-3', 'busch', 'kisten'],
  bridge: ['bruecke'],
};

/** Bild-Adresse für ein Teil (oder undefined, wenn es kein Bild gibt); `specific` wird zuerst versucht. */
export function imageFor(kind: ArtKind, variant = 0, specific?: string): string | undefined {
  if (specific && IMAGES[specific]) return IMAGES[specific];
  const names = FILES[kind].filter((n) => IMAGES[n]);
  return names.length ? IMAGES[names[variant % names.length]!] : undefined;
}

/** Eigenes Bild je Rechenart (Maschinen) bzw. Prüfung (Weichen), sonst das allgemeine. */
const MACHINE_FILES: Partial<Record<string, string>> = {
  '+': 'maschine-plus', '−': 'maschine-minus', '×': 'maschine-mal', '÷': 'maschine-geteilt', '²': 'maschine-quadrat',
  '%': 'maschine-rest', 'Σ': 'maschine-quersumme', '√': 'maschine-wurzel', '±': 'maschine-vorzeichen', '|': 'maschine-betrag',
  '⇄': 'maschine-spiegel', '≈': 'maschine-runden', ':': 'maschine-bruch', '⅟': 'maschine-kehrwert',
  cnt: 'maschine-zaehler', acc: 'maschine-sammel', prev: 'maschine-puffer',
};
const SWITCH_FILES: Partial<Record<string, string>> = { even: 'weiche-gerade', div: 'weiche-teilbar', gt: 'weiche-groesser', prime: 'weiche-prim', square: 'weiche-quadrat', int: 'weiche-ganz' };
const MERGE_FILES: Partial<Record<string, string>> = { '+': 'zusammen-summe', '−': 'zusammen-differenz', '×': 'zusammen-produkt', '÷': 'zusammen-quotient' };
/** Bild je Rechenart; ohne eigenes die neutrale Maschine. */
export const machineFile = (sym: string) => MACHINE_FILES[sym] ?? 'maschine-allgemein';
export const switchFile = (test: string) => SWITCH_FILES[test];
export const mergeFile = (mode: string) => MERGE_FILES[mode];
/** Rechenzeichen zur Aufschrift einer Maschine (für die Erklärkarten). */
export function symOfLabel(label: string): string | undefined {
  if (label.startsWith('mod')) return '%';
  if (label === 'QS') return 'Σ';
  if (label === '√x') return '√';
  if (label === 'x²') return '²';
  if (label === '|x|') return '|';
  if (label === '1/x') return '⅟';
  if (label.startsWith('x/')) return ':';
  if (label === '1,2,3') return 'cnt';
  if (label === 'Σx') return 'acc';
  if (label === 'x₋₁') return 'prev';
  return label[0];
}

/** Bild je Kapitel (für Erklärkarten und Auswahl). */
const CHAPTER_FILES: Record<string, string> = {
  c1: 'kapitel-01', c2: 'kapitel-02', c3: 'kapitel-03', c4: 'kapitel-04', c5: 'kapitel-05', c6: 'kapitel-06', c7: 'kapitel-07',
  c8: 'kapitel-08', c9: 'kapitel-09', c10: 'kapitel-10', c11: 'kapitel-11', c12: 'kapitel-12', c13: 'kapitel-13',
  c14: 'kapitel-rest', c15: 'kapitel-quersumme', c16: 'kapitel-wurzel', c17: 'kapitel-quadratzahl', c19: 'kapitel-terme',
  c20: 'kapitel-bruecke', c21: 'kapitel-raetsel', c22: 'kapitel-detektiv', c23: 'kapitel-vorzeichen', c24: 'kapitel-spiegel',
  c25: 'kapitel-runden', c26: 'kapitel-wechsel', c27: 'kapitel-grossmeister', c28: 'kapitel-zusammen', c29: 'kapitel-brueche',
  c30: 'kapitel-gleichungen', c31: 'kapitel-zaehler', c32: 'kapitel-sammel', c33: 'kapitel-puffer', c34: 'kapitel-ganz', c35: 'kapitel-schleife', c36: 'kapitel-regeln',
};
export const chapterImage = (id: string): string | undefined => IMAGES[CHAPTER_FILES[id] ?? ''];

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
 * Erkennungszeichen für Maschinen, die noch kein eigenes Bild haben (in der
 * gezeichneten Grafik): Zähler mit drei Zählpunkten, Sammler mit Haufen.
 */
const DECOR: Record<string, (s: number) => string> = {
  'maschine-zaehler': (s) =>
    [0.3, 0.5, 0.7].map((f, i) => `<circle class="zf-art__mark" cx="${(s * f).toFixed(1)}" cy="9" r="${2 + i}"/>`).join(''),
  'maschine-sammel': (s) =>
    `<rect class="zf-art__mark" x="${s / 2 - 11}" y="${s - 11}" width="22" height="4" rx="2"/>` +
    `<rect class="zf-art__mark" x="${s / 2 - 7}" y="${s - 16}" width="14" height="4" rx="2"/>` +
    `<rect class="zf-art__mark" x="${s / 2 - 3}" y="${s - 21}" width="6" height="4" rx="2"/>`,
  // Puffer: Sanduhr (eine Zahl wartet)
  'maschine-puffer': (s) => `<path class="zf-art__mark" d="M${s - 16} 5h10l-5 6zM${s - 16} 17h10l-5 -6z"/>`,
  // Verteiler: zwei gleiche Punkte (Kopie in beide Richtungen)
  verteiler: (s) => `<circle class="zf-art__mark" cx="${s - 9}" cy="9" r="3.5"/><circle class="zf-art__mark" cx="${s - 9}" cy="${s - 9}" r="3.5"/>`,
  // Weiche „ganze Zahl?“: ein ganzer Kreis und ein Kreis mit Schnitt
  'weiche-ganz': (s) => `<circle class="zf-art__mark" cx="${s - 10}" cy="8" r="3.5"/><circle class="zf-art__line" cx="${s - 10}" cy="${s - 8}" r="3.5"/><path class="zf-art__line" d="M${s - 10} ${s - 8}v-3.5M${s - 10} ${s - 8}h3.5"/>`,
};

/**
 * SVG-Zeichnung für ein Feld. `size`: Kantenlänge in px (Kasten 52, ganze
 * Felder 64, Basis 3 × 64). `dir`: Richtung des Ausgusses (ohne: keiner).
 */
export function art(kind: ArtKind, size: number, dir?: Dir, variant = 0, flip = false, specific?: string): SVGSVGElement | HTMLImageElement {
  const src = imageFor(kind, variant, specific);
  if (src) {
    // Bild: Ausgang zeigt nach rechts, für andere Richtungen gedreht
    const img = document.createElement('img');
    img.className = `zf-art zf-art--img zf-art--${kind}`;
    img.src = src;
    img.alt = '';
    img.decoding = 'async';
    img.draggable = false;
    // Weiche mit „nein“ nach links: Bild gespiegelt (im Bild geht „nein“ nach unten)
    img.style.transform = `rotate(${(dir ?? 0) * 90}deg)${flip ? ' scaleY(-1)' : ''}`;
    // Noch kein eigenes Bild: das allgemeine, per CSS umgefärbt (zahlenfabrik.css)
    if (specific && !IMAGES[specific] && DECOR[specific]) img.dataset.fallback = specific;
    return img;
  }
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', `zf-art zf-art--${kind}`);
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
  svg.setAttribute('width', String(size));
  svg.setAttribute('height', String(size));
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  const body = DRAW[kind](size) + (specific && DECOR[specific] ? DECOR[specific](size) : '');
  const turn = dir === undefined || kind === 'sort' ? '' : `<g transform="rotate(${dir * 90} ${size / 2} ${size / 2})">${spout(size)}</g>`;
  svg.innerHTML = body + turn;
  return svg;
}
