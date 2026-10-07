import { defineSimulation, ease, Plot, Surface, Tween, withAlpha } from '../../../sim-core';
import { arrangementAB, arrangementC, interpolate, type Point, type Triangle } from './model';

const L = (de: string, en: string) => ({ de, en });

/**
 * Satz des Pythagoras: Quadrate über den Seiten eines rechtwinkligen Dreiecks
 * (mit Kästchen zum Abzählen) und ein animierter Ergänzungsbeweis, bei dem
 * vier gleiche Dreiecke im Quadrat (a + b)² umgelegt werden.
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
      ],
      default: 'squares',
    },
    { key: 'a', type: 'number', label: L('Kathete a', 'Leg a'), min: 1, max: 6, step: 0.5, default: 3 },
    { key: 'b', type: 'number', label: L('Kathete b', 'Leg b'), min: 1, max: 6, step: 0.5, default: 4 },
    { key: 'grid', type: 'boolean', group: 'view', label: L('Kästchen zum Abzählen', 'Unit squares for counting'), default: true },
    { key: 'numbers', type: 'boolean', group: 'view', label: L('Flächeninhalte anzeigen', 'Show areas'), default: true },
  ],
  actions: [{ id: 'move', label: L('Dreiecke umlegen', 'Rearrange triangles'), primary: true, visibleIf: (v) => v.mode === 'puzzle' }],
  readouts: [
    { key: 'sides', label: L('Seitenlängen', 'Side lengths'), spoiler: true },
    { key: 'areas', label: L('Flächen', 'Areas'), spoiler: true },
    { key: 'proof', label: L('Beweisidee', 'Proof idea') },
  ],
  presets: [
    { id: '345', label: L('3-4-5-Dreieck', '3-4-5 triangle'), values: {} },
    { id: 'iso', label: L('Gleichschenklig', 'Isosceles'), values: { a: 3, b: 3 } },
    { id: 'flat', label: L('Flach', 'Flat'), values: { a: 1.5, b: 5 } },
    { id: 'puzzle', label: L('Puzzle-Beweis', 'Puzzle proof'), values: { mode: 'puzzle' } },
  ],
  strings: {
    de: {
      canvas: 'Rechtwinkliges Dreieck mit Quadraten über den drei Seiten',
      move: 'Dreiecke umlegen',
      back: 'Zurücklegen',
      proofSquares: 'Die beiden Kathetenquadrate haben zusammen denselben Flächeninhalt wie das Hypotenusenquadrat.',
      proofPuzzle:
        'In beiden Anordnungen liegen im Quadrat mit der Seite a + b dieselben vier Dreiecke. Die freie Fläche ist also gleich groß: c² = a² + b².',
      hyp: 'Hypotenuse',
    },
    en: {
      canvas: 'Right triangle with squares on its three sides',
      move: 'Rearrange triangles',
      back: 'Move back',
      proofSquares: 'Together, the two squares on the legs have the same area as the square on the hypotenuse.',
      proofPuzzle:
        'Both arrangements place the same four triangles inside the square with side a + b. So the uncovered areas are equal: c² = a² + b².',
      hyp: 'hypotenuse',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const plot = new Plot(surface, { x: [-4, 8], y: [-5, 8], pan: false, zoom: false });
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tween = new Tween(2200, ease.linear);
    let startP = 0;
    let targetP = 0;
    let rangeKey = '';

    const progress = () => startP + (targetP - startP) * tween.value;
    const colors = () => ({ a: ctx.theme.series[0]!, b: ctx.theme.series[1]!, c: ctx.theme.series[4]!, tri: ctx.theme.series[3]! });

    function fitRange(): void {
      const key = `${p.mode}:${p.a}:${p.b}`;
      if (key === rangeKey) return;
      rangeKey = key;
      const { a, b } = p;
      if (p.mode === 'puzzle') {
        const s = a + b;
        plot.setRange([-0.12 * s - 0.6, s + 0.12 * s + 0.6], [-0.12 * s - 0.6, s + 0.12 * s + 0.6]);
      } else {
        plot.setRange([-a - 0.9, b + a + 0.9], [-b - 0.9, a + b + 0.9]);
      }
    }

    // Ziehbare Ecken: A auf der x-Achse (Kathete b), B auf der y-Achse (Kathete a)
    plot.addHandle({ get: () => [p.b, 0], set: (x) => ctx.set({ b: x }), axis: 'x', enabled: () => !ctx.locked && p.mode === 'squares', color: () => colors().b });
    plot.addHandle({ get: () => [0, p.a], set: (_x, y) => ctx.set({ a: y }), axis: 'y', enabled: () => !ctx.locked && p.mode === 'squares', color: () => colors().a });

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

    function updateAction(): void {
      ctx.setAction('move', { label: ctx.t(targetP > 0.5 ? 'back' : 'move') });
    }

    return {
      update(changed) {
        if (changed.has('mode')) {
          startP = 0;
          targetP = 0;
          tween.finish();
          updateAction();
        }
        fitRange();
        const { a, b } = p;
        const c = Math.hypot(a, b);
        const exact = Math.abs(c - Math.round(c * 1000) / 1000) < 1e-9;
        ctx.readout('sides', `a = ${fmt.num(a)}, b = ${fmt.num(b)}, c ${exact ? '=' : '≈'} ${fmt.num(c, 3)}`);
        ctx.readout('areas', `a² + b² = ${fmt.num(a * a)} + ${fmt.num(b * b)} = ${fmt.num(a * a + b * b)} = c²`);
        ctx.readout('proof', ctx.t(p.mode === 'puzzle' ? 'proofPuzzle' : 'proofSquares'));
      },

      action(id) {
        if (id !== 'move') return;
        startP = progress();
        targetP = targetP > 0.5 ? 0 : 1;
        tween.play(Math.max(200, 2200 * Math.abs(targetP - startP)));
        updateAction();
      },

      render() {
        fitRange();
        surface.begin();
        plot.begin();
        if (p.mode === 'puzzle') drawPuzzle();
        else drawSquares();
        plot.end();
        if (tween.running) ctx.requestRender();
      },

      destroy: () => surface.destroy(),
    };
  },
});
