// Prüfbogen für die große Prüfrunde: alle Geräte, hell/dunkel, Beamer, reduzierte Bewegung, Tastatur, Überlauf.
// Aufruf: node scripts/agenten/pruefbogen.cjs <port> <ausgabeordner> <adresse> [name]
//   z. B. node scripts/agenten/pruefbogen.cjs 4321 /tmp/boegen /de/mathematik/analysis/newton-verfahren/ newton-verfahren
// Ergebnis: <ausgabeordner>/<name>.png (ein Bogen mit allen Ansichten) und <name>.json (Befunde).
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const [port, outDir, url, nameArg] = process.argv.slice(2);
if (!port || !outDir || !url) {
  console.error('Aufruf: node pruefbogen.cjs <port> <ausgabeordner> <adresse> [name]');
  process.exit(1);
}
const name = nameArg || url.split('/').filter(Boolean).pop();
const base = `http://localhost:${port}`;

// Geräte: Breite, Höhe, Touch
const DEVICES = [
  ['handy-klein', 360, 740, true],
  ['handy-gross', 414, 896, true],
  ['ipad-hoch', 768, 1024, true],
  ['ipad-quer', 1024, 768, true],
  ['laptop', 1440, 900, false],
  ['gross-1920', 1920, 1080, false],
];

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const tmp = fs.mkdtempSync(path.join(outDir, `.${name}-`));
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const report = { name, url, shots: [], consoleErrors: [], overflow: [], reducedMotionStill: null, reducedMotionPlay: null, reducedMotionActions: [], unnamedControls: [], tabOrder: [] };

  const open = async (w, h, scheme, opts = {}) => {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: scheme, hasTouch: !!opts.touch, isMobile: !!opts.touch && w < 700, reducedMotion: opts.reduced ? 'reduce' : 'no-preference' });
    const page = await ctx.newPage();
    page.on('console', (m) => { if (m.type() === 'error' && !/403|Failed to load resource/.test(m.text())) report.consoleErrors.push(m.text().slice(0, 200)); });
    page.on('pageerror', (e) => report.consoleErrors.push('Skriptfehler: ' + e.message.slice(0, 200)));
    await page.goto(base + url, { waitUntil: 'networkidle' });
    // Mitlaufende Kopfleiste nicht über die Simulation legen, Schreibmarken nicht blinken lassen
    await page.addStyleTag({ content: 'header, .site-header { position: static !important; } * { caret-color: transparent !important; }' });
    await page.locator('[data-sim-root]').first().scrollIntoViewIfNeeded().catch(() => {});
    await page.waitForTimeout(1200);
    return { ctx, page };
  };

  // 1. Geräte × hell/dunkel
  for (const [dev, w, h, touch] of DEVICES) {
    for (const scheme of ['light', 'dark']) {
      const { ctx, page } = await open(w, h, scheme, { touch });
      const file = path.join(tmp, `${dev}-${scheme}.png`);
      const root = page.locator('[data-sim-root]').first();
      await root.screenshot({ path: file }).catch(() => page.screenshot({ path: file }));
      const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      if (over > 1) report.overflow.push(`${dev}: Seite ${over} px zu breit`);
      report.shots.push({ label: `${dev} ${w}×${h} ${scheme === 'light' ? 'hell' : 'dunkel'}`, file });
      await ctx.close();
    }
  }

  // 2. Beamer: 1280×720 im Vollbild-Modus der Simulation (falls vorhanden)
  {
    const { ctx, page } = await open(1280, 720, 'light');
    const fsBtn = page.locator('[data-action="fullscreen"]').first();
    if (await fsBtn.count()) { await fsBtn.click().catch(() => {}); await page.waitForTimeout(800); }
    const file = path.join(tmp, 'beamer.png');
    await page.screenshot({ path: file });
    report.shots.push({ label: 'Beamer 1280×720 (Vollbild)', file });
    await ctx.close();
  }

  // 3. Reduzierte Bewegung: zwei Fotos im Abstand von 1,5 s müssen gleich sein (Startzustand)
  {
    const { ctx, page } = await open(1360, 900, 'light', { reduced: true });
    const root = page.locator('[data-sim-root]').first();
    const box = await root.boundingBox();
    const clip = box ? { x: box.x, y: box.y, width: box.width, height: Math.min(box.height, 900) } : undefined;
    const a = await page.screenshot({ clip });
    await page.waitForTimeout(1500);
    const b = await page.screenshot({ clip });
    report.reducedMotionStill = Buffer.compare(a, b) === 0;
    if (!report.reducedMotionStill) {
      fs.writeFileSync(path.join(outDir, `${name}-bewegung-a.png`), a);
      fs.writeFileSync(path.join(outDir, `${name}-bewegung-b.png`), b);
    }
    const still = async (label) => {
      const x = await page.screenshot({ clip });
      await page.waitForTimeout(1500);
      const y = await page.screenshot({ clip });
      const same = Buffer.compare(x, y) === 0;
      if (!same) {
        fs.writeFileSync(path.join(outDir, `${name}-bewegung-${label}-a.png`), x);
        fs.writeFileSync(path.join(outDir, `${name}-bewegung-${label}-b.png`), y);
      }
      return same;
    };
    // 3b. Nach „Start“ läuft die Simulation (gewollt); nach „Anhalten“ muss sie wieder stillstehen
    const play = page.locator('[data-action="play"]').first();
    if (await play.isVisible().catch(() => false)) {
      const before = await page.screenshot({ clip });
      await play.click();
      await page.waitForTimeout(1200);
      const running = await page.screenshot({ clip });
      await play.click();
      await page.waitForTimeout(300);
      report.reducedMotionPlay = { moves: Buffer.compare(before, running) !== 0, stillAfterPause: await still('pause') };
    }
    // 3c. Aktionsknöpfe (z. B. „Würfeln“, „Ziehen“): danach kein Nachlaufen, solange die Uhr nicht läuft
    const actions = page.locator('[data-sim-actions] button:visible');
    const n = Math.min(await actions.count(), 6);
    for (let i = 0; i < n; i++) {
      const btn = actions.nth(i);
      const label = ((await btn.textContent()) || '').trim().slice(0, 40);
      if (!(await btn.isEnabled().catch(() => false))) continue;
      await btn.click().catch(() => {});
      await page.waitForTimeout(400);
      const playing = await page.locator('[data-action="play"][aria-pressed="true"]').count();
      if (playing) continue;
      if (!(await still(`aktion-${i + 1}`))) report.reducedMotionActions.push(label);
    }
    await ctx.close();
  }

  // 4. Tastatur und Beschriftungen
  {
    const { ctx, page } = await open(1360, 900, 'light');
    report.unnamedControls = await page.evaluate(() => {
      const root = document.querySelector('[data-sim-root]');
      if (!root) return ['kein [data-sim-root] gefunden'];
      const out = [];
      root.querySelectorAll('button, input, select, textarea, [role="button"], [role="slider"], [tabindex]:not([tabindex="-1"])').forEach((el) => {
        const id = el.id && root.querySelector(`label[for="${el.id}"]`);
        const name = (el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') || el.getAttribute('title') || (id && id.textContent) || el.closest('label')?.textContent || el.textContent || '').trim();
        if (!name && el.type !== 'hidden') out.push(el.outerHTML.slice(0, 120));
      });
      return out;
    });
    await page.locator('[data-sim-root]').first().focus().catch(() => {});
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press('Tab');
      report.tabOrder.push(await page.evaluate(() => {
        const el = document.activeElement;
        if (!el) return '–';
        const visible = getComputedStyle(el).outlineStyle !== 'none' || getComputedStyle(el).boxShadow !== 'none';
        return `${el.tagName.toLowerCase()} „${(el.getAttribute('aria-label') || el.textContent || el.value || '').trim().slice(0, 40)}“${visible ? '' : ' (kein sichtbarer Fokus?)'}`;
      }));
    }
    await ctx.close();
  }

  // 5. Bogen zusammensetzen
  const cells = report.shots.map((s) => `<figure><img src="data:image/png;base64,${fs.readFileSync(s.file).toString('base64')}"><figcaption>${s.label}</figcaption></figure>`).join('');
  const findings = [
    `Reduzierte Bewegung: ${report.reducedMotionStill ? 'steht still ✓' : 'Bild ändert sich ✗ – <name>-bewegung-a/b.png vergleichen'}`,
    `Reduzierte Bewegung nach Start/Anhalten: ${report.reducedMotionPlay === null ? 'kein Start-Knopf' : `${report.reducedMotionPlay.moves ? 'läuft nach Start' : 'Start ändert nichts (prüfen)'}, ${report.reducedMotionPlay.stillAfterPause ? 'steht nach Anhalten still ✓' : 'bewegt sich nach Anhalten weiter ✗ – <name>-bewegung-pause-a/b.png'}`}`,
    `Reduzierte Bewegung nach Aktionen: ${report.reducedMotionActions.length ? `läuft nach ✗: ${report.reducedMotionActions.join(', ')} (<name>-bewegung-aktion-*.png)` : 'kein Nachlaufen ✓'}`,
    `Konsolenfehler: ${report.consoleErrors.length ? report.consoleErrors.join(' | ') : 'keine ✓'}`,
    `Waagerechter Überlauf: ${report.overflow.length ? report.overflow.join(', ') : 'keiner ✓'}`,
    `Bedienelemente ohne Namen: ${report.unnamedControls.length || 'keine ✓'}`,
  ].map((f) => `<li>${f.replace(/</g, '&lt;')}</li>`).join('');
  const html = `<!doctype html><meta charset="utf-8"><style>body{font:14px system-ui;margin:16px;background:#fff}h1{font-size:20px}figure{display:inline-block;vertical-align:top;margin:0 12px 16px 0}img{display:block;max-width:420px;max-height:520px;border:1px solid #ccc}figcaption{font-size:12px;color:#444}</style><h1>Prüfbogen ${name} – ${url}</h1><ul>${findings}</ul>${cells}`;
  const sheet = await browser.newPage({ viewport: { width: 1800, height: 1000 } });
  await sheet.setContent(html);
  await sheet.screenshot({ path: path.join(outDir, `${name}.png`), fullPage: true });
  await browser.close();
  report.shots = report.shots.map((s) => s.label);
  fs.writeFileSync(path.join(outDir, `${name}.json`), JSON.stringify(report, null, 2));
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log(`Prüfbogen: ${path.join(outDir, name + '.png')}`);
  console.log(findings.replace(/<\/?li>/g, '\n').replace(/&lt;/g, '<').trim());
})().catch((e) => { console.error(e); process.exit(1); });
