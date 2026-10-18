import { defineSimulation, ease, Plot, prefersReducedMotion, roundRect, shade, Surface, text, type Rect } from '../../../sim-core';
import { duplicates, hasMine, hasShared, monthDay, MONTH_LENGTHS, mulberry32, pairs, pMine, pShared, randomClass, smallestN } from './model';

const L = (de: string, en: string) => ({ de, en });
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

type Question = 'any' | 'mine';

const MONTHS_DE = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const N_MAX = 70;

/**
 * Geburtstagsproblem: Eine Klasse wird ausgelost, die Geburtstage fallen in
 * einen Jahreskalender, gleiche Tage leuchten auf. Viele Klassen ergeben eine
 * relative Häufigkeit, die neben der exakten Kurve P(n) liegt. Vergleich mit
 * der Frage „Hat jemand am selben Tag Geburtstag wie ich?“.
 */
export default defineSimulation({
  id: 'geburtstagsproblem',
  dragHint: true,
  layout: { aspect: 1.6, aspectNarrow: 0.8 },
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    { key: 'n', type: 'number', label: L('Personen in der Klasse', 'People in the class'), min: 2, max: N_MAX, step: 1, default: 25 },
    {
      key: 'q',
      type: 'choice',
      label: L('Frage', 'Question'),
      options: [
        { value: 'any', label: L('Haben zwei am selben Tag Geburtstag?', 'Do two share a birthday?') },
        { value: 'mine', label: L('Hat jemand an meinem Geburtstag Geburtstag?', 'Does anyone share my birthday?') },
      ],
      default: 'any',
    },
    { key: 'me', type: 'number', label: L('Mein Geburtstag (Tag im Jahr)', 'My birthday (day of the year)'), min: 1, max: 365, step: 1, default: 135, visibleIf: (v) => v.q === 'mine', help: L('1 = 1. Januar, 365 = 31. Dezember', '1 = 1 January, 365 = 31 December') },
    { key: 'curve', type: 'boolean', group: 'view', label: L('Kurve P(n) anzeigen', 'Show curve P(n)'), default: true },
    { key: 'both', type: 'boolean', group: 'view', label: L('Beide Fragen vergleichen', 'Compare both questions'), default: false },
  ],
  actions: [
    { id: 'one', label: L('Neue Klasse', 'New class'), primary: true },
    { id: 'many', label: L('100 Klassen', '100 classes') },
    { id: 'clear', label: L('Zähler löschen', 'Clear counts') },
  ],
  readouts: [
    { key: 'p', label: L('Wahrscheinlichkeit', 'Probability'), spoiler: true },
    { key: 'sim', label: L('Simulation', 'Simulation') },
    { key: 'class', label: L('Diese Klasse', 'This class') },
  ],
  presets: [
    { id: 'start', label: L('Klasse mit 25', 'Class of 25'), values: {} },
    { id: 'n23', label: L('Ab 23 über 50 %', 'From 23 above 50 %'), values: { n: 23 } },
    { id: 'small', label: L('Kleine Gruppe (10)', 'Small group (10)'), values: { n: 10 } },
    { id: 'big', label: L('Großes Treffen (50)', 'Big meeting (50)'), values: { n: 50 } },
    { id: 'mine', label: L('Mein Geburtstag', 'My birthday'), values: { q: 'mine', both: true } },
  ],
  strings: {
    de: { canvas: 'Jahreskalender mit den Geburtstagen einer zufälligen Klasse, gleiche Tage hervorgehoben, daneben die Wahrscheinlichkeit in Abhängigkeit von der Klassengröße' },
    en: { canvas: 'Year calendar with the birthdays of a random class, shared days highlighted, next to it the probability depending on the class size' },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const lang = ctx.lang;
    const fmt = ctx.fmt;
    const reduced = prefersReducedMotion();
    const tt = (de: string, en: string) => (lang === 'de' ? de : en);
    const alpha = (c: string, a: number) => shade(c, 0, a);
    const font = (w: number, s: number) => `${w} ${s}px ${ctx.theme.font}`;
    const q = () => p.q as Question;
    const MONTHS = lang === 'de' ? MONTHS_DE : MONTHS_EN;

    function regions(): { cal: Rect; chart: Rect; wide: boolean } {
      const W = surface.width;
      const H = surface.height;
      const wide = W >= 640 || W >= H * 1.3;
      if (wide) {
        const cw = Math.round(W * 0.56);
        return { wide, cal: { x: 6, y: 6, w: cw, h: H - 12 }, chart: { x: cw + 14, y: 6, w: W - cw - 20, h: H - 12 } };
      }
      const ch = Math.round(H * 0.5);
      return { wide, cal: { x: 4, y: 4, w: W - 8, h: ch }, chart: { x: 4, y: ch + 12, w: W - 8, h: H - ch - 16 } };
    }

    const plot = new Plot(surface, {
      x: [0, N_MAX],
      y: [0, 1],
      equalAspect: false,
      pan: false,
      zoom: false,
      controls: false,
      region: () => {
        const r = regions().chart;
        return { x: r.x + 6, y: r.y + 78, w: r.w - 12, h: r.h - 86 };
      },
      xAxis: { label: 'n' },
      yAxis: { label: 'P', format: (v) => `${fmt.num(v * 100, 0)} %` },
    });
    plot.setRangePadded([0, N_MAX], [0, 1], { left: 44, bottom: 26, top: 12, right: 14 });
    // Klassengröße direkt in der Kurve ziehen
    plot.addHandle({
      get: () => [p.n, q() === 'mine' ? pMine(p.n) : pShared(p.n)],
      set: (x) => ctx.set({ n: clamp(Math.round(x), 2, N_MAX) }),
      axis: 'x',
      enabled: () => !ctx.locked,
      color: () => (q() === 'mine' ? ctx.theme.series[3]! : ctx.theme.series[0]!),
    });

    /* ---------------- Zustand ---------------- */
    let rnd = mulberry32((Date.now() & 0xffffff) ^ 0x5bd1e995);
    let cls: number[] = randomClass(p.n, rnd);
    let clsStart = performance.now() + (reduced ? -1e6 : 200);
    /** Simulationszähler je Klassengröße und Frage. */
    const stats = new Map<string, { runs: number; hits: number }>();
    const statKey = () => `${p.n}|${q()}|${q() === 'mine' ? p.me : 0}`;
    let now = performance.now();
    let burst = -1e9;

    const mine = () => p.me - 1;
    const hitOf = (b: number[]) => (q() === 'mine' ? hasMine(b, mine()) : hasShared(b));
    const pOf = (n: number) => (q() === 'mine' ? pMine(n) : pShared(n));
    function record(b: number[]): void {
      const k = statKey();
      const s = stats.get(k) ?? { runs: 0, hits: 0 };
      s.runs++;
      if (hitOf(b)) s.hits++;
      stats.set(k, s);
    }

    function newClass(): void {
      cls = randomClass(p.n, rnd);
      clsStart = performance.now() + (reduced ? -1e6 : 0);
      record(cls);
    }

    /* ---------------- Zeichnen ---------------- */
    function card(r: Rect): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.10)';
      g.shadowBlur = 18;
      g.shadowOffsetY = 4;
      roundRect(g, r.x, r.y, r.w, r.h, 14);
      const grad = g.createLinearGradient(0, r.y, 0, r.y + r.h);
      grad.addColorStop(0, theme.dark ? shade(theme.bg, 0.075) : '#ffffff');
      grad.addColorStop(1, theme.dark ? shade(theme.bg, 0.035) : shade(theme.bg, -0.018));
      g.fillStyle = grad;
      g.fill();
      g.shadowColor = 'transparent';
      g.strokeStyle = alpha(theme.text, theme.dark ? 0.1 : 0.07);
      g.stroke();
      g.restore();
    }

    /** Ankunft der i-ten Person im Kalender (0 … 1). */
    function arrive(i: number): number {
      if (reduced) return 1;
      const per = Math.min(60, 1400 / Math.max(1, cls.length));
      return clamp((now - clsStart - i * per) / 380, 0, 1);
    }
    const allArrived = () => reduced || now - clsStart > Math.min(60, 1400 / Math.max(1, cls.length)) * cls.length + 400;

    function drawCalendar(): void {
      const R = regions().cal;
      const theme = ctx.theme;
      const g = surface.g;
      card(R);
      const small = R.w < 480;
      text(g, tt('Geburtstage der Klasse', 'Birthdays in the class'), R.x + 14, R.y + 20, { font: font(800, small ? 13 : 14), color: theme.text, align: 'left' });
      const dups = duplicates(cls);
      const done = allArrived();
      const hit = hitOf(cls);
      // Ergebnis-Schild oben rechts
      if (done) {
        const msg = q() === 'mine' ? (hit ? tt('Jemand hat an meinem Tag Geburtstag!', 'Someone shares my birthday!') : tt('Niemand an meinem Tag', 'Nobody on my day')) : hit ? tt(`${dups.size} ${dups.size === 1 ? 'gemeinsamer Tag' : 'gemeinsame Tage'}!`, `${dups.size} shared ${dups.size === 1 ? 'day' : 'days'}!`) : tt('Alle verschieden', 'All different');
        const col = hit ? theme.series[1]! : theme.series[2]!;
        g.font = font(800, 11.5);
        const w = g.measureText(msg).width + 18;
        const pop = reduced ? 1 : ease.outBack(clamp((now - clsStart - Math.min(60, 1400 / cls.length) * cls.length - 300) / 400, 0, 1));
        g.save();
        g.translate(R.x + 14 + w / 2, R.y + R.h - 18);
        g.scale(pop, pop);
        roundRect(g, -w / 2, -11, w, 22, 11);
        g.fillStyle = col;
        g.fill();
        g.restore();
        if (pop > 0.5) text(g, msg, R.x + 14 + w / 2, R.y + R.h - 17.5, { font: font(800, 11.5), color: '#ffffff' });
      }
      // Raster: 12 Monate × 31 Tage
      const left = R.x + (small ? 34 : 42);
      const top = R.y + 42;
      const cw = (R.x + R.w - 10 - left) / 31;
      const chh = (R.y + R.h - 40 - top) / 12;
      const r = Math.min(cw * 0.44, chh * 0.36);
      for (let m = 0; m < 12; m++) {
        const y = top + m * chh + chh / 2;
        text(g, MONTHS[m]!, left - 6, y, { font: font(700, small ? 10 : 11), color: theme.muted, align: 'right' });
        for (let d = 1; d <= 31; d++) {
          const x = left + (d - 0.5) * cw;
          if (d > MONTH_LENGTHS[m]!) continue;
          g.fillStyle = alpha(theme.text, theme.dark ? 0.08 : 0.06);
          g.beginPath();
          g.arc(x, y, Math.max(1.2, r * 0.3), 0, Math.PI * 2);
          g.fill();
        }
      }
      // Tageszahlen oben (jeder 5.)
      for (let d = 1; d <= 31; d++) {
        if (d !== 1 && d % 5 !== 0) continue;
        text(g, String(d), left + (d - 0.5) * cw, top - 7, { font: font(600, 9.5), color: theme.muted });
      }
      // Mein Geburtstag
      if (q() === 'mine' || p.both) {
        const md = monthDay(mine());
        const x = left + (md.day - 0.5) * cw;
        const y = top + md.month * chh + chh / 2;
        g.save();
        g.strokeStyle = theme.series[3]!;
        g.lineWidth = 2;
        g.setLineDash([3, 2]);
        g.beginPath();
        g.arc(x, y, r + 4, 0, Math.PI * 2);
        g.stroke();
        g.restore();
        text(g, '★', x, y - r - 9, { font: font(800, 11), color: theme.series[3]! });
      }
      // Geburtstage
      const seen = new Map<number, number>();
      cls.forEach((b, i) => {
        const a = arrive(i);
        if (a <= 0) return;
        const md = monthDay(b);
        const x = left + (md.day - 0.5) * cw;
        const y = top + md.month * chh + chh / 2;
        const k = seen.get(b) ?? 0;
        seen.set(b, k + 1);
        const isDup = dups.has(b) && (q() === 'any' || b === mine());
        const isMine = b === mine() && (q() === 'mine' || p.both);
        const col = isDup || isMine ? theme.series[1]! : theme.series[0]!;
        const e = ease.outBack(a);
        const yy = y - (1 - ease.outCubic(a)) * 30 - k * r * 0.5;
        g.save();
        g.globalAlpha = clamp(a * 2, 0, 1);
        const grad = g.createRadialGradient(x - r * 0.3, yy - r * 0.35, r * 0.1, x, yy, r * e);
        grad.addColorStop(0, shade(col, 0.45));
        grad.addColorStop(1, col);
        g.beginPath();
        g.arc(x, yy, Math.max(0.5, r * e), 0, Math.PI * 2);
        g.fillStyle = grad;
        g.fill();
        g.restore();
      });
      // gemeinsame Tage: pulsierender Ring und Anzahl
      if (done) {
        const pulse = reduced ? 0 : (Math.sin(now / 260) + 1) / 2;
        for (const [b, c] of dups) {
          if (q() === 'mine' && b !== mine()) continue;
          const md = monthDay(b);
          const x = left + (md.day - 0.5) * cw;
          const y = top + md.month * chh + chh / 2;
          g.save();
          g.strokeStyle = alpha(theme.series[1]!, 0.5 + 0.4 * pulse);
          g.lineWidth = 2;
          g.beginPath();
          g.arc(x, y - (c - 1) * r * 0.25, r + 3 + pulse * 2, 0, Math.PI * 2);
          g.stroke();
          g.restore();
          if (cw > 11) text(g, `×${c}`, x + r + 6, y - r, { font: font(800, 9.5), color: theme.series[1]!, align: 'left' });
        }
      }
      if (!small) {
        const info = tt(`${cls.length} Personen · ${fmt.num(pairs(cls.length), 0)} Paare`, `${cls.length} people · ${fmt.num(pairs(cls.length), 0)} pairs`);
        text(g, info, R.x + R.w - 12, R.y + R.h - 18, { font: font(600, 10.5), color: theme.muted, align: 'right' });
      }
    }

    function drawChart(): void {
      const R = regions().chart;
      const theme = ctx.theme;
      const g = surface.g;
      card(R);
      const n = p.n;
      const pv = pOf(n);
      const col = q() === 'mine' ? theme.series[3]! : theme.series[0]!;
      text(g, q() === 'mine' ? tt('P(jemand an meinem Tag)', 'P(someone on my day)') : tt('P(mindestens zwei am selben Tag)', 'P(at least two share a day)'), R.x + 14, R.y + 20, { font: font(800, 13), color: theme.text, align: 'left' });
      const s = stats.get(statKey());
      const big = p.curve ? `${fmt.num(pv * 100, 1)} %` : '?';
      text(g, `n = ${n}:`, R.x + 14, R.y + 44, { font: font(700, 13), color: theme.muted, align: 'left' });
      g.font = font(700, 13);
      const w0 = g.measureText(`n = ${n}:`).width;
      text(g, big, R.x + 20 + w0, R.y + 44, { font: font(800, 18), color: col, align: 'left' });
      if (s && s.runs > 0) {
        const pulse = reduced ? 0 : Math.max(0, 1 - (now - burst) / 600);
        text(g, tt(`Simulation: ${s.hits} von ${s.runs} = ${fmt.num((s.hits / s.runs) * 100, 1)} %`, `Simulation: ${s.hits} of ${s.runs} = ${fmt.num((s.hits / s.runs) * 100, 1)} %`), R.x + 14, R.y + 66, { font: font(700 + Math.round(pulse) * 100, 11.5), color: theme.text, align: 'left' });
      }
      plot.resize();
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      plot.hline(0.5, { color: theme.muted, width: 1, dash: [5, 5] });
      if (p.curve) {
        if (p.both || q() === 'any') plot.fn((x) => pShared(Math.round(x)), { color: theme.series[0]!, width: q() === 'any' ? 3 : 2, from: 1, to: N_MAX });
        if (p.both || q() === 'mine') plot.fn((x) => pMine(Math.round(x)), { color: theme.series[3]!, width: q() === 'mine' ? 3 : 2, from: 1, to: N_MAX, dash: q() === 'mine' ? undefined : [6, 4] });
        const n50 = smallestN(0.5, q() === 'mine' ? pMine : pShared);
        if (n50 <= N_MAX) {
          plot.vline(n50, { color: col, width: 1, dash: [3, 4] });
          plot.text(n50, 0.5, `n = ${n50}`, { color: col, size: 11, weight: 'bold', offset: [6, 12], align: 'left' });
        }
        plot.segment([n, 0], [n, pv], { color: col, width: 1.5, dash: [4, 3] });
      }
      if (s && s.runs > 0) plot.point(n, s.hits / s.runs, { color: theme.text, radius: 5, hollow: true });
      plot.end();
    }

    /* ---------------- Ergebnisse ---------------- */
    function updateReadouts(): void {
      const n = p.n;
      if (q() === 'mine') ctx.readout('p', { html: `P = 1 − (<span class="frac"><span>364</span><span>365</span></span>)<sup>${n}</sup> ≈ ${fmt.num(pMine(n) * 100, 2)} %` });
      else ctx.readout('p', { html: `P = 1 − <span class="frac"><span>365 · 364 · … · ${365 - n + 1}</span><span>365<sup>${n}</sup></span></span> ≈ ${fmt.num(pShared(n) * 100, 2)} %` });
      const s = stats.get(statKey());
      ctx.readout('sim', s && s.runs ? tt(`${s.hits} von ${s.runs} Klassen = ${fmt.num((s.hits / s.runs) * 100, 1)} %`, `${s.hits} of ${s.runs} classes = ${fmt.num((s.hits / s.runs) * 100, 1)} %`) : tt('noch keine Klasse simuliert', 'no class simulated yet'));
      const d = duplicates(cls);
      const list = [...d.entries()].map(([b, c]) => {
        const md = monthDay(b);
        return `${md.day}. ${MONTHS[md.month]} (${c}×)`;
      });
      ctx.readout('class', list.length ? `${tt('gemeinsame Tage', 'shared days')}: ${list.join(', ')}` : tt('alle Geburtstage verschieden', 'all birthdays different'));
    }

    updateReadouts();

    return {
      update(changed, source) {
        now = performance.now();
        if (changed.has('n') && cls.length !== p.n) {
          // Klasse anpassen: Personen kommen dazu oder gehen
          if (p.n > cls.length) cls = [...cls, ...randomClass(p.n - cls.length, rnd)];
          else cls = cls.slice(0, p.n);
          if (source !== 'input') clsStart = now + (reduced ? -1e6 : 0);
        }
        updateReadouts();
        ctx.requestRender();
      },
      action(id) {
        now = performance.now();
        if (id === 'one') newClass();
        else if (id === 'many') {
          for (let i = 0; i < 99; i++) record(randomClass(p.n, rnd));
          newClass();
          burst = now;
        } else if (id === 'clear') {
          stats.delete(statKey());
          rnd = mulberry32((Date.now() & 0xffffff) ^ 0x2545f491);
        }
        updateReadouts();
        ctx.requestRender();
      },
      render() {
        now = performance.now();
        surface.begin();
        drawCalendar();
        drawChart();
        const pulsing = allArrived() && (q() === 'any' ? duplicates(cls).size > 0 : hasMine(cls, mine()));
        const settling = !reduced && now - clsStart < Math.min(60, 1400 / Math.max(1, cls.length)) * cls.length + 900;
        if (!allArrived() || settling || now - burst < 700 || (pulsing && !reduced && now - clsStart < 6000)) ctx.requestRender();
      },
      destroy: () => surface.destroy(),
    };
  },
});
