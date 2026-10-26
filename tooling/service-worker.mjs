// @ts-check
/**
 * Astro-Integration: erzeugt nach dem Build eine `sw.js` für die Offline-Nutzung.
 * Im Klassenraum ohne (stabiles) WLAN funktionieren alle Seiten und
 * Simulationen, die auf dem Gerät schon einmal geöffnet wurden.
 *
 * Ladezeit (Schulnetze): Vorab gespeichert wird nur ein kleiner Kern (Styles,
 * Website-Symbol, Fehlerseite). Früher lud jedes Gerät beim ersten Besuch
 * die ganze Seite (rund 70 MB) im Hintergrund – bei einer Klasse mit 30
 * Geräten mehrere Gigabyte. Alles andere wird beim ersten Abruf gespeichert.
 *
 * Strategie:
 *  - Seitenaufrufe (HTML): zuerst Netzwerk, bei Ausfall der Cache
 *    (Query-Parameter wie ?m=2 werden ignoriert, sie steuern nur die Simulation).
 *  - Alles andere (JS, CSS, Schriften, Bilder): zuerst Cache, sonst Netzwerk.
 *  - Abgerufene Dateien liegen in einem dauerhaften Cache, damit besuchte
 *    Seiten auch nach einer neuen Version offline bleiben. Dateien, die es in
 *    der aktuellen Version nicht mehr gibt, werden nach 30 Tagen entfernt.
 */
import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const EXCLUDE = [/^sw\.js$/, /\.map$/];
// Kern, der beim Einrichten vorab gespeichert wird (klein, auf jeder Seite gebraucht).
// Formel-Schriften und Symbole folgen beim ersten Abruf.
const CORE = [/\.css$/, /^favicon\.svg$/, /^manifest\.webmanifest$/, /^404\.html$/];

/** @param {string} dir @param {string} [prefix] @returns {Promise<string[]>} */
async function walk(dir, prefix = '') {
  const entries = await readdir(dir, { withFileTypes: true });
  /** @type {string[]} */
  const files = [];
  for (const entry of entries) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) files.push(...(await walk(path.join(dir, entry.name), rel)));
    else files.push(rel);
  }
  return files.sort();
}

/** @param {string} file */
function toUrl(file) {
  if (file === 'index.html') return './';
  if (file.endsWith('/index.html')) return file.slice(0, -'index.html'.length);
  return file;
}

/** @param {string} version @param {string[]} core @param {string[]} files */
function template(version, core, files) {
  return `/* Automatisch erzeugt von tooling/service-worker.mjs – nicht von Hand bearbeiten. */
const CACHE_PREFIX = 'mint-sim-';
const CACHE = CACHE_PREFIX + ${JSON.stringify(version)};
const RUNTIME = CACHE_PREFIX + 'runtime';
const PRECACHE = ${JSON.stringify(core)};
const FILES = new Set(${JSON.stringify(files)});
const MAX_AGE = 30 * 24 * 3600 * 1000;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) =>
        Promise.allSettled(PRECACHE.map((url) => cache.add(new URL(url, self.registration.scope)))),
      )
      .then(() => self.skipWaiting()),
  );
});

/** Entfernt Dateien, die es in dieser Version nicht mehr gibt und die älter als 30 Tage sind. */
function pruneRuntime() {
  const scope = self.registration.scope;
  return caches.open(RUNTIME).then((cache) =>
    cache.keys().then((requests) =>
      Promise.all(
        requests.map((request) => {
          const rel = request.url.startsWith(scope) ? request.url.slice(scope.length).split(/[?#]/)[0] || './' : '';
          if (FILES.has(rel)) return undefined;
          return cache.match(request).then((response) => {
            const date = Date.parse((response && response.headers.get('date')) || '');
            if (!date || Date.now() - date > MAX_AGE) return cache.delete(request);
            return undefined;
          });
        }),
      ),
    ),
  );
}

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE && key !== RUNTIME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(pruneRuntime)
      .catch(() => {})
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(RUNTIME).then((cache) => cache.put(url.origin + url.pathname, copy));
          }
          return response;
        })
        .catch(() =>
          caches
            .match(url.origin + url.pathname)
            .then((cached) => cached || caches.match(new URL('404.html', self.registration.scope))),
        ),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          if (response.ok && response.type === 'basic') {
            const copy = response.clone();
            caches.open(RUNTIME).then((cache) => cache.put(request, copy));
          }
          return response;
        }),
    ),
  );
});
`;
}

/** @returns {import('astro').AstroIntegration} */
export default function serviceWorker() {
  return {
    name: 'mint-service-worker',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        const files = (await walk(root)).filter((f) => !EXCLUDE.some((re) => re.test(f)));
        const hash = createHash('sha256');
        for (const file of files) {
          hash.update(file);
          hash.update(await readFile(path.join(root, file)));
        }
        const version = hash.digest('hex').slice(0, 12);
        const core = files.filter((f) => CORE.some((re) => re.test(f))).map(toUrl);
        await writeFile(path.join(root, 'sw.js'), template(version, core, files.map(toUrl)));
        logger.info(`sw.js erzeugt (${core.length} von ${files.length} Dateien vorab, Version ${version})`);
      },
    },
  };
}
