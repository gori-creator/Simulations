import { defineSimulation, drawCard, ease, Plot, prefersReducedMotion, roundRect, Surface, Tween, withAlpha, type Rect } from '../../../sim-core';
import {
  binomialPmf,
  confInterval,
  coverage,
  ellipseAt,
  ellipseQuadratic,
  normalPdf,
  runningRate,
  sigmaTable,
  halfWidth,
  laplaceOk,
  predictionInterval,
  probInside,
  requiredN,
  sampleDraws,
  wilsonInterval,
  waldInterval,
  zFor,
  type Interval,
  type Method,
} from './model';

const L = (de: string, en: string) => ({ de, en });
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/** Eine gezogene Stichprobe mit ihrem Intervall. */
interface Sample {
  k: number;
  h: number;
  iv: Interval;
  /** Prognose: h im Intervall? Konfidenz: p im Intervall? */
  hit: boolean;
  /** Zeitpunkt (für das Einblenden). */
  t: number;
}

const MAX_SAMPLES = 400;

/**
 * Prognose- und Konfidenzintervalle: Bei bekanntem p liegt die relative
 * Häufigkeit h meist im Prognoseintervall p ± z·σ. Umgekehrt schließt man
 * von h auf p: Viele Stichproben zeigen, dass rund γ der Konfidenzintervalle
 * das wahre p treffen. Die Konfidenzellipse verbindet beides, der nötige
 * Stichprobenumfang folgt aus der gewünschten Genauigkeit.
 */
export default defineSimulation({
  id: 'konfidenzintervall',
  layout: { aspect: 1.6, aspectNarrow: 0.5 },
  dragHint: true,
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Ansicht', 'View'),
      options: [
        { value: 'prog', label: L('Prognoseintervall (p bekannt)', 'Prediction interval (p known)') },
        { value: 'conf', label: L('Konfidenzintervalle (p gesucht)', 'Confidence intervals (p unknown)') },
        { value: 'ellipse', label: L('Konfidenzellipse', 'Confidence ellipse') },
        { value: 'size', label: L('Nötiger Stichprobenumfang', 'Required sample size') },
        { value: 'game', label: L('Spiel: Umfrage mit geheimem p', 'Game: poll with a secret p') },
      ],
      default: 'conf',
    },
    { key: 'p', type: 'number', label: L('Wahre Wahrscheinlichkeit p', 'True probability p'), min: 0.01, max: 0.99, step: 0.01, default: 0.4, visibleIf: (v) => v.mode !== 'game' },
    { key: 'n', type: 'number', label: L('Stichprobenumfang n', 'Sample size n'), min: 10, max: 2000, step: 10, default: 100 },
    {
      key: 'level',
      type: 'choice',
      label: L('Sicherheitswahrscheinlichkeit γ', 'Confidence level γ'),
      options: [
        { value: '90', label: L('90 % (z = 1,64)', '90% (z = 1.64)') },
        { value: '95', label: L('95 % (z = 1,96)', '95% (z = 1.96)') },
        { value: '99', label: L('99 % (z = 2,58)', '99% (z = 2.58)') },
      ],
      default: '95',
    },
    {
      key: 'method',
      type: 'choice',
      label: L('Konfidenzintervall berechnen', 'Compute the confidence interval'),
      options: [
        { value: 'wald', label: L('Näherung h ± z·√(h(1 − h)/n)', 'Approximation h ± z·√(h(1 − h)/n)') },
        { value: 'wilson', label: L('Exakt über die Konfidenzellipse', 'Exactly via the confidence ellipse') },
      ],
      default: 'wald',
      visibleIf: (v) => v.mode === 'conf' || v.mode === 'ellipse' || v.mode === 'game',
    },
    { key: 'h', type: 'number', label: L('Beobachtete relative Häufigkeit h', 'Observed relative frequency h'), min: 0, max: 1, step: 0.01, default: 0.4, visibleIf: (v) => v.mode === 'ellipse' },
    { key: 'eps', type: 'number', label: L('Gewünschte Genauigkeit ± ε', 'Desired accuracy ± ε'), min: 0.01, max: 0.2, step: 0.005, default: 0.03, visibleIf: (v) => v.mode === 'size' },
    { key: 'pre', type: 'boolean', label: L('Vorwissen über p nutzen', 'Use prior knowledge of p'), default: false, visibleIf: (v) => v.mode === 'size' },
    { key: 'gauss', type: 'boolean', label: L('Gaußkurve und σ-Bereiche', 'Bell curve and σ ranges'), default: true, visibleIf: (v) => v.mode === 'prog' },
    { key: 'auto', type: 'boolean', label: L('Laufend Stichproben ziehen', 'Keep drawing samples'), default: false, visibleIf: (v) => v.mode === 'prog' || v.mode === 'conf' },
    { key: 'show', type: 'boolean', label: L('Wahres p zeigen', 'Show the true p'), default: true, visibleIf: (v) => v.mode === 'conf' },
  ],
  resultsParam: 'show',
  actions: [
    { id: 'one', label: L('Eine Stichprobe', 'One sample'), primary: true, visibleIf: (v) => v.mode === 'prog' || v.mode === 'conf' },
    { id: 'many', label: L('100 Stichproben', '100 samples'), visibleIf: (v) => v.mode === 'prog' || v.mode === 'conf' },
    { id: 'clear', label: L('Neu beginnen', 'Start over'), visibleIf: (v) => v.mode === 'prog' || v.mode === 'conf' },
    { id: 'poll', label: L('Umfrage machen', 'Run the poll'), primary: true, visibleIf: (v) => v.mode === 'game' },
    { id: 'reveal', label: L('Auflösen', 'Reveal'), visibleIf: (v) => v.mode === 'game' },
    { id: 'round', label: L('Nächste Runde', 'Next round'), visibleIf: (v) => v.mode === 'game' },
  ],
  readouts: [
    { key: 'iv', label: L('Intervall', 'Interval') },
    { key: 'count', label: L('Treffer', 'Hits'), spoiler: true },
    { key: 'theory', label: L('Theoretisch', 'In theory'), spoiler: true },
  ],
  presets: [
    { id: 'conf95', label: L('100 Intervalle zu 95 %: Wie viele treffen?', '100 intervals at 95%: how many hit?'), values: { mode: 'conf', p: 0.4, n: 100, level: '95', method: 'wald', show: true } },
    { id: 'hidden', label: L('p verdeckt: Wo liegt es?', 'p hidden: where is it?'), values: { mode: 'conf', p: 0.37, n: 200, level: '95', method: 'wald', show: false } },
    { id: 'small', label: L('Kleines p, kleines n: Näherung versagt', 'Small p, small n: the approximation fails'), values: { mode: 'conf', p: 0.05, n: 30, level: '95', method: 'wald' } },
    { id: 'small2', label: L('… und über die Ellipse', '… and via the ellipse'), values: { mode: 'conf', p: 0.05, n: 30, level: '95', method: 'wilson' } },
    { id: 'prog', label: L('Prognose: Münzwurf n = 100', 'Prediction: coin toss n = 100'), values: { mode: 'prog', p: 0.5, n: 100, level: '95' } },
    { id: 'prog99', label: L('Prognose mit 99 % und n = 1000', 'Prediction with 99% and n = 1000'), values: { mode: 'prog', p: 0.3, n: 1000, level: '99' } },
    { id: 'ellipse', label: L('Konfidenzellipse n = 100, h = 0,4', 'Confidence ellipse n = 100, h = 0.4'), values: { mode: 'ellipse', n: 100, h: 0.4, p: 0.5, level: '95', method: 'wilson' } },
    { id: 'size', label: L('Umfrage: ± 3 % bei 95 %', 'Poll: ± 3% at 95%'), values: { mode: 'size', eps: 0.03, level: '95', pre: false } },
    { id: 'game', label: L('Spiel: Wie gut schätzt deine Umfrage?', 'Game: how good is your poll?'), values: { mode: 'game', n: 200, level: '95', method: 'wald' } },
    { id: 'size2', label: L('Umfrage mit Vorwissen p ≈ 0,2', 'Poll with prior p ≈ 0.2'), values: { mode: 'size', eps: 0.03, level: '95', pre: true, p: 0.2 } },
  ],
  strings: {
    de: {
      canvas: 'Prognose- und Konfidenzintervalle: Verteilung der relativen Häufigkeit, viele Stichproben mit ihren Intervallen, Konfidenzellipse und nötiger Stichprobenumfang.',
      progTitle: 'Prognoseintervall: Wo landet h, wenn p bekannt ist?',
      confTitle: 'Konfidenzintervall: Wo liegt p, wenn nur h bekannt ist?',
      ellTitle: 'Konfidenzellipse: alle Paare (p | h) mit |h − p| ≤ z·σ',
      sizeTitle: 'Wie groß muss die Stichprobe sein?',
      sigma: 'σ = √(p(1 − p)/n) = {s}',
      prog: '[p − z·σ; p + z·σ] = [{a}; {b}]',
      count: 'Absolute Häufigkeit: {a} ≤ X ≤ {b}',
      inside: '{k} von {n} Stichproben im Intervall ({q})',
      exactIn: 'Exakt mit der Binomialverteilung: P = {q}',
      hits: '{k} von {n} Intervallen enthalten p ({q})',
      cover: 'Theoretisch treffen {q} der Intervalle.',
      last: 'Letzte Stichprobe: {k} von {n} Treffern, h = {h}',
      waldF: 'h ± z·√(h(1 − h)/n) = [{a}; {b}]',
      wilsonF: 'Lösung von (h − p)² = z²·p(1 − p)/n: [{a}; {b}]',
      noSample: 'Noch keine Stichprobe – drücke „Eine Stichprobe“ oder „100 Stichproben“.',
      laplaceBad: 'Achtung: σ = {s} ≤ 3 – die Näherung durch die Normalverteilung ist unsicher.',
      laplaceGood: 'Laplace-Bedingung σ > 3 erfüllt.',
      ellH: 'Waagerecht bei h = {h}: Konfidenzintervall für p',
      ellP: 'Senkrecht bei p = {p}: Prognoseintervall für h',
      eqEll: '(h − p)² = z²·p(1 − p)/n',
      sizeF: 'n ≥ z²·p(1 − p)/ε²',
      sizeF0: 'Ohne Vorwissen p = 0,5: n ≥ (z / (2ε))²',
      sizeN: 'n ≥ {n}',
      sizeHalf: 'Halbe Breite ε = z·√(p(1 − p)/n): viermal so viele Befragte → nur halb so breit.',
      hidden: 'p ist verdeckt – schätze es aus den Intervallen!',
      inLabel: 'im Intervall',
      outLabel: 'außerhalb',
      hitLabel: 'trifft p',
      missLabel: 'verfehlt p',
      axisSample: 'Stichprobe',
      truth: 'wahres p',
      sigmaHead: 'Bereich',
      exactCol: 'exakt',
      ruleCol: 'σ-Regel',
      rateTitle: 'Trefferquote nach jeder Stichprobe',
      quadHead: 'Rechenweg: Gleichung nach p auflösen',
      gameTitle: 'Spiel: Das wahre p ist geheim. Deine Umfrage liefert ein Intervall – trifft es?',
      gameRule: 'Punkte gibt es nur für Treffer – je schmaler das Intervall, desto mehr. Große Umfragen kosten ein wenig.',
      gameStart: 'Wähle n und drücke „Umfrage machen“.',
      gameResult: 'Umfrage: {k} von {n} Ja-Stimmen, h = {h}',
      gameAsk: 'Enthält dein Intervall das geheime p? Drücke „Auflösen“.',
      gameHit: 'Treffer! +{s} Punkte',
      gameMiss: 'Daneben – 0 Punkte. Auch das passiert bei γ manchmal.',
      gameStats: '{r} Runden, {k} Treffer ({q})',
      gameScore: '{s} Punkte',
      gameWidth: 'mittlere Intervallbreite {w}',
    },
    en: {
      canvas: 'Prediction and confidence intervals: distribution of the relative frequency, many samples with their intervals, the confidence ellipse and the required sample size.',
      progTitle: 'Prediction interval: where does h land if p is known?',
      confTitle: 'Confidence interval: where is p if only h is known?',
      ellTitle: 'Confidence ellipse: all pairs (p | h) with |h − p| ≤ z·σ',
      sizeTitle: 'How large must the sample be?',
      sigma: 'σ = √(p(1 − p)/n) = {s}',
      prog: '[p − z·σ; p + z·σ] = [{a}; {b}]',
      count: 'Absolute frequency: {a} ≤ X ≤ {b}',
      inside: '{k} of {n} samples inside the interval ({q})',
      exactIn: 'Exactly with the binomial distribution: P = {q}',
      hits: '{k} of {n} intervals contain p ({q})',
      cover: 'In theory {q} of the intervals hit.',
      last: 'Last sample: {k} of {n} successes, h = {h}',
      waldF: 'h ± z·√(h(1 − h)/n) = [{a}; {b}]',
      wilsonF: 'Solution of (h − p)² = z²·p(1 − p)/n: [{a}; {b}]',
      noSample: 'No sample yet – press “One sample” or “100 samples”.',
      laplaceBad: 'Careful: σ = {s} ≤ 3 – the normal approximation is unreliable.',
      laplaceGood: 'Laplace condition σ > 3 holds.',
      ellH: 'Horizontal at h = {h}: confidence interval for p',
      ellP: 'Vertical at p = {p}: prediction interval for h',
      eqEll: '(h − p)² = z²·p(1 − p)/n',
      sizeF: 'n ≥ z²·p(1 − p)/ε²',
      sizeF0: 'Without prior knowledge p = 0.5: n ≥ (z / (2ε))²',
      sizeN: 'n ≥ {n}',
      sizeHalf: 'Half-width ε = z·√(p(1 − p)/n): four times as many people → only half as wide.',
      hidden: 'p is hidden – estimate it from the intervals!',
      inLabel: 'inside',
      outLabel: 'outside',
      hitLabel: 'contains p',
      missLabel: 'misses p',
      axisSample: 'sample',
      truth: 'true p',
      sigmaHead: 'range',
      exactCol: 'exact',
      ruleCol: 'σ rule',
      rateTitle: 'hit rate after each sample',
      quadHead: 'Derivation: solve for p',
      gameTitle: 'Game: the true p is secret. Your poll gives an interval – does it hit?',
      gameRule: 'Points only for hits – the narrower the interval, the more. Large polls cost a little.',
      gameStart: 'Choose n and press “Run the poll”.',
      gameResult: 'Poll: {k} of {n} said yes, h = {h}',
      gameAsk: 'Does your interval contain the secret p? Press “Reveal”.',
      gameHit: 'Hit! +{s} points',
      gameMiss: 'Missed – 0 points. With γ this happens sometimes.',
      gameStats: '{r} rounds, {k} hits ({q})',
      gameScore: '{s} points',
      gameWidth: 'mean interval width {w}',
    },
  },
  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const th = () => ctx.theme;
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const N = (v: number, d = 3) => fmt.num(v, d);
    const pct = (v: number) => `${fmt.num(v * 100, 1)} %`;
    const reduced = prefersReducedMotion();

    /* -------------------------------------------------------------- */
    /* Zustand                                                         */
    /* -------------------------------------------------------------- */

    const z = () => zFor(+p.level);
    const method = () => p.method as Method;
    let samples: Sample[] = [];
    /** Kugeln der letzten Stichprobe (für die Anzeige). */
    let lastDraws: boolean[] = [];
    let pmf = binomialPmf(p.n, p.p);
    let lastAuto = 0;

    const GOOD = () => th().series[2]!;
    const BAD = () => th().series[1]!;
    const P_COL = () => th().series[4]!;
    const H_COL = () => th().series[0]!;
    const BAR = () => th().series[5]!;

    /* ---------------- Spiel ---------------- */
    interface Round {
      secret: number;
      n: number;
      k: number;
      iv: Interval;
      revealed: boolean;
      hit: boolean;
      score: number;
    }
    let rounds: Round[] = [];
    let secret = 0.15 + Math.random() * 0.7;
    let current: Round | null = null;
    const revealTw = new Tween(900, ease.outCubic);

    /** Punkte: Treffer zählen, schmale Intervalle zählen mehr, große Umfragen kosten etwas. */
    function scoreOf(r: Omit<Round, 'score'>): number {
      if (!r.hit) return 0;
      const width = r.iv[1] - r.iv[0];
      return Math.max(1, Math.round(100 * (1 - width * 4) - r.n / 100));
    }

    function poll(): void {
      if (current && !current.revealed) return;
      if (current?.revealed) newRound();
      const draws = sampleDraws(p.n, secret, Math.random);
      const k = draws.filter(Boolean).length;
      lastDraws = draws;
      const iv = confInterval(method(), k / p.n, p.n, z());
      current = { secret, n: p.n, k, iv, revealed: false, hit: secret >= iv[0] && secret <= iv[1], score: 0 };
    }
    function reveal(): void {
      if (!current || current.revealed) return;
      current.revealed = true;
      current.score = scoreOf(current);
      rounds.push(current);
      revealTw.play();
    }
    function newRound(): void {
      secret = 0.15 + Math.random() * 0.7;
      current = null;
      lastDraws = [];
    }

    function clearSamples(): void {
      samples = [];
      lastDraws = [];
    }

    function drawOne(now: number): void {
      const draws = sampleDraws(p.n, p.p, Math.random);
      const k = draws.filter(Boolean).length;
      const h = k / p.n;
      lastDraws = draws;
      let iv: Interval;
      let hit: boolean;
      if (p.mode === 'prog') {
        iv = predictionInterval(p.p, p.n, z());
        hit = h >= iv[0] - 1e-12 && h <= iv[1] + 1e-12;
      } else {
        iv = confInterval(method(), h, p.n, z());
        hit = p.p >= iv[0] - 1e-12 && p.p <= iv[1] + 1e-12;
      }
      samples.push({ k, h, iv, hit, t: now });
      if (samples.length > MAX_SAMPLES) samples.shift();
    }

    function drawMany(count: number): void {
      const now = performance.now();
      for (let i = 0; i < count; i++) drawOne(now + (reduced ? -1e6 : i * 9));
    }

    /* -------------------------------------------------------------- */
    /* Animation                                                       */
    /* -------------------------------------------------------------- */

    const build = new Tween(900, ease.outCubic);
    build.play();
    const appear = (s: Sample, now: number) => (reduced ? 1 : clamp((now - s.t) / 450, 0, 1));

    /* -------------------------------------------------------------- */
    /* Layout                                                          */
    /* -------------------------------------------------------------- */

    const wide = () => surface.width >= 640 && surface.width >= surface.height * 1.2;
    function regions(): { main: Rect; card: Rect } {
      const w = surface.width;
      const h = surface.height;
      const pad = 10;
      if (wide()) {
        const mw = Math.round(w * 0.62);
        return { main: { x: pad, y: pad, w: mw - pad, h: h - 2 * pad }, card: { x: mw + pad, y: pad, w: w - mw - 2 * pad, h: h - 2 * pad } };
      }
      const mh = Math.round(h * 0.56);
      return { main: { x: pad, y: pad, w: w - 2 * pad, h: mh }, card: { x: pad, y: mh + 2 * pad, w: w - 2 * pad, h: h - mh - 3 * pad } };
    }

    let plotArea: Rect = { x: 0, y: 0, w: 100, h: 100 };
    const plot = new Plot(surface, {
      x: [0, 1],
      y: [0, 1],
      equalAspect: false,
      zoom: false,
      pan: false,
      controls: false,
      region: () => plotArea,
      xAxis: { label: 'h' },
      yAxis: { label: '' },
    });

    // Ellipse: h und p ziehen
    plot.addHandle({
      get: () => [0.02, p.h],
      set: (_x, y) => ctx.set({ h: Math.round(clamp(y, 0, 1) * 100) / 100 }),
      enabled: () => !ctx.locked && p.mode === 'ellipse',
      color: () => H_COL(),
      axis: 'y',
    });
    plot.addHandle({
      get: () => [p.p, 0.02],
      set: (x) => ctx.set({ p: Math.round(clamp(x, 0.01, 0.99) * 100) / 100 }),
      enabled: () => !ctx.locked && p.mode === 'ellipse',
      color: () => P_COL(),
      axis: 'x',
    });
    // Stichprobenumfang: ε ziehen
    plot.addHandle({
      get: () => [plot.bounds.xMin + (plot.bounds.xMax - plot.bounds.xMin) * 0.04, p.eps],
      set: (_x, y) => ctx.set({ eps: Math.round(clamp(y, 0.01, 0.2) * 200) / 200 }),
      enabled: () => !ctx.locked && p.mode === 'size',
      color: () => BAD(),
      axis: 'y',
    });

    /* -------------------------------------------------------------- */
    /* Textzeilen                                                      */
    /* -------------------------------------------------------------- */

    interface Seg {
      s: string;
      c?: string;
      w?: number;
    }
    function segLine(g: CanvasRenderingContext2D, segs: Seg[], x: number, y: number, maxW: number, size: number, alpha = 1): number {
      let s = size;
      const width = (q: number) =>
        segs.reduce((sum, sg) => {
          g.font = `${sg.w ?? 500} ${q}px ${th().font}`;
          return sum + g.measureText(sg.s).width;
        }, 0);
      while (s > 10.5 && width(s) > maxW) s -= 0.5;
      g.save();
      g.globalAlpha *= alpha;
      g.textBaseline = 'middle';
      g.textAlign = 'left';
      let cx = x;
      let cy = y;
      for (const sg of segs) {
        g.font = `${sg.w ?? 500} ${s}px ${th().font}`;
        for (const wd of g.measureText(sg.s).width > maxW * 0.5 ? sg.s.split(/(?<= )/) : [sg.s]) {
          const w = g.measureText(wd).width;
          if (cx + w > x + maxW && cx > x + 20) {
            cx = x + 12;
            cy += s * 1.4;
          }
          g.fillStyle = sg.c ?? th().text;
          g.fillText(wd, cx, cy);
          cx += w;
        }
      }
      g.restore();
      return cy - y + s * 1.45;
    }

    /* -------------------------------------------------------------- */
    /* Ansicht: Prognoseintervall                                      */
    /* -------------------------------------------------------------- */

    /** Sichtbarer Bereich von h um p (± 4,5 σ). */
    function hRange(center: number): [number, number] {
      const s = Math.sqrt((p.p * (1 - p.p)) / p.n);
      const r = Math.max(4.5 * s, 0.04);
      let a = center - r;
      let b = center + r;
      if (a < 0) {
        b -= a;
        a = 0;
      }
      if (b > 1) {
        a -= b - 1;
        b = 1;
      }
      return [Math.max(0, a), Math.min(1, b)];
    }

    function drawProg(g: CanvasRenderingContext2D, R: Rect, now: number): void {
      const t = th();
      const iv = predictionInterval(p.p, p.n, z());
      const [x0, x1] = hRange(p.p);
      let ymax = 0;
      for (let k = 0; k <= p.n; k++) if (k / p.n >= x0 && k / p.n <= x1) ymax = Math.max(ymax, pmf[k]!);
      // unten Platz für die gezogenen Stichproben
      const stripH = Math.min(90, R.h * 0.26);
      plotArea = { x: R.x + 8, y: R.y + 30, w: R.w - 16, h: R.h - 38 - stripH };
      plot.setAxes({ x: { label: 'h' }, y: { label: 'P' } });
      plot.setRange([x0, x1], [-ymax * 0.06, ymax * 1.18]);
      plot.resize();
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      const bw = Math.max(1 / p.n, (x1 - x0) / 400);
      const grow = build.value;
      for (let k = 0; k <= p.n; k++) {
        const h = k / p.n;
        if (h < x0 - bw || h > x1 + bw) continue;
        const inside = h >= iv[0] - 1e-12 && h <= iv[1] + 1e-12;
        const col = inside ? BAR() : withAlpha(t.text, 0.25);
        const v = pmf[k]! * grow;
        plot.polygon(
          [
            [h - bw * 0.42, 0],
            [h + bw * 0.42, 0],
            [h + bw * 0.42, v],
            [h - bw * 0.42, v],
          ],
          { fill: col, alpha: inside ? 0.8 : 0.6 },
        );
      }
      // Gaußkurve (Dichte je Einheit von X, passend zur Balkenhöhe) und σ-Bereiche
      if (p.gauss) {
        const mu = p.n * p.p;
        const sd = Math.sqrt(p.n * p.p * (1 - p.p));
        const sdh = sd / p.n;
        for (let k = 3; k >= 1; k--) {
          plot.polygon(
            [
              [p.p - k * sdh, 0],
              [p.p + k * sdh, 0],
              [p.p + k * sdh, ymax * 1.08],
              [p.p - k * sdh, ymax * 1.08],
            ],
            { fill: P_COL(), alpha: t.dark ? 0.06 : 0.045 },
          );
          plot.text(p.p + k * sdh, 0, `${k}σ`, { color: withAlpha(P_COL(), 0.9), size: 10, weight: '600', offset: [0, -8], halo: true });
        }
        plot.fn((h) => normalPdf(h * p.n, mu, sd) * grow, { color: t.text, width: 2, alpha: 0.75 });
      }
      // Intervallgrenzen
      for (const e of iv) plot.vline(e, { color: BAD(), width: 2, dash: [6, 4] });
      plot.vline(p.p, { color: P_COL(), width: 2 });
      plot.text(p.p, ymax * 1.12, `p = ${N(p.p, 2)}`, { color: P_COL(), size: 12, weight: 'bold', halo: true });
      plot.text(iv[0], ymax * 1.02, N(iv[0], 3), { color: BAD(), size: 11, weight: 'bold', align: 'right', offset: [-4, 0], halo: true });
      plot.text(iv[1], ymax * 1.02, N(iv[1], 3), { color: BAD(), size: 11, weight: 'bold', align: 'left', offset: [4, 0], halo: true });
      plot.end();
      // Stichproben als Punkte unterhalb, gestapelt je h
      const pr = plot.rect;
      const toX = (h: number) => pr.x + ((h - x0) / (x1 - x0)) * pr.w;
      const base = R.y + R.h - 10;
      const stack = new Map<number, number>();
      const dot = clamp(pr.w / Math.max(60, p.n * (x1 - x0) * 1.2), 2.2, 5);
      g.save();
      g.strokeStyle = withAlpha(t.text, 0.2);
      g.beginPath();
      g.moveTo(pr.x, base + 1);
      g.lineTo(pr.x + pr.w, base + 1);
      g.stroke();
      for (const s of samples) {
        const c = stack.get(s.k) ?? 0;
        stack.set(s.k, c + 1);
        const a = appear(s, now);
        const yy = base - dot - c * dot * 2.1;
        if (yy < base - stripH + 10) continue;
        const fall = (1 - ease.outCubic(a)) * (stripH * 0.8);
        g.fillStyle = withAlpha(s.hit ? GOOD() : BAD(), 0.85);
        g.beginPath();
        g.arc(toX(s.h), yy - fall, dot, 0, Math.PI * 2);
        g.fill();
      }
      g.restore();
      // Titel
      segLine(g, [{ s: tr('progTitle'), c: t.muted, w: 700 }], R.x + 14, R.y + 16, R.w - 28, 13);
    }

    /* -------------------------------------------------------------- */
    /* Ansicht: viele Konfidenzintervalle                              */
    /* -------------------------------------------------------------- */

    function drawConf(g: CanvasRenderingContext2D, R: Rect, now: number): void {
      const t = th();
      const [x0, x1] = hRange(p.p);
      // Titel (kann umbrechen), darunter die Kugeln der letzten Stichprobe
      const titleH = segLine(g, [{ s: tr('confTitle'), c: t.muted, w: 700 }], R.x + 14, R.y + 16, R.w - 28, 13);
      const ballsH = Math.min(70, R.h * 0.18);
      const top = R.y + 8 + titleH;
      plotArea = { x: R.x + 8, y: top + ballsH + 4, w: R.w - 16, h: R.y + R.h - top - ballsH - 14 };
      const shown = Math.max(20, Math.min(100, Math.floor(plotArea.h / 4.2)));
      const list = samples.slice(-shown);
      plot.setAxes({ x: { label: 'p' }, y: { label: tr('axisSample') } });
      plot.setRange([x0 - (x1 - x0) * 0.12, x1], [-shown * 0.06, shown + 1.5]);
      plot.resize();
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      if (p.show) {
        plot.vline(p.p, { color: P_COL(), width: 2.4 });
        plot.text(p.p, shown + 0.6, `${tr('truth')} = ${N(p.p, 2)}`, { color: P_COL(), size: 12, weight: 'bold', halo: true, offset: [0, -6] });
      }
      // neueste oben
      list.forEach((s, idx) => {
        const row = shown - (list.length - 1 - idx);
        const a = appear(s, now);
        const y = row + (1 - ease.outCubic(a)) * 3;
        const col = p.show ? (s.hit ? GOOD() : BAD()) : H_COL();
        const w = list.length > 60 ? 1.8 : 2.6;
        plot.segment([s.iv[0], y], [s.iv[1], y], { color: withAlpha(col, 0.35 + 0.6 * a), width: w });
        if (s.iv[1] - s.iv[0] < 1e-9) plot.point(s.h, y, { color: col, radius: 3.2, hollow: true });
        plot.point(s.h, y, { color: col, radius: list.length > 60 ? 1.8 : 2.8 });
      });
      plot.end();
      // Kugeln
      const bx = R.x + 14;
      const by = top + 2;
      const bw = R.w - 28;
      const nShow = Math.min(lastDraws.length, 200);
      if (nShow) {
        const bh = drawBalls(g, bx, by, bw, nShow);
        const last = samples[samples.length - 1];
        if (last) segLine(g, [{ s: tr('last', { k: last.k, n: p.n, h: N(last.h, 3) }), c: t.text, w: 600 }], bx, by + bh + 10, bw, 12.5);
      } else segLine(g, [{ s: tr('noSample'), c: t.muted }], bx, by + 18, bw, 13);
    }

    /** Kugeln einer Stichprobe in 2 bis 4 Reihen; liefert die Höhe. */
    function drawBalls(g: CanvasRenderingContext2D, x: number, y: number, w: number, count: number): number {
      const t = th();
      let rows = 2;
      let per = Math.ceil(count / rows);
      let r = w / per / 2.3;
      while (r < 1.6 && rows < 4) {
        rows++;
        per = Math.ceil(count / rows);
        r = w / per / 2.3;
      }
      r = clamp(r, 1.1, 6);
      for (let i = 0; i < count; i++) {
        const row = Math.floor(i / per);
        const col = i % per;
        g.fillStyle = lastDraws[i] ? H_COL() : withAlpha(t.text, 0.22);
        g.beginPath();
        g.arc(x + r + col * r * 2.3, y + r + row * r * 2.5, r, 0, Math.PI * 2);
        g.fill();
      }
      return rows * r * 2.5;
    }

    /* -------------------------------------------------------------- */
    /* Ansicht: Konfidenzellipse                                       */
    /* -------------------------------------------------------------- */

    function drawEllipse(g: CanvasRenderingContext2D, R: Rect): void {
      const t = th();
      const side = Math.min(R.w - 30, R.h - 50);
      plotArea = { x: R.x + (R.w - side) / 2, y: R.y + 34, w: side, h: side };
      plot.setAxes({ x: { label: 'p' }, y: { label: 'h' } });
      plot.setRange([-0.06, 1.03], [-0.06, 1.03]);
      plot.resize();
      plot.begin();
      plot.grid({ minor: true });
      plot.axes();
      const zz = z();
      const lo = (q: number) => ellipseAt(q, p.n, zz)[0];
      const hi = (q: number) => ellipseAt(q, p.n, zz)[1];
      const grow = build.value;
      plot.fillBetween((q) => q + (hi(q) - q) * grow, (q) => q + (lo(q) - q) * grow, 0, 1, { fill: BAR(), alpha: t.dark ? 0.3 : 0.22 });
      plot.fn((q) => q + (hi(q) - q) * grow, { color: BAR(), width: 2 });
      plot.fn((q) => q + (lo(q) - q) * grow, { color: BAR(), width: 2 });
      plot.fn((q) => q, { color: withAlpha(t.text, 0.3), width: 1, dash: [4, 4] });
      // waagerecht: h → Konfidenzintervall
      const ci = p.method === 'wald' ? waldInterval(p.h, p.n, zz) : wilsonInterval(p.h, p.n, zz);
      plot.hline(p.h, { color: withAlpha(H_COL(), 0.6), width: 1.4 });
      plot.segment([ci[0], p.h], [ci[1], p.h], { color: H_COL(), width: 4 });
      plot.segment([ci[0], 0], [ci[1], 0], { color: H_COL(), width: 6 });
      for (const e of ci) plot.segment([e, 0], [e, p.h], { color: withAlpha(H_COL(), 0.5), width: 1.2, dash: [3, 3] });
      plot.text(ci[0], 0, N(ci[0], 3), { color: H_COL(), size: 11, weight: 'bold', offset: [-4, -12], align: 'right', halo: true });
      plot.text(ci[1], 0, N(ci[1], 3), { color: H_COL(), size: 11, weight: 'bold', offset: [4, -12], align: 'left', halo: true });
      // senkrecht: p → Prognoseintervall
      const pi = predictionInterval(p.p, p.n, zz);
      plot.vline(p.p, { color: withAlpha(P_COL(), 0.6), width: 1.4 });
      plot.segment([p.p, Math.max(0, pi[0])], [p.p, Math.min(1, pi[1])], { color: P_COL(), width: 4 });
      plot.segment([0, Math.max(0, pi[0])], [0, Math.min(1, pi[1])], { color: P_COL(), width: 6 });
      plot.point(p.p, p.h, { color: t.text, radius: 3.5 });
      plot.end();
      segLine(g, [{ s: tr('ellTitle'), c: t.muted, w: 700 }], R.x + 14, R.y + 16, R.w - 28, 13);
    }

    /* -------------------------------------------------------------- */
    /* Ansicht: Stichprobenumfang                                      */
    /* -------------------------------------------------------------- */

    function drawSize(g: CanvasRenderingContext2D, R: Rect): void {
      const t = th();
      const zz = z();
      const pp = p.pre ? p.p : 0.5;
      const need = requiredN(p.eps, zz, pp);
      const nMax = Math.max(200, Math.min(20000, need * 2.2));
      plotArea = { x: R.x + 8, y: R.y + 32, w: R.w - 16, h: R.h - 40 };
      plot.setAxes({ x: { label: 'n' }, y: { label: 'ε' } });
      plot.setRange([-nMax * 0.1, nMax], [-Math.max(0.12, p.eps * 2.2) * 0.06, Math.max(0.12, p.eps * 2.2)]);
      plot.resize();
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      const grow = build.value;
      const to = nMax * grow;
      plot.fn((n) => (n > 1 ? halfWidth(0.5, n, zz) : NaN), { color: withAlpha(BAR(), p.pre ? 0.45 : 1), width: p.pre ? 1.6 : 2.6, to });
      if (p.pre) plot.fn((n) => (n > 1 ? halfWidth(pp, n, zz) : NaN), { color: H_COL(), width: 2.6, to });
      plot.hline(p.eps, { color: BAD(), width: 1.6, dash: [6, 4] });
      plot.vline(need, { color: withAlpha(t.text, 0.5), width: 1.4, dash: [4, 4] });
      plot.point(need, p.eps, { color: BAD(), radius: 5 });
      plot.text(need, p.eps, `n = ${fmt.num(need, 0)}`, { color: BAD(), size: 13, weight: 'bold', offset: [10, -14], align: 'left', halo: true });
      plot.text(plot.bounds.xMin, p.eps, `ε = ${N(p.eps, 3)}`, { color: BAD(), size: 11, weight: 'bold', offset: [26, -10], align: 'left', halo: true });
      plot.end();
      segLine(g, [{ s: tr('sizeTitle'), c: t.muted, w: 700 }], R.x + 14, R.y + 16, R.w - 28, 13);
    }

    /* -------------------------------------------------------------- */
    /* Ansicht: Spiel                                                  */
    /* -------------------------------------------------------------- */

    function drawGame(g: CanvasRenderingContext2D, R: Rect): void {
      const t = th();
      const titleH = segLine(g, [{ s: tr('gameTitle'), c: t.muted, w: 700 }], R.x + 14, R.y + 16, R.w - 28, 13);
      const top = R.y + 10 + titleH;
      // Kugeln der Umfrage
      const nShow = Math.min(lastDraws.length, 200);
      const bw = R.w - 28;
      let y = top;
      if (nShow) y += drawBalls(g, R.x + 14, y, bw, nShow) + 8;
      // Zahlenstrahl 0 … 1 mit Intervall und (nach dem Auflösen) geheimem p
      plotArea = { x: R.x + 8, y: y + 10, w: R.w - 16, h: Math.min(220, R.y + R.h - y - 40) };
      plot.setAxes({ x: { label: 'p' }, y: { label: '' } });
      plot.setRange([-0.04, 1.02], [-0.5, 2]);
      plot.resize();
      plot.begin();
      // eigener Zahlenstrahl von 0 bis 1
      plot.segment([0, 0], [1, 0], { color: th().axis, width: 1.6 });
      for (let k = 0; k <= 10; k++) {
        plot.segment([k / 10, -0.08], [k / 10, 0.08], { color: th().axis, width: 1.2 });
        if (k % 2 === 0) plot.text(k / 10, 0, N(k / 10, 1), { color: th().muted, size: 11, offset: [0, 14], halo: false });
      }
      if (current) {
        const c = current;
        plot.segment([c.iv[0], 0.8], [c.iv[1], 0.8], { color: H_COL(), width: 7 });
        plot.point(c.k / c.n, 0.8, { color: t.text, radius: 4 });
        plot.text(c.iv[0], 0.8, N(c.iv[0], 3), { color: H_COL(), size: 12, weight: 'bold', offset: [-6, -14], align: 'right', halo: true });
        plot.text(c.iv[1], 0.8, N(c.iv[1], 3), { color: H_COL(), size: 12, weight: 'bold', offset: [6, -14], align: 'left', halo: true });
        if (c.revealed) {
          const a = revealTw.running ? revealTw.value : 1;
          const col = c.hit ? GOOD() : BAD();
          plot.segment([c.secret, 1.8 - a], [c.secret, 1.8], { color: col, width: 3 });
          plot.point(c.secret, 1.8 - a, { color: col, radius: 6 });
          if (a >= 0.999) plot.text(c.secret, 1.6, `p = ${N(c.secret, 3)}`, { color: col, size: 13, weight: 'bold', offset: [8, 0], align: 'left', halo: true });
        } else plot.text(0.5, 1.6, '?', { color: P_COL(), size: 22, weight: 'bold', halo: true });
      }
      plot.end();
      // Verlauf der Runden als Leiste
      const hy = plotArea.y + plotArea.h + 18;
      const last = rounds.slice(-24);
      const cell = Math.min(26, (R.w - 28) / 24);
      last.forEach((r, i) => {
        g.fillStyle = withAlpha(r.hit ? GOOD() : BAD(), 0.85);
        roundRect(g, R.x + 14 + i * cell, hy, cell - 3, 12, 3);
        g.fill();
      });
    }

    /* -------------------------------------------------------------- */
    /* Karte                                                           */
    /* -------------------------------------------------------------- */

    function drawCardBody(g: CanvasRenderingContext2D, R: Rect): void {
      const t = th();
      drawCard(g, R, t, BAR());
      const x = R.x + 16;
      const maxW = R.w - 32;
      const size = R.w < 330 ? 13 : R.w < 440 ? 14 : 15;
      let y = R.y + 22;
      const zz = z();
      const line = (segs: Seg[], d = 0) => (y += segLine(g, segs, x, y, maxW, size + d));
      line([{ s: `n = ${fmt.num(p.n, 0)},  γ = ${p.level} %,  z = ${N(zz, 2)}`, c: t.text, w: 700 }], 1);
      if (p.mode === 'prog') {
        const s = Math.sqrt((p.p * (1 - p.p)) / p.n);
        const iv = predictionInterval(p.p, p.n, zz);
        line([{ s: `p = ${N(p.p, 2)}`, c: P_COL(), w: 700 }]);
        line([{ s: tr('sigma', { s: N(s, 4) }), c: t.text }]);
        line([{ s: tr('prog', { a: N(iv[0], 3), b: N(iv[1], 3) }), c: BAD(), w: 700 }]);
        line([{ s: tr('count', { a: N(iv[0] * p.n, 1), b: N(iv[1] * p.n, 1) }), c: t.muted }], -1);
        y += 6;
        const P = probInside(p.n, p.p, iv, pmf);
        line([{ s: tr('exactIn', { q: pct(P) }), c: t.text }], -1);
        if (samples.length) {
          const k = samples.filter((q) => q.hit).length;
          line([{ s: tr('inside', { k, n: samples.length, q: pct(k / samples.length) }), c: GOOD(), w: 700 }], -0.5);
          legend(x, y + 4, maxW, size, tr('inLabel'), tr('outLabel'));
          y += size * 1.6;
        }
        // Sigma-Regeln: exakt gegen Näherung
        if (p.gauss) {
          y += 6;
          const tab = sigmaTable(p.n, p.p, pmf);
          const cw = [maxW * 0.36, maxW * 0.32, maxW * 0.32];
          const row = (cells: Seg[]) => {
            let cx = x;
            cells.forEach((c, i) => {
              segLine(g, [c], cx, y, cw[i]! - 4, size - 2);
              cx += cw[i]!;
            });
            y += size * 1.4;
          };
          row([{ s: tr('sigmaHead'), c: t.muted, w: 700 }, { s: tr('exactCol'), c: t.muted, w: 700 }, { s: tr('ruleCol'), c: t.muted, w: 700 }]);
          for (const r of tab) row([{ s: `μ ± ${r.k}σ`, c: P_COL(), w: 700 }, { s: pct(r.exact), c: t.text, w: 600 }, { s: pct(r.approx), c: t.muted }]);
        }
        laplace(x, maxW, size);
        return;
      }
      if (p.mode === 'conf') {
        const last = samples[samples.length - 1];
        if (last) {
          line([{ s: `h = ${N(last.h, 3)}`, c: H_COL(), w: 700 }]);
          const f = method() === 'wald' ? 'waldF' : 'wilsonF';
          line([{ s: tr(f, { a: N(last.iv[0], 3), b: N(last.iv[1], 3) }), c: t.text, w: 600 }], -0.5);
        } else line([{ s: tr('noSample'), c: t.muted }], -1);
        y += 6;
        if (!p.show) {
          line([{ s: tr('hidden'), c: t.muted, w: 600 }], -0.5);
          return;
        }
        if (samples.length) {
          const k = samples.filter((q) => q.hit).length;
          line([{ s: tr('hits', { k, n: samples.length, q: pct(k / samples.length) }), c: GOOD(), w: 700 }]);
          legend(x, y + 4, maxW, size, tr('hitLabel'), tr('missLabel'));
          y += size * 1.6;
        }
        const cov = coverage(method(), p.n, p.p, zz, pmf);
        line([{ s: tr('cover', { q: pct(cov) }), c: t.muted }], -1);
        const bottom = R.y + R.h - size * 2.4;
        if (samples.length > 1 && bottom - y > 80) drawRate(g, { x: x - 4, y: y + 8, w: maxW + 8, h: Math.min(150, bottom - y - 12) }, cov);
        laplace(x, maxW, size);
        return;
      }
      if (p.mode === 'game') {
        const total = rounds.reduce((sum, r) => sum + r.score, 0);
        const hits = rounds.filter((r) => r.hit).length;
        line([{ s: tr('gameRule'), c: t.muted }], -1.5);
        y += 4;
        if (current) {
          line([{ s: tr('gameResult', { k: current.k, n: current.n, h: N(current.k / current.n, 3) }), c: H_COL(), w: 700 }], -0.5);
          line([{ s: `[${N(current.iv[0], 3)}; ${N(current.iv[1], 3)}]`, c: H_COL(), w: 800 }], 1);
          if (current.revealed) {
            line([{ s: current.hit ? tr('gameHit', { s: current.score }) : tr('gameMiss'), c: current.hit ? GOOD() : BAD(), w: 800 }], 0.5);
          } else line([{ s: tr('gameAsk'), c: t.muted }], -1.5);
        } else line([{ s: tr('gameStart'), c: t.muted }], -1);
        y += 8;
        if (rounds.length) {
          line([{ s: tr('gameStats', { r: rounds.length, k: hits, q: pct(hits / rounds.length) }), c: t.text, w: 600 }], -1);
          line([{ s: tr('gameScore', { s: total }), c: P_COL(), w: 800 }], 2);
          const avgW = rounds.reduce((sum, r) => sum + (r.iv[1] - r.iv[0]), 0) / rounds.length;
          line([{ s: tr('gameWidth', { w: N(avgW, 3) }), c: t.muted }], -1.5);
        }
        return;
      }
      if (p.mode === 'ellipse') {
        line([{ s: tr('eqEll'), c: BAR(), w: 700 }]);
        y += 4;
        const ci = method() === 'wald' ? waldInterval(p.h, p.n, zz) : wilsonInterval(p.h, p.n, zz);
        line([{ s: tr('ellH', { h: N(p.h, 2) }), c: H_COL(), w: 600 }], -1);
        line([{ s: `[${N(ci[0], 3)}; ${N(ci[1], 3)}]`, c: H_COL(), w: 800 }]);
        if (method() === 'wilson') {
          // Wald zum Vergleich
          const w = waldInterval(p.h, p.n, zz);
          line([{ s: `${ctx.lang === 'de' ? 'Näherung' : 'approximation'}: [${N(w[0], 3)}; ${N(w[1], 3)}]`, c: t.muted }], -1.5);
        }
        y += 4;
        const pi = predictionInterval(p.p, p.n, zz);
        line([{ s: tr('ellP', { p: N(p.p, 2) }), c: P_COL(), w: 600 }], -1);
        line([{ s: `[${N(pi[0], 3)}; ${N(pi[1], 3)}]`, c: P_COL(), w: 800 }]);
        y += 4;
        // Rechenweg: quadratische Gleichung in p
        const q = ellipseQuadratic(p.h, p.n, zz);
        line([{ s: tr('quadHead'), c: t.muted, w: 700 }], -1.5);
        line([{ s: '(1 + z²/n)·p² − (2h + z²/n)·p + h² = 0', c: t.text }], -2);
        line([{ s: `${N(q.a, 4)}·p² − ${N(-q.b, 4)}·p + ${N(q.c, 4)} = 0`, c: t.text, w: 600 }], -1.5);
        if (q.roots) line([{ s: `p₁ = ${N(q.roots[0], 4)},  p₂ = ${N(q.roots[1], 4)}`, c: H_COL(), w: 700 }], -1.5);
        y += 4;
        const inBand = Math.abs(p.h - p.p) <= zz * Math.sqrt((p.p * (1 - p.p)) / p.n) + 1e-12;
        line([{ s: inBand ? (ctx.lang === 'de' ? '(p | h) liegt in der Ellipse: p ist mit h verträglich.' : '(p | h) lies inside the ellipse: p is compatible with h.') : ctx.lang === 'de' ? '(p | h) liegt außerhalb: p passt nicht zu h.' : '(p | h) lies outside: p does not fit h.', c: inBand ? GOOD() : BAD(), w: 600 }], -1.5);
        return;
      }
      // Stichprobenumfang
      const pp = p.pre ? p.p : 0.5;
      const need = requiredN(p.eps, zz, pp);
      line([{ s: p.pre ? tr('sizeF') : tr('sizeF0'), c: t.text, w: 600 }]);
      line([{ s: `n ≥ ${N(zz, 2)}² · ${N(pp, 2)} · ${N(1 - pp, 2)} / ${N(p.eps, 3)}² = ${N((zz * zz * pp * (1 - pp)) / (p.eps * p.eps), 1)}`, c: t.muted }], -1);
      line([{ s: tr('sizeN', { n: fmt.num(need, 0) }), c: BAD(), w: 800 }], 3);
      y += 6;
      line([{ s: tr('sizeHalf'), c: t.muted }], -1.5);
      const half = requiredN(p.eps / 2, zz, pp);
      line([{ s: `ε = ${N(p.eps / 2, 3)}  →  n ≥ ${fmt.num(half, 0)}`, c: t.text, w: 600 }], -1);
      // Tabelle üblicher Genauigkeiten für 90 %, 95 %, 99 %
      y += 8;
      const cols = [maxW * 0.25, maxW * 0.25, maxW * 0.25, maxW * 0.25];
      const levels = [90, 95, 99];
      const row = (cells: Seg[], hl = false) => {
        if (hl) {
          g.save();
          g.fillStyle = withAlpha(BAD(), t.dark ? 0.16 : 0.08);
          g.fillRect(x - 6, y - size * 0.72, maxW + 12, size * 1.44);
          g.restore();
        }
        let cx = x;
        cells.forEach((c, i) => {
          segLine(g, [c], cx, y, cols[i]! - 4, size - 2);
          cx += cols[i]!;
        });
        y += size * 1.42;
      };
      row([{ s: '± ε', c: t.muted, w: 700 }, ...levels.map((l) => ({ s: `${l} %`, c: +p.level === l ? BAD() : t.muted, w: 700 }))]);
      for (const e of [0.01, 0.02, 0.03, 0.05, 0.1]) {
        if (y > R.y + R.h - size * 1.2) break;
        row([{ s: pct(e).replace(',0 %', ' %'), c: t.text, w: 600 }, ...levels.map((l) => ({ s: fmt.num(requiredN(e, zFor(l), pp), 0), c: +p.level === l ? t.text : t.muted, w: +p.level === l ? 700 : 500 }))], Math.abs(e - p.eps) < 1e-9);
      }
    }

    /** Verlauf der Trefferquote über die Zahl der Stichproben, mit γ und dem theoretischen Wert. */
    function drawRate(g: CanvasRenderingContext2D, B: Rect, cov: number): void {
      const t = th();
      const rate = runningRate(samples.map((q) => q.hit));
      const lo = Math.min(0.75, cov - 0.08, ...rate.slice(Math.min(5, rate.length - 1)));
      const toX = (i: number) => B.x + 26 + (i / Math.max(1, rate.length - 1)) * (B.w - 30);
      const toY = (v: number) => B.y + 24 + (1 - (v - lo) / (1 - lo)) * (B.h - 32);
      g.save();
      g.fillStyle = withAlpha(t.text, t.dark ? 0.06 : 0.035);
      g.fillRect(B.x, B.y, B.w, B.h);
      g.font = `600 10.5px ${t.font}`;
      g.fillStyle = t.muted;
      g.textBaseline = 'top';
      g.fillText(tr('rateTitle'), B.x + 6, B.y + 2);
      g.textBaseline = 'middle';
      g.textAlign = 'right';
      for (const v of [1, (1 + lo) / 2, lo]) g.fillText(pct(v).replace(',0 %', ' %'), B.x + 24, toY(v));
      // Sollwert und theoretischer Wert
      g.setLineDash([4, 4]);
      g.strokeStyle = withAlpha(P_COL(), 0.8);
      g.lineWidth = 1.2;
      g.beginPath();
      g.moveTo(toX(0), toY(+p.level / 100));
      g.lineTo(toX(rate.length - 1), toY(+p.level / 100));
      g.stroke();
      g.strokeStyle = withAlpha(t.text, 0.45);
      g.beginPath();
      g.moveTo(toX(0), toY(cov));
      g.lineTo(toX(rate.length - 1), toY(cov));
      g.stroke();
      g.setLineDash([]);
      g.strokeStyle = GOOD();
      g.lineWidth = 2;
      g.beginPath();
      rate.forEach((v, i) => (i ? g.lineTo(toX(i), toY(clamp(v, lo, 1))) : g.moveTo(toX(i), toY(clamp(v, lo, 1)))));
      g.stroke();
      g.textAlign = 'left';
      g.fillStyle = P_COL();
      g.fillText(`γ = ${p.level} %`, toX(0) + 4, toY(+p.level / 100) - 8);
      g.restore();
    }

    function legend(x: number, y: number, maxW: number, size: number, a: string, b: string): void {
      const g = surface.g;
      const t = th();
      g.save();
      g.font = `600 ${size - 2}px ${t.font}`;
      g.textBaseline = 'middle';
      let cx = x;
      for (const [label, col] of [
        [a, GOOD()],
        [b, BAD()],
      ] as const) {
        g.fillStyle = col;
        g.beginPath();
        g.arc(cx + 5, y, 5, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = t.text;
        g.fillText(label, cx + 14, y);
        cx += g.measureText(label).width + 34;
        if (cx > x + maxW) break;
      }
      g.restore();
    }

    function laplace(x: number, maxW: number, size: number): void {
      const g = surface.g;
      const s = Math.sqrt(p.n * p.p * (1 - p.p));
      const ok = laplaceOk(p.n, p.p);
      const R = regions().card;
      segLine(g, [{ s: ok ? tr('laplaceGood') : tr('laplaceBad', { s: N(s, 2) }), c: ok ? th().muted : BAD(), w: ok ? 500 : 700 }], x, R.y + R.h - size * 1.6, maxW, size - 2);
    }

    /* -------------------------------------------------------------- */
    /* Ergebnisse                                                      */
    /* -------------------------------------------------------------- */

    function updateReadouts(): void {
      const zz = z();
      if (p.mode === 'prog') {
        const iv = predictionInterval(p.p, p.n, zz);
        ctx.readout('iv', `[${N(iv[0], 3)}; ${N(iv[1], 3)}]`);
        const k = samples.filter((q) => q.hit).length;
        ctx.readout('count', samples.length ? `${k} / ${samples.length} (${pct(k / samples.length)})` : '–');
        ctx.readout('theory', pct(probInside(p.n, p.p, iv, pmf)));
      } else if (p.mode === 'conf') {
        const last = samples[samples.length - 1];
        ctx.readout('iv', last ? `[${N(last.iv[0], 3)}; ${N(last.iv[1], 3)}]` : '–');
        const k = samples.filter((q) => q.hit).length;
        ctx.readout('count', samples.length && p.show ? `${k} / ${samples.length} (${pct(k / samples.length)})` : '–');
        ctx.readout('theory', p.show ? pct(coverage(method(), p.n, p.p, zz, pmf)) : '–');
      } else if (p.mode === 'ellipse') {
        const ci = method() === 'wald' ? waldInterval(p.h, p.n, zz) : wilsonInterval(p.h, p.n, zz);
        ctx.readout('iv', `[${N(ci[0], 3)}; ${N(ci[1], 3)}]`);
        ctx.readout('count', null);
        ctx.readout('theory', null);
      } else {
        ctx.readout('iv', `n ≥ ${fmt.num(requiredN(p.eps, zz, p.pre ? p.p : 0.5), 0)}`);
        ctx.readout('count', null);
        ctx.readout('theory', null);
      }
    }

    /* -------------------------------------------------------------- */
    /* Ablauf                                                          */
    /* -------------------------------------------------------------- */

    return {
      update(changed, source) {
        if (changed.has('p') || changed.has('n') || source === 'init') pmf = binomialPmf(p.n, p.p);
        if (['p', 'n', 'level', 'method', 'mode'].some((k) => changed.has(k)) && source !== 'init') clearSamples();
        if (changed.has('mode') || source === 'init' || source === 'replace') build.play();
        updateReadouts();
      },
      action(id) {
        if (ctx.locked) return;
        if (id === 'one') drawOne(performance.now());
        if (id === 'many') drawMany(100);
        if (id === 'clear') clearSamples();
        if (id === 'poll') poll();
        if (id === 'reveal') reveal();
        if (id === 'round') newRound();
        updateReadouts();
        ctx.requestRender();
      },
      render() {
        const now = performance.now();
        if (p.auto && (p.mode === 'prog' || p.mode === 'conf') && now - lastAuto > 380) {
          lastAuto = now;
          drawOne(now);
          updateReadouts();
        }
        const g = surface.begin();
        const R = regions();
        drawCard(g, R.main, th());
        if (p.mode === 'prog') drawProg(g, R.main, now);
        else if (p.mode === 'conf') drawConf(g, R.main, now);
        else if (p.mode === 'ellipse') drawEllipse(g, R.main);
        else if (p.mode === 'game') drawGame(g, R.main);
        else drawSize(g, R.main);
        drawCardBody(g, R.card);
        const animating = revealTw.running || build.running || samples.some((s) => now - s.t < 500) || (p.auto && (p.mode === 'prog' || p.mode === 'conf'));
        if (animating) ctx.requestRender();
      },
      destroy: () => surface.destroy(),
    };
  },
});
