// @ts-check
import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import { katexMarkdownPlugin } from './tooling/katex-markdown.mjs';
import serviceWorker from './tooling/service-worker.mjs';

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
    processor: satteri({
      features: { math: true },
      mdastPlugins: [katexMarkdownPlugin],
    }),
  },
  integrations: [serviceWorker()],
  devToolbar: {
    enabled: false,
  },
});
