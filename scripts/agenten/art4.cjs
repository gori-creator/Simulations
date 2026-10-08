const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const pages = process.argv.slice(2);
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  for (const p of pages) {
    const page = await b.newPage({ viewport: { width: 1280, height: 900 } });
    const errs = [];
    page.on('pageerror', (e) => errs.push(e.message));
    page.on('requestfailed', (r) => errs.push('failed ' + r.url()));
    page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
    await page.goto('http://localhost:4400/' + p, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    const canvas = await page.locator('[data-sim-root] canvas').count();
    console.log(p, 'canvas:', canvas, errs.length ? errs.slice(0, 3).join(' | ') : 'ok');
    await page.close();
  }
  await b.close();
})();
