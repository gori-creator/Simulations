import { defineSimulation, drawImageFit, ease, Plot, prefersReducedMotion, roundRect, seededRandom, softShadow, Surface, text, withAlpha, type Rect } from '../../../sim-core';
import { estimateIsExact, estimatePi, insideQuarterCircle, piFunnel } from './model';

const L = (de: string, en: string) => ({ de, en });
/** So viele Punkte werden gespeichert und gezeichnet; darüber wird nur gezählt. */
const MAX_POINTS = 120_000;
const MAX_HISTORY = 500_000;
const RING_MS = 700;

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
 * sich der Schätzwert 4·k/n mit wachsendem n stabilisiert.
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
      key: 'shape',
      type: 'choice',
      label: L('Figur', 'Shape'),
      options: [
        { value: 'quarter', label: L('Viertelkreis im Einheitsquadrat', 'Quarter circle in the unit square') },
        { value: 'full', label: L('Kreis im Quadrat', 'Circle in a square') },
      ],
      default: 'quarter',
    },
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
    { key: 'n', label: L('Anzahl der Punkte n', 'Number of points n') },
    { key: 'k', label: L('Davon im Kreis k', 'Inside the circle k') },
    { key: 'estimate', label: L('Schätzwert', 'Estimate') },
    { key: 'error', label: L('Abweichung von π', 'Deviation from π'), spoiler: true },
  ],
  presets: [
    { id: 'quarter', label: L('Viertelkreis', 'Quarter circle'), values: {} },
    { id: 'full', label: L('Ganzer Kreis', 'Full circle'), values: { shape: 'full' } },
    { id: 'fast', label: L('Schnell (1000/s)', 'Fast (1000/s)'), values: { speed: 1000 } },
    { id: 'linear', label: L('Lineare Achse', 'Linear axis'), values: { logScale: false } },
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
    const rings: { x: number; y: number; inside: boolean; t: number }[] = [];

    // Bereits gezeichnete Punkte liegen auf einer eigenen Ebene
    const layer = document.createElement('canvas');
    const lg = layer.getContext('2d')!;
    let layerKey = '';
    let layerCount = 0;

    function reset(): void {
      xs = new Float32Array(1024);
      ys = new Float32Array(1024);
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
      plot.setRangePadded([0, xMax], [2.4, 3.9], { left: 46, right: 18, top: 10, bottom: 26 });
      plot.setAxes({ x: p.logScale ? { label: 'n', minStep: 1, format: (v) => fmt.num(10 ** v, 0) } : { label: 'n' } });
    }

    function addPoints(count: number, animate: boolean): void {
      const now = performance.now();
      for (let i = 0; i < count; i++) {
        const x = Math.random();
        const y = Math.random();
        // Beim ganzen Kreis liegen die Punkte in [−1, 1]²; die Bedingung ist dieselbe.
        const inside = p.shape === 'full' ? insideQuarterCircle(2 * x - 1, 2 * y - 1) : insideQuarterCircle(x, y);
        n++;
        if (inside) k++;
        if (stored < MAX_POINTS) {
          if (stored >= xs.length) {
            const nx = new Float32Array(xs.length * 2);
            const ny = new Float32Array(ys.length * 2);
            nx.set(xs);
            ny.set(ys);
            xs = nx;
            ys = ny;
          }
          xs[stored] = x;
          ys[stored] = y;
          stored++;
        }
        if (history.length < MAX_HISTORY) history.push(estimatePi(k, n));
        if (animate) {
          rings.push({ x, y, inside, t: now + i * 4 });
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
      const x = xs[i]!;
      const y = ys[i]!;
      return p.shape === 'full' ? insideQuarterCircle(2 * x - 1, 2 * y - 1) : insideQuarterCircle(x, y);
    }

    /* ---------- Zeichnen ---------- */
    function pointRadius(side: number): number {
      return Math.max(1.1, side / 150);
    }

    function syncLayer(field: Rect): void {
      const dpr = surface.dpr;
      const key = `${field.w}|${dpr}|${ctx.theme.dark}|${ctx.theme.series[0]}|${p.shape}`;
      if (key !== layerKey) {
        layer.width = Math.round(field.w * dpr);
        layer.height = Math.round(field.h * dpr);
        layerKey = key;
        layerCount = 0;
      }
      const upTo = stored - rings.filter((r) => performance.now() < r.t + RING_MS).length;
      if (upTo <= layerCount) return;
      lg.setTransform(dpr, 0, 0, dpr, 0, 0);
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
          (x) => Math.PI + piFunnel(Math.max(1, nAt(x))),
          (x) => Math.PI - piFunnel(Math.max(1, nAt(x))),
          xFrom,
          Math.max(xTo, toX(10)),
          { fill: theme.series[2]!, alpha: 0.12 },
        );
      }
      plot.hline(Math.PI, { color: theme.series[2], width: 2, dash: [7, 6] });
      plot.text(plot.bounds.xMax, Math.PI, 'π', { color: theme.series[2], align: 'right', offset: [-10, -10], weight: 'bold', size: 16, math: true });
      if (n > 0) {
        const pts: [number, number][] = [];
        const steps = Math.max(2, Math.ceil(plot.px(xTo) - plot.px(xFrom)));
        let prev = 0;
        for (let i = 0; i <= steps; i++) {
          const x = xFrom + ((xTo - xFrom) * i) / steps;
          const idx = Math.min(history.length, Math.max(1, Math.round(nAt(x))));
          if (idx === prev) continue;
          prev = idx;
          pts.push([toX(idx), history[idx - 1]!]);
        }
        if (n > history.length) pts.push([toX(n), estimatePi(k, n)]);
        plot.polyline(pts, { color: theme.series[0], width: 2.5 });
        plot.point(toX(n), estimatePi(k, n), { color: theme.series[0], radius: 6 });
        plot.text(toX(n), estimatePi(k, n), fmt.num(estimatePi(k, n), 3), { color: theme.series[0], align: 'right', offset: [-10, -12], weight: 'bold', size: 13 });
      } else {
        const r = plot.rect;
        // Blasser Beispielverlauf (feste Zufallsfolge), damit man vorab sieht, was entsteht
        const rnd = seededRandom(7);
        const nMax = Math.max(10, Math.round(nAt(plot.bounds.xMax)));
        const ghost: [number, number][] = [];
        let hits = 0;
        for (let i = 1; i <= nMax; i++) {
          if (insideQuarterCircle(rnd(), rnd())) hits++;
          // die ersten Schätzungen springen weit aus dem Bild: erst ab zehn Punkten zeichnen
          if (i >= 10 && (i < 40 || i % Math.max(1, Math.round(nMax / 400)) === 0)) ghost.push([toX(i), estimatePi(hits, i)]);
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
        lines.forEach((line, i) => plot.textPx(r.x + r.w / 2, (plot.py(3.5) + plot.py(Math.PI)) / 2 + (i - (lines.length - 1) / 2) * 18, line, { color: theme.muted, size: 14, align: 'center' }));
      }
      plot.end();
    }

    reset();

    return {
      update(changed, source) {
        if (changed.has('shape') && source !== 'init') reset();
        if (changed.has('logScale')) fitRange(true);
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
