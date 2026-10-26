// @ts-check
/**
 * Automatische Bildtests (Anleitung: docs/BILDTESTS.md).
 *
 * Fotografiert die Zeichenfläche jeder Simulation in der Startansicht, hell und
 * dunkel, und vergleicht mit den Referenzbildern in tests/bildtests/referenz/.
 *
 *   node scripts/bildtests.mjs              vergleichen (Build in dist/ nötig)
 *   node scripts/bildtests.mjs --erneuern   Referenzbilder neu schreiben
 *   node scripts/bildtests.mjs ohm stamm    nur Simulationen, deren ID das enthält
 *
 * Die Referenzbilder entstehen im Playwright-Container von GitHub Actions
 * (.github/workflows/bildtests.yml). Andere Rechner haben andere Systemschriften;
 * dort erzeugte Bilder weichen deshalb ab und taugen nur zum Vergleich mit sich selbst.
 *
 * Damit die Bilder bei jedem Lauf gleich sind, läuft die Seite mit „reduzierter
 * Bewegung“ (Animationen stehen still), die Uhr ist angehalten und wird nur um
 * feste Schritte vorgestellt, und Math.random liefert immer dieselbe Folge.
 *
 * Ergebnisse (bei Abweichungen neues Bild und Unterschiedsbild) landen in
 * bildtests-ergebnis/.
 */
import { createReadStream, existsSync } from 'node:fs';
import { mkdir, readdir, readFile, rm, stat, writeFile, appendFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { decodePng, encodePng } from './bildtests/png.mjs';
import { compareImages, TOLERANCE } from './bildtests/vergleich.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.resolve(ROOT, process.env.BILDTESTS_DIST ?? 'dist');
const REFERENCE_DIR = path.join(ROOT, 'tests/bildtests/referenz');
const RESULT_DIR = path.join(ROOT, 'bildtests-ergebnis');

/** Ansicht: Breite wie ein üblicher Schul-Laptop, Pixeldichte 1 (kleine Dateien). */
const VIEWPORT = { width: 1280, height: 900 };
const SCHEMES = /** @type {const} */ ([
  ['hell', 'light'],
  ['dunkel', 'dark'],
]);
/** Feste Startzeit und wie lange die (künstliche) Uhr nach dem Laden läuft. */
const START_TIME = new Date('2026-01-05T09:00:00+01:00');
const SETTLE_MS = 3000;
const PARALLEL = Math.max(1, Number(process.env.BILDTESTS_PARALLEL) || 4);

const args = process.argv.slice(2);
const renew = args.includes('--erneuern');
const filters = args.filter((a) => !a.startsWith('--'));

const MIME = /** @type {Record<string, string>} */ ({
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.webmanifest': 'application/manifest+json',
});

/** Kleiner Webserver für dist/ (Ordner → index.html). */
function serve() {
  const server = createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost');
    let file = path.join(DIST, decodeURIComponent(url.pathname));
    if (!file.startsWith(DIST)) file = DIST;
    try {
      if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
      await stat(file);
      res.writeHead(200, { 'content-type': MIME[path.extname(file)] ?? 'application/octet-stream' });
      createReadStream(file).pipe(res);
    } catch {
      res.writeHead(404, { 'content-type': 'text/plain' }).end('404');
    }
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      resolve({ server, port: typeof address === 'object' && address ? address.port : 0 });
    });
  });
}

/** @param {string} dir @returns {Promise<string[]>} */
async function htmlFiles(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await htmlFiles(full)));
    else if (entry.name === 'index.html') out.push(full);
  }
  return out;
}

/** Alle Simulationsseiten (deutsch) mit ihrer ID. */
async function findSimulations() {
  /** @type {Map<string, string>} */
  const sims = new Map();
  for (const file of await htmlFiles(path.join(DIST, 'de'))) {
    const match = /data-sim-id="([^"]+)"/.exec(await readFile(file, 'utf8'));
    if (!match?.[1]) continue;
    const url = '/' + path.relative(DIST, path.dirname(file)).split(path.sep).join('/') + '/';
    if (sims.has(match[1])) throw new Error(`Simulation ${match[1]} kommt doppelt vor (${url})`);
    sims.set(match[1], url);
  }
  return [...sims].sort(([a], [b]) => a.localeCompare(b));
}

/** Playwright laden: aus dem Projekt bzw. Container, sonst global (NODE_PATH). */
function loadPlaywright() {
  const require = createRequire(import.meta.url);
  try {
    return require('playwright');
  } catch {
    throw new Error('Playwright fehlt. Installieren mit: npm install --no-save playwright (siehe docs/BILDTESTS.md)');
  }
}

/** Fester Zufall (mulberry32), vor allen Skripten der Seite eingesetzt. */
function seededRandom() {
  let seed = 20260105;
  Math.random = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Fotografiert die Zeichenfläche einer Simulation.
 * @param {any} browser @param {number} port @param {string} url @param {'light' | 'dark'} scheme
 * @returns {Promise<{ png: Buffer, errors: string[] }>}
 */
async function shoot(browser, port, url, scheme) {
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
    colorScheme: scheme,
    // „Reduzierte Bewegung“: Dauer-Animationen (Wellen, Teilchen …) stehen still,
    // Übergänge springen ans Ende – die Startansicht ist so bei jedem Lauf gleich.
    reducedMotion: 'reduce',
    locale: 'de-DE',
    timezoneId: 'Europe/Berlin',
    serviceWorkers: 'block',
  });
  const page = await context.newPage();
  /** @type {string[]} */
  const errors = [];
  page.on('pageerror', (/** @type {Error} */ e) => errors.push(e.message));
  try {
    await page.addInitScript(seededRandom);
    // Uhr anhalten: Sie läuft nur, wenn das Skript sie vorstellt.
    await page.clock.install({ time: START_TIME });
    await page.clock.pauseAt(new Date(START_TIME.getTime() + 1000));
    await page.goto(`http://127.0.0.1:${port}${url}`, { waitUntil: 'load' });
    // Erst warten, bis die Simulation geladen ist (der Ladehinweis verschwindet)
    // und Bilder und Schriften da sind; die Uhr steht so lange still. Danach
    // die Uhr vorstellen, damit Übergänge sicher fertig sind.
    const loading = () => page.evaluate(() => !!document.querySelector('[data-sim-status]:not(.sim__status--error)'));
    for (let waited = 0; await loading(); waited += 50) {
      if (waited > 20000) throw new Error('Simulation lädt nicht');
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => document.fonts.ready.then(() => undefined));
    await page.clock.runFor(SETTLE_MS);
    const stage = page.locator('[data-sim-stage]').first();
    await stage.scrollIntoViewIfNeeded();
    await page.clock.runFor(100);
    const png = await stage.screenshot({ animations: 'disabled', caret: 'hide' });
    return { png, errors };
  } finally {
    await context.close();
  }
}

/** @param {string} line */
async function summary(line) {
  console.log(line);
  if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, line + '\n');
}

async function main() {
  if (!existsSync(path.join(DIST, 'de'))) throw new Error('Kein Build gefunden – zuerst „npm run build“ ausführen.');
  const all = await findSimulations();
  const sims = filters.length ? all.filter(([id]) => filters.some((f) => id.includes(f))) : all;
  if (!sims.length) throw new Error('Keine passende Simulation gefunden.');

  await rm(RESULT_DIR, { recursive: true, force: true });
  await mkdir(path.join(RESULT_DIR, 'neu'), { recursive: true });
  await mkdir(path.join(RESULT_DIR, 'unterschied'), { recursive: true });
  await mkdir(REFERENCE_DIR, { recursive: true });

  const { chromium } = loadPlaywright();
  const browser = await chromium.launch(
    process.env.BILDTESTS_CHROMIUM ? { executablePath: process.env.BILDTESTS_CHROMIUM } : {},
  );
  const { server, port } = /** @type {{ server: import('node:http').Server, port: number }} */ (await serve());

  /** @type {{ name: string, problem: string }[]} */
  const failures = [];
  const jobs = sims.flatMap(([id, url]) => SCHEMES.map(([label, scheme]) => ({ name: `${id}-${label}`, url, scheme })));
  /** Größte Abweichung unter den als gleich gewerteten Bildern (zum Einschätzen der Toleranz). */
  let largest = { name: '', different: 0, total: 1 };
  let done = 0;
  const started = Date.now();

  async function worker() {
    for (let job = jobs.shift(); job; job = jobs.shift()) {
      const file = path.join(REFERENCE_DIR, `${job.name}.png`);
      try {
        const { png, errors } = await shoot(browser, port, job.url, job.scheme);
        if (errors.length) failures.push({ name: job.name, problem: `Fehler auf der Seite: ${errors.join(' | ')}` });
        if (renew) {
          // Nur überschreiben, wenn sich wirklich etwas geändert hat: Rundungsrauschen
          // (±1–2 in einzelnen Pixeln, z. B. in Fotos) erzeugt sonst unnötige Commits.
          const same =
            existsSync(file) &&
            compareImages(decodePng(await readFile(file)), decodePng(png), { channel: 2, share: 0 }).ok;
          if (!same) await writeFile(file, png);
        } else if (!existsSync(file)) {
          await writeFile(path.join(RESULT_DIR, 'neu', `${job.name}.png`), png);
          failures.push({ name: job.name, problem: 'Referenzbild fehlt' });
        } else {
          const result = compareImages(decodePng(await readFile(file)), decodePng(png));
          if (result.ok && result.different > largest.different) largest = { name: job.name, ...result };
          if (!result.ok) {
            await writeFile(path.join(RESULT_DIR, 'neu', `${job.name}.png`), png);
            if (result.diff) await writeFile(path.join(RESULT_DIR, 'unterschied', `${job.name}.png`), encodePng(result.diff));
            failures.push({
              name: job.name,
              problem: result.sizeMismatch
                ? 'Bildgröße weicht ab'
                : `${result.different} Pixel verschieden (erlaubt ${result.allowed} von ${result.total})`,
            });
          }
        }
      } catch (error) {
        failures.push({ name: job.name, problem: `Abbruch: ${error instanceof Error ? error.message : String(error)}` });
      }
      done++;
      if (done % 20 === 0) console.log(`… ${done} Bilder`);
    }
  }
  await Promise.all(Array.from({ length: PARALLEL }, worker));
  await browser.close();
  server.close();

  // Referenzbilder von Simulationen, die es nicht mehr gibt
  const expected = new Set(all.flatMap(([id]) => SCHEMES.map(([label]) => `${id}-${label}.png`)));
  const stale = (await readdir(REFERENCE_DIR)).filter((f) => f.endsWith('.png') && !expected.has(f));
  if (renew && !filters.length) for (const f of stale) await rm(path.join(REFERENCE_DIR, f));

  const seconds = Math.round((Date.now() - started) / 1000);
  const count = sims.length * SCHEMES.length;
  await summary(`## Bildtests\n`);
  if (renew) {
    await summary(`${count} Referenzbilder erneuert (${seconds} s).` + (stale.length && !filters.length ? ` ${stale.length} veraltete entfernt.` : ''));
  } else {
    await summary(
      `${count} Bilder verglichen (${seconds} s), Toleranz: Kanal > ${TOLERANCE.channel}, höchstens ${String(TOLERANCE.share * 100).replace('.', ',')} % der Pixel.`,
    );
    if (largest.different) {
      const percent = ((largest.different / largest.total) * 100).toFixed(3).replace('.', ',');
      await summary(`Größte Abweichung innerhalb der Toleranz: ${largest.name}, ${largest.different} Pixel (${percent} %).`);
    }
    if (stale.length && !filters.length) await summary(`\nHinweis: Referenzbilder ohne Simulation: ${stale.join(', ')}`);
  }
  if (failures.length) {
    failures.sort((a, b) => a.name.localeCompare(b.name));
    await summary(`\n**${failures.length} Abweichungen** – neue Bilder und Unterschiedsbilder im Ordner bildtests-ergebnis/ (in GitHub: Artefakt „bildtests-ergebnis“).\n`);
    await summary('| Bild | Befund |\n|---|---|');
    for (const f of failures) await summary(`| ${f.name} | ${f.problem.replace(/\|/g, '/')} |`);
    await summary('\nGewollte Änderung? Referenzbilder erneuern, siehe docs/BILDTESTS.md.');
    process.exitCode = 1;
  } else if (!renew) {
    await summary('\nKeine Abweichungen.');
  }
  await writeFile(
    path.join(RESULT_DIR, 'bericht.txt'),
    failures.length ? failures.map((f) => `${f.name}: ${f.problem}`).join('\n') + '\n' : 'Keine Abweichungen.\n',
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
