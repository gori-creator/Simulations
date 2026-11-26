// Screenshots einer Simulation (nur die Zeichenfläche) für die Sichtprüfung.
// Dev-Server vorher starten: npx astro dev --port 4323
// Aufruf: node scripts/agenten/canvas-shot.cjs <ordner> <pfad> "BxH|l/d|query|Knopf1,Knopf2|warte-ms" ...
// l = hell, d = dunkel. Ergebnis: <ordner>/s0.png, s1.png, … (wird überschrieben).
const [out, base, ...qs] = process.argv.slice(2);
(async () => {
  const b = await chromium.launch(); let i = 0;
  for (const q of qs) {
    const [vp, dark, query, click, wait] = q.split('|');
    const [w, h] = vp.split('x').map(Number);
    const ctx = await b.newContext({ viewport: { width: w, height: h } });
    if (dark === 'd') await ctx.addInitScript(() => { try { localStorage.setItem('theme', 'dark'); } catch {} });
    const p = await ctx.newPage();
    p.on('pageerror', (e) => console.log('ERR', i, e.message));
    await p.goto('http://localhost:4323' + base + '?' + (query || ''));
    await p.waitForTimeout(2500);
    if (click) for (const c of click.split(',')) { await p.getByRole('button', { name: c, exact: true }).first().click(); await p.waitForTimeout(Number(process.env.AFTER || 400)); }
    await p.waitForTimeout(Number(wait || 300));
    const c = await p.$('canvas');
    await c.scrollIntoViewIfNeeded();
    await c.screenshot({ path: `${out}/s${i++}.png` });
    await ctx.close();
  }
  await b.close();
})();
