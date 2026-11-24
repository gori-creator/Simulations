import { defineSimulation, ease, Plot, roundRect, seededRandom, softShadow, Surface, Tween, withAlpha, type Rect } from '../../../sim-core';
import {
  checkSum,
  exactIntegral,
  FUNCTIONS,
  PROFILES,
  strips,
  sumOf,
  sumTask,
  volume,
  type FunctionId,
  type ProfileId,
  type Strip,
  type SumKind,
  type SumTask,
} from './model';

const L = (de: string, en: string) => ({ de, en });
const VIEW: Record<FunctionId, { x: [number, number]; y: [number, number] }> = {
  x2: { x: [-0.6, 3.2], y: [-0.8, 9.5] },
  sqrt: { x: [-0.5, 9.5], y: [-0.6, 3.6] },
  sin: { x: [-0.6, 6.9], y: [-1.5, 1.5] },
  cubic: { x: [-3.4, 3.4], y: [-4.2, 4.2] },
  exp: { x: [-3.2, 3.6], y: [-0.5, 6.5] },
};
const START: Record<FunctionId, [number, number]> = { x2: [0, 2], sqrt: [0, 9], sin: [0, 6.3], cubic: [-2, 3], exp: [-2, 3] };

/**
 * Integral als Flächenbilanz: Die Fläche zwischen Graph und x-Achse wird durch
 * Rechtecke (Unter-, Ober-, Links-, Rechts-, Mittelsumme) oder Trapeze
 * angenähert. Mit wachsendem n nähern sich die Summen dem Integral.
 * Dazu: ein Becken, dessen Wassermenge sich aus der Zuflussrate ergibt
 * (Rekonstruktion eines Bestands), und Übungsaufgaben zum Rechnen von Hand.
 */
export default defineSimulation({
  id: 'ober-untersummen',
  dragHint: true,
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Thema', 'Topic'),
      options: [
        { value: 'sum', label: L('Rechtecksummen', 'Rectangle sums') },
        { value: 'fill', label: L('Zufluss und Wassermenge', 'Inflow and amount of water') },
        { value: 'quiz', label: L('Üben: Summe berechnen', 'Practice: calculate a sum') },
      ],
      default: 'sum',
    },
    {
      key: 'fn',
      type: 'choice',
      label: L('Funktion', 'Function'),
      options: [
        { value: 'x2', label: L('f(x) = x²', 'f(x) = x²') },
        { value: 'sqrt', label: L('f(x) = √x', 'f(x) = √x') },
        { value: 'sin', label: L('f(x) = sin x', 'f(x) = sin x') },
        { value: 'cubic', label: L('f(x) = 0,5x³ − 2x', 'f(x) = 0.5x³ − 2x') },
        { value: 'exp', label: L('f(x) = e^(x/2)', 'f(x) = e^(x/2)') },
      ],
      default: 'x2',
      visibleIf: (v) => v.mode === 'sum',
    },
    {
      key: 'prof',
      type: 'choice',
      label: L('Zufluss', 'Inflow'),
      options: [
        { value: 'const', label: L('gleichmäßig', 'steady') },
        { value: 'linear', label: L('Hahn wird aufgedreht', 'tap is opened slowly') },
        { value: 'wave', label: L('schwankend', 'fluctuating') },
        { value: 'outflow', label: L('erst Zufluss, dann Abfluss', 'first inflow, then outflow') },
      ],
      default: 'const',
      visibleIf: (v) => v.mode === 'fill',
    },
    { key: 't', type: 'number', label: L('Zeit t', 'Time t'), min: 0, max: 10, step: 0.1, default: 10, unit: 'min', visibleIf: (v) => v.mode === 'fill' },
    { key: 'a', type: 'number', label: L('Untere Grenze a', 'Lower limit a'), min: -5, max: 9, step: 0.05, default: 0, visibleIf: (v) => v.mode === 'sum' },
    { key: 'b', type: 'number', label: L('Obere Grenze b', 'Upper limit b'), min: -5, max: 9, step: 0.05, default: 2, visibleIf: (v) => v.mode === 'sum' },
    { key: 'n', type: 'number', label: L('Anzahl der Streifen n', 'Number of strips n'), min: 1, max: 128, step: 1, default: 4, visibleIf: (v) => v.mode !== 'quiz' },
    {
      key: 'kind',
      type: 'choice',
      label: L('Art der Summe', 'Type of sum'),
      options: [
        { value: 'both', label: L('Unter- und Obersumme', 'Lower and upper sum') },
        { value: 'lower', label: L('Untersumme', 'Lower sum') },
        { value: 'upper', label: L('Obersumme', 'Upper sum') },
        { value: 'left', label: L('Linkssumme', 'Left sum') },
        { value: 'right', label: L('Rechtssumme', 'Right sum') },
        { value: 'mid', label: L('Mittelsumme', 'Midpoint sum') },
        { value: 'trapez', label: L('Trapezsumme', 'Trapezoidal sum') },
      ],
      default: 'both',
      visibleIf: (v) => v.mode === 'sum',
    },
    { key: 'area', type: 'boolean', group: 'view', label: L('Exakte Fläche einfärben', 'Shade the exact area'), default: false, visibleIf: (v) => v.mode === 'sum' },
    { key: 'grid', type: 'boolean', group: 'view', label: L('Gitternetz', 'Grid'), default: true },
    { key: 'q', type: 'number', label: L('Aufgabe Nr.', 'Task no.'), min: 1, max: 999, step: 1, default: 1, visibleIf: (v) => v.mode === 'quiz' },
    { key: 'ans', type: 'text', label: L('Deine Antwort', 'Your answer'), default: '', maxLength: 20, placeholder: L('z. B. 1,75', 'e.g. 1.75'), visibleIf: (v) => v.mode === 'quiz' },
  ],
  hint: (v) => {
    if (v.mode === 'fill') return L('Tipp: Zieh die Zeit t auf der Achse oder drück „Abspielen“.', 'Tip: Drag the time t along the axis or press “Play”.');
    if (v.mode === 'quiz') return L('Tipp: Rechne mit Stift und Taschenrechner, trag das Ergebnis unter „Deine Antwort“ ein und tippe auf „Prüfen“.', 'Tip: Work it out with pen and calculator, enter the result under “Your answer” and tap “Check”.');
    return L('Tipp: Zieh die Grenzen a und b auf der x-Achse.', 'Tip: Drag the limits a and b on the x-axis.');
  },
  actions: [
    { id: 'double', label: L('n verdoppeln', 'Double n'), primary: true, visibleIf: (v) => v.mode === 'sum' },
    { id: 'halve', label: L('n halbieren', 'Halve n'), visibleIf: (v) => v.mode === 'sum' },
    { id: 'play', label: L('Abspielen', 'Play'), primary: true, visibleIf: (v) => v.mode === 'fill' },
    { id: 'check', label: L('Prüfen', 'Check'), primary: true, visibleIf: (v) => v.mode === 'quiz' },
    { id: 'newq', label: L('Neue Aufgabe', 'New task'), visibleIf: (v) => v.mode === 'quiz' },
  ],
  readouts: [
    { key: 'task', label: L('Aufgabe', 'Task') },
    { key: 'verdict', label: L('Rückmeldung', 'Feedback') },
    { key: 'water', label: L('Wassermenge', 'Amount of water') },
    { key: 'sum', label: L('Summe', 'Sum'), spoiler: true },
    { key: 'exact', label: L('Integral (exakt)', 'Integral (exact)'), spoiler: true },
    { key: 'table', label: L('Annäherung für wachsendes n', 'Approximation as n grows'), spoiler: true },
  ],
  presets: [
    { id: 'start', label: L('x² von 0 bis 2', 'x² from 0 to 2'), values: {} },
    { id: 'fine', label: L('64 Streifen', '64 strips'), values: { n: 64 } },
    { id: 'sine', label: L('sin x: Flächenbilanz', 'sin x: signed area'), values: { fn: 'sin', a: 0, b: 6.3, kind: 'mid', n: 12 } },
    { id: 'cubic', label: L('Fläche unter der x-Achse', 'Area below the x-axis'), values: { fn: 'cubic', a: -2, b: 3, kind: 'mid', n: 10 } },
    { id: 'trapez', label: L('Trapezsumme', 'Trapezoidal sum'), values: { fn: 'sqrt', a: 0, b: 9, kind: 'trapez', n: 6 } },
    { id: 'fill', label: L('Becken füllen', 'Filling a tank'), values: { mode: 'fill', prof: 'const', t: 0, n: 10 } },
    { id: 'outflow', label: L('Zufluss und Abfluss', 'Inflow and outflow'), values: { mode: 'fill', prof: 'outflow', t: 10, n: 10 } },
    { id: 'quiz', label: L('Üben', 'Practice'), values: { mode: 'quiz', q: 1, ans: '' } },
  ],
  strings: {
    de: {
      canvas: 'Graph einer Funktion mit Rechtecken bzw. Trapezen zwischen Graph und x-Achse',
      lower: 'Untersumme',
      upper: 'Obersumme',
      left: 'Linkssumme',
      right: 'Rechtssumme',
      mid: 'Mittelsumme',
      trapez: 'Trapezsumme',
      diff: 'Differenz',
      sumText: '{name} mit n = {n}: {v}',
      tank: 'Becken',
      rateAxis: 'r in l/min',
      timeAxis: 't in min',
      liters: '{v} l',
      waterText: 'V({t}) = {v0} + ∫ r(t) dt ≈ {v} l',
      estimate: 'Rechtecke (n = {n}): ≈ {v} l',
      rateNow: 'r({t}) = {r} l/min',
      inflow: 'Zufluss',
      outflowLabel: 'Abfluss',
      play: 'Abspielen',
      qText: 'Aufgabe {q}: Berechne die {kind} für f(x) = {f} auf [{a}; {b}] mit n = {n} Streifen.',
      qRound: 'Runde auf zwei Nachkommastellen.',
      okMsg: 'Richtig! {calc}',
      noMsg: 'Noch nicht. Tipp: {hint}',
      hintSum: 'Breite Δx = {w}; Summe = Δx · (Summe der Höhen).',
      hint_lower: 'Untersumme: kleinster Funktionswert im Streifen (hier am linken Rand).',
      hint_upper: 'Obersumme: größter Funktionswert im Streifen (hier am rechten Rand).',
      hint_left: 'Linkssumme: Höhe am linken Rand jedes Streifens.',
      hint_right: 'Rechtssumme: Höhe am rechten Rand jedes Streifens.',
      hint_mid: 'Mittelsumme: Höhe in der Mitte jedes Streifens.',
      emptyMsg: 'Trag dein Ergebnis unter „Deine Antwort“ ein und tippe auf „Prüfen“.',
      wait: 'Deine Antwort fehlt noch.',
      kind_lower: 'Untersumme',
      kind_upper: 'Obersumme',
      kind_left: 'Linkssumme',
      kind_right: 'Rechtssumme',
      kind_mid: 'Mittelsumme',
    },
    en: {
      canvas: 'Graph of a function with rectangles or trapezoids between the graph and the x-axis',
      lower: 'Lower sum',
      upper: 'Upper sum',
      left: 'Left sum',
      right: 'Right sum',
      mid: 'Midpoint sum',
      trapez: 'Trapezoidal sum',
      diff: 'Difference',
      sumText: '{name} with n = {n}: {v}',
      tank: 'Tank',
      rateAxis: 'r in l/min',
      timeAxis: 't in min',
      liters: '{v} l',
      waterText: 'V({t}) = {v0} + ∫ r(t) dt ≈ {v} l',
      estimate: 'Rectangles (n = {n}): ≈ {v} l',
      rateNow: 'r({t}) = {r} l/min',
      inflow: 'inflow',
      outflowLabel: 'outflow',
      play: 'Play',
      qText: 'Task {q}: Calculate the {kind} for f(x) = {f} on [{a}, {b}] with n = {n} strips.',
      qRound: 'Round to two decimal places.',
      okMsg: 'Correct! {calc}',
      noMsg: 'Not yet. Hint: {hint}',
      hintSum: 'Width Δx = {w}; sum = Δx · (sum of the heights).',
      hint_lower: 'Lower sum: smallest function value in each strip (here at the left edge).',
      hint_upper: 'Upper sum: largest function value in each strip (here at the right edge).',
      hint_left: 'Left sum: height at the left edge of each strip.',
      hint_right: 'Right sum: height at the right edge of each strip.',
      hint_mid: 'Midpoint sum: height in the middle of each strip.',
      emptyMsg: 'Enter your result under “Your answer” and tap “Check”.',
      wait: 'Your answer is still missing.',
      kind_lower: 'lower sum',
      kind_upper: 'upper sum',
      kind_left: 'left sum',
      kind_right: 'right sum',
      kind_mid: 'midpoint sum',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string | number>) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    /** Höhe der Aufgabenkarte über dem Graphen (nur beim Üben). */
    const stripH = () => (p.mode === 'quiz' ? (surface.width < 520 ? 150 : 104) : 0);
    /** Breite des Beckens rechts neben dem Graphen (nur beim Zufluss). */
    const tankW = (w: number) => (p.mode === 'fill' ? Math.round(Math.min(240, Math.max(104, w * 0.26))) : 0);
    const plot = new Plot(surface, {
      x: VIEW.x2.x,
      y: VIEW.x2.y,
      equalAspect: false,
      region: (w, h) => {
        const s = stripH();
        return { x: 0, y: s, w: w - tankW(w), h: h - s };
      },
    });
    const profile = () => PROFILES[(p.prof as ProfileId) in PROFILES ? (p.prof as ProfileId) : 'const'];
    const FILL_Y: Record<ProfileId, [number, number]> = { const: [-0.9, 4.6], linear: [-0.9, 6.9], wave: [-0.9, 5.9], outflow: [-6.9, 4.9] };
    let task: SumTask = sumTask(1, seededRandom(1));
    let taskState: { ok: boolean; got: number | null } | null = null;
    const pop = new Tween(450, ease.outBack);
    // Abspielen: Zeit läuft von 0 (bzw. der aktuellen Zeit) bis 10 Minuten
    const run = new Tween(6000, ease.linear);
    let runFrom = 0;
    const timeNow = () => (run.running ? runFrom + (10 - runFrom) * run.value : p.t);
    let wasRunning = false;
    const def = () => FUNCTIONS[p.fn as FunctionId];
    const clampToDomain = (x: number) => Math.min(def().domain[1], Math.max(def().domain[0], x));
    // Grenzen auf den Definitionsbereich begrenzen (z. B. √x nur für x ≥ 0, auch bei geteilten Links)
    const ga = () => clampToDomain(p.a);
    const gb = () => clampToDomain(p.b);
    const lo = () => Math.min(ga(), gb());
    const hi = () => Math.max(ga(), gb());
    const crit = () => def().critical;

    // Übergang beim Ändern von n: neue Streifen wachsen aus den alten heraus
    const split = new Tween(700, ease.outCubic);
    let previous: Strip[] = [];
    let previousKind = '';

    function kinds(): SumKind[] {
      return p.kind === 'both' ? ['upper', 'lower'] : [p.kind as SumKind];
    }

    function heightBefore(list: Strip[], x: number, fallback: number): number {
      const s = list.find((q) => x >= q.x0 - 1e-12 && x <= q.x1 + 1e-12);
      return s ? (s.h0 + s.h1) / 2 : fallback;
    }

    function updateReadouts(): void {
      const f = def().f;
      const a = lo();
      const b = hi();
      const values = kinds().map((k) => [k, sumOf(strips(f, a, b, p.n, k, crit()))] as const);
      if (p.kind === 'both') {
        const up = values[0]![1];
        const low = values[1]![1];
        ctx.readout('sum', { html: `<var>U</var><sub>${p.n}</sub> ≈ ${fmt.num(low, 4)}; <var>O</var><sub>${p.n}</sub> ≈ ${fmt.num(up, 4)}; ${ctx.t('diff')} <var>O</var><sub>${p.n}</sub> − <var>U</var><sub>${p.n}</sub> ≈ ${fmt.num(up - low, 4)}` });
      } else {
        ctx.readout('sum', ctx.t('sumText').replace('{name}', ctx.t(p.kind)).replace('{n}', String(p.n)).replace('{v}', fmt.num(values[0]![1], 4)));
      }
      const exact = exactIntegral(def(), a, b);
      const integral = (x0: number, x1: number) => `∫<sub>${fmt.num(x0, 2)}</sub><sup>${fmt.num(x1, 2)}</sup> <var>f</var>(<var>x</var>) d<var>x</var>`;
      // a > b: Integral mit Vorzeichen (Grenzen vertauschen ändert das Vorzeichen)
      const swapped = ga() > gb();
      ctx.readout('exact', {
        html: swapped
          ? `${integral(ga(), gb())} = −${integral(a, b)} ≈ <strong>${fmt.num(-exact, 4)}</strong>`
          : `${integral(a, b)} ≈ <strong>${fmt.num(exact, 4)}</strong>`,
      });
      const kind = p.kind === 'both' ? (['lower', 'upper'] as SumKind[]) : [p.kind as SumKind];
      const rows = [4, 8, 16, 32, 64, 128]
        .map((n) => `<tr${n === p.n ? ' class="is-current"' : ''}><td>${n}</td>${kind.map((k) => `<td>${fmt.num(sumOf(strips(f, a, b, n, k, crit())), 4)}</td>`).join('')}</tr>`)
        .join('');
      const head = kind.map((k) => `<th>${ctx.t(k)}</th>`).join('');
      ctx.readout('table', { html: `<table class="mini-table"><tr><th><var>n</var></th>${head}</tr>${rows}</table>` });
    }

    // Grenzen auf der x-Achse ziehen
    const editable = () => !ctx.locked && p.mode === 'sum';
    plot.addHandle({ get: () => [ga(), 0], set: (x) => ctx.set({ a: clampToDomain(x) }), axis: 'x', enabled: editable, color: () => ctx.theme.series[4]! });
    plot.addHandle({ get: () => [gb(), 0], set: (x) => ctx.set({ b: clampToDomain(x) }), axis: 'x', enabled: editable, color: () => ctx.theme.series[4]! });
    plot.addHandle({
      get: () => [timeNow(), 0],
      set: (x) => ctx.set({ t: Math.round(Math.min(10, Math.max(0, x)) * 10) / 10 }),
      axis: 'x',
      enabled: () => !ctx.locked && p.mode === 'fill' && !run.running,
      color: () => ctx.theme.series[3]!,
    });

    function setView(): void {
      plot.setControlsVisible(p.mode === 'sum');
      if (p.mode === 'fill') {
        plot.setAxes({ x: { label: ctx.t('timeAxis') }, y: { label: ctx.t('rateAxis') } });
        plot.setRange([-0.9, 10.9], FILL_Y[(p.prof as ProfileId) in FILL_Y ? (p.prof as ProfileId) : 'const']);
      } else if (p.mode === 'quiz') {
        plot.setAxes({ x: {}, y: {} });
        const top = FUNCTIONS[task.fn].f(task.b);
        plot.setRange([task.a - 0.5, task.b + 0.5], [-0.2 * top - 0.5, top * 1.14 + 0.2]);
      } else {
        plot.setAxes({ x: {}, y: {} });
        const v = VIEW[p.fn as FunctionId];
        plot.setRange(v.x, v.y);
      }
    }

    /* ───────────── Zufluss und Wassermenge ───────────── */

    function updateFillReadouts(): void {
      const pr = profile();
      const t = timeNow();
      const v = volume(pr, t);
      // Linkssumme der gezeichneten Rechtecke auf [0; 10], abgeschnitten bei t
      const est = pr.v0 + strips(pr.rate, 0, 10, p.n, 'left').reduce((sum, st) => sum + st.h0 * Math.max(0, Math.min(st.x1, t) - st.x0), 0);
      ctx.readout('water', tr('waterText', { t: fmt.num(t, 1), v0: fmt.num(pr.v0, 0), v: fmt.num(v, 2) }));
      ctx.readout('sum', t > 0 ? tr('estimate', { n: p.n, v: fmt.num(est, 2) }) : null);
      ctx.readout('exact', tr('rateNow', { t: fmt.num(t, 1), r: fmt.num(pr.rate(t), 2) }));
      ctx.readout('table', null);
    }

    function drawFill(): void {
      const theme = ctx.theme;
      const pr = profile();
      const t = timeNow();
      if (p.grid) plot.grid();
      plot.axes();
      // Rechtecke der Linkssumme auf [0; 10] (blass), bis t kräftig
      const list = strips(pr.rate, 0, 10, p.n, 'left');
      const bar = (x0: number, x1: number, h: number, alpha: number, width: number, color: string) =>
        plot.polygon(
          [
            [x0, 0],
            [x0, h],
            [x1, h],
            [x1, 0],
          ],
          { fill: color, alpha, stroke: color, width },
        );
      for (const st of list) {
        const color = st.h0 >= 0 ? theme.series[0]! : theme.series[1]!;
        bar(st.x0, st.x1, st.h0, 0.05, 0.8, color);
        if (st.x0 < t) bar(st.x0, Math.min(st.x1, t), st.h0, 0.18, 1.2, color);
      }
      // exakte Fläche bis t
      if (t > 0) {
        plot.fillBetween(pr.rate, () => 0, 0, t, { fill: theme.series[5], alpha: 0.3 });
      }
      plot.fn(pr.rate, { color: theme.text, width: 3, from: 0, to: 10 });
      plot.vline(t, { color: theme.series[3], width: 1.5, dash: [5, 4] });
      plot.point(t, pr.rate(t), { color: theme.series[3], radius: 5 });
      plot.text(t, 0, 't', { color: theme.series[3], math: true, size: 16, weight: 'bold', offset: [0, 22] });
      const r = plot.rect;
      const label = `r(t) = ${ctx.lang === 'de' ? pr.term : pr.term.replace(/,/g, '.')}`;
      const g = surface.g;
      g.font = `700 15px ${theme.font}`;
      const lw = g.measureText(label).width;
      g.fillStyle = withAlpha(theme.bg, 0.9);
      roundRect(g, r.x + r.w - lw - 26, r.y + 8, lw + 18, 28, 8);
      g.fill();
      plot.textPx(r.x + r.w - 17, r.y + 22, label, { color: theme.text, size: 15, weight: 'bold', align: 'right', halo: false });
      if (p.prof === 'outflow') {
        plot.text(1.6, 1.2, ctx.t('inflow'), { color: theme.series[0], size: 13, weight: 'bold', align: 'center', halo: true });
        plot.text(8, -1.6, ctx.t('outflowLabel'), { color: theme.series[1], size: 13, weight: 'bold', align: 'center', halo: true });
      }
    }

    function drawTank(): void {
      const g = surface.g;
      const theme = ctx.theme;
      const pr = profile();
      const t = timeNow();
      const v = volume(pr, t);
      const W = surface.width;
      const H = surface.height;
      const tw = tankW(W);
      const x = W - tw + 16;
      const w = tw - 32;
      const top = 54;
      const bottom = H - 40;
      const cap = 40;
      const level = bottom - ((bottom - top) * Math.max(0, Math.min(cap, v))) / cap;
      // Titel
      g.font = `700 14px ${theme.font}`;
      g.fillStyle = theme.text;
      g.textAlign = 'center';
      g.textBaseline = 'alphabetic';
      g.fillText(ctx.t('tank'), x + w / 2, 26);
      // Wasser
      g.save();
      roundRect(g, x, top, w, bottom - top, 10);
      g.clip();
      g.fillStyle = withAlpha(theme.series[5]!, 0.45);
      g.fillRect(x, level, w, bottom - level);
      g.strokeStyle = theme.series[5]!;
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(x, level);
      g.lineTo(x + w, level);
      g.stroke();
      g.restore();
      // Rand und Skala (alle 10 l)
      roundRect(g, x, top, w, bottom - top, 10);
      g.strokeStyle = theme.text;
      g.lineWidth = 2;
      g.stroke();
      g.font = `11px ${theme.font}`;
      g.textAlign = 'right';
      g.textBaseline = 'middle';
      for (let l = 0; l <= cap; l += 10) {
        const y = bottom - ((bottom - top) * l) / cap;
        g.strokeStyle = withAlpha(theme.text, 0.5);
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(x, y);
        g.lineTo(x + 8, y);
        g.stroke();
        g.fillStyle = theme.muted;
        g.fillText(String(l), x - 4, y);
      }
      // Zu- bzw. Abfluss als Pfeil
      const rate = pr.rate(t);
      if (Math.abs(rate) > 0.05) {
        g.strokeStyle = rate > 0 ? theme.series[0]! : theme.series[1]!;
        g.lineWidth = Math.min(8, 2 + Math.abs(rate));
        g.lineCap = 'round';
        const cx = x + w / 2;
        const [y0, y1] = rate > 0 ? [top - 16, Math.min(level - 6, top + 26)] : [bottom - 4, bottom + 26];
        g.beginPath();
        g.moveTo(cx, y0);
        g.lineTo(cx, y1);
        g.stroke();
        g.fillStyle = g.strokeStyle;
        g.beginPath();
        g.moveTo(cx - 7, y1 - 4);
        g.lineTo(cx + 7, y1 - 4);
        g.lineTo(cx, y1 + 6);
        g.closePath();
        g.fill();
      }
      // Menge
      g.font = `700 15px ${theme.font}`;
      g.fillStyle = theme.text;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      const ly = Math.max(top + 14, Math.min(bottom - 14, level - 14));
      g.fillText(tr('liters', { v: fmt.num(v, 1) }), x + w / 2 + 6, ly);
    }

    /* ───────────── Üben ───────────── */

    const fnText = (fn: SumTask['fn']) => (fn === 'x2' ? 'x²' : '√x');

    function taskText(): string {
      return `${tr('qText', { q: p.q, kind: ctx.t(`kind_${task.kind}`), f: fnText(task.fn), a: fmt.num(task.a), b: fmt.num(task.b), n: task.n })} ${ctx.t('qRound')}`;
    }

    function calcText(): string {
      const hs = task.heights.map((h) => fmt.num(h, 2)).join(' + ');
      return `${fmt.num(task.width, 2)} · (${hs}) ${fmt.approx(task.answer, 2)}`;
    }

    function feedback(): { text: string; color: string } | null {
      if (!taskState) return null;
      if (taskState.got === null) return { text: ctx.t('wait'), color: ctx.theme.muted };
      if (taskState.ok) return { text: tr('okMsg', { calc: calcText() }), color: ctx.theme.series[2]! };
      return { text: tr('noMsg', { hint: `${ctx.t(`hint_${task.kind}`)} ${tr('hintSum', { w: fmt.num(task.width, 2) })}` }), color: ctx.theme.series[1]! };
    }

    function wrapText(textValue: string, maxW: number, font: string): string[] {
      const g = surface.g;
      g.font = font;
      const lines: string[] = [];
      let line = '';
      for (const w of textValue.split(' ')) {
        const next = line ? `${line} ${w}` : w;
        if (g.measureText(next).width > maxW && line) {
          lines.push(line);
          line = w;
        } else line = next;
      }
      if (line) lines.push(line);
      return lines;
    }

    function drawTaskCard(): void {
      const g = surface.g;
      const theme = ctx.theme;
      const r: Rect = { x: 8, y: 8, w: surface.width - 16, h: stripH() - 14 };
      g.save();
      softShadow(g, theme.dark, 10, 2);
      roundRect(g, r.x, r.y, r.w, r.h, 10);
      g.fillStyle = theme.bg;
      g.fill();
      g.restore();
      roundRect(g, r.x, r.y, r.w, r.h, 10);
      g.strokeStyle = theme.grid;
      g.lineWidth = 1;
      g.stroke();
      const fb = feedback();
      const fbLines = (sz: number) => (fb ? wrapText(fb.text, r.w - 24, `600 ${sz}px ${theme.font}`) : []);
      const rows = (sz: number) => Math.floor((r.h - 16) / (sz * 1.3));
      let size = 15;
      let lines = wrapText(taskText(), r.w - 24, `normal ${size}px ${theme.font}`);
      while (lines.length + fbLines(size).length > rows(size) && size > 11) {
        size--;
        lines = wrapText(taskText(), r.w - 24, `normal ${size}px ${theme.font}`);
      }
      lines = lines.slice(0, Math.max(1, rows(size) - Math.min(2, fbLines(size).length)));
      g.textAlign = 'left';
      g.textBaseline = 'top';
      g.font = `normal ${size}px ${theme.font}`;
      g.fillStyle = theme.text;
      let y = r.y + 10;
      for (const l of lines) {
        g.fillText(l, r.x + 12, y);
        y += size * 1.3;
      }
      if (fb) {
        g.font = `600 ${size}px ${theme.font}`;
        g.fillStyle = fb.color;
        for (const l of fbLines(size).slice(0, Math.max(1, rows(size) - lines.length))) {
          g.fillText(l, r.x + 12, y + 2);
          y += size * 1.3;
        }
      }
    }

    function drawQuiz(): void {
      const theme = ctx.theme;
      const def = FUNCTIONS[task.fn];
      const solved = taskState?.ok === true;
      if (p.grid) plot.grid();
      plot.axes();
      const list = strips(def.f, task.a, task.b, task.n, task.kind, def.critical);
      const grow = solved ? (pop.running ? Math.min(1, pop.value) : 1) : 0;
      list.forEach((st, i) => {
        // Streifengrenzen immer, gefüllte Rechtecke erst nach richtiger Lösung
        plot.polygon(
          [
            [st.x0, 0],
            [st.x0, st.h0 * grow],
            [st.x1, st.h0 * grow],
            [st.x1, 0],
          ],
          { fill: theme.series[0], alpha: 0.28 * grow, stroke: theme.series[0], width: 1.4 },
        );
        if (!solved) plot.segment([st.x0, 0], [st.x0, def.f(st.x0)], { color: theme.series[0], width: 1, dash: [4, 4] });
        if (i === list.length - 1 && !solved) plot.segment([st.x1, 0], [st.x1, def.f(st.x1)], { color: theme.series[0], width: 1, dash: [4, 4] });
        if (solved) plot.text((st.x0 + st.x1) / 2, st.h0, fmt.num(st.h0, 2), { color: theme.series[0], size: 12, weight: 'bold', align: 'center', offset: [0, -10], halo: true });
      });
      plot.fn(def.f, { color: theme.text, width: 3, from: Math.max(def.domain[0], task.a - 0.5), to: task.b + 0.5 });
      // Breite eines Streifens
      const w = task.width;
      plot.text(task.a + w / 2, 0, `Δx = ${fmt.num(w, 2)}`, { color: theme.series[3], size: 13, weight: 'bold', align: 'center', offset: [0, 34] });
      const r = plot.rect;
      plot.textPx(r.x + r.w - 17, r.y + 22, `f(x) = ${fnText(task.fn)}`, { color: theme.text, size: 15, weight: 'bold', align: 'right', halo: true });
    }

    function newTask(): void {
      task = sumTask(p.q, seededRandom(p.q * 7919 + 29));
      taskState = null;
    }

    function updateQuizReadouts(): void {
      ctx.readout('sum', null);
      ctx.readout('exact', null);
      ctx.readout('table', null);
      ctx.readout('water', null);
      ctx.readout('task', taskText());
      const fb = feedback();
      ctx.readout('verdict', fb ? fb.text : ctx.t('emptyMsg'));
    }

    function refresh(): void {
      ctx.readout('task', null);
      ctx.readout('verdict', null);
      ctx.readout('water', null);
      if (p.mode === 'fill') updateFillReadouts();
      else if (p.mode === 'quiz') updateQuizReadouts();
      else updateReadouts();
    }

    function snapshot(): void {
      previous = strips(def().f, lo(), hi(), p.n, kinds()[0]!, crit());
      previousKind = String(p.kind);
    }

    return {
      update(changed, source) {
        if (changed.has('q') || source === 'init' || source === 'replace') newTask();
        if (changed.has('ans') && taskState && !taskState.ok) taskState = null;
        if (changed.has('mode') || changed.has('prof') || changed.has('q') || source === 'init' || source === 'replace') setView();
        if (changed.has('fn')) {
          if (p.mode === 'sum') setView();
          if (source === 'input') {
            const [a, b] = START[p.fn as FunctionId];
            ctx.set({ a, b });
          }
        }
        // Regler außerhalb des Definitionsbereichs (z. B. a < 0 bei √x) auf den Rand setzen
        if (source === 'input' && (changed.has('a') || changed.has('b')) && (ga() !== p.a || gb() !== p.b)) {
          ctx.set({ a: ga(), b: gb() });
        }
        if (!changed.has('n')) snapshot();
        refresh();
      },

      action(id) {
        if (id === 'check') {
          taskState = checkSum(task, p.ans);
          pop.play();
          refresh();
          const fb = feedback();
          if (fb) ctx.announce(fb.text);
          ctx.requestRender();
          return;
        }
        if (id === 'newq') {
          ctx.set({ q: p.q >= 999 ? 1 : p.q + 1, ans: '' });
          return;
        }
        if (id === 'play') {
          runFrom = p.t >= 9.95 ? 0 : p.t;
          run.play(6000 * ((10 - runFrom) / 10));
          wasRunning = true;
          ctx.requestRender();
          return;
        }
        snapshot();
        const n = id === 'double' ? Math.min(128, p.n * 2) : Math.max(1, Math.floor(p.n / 2));
        split.play();
        ctx.set({ n });
      },

      resetView() {
        setView();
      },

      render() {
        const theme = ctx.theme;
        plot.resize();
        if (p.mode !== 'sum') {
          setView();
          surface.begin();
          plot.begin();
          if (p.mode === 'fill') drawFill();
          else drawQuiz();
          plot.end();
          if (p.mode === 'fill') {
            drawTank();
            if (run.running) updateFillReadouts();
            else if (wasRunning) {
              wasRunning = false;
              ctx.set({ t: 10 });
            }
          } else drawTaskCard();
          if (run.running || pop.running || wasRunning) ctx.requestRender();
          return;
        }
        surface.begin();
        const f = def().f;
        const a = lo();
        const b = hi();
        const [d0, d1] = def().domain;
        plot.begin();
        if (p.grid) plot.grid();
        plot.axes();
        if (p.area) {
          plot.fillBetween(f, () => 0, a, b, { fill: theme.series[2], alpha: 0.28 });
        }
        const t = split.value;
        const anim = split.running && previousKind === String(p.kind);
        kinds().forEach((kind) => {
          const list = strips(f, a, b, p.n, kind, crit());
          const outline = kind === 'upper' && p.kind === 'both';
          for (const s of list) {
            let h0 = s.h0;
            let h1 = s.h1;
            if (anim) {
              const before = heightBefore(previous, (s.x0 + s.x1) / 2, h0);
              h0 = before + (h0 - before) * t;
              h1 = before + (h1 - before) * t;
            }
            const positive = (h0 + h1) / 2 >= 0;
            const color = positive ? theme.series[0]! : theme.series[1]!;
            const pts: [number, number][] = [
              [s.x0, 0],
              [s.x0, h0],
              [s.x1, h1],
              [s.x1, 0],
            ];
            plot.polygon(pts, { fill: color, alpha: outline ? 0.12 : 0.32, stroke: color, width: p.n > 64 ? 0.6 : 1.4 });
            if (kind === 'mid' && p.n <= 32) plot.point((s.x0 + s.x1) / 2, f((s.x0 + s.x1) / 2), { color: theme.series[3], radius: 3 });
          }
        });
        plot.fn(f, { color: theme.text, width: 3, from: d0, to: d1 });
        // Grenzen
        for (const [x, name] of [
          [ga(), 'a'],
          [gb(), 'b'],
        ] as const) {
          plot.vline(x, { color: theme.series[4], width: 1.5, dash: [5, 4] });
          plot.text(x, 0, name, { color: theme.series[4], math: true, size: 16, weight: 'bold', offset: [0, 22] });
        }
        const r = plot.rect;
        const label = `f(x) = ${ctx.lang === 'de' ? def().term : def().term.replace(',', '.')}`;
        const g = surface.g;
        g.font = `700 15px ${theme.font}`;
        g.fillStyle = withAlpha(theme.bg, 0.9);
        roundRect(g, r.x + 8, r.y + 8, g.measureText(label).width + 18, 28, 8);
        g.fill();
        plot.textPx(r.x + 17, r.y + 22, label, { color: theme.text, size: 15, weight: 'bold', align: 'left', halo: false });
        plot.end();
        if (split.running) ctx.requestRender();
      },

      destroy: () => surface.destroy(),
    };
  },
});
