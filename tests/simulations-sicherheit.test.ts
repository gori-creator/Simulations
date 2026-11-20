import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Sicherheitsprüfung für den Code aller Simulationen (offiziell und Community).
 *
 * Seit Scitura Open Source ist, kommen Simulationen auch von außen (Pull
 * Requests). Eine Simulation darf nur rechnen und zeichnen: Sie importiert
 * ausschließlich aus dem Kern (`src/sim-core`) und aus ihrem eigenen Ordner und
 * benutzt keine Schnittstellen, mit denen sie Daten senden, Daten der Seite
 * lesen, Code nachladen oder Besucher wegleiten könnte. Die Prüfung ersetzt
 * nicht den Blick einer Person in den Pull Request (CONTRIBUTING.md), fängt aber
 * die gefährlichen Fälle automatisch ab.
 */

const ROOT = join(__dirname, '..', 'src', 'simulations');

function filesIn(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? filesIn(path) : [path];
  });
}

/** Alle Code-Dateien in Simulationsordnern (src/simulations/<fach>/<id>/…). */
const files = filesIn(ROOT)
  .filter((f) => /\.(ts|js|mjs|tsx|jsx)$/.test(f))
  .filter((f) => relative(ROOT, f).split(/[\\/]/).length >= 3);

/** Verbotene Schnittstellen: Netzwerk, Speicher, Code aus Text, Wegleiten, Geräte. */
const FORBIDDEN: [RegExp, string][] = [
  [/\bfetch\s*\(/, 'fetch (Netzwerk)'],
  [/\bXMLHttpRequest\b/, 'XMLHttpRequest (Netzwerk)'],
  [/\bWebSocket\b|\bEventSource\b|\bRTCPeerConnection\b/, 'WebSocket/EventSource/WebRTC (Netzwerk)'],
  [/\bsendBeacon\b/, 'sendBeacon (Netzwerk)'],
  [/\beval\s*\(|\bnew\s+Function\b/, 'eval / new Function (Code aus Text)'],
  [/\bimportScripts\b|\bnew\s+Worker\b|\bSharedWorker\b|serviceWorker/, 'Worker (fremder Code)'],
  [/document\.cookie|\blocalStorage\b|\bsessionStorage\b|\bindexedDB\b|\bcaches\./, 'Cookies/Speicher der Seite'],
  [/\.innerHTML\b|\.outerHTML\b|insertAdjacentHTML|document\.write/, 'HTML aus Text (innerHTML & Co.)'],
  [/\bwindow\.open\b|\blocation\s*\.\s*(href|assign|replace)\b|\blocation\s*=/, 'Wegleiten (window.open, location)'],
  [/\bpostMessage\b/, 'postMessage'],
  [/navigator\s*\.\s*(geolocation|mediaDevices|clipboard|credentials|bluetooth|usb|serial)/, 'Gerätezugriff (navigator.…)'],
  [/\bdocument\.(querySelector|getElementById|getElementsBy|body|head|documentElement)\b/, 'Zugriff auf die übrige Seite (document.…) – nur ctx benutzen'],
  [/\bimport\s*\(/, 'dynamischer Import'],
];

/** Erlaubte Importe: Kern und eigener Ordner (auch Unterordner). */
function allowedImport(spec: string): boolean {
  if (spec.startsWith('./')) return !spec.includes('..');
  return /^\.\.\/\.\.\/\.\.\/sim-core(\/[\w-]+)?$/.test(spec);
}

/** Kommentare entfernen, damit Erklärtexte wie „kein fetch()“ nicht stören. */
function stripComments(code: string): string {
  return code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');
}

describe('Sicherheit der Simulationen', () => {
  it('findet Simulationsdateien', () => {
    expect(files.length).toBeGreaterThan(50);
  });

  it.each(files.map((f) => [relative(ROOT, f), f]))('%s importiert nur aus sim-core und dem eigenen Ordner', (_, file) => {
    const code = stripComments(readFileSync(file, 'utf8'));
    const specs = [...code.matchAll(/^\s*(?:import|export)\b[^'"`;]*?from\s*['"]([^'"]+)['"]/gm), ...code.matchAll(/^\s*import\s*['"]([^'"]+)['"]/gm)].map((m) => m[1]!);
    const bad = specs.filter((s) => !allowedImport(s));
    expect(bad, `Nicht erlaubte Importe: ${bad.join(', ')}`).toEqual([]);
  });

  it.each(files.map((f) => [relative(ROOT, f), f]))('%s benutzt keine verbotenen Schnittstellen', (_, file) => {
    const code = stripComments(readFileSync(file, 'utf8'));
    const hits = FORBIDDEN.filter(([re]) => re.test(code)).map(([, why]) => why);
    expect(hits, `Verboten: ${hits.join('; ')}`).toEqual([]);
  });
});
