// @ts-check
/**
 * Astro-Integration: erzeugt nach dem Build eine `sw.js`, die alle Dateien der
 * Seite vorab zwischenspeichert. So funktionieren die Simulationen auch im
 * Klassenraum ohne (stabiles) WLAN, sobald die Seite einmal geöffnet wurde.
 *
 * Strategie:
 *  - Seitenaufrufe (HTML): zuerst Netzwerk, bei Ausfall der Cache
 *    (Query-Parameter wie ?m=2 werden ignoriert, sie steuern nur die Simulation).
 *  - Alles andere (JS, CSS, Schriften, Bilder): zuerst Cache, sonst Netzwerk.
 */
import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Ältere Schriftformate (ttf/woff) nicht vorab laden – alle aktuellen Browser nutzen woff2.
const EXCLUDE = [/^sw\.js$/, /\.map$/, /\.ttf$/, /\.woff$/];

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

/** @param {string} version @param {string[]} urls */
function template(version, urls) {
  return `/* Automatisch erzeugt von tooling/service-worker.mjs – nicht von Hand bearbeiten. */
const CACHE_PREFIX = 'mint-sim-';
const CACHE = CACHE_PREFIX + ${JSON.stringify(version)};
const PRECACHE = ${JSON.stringify(urls)};

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

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE).map((key) => caches.delete(key)),
        ),
      )
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
            caches.open(CACHE).then((cache) => cache.put(url.origin + url.pathname, copy));
          }
          return response;
        })
        .catch(() =>
          caches
            .match(request, { ignoreSearch: true })
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
            caches.open(CACHE).then((cache) => cache.put(request, copy));
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
        const urls = files.map(toUrl);
        await writeFile(path.join(root, 'sw.js'), template(version, urls));
        logger.info(`sw.js erzeugt (${urls.length} Dateien, Version ${version})`);
      },
    },
  };
}
