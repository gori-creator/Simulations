import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { extractThumb, parseAttributes } from '../src/lib/thumb';

/** Alle eigenen Vorschaubilder (Pfad → Inhalt). */
const files = import.meta.glob<string>('../src/simulations/*/*/thumb.svg', { query: '?raw', import: 'default', eager: true });
const thumbs = Object.entries(files);

/** Farbattribute bzw. CSS-Eigenschaften, die nur `none` oder `currentColor` enthalten dürfen. */
const COLOR_PROPS = ['fill', 'stroke', 'color', 'stop-color', 'flood-color', 'lighting-color'];
/** Formen, deren Füllung sichtbar wird (Linien `<line>` haben keine Fläche). */
const FILLABLE = new Set(['path', 'rect', 'circle', 'ellipse', 'polygon', 'polyline', 'text']);

/** Wert einer Eigenschaft aus Attribut oder `style`. */
function prop(attrs: [string, string][], name: string): string | undefined {
  const style = attrs.find(([n]) => n === 'style')?.[1];
  const fromStyle = style
    ?.split(';')
    .map((d) => d.split(':').map((s) => s.trim()))
    .find(([n]) => n === name)?.[1];
  return fromStyle ?? attrs.find(([n]) => n === name)?.[1];
}

/** Alle Farbwerte eines SVG-Texts (Attribute und style-Angaben). */
function colorValues(svg: string): string[] {
  const values: string[] = [];
  for (const m of svg.matchAll(/<[a-zA-Z][^>]*>/g)) {
    const attrs = parseAttributes(m[0]);
    for (const p of COLOR_PROPS) {
      const v = prop(attrs, p);
      if (v !== undefined) values.push(v);
    }
  }
  return values;
}

/**
 * Formen ohne geerbte oder eigene Füllung (würden schwarz gefüllt).
 * Geprüft wird der Inhalt so, wie `SimThumb.astro` ihn einbettet.
 */
function unfilledShapes(content: string): string[] {
  const stack: (string | undefined)[] = [];
  const bad: string[] = [];
  for (const m of content.matchAll(/<(\/?)([a-zA-Z][\w:-]*)([^>]*?)(\/?)>/g)) {
    const [, closing, tag, rest, selfClosing] = m;
    if (closing) {
      stack.pop();
      continue;
    }
    const fill = prop(parseAttributes(rest!), 'fill');
    const inherited = fill ?? [...stack].reverse().find((f) => f !== undefined);
    if (FILLABLE.has(tag!.toLowerCase()) && inherited === undefined) bad.push(m[0].slice(0, 60));
    if (!selfClosing) stack.push(fill);
  }
  return bad;
}

describe('extractThumb', () => {
  it('übernimmt die Darstellungsattribute der Wurzel in ein <g>', () => {
    const out = extractThumb('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" fill="none" stroke="currentColor"><path d="M0 0L10 10"/></svg>');
    expect(out).toBe('<g fill="none" stroke="currentColor"><path d="M0 0L10 10"/></g>');
  });

  it('entfernt Dateiattribute (xmlns, viewBox, Größe, class, id, style, preserveAspectRatio)', () => {
    const out = extractThumb(
      `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 320 180" width="320" height="180" class="a" id="b" style="color:red" preserveAspectRatio="none" stroke-width="4"><circle r="2"/></svg>`,
    );
    expect(out).toBe('<g stroke-width="4"><circle r="2"/></g>');
  });

  it('gibt ohne Darstellungsattribute nur den Inhalt zurück', () => {
    expect(extractThumb('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180">\n  <g fill="none"/>\n</svg>\n')).toBe('<g fill="none"/>');
  });

  it('ist robust gegen Reihenfolge, Anführungszeichen, Zeilenumbrüche, XML-Kopf und Kommentare', () => {
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Vorschaubild <svg fill="x"> im Kommentar -->
<svg
  stroke-linecap='round'
  viewBox='0 0 320 180'
  fill = "none"
  xmlns='http://www.w3.org/2000/svg'
><rect width="5" height="5" fill="currentColor"/></svg>`;
    expect(extractThumb(svg)).toBe('<g stroke-linecap="round" fill="none"><rect width="5" height="5" fill="currentColor"/></g>');
  });
});

describe('Vorschaubilder (thumb.svg)', () => {
  it('gibt es', () => {
    expect(thumbs.length).toBeGreaterThan(50);
  });

  it('haben das Format 320 × 180', () => {
    for (const [file, svg] of thumbs) {
      const root = /<svg\b[^>]*>/i.exec(svg)?.[0] ?? '';
      expect(parseAttributes(root).find(([n]) => n === 'viewBox')?.[1], file).toBe('0 0 320 180');
    }
  });

  it('nutzen keine festen Farben (nur none und currentColor)', () => {
    for (const [file, svg] of thumbs) {
      for (const v of colorValues(svg)) expect(['none', 'currentcolor'], `${file}: ${v}`).toContain(v.toLowerCase());
      expect(svg, file).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(/i);
    }
  });

  it('behalten beim Einbetten die Darstellungsattribute der Wurzel', () => {
    for (const [file, svg] of thumbs) {
      const root = /<svg\b[^>]*>/i.exec(svg)?.[0] ?? '';
      const out = extractThumb(svg);
      for (const [name, value] of parseAttributes(root)) {
        if (/^(xmlns|viewbox|width|height|class|id|style|preserveaspectratio|version)$|^xmlns:/i.test(name)) continue;
        expect(out, `${file}: ${name}`).toContain(`${name}="${value}"`);
      }
    }
  });

  it('haben keine Formen, die schwarz gefüllt würden', () => {
    for (const [file, svg] of thumbs) {
      expect(unfilledShapes(extractThumb(svg)), file).toEqual([]);
    }
  });

  it('werden von SimThumb.astro über extractThumb eingebettet', () => {
    const component = readFileSync('src/components/SimThumb.astro', 'utf8');
    expect(component).toMatch(/extractThumb\(svg\)/);
    expect(component).not.toMatch(/replace\(\/\^\[\\s\\S\]\*\?<svg/);
  });
});
