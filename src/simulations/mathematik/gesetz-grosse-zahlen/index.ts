import {
  defineSimulation,
  drawImageFit,
  ease,
  Plot,
  roundRect,
  softShadow,
  Surface,
  text,
  Tween,
  withAlpha,
  type Rect,
} from '../../../sim-core';
import { drawOutcome, funnelHalfWidth, probabilities, type ExperimentId } from './model';

const L = (de: string, en: string) => ({ de, en });
const MAX_HISTORY = 200_000;
/** Platz für die Achsenbeschriftungen im Diagramm (Pixel). */
const CHART_PADDING = { left: 46, right: 18, top: 16, bottom: 24 };

function layout(w: number, h: number): { obj: Rect; bars: Rect; chart: Rect } {
  if (w >= 700) {
    const lw = Math.min(310, w * 0.32);
    return {
      obj: { x: 0, y: 0, w: lw, h: h * 0.54 },
      bars: { x: 0, y: h * 0.54, w: lw, h: h * 0.46 },
      chart: { x: lw, y: 0, w: w - lw, h },
    };
  }
  const top = h * 0.4;
  return {
    obj: { x: 0, y: 0, w: w * 0.42, h: top },
    bars: { x: w * 0.42, y: 0, w: w * 0.58, h: top },
    chart: { x: 0, y: top, w, h: h - top },
  };
}

/**
 * Gesetz der großen Zahlen: Münze, Würfel oder Reißnagel werden oft geworfen.
 * Die relative Häufigkeit eines Ereignisses nähert sich der Wahrscheinlichkeit
 * – der Trichter zeigt, wie eng sie nach n Würfen typischerweise liegt.
 */
export default defineSimulation({
  id: 'gesetz-grosse-zahlen',
  animated: true,
  layout: { aspect: 1.75, aspectNarrow: 0.72 },
  groups: [
    { id: 'view', label: L('Anzeige', 'Display') },
    { id: 'anim', label: L('Automatisch werfen', 'Automatic throwing') },
  ],
  params: [
    {
      key: 'exp',
      type: 'choice',
      label: L('Zufallsexperiment', 'Random experiment'),
      options: [
        { value: 'coin', label: L('Münze', 'Coin') },
        { value: 'die', label: L('Würfel', 'Die') },
        { value: 'tack', label: L('Reißnagel', 'Drawing pin') },
      ],
      default: 'die',
    },
    { key: 'face', type: 'number', label: L('Beobachtete Augenzahl', 'Observed number'), min: 1, max: 6, step: 1, default: 6, visibleIf: (v) => v.exp === 'die' },
    {
      key: 'pTack',
      type: 'number',
      label: L('Wahrscheinlichkeit für „Spitze oben“', 'Probability of “point up”'),
      help: L(
        'In Wirklichkeit unbekannt – sie hängt von der Form des Reißnagels ab. Hier zum Ausprobieren einstellbar.',
        'Unknown in reality – it depends on the shape of the pin. Adjustable here for exploring.',
      ),
      min: 0.05,
      max: 0.95,
      step: 0.05,
      default: 0.65,
      visibleIf: (v) => v.exp === 'tack',
    },
    { key: 'showP', type: 'boolean', group: 'view', label: L('Wahrscheinlichkeit p einzeichnen', 'Show probability p'), default: true },
    { key: 'funnel', type: 'boolean', group: 'view', label: L('Trichter (95 % der Versuchsreihen)', 'Funnel (95 % of runs)'), default: true },
    { key: 'logScale', type: 'boolean', group: 'view', label: L('Anzahl n logarithmisch', 'Logarithmic n axis'), default: true },
    { key: 'speed', type: 'number', group: 'anim', label: L('Würfe pro Sekunde', 'Throws per second'), min: 1, max: 500, step: 1, default: 25 },
  ],
  actions: [
    { id: 'one', label: L('1-mal werfen', 'Throw once'), primary: true },
    { id: 'ten', label: L('10-mal', '10 times') },
    { id: 'hundred', label: L('100-mal', '100 times') },
    { id: 'thousand', label: L('1000-mal', '1000 times') },
    { id: 'reset', label: L('Neu beginnen', 'Start over') },
  ],
  images: {
    table: 'tischplatte.webp',
    coinHead: 'muenze-kopf.webp',
    coinTail: 'muenze-zahl.webp',
    tackUp: 'reissnagel-spitze-oben.webp',
    tackSide: 'reissnagel-seitenlage.webp',
  },
  readouts: [
    { key: 'n', label: L('Anzahl der Würfe', 'Number of throws') },
    { key: 'k', label: L('Absolute Häufigkeit', 'Absolute frequency') },
    { key: 'h', label: L('Relative Häufigkeit', 'Relative frequency') },
    { key: 'p', label: L('Wahrscheinlichkeit', 'Probability') },
    { key: 'diff', label: L('Abweichung |h − p|', 'Deviation |h − p|') },
  ],
  presets: [
    { id: 'die', label: L('Würfel: Sechs', 'Die: six'), values: {} },
    { id: 'coin', label: L('Münze: Zahl', 'Coin: tails'), values: { exp: 'coin' } },
    { id: 'tack', label: L('Reißnagel (p unbekannt)', 'Drawing pin (p unknown)'), values: { exp: 'tack', showP: false } },
    { id: 'linear', label: L('Lineare Achse', 'Linear axis'), values: { logScale: false } },
  ],
  strings: {
    de: {
      canvas: 'Zufallsexperiment mit Diagramm der relativen Häufigkeit in Abhängigkeit von der Anzahl der Würfe',
      head: 'Kopf',
      tail: 'Zahl',
      up: 'Spitze oben',
      side: 'Seitenlage',
      sixPrefix: 'Augenzahl',
      times: '{k}-mal „{event}“',
      unknown: 'unbekannt (eingeblendet unter Anzeige)',
      bars: 'Relative Häufigkeiten',
      chartY: 'h',
      start: 'Werfen, um zu beginnen',
    },
    en: {
      canvas: 'Random experiment with a chart of the relative frequency against the number of throws',
      head: 'Heads',
      tail: 'Tails',
      up: 'Point up',
      side: 'On its side',
      sixPrefix: 'Number',
      times: '“{event}” {k} times',
      unknown: 'unknown (can be shown under Display)',
      bars: 'Relative frequencies',
      chartY: 'h',
      start: 'Throw to start',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const plot = new Plot(surface, {
      x: [-0.15, 2.15],
      y: [-0.06, 1.06],
      equalAspect: false,
      pan: false,
      zoom: false,
      region: (w, h) => {
        const r = layout(w, h).chart;
        return { x: r.x + 8, y: r.y + 8, w: r.w - 16, h: r.h - 16 };
      },
      xAxis: { label: 'n' },
      yAxis: { label: 'h' },
    });
    const p = ctx.params;
    const fmt = ctx.fmt;
    const anim = new Tween(650, ease.outCubic);
    let animKind: 'single' | 'bulk' = 'single';

    let n = 0;
    let k = 0;
    let counts: number[] = [];
    let history: number[] = [];
    let last = -1;
    let carry = 0;
    let xMax = 2;

    const experiment = () => p.exp as ExperimentId;
    const probs = () => probabilities(experiment(), p.pTack);
    const eventIndex = () => (experiment() === 'coin' ? 1 : experiment() === 'die' ? p.face - 1 : 0);
    const eventProb = () => probs()[eventIndex()]!;
    const outcomeLabels = (): string[] =>
      experiment() === 'coin' ? [ctx.t('head'), ctx.t('tail')] : experiment() === 'die' ? ['1', '2', '3', '4', '5', '6'] : [ctx.t('up'), ctx.t('side')];
    const eventName = () => (experiment() === 'die' ? `${ctx.t('sixPrefix')} ${p.face}` : outcomeLabels()[eventIndex()]!);
    const toX = (count: number) => (p.logScale ? Math.log10(count) : count);

    function reset(): void {
      n = 0;
      k = 0;
      counts = probs().map(() => 0);
      history = [];
      last = -1;
      carry = 0;
      fitRange(true);
    }

    function fitRange(force = false): void {
      const target = p.logScale ? Math.max(2, Math.ceil(Math.log10(Math.max(n, 1)) + 0.01)) : Math.max(20, niceCeil(n * 1.1));
      if (!force && target <= xMax) return;
      xMax = target;
      plot.setRangePadded([0, xMax], [0, 1], CHART_PADDING);
      plot.setAxes({
        x: p.logScale ? { label: 'n', minStep: 1, format: (v) => fmt.num(10 ** v, 0) } : { label: 'n' },
      });
    }

    function niceCeil(value: number): number {
      const base = 10 ** Math.floor(Math.log10(Math.max(value, 1)));
      for (const m of [1, 2, 5, 10]) if (m * base >= value) return m * base;
      return 10 * base;
    }

    function throwMany(count: number): void {
      const pr = probs();
      const ev = eventIndex();
      for (let i = 0; i < count; i++) {
        const outcome = drawOutcome(pr, Math.random);
        counts[outcome] = (counts[outcome] ?? 0) + 1;
        n++;
        if (outcome === ev) k++;
        if (history.length < MAX_HISTORY) history.push(k / n);
        last = outcome;
      }
      fitRange();
    }

    function updateReadouts(): void {
      const pv = eventProb();
      const h = n ? k / n : NaN;
      ctx.readout('n', `n = ${fmt.num(n, 0)}`);
      ctx.readout('k', ctx.t('times').replace('{k}', fmt.num(k, 0)).replace('{event}', eventName()));
      ctx.readout('h', n ? `h = ${fmt.num(k, 0)} / ${fmt.num(n, 0)} ≈ ${fmt.num(h, 4)} (${fmt.num(h * 100, 1)} %)` : '–');
      const pText = experiment() === 'die' ? `1/6 ≈ ${fmt.num(pv, 4)}` : fmt.num(pv, 2);
      ctx.readout('p', p.showP ? `p = ${pText}` : ctx.t('unknown'));
      ctx.readout('diff', n && p.showP ? `≈ ${fmt.num(Math.abs(h - pv), 4)}` : null);
    }

    /* ---------- Zeichnen ---------- */

    function drawDie(cx: number, cy: number, size: number, face: number, rotation: number, highlight: boolean): void {
      const g = surface.g;
      g.save();
      g.translate(cx, cy);
      g.rotate(rotation);
      softShadow(g, ctx.theme.dark, 18, 8);
      roundRect(g, -size / 2, -size / 2, size, size, size * 0.18);
      const grad = g.createLinearGradient(-size / 2, -size / 2, size / 2, size / 2);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(1, '#dfe4ec');
      g.fillStyle = grad;
      g.fill();
      g.shadowColor = 'transparent';
      g.lineWidth = highlight ? 4 : 1.5;
      g.strokeStyle = highlight ? ctx.theme.series[0]! : '#b9c1cd';
      g.stroke();
      const pip = size * 0.095;
      const o = size * 0.27;
      const spots: Record<number, [number, number][]> = {
        1: [[0, 0]],
        2: [[-o, -o], [o, o]],
        3: [[-o, -o], [0, 0], [o, o]],
        4: [[-o, -o], [o, -o], [-o, o], [o, o]],
        5: [[-o, -o], [o, -o], [0, 0], [-o, o], [o, o]],
        6: [[-o, -o], [o, -o], [-o, 0], [o, 0], [-o, o], [o, o]],
      };
      g.fillStyle = face === 1 ? '#c92a2a' : '#1f2733';
      for (const [x, y] of spots[face] ?? []) {
        g.beginPath();
        g.arc(x, y, face === 1 ? pip * 1.3 : pip, 0, Math.PI * 2);
        g.fill();
      }
      g.restore();
    }

    function drawCoin(cx: number, cy: number, size: number, outcome: number, squash: number, highlight: boolean): void {
      const g = surface.g;
      const img = ctx.images.get(outcome === 0 ? 'coinHead' : 'coinTail');
      g.save();
      g.translate(cx, cy);
      g.scale(1, Math.max(0.06, squash));
      softShadow(g, ctx.theme.dark, 16, 6);
      if (img) {
        g.beginPath();
        g.arc(0, 0, size / 2, 0, Math.PI * 2);
        g.fillStyle = '#c9a227';
        g.fill();
        g.shadowColor = 'transparent';
        g.clip();
        drawImageFit(g, img, { x: -size / 2, y: -size / 2, w: size, h: size }, 'cover');
      } else {
        const grad = g.createRadialGradient(-size * 0.15, -size * 0.2, size * 0.05, 0, 0, size / 2);
        grad.addColorStop(0, '#fff3c4');
        grad.addColorStop(0.55, '#e6be4a');
        grad.addColorStop(1, '#b8891c');
        g.beginPath();
        g.arc(0, 0, size / 2, 0, Math.PI * 2);
        g.fillStyle = grad;
        g.fill();
        g.shadowColor = 'transparent';
        g.lineWidth = size * 0.04;
        g.strokeStyle = '#a07818';
        g.beginPath();
        g.arc(0, 0, size * 0.42, 0, Math.PI * 2);
        g.stroke();
        text(g, outcome === 0 ? '★' : '1', 0, size * 0.02, { font: `bold ${size * 0.38}px Georgia, serif`, color: '#7a5a10' });
      }
      g.restore();
      if (highlight) {
        g.save();
        g.translate(cx, cy);
        g.scale(1, Math.max(0.06, squash));
        g.beginPath();
        g.arc(0, 0, size / 2 + 6, 0, Math.PI * 2);
        g.lineWidth = 4;
        g.strokeStyle = ctx.theme.series[0]!;
        g.stroke();
        g.restore();
      }
    }

    function drawTack(cx: number, cy: number, size: number, outcome: number, rotation: number, highlight: boolean): void {
      const g = surface.g;
      const img = ctx.images.get(outcome === 0 ? 'tackUp' : 'tackSide');
      g.save();
      g.translate(cx, cy);
      g.rotate(rotation);
      if (img) {
        drawImageFit(g, img, { x: -size / 2, y: -size / 2, w: size, h: size }, 'contain');
      } else {
        const metal = g.createLinearGradient(-size / 2, 0, size / 2, 0);
        metal.addColorStop(0, '#8d99a6');
        metal.addColorStop(0.5, '#f1f3f5');
        metal.addColorStop(1, '#7b8794');
        g.lineCap = 'round';
        if (outcome === 0) {
          // Kopf liegt auf, Spitze zeigt nach oben
          g.strokeStyle = metal;
          g.lineWidth = size * 0.05;
          g.beginPath();
          g.moveTo(0, size * 0.18);
          g.lineTo(0, -size * 0.38);
          g.stroke();
          g.fillStyle = ctx.theme.series[1]!;
          g.beginPath();
          g.ellipse(0, size * 0.22, size * 0.36, size * 0.12, 0, 0, Math.PI * 2);
          g.fill();
        } else {
          // Seitenlage: Kopf schräg, Spitze berührt den Tisch
          g.rotate(-0.5);
          g.strokeStyle = metal;
          g.lineWidth = size * 0.05;
          g.beginPath();
          g.moveTo(-size * 0.05, 0);
          g.lineTo(size * 0.45, 0);
          g.stroke();
          g.fillStyle = ctx.theme.series[1]!;
          g.beginPath();
          g.ellipse(-size * 0.12, 0, size * 0.1, size * 0.34, 0, 0, Math.PI * 2);
          g.fill();
        }
      }
      g.restore();
      if (highlight) {
        g.save();
        g.strokeStyle = ctx.theme.series[0]!;
        g.lineWidth = 4;
        roundRect(g, cx - size / 2 - 8, cy - size / 2 - 8, size + 16, size + 16, 16);
        g.stroke();
        g.restore();
      }
    }

    function drawObject(r: Rect): void {
      const g = surface.g;
      const inset = 10;
      const box: Rect = { x: r.x + inset, y: r.y + inset, w: r.w - inset * 2, h: r.h - inset * 2 };
      g.save();
      roundRect(g, box.x, box.y, box.w, box.h, 16);
      g.clip();
      const table = ctx.images.get('table');
      if (table) {
        drawImageFit(g, table, box, 'cover');
        if (ctx.theme.dark) {
          g.fillStyle = 'rgba(0,0,0,0.35)';
          g.fillRect(box.x, box.y, box.w, box.h);
        }
      } else {
        const grad = g.createRadialGradient(box.x + box.w / 2, box.y + box.h / 2, 10, box.x + box.w / 2, box.y + box.h / 2, Math.max(box.w, box.h) * 0.7);
        grad.addColorStop(0, ctx.theme.dark ? '#1e4d3a' : '#3f8f6b');
        grad.addColorStop(1, ctx.theme.dark ? '#123426' : '#2c6e50');
        g.fillStyle = grad;
        g.fillRect(box.x, box.y, box.w, box.h);
      }
      g.restore();

      const cx = box.x + box.w / 2;
      const cy = box.y + box.h / 2;
      const size = Math.min(box.w, box.h) * 0.5;
      if (last < 0) {
        text(g, ctx.t('start'), cx, cy, { font: `600 14px ${ctx.theme.font}`, color: '#ffffff' });
        return;
      }
      const t = anim.t;
      const running = anim.running;
      const highlight = !running && last === eventIndex();
      const now = performance.now();
      if (experiment() === 'die') {
        const face = running && animKind === 'single' ? 1 + (Math.floor(now / 70) % 6) : last + 1;
        const rot = running ? (1 - ease.outCubic(t)) * Math.PI * 3 : 0;
        const scale = running ? 1 + 0.18 * Math.sin(Math.PI * t) : 1;
        drawDie(cx, cy, size * scale, face, rot, highlight);
      } else if (experiment() === 'coin') {
        const flips = running && animKind === 'single' ? Math.cos(t * Math.PI * 7) : 1;
        const shown = running && animKind === 'single' ? (Math.floor(t * 7) % 2 === 0 ? last : 1 - last) : last;
        drawCoin(cx, cy, size, shown, Math.abs(flips), highlight);
      } else {
        const rot = running ? (1 - ease.outCubic(t)) * Math.PI * 4 : 0;
        drawTack(cx, cy, size, last, rot, highlight);
      }
      const label = outcomeLabels()[last]!;
      text(g, label, cx, box.y + box.h - 16, { font: `700 14px ${ctx.theme.font}`, color: '#ffffff' });
    }

    function drawBars(r: Rect): void {
      const g = surface.g;
      const theme = ctx.theme;
      const labels = outcomeLabels();
      const pr = probs();
      const rel = counts.map((c) => (n ? c / n : 0));
      const top = r.y + 46;
      const bottom = r.y + r.h - 30;
      const maxValue = Math.min(1, Math.max(0.25, ...rel, ...(p.showP ? pr : [0])) * 1.2);
      text(g, ctx.t('bars'), r.x + r.w / 2, r.y + 14, { font: `700 12px ${theme.font}`, color: theme.muted });
      const slot = (r.w - 24) / labels.length;
      labels.forEach((label, i) => {
        const x = r.x + 12 + slot * i + slot * 0.18;
        const w = slot * 0.64;
        const h = ((bottom - top) * (rel[i] ?? 0)) / maxValue;
        const isEvent = i === eventIndex();
        g.fillStyle = isEvent ? theme.series[0]! : withAlpha(theme.muted, 0.45);
        roundRect(g, x, bottom - h, w, Math.max(h, 0.5), 4);
        g.fill();
        if (p.showP) {
          const py = bottom - ((bottom - top) * pr[i]!) / maxValue;
          g.strokeStyle = theme.series[2]!;
          g.lineWidth = 2;
          g.setLineDash([4, 3]);
          g.beginPath();
          g.moveTo(x - 4, py);
          g.lineTo(x + w + 4, py);
          g.stroke();
          g.setLineDash([]);
        }
        if (n) text(g, `${fmt.num((rel[i] ?? 0) * 100, 0)} %`, x + w / 2, bottom - h - 9, { font: `600 11px ${theme.font}`, color: theme.text });
        text(g, label, x + w / 2, bottom + 14, { font: `${isEvent ? 700 : 500} ${labels.length > 2 ? 13 : 12}px ${theme.font}`, color: isEvent ? theme.series[0]! : theme.muted });
      });
      g.strokeStyle = theme.axis;
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(r.x + 10, bottom + 0.5);
      g.lineTo(r.x + r.w - 10, bottom + 0.5);
      g.stroke();
    }

    function drawChart(): void {
      const theme = ctx.theme;
      const pv = eventProb();
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      const xFrom = toX(1);
      const xTo = toX(Math.max(n, 1));
      const nAt = (x: number) => (p.logScale ? 10 ** x : x);
      if (p.funnel && p.showP) {
        const end = Math.max(xTo, toX(10));
        plot.fillBetween(
          (x) => Math.min(1, pv + funnelHalfWidth(pv, Math.max(1, nAt(x)))),
          (x) => Math.max(0, pv - funnelHalfWidth(pv, Math.max(1, nAt(x)))),
          xFrom,
          end,
          { fill: theme.series[2]!, alpha: 0.12 },
        );
      }
      if (p.showP) {
        plot.hline(pv, { color: theme.series[2], width: 2, dash: [7, 6] });
        plot.text(plot.bounds.xMax, pv, `p = ${fmt.num(pv, 3)}`, { color: theme.series[2], align: 'right', offset: [-8, -8], weight: '600', size: 13 });
      }
      if (n > 0) {
        const pts: [number, number][] = [];
        const pxFrom = plot.px(xFrom);
        const pxTo = plot.px(xTo);
        const steps = Math.max(2, Math.ceil(pxTo - pxFrom));
        let prev = 0;
        for (let i = 0; i <= steps; i++) {
          const x = xFrom + ((xTo - xFrom) * i) / steps;
          const idx = Math.min(history.length, Math.max(1, Math.round(nAt(x))));
          if (idx === prev) continue;
          prev = idx;
          pts.push([toX(idx), history[idx - 1] ?? k / n]);
        }
        if (n > history.length) pts.push([toX(n), k / n]);
        plot.polyline(pts, { color: theme.series[0], width: 2.5 });
        plot.point(toX(n), k / n, { color: theme.series[0], radius: 6 });
      }
      plot.end();
    }

    reset();

    return {
      update(changed, source) {
        if ((changed.has('exp') || changed.has('face') || changed.has('pTack')) && source !== 'init') reset();
        if (changed.has('logScale')) fitRange(true);
        if (!counts.length) reset();
        updateReadouts();
      },

      action(id) {
        if (id === 'reset') {
          ctx.clock.pause();
          reset();
        } else {
          const count = id === 'one' ? 1 : id === 'ten' ? 10 : id === 'hundred' ? 100 : 1000;
          animKind = count === 1 ? 'single' : 'bulk';
          throwMany(count);
          anim.play(count === 1 ? 650 : 260);
        }
        updateReadouts();
      },

      tick(dt) {
        carry += dt * p.speed;
        const m = Math.min(5000, Math.floor(carry));
        carry -= m;
        if (m > 0) {
          throwMany(m);
          if (p.speed <= 8) {
            animKind = 'bulk';
            anim.play(200);
          }
          updateReadouts();
        }
      },

      resetTime() {
        reset();
        updateReadouts();
      },

      render() {
        const { obj, bars } = layout(surface.width, surface.height);
        surface.begin();
        drawObject(obj);
        drawBars(bars);
        drawChart();
        if (anim.running) ctx.requestRender();
      },

      destroy: () => surface.destroy(),
    };
  },
});
