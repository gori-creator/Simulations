import { defineSimulation, ease, Plot, roundRect, seededRandom, softShadow, Surface, textOn, Tween, withAlpha, type Rect } from '../../../sim-core';
import {
  arrangementAB,
  arrangementC,
  checkAnswer,
  classify,
  integerHypotenuse,
  interpolate,
  quizTask,
  squareOutward,
  thirdSide,
  triplesUpTo,
  type Point,
  type QuizTask,
  type Triangle,
} from './model';

const L = (de: string, en: string) => ({ de, en });

/** Größte Kathete im Tripel-Gitter. */
const TRIPLE_N = 24;

/**
 * Satz des Pythagoras: Quadrate über den Seiten eines rechtwinkligen Dreiecks
 * (mit Kästchen zum Abzählen), ein animierter Ergänzungsbeweis, die Umkehrung
 * mit veränderlichem Winkel γ, Anwendungen (Leiter, Bildschirm, Abstand,
 * Abkürzung), pythagoreische Tripel im Gitter und Übungsaufgaben.
 */
export default defineSimulation({
  id: 'pythagoras',
  dragHint: true,
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Darstellung', 'View'),
      options: [
        { value: 'squares', label: L('Quadrate an den Seiten', 'Squares on the sides') },
        { value: 'puzzle', label: L('Puzzle-Beweis', 'Puzzle proof') },
        { value: 'angle', label: L('Umkehrung: Winkel ändern', 'Converse: change the angle') },
        { value: 'apply', label: L('Anwendungen', 'Applications') },
        { value: 'triples', label: L('Pythagoreische Tripel', 'Pythagorean triples') },
        { value: 'quiz', label: L('Üben: Seite berechnen', 'Practice: find a side') },
      ],
      default: 'squares',
    },
    {
      key: 'ex',
      type: 'choice',
      label: L('Beispiel', 'Example'),
      options: [
        { value: 'ladder', label: L('Leiter an der Wand', 'Ladder against a wall') },
        { value: 'screen', label: L('Bildschirmdiagonale', 'Screen diagonal') },
        { value: 'coord', label: L('Abstand zweier Punkte', 'Distance between two points') },
        { value: 'field', label: L('Abkürzung über die Wiese', 'Shortcut across a field') },
      ],
      default: 'ladder',
      visibleIf: (v) => v.mode === 'apply',
    },
    { key: 'a', type: 'number', label: L('Kathete a', 'Leg a'), min: 1, max: 6, step: 0.5, default: 3, visibleIf: (v) => v.mode !== 'triples' && v.mode !== 'quiz' },
    { key: 'b', type: 'number', label: L('Kathete b', 'Leg b'), min: 1, max: 6, step: 0.5, default: 4, visibleIf: (v) => v.mode !== 'triples' && v.mode !== 'quiz' },
    { key: 'gam', type: 'number', label: L('Winkel γ zwischen a und b', 'Angle γ between a and b'), min: 30, max: 150, step: 1, default: 90, unit: '°', visibleIf: (v) => v.mode === 'angle' },
    { key: 'ta', type: 'number', label: L('Kathete a (ganzzahlig)', 'Leg a (whole number)'), min: 1, max: TRIPLE_N, step: 1, default: 3, visibleIf: (v) => v.mode === 'triples' },
    { key: 'tb', type: 'number', label: L('Kathete b (ganzzahlig)', 'Leg b (whole number)'), min: 1, max: TRIPLE_N, step: 1, default: 4, visibleIf: (v) => v.mode === 'triples' },
    { key: 'q', type: 'number', label: L('Aufgabe Nr.', 'Task no.'), min: 1, max: 999, step: 1, default: 1, visibleIf: (v) => v.mode === 'quiz' },
    { key: 'ans', type: 'text', label: L('Deine Antwort', 'Your answer'), default: '', maxLength: 20, placeholder: L('z. B. 7,5', 'e.g. 7.5'), visibleIf: (v) => v.mode === 'quiz' },
    { key: 'grid', type: 'boolean', group: 'view', label: L('Kästchen zum Abzählen', 'Unit squares for counting'), default: true, visibleIf: (v) => v.mode === 'squares' || v.mode === 'angle' },
    { key: 'numbers', type: 'boolean', group: 'view', label: L('Werte im Bild', 'Values in the picture'), default: true },
  ],
  hint: (v) => {
    if (v.mode === 'angle') return L('Tipp: Zieh die Ecke B – der Winkel γ ändert sich, und die Balken oben vergleichen c² mit a² + b².', 'Tip: Drag corner B – the angle γ changes, and the bars at the top compare c² with a² + b².');
    if (v.mode === 'triples') return L('Tipp: Zieh den Punkt P auf einen markierten Gitterpunkt – dort ist die Hypotenuse ganzzahlig.', 'Tip: Drag the point P onto a marked grid point – there the hypotenuse is a whole number.');
    if (v.mode === 'quiz') return L('Tipp: Rechne mit Stift und Taschenrechner, trag das Ergebnis unter „Deine Antwort“ ein und tippe auf „Prüfen“.', 'Tip: Work it out with pen and calculator, enter the result under “Your answer” and tap “Check”.');
    if (v.mode === 'apply') return L('Tipp: Ändere die beiden Katheten mit den Reglern – wo steckt im Bild das rechtwinklige Dreieck?', 'Tip: Change the two legs with the sliders – where is the right triangle hidden in the picture?');
    if (v.mode === 'puzzle') return null;
    return L('Tipp: Zieh die Ecken des Dreiecks – die Quadrate wachsen mit.', 'Tip: Drag the corners of the triangle – the squares grow with them.');
  },
  actions: [
    { id: 'move', label: L('Dreiecke umlegen', 'Rearrange triangles'), primary: true, visibleIf: (v) => v.mode === 'puzzle' },
    { id: 'right', label: L('Rechten Winkel einstellen', 'Set a right angle'), visibleIf: (v) => v.mode === 'angle' },
    { id: 'check', label: L('Prüfen', 'Check'), primary: true, visibleIf: (v) => v.mode === 'quiz' },
    { id: 'newq', label: L('Neue Aufgabe', 'New task'), visibleIf: (v) => v.mode === 'quiz' },
  ],
  readouts: [
    { key: 'task', label: L('Aufgabe', 'Task') },
    { key: 'sides', label: L('Seitenlängen', 'Side lengths'), spoiler: true },
    { key: 'areas', label: L('Flächen', 'Areas'), spoiler: true },
    { key: 'calc', label: L('Rechnung', 'Calculation'), spoiler: true },
    { key: 'verdict', label: L('Ergebnis', 'Result') },
    { key: 'proof', label: L('Beweisidee', 'Proof idea') },
  ],
  resultsParam: 'numbers',
  presets: [
    { id: '345', label: L('3-4-5-Dreieck', '3-4-5 triangle'), values: {} },
    { id: 'iso', label: L('Gleichschenklig', 'Isosceles'), values: { a: 3, b: 3 } },
    { id: 'puzzle', label: L('Puzzle-Beweis', 'Puzzle proof'), values: { mode: 'puzzle' } },
    { id: 'obtuse', label: L('Stumpfer Winkel: c² > a² + b²', 'Obtuse angle: c² > a² + b²'), values: { mode: 'angle', gam: 120 } },
    { id: 'ladder', label: L('Leiter an der Wand', 'Ladder against a wall'), values: { mode: 'apply', ex: 'ladder', a: 4, b: 1.5 } },
    { id: 'triples', label: L('Tripel 5-12-13', 'Triple 5-12-13'), values: { mode: 'triples', ta: 5, tb: 12 } },
    { id: 'quiz', label: L('Üben: Seite berechnen', 'Practice: find a side'), values: { mode: 'quiz', q: 1, ans: '' } },
  ],
  strings: {
    de: {
      canvas: 'Rechtwinkliges Dreieck mit Quadraten über den Seiten, Puzzle-Beweis, Dreieck mit veränderlichem Winkel, Anwendungsbeispiele, Gitter mit pythagoreischen Tripeln oder Übungsaufgabe',
      move: 'Dreiecke umlegen',
      back: 'Zurücklegen',
      proofSquares: 'Die beiden Kathetenquadrate haben zusammen denselben Flächeninhalt wie das Hypotenusenquadrat.',
      proofPuzzle:
        'In beiden Anordnungen liegen im Quadrat mit der Seite a + b dieselben vier Dreiecke. Die freie Fläche ist also gleich groß: c² = a² + b².',
      proofAngle: 'Umkehrung: Gilt c² = a² + b², dann ist das Dreieck rechtwinklig. Ist c² kleiner, ist γ spitz; ist c² größer, ist γ stumpf.',
      proofTriples: 'Ein Gitterpunkt P(a | b) hat vom Ursprung den Abstand c = √(a² + b²). Liegt er auf einem der Viertelkreise mit ganzzahligem Radius, bilden a, b, c ein pythagoreisches Tripel.',
      hyp: 'Hypotenuse',
      acute: 'c² < a² + b²: γ ist spitz',
      right: 'c² = a² + b²: γ ist ein rechter Winkel',
      obtuse: 'c² > a² + b²: γ ist stumpf',
      sum: 'a² + b²',
      qLadder: 'Eine Leiter soll in {a} m Höhe an der Wand lehnen, ihr Fuß steht {b} m von der Wand entfernt. Wie lang muss sie sein?',
      qScreen: 'Ein Bildschirm ist {b} cm breit und {a} cm hoch. Wie lang ist die Diagonale – in cm und in Zoll?',
      qCoord: 'Wie weit sind die Punkte P und Q voneinander entfernt?',
      qField: 'Eine Wiese ist {b} m lang und {a} m breit. Wie viel Weg spart man, wenn man quer über die Wiese geht?',
      wall: 'Wand',
      ground: 'Boden',
      ladder: 'Leiter',
      height: 'Höhe',
      distWall: 'Abstand',
      width: 'Breite',
      diag: 'Diagonale',
      around: 'außen herum',
      across: 'quer',
      inch: 'Zoll',
      saving: 'Ersparnis',
      tripleYes: '{a}² + {b}² = {s} = {c}² – ein pythagoreisches Tripel',
      tripleNo: '{a}² + {b}² = {s}, aber √{s} ≈ {c} ist keine ganze Zahl',
      tripleCount: 'Im Gitter bis {n}: {k} Tripel, davon {p} grundlegende (ohne gemeinsamen Teiler)',
      primitive: 'grundlegend',
      multiple: 'Vielfaches',
      legend: 'Gitterpunkte mit ganzzahligem Abstand vom Ursprung',
      qHyp: 'Aufgabe {q}: Die Katheten sind a = {a}\u00a0cm und b = {b}\u00a0cm lang. Berechne die Hypotenuse c.',
      qLeg: 'Aufgabe {q}: Die Hypotenuse ist c = {c}\u00a0cm, eine Kathete a = {a}\u00a0cm lang. Berechne die andere Kathete b.',
      qRound: 'Runde auf zwei Nachkommastellen.',
      okMsg: 'Richtig! {x} {v} cm',
      noMsg: 'Noch nicht. Tipp: {hint}',
      emptyMsg: 'Trag dein Ergebnis unter „Deine Antwort“ ein.',
      hintHyp: 'c = √(a² + b²)',
      hintLeg: 'b = √(c² − a²) – die Hypotenuse ist die längste Seite.',
      wait: 'Deine Antwort fehlt noch.',
    },
    en: {
      canvas: 'Right triangle with squares on its sides, puzzle proof, triangle with an adjustable angle, application examples, grid of Pythagorean triples or a practice task',
      move: 'Rearrange triangles',
      back: 'Move back',
      proofSquares: 'Together, the two squares on the legs have the same area as the square on the hypotenuse.',
      proofPuzzle:
        'Both arrangements place the same four triangles inside the square with side a + b. So the uncovered areas are equal: c² = a² + b².',
      proofAngle: 'Converse: if c² = a² + b², the triangle is right-angled. If c² is smaller, γ is acute; if c² is larger, γ is obtuse.',
      proofTriples: 'A grid point P(a, b) is at distance c = √(a² + b²) from the origin. If it lies on one of the quarter circles with a whole-number radius, a, b, c form a Pythagorean triple.',
      hyp: 'hypotenuse',
      acute: 'c² < a² + b²: γ is acute',
      right: 'c² = a² + b²: γ is a right angle',
      obtuse: 'c² > a² + b²: γ is obtuse',
      sum: 'a² + b²',
      qLadder: 'A ladder is to lean against the wall at a height of {a} m, with its foot {b} m from the wall. How long must it be?',
      qScreen: 'A screen is {b} cm wide and {a} cm high. How long is the diagonal – in cm and in inches?',
      qCoord: 'How far apart are the points P and Q?',
      qField: 'A field is {b} m long and {a} m wide. How much distance do you save by walking across it?',
      wall: 'wall',
      ground: 'ground',
      ladder: 'ladder',
      height: 'height',
      distWall: 'distance',
      width: 'width',
      diag: 'diagonal',
      around: 'around',
      across: 'across',
      inch: 'in',
      saving: 'saving',
      tripleYes: '{a}² + {b}² = {s} = {c}² – a Pythagorean triple',
      tripleNo: '{a}² + {b}² = {s}, but √{s} ≈ {c} is not a whole number',
      tripleCount: 'In the grid up to {n}: {k} triples, {p} of them primitive (no common factor)',
      primitive: 'primitive',
      multiple: 'multiple',
      legend: 'Grid points at a whole-number distance from the origin',
      qHyp: 'Task {q}: The legs are a = {a}\u00a0cm and b = {b}\u00a0cm long. Find the hypotenuse c.',
      qLeg: 'Task {q}: The hypotenuse is c = {c}\u00a0cm and one leg is a = {a}\u00a0cm long. Find the other leg b.',
      qRound: 'Round to two decimal places.',
      okMsg: 'Correct! {x} {v} cm',
      noMsg: 'Not yet. Hint: {hint}',
      emptyMsg: 'Enter your result under “Your answer”.',
      hintHyp: 'c = √(a² + b²)',
      hintLeg: 'b = √(c² − a²) – the hypotenuse is the longest side.',
      wait: 'Your answer is still missing.',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string | number>) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    /** Höhe des Kartenstreifens über der Zeichnung (Umkehrung, Anwendungen, Üben). */
    const stripH = () => {
      if (p.mode !== 'angle' && p.mode !== 'apply' && p.mode !== 'quiz') return 0;
      return surface.width < 520 ? 100 : 88;
    };
    const plot = new Plot(surface, {
      x: [-4, 8],
      y: [-5, 8],
      pan: false,
      zoom: false,
      region: (w, h) => {
        const s = stripH();
        return { x: 0, y: s, w, h: h - s };
      },
    });
    const tween = new Tween(2200, ease.linear);
    const pop = new Tween(450, ease.outBack);
    let startP = 0;
    let targetP = 0;
    let rangeKey = '';
    let quiz: QuizTask = quizTask(1, seededRandom(1));
    let quizState: { ok: boolean; got: number | null } | null = null;
    const triples = triplesUpTo(TRIPLE_N);

    const progress = () => startP + (targetP - startP) * tween.value;
    const colors = () => ({ a: ctx.theme.series[0]!, b: ctx.theme.series[1]!, c: ctx.theme.series[4]!, tri: ctx.theme.series[3]!, ok: ctx.theme.series[2]! });
    const unitOf = () => (p.ex === 'ladder' ? 'm' : p.ex === 'coord' ? '' : p.ex === 'field' ? 'm' : 'cm');
    /** Maßstab der Anwendungen: Reglerwert → echte Länge. */
    const scaleOf = () => (p.ex === 'screen' ? 10 : p.ex === 'field' ? 10 : 1);

    function anglePoints(): { C: Point; A: Point; B: Point; c: number } {
      const g = (p.gam * Math.PI) / 180;
      const C: Point = [0, 0];
      const A: Point = [p.b, 0];
      const B: Point = [p.a * Math.cos(g), p.a * Math.sin(g)];
      return { C, A, B, c: thirdSide(p.a, p.b, p.gam) };
    }

    function fitRange(): void {
      const key = `${p.mode}:${p.a}:${p.b}:${p.gam}:${p.ex}:${quiz.a}:${quiz.b}:${surface.width}:${surface.height}`;
      if (key === rangeKey) return;
      rangeKey = key;
      const { a, b } = p;
      if (p.mode === 'puzzle') {
        const s = a + b;
        plot.setRange([-0.12 * s - 0.6, s + 0.12 * s + 0.6], [-0.12 * s - 0.6, s + 0.12 * s + 0.6]);
      } else if (p.mode === 'angle') {
        const { C, A, B } = anglePoints();
        const pts: Point[] = [C, A, B, ...squareOutward(C, A, B), ...squareOutward(C, B, A), ...squareOutward(A, B, C)];
        const xs = pts.map((q) => q[0]);
        const ys = pts.map((q) => q[1]);
        const m = 0.6;
        plot.setRange([Math.min(...xs) - m, Math.max(...xs) + m], [Math.min(...ys) - m, Math.max(...ys) + m]);
      } else if (p.mode === 'apply') {
        if (p.ex === 'ladder') plot.setRange([-1.6, b + 1.6], [-0.9, a + 1.1]);
        else if (p.ex === 'screen') plot.setRange([-1.4, b + 1.4], [-1.5, a + 0.9]);
        else if (p.ex === 'coord') plot.setRange([-0.9, b + 2.2], [-0.9, a + 2.2]);
        else plot.setRange([-1.4, b + 1.4], [-1.1, a + 1.1]);
      } else if (p.mode === 'triples') {
        plot.setRange([-1.8, TRIPLE_N + 1.2], [-2.6, TRIPLE_N + 6]);
      } else if (p.mode === 'quiz') {
        const m = Math.max(quiz.a, quiz.b) * 0.22 + 0.4;
        plot.setRange([-1.9 * m, quiz.b + m], [-m, quiz.a + m]);
      } else {
        plot.setRange([-a - 0.9, b + a + 0.9], [-b - 0.9, a + b + 0.9]);
      }
    }

    // Ziehbare Ecken: A auf der x-Achse (Kathete b), B auf der y-Achse (Kathete a)
    plot.addHandle({ get: () => [p.b, 0], set: (x) => ctx.set({ b: x }), axis: 'x', enabled: () => !ctx.locked && p.mode === 'squares', color: () => colors().b });
    plot.addHandle({ get: () => [0, p.a], set: (_x, y) => ctx.set({ a: y }), axis: 'y', enabled: () => !ctx.locked && p.mode === 'squares', color: () => colors().a });
    // Umkehrung: Ecke B auf dem Kreis um C mit Radius a
    plot.addHandle({
      get: () => anglePoints().B,
      set: (x, y) => ctx.set({ gam: Math.max(30, Math.min(150, (Math.atan2(y, x) * 180) / Math.PI)) }),
      enabled: () => !ctx.locked && p.mode === 'angle',
      color: () => colors().a,
    });
    // Tripel: Punkt P(a | b) im Gitter
    plot.addHandle({ get: () => [p.ta, p.tb], set: (x, y) => ctx.set({ ta: x, tb: y }), enabled: () => !ctx.locked && p.mode === 'triples', color: () => colors().c });

    /** Raster aus Einheitsquadraten in einem (auch gedrehten) Quadrat mit Ecke `o` und Kanten u, v. */
    function squareGrid(o: Point, u: Point, v: Point, n: number, color: string): void {
      if (!p.grid) return;
      const steps = Math.floor(n + 1e-9);
      for (let i = 1; i <= steps; i++) {
        const t = i / n;
        if (t >= 1 - 1e-9) continue;
        plot.segment([o[0] + u[0] * t, o[1] + u[1] * t], [o[0] + u[0] * t + v[0], o[1] + u[1] * t + v[1]], { color, width: 1, alpha: 0.35 });
        plot.segment([o[0] + v[0] * t, o[1] + v[1] * t], [o[0] + v[0] * t + u[0], o[1] + v[1] * t + u[1]], { color, width: 1, alpha: 0.35 });
      }
    }

    function square(o: Point, u: Point, v: Point, side: number, color: string, label: string, value: number): void {
      const pts: Point[] = [o, [o[0] + u[0], o[1] + u[1]], [o[0] + u[0] + v[0], o[1] + u[1] + v[1]], [o[0] + v[0], o[1] + v[1]]];
      plot.polygon(pts, { fill: color, alpha: 0.2 });
      squareGrid(o, u, v, side, color);
      plot.polygon(pts, { stroke: color, width: 2.5 });
      const cx = o[0] + (u[0] + v[0]) / 2;
      const cy = o[1] + (u[1] + v[1]) / 2;
      const size = Math.max(14, Math.min(24, side * plot.scale.x * 0.22));
      plot.text(cx, cy, label, { math: true, size: size + 2, color, weight: 'bold', align: 'center', baseline: 'middle', offset: [0, p.numbers ? -size * 0.45 : 0] });
      if (p.numbers) plot.text(cx, cy, `= ${fmt.num(value)}`, { size: size - 3, color, align: 'center', baseline: 'middle', offset: [0, size * 0.65] });
    }

    function drawSquares(): void {
      const { a, b } = p;
      const c = Math.hypot(a, b);
      const col = colors();
      const C: Point = [0, 0];
      const A: Point = [b, 0];
      const B: Point = [0, a];
      square(C, [b, 0], [0, -b], b, col.b, 'b²', b * b);
      square(C, [0, a], [-a, 0], a, col.a, 'a²', a * a);
      square(A, [-b, a], [a, b], c, col.c, 'c²', c * c);
      plot.polygon([C, A, B], { fill: col.tri, alpha: 0.3 });
      plot.polygon([C, A, B], { stroke: ctx.theme.text, width: 3 });
      // rechter Winkel
      const s = 14 / plot.scale.x;
      plot.polygon(
        [
          [0, 0],
          [s, 0],
          [s, s],
          [0, s],
        ],
        { stroke: ctx.theme.text, width: 1.5 },
      );
      plot.point(s / 2, s / 2, { color: ctx.theme.text, radius: 2 });
      plot.text(b / 2, 0, 'b', { math: true, size: 18, color: col.b, align: 'center', baseline: 'bottom', offset: [0, -6], weight: 'bold' });
      plot.text(0, a / 2, 'a', { math: true, size: 18, color: col.a, align: 'left', baseline: 'middle', offset: [8, 0], weight: 'bold' });
      plot.text(b / 2, a / 2, 'c', { math: true, size: 18, color: col.c, align: 'right', baseline: 'top', offset: [-6, 6], weight: 'bold' });
      plot.point(b, 0, { color: col.b, radius: 5 });
      plot.point(0, a, { color: col.a, radius: 5 });
    }

    function drawPuzzle(): void {
      const { a, b } = p;
      const s = a + b;
      const col = colors();
      const t = progress();
      const from = arrangementC(a, b);
      const to = arrangementAB(a, b);
      // Rahmen (a + b)²
      plot.polygon(
        [
          [0, 0],
          [s, 0],
          [s, s],
          [0, s],
        ],
        { fill: ctx.theme.gridMinor, alpha: 1 },
      );
      // freie Flächen: c² verblasst, a² und b² erscheinen
      const fadeC = Math.max(0, 1 - t * 2.2);
      const fadeAB = Math.max(0, t * 2.2 - 1.2);
      if (fadeC > 0) {
        const q: Point[] = [
          [a, 0],
          [s, a],
          [b, s],
          [0, b],
        ];
        plot.polygon(q, { fill: col.c, alpha: 0.28 * fadeC, stroke: withAlpha(col.c, fadeC), width: 2.5 });
        plot.text(s / 2, s / 2, 'c²', { math: true, size: 26, weight: 'bold', color: withAlpha(col.c, fadeC), align: 'center', baseline: 'middle' });
      }
      if (fadeAB > 0) {
        plot.polygon(
          [
            [0, 0],
            [a, 0],
            [a, a],
            [0, a],
          ],
          { fill: col.a, alpha: 0.28 * fadeAB, stroke: withAlpha(col.a, fadeAB), width: 2.5 },
        );
        plot.polygon(
          [
            [a, a],
            [s, a],
            [s, s],
            [a, s],
          ],
          { fill: col.b, alpha: 0.28 * fadeAB, stroke: withAlpha(col.b, fadeAB), width: 2.5 },
        );
        plot.text(a / 2, a / 2, 'a²', { math: true, size: 24, weight: 'bold', color: withAlpha(col.a, fadeAB), align: 'center', baseline: 'middle' });
        plot.text(a + b / 2, a + b / 2, 'b²', { math: true, size: 24, weight: 'bold', color: withAlpha(col.b, fadeAB), align: 'center', baseline: 'middle' });
      }
      // vier Dreiecke, nacheinander versetzt bewegt
      from.forEach((tri, i) => {
        const delay = i * 0.18;
        const local = Math.min(1, Math.max(0, (t - delay) / (1 - 0.54)));
        const moved: Triangle = interpolate(tri, to[i]!, ease.inOutCubic(local));
        // leicht unterschiedliche Tönung, damit man jedes Dreieck verfolgen kann
        plot.polygon(moved as unknown as Point[], { fill: col.tri, alpha: [0.55, 0.72, 0.88, 0.64][i] });
        plot.polygon(moved as unknown as Point[], { stroke: ctx.theme.text, width: 2 });
        const [R, A, B] = moved;
        const gx = (R[0] + A[0] + B[0]) / 3;
        const gy = (R[1] + A[1] + B[1]) / 3;
        // Seitenbeschriftung leicht ins Innere des Dreiecks gerückt
        const sideLabel = (P: readonly [number, number], Q: readonly [number, number], label: string) => {
          const mx = (P[0] + Q[0]) / 2;
          const my = (P[1] + Q[1]) / 2;
          plot.text(mx + (gx - mx) * 0.38, my + (gy - my) * 0.38, label, { math: true, size: 15, color: ctx.theme.text, align: 'center', baseline: 'middle' });
        };
        sideLabel(R, A, 'a');
        sideLabel(R, B, 'b');
        sideLabel(A, B, 'c');
      });
      plot.polygon(
        [
          [0, 0],
          [s, 0],
          [s, s],
          [0, s],
        ],
        { stroke: ctx.theme.text, width: 3 },
      );
      plot.text(s / 2, 0, 'a + b', { math: true, size: 16, color: ctx.theme.muted, align: 'center', baseline: 'top', offset: [0, 10] });
    }


    /* ───────────── Hilfen für Karten im Streifen über der Zeichnung ───────────── */

    function cardBox(r: Rect): void {
      const g = surface.g;
      g.save();
      softShadow(g, ctx.theme.dark, 10, 2);
      roundRect(g, r.x, r.y, r.w, r.h, 10);
      g.fillStyle = ctx.theme.bg;
      g.fill();
      g.restore();
      roundRect(g, r.x, r.y, r.w, r.h, 10);
      g.strokeStyle = ctx.theme.grid;
      g.lineWidth = 1;
      g.stroke();
    }

    /** Zerlegt einen Text in Zeilen, die höchstens maxW Pixel breit sind. */
    function wrap(textValue: string, maxW: number, font: string): string[] {
      const g = surface.g;
      g.font = font;
      const words = textValue.split(' ');
      const lines: string[] = [];
      let line = '';
      for (const w of words) {
        const next = line ? `${line} ${w}` : w;
        if (g.measureText(next).width > maxW && line) {
          lines.push(line);
          line = w;
        } else line = next;
      }
      if (line) lines.push(line);
      return lines;
    }

    function stripRect(): Rect {
      const s = stripH();
      return { x: 8, y: 8, w: surface.width - 16, h: s - 14 };
    }

    /** Text (mehrzeilig) in eine Karte schreiben; gibt die y-Position nach der letzten Zeile zurück. */
    function cardText(r: Rect, lines: string[], y: number, size: number, color: string, weight = 'normal'): number {
      const g = surface.g;
      g.font = `${weight} ${size}px ${ctx.theme.font}`;
      g.fillStyle = color;
      g.textAlign = 'left';
      g.textBaseline = 'top';
      for (const l of lines) {
        g.fillText(l.replace(/-(?=\d)/g, '−'), r.x + 12, y);
        y += size * 1.3;
      }
      return y;
    }

    function fitText(r: Rect, textValue: string, maxLines: number): { lines: string[]; size: number } {
      for (let size = 15; size >= 11; size--) {
        const lines = wrap(textValue, r.w - 24, `normal ${size}px ${ctx.theme.font}`);
        if (lines.length <= maxLines) return { lines, size };
      }
      return { lines: wrap(textValue, r.w - 24, `normal 11px ${ctx.theme.font}`).slice(0, maxLines), size: 11 };
    }

    function rightAngle(at: Point, u: Point, v: Point): void {
      const s = 13 / plot.scale.x;
      const lu = Math.hypot(u[0], u[1]);
      const lv = Math.hypot(v[0], v[1]);
      const e1: Point = [(u[0] / lu) * s, (u[1] / lu) * s];
      const e2: Point = [(v[0] / lv) * s, (v[1] / lv) * s];
      plot.polygon([at, [at[0] + e1[0], at[1] + e1[1]], [at[0] + e1[0] + e2[0], at[1] + e1[1] + e2[1]], [at[0] + e2[0], at[1] + e2[1]]], { stroke: ctx.theme.text, width: 1.5 });
      plot.point(at[0] + (e1[0] + e2[0]) / 2, at[1] + (e1[1] + e2[1]) / 2, { color: ctx.theme.text, radius: 1.8 });
    }

    /* ───────────── Umkehrung: Winkel γ veränderlich ───────────── */

    function drawAngle(): void {
      const { C, A, B, c } = anglePoints();
      const col = colors();
      const sq = (P: Point, Q: Point, R: Point, side: number, color: string, label: string, value: number) => {
        const [o, q1, , q3] = squareOutward(P, Q, R);
        square(o, [q1[0] - o[0], q1[1] - o[1]], [q3[0] - o[0], q3[1] - o[1]], side, color, label, value);
      };
      sq(C, A, B, p.b, col.b, 'b²', p.b * p.b);
      sq(C, B, A, p.a, col.a, 'a²', p.a * p.a);
      sq(A, B, C, c, col.c, 'c²', c * c);
      plot.polygon([C, A, B], { fill: col.tri, alpha: 0.3 });
      plot.polygon([C, A, B], { stroke: ctx.theme.text, width: 3 });
      const kind = classify(p.a, p.b, c, 1e-6);
      if (kind === 'right') rightAngle(C, A, B);
      else {
        plot.arcPx(0, 0, 26, 0, (p.gam * Math.PI) / 180, { stroke: ctx.theme.text, width: 1.8 });
      }
      const g2 = (p.gam * Math.PI) / 360;
      plot.text(0, 0, 'γ', { math: true, size: 15, color: ctx.theme.text, align: 'center', baseline: 'middle', offset: [40 * Math.cos(g2), -40 * Math.sin(g2)] });
      const mid = (P: Point, Q: Point): Point => [(P[0] + Q[0]) / 2, (P[1] + Q[1]) / 2];
      const inward = (P: Point, Q: Point, R: Point, label: string, color: string) => {
        const m = mid(P, Q);
        const dx = R[0] - m[0];
        const dy = R[1] - m[1];
        const d = Math.hypot(dx, dy) || 1;
        plot.text(m[0], m[1], label, { math: true, size: 17, weight: 'bold', color, align: 'center', baseline: 'middle', offset: [(dx / d) * 13, (-dy / d) * 13] });
      };
      // Seitenbuchstaben nur, wenn innen genug Platz ist (die Quadrate sind ohnehin beschriftet)
      if (Math.min(p.a, p.b, c) * plot.scale.x >= 120) {
        inward(C, A, B, 'b', col.b);
        inward(C, B, A, 'a', col.a);
        inward(A, B, C, 'c', col.c);
      }
      plot.text(C[0], C[1], 'C', { math: true, size: 15, color: ctx.theme.muted, align: 'right', baseline: 'top', offset: [-6, 6] });
      plot.text(A[0], A[1], 'A', { math: true, size: 15, color: ctx.theme.muted, align: 'left', baseline: 'top', offset: [6, 6] });
      plot.text(B[0], B[1], 'B', { math: true, size: 15, color: ctx.theme.muted, align: 'right', baseline: 'bottom', offset: [-8, -6] });
    }

    function drawAngleStrip(): void {
      const r = stripRect();
      cardBox(r);
      const g = surface.g;
      const col = colors();
      const c = thirdSide(p.a, p.b, p.gam);
      const sum = p.a * p.a + p.b * p.b;
      const c2 = c * c;
      const kind = classify(p.a, p.b, c, 1e-6);
      const pk = pop.running ? pop.value : 1;
      const labelW = 54;
      const verdictW = Math.min(300, r.w * 0.36);
      const narrowStrip = r.w < 520;
      const barX = r.x + 12 + labelW;
      const barMax = narrowStrip ? r.w - labelW - 24 : r.w - labelW - verdictW - 36;
      const maxV = Math.max(sum, c2, 1);
      const bh = 14;
      const y1 = r.y + 12;
      const y2 = y1 + bh + 8;
      g.font = `italic 600 15px ${ctx.theme.mathFont}`;
      g.textAlign = 'left';
      g.textBaseline = 'middle';
      g.fillStyle = ctx.theme.text;
      g.fillText('a² + b²', r.x + 12, y1 + bh / 2);
      g.fillText('c²', r.x + 12, y2 + bh / 2);
      g.font = `600 12px ${ctx.theme.font}`;
      g.fillStyle = ctx.theme.muted;
      const wa = (p.a * p.a * barMax) / maxV;
      const wb = (p.b * p.b * barMax) / maxV;
      const wc = (c2 * barMax * pk) / maxV;
      g.fillStyle = col.a;
      g.fillRect(barX, y1, wa, bh);
      g.fillStyle = col.b;
      g.fillRect(barX + wa, y1, wb, bh);
      g.fillStyle = col.c;
      g.fillRect(barX, y2, wc, bh);
      g.strokeStyle = ctx.theme.text;
      g.setLineDash([4, 3]);
      g.beginPath();
      g.moveTo(barX + wa + wb + 0.5, y1 - 3);
      g.lineTo(barX + wa + wb + 0.5, y2 + bh + 3);
      g.stroke();
      g.setLineDash([]);
      if (p.numbers) {
        g.font = `600 12px ${ctx.theme.font}`;
        const put = (v: number, x: number, y: number, w: number, fill: string) => {
          const s = fmt.num(v);
          const tw = g.measureText(s).width;
          if (w > tw + 8) {
            g.fillStyle = textOn(fill, ctx.theme);
            g.textAlign = 'center';
            g.fillText(s, x + w / 2, y + bh / 2 + 0.5);
          }
        };
        put(p.a * p.a, barX, y1, wa, col.a);
        put(p.b * p.b, barX + wa, y1, wb, col.b);
        put(c2, barX, y2, wc, col.c);
      }
      const verdict = `γ = ${fmt.num(p.gam, 0)}° · ${ctx.t(kind)}`;
      const vColor = kind === 'right' ? col.ok : ctx.theme.text;
      if (narrowStrip) {
        cardText(r, [verdict], y2 + bh + 8, 12, vColor, kind === 'right' ? '600' : 'normal');
      } else {
        const lines = wrap(verdict, verdictW, `600 14px ${ctx.theme.font}`);
        const vx = r.x + r.w - verdictW - 12;
        g.font = `600 14px ${ctx.theme.font}`;
        g.fillStyle = vColor;
        g.textAlign = 'left';
        g.textBaseline = 'middle';
        const top = r.y + r.h / 2 - ((lines.length - 1) * 18) / 2;
        lines.forEach((l, i) => g.fillText(l, vx, top + i * 18));
      }
    }

    /* ───────────── Anwendungen ───────────── */

    function applyQuestion(): string {
      const k = scaleOf();
      const vars = { a: fmt.num(p.a * k), b: fmt.num(p.b * k) };
      return tr(p.ex === 'ladder' ? 'qLadder' : p.ex === 'screen' ? 'qScreen' : p.ex === 'coord' ? 'qCoord' : 'qField', vars);
    }

    function lenLabel(v: number, unit: string): string {
      return unit ? `${fmt.num(v)} ${unit}` : fmt.num(v);
    }

    function drawApply(): void {
      const { a, b } = p;
      const c = Math.hypot(a, b);
      const col = colors();
      const k = scaleOf();
      const unit = unitOf();
      const cText = p.numbers ? `c ${fmt.approx(c * k)}${unit ? ` ${unit}` : ''}` : 'c = ?';
      const g = surface.g;
      if (p.ex === 'ladder') {
        const bd = plot.bounds;
        plot.polygon([[bd.xMin, 0], [bd.xMax, 0], [bd.xMax, bd.yMin], [bd.xMin, bd.yMin]], { fill: ctx.theme.muted, alpha: 0.16 });
        plot.segment([bd.xMin, 0], [bd.xMax, 0], { color: ctx.theme.muted, width: 2 });
        // Wand mit Ziegelfugen
        plot.polygon([[-0.55, 0], [0, 0], [0, bd.yMax], [-0.55, bd.yMax]], { fill: ctx.theme.dark ? '#7a4a3a' : '#c98b6b', alpha: 0.75 });
        for (let y = 0.25; y < bd.yMax; y += 0.25) plot.segment([-0.55, y], [0, y], { color: ctx.theme.bg, width: 1, alpha: 0.6 });
        plot.segment([0, 0], [0, bd.yMax], { color: ctx.theme.text, width: 1.5 });
        plot.polygon([[0, 0], [b, 0], [0, a]], { fill: col.tri, alpha: 0.12 });
        // Leiter: zwei Holme und Sprossen
        const len = c;
        const ux = -b / len;
        const uy = a / len;
        // Normale nach rechts oben: Die Holme liegen neben der Dreiecksseite, nicht in der Wand
        const nx = (a / len) * 0.3;
        const ny = (b / len) * 0.3;
        const wood = ctx.theme.dark ? '#d9a25f' : '#a86b2d';
        plot.segment([b, 0], [0, a], { color: wood, width: 4 });
        plot.segment([b + nx, ny], [nx, a + ny], { color: wood, width: 4 });
        for (let s = 0.3; s < len - 0.1; s += 0.3) {
          const px = b + ux * s;
          const py = uy * s;
          plot.segment([px, py], [px + nx, py + ny], { color: wood, width: 2.5 });
        }
        rightAngle([0, 0], [1, 0], [0, 1]);
        plot.text(-0.55, a / 2, `a = ${lenLabel(a, unit)}`, { size: 14, weight: '600', color: col.a, align: 'right', baseline: 'middle', offset: [-8, 0] });
        plot.text(b / 2, 0, `b = ${lenLabel(b, unit)}`, { size: 14, weight: '600', color: col.b, align: 'center', baseline: 'top', offset: [0, 8] });
        plot.text(b / 2, a / 2, cText, { size: 15, weight: 'bold', color: col.c, align: 'left', baseline: 'bottom', offset: [26, -10] });
        plot.segment([0, 0], [0, a], { color: col.a, width: 3 });
        plot.segment([0, 0], [b, 0], { color: col.b, width: 3 });
      } else if (p.ex === 'screen') {
        const x0 = plot.px(-0.25);
        const y0 = plot.py(a + 0.25);
        const x1 = plot.px(b + 0.25);
        const y1 = plot.py(-0.25);
        g.save();
        softShadow(g, ctx.theme.dark, 16, 5);
        roundRect(g, x0, y0, x1 - x0, y1 - y0, 10);
        g.fillStyle = ctx.theme.dark ? '#0b0f17' : '#1d2433';
        g.fill();
        g.restore();
        const sx0 = plot.px(0);
        const sy0 = plot.py(a);
        const sx1 = plot.px(b);
        const sy1 = plot.py(0);
        const grad = g.createLinearGradient(sx0, sy0, sx1, sy1);
        grad.addColorStop(0, ctx.theme.dark ? '#1e3a6b' : '#3c78c8');
        grad.addColorStop(1, ctx.theme.dark ? '#3a2a66' : '#7c5cc4');
        g.fillStyle = grad;
        g.fillRect(sx0, sy0, sx1 - sx0, sy1 - sy0);
        // Standfuß
        plot.polygon([[b / 2 - 0.25, -0.25], [b / 2 + 0.25, -0.25], [b / 2 + 0.45, -0.95], [b / 2 - 0.45, -0.95]], { fill: ctx.theme.dark ? '#3a4252' : '#59627a', alpha: 1 });
        plot.polygon([[b / 2 - 1.1, -0.95], [b / 2 + 1.1, -0.95], [b / 2 + 1.1, -1.08], [b / 2 - 1.1, -1.08]], { fill: ctx.theme.dark ? '#3a4252' : '#59627a', alpha: 1 });
        plot.segment([0, 0], [b, a], { color: '#ffffff', width: 3, dash: [8, 6] });
        plot.segment([0, 0], [b, 0], { color: col.b, width: 3 });
        plot.segment([b, 0], [b, a], { color: col.a, width: 3 });
        rightAngle([b, 0], [-1, 0], [0, 1]);
        const inch = (c * k) / 2.54;
        plot.text(b / 2, a / 2, p.numbers ? `c ${fmt.approx(c * k, 1)} cm ${fmt.approx(inch, 1)} ${ctx.t('inch')}` : 'c = ?', { size: 15, weight: 'bold', color: '#ffffff', align: 'right', baseline: 'bottom', offset: [-14, -14], halo: false });
        plot.text(b * 0.2, -0.25, `b = ${fmt.num(b * k)} cm`, { size: 14, weight: '600', color: col.b, align: 'center', baseline: 'top', offset: [0, 6] });
        plot.text(b + 0.25, a / 2, `a = ${fmt.num(a * k)} cm`, { size: 14, weight: '600', color: col.a, align: 'left', baseline: 'middle', offset: [6, 0] });
      } else if (p.ex === 'coord') {
        plot.grid();
        plot.axes();
        const P: Point = [1, 1];
        const Q: Point = [1 + b, 1 + a];
        const R: Point = [1 + b, 1];
        plot.polygon([P, R, Q], { fill: col.tri, alpha: 0.15 });
        plot.segment(P, R, { color: col.b, width: 3, dash: [7, 5] });
        plot.segment(R, Q, { color: col.a, width: 3, dash: [7, 5] });
        plot.segment(P, Q, { color: col.c, width: 3.5 });
        rightAngle(R, [-1, 0], [0, 1]);
        plot.point(P[0], P[1], { color: ctx.theme.text, radius: 5 });
        plot.point(Q[0], Q[1], { color: ctx.theme.text, radius: 5 });
        plot.text(P[0], P[1], `P${fmt.point(P[0], P[1])}`, { size: 14, weight: '600', align: 'right', baseline: 'top', offset: [-6, 6] });
        plot.text(Q[0], Q[1], `Q${fmt.point(Q[0], Q[1])}`, { size: 14, weight: '600', align: 'right', baseline: 'bottom', offset: [-8, -6] });
        plot.text((P[0] + R[0]) / 2, 1, `Δx = ${fmt.num(b)}`, { size: 13, weight: '600', color: col.b, align: 'center', baseline: 'top', offset: [0, 8] });
        plot.text(R[0], (R[1] + Q[1]) / 2, `Δy = ${fmt.num(a)}`, { size: 13, weight: '600', color: col.a, align: 'left', baseline: 'middle', offset: [8, 0] });
        plot.text((P[0] + Q[0]) / 2, (P[1] + Q[1]) / 2, p.numbers ? `d ${fmt.approx(c)}` : 'd = ?', { size: 15, weight: 'bold', color: col.c, align: 'right', baseline: 'bottom', offset: [-10, -6] });
      } else {
        // Wiese mit Mähstreifen
        const grass = ctx.theme.dark ? '#2f5a35' : '#7cc47f';
        plot.polygon([[0, 0], [b, 0], [b, a], [0, a]], { fill: grass, alpha: 0.85 });
        for (let x = 0.5; x < b; x += 0.5) plot.segment([x, 0], [x, a], { color: ctx.theme.dark ? '#3c6b42' : '#91d093', width: 6, alpha: 0.5 });
        const path = ctx.theme.dark ? '#c9a66b' : '#9a6b2f';
        plot.segment([0, 0], [b, 0], { color: col.tri, width: 4, dash: [9, 6] });
        plot.segment([b, 0], [b, a], { color: col.tri, width: 4, dash: [9, 6] });
        plot.segment([0, 0], [b, a], { color: path, width: 6 });
        plot.segment([0, 0], [b, a], { color: col.c, width: 2.5 });
        rightAngle([b, 0], [-1, 0], [0, 1]);
        plot.point(0, 0, { color: ctx.theme.text, radius: 6 });
        plot.point(b, a, { color: ctx.theme.text, radius: 6 });
        plot.text(b / 2, 0, `b = ${fmt.num(b * k)} m`, { size: 14, weight: '600', color: col.b, align: 'center', baseline: 'top', offset: [0, 8] });
        plot.text(b, a / 2, `a = ${fmt.num(a * k)} m`, { size: 14, weight: '600', color: col.a, align: 'left', baseline: 'middle', offset: [10, 0] });
        const cc = c * k;
        plot.text(b / 2, a / 2, p.numbers ? `c ${fmt.approx(cc, 1)} m` : 'c = ?', { size: 15, weight: 'bold', color: col.c, align: 'right', baseline: 'bottom', offset: [-16, -14] });
        if (p.numbers) {
          plot.text(b / 2, a, `${ctx.t('saving')}: ${fmt.num((a + b) * k)} m − ${fmt.num(cc, 1)} m ${fmt.approx((a + b) * k - cc, 1)} m`, { size: 13, weight: '600', color: ctx.theme.text, align: 'center', baseline: 'bottom', offset: [0, -8] });
        }
      }
    }

    function drawApplyStrip(): void {
      const r = stripRect();
      cardBox(r);
      const { lines, size } = fitText(r, applyQuestion(), 3);
      const total = lines.length * size * 1.3;
      cardText(r, lines, r.y + (r.h - total) / 2, size, ctx.theme.text);
    }

    /* ───────────── Pythagoreische Tripel ───────────── */

    function drawTriples(): void {
      const col = colors();
      const N = TRIPLE_N;
      for (let i = 0; i <= N; i++) {
        const major = i % 5 === 0;
        plot.segment([i, 0], [i, N], { color: major ? ctx.theme.grid : ctx.theme.gridMinor, width: 1 });
        plot.segment([0, i], [N, i], { color: major ? ctx.theme.grid : ctx.theme.gridMinor, width: 1 });
        if (major && i > 0) {
          plot.text(i, 0, fmt.num(i), { size: 11, color: ctx.theme.muted, align: 'center', baseline: 'top', offset: [0, 5] });
          plot.text(0, i, fmt.num(i), { size: 11, color: ctx.theme.muted, align: 'right', baseline: 'middle', offset: [-5, 0] });
        }
      }
      plot.segment([0, 0], [N, 0], { color: ctx.theme.axis, width: 1.5 });
      plot.segment([0, 0], [0, N], { color: ctx.theme.axis, width: 1.5 });
      const a = p.ta;
      const b = p.tb;
      const cInt = integerHypotenuse(a, b);
      const c = Math.hypot(a, b);
      // Viertelkreis durch P
      const rr = Math.min(c, N * 1.45);
      plot.arc(0, 0, rr, 0, Math.PI / 2, { stroke: cInt !== null ? col.c : ctx.theme.muted, width: cInt !== null ? 2 : 1.5, alpha: 0.85 });
      plot.polygon([[0, 0], [a, 0], [a, b]], { fill: col.tri, alpha: 0.28 });
      plot.segment([0, 0], [a, 0], { color: col.a, width: 3 });
      plot.segment([a, 0], [a, b], { color: col.b, width: 3 });
      plot.segment([0, 0], [a, b], { color: col.c, width: 3 });
      if (a >= 2 && b >= 2) rightAngle([a, 0], [-1, 0], [0, 1]);
      for (const t of triples) {
        plot.point(t.a, t.b, t.primitive ? { color: col.ok, radius: 4.5 } : { color: col.c, radius: 4, hollow: true });
      }
      if (p.numbers) {
        const cl = cInt !== null ? `c = ${fmt.num(cInt)}` : `c ${fmt.approx(c)}`;
        plot.text(a / 2, b / 2, cl, { size: 14, weight: 'bold', color: col.c, align: 'right', baseline: 'bottom', offset: [-8, -4] });
        plot.text(a / 2, 0, `a = ${fmt.num(a)}`, { size: 13, weight: '600', color: col.a, align: 'center', baseline: 'top', offset: [0, 18] });
        plot.text(a, Math.min(b / 2, 3), `b = ${fmt.num(b)}`, { size: 13, weight: '600', color: col.b, align: 'left', baseline: 'middle', offset: [8, 0] });
      }
      // Legende oben links
      const lx = plot.px(0) + 10;
      const ly = Math.max(plot.rect.y + 4, plot.py(N) - 58);
      const g = surface.g;
      g.save();
      g.font = `600 12px ${ctx.theme.font}`;
      const showTitle = g.measureText(ctx.t('legend')).width + 30 < surface.width - lx;
      const w = Math.max(showTitle ? g.measureText(ctx.t('legend')).width : 0, 170) + 20;
      const lh = showTitle ? 50 : 30;
      const ly2 = showTitle ? ly : ly + 20;
      cardBox({ x: lx, y: ly2, w, h: lh });
      g.fillStyle = ctx.theme.text;
      g.textAlign = 'left';
      g.textBaseline = 'middle';
      if (showTitle) g.fillText(ctx.t('legend'), lx + 10, ly + 14);
      g.font = `normal 12px ${ctx.theme.font}`;
      g.fillStyle = col.ok;
      g.beginPath();
      g.arc(lx + 16, ly + 35, 4.5, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = ctx.theme.text;
      g.fillText(ctx.t('primitive'), lx + 26, ly + 35);
      const x2 = lx + 36 + g.measureText(ctx.t('primitive')).width + 14;
      g.strokeStyle = col.c;
      g.lineWidth = 2;
      g.beginPath();
      g.arc(x2, ly + 35, 4, 0, Math.PI * 2);
      g.stroke();
      g.fillText(ctx.t('multiple'), x2 + 10, ly + 35);
      g.restore();
    }

    /* ───────────── Üben ───────────── */

    function quizText(): string {
      const vars = { q: p.q, a: fmt.num(quiz.a), b: fmt.num(quiz.b, 2), c: fmt.num(quiz.c, 2) };
      const base = tr(quiz.find === 'c' ? 'qHyp' : 'qLeg', vars);
      return quiz.rounded ? `${base} ${ctx.t('qRound')}` : base;
    }

    function quizFeedback(): { text: string; color: string } | null {
      if (!quizState) return null;
      const col = colors();
      if (quizState.got === null) return { text: ctx.t('wait'), color: ctx.theme.muted };
      if (quizState.ok) return { text: tr('okMsg', { x: quiz.find, v: fmt.approx(quiz.answer) }), color: col.ok };
      return { text: tr('noMsg', { hint: ctx.t(quiz.find === 'c' ? 'hintHyp' : 'hintLeg') }), color: ctx.theme.series[1]! };
    }

    function drawQuiz(): void {
      const col = colors();
      const { a, b, c } = quiz;
      const C: Point = [0, 0];
      const A: Point = [b, 0];
      const B: Point = [0, a];
      const solved = quizState?.ok === true;
      plot.polygon([C, A, B], { fill: col.tri, alpha: 0.25 });
      plot.segment(C, B, { color: col.a, width: 4 });
      plot.segment(C, A, { color: col.b, width: quiz.find === 'b' && !solved ? 2 : 4, dash: quiz.find === 'b' && !solved ? [8, 6] : undefined });
      plot.segment(A, B, { color: col.c, width: quiz.find === 'c' && !solved ? 2 : 4, dash: quiz.find === 'c' && !solved ? [8, 6] : undefined });
      rightAngle(C, [1, 0], [0, 1]);
      const s = solved && pop.running ? 0.6 + 0.4 * pop.value : 1;
      plot.text(0, a / 2, `a = ${fmt.num(a)} cm`, { size: 15, weight: '600', color: col.a, align: 'right', baseline: 'middle', offset: [-10, 0] });
      const unknown = (v: number) => (solved ? fmt.approx(v) : '= ?');
      plot.text(b / 2, 0, quiz.find === 'b' ? `b ${unknown(b)}${solved ? ' cm' : ''}` : `b = ${fmt.num(b)} cm`, {
        size: quiz.find === 'b' ? Math.round(17 * s) : 15,
        weight: quiz.find === 'b' ? 'bold' : '600',
        color: col.b,
        align: 'center',
        baseline: 'top',
        offset: [0, 10],
      });
      plot.text(b / 2, a / 2, quiz.find === 'c' ? `c ${unknown(c)}${solved ? ' cm' : ''}` : `c = ${fmt.num(c)} cm`, {
        size: quiz.find === 'c' ? Math.round(17 * s) : 15,
        weight: quiz.find === 'c' ? 'bold' : '600',
        color: col.c,
        align: 'left',
        baseline: 'bottom',
        offset: [10, -8],
      });
    }

    function drawQuizStrip(): void {
      const r = stripRect();
      cardBox(r);
      const fb = quizFeedback();
      const { lines, size } = fitText(r, quizText(), fb ? 2 : 3);
      let y = r.y + 10;
      y = cardText(r, lines, y, size, ctx.theme.text);
      if (fb) cardText(r, wrap(fb.text, r.w - 24, `600 ${size}px ${ctx.theme.font}`).slice(0, 1), y + 2, size, fb.color, '600');
    }

    function newQuiz(): void {
      quiz = quizTask(p.q, seededRandom(p.q * 7919 + 13));
      quizState = null;
      rangeKey = '';
    }

    function updateAction(): void {
      ctx.setAction('move', { label: ctx.t(targetP > 0.5 ? 'back' : 'move') });
    }

    function updateReadouts(): void {
      const none = () => {
        for (const k of ['task', 'sides', 'areas', 'calc', 'verdict', 'proof']) ctx.readout(k, null);
      };
      none();
      const { a, b } = p;
      if (p.mode === 'squares' || p.mode === 'puzzle') {
        const c = Math.hypot(a, b);
        ctx.readout('sides', `a = ${fmt.num(a)}, b = ${fmt.num(b)}, c ${fmt.approx(c, 3)}`);
        ctx.readout('areas', `a² + b² = ${fmt.num(a * a)} + ${fmt.num(b * b)} = ${fmt.num(a * a + b * b)} = c²`);
        ctx.readout('proof', ctx.t(p.mode === 'puzzle' ? 'proofPuzzle' : 'proofSquares'));
      } else if (p.mode === 'angle') {
        const c = thirdSide(a, b, p.gam);
        ctx.readout('sides', `a = ${fmt.num(a)}, b = ${fmt.num(b)}, γ = ${fmt.num(p.gam, 0)}° → c ${fmt.approx(c, 3)}`);
        ctx.readout('areas', `a² + b² = ${fmt.num(a * a + b * b)}, c² ${fmt.approx(c * c)}`);
        ctx.readout('verdict', ctx.t(classify(a, b, c, 1e-6)));
        ctx.readout('proof', ctx.t('proofAngle'));
      } else if (p.mode === 'apply') {
        const k = scaleOf();
        const unit = unitOf();
        const u = unit ? ` ${unit}` : '';
        const A = a * k;
        const B = b * k;
        const c = Math.hypot(A, B);
        const name = p.ex === 'coord' ? 'd' : 'c';
        ctx.readout('task', applyQuestion());
        let calc = `${name} = √(${fmt.num(A)}² + ${fmt.num(B)}²) = √${fmt.num(A * A + B * B)} ${fmt.approx(c)}${u}`;
        if (p.ex === 'screen') calc += ` ${fmt.approx(c / 2.54, 1)} ${ctx.t('inch')}`;
        if (p.ex === 'field') calc += `; ${ctx.t('saving')}: ${fmt.num(A + B)} m − ${fmt.num(c, 1)} m ${fmt.approx(A + B - c, 1)} m`;
        ctx.readout('calc', calc);
      } else if (p.mode === 'triples') {
        const cInt = integerHypotenuse(p.ta, p.tb);
        const s = p.ta * p.ta + p.tb * p.tb;
        ctx.readout('sides', cInt !== null ? tr('tripleYes', { a: p.ta, b: p.tb, s, c: cInt }) : tr('tripleNo', { a: p.ta, b: p.tb, s, c: fmt.num(Math.sqrt(s)) }));
        ctx.readout('verdict', tr('tripleCount', { n: TRIPLE_N, k: triples.length / 2, p: triples.filter((t) => t.primitive).length / 2 }));
        ctx.readout('proof', ctx.t('proofTriples'));
      } else {
        ctx.readout('task', quizText());
        const fb = quizFeedback();
        ctx.readout('verdict', fb ? fb.text : ctx.t('emptyMsg'));
      }
    }

    return {
      update(changed, source) {
        if (changed.has('mode')) {
          startP = 0;
          targetP = 0;
          tween.finish();
          updateAction();
        }
        if (changed.has('q') || source === 'init' || source === 'replace') newQuiz();
        if (changed.has('ans') && quizState && !quizState.ok) quizState = null;
        fitRange();
        updateReadouts();
      },

      action(id) {
        if (ctx.locked) return;
        if (id === 'move') {
          startP = progress();
          targetP = targetP > 0.5 ? 0 : 1;
          tween.play(Math.max(200, 2200 * Math.abs(targetP - startP)));
          updateAction();
        } else if (id === 'right') {
          ctx.set({ gam: 90 });
          pop.play();
        } else if (id === 'check') {
          quizState = checkAnswer(quiz, p.ans);
          pop.play();
          updateReadouts();
          const fb = quizFeedback();
          if (fb) ctx.announce(fb.text);
        } else if (id === 'newq') {
          ctx.set({ q: p.q >= 999 ? 1 : p.q + 1, ans: '' });
        }
        ctx.requestRender();
      },

      render() {
        plot.resize();
        fitRange();
        surface.begin();
        plot.begin();
        if (p.mode === 'puzzle') drawPuzzle();
        else if (p.mode === 'angle') drawAngle();
        else if (p.mode === 'apply') drawApply();
        else if (p.mode === 'triples') drawTriples();
        else if (p.mode === 'quiz') drawQuiz();
        else drawSquares();
        plot.end();
        if (p.mode === 'angle') drawAngleStrip();
        else if (p.mode === 'apply') drawApplyStrip();
        else if (p.mode === 'quiz') drawQuizStrip();
        if (tween.running || pop.running) ctx.requestRender();
      },

      destroy: () => surface.destroy(),
    };
  },
});
