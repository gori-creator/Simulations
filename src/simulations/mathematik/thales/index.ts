import { defineSimulation, degToRad, drawCard, ease, mod, Plot, radToDeg, Surface, Tween, withAlpha, type Rect } from '../../../sim-core';
import { angleAt, angleKind, lineIntersection, positionToCircle, quizPoint, rightTriangle, setSquareChord, tangentPoints, type AngleKind, type Point } from './model';

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
  layout: { aspect: 1.6, aspectNarrow: 0.62 },
  hint: { de: 'Tipp: Zieh den Punkt C auf dem Kreis – der Winkel bei C bleibt 90°.', en: 'Tip: Drag point C on the circle – the angle at C stays 90°.' },
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Ansicht', 'View'),
      options: [
        { value: 'explore', label: L('Thaleskreis erkunden', 'Explore the Thales circle') },
        { value: 'proof', label: L('Beweis Schritt für Schritt', 'Proof step by step') },
        { value: 'tangent', label: L('Anwendung: Tangenten an einen Kreis', 'Application: tangents to a circle') },
        { value: 'construct', label: L('Anwendung: rechtwinkliges Dreieck konstruieren', 'Application: construct a right triangle') },
        { value: 'centre', label: L('Alltag: Kreismitte mit dem Geodreieck finden', 'Everyday: find the centre with a set square') },
        { value: 'quiz', label: L('Übung: spitz, recht oder stumpf?', 'Practice: acute, right or obtuse?') },
      ],
      default: 'explore',
    },
    { key: 'st', type: 'number', label: L('Schritt', 'Step'), min: 1, max: 5, step: 1, default: 1, visibleIf: (v) => v.mode === 'proof' || v.mode === 'tangent' || v.mode === 'construct' },
    { key: 'kr', type: 'number', label: L('Radius r des Kreises', 'Radius r of the circle'), min: 0.5, max: 3, step: 0.1, default: 2, visibleIf: (v) => v.mode === 'tangent' },
    { key: 'px', type: 'number', label: L('P: x', 'P: x'), min: -6, max: 6, step: 0.1, default: 4.5, visibleIf: (v) => v.mode === 'tangent' },
    { key: 'py', type: 'number', label: L('P: y', 'P: y'), min: -4, max: 4, step: 0.1, default: 1.5, visibleIf: (v) => v.mode === 'tangent' },
    { key: 'hc', type: 'number', label: L('Hypotenuse c = |AB|', 'Hypotenuse c = |AB|'), min: 3, max: 10, step: 0.5, default: 6, unit: 'cm', visibleIf: (v) => v.mode === 'construct' },
    { key: 'ha', type: 'number', label: L('Kathete a = |BC|', 'Leg a = |BC|'), min: 0.5, max: 9.5, step: 0.5, default: 4, unit: 'cm', visibleIf: (v) => v.mode === 'construct' },
    { key: 'v1', type: 'number', label: L('1. Geodreieck: Ecke', '1st set square: corner'), min: 0, max: 359, step: 1, default: 200, unit: '°', visibleIf: (v) => v.mode === 'centre' },
    { key: 'w1', type: 'number', label: L('1. Geodreieck: Schenkel', '1st set square: leg'), min: 0, max: 359, step: 1, default: 60, unit: '°', visibleIf: (v) => v.mode === 'centre' },
    { key: 'v2', type: 'number', label: L('2. Geodreieck: Ecke', '2nd set square: corner'), min: 0, max: 359, step: 1, default: 300, unit: '°', visibleIf: (v) => v.mode === 'centre' },
    { key: 'w2', type: 'number', label: L('2. Geodreieck: Schenkel', '2nd set square: leg'), min: 0, max: 359, step: 1, default: 150, unit: '°', visibleIf: (v) => v.mode === 'centre' },
    { key: 'qn', type: 'number', label: L('Aufgabe Nr.', 'Task no.'), min: 1, max: 999, step: 1, default: 1, visibleIf: (v) => v.mode === 'quiz' },
    {
      key: 'qa',
      type: 'choice',
      label: L('Der Winkel bei C ist …', 'The angle at C is …'),
      options: [
        { value: 'acute', label: L('spitz (< 90°)', 'acute (< 90°)') },
        { value: 'right', label: L('ein rechter (= 90°)', 'right (= 90°)') },
        { value: 'obtuse', label: L('stumpf (> 90°)', 'obtuse (> 90°)') },
      ],
      default: 'right',
      visibleIf: (v) => v.mode === 'quiz',
    },
    { key: 'phi', type: 'number', label: L('Lage von C auf dem Kreis', 'Position of C on the circle'), min: 0, max: 360, step: 1, default: 62, unit: '°', visibleIf: (v) => (v.mode === 'explore' && v.free !== true) || v.mode === 'proof' },
    { key: 'free', type: 'boolean', label: L('C frei verschieben (Umkehrung untersuchen)', 'Move C freely (explore the converse)'), default: false, visibleIf: (v) => v.mode === 'explore' },
    { key: 'cx', type: 'number', label: L('x-Koordinate von C', 'x-coordinate of C'), min: -5, max: 5, step: 0.1, default: 1, visibleIf: (v) => v.free === true && v.mode === 'explore' },
    { key: 'cy', type: 'number', label: L('y-Koordinate von C', 'y-coordinate of C'), min: -4, max: 4, step: 0.1, default: 1.5, visibleIf: (v) => v.free === true && v.mode === 'explore' },
    { key: 'proof', type: 'boolean', group: 'view', label: L('Beweisidee: Radius MC einzeichnen', 'Proof idea: draw the radius MC'), default: false, visibleIf: (v) => v.mode === 'explore' },
    { key: 'grid', type: 'boolean', group: 'view', label: L('Gitternetz', 'Grid'), default: false },
    { key: 'val', type: 'boolean', group: 'view', label: L('Winkelgröße im Bild anzeigen', 'Show the angle size in the picture'), default: true },
  ],
  resultsParam: 'val',
  actions: [
    { id: 'back', label: L('◀ Zurück', '◀ Back'), visibleIf: (v) => v.mode === 'proof' || v.mode === 'tangent' || v.mode === 'construct' },
    { id: 'fwd', label: L('Weiter ▶', 'Next ▶'), primary: true, visibleIf: (v) => v.mode === 'proof' || v.mode === 'tangent' || v.mode === 'construct' },
    { id: 'qcheck', label: L('Prüfen', 'Check'), primary: true, visibleIf: (v) => v.mode === 'quiz' },
    { id: 'qnext', label: L('Nächste Aufgabe', 'Next task'), visibleIf: (v) => v.mode === 'quiz' },
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
    { id: 'steps', label: L('Beweis Schritt für Schritt', 'Proof step by step'), values: { mode: 'proof', st: 1, phi: 65 } },
    { id: 'tangent', label: L('Tangenten an einen Kreis', 'Tangents to a circle'), values: { mode: 'tangent', st: 1 } },
    { id: 'construct', label: L('Dreieck mit c = 6 cm, a = 4 cm', 'Triangle with c = 6 cm, a = 4 cm'), values: { mode: 'construct', st: 1, hc: 6, ha: 4 } },
    { id: 'centre', label: L('Kreismitte finden', 'Find the centre'), values: { mode: 'centre' } },
    { id: 'quiz', label: L('Übung: spitz, recht oder stumpf?', 'Practice: acute, right or obtuse?'), values: { mode: 'quiz', qn: 1 } },
  ],
  strings: {
    de: {
      canvas: 'Thaleskreis über der Strecke AB mit Mittelpunkt M, Dreieck ABC und dem Winkel bei C; C liegt auf dem Kreis oder lässt sich frei verschieben',
      on: 'auf dem Thaleskreis',
      inside: 'innerhalb des Thaleskreises',
      outside: 'außerhalb des Thaleskreises',
      right: 'rechter Winkel',
      obtuse: 'stumpf (größer als 90°)',
      acute: 'spitz (kleiner als 90°)',
      degenerate: 'kein Dreieck (C liegt auf der Geraden AB)',
      proofText: 'γ = α + β und α + β + γ = 180°, also 2γ = 180° und γ = 90°',
      proofFree: 'Die Beweisidee gilt nur, wenn C auf dem Kreis liegt.',
      stepOf: 'Schritt {k} von {n}',
      pr1T: 'Behauptung', pr1: 'C liegt auf dem Kreis über [AB]. Dann ist der Winkel γ bei C ein rechter Winkel. Warum? Tippe auf „Weiter“.',
      pr2T: 'Drei gleich lange Strecken', pr2: 'Zeichne die Strecke von M nach C. MA, MB und MC sind alle Radien des Kreises – also gleich lang.',
      pr3T: 'Zwei gleichschenklige Dreiecke', pr3: 'Die Strecke MC teilt ABC in zwei Dreiecke: AMC und MBC. Beide haben zwei gleich lange Seiten (je zwei Radien).',
      pr4T: 'Basiswinkel', pr4: 'In einem gleichschenkligen Dreieck sind die Basiswinkel gleich groß. Darum taucht α auch bei C auf, und β ebenso. Also ist γ = α + β.',
      pr5T: 'Winkelsumme', pr5: 'Im Dreieck ABC gilt α + β + γ = 180°. Mit γ = α + β wird daraus γ + γ = 180°, also γ = 90°. Das gilt für jede Lage von C – zieh C und probiere es aus.',
      tg1T: 'Aufgabe', tg1: 'Gegeben sind ein Kreis k um O und ein Punkt P außerhalb. Gesucht sind die Geraden durch P, die k nur berühren (Tangenten).',
      tg2T: 'Mittelpunkt von OP', tg2: 'Eine Tangente steht senkrecht auf dem Radius zum Berührpunkt T. Der Winkel bei T muss also 90° sein. Dazu brauchen wir den Mittelpunkt M von [OP].',
      tg3T: 'Thaleskreis über OP', tg3: 'Alle Punkte mit einem rechten Winkel über [OP] liegen auf dem Thaleskreis um M. Wo er k schneidet, liegen die Berührpunkte T₁ und T₂.',
      tg4T: 'Tangenten zeichnen', tg4: 'Die Geraden PT₁ und PT₂ sind die Tangenten. Die Länge des Tangentenabschnitts folgt aus Pythagoras: |PT|² = |OP|² − r².',
      tgIn: 'P liegt im Kreis – von dort gibt es keine Tangente. Zieh P nach außen.', tgOn: 'P liegt auf dem Kreis – dann ist P selbst der Berührpunkt.', tgLen: '|OP| = {d} · |PT| = √({d}² − {r}²) ≈ {t}',
      co1T: 'Hypotenuse zeichnen', co1: 'Zeichne die Strecke [AB] mit c = {c} cm. Sie wird die längste Seite – die Hypotenuse.',
      co2T: 'Thaleskreis', co2: 'Konstruiere den Mittelpunkt M von [AB] und zeichne den Kreis um M mit Radius c : 2 = {r} cm. Jeder Punkt C darauf ergibt einen rechten Winkel.',
      co3T: 'Kreis um B', co3: 'Zeichne den Kreis um B mit Radius a = {a} cm. Wo er den Thaleskreis schneidet, liegt C.',
      co4T: 'Fertig', co4: 'ABC ist rechtwinklig mit γ = 90°. Die dritte Seite folgt aus Pythagoras: b = √(c² − a²) ≈ {b} cm. Winkel: α ≈ {al}°, β ≈ {be}°.',
      coNo: 'a muss kürzer sein als c – sonst trifft der Kreis um B den Thaleskreis nicht. Die Hypotenuse ist immer die längste Seite.',
      ceT: 'Wo ist die Mitte?', ce1: 'Lege die rechte Ecke des Geodreiecks auf den Rand. Wo die Schenkel den Rand treffen, sind die Enden eines Durchmessers – das ist Thales rückwärts.',
      ce2: 'Mach das ein zweites Mal an einer anderen Stelle. Die beiden Durchmesser schneiden sich im Mittelpunkt.', ceHow: 'Zieh die Ecken und die Schenkel-Punkte am Rand.', ceSame: 'Beide Durchmesser liegen aufeinander – leg das zweite Geodreieck woanders an.',
      qT: 'Wie groß ist der Winkel bei C?', qHow: 'Schau, wo C im Vergleich zum Thaleskreis liegt. Wähle die Antwort und tippe auf „Prüfen“.', qOk: 'Richtig!', qNo: 'Leider nicht.', qWhy: 'C liegt {pos} – also ist γ {kind}.', qScore: '{k} von {n} richtig',

    },
    en: {
      canvas: 'Thales circle over segment AB with centre M, triangle ABC and the angle at C; C lies on the circle or can be moved freely',
      on: 'on the Thales circle',
      inside: 'inside the Thales circle',
      outside: 'outside the Thales circle',
      right: 'right angle',
      obtuse: 'obtuse (greater than 90°)',
      acute: 'acute (less than 90°)',
      degenerate: 'not a triangle (C lies on line AB)',
      proofText: 'γ = α + β and α + β + γ = 180°, so 2γ = 180° and γ = 90°',
      proofFree: 'The proof idea only applies when C lies on the circle.',
      stepOf: 'Step {k} of {n}',
      pr1T: 'Claim', pr1: 'C lies on the circle over [AB]. Then the angle γ at C is a right angle. Why? Tap “Next”.',
      pr2T: 'Three equal segments', pr2: 'Draw the segment from M to C. MA, MB and MC are all radii of the circle – so they are equal.',
      pr3T: 'Two isosceles triangles', pr3: 'MC splits ABC into two triangles: AMC and MBC. Both have two equal sides (two radii each).',
      pr4T: 'Base angles', pr4: 'In an isosceles triangle the base angles are equal. So α appears again at C, and so does β. Hence γ = α + β.',
      pr5T: 'Angle sum', pr5: 'In triangle ABC, α + β + γ = 180°. With γ = α + β this becomes γ + γ = 180°, so γ = 90°. This holds for every position of C – drag C and try it.',
      tg1T: 'Task', tg1: 'Given a circle k with centre O and a point P outside. We want the lines through P that only touch k (tangents).',
      tg2T: 'Midpoint of OP', tg2: 'A tangent is perpendicular to the radius at the point of contact T. So the angle at T must be 90°. For that we need the midpoint M of [OP].',
      tg3T: 'Thales circle over OP', tg3: 'All points with a right angle over [OP] lie on the Thales circle around M. Where it meets k we find the points of contact T₁ and T₂.',
      tg4T: 'Draw the tangents', tg4: 'The lines PT₁ and PT₂ are the tangents. The tangent length follows from Pythagoras: |PT|² = |OP|² − r².',
      tgIn: 'P lies inside the circle – there is no tangent from there. Drag P outside.', tgOn: 'P lies on the circle – then P itself is the point of contact.', tgLen: '|OP| = {d} · |PT| = √({d}² − {r}²) ≈ {t}',
      co1T: 'Draw the hypotenuse', co1: 'Draw the segment [AB] with c = {c} cm. It will be the longest side – the hypotenuse.',
      co2T: 'Thales circle', co2: 'Construct the midpoint M of [AB] and draw the circle around M with radius c ÷ 2 = {r} cm. Every point C on it gives a right angle.',
      co3T: 'Circle around B', co3: 'Draw the circle around B with radius a = {a} cm. Where it meets the Thales circle, you find C.',
      co4T: 'Done', co4: 'ABC has a right angle γ = 90°. The third side follows from Pythagoras: b = √(c² − a²) ≈ {b} cm. Angles: α ≈ {al}°, β ≈ {be}°.',
      coNo: 'a must be shorter than c – otherwise the circle around B does not meet the Thales circle. The hypotenuse is always the longest side.',
      ceT: 'Where is the centre?', ce1: 'Put the right-angled corner of a set square on the edge. Where the legs meet the edge are the ends of a diameter – Thales in reverse.',
      ce2: 'Do it a second time somewhere else. The two diameters cross at the centre.', ceHow: 'Drag the corners and the leg points on the edge.', ceSame: 'Both diameters coincide – place the second set square somewhere else.',
      qT: 'How big is the angle at C?', qHow: 'Look where C lies compared with the Thales circle. Choose your answer and tap “Check”.', qOk: 'Correct!', qNo: 'Not quite.', qWhy: 'C lies {pos} – so γ is {kind}.', qScore: '{k} of {n} correct',

    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    // Die Aufteilung wird weiter unten definiert; bis dahin die ganze Fläche
    let layoutReady = false;
    const plot = new Plot(surface, { x: [-5, 5], y: [-3.6, 4.4], pan: false, region: (w, h) => (layoutReady ? plotRegion() : { x: 0, y: 0, w, h }) });
    const p = ctx.params;
    const fmt = ctx.fmt;
    let phi = p.phi;

    const pointC = (): Point => {
      if (p.free && p.mode === 'explore') return [p.cx, p.cy];
      const r = degToRad(phi);
      return [R * Math.cos(r), R * Math.sin(r)];
    };

    plot.addHandle({
      get: () => pointC(),
      set: (x, y) => {
        if (p.free && p.mode === 'explore') ctx.set({ cx: x, cy: y });
        else {
          phi = mod(radToDeg(Math.atan2(y, x)), 360);
          ctx.set({ phi: Math.round(phi) });
        }
      },
      enabled: () => !ctx.locked && (p.mode === 'explore' || p.mode === 'proof'),
      color: () => ctx.theme.text,
    });

    /**
     * Farbe für den Winkel bei C: grün = 90°, orange = stumpf, blau = spitz.
     * Sind die Ergebnisse verdeckt, neutral, damit die Farbe nichts verrät.
     */
    const angleColor = (kind: AngleKind) =>
      !p.val
        ? ctx.theme.series[4]!
        : kind === 'degenerate'
          ? ctx.theme.text
        : kind === 'right'
          ? ctx.theme.series[2]!
          : kind === 'obtuse'
            ? ctx.theme.series[3]!
            : ctx.theme.series[0]!;

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

    function exploreUpdate(changed: ReadonlySet<string>): void {
        if (changed.has('phi') && Math.abs(p.phi - phi) > 0.6) phi = p.phi;
        const c = pointC();
        const gamma = angleAt(c, A, B);
        // Lage und Winkelart mit derselben (strengen) Toleranz, damit z. B. nicht
        // „auf dem Thaleskreis“ neben „γ ≈ 89,9° – spitz“ steht.
        const position = positionToCircle(c, M, R, 1e-9);
        const kind = angleKind(c, A, B);
        ctx.readout('gamma', kind === 'degenerate' ? ctx.t('degenerate') : `γ ≈ ${fmt.num(gamma, 1)}° – ${ctx.t(kind)}`);
        ctx.readout('position', ctx.t(position));
        if (!p.proof) ctx.readout('proof', null);
        else if (kind === 'degenerate') ctx.readout('proof', ctx.t('degenerate'));
        else if (position !== 'on') ctx.readout('proof', ctx.t('proofFree'));
        else {
          const alpha = angleAt(A, B, c);
          const beta = angleAt(B, A, c);
          ctx.readout('proof', `α ≈ ${fmt.num(alpha, 1)}°, β ≈ ${fmt.num(beta, 1)}°; ${ctx.t('proofText')}`);
        }
      }

    function drawExplore(): void {
        const c = pointC();
        const theme = ctx.theme;
        const gamma = angleAt(c, A, B);
        const position = positionToCircle(c, M, R, 1e-9);
        const kind = angleKind(c, A, B);
        const color = angleColor(kind);
        const showProof = p.proof && position === 'on' && kind !== 'degenerate';
        const centre: Point = [(A[0] + B[0] + c[0]) / 3, (A[1] + B[1] + c[1]) / 3];

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
        if (showProof) {
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
        // Rechtwinkelzeichen nur, wenn C wirklich auf dem Kreis liegt (und die
        // Ergebnisse sichtbar sind); sonst ein Winkelbogen.
        if (kind !== 'degenerate') {
          if (!showProof) {
            if (kind === 'right' && p.val) rightAngleMark(c, A, B, 18, color);
            else angleArc(c, A, B, 28, color);
          }
          const dx = centre[0] - c[0];
          const dy = centre[1] - c[1];
          const len = Math.hypot(dx, dy) || 1;
          const label = p.val ? `γ = ${fmt.num(gamma, kind === 'right' ? 0 : 1)}°` : 'γ';
          plot.textPx(plot.px(c[0]) + (dx / len) * 62, plot.py(c[1]) - (dy / len) * 62, label, {
            color,
            weight: 'bold',
            size: 15,
            math: !p.val,
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
      }

    /* -------------------------------------------------------------- */
    /* Aufteilung: Karte + Zeichnung                                   */
    /* -------------------------------------------------------------- */

    const th = () => ctx.theme;
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const wide = () => surface.width >= 600 && surface.width >= surface.height * 1.2;
    function regions(): { card: Rect; plot: Rect } {
      const w = surface.width;
      const h = surface.height;
      const pad = 10;
      if (wide()) {
        const cw = Math.round(w * 0.38);
        return { card: { x: pad, y: pad, w: cw - pad, h: h - 2 * pad }, plot: { x: cw + pad, y: pad, w: w - cw - 2 * pad, h: h - 2 * pad } };
      }
      const ch = Math.round(h * 0.4);
      return { card: { x: pad, y: pad, w: w - 2 * pad, h: ch }, plot: { x: pad, y: ch + 2 * pad, w: w - 2 * pad, h: h - ch - 3 * pad } };
    }
    function plotRegion(): Rect {
      if (p.mode === 'explore') return { x: 0, y: 0, w: surface.width, h: surface.height };
      const r = regions().plot;
      return { x: r.x + 4, y: r.y + 4, w: r.w - 8, h: r.h - 8 };
    }
    layoutReady = true;
    plot.resize();

    /** Ausschnitt so wählen, dass das Rechteck [x0,x1]×[y0,y1] ganz sichtbar ist. */
    function fitBox(x0: number, x1: number, y0: number, y1: number): void {
      plot.resize();
      const reg = plotRegion();
      const cx = (x0 + x1) / 2;
      const cy = (y0 + y1) / 2;
      const k = Math.min(reg.w / (x1 - x0), reg.h / (y1 - y0));
      const hx = reg.w / (2 * k);
      const hy = reg.h / (2 * k);
      plot.setRange([cx - hx, cx + hx], [cy - hy, cy + hy]);
    }
    let fitKey = '';
    function fitView(): void {
      fitKey = `${surface.width}x${surface.height}|${p.mode}|${p.hc}`;
      if (p.mode === 'explore') return fitBox(-5, 5, -3.6, 4.4);
      if (p.mode === 'proof' || p.mode === 'quiz') return fitBox(-3.8, 3.8, -1.1, 4.9);
      if (p.mode === 'tangent') return fitBox(-3.4, 6.4, -4.2, 4.2);
      if (p.mode === 'centre') return fitBox(-3.8, 3.8, -3.8, 3.8);
      const c = p.hc;
      return fitBox(-c / 2 - 0.8, c / 2 + 0.8, -c * 0.12 - 0.5, c / 2 + 0.9);
    }

    /* -------------------------------------------------------------- */
    /* Text in der Karte                                               */
    /* -------------------------------------------------------------- */

    function writer(g: CanvasRenderingContext2D, R0: Rect) {
      const x = R0.x + 18;
      const maxW = R0.w - 36;
      const size = Math.max(13, Math.min(17, R0.w / 25));
      let y = R0.y + 26;
      const font = (w: number, fs: number) => `${w} ${fs}px ${th().font}`;
      return {
        para(text: string, c: string, d = 0, w = 500): void {
          const fs = Math.max(11, size + d);
          g.save();
          g.font = font(w, fs);
          g.fillStyle = c;
          g.textBaseline = 'middle';
          g.textAlign = 'left';
          let cur = '';
          const flush = () => {
            g.fillText(cur, x, y);
            y += fs * 1.38;
            cur = '';
          };
          for (const word of text.split(' ')) {
            const next = cur ? `${cur} ${word}` : word;
            if (cur && g.measureText(next).width > maxW) {
              flush();
              cur = word;
            } else cur = next;
          }
          if (cur) flush();
          y += fs * 0.2;
          g.restore();
        },
        gap(h = 6): void {
          y += h;
        },
        /** Punkte für die Schritte (●●○○) */
        dots(k: number, n: number, c: string): void {
          for (let i = 0; i < n; i++) {
            g.beginPath();
            g.arc(x + 6 + i * 18, y, 5.5, 0, Math.PI * 2);
            g.fillStyle = i < k ? c : withAlpha(th().text, 0.15);
            g.fill();
          }
          g.save();
          g.font = font(600, size - 3);
          g.fillStyle = th().muted;
          g.textBaseline = 'middle';
          g.fillText(tr('stepOf', { k, n }), x + n * 18 + 8, y);
          g.restore();
          y += size * 1.5;
        },
      };
    }
    const maxStep = () => (p.mode === 'proof' ? 5 : 4);
    const step = () => Math.max(1, Math.min(maxStep(), p.st));
    const stepTw = new Tween(450, ease.outCubic);
    /** Einblenden des neuen Schritts */
    const fade = (k: number) => (step() === k && stepTw.running ? stepTw.value : 1);

    /* -------------------------------------------------------------- */
    /* Beweis Schritt für Schritt                                      */
    /* -------------------------------------------------------------- */

    function drawProof(g: CanvasRenderingContext2D, card: Rect): void {
      const t = th();
      const k = step();
      const W = writer(g, card);
      W.dots(k, 5, t.series[4]!);
      W.para(ctx.t(`pr${k}T`), t.series[4]!, 1, 800);
      W.para(ctx.t(`pr${k}`), t.text, -1.5);
      const c = pointC();
      const kind = angleKind(c, A, B);
      const alpha = angleAt(A, B, c);
      const beta = angleAt(B, A, c);
      if (kind !== 'degenerate' && k >= 4) {
        W.gap(4);
        W.para(`α ≈ ${fmt.num(alpha, 1)}°   β ≈ ${fmt.num(beta, 1)}°`, t.text, -1, 700);
        W.para(`γ = α + β ≈ ${fmt.num(alpha + beta, 1)}°`, t.series[2]!, -1, 700);
      }

      plot.begin();
      plot.circle(0, 0, R, { fill: t.series[4]!, alpha: 0.05 });
      plot.circle(0, 0, R, { stroke: withAlpha(t.series[4]!, 0.85), width: 2 });
      const ca = t.series[0]!;
      const cb = t.series[1]!;
      if (k >= 3 && kind !== 'degenerate') {
        const a = 0.16 * fade(3);
        plot.polygon([A, M, c], { fill: ca, alpha: a });
        plot.polygon([M, B, c], { fill: cb, alpha: a });
      } else plot.polygon([A, B, c], { fill: t.series[2]!, alpha: 0.08 });
      plot.polygon([A, B, c], { stroke: t.text, width: 2.5 });
      plot.segment(A, B, { color: t.text, width: 3.5 });
      if (k >= 2) {
        plot.segment(M, c, { color: withAlpha(t.series[4]!, fade(2)), width: 2.5, dash: [6, 5] });
        for (const q of [A, B, c]) tick(M, q, withAlpha(t.series[4]!, fade(2)));
      }
      if (kind !== 'degenerate') {
        if (k >= 4) {
          const f = fade(4);
          angleArc(A, B, c, 34, withAlpha(ca, f));
          angleArc(c, A, M, 30, withAlpha(ca, f));
          angleArc(B, A, c, 34, withAlpha(cb, f));
          angleArc(c, M, B, 42, withAlpha(cb, f), 0.12);
          plot.text(A[0], A[1], 'α', { color: ca, math: true, size: 17, offset: [40, -12] });
          plot.text(B[0], B[1], 'β', { color: cb, math: true, size: 17, offset: [-48, -12] });
        }
        if (k === 5) rightAngleMark(c, A, B, 16, t.series[2]!);
        else if (k < 4) angleArc(c, A, B, 26, t.series[2]!);
        const centre: Point = [(A[0] + B[0] + c[0]) / 3, (A[1] + B[1] + c[1]) / 3];
        const dx = centre[0] - c[0];
        const dy = centre[1] - c[1];
        const len = Math.hypot(dx, dy) || 1;
        if (k === 5 || k === 1) {
          plot.textPx(plot.px(c[0]) + (dx / len) * 64, plot.py(c[1]) - (dy / len) * 64, k === 5 ? 'γ = 90°' : 'γ = ?', {
            color: t.series[2]!,
            weight: 'bold',
            size: 15,
            align: 'center',
            baseline: 'middle',
          });
        }
      }
      const centre: Point = [(A[0] + B[0] + c[0]) / 3, (A[1] + B[1] + c[1]) / 3];
      plot.point(M[0], M[1], { color: t.series[4], radius: 4 });
      plot.text(M[0], M[1], 'M', { math: true, size: 16, color: t.series[4], align: 'center', offset: [0, 20] });
      plot.point(A[0], A[1], { color: t.text, radius: 5 });
      plot.point(B[0], B[1], { color: t.text, radius: 5 });
      vertexLabel(A, 'A', centre);
      vertexLabel(B, 'B', centre);
      plot.point(c[0], c[1], { color: t.series[2]!, radius: 7 });
      vertexLabel(c, 'C', centre, t.series[2]!);
      plot.end();
    }

    /* -------------------------------------------------------------- */
    /* Tangenten an einen Kreis                                        */
    /* -------------------------------------------------------------- */

    plot.addHandle({
      get: () => [p.px, p.py],
      set: (x, y) => ctx.set({ px: Math.round(Math.max(-6, Math.min(6, x)) * 10) / 10, py: Math.round(Math.max(-4, Math.min(4, y)) * 10) / 10 }),
      enabled: () => !ctx.locked && p.mode === 'tangent',
      color: () => ctx.theme.series[3]!,
    });
    function drawTangent(g: CanvasRenderingContext2D, card: Rect): void {
      const t = th();
      const k = step();
      const O: Point = [0, 0];
      const P: Point = [p.px, p.py];
      const r = p.kr;
      const d = Math.hypot(P[0], P[1]);
      const Mm: Point = [P[0] / 2, P[1] / 2];
      const ts = tangentPoints(O, r, P);
      const W = writer(g, card);
      W.dots(k, 4, t.series[3]!);
      W.para(ctx.t(`tg${k}T`), t.series[3]!, 1, 800);
      if (d < r - 1e-9) W.para(ctx.t('tgIn'), t.series[1]!, -1.5, 600);
      else if (ts.length === 1) W.para(ctx.t('tgOn'), t.series[1]!, -1.5, 600);
      else W.para(ctx.t(`tg${k}`), t.text, -1.5);
      if (k === 4 && ts.length === 2) {
        W.gap(4);
        W.para(tr('tgLen', { d: fmt.num(d, 2), r: fmt.num(r, 1), t: fmt.num(Math.sqrt(d * d - r * r), 2) }), t.series[3]!, -1.5, 700);
      }

      plot.begin();
      plot.grid();
      plot.circle(0, 0, r, { fill: t.series[0]!, alpha: 0.07 });
      plot.circle(0, 0, r, { stroke: t.series[0]!, width: 2.5 });
      plot.segment(O, P, { color: withAlpha(t.text, 0.55), width: 1.6 });
      if (k >= 3 && d > r) {
        const f = fade(3);
        plot.circle(Mm[0], Mm[1], d / 2, { stroke: withAlpha(t.series[4]!, 0.85 * f), width: 2, dash: [7, 6] });
      }
      if (k >= 4) {
        const f = fade(4);
        for (const T of ts) {
          // Tangente als Gerade durch P und T
          plot.line(P, T, { color: withAlpha(t.series[3]!, f), width: 2.6 });
          plot.segment(O, T, { color: withAlpha(t.series[0]!, f), width: 2 });
          if (ts.length === 2) rightAngleMark(T, O, P, 12, withAlpha(t.series[2]!, f));
        }
      }
      if (k >= 2) {
        plot.point(Mm[0], Mm[1], { color: t.series[4]!, radius: 4.5 });
        plot.text(Mm[0], Mm[1], 'M', { color: t.series[4]!, math: true, size: 15, offset: [8, -10] });
      }
      if (k >= 3) {
        ts.forEach((T, i) => {
          plot.point(T[0], T[1], { color: t.series[2]!, radius: 5.5 });
          plot.text(T[0], T[1], ts.length > 1 ? `T${i === 0 ? '₁' : '₂'}` : 'T', { color: t.series[2]!, math: true, size: 16, offset: [T[0] >= 0 ? 10 : -10, T[1] >= 0 ? -10 : 16], align: T[0] >= 0 ? 'left' : 'right' });
        });
      }
      plot.point(0, 0, { color: t.series[0]!, radius: 4.5 });
      plot.text(0, 0, 'O', { color: t.series[0]!, math: true, size: 16, offset: [-8, 16], align: 'right' });
      plot.text(r * Math.cos(2.4), r * Math.sin(2.4), 'k', { color: t.series[0]!, math: true, size: 17, offset: [-12, -8], align: 'right' });
      plot.point(P[0], P[1], { color: t.series[3]!, radius: 6.5 });
      plot.text(P[0], P[1], 'P', { color: t.series[3]!, math: true, size: 17, offset: [10, -10] });
      plot.end();
    }

    /* -------------------------------------------------------------- */
    /* Rechtwinkliges Dreieck konstruieren                             */
    /* -------------------------------------------------------------- */

    function drawConstruct(g: CanvasRenderingContext2D, card: Rect): void {
      const t = th();
      const k = step();
      const c = p.hc;
      const a = p.ha;
      const tri = rightTriangle(c, a);
      const Ac: Point = [-c / 2, 0];
      const Bc: Point = [c / 2, 0];
      const W = writer(g, card);
      W.dots(k, 4, t.series[2]!);
      W.para(ctx.t(`co${k}T`), t.series[2]!, 1, 800);
      if (!tri && k >= 3) W.para(ctx.t('coNo'), t.series[1]!, -1.5, 600);
      else
        W.para(
          tr(`co${k}`, {
            c: fmt.num(c, 1),
            r: fmt.num(c / 2, 2),
            a: fmt.num(a, 1),
            b: tri ? fmt.num(tri.b, 2) : '–',
            al: tri ? fmt.num(tri.alpha, 1) : '–',
            be: tri ? fmt.num(tri.beta, 1) : '–',
          }),
          t.text,
          -1.5,
        );

      plot.begin();
      plot.grid();
      if (k >= 2) {
        const f = fade(2);
        plot.circle(0, 0, c / 2, { stroke: withAlpha(t.series[4]!, 0.85 * f), width: 2, dash: [7, 6] });
        plot.point(0, 0, { color: t.series[4]!, radius: 4 });
        plot.text(0, 0, 'M', { math: true, size: 15, color: t.series[4]!, align: 'center', offset: [0, 18] });
      }
      if (k >= 3) {
        const f = fade(3);
        plot.circle(Bc[0], Bc[1], a, { stroke: withAlpha(t.series[1]!, 0.8 * f), width: 2, dash: [3, 5] });
      }
      if (k >= 3 && tri) {
        if (k >= 4) {
          plot.polygon([tri.A, tri.B, tri.C], { fill: t.series[2]!, alpha: 0.14 * fade(4) });
          plot.segment(tri.A, tri.C, { color: t.text, width: 2.5 });
          rightAngleMark(tri.C, tri.A, tri.B, 14, t.series[2]!);
          const mid = (q1: Point, q2: Point): Point => [(q1[0] + q2[0]) / 2, (q1[1] + q2[1]) / 2];
          const mb = mid(tri.A, tri.C);
          plot.text(mb[0], mb[1], `b ≈ ${fmt.num(tri.b, 1)}`, { color: t.text, size: 14, weight: '600', offset: [-8, -8], align: 'right' });
        }
        plot.segment(tri.B, tri.C, { color: t.series[1]!, width: 2.8 });
        const ma: Point = [(tri.B[0] + tri.C[0]) / 2, (tri.B[1] + tri.C[1]) / 2];
        plot.text(ma[0], ma[1], `a = ${fmt.num(a, 1)}`, { color: t.series[1]!, size: 14, weight: '600', offset: [8, -8] });
        plot.point(tri.C[0], tri.C[1], { color: t.series[2]!, radius: 6.5 });
        plot.text(tri.C[0], tri.C[1], 'C', { math: true, size: 18, color: t.series[2]!, align: 'center', offset: [0, -16] });
      }
      plot.segment(Ac, Bc, { color: t.text, width: 3.5 });
      plot.text(0, 0, `c = ${fmt.num(c, 1)} cm`, { color: t.text, size: 14, weight: '600', align: 'center', offset: [0, k >= 2 ? 36 : 18] });
      plot.point(Ac[0], Ac[1], { color: t.text, radius: 5 });
      plot.point(Bc[0], Bc[1], { color: t.text, radius: 5 });
      plot.text(Ac[0], Ac[1], 'A', { math: true, size: 18, align: 'right', offset: [-10, 6] });
      plot.text(Bc[0], Bc[1], 'B', { math: true, size: 18, offset: [10, 6] });
      plot.end();
    }

    /* -------------------------------------------------------------- */
    /* Kreismitte mit dem Geodreieck                                   */
    /* -------------------------------------------------------------- */

    const angOf = (x: number, y: number) => Math.round(mod(radToDeg(Math.atan2(y, x)), 360)) % 360;
    const onCircle = (deg: number): Point => [R * Math.cos(degToRad(deg)), R * Math.sin(degToRad(deg))];
    for (const [vk, wk] of [['v1', 'w1'], ['v2', 'w2']] as const) {
      plot.addHandle({
        get: () => onCircle(p[vk]),
        set: (x, y) => ctx.set({ [vk]: angOf(x, y) }),
        enabled: () => !ctx.locked && p.mode === 'centre',
        color: () => ctx.theme.series[vk === 'v1' ? 0 : 1]!,
      });
      plot.addHandle({
        get: () => onCircle(p[wk]),
        set: (x, y) => ctx.set({ [wk]: angOf(x, y) }),
        enabled: () => !ctx.locked && p.mode === 'centre',
        color: () => ctx.theme.series[vk === 'v1' ? 0 : 1]!,
      });
    }
    /** Lage eines Geodreiecks: Ecke V auf dem Rand, ein Schenkel Richtung W. */
    function square(vDeg: number, wDeg: number) {
      const V = onCircle(vDeg);
      const Wp = onCircle(wDeg === vDeg ? vDeg + 1 : wDeg);
      const rot = Math.atan2(Wp[1] - V[1], Wp[0] - V[0]);
      // Der zweite Schenkel muss ins Innere zeigen: wähle die Drehrichtung entsprechend
      const inward = (ang: number) => Math.cos(ang) * -V[0] + Math.sin(ang) * -V[1] > 0;
      const second = inward(rot + Math.PI / 2) ? rot + Math.PI / 2 : rot - Math.PI / 2;
      const s1 = setSquareChord(R, degToRad(vDeg), rot);
      const s2 = setSquareChord(R, degToRad(vDeg), second);
      return { V, P: s1.P, Q: s2.P, rot, second };
    }
    function drawCentre(g: CanvasRenderingContext2D, card: Rect): void {
      const t = th();
      const W = writer(g, card);
      const s1 = square(p.v1, p.w1);
      const s2 = square(p.v2, p.w2);
      const m = lineIntersection(s1.P, s1.Q, s2.P, s2.Q);
      W.para(ctx.t('ceT'), t.series[2]!, 1, 800);
      W.para(ctx.t('ce1'), t.text, -1.5);
      W.para(ctx.t('ce2'), t.text, -1.5);
      W.gap(2);
      W.para(m ? ctx.t('ceHow') : ctx.t('ceSame'), m ? t.muted : t.series[1]!, -2.5, m ? 500 : 600);

      plot.begin();
      // Holzscheibe
      plot.circle(0, 0, R, { fill: t.dark ? '#6b4a2b' : '#e8cfa6', alpha: t.dark ? 0.45 : 0.6 });
      plot.circle(0, 0, R, { stroke: t.dark ? '#c79a62' : '#9a6b33', width: 3 });
      const cols = [t.series[0]!, t.series[1]!];
      [s1, s2].forEach((sq, i) => {
        const col = cols[i]!;
        plot.polygon([sq.V, sq.P, sq.Q], { fill: col, alpha: 0.14 });
        plot.segment(sq.V, sq.P, { color: col, width: 2.4 });
        plot.segment(sq.V, sq.Q, { color: col, width: 2.4 });
        plot.segment(sq.P, sq.Q, { color: col, width: 2, dash: [7, 5] });
        rightAngleMark(sq.V, sq.P, sq.Q, 13, col);
        plot.point(sq.P[0], sq.P[1], { color: col, radius: 4.5, hollow: true });
        plot.point(sq.Q[0], sq.Q[1], { color: col, radius: 4.5, hollow: true });
        plot.point(sq.V[0], sq.V[1], { color: col, radius: 6 });
      });
      if (m) {
        plot.point(m[0], m[1], { color: t.series[2]!, radius: 6.5 });
        plot.text(m[0], m[1], 'M', { math: true, size: 18, color: t.series[2]!, offset: [10, -12] });
      }
      plot.end();
    }

    /* -------------------------------------------------------------- */
    /* Übung                                                           */
    /* -------------------------------------------------------------- */

    let quiz = quizPoint(p.qn, R);
    let verdict: boolean | null = null;
    let score = { right: 0, all: 0 };
    const verdictTw = new Tween(450, ease.outCubic);
    function check(): void {
      if (verdict !== null) return;
      verdict = p.qa === quiz.kind;
      score = { right: score.right + (verdict ? 1 : 0), all: score.all + 1 };
      ctx.announce(verdict ? ctx.t('qOk') : `${ctx.t('qNo')} ${whyText()}`);
      verdictTw.play();
      ctx.requestRender();
    }
    const whyText = () => {
      const pos = quiz.kind === 'right' ? 'on' : quiz.kind === 'obtuse' ? 'inside' : 'outside';
      const kind = ctx.t(quiz.kind).split(' (')[0]!;
      return tr('qWhy', { pos: ctx.t(pos), kind });
    };
    function drawQuiz(g: CanvasRenderingContext2D, card: Rect): void {
      const t = th();
      const W = writer(g, card);
      W.para(ctx.t('qT'), t.series[4]!, 1, 800);
      if (verdict === null) W.para(ctx.t('qHow'), t.muted, -1.5);
      else {
        const big = verdictTw.running ? 1 + 0.25 * (1 - verdictTw.value) : 1;
        W.para(verdict ? ctx.t('qOk') : ctx.t('qNo'), verdict ? t.series[2]! : t.series[1]!, 3 * big, 800);
        W.para(whyText(), t.text, -1.5, 600);
        W.para(`γ ≈ ${fmt.num(angleAt(quiz.C, A, B), 1)}°`, t.text, -1, 700);
      }
      if (score.all) W.para(tr('qScore', { k: score.right, n: score.all }), t.muted, -2.5, 600);

      const c = quiz.C;
      const centre: Point = [(A[0] + B[0] + c[0]) / 3, (A[1] + B[1] + c[1]) / 3];
      const col = verdict === null ? t.series[4]! : quiz.kind === 'right' ? t.series[2]! : quiz.kind === 'obtuse' ? t.series[3]! : t.series[0]!;
      plot.begin();
      plot.circle(0, 0, R, { fill: t.series[4]!, alpha: 0.05 });
      plot.circle(0, 0, R, { stroke: withAlpha(t.series[4]!, 0.85), width: 2, dash: [7, 6] });
      plot.polygon([A, B, c], { fill: col, alpha: 0.12 });
      plot.polygon([A, B, c], { stroke: t.text, width: 2.5 });
      plot.segment(A, B, { color: t.text, width: 3.5 });
      if (verdict !== null && quiz.kind === 'right') rightAngleMark(c, A, B, 16, col);
      else angleArc(c, A, B, 26, col);
      if (verdict !== null) plot.segment(M, c, { color: withAlpha(t.series[4]!, 0.7), width: 1.6, dash: [4, 4] });
      plot.point(M[0], M[1], { color: t.series[4], radius: 4 });
      plot.text(M[0], M[1], 'M', { math: true, size: 16, color: t.series[4], align: 'center', offset: [0, 20] });
      plot.point(A[0], A[1], { color: t.text, radius: 5 });
      plot.point(B[0], B[1], { color: t.text, radius: 5 });
      vertexLabel(A, 'A', centre);
      vertexLabel(B, 'B', centre);
      plot.point(c[0], c[1], { color: col, radius: 7 });
      vertexLabel(c, 'C', centre, col);
      plot.end();
    }

    return {
      update(changed, source) {
        if (changed.has('qn') || source === 'init' || source === 'replace') {
          quiz = quizPoint(p.qn, R);
          verdict = null;
        }
        if (changed.has('mode')) verdict = null;
        if (changed.has('st') || changed.has('mode')) {
          if (!changed.has('mode') && source === 'input') stepTw.play();
        }
        if (p.mode === 'explore') exploreUpdate(changed);
        else for (const k of ['gamma', 'position', 'proof']) ctx.readout(k, null);
        if (changed.has('phi') && Math.abs(p.phi - phi) > 0.6) phi = p.phi;
      },

      action(id) {
        if (id === 'fwd' && p.st < maxStep()) {
          ctx.set({ st: Math.min(maxStep(), step() + 1) });
          stepTw.play();
        }
        if (id === 'back' && p.st > 1) ctx.set({ st: step() - 1 });
        if (id === 'qcheck') check();
        if (id === 'qnext') ctx.set({ qn: p.qn >= 999 ? 1 : p.qn + 1 });
      },

      tick(dt) {
        if (p.free || p.mode !== 'explore') return;
        phi = mod(phi + 30 * dt, 360);
        // Bei 0° und 180° liegt C auf A bzw. B – dort zeigt die Anzeige „kein Dreieck“.
        ctx.set({ phi: Math.round(phi) });
      },

      resetTime() {
        phi = 62;
        ctx.set({ phi: 62 });
      },

      render() {
        const g = surface.begin();
        if (fitKey !== `${surface.width}x${surface.height}|${p.mode}|${p.hc}`) fitView();
        if (p.mode === 'explore') drawExplore();
        else {
          const Rg = regions();
          drawCard(g, Rg.card, th());
          if (p.mode === 'proof') drawProof(g, Rg.card);
          else if (p.mode === 'tangent') drawTangent(g, Rg.card);
          else if (p.mode === 'construct') drawConstruct(g, Rg.card);
          else if (p.mode === 'centre') drawCentre(g, Rg.card);
          else drawQuiz(g, Rg.card);
        }
        if (stepTw.running || verdictTw.running) ctx.requestRender();
      },

      resetView: () => fitView(),
      destroy: () => surface.destroy(),
    };
  },
});
