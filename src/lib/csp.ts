import { createHash } from 'node:crypto';

/**
 * Content-Security-Policy: Prüfsumme (SHA-256) für Inline-Skripte und
 * Inline-Styles, die Astro nicht selbst verarbeitet (`is:inline`). Der Text
 * muss Zeichen für Zeichen dem entsprechen, was im HTML steht – deshalb
 * werden diese Skripte als fertige Zeichenkette mit `set:html` ausgegeben.
 * Läuft nur beim Bauen.
 */
export function cspHash(source: string): `sha256-${string}` {
  return `sha256-${createHash('sha256').update(source, 'utf8').digest('base64')}`;
}
