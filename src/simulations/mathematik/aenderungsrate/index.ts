import { defineSimulation, ease, mixColor, Plot, prefersReducedMotion, roundRect, Surface, text, Tween, withAlpha, type Rect } from '../../../sim-core';
import { formula, type FormulaStyle } from './formula';
import { leftSum, SITS, type SitKey } from './model';

const L = (de: string, en: string) => ({ de, en });
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

const PLAY_MS = 7000;

/** Darstellung, Einheiten und Bezeichnungen je Situation. */
const VIEW: Record<SitKey, { y: [number, number]; Y: [number, number]; tu: string; ru: string; bu: string; r: string; b: string }> = {
  car: { y: [-2, 24], Y: [-60, 900], tu: 's', ru: 'm/s', bu: 'm', r: 'v', b: 's' },
  tank: { y: [-5, 5], Y: [-10, 110], tu: 'min', ru: 'L/min', bu: 'L', r: 'r', b: 'V' },
  bike: { y: [-1, 9], Y: [-40, 800], tu: 's', ru: 'm/s', bu: 'm', r: 'v', b: 's' },
};

/**
 * Integral als Gesamtänderung: oben die Änderungsrate (Geschwindigkeit bzw.
 * Zuflussrate) mit der Fläche bis zum Zeitpunkt t und wahlweise Rechteck-
 * streifen r(tᵢ) · Δt, unten der rekonstruierte Bestand (Weg bzw.
 * Füllmenge). Ein kleines Bild zeigt das fahrende Auto, das Rad oder den
 * Wasserstand im Tank.
 */
export default defineSimulation({
  id: 'aenderungsrate',
  dragHint: true,
  layout: { aspect: 1.62, aspectNarrow: 0.44 },
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'sit',
      type: 'choice',
      label: L('Situation', 'Situation'),
      options: [
        { value: 'car', label: L('Autofahrt (Geschwindigkeit → Weg)', 'Car journey (velocity → distance)') },
        { value: 'tank', label: L('Wassertank (Zufluss → Füllmenge)', 'Water tank (inflow → volume)') },
        { value: 'bike', label: L('Radfahrt (Geschwindigkeit → Weg)', 'Bike ride (velocity → distance)') },
      ],
      default: 'car',
    },
    { key: 't', type: 'number', label: L('Zeitpunkt t', 'Time t'), min: 0, max: 120, step: 0.5, default: 25, help: L('Auch t auf der Zeitachse ziehen.', 'You can also drag t along the time axis.') },
    { key: 'n', type: 'number', label: L('Rechteckstreifen', 'Rectangles'), min: 0, max: 30, step: 1, default: 0, help: L('0: keine Streifen, nur die exakte Fläche.', '0: no rectangles, only the exact area.') },
    { key: 'v0', type: 'number', label: L('Anfangsmenge im Tank', 'Initial volume in the tank'), min: 0, max: 60, step: 1, default: 30, unit: 'L', visibleIf: (v) => v.sit === 'tank' },
    { key: 'show', type: 'boolean', group: 'view', label: L('Werte zeigen', 'Show values'), help: L('Aus: Gesamtänderung selbst berechnen.', 'Off: work out the total change yourself.'), default: true },
  ],
  actions: [{ id: 'play', label: L('Ablauf abspielen', 'Play the process'), primary: true }],
  readouts: [
    { key: 'chg', label: L('Gesamtänderung', 'Total change'), spoiler: true },
    { key: 'stock', label: L('Bestand', 'Amount'), spoiler: true },
  ],
  presets: [
    { id: 'car', label: L('Autofahrt', 'Car journey'), values: {} },
    { id: 'carEnd', label: L('Ganze Fahrt: 800 m', 'Whole journey: 800 m'), values: { sit: 'car', t: 60 } },
    { id: 'rect', label: L('Rechtecke: Weg ≈ Σ v · Δt', 'Rectangles: distance ≈ Σ v · Δt'), values: { sit: 'car', t: 60, n: 6 } },
    { id: 'tank', label: L('Tank: Zufluss wird Abfluss', 'Tank: inflow turns into outflow'), values: { sit: 'tank', t: 30, v0: 30 } },
    { id: 'bike', label: L('Radfahrt', 'Bike ride'), values: { sit: 'bike', t: 90, n: 0 } },
  ],
  strings: {
    de: {
      canvas: 'Oben die Änderungsrate (Geschwindigkeit oder Zuflussrate) über der Zeit mit der Fläche bis zum Zeitpunkt t und wahlweise Rechteckstreifen; unten der daraus rekonstruierte Bestand (Weg oder Füllmenge). Daneben ein Bild der Situation und die Rechnung.',
      sceneT: 'Situation',
      calcT: 'Gesamtänderung',
      rate_car: 'Geschwindigkeit v(t)',
      rate_tank: 'Zuflussrate r(t)',
      rate_bike: 'Geschwindigkeit v(t)',
      stock_car: 'Weg s(t)',
      stock_tank: 'Füllmenge V(t)',
      stock_bike: 'Weg s(t)',
      rects: 'Rechtecksumme mit {n} Streifen',
      outflow: 'Negative Rate: Wasser fließt ab – die Füllmenge sinkt.',
      after: 'nach {t}',
    },
    en: {
      canvas: 'Top: the rate of change (velocity or inflow rate) over time with the area up to time t and optional rectangles; bottom: the reconstructed amount (distance or volume). Next to it a picture of the situation and the calculation.',
      sceneT: 'Situation',
      calcT: 'Total change',
      rate_car: 'velocity v(t)',
      rate_tank: 'inflow rate r(t)',
      rate_bike: 'velocity v(t)',
      stock_car: 'distance s(t)',
      stock_tank: 'volume V(t)',
      stock_bike: 'distance s(t)',
      rects: 'rectangle sum with {n} strips',
      outflow: 'Negative rate: water flows out – the volume decreases.',
      after: 'after {t}',
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
    const sit = () => SITS[sitKey()];
    const tEff = () => clamp(p.t, 0, sit().T);
    const b0 = () => (sitKey() === 'tank' ? p.v0 : 0);

    const col = {
      r: () => th().series[0]!,
      b: () => th().series[3]!,
      pos: () => th().series[2]!,
      neg: () => th().series[1]!,
      rect: () => th().series[4]!,
      water: () => th().series[5]!,
    };
    const n1 = (v: number) => fmt.num(Math.abs(v) < 0.05 ? 0 : v, 1);
    const Q = (s: string) => (p.show ? s : '?');

    /* ---------- Aufteilung ---------- */
    function regions(): { top: Rect; bot: Rect; col: Rect } {
      const w = surface.width;
      const h = surface.height;
      let left: Rect;
      let colR: Rect;
      if (!wideLayout()) {
        const ph = Math.round(clamp(w * 1.1, 300, h * 0.55));
        left = { x: 0, y: 0, w, h: ph };
        colR = { x: 2, y: ph + 6, w: w - 4, h: h - ph - 8 };
      } else {
        const cw = Math.round(clamp(w * 0.36, 260, 360));
        left = { x: 0, y: 0, w: w - cw - 10, h };
        colR = { x: w - cw, y: 2, w: cw - 2, h: h - 4 };
      }
      const t1 = Math.round(left.h * 0.5);
      return { top: { ...left, h: t1 }, bot: { x: left.x, y: left.y + t1 + 6, w: left.w, h: left.h - t1 - 6 }, col: colR };
    }
    const plot = new Plot(surface, { x: [0, 60], y: [0, 20], equalAspect: false, pan: false, zoom: false, controls: false, region: () => regions().top, xAxis: { label: '' }, yAxis: { label: '' } });
    const plotB = new Plot(surface, { x: [0, 60], y: [0, 800], equalAspect: false, pan: false, zoom: false, controls: false, region: () => regions().bot, xAxis: { label: '' }, yAxis: { label: '' } });

    /* ---------- Zustand ---------- */
    let shownT = tEff();
    let lastFrame = performance.now();
    let dragging = 0;
    const play = new Tween(PLAY_MS, ease.linear);
    let playEnd = false;

    plot.addHandle({
      get: () => [shownT, 0],
      set: (x) => {
        dragging = performance.now();
        ctx.set({ t: Math.round(clamp(x, 0, sit().T) * 2) / 2 });
      },
      axis: 'x',
      enabled: () => !ctx.locked && !play.running,
      color: () => col.b(),
    });

    /* ---------- Ergebnisse ---------- */
    function updateReadouts(): void {
      const v = VIEW[sitKey()];
      const t = tEff();
      const c = sit().change(t);
      ctx.readout('chg', `${n1(c)} ${v.bu}`);
      ctx.readout('stock', `${v.b}(${n1(t)}) = ${n1(b0() + c)} ${v.bu}`);
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
      // Rechteckstreifen
      if (p.n > 0 && t > 0) {
        const dt = t / p.n;
        for (let i = 0; i < p.n; i++) {
          const h = s.rate(i * dt);
          plot.polygon(
            [
              [i * dt, 0],
              [(i + 1) * dt, 0],
              [(i + 1) * dt, h],
              [i * dt, h],
            ],
            { fill: withAlpha(col.rect(), theme.dark ? 0.25 : 0.16), stroke: col.rect(), width: 1.4 },
          );
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
      text(g, `${ctx.t(`rate_${sitKey()}`)} in ${v.ru}`, plot.px(0) + 8, r.y + 10, { font: font(700, F(12, 11)), color: col.r(), align: 'left' });
      text(g, `t in ${v.tu}`, r.x + r.w - 4, plot.py(0) - 12, { font: font(600, F(11, 10)), color: theme.muted, align: 'right' });
      plot.end();
    }

    function drawStock(): void {
      const g = surface.g;
      const theme = th();
      const s = sit();
      const v = VIEW[sitKey()];
      plotB.setRangePadded([0, s.T], v.Y, { left: F(44, 36), bottom: F(24, 22), top: 22, right: 12 });
      plotB.begin();
      plotB.grid();
      plotB.axes();
      const r = plotB.rect;
      const B = (u: number) => b0() + s.change(u);
      plotB.fn(B, { color: withAlpha(col.b(), 0.25), width: 2, dash: [6, 5], from: 0, to: s.T });
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.6)' : mixColor(col.b(), '#ffffff', 0.5, 0.6);
      g.shadowBlur = 5;
      plotB.fn(B, { color: col.b(), width: 3, from: 0, to: shownT });
      g.restore();
      const t = shownT;
      // Rechtecksumme als Vergleichspunkt
      if (p.n > 0 && t > 0) {
        const approx = b0() + leftSum(s, t, p.n);
        plotB.point(t, approx, { color: col.rect(), radius: 5, hollow: true });
      }
      plotB.point(t, B(t), { color: col.b(), radius: 6 });
      if (p.show) tag(plotB, plotB.px(t) - 10, plotB.py(B(t)) - 14, `\\c{b}{${n1(B(t))} \\t{${v.bu}}}`, col.b(), 'right', F(12, 11));
      text(g, `${ctx.t(`stock_${sitKey()}`)} in ${v.bu}`, plotB.px(0) + 8, r.y + 10, { font: font(700, F(12, 11)), color: col.b(), align: 'left' });
      text(g, `t in ${v.tu}`, r.x + r.w - 4, plotB.py(0) - 12, { font: font(600, F(11, 10)), color: theme.muted, align: 'right' });
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
      if (sitKey() === 'tank') {
        // Tank mit Wasserstand
        const tw = Math.min(area.w * 0.4, 110);
        const tx = area.x + (area.w - tw) / 2;
        const ty = area.y + 4;
        const th2 = area.h - 8;
        const level = clamp((b0() + s.change(t)) / 100, 0, 1);
        g.fillStyle = withAlpha(col.water(), theme.dark ? 0.55 : 0.45);
        g.fillRect(tx, ty + th2 * (1 - level), tw, th2 * level);
        g.strokeStyle = theme.text;
        g.lineWidth = 2;
        g.strokeRect(tx, ty, tw, th2);
        // Zu- bzw. Abfluss-Pfeil
        const rate = s.rate(t);
        const ax = tx + tw + 18;
        g.fillStyle = rate >= 0 ? col.pos() : col.neg();
        g.beginPath();
        const ay = ty + th2 / 2;
        const d = rate >= 0 ? -1 : 1;
        g.moveTo(ax, ay + 14 * d);
        g.lineTo(ax - 8, ay - 2 * d);
        g.lineTo(ax + 8, ay - 2 * d);
        g.closePath();
        g.fill();
        text(g, `${n1(rate)} ${v.ru}`, ax + 12, ay, { font: font(700, F(12, 11)), color: rate >= 0 ? col.pos() : col.neg(), align: 'left' });
        text(g, p.show ? `${n1(b0() + s.change(t))} L` : '? L', tx + tw / 2, ty + th2 / 2, { font: font(700, F(14, 13)), color: theme.text });
        text(g, '100 L', tx - 6, ty + 6, { font: font(600, 10), color: theme.muted, align: 'right' });
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
        text(g, `${n1(s.rate(t))} ${v.ru}`, px, y - 26, { font: font(700, F(12, 11)), color: col.r() });
      }
      text(g, `t = ${n1(t)} ${v.tu}`, R.x + R.w - pad, R.y + 16, { font: font(700, F(12, 11)), color: theme.muted, align: 'right' });
    }

    function calcCard(R: Rect): void {
      const g = surface.g;
      const theme = th();
      const pad = F(14, 12);
      card(R);
      title(R.x + pad, R.y + 16, ctx.t('calcT'));
      const s = sit();
      const v = VIEW[sitKey()];
      const t = shownT;
      const maxW = R.w - 2 * pad;
      const fs = F(14, 13);
      let y = R.y + 30;
      const line = (src: string, color = theme.text) => {
        const b = fitFormula(src, maxW, fs, color);
        b.draw(g, R.x + pad, y + b.asc);
        y += b.asc + b.desc + 8;
      };
      const tt = n1(t);
      line(`\\c{b}{${v.b}(${tt})} = ${v.b}(0) + \\t{∫}_0^{${tt}} \\c{r}{${v.r}(u)} du`);
      const u = `\\t{${v.bu}}`;
      line(`= ${n1(b0())} ${u} + ${Q(n1(s.change(t)))} ${u} = \\c{b}{${Q(n1(b0() + s.change(t)))} ${u}}`);
      if (p.n > 0) line(`\\c{q}{\\t{${tr('rects', { n: p.n })}:}} ≈ ${Q(n1(leftSum(s, t, p.n)))} ${u}`);
      if (sitKey() === 'tank' && t > 20) {
        const nf = font(600, F(12, 11));
        text(g, ctx.t('outflow'), R.x + pad, y + 6, { font: nf, color: col.neg(), align: 'left' });
      }
    }

    /* ---------- Rendern ---------- */
    function render(): void {
      const now = performance.now();
      const dt = Math.min(0.05, (now - lastFrame) / 1000);
      lastFrame = now;
      if (dragging && now - dragging > 250) dragging = 0;
      let moving = false;
      if (play.running) shownT = play.value * sit().T;
      else {
        const goal = tEff();
        if (dragging || reduced || Math.abs(goal - shownT) < 1e-3) shownT = goal;
        else {
          shownT += (goal - shownT) * (1 - Math.exp(-dt * 8));
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
      const h1 = Math.min(F(150, 140), C.h * 0.5);
      sceneCard({ x: C.x, y: C.y, w: C.w, h: h1 });
      if (C.h - h1 - gap > 90) calcCard({ x: C.x, y: C.y + h1 + gap, w: C.w, h: Math.min(C.h - h1 - gap, F(170, 160)) });
      if (moving || dragging || play.running) ctx.requestRender();
      else if (playEnd) {
        playEnd = false;
        ctx.set({ t: sit().T });
      }
    }

    return {
      update(changed, source) {
        if (changed.has('sit') && source === 'input' && p.t > sit().T) ctx.set({ t: sit().T });
        if (changed.has('sit')) shownT = tEff();
        updateReadouts();
        ctx.requestRender();
      },
      action(id) {
        if (id !== 'play') return;
        play.play(reduced ? 1 : PLAY_MS);
        playEnd = true;
        ctx.requestRender();
      },
      render,
      destroy: () => surface.destroy(),
    };
  },
});
