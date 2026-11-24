import { defineSimulation, ease, formatPiFraction, Plot, roundRect, seededRandom, softShadow, Surface, term, Tween } from '../../../sim-core';
import { DEFAULT_VIEW, evaluate, firstPeakOffset, fitView, maxDifference, period, PI_TWELFTH, range, stageParams, targetCurve, type SineParams, type TargetCurve } from './model';

const L = (de: string, en: string) => ({ de, en });

const piDisplay = (twelfths: number) => formatPiFraction(twelfths * PI_TWELFTH) ?? '';

/** Werte sichtbar? Im Aufgabenmodus (`info=0`) sind die Regler ausgeblendet, sonst wäre die Lösung ablesbar. */
const shown = (v: Record<string, unknown>) => v.info !== false;

/**
 * Allgemeine Sinusfunktion f(x) = a · sin(b(x − c)) + d (oder mit Kosinus).
 *
 * Ziehbare Punkte: Verschiebung (c, d), Amplitude (Hochpunkt) und Periodenende.
 * Bei π-Achse wird c in Vielfachen von π/12 eingestellt, sonst dezimal.
 * Mit `info=0` (Aufgabenmodus) sind Regler, Hilfslinien und Ergebnisse verdeckt.
 */
export default defineSimulation({
  id: 'sinusfunktion',
  dragHint: true,
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Ansicht', 'View'),
      options: [
        { value: 'free', label: L('Frei einstellen', 'Free adjustment') },
        { value: 'build', label: L('Schritt für Schritt aufbauen', 'Build up step by step') },
        { value: 'match', label: L('Spiel: Kurve treffen', 'Game: match the curve') },
      ],
      default: 'free',
    },
    { key: 'step', type: 'number', label: L('Schritt', 'Step'), min: 0, max: 4, step: 1, default: 4, visibleIf: (v) => v.mode === 'build' },
    { key: 'q', type: 'number', label: L('Kurve Nr.', 'Curve no.'), min: 1, max: 999, step: 1, default: 1, visibleIf: (v) => v.mode === 'match' },
    {
      key: 'base',
      type: 'choice',
      label: L('Grundfunktion', 'Base function'),
      options: [
        { value: 'sin', label: L('Sinus', 'Sine') },
        { value: 'cos', label: L('Kosinus', 'Cosine') },
      ],
      default: 'sin',
    },
    {
      key: 'a',
      type: 'number',
      label: L('Faktor a (Amplitude |a|)', 'Factor a (amplitude |a|)'),
      help: L('a < 0 spiegelt den Graphen an der Mittellinie.', 'a < 0 reflects the graph in the midline.'),
      visibleIf: shown,
      min: -4,
      max: 4,
      step: 0.1,
      default: 1,
    },
    {
      key: 'b',
      type: 'number',
      label: L('Faktor b (Periode p = 2π/b)', 'Factor b (period p = 2π/b)'),
      min: 0.1,
      max: 4,
      step: 0.01,
      default: 1,
      visibleIf: shown,
    },
    {
      key: 'cPi',
      type: 'number',
      label: L('Verschiebung in x-Richtung c', 'Horizontal shift c'),
      min: -24,
      max: 24,
      step: 1,
      default: 0,
      display: (v) => piDisplay(v),
      visibleIf: (v) => v.piAxis === true && shown(v),
    },
    {
      key: 'c',
      type: 'number',
      label: L('Verschiebung in x-Richtung c', 'Horizontal shift c'),
      min: -8,
      max: 8,
      step: 0.05,
      default: 0,
      visibleIf: (v) => v.piAxis !== true && shown(v),
    },
    { key: 'd', type: 'number', label: L('Verschiebung in y-Richtung d', 'Vertical shift d'), min: -4, max: 4, step: 0.1, default: 0, visibleIf: shown },
    {
      key: 'notation',
      type: 'choice',
      group: 'view',
      label: L('Schreibweise', 'Notation'),
      options: [
        { value: 'minus', label: L('a · sin(b(x − c)) + d', 'a · sin(b(x − c)) + d') },
        { value: 'plus', label: L('a · sin(b(x + c)) + d', 'a · sin(b(x + c)) + d') },
      ],
      default: 'minus',
      help: L(
        'Bei „x + c“ (so in manchen Lehrplänen und Lehrwerken) verschiebt ein positives c nach links.',
        'With “x + c”, a positive c shifts the graph to the left.',
      ),
    },
    { key: 'piAxis', type: 'boolean', group: 'view', label: L('x-Achse in Vielfachen von π', 'x-axis in multiples of π'), default: true },
    { key: 'compare', type: 'boolean', group: 'view', label: L('Grundfunktion zum Vergleich', 'Base function for comparison'), default: true },
    { key: 'period', type: 'boolean', group: 'view', label: L('Periode markieren', 'Mark the period'), default: true },
    { key: 'midline', type: 'boolean', group: 'view', label: L('Mittellinie und Amplitude', 'Midline and amplitude'), default: true },
    { key: 'grid', type: 'boolean', group: 'view', label: L('Gitternetz', 'Grid'), default: true },
    {
      key: 'info',
      type: 'boolean',
      group: 'view',
      label: L('Werte und Hilfslinien zeigen', 'Show values and guides'),
      help: L(
        'Aus: Aufgabenmodus – Regler, Hilfslinien und Ergebnisse sind verdeckt, die Parameter werden am Graphen abgelesen.',
        'Off: exercise mode – sliders, guides and results are hidden; read the parameters off the graph.',
      ),
      default: true,
    },
  ],
  hint: (v) => {
    if (v.mode === 'build') return L('Tipp: „Nächster Schritt“ zeigt nacheinander, was a, b, c und d mit dem Graphen machen.', 'Tip: “Next step” shows one after the other what a, b, c and d do to the graph.');
    if (v.mode === 'match') return L('Tipp: Lies Mittellinie, Amplitude, Periode und Verschiebung an der orangen Kurve ab und stell die Regler ein – oder zieh die Punkte.', 'Tip: Read the midline, amplitude, period and shift off the orange curve and set the sliders – or drag the points.');
    return L('Tipp: Zieh den Hochpunkt, den Beginn oder das Ende der Periode.', 'Tip: Drag the maximum, the start or the end of the period.');
  },
  actions: [
    { id: 'next', label: L('Nächster Schritt', 'Next step'), primary: true, visibleIf: (v) => v.mode === 'build' },
    { id: 'newc', label: L('Neue Kurve', 'New curve'), primary: true, visibleIf: (v) => v.mode === 'match' },
    { id: 'reveal', label: L('Lösung zeigen', 'Show solution'), visibleIf: (v) => v.mode === 'match' },
  ],
  resultsParam: 'info',
  readouts: [
    { key: 'f', label: L('Funktionsgleichung', 'Equation'), spoiler: true },
    { key: 'amplitude', label: L('Amplitude', 'Amplitude'), spoiler: true },
    { key: 'period', label: L('Periode', 'Period'), spoiler: true },
    { key: 'shift', label: L('Verschiebung', 'Shift'), spoiler: true },
    { key: 'range', label: L('Wertemenge', 'Range'), spoiler: true },
    { key: 'stage', label: L('Schritt', 'Step') },
    { key: 'game', label: L('Spiel', 'Game') },
  ],
  presets: [
    { id: 'base', label: L('Sinusfunktion', 'Sine function'), values: {} },
    { id: 'amp', label: L('Amplitude 2', 'Amplitude 2'), values: { a: 2 } },
    { id: 'fast', label: L('Halbe Periode', 'Half the period'), values: { b: 2 } },
    { id: 'shift', label: L('Verschoben', 'Shifted'), values: { cPi: 6, d: 1 } },
    { id: 'cos', label: L('Kosinus = verschobener Sinus', 'Cosine = shifted sine'), values: { cPi: -6 } },
    { id: 'model', label: L('Modell: Tageslänge', 'Model: day length'), values: { piAxis: false, a: 3.8, b: 0.52, c: 2.7, d: 0.2, compare: false } },
    { id: 'build', label: L('Schritt für Schritt: 2 · sin(2(x − π/4)) + 1', 'Step by step: 2 · sin(2(x − π/4)) + 1'), values: { mode: 'build', step: 0, a: 2, b: 2, cPi: 3, d: 1 } },
    { id: 'match', label: L('Spiel: Kurve treffen', 'Game: match the curve'), values: { mode: 'match', q: 1 } },
  ],
  strings: {
    de: {
      canvas:
        'Koordinatensystem mit dem Graphen von f(x) = a · sin(b(x − c)) + d (durchgezogen) und der Grundfunktion zum Vergleich (gestrichelt). Hilfslinien: Mittellinie y = d, senkrechte Strecke für die Amplitude |a| am Hochpunkt, Klammer für die Periode p. Ziehbare Punkte: Beginn der Periode (c | d), Hochpunkt und Ende der Periode.',
      rangeSep: ';',
      reflected: 'an der Mittellinie gespiegelt (a < 0)',
      right: 'nach rechts',
      left: 'nach links',
      up: 'nach oben',
      down: 'nach unten',
      none: 'keine',
      by: 'um',
      xShift: 'in x-Richtung',
      yShift: 'in y-Richtung',
      st0: 'Schritt 0: die Grundfunktion',
      st1: 'Schritt 1: Streckung in y-Richtung mit dem Faktor a = {a}',
      st1neg: ' und Spiegelung an der x-Achse',
      st2: 'Schritt 2: Streckung in x-Richtung – die Periode wird 2π / {b} = {p}',
      st3: 'Schritt 3: Verschiebung in x-Richtung um {c} {dir}',
      st4: 'Schritt 4: Verschiebung in y-Richtung um {d} {dir}',
      stNone: ' – hier ändert sich nichts',
      matchTask: 'Kurve {q}: Stell die Regler so ein, dass deine blaue Kurve auf der orangen liegt.',
      matchClose: 'Noch {e} daneben (größte Abweichung).',
      matchOk: 'Getroffen! Die Kurven liegen aufeinander.',
      matchSol: 'Lösung: {f}',
    },
    en: {
      canvas:
        'Coordinate system with the graph of f(x) = a · sin(b(x − c)) + d (solid) and the base function for comparison (dashed). Guides: midline y = d, vertical segment for the amplitude |a| at the maximum, bracket for the period p. Draggable points: start of the period (c, d), maximum and end of the period.',
      rangeSep: ',',
      reflected: 'reflected in the midline (a < 0)',
      right: 'to the right',
      left: 'to the left',
      up: 'up',
      down: 'down',
      none: 'none',
      by: 'by',
      xShift: 'horizontally',
      yShift: 'vertically',
      st0: 'Step 0: the base function',
      st1: 'Step 1: vertical stretch by the factor a = {a}',
      st1neg: ' and reflection in the x-axis',
      st2: 'Step 2: horizontal stretch – the period becomes 2π / {b} = {p}',
      st3: 'Step 3: horizontal shift by {c} {dir}',
      st4: 'Step 4: vertical shift by {d} {dir}',
      stNone: ' – nothing changes here',
      matchTask: 'Curve {q}: set the sliders so that your blue curve lies on the orange one.',
      matchClose: 'Still {e} off (largest difference).',
      matchOk: 'Got it! The curves lie on top of each other.',
      matchSol: 'Solution: {f}',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const plot = new Plot(surface, { x: DEFAULT_VIEW.x, y: DEFAULT_VIEW.y, xAxis: { pi: true } });
    const p = ctx.params;
    const fmt = ctx.fmt;
    const editable = () => !ctx.locked && p.info && p.mode !== 'build';
    const tr = (key: string, vars: Record<string, string | number>) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const stageTween = new Tween(1100, ease.inOutCubic);
    const pop = new Tween(600, ease.outBack);
    let target: TargetCurve = targetCurve(1, seededRandom(1));
    let solved = false;
    let revealed = false;
    const targetParams = (): SineParams => ({ base: 'sin', a: target.a, b: target.b, c: target.cPi * PI_TWELFTH, d: target.d });
    const colorF = () => ctx.theme.series[0]!;
    const colorShift = () => ctx.theme.series[1]!;
    const colorAmp = () => ctx.theme.series[2]!;
    const colorPeriod = () => ctx.theme.series[4]!;

    /** Tatsächliche Verschiebung nach rechts; bei der Schreibweise „x + c“ ist sie −c. */
    const sign = () => (p.notation === 'plus' ? -1 : 1);
    const shift = () => sign() * (p.piAxis ? p.cPi * PI_TWELFTH : p.c);
    const params = (): SineParams => ({ base: p.base, a: p.a, b: p.b, c: shift(), d: p.d });
    const setShift = (x: number) =>
      p.piAxis ? ctx.set({ cPi: Math.round((sign() * x) / PI_TWELFTH) }) : ctx.set({ c: sign() * x });

    /** Verschiebung als Text: bei π-Achse als Bruchteil von π. */
    const shiftText = (value: number) => (p.piAxis ? (formatPiFraction(Math.abs(value)) ?? fmt.num(Math.abs(value))) : fmt.num(Math.abs(value)));

    // Verschiebung (c | d)
    plot.addHandle({ get: () => [shift(), p.d], set: (x, y) => { setShift(x); ctx.set({ d: y }); }, enabled: editable, color: colorShift });
    // Amplitude: Hochpunkt (bzw. Tiefpunkt bei a < 0)
    plot.addHandle({
      get: () => [shift() + firstPeakOffset(p.base, p.b), p.d + p.a],
      set: (_x, y) => ctx.set({ a: y - p.d }),
      axis: 'y',
      enabled: editable,
      color: colorAmp,
    });
    // Ende der ersten Periode
    plot.addHandle({
      get: () => [shift() + period(p.b), p.d],
      set: (x) => {
        const length = x - shift();
        if (length > 0.2) ctx.set({ b: (2 * Math.PI) / length });
      },
      axis: 'x',
      enabled: editable,
      color: colorPeriod,
    });

    function formulaFor(sp: SineParams, piShift = p.piAxis): string {
      const c = Math.round(sp.c * 1e9) / 1e9;
      const cText = (value: number) => (piShift ? (formatPiFraction(Math.abs(value)) ?? fmt.num(Math.abs(value))) : fmt.num(Math.abs(value)));
      const inner = c === 0 ? term.x : term.shifted(c, fmt, term.x, cText(c));
      const b = Math.round(sp.b * 100) / 100;
      const arg = b === 1 ? inner : `${fmt.num(b)}${c === 0 ? inner : `(${inner})`}`;
      const body = `${sp.base}(${arg})`;
      return term.fnDef('f', term.sum([{ coef: Math.round(sp.a * 100) / 100, body, dot: true }, { coef: Math.round(sp.d * 100) / 100, body: '' }], fmt));
    }
    const formula = () => formulaFor(params());

    function stageText(k: number): string {
      const sp = params();
      if (k <= 0) return ctx.t('st0');
      if (k === 1) return tr('st1', { a: fmt.num(sp.a) }) + (sp.a < 0 ? ctx.t('st1neg') : '') + (sp.a === 1 ? ctx.t('stNone') : '');
      if (k === 2) {
        const per = period(sp.b);
        const perText = p.piAxis ? (formatPiFraction(per) ?? fmt.num(per)) : fmt.num(per);
        return tr('st2', { b: fmt.num(sp.b), p: perText }) + (sp.b === 1 ? ctx.t('stNone') : '');
      }
      if (k === 3) return sp.c === 0 ? `${tr('st3', { c: '0', dir: '' }).trim()}${ctx.t('stNone')}` : tr('st3', { c: shiftText(sp.c), dir: ctx.t(sp.c > 0 ? 'right' : 'left') });
      return sp.d === 0 ? `${tr('st4', { d: '0', dir: '' }).trim()}${ctx.t('stNone')}` : tr('st4', { d: fmt.num(Math.abs(sp.d)), dir: ctx.t(sp.d > 0 ? 'up' : 'down') });
    }

    function matchError(): number {
      return maxDifference(params(), targetParams());
    }

    /** Karte oben links im Bild. */
    function card(lines: { text: string; color?: string; bold?: boolean }[]): void {
      const g = surface.g;
      const maxW = Math.min(520, surface.width - 84); // rechts Platz für die Zoom-Knöpfe
      const size = surface.width < 520 ? 13 : 15;
      const wrapped: { text: string; color?: string; bold?: boolean }[] = [];
      for (const l of lines) {
        g.font = `${l.bold ? '600' : 'normal'} ${size}px ${ctx.theme.font}`;
        let line = '';
        for (const w of l.text.split(' ')) {
          const next = line ? `${line} ${w}` : w;
          if (g.measureText(next).width > maxW - 24 && line) {
            wrapped.push({ ...l, text: line });
            line = w;
          } else line = next;
        }
        if (line) wrapped.push({ ...l, text: line });
      }
      let w = 0;
      for (const l of wrapped) {
        g.font = `${l.bold ? '600' : 'normal'} ${size}px ${ctx.theme.font}`;
        w = Math.max(w, g.measureText(l.text).width);
      }
      const h = wrapped.length * size * 1.35 + 16;
      const x = 12;
      const y = 12;
      g.save();
      softShadow(g, ctx.theme.dark, 10, 2);
      roundRect(g, x, y, w + 24, h, 10);
      g.fillStyle = ctx.theme.bg;
      g.fill();
      g.restore();
      roundRect(g, x, y, w + 24, h, 10);
      g.strokeStyle = ctx.theme.grid;
      g.lineWidth = 1;
      g.stroke();
      g.textAlign = 'left';
      g.textBaseline = 'top';
      wrapped.forEach((l, i) => {
        g.font = `${l.bold ? '600' : 'normal'} ${size}px ${ctx.theme.font}`;
        g.fillStyle = l.color ?? ctx.theme.text;
        g.fillText(l.text, x + 12, y + 8 + i * size * 1.35);
      });
    }

    return {
      update(changed, source) {
        if (changed.has('q') || source === 'init' || source === 'replace') {
          target = targetCurve(p.q, seededRandom(p.q * 6151 + 3));
          solved = false;
          revealed = false;
        }
        if (changed.has('step') && source === 'input') stageTween.play();
        // Links, Beispiele und Zurücksetzen: Ausschnitt so wählen, dass die erste Periode sichtbar ist
        if (source === 'init' || source === 'replace') {
          const view = fitView(params(), p.period && p.info);
          plot.setRange(view.x, view.y);
        }
        if (changed.has('piAxis')) {
          plot.setAxes({ x: { pi: p.piAxis } });
          // Verschiebung beim Umschalten übernehmen – nur bei Bedienung von Hand
          // (Links und Beispiele bringen alle Werte mit).
          if (source === 'input') {
            if (p.piAxis) ctx.set({ cPi: Math.round(p.c / PI_TWELFTH) });
            else ctx.set({ c: p.cPi * PI_TWELFTH });
          }
        }
        // Schreibweise gewechselt: c umdrehen, damit der Graph bleibt
        if (changed.has('notation') && source === 'input') ctx.set(p.piAxis ? { cPi: -p.cPi } : { c: -p.c });
        const c = shift();
        ctx.readout('f', { html: formula() });
        ctx.readout('amplitude', `|a| = ${fmt.num(Math.abs(p.a))}${p.a < 0 ? ` – ${ctx.t('reflected')}` : ''}`);
        const per = period(p.b);
        // 2π/b ist nie eine endliche Dezimalzahl: exakt nur als Bruchteil von π
        const perPi = p.piAxis ? formatPiFraction(per) : null;
        ctx.readout('period', `p = 2π / b ${perPi ? `= ${perPi} ≈` : '≈'} ${fmt.num(per)}`);
        const xPart = c === 0 ? `${ctx.t('xShift')}: ${ctx.t('none')}` : `${ctx.t('by')} ${shiftText(c)} ${ctx.t(c > 0 ? 'right' : 'left')}`;
        const yPart = p.d === 0 ? `${ctx.t('yShift')}: ${ctx.t('none')}` : `${ctx.t('by')} ${fmt.num(Math.abs(p.d))} ${ctx.t(p.d > 0 ? 'up' : 'down')}`;
        ctx.readout('shift', `${xPart}; ${yPart}`);
        const [lo, hi] = range(p);
        ctx.readout('range', `W = [${fmt.num(lo)}${ctx.t('rangeSep')} ${fmt.num(hi)}]`);
        ctx.readout('stage', p.mode === 'build' ? stageText(p.step) : null);
        if (p.mode === 'build') ctx.readout('f', { html: formulaFor(stageParams(params(), p.step)) });
        if (p.mode === 'match') {
          const e = matchError();
          if (e < 0.06 && !solved) {
            solved = true;
            pop.play();
            ctx.announce(ctx.t('matchOk'));
          } else if (e >= 0.06) solved = false;
          ctx.readout('game', solved ? ctx.t('matchOk') : tr('matchClose', { e: fmt.num(e, 2) }));
        } else ctx.readout('game', null);
      },

      action(id) {
        if (ctx.locked) return;
        if (id === 'next') {
          ctx.set({ step: p.step >= 4 ? 0 : p.step + 1 });
          stageTween.play();
        } else if (id === 'newc') {
          ctx.set({ q: p.q >= 999 ? 1 : p.q + 1, a: 1, b: 1, cPi: 0, c: 0, d: 0, base: 'sin' });
        } else if (id === 'reveal') {
          revealed = true;
        }
        ctx.requestRender();
      },

      render() {
        const sp = params();
        const c = sp.c;
        const per = period(sp.b);
        surface.begin();
        plot.begin();
        if (p.grid) plot.grid();
        plot.axes();

        if (p.compare && p.mode !== 'build') {
          const base = p.base === 'sin' ? Math.sin : Math.cos;
          plot.fn(base, { color: ctx.theme.muted, width: 1.5, dash: [6, 5] });
        }

        if (p.mode === 'build') {
          const k = p.step;
          // vorheriger Schritt gestrichelt, damit man die Veränderung sieht
          if (k > 0) plot.fn((x) => evaluate(stageParams(sp, k - 1), x), { color: ctx.theme.muted, width: 2, dash: [6, 5], alpha: 0.9 });
          const t = stageTween.running ? stageTween.value : 1;
          plot.fn((x) => evaluate(stageParams(sp, k, t), x), { color: colorF(), width: 3.5 });
          plot.end();
          card([{ text: stageText(k), bold: true }]);
          if (stageTween.running) ctx.requestRender();
          return;
        }

        if (p.mode === 'match') {
          plot.fn((x) => evaluate(targetParams(), x), { color: ctx.theme.series[3]!, width: 9, alpha: 0.45 });
        }

        if (p.midline && p.info) {
          plot.hline(sp.d, { color: colorShift(), width: 1.2, dash: [4, 5], alpha: 0.8 });
          const peakX = c + firstPeakOffset(sp.base, sp.b);
          plot.segment([peakX, sp.d], [peakX, sp.d + sp.a], { color: colorAmp(), width: 2 });
          plot.text(peakX, sp.d + sp.a / 2, `|a| = ${fmt.num(Math.abs(sp.a), 1)}`, { color: colorAmp(), baseline: 'middle', offset: [8, 0], weight: '600', size: 13 });
        }

        if (p.period && p.info) {
          const y = sp.d - Math.abs(sp.a) - 0.45;
          const color = colorPeriod();
          plot.segment([c, y], [c + per, y], { color, width: 2 });
          plot.segment([c, y - 0.15], [c, y + 0.15], { color, width: 2 });
          plot.segment([c + per, y - 0.15], [c + per, y + 0.15], { color, width: 2 });
          plot.vline(c + per, { color, width: 1, dash: [3, 5], alpha: 0.6 });
          const perPi = p.piAxis ? formatPiFraction(per) : null;
          const label = perPi ? `p = ${perPi}` : `p ≈ ${fmt.num(per)}`;
          plot.text(c + per / 2, y, label, { color, align: 'center', baseline: 'top', offset: [0, 6], weight: '600', size: 13 });
        }

        plot.fn((x) => evaluate(sp, x), { color: colorF(), width: 3 });

        if (p.info) {
          plot.point(c, sp.d, { color: colorShift(), radius: 5 });
          plot.point(c + firstPeakOffset(sp.base, sp.b), sp.d + sp.a, { color: colorAmp(), radius: 5 });
          plot.point(c + per, sp.d, { color: colorPeriod(), radius: 5, hollow: true });
        }
        plot.end();
        if (p.mode === 'match') {
          const lines: { text: string; color?: string; bold?: boolean }[] = [{ text: tr('matchTask', { q: p.q }), bold: true }];
          if (solved) lines.push({ text: ctx.t('matchOk'), color: ctx.theme.series[2]!, bold: true });
          else lines.push({ text: tr('matchClose', { e: fmt.num(matchError(), 2) }), color: ctx.theme.muted });
          if (solved || revealed) {
            const tf = formulaFor(targetParams(), true).replace(/<[^>]+>/g, '');
            lines.push({ text: tr('matchSol', { f: tf }), color: ctx.theme.series[3]! });
          }
          card(lines);
          if (pop.running) ctx.requestRender();
        }
      },

      resetView: () => plot.resetView(),
      destroy: () => surface.destroy(),
    };
  },
});
