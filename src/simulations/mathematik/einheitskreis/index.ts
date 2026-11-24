import { defineSimulation, degToRad, ease, formatPiFraction, mod, Plot, radToDeg, roundRect, seededRandom, softShadow, Surface, TapTarget, Tween, type Rect } from '../../../sim-core';
import { angleTask, checkAngle, exactTrig, quadrant, relatedAngle, solveTrig, SPECIAL_ANGLES, tanDefined, type AngleTask, type Relation } from './model';

const L = (de: string, en: string) => ({ de, en });
const TAU = Math.PI * 2;
const ROMAN = ['', 'I', 'II', 'III', 'IV'];

/** Nebeneinander (breit) oder untereinander (schmal)? */
const isWide = (w: number) => w >= 600;
const circleSize = (w: number, h: number) => Math.min(h, w * 0.42);

const circleRegion = (w: number, h: number): Rect => {
  if (!isWide(w)) return { x: 0, y: 0, w, h: h * 0.56 };
  const size = circleSize(w, h);
  return { x: 0, y: (h - size) / 2, w: size, h: size };
};

const graphRegion = (w: number, h: number): Rect => {
  if (!isWide(w)) return { x: 0, y: h * 0.56, w, h: h * 0.44 };
  const size = circleSize(w, h);
  return { x: size, y: 0, w: w - size, h };
};

/**
 * Einheitskreis: Ein Punkt P läuft auf dem Kreis mit Radius 1. Seine
 * Koordinaten sind (cos α | sin α). Rechts entsteht daraus der Graph von
 * Sinus und Kosinus – die waagerechte Hilfslinie zeigt den Zusammenhang.
 */
export default defineSimulation({
  id: 'einheitskreis',
  animated: true,
  dragHint: true,
  layout: { aspect: 2.25, aspectNarrow: 0.78 },
  groups: [
    { id: 'show', label: L('Anzeige', 'Display') },
    { id: 'anim', label: L('Animation', 'Animation') },
  ],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Thema', 'Topic'),
      options: [
        { value: 'explore', label: L('Sinus und Kosinus am Kreis', 'Sine and cosine on the circle') },
        { value: 'symm', label: L('Symmetrien', 'Symmetries') },
        { value: 'solve', label: L('Gleichung lösen', 'Solve an equation') },
        { value: 'quiz', label: L('Üben: Winkel finden', 'Practice: find the angle') },
      ],
      default: 'explore',
    },
    { key: 'angle', type: 'number', label: L('Winkel α', 'Angle α'), min: 0, max: 360, step: 0.5, default: 30, unit: '°', visibleIf: (v) => v.mode === 'explore' || v.mode === 'symm' },
    {
      key: 'rel',
      type: 'choice',
      label: L('Zugehöriger Winkel', 'Related angle'),
      options: [
        { value: 'y', label: L('180° − α', '180° − α') },
        { value: 'o', label: L('180° + α', '180° + α') },
        { value: 'x', label: L('360° − α', '360° − α') },
      ],
      default: 'y',
      visibleIf: (v) => v.mode === 'symm',
    },
    {
      key: 'fn',
      type: 'choice',
      label: L('Gleichung', 'Equation'),
      options: [
        { value: 'sin', label: L('sin α = c', 'sin α = c') },
        { value: 'cos', label: L('cos α = c', 'cos α = c') },
      ],
      default: 'sin',
      visibleIf: (v) => v.mode === 'solve',
    },
    { key: 'cv', type: 'number', label: L('Wert c', 'Value c'), min: -1, max: 1, step: 0.05, default: 0.5, visibleIf: (v) => v.mode === 'solve' },
    { key: 'q', type: 'number', label: L('Aufgabe Nr.', 'Task no.'), min: 1, max: 999, step: 1, default: 1, visibleIf: (v) => v.mode === 'quiz' },
    {
      key: 'unit',
      type: 'choice',
      label: L('Winkelmaß der Graph-Achse', 'Angle unit of the graph axis'),
      options: [
        { value: 'deg', label: L('Gradmaß', 'Degrees') },
        { value: 'rad', label: L('Bogenmaß', 'Radians') },
      ],
      default: 'deg',
    },
    { key: 'sin', type: 'boolean', group: 'show', label: L('Sinus', 'Sine'), default: true, visibleIf: (v) => v.mode === 'explore' || v.mode === 'symm' },
    { key: 'cos', type: 'boolean', group: 'show', label: L('Kosinus', 'Cosine'), default: true, visibleIf: (v) => v.mode === 'explore' || v.mode === 'symm' },
    { key: 'tan', type: 'boolean', group: 'show', label: L('Tangens', 'Tangent'), default: false, visibleIf: (v) => v.mode === 'explore' },
    { key: 'snap', type: 'boolean', group: 'show', label: L('Beim Ziehen auf 5°-Schritte einrasten', 'Snap to 5° steps when dragging'), default: true, visibleIf: (v) => v.mode === 'explore' || v.mode === 'symm' },
    { key: 'show', type: 'boolean', group: 'show', label: L('Lösungen im Bild', 'Solutions in the picture'), default: true, visibleIf: (v) => v.mode === 'solve' },
    { key: 'speed', type: 'number', group: 'anim', label: L('Geschwindigkeit', 'Speed'), min: 5, max: 120, step: 5, default: 30, unit: '°/s', visibleIf: (v) => v.mode === 'explore' || v.mode === 'symm' },
  ],
  hint: (v) => {
    if (v.mode === 'symm') return L('Tipp: Zieh P – der gespiegelte Punkt läuft mit. Vergleiche die Höhen im Graphen.', 'Tip: Drag P – the reflected point moves along. Compare the heights in the graph.');
    if (v.mode === 'solve') return L('Tipp: Zieh die waagrechte Linie im Graphen oder den Regler c – beide Schnittpunkte sind Lösungen.', 'Tip: Drag the horizontal line in the graph or the slider c – both intersections are solutions.');
    if (v.mode === 'quiz') return L('Tipp: Tippe auf den passenden Punkt am Kreis – mit der Tastatur: Pfeiltasten und Eingabe.', 'Tip: Tap the matching point on the circle – with the keyboard: arrow keys and Enter.');
    return L('Tipp: Zieh den Punkt P auf dem Kreis – Sinus und Kosinus laufen im Graphen mit.', 'Tip: Drag point P around the circle – sine and cosine follow in the graph.');
  },
  actions: [{ id: 'newq', label: L('Neue Aufgabe', 'New task'), primary: true, visibleIf: (v) => v.mode === 'quiz' }],
  readouts: [
    { key: 'angle', label: L('Winkel', 'Angle') },
    { key: 'sin', label: L('Sinus', 'Sine'), spoiler: true },
    { key: 'cos', label: L('Kosinus', 'Cosine'), spoiler: true },
    { key: 'tan', label: L('Tangens', 'Tangent'), spoiler: true },
    { key: 'quadrant', label: L('Quadrant', 'Quadrant') },
    { key: 'pyth', label: L('Trigonometrischer Pythagoras', 'Pythagorean identity'), spoiler: true },
    { key: 'rel', label: L('Beziehung', 'Relation') },
    { key: 'sol', label: L('Lösungen', 'Solutions'), spoiler: true },
    { key: 'task', label: L('Aufgabe', 'Task') },
    { key: 'fb', label: L('Rückmeldung', 'Feedback') },
  ],
  presets: [
    { id: '30', label: L('30°', '30°'), values: { angle: 30 } },
    { id: '45', label: L('45°', '45°'), values: { angle: 45 } },
    { id: '60', label: L('60°', '60°'), values: { angle: 60 } },
    { id: '150', label: L('150° (II. Quadrant)', '150° (2nd quadrant)'), values: { angle: 150 } },
    { id: 'rad', label: L('Bogenmaß', 'Radians'), values: { angle: 90, unit: 'rad' } },
    { id: 'tan', label: L('Mit Tangens', 'With tangent'), values: { angle: 40, tan: true, cos: false } },
    { id: 'symm', label: L('Symmetrie: 180° − α', 'Symmetry: 180° − α'), values: { mode: 'symm', angle: 30, rel: 'y' } },
    { id: 'solve', label: L('sin α = 0,5 lösen', 'Solve sin α = 0.5'), values: { mode: 'solve', fn: 'sin', cv: 0.5 } },
    { id: 'quiz', label: L('Üben: Winkel finden', 'Practice: find the angle'), values: { mode: 'quiz', q: 1 } },
  ],
  resultsParam: 'show',
  strings: {
    de: {
      canvas:
        'Links der Einheitskreis mit dem Punkt P (cos α | sin α), dem Winkel α und den Strecken für Sinus, Kosinus und auf Wunsch Tangens; rechts bzw. darunter die Graphen von Sinus, Kosinus und Tangens über dem Winkel α mit einer gestrichelten Linie beim aktuellen Winkel',
      undefined: 'nicht definiert (cos α = 0)',
      onAxis: 'Punkt liegt auf einer Achse',
      relY: 'Spiegelung an der y-Achse: sin(180° − α) = sin α, cos(180° − α) = −cos α',
      relO: 'Spiegelung am Ursprung: sin(180° + α) = −sin α, cos(180° + α) = −cos α',
      relX: 'Spiegelung an der x-Achse: sin(360° − α) = −sin α, cos(360° − α) = cos α',
      solOne: 'Genau eine Lösung zwischen 0° und 360°: α = {a}',
      solTwo: 'α₁ = {a1} und α₂ = {a2}',
      solAll: 'Alle Lösungen: dazu jeweils + k · 360°',
      qAngle: 'Aufgabe {q}: Tippe auf den Punkt zum Winkel α\u00a0=\u00a0{a}.',
      qValues: 'Aufgabe {q}: Gesucht ist der Winkel α zwischen 0° und 360° mit {fn}\u00a0α\u00a0=\u00a0{v}{other}. Tippe auf den passenden Punkt.',
      qOther: ' und {g}\u00a0α\u00a0{sign}\u00a00',
      ok: 'Richtig! α = {a}',
      no: 'Leider nicht – angetippt war α = {t}. Der richtige Punkt ist grün markiert.',
      tapMsg: 'Tippe auf einen der Punkte am Kreis.',
      score: '{r} von {n} richtig',
      point: 'Punkt bei {a}',
      solveLine: 'c',
    },
    en: {
      canvas:
        'On the left the unit circle with point P (cos α, sin α), the angle α and the segments for sine, cosine and optionally tangent; on the right or below, the graphs of sine, cosine and tangent over the angle α with a dashed line at the current angle',
      undefined: 'undefined (cos α = 0)',
      onAxis: 'The point lies on an axis',
      relY: 'Reflection in the y-axis: sin(180° − α) = sin α, cos(180° − α) = −cos α',
      relO: 'Reflection in the origin: sin(180° + α) = −sin α, cos(180° + α) = −cos α',
      relX: 'Reflection in the x-axis: sin(360° − α) = −sin α, cos(360° − α) = cos α',
      solOne: 'Exactly one solution between 0° and 360°: α = {a}',
      solTwo: 'α₁ = {a1} and α₂ = {a2}',
      solAll: 'All solutions: add + k · 360° to each',
      qAngle: 'Task {q}: Tap the point for the angle α\u00a0=\u00a0{a}.',
      qValues: 'Task {q}: Find the angle α between 0° and 360° with {fn}\u00a0α\u00a0=\u00a0{v}{other}. Tap the matching point.',
      qOther: ' and {g}\u00a0α\u00a0{sign}\u00a00',
      ok: 'Correct! α = {a}',
      no: 'Not quite – you tapped α = {t}. The correct point is marked in green.',
      tapMsg: 'Tap one of the points on the circle.',
      score: '{r} of {n} correct',
      point: 'Point at {a}',
      solveLine: 'c',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const circle = new Plot(surface, {
      x: [-1.35, 1.35],
      y: [-1.35, 1.35],
      region: circleRegion,
      pan: false,
      zoom: false,
    });
    const graph = new Plot(surface, {
      x: [-0.35, TAU + 0.35],
      y: [-1.5, 1.5],
      equalAspect: false,
      region: graphRegion,
      pan: false,
      zoom: false,
      xAxis: { degrees: true, label: 'α' },
    });
    const p = ctx.params;
    const fmt = ctx.fmt;
    const editable = () => !ctx.locked;
    const color = {
      sin: () => ctx.theme.series[1]!,
      cos: () => ctx.theme.series[0]!,
      tan: () => ctx.theme.series[2]!,
      angle: () => ctx.theme.series[3]!,
    };

    /** Fließkomma-Winkel für ruckelfreie Animation (der Parameter ist auf 0,5° gerundet). */
    let phi = p.angle;
    let lastSize = '';

    const setAngle = (deg: number) => {
      let value = mod(deg, 360);
      if (p.snap) value = Math.round(value / 5) * 5;
      phi = value;
      ctx.set({ angle: value });
    };

    circle.addHandle({
      get: () => {
        const r = degToRad(phi);
        return [Math.cos(r), Math.sin(r)];
      },
      set: (x, y) => setAngle(radToDeg(Math.atan2(y, x))),
      enabled: () => editable() && (p.mode === 'explore' || p.mode === 'symm'),
      color: () => ctx.theme.text,
    });
    graph.addHandle({
      get: () => {
        const r = degToRad(phi);
        /* Griff auf der sichtbaren Kurve; ohne Sinus und Kosinus auf der α-Achse */
        return [r, p.sin ? Math.sin(r) : p.cos ? Math.cos(r) : 0];
      },
      set: (x) => setAngle(radToDeg(Math.min(TAU, Math.max(0, x)))),
      axis: 'x',
      enabled: () => editable() && (p.mode === 'explore' || p.mode === 'symm'),
      color: () => (p.sin ? color.sin() : p.cos ? color.cos() : ctx.theme.text),
    });
    /* Gleichung lösen: waagrechte Linie y = c im Graphen ziehen */
    graph.addHandle({
      get: () => [TAU + 0.18, p.cv],
      set: (_x, y) => ctx.set({ cv: Math.max(-1, Math.min(1, y)) }),
      axis: 'y',
      enabled: () => editable() && p.mode === 'solve',
      color: () => (p.fn === 'sin' ? color.sin() : color.cos()),
    });

    const tr = (key: string, vars: Record<string, string | number>) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    /** Winkel in der gewählten Einheit, z. B. „150°“ oder „5π/6“. */
    const angleText = (deg: number) => {
      if (p.unit === 'rad') {
        const t = formatPiFraction(degToRad(deg));
        return t ?? fmt.num(degToRad(deg), 3);
      }
      return `${fmt.num(deg, 1)}°`;
    };

    /* ---- Üben: Zustand ---- */
    let task: AngleTask = angleTask(1, seededRandom(1));
    let answered: { deg: number; ok: boolean } | null = null;
    let tries = 0;
    let right = 0;
    let hoverPt: number | null = null;
    const pop = new Tween(500, ease.outBack);
    const newTask = () => {
      task = angleTask(p.q, seededRandom(p.q * 4099 + 7));
      answered = null;
    };
    const ptPx = (deg: number) => circle.toPx(Math.cos(degToRad(deg)), Math.sin(degToRad(deg)));
    function answer(deg: number): void {
      if (ctx.locked || p.mode !== 'quiz' || answered) return;
      const ok = checkAngle(task, deg);
      answered = { deg, ok };
      tries += 1;
      if (ok) right += 1;
      pop.play();
      updateQuizReadouts();
      ctx.announce(ok ? tr('ok', { a: angleText(task.answer) }) : tr('no', { t: angleText(deg) }));
      ctx.requestRender();
    }
    new TapTarget(surface, {
      hit: (px, py) => {
        if (p.mode !== 'quiz' || ctx.locked) return null;
        for (const d of SPECIAL_ANGLES) {
          const [x, y] = ptPx(d);
          if (Math.hypot(px - x, py - y) <= 16) return String(d);
        }
        return null;
      },
      onTap: (id) => answer(Number(id)),
      onHover: (id) => {
        hoverPt = id === null ? null : Number(id);
        surface.setCursor(id === null ? '' : 'pointer');
        ctx.requestRender();
      },
    });

    function quizText(): string {
      if (task.kind === 'angle') return tr('qAngle', { q: p.q, a: angleText(task.answer) });
      const g = task.fn === 'sin' ? 'cos' : 'sin';
      const other = task.otherSign ? tr('qOther', { g, sign: task.otherSign === '+' ? '>' : '<' }) : '';
      return tr('qValues', { q: p.q, fn: task.fn!, v: task.value!, other });
    }
    function feedback(): { text: string; ok: boolean | null } {
      if (!answered) return { text: ctx.t('tapMsg'), ok: null };
      return answered.ok ? { text: tr('ok', { a: angleText(task.answer) }), ok: true } : { text: tr('no', { t: angleText(answered.deg) }), ok: false };
    }
    function updateQuizReadouts(): void {
      ctx.readout('task', p.mode === 'quiz' ? quizText() : null);
      if (p.mode !== 'quiz') {
        ctx.readout('fb', null);
        return;
      }
      const fb = feedback();
      ctx.readout('fb', tries > 0 ? `${fb.text} (${tr('score', { r: right, n: tries })})` : fb.text);
    }

    function trigText(fn: 'sin' | 'cos' | 'tan', deg: number, value: number): string {
      const exact = exactTrig(deg, fn);
      if (exact === '0' || exact === '1' || exact === '−1') return `${fn} α = ${exact}`;
      /* „=“, wenn die Dezimalzahl exakt ist (1/2 = 0,5), sonst „≈“ (√3/2 ≈ 0,866) */
      const rel = fmt.rel(value, 3);
      if (exact) return `${fn} α = ${exact} ${rel} ${fmt.num(value, 3)}`;
      return `${fn} α ≈ ${fmt.num(value, 3)}`;
    }

    function layout(): void {
      const key = `${surface.width}x${surface.height}`;
      if (key === lastSize) return;
      lastSize = key;
      const { width: w, height: h } = surface;
      const k = isWide(w) ? (1.35 * h) / circleSize(w, h) : 1.5;
      graph.setRange([-0.35, TAU + 0.35], [-k, k]);
    }

    /* ───────────── gemeinsame Teile der neuen Ansichten ───────────── */

    let keysActive = false;
    function clearKeys(): void {
      if (!keysActive) return;
      keysActive = false;
      ctx.setKeyTargets([]);
    }

    function baseCircle(): void {
      circle.begin();
      circle.grid({ minor: false });
      circle.axes();
      circle.circle(0, 0, 1, { stroke: ctx.theme.muted, width: 2 });
    }

    function separator(): void {
      if (!isWide(surface.width)) return;
      const g = surface.g;
      const r = graph.rect;
      g.strokeStyle = ctx.theme.grid;
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(r.x + 0.5, 0);
      g.lineTo(r.x + 0.5, surface.height);
      g.stroke();
    }

    function angleArc(deg: number, radiusPx: number, col: string, label: string): void {
      const r = degToRad(deg);
      circle.arcPx(0, 0, radiusPx, 0, r, { fill: col, alpha: 0.14, sector: true });
      circle.arcPx(0, 0, radiusPx, 0, r, { stroke: col, width: 2 });
      const [ax, ay] = circle.toPx(0, 0);
      const mid = r / 2;
      circle.textPx(ax + Math.cos(mid) * (radiusPx + 13), ay - Math.sin(mid) * (radiusPx + 13), label, { color: col, math: true, size: 15, align: 'center', baseline: 'middle' });
    }

    function wrap(textValue: string, maxW: number, font: string): string[] {
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

    /* ───────────── Symmetrien ───────────── */

    function renderSymm(): void {
      clearKeys();
      const rel = p.rel as Relation;
      const rad = degToRad(phi);
      const deg2 = relatedAngle(phi, rel);
      const rad2 = degToRad(deg2);
      const P: [number, number] = [Math.cos(rad), Math.sin(rad)];
      const Q: [number, number] = [Math.cos(rad2), Math.sin(rad2)];
      const second = ctx.theme.series[4]!;
      surface.begin();
      baseCircle();
      // Spiegelachse bzw. Spiegelzentrum
      const mirror = { color: second, width: 2.5, dash: [8, 6], alpha: 0.8 };
      if (rel === 'y') circle.segment([0, -1.3], [0, 1.3], mirror);
      else if (rel === 'x') circle.segment([-1.3, 0], [1.3, 0], mirror);
      else circle.point(0, 0, { color: second, radius: 5 });
      circle.segment(P, Q, { color: second, width: 1.5, dash: [3, 4], alpha: 0.7 });
      angleArc(phi, 26, color.angle(), 'α');
      angleArc(deg2, 46, second, 'α′');
      for (const [pt, alpha] of [
        [P, 1],
        [Q, 0.6],
      ] as const) {
        if (p.cos) circle.segment([0, 0], [pt[0], 0], { color: color.cos(), width: 4, alpha });
        if (p.sin) circle.segment([pt[0], 0], pt, { color: color.sin(), width: 4, alpha });
      }
      circle.segment([0, 0], P, { color: ctx.theme.text, width: 2 });
      circle.segment([0, 0], Q, { color: second, width: 2 });
      circle.point(P[0], P[1], { color: ctx.theme.text, radius: 6 });
      circle.point(Q[0], Q[1], { color: second, radius: 6 });
      circle.text(P[0], P[1], 'P', { math: true, size: 17, align: P[0] >= 0 ? 'left' : 'right', offset: [P[0] >= 0 ? 10 : -10, P[1] >= 0 ? -10 : 20] });
      circle.text(Q[0], Q[1], 'P′', { math: true, size: 17, color: second, align: Q[0] >= 0 ? 'left' : 'right', offset: [Q[0] >= 0 ? 10 : -10, Q[1] >= 0 ? -10 : 20] });
      circle.end();

      graph.begin();
      graph.grid({ minor: false });
      graph.axes();
      graph.vline(rad, { color: ctx.theme.text, width: 1, dash: [4, 4] });
      graph.vline(rad2, { color: second, width: 1.5, dash: [4, 4] });
      const curves: ['sin' | 'cos', (x: number) => number][] = [];
      if (p.cos) curves.push(['cos', Math.cos]);
      if (p.sin) curves.push(['sin', Math.sin]);
      for (const [name, f] of curves) {
        const col = color[name]();
        graph.fn(f, { color: col, width: 2.5, from: 0, to: TAU });
        const y1 = f(rad);
        const y2 = f(rad2);
        // Höhenlinien bis zur y-Achse: gleiche oder entgegengesetzte Werte direkt vergleichbar
        graph.segment([0, y1], [rad, y1], { color: col, width: 1.2, dash: [3, 4], alpha: 0.75 });
        graph.segment([0, y2], [rad2, y2], { color: col, width: 1.2, dash: [3, 4], alpha: 0.75 });
        graph.point(rad, y1, { color: col, radius: 5 });
        graph.point(rad2, y2, { color: col, radius: 5, hollow: true });
      }
      const top = graph.bounds.yMax;
      graph.text(rad, top, 'α', { math: true, size: 15, align: 'center', baseline: 'top', offset: [0, 6] });
      graph.text(rad2, top, 'α′', { math: true, size: 15, color: second, align: 'center', baseline: 'top', offset: [0, 6] });
      graph.end();
      separator();
    }

    /* ───────────── Gleichung lösen ───────────── */

    function renderSolve(): void {
      clearKeys();
      const fnCol = p.fn === 'sin' ? color.sin() : color.cos();
      const sols = solveTrig(p.fn, p.cv);
      surface.begin();
      baseCircle();
      if (p.fn === 'sin') circle.segment([-1.3, p.cv], [1.3, p.cv], { color: fnCol, width: 2.5, dash: [8, 5] });
      else circle.segment([p.cv, -1.3], [p.cv, 1.3], { color: fnCol, width: 2.5, dash: [8, 5] });
      const solCols = [ctx.theme.series[3]!, ctx.theme.series[4]!];
      if (p.show) {
        sols.forEach((d, i) => {
          const r = degToRad(d);
          const pt: [number, number] = [Math.cos(r), Math.sin(r)];
          angleArc(d, 24 + i * 22, solCols[i]!, sols.length === 1 ? 'α' : i === 0 ? 'α₁' : 'α₂');
          circle.segment([0, 0], pt, { color: solCols[i]!, width: 2 });
          circle.point(pt[0], pt[1], { color: solCols[i]!, radius: 6 });
        });
      }
      circle.end();

      graph.begin();
      graph.grid({ minor: false });
      graph.axes();
      const f = p.fn === 'sin' ? Math.sin : Math.cos;
      graph.fn(f, { color: fnCol, width: 3, from: 0, to: TAU });
      graph.segment([0, p.cv], [TAU + 0.18, p.cv], { color: fnCol, width: 2, dash: [8, 5] });
      graph.text(TAU + 0.18, p.cv, `c = ${fmt.num(p.cv)}`, { size: 13, weight: '600', color: fnCol, align: 'right', baseline: p.cv >= 0 ? 'bottom' : 'top', offset: [-14, p.cv >= 0 ? -8 : 8] });
      graph.text(0.15, graph.bounds.yMax, `${p.fn} α = c`, { size: 14, weight: '600', color: fnCol, align: 'left', baseline: 'top', offset: [0, 8] });
      if (p.show) {
        sols.forEach((d, i) => {
          const r = degToRad(d);
          graph.segment([r, 0], [r, p.cv], { color: solCols[i]!, width: 1.5, dash: [4, 4] });
          graph.point(r, p.cv, { color: solCols[i]!, radius: 6 });
          const name = sols.length === 1 ? 'α' : i === 0 ? 'α₁' : 'α₂';
          const align = r < 0.6 ? 'left' : r > TAU - 0.9 ? 'right' : 'center';
          graph.text(r, 0, `${name} ${fmt.rel(d, 1)} ${angleText(d)}`, { size: 13, weight: '600', color: solCols[i]!, align, baseline: p.cv >= 0 ? 'top' : 'bottom', offset: [align === 'left' ? -4 : align === 'right' ? 4 : 0, p.cv >= 0 ? 22 : -10] });
        });
      }
      graph.end();
      separator();
    }

    /* ───────────── Üben: Winkel finden ───────────── */

    function renderQuiz(): void {
      const g = surface.begin();
      baseCircle();
      const ok = ctx.theme.series[2]!;
      const bad = ctx.theme.series[1]!;
      const pk = pop.running ? pop.value : 1;
      for (const d of SPECIAL_ANGLES) {
        const r = degToRad(d);
        const x = Math.cos(r);
        const y = Math.sin(r);
        const isAnswer = answered && checkAngle(task, d);
        const isWrong = answered && !answered.ok && answered.deg === d;
        const focus = ctx.keyFocus === String(d) || hoverPt === d;
        if (isAnswer) {
          circle.point(x, y, { color: ok, radius: 9 * pk });
          circle.text(x, y, angleText(d), { size: 13, weight: '600', color: ok, align: x >= 0 ? 'left' : 'right', baseline: 'middle', offset: [x >= 0 ? 14 : -14, y >= 0 ? -10 : 10] });
        } else if (isWrong) {
          circle.point(x, y, { color: bad, radius: 8 });
        } else {
          circle.point(x, y, { color: focus ? color.angle() : ctx.theme.muted, radius: focus ? 8 : 6, hollow: !focus });
        }
      }
      if (answered) {
        const r = degToRad(answered.deg);
        circle.segment([0, 0], [Math.cos(r), Math.sin(r)], { color: answered.ok ? ok : bad, width: 2 });
      }
      circle.end();

      // Aufgabenkarte im Bereich des Graphen
      const area = graph.rect;
      const pad = 14;
      const box: Rect = { x: area.x + pad, y: area.y + pad, w: area.w - 2 * pad, h: area.h - 2 * pad };
      g.save();
      softShadow(g, ctx.theme.dark, 12, 3);
      roundRect(g, box.x, box.y, box.w, box.h, 12);
      g.fillStyle = ctx.theme.bg;
      g.fill();
      g.restore();
      roundRect(g, box.x, box.y, box.w, box.h, 12);
      g.strokeStyle = ctx.theme.grid;
      g.lineWidth = 1;
      g.stroke();
      const narrow = !isWide(surface.width);
      const size = narrow ? 15 : 18;
      const font = `600 ${size}px ${ctx.theme.font}`;
      let y = box.y + 18;
      g.textAlign = 'left';
      g.textBaseline = 'top';
      g.fillStyle = ctx.theme.text;
      for (const line of wrap(quizText(), box.w - 32, font)) {
        g.font = font;
        g.fillText(line, box.x + 16, y);
        y += size * 1.35;
      }
      y += 10;
      const fb = feedback();
      const fbFont = `${fb.ok === null ? 'normal' : '600'} ${size - 2}px ${ctx.theme.font}`;
      g.fillStyle = fb.ok === null ? ctx.theme.muted : fb.ok ? ok : bad;
      for (const line of wrap(fb.text, box.w - 32, fbFont)) {
        g.font = fbFont;
        g.fillText(line, box.x + 16, y);
        y += (size - 2) * 1.35;
      }
      if (tries > 0) {
        g.font = `normal ${size - 3}px ${ctx.theme.font}`;
        g.fillStyle = ctx.theme.muted;
        g.fillText(tr('score', { r: right, n: tries }), box.x + 16, Math.min(y + 8, box.y + box.h - size - 6));
      }
      separator();

      // Tastatur: die 16 Punkte als Ziele
      keysActive = true;
      ctx.setKeyTargets(
        SPECIAL_ANGLES.map((d) => {
          const [x, yy] = ptPx(d);
          return { id: String(d), label: tr('point', { a: angleText(d) }), rect: { x: x - 12, y: yy - 12, w: 24, h: 24 }, disabled: answered !== null, activate: () => answer(d) };
        }),
      );
      if (pop.running) ctx.requestRender();
    }

    return {
      update(changed, source) {
        if (changed.has('angle') && Math.abs(p.angle - phi) > 0.3) phi = p.angle;
        if (changed.has('unit')) graph.setAxes({ x: { degrees: p.unit === 'deg', pi: p.unit === 'rad', label: 'α' } });
        if (changed.has('q') || source === 'init' || source === 'replace') newTask();
        if (changed.has('mode') && p.mode !== 'explore' && p.mode !== 'symm') ctx.clock.pause();
        for (const k of ['angle', 'sin', 'cos', 'tan', 'quadrant', 'pyth', 'rel', 'sol', 'task', 'fb']) ctx.readout(k, null);
        if (p.mode === 'quiz') {
          updateQuizReadouts();
          return;
        }
        if (p.mode === 'solve') {
          const sols = solveTrig(p.fn, p.cv);
          const eq = `${p.fn} α = ${fmt.num(p.cv)}`;
          const body = sols.length === 1 ? tr('solOne', { a: angleText(sols[0]!) }) : tr('solTwo', { a1: angleText(sols[0]!), a2: angleText(sols[1]!) });
          ctx.readout('sol', `${eq}: ${body}. ${ctx.t('solAll')}`);
          return;
        }

        const deg = p.angle;
        const rad = degToRad(deg);
        const piText = formatPiFraction(rad);
        const radText = piText && piText !== '0' ? `${piText} ≈ ${fmt.num(rad, 3)}` : fmt.num(rad, 3);
        ctx.readout(
          'angle',
          p.unit === 'deg' ? `α = ${fmt.num(deg, 1)}° ≙ ${radText}` : `α = ${radText} ≙ ${fmt.num(deg, 1)}°`,
        );
        const s = Math.sin(rad);
        const c = Math.cos(rad);
        ctx.readout('sin', trigText('sin', deg, s));
        ctx.readout('cos', trigText('cos', deg, c));
        ctx.readout('tan', !p.tan ? null : tanDefined(deg) ? trigText('tan', deg, s / c) : `tan α: ${ctx.t('undefined')}`);
        const q = quadrant(deg);
        const sign = (v: number) => (v > 0 ? '> 0' : '< 0');
        ctx.readout(
          'quadrant',
          q === 0
            ? ctx.t('onAxis')
            : `${ctx.lang === 'de' ? `${ROMAN[q]}. Quadrant` : `Quadrant ${ROMAN[q]}`} (sin α ${sign(s)}, cos α ${sign(c)})`,
        );
        ctx.readout('pyth', `sin²α + cos²α = ${fmt.num(s * s, 3)} + ${fmt.num(c * c, 3)} = 1`);
        if (p.mode === 'symm') {
          const r2 = relatedAngle(deg, p.rel as Relation);
          const rr = degToRad(r2);
          ctx.readout('rel', `${ctx.t(p.rel === 'y' ? 'relY' : p.rel === 'o' ? 'relO' : 'relX')} – α′ = ${angleText(r2)}: sin α′ ${fmt.approx(Math.sin(rr), 3)}, cos α′ ${fmt.approx(Math.cos(rr), 3)}`);
          ctx.readout('tan', null);
          ctx.readout('pyth', null);
        }
      },

      action(id) {
        if (id === 'newq' && !ctx.locked) ctx.set({ q: p.q >= 999 ? 1 : p.q + 1 });
      },

      tick(dt) {
        if (p.mode !== 'explore' && p.mode !== 'symm') return;
        phi = mod(phi + p.speed * dt, 360);
        ctx.set({ angle: Math.round(phi * 2) / 2 });
      },

      resetTime() {
        setAngle(0);
      },

      render() {
        layout();
        if (p.mode === 'symm') return renderSymm();
        if (p.mode === 'solve') return renderSolve();
        if (p.mode === 'quiz') return renderQuiz();
        clearKeys();
        const rad = degToRad(phi);
        const c = Math.cos(rad);
        const s = Math.sin(rad);
        const g = surface.begin();
        const muted = ctx.theme.muted;

        /* ---- Einheitskreis ---- */
        circle.begin();
        circle.grid({ minor: false });
        circle.axes();
        circle.circle(0, 0, 1, { stroke: muted, width: 2 });

        circle.arcPx(0, 0, 30, 0, rad, { fill: color.angle(), alpha: 0.18, sector: true });
        circle.arcPx(0, 0, 30, 0, rad, { stroke: color.angle(), width: 2 });
        const mid = rad / 2;
        const [ax, ay] = circle.toPx(0, 0);
        circle.textPx(ax + Math.cos(mid) * 44, ay - Math.sin(mid) * 44, 'α', {
          color: color.angle(),
          math: true,
          size: 16,
          align: 'center',
          baseline: 'middle',
        });

        if (p.tan && tanDefined(phi)) {
          const t = Math.max(-3, Math.min(3, s / c));
          circle.vline(1, { color: color.tan(), width: 1, dash: [3, 5], alpha: 0.6 });
          circle.segment([0, 0], [1, t], { color: color.tan(), width: 1.5, dash: [5, 5] });
          circle.segment([1, 0], [1, t], { color: color.tan(), width: 4 });
          /* Beschriftung im sichtbaren Bereich halten (bei α nahe 90° ist die Strecke länger als das Bild) */
          circle.text(1, Math.max(-1.15, Math.min(1.15, t / 2)), 'tan α', { color: color.tan(), baseline: 'middle', offset: [8, 0], weight: '600', size: 13 });
        }
        if (p.cos) {
          circle.segment([0, 0], [c, 0], { color: color.cos(), width: 4 });
          circle.text(c / 2, 0, 'cos α', { color: color.cos(), align: 'center', baseline: s >= 0 ? 'top' : 'bottom', offset: [0, s >= 0 ? 22 : -8], weight: '600', size: 13 });
        }
        if (p.sin) {
          circle.segment([c, 0], [c, s], { color: color.sin(), width: 4 });
          circle.text(c, s / 2, 'sin α', { color: color.sin(), align: c >= 0 ? 'left' : 'right', baseline: 'middle', offset: [c >= 0 ? 8 : -8, 0], weight: '600', size: 13 });
        }
        circle.segment([0, 0], [c, s], { color: ctx.theme.text, width: 2 });
        circle.point(c, s, { color: ctx.theme.text, radius: 6 });
        circle.text(c, s, 'P', { math: true, size: 17, align: c >= 0 ? 'left' : 'right', offset: [c >= 0 ? 10 : -10, s >= 0 ? -10 : 20] });
        circle.end();

        /* ---- Graphen ---- */
        graph.begin();
        graph.grid({ minor: false });
        graph.axes();
        graph.vline(rad, { color: muted, width: 1, dash: [4, 4] });
        const curves: ['sin' | 'cos' | 'tan', (x: number) => number][] = [];
        if (p.tan) curves.push(['tan', Math.tan]);
        if (p.cos) curves.push(['cos', Math.cos]);
        if (p.sin) curves.push(['sin', Math.sin]);
        for (const [name, f] of curves) {
          const col = color[name]();
          graph.fn(f, { color: col, width: 2, alpha: 0.3, from: 0, to: TAU });
          graph.fn(f, { color: col, width: 3, from: 0, to: rad });
          if (name !== 'tan' || tanDefined(phi)) graph.point(rad, f(rad), { color: col, radius: 5 });
        }
        /* Kurvennamen, damit die Graphen nicht nur über die Farbe unterscheidbar sind */
        const curveLabel = { weight: '600', size: 13 } as const;
        if (p.sin) graph.text(Math.PI / 2, 1, 'sin α', { ...curveLabel, color: color.sin(), align: 'center', baseline: 'bottom', offset: [0, -8] });
        if (p.cos) graph.text(Math.PI, -1, 'cos α', { ...curveLabel, color: color.cos(), align: 'center', baseline: 'top', offset: [0, 8] });
        if (p.tan) graph.text((5 * Math.PI) / 4, 1, 'tan α', { ...curveLabel, color: color.tan(), align: 'left', baseline: 'middle', offset: [10, 0] });
        graph.end();

        /* ---- Verbindungslinie und Trennlinie (nur nebeneinander) ---- */
        if (isWide(surface.width)) {
          const r = graph.rect;
          g.strokeStyle = ctx.theme.grid;
          g.lineWidth = 1;
          g.beginPath();
          g.moveTo(r.x + 0.5, 0);
          g.lineTo(r.x + 0.5, surface.height);
          g.stroke();
          if (p.sin) {
            const [x1, y1] = circle.toPx(c, s);
            const [x2, y2] = graph.toPx(rad, s);
            g.save();
            g.strokeStyle = color.sin();
            g.globalAlpha = 0.7;
            g.setLineDash([5, 5]);
            g.lineWidth = 1.5;
            g.beginPath();
            g.moveTo(x1, y1);
            g.lineTo(x2, y2);
            g.stroke();
            g.restore();
          }
        }
      },

      destroy: () => surface.destroy(),
    };
  },
});
