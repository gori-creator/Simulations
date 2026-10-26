// @ts-check
/**
 * Pixelvergleich für die Bildtests: zählt Pixel, die sich deutlich
 * unterscheiden, und erzeugt ein Unterschiedsbild.
 */

/** @typedef {import('./png.mjs').Rgba} Rgba */

/**
 * Grenzwerte (siehe docs/BILDTESTS.md):
 *  - Ein Pixel gilt als verschieden, wenn ein Farbkanal um mehr als
 *    `channel` (von 255) abweicht. Kleinere Abweichungen (Kantenglättung)
 *    zählen nicht.
 *  - Ein Bild gilt als gleich, wenn höchstens `share` aller Pixel
 *    verschieden sind (0,0001 = 0,01 %, bei 800 × 550 Pixeln also 44).
 */
export const TOLERANCE = { channel: 32, share: 0.0001 };

/**
 * @typedef {object} Comparison
 * @property {boolean} ok Bild gilt als gleich.
 * @property {boolean} sizeMismatch Größe weicht ab (dann immer `ok = false`).
 * @property {number} different Anzahl verschiedener Pixel.
 * @property {number} allowed Höchstens erlaubte Anzahl.
 * @property {number} total Pixel insgesamt.
 * @property {Rgba | null} diff Unterschiedsbild (Referenz blass, Abweichungen rot) oder `null`.
 */

/**
 * @param {Rgba} reference
 * @param {Rgba} actual
 * @param {{ channel?: number, share?: number }} [tolerance]
 * @returns {Comparison}
 */
export function compareImages(reference, actual, tolerance = {}) {
  const channel = tolerance.channel ?? TOLERANCE.channel;
  const share = tolerance.share ?? TOLERANCE.share;
  const total = actual.width * actual.height;
  const allowed = Math.floor(total * share);
  if (reference.width !== actual.width || reference.height !== actual.height) {
    return { ok: false, sizeMismatch: true, different: total, allowed, total, diff: null };
  }
  const a = reference.data;
  const b = actual.data;
  const out = new Uint8Array(a.length);
  let different = 0;
  for (let i = 0; i < a.length; i += 4) {
    let max = 0;
    for (let c = 0; c < 4; c++) max = Math.max(max, Math.abs((a[i + c] ?? 0) - (b[i + c] ?? 0)));
    if (max > channel) {
      different++;
      out[i] = 230;
      out[i + 1] = 0;
      out[i + 2] = 40;
    } else {
      const gray = 0.299 * (a[i] ?? 0) + 0.587 * (a[i + 1] ?? 0) + 0.114 * (a[i + 2] ?? 0);
      const faded = Math.round(200 + gray * 0.2);
      out[i] = faded;
      out[i + 1] = faded;
      out[i + 2] = faded;
    }
    out[i + 3] = 255;
  }
  return {
    ok: different <= allowed,
    sizeMismatch: false,
    different,
    allowed,
    total,
    diff: { width: actual.width, height: actual.height, data: out },
  };
}
