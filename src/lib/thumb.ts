/**
 * Eigene Vorschaubilder (`src/simulations/<fach>/<id>/thumb.svg`) für die Karten.
 *
 * `SimThumb.astro` zeichnet ein eigenes `<svg>` mit Gitter und bettet den Inhalt
 * der Datei darin ein. Darstellungsattribute am Wurzel-`<svg>` der Datei
 * (z. B. `fill="none"`, `stroke="currentColor"`) gelten für alle Kindelemente.
 * Sie dürfen beim Einbetten nicht verloren gehen – sonst ist `fill` schwarz
 * (Voreinstellung) und das Bild erscheint als schwarze Fläche.
 */

/** Attribute des Wurzel-`<svg>`, die nur die Datei selbst betreffen und nicht übernommen werden. */
const DROPPED = new Set(['xmlns', 'viewbox', 'width', 'height', 'class', 'id', 'style', 'preserveaspectratio', 'version']);

/** Liest die Attribute eines Starttags (beliebige Reihenfolge, einfache/doppelte Anführungszeichen, Zeilenumbrüche). */
export function parseAttributes(tag: string): [string, string][] {
  const attrs: [string, string][] = [];
  const re = /([^\s=/>"']+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
  for (const m of tag.matchAll(re)) attrs.push([m[1]!, m[2] ?? m[3] ?? '']);
  return attrs;
}

const escapeAttr = (v: string) => v.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/**
 * Inhalt einer `thumb.svg` zum Einbetten in ein fremdes `<svg>`.
 * Ergebnis: `<g …Darstellungsattribute der Wurzel…>…Inhalt…</g>`; ohne solche
 * Attribute nur der Inhalt. XML-Kopf, Kommentare und Doctype vor `<svg>` werden
 * übersprungen.
 */
export function extractThumb(source: string): string {
  // Kommentare, XML-Kopf und Doctype entfernen (dort könnte auch „<svg“ stehen)
  const svg = source.replace(/<!--[\s\S]*?-->/g, '').replace(/<\?[\s\S]*?\?>/g, '').replace(/<!DOCTYPE[^>]*>/gi, '');
  const start = /<svg\b[^>]*>/i.exec(svg);
  if (!start) return svg.trim();
  const end = svg.toLowerCase().lastIndexOf('</svg>');
  const inner = svg.slice(start.index + start[0].length, end > start.index ? end : undefined).trim();
  const kept = parseAttributes(start[0]).filter(([name]) => {
    const n = name.toLowerCase();
    return !DROPPED.has(n) && !n.startsWith('xmlns:');
  });
  if (kept.length === 0) return inner;
  return `<g ${kept.map(([n, v]) => `${n}="${escapeAttr(v)}"`).join(' ')}>${inner}</g>`;
}
