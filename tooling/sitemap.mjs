// @ts-check
/**
 * Astro-Integration: erzeugt nach dem Build `sitemap.xml` und `robots.txt`.
 *
 * Aufgenommen wird jede Seite mit `<link rel="canonical">` (also alle außer
 * Fehlerseite und Sprachweiche). Die Sprachfassungen stehen als hreflang-Paare
 * in der Sitemap, damit Suchmaschinen DE und EN einander zuordnen.
 *
 * Nur der Build für die Hauptadresse (SITE.url, https://scitura.de) bekommt
 * eine Sitemap und den Verweis darauf in der robots.txt. Kopien (GitHub Pages,
 * lokale Builds) tragen auf jeder Seite noindex (BaseLayout.astro); ihre
 * robots.txt erlaubt das Lesen, damit Suchmaschinen dieses noindex sehen.
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PRIMARY = 'https://scitura.de';

/** @param {string} dir @returns {Promise<string[]>} */
async function htmlFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  /** @type {string[]} */
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await htmlFiles(full)));
    else if (entry.name.endsWith('.html')) files.push(full);
  }
  return files;
}

/** @param {string} s */
const xml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Seite → kanonische Adresse und Sprachfassungen (aus dem fertigen HTML). @param {string} html */
export function pageLinks(html) {
  if (/<meta name="robots" content="noindex"/.test(html)) return null;
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  if (!canonical) return null;
  const alternates = [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map((m) => ({ lang: m[1] ?? '', href: m[2] ?? '' }));
  return { canonical, alternates };
}

/** @param {{ canonical: string, alternates: { lang: string, href: string }[] }[]} pages */
export function sitemapXml(pages) {
  const urls = pages
    .sort((a, b) => a.canonical.localeCompare(b.canonical))
    .map(({ canonical, alternates }) =>
      [`  <url>`, `    <loc>${xml(canonical)}</loc>`, ...alternates.map((a) => `    <xhtml:link rel="alternate" hreflang="${xml(a.lang)}" href="${xml(a.href)}"/>`), `  </url>`].join('\n'),
    );
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`;
}

/** @returns {import('astro').AstroIntegration} */
export default function sitemap() {
  /** @type {URL | undefined} */
  let site;
  return {
    name: 'scitura-sitemap',
    hooks: {
      'astro:config:done': ({ config }) => {
        site = config.site ? new URL(config.site) : undefined;
      },
      'astro:build:done': async ({ dir, logger }) => {
        const out = fileURLToPath(dir);
        const primary = site?.origin === PRIMARY;
        if (!primary) {
          await writeFile(path.join(out, 'robots.txt'), 'User-agent: *\nAllow: /\n');
          logger.info(`keine Sitemap (Adresse ${site?.origin ?? '–'} ist nicht ${PRIMARY}; Seiten tragen noindex)`);
          return;
        }
        const pages = [];
        for (const file of await htmlFiles(out)) {
          const links = pageLinks(await readFile(file, 'utf8'));
          if (links) pages.push(links);
        }
        await writeFile(path.join(out, 'sitemap.xml'), sitemapXml(pages));
        await writeFile(path.join(out, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${PRIMARY}/sitemap.xml\n`);
        logger.info(`sitemap.xml mit ${pages.length} Seiten erzeugt`);
      },
    },
  };
}
