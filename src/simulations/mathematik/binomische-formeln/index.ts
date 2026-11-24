import { defineSimulation, ease, Plot, roundRect, seededRandom, shade, softShadow, Surface, TapTarget, Tween, withAlpha, type Rect } from '../../../sim-core';
import { completeSquare, expand, mentalProduct, mentalSquare, piecesFirst, termQuiz, type Formula, type TermQuiz } from './model';

const L = (de: string, en: string) => ({ de, en });
type Pt = [number, number];

/**
 * Binomische Formeln am Quadrat: Das Quadrat wird in Teilflächen zerlegt
 * (Animation). Bei der dritten Formel wird ein Streifen gedreht und angelegt,
 * sodass aus a² − b² ein Rechteck (a + b)(a − b) entsteht.
 */
export default defineSimulation({
  id: 'binomische-formeln',
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Thema', 'Topic'),
      options: [
        { value: 'area', label: L('Flächenmodell', 'Area model') },
        { value: 'mental', label: L('Kopfrechnen mit Formeln', 'Mental arithmetic') },
        { value: 'complete', label: L('Quadratische Ergänzung', 'Completing the square') },
        { value: 'quiz', label: L('Üben: Welcher Term passt?', 'Practice: which term fits?') },
      ],
      default: 'area',
    },
    {
      key: 'mk',
      type: 'choice',
      label: L('Rechnung', 'Calculation'),
      options: [
        { value: 'sq', label: L('Quadratzahl, z. B. 49²', 'Square, e.g. 49²') },
        { value: 'prod', label: L('Produkt, z. B. 52 · 48', 'Product, e.g. 52 · 48') },
      ],
      default: 'sq',
      visibleIf: (v) => v.mode === 'mental',
    },
    { key: 'n', type: 'number', label: L('Zahl n', 'Number n'), min: 11, max: 99, step: 1, default: 49, visibleIf: (v) => v.mode === 'mental' && v.mk === 'sq' },
    { key: 'r', type: 'number', label: L('Zehnerzahl in der Mitte', 'Round number in the middle'), min: 10, max: 90, step: 10, default: 50, visibleIf: (v) => v.mode === 'mental' && v.mk === 'prod' },
    { key: 'dd', type: 'number', label: L('Abstand d', 'Distance d'), min: 1, max: 9, step: 1, default: 2, visibleIf: (v) => v.mode === 'mental' && v.mk === 'prod' },
    { key: 'pc', type: 'number', label: L('Koeffizient p in x² + px + q', 'Coefficient p in x² + px + q'), min: -8, max: 8, step: 1, default: 6, visibleIf: (v) => v.mode === 'complete' },
    { key: 'qc', type: 'number', label: L('Konstante q', 'Constant q'), min: -10, max: 10, step: 1, default: 5, visibleIf: (v) => v.mode === 'complete' },
    { key: 'q', type: 'number', label: L('Aufgabe Nr.', 'Task no.'), min: 1, max: 999, step: 1, default: 1, visibleIf: (v) => v.mode === 'quiz' },
    {
      key: 'formula',
      type: 'choice',
      label: L('Formel', 'Formula'),
      options: [
        { value: '1', label: L('(a + b)²', '(a + b)²') },
        { value: '2', label: L('(a − b)²', '(a − b)²') },
        { value: '3', label: L('(a + b)(a − b)', '(a + b)(a − b)') },
      ],
      default: '1',
      visibleIf: (v) => v.mode === 'area',
    },
    { key: 'a', type: 'number', label: L('Seitenlänge a', 'Side length a'), min: 1, max: 10, step: 0.5, default: 5, visibleIf: (v) => v.mode === 'area' },
    { key: 'b', type: 'number', label: L('Seitenlänge b', 'Side length b'), min: 0.5, max: 6, step: 0.5, default: 2, visibleIf: (v) => v.mode === 'area' },
    { key: 'numbers', type: 'boolean', group: 'view', label: L('Zahlenwerte einsetzen', 'Show numerical values'), default: true },
    { key: 'grid', type: 'boolean', group: 'view', label: L('Kästchen (Einheitsquadrate)', 'Unit squares'), default: true, visibleIf: (v) => v.mode === 'area' },
  ],
  hint: (v) => {
    if (v.mode === 'mental') return L('Tipp: Stell eine Zahl nahe an einer Zehnerzahl ein – die Skizze zeigt, welche Teilflächen du im Kopf rechnest.', 'Tip: Choose a number close to a round number – the sketch shows which parts you work out in your head.');
    if (v.mode === 'complete') return L('Tipp: Drück „Ergänzen“ – ein Streifen wandert nach oben, und das fehlende Eckquadrat macht das große Quadrat voll.', 'Tip: Press “Complete” – one strip moves to the top, and the missing corner square completes the large square.');
    if (v.mode === 'quiz') return L('Tipp: Tippe auf die richtige Antwort – mit der Tastatur: Pfeiltasten und Eingabe.', 'Tip: Tap the correct answer – with the keyboard: arrow keys and Enter.');
    return null;
  },
  resultsParam: 'numbers',
  actions: [
    { id: 'toggle', label: L('Zerlegen', 'Split apart'), primary: true, visibleIf: (v) => v.mode === 'area' },
    { id: 'fill', label: L('Ergänzen', 'Complete'), primary: true, visibleIf: (v) => v.mode === 'complete' },
    { id: 'newq', label: L('Neue Aufgabe', 'New task'), primary: true, visibleIf: (v) => v.mode === 'quiz' },
  ],
  readouts: [
    { key: 'formula', label: L('Formel', 'Formula') },
    { key: 'numbers', label: L('Mit Zahlen', 'With numbers'), spoiler: true },
    { key: 'hint', label: L('Hinweis', 'Note') },
    { key: 'calc', label: L('Rechnung', 'Calculation'), spoiler: true },
    { key: 'task', label: L('Aufgabe', 'Task') },
    { key: 'fb', label: L('Rückmeldung', 'Feedback') },
  ],
  presets: [
    { id: 'first', label: L('1. Formel', '1st formula'), values: {} },
    { id: 'second', label: L('2. Formel', '2nd formula'), values: { formula: '2', a: 6, b: 2 } },
    { id: 'third', label: L('3. Formel', '3rd formula'), values: { formula: '3', a: 6, b: 2 } },
    { id: 'big', label: L('a = 8, b = 3', 'a = 8, b = 3'), values: { a: 8, b: 3 } },
    { id: 'mental', label: L('Kopfrechnen: 49²', 'Mental: 49²'), values: { mode: 'mental', mk: 'sq', n: 49 } },
    { id: 'prod', label: L('Kopfrechnen: 52 · 48', 'Mental: 52 · 48'), values: { mode: 'mental', mk: 'prod', r: 50, dd: 2 } },
    { id: 'complete', label: L('x² + 6x + 5 ergänzen', 'Complete x² + 6x + 5'), values: { mode: 'complete', pc: 6, qc: 5 } },
    { id: 'quiz', label: L('Üben: Welcher Term passt?', 'Practice: which term fits?'), values: { mode: 'quiz', q: 1 } },
  ],
  strings: {
    de: {
      canvas: 'Flächenmodell der binomischen Formeln: Quadrate und Rechtecke mit den Seitenlängen a und b, die zerlegt oder umgelegt werden',
      split: 'Zerlegen',
      join: 'Zusammensetzen',
      rotate: 'Streifen umlegen',
      back: 'Zurücklegen',
      needAB: 'Das Flächenmodell braucht a > b.',
      stillValid: 'Die Formel gilt trotzdem.',
      needABHint: 'Das Flächenmodell funktioniert hier nur für a > b. Die Formel selbst gilt für alle Zahlen – das zeigt die Rechnung mit Zahlen.',
      hint1: 'Das große Quadrat hat die Seitenlänge a + b. Es besteht aus a², b² und zwei Rechtecken a · b.',
      hint2: 'Von a² werden zwei Streifen a · b abgezogen. Das kleine Quadrat b² wird dabei doppelt abgezogen und muss einmal wieder dazu.',
      hint3: 'Nimm von a² das Quadrat b² weg. Der übrige Streifen lässt sich so umlegen, dass ein Rechteck mit den Seiten a + b und a − b entsteht.',
      removed: 'wird entfernt',
      twice: 'doppelt abgezogen',
      sketch: 'Skizze, nicht maßstäblich',
      negP: 'Bild mit |p|; bei p < 0 steht in der Klammer ein Minus.',
      mSqPlus: '{n}² = ({r} + {d})² = {r}² + 2 · {r} · {d} + {d}² = {r2} + {rd} + {d2} = {res}',
      mSqMinus: '{n}² = ({r} − {d})² = {r}² − 2 · {r} · {d} + {d}² = {r2} − {rd} + {d2} = {res}',
      mSqZero: '{n}² = {res} – {n} ist schon eine Zehnerzahl.',
      mProd: '{x} · {y} = ({r} + {d})({r} − {d}) = {r}² − {d}² = {r2} − {d2} = {res}',
      fill: 'Ergänzen',
      unfill: 'Zurück',
      addCorner: '+ ({h})² ergänzen',
      cStep1: 'x² {sp} {pa}x {sq} {qa}',
      cStep2: '= x² {sp} {pa}x + {h2} − {h2} {sq} {qa}',
      cStep3: '= (x {sp} {h})² {sy}',
      cVertex: 'Scheitelpunkt S({sx} | {syv})',
      cHint: 'Die Hälfte von p, also {h}, quadrieren, addieren und gleich wieder abziehen.',
      qExpand: 'Aufgabe {q}: Multipliziere aus.',
      qFactor: 'Aufgabe {q}: Schreibe als Produkt.',
      tapMsg: 'Tippe auf die richtige Antwort.',
      ok: 'Richtig!',
      no: 'Leider nicht. Die richtige Antwort ist grün markiert.',
      middle: 'Hier fehlt das gemischte Glied 2 · a · b.',
      double: 'Das gemischte Glied muss verdoppelt werden: 2 · a · b.',
      square: 'Der Faktor vor x bzw. die Zahl muss mit quadriert werden.',
      sign: 'Achte auf das Vorzeichen: Bei (a − b)² steht am Ende + b², bei (a + b)(a − b) steht − b².',
      formula: 'Das ist eine andere binomische Formel.',
      score: '{r} von {n} richtig',
      option: 'Antwort {k}: {t}',
    },
    en: {
      canvas: 'Area model of the binomial formulas: squares and rectangles with side lengths a and b that are split apart or rearranged',
      split: 'Split apart',
      join: 'Put together',
      rotate: 'Move the strip',
      back: 'Move back',
      needAB: 'The area model needs a > b.',
      stillValid: 'The formula still holds.',
      needABHint: 'The area model only works for a > b here. The formula itself holds for all numbers – see the calculation with numbers.',
      hint1: 'The large square has side length a + b. It consists of a², b² and two rectangles a · b.',
      hint2: 'Two strips a · b are removed from a². The small square b² is removed twice, so it has to be added back once.',
      hint3: 'Remove the square b² from a². The remaining strip can be moved so that a rectangle with sides a + b and a − b is formed.',
      removed: 'is removed',
      twice: 'removed twice',
      sketch: 'Sketch, not to scale',
      negP: 'Picture uses |p|; for p < 0 the bracket contains a minus.',
      mSqPlus: '{n}² = ({r} + {d})² = {r}² + 2 · {r} · {d} + {d}² = {r2} + {rd} + {d2} = {res}',
      mSqMinus: '{n}² = ({r} − {d})² = {r}² − 2 · {r} · {d} + {d}² = {r2} − {rd} + {d2} = {res}',
      mSqZero: '{n}² = {res} – {n} is already a multiple of ten.',
      mProd: '{x} · {y} = ({r} + {d})({r} − {d}) = {r}² − {d}² = {r2} − {d2} = {res}',
      fill: 'Complete',
      unfill: 'Back',
      addCorner: '+ ({h})² added',
      cStep1: 'x² {sp} {pa}x {sq} {qa}',
      cStep2: '= x² {sp} {pa}x + {h2} − {h2} {sq} {qa}',
      cStep3: '= (x {sp} {h})² {sy}',
      cVertex: 'Vertex S({sx}, {syv})',
      cHint: 'Square half of p, that is {h}, add it and subtract it again straight away.',
      qExpand: 'Task {q}: Multiply out.',
      qFactor: 'Task {q}: Write as a product.',
      tapMsg: 'Tap the correct answer.',
      ok: 'Correct!',
      no: 'Not quite. The correct answer is marked in green.',
      middle: 'The middle term 2 · a · b is missing here.',
      double: 'The middle term has to be doubled: 2 · a · b.',
      square: 'The factor in front of x or the number has to be squared too.',
      sign: 'Watch the sign: (a − b)² ends with + b², (a + b)(a − b) ends with − b².',
      formula: 'That is a different binomial formula.',
      score: '{r} of {n} correct',
      option: 'Answer {k}: {t}',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const plot = new Plot(surface, {
      x: [-1, 9],
      y: [-1, 9],
      pan: false,
      zoom: false,
      region: (w, h) => {
        if (p.mode !== 'mental' && p.mode !== 'complete') return { x: 0, y: 0, w, h };
        if (w >= 640 || w > h * 1.3) return { x: 0, y: 0, w: Math.round(w * 0.56), h };
        return { x: 0, y: 0, w, h: Math.round(h * 0.52) };
      },
    });
    const fmt = ctx.fmt;
    const tween = new Tween(1100, ease.inOutCubic);
    let split = false;
    let startP = 0;
    let targetP = 0;
    let rangeKey = '';

    const color = () => ({
      a2: ctx.theme.series[0]!,
      ab: ctx.theme.series[3]!,
      b2: ctx.theme.series[1]!,
      rest: ctx.theme.series[2]!,
      lshape: ctx.theme.series[4]!,
    });

    /** Fortschritt 0 (zusammen) … 1 (zerlegt). */
    const progress = () => startP + (targetP - startP) * tween.value;

    function updateActionLabel(): void {
      const key = p.formula === '3' ? (split ? 'back' : 'rotate') : split ? 'join' : 'split';
      ctx.setAction('toggle', { label: ctx.t(key) });
    }

    function fitRange(): void {
      if (p.mode === 'mental' || p.mode === 'complete') {
        const key = `${p.mode}:${p.pc}:${surface.width}x${surface.height}`;
        if (key === rangeKey) return;
        rangeKey = key;
        const h = Math.min(4, Math.abs(p.pc) / 2);
        // Ergänzung: vor dem Umlegen liegen beide Streifen rechts (x + 2h breit), danach oben (x + h hoch)
        const xr = p.mode === 'complete' ? 5 + 2 * h : 7.7;
        const yr = p.mode === 'complete' ? 5 + h : 7.7;
        plot.setRange([-1.6, xr + 1.4], [-2.8, yr + 1.6]);
        return;
      }
      const s = p.formula === '3' ? p.a + p.b : p.formula === '2' ? p.a : p.a + p.b;
      const key = `${p.formula}:${s}`;
      if (key === rangeKey) return;
      rangeKey = key;
      const margin = 0.16 * s + 0.9;
      const extra = p.formula === '3' ? 0 : 0.1 * s + 0.4;
      plot.setRange([-margin, s + extra + margin * 0.6], [-margin, s + extra + margin * 0.6]);
    }

    function rect(x: number, y: number, w: number, h: number, c: string, alpha = 0.26, dash?: number[]): void {
      const pts: Pt[] = [
        [x, y],
        [x + w, y],
        [x + w, y + h],
        [x, y + h],
      ];
      // Dunkel mit aufgehelltem Ton füllen: zarte Töne wirken auf Dunkelblau sonst schlammig braun
      plot.polygon(pts, { fill: ctx.theme.dark ? shade(c, 0.35) : c, alpha: ctx.theme.dark ? alpha * 1.3 : alpha });
      plot.polygon(pts, { stroke: c, width: 2.5, dash });
    }

    function unitGrid(x: number, y: number, w: number, h: number): void {
      if (!p.grid) return;
      const g = surface.g;
      g.save();
      g.beginPath();
      g.rect(plot.px(x), plot.py(y + h), w * plot.scale.x, h * plot.scale.y);
      g.clip();
      g.strokeStyle = withAlpha(ctx.theme.text, 0.12);
      g.lineWidth = 1;
      g.beginPath();
      for (let gx = Math.ceil(x); gx <= x + w; gx++) {
        g.moveTo(Math.round(plot.px(gx)) + 0.5, plot.py(y));
        g.lineTo(Math.round(plot.px(gx)) + 0.5, plot.py(y + h));
      }
      for (let gy = Math.ceil(y); gy <= y + h; gy++) {
        g.moveTo(plot.px(x), Math.round(plot.py(gy)) + 0.5);
        g.lineTo(plot.px(x + w), Math.round(plot.py(gy)) + 0.5);
      }
      g.stroke();
      g.restore();
    }

    function areaLabel(x: number, y: number, term: string, value: number, c: string): void {
      const size = Math.max(13, Math.min(22, plot.scale.x * 0.55));
      plot.text(x, y, term, { math: true, size: size + 2, color: c, align: 'center', baseline: 'middle', weight: 'bold', offset: [0, p.numbers ? -size * 0.45 : 0] });
      if (p.numbers) {
        plot.text(x, y, `= ${fmt.num(value)}`, { size: size - 2, color: c, align: 'center', baseline: 'middle', offset: [0, size * 0.65] });
      }
    }

    /** Bemaßung entlang einer waagerechten oder senkrechten Kante. */
    function dimension(x1: number, y1: number, x2: number, y2: number, label: string, side: 'below' | 'left' | 'above' | 'right'): void {
      const off = 18;
      const [px1, py1] = plot.toPx(x1, y1);
      const [px2, py2] = plot.toPx(x2, y2);
      const dx = side === 'left' ? -off : side === 'right' ? off : 0;
      const dy = side === 'below' ? off : side === 'above' ? -off : 0;
      const g = surface.g;
      g.strokeStyle = ctx.theme.muted;
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(px1 + dx, py1 + dy);
      g.lineTo(px2 + dx, py2 + dy);
      const t = 5;
      if (dy !== 0) {
        g.moveTo(px1 + dx, py1 + dy - t);
        g.lineTo(px1 + dx, py1 + dy + t);
        g.moveTo(px2 + dx, py2 + dy - t);
        g.lineTo(px2 + dx, py2 + dy + t);
      } else {
        g.moveTo(px1 + dx - t, py1 + dy);
        g.lineTo(px1 + dx + t, py1 + dy);
        g.moveTo(px2 + dx - t, py2 + dy);
        g.lineTo(px2 + dx + t, py2 + dy);
      }
      g.stroke();
      const mx = (px1 + px2) / 2 + dx * 1.9;
      const my = (py1 + py2) / 2 + dy * 1.6;
      plot.textPx(mx, my, label, { math: true, size: 16, color: ctx.theme.text, align: 'center', baseline: 'middle' });
    }

    function drawFirst(t: number): void {
      const { a, b } = p;
      const c = color();
      const gap = (0.08 * (a + b) + 0.35) * t;
      const offsets: Record<number, Pt> = { 0: [0, 0], 1: [gap, 0], 2: [0, gap], 3: [gap, gap] };
      piecesFirst(a, b).forEach((piece, i) => {
        const [ox, oy] = offsets[i]!;
        const x = piece.x + ox;
        const y = piece.y + oy;
        unitGrid(x, y, piece.w, piece.h);
        rect(x, y, piece.w, piece.h, c[piece.key === 'rest' ? 'rest' : piece.key]);
        const term = piece.key === 'a2' ? 'a²' : piece.key === 'b2' ? 'b²' : 'a · b';
        areaLabel(x + piece.w / 2, y + piece.h / 2, term, piece.w * piece.h, c[piece.key === 'rest' ? 'rest' : piece.key]);
      });
      dimension(0, 0, a, 0, 'a', 'below');
      dimension(a + gap, 0, a + b + gap, 0, 'b', 'below');
      dimension(0, 0, 0, a, 'a', 'left');
      dimension(0, a + gap, 0, a + b + gap, 'b', 'left');
    }

    function drawSecond(t: number): void {
      const { a, b } = p;
      const c = color();
      const r = a - b;
      const gap = (0.1 * a + 0.4) * t;
      // ganzes Quadrat a² als Umriss
      plot.polygon(
        [
          [0, 0],
          [a, 0],
          [a, a],
          [0, a],
        ],
        { stroke: c.a2, width: 2, dash: [6, 5] },
      );
      unitGrid(0, 0, r, r);
      rect(0, 0, r, r, c.rest, 0.3);
      areaLabel(r / 2, r / 2, '(a − b)²', r * r, c.rest);
      // zwei Streifen a·b (rechts und oben), die sich in b² überlappen
      rect(r + gap, 0, b, a, c.ab, 0.2);
      rect(0, r + gap, a, b, c.ab, 0.2);
      rect(r + gap, r, b, b, c.b2, 0.35);
      rect(r, r + gap, b, b, c.b2, 0.35);
      if (t > 0.5) {
        areaLabel(r + gap + b / 2, r / 2, 'a · b', a * b, c.ab);
        areaLabel(r / 2, r + gap + b / 2, 'a · b', a * b, c.ab);
      }
      plot.text(r + gap / 2 + b / 2, r + gap / 2 + b / 2, 'b²', { math: true, size: 16, color: c.b2, align: 'center', baseline: 'middle', weight: 'bold' });
      if (t > 0.5) {
        plot.text(r + gap / 2 + b / 2, r + gap / 2 + b / 2, ctx.t('twice'), { size: 12, color: c.b2, align: 'center', baseline: 'top', offset: [0, 12], weight: '600' });
      }
      dimension(0, 0, r, 0, 'a − b', 'below');
      dimension(r + gap, 0, a + gap, 0, 'b', 'below');
      dimension(0, 0, 0, a, 'a', 'left');
    }

    function drawThird(t: number): void {
      const { a, b } = p;
      const c = color();
      const r = a - b;
      // fehlendes Quadrat b² (oben rechts) als gestrichelter Umriss
      const removedAlpha = 1 - t;
      if (removedAlpha > 0.02) {
        plot.polygon(
          [
            [r, r],
            [a, r],
            [a, a],
            [r, a],
          ],
          { fill: c.b2, alpha: 0.12 * removedAlpha, stroke: withAlpha(c.b2, removedAlpha), width: 2, dash: [5, 5] },
        );
        plot.text(r + b / 2, r + b / 2, `b² ${ctx.t('removed')}`, { size: 12, color: withAlpha(c.b2, removedAlpha), align: 'center', baseline: 'middle' });
      }
      // unterer Teil a × (a − b) bleibt liegen
      unitGrid(0, 0, a, r);
      rect(0, 0, a, r, c.lshape, 0.26);
      // oberer Streifen (a − b) × b wird gedreht und rechts angelegt
      const angle = (-Math.PI / 2) * t;
      const c0: Pt = [r / 2, r + b / 2];
      const c1: Pt = [a + b / 2, r / 2];
      const cx = c0[0] + (c1[0] - c0[0]) * t;
      const cy = c0[1] + (c1[1] - c0[1]) * t;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const corners: Pt[] = (
        [
          [-r / 2, -b / 2],
          [r / 2, -b / 2],
          [r / 2, b / 2],
          [-r / 2, b / 2],
        ] as Pt[]
      ).map(([x, y]) => [cx + x * cos - y * sin, cy + x * sin + y * cos]);
      plot.polygon(corners, { fill: c.lshape, alpha: 0.4 });
      plot.polygon(corners, { stroke: c.lshape, width: 2.5 });
      if (t < 0.05) {
        areaLabel(a / 2, r / 2, 'a · (a − b)', a * r, c.lshape);
        areaLabel(r / 2, r + b / 2, 'b · (a − b)', b * r, c.lshape);
        dimension(0, 0, a, 0, 'a', 'below');
        dimension(0, 0, 0, a, 'a', 'left');
      } else if (t > 0.95) {
        areaLabel((a + b) / 2, r / 2, '(a + b)(a − b)', (a + b) * r, c.lshape);
        dimension(0, 0, a + b, 0, 'a + b', 'below');
        dimension(0, 0, 0, r, 'a − b', 'left');
      }
    }

    /* ───────────── neue Ansichten: Hilfen ───────────── */

    const tr = (key: string, vars: Record<string, string | number>) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const wide = () => surface.width >= 640 || surface.width > surface.height * 1.3;
    /** Bereich für die Erklärkarte (rechts bzw. unten). */
    function cardArea(): Rect {
      const { width: w, height: h } = surface;
      if (wide()) {
        const x = Math.round(w * 0.56);
        return { x: x + 8, y: 16, w: w - x - 24, h: h - 32 };
      }
      const y = Math.round(h * 0.52);
      return { x: 12, y: y + 4, w: w - 24, h: h - y - 12 };
    }
    function box(r: Rect): void {
      const g = surface.g;
      g.save();
      softShadow(g, ctx.theme.dark, 12, 3);
      roundRect(g, r.x, r.y, r.w, r.h, 12);
      g.fillStyle = ctx.theme.bg;
      g.fill();
      g.restore();
      roundRect(g, r.x, r.y, r.w, r.h, 12);
      g.strokeStyle = ctx.theme.grid;
      g.lineWidth = 1;
      g.stroke();
    }
    function wrap(textValue: string, maxW: number, font: string): string[] {
      const g = surface.g;
      g.font = font;
      const out: string[] = [];
      let line = '';
      for (const w of textValue.split(' ')) {
        const next = line ? `${line} ${w}` : w;
        if (g.measureText(next).width > maxW && line) {
          out.push(line);
          line = w;
        } else line = next;
      }
      if (line) out.push(line);
      return out;
    }
    /** Zeilen in eine Karte schreiben; „=“-Zeilen bekommen einen kleinen Einzug. */
    function cardLines(area: Rect, lines: { text: string; color?: string; bold?: boolean; size?: number }[]): void {
      const g = surface.g;
      // Höhe aus dem Inhalt bestimmen, damit die Karte nicht leer wirkt
      let need = 24;
      for (const l of lines) {
        const size = l.size ?? (area.w < 340 ? 14 : 16);
        need += wrap(l.text, area.w - 32, `${l.bold ? '600' : 'normal'} ${size}px ${ctx.theme.font}`).length * size * 1.4 + 4;
      }
      const r: Rect = { ...area, h: Math.min(area.h, need) };
      box(r);
      let y = r.y + 16;
      g.textAlign = 'left';
      g.textBaseline = 'top';
      for (const l of lines) {
        const size = l.size ?? (r.w < 340 ? 14 : 16);
        const font = `${l.bold ? '600' : 'normal'} ${size}px ${ctx.theme.font}`;
        for (const part of wrap(l.text, r.w - 32, font)) {
          if (y + size > r.y + r.h - 8) return;
          g.font = font;
          g.fillStyle = l.color ?? ctx.theme.text;
          g.fillText(part.replace(/-(?=\d)/g, '−'), r.x + 16, y);
          y += size * 1.4;
        }
        y += 4;
      }
    }
    const signed = (v: number) => (v < 0 ? `− ${fmt.num(-v)}` : `+ ${fmt.num(v)}`);

    /* ───────────── Kopfrechnen ───────────── */

    function mentalLines(): string[] {
      if (p.mk === 'prod') {
        const m = mentalProduct(p.r, p.dd);
        return [tr('mProd', { x: m.x, y: m.y, r: p.r, d: p.dd, r2: m.r2, d2: m.d2, res: m.result })];
      }
      const m = mentalSquare(p.n);
      if (m.d === 0) return [tr('mSqZero', { n: p.n, res: m.result })];
      const d = Math.abs(m.d);
      return [tr(m.d > 0 ? 'mSqPlus' : 'mSqMinus', { n: p.n, r: m.r, d, r2: m.r2, rd: Math.abs(m.twoRD), d2: m.d2, res: m.result })];
    }

    function drawMental(): void {
      const c = color();
      const S = 6; // Seite des großen Quadrats in der Skizze
      const w = 1.7; // Breite der Streifen in der Skizze
      if (p.mk === 'prod') {
        const m = mentalProduct(p.r, p.dd);
        // r² mit herausgeschnittenem Eckquadrat d², Streifen umgelegt wie bei der 3. Formel
        rect(0, 0, S, S - w, c.lshape, 0.26);
        rect(0, S - w, S - w, w, c.lshape, 0.26);
        plot.polygon([[S - w, S - w], [S, S - w], [S, S], [S - w, S]], { fill: c.b2, alpha: 0.12, stroke: c.b2, width: 2, dash: [5, 5] });
        areaLabel(S / 2, (S - w) / 2, `${p.r}² − ${p.dd}²`, m.result, c.lshape);
        plot.text(S - w / 2, S - w / 2, `${p.dd}²`, { math: true, size: 16, color: c.b2, align: 'center', baseline: 'middle', weight: 'bold' });
        dimension(0, 0, S, 0, `${p.r}`, 'below');
        dimension(0, 0, 0, S, `${p.r}`, 'left');
      } else {
        const m = mentalSquare(p.n);
        const d = Math.abs(m.d);
        if (m.d >= 0) {
          const ww = m.d === 0 ? 0 : w;
          rect(0, 0, S, S, c.a2, 0.26);
          areaLabel(S / 2, S / 2, `${m.r}²`, m.r2, c.a2);
          if (ww > 0) {
            rect(S, 0, ww, S, c.ab, 0.26);
            rect(0, S, S, ww, c.ab, 0.26);
            rect(S, S, ww, ww, c.b2, 0.3);
            plot.text(S + ww / 2, S / 2, `${m.r}·${d}`, { size: 13, weight: '600', color: c.ab, align: 'center', baseline: 'middle' });
            plot.text(S / 2, S + ww / 2, `${m.r} · ${d}`, { size: 13, weight: '600', color: c.ab, align: 'center', baseline: 'middle' });
            plot.text(S + ww / 2, S + ww / 2, `${d}²`, { size: 13, weight: '600', color: c.b2, align: 'center', baseline: 'middle' });
            dimension(S, 0, S + ww, 0, `${d}`, 'below');
          }
          dimension(0, 0, S, 0, `${m.r}`, 'below');
          dimension(0, 0, 0, S, `${m.r}`, 'left');
        } else {
          // (r − d)²: von r² zwei Streifen r·d weg, d² wieder dazu
          const r0 = S - w;
          plot.polygon([[0, 0], [S, 0], [S, S], [0, S]], { stroke: c.a2, width: 2, dash: [6, 5] });
          rect(0, 0, r0, r0, c.rest, 0.3);
          areaLabel(r0 / 2, r0 / 2, `${p.n}²`, p.n * p.n, c.rest);
          rect(r0, 0, w, S, c.ab, 0.18);
          rect(0, r0, S, w, c.ab, 0.18);
          rect(r0, r0, w, w, c.b2, 0.35);
          plot.text(r0 + w / 2, r0 / 2, `${m.r}·${d}`, { size: 13, weight: '600', color: c.ab, align: 'center', baseline: 'middle' });
          plot.text(r0 / 2, r0 + w / 2, `${m.r} · ${d}`, { size: 13, weight: '600', color: c.ab, align: 'center', baseline: 'middle' });
          plot.text(r0 + w / 2, r0 + w / 2, `${d}²`, { size: 13, weight: '600', color: c.b2, align: 'center', baseline: 'middle' });
          dimension(0, 0, r0, 0, `${p.n}`, 'below');
          dimension(r0, 0, S, 0, `${d}`, 'below');
          dimension(0, 0, 0, S, `${m.r}`, 'left');
        }
      }
      plot.textPx(plot.rect.x + plot.rect.w - 10, plot.rect.y + 14, ctx.t('sketch'), { size: 12, color: ctx.theme.muted, align: 'right', baseline: 'top' });
    }

    /* ───────────── Quadratische Ergänzung ───────────── */

    const fillTween = new Tween(1400, ease.inOutCubic);
    let filled = false;
    let fillFrom = 0;
    const fillProgress = () => fillFrom + ((filled ? 1 : 0) - fillFrom) * fillTween.value;

    function completeLines(): { text: string; color?: string; bold?: boolean }[] {
      const cs = completeSquare(p.pc, p.qc);
      const sp = p.pc < 0 ? '−' : '+';
      const pa = fmt.num(Math.abs(p.pc));
      const qa = fmt.num(Math.abs(p.qc));
      const sq = p.qc < 0 ? '−' : '+';
      const h = fmt.num(Math.abs(cs.h));
      const h2 = fmt.num(cs.h2);
      const syText = cs.sy === 0 ? '' : signed(cs.sy);
      const lines: { text: string; color?: string; bold?: boolean }[] = [];
      const step1 = tr('cStep1', { sp, pa, sq, qa }).replace(/ [+−] 0$/, '');
      lines.push({ text: step1, bold: true });
      if (p.pc === 0) {
        lines.push({ text: `= x² ${p.qc === 0 ? '' : signed(p.qc)}`.trim() });
      } else {
        lines.push({ text: tr('cStep2', { sp, pa, h2, sq, qa }).replace(/ [+−] 0$/, ''), color: color().b2 });
        lines.push({ text: tr('cStep3', { sp, h, sy: syText }).trim(), bold: true, color: color().a2 });
        lines.push({ text: tr('cHint', { h }), color: ctx.theme.muted });
      }
      lines.push({ text: tr('cVertex', { sx: fmt.num(cs.sx), syv: fmt.num(cs.sy) }), bold: true });
      return lines;
    }

    function drawComplete(): void {
      const c = color();
      const X = 5;
      const h = Math.min(4, Math.abs(p.pc) / 2);
      const t = fillProgress();
      rect(0, 0, X, X, c.a2, 0.26);
      plot.text(X / 2, X / 2, 'x²', { math: true, size: 26, color: c.a2, align: 'center', baseline: 'middle', weight: 'bold' });
      dimension(0, 0, X, 0, 'x', 'below');
      dimension(0, 0, 0, X, 'x', 'left');
      if (h > 0) {
        // Streifen 1 bleibt rechts liegen
        rect(X, 0, h, X, c.ab, 0.26);
        plot.text(X + h / 2, X / 2, `${fmt.num(h)}x`, { size: 14, weight: '600', color: c.ab, align: 'center', baseline: 'middle' });
        // Streifen 2 wandert von rechts nach oben (Drehung um 90°)
        const angle = (Math.PI / 2) * t;
        const c0: Pt = [X + 1.5 * h, X / 2];
        const c1: Pt = [X / 2, X + h / 2];
        const cx = c0[0] + (c1[0] - c0[0]) * t;
        const cy = c0[1] + (c1[1] - c0[1]) * t;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const corners: Pt[] = (
          [
            [-h / 2, -X / 2],
            [h / 2, -X / 2],
            [h / 2, X / 2],
            [-h / 2, X / 2],
          ] as Pt[]
        ).map(([x, y]) => [cx + x * cos - y * sin, cy + x * sin + y * cos]);
        plot.polygon(corners, { fill: ctx.theme.dark ? shade(c.ab, 0.35) : c.ab, alpha: 0.34 });
        plot.polygon(corners, { stroke: c.ab, width: 2.5 });
        plot.text(cx, cy, `${fmt.num(h)}x`, { size: 14, weight: '600', color: c.ab, align: 'center', baseline: 'middle' });
        // fehlendes Eckquadrat
        if (t > 0.55) {
          const a = Math.min(1, (t - 0.55) / 0.45);
          plot.polygon([[X, X], [X + h, X], [X + h, X + h], [X, X + h]], { fill: c.b2, alpha: 0.35 * a, stroke: withAlpha(c.b2, a), width: 2.5, dash: t < 0.999 ? [5, 4] : undefined });
          plot.text(X + h, X + h / 2, tr('addCorner', { h: fmt.num(h) }), { size: 13, weight: '600', color: withAlpha(c.b2, a), align: 'left', baseline: 'middle', offset: [8, 0] });
        }
        if (t > 0.98) {
          dimension(0, X + h, X + h, X + h, `x + ${fmt.num(h)}`, 'above');
        } else {
          dimension(X, 0, X + h, 0, fmt.num(h), 'below');
        }
      }
      if (p.pc < 0) plot.textPx(plot.rect.x + 10, plot.rect.y + 14, ctx.t('negP'), { size: 12, color: ctx.theme.muted, align: 'left', baseline: 'top' });
    }

    /* ───────────── Üben: Welcher Term passt? ───────────── */

    let quiz: TermQuiz = termQuiz(1, seededRandom(1));
    let chosen: number | null = null;
    let tries = 0;
    let right = 0;
    let hover: number | null = null;
    const pop = new Tween(450, ease.outBack);
    let keysOn = false;
    const newQuiz = () => {
      quiz = termQuiz(p.q, seededRandom(p.q * 3301 + 11));
      chosen = null;
    };
    function optionRects(): Rect[] {
      const { width: w, height: h } = surface;
      const top = Math.min(150, h * 0.32);
      const cols = w >= 560 ? 2 : 1;
      const rows = 4 / cols;
      const gap = 14;
      const bw = (w - 32 - gap * (cols - 1)) / cols;
      const bh = Math.min(84, (h - top - 20 - gap * (rows - 1)) / rows);
      return [0, 1, 2, 3].map((i) => ({ x: 16 + (i % cols) * (bw + gap), y: top + Math.floor(i / cols) * (bh + gap), w: bw, h: bh }));
    }
    function choose(i: number): void {
      if (ctx.locked || chosen !== null || p.mode !== 'quiz') return;
      chosen = i;
      tries += 1;
      const ok = quiz.options[i]!.ok;
      if (ok) right += 1;
      pop.play();
      updateQuizReadouts();
      ctx.announce(ok ? ctx.t('ok') : `${ctx.t('no')} ${ctx.t(quiz.options[i]!.mistake ?? 'formula')}`);
      ctx.requestRender();
    }
    new TapTarget(surface, {
      hit: (px, py) => {
        if (p.mode !== 'quiz') return null;
        const i = optionRects().findIndex((r) => px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h);
        return i < 0 ? null : String(i);
      },
      onTap: (id) => choose(Number(id)),
      onHover: (id) => {
        hover = id === null ? null : Number(id);
        surface.setCursor(id === null || chosen !== null ? '' : 'pointer');
        ctx.requestRender();
      },
    });
    function quizHead(): string {
      return tr(quiz.kind === 'expand' ? 'qExpand' : 'qFactor', { q: p.q });
    }
    function quizFeedback(): { text: string; ok: boolean | null } {
      if (chosen === null) return { text: ctx.t('tapMsg'), ok: null };
      const o = quiz.options[chosen]!;
      return o.ok ? { text: ctx.t('ok'), ok: true } : { text: `${ctx.t('no')} ${ctx.t(o.mistake ?? 'formula')}`, ok: false };
    }
    function updateQuizReadouts(): void {
      if (p.mode !== 'quiz') {
        ctx.readout('task', null);
        ctx.readout('fb', null);
        return;
      }
      ctx.readout('task', `${quizHead()} ${quiz.question}`);
      const fb = quizFeedback();
      ctx.readout('fb', tries > 0 ? `${fb.text} (${tr('score', { r: right, n: tries })})` : fb.text);
    }
    function renderQuiz(): void {
      const g = surface.begin();
      const { width: w } = surface;
      const ok = ctx.theme.series[2]!;
      const bad = ctx.theme.series[1]!;
      // Kopf: Aufgabe und Term
      g.textAlign = 'center';
      g.textBaseline = 'top';
      g.fillStyle = ctx.theme.muted;
      g.font = `600 ${w < 520 ? 14 : 16}px ${ctx.theme.font}`;
      g.fillText(quizHead(), w / 2, 14);
      g.fillStyle = ctx.theme.text;
      g.font = `italic 600 ${w < 520 ? 26 : 34}px ${ctx.theme.mathFont}`;
      g.fillText(quiz.question, w / 2, 42);
      const fb = quizFeedback();
      g.font = `${fb.ok === null ? 'normal' : '600'} ${w < 520 ? 13 : 15}px ${ctx.theme.font}`;
      g.fillStyle = fb.ok === null ? ctx.theme.muted : fb.ok ? ok : bad;
      const fbLines = wrap(fb.text, w - 40, g.font);
      fbLines.slice(0, 2).forEach((l, i) => g.fillText(l, w / 2, (w < 520 ? 82 : 92) + i * 18));
      const rects = optionRects();
      const pk = pop.running ? pop.value : 1;
      quiz.options.forEach((o, i) => {
        const r = rects[i]!;
        const isChosen = chosen === i;
        const reveal = chosen !== null && o.ok;
        const focus = ctx.keyFocus === String(i) || hover === i;
        const grow = isChosen ? 1 + 0.04 * (1 - Math.abs(1 - pk)) : 1;
        const rr: Rect = { x: r.x - (r.w * (grow - 1)) / 2, y: r.y - (r.h * (grow - 1)) / 2, w: r.w * grow, h: r.h * grow };
        g.save();
        softShadow(g, ctx.theme.dark, focus ? 14 : 8, 2);
        roundRect(g, rr.x, rr.y, rr.w, rr.h, 12);
        g.fillStyle = reveal ? withAlpha(ok, 0.16) : isChosen && !o.ok ? withAlpha(bad, 0.14) : ctx.theme.bg;
        g.fill();
        g.restore();
        roundRect(g, rr.x, rr.y, rr.w, rr.h, 12);
        g.strokeStyle = reveal ? ok : isChosen ? bad : focus ? ctx.theme.series[0]! : ctx.theme.grid;
        g.lineWidth = reveal || isChosen || focus ? 2.5 : 1;
        g.stroke();
        g.fillStyle = ctx.theme.muted;
        g.font = `600 13px ${ctx.theme.font}`;
        g.textAlign = 'left';
        g.textBaseline = 'top';
        g.fillText('ABCD'[i]!, rr.x + 12, rr.y + 10);
        g.fillStyle = ctx.theme.text;
        g.font = `italic ${w < 520 ? 20 : 24}px ${ctx.theme.mathFont}`;
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        g.fillText(o.text, rr.x + rr.w / 2, rr.y + rr.h / 2);
      });
      keysOn = true;
      ctx.setKeyTargets(quiz.options.map((o, i) => ({ id: String(i), label: tr('option', { k: 'ABCD'[i]!, t: o.text }), rect: rects[i], disabled: chosen !== null, activate: () => choose(i) })));
      if (pop.running) ctx.requestRender();
    }

    return {
      update(changed, source) {
        if (changed.has('q') || source === 'init' || source === 'replace') newQuiz();
        if (changed.has('mode') || changed.has('pc')) {
          filled = false;
          fillFrom = 0;
          fillTween.finish();
          ctx.setAction('fill', { label: ctx.t('fill') });
          rangeKey = '';
        }
        if (p.mode !== 'quiz' && keysOn) {
          keysOn = false;
          ctx.setKeyTargets([]);
        }
        for (const k of ['formula', 'numbers', 'hint', 'calc', 'task', 'fb']) ctx.readout(k, null);
        if (p.mode === 'quiz') {
          updateQuizReadouts();
          return;
        }
        if (p.mode === 'mental') {
          ctx.readout('calc', mentalLines().join(' '));
          return;
        }
        if (p.mode === 'complete') {
          ctx.readout('calc', completeLines().map((l) => l.text).join(' '));
          return;
        }
        if (changed.has('formula')) {
          split = false;
          startP = 0;
          targetP = 0;
          tween.finish();
        }
        updateActionLabel();
        fitRange();
        const e = expand(p.formula as Formula, p.a, p.b);
        const s = (k: number, text: string) => `<span style="color:var(--series-${k});font-weight:700">${text}</span>`;
        const sq = '<sup>2</sup>';
        const v = (x: string) => `<var>${x}</var>`;
        const formulas: Record<Formula, string> = {
          '1': `(${v('a')} + ${v('b')})${sq} = ${s(1, `${v('a')}${sq}`)} + ${s(4, `2${v('a')}${v('b')}`)} + ${s(2, `${v('b')}${sq}`)}`,
          '2': `(${v('a')} − ${v('b')})${sq} = ${s(1, `${v('a')}${sq}`)} − ${s(4, `2${v('a')}${v('b')}`)} + ${s(2, `${v('b')}${sq}`)}`,
          '3': `(${v('a')} + ${v('b')})(${v('a')} − ${v('b')}) = ${s(1, `${v('a')}${sq}`)} − ${s(2, `${v('b')}${sq}`)}`,
        };
        ctx.readout('formula', { html: formulas[p.formula as Formula] });
        const n = (x: number) => fmt.num(x);
        const nums: Record<Formula, string> = {
          '1': `(${n(p.a)} + ${n(p.b)})² = ${n(e.left)} = ${n(e.terms[0]!)} + ${n(e.terms[1]!)} + ${n(e.terms[2]!)}`,
          '2': `(${n(p.a)} − ${n(p.b)})² = ${n(e.left)} = ${n(e.terms[0]!)} − ${n(-e.terms[1]!)} + ${n(e.terms[2]!)}`,
          '3': `(${n(p.a)} + ${n(p.b)})(${n(p.a)} − ${n(p.b)}) = ${n(e.left)} = ${n(e.terms[0]!)} − ${n(-e.terms[1]!)}`,
        };
        // Die Formeln gelten für alle Zahlen; nur das Flächenmodell braucht a > b.
        const modelOk = p.formula === '1' || p.a > p.b;
        ctx.readout('numbers', nums[p.formula as Formula]);
        ctx.readout('hint', ctx.t(modelOk ? `hint${p.formula}` : 'needABHint'));
      },

      action(id) {
        if (ctx.locked) return;
        if (id === 'newq') {
          ctx.set({ q: p.q >= 999 ? 1 : p.q + 1 });
          return;
        }
        if (id === 'fill') {
          fillFrom = fillProgress();
          filled = !filled;
          fillTween.play(Math.max(200, 1400 * Math.abs((filled ? 1 : 0) - fillFrom)));
          ctx.setAction('fill', { label: ctx.t(filled ? 'unfill' : 'fill') });
          ctx.requestRender();
          return;
        }
        if (id !== 'toggle') return;
        // Auch mitten in der Animation an der aktuellen Stelle weitermachen
        startP = progress();
        split = !split;
        targetP = split ? 1 : 0;
        tween.play(Math.max(150, 1100 * Math.abs(targetP - startP)));
        updateActionLabel();
      },

      render() {
        if (p.mode === 'quiz') return renderQuiz();
        plot.resize();
        fitRange();
        if (p.mode === 'mental' || p.mode === 'complete') {
          surface.begin();
          plot.begin();
          if (p.mode === 'mental') drawMental();
          else drawComplete();
          plot.end();
          const lines =
            p.mode === 'mental'
              ? mentalLines()[0]!
                  .split(' = ')
                  .map((text, i, all) => ({ text: i === 0 ? text : `= ${text}`, bold: i === 0 || i === all.length - 1, size: surface.width < 520 ? 14 : 20, color: i === all.length - 1 ? ctx.theme.series[2]! : undefined }))
              : completeLines()
                  .filter((l) => surface.width >= 520 || l.color !== ctx.theme.muted)
                  .map((l) => ({ ...l, size: surface.width < 520 ? 13 : 18 }));
          cardLines(cardArea(), lines);
          if (fillTween.running) ctx.requestRender();
          return;
        }
        const t = progress();
        surface.begin();
        plot.begin();
        if (p.formula !== '1' && p.a <= p.b) {
          // zweizeilig und mit angepasster Größe, damit nichts abgeschnitten wird (Handy)
          const size = Math.max(12, Math.min(17, plot.rect.w / 19));
          const mx = plot.rect.x + plot.rect.w / 2;
          const my = plot.rect.y + plot.rect.h / 2;
          const style = { size, color: ctx.theme.muted, align: 'center', baseline: 'middle' } as const;
          plot.textPx(mx, my - size * 0.75, ctx.t('needAB'), style);
          plot.textPx(mx, my + size * 0.75, ctx.t('stillValid'), style);
        } else if (p.formula === '1') drawFirst(t);
        else if (p.formula === '2') drawSecond(t);
        else drawThird(t);
        plot.end();
        if (tween.running) ctx.requestRender();
      },

      destroy: () => surface.destroy(),
    };
  },
});
