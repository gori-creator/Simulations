import { defineSimulation, ease, mixColor, Plot, prefersReducedMotion, roundRect, Surface, text, Tween, withAlpha, type Rect } from '../../../sim-core';
import { formula, type FormulaStyle } from './formula';
import { binomCdf, binomMoments, binomPmf, cdf, laplaceOk, normalApproxCdf, normalSample, pdf, prob, sampleStats, sigmaRule, zScore } from './model';
import { seededRandom } from '../../../sim-core';

const L = (de: string, en: string) => ({ de, en });
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

type Sit = 'abs' | 'iq' | 'fill';
type Typ = 'between' | 'le' | 'ge';
type Mode = 'area' | 'binom' | 'sample';

/**
 * Normalverteilung in drei Ansichten:
 * – „Fläche“: Dichtekurve mit ziehbaren Grenzen a und b, Wahrscheinlichkeit als Fläche,
 *   darunter die Verteilungsfunktion Φ mit der Differenz Φ(b) − Φ(a); Sigma-Regeln per
 *   Knopfdruck, Standardisierung z = (x − μ)/σ, Sachsituationen IQ und Abfüllmenge.
 * – „Binomialverteilung nähern“: Histogramm von B(n; p) mit der Glockenkurve N(np; √(np(1−p))),
 *   P(X ≤ k) exakt und genähert (mit/ohne Stetigkeitskorrektur), Laplace-Bedingung σ > 3 und
 *   der größte Näherungsfehler für alle n.
 * – „Stichprobe“: Zufallswerte fallen ins Histogramm, das sich der Dichtekurve nähert;
 *   Mittelwert, Standardabweichung und σ-Anteile der Stichprobe gegen μ, σ und die Sigma-Regeln.
 */
export default defineSimulation({
  id: 'normalverteilung',
  dragHint: true,
  layout: { aspect: 1.62, aspectNarrow: 0.46 },
  groups: [
    { id: 'dist', label: L('Verteilung', 'Distribution') },
    { id: 'int', label: L('Ereignis', 'Event') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Ansicht', 'View'),
      options: [
        { value: 'area', label: L('Fläche', 'Area') },
        { value: 'binom', label: L('Binomialverteilung nähern', 'Approximating the binomial'), },
        { value: 'sample', label: L('Stichprobe', 'Sample') },
      ],
      default: 'area',
    },
    {
      key: 'sit',
      type: 'choice',
      label: L('Situation', 'Situation'),
      options: [
        { value: 'abs', label: L('allgemein (μ, σ wählbar)', 'general (choose μ, σ)') },
        { value: 'iq', label: L('Intelligenzquotient (μ = 100, σ = 15)', 'IQ (μ = 100, σ = 15)') },
        { value: 'fill', label: L('Abfüllmenge (μ = 500 ml, σ = 4 ml)', 'Filling volume (μ = 500 ml, σ = 4 ml)') },
      ],
      default: 'abs',
      visibleIf: (v) => v.mode !== 'binom',
    },
    { key: 'mu', type: 'number', group: 'dist', label: L('Erwartungswert μ', 'Mean μ'), min: -3, max: 3, step: 0.1, default: 0, visibleIf: (v) => v.sit === 'abs' && v.mode !== 'binom' },
    { key: 'sg', type: 'number', group: 'dist', label: L('Standardabweichung σ', 'Standard deviation σ'), min: 0.4, max: 2.5, step: 0.1, default: 1, visibleIf: (v) => v.sit === 'abs' && v.mode !== 'binom' },
    {
      key: 'typ',
      type: 'choice',
      group: 'int',
      label: L('Art', 'Type'),
      options: [
        { value: 'between', label: L('a ≤ X ≤ b', 'a ≤ X ≤ b') },
        { value: 'le', label: L('X ≤ b', 'X ≤ b') },
        { value: 'ge', label: L('X ≥ a', 'X ≥ a') },
      ],
      default: 'between',
      visibleIf: (v) => v.mode === 'area',
    },
    { key: 'a', type: 'number', group: 'int', label: L('Grenze a', 'Bound a'), min: -6, max: 6, step: 0.1, default: -1, visibleIf: (v) => v.mode === 'area' && v.sit === 'abs' && v.typ !== 'le' },
    { key: 'b', type: 'number', group: 'int', label: L('Grenze b', 'Bound b'), min: -6, max: 6, step: 0.1, default: 1, visibleIf: (v) => v.mode === 'area' && v.sit === 'abs' && v.typ !== 'ge' },
    { key: 'ia', type: 'number', group: 'int', label: L('Grenze a', 'Bound a'), min: 40, max: 160, step: 1, default: 85, visibleIf: (v) => v.mode === 'area' && v.sit === 'iq' && v.typ !== 'le' },
    { key: 'ib', type: 'number', group: 'int', label: L('Grenze b', 'Bound b'), min: 40, max: 160, step: 1, default: 115, visibleIf: (v) => v.mode === 'area' && v.sit === 'iq' && v.typ !== 'ge' },
    { key: 'fa', type: 'number', group: 'int', label: L('Grenze a', 'Bound a'), min: 484, max: 516, step: 0.5, default: 496, unit: 'ml', visibleIf: (v) => v.mode === 'area' && v.sit === 'fill' && v.typ !== 'le' },
    { key: 'fb', type: 'number', group: 'int', label: L('Grenze b', 'Bound b'), min: 484, max: 516, step: 0.5, default: 504, unit: 'ml', visibleIf: (v) => v.mode === 'area' && v.sit === 'fill' && v.typ !== 'ge' },
    { key: 'bn', type: 'number', group: 'dist', label: L('Anzahl der Versuche n', 'Number of trials n'), min: 5, max: 200, step: 1, default: 50, visibleIf: (v) => v.mode === 'binom' },
    { key: 'bp', type: 'number', group: 'dist', label: L('Trefferwahrscheinlichkeit p', 'Probability of success p'), min: 0.05, max: 0.95, step: 0.05, default: 0.3, visibleIf: (v) => v.mode === 'binom' },
    { key: 'bk', type: 'number', group: 'int', label: L('P(X ≤ k): k', 'P(X ≤ k): k'), min: 0, max: 200, step: 1, default: 12, help: L('Auch die Grenze im Diagramm ziehen.', 'You can also drag the bound in the chart.'), visibleIf: (v) => v.mode === 'binom' },
    { key: 'cc', type: 'boolean', group: 'int', label: L('Stetigkeitskorrektur (k + 0,5)', 'Continuity correction (k + 0.5)'), default: true, visibleIf: (v) => v.mode === 'binom' },
    { key: 'cdf', type: 'boolean', group: 'view', label: L('Verteilungsfunktion Φ zeigen', 'Show the distribution function Φ'), default: true, visibleIf: (v) => v.mode === 'area' },
    { key: 'show', type: 'boolean', group: 'view', label: L('Wahrscheinlichkeit zeigen', 'Show the probability'), help: L('Aus: Wahrscheinlichkeit selbst bestimmen.', 'Off: find the probability yourself.'), default: true, visibleIf: (v) => v.mode !== 'sample' },
  ],
  actions: [
    { id: 'r1', label: L('μ ± σ', 'μ ± σ'), primary: true, visibleIf: (v) => v.mode === 'area' },
    { id: 'r2', label: L('μ ± 2σ', 'μ ± 2σ'), visibleIf: (v) => v.mode === 'area' },
    { id: 'r3', label: L('μ ± 3σ', 'μ ± 3σ'), visibleIf: (v) => v.mode === 'area' },
    { id: 'kmu', label: L('k = μ', 'k = μ'), visibleIf: (v) => v.mode === 'binom' },
    { id: 'draw', label: L('50 Werte ziehen', 'Draw 50 values'), primary: true, visibleIf: (v) => v.mode === 'sample' },
    { id: 'many', label: L('1000 Werte auf einmal', '1000 values at once'), visibleIf: (v) => v.mode === 'sample' },
    { id: 'clear', label: L('Stichprobe löschen', 'Clear the sample'), visibleIf: (v) => v.mode === 'sample' },
  ],
  readouts: [
    { key: 'p', label: L('Wahrscheinlichkeit', 'Probability'), spoiler: true },
    { key: 'z', label: L('Standardisiert', 'Standardised'), spoiler: true },
    { key: 'bin', label: L('Binomialverteilung und Näherung', 'Binomial and approximation'), spoiler: true },
    { key: 'smp', label: L('Stichprobe', 'Sample') },
  ],
  presets: [
    { id: 'std', label: L('Standardnormalverteilung', 'Standard normal distribution'), values: {} },
    { id: 'iq', label: L('IQ über 130', 'IQ above 130'), values: { sit: 'iq', typ: 'ge', ia: 130 } },
    { id: 'fill', label: L('Flasche mit weniger als 495 ml', 'Bottle with less than 495 ml'), values: { sit: 'fill', typ: 'le', fb: 495 } },
    { id: 'binom', label: L('Binomial nähern: n = 100, p = 0,5', 'Approximate the binomial: n = 100, p = 0.5'), values: { mode: 'binom', bn: 100, bp: 0.5, bk: 55 } },
    { id: 'binomBad', label: L('Näherung zu grob: n = 20, p = 0,1', 'Approximation too rough: n = 20, p = 0.1'), values: { mode: 'binom', bn: 20, bp: 0.1, bk: 1 } },
    { id: 'sample', label: L('Stichprobe: Abfüllanlage', 'Sample: filling machine'), values: { mode: 'sample', sit: 'fill' } },
  ],
  strings: {
    de: {
      canvas: 'Glockenkurve der Normalverteilung mit ziehbaren Grenzen a und b; die Fläche darunter ist die Wahrscheinlichkeit. Darunter die Verteilungsfunktion Φ, an der man die Wahrscheinlichkeit als Differenz Φ(b) − Φ(a) abliest. Daneben Rechnung, Standardisierung und Sigma-Regeln.',
      probT: 'Wahrscheinlichkeit',
      rulesT: 'Sigma-Regeln',
      densT: 'Dichtefunktion',
      std: 'Standardisiert',
      area: 'Fläche',
      inflect: 'Wendestelle',
      iqUnit: 'IQ',
      ml: 'ml',
      cdfT: 'Verteilungsfunktion Φ(x) = P(X ≤ x)',
      binT: 'Binomialverteilung und Normalverteilung',
      exact: 'exakt',
      approx: 'genähert',
      withCC: 'mit Stetigkeitskorrektur',
      noCC: 'ohne Korrektur',
      diff: 'Abweichung',
      lapOk: 'Laplace-Bedingung σ > 3 erfüllt',
      lapBad: 'σ ≤ 3: Näherung zu grob',
      errChart: 'Größter Näherungsfehler für n = 5 … 200 (p fest)',
      sigma3: 'σ = 3',
      smpT: 'Stichprobe',
      smpN: 'Anzahl',
      smpEmpty: '„Werte ziehen“ – hier entsteht das Histogramm.',
      smpMean: 'Mittelwert',
      smpSd: 'Standardabweichung',
      smpShare: 'Anteil in',
      theory: 'Theorie',
      histT: 'Histogramm (Höhe = relative Häufigkeit / Klassenbreite)',
    },
    en: {
      canvas: 'Bell curve of the normal distribution with draggable bounds a and b; the area under it is the probability. Below it the distribution function Φ, where the probability is the difference Φ(b) − Φ(a). Next to it the calculation, standardisation and sigma rules.',
      probT: 'Probability',
      rulesT: 'Sigma rules',
      densT: 'Density',
      std: 'Standardised',
      area: 'area',
      inflect: 'point of inflection',
      iqUnit: 'IQ',
      ml: 'ml',
      cdfT: 'Distribution function Φ(x) = P(X ≤ x)',
      binT: 'Binomial and normal distribution',
      exact: 'exact',
      approx: 'approximated',
      withCC: 'with continuity correction',
      noCC: 'without correction',
      diff: 'difference',
      lapOk: 'Laplace condition σ > 3 holds',
      lapBad: 'σ ≤ 3: approximation too rough',
      errChart: 'Largest approximation error for n = 5 … 200 (p fixed)',
      sigma3: 'σ = 3',
      smpT: 'Sample',
      smpN: 'size',
      smpEmpty: '“Draw values” – the histogram builds up here.',
      smpMean: 'mean',
      smpSd: 'standard deviation',
      smpShare: 'share in',
      theory: 'theory',
      histT: 'Histogram (height = relative frequency / class width)',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const reduced = prefersReducedMotion();
    const th = () => ctx.theme;
    const wideLayout = () => surface.width >= 640 || surface.width >= surface.height * 1.3;
    const F = (w: number, n: number) => (surface.width >= 640 ? w : n);
    const font = (weight: number, size: number) => `${weight} ${size}px ${th().font}`;
    const sit = () => p.sit as Sit;
    const mode = () => p.mode as Mode;
    const typ = () => p.typ as Typ;

    const col = {
      f: () => th().series[0]!,
      area: () => th().series[4]!,
      cdf: () => th().series[5]!,
      a: () => th().series[3]!,
      b: () => th().series[1]!,
      rule: () => th().series[2]!,
      bar: () => th().series[3]!,
    };

    /* ---------- Verteilung und Ereignis ---------- */
    function dist(): { mu: number; s: number; a: number; b: number; unit: string; dec: number; step: number } {
      if (sit() === 'iq') return { mu: 100, s: 15, a: p.ia, b: p.ib, unit: '', dec: 0, step: 1 };
      if (sit() === 'fill') return { mu: 500, s: 4, a: p.fa, b: p.fb, unit: ` ${ctx.t('ml')}`, dec: 1, step: 0.5 };
      return { mu: p.mu, s: p.sg, a: p.a, b: p.b, unit: '', dec: 1, step: 0.1 };
    }
    /** Wirksame Grenzen (−∞ / +∞ bei einseitigen Ereignissen). */
    function bounds(): { lo: number; hi: number } {
      const d = dist();
      const lo = typ() === 'le' ? -Infinity : Math.min(d.a, typ() === 'between' ? d.b : Infinity);
      const hi = typ() === 'ge' ? Infinity : Math.max(d.b, typ() === 'between' ? d.a : -Infinity);
      return { lo, hi };
    }
    function P(): number {
      const d = dist();
      const { lo, hi } = bounds();
      return prob(lo, hi, d.mu, d.s);
    }
    const xRange = (): [number, number] => {
      const d = dist();
      return sit() === 'abs' ? [-6, 6] : [d.mu - 4 * d.s, d.mu + 4 * d.s];
    };

    /* ---------- Zahlen ---------- */
    const pct = (v: number) => `${fmt.num(v * 100, v < 0.001 ? 3 : 1)} %`;
    const p4 = (v: number) => fmt.fixed(v, 4);
    const xn = (v: number) => fmt.num(v, dist().dec);
    const Q = (s: string) => (p.show ? s : '?');

    /* ---------- Aufteilung ---------- */
    function regions(): { dens: Rect; cdf: Rect | null; col: Rect } {
      const w = surface.width;
      const h = surface.height;
      let left: Rect;
      let colR: Rect;
      if (!wideLayout()) {
        const ph = Math.round(clamp(w * (p.cdf && mode() === 'area' ? 1.15 : 0.85), 260, h * 0.56));
        left = { x: 0, y: 0, w, h: ph };
        colR = { x: 2, y: ph + 6, w: w - 4, h: h - ph - 8 };
      } else {
        const cw = Math.round(clamp(w * 0.38, 270, 370));
        left = { x: 0, y: 0, w: w - cw - 10, h };
        colR = { x: w - cw, y: 2, w: cw - 2, h: h - 4 };
      }
      if (!p.cdf || mode() !== 'area') return { dens: left, cdf: null, col: colR };
      const dh = Math.round(left.h * 0.6);
      return { dens: { ...left, h: dh }, cdf: { x: left.x, y: left.y + dh + 6, w: left.w, h: left.h - dh - 6 }, col: colR };
    }
    const plot = new Plot(surface, { x: [-6, 6], y: [0, 0.45], equalAspect: false, pan: false, zoom: false, controls: false, region: () => regions().dens, xAxis: { label: 'x' }, yAxis: { label: '' } });
    const plotC = new Plot(surface, { x: [-6, 6], y: [0, 1], equalAspect: false, pan: false, zoom: false, controls: false, region: () => regions().cdf ?? { x: -10, y: -10, w: 1, h: 1 }, xAxis: { label: 'x' }, yAxis: { label: '' } });

    /* ---------- Zustand der Ansichten „Binomial“ und „Stichprobe“ ---------- */
    let shownK = Math.min(p.bk, p.bn);
    /** Balkenhöhen der Binomialverteilung: alter Stand → neuer Stand (überblendet). */
    let barsFrom: number[] = binomPmf(p.bn, p.bp);
    let barsTo: number[] = barsFrom;
    const barTween = new Tween(650, ease.inOutCubic);
    const barsNow = (): number[] => {
      if (!barTween.running) return barsTo;
      const t = barTween.value;
      const n = Math.max(barsFrom.length, barsTo.length);
      return Array.from({ length: n }, (_, k) => (barsFrom[k] ?? 0) + ((barsTo[k] ?? 0) - (barsFrom[k] ?? 0)) * t);
    };
    let rngSeed = 1;
    let rnd = seededRandom(rngSeed);
    let samples: number[] = [];
    /** Gerade fallende Werte: x und Startzeit. */
    let falling: { x: number; t0: number }[] = [];
    let shownCounts: number[] = [];
    let shownStats = { n: 0, mean: 0, sd: 0 };
    const FALL_MS = 650;
    /** Maximaler Näherungsfehler max_k |P(X ≤ k) − Näherung| für n = 5 … 200 (zwischengespeichert). */
    const errCache = new Map<string, number[]>();
    function errCurve(pp: number, cc: boolean): number[] {
      const key = `${pp.toFixed(2)}|${cc}`;
      let v = errCache.get(key);
      if (!v) {
        v = [];
        for (let n = 5; n <= 200; n++) {
          const pmf = binomPmf(n, pp);
          const { mu, sigma } = binomMoments(n, pp);
          let acc = 0;
          let m = 0;
          for (let k = 0; k <= n; k++) {
            acc += pmf[k]!;
            m = Math.max(m, Math.abs(acc - cdf(k + (cc ? 0.5 : 0), mu, sigma)));
          }
          v.push(m);
        }
        errCache.set(key, v);
      }
      return v;
    }

    /* ---------- Griffe ---------- */
    let dragging = 0;
    const setBound = (which: 'a' | 'b', x: number) => {
      dragging = performance.now();
      const d = dist();
      const [x0, x1] = xRange();
      const v = Math.round(clamp(x, x0, x1) / d.step) * d.step;
      const key = sit() === 'abs' ? which : sit() === 'iq' ? (which === 'a' ? 'ia' : 'ib') : which === 'a' ? 'fa' : 'fb';
      ctx.set({ [key]: Number(v.toFixed(2)) });
    };
    plot.addHandle({ get: () => [shown.a, 0], set: (x) => setBound('a', x), axis: 'x', enabled: () => !ctx.locked && mode() === 'area' && typ() !== 'le', color: () => col.a() });
    plot.addHandle({ get: () => [shown.b, 0], set: (x) => setBound('b', x), axis: 'x', enabled: () => !ctx.locked && mode() === 'area' && typ() !== 'ge', color: () => col.b() });
    // Grenze k der Binomialverteilung (bei k + 0,5 bzw. k)
    plot.addHandle({
      get: () => [shownK + (p.cc ? 0.5 : 0), 0],
      set: (x) => {
        dragging = performance.now();
        ctx.set({ bk: clamp(Math.round(x - (p.cc ? 0.5 : 0)), 0, p.bn) });
      },
      axis: 'x',
      enabled: () => !ctx.locked && mode() === 'binom',
      color: () => col.b(),
    });

    /* ---------- Ergebnisse ---------- */
    function evLabel(): string {
      const d = dist();
      if (typ() === 'le') return `P(X ≤ ${xn(d.b)})`;
      if (typ() === 'ge') return `P(X ≥ ${xn(d.a)})`;
      const { lo, hi } = bounds();
      return `P(${xn(lo)} ≤ X ≤ ${xn(hi)})`;
    }
    function updateReadouts(): void {
      const d = dist();
      ctx.readout('bin', null);
      ctx.readout('smp', null);
      if (mode() !== 'area') {
        ctx.readout('p', null);
        ctx.readout('z', null);
        if (mode() === 'binom') {
          const k = Math.min(p.bk, p.bn);
          const { mu, sigma } = binomMoments(p.bn, p.bp);
          ctx.readout(
            'bin',
            `μ = ${fmt.num(mu, 2)}, σ = ${fmt.num(sigma, 3)}; P(X ≤ ${k}) = ${p4(binomCdf(p.bn, p.bp, k))} (${ctx.t('exact')}) ≈ ${p4(normalApproxCdf(p.bn, p.bp, k, p.cc))} (${ctx.t('approx')})`,
          );
        } else {
          const st = sampleStats(samples, d.mu - d.s, d.mu + d.s);
          ctx.readout('smp', samples.length ? `n = ${samples.length}: x̄ ≈ ${fmt.num(st.mean, 2)}, s ≈ ${fmt.num(st.sd, 2)}, ${ctx.t('smpShare')} μ ± σ: ${pct(st.share)}` : null);
        }
        return;
      }
      ctx.readout('p', `${evLabel()} ≈ ${p4(P())} ≈ ${pct(P())}`);
      const z = (x: number) => fmt.num(zScore(x, d.mu, d.s), 2);
      if (typ() === 'le') ctx.readout('z', `z = ${z(d.b)}`);
      else if (typ() === 'ge') ctx.readout('z', `z = ${z(d.a)}`);
      else ctx.readout('z', `z₁ = ${z(Math.min(d.a, d.b))}, z₂ = ${z(Math.max(d.a, d.b))}`);
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
    function title(x: number, y: number, label: string, color = th().muted, maxW = Infinity): void {
      const g = surface.g;
      let size = F(12, 11);
      g.font = font(700, size);
      while (g.measureText(label).width > maxW && size > 9) {
        size -= 0.5;
        g.font = font(700, size);
      }
      text(g, label, x, y, { font: font(700, size), color, align: 'left' });
    }
    const fstyle = (size: number, color = th().text, weight = 600): FormulaStyle => ({
      size,
      font: th().font,
      mathFont: th().mathFont,
      color,
      weight,
      palette: { f: col.f(), A: col.area(), c: col.cdf(), a: col.a(), b: col.b(), r: col.rule(), m: th().muted },
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
    function line(src: string, x: number, y: number, maxW: number, size: number, color = th().text): number {
      const box = fitFormula(src, maxW, size, color);
      box.draw(surface.g, x, y + box.asc);
      return y + box.asc + box.desc;
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

    /* ---------- weiche Anzeige ---------- */
    const d0 = dist();
    let shown = { mu: d0.mu, s: d0.s, a: d0.a, b: d0.b, x0: xRange()[0], x1: xRange()[1] };
    let lastFrame = performance.now();
    const intro = new Tween(900, ease.outCubic);
    const swap = new Tween(450, ease.outCubic);

    /* ---------- Dichte ---------- */
    function drawDensity(): void {
      const g = surface.g;
      const theme = th();
      const { mu, s } = shown;
      const yMax = Math.max(sit() === 'abs' ? 0.42 : 0, pdf(mu, mu, s)) * 1.18;
      plot.setRangePadded([shown.x0, shown.x1], [0, yMax], { left: F(40, 32), bottom: F(26, 24), top: 10, right: 12 });
      plot.begin();
      plot.grid();
      plot.axes();
      const r = plot.rect;
      const f = (x: number) => pdf(x, mu, s);
      // Fläche
      const lo = typ() === 'le' ? shown.x0 - 1 : Math.min(shown.a, typ() === 'between' ? shown.b : Infinity);
      const hi = typ() === 'ge' ? shown.x1 + 1 : Math.max(shown.b, typ() === 'between' ? shown.a : -Infinity);
      const reveal = intro.running ? intro.value : 1;
      plot.fillBetween(f, () => 0, lo, hi, { fill: withAlpha(col.area(), (theme.dark ? 0.42 : 0.3) * reveal) });
      // σ-Markierungen: Wendestellen μ ± σ
      for (const k of [-1, 1]) {
        const x = mu + k * s;
        plot.segment([x, 0], [x, f(x)], { color: withAlpha(theme.text, 0.35), width: 1.2, dash: [3, 4] });
        plot.point(x, f(x), { color: col.f(), radius: 3.5 });
      }
      plot.segment([mu, 0], [mu, f(mu)], { color: withAlpha(theme.text, 0.45), width: 1.4, dash: [6, 4] });
      // σ-Klammer
      const yb = f(mu + s) * 0.55;
      const [x1p, ybp] = plot.toPx(mu, yb);
      const x2p = plot.px(mu + s);
      g.save();
      g.strokeStyle = withAlpha(theme.text, 0.65);
      g.lineWidth = 1.4;
      g.beginPath();
      g.moveTo(x1p, ybp - 4);
      g.lineTo(x1p, ybp + 4);
      g.moveTo(x1p, ybp);
      g.lineTo(x2p, ybp);
      g.moveTo(x2p, ybp - 4);
      g.lineTo(x2p, ybp + 4);
      g.stroke();
      g.restore();
      tag(plot, (x1p + x2p) / 2, ybp - 12, 'σ', theme.text, 'center', F(13, 12));
      tag(plot, x1p + 6, r.y + 12, 'μ', theme.text, 'left', F(13, 12));
      // Kurve
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.6)' : mixColor(col.f(), '#ffffff', 0.5, 0.6);
      g.shadowBlur = 5;
      plot.fn(f, { color: col.f(), width: 3 });
      g.restore();
      // Grenzen
      const bound = (x: number, c: string, name: string) => {
        plot.segment([x, 0], [x, f(x)], { color: c, width: 2.2 });
        plot.point(x, 0, { color: c, radius: 6.5 });
        const [px] = plot.toPx(x, 0);
        tag(plot, px, plot.py(0) - 14, `\\c{${name}}{${name}}`, c, 'center', F(13, 12));
      };
      if (typ() !== 'le') bound(shown.a, col.a(), 'a');
      if (typ() !== 'ge') bound(shown.b, col.b(), 'b');
      // Flächenwert
      if (p.show) {
        const xm = clamp((Math.max(lo, shown.x0) + Math.min(hi, shown.x1)) / 2, shown.x0 + 0.5, shown.x1 - 0.5);
        const ym = f(clamp(mu, Math.max(lo, shown.x0), Math.min(hi, shown.x1))) * 0.42;
        const [px, py] = plot.toPx(xm, ym);
        tag(plot, px, py, `\\c{A}{${pct(P())}}`, col.area(), 'center', F(15, 13.5));
      }
      plot.end();
    }

    /* ---------- Verteilungsfunktion ---------- */
    function drawCdf(R: Rect): void {
      const g = surface.g;
      const theme = th();
      const { mu, s } = shown;
      plotC.setRangePadded([shown.x0, shown.x1], [0, 1], { left: F(40, 32), bottom: F(22, 20), top: 18, right: 12 });
      plotC.begin();
      plotC.grid();
      plotC.axes();
      const F_ = (x: number) => cdf(x, mu, s);
      plotC.fn(F_, { color: col.cdf(), width: 2.6 });
      const r = plotC.rect;
      text(g, ctx.t('cdfT'), r.x + 8, R.y + 9, { font: font(700, F(11.5, 10.5)), color: col.cdf(), align: 'left' });
      const hasA = typ() !== 'le';
      const hasB = typ() !== 'ge';
      const fa = hasA ? F_(shown.a) : 0;
      const fb = hasB ? F_(shown.b) : 1;
      const mark = (x: number, v: number, c: string, name: string) => {
        plotC.segment([x, 0], [x, v], { color: withAlpha(c, 0.6), width: 1.4, dash: [4, 3] });
        plotC.segment([shown.x0, v], [x, v], { color: withAlpha(c, 0.6), width: 1.4, dash: [4, 3] });
        plotC.point(x, v, { color: c, radius: 4.5 });
        if (p.show) tag(plotC, plotC.px(shown.x0) + 6, plotC.py(v) + (v > 0.8 ? 10 : -10), `Φ(\\c{${name}}{${name}}) ≈ ${p4(v)}`, c, 'left', F(11.5, 10.5));
      };
      if (hasA) mark(shown.a, fa, col.a(), 'a');
      if (hasB) mark(shown.b, fb, col.b(), 'b');
      // Differenz als Balken am rechten Rand
      const xr = r.x + r.w - 18;
      const y1 = plotC.py(Math.min(fa, fb));
      const y2 = plotC.py(Math.max(fa, fb));
      g.save();
      g.fillStyle = withAlpha(col.area(), theme.dark ? 0.6 : 0.45);
      g.fillRect(xr - 5, y2, 10, y1 - y2);
      g.strokeStyle = col.area();
      g.lineWidth = 1.5;
      g.strokeRect(xr - 5, y2, 10, y1 - y2);
      g.restore();
      plotC.end();
    }

    /* ---------- Karten ---------- */
    function probCard(R: Rect): number {
      const g = surface.g;
      const pad = F(14, 12);
      const maxW = R.w - 2 * pad;
      const d = dist();
      const fs = F(14.5, 13);
      const rows: string[] = [];
      const z = (x: number) => fmt.num(zScore(x, d.mu, d.s), 2);
      const pv = P();
      const head = sit() === 'abs' ? `X \\t{~} N(μ = ${fmt.num(d.mu, 1)}; σ = ${fmt.num(d.s, 1)})` : `μ = ${fmt.num(d.mu, 0)}${d.unit}, σ = ${fmt.num(d.s, 0)}${d.unit}`;
      rows.push(head);
      if (typ() === 'le') {
        rows.push(`\\c{A}{P(X ≤ \\c{b}{${xn(d.b)}})} = Φ(\\c{b}{${xn(d.b)}}) ≈ \\c{A}{${Q(p4(pv))}}`);
        rows.push(`\\t{${ctx.t('std')}:} z = \\f{${xn(d.b)} − ${xn(d.mu)}}{${xn(d.s)}} = ${z(d.b)}`);
      } else if (typ() === 'ge') {
        rows.push(`\\c{A}{P(X ≥ \\c{a}{${xn(d.a)}})} = 1 − Φ(\\c{a}{${xn(d.a)}}) ≈ \\c{A}{${Q(p4(pv))}}`);
        rows.push(`\\t{${ctx.t('std')}:} z = \\f{${xn(d.a)} − ${xn(d.mu)}}{${xn(d.s)}} = ${z(d.a)}`);
      } else {
        const lo = Math.min(d.a, d.b);
        const hi = Math.max(d.a, d.b);
        rows.push(`\\c{A}{P(\\c{a}{${xn(lo)}} ≤ X ≤ \\c{b}{${xn(hi)}})} = Φ(\\c{b}{${xn(hi)}}) − Φ(\\c{a}{${xn(lo)}})`);
        rows.push(`≈ ${Q(p4(cdf(hi, d.mu, d.s)))} − ${Q(p4(cdf(lo, d.mu, d.s)))} ≈ \\c{A}{${Q(p4(pv))}}`);
        rows.push(`\\t{${ctx.t('std')}:} z_1 = ${z(lo)},  z_2 = ${z(hi)}`);
      }
      const boxes = rows.map((src) => fitFormula(src, maxW, fs));
      const h = 28 + boxes.reduce((s, b) => s + b.asc + b.desc + 8, 0) + 4;
      if (R.h <= 0) return h;
      card({ ...R, h }, col.area(), 0.03);
      title(R.x + pad, R.y + 16, ctx.t('probT'), col.area());
      let y = R.y + 28;
      boxes.forEach((b) => {
        b.draw(g, R.x + pad, y + b.asc);
        y += b.asc + b.desc + 8;
      });
      return h;
    }

    function rulesCard(R: Rect): void {
      const g = surface.g;
      const theme = th();
      const pad = F(14, 12);
      card(R);
      title(R.x + pad, R.y + 16, ctx.t('rulesT'));
      const d = dist();
      const { lo, hi } = bounds();
      const lh = Math.min(F(24, 22), (R.h - 34 - 50) / 3);
      const fs = F(13.5, 12.5);
      for (let k = 1; k <= 3; k++) {
        const y = R.y + 28 + (k - 1) * lh;
        const hit = typ() === 'between' && Math.abs(lo - (d.mu - k * d.s)) < 1e-6 && Math.abs(hi - (d.mu + k * d.s)) < 1e-6;
        if (hit) {
          g.fillStyle = withAlpha(col.rule(), theme.dark ? 0.22 : 0.14);
          roundRect(g, R.x + pad - 6, y - 2, R.w - 2 * pad + 12, lh - 2, 6);
          g.fill();
        }
        const kk = k === 1 ? '' : String(k);
        const b1 = fitFormula(`P(μ − ${kk}σ ≤ X ≤ μ + ${kk}σ)`, (R.w - 2 * pad) * 0.66, fs, hit ? col.rule() : theme.text);
        b1.draw(g, R.x + pad, y + lh / 2 + (b1.asc - b1.desc) / 2 - 1);
        text(g, `≈ ${fmt.num(sigmaRule(k) * 100, 1)} %`, R.x + R.w - pad, y + lh / 2 - 1, { font: font(700, fs), color: hit ? col.rule() : theme.text, align: 'right' });
      }
      // Dichtefunktion
      const y = R.y + 28 + 3 * lh + 10;
      if (y + 30 < R.y + R.h) {
        title(R.x + pad, y + 6, ctx.t('densT'));
        line('φ(x) = \\f{1}{σ\\r{2π}} · e^{−(x − μ)²/(2σ²)}', R.x + pad, y + 14, R.w - 2 * pad, F(14, 13));
      }
    }

    /* ---------- Ansicht „Binomialverteilung nähern“ ---------- */
    function drawBinom(): void {
      const g = surface.g;
      const theme = th();
      const n = p.bn;
      const { mu, sigma } = binomMoments(n, p.bp);
      const bars = barsNow();
      const x0 = Math.max(-0.5, Math.floor(mu - 4.2 * Math.max(sigma, 1)) - 0.5);
      const x1 = Math.min(n + 0.5, Math.ceil(mu + 4.2 * Math.max(sigma, 1)) + 0.5);
      const yMax = Math.max(...bars.slice(Math.max(0, Math.ceil(x0)), Math.floor(x1) + 1), pdf(mu, mu, sigma)) * 1.22;
      plot.setRangePadded([x0, x1], [0, yMax], { left: F(44, 36), bottom: F(26, 24), top: 10, right: 12 });
      plot.begin();
      plot.grid();
      plot.axes();
      const r = plot.rect;
      const grow = intro.running ? intro.value : 1;
      const kLine = shownK + (p.cc ? 0.5 : 0);
      // Fläche unter der Glockenkurve bis k (+ 0,5)
      const f = (x: number) => pdf(x, mu, sigma);
      plot.fillBetween(f, () => 0, x0, Math.min(kLine, x1), { fill: withAlpha(col.area(), (theme.dark ? 0.3 : 0.2) * grow) });
      // Balken
      const bw = plot.scale.x;
      for (let k = Math.max(0, Math.ceil(x0)); k <= Math.min(n, Math.floor(x1)); k++) {
        const h = (bars[k] ?? 0) * grow;
        if (h <= 0) continue;
        const [px0, py] = plot.toPx(k - 0.5, h);
        const [, pyb] = plot.toPx(k, 0);
        const on = k <= shownK;
        g.fillStyle = on ? withAlpha(col.bar(), theme.dark ? 0.75 : 0.62) : withAlpha(theme.muted, theme.dark ? 0.35 : 0.25);
        const inset = bw > 6 ? 1 : 0;
        g.fillRect(px0 + inset, py, Math.max(1, bw - 2 * inset), pyb - py);
        if (bw > 10) {
          g.strokeStyle = on ? col.bar() : withAlpha(theme.muted, 0.6);
          g.lineWidth = 1;
          g.strokeRect(px0 + inset + 0.5, py + 0.5, Math.max(1, bw - 2 * inset) - 1, pyb - py - 0.5);
        }
      }
      // Glockenkurve
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.6)' : mixColor(col.f(), '#ffffff', 0.5, 0.6);
      g.shadowBlur = 5;
      const reveal = intro.running ? ease.outCubic(clamp((intro.t - 0.3) / 0.7, 0, 1)) : 1;
      const [pxm] = plot.toPx(mu, 0);
      const spread = r.w * reveal;
      g.beginPath();
      g.rect(pxm - spread, r.y, spread * 2, r.h);
      g.clip();
      plot.fn(f, { color: col.f(), width: 3 });
      g.restore();
      // μ und σ
      plot.segment([mu, 0], [mu, f(mu)], { color: withAlpha(theme.text, 0.45), width: 1.4, dash: [6, 4] });
      tag(plot, plot.px(mu) + 6, r.y + 12, `μ = ${fmt.num(mu, 1)}`, theme.text, 'left', F(12.5, 11.5));
      // Grenze k
      const [kx] = plot.toPx(kLine, 0);
      g.save();
      g.strokeStyle = col.b();
      g.lineWidth = 2.2;
      g.setLineDash([6, 4]);
      g.beginPath();
      g.moveTo(kx, r.y + 24);
      g.lineTo(kx, plot.py(0));
      g.stroke();
      g.restore();
      tag(plot, kx, r.y + 66, p.cc ? `\\c{b}{k + 0,5 = ${fmt.num(shownK + 0.5, 1)}}` : `\\c{b}{k = ${fmt.num(shownK, 0)}}`, col.b(), 'center', F(12.5, 11.5));
      // Laplace-Bedingung
      const ok = laplaceOk(n, p.bp);
      // schmale Fläche: nur Kurzform, der Satz steht in der Karte
      const lab = r.w < 640 ? `σ = ${fmt.num(sigma, 2)} ${ok ? '> 3 ✓' : '≤ 3 ✗'}` : `σ = ${fmt.num(sigma, 2)}  ${ok ? '✓ ' + ctx.t('lapOk') : '✗ ' + ctx.t('lapBad')}`;
      tag(plot, r.x + r.w - 8, r.y + 14, lab, ok ? col.rule() : col.b(), 'right', F(12.5, 11));
      const lx = plot.px(x0) + 10;
      tag(plot, lx, r.y + 40, `\\c{f}{N(${fmt.num(mu, 1)}; ${fmt.num(sigma, 2)})}`, col.f(), 'left', F(12.5, 11.5));
      tag(plot, lx, r.y + 14, `\\c{a}{B(${n}; ${fmt.num(p.bp, 2)})}`, col.bar(), 'left', F(12.5, 11.5));
      plot.end();
    }

    function binomCard(R: Rect): number {
      const g = surface.g;
      const pad = F(14, 12);
      const maxW = R.w - 2 * pad;
      const n = p.bn;
      const k = Math.min(p.bk, n);
      const { mu, sigma } = binomMoments(n, p.bp);
      const ex = binomCdf(n, p.bp, k);
      const ap = normalApproxCdf(n, p.bp, k, p.cc);
      const other = normalApproxCdf(n, p.bp, k, !p.cc);
      const fs = F(14, 12.5);
      const ok = laplaceOk(n, p.bp);
      const zc = (k + (p.cc ? 0.5 : 0) - mu) / sigma;
      const rows = [
        `X \\t{~} \\c{a}{B(${n}; ${fmt.num(p.bp, 2)})}:   μ = n · p = ${fmt.num(mu, 2)}`,
        `σ = \\r{n · p · (1 − p)} ≈ ${fmt.num(sigma, 3)}`,
        `\\c{a}{P(X ≤ ${k})} = ${Q(p4(ex))}   \\c{m}{(${ctx.t('exact')})}`,
        `≈ \\c{f}{Φ(\\f{${p.cc ? `${k} + 0,5` : String(k)} − ${fmt.num(mu, 2)}}{${fmt.num(sigma, 3)}})} = Φ(${fmt.num(zc, 2)}) ≈ \\c{A}{${Q(p4(ap))}}`,
        ok ? `\\c{r}{\\t{✓ ${ctx.t('lapOk')}}}` : `\\c{b}{\\t{✗ ${ctx.t('lapBad')}}}`,
        `\\c{m}{${ctx.t('diff')}: ${Q(Math.abs(ex - ap) < 5e-5 ? `< ${fmt.num(0.0001, 4)}` : fmt.num(Math.abs(ex - ap), 4))};  ${p.cc ? ctx.t('noCC') : ctx.t('withCC')}: ${Q(p4(other))}}`,
      ];
      const boxes = rows.map((src) => fitFormula(src, maxW, fs));
      const h = 30 + boxes.reduce((sum, b) => sum + b.asc + b.desc + 8, 0) + 4;
      if (R.h <= 0) return h;
      card({ ...R, h }, col.bar(), 0.03);
      title(R.x + pad, R.y + 16, ctx.t('binT'), col.bar(), R.w - 2 * pad);
      let y = R.y + 30;
      boxes.forEach((b) => {
        b.draw(g, R.x + pad, y + b.asc);
        y += b.asc + b.desc + 8;
      });
      return h;
    }

    /** Größter Näherungsfehler für alle n bei festem p – mit der Laplace-Schwelle σ = 3. */
    function errCard(R: Rect): void {
      const g = surface.g;
      const theme = th();
      const pad = F(14, 12);
      card(R);
      title(R.x + pad, R.y + 16, ctx.t('errChart'), th().muted, R.w - 2 * pad);
      const errs = errCurve(p.bp, p.cc);
      const top = R.y + 34;
      const bottom = R.y + R.h - 24;
      const x0 = R.x + pad + 34;
      const x1 = R.x + R.w - pad;
      if (bottom - top < 40) return;
      const hi = Math.max(0.02, ...errs) * 1.1;
      const X = (n: number) => x0 + ((n - 5) / 195) * (x1 - x0);
      const Y = (v: number) => bottom - (v / hi) * (bottom - top);
      g.strokeStyle = theme.gridMinor;
      g.lineWidth = 1;
      for (const v of [0, hi / 2, hi]) {
        g.beginPath();
        g.moveTo(x0, Y(v));
        g.lineTo(x1, Y(v));
        g.stroke();
        text(g, fmt.num(v, 3), x0 - 4, Y(v), { font: font(600, 9.5), color: theme.muted, align: 'right' });
      }
      for (const n of [5, 50, 100, 150, 200]) text(g, String(n), X(n), bottom + 10, { font: font(600, 10), color: theme.muted });
      // Laplace-Schwelle: σ > 3 ⇔ n > 9/(p(1 − p))
      const nLap = 9 / (p.bp * (1 - p.bp));
      if (nLap <= 200) {
        const xl = X(Math.max(5, nLap));
        g.fillStyle = withAlpha(col.rule(), theme.dark ? 0.12 : 0.08);
        g.fillRect(xl, top, x1 - xl, bottom - top);
        g.strokeStyle = col.rule();
        g.setLineDash([4, 4]);
        g.beginPath();
        g.moveTo(xl, top);
        g.lineTo(xl, bottom);
        g.stroke();
        g.setLineDash([]);
        text(g, ctx.t('sigma3'), Math.min(xl + 4, x1 - 30), top + 8, { font: font(700, 10.5), color: col.rule(), align: 'left' });
      }
      const grow = intro.running ? intro.value : 1;
      g.strokeStyle = col.b();
      g.lineWidth = 2;
      g.beginPath();
      errs.forEach((e, i) => {
        const px = X(i + 5);
        const py = Y(e * grow);
        if (i === 0) g.moveTo(px, py);
        else g.lineTo(px, py);
      });
      g.stroke();
      const cur = errs[p.bn - 5];
      if (cur !== undefined) {
        g.fillStyle = col.b();
        g.beginPath();
        g.arc(X(p.bn), Y(cur * grow), 4.5, 0, Math.PI * 2);
        g.fill();
      }
    }

    /* ---------- Ansicht „Stichprobe“ ---------- */
    function binEdges(): { lo: number; w: number; count: number } {
      const d = dist();
      const [lo, hi] = xRange();
      const w = d.s / 3;
      return { lo, w, count: Math.ceil((hi - lo) / w) };
    }
    function targetCounts(): number[] {
      const { lo, w, count } = binEdges();
      const out = new Array<number>(count).fill(0);
      const now = performance.now();
      const landed = new Set(falling.filter((f) => now - f.t0 < FALL_MS).map((f) => f.x));
      for (const x of samples) {
        if (landed.has(x)) continue;
        const i = Math.floor((x - lo) / w);
        if (i >= 0 && i < count) out[i]!++;
      }
      return out;
    }
    function drawSample(): void {
      const g = surface.g;
      const theme = th();
      const d = dist();
      const [x0, x1] = xRange();
      const { lo, w, count } = binEdges();
      const N = Math.max(1, samples.length);
      const yMax = pdf(d.mu, d.mu, d.s) * 1.35;
      plot.setRangePadded([x0, x1], [0, yMax], { left: F(44, 36), bottom: F(26, 24), top: 10, right: 12 });
      plot.begin();
      plot.grid();
      plot.axes();
      const r = plot.rect;
      // Histogramm (Dichte-Maßstab)
      for (let i = 0; i < count; i++) {
        const c = shownCounts[i] ?? 0;
        if (c <= 0.001) continue;
        const h = Math.min(yMax * 0.98, c / (N * w));
        const [px0, py] = plot.toPx(lo + i * w, h);
        const [px1, pyb] = plot.toPx(lo + (i + 1) * w, 0);
        const inside = lo + (i + 0.5) * w >= d.mu - d.s && lo + (i + 0.5) * w <= d.mu + d.s;
        g.fillStyle = withAlpha(inside ? col.area() : col.bar(), theme.dark ? 0.6 : 0.45);
        g.fillRect(px0 + 1, py, px1 - px0 - 2, pyb - py);
        g.strokeStyle = inside ? col.area() : col.bar();
        g.lineWidth = 1;
        g.strokeRect(px0 + 1.5, py + 0.5, px1 - px0 - 3, pyb - py - 0.5);
      }
      // Dichtekurve
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.6)' : mixColor(col.f(), '#ffffff', 0.5, 0.6);
      g.shadowBlur = 5;
      plot.fn((x) => pdf(x, d.mu, d.s), { color: col.f(), width: 3 });
      g.restore();
      for (const k of [-1, 1]) plot.segment([d.mu + k * d.s, 0], [d.mu + k * d.s, pdf(d.mu + k * d.s, d.mu, d.s)], { color: withAlpha(theme.text, 0.35), width: 1.2, dash: [3, 4] });
      // fallende Werte
      const now = performance.now();
      for (const fv of falling) {
        const t = (now - fv.t0) / FALL_MS;
        if (t < 0 || t >= 1) continue;
        const yy = yMax * (1 - ease.inCubic(t)) * 0.95;
        const [px, py] = plot.toPx(fv.x, yy);
        g.fillStyle = col.bar();
        g.globalAlpha = 0.9;
        g.beginPath();
        g.arc(px, py, F(4, 3.5), 0, Math.PI * 2);
        g.fill();
        g.globalAlpha = 1;
      }
      if (!samples.length) {
        text(g, ctx.t('smpEmpty'), r.x + r.w / 2, r.y + F(46, 52), { font: font(600, F(14, 12)), color: theme.muted });
      }
      tag(plot, plot.px(x0) + 10, r.y + 14, `\\c{f}{N(${xn(d.mu)}; ${xn(d.s)})}`, col.f(), 'left', F(12.5, 11.5));
      if (wideLayout()) text(g, ctx.t('histT'), r.x + r.w - 8, r.y + 14, { font: font(600, F(11, 10)), color: theme.muted, align: 'right' });
      plot.end();
    }

    function sampleCard(R: Rect): number {
      const g = surface.g;
      const pad = F(14, 12);
      const maxW = R.w - 2 * pad;
      const d = dist();
      const fs = F(14, 12.5);
      const st1 = sampleStats(samples, d.mu - d.s, d.mu + d.s);
      const st2 = sampleStats(samples, d.mu - 2 * d.s, d.mu + 2 * d.s);
      const has = samples.length > 0;
      const rows = [
        `\\t{${ctx.t('smpN')}}: n = ${Math.round(shownStats.n)}`,
        `\\t{${ctx.t('smpMean')}}: \\c{a}{x̄ ≈ ${has ? fmt.num(shownStats.mean, 2) : '–'}}   \\c{m}{(μ = ${xn(d.mu)})}`,
        `\\t{${ctx.t('smpSd')}}: \\c{a}{s ≈ ${has ? fmt.num(shownStats.sd, 2) : '–'}}   \\c{m}{(σ = ${xn(d.s)})}`,
        `\\t{${ctx.t('smpShare')}} μ ± σ: \\c{A}{${has ? pct(st1.share) : '–'}}   \\c{m}{(${fmt.num(sigmaRule(1) * 100, 1)} %)}`,
        `\\t{${ctx.t('smpShare')}} μ ± 2σ: \\c{A}{${has ? pct(st2.share) : '–'}}   \\c{m}{(${fmt.num(sigmaRule(2) * 100, 1)} %)}`,
      ];
      const boxes = rows.map((src) => fitFormula(src, maxW, fs));
      const h = 30 + boxes.reduce((sum, b) => sum + b.asc + b.desc + 9, 0) + 4;
      if (R.h <= 0) return h;
      card({ ...R, h }, col.bar(), 0.03);
      title(R.x + pad, R.y + 16, ctx.t('smpT'), col.bar());
      let y = R.y + 30;
      boxes.forEach((b) => {
        b.draw(g, R.x + pad, y + b.asc);
        y += b.asc + b.desc + 9;
      });
      return h;
    }

    function drawSamples(count: number): void {
      const d = dist();
      const now = performance.now();
      const fresh: number[] = [];
      for (let i = 0; i < count; i++) fresh.push(normalSample(rnd, d.mu, d.s));
      samples = samples.concat(fresh);
      if (!reduced) {
        const show = count <= 60 ? fresh : fresh.filter((_, i) => i % Math.ceil(count / 60) === 0);
        const span = count <= 60 ? 900 : 700;
        falling = falling.filter((f) => now - f.t0 < FALL_MS).concat(show.map((x, i) => ({ x, t0: now + (i / show.length) * span })));
      }
      updateReadouts();
      ctx.requestRender();
    }
    function clearSamples(): void {
      samples = [];
      falling = [];
      shownCounts = [];
      shownStats = { n: 0, mean: 0, sd: 0 };
      rngSeed += 1;
      rnd = seededRandom(rngSeed);
      updateReadouts();
      ctx.requestRender();
    }

    /* ---------- Rendern ---------- */
    function render(): void {
      const now = performance.now();
      const dt = Math.min(0.05, (now - lastFrame) / 1000);
      lastFrame = now;
      if (dragging && now - dragging > 250) dragging = 0;
      const d = dist();
      const [gx0, gx1] = xRange();
      const goal = { mu: d.mu, s: d.s, a: d.a, b: d.b, x0: gx0, x1: gx1 };
      let moving = false;
      const k = reduced ? 1 : 1 - Math.exp(-dt * 9);
      const next = { ...shown };
      for (const key of Object.keys(goal) as (keyof typeof goal)[]) {
        const diff = goal[key] - shown[key];
        const kk = (key === 'a' || key === 'b') && dragging ? 1 : k;
        if (Math.abs(diff) > 1e-4 * (1 + Math.abs(goal[key]))) {
          next[key] = shown[key] + diff * kk;
          moving = true;
        } else next[key] = goal[key];
      }
      shown = next;
      // k gleitet weich zum Zielwert
      const goalK = Math.min(p.bk, p.bn);
      if (dragging || reduced || Math.abs(goalK - shownK) < 1e-3) shownK = goalK;
      else {
        shownK += (goalK - shownK) * k;
        moving = true;
      }
      // Histogramm und Kennzahlen der Stichprobe gleiten zu den Zielwerten
      let falls = false;
      if (mode() === 'sample') {
        const target = targetCounts();
        const kk = reduced ? 1 : 1 - Math.exp(-dt * 10);
        shownCounts = target.map((t, i) => {
          const c = shownCounts[i] ?? 0;
          if (Math.abs(t - c) < 0.01) return t;
          moving = true;
          return c + (t - c) * kk;
        });
        const st = sampleStats(samples, 0, 0);
        const goalS = { n: samples.length, mean: samples.length ? st.mean : 0, sd: samples.length ? st.sd : 0 };
        if (shownStats.n === 0 && goalS.n > 0) shownStats = { ...goalS, n: 0 };
        for (const key2 of ['n', 'mean', 'sd'] as const) {
          const diff = goalS[key2] - shownStats[key2];
          if (Math.abs(diff) > 1e-3 * (1 + Math.abs(goalS[key2]))) {
            shownStats[key2] += diff * kk;
            moving = true;
          } else shownStats[key2] = goalS[key2];
        }
        falls = falling.some((f) => now - f.t0 < FALL_MS);
      }
      surface.begin();
      plot.resize();
      plotC.resize();
      const R = regions();
      const C = R.col;
      const gap = F(10, 8);
      const sw = swap.running ? swap.value : 1;
      const g = surface.g;
      if (mode() === 'binom') {
        drawBinom();
        g.save();
        g.globalAlpha = sw;
        const h1 = binomCard({ ...C, h: 0 });
        binomCard({ x: C.x, y: C.y, w: C.w, h: h1 });
        if (C.h - h1 - gap > 120) errCard({ x: C.x, y: C.y + h1 + gap, w: C.w, h: Math.min(C.h - h1 - gap, F(230, 200)) });
        g.restore();
      } else if (mode() === 'sample') {
        drawSample();
        g.save();
        g.globalAlpha = sw;
        const h1 = sampleCard({ ...C, h: 0 });
        sampleCard({ x: C.x, y: C.y, w: C.w, h: h1 });
        if (C.h - h1 - gap > 110) rulesCard({ x: C.x, y: C.y + h1 + gap, w: C.w, h: Math.min(C.h - h1 - gap, F(190, 180)) });
        g.restore();
      } else {
        drawDensity();
        if (R.cdf) drawCdf(R.cdf);
        g.save();
        g.globalAlpha = sw;
        const h1 = probCard({ ...C, h: 0 });
        probCard({ x: C.x, y: C.y, w: C.w, h: h1 });
        if (C.h - h1 - gap > 110) rulesCard({ x: C.x, y: C.y + h1 + gap, w: C.w, h: Math.min(C.h - h1 - gap, F(190, 180)) });
        g.restore();
      }
      if (moving || dragging || intro.running || barTween.running || swap.running || falls) ctx.requestRender();
    }

    function setRule(k: number): void {
      const d = dist();
      const lo = d.mu - k * d.s;
      const hi = d.mu + k * d.s;
      if (sit() === 'abs') ctx.set({ typ: 'between', a: Number(lo.toFixed(2)), b: Number(hi.toFixed(2)) });
      else if (sit() === 'iq') ctx.set({ typ: 'between', ia: lo, ib: hi });
      else ctx.set({ typ: 'between', fa: lo, fb: hi });
    }

    return {
      update(changed, source) {
        if (source === 'init') intro.play(1200);
        else {
          if (changed.has('sit') || changed.has('typ')) intro.play(900);
          if (changed.has('mode')) {
            swap.play();
            intro.play(1000);
          }
        }
        if (changed.has('sit')) {
          const [x0, x1] = xRange();
          const d = dist();
          shown = { mu: d.mu, s: d.s, a: d.a, b: d.b, x0, x1 };
        }
        // neue Verteilung → alte Stichprobe passt nicht mehr
        if (source !== 'init' && (changed.has('sit') || changed.has('mu') || changed.has('sg'))) clearSamples();
        if (changed.has('bn') || changed.has('bp')) {
          barsFrom = barsNow();
          barsTo = binomPmf(p.bn, p.bp);
          if (source === 'init') barsFrom = barsTo;
          else barTween.play();
          if (p.bk > p.bn && source === 'input') ctx.set({ bk: p.bn });
        }
        updateReadouts();
        ctx.requestRender();
      },
      action(id) {
        if (ctx.locked) return;
        if (id === 'r1') setRule(1);
        else if (id === 'r2') setRule(2);
        else if (id === 'r3') setRule(3);
        else if (id === 'kmu') ctx.set({ bk: Math.round(p.bn * p.bp) });
        else if (id === 'draw') drawSamples(50);
        else if (id === 'many') drawSamples(1000);
        else if (id === 'clear') clearSamples();
      },
      render,
      destroy: () => surface.destroy(),
    };
  },
});
