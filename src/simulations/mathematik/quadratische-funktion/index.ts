import { defineSimulation, Plot, Surface, term } from '../../../sim-core';
import {
  clampVertexForGeneral,
  discriminant,
  fitsGeneral,
  generalToVertex,
  isRounded,
  roots,
  shapeOf,
  vertexToGeneral,
  type Coefficients,
} from './model';

const L = (de: string, en: string) => ({ de, en });

/**
 * Quadratische Funktion in Scheitelpunktform f(x) = a(x − d)² + e oder in
 * allgemeiner Form f(x) = ax² + bx + c. Beim Umschalten der Form wird die
 * Parabel umgerechnet und bleibt (bis auf Rundung) gleich.
 */
export default defineSimulation({
  id: 'quadratische-funktion',
  dragHint: true,
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'form',
      type: 'choice',
      label: L('Darstellung', 'Form'),
      options: [
        { value: 'scheitel', label: L('Scheitelpunktform', 'Vertex form') },
        { value: 'allgemein', label: L('Allgemeine Form', 'Standard form') },
      ],
      default: 'scheitel',
    },
    {
      key: 'a',
      type: 'number',
      label: L('Streckfaktor a', 'Stretch factor a'),
      help: L('a > 0: nach oben geöffnet, a < 0: nach unten geöffnet', 'a > 0: opens upwards, a < 0: opens downwards'),
      min: -3,
      max: 3,
      step: 0.1,
      default: 1,
    },
    {
      key: 'd',
      type: 'number',
      label: L('Verschiebung in x-Richtung d', 'Horizontal shift d'),
      min: -8,
      max: 8,
      step: 0.1,
      default: 0,
      visibleIf: (v) => v.form === 'scheitel',
    },
    {
      key: 'e',
      type: 'number',
      label: L('Verschiebung in y-Richtung e', 'Vertical shift e'),
      min: -8,
      max: 8,
      step: 0.1,
      default: 0,
      visibleIf: (v) => v.form === 'scheitel',
    },
    {
      key: 'b',
      type: 'number',
      label: L('Koeffizient b', 'Coefficient b'),
      min: -20,
      max: 20,
      step: 0.1,
      default: 0,
      visibleIf: (v) => v.form === 'allgemein',
    },
    {
      key: 'c',
      type: 'number',
      label: L('Absolutglied c', 'Constant term c'),
      min: -20,
      max: 20,
      step: 0.1,
      default: 0,
      visibleIf: (v) => v.form === 'allgemein',
    },
    {
      key: 'notation',
      type: 'choice',
      group: 'view',
      label: L('Schreibweise der Scheitelpunktform', 'Notation of the vertex form'),
      options: [
        { value: 'minus', label: L('a(x − d)² + e', 'a(x − d)² + e') },
        { value: 'plus', label: L('a(x + d)² + e', 'a(x + d)² + e') },
      ],
      default: 'minus',
      help: L(
        'Bei „x + d“ (so in manchen Lehrplänen und Lehrwerken) verschiebt ein positives d nach links.',
        'With “x + d” (as in some curricula and textbooks), a positive d shifts the graph to the left.',
      ),
      visibleIf: (v) => v.form === 'scheitel',
    },
    { key: 'normal', type: 'boolean', group: 'view', label: L('Normalparabel y = x² zum Vergleich', 'Standard parabola y = x² for comparison'), default: true },
    { key: 'axis', type: 'boolean', group: 'view', label: L('Symmetrieachse', 'Axis of symmetry'), default: true },
    { key: 'zeros', type: 'boolean', group: 'view', label: L('Nullstellen', 'Zeros'), default: true },
    { key: 'step', type: 'boolean', group: 'view', label: L('Streckfaktor-Dreieck (1 nach rechts, a nach oben)', 'Stretch triangle (1 right, a up)'), default: false },
    { key: 'grid', type: 'boolean', group: 'view', label: L('Gitternetz', 'Grid'), default: true },
  ],
  readouts: [
    { key: 'vertexForm', label: L('Scheitelpunktform', 'Vertex form'), spoiler: true },
    { key: 'generalForm', label: L('Allgemeine Form', 'Standard form'), spoiler: true },
    { key: 'factored', label: L('Linearfaktorform', 'Factored form'), spoiler: true },
    { key: 'vertex', label: L('Scheitelpunkt', 'Vertex'), spoiler: true },
    { key: 'zeros', label: L('Nullstellen', 'Zeros'), spoiler: true },
    { key: 'disc', label: L('Diskriminante b² − 4ac', 'Discriminant b² − 4ac'), spoiler: true },
    { key: 'shape', label: L('Form der Parabel', 'Shape') },
  ],
  presets: [
    { id: 'normal', label: L('Normalparabel', 'Standard parabola'), values: {} },
    { id: 'down', label: L('Nach unten geöffnet, gestaucht', 'Opens downwards, compressed'), values: { a: -0.5, d: 1, e: 3 } },
    { id: 'shifted', label: L('Verschobene Normalparabel', 'Shifted standard parabola'), values: { d: -2, e: -3 } },
    { id: 'no-zeros', label: L('Keine Nullstellen', 'No zeros'), values: { a: 0.5, d: 1, e: 2 } },
    { id: 'double', label: L('Doppelte Nullstelle', 'Double zero'), values: { a: 2, d: 1.5, e: 0 } },
    { id: 'general', label: L('Allgemeine Form', 'Standard form'), values: { form: 'allgemein', a: 1, b: -2, c: -3 } },
  ],
  strings: {
    de: {
      canvas:
        'Koordinatensystem mit dem Graphen f der quadratischen Funktion (durchgezogene Parabel). Markiert sind der Scheitelpunkt S und die Nullstellen N1, N2 auf der x-Achse. Zum Vergleich ist die Normalparabel y = x² gestrichelt eingezeichnet, die Symmetrieachse als gestrichelte senkrechte Linie durch S. Der Scheitelpunkt S lässt sich ziehen; der hohle Punkt 1 rechts vom Scheitel lässt sich nach oben und unten ziehen und ändert den Streckfaktor a. Auf Wunsch zeigt ein Dreieck: 1 nach rechts, a nach oben.',
      rounded: 'gerundet',
      allZeros: 'jede Zahl x ist Nullstelle (f(x) = 0)',
      noParabola: 'a = 0: keine Parabel, sondern eine lineare Funktion',
      noVertex: 'keiner (a = 0)',
      up: 'nach oben geöffnet',
      down: 'nach unten geöffnet',
      stretched: 'gestreckt (|a| > 1)',
      compressed: 'gestaucht (|a| < 1)',
      normal: 'so weit wie die Normalparabel (|a| = 1)',
      none: 'keine reellen Nullstellen',
      double: 'doppelte Nullstelle',
      positive: 'positiv → zwei Nullstellen',
      zero: 'null → eine (doppelte) Nullstelle',
      negative: 'negativ → keine Nullstelle',
      noFactored: 'nicht möglich (keine reellen Nullstellen)',
    },
    en: {
      canvas:
        'Coordinate system with the graph f of the quadratic function (solid parabola). The vertex S and the zeros N1, N2 on the x-axis are marked. For comparison, the standard parabola y = x² is drawn dashed, and the axis of symmetry is a dashed vertical line through S. The vertex S can be dragged; the hollow point 1 to the right of the vertex can be dragged up and down and changes the stretch factor a. Optionally a triangle shows: 1 to the right, a up.',
      rounded: 'rounded',
      allZeros: 'every number x is a zero (f(x) = 0)',
      noParabola: 'a = 0: not a parabola but a linear function',
      noVertex: 'none (a = 0)',
      up: 'opens upwards',
      down: 'opens downwards',
      stretched: 'stretched (|a| > 1)',
      compressed: 'compressed (|a| < 1)',
      normal: 'as wide as the standard parabola (|a| = 1)',
      none: 'no real zeros',
      double: 'double zero',
      positive: 'positive → two zeros',
      zero: 'zero → one (double) zero',
      negative: 'negative → no zeros',
      noFactored: 'not possible (no real zeros)',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const plot = new Plot(surface, { x: [-8, 8], y: [-6, 8] });
    const p = ctx.params;
    const fmt = ctx.fmt;
    const editable = () => !ctx.locked;
    const colorF = () => ctx.theme.series[0]!;
    const colorVertex = () => ctx.theme.series[1]!;
    const colorZero = () => ctx.theme.series[3]!;
    const colorStep = () => ctx.theme.series[2]!;

    /** x-Koordinate des Scheitels; bei der Schreibweise „x + d“ ist sie −d. */
    const vertexX = () => (p.notation === 'plus' ? -p.d : p.d);
    /** Parameter d zu einer Scheitel-x-Koordinate (je nach Schreibweise). */
    const dFor = (x: number) => (p.notation === 'plus' ? -x : x);

    /** Aktuelle Koeffizienten und Scheitelpunkt – egal in welcher Form eingegeben. */
    function state(): Coefficients & { vertex: { d: number; e: number } | null } {
      if (p.form === 'scheitel') {
        const coefficients = vertexToGeneral(p.a, vertexX(), p.e);
        return { ...coefficients, vertex: p.a === 0 ? null : { d: vertexX(), e: p.e } };
      }
      return { a: p.a, b: p.b, c: p.c, vertex: generalToVertex(p.a, p.b, p.c) };
    }

    function moveVertex(d: number, e: number): void {
      if (p.form === 'scheitel') ctx.set({ d: dFor(d), e });
      else {
        // b und c haben feste Reglergrenzen: Scheitel auf den darstellbaren Bereich begrenzen,
        // sonst würde er beim Ziehen an eine andere Stelle springen.
        const v = clampVertexForGeneral(p.a, d, e);
        const { b, c } = vertexToGeneral(p.a, v.d, v.e);
        ctx.set({ b, c });
      }
    }

    // Scheitelpunkt ziehen
    plot.addHandle({
      get: () => {
        const v = state().vertex;
        return v ? [v.d, v.e] : [NaN, NaN];
      },
      set: (x, y) => moveVertex(x, y),
      enabled: () => editable() && p.a !== 0,
      color: colorVertex,
    });
    // Punkt „1 rechts vom Scheitel“ ziehen → ändert a
    plot.addHandle({
      get: () => {
        const v = state().vertex;
        return v ? [v.d + 1, v.e + p.a] : [NaN, NaN];
      },
      set: (_x, y) => {
        const v = state().vertex;
        if (!v) return;
        const a = Math.round((y - v.e) * 10) / 10;
        if (a === 0) return;
        if (p.form === 'scheitel') ctx.set({ a });
        else {
          if (!fitsGeneral(a, v.d, v.e)) return;
          const { b, c } = vertexToGeneral(a, v.d, v.e);
          ctx.set({ a, b, c });
        }
      },
      axis: 'y',
      enabled: () => editable() && p.a !== 0,
      color: colorStep,
    });

    const sq = term.sup(2);

    /**
     * Sichtbarer Bereich: Standard x −8 … 8, y −6 … 8. Beim Laden so erweitert, dass S und der
     * Punkt (d + 1 | e + a) mit etwas Rand im Bild sind.
     */
    let range = '';
    function fitRange(): void {
      const v = state().vertex;
      let x: [number, number] = [-8, 8];
      let y: [number, number] = [-6, 8];
      if (v) {
        const ys = [v.e, v.e + p.a];
        x = [Math.min(-8, Math.floor(v.d - 1.5)), Math.max(8, Math.ceil(v.d + 2.5))];
        y = [Math.min(-6, Math.floor(Math.min(...ys) - 1.5)), Math.max(8, Math.ceil(Math.max(...ys) + 1.5))];
      }
      const key = `${x}|${y}`;
      if (key === range) return;
      range = key;
      plot.setRange(x, y);
    }

    return {
      update(changed, source) {
        // Beim Wechsel der Darstellung umrechnen, damit die Parabel gleich bleibt – nur
        // wenn von Hand umgeschaltet wurde (Links und Beispiele bringen alle Werte mit).
        if (changed.has('form') && source === 'input') {
          if (p.form === 'allgemein') {
            const { b, c } = vertexToGeneral(p.a, vertexX(), p.e);
            ctx.set({ b, c });
          } else {
            const v = generalToVertex(p.a, p.b, p.c);
            if (v) ctx.set({ d: dFor(v.d), e: v.e });
          }
        }
        // Schreibweise gewechselt: d umdrehen, damit die Parabel bleibt
        if (changed.has('notation') && source === 'input') ctx.set({ d: -p.d });

        // Beim Laden (Start, Link, Beispiel) den y-Bereich so wählen, dass der Scheitel und der
        // Punkt „1 rechts vom Scheitel“ im Bild sind. Beim Ziehen und an den Reglern bleibt der
        // Maßstab fest, damit nichts unter dem Zeiger wegläuft.
        if (source === 'init' || source === 'replace') fitRange();

        const s = state();
        /** „f(x) = …“ oder „f(x) ≈ …“, wenn eine der Zahlen nur gerundet gezeigt wird. */
        const def = (rhs: string, ...values: number[]) => {
          const text = term.fnDef('f', rhs);
          return values.some((v) => isRounded(v)) ? text.replace(' = ', ' ≈ ') : text;
        };
        /** Linearfaktor (x − z); für z = 0 nur x. */
        const factor = (z: number) => {
          const inner = term.shifted(z, fmt);
          return inner === term.x ? term.x : `(${inner})`;
        };
        const eq = (v: number) => (isRounded(v) ? '≈' : '=');

        ctx.readout('generalForm', { html: def(term.polynomial([s.a, s.b, s.c], fmt), s.a, s.b, s.c) });

        if (s.vertex) {
          const { d, e } = s.vertex;
          const vertexTerm = term.sum([{ coef: s.a, body: `${factor(d)}${sq}` }, { coef: e, body: '' }], fmt);
          ctx.readout('vertexForm', { html: def(vertexTerm, s.a, d, e) });
          const roundedNote = isRounded(d) || isRounded(e) ? ` (${ctx.t('rounded')})` : '';
          ctx.readout('vertex', `S${fmt.point(d, e)}${roundedNote}`);
        } else {
          ctx.readout('vertexForm', ctx.t('noParabola'));
          ctx.readout('vertex', ctx.t('noVertex'));
        }

        const zs = roots(s);
        const disc = discriminant(s);
        if (s.a === 0) {
          ctx.readout('disc', null);
          ctx.readout('factored', null);
          // f(x) = bx + c; für b = c = 0 ist f die Nullfunktion
          const allZero = Math.abs(s.b) < 1e-12 && Math.abs(s.c) < 1e-12;
          ctx.readout('zeros', allZero ? ctx.t('allZeros') : zs.length ? `x₀ ${eq(zs[0]!)} ${fmt.num(zs[0]!)}` : ctx.t('none'));
          ctx.readout('shape', ctx.t('noParabola'));
          return;
        }
        ctx.readout('disc', `${fmt.num(disc)} – ${ctx.t(disc > 1e-9 ? 'positive' : disc < -1e-9 ? 'negative' : 'zero')}`);
        if (zs.length === 2) {
          ctx.readout('zeros', `x₁ ${eq(zs[0]!)} ${fmt.num(zs[0]!)}, x₂ ${eq(zs[1]!)} ${fmt.num(zs[1]!)}`);
          const factored = term.sum([{ coef: s.a, body: zs.map(factor).join('') }], fmt);
          ctx.readout('factored', { html: def(factored, s.a, ...zs) });
        } else if (zs.length === 1) {
          ctx.readout('zeros', `x₀ ${eq(zs[0]!)} ${fmt.num(zs[0]!)} (${ctx.t('double')})`);
          const factored = term.sum([{ coef: s.a, body: `${factor(zs[0]!)}${sq}` }], fmt);
          ctx.readout('factored', { html: def(factored, s.a, zs[0]!) });
        } else {
          ctx.readout('zeros', ctx.t('none'));
          ctx.readout('factored', ctx.t('noFactored'));
        }

        const shape = shapeOf(s.a);
        ctx.readout('shape', `${ctx.t(s.a > 0 ? 'up' : 'down')}, ${ctx.t(shape)}`);
      },

      render() {
        const s = state();
        const f = (x: number) => s.a * x * x + s.b * x + s.c;
        surface.begin();
        plot.begin();
        if (p.grid) plot.grid();
        plot.axes();

        if (p.normal) {
          plot.fn((x) => x * x, { color: ctx.theme.muted, width: 1.5, dash: [6, 5] });
          // Beschriftung am linken Ast, damit die Normalparabel nicht nur über Farbe/Strichart erkennbar ist
          const { xMin: x0, yMax: y1 } = plot.bounds;
          const xl = -Math.sqrt(Math.max(0, y1 - 40 / plot.scale.y));
          if (xl > x0) plot.text(xl, xl * xl, 'y = x²', { color: ctx.theme.muted, align: 'right', baseline: 'middle', offset: [-8, 0], size: 13 });
        }
        if (p.axis && s.vertex) plot.vline(s.vertex.d, { color: colorVertex(), width: 1.5, dash: [4, 5], alpha: 0.8 });

        plot.fn(f, { color: colorF(), width: 3 });

        if (p.step && s.vertex) {
          const { d, e } = s.vertex;
          const c = colorStep();
          plot.polygon(
            [
              [d, e],
              [d + 1, e],
              [d + 1, e + s.a],
            ],
            { fill: c, alpha: 0.14 },
          );
          plot.segment([d, e], [d + 1, e], { color: c, width: 2 });
          plot.segment([d + 1, e], [d + 1, e + s.a], { color: c, width: 2 });
          plot.text(d + 0.5, e, '1', { color: c, align: 'center', baseline: s.a > 0 ? 'top' : 'bottom', offset: [0, s.a > 0 ? 5 : -5], weight: '600' });
          plot.text(d + 1, e + s.a / 2, `a = ${fmt.num(s.a, 1)}`, { color: c, baseline: 'middle', offset: [8, 0], weight: '600' });
        }

        // Doppelte Nullstelle: Scheitel liegt auf der x-Achse, N und S fallen zusammen
        const zs = p.zeros ? roots(s) : [];
        const touching = zs.length === 1 && !!s.vertex;
        zs.forEach((z, i) => {
          plot.point(z, 0, { color: colorZero(), radius: 5 });
          if (touching) return;
          const name = zs.length === 1 ? 'N' : `N${i + 1}`;
          plot.text(z, 0, name, { color: colorZero(), math: true, size: 15, align: 'center', offset: [0, s.a > 0 ? 20 : -10] });
        });

        if (s.vertex) {
          const { d, e } = s.vertex;
          plot.point(d + 1, e + s.a, { color: colorStep(), radius: 4, hollow: true });
          plot.point(d, e, { color: colorVertex(), radius: 6 });
          // Auf der x-Achse (S = N) seitlich neben den Punkt, sonst überdeckt die Beschriftung die Achsenzahlen
          if (touching) plot.text(d, e, 'S = N', { color: colorVertex(), math: true, size: 17, align: 'left', offset: [12, s.a > 0 ? 22 : -10] });
          else plot.text(d, e, 'S', { color: colorVertex(), math: true, size: 17, align: 'center', offset: [0, s.a > 0 ? 24 : -12] });
        }

        // Funktionsname am Graphen (dort, wo der rechte Ast den Rand erreicht)
        const { xMin, xMax, yMin, yMax } = plot.bounds;
        const margin = 30 / plot.scale.y;
        let xLabel = xMax - 30 / plot.scale.x;
        if (s.vertex) {
          const target = s.a > 0 ? yMax - margin : yMin + margin;
          const dx = Math.sqrt(Math.max(0, (target - s.vertex.e) / s.a));
          if (dx > 0) xLabel = Math.min(xLabel, s.vertex.d + dx);
        }
        if (xLabel > xMin) plot.text(xLabel, f(xLabel), 'f', { color: colorF(), math: true, size: 18, offset: [10, 4] });
        plot.end();
      },

      resetView: () => plot.resetView(),
      destroy: () => surface.destroy(),
    };
  },
});
