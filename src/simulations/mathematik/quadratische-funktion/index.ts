import { defineSimulation, ease, Plot, roundRect, seededRandom, softShadow, Surface, term, Tween } from '../../../sim-core';
import {
  clampVertexForGeneral,
  lineIntersections,
  matchParabola,
  maxDifference,
  throwInfo,
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
      key: 'mode',
      type: 'choice',
      label: L('Ansicht', 'View'),
      options: [
        { value: 'explore', label: L('Parabel verändern', 'Change the parabola') },
        { value: 'line', label: L('Parabel und Gerade', 'Parabola and line') },
        { value: 'throw', label: L('Wurfparabel', 'Throwing a ball') },
        { value: 'match', label: L('Spiel: Parabel treffen', 'Game: match the parabola') },
      ],
      default: 'explore',
    },
    { key: 'm', type: 'number', label: L('Steigung der Geraden m', 'Slope of the line m'), min: -5, max: 5, step: 0.1, default: 1, visibleIf: (v) => v.mode === 'line' },
    { key: 'n', type: 'number', label: L('y-Achsenabschnitt n', 'y-intercept n'), min: -8, max: 8, step: 0.1, default: 2, visibleIf: (v) => v.mode === 'line' },
    { key: 'q', type: 'number', label: L('Parabel Nr.', 'Parabola no.'), min: 1, max: 999, step: 1, default: 1, visibleIf: (v) => v.mode === 'match' },
    {
      key: 'form',
      type: 'choice',
      label: L('Darstellung', 'Form'),
      options: [
        { value: 'scheitel', label: L('Scheitelpunktform', 'Vertex form') },
        { value: 'allgemein', label: L('Allgemeine Form', 'Standard form') },
      ],
      default: 'scheitel',
      visibleIf: (v) => v.mode === 'explore' || v.mode === 'line',
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
      visibleIf: (v) => v.form === 'scheitel' || v.mode === 'throw' || v.mode === 'match',
    },
    {
      key: 'e',
      type: 'number',
      label: L('Verschiebung in y-Richtung e', 'Vertical shift e'),
      min: -8,
      max: 8,
      step: 0.1,
      default: 0,
      visibleIf: (v) => v.form === 'scheitel' || v.mode === 'throw' || v.mode === 'match',
    },
    {
      key: 'b',
      type: 'number',
      label: L('Koeffizient b', 'Coefficient b'),
      min: -20,
      max: 20,
      step: 0.1,
      default: 0,
      visibleIf: (v) => v.form === 'allgemein' && (v.mode === 'explore' || v.mode === 'line'),
    },
    {
      key: 'c',
      type: 'number',
      label: L('Absolutglied c', 'Constant term c'),
      min: -20,
      max: 20,
      step: 0.1,
      default: 0,
      visibleIf: (v) => v.form === 'allgemein' && (v.mode === 'explore' || v.mode === 'line'),
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
    { key: 'normal', type: 'boolean', group: 'view', label: L('Normalparabel y = x² zum Vergleich', 'Standard parabola y = x² for comparison'), default: true, visibleIf: (v) => v.mode === 'explore' || v.mode === 'match' },
    { key: 'axis', type: 'boolean', group: 'view', label: L('Symmetrieachse', 'Axis of symmetry'), default: true },
    { key: 'zeros', type: 'boolean', group: 'view', label: L('Nullstellen', 'Zeros'), default: true },
    { key: 'step', type: 'boolean', group: 'view', label: L('Streckfaktor-Dreieck (1 nach rechts, a nach oben)', 'Stretch triangle (1 right, a up)'), default: false },
    { key: 'grid', type: 'boolean', group: 'view', label: L('Gitternetz', 'Grid'), default: true },
  ],
  hint: (v) => {
    if (v.mode === 'line') return L('Tipp: Zieh die beiden Punkte der Geraden – wie viele Schnittpunkte gibt es?', 'Tip: Drag the two points of the line – how many intersection points are there?');
    if (v.mode === 'throw') return L('Tipp: Ändere den höchsten Punkt (d | e) und a, dann tippe auf „Werfen“.', 'Tip: Change the highest point (d | e) and a, then tap “Throw”.');
    if (v.mode === 'match') return L('Tipp: Zieh den Scheitel S und den hohlen Punkt, bis deine Parabel auf der orangen liegt.', 'Tip: Drag the vertex S and the hollow point until your parabola lies on the orange one.');
    return L('Tipp: Zieh den Scheitel S oder den hohlen Punkt rechts daneben (Streckfaktor a).', 'Tip: Drag the vertex S or the hollow point to its right (stretch factor a).');
  },
  actions: [
    { id: 'throw', label: L('Werfen', 'Throw'), primary: true, visibleIf: (v) => v.mode === 'throw' },
    { id: 'newq', label: L('Neue Parabel', 'New parabola'), primary: true, visibleIf: (v) => v.mode === 'match' },
    { id: 'reveal', label: L('Lösung zeigen', 'Show solution'), visibleIf: (v) => v.mode === 'match' },
  ],
  readouts: [
    { key: 'task', label: L('Aufgabe', 'Task') },
    { key: 'line', label: L('Parabel und Gerade', 'Parabola and line'), spoiler: true },
    { key: 'throwInfo', label: L('Wurf', 'Throw'), spoiler: true },
    { key: 'game', label: L('Spiel', 'Game') },
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
    { id: 'line', label: L('Parabel und Gerade', 'Parabola and line'), values: { mode: 'line', a: 1, d: 0, e: 0, m: 1, n: 2 } },
    { id: 'throw', label: L('Wurfparabel', 'Throwing a ball'), values: { mode: 'throw', a: -0.1, d: 6, e: 5 } },
    { id: 'match', label: L('Spiel: Parabel treffen', 'Game: match the parabola'), values: { mode: 'match', q: 1, a: 1, d: 0, e: 0 } },
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
      secant: 'zwei Schnittpunkte – die Gerade ist eine Sekante',
      tangent: 'ein Berührpunkt – die Gerade ist eine Tangente',
      passant: 'kein gemeinsamer Punkt – die Gerade ist eine Passante',
      lineEq: 'Gleichsetzen: {lhs} = {rhs} ⇒ {diff} = 0, Diskriminante {D}',
      throwTask: 'Ein Ball wird bei x = 0 aus der Höhe {h} m abgeworfen und fliegt auf der Parabel h(x) = a(x − d)² + e.',
      throwRes: 'Höchster Punkt {top}, Landung nach {land} m',
      throwNoLand: 'Der Ball landet nicht – wähle a < 0 und e > 0.',
      ground: 'Boden',
      highest: 'höchster Punkt',
      landing: 'Landung',
      matchTask: 'Parabel {q}: Stell a, d und e so ein, dass deine blaue Parabel auf der orangen liegt.',
      matchClose: 'Noch {e} daneben (größte Abweichung zwischen −6 und 6).',
      matchOk: 'Getroffen! Die Parabeln liegen aufeinander.',
      matchSol: 'Lösung: f(x) = {f}',
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
      secant: 'two intersection points – the line is a secant',
      tangent: 'one point of contact – the line is a tangent',
      passant: 'no common point – the line misses the parabola',
      lineEq: 'Setting equal: {lhs} = {rhs} ⇒ {diff} = 0, discriminant {D}',
      throwTask: 'A ball is thrown at x = 0 from a height of {h} m and flies along the parabola h(x) = a(x − d)² + e.',
      throwRes: 'Highest point {top}, lands after {land} m',
      throwNoLand: 'The ball does not land – choose a < 0 and e > 0.',
      ground: 'ground',
      highest: 'highest point',
      landing: 'landing',
      matchTask: 'Parabola {q}: set a, d and e so that your blue parabola lies on the orange one.',
      matchClose: 'Still {e} off (largest difference between −6 and 6).',
      matchOk: 'Got it! The parabolas lie on top of each other.',
      matchSol: 'Solution: f(x) = {f}',
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
    const vertexMode = () => p.form === 'scheitel' || p.mode === 'throw' || p.mode === 'match';
    function state(): Coefficients & { vertex: { d: number; e: number } | null } {
      if (vertexMode()) {
        const coefficients = vertexToGeneral(p.a, vertexX(), p.e);
        return { ...coefficients, vertex: p.a === 0 ? null : { d: vertexX(), e: p.e } };
      }
      return { a: p.a, b: p.b, c: p.c, vertex: generalToVertex(p.a, p.b, p.c) };
    }

    function moveVertex(d: number, e: number): void {
      if (vertexMode()) ctx.set({ d: dFor(d), e });
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
        if (vertexMode()) ctx.set({ a });
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
    const tr = (key: string, vars: Record<string, string | number>) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));

    /* ---- Parabel und Gerade: zwei ziehbare Punkte der Geraden (x = −2 und x = 2) ---- */
    const colorLine = () => ctx.theme.series[4]!;
    plot.addHandle({
      get: () => [-2, -2 * p.m + p.n],
      set: (_x, y) => {
        const y2 = 2 * p.m + p.n;
        ctx.set({ m: (y2 - y) / 4, n: (y + y2) / 2 });
      },
      axis: 'y',
      enabled: () => editable() && p.mode === 'line',
      color: colorLine,
    });
    plot.addHandle({
      get: () => [2, 2 * p.m + p.n],
      set: (_x, y) => {
        const y1 = -2 * p.m + p.n;
        ctx.set({ m: (y - y1) / 4, n: (y + y1) / 2 });
      },
      axis: 'y',
      enabled: () => editable() && p.mode === 'line',
      color: colorLine,
    });

    /* ---- Wurf: Ball fliegt (Fortschritt 0 … 1 bis zur Landung) ---- */
    const flight = new Tween(1800, ease.linear);
    let flown = false;

    /* ---- Spiel ---- */
    let target = matchParabola(1, seededRandom(1));
    let solved = false;
    let revealed = false;
    const pop = new Tween(500, ease.outBack);
    const targetCoef = () => vertexToGeneral(target.a, target.d, target.e);

    function card(lines: { text: string; color?: string; bold?: boolean }[]): void {
      const g = surface.g;
      const r = plot.rect;
      const size = surface.width < 520 ? 13 : 15;
      const maxW = Math.min(500, r.w - 90);
      const out: { text: string; color?: string; bold?: boolean }[] = [];
      for (const l of lines) {
        g.font = `${l.bold ? '600' : 'normal'} ${size}px ${ctx.theme.font}`;
        let line = '';
        for (const w of l.text.split(' ')) {
          const next = line ? `${line} ${w}` : w;
          if (g.measureText(next).width > maxW - 24 && line) {
            out.push({ ...l, text: line });
            line = w;
          } else line = next;
        }
        if (line) out.push({ ...l, text: line });
      }
      let w = 0;
      for (const l of out) {
        g.font = `${l.bold ? '600' : 'normal'} ${size}px ${ctx.theme.font}`;
        w = Math.max(w, g.measureText(l.text).width);
      }
      const h = out.length * size * 1.35 + 16;
      g.save();
      softShadow(g, ctx.theme.dark, 10, 2);
      roundRect(g, r.x + 10, r.y + 10, w + 24, h, 10);
      g.fillStyle = ctx.theme.bg;
      g.fill();
      g.restore();
      roundRect(g, r.x + 10, r.y + 10, w + 24, h, 10);
      g.strokeStyle = ctx.theme.grid;
      g.lineWidth = 1;
      g.stroke();
      g.textAlign = 'left';
      g.textBaseline = 'top';
      out.forEach((l, i) => {
        g.font = `${l.bold ? '600' : 'normal'} ${size}px ${ctx.theme.font}`;
        g.fillStyle = l.color ?? ctx.theme.text;
        g.fillText(l.text, r.x + 22, r.y + 18 + i * size * 1.35);
      });
    }

    /**
     * Sichtbarer Bereich: Standard x −8 … 8, y −6 … 8. Beim Laden so erweitert, dass S und der
     * Punkt (d + 1 | e + a) mit etwas Rand im Bild sind.
     */
    let range = '';
    function fitRange(): void {
      if (p.mode === 'throw') {
        const key = 'throw';
        if (key === range) return;
        range = key;
        plot.setRange([-2, 16], [-1.5, 9]);
        return;
      }
      if (p.mode === 'match') {
        const key = 'match';
        if (key === range) return;
        range = key;
        plot.setRange([-8, 8], [-6, 8]);
        return;
      }
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

    function modeReadouts(): void {
      for (const k of ['task', 'line', 'throwInfo', 'game']) ctx.readout(k, null);
      const s = state();
      if (p.mode === 'line') {
        const { xs, disc } = lineIntersections(s, p.m, p.n);
        const kind = xs.length === 2 ? 'secant' : xs.length === 1 ? 'tangent' : 'passant';
        const lhs = term.polynomial([s.a, s.b, s.c], fmt).replace(/<[^>]+>/g, '');
        const rhs = term.polynomial([0, p.m, p.n], fmt).replace(/<[^>]+>/g, '');
        const diff = term.polynomial([s.a, s.b - p.m, s.c - p.n], fmt).replace(/<[^>]+>/g, '');
        const pts = xs.map((x) => fmt.point(x, p.m * x + p.n)).join(', ');
        ctx.readout('line', `${tr('lineEq', { lhs, rhs, diff, D: fmt.num(disc) })}. ${ctx.t(kind)}${pts ? `: ${pts}` : ''}`);
      } else if (p.mode === 'throw') {
        const t = throwInfo(p.a, vertexX(), p.e);
        ctx.readout('task', tr('throwTask', { h: fmt.num(t.start) }));
        ctx.readout('throwInfo', t.land === null || p.a >= 0 ? ctx.t('throwNoLand') : tr('throwRes', { top: fmt.point(t.top.x, t.top.y), land: fmt.num(t.land) }));
      } else if (p.mode === 'match') {
        const e = maxDifference(s, targetCoef());
        if (e < 0.06 && !solved) {
          solved = true;
          pop.play();
          ctx.announce(ctx.t('matchOk'));
        } else if (e >= 0.06) solved = false;
        ctx.readout('task', tr('matchTask', { q: p.q }));
        ctx.readout('game', solved ? ctx.t('matchOk') : tr('matchClose', { e: fmt.num(e, 2) }));
      }
    }

    function targetText(): string {
      const factor = (z: number) => {
        const inner = term.shifted(z, fmt);
        return inner === term.x ? term.x : `(${inner})`;
      };
      return term.sum([{ coef: target.a, body: `${factor(target.d)}${sq}` }, { coef: target.e, body: '' }], fmt).replace(/<[^>]+>/g, '');
    }

    function drawThrow(): void {
      const s = state();
      const f = (x: number) => s.a * x * x + s.b * x + s.c;
      const t = throwInfo(p.a, vertexX(), p.e);
      const g = surface.g;
      const bd = plot.bounds;
      // Rasen
      plot.polygon([[bd.xMin, 0], [bd.xMax, 0], [bd.xMax, bd.yMin], [bd.xMin, bd.yMin]], { fill: ctx.theme.dark ? '#2f5a35' : '#7cc47f', alpha: 0.8 });
      plot.segment([bd.xMin, 0], [bd.xMax, 0], { color: ctx.theme.dark ? '#3c6b42' : '#4e9a52', width: 2 });
      // Strichmännchen bei x = 0, Hand in Abwurfhöhe
      const hand = Math.max(0.3, t.start);
      const ink = ctx.theme.text;
      const head = Math.max(0.6, hand + 0.35);
      plot.circle(-0.55, head, 0.28, { stroke: ink, width: 2.5 });
      plot.segment([-0.55, head - 0.28], [-0.55, Math.max(0.9, head - 1.2)], { color: ink, width: 2.5 });
      plot.segment([-0.55, Math.max(0.9, head - 1.2)], [-0.9, 0], { color: ink, width: 2.5 });
      plot.segment([-0.55, Math.max(0.9, head - 1.2)], [-0.2, 0], { color: ink, width: 2.5 });
      plot.segment([-0.55, head - 0.6], [0, hand], { color: ink, width: 2.5 });
      const end = t.land ?? bd.xMax;
      // Flugbahn (nur zwischen Abwurf und Landung)
      plot.fn(f, { color: colorF(), width: 2, dash: [6, 5], alpha: 0.6, from: 0, to: end });
      const prog = flight.running ? flight.value : flown ? 1 : 0;
      const xb = prog * end;
      if (prog > 0) plot.fn(f, { color: colorF(), width: 3.5, from: 0, to: xb });
      // höchster Punkt und Landung
      if (p.a < 0 && t.top.x > 0) {
        plot.segment([t.top.x, 0], [t.top.x, t.top.y], { color: colorVertex(), width: 1.5, dash: [4, 4] });
        plot.point(t.top.x, t.top.y, { color: colorVertex(), radius: 6 });
        if (p.zeros) plot.text(t.top.x, t.top.y, `${ctx.t('highest')} ${fmt.point(t.top.x, t.top.y)}`, { color: colorVertex(), size: 13, weight: '600', align: 'center', offset: [0, -14] });
      }
      if (t.land !== null && p.a < 0) {
        plot.point(t.land, 0, { color: colorZero(), radius: 6 });
        if (p.zeros) plot.text(t.land, 0, `${ctx.t('landing')}: ${fmt.num(t.land)} m`, { color: colorZero(), size: 13, weight: '600', align: 'center', baseline: 'top', offset: [0, 10] });
      }
      // Ball
      const bx = prog > 0 ? xb : 0;
      const by = prog > 0 ? Math.max(0, f(xb)) : t.start;
      const [px, py] = plot.toPx(bx, by);
      g.save();
      softShadow(g, ctx.theme.dark, 6, 2);
      g.fillStyle = ctx.theme.series[3]!;
      g.beginPath();
      g.arc(px, py - 7, 7, 0, Math.PI * 2);
      g.fill();
      g.restore();
      plot.text(0, t.start, `${fmt.num(t.start)} m`, { color: ctx.theme.muted, size: 12, align: 'left', baseline: 'middle', offset: [12, 0] });
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
        if (changed.has('q') || source === 'init' || source === 'replace') {
          target = matchParabola(p.q, seededRandom(p.q * 4421 + 9));
          solved = false;
          revealed = false;
        }
        if (changed.has('mode')) {
          range = '';
          fitRange();
          flown = false;
          flight.finish();
        }
        modeReadouts();

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

      action(id) {
        if (ctx.locked) return;
        if (id === 'throw') {
          flown = true;
          flight.play();
        } else if (id === 'newq') {
          ctx.set({ q: p.q >= 999 ? 1 : p.q + 1, a: 1, d: 0, e: 0 });
        } else if (id === 'reveal') {
          revealed = true;
        }
        ctx.requestRender();
      },

      render() {
        const s = state();
        const f = (x: number) => s.a * x * x + s.b * x + s.c;
        surface.begin();
        plot.begin();
        if (p.grid) plot.grid();
        plot.axes();
        if (p.mode === 'throw') {
          drawThrow();
          plot.end();
          if (flight.running) ctx.requestRender();
          return;
        }
        if (p.mode === 'match') plot.fn((x) => {
          const t = targetCoef();
          return t.a * x * x + t.b * x + t.c;
        }, { color: ctx.theme.series[3]!, width: 10, alpha: 0.42 });
        if (p.mode === 'line') {
          plot.line([-2, -2 * p.m + p.n], [2, 2 * p.m + p.n], { color: colorLine(), width: 2.5 });
          const { xs } = lineIntersections(s, p.m, p.n);
          xs.forEach((x) => {
            plot.point(x, p.m * x + p.n, { color: colorLine(), radius: 7, hollow: true });
            if (p.zeros) plot.text(x, p.m * x + p.n, fmt.point(x, p.m * x + p.n), { color: colorLine(), size: 13, weight: '600', align: 'left', offset: [10, -10] });
          });
        }

        if (p.normal && (p.mode === 'explore' || p.mode === 'match')) {
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
        if (p.mode === 'match') {
          const lines: { text: string; color?: string; bold?: boolean }[] = [{ text: tr('matchTask', { q: p.q }), bold: true }];
          const e = maxDifference(s, targetCoef());
          lines.push(solved ? { text: ctx.t('matchOk'), color: ctx.theme.series[2]!, bold: true } : { text: tr('matchClose', { e: fmt.num(e, 2) }), color: ctx.theme.muted });
          if (solved || revealed) lines.push({ text: tr('matchSol', { f: targetText() }), color: ctx.theme.series[3]! });
          card(lines);
          if (pop.running) ctx.requestRender();
        } else if (p.mode === 'line') {
          const { xs } = lineIntersections(s, p.m, p.n);
          card([{ text: ctx.t(xs.length === 2 ? 'secant' : xs.length === 1 ? 'tangent' : 'passant'), bold: true, color: colorLine() }]);
        }
      },

      resetView: () => plot.resetView(),
      destroy: () => surface.destroy(),
    };
  },
});
