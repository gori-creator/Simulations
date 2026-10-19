import { defineSimulation, ease, mixColor, Plot, prefersReducedMotion, roundRect, Surface, text, Tween, withAlpha, type Rect } from '../../../sim-core';
import { formula, type FormulaStyle } from './formula';
import { ownSituation, partialSums, riemannSum, samplePoint, signChanges, signedAreas, SITS, type Rule, type Situation, type SitKey } from './model';

const L = (de: string, en: string) => ({ de, en });
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

const PLAY_MS = 7000;
const GROW_MS = 650;
const OWN_KEYS = ['r0', 'r1', 'r2', 'r3', 'r4'] as const;

/** Darstellung, Einheiten und Bezeichnungen je Situation (Y = null: Bestandsachse passt sich an). */
const VIEW: Record<SitKey, { y: [number, number]; Y: [number, number] | null; tu: string; ru: string; bu: string; r: string; b: string }> = {
  car: { y: [-2, 24], Y: [-60, 900], tu: 's', ru: 'm/s', bu: 'm', r: 'v', b: 's' },
  tank: { y: [-5, 5], Y: [-10, 110], tu: 'min', ru: 'L/min', bu: 'L', r: 'r', b: 'V' },
  bike: { y: [-1, 9], Y: [-40, 800], tu: 's', ru: 'm/s', bu: 'm', r: 'v', b: 's' },
  own: { y: [-6, 6], Y: null, tu: 'min', ru: 'L/min', bu: 'L', r: 'r', b: 'V' },
};

/**
 * Integral als Gesamtänderung: oben die Änderungsrate (Geschwindigkeit bzw.
 * Zuflussrate) mit der Fläche bis zum Zeitpunkt t – oberhalb der Achse
 * grün, unterhalb rot – und wahlweise Rechteckstreifen r(tᵢ) · Δt (linker
 * Rand, rechter Rand oder Mitte); unten der rekonstruierte Bestand (Weg bzw.
 * Füllmenge) mit Tangente (Steigung = Rate), Extremstellen beim
 * Vorzeichenwechsel der Rate und der „Treppe“ der Teilsummen. „Rechtecke
 * stapeln“ trägt die Streifen nacheinander als Zuwachs in den Bestand ein.
 * Bei „Eigene Zuflussrate“ zieht man fünf Punkte eines Streckenzugs.
 * Rechts: Bild der Situation, Rechnung und je nach Zustand der Fehler der
 * Rechtecksumme über der Streifenzahl oder der Zusammenhang Rate ↔ Bestand.
 */
export default defineSimulation({
  id: 'aenderungsrate',
  dragHint: true,
  layout: { aspect: 1.5, aspectNarrow: 0.4 },
  groups: [
    { id: 'own', label: L('Eigene Zuflussrate', 'Your own inflow rate') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'sit',
      type: 'choice',
      label: L('Situation', 'Situation'),
      options: [
        { value: 'car', label: L('Autofahrt (Geschwindigkeit → Weg)', 'Car journey (velocity → distance)') },
        { value: 'tank', label: L('Wassertank (Zufluss → Füllmenge)', 'Water tank (inflow → volume)') },
        { value: 'bike', label: L('Radfahrt (Geschwindigkeit → Weg)', 'Bike ride (velocity → distance)') },
        { value: 'own', label: L('Eigene Zuflussrate (Punkte ziehen)', 'Your own inflow rate (drag points)') },
      ],
      default: 'car',
    },
    { key: 't', type: 'number', label: L('Zeitpunkt t', 'Time t'), min: 0, max: 120, step: 0.5, default: 25, help: L('Auch t auf der Zeitachse ziehen.', 'You can also drag t along the time axis.') },
    { key: 'n', type: 'number', label: L('Rechteckstreifen', 'Rectangles'), min: 0, max: 30, step: 1, default: 0, help: L('0: keine Streifen, nur die exakte Fläche.', '0: no rectangles, only the exact area.') },
    {
      key: 'rule',
      type: 'choice',
      label: L('Höhe der Rechtecke', 'Height of the rectangles'),
      options: [
        { value: 'l', label: L('linker Rand', 'left edge') },
        { value: 'r', label: L('rechter Rand', 'right edge') },
        { value: 'm', label: L('Mitte', 'midpoint') },
      ],
      default: 'l',
      visibleIf: (v) => Number(v.n) > 0,
    },
    { key: 'v0', type: 'number', label: L('Anfangsmenge im Tank', 'Initial volume in the tank'), min: 0, max: 60, step: 1, default: 30, unit: 'L', visibleIf: (v) => v.sit === 'tank' || v.sit === 'own' },
    { key: 'r0', type: 'number', group: 'own', label: L('r(0)', 'r(0)'), min: -5, max: 5, step: 0.5, default: 2, unit: 'L/min', visibleIf: (v) => v.sit === 'own' },
    { key: 'r1', type: 'number', group: 'own', label: L('r(10)', 'r(10)'), min: -5, max: 5, step: 0.5, default: 4, unit: 'L/min', visibleIf: (v) => v.sit === 'own' },
    { key: 'r2', type: 'number', group: 'own', label: L('r(20)', 'r(20)'), min: -5, max: 5, step: 0.5, default: 0, unit: 'L/min', visibleIf: (v) => v.sit === 'own' },
    { key: 'r3', type: 'number', group: 'own', label: L('r(30)', 'r(30)'), min: -5, max: 5, step: 0.5, default: -3, unit: 'L/min', visibleIf: (v) => v.sit === 'own' },
    { key: 'r4', type: 'number', group: 'own', label: L('r(40)', 'r(40)'), min: -5, max: 5, step: 0.5, default: 1, unit: 'L/min', visibleIf: (v) => v.sit === 'own' },
    { key: 'show', type: 'boolean', group: 'view', label: L('Werte zeigen', 'Show values'), help: L('Aus: Gesamtänderung selbst berechnen.', 'Off: work out the total change yourself.'), default: true },
  ],
  actions: [
    { id: 'play', label: L('Ablauf abspielen', 'Play the process'), primary: true },
    { id: 'stack', label: L('Rechtecke stapeln', 'Stack the rectangles') },
    { id: 'dbl', label: L('Streifen verdoppeln', 'Double the strips') },
  ],
  readouts: [
    { key: 'chg', label: L('Gesamtänderung', 'Total change'), spoiler: true },
    { key: 'stock', label: L('Bestand', 'Amount'), spoiler: true },
    { key: 'sum', label: L('Rechtecksumme', 'Rectangle sum'), spoiler: true },
  ],
  presets: [
    { id: 'car', label: L('Autofahrt', 'Car journey'), values: {} },
    { id: 'carEnd', label: L('Ganze Fahrt: 800 m', 'Whole journey: 800 m'), values: { sit: 'car', t: 60 } },
    { id: 'rect', label: L('Rechtecke: Weg ≈ Σ v · Δt', 'Rectangles: distance ≈ Σ v · Δt'), values: { sit: 'car', t: 25, n: 5 } },
    { id: 'tank', label: L('Tank: Zufluss wird Abfluss', 'Tank: inflow turns into outflow'), values: { sit: 'tank', t: 30, v0: 30 } },
    { id: 'mid', label: L('Mittelpunkt-Rechtecke', 'Midpoint rectangles'), values: { sit: 'tank', t: 20, n: 2, rule: 'm' } },
    { id: 'own', label: L('Eigene Rate mit Maximum und Minimum', 'Own rate with maximum and minimum'), values: { sit: 'own', t: 40, v0: 30 } },
    { id: 'bike', label: L('Radfahrt', 'Bike ride'), values: { sit: 'bike', t: 90, n: 0 } },
  ],
  strings: {
    de: {
      canvas: 'Oben die Änderungsrate (Geschwindigkeit oder Zuflussrate) über der Zeit mit der Fläche bis zum Zeitpunkt t – oberhalb der Achse grün, unterhalb rot – und wahlweise Rechteckstreifen; unten der daraus rekonstruierte Bestand (Weg oder Füllmenge) mit Tangente, Extremstellen und der Treppe der Rechtecksummen. Daneben ein Bild der Situation, die Rechnung und der Fehler der Rechtecksumme.',
      sceneT: 'Situation',
      calcT: 'Gesamtänderung',
      errT: 'Fehler der Rechtecksumme',
      linkT: 'Rate und Bestand',
      rate_car: 'Geschwindigkeit v(t)',
      rate_tank: 'Zuflussrate r(t)',
      rate_bike: 'Geschwindigkeit v(t)',
      rate_own: 'Zuflussrate r(t)',
      stock_car: 'Weg s(t)',
      stock_tank: 'Füllmenge V(t)',
      stock_bike: 'Weg s(t)',
      stock_own: 'Füllmenge V(t)',
      rule_l: 'links',
      rule_r: 'rechts',
      rule_m: 'Mitte',
      rects: 'Rechtecke ({rule}, n = {n})',
      area: 'Fläche',
      err: 'Fehler',
      halfLR: 'Doppelt so viele Streifen: Fehler etwa halb so groß.',
      halfM: 'Mitte: doppelt so viele Streifen – Fehler etwa ein Viertel.',
      zero: 'Hier heben sich die Fehler genau auf.',
      slope: 'Steigung von {b}(t) = {r}(t): Je höher der Graph oben, desto steiler unten.',
      never: '{r}(t) ≥ 0: Der Bestand nimmt nie ab.',
      ext_max: 't = {t}: {r} wechselt von + nach − → {b} maximal',
      ext_min: 't = {t}: {r} wechselt von − nach + → {b} minimal',
      outflow: 'Negative Rate: Wasser fließt ab – die Füllmenge sinkt.',
      empty: 'Tank leer – so kann es nicht weitergehen!',
      max: 'Max.',
      min: 'Min.',
    },
    en: {
      canvas: 'Top: the rate of change (velocity or inflow rate) over time with the area up to time t – green above the axis, red below – and optional rectangles; bottom: the reconstructed amount (distance or volume) with tangent, extrema and the staircase of rectangle sums. Next to it a picture of the situation, the calculation and the error of the rectangle sum.',
      sceneT: 'Situation',
      calcT: 'Total change',
      errT: 'Error of the rectangle sum',
      linkT: 'Rate and amount',
      rate_car: 'velocity v(t)',
      rate_tank: 'inflow rate r(t)',
      rate_bike: 'velocity v(t)',
      rate_own: 'inflow rate r(t)',
      stock_car: 'distance s(t)',
      stock_tank: 'volume V(t)',
      stock_bike: 'distance s(t)',
      stock_own: 'volume V(t)',
      rule_l: 'left',
      rule_r: 'right',
      rule_m: 'midpoint',
      rects: 'rectangles ({rule}, n = {n})',
      area: 'area',
      err: 'error',
      halfLR: 'Twice as many strips: the error roughly halves.',
      halfM: 'Midpoint: twice as many strips – about a quarter of the error.',
      zero: 'Here the errors cancel out exactly.',
      slope: 'Slope of {b}(t) = {r}(t): the higher the graph on top, the steeper below.',
      never: '{r}(t) ≥ 0: the amount never decreases.',
      ext_max: 't = {t}: {r} changes from + to − → {b} maximal',
      ext_min: 't = {t}: {r} changes from − to + → {b} minimal',
      outflow: 'Negative rate: water flows out – the volume decreases.',
      empty: 'Tank empty – this cannot go on!',
      max: 'max.',
      min: 'min.',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const reduced = prefersReducedMotion();
    const th = () => ctx.theme;
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (m, k: string) => String(vars[k] ?? m));
    const wideLayout = () => surface.width >= 640 || surface.width >= surface.height * 1.3;
    const F = (w: number, n: number) => (surface.width >= 640 ? w : n);
    const font = (weight: number, size: number) => `${weight} ${size}px ${th().font}`;
    const sitKey = () => p.sit as SitKey;
    const rule = () => p.rule as Rule;
    const isTank = () => sitKey() === 'tank' || sitKey() === 'own';

    let ownKey = '';
    let ownSit: Situation = ownSituation([2, 4, 0, -3, 1]);
    function sit(): Situation {
      if (sitKey() !== 'own') return SITS[sitKey() as Exclude<SitKey, 'own'>];
      const vals = OWN_KEYS.map((k) => p[k] as number);
      const key = vals.join(',');
      if (key !== ownKey) {
        ownKey = key;
        ownSit = ownSituation(vals);
      }
      return ownSit;
    }
    const tEff = () => clamp(p.t, 0, sit().T);
    const b0 = () => (isTank() ? p.v0 : 0);
    const B = (u: number) => b0() + sit().change(u);

    const col = {
      r: () => th().series[0]!,
      b: () => th().series[3]!,
      pos: () => th().series[2]!,
      neg: () => th().series[1]!,
      rect: () => th().series[4]!,
      water: () => th().series[5]!,
    };
    const n1 = (v: number) => fmt.num(Math.abs(v) < 0.05 ? 0 : v, 1);
    const sgn = (v: number) => (Math.abs(v) < 0.05 ? '± 0' : v < 0 ? `− ${n1(-v)}` : `+ ${n1(v)}`);
    const Q = (s: string) => (p.show ? s : '?');

    /* ---------- Aufteilung ---------- */
    function regions(): { top: Rect; bot: Rect; col: Rect } {
      const w = surface.width;
      const h = surface.height;
      let left: Rect;
      let colR: Rect;
      if (!wideLayout()) {
        const ph = Math.round(clamp(w * 1.1, 300, h * 0.5));
        left = { x: 0, y: 0, w, h: ph };
        colR = { x: 2, y: ph + 6, w: w - 4, h: h - ph - 8 };
      } else {
        const cw = Math.round(clamp(w * 0.34, 260, 350));
        left = { x: 0, y: 0, w: w - cw - 10, h };
        colR = { x: w - cw, y: 2, w: cw - 2, h: h - 4 };
      }
      const t1 = Math.round(left.h * 0.5);
      return { top: { ...left, h: t1 }, bot: { x: left.x, y: left.y + t1 + 6, w: left.w, h: left.h - t1 - 6 }, col: colR };
    }
    const plot = new Plot(surface, { x: [0, 60], y: [0, 20], equalAspect: false, pan: false, zoom: false, controls: false, region: () => regions().top, xAxis: { label: '' }, yAxis: { label: '' } });
    const plotB = new Plot(surface, { x: [0, 60], y: [0, 800], equalAspect: false, pan: false, zoom: false, controls: false, region: () => regions().bot, xAxis: { label: '' }, yAxis: { label: '' } });

    /* ---------- Zustand ---------- */
    let shownT = reduced ? tEff() : 0;
    let lastFrame = performance.now();
    let dragging = 0;
    const play = new Tween(PLAY_MS, ease.linear);
    let playEnd = false;
    const grow = new Tween(GROW_MS, ease.outCubic);
    const stack = new Tween(3000, ease.linear);
    let stackN = 0;
    /** Startzeit des Stapelns, falls erst die Streifen wachsen (0: nichts geplant). */
    let stackAt = 0;

    plot.addHandle({
      get: () => [shownT, 0],
      set: (x) => {
        dragging = performance.now();
        ctx.set({ t: Math.round(clamp(x, 0, sit().T) * 2) / 2 });
      },
      axis: 'x',
      enabled: () => !ctx.locked && !play.running && !stack.running,
      color: () => col.b(),
    });
    OWN_KEYS.forEach((k, i) => {
      plot.addHandle({
        get: () => [i * 10, p[k] as number],
        set: (_x, y) => {
          dragging = performance.now();
          ctx.set({ [k]: Math.round(clamp(y, -5, 5) * 2) / 2 });
        },
        axis: 'y',
        enabled: () => sitKey() === 'own' && !ctx.locked && !play.running && !stack.running,
        color: () => col.r(),
      });
    });

    /* ---------- Ergebnisse ---------- */
    function updateReadouts(): void {
      const v = VIEW[sitKey()];
      const t = tEff();
      const c = sit().change(t);
      ctx.readout('chg', `${n1(c)} ${v.bu}`);
      ctx.readout('stock', `${v.b}(${n1(t)}) = ${n1(b0() + c)} ${v.bu}`);
      ctx.readout('sum', p.n > 0 ? `${n1(b0() + riemannSum(sit(), t, p.n, rule()))} ${v.bu}` : null);
    }

    /** Bereich der Bestandsachse (bei der eigenen Rate aus den Werten). */
    function stockRange(): [number, number] {
      const v = VIEW[sitKey()];
      if (v.Y) return v.Y;
      const s = sit();
      let lo = 0;
      let hi = 10;
      for (let i = 0; i <= 80; i++) {
        const y = B((s.T * i) / 80);
        lo = Math.min(lo, y);
        hi = Math.max(hi, y);
      }
      if (p.n > 0) for (const y of partialSums(s, tEff(), p.n, rule())) {
        lo = Math.min(lo, b0() + y);
        hi = Math.max(hi, b0() + y);
      }
      const pad = (hi - lo) * 0.1;
      return [lo - pad, hi + pad];
    }

    /* ---------- Bausteine ---------- */
    function card(r: Rect, accent?: string, tint = 0): void {
      const g = surface.g;
      const theme = th();
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.10)';
      g.shadowBlur = 12;
      g.shadowOffsetY = 3;
      g.fillStyle = theme.dark ? '#151c27' : '#ffffff';
      roundRect(g, r.x, r.y, r.w, r.h, 12);
      g.fill();
      g.restore();
      if (accent && tint > 0) {
        g.fillStyle = withAlpha(accent, theme.dark ? tint * 1.6 : tint);
        roundRect(g, r.x, r.y, r.w, r.h, 12);
        g.fill();
      }
      g.strokeStyle = accent ? withAlpha(accent, 0.55) : theme.dark ? '#273142' : '#e3e8ef';
      g.lineWidth = 1.2;
      roundRect(g, r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1, 12);
      g.stroke();
    }
    function title(x: number, y: number, label: string, color = th().muted): void {
      text(surface.g, label, x, y, { font: font(700, F(12, 11)), color, align: 'left' });
    }
    function wrap(str: string, maxW: number, f: string): string[] {
      const g = surface.g;
      g.font = f;
      const rows: string[] = [];
      let cur = '';
      for (const w of str.split(' ')) {
        const next = cur ? `${cur} ${w}` : w;
        if (g.measureText(next).width > maxW && cur) {
          rows.push(cur);
          cur = w;
        } else cur = next;
      }
      if (cur) rows.push(cur);
      return rows;
    }
    /** Absatz mit Zeilenumbruch; gibt die neue y-Position zurück. */
    function para(str: string, x: number, y: number, maxW: number, color: string, size = F(12, 11), weight = 600): number {
      const f = font(weight, size);
      for (const row of wrap(str, maxW, f)) {
        text(surface.g, row, x, y + size * 0.6, { font: f, color, align: 'left' });
        y += size + 5;
      }
      return y;
    }
    const fstyle = (size: number, color = th().text, weight = 600): FormulaStyle => ({
      size,
      font: th().font,
      mathFont: th().mathFont,
      color,
      weight,
      palette: { r: col.r(), b: col.b(), q: col.rect(), p: col.pos(), n: col.neg(), m: th().muted },
    });
    function fitFormula(src: string, maxW: number, size: number, color = th().text, weight = 600) {
      const g = surface.g;
      let s = size;
      let box = formula(g, src, fstyle(s, color, weight));
      while (box.w > maxW && s > 9.5) {
        s -= 0.5;
        box = formula(g, src, fstyle(s, color, weight));
      }
      return box;
    }
    function tag(pl: Plot, x: number, y: number, src: string, color: string, align: 'left' | 'center' | 'right' = 'left', size = F(13, 12)): void {
      const g = surface.g;
      const box = formula(g, src, fstyle(size, color, 700));
      const r = pl.rect;
      let left = align === 'left' ? x : align === 'right' ? x - box.w : x - box.w / 2;
      left = clamp(left, r.x + 4, r.x + r.w - box.w - 4);
      const base = clamp(y + (box.asc - box.desc) / 2, r.y + box.asc + 4, r.y + r.h - box.desc - 4);
      g.save();
      g.globalAlpha = 0.88;
      g.fillStyle = th().bg;
      roundRect(g, left - 4, base - box.asc - 2, box.w + 8, box.asc + box.desc + 4, 6);
      g.fill();
      g.globalAlpha = 1;
      box.draw(g, left, base);
      g.restore();
    }

    /** Wie weit ist das Stapeln? (Anzahl fertig übertragener Streifen, Bruchteil möglich) */
    const stackProgress = () => (stack.running ? stack.value * stackN : p.n);

    /* ---------- Plots ---------- */
    function drawRate(): void {
      const g = surface.g;
      const theme = th();
      const s = sit();
      const v = VIEW[sitKey()];
      plot.setRangePadded([0, s.T], v.y, { left: F(38, 30), bottom: F(24, 22), top: 22, right: 12 });
      plot.begin();
      plot.grid();
      plot.axes();
      const r = plot.rect;
      const t = shownT;
      plot.fillBetween((u) => Math.max(s.rate(u), 0), () => 0, 0, t, { fill: withAlpha(col.pos(), theme.dark ? 0.38 : 0.26) });
      plot.fillBetween((u) => Math.min(s.rate(u), 0), () => 0, 0, t, { fill: withAlpha(col.neg(), theme.dark ? 0.38 : 0.26) });
      // Vorzeichenwechsel der Rate
      for (const e of signChanges(s)) {
        plot.vline(e.t, { color: withAlpha(theme.muted, 0.7), width: 1.2, dash: [4, 4] });
        plot.point(e.t, 0, { color: e.kind === 'max' ? col.pos() : col.neg(), radius: 4 });
      }
      // Rechteckstreifen
      const n = p.n;
      if (n > 0 && t > 0) {
        const dt = t / n;
        const gv = grow.running ? grow.value : 1;
        const done = stackProgress();
        for (let i = 0; i < n; i++) {
          const fi = clamp(gv * 1.6 - (i / n) * 0.6, 0, 1);
          if (fi <= 0) continue;
          const h = s.rate(samplePoint(i, dt, rule())) * ease.outCubic(fi);
          const active = stack.running && i === Math.floor(done);
          const moved = stack.running && i < Math.floor(done);
          plot.polygon(
            [
              [i * dt, 0],
              [(i + 1) * dt, 0],
              [(i + 1) * dt, h],
              [i * dt, h],
            ],
            {
              fill: withAlpha(col.rect(), active ? 0.5 : moved ? 0.08 : theme.dark ? 0.25 : 0.16),
              stroke: withAlpha(col.rect(), moved ? 0.45 : 1),
              width: active ? 2.4 : 1.4,
            },
          );
          if (fi >= 1 && n <= 15) plot.point(samplePoint(i, dt, rule()), h, { color: col.rect(), radius: 2.6 });
        }
      }
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.6)' : mixColor(col.r(), '#ffffff', 0.5, 0.6);
      g.shadowBlur = 5;
      plot.fn(s.rate, { color: col.r(), width: 3, from: 0, to: s.T });
      g.restore();
      plot.segment([t, 0], [t, s.rate(t)], { color: col.b(), width: 2 });
      plot.point(t, 0, { color: col.b(), radius: 6.5 });
      plot.point(t, s.rate(t), { color: col.r(), radius: 4.5 });
      // Flächen beschriften (Schwerpunkt der Teilflächen)
      if (p.show && t > 0 && n === 0) {
        const a = signedAreas(s, t, 400);
        const u = VIEW[sitKey()].bu;
        const k = 200;
        for (const which of ['pos', 'neg'] as const) {
          const A = a[which];
          if (Math.abs(A) < 0.03 * Math.max(1, Math.abs(a.pos) + Math.abs(a.neg))) continue;
          let sw = 0;
          let sx = 0;
          let sy = 0;
          for (let i = 0; i < k; i++) {
            const x = ((i + 0.5) * t) / k;
            const y = which === 'pos' ? Math.max(s.rate(x), 0) : Math.min(s.rate(x), 0);
            sw += Math.abs(y);
            sx += x * Math.abs(y);
            sy += (y * Math.abs(y)) / 2;
          }
          if (sw <= 0) continue;
          const c = which === 'pos' ? col.pos() : col.neg();
          tag(plot, plot.px(sx / sw), plot.py(sy / sw), `\\c{${which === 'pos' ? 'p' : 'n'}}{${sgn(A)} \\t{${u}}}`, mixColor(c, theme.text, 0.35), 'center', F(12, 11));
        }
      }
      text(g, `${ctx.t(`rate_${sitKey()}`)} in ${v.ru}`, plot.px(0) + 8, r.y + 10, { font: font(700, F(12, 11)), color: col.r(), align: 'left' });
      text(g, `t in ${v.tu}`, r.x + r.w - 4, plot.py(0) - 12, { font: font(600, F(11, 10)), color: theme.muted, align: 'right' });
      plot.end();
    }

    function drawStock(): void {
      const g = surface.g;
      const theme = th();
      const s = sit();
      const v = VIEW[sitKey()];
      plotB.setRangePadded([0, s.T], stockRange(), { left: F(44, 36), bottom: F(24, 22), top: 22, right: 12 });
      plotB.begin();
      plotB.grid();
      plotB.axes();
      const r = plotB.rect;
      const t = shownT;
      plotB.vline(t, { color: withAlpha(col.b(), 0.35), width: 1.2, dash: [4, 4] });
      plotB.fn(B, { color: withAlpha(col.b(), 0.25), width: 2, dash: [6, 5], from: 0, to: s.T });
      // Treppe der Rechtecksummen: jeder Streifen r(tᵢ)·Δt wird zum Zuwachs
      const n = p.n;
      if (n > 0 && t > 0 && !grow.running) {
        const dt = t / n;
        const ps = partialSums(s, t, n, rule());
        const done = stackProgress();
        const pts: [number, number][] = [[0, b0()]];
        for (let i = 0; i < n; i++) {
          const f = clamp(done - i, 0, 1);
          if (f <= 0) break;
          const y0 = b0() + ps[i]!;
          const y1 = y0 + (ps[i + 1]! - ps[i]!) * f;
          plotB.polygon(
            [
              [i * dt, y0],
              [(i + 1) * dt, y0],
              [(i + 1) * dt, y1],
              [i * dt, y1],
            ],
            { fill: withAlpha(y1 >= y0 ? col.rect() : col.neg(), f < 1 ? 0.45 : 0.18), stroke: withAlpha(col.rect(), 0.8), width: 1.1 },
          );
          if (f >= 1) pts.push([(i + 1) * dt, y1]);
        }
        plotB.polyline(pts, { color: col.rect(), width: 1.6, dash: [5, 4] });
        for (const [x, y] of pts.slice(1)) plotB.point(x, y, { color: col.rect(), radius: 3.5, hollow: true });
      }
      // Extremstellen des Bestands
      for (const e of signChanges(s)) {
        const y = B(e.t);
        plotB.point(e.t, y, { color: e.kind === 'max' ? col.pos() : col.neg(), radius: 5 });
        if (p.show && Math.abs(plotB.px(e.t) - plotB.px(t)) < 70) continue;
        const lbl = p.show ? `${ctx.t(e.kind)} ${n1(y)} \\t{${v.bu}}` : ctx.t(e.kind);
        tag(plotB, plotB.px(e.t), plotB.py(y) + (e.kind === 'max' ? -16 : 16), `\\t{${lbl}}`, e.kind === 'max' ? col.pos() : col.neg(), 'center', F(11, 10));
      }
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.6)' : mixColor(col.b(), '#ffffff', 0.5, 0.6);
      g.shadowBlur = 5;
      plotB.fn(B, { color: col.b(), width: 3, from: 0, to: t });
      g.restore();
      // Tangente: Steigung = Rate
      const d = s.T * 0.07;
      const m = s.rate(t);
      plotB.segment([t - d, B(t) - m * d], [t + d, B(t) + m * d], { color: col.r(), width: 2 });
      plotB.point(t, B(t), { color: col.b(), radius: 6 });
      if (p.show) tag(plotB, plotB.px(t) - 12, plotB.py(B(t)) - 16, `\\c{b}{${n1(B(t))} \\t{${v.bu}}}`, col.b(), 'right', F(12, 11));
      text(g, `${ctx.t(`stock_${sitKey()}`)} in ${v.bu}`, plotB.px(0) + 8, r.y + 10, { font: font(700, F(12, 11)), color: col.b(), align: 'left' });
      text(g, `t in ${v.tu}`, r.x + r.w - 4, plotB.py(r.y > 0 ? stockRange()[0] : 0) - 12, { font: font(600, F(11, 10)), color: theme.muted, align: 'right' });
      plotB.end();
    }

    /* ---------- Situationsbild ---------- */
    function sceneCard(R: Rect): void {
      const g = surface.g;
      const theme = th();
      const pad = F(14, 12);
      card(R, col.b(), 0.03);
      title(R.x + pad, R.y + 16, ctx.t('sceneT'), col.b());
      const s = sit();
      const v = VIEW[sitKey()];
      const t = shownT;
      const area: Rect = { x: R.x + pad, y: R.y + 26, w: R.w - 2 * pad, h: R.h - 34 };
      if (isTank()) {
        // Tank mit Wasserstand
        let cap = 100;
        if (sitKey() === 'own') for (let i = 0; i <= 40; i++) cap = Math.max(cap, Math.ceil(B((s.T * i) / 40) / 50) * 50);
        const tw = Math.min(area.w * 0.36, 100);
        const tx = area.x + (area.w - tw) / 2 - 10;
        const ty = area.y + 4;
        const vol = B(t);
        const th2 = area.h - 8 - (vol < -0.05 ? 14 : 0);
        const level = clamp(vol / cap, 0, 1);
        const wobble = reduced ? 0 : Math.sin(performance.now() / 300) * 1.5 * (Math.abs(s.rate(t)) > 0.05 ? 1 : 0);
        g.save();
        g.beginPath();
        g.rect(tx, ty, tw, th2);
        g.clip();
        g.fillStyle = withAlpha(col.water(), theme.dark ? 0.55 : 0.45);
        g.beginPath();
        const top = ty + th2 * (1 - level);
        g.moveTo(tx, top + wobble);
        g.quadraticCurveTo(tx + tw / 2, top - wobble, tx + tw, top + wobble);
        g.lineTo(tx + tw, ty + th2);
        g.lineTo(tx, ty + th2);
        g.closePath();
        g.fill();
        g.restore();
        g.strokeStyle = theme.text;
        g.lineWidth = 2;
        g.strokeRect(tx, ty, tw, th2);
        // Zu- bzw. Abfluss-Pfeil
        const rate = s.rate(t);
        const ax = tx + tw + 18;
        const rc = rate >= 0 ? col.pos() : col.neg();
        g.fillStyle = rc;
        g.beginPath();
        const ay = ty + th2 / 2;
        const dd = rate >= 0 ? -1 : 1;
        g.moveTo(ax, ay + 14 * dd);
        g.lineTo(ax - 8, ay - 2 * dd);
        g.lineTo(ax + 8, ay - 2 * dd);
        g.closePath();
        g.fill();
        text(g, `${n1(rate)} ${v.ru}`, ax + 12, ay, { font: font(700, F(12, 11)), color: rc, align: 'left' });
        text(g, p.show ? `${n1(vol)} L` : '? L', tx + tw / 2, ty + th2 / 2, { font: font(700, F(14, 13)), color: theme.text });
        text(g, `${cap} L`, tx - 6, ty + 6, { font: font(600, 10), color: theme.muted, align: 'right' });
        if (vol < -0.05) text(g, ctx.t('empty'), R.x + R.w / 2, R.y + R.h - 9, { font: font(700, F(11, 10)), color: col.neg() });
      } else {
        // Straße mit Fahrzeug
        const total = s.change(s.T);
        const y = area.y + area.h * 0.6;
        const x0 = area.x + 8;
        const x1 = area.x + area.w - 8;
        g.strokeStyle = theme.muted;
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(x0, y + 10);
        g.lineTo(x1, y + 10);
        g.stroke();
        for (let k = 0; k <= 4; k++) {
          const xx = x0 + ((x1 - x0) * k) / 4;
          g.beginPath();
          g.moveTo(xx, y + 6);
          g.lineTo(xx, y + 14);
          g.stroke();
          text(g, `${fmt.num((total * k) / 4, 0)} m`, xx, y + 24, { font: font(600, 10), color: theme.muted });
        }
        const px = x0 + ((x1 - x0) * s.change(t)) / total;
        // Spur des bisher gefahrenen Wegs
        g.strokeStyle = withAlpha(col.b(), 0.45);
        g.lineWidth = 4;
        g.beginPath();
        g.moveTo(x0, y + 10);
        g.lineTo(px, y + 10);
        g.stroke();
        g.fillStyle = col.b();
        if (sitKey() === 'car') {
          roundRect(g, px - 18, y - 8, 30, 12, 4);
          g.fill();
          roundRect(g, px - 12, y - 16, 16, 9, 3);
          g.fill();
          g.fillStyle = theme.text;
          g.beginPath();
          g.arc(px - 10, y + 5, 4, 0, Math.PI * 2);
          g.arc(px + 6, y + 5, 4, 0, Math.PI * 2);
          g.fill();
        } else {
          g.strokeStyle = col.b();
          g.lineWidth = 2.2;
          g.beginPath();
          g.arc(px - 9, y + 2, 6, 0, Math.PI * 2);
          g.moveTo(px + 15, y + 2);
          g.arc(px + 9, y + 2, 6, 0, Math.PI * 2);
          g.moveTo(px - 9, y + 2);
          g.lineTo(px - 1, y - 9);
          g.lineTo(px + 9, y + 2);
          g.stroke();
        }
        text(g, `${n1(s.rate(t))} ${v.ru}`, clamp(px, area.x + 30, area.x + area.w - 30), y - 26, { font: font(700, F(12, 11)), color: col.r() });
      }
      text(g, `t = ${n1(t)} ${v.tu}`, R.x + R.w - pad, R.y + 16, { font: font(700, F(12, 11)), color: theme.muted, align: 'right' });
    }

    /** Zeilen der Rechnung (Formel-Kurzschrift). */
    function calcLines(): string[] {
      const s = sit();
      const v = VIEW[sitKey()];
      const t = shownT;
      const tt = n1(t);
      const u = `\\t{${v.bu}}`;
      const out = [`\\c{b}{${v.b}(${tt})} = ${v.b}(0) + \\t{∫}_0^{${tt}} \\c{r}{${v.r}(u)} du`, `= ${n1(b0())} ${u} ${p.show ? sgn(s.change(t)) : '+ ?'} ${u} = \\c{b}{${Q(n1(b0() + s.change(t)))} ${u}}`];
      const a = signedAreas(s, t, 400);
      if (a.neg < -0.05 && a.pos > 0.05) out.push(`\\t{${ctx.t('area')}:} \\c{p}{${p.show ? sgn(a.pos) : '+ ?'} ${u}} \\c{n}{${p.show ? sgn(a.neg) : '− ?'} ${u}}`);
      if (p.n > 0) out.push(`\\c{q}{\\t{${tr('rects', { rule: ctx.t(`rule_${rule()}`), n: p.n })}:}} ≈ ${Q(n1(b0() + riemannSum(s, t, p.n, rule())))} ${u}`);
      return out;
    }

    function calcCard(R: Rect, lines: string[]): void {
      const g = surface.g;
      const theme = th();
      const pad = F(14, 12);
      card(R);
      title(R.x + pad, R.y + 16, ctx.t('calcT'));
      const maxW = R.w - 2 * pad;
      const fs = F(14, 13);
      let y = R.y + 30;
      for (const src of lines) {
        const b = fitFormula(src, maxW, fs, theme.text);
        b.draw(g, R.x + pad, y + b.asc);
        y += b.asc + b.desc + 8;
      }
    }

    /** Fehler der Rechtecksumme für n = 1 … 30 als Säulen. */
    function errCard(R: Rect): void {
      const g = surface.g;
      const theme = th();
      const pad = F(14, 12);
      card(R, col.rect(), 0.03);
      title(R.x + pad, R.y + 16, ctx.t('errT'), mixColor(col.rect(), theme.text, 0.3));
      const s = sit();
      const t = tEff();
      const exact = s.change(t);
      const errs: number[] = [];
      for (let k = 1; k <= 30; k++) errs.push(riemannSum(s, t, k, rule()) - exact);
      const maxE = Math.max(...errs.map(Math.abs));
      const v = VIEW[sitKey()];
      const cur = errs[p.n - 1] ?? 0;
      if (p.show) text(g, `${ctx.t('err')}: ${sgn(cur)} ${v.bu}`, R.x + R.w - pad, R.y + 16, { font: font(700, F(12, 11)), color: mixColor(col.rect(), theme.text, 0.3), align: 'right' });
      const hint = maxE < 1e-6 ? ctx.t('zero') : rule() === 'm' ? ctx.t('halfM') : ctx.t('halfLR');
      const hintRows = wrap(hint, R.w - 2 * pad, font(600, F(11, 10))).length;
      const chart: Rect = { x: R.x + pad + 4, y: R.y + 30, w: R.w - 2 * pad - 22, h: R.h - 30 - 22 - hintRows * (F(11, 10) + 5) - 6 };
      if (chart.h > 24) {
        const bw = chart.w / 30;
        const base = chart.y + chart.h;
        g.strokeStyle = theme.muted;
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(chart.x, base + 0.5);
        g.lineTo(chart.x + chart.w, base + 0.5);
        g.stroke();
        for (let k = 1; k <= 30; k++) {
          const e = Math.abs(errs[k - 1]!);
          const h = maxE > 1e-9 ? (e / maxE) * chart.h : 0;
          const on = k === p.n;
          g.fillStyle = on ? col.rect() : withAlpha(theme.muted, theme.dark ? 0.45 : 0.35);
          g.fillRect(chart.x + (k - 1) * bw + 1, base - h, Math.max(1, bw - 2), h);
        }
        const nf = font(600, 10);
        for (const k of [1, 10, 20, 30]) text(g, String(k), chart.x + (k - 0.5) * bw, base + 9, { font: nf, color: theme.muted });
        text(g, 'n', chart.x + chart.w + 14, base + 9, { font: font(600, 11), color: theme.muted });
      }
      para(hint, R.x + pad, R.y + R.h - 8 - hintRows * (F(11, 10) + 5), R.w - 2 * pad, theme.muted, F(11, 10));
    }

    /** Absätze der Karte „Rate und Bestand“: Steigung, Extremstellen, Abfluss. */
    function linkParas(): { str: string; color: string }[] {
      const theme = th();
      const v = VIEW[sitKey()];
      const out = [{ str: tr('slope', { b: v.b, r: v.r }), color: theme.text }];
      const ext = signChanges(sit());
      if (!ext.length) out.push({ str: tr('never', { r: v.r }), color: col.pos() });
      for (const e of ext) {
        const base = tr(`ext_${e.kind}`, { t: `${n1(e.t)} ${v.tu}`, r: v.r, b: v.b });
        out.push({ str: p.show ? `${base} (${n1(B(e.t))} ${v.bu})` : base, color: e.kind === 'max' ? mixColor(col.pos(), theme.text, 0.3) : col.neg() });
      }
      if (sitKey() === 'tank' && shownT > 20) out.push({ str: ctx.t('outflow'), color: col.neg() });
      return out;
    }
    function linkHeight(w: number): number {
      const pad = F(14, 12);
      const size = F(12, 11);
      let h = 28 + 10;
      for (const q of linkParas()) h += wrap(q.str, w - 2 * pad, font(600, size)).length * (size + 5) + 4;
      return h;
    }
    function linkCard(R: Rect): void {
      const pad = F(14, 12);
      card(R, col.r(), 0.03);
      title(R.x + pad, R.y + 16, ctx.t('linkT'), col.r());
      let y = R.y + 28;
      for (const q of linkParas()) {
        if (y > R.y + R.h - 14) break;
        y = para(q.str, R.x + pad, y, R.w - 2 * pad, q.color) + 4;
      }
    }

    /* ---------- Rendern ---------- */
    function render(): void {
      const now = performance.now();
      const dt = Math.min(0.05, (now - lastFrame) / 1000);
      lastFrame = now;
      if (dragging && now - dragging > 250) dragging = 0;
      if (stackAt && now >= stackAt) {
        stackAt = 0;
        stack.play(clamp(stackN * 500, 2000, 7000));
      }
      let moving = false;
      if (play.running) shownT = play.value * sit().T;
      else {
        const goal = tEff();
        if (dragging || reduced || Math.abs(goal - shownT) < 1e-3) shownT = goal;
        else {
          shownT += (goal - shownT) * (1 - Math.exp(-dt * 6));
          moving = true;
        }
      }
      surface.begin();
      plot.resize();
      plotB.resize();
      drawRate();
      drawStock();
      const C = regions().col;
      const gap = F(10, 8);
      const h1 = Math.min(F(140, 130), C.h * 0.4);
      sceneCard({ x: C.x, y: C.y, w: C.w, h: h1 });
      const lines = calcLines();
      const hc = 40 + lines.length * F(27, 25);
      let y = C.y + h1 + gap;
      if (C.y + C.h - y > 90) {
        calcCard({ x: C.x, y, w: C.w, h: Math.min(hc, C.y + C.h - y) }, lines);
        y += hc + gap;
      }
      const rest = C.y + C.h - y;
      if (rest > (p.n > 0 ? 110 : 70)) {
        const R = { x: C.x, y, w: C.w, h: Math.min(rest, F(190, 170)) };
        if (p.n > 0) errCard(R);
        else linkCard({ ...R, h: Math.min(R.h, linkHeight(R.w)) });
      }
      const tankMoving = isTank() && !reduced && Math.abs(sit().rate(shownT)) > 0.05 && (moving || play.running);
      if (moving || dragging || play.running || grow.running || stack.running || stackAt || tankMoving) ctx.requestRender();
      else if (playEnd) {
        playEnd = false;
        ctx.set({ t: sit().T });
      }
    }

    return {
      update(changed, source) {
        if (changed.has('sit') && source === 'input' && p.t > sit().T) ctx.set({ t: sit().T });
        if (changed.has('sit') && source !== 'init') shownT = tEff();
        if ((changed.has('n') || changed.has('rule')) && p.n > 0 && source !== 'init' && !reduced) {
          stack.finish();
          stackAt = 0;
          grow.play(GROW_MS);
        }
        updateReadouts();
        ctx.requestRender();
      },
      action(id) {
        if (id === 'play') {
          play.play(reduced ? 1 : PLAY_MS);
          playEnd = true;
        } else if (id === 'dbl') {
          ctx.set({ n: p.n === 0 ? 1 : Math.min(30, p.n * 2) });
        } else if (id === 'stack') {
          if (p.n === 0) ctx.set({ n: 6 });
          stackN = p.n;
          if (grow.running) stackAt = performance.now() + GROW_MS;
          else stack.play(reduced ? 1 : clamp(stackN * 500, 2000, 7000));
        }
        ctx.requestRender();
      },
      render,
      destroy: () => surface.destroy(),
    };
  },
});
