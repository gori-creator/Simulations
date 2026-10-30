// @ts-check
import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import { katexMarkdownPlugin } from './tooling/katex-markdown.mjs';
import serviceWorker from './tooling/service-worker.mjs';
import { taskLayoutPlugin } from './tooling/task-layout.mjs';

/**
 * SITE_URL und BASE_PATH werden beim Deployment gesetzt (siehe
 * .github/workflows/deploy.yml). Lokal läuft die Seite unter "/".
 */
const site = process.env.SITE_URL || 'http://localhost:4321';
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  markdown: {
    // Keine Code-Blöcke im Lernmaterial; Shiki würde Inline-Styles erzeugen (CSP).
    syntaxHighlight: false,
    processor: satteri({
      features: { math: true },
      mdastPlugins: [katexMarkdownPlugin],
      hastPlugins: [taskLayoutPlugin],
    }),
  },
  integrations: [serviceWorker()],
  /**
   * Content-Security-Policy als <meta>-Tag auf jeder Seite (nur im Build, nicht
   * im Dev-Server): Skripte, Styles, Bilder, Schriften usw. nur von der eigenen
   * Seite, keine fremden Quellen (`data:` nur für eingebettete Bilder und die
   * kleinen KaTeX-Schriften, `blob:` für den Bild-Export). Astro ergänzt die
   * Prüfsummen seiner eigenen Skripte/Styles; die Inline-Skripte im Layout
   * melden ihre Prüfsumme selbst (src/lib/csp.ts). `style`-Attribute (Formeln,
   * Kartenlayout) bleiben erlaubt, <style>-Elemente nur über Prüfsumme.
   */
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data: blob:",
        "font-src 'self' data:",
        "connect-src 'self'",
        "media-src 'self'",
        "worker-src 'self'",
        "manifest-src 'self'",
        "object-src 'none'",
        "frame-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ],
      scriptDirective: {
        resources: ["'self'"],
      },
      styleDirective: {
        resources: [
          { resource: "'self'", kind: 'element' },
          { resource: "'unsafe-inline'", kind: 'attribute' },
        ],
      },
    },
  },
  devToolbar: {
    enabled: false,
  },
});
