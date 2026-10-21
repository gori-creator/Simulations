import { parseSubText } from './draw';

/**
 * Beschriftungen der Bedienelemente mit tiefgestelltem Index.
 *
 * Gleiche Schreibweise wie `subText` auf der Zeichenfläche: „F_Z“, „μ_H“,
 * „F_{G,1}“; `\_` steht für einen echten Unterstrich. Texte ohne `_`
 * bleiben reiner Text (`textContent`), am Aussehen ändert sich nichts.
 */

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** Text für die Verwendung in HTML maskieren. */
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => ESCAPES[ch]!);
}

/** Lesefassung für Bildschirmleser: Index mit Leerzeichen abgesetzt („F_Z“ → „F Z“). */
export function plainSubText(value: string): string {
  return parseSubText(value)
    .map((part, i, all) => (part.sub ? ` ${part.text}${all[i + 1] && !/^\s/.test(all[i + 1]!.text) ? ' ' : ''}` : part.text))
    .join('');
}

/**
 * HTML für eine Beschriftung mit Index oder `null`, wenn der Text keinen Index
 * enthält. Sichtbar ist die Fassung mit `<sub>` (für Bildschirmleser
 * ausgeblendet), vorgelesen wird die Lesefassung aus `plainSubText`.
 */
export function subLabelHtml(value: string): string | null {
  if (!value.includes('_')) return null;
  const parts = parseSubText(value);
  if (!parts.some((part) => part.sub)) return null;
  const visible = parts.map((part) => (part.sub ? `<sub>${escapeHtml(part.text)}</sub>` : escapeHtml(part.text))).join('');
  return `<span aria-hidden="true">${visible}</span><span class="visually-hidden">${escapeHtml(plainSubText(value))}</span>`;
}

/** Setzt die Beschriftung eines Elements, mit Index als `<sub>`. */
export function setSubLabel(element: HTMLElement, value: string): void {
  const html = subLabelHtml(value);
  if (html === null) element.textContent = value.replace(/\\_/g, '_');
  else element.innerHTML = html;
}
