// Screenshots und Fehlerprüfung für Simulationsseiten.
// Aufruf: node simshot.cjs <port> <ausgabeordner> <specs.json> [namensfilter...]
// specs.json: [["name", "/de/.../?a=1", 1360, "light"|"dark", [["action","id"],["wait",ms],["play"],["click",x,y],["drag",x1,y1,x2,y2]]], ...]
// Koordinaten bei click/drag relativ zur Zeichenfläche (canvas) in CSS-Pixeln.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs');
const path = require('path');
const [port, outDir, specFile, ...only] = process.argv.slice(2);
const specs = JSON.parse(fs.readFileSync(specFile, 'utf8'));
fs.mkdirSync(outDir, { recursive: true });
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  for (const [name, url, width, scheme, steps = []] of specs) {
    if (only.length && !only.some((o) => name.startsWith(o))) continue;
    const ctx = await browser.newContext({ viewport: { width, height: 1000 }, colorScheme: scheme, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
    page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
    await page.goto(`http://localhost:${port}${url}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    const canvas = page.locator('[data-sim-root] canvas').first();
    for (const step of steps) {
      if (step[0] === 'action') {
        const b = page.locator(`[data-sim-action="${step[1]}"]:not([disabled])`);
        if (await b.count()) await b.first().click(); else errors.push('no action ' + step[1]);
      } else if (step[0] === 'play') await page.locator('[data-action="play"]').click();
      else if (step[0] === 'wait') await page.waitForTimeout(step[1]);
      else if (step[0] === 'click' || step[0] === 'drag') {
        const box = await canvas.boundingBox();
        if (!box) { errors.push('no canvas'); continue; }
        await page.mouse.move(box.x + step[1], box.y + step[2]);
        if (step[0] === 'click') { await page.mouse.down(); await page.mouse.up(); }
        else { await page.mouse.down(); await page.mouse.move(box.x + step[3], box.y + step[4], { steps: 12 }); await page.mouse.up(); }
      }
    }
    await page.locator('[data-sim-root]').screenshot({ path: path.join(outDir, name + '.png') });
    const readouts = await page.locator('[data-sim-readouts]').innerText().catch(() => '');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (overflow > 0) errors.push(`horizontal overflow ${overflow}px`);
    console.log(`== ${name}: ${errors.length ? errors.join(' | ') : 'ok'}\n   ${readouts.replace(/\n+/g, ' ¦ ').slice(0, 400)}`);
    await ctx.close();
  }
  await browser.close();
})();
