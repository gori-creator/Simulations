// Klickt auf jeder Seite alle Beispiele durch und meldet Konsolenfehler und kaputte Anzeigen (NaN, undefined …).
// Vorher: npm run build && npx astro preview --port 4330
// Aufruf: node scripts/agenten/beispiele-pruefen.cjs <urls.txt> <ergebnis.json>  (urls.txt: je Zeile ein Pfad, z. B. /de/physik/...)
// Erwartet: "done <n> issues 0".
const { chromium } = require('playwright');
const fs = require('fs');
const [list, out] = process.argv.slice(2);
const urls = fs.readFileSync(list, 'utf8').trim().split('\n');
(async () => {
  const b = await chromium.launch(); const res = []; let idx = 0;
  async function worker() {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
    while (idx < urls.length) {
      const u = urls[idx++]; const p = await ctx.newPage(); const errs = [];
      p.on('pageerror', (e) => errs.push('PAGEERR ' + e.message.slice(0, 160)));
      p.on('console', (m) => { if (m.type() === 'error') errs.push('ERR ' + m.text().slice(0, 160)); });
      try {
        await p.goto('http://localhost:4330' + u, { waitUntil: 'load', timeout: 30000 });
        await p.waitForTimeout(800);
        const n = await p.evaluate(() => document.querySelectorAll('.preset').length);
        for (let i = n - 1; i >= 0; i--) {
          const lab = await p.evaluate((i) => { const b = document.querySelectorAll('.preset')[i]; b.click(); return b.textContent; }, i);
          await p.waitForTimeout(350);
          const bad = await p.evaluate(() => [...document.querySelectorAll('.readout__value')].map((e) => e.textContent || '').filter((t) => /NaN|undefined|Infinity|\[object|null/.test(t)));
          if (bad.length) errs.push(`READOUT preset "${lab}": ${bad.join(' | ').slice(0, 160)}`);
        }
        // Wiedergabe kurz starten
        const play = await p.$('[data-action="play"]:not([hidden])');
        if (play && await play.isVisible()) { await play.click(); await p.waitForTimeout(1500); await play.click(); }
      } catch (e) { errs.push('NAV ' + e.message.slice(0, 120)); }
      if (errs.length) res.push({ u, errs: [...new Set(errs)] });
      await p.close();
    }
    await ctx.close();
  }
  await Promise.all(Array.from({ length: 6 }, worker));
  fs.writeFileSync(out, JSON.stringify(res, null, 1));
  console.log('done', urls.length, 'issues', res.length);
  await b.close();
})();
