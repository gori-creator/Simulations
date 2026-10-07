import { defineSimulation, degToRad, mod, Plot, radToDeg, Surface, withAlpha } from '../../../sim-core';
import { angleAt, positionToCircle, type Point } from './model';

const L = (de: string, en: string) => ({ de, en });
const R = 3;
const A: Point = [-R, 0];
const B: Point = [R, 0];
const M: Point = [0, 0];

/**
 * Satz des Thales: Liegt C auf dem Kreis über der Strecke AB, ist der Winkel
 * bei C ein rechter. Mit „frei verschieben“ lässt sich die Umkehrung
 * untersuchen; die Beweisidee zeigt die zwei gleichschenkligen Dreiecke.
 */
export default defineSimulation({
  id: 'thales',
  animated: true,
  dragHint: true,
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    { key: 'phi', type: 'number', label: L('Lage von C auf dem Kreis', 'Position of C on the circle'), min: 0, max: 360, step: 1, default: 62, unit: '°', visibleIf: (v) => v.free !== true },
    { key: 'free', type: 'boolean', label: L('C frei verschieben (Umkehrung untersuchen)', 'Move C freely (explore the converse)'), default: false },
    { key: 'cx', type: 'number', label: L('x-Koordinate von C', 'x-coordinate of C'), min: -5, max: 5, step: 0.1, default: 1, visibleIf: (v) => v.free === true },
    { key: 'cy', type: 'number', label: L('y-Koordinate von C', 'y-coordinate of C'), min: -4, max: 4, step: 0.1, default: 1.5, visibleIf: (v) => v.free === true },
    { key: 'proof', type: 'boolean', group: 'view', label: L('Beweisidee: Radius MC einzeichnen', 'Proof idea: draw the radius MC'), default: false },
    { key: 'grid', type: 'boolean', group: 'view', label: L('Gitternetz', 'Grid'), default: false },
  ],
  readouts: [
    { key: 'gamma', label: L('Winkel γ bei C', 'Angle γ at C'), spoiler: true },
    { key: 'position', label: L('Lage von C', 'Position of C') },
    { key: 'proof', label: L('Beweisidee', 'Proof idea'), spoiler: true },
  ],
  presets: [
    { id: 'right', label: L('C auf dem Kreis', 'C on the circle'), values: {} },
    { id: 'inside', label: L('C innerhalb', 'C inside'), values: { free: true, cx: 0.8, cy: 1.4 } },
    { id: 'outside', label: L('C außerhalb', 'C outside'), values: { free: true, cx: -1.2, cy: 3.8 } },
    { id: 'proof', label: L('Beweisidee', 'Proof idea'), values: { phi: 70, proof: true } },
  ],
  strings: {
    de: {
      canvas: 'Thaleskreis über der Strecke AB mit Dreieck ABC und dem Winkel bei C',
      on: 'auf dem Thaleskreis',
      inside: 'innerhalb des Thaleskreises',
      outside: 'außerhalb des Thaleskreises',
      right: 'rechter Winkel',
      obtuse: 'stumpf (größer als 90°)',
      acute: 'spitz (kleiner als 90°)',
      degenerate: 'kein Dreieck (C liegt auf der Geraden AB)',
      proofText: 'α + β = {sum}°, also γ = α + β = 90°',
      proofFree: 'Die Beweisidee gilt nur, wenn C auf dem Kreis liegt.',
    },
    en: {
      canvas: 'Thales circle over segment AB with triangle ABC and the angle at C',
      on: 'on the Thales circle',
      inside: 'inside the Thales circle',
      outside: 'outside the Thales circle',
      right: 'right angle',
      obtuse: 'obtuse (greater than 90°)',
      acute: 'acute (less than 90°)',
      degenerate: 'not a triangle (C lies on line AB)',
      proofText: 'α + β = {sum}°, so γ = α + β = 90°',
      proofFree: 'The proof idea only applies when C lies on the circle.',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const plot = new Plot(surface, { x: [-5, 5], y: [-3.6, 4.4], pan: false });
    const p = ctx.params;
    const fmt = ctx.fmt;
    let phi = p.phi;

    const pointC = (): Point => {
      if (p.free) return [p.cx, p.cy];
      const r = degToRad(phi);
      return [R * Math.cos(r), R * Math.sin(r)];
    };

    plot.addHandle({
      get: () => pointC(),
      set: (x, y) => {
        if (p.free) ctx.set({ cx: x, cy: y });
        else {
          phi = mod(radToDeg(Math.atan2(y, x)), 360);
          ctx.set({ phi: Math.round(phi) });
        }
      },
      enabled: () => !ctx.locked,
      color: () => ctx.theme.text,
    });

    /** Farbe für den Winkel bei C: grün = 90°, orange = stumpf, blau = spitz. */
    const angleColor = (gamma: number) =>
      Math.abs(gamma - 90) < 0.5 ? ctx.theme.series[2]! : gamma > 90 ? ctx.theme.series[3]! : ctx.theme.series[0]!;

    /** Innenwinkel bei `v` zwischen den Strahlen zu p1 und p2 als Bogen (Radius in Pixeln). */
    function angleArc(v: Point, p1: Point, p2: Point, radius: number, color: string, fill = 0.18): void {
      let a1 = Math.atan2(p1[1] - v[1], p1[0] - v[0]);
      let a2 = Math.atan2(p2[1] - v[1], p2[0] - v[0]);
      let sweep = mod(a2 - a1, 2 * Math.PI);
      if (sweep > Math.PI) {
        [a1, a2] = [a2, a1];
        sweep = 2 * Math.PI - sweep;
      }
      plot.arcPx(v[0], v[1], radius, a1, a1 + sweep, { fill: color, alpha: fill, sector: true });
      plot.arcPx(v[0], v[1], radius, a1, a1 + sweep, { stroke: color, width: 2 });
    }

    /** Markierung für einen rechten Winkel bei `v`. */
    function rightAngleMark(v: Point, p1: Point, p2: Point, size: number, color: string): void {
      const g = surface.g;
      const [vx, vy] = plot.toPx(v[0], v[1]);
      const unit = (q: Point) => {
        const [qx, qy] = plot.toPx(q[0], q[1]);
        const len = Math.hypot(qx - vx, qy - vy) || 1;
        return [(qx - vx) / len, (qy - vy) / len] as const;
      };
      const u = unit(p1);
      const w = unit(p2);
      g.beginPath();
      g.moveTo(vx + u[0] * size, vy + u[1] * size);
      g.lineTo(vx + (u[0] + w[0]) * size, vy + (u[1] + w[1]) * size);
      g.lineTo(vx + w[0] * size, vy + w[1] * size);
      g.lineTo(vx, vy);
      g.closePath();
      g.fillStyle = withAlpha(color, 0.22);
      g.fill();
      g.strokeStyle = color;
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(vx + u[0] * size, vy + u[1] * size);
      g.lineTo(vx + (u[0] + w[0]) * size, vy + (u[1] + w[1]) * size);
      g.lineTo(vx + w[0] * size, vy + w[1] * size);
      g.stroke();
      g.beginPath();
      g.arc(vx + ((u[0] + w[0]) * size) / 2, vy + ((u[1] + w[1]) * size) / 2, 2, 0, Math.PI * 2);
      g.fillStyle = color;
      g.fill();
    }

    /** Kleiner Querstrich in der Mitte einer Strecke (gleich lange Strecken markieren). */
    function tick(p1: Point, p2: Point, color: string): void {
      const [x1, y1] = plot.toPx(p1[0], p1[1]);
      const [x2, y2] = plot.toPx(p2[0], p2[1]);
      const mx = (x1 + x2) / 2;
      const my = (y1 + y2) / 2;
      const len = Math.hypot(x2 - x1, y2 - y1) || 1;
      const nx = -(y2 - y1) / len;
      const ny = (x2 - x1) / len;
      const g = surface.g;
      g.strokeStyle = color;
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(mx - nx * 7, my - ny * 7);
      g.lineTo(mx + nx * 7, my + ny * 7);
      g.stroke();
    }

    /** Beschriftung eines Eckpunkts, vom Dreieck weg nach außen versetzt. */
    function vertexLabel(q: Point, name: string, centre: Point, color = ctx.theme.text): void {
      const dx = q[0] - centre[0];
      const dy = q[1] - centre[1];
      const len = Math.hypot(dx, dy) || 1;
      plot.textPx(plot.px(q[0]) + (dx / len) * 20, plot.py(q[1]) - (dy / len) * 20, name, {
        math: true,
        size: 19,
        color,
        align: 'center',
        baseline: 'middle',
      });
    }

    return {
      update(changed) {
        if (changed.has('phi') && Math.abs(p.phi - phi) > 0.6) phi = p.phi;
        const c = pointC();
        const gamma = angleAt(c, A, B);
        const position = positionToCircle(c, M, R, 1e-3);
        const kind = !Number.isFinite(gamma) || Math.abs(c[1]) < 1e-9
          ? 'degenerate'
          : Math.abs(gamma - 90) < 0.05
            ? 'right'
            : gamma > 90
              ? 'obtuse'
              : 'acute';
        ctx.readout('gamma', kind === 'degenerate' ? ctx.t('degenerate') : `γ ≈ ${fmt.num(gamma, 1)}° – ${ctx.t(kind)}`);
        ctx.readout('position', ctx.t(position));
        if (!p.proof) ctx.readout('proof', null);
        else if (position !== 'on') ctx.readout('proof', ctx.t('proofFree'));
        else {
          const alpha = angleAt(A, B, c);
          const beta = angleAt(B, A, c);
          ctx.readout('proof', `α ≈ ${fmt.num(alpha, 1)}°, β ≈ ${fmt.num(beta, 1)}°; ${ctx.t('proofText').replace('{sum}', fmt.num(alpha + beta, 1))}`);
        }
      },

      tick(dt) {
        if (p.free) return;
        phi = mod(phi + 30 * dt, 360);
        // Durch die Gerade AB (0° bzw. 180°) zügig hindurch, dort gibt es kein Dreieck
        ctx.set({ phi: Math.round(phi) });
      },

      resetTime() {
        phi = 62;
        ctx.set({ phi: 62 });
      },

      render() {
        const c = pointC();
        const theme = ctx.theme;
        const gamma = angleAt(c, A, B);
        const position = positionToCircle(c, M, R, 1e-3);
        const color = angleColor(gamma);
        const centre: Point = [(A[0] + B[0] + c[0]) / 3, (A[1] + B[1] + c[1]) / 3];

        surface.begin();
        plot.begin();
        if (p.grid) plot.grid();

        // Thaleskreis
        plot.circle(0, 0, R, { fill: theme.series[4]!, alpha: 0.05 });
        plot.circle(0, 0, R, { stroke: withAlpha(theme.series[4]!, 0.85), width: 2, dash: p.free ? [7, 6] : undefined });

        // Dreieck
        plot.polygon([A, B, c], { fill: color, alpha: 0.12 });
        plot.polygon([A, B, c], { stroke: theme.text, width: 2.5 });
        plot.segment(A, B, { color: theme.text, width: 3.5 });

        // Beweisidee: zwei gleichschenklige Dreiecke AMC und MBC
        if (p.proof && position === 'on') {
          const ca = theme.series[0]!;
          const cb = theme.series[1]!;
          plot.segment(M, c, { color: theme.series[4], width: 2, dash: [6, 5] });
          angleArc(A, B, c, 34, ca);
          angleArc(c, A, M, 30, ca);
          angleArc(B, A, c, 34, cb);
          angleArc(c, M, B, 42, cb, 0.12);
          for (const q of [A, B, c]) tick(M, q, theme.series[4]!);
          plot.text(A[0], A[1], 'α', { color: ca, math: true, size: 17, offset: [40, -12] });
          plot.text(B[0], B[1], 'β', { color: cb, math: true, size: 17, offset: [-48, -12] });
        }

        // Winkel bei C
        if (Number.isFinite(gamma) && Math.abs(c[1]) > 1e-9) {
          if (Math.abs(gamma - 90) < 0.5 && !(p.proof && position === 'on')) rightAngleMark(c, A, B, 18, color);
          else if (!(p.proof && position === 'on')) angleArc(c, A, B, 28, color);
          const dx = centre[0] - c[0];
          const dy = centre[1] - c[1];
          const len = Math.hypot(dx, dy) || 1;
          plot.textPx(plot.px(c[0]) + (dx / len) * 62, plot.py(c[1]) - (dy / len) * 62, `γ = ${fmt.num(gamma, Math.abs(gamma - 90) < 0.05 ? 0 : 1)}°`, {
            color,
            weight: 'bold',
            size: 15,
            align: 'center',
            baseline: 'middle',
          });
        }

        // Punkte und Beschriftungen
        plot.point(M[0], M[1], { color: theme.series[4], radius: 4 });
        plot.text(M[0], M[1], 'M', { math: true, size: 16, color: theme.series[4], align: 'center', offset: [0, 20] });
        plot.point(A[0], A[1], { color: theme.text, radius: 5 });
        plot.point(B[0], B[1], { color: theme.text, radius: 5 });
        vertexLabel(A, 'A', centre);
        vertexLabel(B, 'B', centre);
        plot.point(c[0], c[1], { color, radius: 7 });
        vertexLabel(c, 'C', centre, color);
        plot.end();
      },

      resetView: () => plot.resetView(),
      destroy: () => surface.destroy(),
    };
  },
});
