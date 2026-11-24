import { clamp, defineSimulation, ease, Plot, roundRect, seededRandom, softShadow, Surface, Tween, type Rect } from '../../../sim-core';
import { differenceQuotient, FUNCTIONS, fitTask, isDifferentiable, isExactAt, slopeAngleError, tangentGap, type FitTask, type FunctionId } from './model';

const L = (de: string, en: string) => ({ de, en });
const H_MIN = 0.001;
const RANGES: Record<FunctionId, { x: [number, number]; y: [number, number]; x0: [number, number] }> = {
  x2: { x: [-3.5, 3.5], y: [-1.5, 9], x0: [-3, 3] },
  cubic: { x: [-4, 4], y: [-3.2, 3.2], x0: [-3.5, 3.5] },
  sin: { x: [-1, 7.3], y: [-1.8, 1.8], x0: [-0.8, 7] },
  exp: { x: [-3, 2.6], y: [-0.8, 7.5], x0: [-2.8, 2] },
  abs: { x: [-3.5, 3.5], y: [-1.5, 4.5], x0: [-3, 3] },
  car: { x: [-0.6, 8.6], y: [-0.8, 8.8], x0: [0, 7] },
};

/** Aufteilung der Bühne: Lupe rechts bzw. unten, Straße oben. */
const wideStage = (w: number, h: number) => w >= 640 || w > h * 1.3;

/**
 * Von der Sekante zur Tangente: Der Differenzenquotient
 * (f(x₀ + h) − f(x₀)) / h ist die Steigung der Sekante durch P und Q. Für
 * h → 0 wird aus der Sekante die Tangente in P.
 */
export default defineSimulation({
  id: 'sekante-tangente',
  dragHint: true,
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Ansicht', 'View'),
      options: [
        { value: 'secant', label: L('Sekante wird Tangente', 'Secant becomes tangent') },
        { value: 'zoom', label: L('Lupe: Graph wird gerade', 'Magnifier: the graph gets straight') },
        { value: 'speed', label: L('Geschwindigkeit eines Autos', 'Speed of a car') },
        { value: 'fit', label: L('Spiel: Tangente anlegen', 'Game: place the tangent') },
      ],
      default: 'secant',
    },
    { key: 'zl', type: 'number', label: L('Vergrößerung der Lupe', 'Magnification'), min: 0, max: 6, step: 1, default: 2, display: (v: number) => `${2 ** v}×`, visibleIf: (v) => v.mode === 'zoom' },
    { key: 'q', type: 'number', label: L('Aufgabe Nr.', 'Task no.'), min: 1, max: 999, step: 1, default: 1, visibleIf: (v) => v.mode === 'fit' },
    { key: 'mu', type: 'number', label: L('Deine Steigung', 'Your slope'), min: -8, max: 8, step: 0.05, default: 0, visibleIf: (v) => v.mode === 'fit' },
    {
      key: 'fn',
      type: 'choice',
      label: L('Funktion', 'Function'),
      options: [
        { value: 'x2', label: L('f(x) = x²', 'f(x) = x²') },
        { value: 'cubic', label: L('f(x) = 0,25x³ − x', 'f(x) = 0.25x³ − x') },
        { value: 'sin', label: L('f(x) = sin x', 'f(x) = sin x') },
        { value: 'exp', label: L('f(x) = eˣ', 'f(x) = eˣ') },
        { value: 'abs', label: L('f(x) = |x| (Knick)', 'f(x) = |x| (kink)') },
      ],
      default: 'x2',
      visibleIf: (v) => v.mode === 'secant' || v.mode === 'zoom',
    },
    { key: 'x0', type: 'number', label: L('Stelle x₀ (beim Auto: Zeitpunkt t₀ in s)', 'Point x₀ (for the car: time t₀ in s)'), min: -3.5, max: 7, step: 0.01, default: 1, visibleIf: (v) => v.mode !== 'fit' },
    { key: 'h', type: 'number', label: L('Abstand h', 'Distance h'), min: -3, max: 3, step: 0.001, default: 1.5, visibleIf: (v) => v.mode === 'secant' || v.mode === 'speed' },
    { key: 'triangle', type: 'boolean', group: 'view', label: L('Steigungsdreieck', 'Slope triangle'), default: true, visibleIf: (v) => v.mode === 'secant' || v.mode === 'speed' },
    { key: 'tangent', type: 'boolean', group: 'view', label: L('Tangente einzeichnen', 'Show tangent'), default: false, visibleIf: (v) => v.mode === 'secant' || v.mode === 'speed' },
    { key: 'trace', type: 'boolean', group: 'view', label: L('Ableitungsgraph f′ entstehen lassen', 'Trace the derivative f′'), default: false, visibleIf: (v) => v.mode === 'secant' },
    { key: 'grid', type: 'boolean', group: 'view', label: L('Gitternetz', 'Grid'), default: true },
  ],
  hint: (v) => {
    if (v.mode === 'zoom') return L('Tipp: Zoom in die Lupe hinein – irgendwann sieht der Graph aus wie eine Gerade: die Tangente.', 'Tip: Zoom into the magnifier – at some point the graph looks like a straight line: the tangent.');
    if (v.mode === 'speed') return L('Tipp: Zieh P oder Q. Die Sekante zeigt die Durchschnittsgeschwindigkeit, die Tangente die Anzeige des Tachos.', 'Tip: Drag P or Q. The secant shows the average speed, the tangent the speedometer reading.');
    if (v.mode === 'fit') return L('Tipp: Dreh die Gerade am Griff, bis sie den Graphen in P nur berührt, und tippe auf „Prüfen“.', 'Tip: Turn the line by its handle until it just touches the graph at P, then tap “Check”.');
    return L('Tipp: Zieh die Punkte P und Q – wird h klein, wird die Sekante zur Tangente.', 'Tip: Drag points P and Q – as h gets small, the secant becomes the tangent.');
  },
  actions: [
    { id: 'limit', label: L('h → 0', 'h → 0'), primary: true, visibleIf: (v) => v.mode === 'secant' || v.mode === 'speed' },
    { id: 'back', label: L('h zurücksetzen', 'Reset h'), visibleIf: (v) => v.mode === 'secant' || v.mode === 'speed' },
    { id: 'zoomin', label: L('Hineinzoomen', 'Zoom in'), primary: true, visibleIf: (v) => v.mode === 'zoom' },
    { id: 'check', label: L('Prüfen', 'Check'), primary: true, visibleIf: (v) => v.mode === 'fit' },
    { id: 'newq', label: L('Neue Aufgabe', 'New task'), visibleIf: (v) => v.mode === 'fit' },
  ],
  readouts: [
    { key: 'dq', label: L('Differenzenquotient (Sekantensteigung)', 'Difference quotient (secant slope)') },
    { key: 'table', label: L('Annäherung für kleiner werdendes h', 'Approximation as h gets smaller') },
    { key: 'tangent', label: L('Tangentensteigung f′(x₀)', 'Tangent slope f′(x₀)'), spoiler: true },
    { key: 'speed', label: L('Geschwindigkeit', 'Speed') },
    { key: 'gap', label: L('Lupe', 'Magnifier') },
    { key: 'fit', label: L('Spiel', 'Game') },
  ],
  presets: [
    { id: 'start', label: L('Parabel', 'Parabola'), values: {} },
    { id: 'negative', label: L('h negativ', 'Negative h'), values: { h: -1.5 } },
    { id: 'cubic', label: L('Kubische Funktion', 'Cubic function'), values: { fn: 'cubic', x0: -1, h: 2 } },
    { id: 'sine', label: L('Sinus mit Ableitungsgraph', 'Sine with derivative'), values: { fn: 'sin', x0: 0.5, h: 1, trace: true } },
    { id: 'exp', label: L('e-Funktion', 'Exponential function'), values: { fn: 'exp', x0: 0, h: 1.2, tangent: true } },
    { id: 'kink', label: L('Knick bei |x|', 'Kink of |x|'), values: { fn: 'abs', x0: 0, h: 1 } },
    { id: 'zoom', label: L('Lupe an der Parabel', 'Magnifier on the parabola'), values: { mode: 'zoom', fn: 'x2', x0: 1, zl: 2 } },
    { id: 'speed', label: L('Auto: Durchschnitt und Tacho', 'Car: average and speedometer'), values: { mode: 'speed', x0: 2, h: 2, tangent: true } },
    { id: 'fit', label: L('Spiel: Tangente anlegen', 'Game: place the tangent'), values: { mode: 'fit', q: 1, mu: 0 } },
  ],
  strings: {
    de: {
      canvas:
        'Graph einer Funktion mit dem Punkt P an der Stelle x₀ und dem Punkt Q an der Stelle x₀ + h. Die Sekante durch P und Q ist durchgezogen, die Tangente in P gestrichelt. Das Steigungsdreieck zeigt h und Δy; auf Wunsch entsteht der Graph der Ableitung f′.',
      secant: 'Sekante',
      tangent: 'Tangente',
      zero: 'h = 0: Der Differenzenquotient ist nicht definiert (Division durch 0) – gezeichnet ist die Tangente.',
      zeroKink: 'h = 0: Der Differenzenquotient ist nicht definiert (Division durch 0). Hier gibt es auch keine Tangente: Der Graph hat einen Knick.',
      noTangent: 'keine (Knick)',
      kink: 'existiert nicht: Knick. Für h > 0 ist der Differenzenquotient 1, für h < 0 ist er −1.',
      derivative: 'Ableitung',
      avg: 'Durchschnittsgeschwindigkeit von {a} s bis {b} s: Δs / Δt = {ds} m / {dt} s {rel} {v} m/s',
      inst: 'Tacho bei t₀ = {t} s: v = s′(t₀) = {v} m/s',
      tacho: 'Tacho',
      avgShort: 'Durchschnitt',
      road: 'Weg in m',
      lens: 'Lupe {k}×',
      gapText: 'In der Lupe ist das Fenster {w} breit. Größter Abstand zwischen Graph und Tangente: {g}',
      gapKink: 'An einem Knick wird der Graph nie gerade – zwei Halbgeraden bleiben sichtbar.',
      fitTask: 'Aufgabe {q}: Lege die Tangente an f(x) = {f} im Punkt P an. Dreh die Gerade am Griff und tippe dann auf „Prüfen“.',
      fitGreat: 'Sehr gut! Deine Steigung {u}, exakt f′({x}) {rel} {m}.',
      fitGood: 'Gut – fast. Deine Steigung {u}, exakt f′({x}) {rel} {m}.',
      fitNo: 'Noch nicht: Deine Gerade schneidet den Graphen. Deine Steigung {u}, exakt f′({x}) {rel} {m}.',
      fitWait: 'Dreh die Gerade, bis sie den Graphen in P nur berührt.',
    },
    en: {
      canvas:
        'Graph of a function with the point P at x₀ and the point Q at x₀ + h. The secant through P and Q is a solid line, the tangent at P is dashed. The slope triangle shows h and Δy; optionally the graph of the derivative f′ is traced.',
      secant: 'Secant',
      tangent: 'Tangent',
      zero: 'h = 0: the difference quotient is undefined (division by 0) – the tangent is shown.',
      zeroKink: 'h = 0: the difference quotient is undefined (division by 0). There is no tangent here either: the graph has a kink.',
      noTangent: 'none (kink)',
      kink: 'does not exist: kink. For h > 0 the difference quotient is 1, for h < 0 it is −1.',
      derivative: 'Derivative',
      avg: 'Average speed from {a} s to {b} s: Δs / Δt = {ds} m / {dt} s {rel} {v} m/s',
      inst: 'Speedometer at t₀ = {t} s: v = s′(t₀) = {v} m/s',
      tacho: 'Speedometer',
      avgShort: 'Average',
      road: 'Distance in m',
      lens: 'Magnifier {k}×',
      gapText: 'The magnifier window is {w} wide. Largest gap between graph and tangent: {g}',
      gapKink: 'At a kink the graph never becomes straight – two half-lines remain visible.',
      fitTask: 'Task {q}: Place the tangent to f(x) = {f} at the point P. Turn the line by its handle, then tap “Check”.',
      fitGreat: 'Very good! Your slope {u}, exactly f′({x}) {rel} {m}.',
      fitGood: 'Good – almost. Your slope {u}, exactly f′({x}) {rel} {m}.',
      fitNo: 'Not yet: your line cuts the graph. Your slope {u}, exactly f′({x}) {rel} {m}.',
      fitWait: 'Turn the line until it just touches the graph at P.',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    let task: FitTask = fitTask(seededRandom(1));
    let checked: { err: number } | null = null;
    let tries = 0;
    let good = 0;
    const fnId = (): FunctionId => (p.mode === 'speed' ? 'car' : p.mode === 'fit' ? task.fn : (p.fn as FunctionId));
    const fn = () => FUNCTIONS[fnId()];
    const range = () => RANGES[fnId()];
    /** Straßenstreifen oben (Auto) in Pixeln. */
    const roadH = (h: number) => Math.max(110, Math.min(170, h * 0.3));
    const plot = new Plot(surface, {
      x: RANGES.x2.x,
      y: RANGES.x2.y,
      region: (w, h) => {
        if (p.mode === 'zoom') return wideStage(w, h) ? { x: 0, y: 0, w: Math.round(w * 0.55), h } : { x: 0, y: 0, w, h: Math.round(h * 0.5) };
        if (p.mode === 'speed') {
          const r = roadH(h);
          return { x: 0, y: r, w, h: h - r };
        }
        return { x: 0, y: 0, w, h };
      },
    });
    const lens = new Plot(surface, {
      x: [-1, 1],
      y: [-1, 1],
      pan: false,
      zoom: false,
      controls: false,
      region: (w, h) => (wideStage(w, h) ? { x: Math.round(w * 0.55) + 12, y: 12, w: w - Math.round(w * 0.55) - 24, h: h - 24 } : { x: 12, y: Math.round(h * 0.5) + 10, w: w - 24, h: h - Math.round(h * 0.5) - 20 }),
    });
    const zoomTween = new Tween(900, ease.inOutCubic);
    let zoomFrom = p.zl;
    const zoomLevel = () => (zoomTween.running ? zoomFrom + (p.zl - zoomFrom) * zoomTween.value : p.zl);
    const tr = (key: string, vars: Record<string, string | number>) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const color = {
      f: () => ctx.theme.series[0]!,
      secant: () => ctx.theme.series[3]!,
      tangent: () => ctx.theme.series[2]!,
      q: () => ctx.theme.series[1]!,
      derivative: () => ctx.theme.series[4]!,
    };
    const editable = () => !ctx.locked && !limit.running && p.mode !== 'fit';

    // Animation h → 0 (logarithmisch, damit man das Annähern sieht)
    const limit = new Tween(2600, ease.inOutCubic);
    let hFrom = 1;
    let hTo = 1;
    let animating = false;
    const hNow = (): number => {
      if (!animating) return p.h;
      const t = limit.value;
      const sign = Math.sign(hFrom) || 1;
      return sign * Math.abs(hFrom) * (Math.abs(hTo) / Math.abs(hFrom)) ** t;
    };

    const clampX0 = (x: number) => clamp(x, range().x0[0], range().x0[1]);
    plot.addHandle({
      get: () => [p.x0, fn().f(p.x0)],
      set: (x) => ctx.set({ x0: clampX0(x) }),
      axis: 'x',
      enabled: editable,
      color: color.f,
    });
    plot.addHandle({
      get: () => {
        const xq = p.x0 + hNow();
        return [xq, fn().f(xq)];
      },
      set: (x) => {
        const h = clamp(x - p.x0, -3, 3);
        ctx.set({ h: Math.abs(h) < H_MIN ? 0 : h });
      },
      axis: 'x',
      enabled: () => editable() && p.mode !== 'zoom',
      color: color.q,
    });

    // Spiel: Griff auf der eigenen Geraden (etwa 90 px rechts von P)
    const fitD = () => 90 / plot.scale.x;
    plot.addHandle({
      get: () => [task.x0 + fitD(), FUNCTIONS[task.fn].f(task.x0) + p.mu * fitD()],
      set: (x, y) => {
        const dx = x - task.x0;
        if (Math.abs(dx) < 0.05) return;
        ctx.set({ mu: clamp((y - FUNCTIONS[task.fn].f(task.x0)) / dx, -8, 8) });
      },
      enabled: () => !ctx.locked && p.mode === 'fit' && checked === null,
      color: () => ctx.theme.series[3]!,
    });

    const dec = (x: string) => (ctx.lang === 'de' ? x : x.replace(/(\d),(\d)/g, '$1.$2'));
    const num = (v: number, d = 3) => fmt.num(v, d);
    /** „=“, wenn die Zahl auf d Stellen exakt ist, sonst „≈“. */
    const eq = (v: number, d = 3) => (isExactAt(v, d) ? '=' : '≈');
    /** Negative Zahlen als Subtrahend in Klammern: 1 − (−0,77). */
    /** Gerundete Zahlen mit fester Stellenzahl (0,0099998 → „0,0100“), exakte ohne Endnullen. */
    const val = (v: number, d: number) => (isExactAt(v, d) ? num(v, d) : fmt.fixed(v, d));
    /** Negative Zahlen als Subtrahend in Klammern: 1 − (−0,77). */
    const paren = (v: number, d: number) => (val(v, d).startsWith('−') ? `(${val(v, d)})` : val(v, d));

    function fitText(): string {
      const f = FUNCTIONS[task.fn];
      if (!checked) return tr('fitTask', { q: p.q, f: dec(f.term) });
      const m = f.df(task.x0);
      const vars = { u: fmt.num(p.mu, 2), x: fmt.num(task.x0, 2), rel: eq(m, 2), m: fmt.num(m, 2) };
      return tr(checked.err <= 4 ? 'fitGreat' : checked.err <= 9 ? 'fitGood' : 'fitNo', vars);
    }
    function lensWidth(): number {
      const r = range();
      return (r.x[1] - r.x[0]) / 2 / 2 ** zoomLevel();
    }

    function updateReadouts(): void {
      for (const k of ['speed', 'gap', 'fit']) ctx.readout(k, null);
      if (p.mode === 'fit') {
        for (const k of ['dq', 'table', 'tangent']) ctx.readout(k, null);
        ctx.readout('fit', tries > 0 ? `${fitText()} (${good}/${tries})` : fitText());
        return;
      }
      if (p.mode === 'zoom') {
        const def = fn();
        ctx.readout('dq', null);
        ctx.readout('table', null);
        if (isDifferentiable(def, p.x0)) {
          const w = 2 * lensWidth();
          ctx.readout('gap', tr('gapText', { w: fmt.num(w, w < 0.1 ? 4 : 3), g: fmt.num(tangentGap(def, p.x0, w / 2), 5) }));
        } else ctx.readout('gap', ctx.t('gapKink'));
      }
      if (p.mode === 'speed') {
        const car = FUNCTIONS.car;
        const h = hNow();
        const a = Math.min(p.x0, p.x0 + h);
        const b = Math.max(p.x0, p.x0 + h);
        const ds = car.f(b) - car.f(a);
        const v = Math.abs(h) < 1e-9 ? car.df(p.x0) : ds / (b - a);
        const avg = Math.abs(h) < 1e-9 ? '' : tr('avg', { a: fmt.num(a, 2), b: fmt.num(b, 2), ds: fmt.num(ds, 3), dt: fmt.num(b - a, 3), rel: eq(v, 3), v: fmt.num(v, 3) });
        ctx.readout('speed', `${avg}${avg ? ' · ' : ''}${tr('inst', { t: fmt.num(p.x0, 2), v: fmt.num(car.df(p.x0), 2) })}`);
      }
      if (p.mode === 'zoom') {
        const f = fn();
        const d = f.df(p.x0);
        ctx.readout('tangent', {
          html: isDifferentiable(f, p.x0)
            ? `<var>f</var>′(<var>x</var>) = ${dec(f.derivative)}, &nbsp;<var>f</var>′(${num(p.x0, 2)}) ${eq(d)} <strong>${num(d)}</strong>`
            : `<var>f</var>′(${num(p.x0, 2)}) ${ctx.t('kink')}`,
        });
        return;
      }
      const f = fn();
      const h = hNow();
      const x0 = p.x0;
      const diff = isDifferentiable(f, x0);
      if (Math.abs(h) < 1e-9) {
        ctx.readout('dq', ctx.t(diff ? 'zero' : 'zeroKink'));
      } else {
        const m = differenceQuotient(f.f, x0, h);
        // Bei kleinem h unterscheiden sich die Funktionswerte erst in späteren Nachkommastellen
        const dv = Math.abs(h) < 0.01 ? 6 : Math.abs(h) < 0.1 ? 4 : 3;
        // h hat die Schrittweite 0,001: immer bis zu 3 Stellen (num lässt Endnullen weg)
        const dh = 3;
        const y1 = f.f(x0 + h);
        const y0 = f.f(x0);
        // „=“ nur, wenn alle eingesetzten Zahlen exakt sind, sonst „≈“
        const inserted = isExactAt(y1, dv) && isExactAt(y0, dv) && isExactAt(h, dh) ? '=' : '≈';
        ctx.readout('dq', {
          html:
            `<var>m</var><sub>s</sub> = <span class="frac"><span><var>f</var>(${num(x0 + h, dh + 1)}) − <var>f</var>(${num(x0, 2)})</span><span>${num(h, dh)}</span></span>` +
            ` ${inserted} <span class="frac"><span>${val(y1, dv)} − ${paren(y0, dv)}</span><span>${num(h, dh)}</span></span> ${eq(m)} <strong>${val(m, 3)}</strong>`,
        });
      }
      const sign = h < 0 ? -1 : 1;
      const rows = [1, 0.1, 0.01, 0.001]
        .map((value) => {
          const hh = sign * value;
          const current = Math.abs(Math.abs(h) - value) < value * 0.05;
          const mm = differenceQuotient(f.f, x0, hh);
          // Gerundete Werte mit fester Stellenzahl (0,99998 → „1,0000“, nicht „1“)
          const ms = isExactAt(mm, 4) ? num(mm, 4) : fmt.fixed(mm, 4);
          return `<tr${current ? ' class="is-current"' : ''}><td>${num(hh, value < 0.01 ? 3 : value < 0.1 ? 2 : 1)}</td><td>${ms}</td></tr>`;
        })
        .join('');
      ctx.readout('table', { html: `<table class="mini-table"><tr><th><var>h</var></th><th><var>m</var><sub>s</sub></th></tr>${rows}</table>` });
      const d = f.df(x0);
      ctx.readout('tangent', {
        html: diff
          ? `<var>f</var>′(<var>x</var>) = ${dec(f.derivative)}, &nbsp;<var>f</var>′(${num(x0, 2)}) ${eq(d)} <strong>${num(d)}</strong>`
          : `<var>f</var>′(${num(x0, 2)}) ${ctx.t('kink')}`,
      });
    }

    function fitRange(): void {
      const r = range();
      plot.setRange(r.x, r.y);
    }

    /* ───────────── Lupe ───────────── */

    function renderLens(): void {
      const theme = ctx.theme;
      const f = fn();
      const x0 = p.x0;
      const y0 = f.f(x0);
      const lr = lens.rect;
      const w = lensWidth();
      const wy = (w * lr.h) / Math.max(1, lr.w);
      lens.resize();
      lens.setRange([x0 - w, x0 + w], [y0 - wy, y0 + wy]);
      const g = surface.g;
      g.save();
      softShadow(g, theme.dark, 14, 3);
      roundRect(g, lr.x, lr.y, lr.w, lr.h, 14);
      g.fillStyle = theme.bg;
      g.fill();
      g.restore();
      lens.begin();
      lens.grid();
      const slope = f.df(x0);
      if (Number.isFinite(slope)) lens.line([x0, y0], [x0 + 1, y0 + slope], { color: color.tangent(), width: 3, dash: [9, 6] });
      lens.fn(f.f, { color: color.f(), width: 3.5 });
      lens.point(x0, y0, { color: color.f(), radius: 6 });
      lens.end();
      roundRect(g, lr.x, lr.y, lr.w, lr.h, 14);
      g.strokeStyle = theme.series[3]!;
      g.lineWidth = 2;
      g.stroke();
      g.font = `600 15px ${theme.font}`;
      g.fillStyle = theme.series[3]!;
      g.textAlign = 'left';
      g.textBaseline = 'top';
      g.fillText(tr('lens', { k: Math.round(2 ** zoomLevel()) }), lr.x + 12, lr.y + 10);
    }

    /* ───────────── Auto auf der Straße ───────────── */

    function drawCar(g: CanvasRenderingContext2D, x: number, y: number, col: string, alpha: number): void {
      g.save();
      g.globalAlpha = alpha;
      softShadow(g, ctx.theme.dark, 8, 2);
      roundRect(g, x - 26, y - 13, 52, 18, 6);
      g.fillStyle = col;
      g.fill();
      roundRect(g, x - 14, y - 24, 28, 13, 5);
      g.fill();
      g.restore();
      g.save();
      g.globalAlpha = alpha;
      g.fillStyle = ctx.theme.dark ? '#cfe3ff' : '#e8f1ff';
      roundRect(g, x - 10, y - 21, 9, 8, 2);
      g.fill();
      roundRect(g, x + 1, y - 21, 9, 8, 2);
      g.fill();
      g.fillStyle = ctx.theme.dark ? '#0b0f17' : '#1d2433';
      for (const wx of [x - 15, x + 15]) {
        g.beginPath();
        g.arc(wx, y + 5, 6, 0, Math.PI * 2);
        g.fill();
      }
      g.restore();
    }

    function renderRoad(h: number): void {
      const theme = ctx.theme;
      const g = surface.g;
      const W = surface.width;
      const H = roadH(surface.height);
      const car = FUNCTIONS.car;
      const narrow = W < 560;
      const dialW = narrow ? 0 : 170;
      const left = 24;
      const right = W - dialW - 24;
      const sMax = 8;
      const sx = (s: number) => left + (Math.max(0, Math.min(sMax, s)) / sMax) * (right - left);
      const roadY = H * 0.62;
      // Straße mit Markierungen
      g.fillStyle = theme.dark ? '#2a303c' : '#d9dee7';
      g.fillRect(left - 10, roadY - 4, right - left + 20, 22);
      g.strokeStyle = theme.dark ? '#c9b46a' : '#ffffff';
      g.lineWidth = 2;
      g.setLineDash([10, 10]);
      g.beginPath();
      g.moveTo(left - 10, roadY + 7);
      g.lineTo(right + 10, roadY + 7);
      g.stroke();
      g.setLineDash([]);
      g.font = `normal 11px ${theme.font}`;
      g.fillStyle = theme.muted;
      g.textAlign = 'center';
      g.textBaseline = 'top';
      for (let s = 0; s <= sMax; s += 2) {
        g.fillRect(sx(s) - 0.5, roadY + 18, 1, 6);
        g.fillText(`${s} m`, sx(s), roadY + 26);
      }
      const s0 = car.f(p.x0);
      const s1 = car.f(p.x0 + h);
      if (Math.abs(h) > 1e-9) {
        // Strecke Δs zwischen den beiden Positionen
        g.strokeStyle = color.secant();
        g.lineWidth = 3;
        g.beginPath();
        g.moveTo(sx(Math.min(s0, s1)), roadY - 34);
        g.lineTo(sx(Math.max(s0, s1)), roadY - 34);
        g.stroke();
        drawCar(g, sx(s1), roadY - 2, color.q(), 0.45);
      }
      drawCar(g, sx(s0), roadY - 2, color.f(), 1);
      if (narrow) {
        g.font = `600 13px ${theme.font}`;
        g.fillStyle = color.tangent();
        g.textAlign = 'right';
        g.textBaseline = 'top';
        g.fillText(`${ctx.t('tacho')}: ${fmt.num(car.df(p.x0), 2)} m/s`, W - 12, 8);
        return;
      }
      // Tacho rechts
      const cx = W - dialW / 2 - 10;
      const cy = H * 0.62;
      const R = Math.min(62, H * 0.45);
      const vMax = 2;
      const ang = (v: number) => Math.PI + (Math.min(vMax, Math.max(0, v)) / vMax) * Math.PI;
      g.save();
      softShadow(g, theme.dark, 10, 2);
      g.beginPath();
      g.arc(cx, cy, R + 8, Math.PI, 2 * Math.PI);
      g.closePath();
      g.fillStyle = theme.bg;
      g.fill();
      g.restore();
      g.strokeStyle = theme.grid;
      g.lineWidth = 6;
      g.beginPath();
      g.arc(cx, cy, R, Math.PI, 2 * Math.PI);
      g.stroke();
      g.font = `normal 10px ${theme.font}`;
      g.fillStyle = theme.muted;
      for (let v = 0; v <= vMax + 1e-9; v += 0.5) {
        const a = ang(v);
        g.fillText(fmt.num(v, 1), cx + Math.cos(a) * (R - 16), cy + Math.sin(a) * (R - 16) - 4);
      }
      const needle = (v: number, col: string, wdt: number) => {
        const a = ang(v);
        g.strokeStyle = col;
        g.lineWidth = wdt;
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(cx, cy);
        g.lineTo(cx + Math.cos(a) * (R - 4), cy + Math.sin(a) * (R - 4));
        g.stroke();
      };
      if (Math.abs(h) > 1e-9) needle((s1 - s0) / h, color.secant(), 2.5);
      needle(car.df(p.x0), color.tangent(), 4);
      g.fillStyle = theme.text;
      g.beginPath();
      g.arc(cx, cy, 5, 0, Math.PI * 2);
      g.fill();
      g.font = `600 12px ${theme.font}`;
      g.textAlign = 'center';
      g.textBaseline = 'top';
      g.fillStyle = color.tangent();
      g.fillText(`${ctx.t('tacho')}: ${fmt.num(car.df(p.x0), 2)} m/s`, cx, cy + 10);
      if (Math.abs(h) > 1e-9) {
        g.fillStyle = color.secant();
        g.fillText(`${ctx.t('avgShort')}: ${fmt.num((s1 - s0) / h, 2)} m/s`, cx, cy + 26);
      }
    }

    /* ───────────── Spiel: Tangente anlegen ───────────── */

    function renderFit(): void {
      const theme = ctx.theme;
      const f = FUNCTIONS[task.fn];
      const x0 = task.x0;
      const y0 = f.f(x0);
      plot.begin();
      plot.grid();
      plot.axes();
      plot.fn(f.f, { color: color.f(), width: 3 });
      const user = theme.series[3]!;
      plot.line([x0, y0], [x0 + 1, y0 + p.mu], { color: user, width: 3 });
      if (checked) {
        const m = f.df(x0);
        plot.line([x0, y0], [x0 + 1, y0 + m], { color: color.tangent(), width: 2.5, dash: [8, 6] });
      }
      plot.point(x0, y0, { color: color.f(), radius: 6 });
      plot.text(x0, y0, 'P', { color: color.f(), math: true, offset: [-12, -14], size: 16, weight: 'bold' });
      // Aufgabenkarte oben links
      const r = plot.rect;
      const g = surface.g;
      const text = fitText();
      const maxW = Math.min(460, r.w - 90);
      g.font = `600 14px ${theme.font}`;
      const words = text.split(' ');
      const lines: string[] = [];
      let line = '';
      for (const wd of words) {
        const next = line ? `${line} ${wd}` : wd;
        if (g.measureText(next).width > maxW - 20 && line) {
          lines.push(line);
          line = wd;
        } else line = next;
      }
      if (line) lines.push(line);
      const bw = Math.max(...lines.map((l) => g.measureText(l).width)) + 24;
      const bh = lines.length * 19 + 16;
      g.save();
      softShadow(g, theme.dark, 10, 2);
      roundRect(g, r.x + 8, r.y + 8, bw, bh, 10);
      g.fillStyle = theme.bg;
      g.fill();
      g.restore();
      roundRect(g, r.x + 8, r.y + 8, bw, bh, 10);
      g.strokeStyle = theme.grid;
      g.lineWidth = 1;
      g.stroke();
      const col = !checked ? theme.text : checked.err <= 4 ? theme.series[2]! : checked.err <= 9 ? theme.series[3]! : theme.series[1]!;
      g.fillStyle = col;
      g.textAlign = 'left';
      g.textBaseline = 'top';
      lines.forEach((l, i) => g.fillText(l, r.x + 20, r.y + 16 + i * 19));
      plot.end();
    }

    return {
      update(changed, source) {
        if (changed.has('q') || source === 'init' || source === 'replace') {
          task = fitTask(seededRandom(p.q * 977 + 5));
          checked = null;
        }
        if (changed.has('mu') && source === 'input' && checked) checked = null;
        if (changed.has('mode') || changed.has('q') || source === 'init' || source === 'replace') {
          fitRange();
          if (source === 'input' && clampX0(p.x0) !== p.x0) ctx.set({ x0: clampX0(p.x0) });
        }
        if (changed.has('zl') && source === 'input') {
          zoomFrom = zoomLevel();
          zoomTween.play();
        }
        if (changed.has('fn')) {
          fitRange();
          // Nur bei eigener Auswahl x₀ in den sinnvollen Bereich holen
          if (source === 'input' && clampX0(p.x0) !== p.x0) ctx.set({ x0: clampX0(p.x0) });
        }
        if ((changed.has('h') || changed.has('x0') || changed.has('fn')) && source !== 'sim') animating = false;
        updateReadouts();
      },

      action(id) {
        if (ctx.locked) return;
        if (id === 'zoomin') {
          zoomFrom = zoomLevel();
          ctx.set({ zl: p.zl >= 6 ? 0 : p.zl + 1 });
          zoomTween.play();
          ctx.requestRender();
          return;
        }
        if (id === 'check') {
          const m = FUNCTIONS[task.fn].df(task.x0);
          checked = { err: slopeAngleError(p.mu, m) };
          tries += 1;
          if (checked.err <= 9) good += 1;
          updateReadouts();
          ctx.announce(fitText());
          ctx.requestRender();
          return;
        }
        if (id === 'newq') {
          ctx.set({ q: p.q >= 999 ? 1 : p.q + 1, mu: 0 });
          return;
        }
        if (id === 'limit') {
          const h = Math.abs(p.h) < H_MIN ? 1.5 : p.h;
          hFrom = h;
          hTo = Math.sign(h) * H_MIN;
          animating = true;
          limit.play();
        } else {
          animating = false;
          limit.finish();
          ctx.set({ h: Math.sign(p.h || 1) * 1.5 });
        }
        ctx.requestRender();
      },

      resetView() {
        fitRange();
      },

      render() {
        const theme = ctx.theme;
        surface.begin();
        plot.resize();
        if (p.mode === 'fit') return renderFit();
        const f = fn();
        if (animating && !limit.running) {
          animating = false;
          ctx.set({ h: hTo });
        }
        const h = p.mode === 'zoom' ? 0 : hNow();
        const x0 = p.x0;
        const y0 = f.f(x0);
        const xq = x0 + h;
        const yq = f.f(xq);
        const isZero = Math.abs(h) < 1e-9;
        const slope = f.df(x0);
        const hasTangent = Number.isFinite(slope);
        const m = isZero ? slope : differenceQuotient(f.f, x0, h);
        const showTangent = (p.tangent || isZero) && hasTangent;

        plot.begin();
        if (p.grid) plot.grid();
        plot.axes();

        // Ableitungsgraph (bis zur aktuellen Stelle „gezeichnet“)
        if (p.trace) {
          // An Knickstellen getrennt zeichnen (keine senkrechte Verbindungslinie)
          const cuts = [plot.bounds.xMin, ...(f.kinks ?? []), plot.bounds.xMax];
          for (let i = 0; i + 1 < cuts.length; i++) {
            const a = cuts[i]!;
            const b = cuts[i + 1]!;
            plot.fn(f.df, { color: color.derivative(), width: 1.5, dash: [5, 5], alpha: 0.45, from: a, to: b });
            plot.fn(f.df, { color: color.derivative(), width: 3, from: a, to: Math.min(b, x0) });
          }
          if (hasTangent) {
            plot.point(x0, slope, { color: color.derivative(), radius: 5 });
            plot.segment([x0, y0], [x0, slope], { color: color.derivative(), width: 1, dash: [3, 4], alpha: 0.7 });
            // Links vom Punkt beschriften; passt das nicht (linker Rand), rechts – aber nur,
            // wenn dort nicht Q liegt (h < 0). Sonst entfällt die Beschriftung statt abgeschnitten zu werden.
            const nearLeft = (x0 - plot.bounds.xMin) * plot.scale.x < 90;
            if (!nearLeft || h < 0) {
              plot.text(x0, slope, `(${fmt.num(x0, 2)} | ${fmt.num(slope, 2)})`, {
                color: color.derivative(),
                offset: [nearLeft ? 10 : -10, -12],
                align: nearLeft ? 'left' : 'right',
                size: 12,
              });
            }
          }
        }

        // Beim Auto beginnt die Bewegung bei t = 0
        plot.fn(f.f, { color: color.f(), width: 3, from: p.mode === 'speed' ? 0 : undefined });

        // Steigungsdreieck
        if (p.triangle && !isZero) {
          plot.polygon(
            [
              [x0, y0],
              [xq, y0],
              [xq, yq],
            ],
            { fill: color.secant(), alpha: 0.13 },
          );
          plot.segment([x0, y0], [xq, y0], { color: color.secant(), width: 2 });
          plot.segment([xq, y0], [xq, yq], { color: color.secant(), width: 2 });
          const big = Math.abs(h) * plot.scale.x > 46;
          if (big) {
            const dh = 3;
            // Bei negativem h rechtsbündig links neben P, damit die Beschriftung P nicht überdeckt
            plot.text(h < 0 ? x0 : (x0 + xq) / 2, y0, `h ${eq(h, dh)} ${fmt.num(h, dh)}`, {
              color: color.secant(),
              offset: [h < 0 ? -14 : 0, yq >= y0 ? 14 : -14],
              align: h < 0 ? 'right' : 'center',
              size: 13,
              weight: '600',
            });
          }
          if (Math.abs(yq - y0) * plot.scale.y > 30) {
            plot.text(xq, (y0 + yq) / 2, `Δy ${eq(yq - y0, 2)} ${fmt.num(yq - y0, 2)}`, {
              color: color.secant(),
              offset: [h >= 0 ? 10 : -10, 0],
              align: h >= 0 ? 'left' : 'right',
              size: 13,
              weight: '600',
            });
          }
        }

        // Tangente (gestrichelt) und Sekante
        if (showTangent) {
          plot.line([x0, y0], [x0 + 1, y0 + slope], { color: color.tangent(), width: 2.5, dash: [8, 6] });
        }
        if (!isZero) {
          plot.line([x0, y0], [x0 + 1, y0 + m], { color: color.secant(), width: 2.5 });
        }

        // Punkte
        plot.point(x0, y0, { color: color.f(), radius: 5 });
        // P und Q auf der jeweils abgewandten Seite beschriften (auch bei negativem h)
        const side = h < 0 ? -1 : 1;
        plot.text(x0, y0, 'P', { color: color.f(), math: true, offset: [-12 * side, -14], size: 16, weight: 'bold' });
        if (!isZero) {
          plot.point(xq, yq, { color: color.q(), radius: 5 });
          plot.text(xq, yq, 'Q', { color: color.q(), math: true, offset: [12 * side, yq >= y0 ? -14 : 18], size: 16, weight: 'bold' });
        }
        // Markierungen auf der x-Achse
        plot.segment([x0, 0], [x0, y0], { color: theme.muted, width: 1, dash: [3, 4], alpha: 0.6 });
        const xName = p.mode === 'speed' ? 't₀' : 'x₀';
        plot.text(x0, 0, xName, { color: theme.muted, math: true, offset: [0, 16], size: 14 });
        if (!isZero && Math.abs(h) * plot.scale.x > 30) {
          plot.segment([xq, 0], [xq, yq], { color: theme.muted, width: 1, dash: [3, 4], alpha: 0.6 });
          plot.text(xq, 0, `${xName} + h`, { color: theme.muted, math: true, offset: [0, 16], size: 14 });
        }
        if (p.mode === 'zoom') {
          // Fenster der Lupe im großen Bild
          const lr = lens.rect;
          const w = lensWidth();
          const wy = (w * lr.h) / Math.max(1, lr.w);
          plot.polygon(
            [
              [x0 - w, y0 - wy],
              [x0 + w, y0 - wy],
              [x0 + w, y0 + wy],
              [x0 - w, y0 + wy],
            ],
            { fill: theme.series[3]!, alpha: 0.08, stroke: theme.series[3]!, width: 2 },
          );
        }

        // Legende oben links
        const r = plot.rect;
        // Legende mit Linienmuster: Sekante durchgezogen, Tangente gestrichelt (nicht nur Farbe)
        const legend: [string, string, number[]][] = [[p.mode === 'speed' ? `s(t) = ${dec(f.term)}` : `f(x) = ${dec(f.term)}`, color.f(), []]];
        if (!isZero) legend.push([`${ctx.t('secant')}: m ${eq(m)} ${fmt.num(m, 3)}`, color.secant(), []]);
        if (p.tangent || isZero) {
          legend.push([
            hasTangent ? `${ctx.t('tangent')}: m ${eq(slope)} ${fmt.num(slope, 3)}` : `${ctx.t('tangent')}: ${ctx.t('noTangent')}`,
            color.tangent(),
            [6, 4],
          ]);
        }
        // Ohne Term: Welche Funktion entsteht, sollen die Lernenden selbst erkennen (Term steht in der verdeckten Karte)
        if (p.trace) legend.push([`${ctx.t('derivative')} f′`, color.derivative(), []]);
        const g = surface.g;
        g.font = `600 14px ${theme.font}`;
        const sample = 22;
        const legendW = Math.max(...legend.map(([label]) => g.measureText(label).width)) + 28 + sample;
        g.save();
        g.globalAlpha = 0.86;
        g.fillStyle = theme.bg;
        roundRect(g, r.x + 6, r.y + 8, legendW, legend.length * 22 + 6, 8);
        g.fill();
        g.restore();
        legend.forEach(([label, c, dash], i) => {
          const y = r.y + 22 + i * 22;
          g.save();
          g.strokeStyle = c;
          g.lineWidth = 2.5;
          g.setLineDash(dash);
          g.beginPath();
          g.moveTo(r.x + 16, y);
          g.lineTo(r.x + 16 + sample, y);
          g.stroke();
          g.restore();
          plot.textPx(r.x + 24 + sample, y, label, { color: c, align: 'left', size: 14, weight: '600', halo: false });
        });
        plot.end();
        if (p.mode === 'zoom') renderLens();
        if (p.mode === 'speed') renderRoad(h);

        if (zoomTween.running) {
          updateReadouts();
          ctx.requestRender();
        }
        if (animating) {
          updateReadouts();
          ctx.requestRender();
        }
      },

      destroy: () => surface.destroy(),
    };
  },
});
