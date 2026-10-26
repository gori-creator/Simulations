import { COMBINING_HAT, parseSubText, splitHats, type SubTextOptions } from './draw';
import { bindUnits, bindUnitsHtml } from './format';

/**
 * Beschriftungen der Bedienelemente mit tiefgestelltem Index.
 *
 * Gleiche Schreibweise wie `subText` auf der Zeichenfläche: „F_Z“, „μ_H“,
 * „F_{G,1}“; `\_` steht für einen echten Unterstrich. Zeichen mit
 * kombinierendem Dach (U+0302, „φ̂“) werden als `<span class="hat">` gesetzt.
 * Texte ohne `_` und ohne Dach bleiben reiner Text (`textContent`), am
 * Aussehen ändert sich nichts.
 */

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** Text für die Verwendung in HTML maskieren. */
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => ESCAPES[ch]!);
}

/** Zeichen ohne Ober- bzw. Unterlänge oben: Das Dach sitzt dort tiefer (`hat--low`). */
const LOW_LETTER = /^[acegmnopqrsuvwxyzαγεηικμνοπρστυχω]$/;

/**
 * Sichtbares HTML für ein Zeichen mit kombinierendem Dach (U+0302, „φ̂“):
 * `<span class="hat">φ</span>`, das Dach zeichnet CSS (`.hat::after`), weil
 * viele Schriften es über „φ“ verrutscht setzen. Mit `speak` bleibt das
 * Dach-Zeichen für Bildschirmleser im Text (unsichtbar).
 */
function hatSpan(base: string, speak: boolean): string {
  const cls = LOW_LETTER.test(base) ? 'hat hat--low' : 'hat';
  const mark = speak ? `<span class="visually-hidden">${COMBINING_HAT}</span>` : '';
  return `<span class="${cls}">${escapeHtml(base)}${mark}</span>`;
}

/** Text maskieren und Zeichen mit Dach als `<span class="hat">` setzen. */
export function escapeHatHtml(value: string, speak = false): string {
  return splitHats(value)
    .map((part) => (part.hat ? hatSpan(part.text, speak) : escapeHtml(part.text)))
    .join('');
}

/**
 * Setzt in vertrauenswürdigem HTML (Ergebnisse `{ html }`) Zeichen mit Dach
 * als `<span class="hat">`, nur im Text zwischen den Tags. Ohne U+0302 bleibt
 * das HTML unverändert.
 */
export function hatsInHtml(html: string): string {
  if (!html.includes(COMBINING_HAT)) return html;
  return html
    .split(/(<[^>]*>)/)
    .map((piece) =>
      piece.startsWith('<') || !piece.includes(COMBINING_HAT)
        ? piece
        : splitHats(piece)
            .map((part) => (part.hat ? hatSpan(part.text, true) : part.text))
            .join(''),
    )
    .join('');
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
  const hat = value.includes(COMBINING_HAT);
  if (!value.includes('_') && !hat) return null;
  const parts = parseSubText(value, options);
  if (!hat && !parts.some((part) => part.sub)) return null;
  // Zeichen mit Dach („φ̂_E“) als <span class="hat">, siehe escapeHatHtml
  const visible = parts.map((part) => (part.sub ? `<sub>${escapeHatHtml(part.text)}</sub>` : escapeHatHtml(part.text))).join('');
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
