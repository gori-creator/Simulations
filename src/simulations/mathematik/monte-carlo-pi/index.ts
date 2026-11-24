import { defineSimulation, drawImageFit, ease, Plot, prefersReducedMotion, roundRect, seededRandom, softShadow, Surface, text, withAlpha, type Rect } from '../../../sim-core';
import {
  buffonEstimate,
  buffonFunnel,
  estimateIsExact,
  estimatePi,
  insideQuarterCircle,
  needleCrosses,
  PARABOLA_AREA,
  piFunnel,
  shareFunnel,
  underParabola,
} from './model';

const L = (de: string, en: string) => ({ de, en });
/** So viele Punkte werden gespeichert und gezeichnet; darüber wird nur gezählt. */
const MAX_POINTS = 120_000;
const MAX_HISTORY = 500_000;
const RING_MS = 700;
/** So viele Nadeln werden höchstens gezeichnet (sonst wird das Blatt schwarz). */
const MAX_NEEDLES = 4000;
/** Linienabstand der Nadel-Variante im Einheitsquadrat (vier Streifen). */
const SPACING = 0.25;

function layout(w: number, h: number): { field: Rect; chart: Rect } {
  // Nebeneinander, sobald die Bühne breit genug oder deutlich breiter als hoch ist (iPad, Laptop)
  if (w >= 700 || w > h * 1.25) {
    const side = Math.min(h - 40, w * 0.46);
    return {
      field: { x: 24, y: (h - side) / 2, w: side, h: side },
      chart: { x: side + 56, y: 12, w: w - side - 68, h: h - 24 },
    };
  }
  const side = Math.min(w - 48, h * 0.54);
  return {
    field: { x: (w - side) / 2, y: 30, w: side, h: side },
    chart: { x: 8, y: side + 52, w: w - 16, h: h - side - 60 },
  };
}

/**
 * Monte-Carlo-Methode: Zufallspunkte im Quadrat – der Anteil im (Viertel-)Kreis
 * nähert sich π/4. Die Punkte „regnen“ animiert ein; das Diagramm zeigt, wie
 * sich der Schätzwert 4·k/n mit wachsendem n stabilisiert. Dazu das
 * Buffonsche Nadelproblem (π aus fallenden Nadeln) und die Fläche unter einer
 * Parabel als Beispiel, dass die Methode für beliebige Flächen funktioniert.
 */
export default defineSimulation({
  id: 'monte-carlo-pi',
  animated: true,
  layout: { aspect: 1.8, aspectNarrow: 0.62 },
  groups: [
    { id: 'view', label: L('Anzeige', 'Display') },
    { id: 'anim', label: L('Automatisch', 'Automatic') },
  ],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Versuch', 'Experiment'),
      options: [
        { value: 'circle', label: L('Punkte im Kreis', 'Points in a circle') },
        { value: 'needle', label: L('Nadeln werfen (Buffon)', 'Dropping needles (Buffon)') },
        { value: 'area', label: L('Fläche unter einer Parabel', 'Area under a parabola') },
      ],
      default: 'circle',
    },
    {
      key: 'shape',
      type: 'choice',
      label: L('Figur', 'Shape'),
      options: [
        { value: 'quarter', label: L('Viertelkreis im Einheitsquadrat', 'Quarter circle in the unit square') },
        { value: 'full', label: L('Kreis im Quadrat', 'Circle in a square') },
      ],
      default: 'quarter',
      visibleIf: (v) => v.mode === 'circle',
    },
    { key: 'len', type: 'number', label: L('Nadellänge l (in Linienabständen)', 'Needle length l (in line spacings)'), min: 0.2, max: 1, step: 0.1, default: 1, visibleIf: (v) => v.mode === 'needle' },
    { key: 'funnel', type: 'boolean', group: 'view', label: L('Trichter (95 % der Schätzwerte)', 'Funnel (95 % of estimates)'), default: true },
    { key: 'logScale', type: 'boolean', group: 'view', label: L('Anzahl n logarithmisch', 'Logarithmic n axis'), default: true },
    { key: 'speed', type: 'number', group: 'anim', label: L('Punkte pro Sekunde', 'Points per second'), min: 1, max: 2000, step: 1, default: 40 },
  ],
  actions: [
    { id: 'one', label: L('1 Punkt', '1 point'), primary: true },
    { id: 'ten', label: L('10 Punkte', '10 points') },
    { id: 'hundred', label: L('100 Punkte', '100 points') },
    { id: 'thousand', label: L('1000 Punkte', '1000 points') },
    { id: 'reset', label: L('Neu beginnen', 'Start over') },
  ],
  images: {
    paper: 'papier.webp',
  },
  readouts: [
    { key: 'n', label: L('Anzahl der Versuche n', 'Number of trials n') },
    { key: 'k', label: L('Davon im Kreis k', 'Inside the circle k') },
    { key: 'kn', label: L('Davon kreuzen k', 'Crossing a line k') },
    { key: 'ka', label: L('Davon unter der Parabel k', 'Below the parabola k') },
    { key: 'estimate', label: L('Schätzwert', 'Estimate') },
    { key: 'error', label: L('Abweichung von π', 'Deviation from π'), spoiler: true },
    { key: 'errA', label: L('Abweichung von 1/3', 'Deviation from 1/3'), spoiler: true },
  ],
  presets: [
    { id: 'quarter', label: L('Viertelkreis', 'Quarter circle'), values: {} },
    { id: 'full', label: L('Ganzer Kreis', 'Full circle'), values: { shape: 'full' } },
    { id: 'fast', label: L('Schnell (1000/s)', 'Fast (1000/s)'), values: { speed: 1000 } },
    { id: 'linear', label: L('Lineare Achse', 'Linear axis'), values: { logScale: false } },
    { id: 'needle', label: L('Buffonsche Nadel', 'Buffon’s needle'), values: { mode: 'needle' } },
    { id: 'area', label: L('Fläche unter y = x²', 'Area under y = x²'), values: { mode: 'area' } },
  ],
  strings: {
    de: {
      canvas: 'Ein Quadrat mit (Viertel-)Kreis: Zufallspunkte im Kreis als runde Punkte, außerhalb als kleine Quadrate, dazu Zähler. Daneben bzw. darunter ein Diagramm: Schätzwert 4 · k/n über der Anzahl n, gestrichelte Linie bei π und Trichter mit 95 % der Schätzwerte.',
      inside: 'im Kreis',
      outside: 'außerhalb',
      ratio: 'Kreisfläche : Quadratfläche = π : 4',
      start: 'Punkte setzen, um zu beginnen',
      ghost: 'Beispielverlauf – deine Punkte ersetzen ihn',
      estimate: 'π ≈ 4 · k/n',
      drawn: 'gezeichnet: die ersten {n} Punkte',
      drawnNeedles: 'gezeichnet: die ersten {n} Nadeln',
      cross: 'kreuzen',
      noCross: 'kreuzen nicht',
      below: 'darunter',
      above: 'darüber',
      ratioNeedle: 'P(Nadel kreuzt) = 2l : (π · d)',
      ratioArea: 'Anteil unter der Parabel ≈ Fläche',
      estimateNeedle: 'π ≈ 2 · l · n/k',
      noHit: 'Noch keine Nadel kreuzt – weiterwerfen!',
      b1: '1 Punkt',
      b10: '10 Punkte',
      b100: '100 Punkte',
      b1000: '1000 Punkte',
      n1: '1 Nadel',
      n10: '10 Nadeln',
      n100: '100 Nadeln',
      n1000: '1000 Nadeln',
    },
    en: {
      canvas: 'A square with a (quarter) circle; random points inside the circle as round dots, outside as small squares, with counters. Next to or below it, a chart of the estimate 4 · k/n against the number n, a dashed line at π and a funnel containing 95 % of the estimates.',
      inside: 'inside',
      outside: 'outside',
      ratio: 'circle area : square area = π : 4',
      start: 'Add points to start',
      ghost: 'Example run – your points replace it',
      estimate: 'π ≈ 4 · k/n',
      drawn: 'drawn: the first {n} points',
      drawnNeedles: 'drawn: the first {n} needles',
      cross: 'cross',
      noCross: 'do not cross',
      below: 'below',
      above: 'above',
      ratioNeedle: 'P(needle crosses) = 2l : (π · d)',
      ratioArea: 'share below the parabola ≈ area',
      estimateNeedle: 'π ≈ 2 · l · n/k',
      noHit: 'No needle crosses yet – keep dropping!',
      b1: '1 point',
      b10: '10 points',
      b100: '100 points',
      b1000: '1000 points',
      n1: '1 needle',
      n10: '10 needles',
      n100: '100 needles',
      n1000: '1000 needles',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const plot = new Plot(surface, {
      x: [-0.15, 2.15],
      y: [2.3, 4.0],
      equalAspect: false,
      pan: false,
      zoom: false,
      region: (w, h) => layout(w, h).chart,
      xAxis: { label: 'n' },
      yAxis: { label: '' },
    });

    // Punkte im Einheitsquadrat [0, 1]² (beim ganzen Kreis: [−1, 1]² skaliert)
    let xs = new Float32Array(1024);
    let ys = new Float32Array(1024);
    // Winkel der Nadeln (nur Buffon)
    let as = new Float32Array(1024);
    let stored = 0;
    let n = 0;
    let k = 0;
    let history: number[] = [];
    let xMax = 2;
    let carry = 0;
    // Punkte, die nach und nach erscheinen (Knöpfe 10/100/1000)
    let queue = 0;
    let queueRate = 0;
    let queueLast = 0;
    const rings: { x: number; y: number; a: number; inside: boolean; t: number }[] = [];

    /** Treffer je nach Versuch: im Kreis, Nadel kreuzt eine Linie, unter der Parabel. */
    function hit(x: number, y: number, a: number): boolean {
      if (p.mode === 'needle') return needleCrosses(y / SPACING, a, p.len);
      if (p.mode === 'area') return underParabola(x, y);
      // Beim ganzen Kreis liegen die Punkte in [−1, 1]²; die Bedingung ist dieselbe.
      return p.shape === 'full' ? insideQuarterCircle(2 * x - 1, 2 * y - 1) : insideQuarterCircle(x, y);
    }
    /** Schätzwert aus k Treffern bei n Versuchen. */
    function estimateOf(hits: number, total: number): number {
      if (p.mode === 'needle') return buffonEstimate(hits, total, p.len);
      if (p.mode === 'area') return total > 0 ? hits / total : NaN;
      return estimatePi(hits, total);
    }
    const target = () => (p.mode === 'area' ? PARABOLA_AREA : Math.PI);
    function funnelOf(total: number): number {
      if (p.mode === 'needle') return buffonFunnel(total, p.len);
      if (p.mode === 'area') return shareFunnel(total, PARABOLA_AREA);
      return piFunnel(total);
    }

    // Bereits gezeichnete Punkte liegen auf einer eigenen Ebene
    const layer = document.createElement('canvas');
    const lg = layer.getContext('2d')!;
    let layerKey = '';
    let layerCount = 0;

    function reset(): void {
      xs = new Float32Array(1024);
      ys = new Float32Array(1024);
      as = new Float32Array(1024);
      stored = 0;
      n = 0;
      k = 0;
      history = [];
      carry = 0;
      queue = 0;
      rings.length = 0;
      layerCount = 0;
      layerKey = '';
      fitRange(true);
    }

    function niceCeil(value: number): number {
      const base = 10 ** Math.floor(Math.log10(Math.max(value, 1)));
      for (const m of [1, 2, 5, 10]) if (m * base >= value) return m * base;
      return 10 * base;
    }

    function fitRange(force = false): void {
      const target = p.logScale ? Math.max(2, Math.ceil(Math.log10(Math.max(n, 1)) + 0.01)) : Math.max(20, niceCeil(n * 1.1));
      if (!force && target <= xMax) return;
      xMax = target;
      plot.setRangePadded([0, xMax], p.mode === 'area' ? [0.18, 0.49] : [2.4, 3.9], { left: 46, right: 18, top: 10, bottom: 26 });
      plot.setAxes({ x: p.logScale ? { label: 'n', minStep: 1, format: (v) => fmt.num(10 ** v, 0) } : { label: 'n' } });
    }

    function addPoints(count: number, animate: boolean): void {
      const now = performance.now();
      for (let i = 0; i < count; i++) {
        const x = Math.random();
        const y = Math.random();
        const a = Math.random() * Math.PI;
        const inside = hit(x, y, a);
        n++;
        if (inside) k++;
        if (stored < MAX_POINTS) {
          if (stored >= xs.length) {
            const nx = new Float32Array(xs.length * 2);
            const ny = new Float32Array(ys.length * 2);
            const na = new Float32Array(as.length * 2);
            nx.set(xs);
            ny.set(ys);
            na.set(as);
            xs = nx;
            ys = ny;
            as = na;
          }
          xs[stored] = x;
          ys[stored] = y;
          as[stored] = a;
          stored++;
        }
        if (history.length < MAX_HISTORY) history.push(estimateOf(k, n));
        if (animate) {
          rings.push({ x, y, a, inside, t: now + i * 4 });
          if (rings.length > 60) rings.shift();
        }
      }
      fitRange();
      updateReadouts();
    }

    function enqueue(count: number, ms: number): void {
      queue += count;
      queueRate = queue / ms;
      queueLast = performance.now();
    }

    function updateReadouts(): void {
      ctx.readout('n', fmt.num(n, 0));
      for (const key of ['k', 'kn', 'ka', 'error', 'errA']) ctx.readout(key, null);
      if (p.mode !== 'circle') {
        const share = n ? `${fmt.num(k, 0)} (≈ ${fmt.fixed((k / n) * 100, 1)} %)` : '0';
        ctx.readout(p.mode === 'needle' ? 'kn' : 'ka', share);
        const est = estimateOf(k, n);
        if (p.mode === 'needle') {
          ctx.readout(
            'estimate',
            !n
              ? ctx.t('start')
              : k === 0
                ? ctx.t('noHit')
                : { html: `π ≈ 2 · ${fmt.num(p.len, 1)} · <span class="frac"><span>${fmt.num(n, 0)}</span><span>${fmt.num(k, 0)}</span></span> ≈ <strong>${fmt.fixed(est, 4)}</strong>` },
          );
          ctx.readout('error', n && k ? `≈ ${fmt.fixed(Math.abs(est - Math.PI), 4)} (π = ${fmt.num(Math.PI, 5)}…)` : '–');
        } else {
          ctx.readout('estimate', n ? { html: `<var>A</var> ≈ <span class="frac"><span>${fmt.num(k, 0)}</span><span>${fmt.num(n, 0)}</span></span> ≈ <strong>${fmt.fixed(est, 4)}</strong>` } : ctx.t('start'));
          ctx.readout('errA', n ? `≈ ${fmt.fixed(Math.abs(est - PARABOLA_AREA), 4)} (1/3 = ${fmt.num(1 / 3, 5)}…)` : '–');
        }
        return;
      }
      // Anteil in Prozent: „=“-Fall ohne Zeichen, gerundeter Wert mit „≈“ und Endnull
      const shareExact = n > 0 && (k * 1000) % n === 0;
      ctx.readout('k', n ? `${fmt.num(k, 0)} (${shareExact ? fmt.num((k / n) * 100, 1) : `≈ ${fmt.fixed((k / n) * 100, 1)}`} %)` : '0');
      ctx.readout(
        'estimate',
        n
          ? {
              html: `π ≈ 4 · <span class="frac"><span>${fmt.num(k, 0)}</span><span>${fmt.num(n, 0)}</span></span> ${
                estimateIsExact(k, n, 4) ? `= <strong>${fmt.num(estimatePi(k, n), 4)}</strong>` : `≈ <strong>${fmt.fixed(estimatePi(k, n), 4)}</strong>`
              }`,
            }
          : ctx.t('start'),
      );
      // π ist irrational: die Abweichung ist immer gerundet
      ctx.readout('error', n ? `≈ ${fmt.fixed(Math.abs(estimatePi(k, n) - Math.PI), 4)} (π = ${fmt.num(Math.PI, 5)}…)` : '–');
    }

    function insideAt(i: number): boolean {
      return hit(xs[i]!, ys[i]!, as[i]!);
    }

    /** Halbe Nadel als Vektor in Pixeln (Feldbreite w). */
    function needleHalf(a: number, w: number): [number, number] {
      const h = (p.len * SPACING * w) / 2;
      return [Math.cos(a) * h, -Math.sin(a) * h];
    }

    /* ---------- Zeichnen ---------- */
    function pointRadius(side: number): number {
      return Math.max(1.1, side / 150);
    }

    function syncLayer(field: Rect): void {
      const dpr = surface.dpr;
      const key = `${field.w}|${dpr}|${ctx.theme.dark}|${ctx.theme.series[0]}|${p.shape}|${p.mode}|${p.len}`;
      if (key !== layerKey) {
        layer.width = Math.round(field.w * dpr);
        layer.height = Math.round(field.h * dpr);
        layerKey = key;
        layerCount = 0;
      }
      let upTo = stored - rings.filter((r) => performance.now() < r.t + RING_MS).length;
      if (p.mode === 'needle') upTo = Math.min(upTo, MAX_NEEDLES);
      if (upTo <= layerCount) return;
      lg.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (p.mode === 'needle') {
        // Kreuzende Nadeln kräftig, die anderen dünner (nicht nur über die Farbe unterscheidbar)
        const alpha = upTo > 600 ? 0.55 : 1;
        for (let pass = 0; pass < 2; pass++) {
          lg.strokeStyle = withAlpha(pass === 0 ? ctx.theme.series[0]! : ctx.theme.series[1]!, alpha);
          lg.lineWidth = pass === 0 ? 2 : 1.2;
          lg.lineCap = 'round';
          lg.beginPath();
          for (let i = layerCount; i < upTo; i++) {
            if (insideAt(i) !== (pass === 0)) continue;
            const [hx, hy] = needleHalf(as[i]!, field.w);
            const px = xs[i]! * field.w;
            const py = (1 - ys[i]!) * field.h;
            lg.moveTo(px - hx, py - hy);
            lg.lineTo(px + hx, py + hy);
          }
          lg.stroke();
        }
        layerCount = upTo;
        return;
      }
      const r = pointRadius(field.w);
      const colors = [ctx.theme.series[0]!, ctx.theme.series[1]!];
      for (let pass = 0; pass < 2; pass++) {
        lg.fillStyle = colors[pass]!;
        lg.beginPath();
        for (let i = layerCount; i < upTo; i++) {
          if (insideAt(i) !== (pass === 0)) continue;
          const px = xs[i]! * field.w;
          const py = (1 - ys[i]!) * field.h;
          // Treffer als Kreis, Nicht-Treffer als Quadrat (nicht nur über die Farbe unterscheidbar)
          if (pass === 0) {
            lg.moveTo(px + r, py);
            lg.arc(px, py, r, 0, Math.PI * 2);
          } else lg.rect(px - r * 0.9, py - r * 0.9, r * 1.8, r * 1.8);
        }
        lg.fill();
      }
      layerCount = upTo;
    }

    function drawField(field: Rect, now: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const { x, y, w, h } = field;
      // Blatt mit Schatten
      g.save();
      softShadow(g, theme.dark, 20, 6);
      g.fillStyle = theme.bg;
      g.fillRect(x, y, w, h);
      g.restore();
      const paper = ctx.images.get('paper');
      if (paper) {
        g.save();
        g.globalAlpha = theme.dark ? 0.18 : 0.9;
        drawImageFit(g, paper, field, 'cover');
        g.restore();
      }
      if (p.mode !== 'circle') {
        drawOtherField(field, now);
        return;
      }
      // Kreisfläche
      const cx = p.shape === 'full' ? x + w / 2 : x;
      const cy = p.shape === 'full' ? y + h / 2 : y + h;
      const radius = p.shape === 'full' ? w / 2 : w;
      g.save();
      g.beginPath();
      g.rect(x, y, w, h);
      g.clip();
      g.beginPath();
      g.moveTo(cx, cy);
      g.arc(cx, cy, radius, 0, Math.PI * 2);
      g.fillStyle = withAlpha(theme.series[0]!, theme.dark ? 0.1 : 0.07);
      g.fill();
      g.restore();

      // Punkte
      syncLayer(field);
      g.drawImage(layer, x, y, w, h);
      const r = pointRadius(w);
      for (const ring of rings) {
        const age = (now - ring.t) / RING_MS;
        if (age < 0) continue;
        const color = ring.inside ? theme.series[0]! : theme.series[1]!;
        const px = x + ring.x * w;
        const py = y + (1 - ring.y) * h;
        const a = Math.min(1, age);
        // Tropfen fällt kurz ein, dann breitet sich ein Ring aus
        g.save();
        g.globalAlpha = 1 - a;
        g.strokeStyle = color;
        g.lineWidth = 2;
        g.beginPath();
        g.arc(px, py, r + 16 * ease.outCubic(a), 0, Math.PI * 2);
        g.stroke();
        g.restore();
        g.fillStyle = color;
        g.beginPath();
        const rr = r * (1 + 1.6 * (1 - ease.outBack(Math.min(1, age * 2))));
        if (ring.inside) g.arc(px, py, rr, 0, Math.PI * 2);
        else g.rect(px - rr * 0.9, py - rr * 0.9, rr * 1.8, rr * 1.8);
        g.fill();
      }
      while (rings.length && now > rings[0]!.t + RING_MS * 1.2) rings.shift();

      // Kreisbogen und Quadrat
      g.save();
      g.beginPath();
      g.rect(x - 2, y - 2, w + 4, h + 4);
      g.clip();
      g.strokeStyle = theme.series[0]!;
      g.lineWidth = 3;
      g.beginPath();
      if (p.shape === 'full') g.arc(cx, cy, radius, 0, Math.PI * 2);
      else g.arc(cx, cy, radius, -Math.PI / 2, 0);
      g.stroke();
      g.restore();
      g.strokeStyle = theme.axis;
      g.lineWidth = 2;
      g.strokeRect(x, y, w, h);

      // Beschriftung
      const font = `600 13px ${theme.font}`;
      const badge = (label: string, bx: number, by: number) => {
        const badgeFont = `700 14px ${theme.font}`;
        g.font = badgeFont;
        const tw = g.measureText(label).width + 14;
        g.fillStyle = withAlpha(theme.bg, 0.9);
        roundRect(g, bx - tw / 2, by - 11, tw, 22, 8);
        g.fill();
        text(g, label, bx, by + 1, { font: badgeFont, color: theme.series[2]! });
      };
      if (p.shape === 'quarter') {
        text(g, '0', x - 8, y + h + 12, { font, color: theme.muted });
        text(g, '1', x + w, y + h + 14, { font, color: theme.muted });
        text(g, '1', x - 12, y, { font, color: theme.muted });
        g.strokeStyle = theme.series[2]!;
        g.lineWidth = 2;
        g.setLineDash([6, 4]);
        g.beginPath();
        g.moveTo(cx, cy);
        g.lineTo(cx + radius * Math.cos(-Math.PI / 4), cy + radius * Math.sin(-Math.PI / 4));
        g.stroke();
        g.setLineDash([]);
        badge('r = 1', cx + radius * 0.36, cy - radius * 0.36);
      } else {
        text(g, '2', x + w / 2, y + h + 14, { font, color: theme.muted });
        g.strokeStyle = theme.series[2]!;
        g.lineWidth = 2;
        g.setLineDash([6, 4]);
        g.beginPath();
        g.moveTo(cx, cy);
        g.lineTo(cx + radius, cy);
        g.stroke();
        g.setLineDash([]);
        badge('r = 1', cx + radius / 2, cy - 14);
      }
      text(g, ctx.t('ratio'), x + w / 2, y - 14, { font: `600 13px ${theme.font}`, color: theme.muted });

      // Zähler
      const fontChip = `700 13px ${theme.font}`;
      const chipWidth = (label: string) => {
        g.font = fontChip;
        return g.measureText(label).width + 26;
      };
      const chip = (label: string, color: string, square: boolean, left: number, top: number) => {
        const tw = chipWidth(label);
        g.fillStyle = withAlpha(theme.bg, 0.92);
        roundRect(g, left, top, tw, 24, 12);
        g.fill();
        g.fillStyle = color;
        g.beginPath();
        if (square) g.rect(left + 8, top + 8, 8, 8);
        else g.arc(left + 12, top + 12, 4.5, 0, Math.PI * 2);
        g.fill();
        text(g, label, left + tw / 2 + 6, top + 12, { font: fontChip, color: theme.text });
      };
      if (n > 0) {
        const inLabel = `${fmt.num(k, 0)} ${ctx.t('inside')}`;
        const outLabel = `${fmt.num(n - k, 0)} ${ctx.t('outside')}`;
        const wIn = chipWidth(inLabel);
        const wOut = chipWidth(outLabel);
        // Nebeneinander, wenn Platz ist; sonst übereinander (kleines Feld)
        const side = wIn + wOut + 24 <= w;
        chip(inLabel, theme.series[0]!, false, x + 8, y + h - 34);
        chip(outLabel, theme.series[1]!, true, side ? x + w - 8 - wOut : x + 8, side ? y + h - 34 : y + h - 62);
      }
      if (stored < n) text(g, ctx.t('drawn').replace('{n}', fmt.num(stored, 0)), x + w / 2, y + h + 30, { font: `500 11px ${theme.font}`, color: theme.muted });
    }

    /** Kleine Zähler-Plakette (Kreis oder Quadrat als Zeichen). */
    function chipAt(label: string, color: string, square: boolean, left: number, top: number): number {
      const g = surface.g;
      const theme = ctx.theme;
      const fontChip = `700 13px ${theme.font}`;
      g.font = fontChip;
      const tw = g.measureText(label).width + 26;
      g.fillStyle = withAlpha(theme.bg, 0.92);
      roundRect(g, left, top, tw, 24, 12);
      g.fill();
      g.fillStyle = color;
      g.beginPath();
      if (square) g.rect(left + 8, top + 8, 8, 8);
      else g.arc(left + 12, top + 12, 4.5, 0, Math.PI * 2);
      g.fill();
      text(g, label, left + tw / 2 + 6, top + 12, { font: fontChip, color: theme.text });
      return tw;
    }

    /** Feld für Buffon (Linien und Nadeln) bzw. Parabel (Fläche und Punkte). */
    function drawOtherField(field: Rect, now: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const { x, y, w, h } = field;
      const needle = p.mode === 'needle';
      g.save();
      g.beginPath();
      g.rect(x, y, w, h);
      g.clip();
      if (needle) {
        // Dielen: Linien im Abstand d
        g.strokeStyle = theme.axis;
        g.lineWidth = 2;
        for (let j = 0; j <= Math.round(1 / SPACING); j++) {
          const ly = y + h - j * SPACING * h;
          g.beginPath();
          g.moveTo(x, ly);
          g.lineTo(x + w, ly);
          g.stroke();
        }
      } else {
        // Fläche unter y = x²
        g.beginPath();
        g.moveTo(x, y + h);
        for (let i = 0; i <= 60; i++) {
          const u = i / 60;
          g.lineTo(x + u * w, y + h - u * u * h);
        }
        g.lineTo(x + w, y + h);
        g.closePath();
        g.fillStyle = withAlpha(theme.series[0]!, theme.dark ? 0.12 : 0.08);
        g.fill();
      }
      syncLayer(field);
      g.drawImage(layer, x, y, w, h);
      const r = pointRadius(w);
      for (const ring of rings) {
        const age = (now - ring.t) / RING_MS;
        if (age < 0) continue;
        const color = ring.inside ? theme.series[0]! : theme.series[1]!;
        const px = x + ring.x * w;
        const py = y + (1 - ring.y) * h;
        const a = Math.min(1, age);
        if (needle) {
          // Nadel fällt mit einer kleinen Drehung
          const [hx, hy] = needleHalf(ring.a + (1 - ease.outCubic(a)) * 0.8, w);
          const s = 1 + 0.5 * (1 - ease.outCubic(a));
          g.strokeStyle = color;
          g.lineWidth = ring.inside ? 2.5 : 1.6;
          g.lineCap = 'round';
          g.beginPath();
          g.moveTo(px - hx * s, py - hy * s);
          g.lineTo(px + hx * s, py + hy * s);
          g.stroke();
        } else {
          g.save();
          g.globalAlpha = 1 - a;
          g.strokeStyle = color;
          g.lineWidth = 2;
          g.beginPath();
          g.arc(px, py, r + 16 * ease.outCubic(a), 0, Math.PI * 2);
          g.stroke();
          g.restore();
          g.fillStyle = color;
          g.beginPath();
          const rr = r * (1 + 1.6 * (1 - ease.outBack(Math.min(1, age * 2))));
          if (ring.inside) g.arc(px, py, rr, 0, Math.PI * 2);
          else g.rect(px - rr * 0.9, py - rr * 0.9, rr * 1.8, rr * 1.8);
          g.fill();
        }
      }
      while (rings.length && now > rings[0]!.t + RING_MS * 1.2) rings.shift();
      if (!needle) {
        g.strokeStyle = theme.series[0]!;
        g.lineWidth = 3;
        g.beginPath();
        for (let i = 0; i <= 60; i++) {
          const u = i / 60;
          if (i) g.lineTo(x + u * w, y + h - u * u * h);
          else g.moveTo(x, y + h);
        }
        g.stroke();
      }
      g.restore();
      g.strokeStyle = theme.axis;
      g.lineWidth = 2;
      g.strokeRect(x, y, w, h);
      const font = `600 13px ${theme.font}`;
      if (needle) {
        // Linienabstand d und Nadellänge l als Maßstab am rechten Rand
        const mx = x + w + 12;
        const y0 = y + h;
        const y1 = y + h - SPACING * h;
        g.strokeStyle = theme.series[2]!;
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(mx, y0);
        g.lineTo(mx, y1);
        g.stroke();
        text(g, 'd', mx + 9, (y0 + y1) / 2, { font: `italic 700 14px ${theme.font}`, color: theme.series[2]! });
        const lx0 = x + w - 10 - p.len * SPACING * w;
        const ly = y + 16;
        g.fillStyle = withAlpha(theme.bg, 0.9);
        roundRect(g, lx0 - 30, ly - 11, p.len * SPACING * w + 40, 22, 8);
        g.fill();
        g.strokeStyle = theme.series[3]!;
        g.lineWidth = 3;
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(lx0, ly);
        g.lineTo(x + w - 10, ly);
        g.stroke();
        text(g, 'l', lx0 - 14, ly, { font: `italic 700 14px ${theme.font}`, color: theme.series[3]! });
      } else {
        text(g, '0', x - 8, y + h + 12, { font, color: theme.muted });
        text(g, '1', x + w, y + h + 14, { font, color: theme.muted });
        text(g, '1', x - 12, y, { font, color: theme.muted });
        text(g, 'y = x²', x + w * 0.74, y + h * 0.28, { font: `700 14px ${theme.font}`, color: theme.series[0]! });
      }
      text(g, ctx.t(needle ? 'ratioNeedle' : 'ratioArea'), x + w / 2, y - 14, { font, color: theme.muted });
      if (n > 0) {
        const inLabel = `${fmt.num(k, 0)} ${ctx.t(needle ? 'cross' : 'below')}`;
        const outLabel = `${fmt.num(n - k, 0)} ${ctx.t(needle ? 'noCross' : 'above')}`;
        const left = needle ? x + 8 : x + w * 0.34;
        const wIn = chipAt(inLabel, theme.series[0]!, false, left, y + h - 34);
        if (needle || left + wIn + 200 > x + w) chipAt(outLabel, theme.series[1]!, true, needle ? x + 8 : left, y + h - 62);
        else chipAt(outLabel, theme.series[1]!, true, x + 8, y + 10);
      }
      if (needle && n > MAX_NEEDLES) text(g, ctx.t('drawnNeedles').replace('{n}', fmt.num(MAX_NEEDLES, 0)), x + w / 2, y + h + 18, { font: `500 11px ${theme.font}`, color: theme.muted });
      else if (!needle && stored < n) text(g, ctx.t('drawn').replace('{n}', fmt.num(stored, 0)), x + w / 2, y + h + 30, { font: `500 11px ${theme.font}`, color: theme.muted });
    }

    function drawChart(): void {
      const theme = ctx.theme;
      const toX = (count: number) => (p.logScale ? Math.log10(count) : count);
      const nAt = (x: number) => (p.logScale ? 10 ** x : x);
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      const xFrom = toX(1);
      const xTo = toX(Math.max(n, 1));
      if (p.funnel) {
        plot.fillBetween(
          (x) => target() + funnelOf(Math.max(1, nAt(x))),
          (x) => target() - funnelOf(Math.max(1, nAt(x))),
          xFrom,
          Math.max(xTo, toX(10)),
          { fill: theme.series[2]!, alpha: 0.12 },
        );
      }
      plot.hline(target(), { color: theme.series[2], width: 2, dash: [7, 6] });
      plot.text(plot.bounds.xMax, target(), p.mode === 'area' ? '1/3' : 'π', { color: theme.series[2], align: 'right', offset: [-10, -10], weight: 'bold', size: 16, math: p.mode !== 'area' });
      if (n > 0) {
        const pts: [number, number][] = [];
        const steps = Math.max(2, Math.ceil(plot.px(xTo) - plot.px(xFrom)));
        let prev = 0;
        for (let i = 0; i <= steps; i++) {
          const x = xFrom + ((xTo - xFrom) * i) / steps;
          const idx = Math.min(history.length, Math.max(1, Math.round(nAt(x))));
          if (idx === prev) continue;
          prev = idx;
          // ohne Treffer gibt es bei Buffon noch keinen Schätzwert
          if (Number.isFinite(history[idx - 1]!)) pts.push([toX(idx), history[idx - 1]!]);
        }
        const now = estimateOf(k, n);
        if (n > history.length && Number.isFinite(now)) pts.push([toX(n), now]);
        plot.polyline(pts, { color: theme.series[0], width: 2.5 });
        if (Number.isFinite(now)) {
          plot.point(toX(n), now, { color: theme.series[0], radius: 6 });
          plot.text(toX(n), now, fmt.num(now, 3), { color: theme.series[0], align: 'right', offset: [-10, -12], weight: 'bold', size: 13 });
        }
      } else {
        const r = plot.rect;
        // Blasser Beispielverlauf (feste Zufallsfolge), damit man vorab sieht, was entsteht
        const rnd = seededRandom(7);
        const nMax = Math.max(10, Math.round(nAt(plot.bounds.xMax)));
        const ghost: [number, number][] = [];
        let hits = 0;
        for (let i = 1; i <= nMax; i++) {
          const gx = rnd();
          const gy = rnd();
          if (p.mode === 'needle' ? needleCrosses(gy / SPACING, gx * Math.PI, p.len) : p.mode === 'area' ? underParabola(gx, gy) : insideQuarterCircle(gx, gy)) hits++;
          // die ersten Schätzungen springen weit aus dem Bild: erst ab zehn Punkten zeichnen
          const est = estimateOf(hits, i);
          if (i >= 10 && Number.isFinite(est) && (i < 40 || i % Math.max(1, Math.round(nMax / 400)) === 0)) ghost.push([toX(i), est]);
        }
        plot.polyline(ghost, { color: withAlpha(theme.muted, 0.55), width: 1.6, dash: [4, 4] });
        plot.textPx(r.x + r.w - 10, r.y + 14, ctx.t('ghost'), { color: theme.muted, size: 11, align: 'right' });
        // Hinweis bei schmalem Diagramm auf zwei Zeilen umbrechen
        const hint = ctx.t('start');
        surface.g.font = `14px ${theme.font}`;
        const words = hint.split(' ');
        const lines = surface.g.measureText(hint).width > r.w - 24 && words.length > 1
          ? [words.slice(0, Math.ceil(words.length / 2)).join(' '), words.slice(Math.ceil(words.length / 2)).join(' ')]
          : [hint];
        lines.forEach((line, i) => plot.textPx(r.x + r.w / 2, (plot.py(p.mode === 'area' ? 0.43 : 3.5) + plot.py(target())) / 2 + (i - (lines.length - 1) / 2) * 18, line, { color: theme.muted, size: 14, align: 'center' }));
      }
      plot.end();
    }

    reset();

    return {
      update(changed, source) {
        if ((changed.has('shape') || changed.has('mode') || changed.has('len')) && source !== 'init') reset();
        if (changed.has('logScale') || changed.has('mode')) fitRange(true);
        if (changed.has('mode') || source === 'init') {
          const pre = p.mode === 'needle' ? 'n' : 'b';
          for (const [id, c] of [
            ['one', 1],
            ['ten', 10],
            ['hundred', 100],
            ['thousand', 1000],
          ] as const)
            ctx.setAction(id, { label: ctx.t(`${pre}${c}`) });
        }
        updateReadouts();
      },

      action(id) {
        if (id === 'reset') {
          ctx.clock.pause();
          reset();
          updateReadouts();
          return;
        }
        const count = id === 'one' ? 1 : id === 'ten' ? 10 : id === 'hundred' ? 100 : 1000;
        // Reduzierte Bewegung: Punkte sofort, ohne Ring und ohne Nacheinander
        if (prefersReducedMotion()) addPoints(count, false);
        else if (id === 'one') addPoints(1, true);
        else if (id === 'ten') enqueue(10, 600);
        else if (id === 'hundred') enqueue(100, 900);
        else enqueue(1000, 1200);
      },

      tick(dt) {
        carry += dt * p.speed;
        const m = Math.min(20_000, Math.floor(carry));
        carry -= m;
        if (m > 0) addPoints(m, p.speed <= 120 && !prefersReducedMotion());
      },

      resetTime() {
        reset();
        updateReadouts();
      },

      render() {
        const now = performance.now();
        if (queue > 0) {
          const m = Math.min(queue, Math.max(1, Math.round((now - queueLast) * queueRate)));
          queueLast = now;
          queue -= m;
          addPoints(m, m <= 12);
        }
        const { field } = layout(surface.width, surface.height);
        surface.begin();
        drawField(field, now);
        drawChart();
        if (queue > 0 || rings.length) ctx.requestRender();
      },

      destroy: () => surface.destroy(),
    };
  },
});
