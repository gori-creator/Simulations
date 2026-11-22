import { defineSimulation, drawCard, ease, Plot, roundRect, Surface, Tween, withAlpha, type Rect } from '../../../sim-core';
import { classify, DATASETS, doublingTime, fit, growthFactor, halfGapTime, inflection, parseData, puzzle, rate, recursive, sse, table, timeTo, value, type Dataset, type ModelKind, type Params } from './model';

const L = (de: string, en: string) => ({ de, en });
type Loc = { de: string; en: string };
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

const KINDS: ModelKind[] = ['linear', 'exp', 'bounded', 'logistic'];
const NAMES: Record<ModelKind, Loc> = {
  linear: L('linear', 'linear'),
  exp: L('exponentiell', 'exponential'),
  bounded: L('beschränkt', 'bounded'),
  logistic: L('logistisch', 'logistic'),
};

/**
 * Wachstumsmodelle im Vergleich: linear, exponentiell, beschränkt und
 * logistisch – explizit als Funktion und rekursiv Schritt für Schritt, mit
 * Änderungsrate über dem Bestand, Kennzeichen in Tabellen (Differenzen,
 * Quotienten), Kennwerten und dem Anpassen an Messdaten.
 */
export default defineSimulation({
  id: 'wachstumsmodelle',
  layout: { aspect: 1.6, aspectNarrow: 0.5 },
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Ansicht', 'View'),
      options: [
        { value: 'compare', label: L('Alle vier im Vergleich', 'All four compared') },
        { value: 'single', label: L('Ein Modell genau', 'One model in detail') },
        { value: 'data', label: L('An Messdaten anpassen', 'Fit to data') },
        { value: 'puzzle', label: L('Rätsel: Welches Modell ist das?', 'Puzzle: which model is it?') },
      ],
      default: 'compare',
    },
    {
      key: 'model',
      type: 'choice',
      label: L('Modell', 'Model'),
      options: KINDS.map((k) => ({ value: k, label: NAMES[k] })),
      default: 'logistic',
      visibleIf: (v) => v.mode === 'single' || v.mode === 'data',
    },
    { key: 'ds', type: 'choice', label: L('Messdaten', 'Data'), options: [...DATASETS.map((d) => ({ value: d.id, label: d.name })), { value: 'own', label: L('Eigene Messwerte', 'Own data') }], default: 'sunflower', visibleIf: (v) => v.mode === 'data' },
    {
      key: 'own',
      type: 'text',
      label: L('Eigene Messwerte (t;B)', 'Own data (t;B)'),
      default: '0;12 | 1;19 | 2;30 | 3;44 | 4;58 | 5;70 | 6;78 | 7;83',
      maxLength: 300,
      help: L('Paare „Zeit;Bestand“, getrennt mit |. Oder nur Bestände mit Leerzeichen (Zeit 0, 1, 2 …).', 'Pairs “time;amount” separated by |. Or just amounts separated by spaces (time 0, 1, 2 …).'),
      visibleIf: (v) => v.mode === 'data' && v.ds === 'own',
    },
    {
      key: 'guess',
      type: 'choice',
      label: L('Dein Tipp', 'Your guess'),
      options: KINDS.map((k) => ({ value: k, label: NAMES[k] })),
      default: 'linear',
      visibleIf: (v) => v.mode === 'puzzle',
    },
    { key: 'B0', type: 'number', label: L('Anfangsbestand B(0)', 'Initial amount B(0)'), min: 0, max: 500, step: 0.5, default: 10, visibleIf: (v) => v.mode !== 'puzzle' },
    { key: 'd', type: 'number', label: L('Zunahme pro Schritt d (linear)', 'Increase per step d (linear)'), min: -50, max: 50, step: 0.5, default: 8, visibleIf: (v) => v.mode === 'compare' || (v.mode !== 'puzzle' && v.model === 'linear') },
    { key: 'k', type: 'number', label: L('Wachstumskonstante k', 'Growth constant k'), min: -2, max: 3, step: 0.01, default: 0.5, visibleIf: (v) => v.mode === 'compare' || (v.mode !== 'puzzle' && v.model !== 'linear') },
    { key: 'S', type: 'number', label: L('Sättigungsgrenze S', 'Limit S'), min: 1, max: 1000, step: 1, default: 100, visibleIf: (v) => v.mode === 'compare' || (v.mode !== 'puzzle' && (v.model === 'bounded' || v.model === 'logistic')) },
    { key: 'tmax', type: 'number', label: L('Zeitraum bis', 'Time span up to'), min: 4, max: 60, step: 1, default: 14, visibleIf: (v) => v.mode === 'compare' || v.mode === 'single' },
    { key: 'rec', type: 'boolean', group: 'view', label: L('Rekursiv: Schritte zeigen', 'Recursive: show steps'), default: true, visibleIf: (v) => v.mode === 'single' },
    { key: 'rate', type: 'boolean', group: 'view', label: L('Änderungsrate B′ über B', 'Rate B′ against B'), default: true, visibleIf: (v) => v.mode === 'compare' || v.mode === 'single' },
    { key: 'show', type: 'boolean', group: 'view', label: L('Kennwerte zeigen', 'Show key values'), default: true },
  ],
  resultsParam: 'show',
  actions: [
    { id: 'play', label: L('Abspielen', 'Play'), primary: true, visibleIf: (v) => v.mode === 'compare' || v.mode === 'single' },
    { id: 'check', label: L('Prüfen', 'Check'), primary: true, visibleIf: (v) => v.mode === 'puzzle' },
    { id: 'newp', label: L('Neue Tabelle', 'New table'), visibleIf: (v) => v.mode === 'puzzle' },
    { id: 'fit', label: L('Automatisch anpassen', 'Fit automatically'), primary: true, visibleIf: (v) => v.mode === 'data' },
  ],
  readouts: [
    { key: 'formula', label: L('Funktion', 'Function') },
    { key: 'rec', label: L('Rekursiv', 'Recursive') },
    { key: 'dgl', label: L('Differenzialgleichung', 'Differential equation') },
    { key: 'key', label: L('Kennwert', 'Key value'), spoiler: true },
  ],
  presets: [
    { id: 'compare', label: L('Vergleich: B(0) = 10, S = 100', 'Comparison: B(0) = 10, S = 100'), values: { mode: 'compare', B0: 10, d: 8, k: 0.5, S: 100, tmax: 14 } },
    { id: 'log', label: L('Logistisch: 100/(1 + 9·e^(−0,5t))', 'Logistic: 100/(1 + 9·e^(−0.5t))'), values: { mode: 'single', model: 'logistic', B0: 10, k: 0.5, S: 100, tmax: 14 } },
    { id: 'exp', label: L('Exponentiell: Verdopplung', 'Exponential: doubling'), values: { mode: 'single', model: 'exp', B0: 5, k: 0.23, tmax: 15 } },
    { id: 'decay', label: L('Exponentieller Zerfall', 'Exponential decay'), values: { mode: 'single', model: 'exp', B0: 100, k: -0.2, tmax: 20 } },
    { id: 'bounded', label: L('Beschränkt: Abkühlung', 'Bounded: cooling'), values: { mode: 'single', model: 'bounded', B0: 90, k: 0.1, S: 20, tmax: 40 } },
    { id: 'lin', label: L('Linear: Sparschwein', 'Linear: piggy bank'), values: { mode: 'single', model: 'linear', B0: 40, d: 15, tmax: 12 } },
    { id: 'chaos', label: L('Diskret logistisch mit großem k: Schwingen', 'Discrete logistic with large k: oscillation'), values: { mode: 'single', model: 'logistic', B0: 10, k: 2.3, S: 100, tmax: 40, rec: true } },
    { id: 'sun', label: L('Daten: Sonnenblume', 'Data: sunflower'), values: { mode: 'data', ds: 'sunflower', model: 'logistic', B0: 18, k: 0.4, S: 220 } },
    { id: 'tea', label: L('Daten: Tee kühlt ab', 'Data: tea cooling'), values: { mode: 'data', ds: 'tea', model: 'bounded', B0: 90, k: 0.15, S: 25 } },
    { id: 'puzzle', label: L('Rätsel: Modell an der Tabelle erkennen', 'Puzzle: recognise the model from a table'), values: { mode: 'puzzle' } },
    { id: 'own', label: L('Eigene Messwerte anpassen', 'Fit your own data'), values: { mode: 'data', ds: 'own', model: 'logistic', B0: 12, k: 0.6, S: 90 } },
    { id: 'bac', label: L('Daten: Bakterien', 'Data: bacteria'), values: { mode: 'data', ds: 'bacteria', model: 'linear', B0: 2, d: 2 } },
  ],
  strings: {
    de: {
      canvas: 'Wachstumsmodelle: Graphen des Bestands über der Zeit, rekursive Schritte, die Änderungsrate über dem Bestand und Messdaten mit angepasstem Modell.',
      t: 't',
      B: 'B',
      rateAxis: 'B′',
      explicit: 'Explizit',
      recursiveL: 'Rekursiv',
      dglL: 'Änderungsrate',
      sign: 'Kennzeichen',
      signLin: 'gleiche Differenzen ΔB',
      signExp: 'gleiche Quotienten B(t+1) : B(t)',
      signBounded: 'ΔB proportional zum Abstand S − B',
      signLog: 'ΔB proportional zu B · (S − B)',
      doubling: 'Verdopplungszeit',
      half: 'Halbwertszeit',
      factor: 'Wachstumsfaktor pro Schritt',
      gap: 'Abstand zu S halbiert nach',
      infl: 'Wendestelle (B = S/2)',
      maxRate: 'größte Zunahme',
      reach90: '90 % von S erreicht nach',
      table: 'Wertetabelle',
      diff: 'ΔB',
      quot: 'Quotient',
      fitTitle: 'Messdaten und Modell',
      sse: 'Summe der Abweichungsquadrate',
      bestFit: 'Bestes Modell für diese Daten',
      guess: 'Die Tabelle sieht aus wie',
      none: 'kein eindeutiges Muster',
      fitted: 'Angepasst – vergleiche die Abweichungen mit den anderen Modellen.',
      rateTitle: 'Änderungsrate über dem Bestand',
      chaos: 'Rekursiv mit großem k springt der Bestand über S hinaus und schwingt – das stetige Modell nicht.',
      hidden: 'Kennwerte verdeckt',
      unitT: 'Zeit',
      puzzleTitle: 'Rätsel: Welches Modell steckt hinter den Punkten?',
      puzzleAsk: 'Welches Wachstum zeigt diese Tabelle?',
      pzHint: 'Tipp: Rechne Differenzen und Quotienten aufeinanderfolgender Werte. Wähle dann deinen Tipp und drücke „Prüfen“.',
      pzRight: 'Richtig! ✓',
      pzWrong: 'Leider nein – das war {m}.',
      pzScore: '{k} von {n} richtig',
      ownBad: 'Die eigenen Messwerte lassen sich nicht lesen (mindestens 3 Werte).',
    },
    en: {
      canvas: 'Growth models: graphs of the amount over time, recursive steps, the rate of change against the amount and data with a fitted model.',
      t: 't',
      B: 'B',
      rateAxis: 'B′',
      explicit: 'Explicit',
      recursiveL: 'Recursive',
      dglL: 'Rate of change',
      sign: 'Characteristic',
      signLin: 'equal differences ΔB',
      signExp: 'equal ratios B(t+1) : B(t)',
      signBounded: 'ΔB proportional to the gap S − B',
      signLog: 'ΔB proportional to B · (S − B)',
      doubling: 'doubling time',
      half: 'half-life',
      factor: 'growth factor per step',
      gap: 'gap to S halves after',
      infl: 'inflection point (B = S/2)',
      maxRate: 'largest increase',
      reach90: '90% of S reached after',
      table: 'Table of values',
      diff: 'ΔB',
      quot: 'ratio',
      fitTitle: 'Data and model',
      sse: 'sum of squared errors',
      bestFit: 'Best model for this data',
      guess: 'The table looks',
      none: 'no clear pattern',
      fitted: 'Fitted – compare the errors with the other models.',
      rateTitle: 'Rate of change against the amount',
      chaos: 'Recursively with large k the amount overshoots S and oscillates – the continuous model does not.',
      hidden: 'key values hidden',
      unitT: 'time',
      puzzleTitle: 'Puzzle: which model is behind the points?',
      puzzleAsk: 'Which growth does this table show?',
      pzHint: 'Hint: work out differences and ratios of successive values. Then pick your guess and press “Check”.',
      pzRight: 'Correct! ✓',
      pzWrong: 'Sorry, that was {m}.',
      pzScore: '{k} of {n} correct',
      ownBad: 'Your data cannot be read (at least 3 values).',
    },
  },
  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const th = () => ctx.theme;
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const N = (v: number, d = 3) => (Number.isFinite(v) ? fmt.num(Math.abs(v) < 5e-12 ? 0 : v, d) : '–');

    /* -------------------------------------------------------------- */
    /* Zustand                                                         */
    /* -------------------------------------------------------------- */

    const params = (): Params => ({ B0: p.B0, d: p.d, k: p.k, S: p.S });
    const kind = () => p.model as ModelKind;
    const ownSet = (): Dataset | null => {
      const data = parseData(p.own);
      return data ? { id: 'own', name: L('Eigene Messwerte', 'Own data'), unit: L('', ''), time: L('Zeit', 'time'), truth: 'linear', data } : null;
    };
    const dataset = (): Dataset => (p.ds === 'own' ? (ownSet() ?? DATASETS[0]!) : (DATASETS.find((d) => d.id === p.ds) ?? DATASETS[0]!));
    /** Rätsel: aktuelle Tabelle und Ergebnis der Prüfung. */
    let pz = puzzle(Math.random);
    let pzVerdict: boolean | null = null;
    let pzScore = { right: 0, all: 0 };
    /** Ergebnisse der Anpassung aller Modelle (für den Vergleich). */
    let fits: Record<ModelKind, number> | null = null;

    const COLS: Record<ModelKind, () => string> = {
      linear: () => th().series[5]!,
      exp: () => th().series[1]!,
      bounded: () => th().series[2]!,
      logistic: () => th().series[0]!,
    };

    /* -------------------------------------------------------------- */
    /* Animation und Layout                                            */
    /* -------------------------------------------------------------- */

    const grow = new Tween(1600, ease.inOutCubic);
    grow.play();

    const wide = () => surface.width >= 640 && surface.width >= surface.height * 1.2;
    function regions(): { top: Rect; bottom: Rect | null; card: Rect } {
      const W = surface.width;
      const H = surface.height;
      const pad = 10;
      const twoPlots = (p.mode === 'compare' || p.mode === 'single') && p.rate;
      if (wide()) {
        const mw = Math.round(W * 0.6);
        const main: Rect = { x: pad, y: pad, w: mw - pad, h: H - 2 * pad };
        const card: Rect = { x: mw + pad, y: pad, w: W - mw - 2 * pad, h: H - 2 * pad };
        if (!twoPlots) return { top: main, bottom: null, card };
        const th1 = Math.round(main.h * 0.64);
        return { top: { ...main, h: th1 }, bottom: { x: main.x, y: main.y + th1 + pad, w: main.w, h: main.h - th1 - pad }, card };
      }
      const mh = Math.round(H * 0.55);
      const card: Rect = { x: pad, y: mh + 2 * pad, w: W - 2 * pad, h: H - mh - 3 * pad };
      if (!twoPlots) return { top: { x: pad, y: pad, w: W - 2 * pad, h: mh }, bottom: null, card };
      const th1 = Math.round(mh * 0.62);
      return { top: { x: pad, y: pad, w: W - 2 * pad, h: th1 }, bottom: { x: pad, y: pad + th1 + pad, w: W - 2 * pad, h: mh - th1 - pad }, card };
    }

    let topRect: Rect = { x: 0, y: 0, w: 100, h: 100 };
    let botRect: Rect = { x: -100, y: -100, w: 10, h: 10 };
    const inset = (R: Rect) => ({ x: R.x + 4, y: R.y + 4, w: R.w - 8, h: R.h - 8 });
    const plot = new Plot(surface, { x: [0, 14], y: [0, 110], equalAspect: false, region: () => inset(topRect), xAxis: { label: 't' }, yAxis: { label: 'B' } });
    const ratePlot = new Plot(surface, { x: [0, 110], y: [0, 15], equalAspect: false, zoom: false, pan: false, controls: false, region: () => inset(botRect), xAxis: { label: 'B' }, yAxis: { label: 'B′' } });

    /* -------------------------------------------------------------- */
    /* Bereiche                                                        */
    /* -------------------------------------------------------------- */

    function kindsShown(): ModelKind[] {
      return p.mode === 'compare' ? KINDS : [kind()];
    }

    function fitRanges(): void {
      const pr = params();
      if (p.mode === 'puzzle') {
        const hi = Math.max(...pz.values) * 1.15;
        plot.setRange([-0.8, 8.5], [-hi * 0.06, hi]);
        return;
      }
      if (p.mode === 'data') {
        const ds = dataset();
        const tMax = Math.max(...ds.data.map((d) => d.t)) * 1.15;
        const bs = ds.data.map((d) => d.B);
        const hi = Math.max(...bs) * 1.2;
        const lo = Math.min(0, Math.min(...bs));
        plot.setRange([-tMax * 0.1, tMax], [lo - hi * 0.06, hi]);
        return;
      }
      const ts = Array.from({ length: 121 }, (_, i) => (i / 120) * p.tmax);
      let hi = Math.max(p.B0, 1);
      let lo = 0;
      for (const kd of kindsShown()) {
        for (const t of ts) {
          const v = value(kd, pr, t);
          if (!Number.isFinite(v)) continue;
          // exponentielles Wachstum nicht alles bestimmen lassen
          const cap = kd === 'exp' && p.mode === 'compare' ? Math.max(pr.S * 1.6, pr.B0 * 3) : Infinity;
          hi = Math.max(hi, Math.min(v, cap));
          lo = Math.min(lo, v);
        }
        if ((kd === 'bounded' || kd === 'logistic') && p.mode !== 'single') hi = Math.max(hi, pr.S);
        if (kd === 'bounded' || kd === 'logistic') hi = Math.max(hi, pr.S);
      }
      if (p.mode === 'single' && p.rec) for (const v of recursive(kind(), pr, Math.floor(p.tmax))) if (Number.isFinite(v)) hi = Math.max(hi, Math.min(v, pr.S * 3 + 10));
      plot.setRange([-p.tmax * 0.1, p.tmax], [lo - (hi - lo) * 0.07, hi * 1.12]);
      // Änderungsrate über B
      let rMax = 0.1;
      let rMin = 0;
      const bHi = hi * 1.05;
      for (const kd of kindsShown()) {
        for (let i = 0; i <= 80; i++) {
          const B = (bHi * i) / 80;
          const r = rate(kd, pr, B);
          if (Number.isFinite(r)) {
            rMax = Math.max(rMax, Math.min(r, kd === 'exp' ? rate('logistic', pr, pr.S / 2) * 2.5 + 1 : Infinity));
            rMin = Math.min(rMin, r);
          }
        }
      }
      ratePlot.setRange([-bHi * 0.1, bHi], [Math.min(rMin * 1.15, -rMax * 0.12), rMax * 1.15]);
    }
    fitRanges();

    /* -------------------------------------------------------------- */
    /* Zeichnen                                                        */
    /* -------------------------------------------------------------- */

    function drawTop(g: CanvasRenderingContext2D, R: Rect): void {
      const t = th();
      topRect = R;
      drawCard(g, R, t);
      plot.resize();
      plot.begin();
      plot.grid({ minor: true });
      plot.axes();
      const pr = params();
      const reach = grow.value * (plot.bounds.xMax - plot.bounds.xMin);
      if (p.mode === 'puzzle') {
        const kd = pz.kind;
        if (pzVerdict !== null) plot.fn((x) => value(kd, pz.p, x), { color: COLS[kd](), width: 2.4, alpha: 0.85 });
        pz.values.forEach((v, i) => plot.point(i, v, { color: t.text, radius: 4.5 }));
        plot.end();
        textAt(g, tr('puzzleTitle'), R.x + 70, R.y + 18, t.muted);
        return;
      }
      if (p.mode === 'data') {
        const ds = dataset();
        const kd = kind();
        for (const d of ds.data) {
          const m = value(kd, pr, d.t);
          if (Number.isFinite(m)) plot.segment([d.t, d.B], [d.t, m], { color: withAlpha(t.series[3]!, 0.75), width: 2 });
        }
        plot.fn((x) => value(kd, pr, x), { color: COLS[kd](), width: 2.8 });
        for (const d of ds.data) plot.point(d.t, d.B, { color: t.text, radius: 4.5 });
        plot.end();
        const tl = ds.unit[ctx.lang] ? `${ds.name[ctx.lang]} (${ds.unit[ctx.lang]} · ${ds.time[ctx.lang]})` : ds.name[ctx.lang];
        textAt(g, tl, R.x + 70, R.y + 18, t.muted);
        return;
      }
      // Sättigungsgrenze
      if (kindsShown().some((k) => k === 'bounded' || k === 'logistic')) {
        plot.hline(pr.S, { color: withAlpha(t.text, 0.4), width: 1.2, dash: [6, 5] });
        plot.text(plot.bounds.xMax, pr.S, `S = ${N(pr.S, 1)}`, { color: t.muted, size: 11, weight: '600', align: 'right', offset: [-6, -9], halo: true });
      }
      for (const kd of kindsShown()) {
        plot.fn((x) => value(kd, pr, x), { color: COLS[kd](), width: p.mode === 'compare' ? 2.4 : 2.8, to: reach });

      }
      // rekursive Schritte
      if (p.mode === 'single' && p.rec) {
        const n = Math.floor(p.tmax);
        const seq = recursive(kind(), pr, n);
        const shown = Math.ceil(grow.value * n);
        const col = withAlpha(t.series[3]!, 0.95);
        for (let i = 0; i < shown; i++) {
          const a = seq[i]!;
          const b = seq[i + 1]!;
          if (!Number.isFinite(a) || !Number.isFinite(b)) break;
          plot.segment([i, a], [i + 1, a], { color: col, width: 1.6 });
          plot.segment([i + 1, a], [i + 1, b], { color: col, width: 1.6 });
          plot.point(i + 1, b, { color: col, radius: 3 });
        }
        plot.point(0, seq[0]!, { color: col, radius: 3 });
      }
      // Kennwerte im Graphen
      if (p.show && p.mode === 'single' && grow.value > 0.98) {
        const kd = kind();
        if (kd === 'logistic') {
          const w = inflection(pr);
          if (w && w.t < plot.bounds.xMax) {
            plot.point(w.t, w.B, { color: COLS.logistic(), radius: 6 });
            plot.segment([w.t, 0], [w.t, w.B], { color: withAlpha(COLS.logistic(), 0.5), width: 1.2, dash: [4, 4] });
            plot.text(w.t, w.B, `${tr('infl')}: t = ${N(w.t, 3)}`, { color: COLS.logistic(), size: 12, weight: 'bold', offset: [10, 12], align: 'left', halo: true });
            // Wendetangente
            plot.line([w.t, w.B], [w.t + 1, w.B + w.rate], { color: withAlpha(COLS.logistic(), 0.45), width: 1.4, dash: [6, 4] });
          }
        }
        if (kd === 'exp' && pr.k !== 0) {
          const T = doublingTime(pr.k);
          const target = pr.k > 0 ? pr.B0 * 2 : pr.B0 / 2;
          if (T < plot.bounds.xMax) {
            plot.segment([0, target], [T, target], { color: withAlpha(COLS.exp(), 0.5), width: 1.2, dash: [4, 4] });
            plot.segment([T, 0], [T, target], { color: withAlpha(COLS.exp(), 0.5), width: 1.2, dash: [4, 4] });
            plot.point(T, target, { color: COLS.exp(), radius: 5 });
            plot.text(T, target, `${pr.k > 0 ? tr('doubling') : tr('half')} ${N(T, 3)}`, { color: COLS.exp(), size: 12, weight: 'bold', offset: [10, pr.k > 0 ? 12 : -12], align: 'left', halo: true });
          }
        }
        if (kd === 'bounded' && pr.k > 0) {
          const T = halfGapTime(pr.k);
          const B = value('bounded', pr, T);
          if (T < plot.bounds.xMax) {
            plot.point(T, B, { color: COLS.bounded(), radius: 5 });
            plot.text(T, B, `${tr('gap')} ${N(T, 3)}`, { color: COLS.bounded(), size: 12, weight: 'bold', offset: [10, -12], align: 'left', halo: true });
          }
        }
      }
      plot.end();
      // Legende (Vergleich)
      if (p.mode === 'compare') {
        const gg = surface.g;
        let lx = R.x + 70;
        let ly = R.y + 18;
        gg.save();
        gg.font = `700 12px ${t.font}`;
        gg.textBaseline = 'middle';
        for (const kd of KINDS) {
          const w = gg.measureText(NAMES[kd][ctx.lang]).width + 36;
          if (lx + w > R.x + R.w - 60 && lx > R.x + 70) {
            lx = R.x + 70;
            ly += 16;
          }
          gg.fillStyle = COLS[kd]();
          gg.fillRect(lx, ly - 2, 16, 4);
          gg.fillText(NAMES[kd][ctx.lang], lx + 21, ly);
          lx += gg.measureText(NAMES[kd][ctx.lang]).width + 36;
        }
        gg.restore();
      }
    }

    function drawRate(g: CanvasRenderingContext2D, R: Rect): void {
      const t = th();
      botRect = R;
      drawCard(g, R, t);
      ratePlot.resize();
      ratePlot.begin();
      ratePlot.grid({ minor: false });
      ratePlot.axes();
      const pr = params();
      for (const kd of kindsShown()) ratePlot.fn((B) => (kd === 'linear' || B >= 0 ? rate(kd, pr, B) : NaN), { color: COLS[kd](), width: 2.2 });
      // aktueller Zustand am Ende der Animation
      if (p.mode === 'single') {
        const tNow = grow.value * p.tmax;
        const B = value(kind(), pr, tNow);
        if (Number.isFinite(B)) ratePlot.point(B, rate(kind(), pr, B), { color: COLS[kind()](), radius: 5 });
      }
      ratePlot.end();
      textAt(g, tr('rateTitle'), R.x + 70, R.y + 16, t.muted);
    }

    function textAt(g: CanvasRenderingContext2D, s: string, x: number, y: number, col: string): void {
      g.save();
      // Platz bis zu den Zoom-Knöpfen rechts
      const maxW = Math.max(60, surface.width - x - 90);
      let size = 12;
      g.font = `700 ${size}px ${th().font}`;
      while (size > 9 && g.measureText(s).width > maxW) {
        size -= 0.5;
        g.font = `700 ${size}px ${th().font}`;
      }
      if (g.measureText(s).width > maxW) {
        while (s.length > 4 && g.measureText(s + '…').width > maxW) s = s.slice(0, -1);
        s += '…';
      }
      g.fillStyle = col;
      g.textBaseline = 'middle';
      g.fillText(s, x, y);
      g.restore();
    }

    /* -------------------------------------------------------------- */
    /* Karte                                                           */
    /* -------------------------------------------------------------- */

    interface Seg {
      s: string;
      c?: string;
      w?: number;
    }
    function segLine(g: CanvasRenderingContext2D, segs: Seg[], x: number, y: number, maxW: number, size: number, alpha = 1): number {
      let s = size;
      const width = (z: number) =>
        segs.reduce((sum, sg) => {
          g.font = `${sg.w ?? 500} ${z}px ${th().font}`;
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
          const ww = g.measureText(wd).width;
          if (cx + ww > x + maxW && cx > x + 20) {
            cx = x + 12;
            cy += s * 1.4;
          }
          g.fillStyle = sg.c ?? th().text;
          g.fillText(wd, cx, cy);
          cx += ww;
        }
      }
      g.restore();
      return cy - y + s * 1.45;
    }

    /** Formeln eines Modells (explizit, rekursiv, Änderungsrate). */
    function formulas(kd: ModelKind, pr: Params): { ex: string; rec: string; dgl: string; sign: string } {
      const k = N(pr.k, 3);
      const a = N(growthFactor(pr.k), 4);
      switch (kd) {
        case 'linear':
          return { ex: `B(t) = ${N(pr.B0, 2)} + ${N(pr.d, 2)}·t`, rec: `B(n+1) = B(n) + ${N(pr.d, 2)}`, dgl: `B′ = ${N(pr.d, 2)}`, sign: tr('signLin') };
        case 'exp':
          return { ex: `B(t) = ${N(pr.B0, 2)} · e^(${k}·t) = ${N(pr.B0, 2)} · ${a}ᵗ`, rec: `B(n+1) = ${a} · B(n)`, dgl: `B′ = ${k} · B`, sign: tr('signExp') };
        case 'bounded':
          return {
            ex: pr.S - pr.B0 >= 0 ? `B(t) = ${N(pr.S, 2)} − ${N(pr.S - pr.B0, 2)} · e^(−${k}·t)` : `B(t) = ${N(pr.S, 2)} + ${N(pr.B0 - pr.S, 2)} · e^(−${k}·t)`,
            rec: `B(n+1) = B(n) + ${N(1 - Math.exp(-pr.k), 4)} · (${N(pr.S, 2)} − B(n))`,
            dgl: `B′ = ${k} · (${N(pr.S, 2)} − B)`,
            sign: tr('signBounded'),
          };
        case 'logistic':
          return {
            ex: `B(t) = ${N(pr.S, 2)} / (1 + ${N((pr.S - pr.B0) / pr.B0, 3)} · e^(−${k}·t))`,
            rec: `B(n+1) = B(n) + ${k} · B(n) · (1 − B(n)/${N(pr.S, 2)})`,
            dgl: `B′ = ${k} · B · (1 − B/${N(pr.S, 2)})`,
            sign: tr('signLog'),
          };
      }
    }

    function keyValues(kd: ModelKind, pr: Params): { label: string; value: string }[] {
      const out: { label: string; value: string }[] = [];
      if (kd === 'exp' && pr.k !== 0) {
        out.push({ label: pr.k > 0 ? tr('doubling') : tr('half'), value: N(doublingTime(pr.k), 3) });
        out.push({ label: tr('factor'), value: `${N(growthFactor(pr.k), 4)} (${pr.k > 0 ? '+' : '−'}${N(Math.abs(growthFactor(pr.k) - 1) * 100, 1)} %)` });
      }
      if (kd === 'bounded' && pr.k > 0) {
        out.push({ label: tr('gap'), value: N(halfGapTime(pr.k), 3) });
        const t90 = timeTo('bounded', pr, pr.B0 + 0.9 * (pr.S - pr.B0));
        if (t90 !== null) out.push({ label: tr('reach90'), value: N(t90, 3) });
      }
      if (kd === 'logistic') {
        const w = inflection(pr);
        if (w) {
          out.push({ label: tr('infl'), value: `t = ${N(w.t, 3)}` });
          out.push({ label: tr('maxRate'), value: `${N(w.rate, 3)} / ${tr('t')}` });
        }
        const t90 = timeTo('logistic', pr, pr.S * 0.9);
        if (t90 !== null) out.push({ label: tr('reach90'), value: N(t90, 3) });
      }
      if (kd === 'linear') out.push({ label: 'B(10)', value: N(value('linear', pr, 10), 3) });
      return out;
    }

    function drawCardBody(g: CanvasRenderingContext2D, R: Rect): void {
      const t = th();
      drawCard(g, R, t, COLS[p.mode === 'compare' ? 'logistic' : kind()]());
      const x = R.x + 16;
      const maxW = R.w - 32;
      const size = R.w < 330 ? 12.5 : R.w < 440 ? 13.5 : 14.5;
      let y = R.y + 22;
      const line = (segs: Seg[], d = 0) => (y += segLine(g, segs, x, y, maxW, size + d));
      const pr = params();

      if (p.mode === 'compare') {
        // Tabelle der vier Modelle
        const n = Math.min(8, Math.floor(p.tmax));
        const step = Math.max(1, Math.round(p.tmax / n));
        const cw = maxW / 5;
        const SHORT: Record<ModelKind, Loc> = { linear: L('lin.', 'lin.'), exp: L('exp.', 'exp.'), bounded: L('beschr.', 'bound.'), logistic: L('log.', 'log.') };
        const head = ['t', ...KINDS.map((k) => SHORT[k][ctx.lang])];
        head.forEach((h, i) => segLine(g, [{ s: h, c: i === 0 ? t.muted : COLS[KINDS[i - 1]!](), w: 700 }], x + i * cw, y, cw - 4, size - 2));
        y += size * 1.5;
        for (let i = 0; i <= n; i++) {
          const tt = i * step;
          if (y > R.y + R.h - size * 9) break;
          segLine(g, [{ s: N(tt, 1), c: t.muted }], x, y, cw - 4, size - 1.5);
          KINDS.forEach((kd, j) => segLine(g, [{ s: N(value(kd, pr, tt), 1), c: t.text, w: 500 }], x + (j + 1) * cw, y, cw - 4, size - 1.5));
          y += size * 1.35;
        }
        y += 8;
        line([{ s: tr('sign'), c: t.muted, w: 700 }], -1.5);
        for (const kd of KINDS) {
          if (y > R.y + R.h - size) break;
          line([{ s: `${NAMES[kd][ctx.lang]}: `, c: COLS[kd](), w: 700 }, { s: formulas(kd, pr).sign, c: t.text }], -2);
        }
        return;
      }

      if (p.mode === 'puzzle') {
        line([{ s: tr('puzzleAsk'), c: t.muted, w: 700 }], -1);
        y += 2;
        const reveal = pzVerdict !== null;
        const heads = reveal ? ['t', 'B', tr('diff'), tr('quot')] : ['t', 'B'];
        const cw = maxW / 4;
        heads.forEach((h, i) => segLine(g, [{ s: h, c: t.muted, w: 700 }], x + i * cw, y, cw - 4, size - 1.5));
        y += size * 1.4;
        pz.values.forEach((v, i) => {
          if (y > R.y + R.h - size * 5) return;
          const prev = i > 0 ? pz.values[i - 1]! : null;
          const cells = [String(i), N(v, 2)];
          if (reveal) cells.push(prev === null ? '' : N(v - prev, 2), prev === null ? '' : N(v / prev, 3));
          cells.forEach((c2, j) => segLine(g, [{ s: c2, c: t.text }], x + j * cw, y, cw - 4, size - 1.5));
          y += size * 1.3;
        });
        y += 6;
        if (pzVerdict !== null) {
          const col = pzVerdict ? th().series[2]! : th().series[3]!;
          line([{ s: pzVerdict ? tr('pzRight') : tr('pzWrong', { m: NAMES[pz.kind][ctx.lang] }), c: col, w: 800 }], 1);
          line([{ s: `${tr('sign')}: ${formulas(pz.kind, pz.p).sign}`, c: COLS[pz.kind](), w: 600 }], -1.5);
        } else line([{ s: tr('pzHint'), c: t.muted }], -2);
        if (pzScore.all) line([{ s: tr('pzScore', { k: pzScore.right, n: pzScore.all }), c: t.muted, w: 600 }], -2);
        return;
      }
      if (p.mode === 'data') {
        const ds = dataset();
        if (p.ds === 'own' && !ownSet()) line([{ s: tr('ownBad'), c: th().series[3]!, w: 600 }], -1.5);
        line([{ s: tr('fitTitle'), c: t.muted, w: 700 }], -1);
        const f = formulas(kind(), pr);
        line([{ s: f.ex, c: COLS[kind()](), w: 700 }], -0.5);
        const e = sse(kind(), pr, ds.data);
        line([{ s: `${tr('sse')}: ${N(e, 2)}`, c: t.text, w: 600 }]);
        const guessK = classify(ds.data.every((d, i) => i === 0 || d.t - ds.data[i - 1]!.t === ds.data[1]!.t - ds.data[0]!.t) ? ds.data.map((d) => d.B) : []);
        line([{ s: `${tr('guess')}: `, c: t.muted }, { s: guessK ? NAMES[guessK][ctx.lang] : tr('none'), c: guessK ? COLS[guessK]() : t.muted, w: 700 }], -1.5);
        y += 6;
        if (fits && p.show) {
          const best = KINDS.reduce((a, b) => (fits![a] <= fits![b] ? a : b));
          line([{ s: tr('fitted'), c: t.muted }], -2);
          for (const kd of KINDS) {
            const v = fits[kd];
            const barMax = Math.max(...KINDS.map((k) => fits![k]));
            const w = (maxW * 0.45 * Math.sqrt(v)) / Math.sqrt(barMax || 1);
            segLine(g, [{ s: NAMES[kd][ctx.lang], c: COLS[kd](), w: kd === best ? 800 : 600 }], x, y, maxW * 0.3, size - 1.5);
            g.save();
            g.fillStyle = withAlpha(COLS[kd](), 0.6);
            roundRect(g, x + maxW * 0.32, y - 5, Math.max(2, w), 10, 4);
            g.fill();
            g.restore();
            segLine(g, [{ s: N(v, 1), c: t.text }], x + maxW * 0.32 + w + 6, y, maxW * 0.25, size - 2);
            y += size * 1.45;
          }
          line([{ s: `${tr('bestFit')}: `, c: t.muted }, { s: NAMES[best][ctx.lang], c: COLS[best](), w: 800 }], -1);
        }
        return;
      }

      // ein Modell
      const kd = kind();
      const f = formulas(kd, pr);
      line([{ s: NAMES[kd][ctx.lang], c: COLS[kd](), w: 800 }], 2);
      line([{ s: `${tr('explicit')}: `, c: t.muted }, { s: f.ex, c: t.text, w: 600 }], -1);
      line([{ s: `${tr('recursiveL')}: `, c: t.muted }, { s: f.rec, c: t.series[3], w: 600 }], -1);
      line([{ s: `${tr('dglL')}: `, c: t.muted }, { s: f.dgl, c: t.text, w: 600 }], -1);
      line([{ s: `${tr('sign')}: `, c: t.muted }, { s: f.sign, c: COLS[kd](), w: 600 }], -1.5);
      y += 4;
      if (p.show) {
        for (const kv of keyValues(kd, pr)) line([{ s: `${kv.label}: `, c: t.muted }, { s: kv.value, c: COLS[kd](), w: 700 }], -1);
        if (kd === 'logistic' && p.rec && pr.k > 2) line([{ s: tr('chaos'), c: t.series[3], w: 600 }], -2);
      } else line([{ s: tr('hidden'), c: t.muted }], -1.5);
      y += 6;
      // Tabelle mit Kennzeichen
      const rows = table(kd, pr, Math.min(8, Math.floor(p.tmax)));
      const cols = kd === 'linear' ? ['t', 'B', tr('diff')] : kd === 'exp' ? ['t', 'B', tr('diff'), tr('quot')] : ['t', 'B', tr('diff'), kd === 'bounded' ? 'ΔB/(S−B)' : 'ΔB/(B(S−B))'];
      const cw = maxW / cols.length;
      if (y > R.y + R.h - size * 4) return;
      cols.forEach((h, i) => segLine(g, [{ s: h, c: t.muted, w: 700 }], x + i * cw, y, cw - 4, size - 2));
      y += size * 1.4;
      for (const r of rows) {
        if (y > R.y + R.h - size) break;
        const cells = [N(r.t, 1), N(r.B, 3), r.diff === null ? '' : N(r.diff, 3)];
        if (kd === 'exp') cells.push(r.quot === null ? '' : N(r.quot, 4));
        if (kd === 'bounded' || kd === 'logistic') cells.push(r.ratio === null ? '' : N(r.ratio, 5));
        cells.forEach((c, i) => segLine(g, [{ s: c, c: i === cells.length - 1 && i >= 2 ? COLS[kd]() : t.text, w: i === cells.length - 1 && i >= 2 ? 700 : 500 }], x + i * cw, y, cw - 4, size - 2));
        y += size * 1.3;
      }
    }

    /* -------------------------------------------------------------- */
    /* Ergebnisse und Ablauf                                           */
    /* -------------------------------------------------------------- */

    function updateReadouts(): void {
      if (p.mode === 'puzzle') {
        ['formula', 'rec', 'dgl', 'key'].forEach((k) => ctx.readout(k, null));
        return;
      }
      const pr = params();
      const kd = p.mode === 'compare' ? 'logistic' : kind();
      const f = formulas(kd, pr);
      ctx.readout('formula', f.ex);
      ctx.readout('rec', f.rec);
      ctx.readout('dgl', f.dgl);
      const kv = keyValues(kd, pr)[0];
      ctx.readout('key', kv ? `${kv.label}: ${kv.value}` : '–');
    }

    function autoFit(): void {
      const ds = dataset();
      const start: Params = { ...params(), B0: ds.data[0]!.B };
      const all = {} as Record<ModelKind, number>;
      let chosen: Params | null = null;
      for (const kd of KINDS) {
        const r = fit(kd, ds.data, start);
        all[kd] = r.sse;
        if (kd === kind()) chosen = r.p;
      }
      fits = all;
      if (chosen) {
        const round = (v: number, s: number) => Math.round(v / s) * s;
        ctx.set({ B0: clamp(round(chosen.B0, 0.5), 0, 500), d: clamp(round(chosen.d, 0.5), -50, 50), k: clamp(round(chosen.k, 0.01), -2, 3), S: clamp(round(chosen.S, 1), 1, 1000) });
      }
    }

    return {
      update(changed, source) {
        if (['mode', 'model', 'B0', 'd', 'k', 'S', 'tmax', 'ds', 'rec', 'rate', 'own'].some((q) => changed.has(q)) || source === 'init' || source === 'replace') fitRanges();
        if (changed.has('ds') || changed.has('mode') || changed.has('own')) fits = null;
        if (['mode', 'model', 'tmax', 'ds'].some((q) => changed.has(q)) || source === 'init' || source === 'replace') grow.play();
        updateReadouts();
      },
      action(id) {
        if (ctx.locked) return;
        if (id === 'play') grow.play();
        if (id === 'fit') autoFit();
        if (id === 'check' && pzVerdict === null) {
          pzVerdict = p.guess === pz.kind;
          pzScore = { right: pzScore.right + (pzVerdict ? 1 : 0), all: pzScore.all + 1 };
        }
        if (id === 'newp') {
          pz = puzzle(Math.random);
          pzVerdict = null;
          fitRanges();
        }
        ctx.requestRender();
      },
      resetView() {
        fitRanges();
        plot.resetView();
      },
      render() {
        const g = surface.begin();
        const R = regions();
        drawTop(g, R.top);
        if (R.bottom) drawRate(g, R.bottom);
        else botRect = { x: -100, y: -100, w: 10, h: 10 };
        drawCardBody(g, R.card);
        if (grow.running) ctx.requestRender();
      },
      destroy: () => surface.destroy(),
    };
  },
});
