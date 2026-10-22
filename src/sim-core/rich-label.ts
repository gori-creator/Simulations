import { parseSubText, type SubTextOptions } from './draw';
import { bindUnits, bindUnitsHtml } from './format';

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
export function plainSubText(value: string, options: SubTextOptions = {}): string {
  return parseSubText(value, options)
    .map((part, i, all) => (part.sub ? ` ${part.text}${all[i + 1] && !/^\s/.test(all[i + 1]!.text) ? ' ' : ''}` : part.text))
    .join('');
}

/**
 * HTML für eine Beschriftung mit Index oder `null`, wenn der Text keinen Index
 * enthält. Sichtbar ist die Fassung mit `<sub>` (für Bildschirmleser
 * ausgeblendet), vorgelesen wird die Lesefassung aus `plainSubText`.
 */
export function subLabelHtml(value: string, options: SubTextOptions = {}): string | null {
  if (!value.includes('_')) return null;
  const parts = parseSubText(value, options);
  if (!parts.some((part) => part.sub)) return null;
  const visible = parts.map((part) => (part.sub ? `<sub>${escapeHtml(part.text)}</sub>` : escapeHtml(part.text))).join('');
  return `<span aria-hidden="true">${visible}</span><span class="visually-hidden">${escapeHtml(plainSubText(value, options))}</span>`;
}

/**
 * Setzt ein Ergebnis aus reinem Text (`ctx.readout(key, 'F_max = 3 N')`):
 * Index wie bei den Beschriftungen als `<sub>` mit Lesefassung, Zahl und
 * Einheit durch ein geschütztes Leerzeichen verbunden (`bindUnits`).
 */
export function setSubReadout(element: HTMLElement, value: string): void {
  const html = subLabelHtml(value);
  if (html === null) element.textContent = bindUnits(value.replace(/\\_/g, '_'));
  else element.innerHTML = bindUnitsHtml(html);
}

/**
 * Setzt die Beschriftung eines Elements, mit Index als `<sub>`. Für Hilfetexte
 * und Tipps `{ prose: true }` (Wörter wie „log_2“ behalten ihren Unterstrich).
 */
export function setSubLabel(element: HTMLElement, value: string, options: SubTextOptions = {}): void {
  const html = subLabelHtml(value, options);
  if (html === null) element.textContent = value.replace(/\\_/g, '_');
  else element.innerHTML = html;
}
