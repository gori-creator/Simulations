import { defineSimulation, ease, Plot, prefersReducedMotion, roundRect, Surface, TapTarget, text, Tween, withAlpha, type Rect } from '../../../sim-core';
import {
  circleLine,
  distance,
  foot,
  isExactLength,
  judge,
  lineRelation,
  makeTask,
  measured,
  pointLineDistance,
  pointText,
  samePoint,
  X_MAX,
  Y_MAX,
  type CircleRelation,
  type LineRelation,
  type Pt,
  type Task,
  type TaskKind,
  type Verdict,
} from './model';

const L = (de: string, en: string) => ({ de, en });
type Mode = 'punkte' | 'lage' | 'kreis' | 'spiel';
type Kind = 'strecke' | 'strahl' | 'gerade';
const isMode =
  (...modes: Mode[]) =>
  (v: Record<string, unknown>) =>
    modes.includes(v.mode as Mode);
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Sichtbarer Ausschnitt: 1. Quadrant mit etwas Rand für Achsenpfeile und Beschriftung. */
const SPAN_X = [-0.75, X_MAX + 0.9] as const;
const SPAN_Y = [-0.7, Y_MAX + 0.75] as const;
/** Halbe Länge der Zeichenkante des (verkleinerten) Geodreiecks in cm. */
const GEO = 4;

interface Hit {
  id: string;
  r: Rect;
}

/**
 * Punkte, Strecken, Halbgeraden, Geraden und Kreise im Koordinatensystem
 * (1. Quadrant): Koordinaten ablesen und setzen, parallel und senkrecht mit dem
 * Geodreieck prüfen, Abstand eines Punktes von einer Geraden, Lage von Kreis
 * und Gerade (Passante, Tangente, Sekante) und ein kleines Punkte-Spiel.
 */
export default defineSimulation({
  id: 'koordinaten-lage',
  dragHint: true,
  layout: { aspect: 1.72, aspectNarrow: 0.62 },
  groups: [
    { id: 'pts', label: L('Koordinaten der Punkte', 'Coordinates of the points') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Thema', 'Topic'),
      options: [
        { value: 'punkte', label: L('Punkte und Linien', 'Points and lines') },
        { value: 'lage', label: L('Parallel und senkrecht', 'Parallel and perpendicular') },
        { value: 'kreis', label: L('Kreis und Gerade', 'Circle and line') },
        { value: 'spiel', label: L('Punkte-Spiel', 'Point game') },
      ],
      default: 'punkte',
    },
    {
      key: 'kind',
      type: 'choice',
      label: L('Linie durch A und B', 'Line through A and B'),
      options: [
        { value: 'strecke', label: L('Strecke', 'Segment') },
        { value: 'strahl', label: L('Halbgerade', 'Ray') },
        { value: 'gerade', label: L('Gerade', 'Line') },
      ],
      default: 'strecke',
      visibleIf: isMode('punkte'),
    },
    {
      key: 'task',
      type: 'choice',
      label: L('Aufgaben', 'Tasks'),
      options: [
        { value: 'mix', label: L('Abwechselnd', 'Mixed') },
        { value: 'set', label: L('Punkte setzen', 'Plot points') },
        { value: 'read', label: L('Ablesen', 'Read off') },
      ],
      default: 'mix',
      visibleIf: isMode('spiel'),
    },
    { key: 'r', type: 'number', label: L('Radius r', 'Radius r'), min: 0.5, max: 6, step: 0.5, default: 2.5, unit: 'cm', visibleIf: isMode('kreis') },
    { key: 'ax', type: 'number', group: 'pts', label: L('A: x-Koordinate', 'A: x-coordinate'), min: 0, max: X_MAX, step: 1, default: 2, visibleIf: isMode('punkte', 'lage', 'kreis') },
    { key: 'ay', type: 'number', group: 'pts', label: L('A: y-Koordinate', 'A: y-coordinate'), min: 0, max: Y_MAX, step: 1, default: 2, visibleIf: isMode('punkte', 'lage', 'kreis') },
    { key: 'bx', type: 'number', group: 'pts', label: L('B: x-Koordinate', 'B: x-coordinate'), min: 0, max: X_MAX, step: 1, default: 8, visibleIf: isMode('punkte', 'lage', 'kreis') },
    { key: 'by', type: 'number', group: 'pts', label: L('B: y-Koordinate', 'B: y-coordinate'), min: 0, max: Y_MAX, step: 1, default: 5, visibleIf: isMode('punkte', 'lage', 'kreis') },
    { key: 'cx', type: 'number', group: 'pts', label: L('C: x-Koordinate', 'C: x-coordinate'), min: 0, max: X_MAX, step: 1, default: 4, visibleIf: isMode('lage') },
    { key: 'cy', type: 'number', group: 'pts', label: L('C: y-Koordinate', 'C: y-coordinate'), min: 0, max: Y_MAX, step: 1, default: 7, visibleIf: isMode('lage') },
    { key: 'dx', type: 'number', group: 'pts', label: L('D: x-Koordinate', 'D: x-coordinate'), min: 0, max: X_MAX, step: 1, default: 6, visibleIf: isMode('lage') },
    { key: 'dy', type: 'number', group: 'pts', label: L('D: y-Koordinate', 'D: y-coordinate'), min: 0, max: Y_MAX, step: 1, default: 3, visibleIf: isMode('lage') },
    { key: 'px', type: 'number', group: 'pts', label: L('P: x-Koordinate', 'P: x-coordinate'), min: 0, max: X_MAX, step: 1, default: 9, visibleIf: (v) => v.mode === 'lage' && v.dist === true },
    { key: 'py', type: 'number', group: 'pts', label: L('P: y-Koordinate', 'P: y-coordinate'), min: 0, max: Y_MAX, step: 1, default: 1, visibleIf: (v) => v.mode === 'lage' && v.dist === true },
    { key: 'mx', type: 'number', group: 'pts', label: L('M: x-Koordinate', 'M: x-coordinate'), min: 0, max: X_MAX, step: 1, default: 4, visibleIf: isMode('kreis') },
    { key: 'my', type: 'number', group: 'pts', label: L('M: y-Koordinate', 'M: y-coordinate'), min: 0, max: Y_MAX, step: 1, default: 5, visibleIf: isMode('kreis') },
    { key: 'ruler', type: 'boolean', group: 'view', label: L('Lineal anlegen (Länge messen)', 'Place a ruler (measure the length)'), default: false, visibleIf: (v) => v.mode === 'punkte' && v.kind === 'strecke' },
    { key: 'geo', type: 'boolean', group: 'view', label: L('Geodreieck anlegen', 'Place the set square'), default: false, visibleIf: isMode('lage') },
    { key: 'dist', type: 'boolean', group: 'view', label: L('Abstand eines Punktes P von g', 'Distance of a point P from g'), default: false, visibleIf: isMode('lage') },
    { key: 'labels', type: 'boolean', group: 'view', label: L('Koordinaten an die Punkte schreiben', 'Label the points with coordinates'), default: true, visibleIf: isMode('punkte', 'lage', 'kreis') },
    { key: 'help', type: 'boolean', group: 'view', label: L('Hilfslinien zu den Achsen', 'Guide lines to the axes'), default: true, visibleIf: isMode('punkte') },
  ],
  actions: [
    { id: 'new', label: L('Neue Aufgabe', 'New task'), primary: true, visibleIf: isMode('spiel') },
    { id: 'score', label: L('Punktestand löschen', 'Reset score'), visibleIf: isMode('spiel') },
    { id: 'perp', label: L('h senkrecht zu g stellen', 'Make h perpendicular to g'), visibleIf: isMode('lage') },
    { id: 'para', label: L('h parallel zu g stellen', 'Make h parallel to g'), visibleIf: isMode('lage') },
  ],
  readouts: [
    { key: 'pts', label: L('Punkte', 'Points') },
    { key: 'fig', label: L('Figur', 'Figure') },
    { key: 'rel', label: L('Lage', 'Relative position'), spoiler: true },
    { key: 'dist', label: L('Abstand', 'Distance'), spoiler: true },
    { key: 'score', label: L('Punktestand', 'Score') },
  ],
  presets: [
    { id: 'start', label: L('Strecke [AB]', 'Segment AB'), values: {} },
    { id: 'gerade', label: L('Gerade durch zwei Punkte', 'Line through two points'), values: { kind: 'gerade', ax: 1, ay: 6, bx: 4, by: 4 } },
    { id: 'senkrecht', label: L('Senkrechte Geraden', 'Perpendicular lines'), values: { mode: 'lage', geo: true } },
    { id: 'parallel', label: L('Parallele und Abstand', 'Parallels and distance'), values: { mode: 'lage', ax: 1, ay: 1, bx: 7, by: 4, cx: 2, cy: 5, dx: 6, dy: 7, geo: true } },
    { id: 'tangente', label: L('Tangente an einen Kreis', 'Tangent to a circle'), values: { mode: 'kreis', ax: 1, ay: 1, bx: 9, by: 1, mx: 5, my: 4, r: 3 } },
    { id: 'spiel', label: L('Punkte-Spiel', 'Point game'), values: { mode: 'spiel' } },
  ],
  strings: {
    de: {
      canvas: 'Koordinatensystem (1. Quadrant) mit Punkten, Geraden und Kreisen, rechts eine Erklärung zur Lage',
      points: 'Punkte',
      readHint: '(x | y): erst nach rechts, dann nach oben',
      lineThrough: 'Linie durch A und B',
      strecke: 'Strecke',
      strahl: 'Halbgerade',
      gerade: 'Gerade',
      tStrecke: 'Die Strecke [AB] hat zwei Endpunkte, A und B. Sie ist die kürzeste Verbindung von A nach B.',
      tStrahl: 'Die Halbgerade [AB beginnt in A, geht durch B und ist auf einer Seite unbegrenzt. Sie hat keine Länge.',
      tGerade: 'Die Gerade AB ist auf beiden Seiten unbegrenzt. Durch zwei Punkte geht genau eine Gerade.',
      writing: 'Schreibweise',
      wStrecke: 'Die eckigen Klammern zeigen: A und B sind Endpunkte.',
      wStrahl: 'Nur bei A steht eine Klammer: A ist der Anfangspunkt.',
      wGerade: 'Keine Klammern: Die Gerade hat keine Endpunkte.',
      length: 'Länge',
      lengthRuler: 'gemessen mit dem Lineal',
      lengthNone: 'unbegrenzt – keine Länge',
      relTitle: 'Lage von g und h',
      perp: 'g ⊥ h',
      perpText: 'g ist senkrecht zu h. Die Geraden bilden vier rechte Winkel.',
      para: 'g ∥ h',
      paraText: 'g ist parallel zu h. Die Geraden haben überall denselben Abstand und schneiden sich nie.',
      cut: 'g und h schneiden sich',
      cutText: 'Sie sind weder parallel noch senkrecht. Schnittwinkel ≈ {a}°.',
      same: 'g = h',
      sameText: 'g und h sind dieselbe Gerade: Alle vier Punkte liegen auf einer Geraden.',
      geoTitle: 'Prüfen mit dem Geodreieck',
      geoOff: 'Geodreieck anlegen',
      geoRemove: 'Geodreieck wegnehmen',
      geoShort: 'Geodreieck',
      geoRemoveShort: 'Geodreieck weg',
      geoHow: 'Lege die Zeichenkante auf g. Liegt h auf der Mittellinie, ist h senkrecht zu g. Verläuft h entlang einer der dünnen Linien, ist h parallel zu g.',
      distShortBtn: 'Abstand P–g',
      distHide: 'Abstand aus',
      geoPerp: 'Zeichenkante auf g, Nullpunkt auf S: h liegt auf der Mittellinie. ✓',
      geoPerpPar: 'Zeichenkante auf g: h verläuft parallel zur Mittellinie. ✓',
      geoPara: 'Zeichenkante auf g: h verläuft parallel zur Zeichenkante. ✓',
      geoCut: 'h liegt nicht auf der Mittellinie und nicht parallel zur Zeichenkante. ✗',
      geoSame: 'h liegt auf der Zeichenkante.',
      note: 'Merke',
      notePerp: 'Zwei Geraden sind senkrecht zueinander, wenn sie einen rechten Winkel (90°) bilden. Man schreibt g ⊥ h.',
      notePara: 'Parallele Geraden haben überall denselben Abstand. Man schreibt g ∥ h. Der Abstand wird senkrecht gemessen.',
      noteCut: 'Zwei Geraden, die nicht parallel sind, schneiden sich in genau einem Punkt.',
      noteSame: 'Durch zwei verschiedene Punkte geht genau eine Gerade.',
      distTitle: 'Abstand von P zu g',
      distOff: 'Abstand eines Punktes zeigen',
      distText: 'Länge des Lots von P auf g',
      distPara: 'Abstand der Parallelen',
      circleTitle: 'Kreis k',
      radius: 'Radius',
      diameter: 'Durchmesser',
      klTitle: 'Kreis und Gerade',
      passante: 'Passante',
      tangente: 'Tangente',
      sekante: 'Sekante',
      passanteText: 'g hat keinen gemeinsamen Punkt mit dem Kreis.',
      tangenteText: 'g berührt den Kreis in genau einem Punkt T. Der Radius zu T steht senkrecht auf g.',
      sekanteText: 'g schneidet den Kreis in zwei Punkten S₁ und S₂. Die Strecke [S₁S₂] ist eine Sehne.',
      compareTitle: 'Abstand von M zu g und Radius',
      distShort: 'Abstand',
      task: 'Aufgabe {n}',
      setTask: 'Setze diesen Punkt:',
      readTask: 'Lies die Koordinaten von Q ab:',
      tapGrid: 'Starte im Ursprung 0: erst nach rechts, dann nach oben. Tippe dann auf den Gitterpunkt.',
      readHelp: 'Tipp: Schau von Q senkrecht nach unten auf die x-Achse und waagerecht nach links auf die y-Achse.',
      chipX: 'x: nach rechts →',
      chipY: 'y: nach oben ↑',
      nextShort: 'Weiter ›',
      right: 'Richtig!',
      wrong: 'Leider nicht.',
      fbRight: '{x} nach rechts, {y} nach oben.',
      fbSwapped: 'x und y vertauscht? Erst nach rechts (x), dann nach oben (y).',
      fbNear: 'Knapp daneben – um eins verzählt. Zähle die Kästchen-Einheiten noch einmal.',
      fbWrong: 'Erst {x} nach rechts, dann {y} nach oben.',
      youSet: 'Du hast {p} gewählt.',
      next: 'Nächste Aufgabe ›',
      score: '{r} von {n} richtig',
      streak: 'Serie: {s}',
      scoreEmpty: 'Noch keine Aufgabe gelöst',
      right_: 'nach rechts',
      up_: 'nach oben',
      figStrecke: 'Strecke [AB] mit den Endpunkten A und B, Länge {l}',
      figStrahl: 'Halbgerade [AB mit dem Anfangspunkt A',
      figGerade: 'Gerade AB durch A und B',
      relPerp: 'g ⊥ h: g ist senkrecht zu h',
      relPara: 'g ∥ h: g ist parallel zu h, Abstand {d}',
      relCut: 'g und h schneiden sich (nicht senkrecht), Schnittwinkel ≈ {a}°',
      relSame: 'g und h sind identisch',
      distRead: 'Abstand von P zu g: {d}',
      circleRead: 'k: Mittelpunkt M{m}, r = {r}, d = {d}',
      klPassante: 'Passante: Abstand {d} > r – kein gemeinsamer Punkt',
      klTangente: 'Tangente: Abstand = r = {r} – genau ein gemeinsamer Punkt T{t}',
      klSekante: 'Sekante: Abstand {d} < r – zwei gemeinsame Punkte',
      equalPts: 'A und B müssen verschieden sein.',
    },
    en: {
      canvas: 'Coordinate plane (first quadrant) with points, lines and circles, with an explanation of their relative position',
      points: 'Points',
      readHint: '(x, y): first right, then up',
      lineThrough: 'Line through A and B',
      strecke: 'Segment',
      strahl: 'Ray',
      gerade: 'Line',
      tStrecke: 'The segment AB has two endpoints, A and B. It is the shortest path from A to B.',
      tStrahl: 'The ray AB starts at A, passes through B and goes on forever in one direction. It has no length.',
      tGerade: 'The line AB goes on forever in both directions. Exactly one line passes through two points.',
      writing: 'Notation',
      wStrecke: 'A bar over AB: a piece with two endpoints.',
      wStrahl: 'An arrow over AB: it starts at A and never ends.',
      wGerade: 'Arrows on both sides: no endpoints at all.',
      length: 'Length',
      lengthRuler: 'measured with the ruler',
      lengthNone: 'endless – no length',
      relTitle: 'Position of g and h',
      perp: 'g ⊥ h',
      perpText: 'g is perpendicular to h. The lines form four right angles.',
      para: 'g ∥ h',
      paraText: 'g is parallel to h. The lines are the same distance apart everywhere and never meet.',
      cut: 'g and h intersect',
      cutText: 'They are neither parallel nor perpendicular. Angle ≈ {a}°.',
      same: 'g = h',
      sameText: 'g and h are the same line: all four points lie on one line.',
      geoTitle: 'Checking with the set square',
      geoOff: 'Place the set square',
      geoRemove: 'Remove the set square',
      geoShort: 'Set square',
      geoRemoveShort: 'Remove it',
      geoHow: 'Put the edge on g. If h lies on the centre line, h is perpendicular to g. If h runs along one of the thin lines, h is parallel to g.',
      distShortBtn: 'Distance P–g',
      distHide: 'Hide distance',
      geoPerp: 'Edge on g, zero mark on S: h lies on the centre line. ✓',
      geoPerpPar: 'Edge on g: h runs parallel to the centre line. ✓',
      geoPara: 'Edge on g: h runs parallel to the edge. ✓',
      geoCut: 'h is not on the centre line and not parallel to the edge. ✗',
      geoSame: 'h lies on the edge.',
      note: 'Remember',
      notePerp: 'Two lines are perpendicular if they meet at a right angle (90°). We write g ⊥ h.',
      notePara: 'Parallel lines are the same distance apart everywhere. We write g ∥ h. The distance is measured at right angles.',
      noteCut: 'Two lines that are not parallel meet at exactly one point.',
      noteSame: 'Exactly one line passes through two different points.',
      distTitle: 'Distance from P to g',
      distOff: 'Show the distance of a point',
      distText: 'length of the perpendicular from P to g',
      distPara: 'Distance between the parallels',
      circleTitle: 'Circle k',
      radius: 'Radius',
      diameter: 'Diameter',
      klTitle: 'Circle and line',
      passante: 'Passant',
      tangente: 'Tangent',
      sekante: 'Secant',
      passanteText: 'g has no point in common with the circle.',
      tangenteText: 'g touches the circle at exactly one point T. The radius to T is perpendicular to g.',
      sekanteText: 'g cuts the circle at two points S₁ and S₂. The segment between them is a chord.',
      compareTitle: 'Distance from M to g and radius',
      distShort: 'Distance',
      task: 'Task {n}',
      setTask: 'Plot this point:',
      readTask: 'Read off the coordinates of Q:',
      tapGrid: 'Start at the origin 0: first go right, then up. Then tap the grid point.',
      readHelp: 'Tip: look straight down from Q to the x-axis and straight left to the y-axis.',
      chipX: 'x: to the right →',
      chipY: 'y: up ↑',
      nextShort: 'Next ›',
      right: 'Correct!',
      wrong: 'Not quite.',
      fbRight: '{x} to the right, {y} up.',
      fbSwapped: 'Swapped x and y? First go right (x), then up (y).',
      fbNear: 'Just off – miscounted by one. Count the units again.',
      fbWrong: 'First {x} to the right, then {y} up.',
      youSet: 'You chose {p}.',
      next: 'Next task ›',
      score: '{r} of {n} correct',
      streak: 'Streak: {s}',
      scoreEmpty: 'No task solved yet',
      right_: 'right',
      up_: 'up',
      figStrecke: 'Segment AB with endpoints A and B, length {l}',
      figStrahl: 'Ray AB starting at A',
      figGerade: 'Line AB through A and B',
      relPerp: 'g ⊥ h: g is perpendicular to h',
      relPara: 'g ∥ h: g is parallel to h, distance {d}',
      relCut: 'g and h intersect (not perpendicular), angle ≈ {a}°',
      relSame: 'g and h are identical',
      distRead: 'Distance from P to g: {d}',
      circleRead: 'k: centre M{m}, r = {r}, d = {d}',
      klPassante: 'Passant: distance {d} > r – no common point',
      klTangente: 'Tangent: distance = r = {r} – exactly one common point T{t}',
      klSekante: 'Secant: distance {d} < r – two common points',
      equalPts: 'A and B must be different.',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const lang = ctx.lang;
    const fmt = ctx.fmt;
    const reduced = prefersReducedMotion();
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (m, k: string) => String(vars[k] ?? m));
    const mode = () => p.mode as Mode;
    const kind = () => p.kind as Kind;
    const A = (): Pt => [p.ax, p.ay];
    const B = (): Pt => [p.bx, p.by];
    const C = (): Pt => [p.cx, p.cy];
    const D = (): Pt => [p.dx, p.dy];
    const P = (): Pt => [p.px, p.py];
    const M = (): Pt => [p.mx, p.my];
    /** Punkt als Text; geschützte Leerzeichen, damit „(3 | 5)“ beim Umbrechen zusammenbleibt. */
    const ptText = (q: Pt) => pointText(q[0], q[1], lang).replace(/ /g, '\u00a0');
    /** Länge mit „=“ oder „≈“ (auf Millimeter gerundet). */
    const lenNum = (v: number) => (isExactLength(v) ? fmt.num(v, 1) : fmt.fixed(measured(v), 1));
    const lenText = (v: number) => `${isExactLength(v) ? '=' : '≈'} ${lenNum(v)} cm`;
    const lenShort = (v: number) => `${isExactLength(v) ? '' : '≈ '}${lenNum(v)} cm`;

    const col = {
      g: () => ctx.theme.series[0]!,
      h: () => ctx.theme.series[1]!,
      p: () => ctx.theme.series[4]!,
      k: () => ctx.theme.series[5]!,
      ok: () => ctx.theme.series[2]!,
      warn: () => ctx.theme.series[3]!,
      bad: () => ctx.theme.series[1]!,
      x: () => ctx.theme.series[0]!,
      y: () => ctx.theme.series[1]!,
    };
    const onColor = () => (ctx.theme.dark ? '#10161f' : '#ffffff');

    /* ---------- Aufteilung der Bühne ---------- */
    const wide = () => surface.width >= 640;

    function layout(): { plot: Rect; panel: Rect } {
      const W = surface.width;
      const H = surface.height;
      const sx = SPAN_X[1] - SPAN_X[0];
      const sy = SPAN_Y[1] - SPAN_Y[0];
      if (wide()) {
        const panelW = Math.round(clamp(W * 0.31, 236, 310));
        const availW = W - panelW - 14;
        const unit = Math.min(availW / sx, (H - 4) / sy);
        const pw = Math.floor(unit * sx);
        const ph = Math.floor(unit * sy);
        return {
          plot: { x: Math.round((availW - pw) / 2), y: Math.round((H - ph) / 2), w: pw, h: ph },
          panel: { x: W - panelW, y: 2, w: panelW - 2, h: H - 4 },
        };
      }
      const unit = Math.min((W - 4) / sx, (H * 0.58) / sy);
      const pw = Math.floor(unit * sx);
      const ph = Math.floor(unit * sy);
      const plotR = { x: Math.round((W - pw) / 2), y: 2, w: pw, h: ph };
      return { plot: plotR, panel: { x: 2, y: ph + 12, w: W - 4, h: H - ph - 14 } };
    }

    const plot = new Plot(surface, { x: SPAN_X, y: SPAN_Y, pan: false, zoom: false, controls: false, region: () => layout().plot });

    /* ---------- Zustand ---------- */
    let rel: LineRelation = lineRelation(A(), B(), C(), D());
    let kl: CircleRelation = circleLine(M(), p.r, A(), B());
    const kindTw = new Tween(650, ease.inOutCubic);
    let kindFrom: [number, number] = [0, 1];
    const rulerTw = new Tween(700, ease.outCubic);
    const geoTw = new Tween(800, ease.outCubic);
    const relPop = new Tween(520, ease.outBack);
    const distTw = new Tween(600, ease.outCubic);
    /** Richtung des Radius-Griffs (nur bei Änderung von M neu gewählt, damit er beim Ziehen nicht springt). */
    let radAngle = Math.PI / 4;

    // Punkte-Spiel
    let taskNo = 1;
    let task: Task = makeTask(Math.random, firstKind());
    let answer: Pt | null = null;
    let verdict: Verdict | null = null;
    let history: boolean[] = [];
    let streak = 0;
    const pathTw = new Tween(1500, ease.linear);
    const taskPop = new Tween(480, ease.outBack);
    const burst = new Tween(900, ease.outCubic);
    const answerPop = new Tween(520, ease.outBack);
    const shake = new Tween(450, ease.linear);

    let hits: Hit[] = [];
    let hover: string | null = null;

    function firstKind(): TaskKind {
      return p.task === 'read' ? 'read' : 'set';
    }

    /* ---------- Ziehpunkte ---------- */
    const editable = (...modes: Mode[]) => () => !ctx.locked && modes.includes(mode());
    const gridPt = (x: number, y: number): Pt => [clamp(Math.round(x), 0, X_MAX), clamp(Math.round(y), 0, Y_MAX)];
    plot.addHandle({
      get: () => A(),
      set: (x, y) => {
        const q = gridPt(x, y);
        if (!samePoint(q, B())) ctx.set({ ax: q[0], ay: q[1] });
      },
      enabled: editable('punkte', 'lage', 'kreis'),
      color: col.g,
    });
    plot.addHandle({
      get: () => B(),
      set: (x, y) => {
        const q = gridPt(x, y);
        if (!samePoint(q, A())) ctx.set({ bx: q[0], by: q[1] });
      },
      enabled: editable('punkte', 'lage', 'kreis'),
      color: col.g,
    });
    plot.addHandle({
      get: () => C(),
      set: (x, y) => {
        const q = gridPt(x, y);
        if (!samePoint(q, D())) ctx.set({ cx: q[0], cy: q[1] });
      },
      enabled: editable('lage'),
      color: col.h,
    });
    plot.addHandle({
      get: () => D(),
      set: (x, y) => {
        const q = gridPt(x, y);
        if (!samePoint(q, C())) ctx.set({ dx: q[0], dy: q[1] });
      },
      enabled: editable('lage'),
      color: col.h,
    });
    plot.addHandle({
      get: () => P(),
      set: (x, y) => {
        const q = gridPt(x, y);
        ctx.set({ px: q[0], py: q[1] });
      },
      enabled: () => editable('lage')() && p.dist,
      color: col.p,
    });
    plot.addHandle({
      get: () => M(),
      set: (x, y) => {
        const q = gridPt(x, y);
        ctx.set({ mx: q[0], my: q[1] });
      },
      enabled: editable('kreis'),
      color: col.k,
    });
    plot.addHandle({
      get: () => [p.mx + p.r * Math.cos(radAngle), p.my + p.r * Math.sin(radAngle)],
      set: (x, y) => ctx.set({ r: clamp(Math.round(Math.hypot(x - p.mx, y - p.my) * 2) / 2, 0.5, 6) }),
      enabled: editable('kreis'),
      color: col.k,
    });

    /** Richtung für den Radius-Griff: möglichst im Bild und nicht auf g. */
    function chooseRadAngle(): void {
      const cands = [40, 140, -40, -140, 90, -90, 0, 180].map((d) => (d * Math.PI) / 180);
      const b = { x0: 0, x1: X_MAX + 0.5, y0: 0, y1: Y_MAX + 0.5 };
      const rr = 6;
      const ok = cands.find((a) => {
        const x = p.mx + rr * 0.6 * Math.cos(a);
        const y = p.my + rr * 0.6 * Math.sin(a);
        return x >= b.x0 && x <= b.x1 && y >= b.y0 && y <= b.y1;
      });
      radAngle = ok ?? Math.PI / 4;
    }
    chooseRadAngle();

    /* ---------- Geometrie-Hilfen ---------- */
    /** Parameterbereich der Geraden A + t·(B − A) innerhalb des sichtbaren Bereichs (mit Rand). */
    function clipLine(a: Pt, b: Pt): [number, number] {
      const bd = plot.bounds;
      const dx = b[0] - a[0];
      const dy = b[1] - a[1];
      let t0 = -Infinity;
      let t1 = Infinity;
      const edges: [number, number, number, number][] = [
        [dx, a[0], bd.xMin - 0.5, bd.xMax + 0.5],
        [dy, a[1], bd.yMin - 0.5, bd.yMax + 0.5],
      ];
      for (const [d, s, lo, hi] of edges) {
        if (Math.abs(d) < 1e-12) {
          if (s < lo || s > hi) return [0, 0];
          continue;
        }
        let u0 = (lo - s) / d;
        let u1 = (hi - s) / d;
        if (u0 > u1) [u0, u1] = [u1, u0];
        t0 = Math.max(t0, u0);
        t1 = Math.min(t1, u1);
      }
      return [t0, t1];
    }

    function kindRange(k: Kind): [number, number] {
      const [t0, t1] = clipLine(A(), B());
      if (k === 'strecke') return [0, 1];
      if (k === 'strahl') return [0, Math.max(1, t1)];
      return [Math.min(0, t0), Math.max(1, t1)];
    }

    function shownRange(): [number, number] {
      const target = kindRange(kind());
      if (!kindTw.running) return target;
      const t = kindTw.value;
      return [lerp(kindFrom[0], target[0], t), lerp(kindFrom[1], target[1], t)];
    }

    const unitVec = (a: Pt, b: Pt): Pt => {
      const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
      return [(b[0] - a[0]) / l, (b[1] - a[1]) / l];
    };
    const at = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

    /* ---------- Ergebnisse ---------- */
    function updateReadouts(): void {
      const m = mode();
      if (m === 'spiel') {
        ctx.readout('pts', null);
        ctx.readout('fig', null);
        ctx.readout('rel', null);
        ctx.readout('dist', null);
        const right = history.filter(Boolean).length;
        ctx.readout('score', history.length ? `${tr('score', { r: right, n: history.length })} · ${tr('streak', { s: streak })}` : ctx.t('scoreEmpty'));
        return;
      }
      ctx.readout('score', null);
      const names = m === 'lage' ? (['A', 'B', 'C', 'D'] as const) : (['A', 'B'] as const);
      const all: Record<string, Pt> = { A: A(), B: B(), C: C(), D: D() };
      const list = names.map((n) => `${n}${ptText(all[n]!)}`);
      if (m === 'lage' && p.dist) list.push(`P${ptText(P())}`);
      if (m === 'kreis') list.push(`M${ptText(M())}`);
      ctx.readout('pts', list.join(', '));
      if (m === 'punkte') {
        const k = kind();
        ctx.readout('fig', k === 'strecke' ? tr('figStrecke', { l: lenShort(distance(A(), B())) }) : ctx.t(k === 'strahl' ? 'figStrahl' : 'figGerade'));
        ctx.readout('rel', null);
        ctx.readout('dist', null);
      } else if (m === 'lage') {
        ctx.readout('fig', null);
        if (rel.kind === 'perpendicular') ctx.readout('rel', ctx.t('relPerp'));
        else if (rel.kind === 'parallel') ctx.readout('rel', tr('relPara', { d: lenShort(rel.distance) }));
        else if (rel.kind === 'intersecting') ctx.readout('rel', tr('relCut', { a: fmt.num(rel.angle, 0) }));
        else ctx.readout('rel', ctx.t('relSame'));
        ctx.readout('dist', p.dist ? tr('distRead', { d: lenShort(pointLineDistance(P(), A(), B())) }) : null);
      } else {
        ctx.readout('fig', tr('circleRead', { m: ptText(M()), r: `${fmt.num(p.r, 1)} cm`, d: `${fmt.num(2 * p.r, 1)} cm` }));
        const dd = lenShort(kl.distance);
        if (kl.kind === 'passante') ctx.readout('rel', tr('klPassante', { d: dd }));
        else if (kl.kind === 'tangente') ctx.readout('rel', tr('klTangente', { r: `${fmt.num(p.r, 1)} cm`, t: ptText(kl.points[0]) }));
        else ctx.readout('rel', tr('klSekante', { d: dd }));
        ctx.readout('dist', null);
      }
      // Aktionen „senkrecht/parallel stellen“ nur, wenn ein passender Gitterpunkt existiert
      if (m === 'lage') {
        ctx.setAction('perp', { enabled: !ctx.locked && construct('perp') !== null });
        ctx.setAction('para', { enabled: !ctx.locked && construct('para') !== null });
      }
    }

    /**
     * Neuer Punkt D, sodass h = CD senkrecht bzw. parallel zu g ist: D = C + k·w
     * mit der kleinsten ganzzahligen Richtung w; k so, dass |CD| etwa gleich bleibt.
     */
    function construct(how: 'perp' | 'para'): Pt | null {
      const u: Pt = [p.bx - p.ax, p.by - p.ay];
      let w: Pt = how === 'perp' ? [-u[1], u[0]] : u;
      const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a));
      const g0 = gcd(Math.abs(w[0]), Math.abs(w[1])) || 1;
      w = [w[0] / g0, w[1] / g0];
      const len = Math.max(2, Math.hypot(p.dx - p.cx, p.dy - p.cy));
      const cands: Pt[] = [];
      for (let k = -12; k <= 12; k++) {
        if (k === 0) continue;
        const q: Pt = [p.cx + k * w[0], p.cy + k * w[1]];
        if (q[0] < 0 || q[0] > X_MAX || q[1] < 0 || q[1] > Y_MAX) continue;
        cands.push(q);
      }
      if (!cands.length) return null;
      // möglichst ähnliche Länge, bei Gleichstand in Richtung des alten D
      const old: Pt = [p.dx - p.cx, p.dy - p.cy];
      cands.sort((q1, q2) => {
        const s = (q: Pt) => Math.abs(Math.hypot(q[0] - p.cx, q[1] - p.cy) - len) - 0.01 * ((q[0] - p.cx) * old[0] + (q[1] - p.cy) * old[1]);
        return s(q1) - s(q2);
      });
      return cands[0]!;
    }

    /* ---------- Spiel ---------- */
    function nextKind(): TaskKind {
      if (p.task === 'set') return 'set';
      if (p.task === 'read') return 'read';
      return task.kind === 'set' ? 'read' : 'set';
    }

    function newTask(kindOverride?: TaskKind): void {
      task = makeTask(Math.random, kindOverride ?? nextKind(), [task.x, task.y]);
      answer = null;
      verdict = null;
      taskNo++;
      answerPop.finish();
      pathTw.finish();
      taskPop.play();
      updateReadouts();
      ctx.requestRender();
    }

    function submit(q: Pt): void {
      if (answer) return;
      answer = q;
      verdict = judge([task.x, task.y], q);
      const ok = verdict === 'correct';
      history = [...history, ok].slice(-200);
      streak = ok ? streak + 1 : 0;
      answerPop.play();
      pathTw.play();
      if (!ok) shake.play();
      else burst.play();
      updateReadouts();
      ctx.requestRender();
    }

    /* ---------- Zeichnen: Grundbausteine ---------- */
    function card(r: Rect, accent?: string, tint = 0): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.10)';
      g.shadowBlur = 12;
      g.shadowOffsetY = 3;
      g.fillStyle = theme.dark ? '#151c27' : '#ffffff';
      roundRect(g, r.x, r.y, r.w, r.h, 12);
      g.fill();
      g.restore();
      if (accent && tint > 0) {
        g.fillStyle = withAlpha(accent, theme.dark ? tint * 1.6 : tint);
        roundRect(g, r.x, r.y, r.w, r.h, 12);
        g.fill();
      }
      g.strokeStyle = accent ? withAlpha(accent, 0.55) : theme.dark ? '#273142' : '#e3e8ef';
      g.lineWidth = 1.2;
      roundRect(g, r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1, 12);
      g.stroke();
    }

    function wrap(str: string, maxW: number, font: string): string[] {
      const g = surface.g;
      g.font = font;
      // „g ⊥ h“ und „g ∥ h“ nicht auseinanderreißen
      str = str.replace(/ ([⊥∥=]) /g, '\u00a0$1\u00a0');
      const rows: string[] = [];
      let cur = '';
      for (const w of str.split(' ')) {
        const next = cur ? `${cur} ${w}` : w;
        if (g.measureText(next).width > maxW && cur) {
          rows.push(cur);
          cur = w;
        } else cur = next;
      }
      if (cur) rows.push(cur);
      return rows;
    }

    function textRows(rows: string[], x: number, y: number, lh: number, font: string, color: string, align: CanvasTextAlign = 'left'): number {
      rows.forEach((row, i) => text(surface.g, row, x, y + i * lh, { font, color, align, baseline: 'middle' }));
      return rows.length * lh;
    }

    /** Punkt als Kreuzchen (wie im Heft), mit hellem Rand. */
    function crossMark(q: Pt, color: string, size = 6, scale = 1): void {
      const g = surface.g;
      const [x, y] = plot.toPx(q[0], q[1]);
      const s = size * scale;
      g.save();
      g.lineCap = 'round';
      g.strokeStyle = ctx.theme.bg;
      g.lineWidth = 6;
      g.beginPath();
      g.moveTo(x - s, y - s);
      g.lineTo(x + s, y + s);
      g.moveTo(x + s, y - s);
      g.lineTo(x - s, y + s);
      g.stroke();
      g.strokeStyle = color;
      g.lineWidth = 2.8;
      g.stroke();
      g.restore();
    }

    /** Beschriftung eines Punktes; `away` gibt die Richtung (in Pixeln) vom Punkt weg an. */
    function pointLabel(q: Pt, name: string, color: string, away: [number, number], withCoords = p.labels, sub?: string): void {
      const g = surface.g;
      const theme = ctx.theme;
      const [x, y] = plot.toPx(q[0], q[1]);
      const label = withCoords ? `${name}${ptText(q)}` : name;
      const font = `700 ${wide() ? 15 : 13}px ${theme.font}`;
      g.font = font;
      const w = g.measureText(label).width + (sub ? 6 : 0);
      const h = wide() ? 16 : 14;
      const l = Math.hypot(away[0], away[1]) || 1;
      const ux = away[0] / l;
      const uy = away[1] / l;
      const dist = 13 + Math.abs(ux) * (w / 2) + Math.abs(uy) * (h / 2);
      const r = plot.rect;
      const cx = clamp(x + ux * dist, r.x + w / 2 + 4, r.x + r.w - w / 2 - 4);
      const cy = clamp(y + uy * dist, r.y + h / 2 + 4, r.y + r.h - h / 2 - 4);
      g.save();
      g.lineJoin = 'round';
      g.lineWidth = 4;
      g.strokeStyle = theme.bg;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.strokeText(label, cx, cy);
      g.fillStyle = color;
      g.fillText(label, cx, cy);
      g.restore();
    }

    /** Normale zur Geraden ab (in Pixelrichtung), die nach oben bzw. rechts zeigt. */
    function upNormal(a: Pt, b: Pt): [number, number] {
      const [ax, ay] = plot.toPx(a[0], a[1]);
      const [bx, by] = plot.toPx(b[0], b[1]);
      let nx = -(by - ay);
      let ny = bx - ax;
      if (ny > 0 || (Math.abs(ny) < 1e-6 && nx < 0)) {
        nx = -nx;
        ny = -ny;
      }
      return [nx, ny];
    }

    /** Markierung eines rechten Winkels (Viertelkreis mit Punkt) bei z zwischen den Richtungen d1 und d2. */
    function rightAngle(z: Pt, d1: Pt, d2: Pt, color: string, k = 1): void {
      const g = surface.g;
      const [zx, zy] = plot.toPx(z[0], z[1]);
      const size = (wide() ? 17 : 13) * k;
      if (size <= 0.5) return;
      const a1 = Math.atan2(-d1[1], d1[0]);
      let diff = Math.atan2(-d2[1], d2[0]) - a1;
      while (diff > Math.PI) diff -= 2 * Math.PI;
      while (diff < -Math.PI) diff += 2 * Math.PI;
      g.save();
      g.beginPath();
      g.moveTo(zx, zy);
      g.arc(zx, zy, size, a1, a1 + diff, diff < 0);
      g.closePath();
      g.fillStyle = withAlpha(color, 0.18);
      g.fill();
      g.beginPath();
      g.arc(zx, zy, size, a1, a1 + diff, diff < 0);
      g.strokeStyle = color;
      g.lineWidth = 1.8;
      g.stroke();
      const mid = a1 + diff / 2;
      g.beginPath();
      g.arc(zx + Math.cos(mid) * size * 0.52, zy + Math.sin(mid) * size * 0.52, 2.1 * Math.max(0.6, k), 0, Math.PI * 2);
      g.fillStyle = color;
      g.fill();
      g.restore();
    }

    /** Beschriftungsschild mitten auf einer Strecke. */
    function tag(px: number, py: number, label: string, color: string): void {
      const g = surface.g;
      const theme = ctx.theme;
      const font = `700 ${wide() ? 12.5 : 11.5}px ${theme.font}`;
      g.font = font;
      const w = g.measureText(label).width + 12;
      const h = wide() ? 21 : 19;
      const r = plot.rect;
      const x = clamp(px - w / 2, r.x + 3, r.x + r.w - w - 3);
      const y = clamp(py - h / 2, r.y + 3, r.y + r.h - h - 3);
      g.fillStyle = theme.dark ? '#141b26' : '#ffffff';
      roundRect(g, x, y, w, h, h / 2);
      g.fill();
      g.strokeStyle = withAlpha(color, 0.75);
      g.lineWidth = 1.3;
      g.stroke();
      text(g, label, x + w / 2, y + h / 2 + 0.5, { font, color });
    }

    /** Karopapier: Kästchen mit 0,5 cm Seitenlänge, jede ganze Einheit etwas kräftiger. */
    function drawPaper(): void {
      const g = surface.g;
      const theme = ctx.theme;
      const b = plot.bounds;
      const r = plot.rect;
      g.lineWidth = 1;
      for (const major of [false, true]) {
        g.strokeStyle = major ? theme.grid : theme.gridMinor;
        g.beginPath();
        for (let k = Math.ceil(b.xMin * 2); k <= b.xMax * 2; k++) {
          if ((k % 2 === 0) !== major) continue;
          const x = Math.round(plot.px(k / 2)) + 0.5;
          g.moveTo(x, r.y);
          g.lineTo(x, r.y + r.h);
        }
        for (let k = Math.ceil(b.yMin * 2); k <= b.yMax * 2; k++) {
          if ((k % 2 === 0) !== major) continue;
          const y = Math.round(plot.py(k / 2)) + 0.5;
          g.moveTo(r.x, y);
          g.lineTo(r.x + r.w, y);
        }
        g.stroke();
      }
    }

    /** Achsen mit Pfeilspitzen, Teilstrichen und Zahlen bei jeder ganzen Einheit. */
    function drawAxes(): void {
      const g = surface.g;
      const theme = ctx.theme;
      const r = plot.rect;
      const [ox, oy] = plot.toPx(0, 0);
      const x0 = Math.round(ox) + 0.5;
      const y0 = Math.round(oy) + 0.5;
      const right = r.x + r.w - 4;
      const top = r.y + 4;
      g.strokeStyle = theme.axis;
      g.fillStyle = theme.axis;
      g.lineWidth = 1.6;
      g.beginPath();
      g.moveTo(r.x, y0);
      g.lineTo(right - 6, y0);
      g.moveTo(x0, r.y + r.h);
      g.lineTo(x0, top + 6);
      g.stroke();
      const head = (x: number, y: number, ang: number) => {
        g.save();
        g.translate(x, y);
        g.rotate(ang);
        g.beginPath();
        g.moveTo(0, 0);
        g.lineTo(-10, -4.5);
        g.lineTo(-10, 4.5);
        g.closePath();
        g.fill();
        g.restore();
      };
      head(right, y0, 0);
      head(x0, top, -Math.PI / 2);
      const W = wide();
      const font = `600 ${W ? 12.5 : 11}px ${theme.font}`;
      const halo = (str: string, x: number, y: number, align: CanvasTextAlign, f = font, color = theme.muted) => {
        g.save();
        g.font = f;
        g.textAlign = align;
        g.textBaseline = 'middle';
        g.lineJoin = 'round';
        g.lineWidth = 3.5;
        g.strokeStyle = theme.bg;
        g.strokeText(str, x, y);
        g.fillStyle = color;
        g.fillText(str, x, y);
        g.restore();
      };
      g.lineWidth = 1.4;
      g.beginPath();
      for (let k = 1; k <= X_MAX; k++) {
        const x = Math.round(plot.px(k)) + 0.5;
        g.moveTo(x, y0 - 4);
        g.lineTo(x, y0 + 4);
      }
      for (let k = 1; k <= Y_MAX; k++) {
        const y = Math.round(plot.py(k)) + 0.5;
        g.moveTo(x0 - 4, y);
        g.lineTo(x0 + 4, y);
      }
      g.stroke();
      for (let k = 1; k <= X_MAX; k++) halo(String(k), plot.px(k), y0 + (W ? 14 : 12), 'center');
      for (let k = 1; k <= Y_MAX; k++) halo(String(k), x0 - (W ? 8 : 6), plot.py(k), 'right');
      halo('0', x0 - (W ? 7 : 5), y0 + (W ? 13 : 11), 'right');
      const lf = `italic 700 ${W ? 17 : 15}px ${theme.mathFont}`;
      halo('x', right - 4, y0 - 13, 'right', lf, theme.text);
      halo('y', x0 + 12, top + 9, 'left', lf, theme.text);
    }

    /** Linie (Strecke, Halbgerade oder Gerade) im Bereich t0…t1 von a nach b. */
    function drawLine(a: Pt, b: Pt, t0: number, t1: number, color: string, width = 3, alpha = 1): void {
      plot.segment(at(a, b, t0), at(a, b, t1), { color, width, alpha });
    }

    /* ---------- Modus: Punkte und Linien ---------- */
    function drawPunkte(): void {
      const a = A();
      const b = B();
      const c = col.g();
      // Hilfslinien zu den Achsen
      if (p.help) {
        for (const q of [a, b]) {
          if (q[1] !== 0) plot.segment(q, [q[0], 0], { color: withAlpha(c, 0.75), width: 1.4, dash: [4, 4] });
          if (q[0] !== 0) plot.segment(q, [0, q[1]], { color: withAlpha(c, 0.75), width: 1.4, dash: [4, 4] });
        }
      }
      const [t0, t1] = shownRange();
      drawLine(a, b, t0, t1, c, 3.2);
      if (kind() === 'strecke' && p.ruler) drawRuler(a, b);
      // Punkte
      const n = upNormal(a, b);
      crossMark(a, c);
      crossMark(b, c);
      pointLabel(a, 'A', c, n);
      pointLabel(b, 'B', c, n);
    }

    /** Durchsichtiges Lineal, Nullmarke auf A, Kante an der Strecke [AB]. */
    function drawRuler(a: Pt, b: Pt): void {
      const g = surface.g;
      const theme = ctx.theme;
      const len = distance(a, b);
      const e = unitVec(a, b);
      // Seite: unterhalb bzw. rechts der Strecke (in Bildschirmrichtung)
      let n: Pt = [e[1], -e[0]];
      if (n[1] > 0) n = [-n[0], -n[1]];
      const t = rulerTw.value;
      const slide = (1 - t) * 1.2;
      const o: Pt = [a[0] + n[0] * slide, a[1] + n[1] * slide];
      const W = 1.1;
      const total = Math.ceil(len + 0.6) + 0.5;
      const P0 = (u: number, v: number) => plot.toPx(o[0] + e[0] * u + n[0] * v, o[1] + e[1] * u + n[1] * v);
      g.save();
      g.globalAlpha = Math.min(1, t * 1.4);
      // Körper
      const corners = [P0(-0.45, 0), P0(total, 0), P0(total, W), P0(-0.45, W)];
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.18)';
      g.shadowBlur = 10;
      g.shadowOffsetY = 3;
      g.beginPath();
      corners.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
      g.closePath();
      g.fillStyle = theme.dark ? 'rgba(52,64,84,0.82)' : 'rgba(255,251,232,0.86)';
      g.fill();
      g.restore();
      g.strokeStyle = withAlpha(theme.text, 0.35);
      g.lineWidth = 1;
      g.stroke();
      // Skala
      const unitPx = plot.scale.x;
      const mm = unitPx >= 40;
      const step = mm ? 1 : 5;
      const maxK = Math.floor((total - 0.15) * 10);
      g.strokeStyle = withAlpha(theme.text, 0.75);
      g.beginPath();
      for (let k = 0; k <= maxK; k += step) {
        const lenT = k % 10 === 0 ? 0.32 : k % 5 === 0 ? 0.22 : 0.13;
        const [x0, y0] = P0(k / 10, 0);
        const [x1, y1] = P0(k / 10, lenT);
        g.moveTo(x0, y0);
        g.lineTo(x1, y1);
      }
      g.lineWidth = 1;
      g.stroke();
      // Zahlen (aufrecht lesbar)
      const [ex, ey] = [P0(1, 0)[0] - P0(0, 0)[0], P0(1, 0)[1] - P0(0, 0)[1]];
      let ang = Math.atan2(ey, ex);
      if (ang > Math.PI / 2) ang -= Math.PI;
      if (ang < -Math.PI / 2) ang += Math.PI;
      const font = `600 ${wide() ? 11 : 10}px ${theme.font}`;
      for (let k = 0; k <= Math.floor(total - 0.15); k++) {
        const [x, y] = P0(k, 0.58);
        g.save();
        g.translate(x, y);
        g.rotate(ang);
        text(g, String(k), 0, 0, { font, color: withAlpha(theme.text, 0.85) });
        g.restore();
      }
      g.restore();
      // Ablesemarke bei B
      if (t > 0.6) {
        const [bx, by] = P0(len, 0);
        const [qx, qy] = P0(len, W + 0.05);
        g.save();
        g.globalAlpha = Math.min(1, (t - 0.6) / 0.4);
        g.strokeStyle = col.warn();
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(bx, by);
        g.lineTo(qx, qy);
        g.stroke();
        const [lx, ly] = P0(len, W + 0.5);
        tag(lx, ly, lenShort(len), col.warn());
        g.restore();
      }
    }

    /* ---------- Modus: parallel und senkrecht ---------- */
    function drawLage(): void {
      const a = A();
      const b = B();
      const c = C();
      const d = D();
      const cg = col.g();
      const ch = col.h();
      const [g0, g1] = clipLine(a, b);
      const [h0, h1] = clipLine(c, d);
      const k = relPop.running ? Math.max(0, relPop.value) : 1;

      // Parallele: Streifen und Abstand
      if (rel.kind === 'parallel') {
        const theme = ctx.theme;
        const pts: Pt[] = [at(a, b, g0), at(a, b, g1)];
        const f0 = foot(pts[1]!, c, d);
        const f1 = foot(pts[0]!, c, d);
        plot.polygon([pts[0]!, pts[1]!, f0, f1], { fill: col.warn(), alpha: theme.dark ? 0.1 : 0.07 });
      }

      drawLine(a, b, g0, g1, cg, 3);
      drawLine(c, d, h0, h1, ch, 3, rel.kind === 'identical' ? 0.8 : 1);

      // Schnittpunkt und Winkel
      if (rel.kind === 'perpendicular' || rel.kind === 'intersecting') {
        const s = rel.s;
        const inView = s[0] >= plot.bounds.xMin && s[0] <= plot.bounds.xMax && s[1] >= plot.bounds.yMin && s[1] <= plot.bounds.yMax;
        if (inView) {
          if (rel.kind === 'perpendicular') {
            const e1 = unitVec(a, b);
            const e2 = unitVec(c, d);
            // Markierung im Winkelfeld zwischen den Richtungen zu B und zu D (bzw. Gegenrichtungen, wenn S jenseits liegt)
            const toB: Pt = distance(s, b) > 1e-9 ? unitVec(s, b) : [-e1[0], -e1[1]];
            const toD: Pt = distance(s, d) > 1e-9 ? unitVec(s, d) : [-e2[0], -e2[1]];
            rightAngle(s, toB, toD, col.ok(), k);
          }
          const [sx, sy] = plot.toPx(s[0], s[1]);
          const g = surface.g;
          g.beginPath();
          g.arc(sx, sy, 4.2, 0, Math.PI * 2);
          g.fillStyle = ctx.theme.text;
          g.fill();
          const bis: [number, number] = (() => {
            const e1 = unitVec(s, distance(s, a) > distance(s, b) ? a : b);
            const e2 = unitVec(s, distance(s, c) > distance(s, d) ? c : d);
            return [-(e1[0] + e2[0]), e1[1] + e2[1]];
          })();
          pointLabel(s, 'S', ctx.theme.text, bis[0] === 0 && bis[1] === 0 ? [1, -1] : bis, false);
        }
      }

      // Geradenbezeichnungen g und h am Rand
      lineName(a, b, g0, g1, 'g', cg, null);
      lineName(c, d, h0, h1, 'h', ch, lineNameSpot);

      // Abstand Punkt – Gerade
      if (p.dist) drawDistance();

      // Geodreieck
      if (p.geo && rel.kind !== 'identical') drawGeo();

      // Punkte
      const ng = upNormal(a, b);
      const nh = upNormal(c, d);
      crossMark(a, cg);
      crossMark(b, cg);
      crossMark(c, ch);
      crossMark(d, ch);
      pointLabel(a, 'A', cg, ng);
      pointLabel(b, 'B', cg, ng);
      pointLabel(c, 'C', ch, nh);
      pointLabel(d, 'D', ch, nh);
    }

    let lineNameSpot: [number, number] | null = null;

    /** Name der Geraden kurz vor dem Rand des Bildes. */
    function lineName(a: Pt, b: Pt, t0: number, t1: number, name: string, color: string, avoid: [number, number] | null): void {
      const g = surface.g;
      const theme = ctx.theme;
      const r = plot.rect;
      // nicht über den Zahlen an den Achsen
      const axX = plot.px(0) + 20;
      const axY = plot.py(0) - 16;
      const inside = (q: [number, number]) => q[0] > Math.max(r.x + 16, axX) && q[0] < r.x + r.w - 16 && q[1] > r.y + 16 && q[1] < Math.min(r.y + r.h - 16, axY);
      const cands: [number, number][] = [];
      for (const t of [t1, t0]) {
        for (let k = 0; k < 40; k++) {
          const tt = t + (t === t1 ? -1 : 1) * k * 0.08;
          const q = at(a, b, tt);
          const px = plot.toPx(q[0], q[1]);
          if (inside(px)) {
            cands.push(px);
            break;
          }
        }
      }
      let spot = cands[0] ?? null;
      if (avoid && spot && Math.hypot(spot[0] - avoid[0], spot[1] - avoid[1]) < 40 && cands[1]) spot = cands[1];
      if (!spot) return;
      if (!avoid) lineNameSpot = spot;
      const n = upNormal(a, b);
      const l = Math.hypot(n[0], n[1]) || 1;
      const x = spot[0] + (n[0] / l) * 14;
      const y = spot[1] + (n[1] / l) * 14;
      g.beginPath();
      g.arc(x, y, 12, 0, Math.PI * 2);
      g.fillStyle = theme.dark ? '#141b26' : '#ffffff';
      g.fill();
      g.strokeStyle = color;
      g.lineWidth = 2;
      g.stroke();
      text(g, name, x, y - 0.5, { font: `italic 700 16px ${theme.mathFont}`, color });
    }

    function drawDistance(): void {
      const q = P();
      const a = A();
      const b = B();
      const f = foot(q, a, b);
      const d = pointLineDistance(q, a, b);
      const t = distTw.value;
      const cp = col.p();
      if (d > 1e-9) {
        const end = at(q, f, t);
        plot.segment(q, end, { color: cp, width: 2.4, dash: [6, 5] });
        if (t >= 1) {
          const e = unitVec(a, b);
          const toP = unitVec(f, q);
          rightAngle(f, distance(f, b) > 1e-6 ? unitVec(f, b) : [-e[0], -e[1]], toP, cp);
          const g = surface.g;
          const [fx, fy] = plot.toPx(f[0], f[1]);
          g.beginPath();
          g.arc(fx, fy, 3.6, 0, Math.PI * 2);
          g.fillStyle = cp;
          g.fill();
          pointLabel(f, 'F', cp, [-(q[0] - f[0]), q[1] - f[1]], false);
          const mid = plot.toPx((q[0] + f[0]) / 2, (q[1] + f[1]) / 2);
          const nn = upNormal(q, f);
          const l = Math.hypot(nn[0], nn[1]) || 1;
          tag(mid[0] + (nn[0] / l) * 18, mid[1] + (nn[1] / l) * 18, lenShort(d), cp);
        }
      }
      crossMark(q, cp);
      pointLabel(q, 'P', cp, [q[0] - f[0] || 1, -(q[1] - f[1]) || -1]);
    }

    /** Geodreieck: Zeichenkante auf g, Nullpunkt im Schnittpunkt bzw. beim Lotfußpunkt. */
    function drawGeo(): void {
      const g = surface.g;
      const theme = ctx.theme;
      const a = A();
      const b = B();
      const c = C();
      const d = D();
      const bd = plot.bounds;
      const inView = (q: Pt) => q[0] > bd.xMin + 0.5 && q[0] < bd.xMax - 0.5 && q[1] > bd.yMin + 0.5 && q[1] < bd.yMax - 0.5;
      const mid: Pt = [(c[0] + d[0]) / 2, (c[1] + d[1]) / 2];
      let z: Pt;
      if ((rel.kind === 'perpendicular' || rel.kind === 'intersecting') && inView(rel.s)) z = rel.s;
      else z = foot(mid, a, b);
      // Zeichenkante soll möglichst im Bild liegen: Nullpunkt notfalls verschieben
      const e = unitVec(a, b);
      // Seite: zu h hin (bzw. zur Seite mit mehr Platz)
      const side = (q: Pt) => e[0] * (q[1] - z[1]) - e[1] * (q[0] - z[0]);
      let sgn = Math.sign(side(mid)) || 0;
      if (sgn === 0) {
        const sc = side(c);
        const sd = side(d);
        sgn = Math.abs(sc) > Math.abs(sd) ? Math.sign(sc) : Math.sign(sd) || 1;
      }
      const n: Pt = [-e[1] * sgn, e[0] * sgn];
      const t = geoTw.value;
      const rot = (1 - t) * 0.35;
      const er: Pt = [e[0] * Math.cos(rot) - e[1] * Math.sin(rot), e[0] * Math.sin(rot) + e[1] * Math.cos(rot)];
      const nr: Pt = [n[0] * Math.cos(rot) - n[1] * Math.sin(rot), n[0] * Math.sin(rot) + n[1] * Math.cos(rot)];
      const off = (1 - t) * 2.2;
      const o: Pt = [z[0] + n[0] * off, z[1] + n[1] * off];
      const L2P = (u: number, v: number) => plot.toPx(o[0] + er[0] * u + nr[0] * v, o[1] + er[1] * u + nr[1] * v);
      const ok = rel.kind === 'perpendicular' || rel.kind === 'parallel';
      const okCol = col.ok();
      g.save();
      g.globalAlpha = Math.min(1, t * 1.5);
      // Körper
      const tri = [L2P(-GEO, 0), L2P(GEO, 0), L2P(0, GEO)];
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.55)' : 'rgba(16,24,40,0.16)';
      g.shadowBlur = 14;
      g.shadowOffsetY = 4;
      g.beginPath();
      tri.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
      g.closePath();
      g.fillStyle = theme.dark ? 'rgba(170,200,240,0.13)' : 'rgba(236,245,255,0.55)';
      g.fill();
      g.restore();
      g.strokeStyle = withAlpha(theme.text, 0.5);
      g.lineWidth = 1.3;
      g.stroke();
      // Parallelen zur Zeichenkante
      const ink = withAlpha(theme.text, theme.dark ? 0.32 : 0.28);
      g.strokeStyle = ink;
      g.lineWidth = 1;
      g.beginPath();
      for (let v = 0.5; v < GEO - 0.6; v += 0.5) {
        const [x0, y0] = L2P(-(GEO - v) + 0.25, v);
        const [x1, y1] = L2P(GEO - v - 0.25, v);
        g.moveTo(x0, y0);
        g.lineTo(x1, y1);
      }
      g.stroke();
      // Winkelskala (angedeutet)
      g.beginPath();
      const R = 2.55;
      for (let deg = 10; deg < 180; deg += 10) {
        const rad = (deg * Math.PI) / 180;
        const [x0, y0] = L2P(R * Math.cos(rad), R * Math.sin(rad));
        const [x1, y1] = L2P((R - (deg % 30 === 0 ? 0.3 : 0.18)) * Math.cos(rad), (R - (deg % 30 === 0 ? 0.3 : 0.18)) * Math.sin(rad));
        g.moveTo(x0, y0);
        g.lineTo(x1, y1);
      }
      g.stroke();
      g.beginPath();
      for (let i = 0; i <= 36; i++) {
        const rad = (i / 36) * Math.PI;
        const [x, y] = L2P(R * Math.cos(rad), R * Math.sin(rad));
        if (i) g.lineTo(x, y);
        else g.moveTo(x, y);
      }
      g.stroke();
      // Skala auf der Zeichenkante
      const unitPx = plot.scale.x;
      g.strokeStyle = withAlpha(theme.text, 0.7);
      g.beginPath();
      for (let kk = -35; kk <= 35; kk++) {
        if (unitPx < 40 && kk % 5 !== 0) continue;
        const lenT = kk % 10 === 0 ? 0.3 : kk % 5 === 0 ? 0.2 : 0.11;
        const [x0, y0] = L2P(kk / 10, 0);
        const [x1, y1] = L2P(kk / 10, lenT);
        g.moveTo(x0, y0);
        g.lineTo(x1, y1);
      }
      g.stroke();
      const [ex, ey] = [L2P(1, 0)[0] - L2P(0, 0)[0], L2P(1, 0)[1] - L2P(0, 0)[1]];
      let ang = Math.atan2(ey, ex);
      if (ang > Math.PI / 2) ang -= Math.PI;
      if (ang < -Math.PI / 2) ang += Math.PI;
      const font = `600 ${wide() ? 10.5 : 9.5}px ${theme.font}`;
      for (let kk = -3; kk <= 3; kk++) {
        const [x, y] = L2P(kk, 0.52);
        g.save();
        g.translate(x, y);
        g.rotate(ang);
        text(g, String(Math.abs(kk)), 0, 0, { font, color: withAlpha(theme.text, 0.8) });
        g.restore();
      }
      // Mittellinie
      const hit = t >= 1 && (rel.kind === 'perpendicular');
      const [m0x, m0y] = L2P(0, 0);
      const [m1x, m1y] = L2P(0, GEO - 0.05);
      g.strokeStyle = hit ? okCol : withAlpha(theme.text, 0.55);
      g.lineWidth = hit ? 3 : 1.4;
      g.beginPath();
      g.moveTo(m0x, m0y);
      g.lineTo(m1x, m1y);
      g.stroke();
      // Parallele, auf der h liegt
      if (t >= 1 && rel.kind === 'parallel') {
        const v = rel.distance;
        if (v < GEO - 0.3) {
          const [x0, y0] = L2P(-(GEO - v) + 0.1, v);
          const [x1, y1] = L2P(GEO - v - 0.1, v);
          g.strokeStyle = okCol;
          g.lineWidth = 3;
          g.beginPath();
          g.moveTo(x0, y0);
          g.lineTo(x1, y1);
          g.stroke();
        }
      }
      g.restore();
      // Häkchen bzw. Kreuz an der Spitze
      if (t >= 1) {
        const [qx, qy] = L2P(0, GEO * 0.62);
        const cc = ok ? okCol : col.bad();
        g.beginPath();
        g.arc(qx, qy, 11, 0, Math.PI * 2);
        g.fillStyle = cc;
        g.fill();
        text(g, ok ? '✓' : '✗', qx, qy + 0.5, { font: `800 13px ${theme.font}`, color: onColor() });
      }
    }

    /* ---------- Modus: Kreis und Gerade ---------- */
    function klColor(): string {
      return kl.kind === 'tangente' ? col.ok() : kl.kind === 'sekante' ? col.p() : col.warn();
    }

    function drawKreis(): void {
      const g = surface.g;
      const theme = ctx.theme;
      const a = A();
      const b = B();
      const m = M();
      const ck = col.k();
      const cg = col.g();
      const k = relPop.running ? Math.max(0, relPop.value) : 1;
      // Kreis
      plot.circle(m[0], m[1], p.r, { fill: ck, alpha: theme.dark ? 0.1 : 0.07 });
      plot.circle(m[0], m[1], p.r, { stroke: ck, width: 3 });
      // Gerade
      const [g0, g1] = clipLine(a, b);
      drawLine(a, b, g0, g1, cg, 3);
      // Sehne hervorheben
      const cc = klColor();
      if (kl.kind === 'sekante') plot.segment(kl.points[0], kl.points[1], { color: cc, width: 5.5, alpha: 0.55 });
      // Lot von M auf g mit Abstand
      const f = foot(m, a, b);
      if (kl.distance > 1e-9) {
        plot.segment(m, f, { color: withAlpha(theme.text, 0.7), width: 1.8, dash: [5, 4] });
        const e = unitVec(a, b);
        rightAngle(f, distance(f, b) > 1e-6 ? unitVec(f, b) : [-e[0], -e[1]], unitVec(f, m), withAlpha(theme.text, 0.75));
      }
      // Radius
      const rp: Pt = [m[0] + p.r * Math.cos(radAngle), m[1] + p.r * Math.sin(radAngle)];
      plot.segment(m, rp, { color: ck, width: 2.4 });
      const midR = plot.toPx((m[0] + rp[0]) / 2, (m[1] + rp[1]) / 2);
      const nr = upNormal(m, rp);
      const lr = Math.hypot(nr[0], nr[1]) || 1;
      tag(midR[0] + (nr[0] / lr) * 14, midR[1] + (nr[1] / lr) * 14, `r = ${fmt.num(p.r, 1)} cm`, ck);
      // Abstand beschriften
      if (kl.distance > 0.35) {
        const mid = plot.toPx(m[0] + (f[0] - m[0]) * 0.6, m[1] + (f[1] - m[1]) * 0.6);
        const nn = upNormal(m, f);
        const l = Math.hypot(nn[0], nn[1]) || 1;
        const sgn = nn[0] * (midR[0] - mid[0]) + nn[1] * (midR[1] - mid[1]) > 0 ? -1 : 1;
        tag(mid[0] + sgn * (nn[0] / l) * 16, mid[1] + sgn * (nn[1] / l) * 16, lenShort(kl.distance), withAlpha(theme.text, 0.85));
      }
      // Gemeinsame Punkte
      kl.points.forEach((q, i) => {
        const [x, y] = plot.toPx(q[0], q[1]);
        g.beginPath();
        g.arc(x, y, (kl.kind === 'tangente' ? 6.5 : 5.5) * k, 0, Math.PI * 2);
        g.fillStyle = cc;
        g.fill();
        g.strokeStyle = theme.bg;
        g.lineWidth = 2;
        g.stroke();
        const away: [number, number] = [q[0] - m[0], -(q[1] - m[1])];
        pointLabel(q, kl.kind === 'tangente' ? 'T' : i === 0 ? 'S₁' : 'S₂', cc, away, false);
      });
      if (kl.kind === 'tangente') {
        const e = unitVec(a, b);
        const tp = kl.points[0];
        rightAngle(tp, distance(tp, b) > 1e-6 ? unitVec(tp, b) : [-e[0], -e[1]], unitVec(tp, m), cc, k);
      }
      lineName(a, b, g0, g1, 'g', cg, null);
      // Kreisname
      const kp = plot.toPx(m[0] + p.r * Math.cos(radAngle + 2.2), m[1] + p.r * Math.sin(radAngle + 2.2));
      const kd: [number, number] = [Math.cos(radAngle + 2.2), -Math.sin(radAngle + 2.2)];
      const r = plot.rect;
      if (kp[0] > r.x + 20 && kp[0] < r.x + r.w - 20 && kp[1] > r.y + 20 && kp[1] < r.y + r.h - 20) {
        text(g, 'k', kp[0] + kd[0] * 16, kp[1] + kd[1] * 16, { font: `italic 700 17px ${theme.mathFont}`, color: ck });
      }
      // Punkte
      const n = upNormal(a, b);
      crossMark(a, cg);
      crossMark(b, cg);
      pointLabel(a, 'A', cg, n);
      pointLabel(b, 'B', cg, n);
      crossMark(m, ck);
      // M-Beschriftung weg von Radius und Lot
      const rd: [number, number] = [Math.cos(radAngle), -Math.sin(radAngle)];
      const ld: [number, number] = kl.distance > 1e-9 ? (() => {
        const u = unitVec(m, f);
        return [u[0], -u[1]] as [number, number];
      })() : [0, 0];
      const away: [number, number] = [-(rd[0] + ld[0]), -(rd[1] + ld[1])];
      pointLabel(m, 'M', ck, Math.hypot(away[0], away[1]) < 0.2 ? [-ld[1] || -1, ld[0] || -1] : away);
    }

    /* ---------- Modus: Punkte-Spiel ---------- */
    function drawSpiel(now: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const target: Pt = [task.x, task.y];
      const cp = col.p();
      // Antippbarer Gitterpunkt unter dem Zeiger
      if (task.kind === 'set' && !answer && hover?.startsWith('grid:')) {
        const [, xs, ys] = hover.split(':');
        const q: Pt = [Number(xs), Number(ys)];
        const [x, y] = plot.toPx(q[0], q[1]);
        g.beginPath();
        g.arc(x, y, 13, 0, Math.PI * 2);
        g.fillStyle = withAlpha(cp, 0.14);
        g.fill();
        crossMark(q, withAlpha(cp, 0.6));
      }
      if (task.kind === 'read' || answer) {
        // Weg vom Ursprung: erst nach rechts, dann nach oben
        if (answer) drawPath(target);
        const pulse = reduced || answer ? 0 : (Math.sin(now / 380) + 1) / 2;
        const [x, y] = plot.toPx(target[0], target[1]);
        if (!answer) {
          g.beginPath();
          g.arc(x, y, 14 + pulse * 5, 0, Math.PI * 2);
          g.fillStyle = withAlpha(cp, 0.12 + 0.08 * (1 - pulse));
          g.fill();
        }
        const showTarget = task.kind === 'read' || (answer && verdict !== 'correct');
        if (showTarget) {
          crossMark(target, cp, 7);
          const name = task.kind === 'read' ? 'Q' : 'P';
          pointLabel(target, name, cp, [x > plot.rect.x + plot.rect.w * 0.75 ? -1 : 1, -1], !!answer);
        }
      }
      // Kleiner Sternenregen bei einer richtigen Antwort
      if (answer && verdict === 'correct' && burst.running) {
        const [bx, by] = plot.toPx(target[0], target[1]);
        const t = burst.value;
        const colors = theme.series;
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * Math.PI * 2 + 0.3;
          const rr = 10 + t * (28 + (i % 3) * 8);
          g.globalAlpha = 1 - burst.t;
          g.fillStyle = colors[i % colors.length]!;
          g.beginPath();
          g.arc(bx + Math.cos(a) * rr, by + Math.sin(a) * rr, 3 * (1 - t * 0.5), 0, Math.PI * 2);
          g.fill();
        }
        g.globalAlpha = 1;
      }
      if (answer && task.kind === 'set') {
        const ok = verdict === 'correct';
        const cc = ok ? col.ok() : col.bad();
        const s = answerPop.running ? Math.max(0, answerPop.value) : 1;
        const [x, y] = plot.toPx(answer[0], answer[1]);
        const dx = !ok && shake.running ? Math.sin(shake.t * Math.PI * 6) * 5 * (1 - shake.t) : 0;
        g.save();
        g.translate(dx, 0);
        if (ok) {
          g.beginPath();
          g.arc(x, y, 16 * s, 0, Math.PI * 2);
          g.fillStyle = withAlpha(cc, 0.18);
          g.fill();
        }
        crossMark(answer, cc, 7, s);
        g.restore();
        const name = ok ? 'P' : '';
        pointLabel(answer, name, cc, [x > plot.rect.x + plot.rect.w * 0.75 ? -1 : 1, ok ? -1 : 1], true);
      }
    }

    function drawPath(target: Pt): void {
      const t = pathTw.t;
      const ux = Math.min(1, t / 0.5);
      const uy = Math.max(0, Math.min(1, (t - 0.5) / 0.5));
      const cx = col.x();
      const cy = col.y();
      const xEnd: Pt = [target[0] * ease.inOutCubic(ux), 0];
      const g = surface.g;
      if (target[0] > 0) {
        plot.arrow([0, 0], xEnd, { color: cx, width: 3.2, head: 11 });
        if (ux >= 1) {
          const [mx, my] = plot.toPx(target[0] / 2, 0);
          tag(mx, my - 18, `${fmt.num(target[0], 0)} ${ctx.t('right_')}`, cx);
        }
      }
      if (ux >= 1 && target[1] > 0) {
        const yEnd: Pt = [target[0], target[1] * ease.inOutCubic(uy)];
        plot.arrow([target[0], 0], yEnd, { color: cy, width: 3.2, head: 11 });
        if (uy >= 1) {
          const [mx, my] = plot.toPx(target[0], target[1] / 2);
          const left = mx > plot.rect.x + plot.rect.w * 0.7;
          g.font = `700 12.5px ${ctx.theme.font}`;
          const w = g.measureText(`${fmt.num(target[1], 0)} ${ctx.t('up_')}`).width;
          tag(mx + (left ? -1 : 1) * (w / 2 + 20), my, `${fmt.num(target[1], 0)} ${ctx.t('up_')}`, cy);
        }
      }
    }

    /* ---------- Seitenleiste ---------- */
    function hitRect(id: string, r: Rect): void {
      hits.push({ id, r });
    }

    function button(r: Rect, label: string, id: string, color: string, filled = false): void {
      const g = surface.g;
      const theme = ctx.theme;
      const hov = hover === id;
      g.fillStyle = filled ? color : withAlpha(color, hov ? 0.16 : theme.dark ? 0.12 : 0.08);
      roundRect(g, r.x, r.y, r.w, r.h, r.h / 2);
      g.fill();
      g.strokeStyle = withAlpha(color, filled ? 1 : 0.6);
      g.lineWidth = 1.3;
      g.stroke();
      text(g, label, r.x + r.w / 2, r.y + r.h / 2 + 0.5, { font: `700 ${wide() ? 13 : 12}px ${theme.font}`, color: filled ? onColor() : color });
      if (!ctx.locked || id === 'next' || id.startsWith('opt:')) hitRect(id, r);
    }

    function drawPanel(R: Rect): void {
      if (mode() === 'punkte') panelPunkte(R);
      else if (mode() === 'lage') panelLage(R);
      else if (mode() === 'kreis') panelKreis(R);
      else panelSpiel(R);
    }

    function title(x: number, y: number, label: string): void {
      text(surface.g, label, x, y, { font: `700 ${wide() ? 12 : 11}px ${ctx.theme.font}`, color: ctx.theme.muted, align: 'left' });
    }

    /** Kleines Symbol für Strecke, Halbgerade oder Gerade. */
    function kindIcon(k: Kind, x: number, y: number, w: number, color: string): void {
      const g = surface.g;
      const x0 = x + w * 0.22;
      const x1 = x + w * 0.62;
      const from = k === 'gerade' ? x : x0;
      const to = k === 'strecke' ? x1 : x + w;
      const grad = g.createLinearGradient(x, 0, x + w, 0);
      grad.addColorStop(0, withAlpha(color, k === 'gerade' ? 0 : 1));
      grad.addColorStop(0.18, color);
      grad.addColorStop(0.82, color);
      grad.addColorStop(1, withAlpha(color, k === 'strecke' ? 1 : 0));
      g.strokeStyle = grad;
      g.lineWidth = 2.6;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(from, y);
      g.lineTo(to, y);
      g.stroke();
      for (const xx of [x0, x1]) {
        g.strokeStyle = color;
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(xx - 4, y - 4);
        g.lineTo(xx + 4, y + 4);
        g.moveTo(xx + 4, y - 4);
        g.lineTo(xx - 4, y + 4);
        g.stroke();
      }
    }

    /**
     * Schreibweise: DE mit eckigen Klammern ([AB], [AB, AB), EN mit Strich bzw.
     * Pfeilen über AB. Gibt die Breite zurück.
     */
    function notation(k: Kind, x: number, y: number, size: number, color: string, align: 'left' | 'right' = 'left'): number {
      const g = surface.g;
      const font = `700 ${size}px ${ctx.theme.font}`;
      g.font = font;
      if (lang === 'de') {
        const str = k === 'strecke' ? '[AB]' : k === 'strahl' ? '[AB' : 'AB';
        const w = g.measureText(str).width;
        text(g, str, align === 'left' ? x : x - w, y, { font, color, align: 'left' });
        return w;
      }
      const w = g.measureText('AB').width;
      const x0 = align === 'left' ? x : x - w;
      text(g, 'AB', x0, y, { font, color, align: 'left' });
      const yy = y - size * 0.72;
      const a = 3.2;
      g.strokeStyle = color;
      g.fillStyle = color;
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(x0 + 1, yy);
      g.lineTo(x0 + w - 1, yy);
      g.stroke();
      const headAt = (hx: number, dir: number) => {
        g.beginPath();
        g.moveTo(hx + dir * a, yy);
        g.lineTo(hx - dir * a, yy - a * 0.8);
        g.lineTo(hx - dir * a, yy + a * 0.8);
        g.closePath();
        g.fill();
      };
      if (k !== 'strecke') headAt(x0 + w, 1);
      if (k === 'gerade') headAt(x0, -1);
      return w;
    }

    function panelPunkte(R: Rect): void {
      const g = surface.g;
      const theme = ctx.theme;
      const W = wide();
      const pad = W ? 14 : 10;
      const cg = col.g();
      let y = R.y;
      // Punkte
      const h1 = W ? 96 : 56;
      card({ x: R.x, y, w: R.w, h: h1 });
      if (W) {
        title(R.x + pad, y + 17, ctx.t('points'));
        [A(), B()].forEach((q, i) => {
          const yy = y + 42 + i * 24;
          text(g, `${i ? 'B' : 'A'}${ptText(q)}`, R.x + pad + 20, yy, { font: `700 17px ${theme.font}`, color: cg, align: 'left' });
          g.strokeStyle = cg;
          g.lineWidth = 2.4;
          g.lineCap = 'round';
          g.beginPath();
          g.moveTo(R.x + pad + 2, yy - 4.5);
          g.lineTo(R.x + pad + 11, yy + 4.5);
          g.moveTo(R.x + pad + 11, yy - 4.5);
          g.lineTo(R.x + pad + 2, yy + 4.5);
          g.stroke();
        });
        text(g, ctx.t('readHint'), R.x + pad, y + h1 - 12, { font: `500 11.5px ${theme.font}`, color: theme.muted, align: 'left' });
      } else {
        const label = `A${ptText(A())}     B${ptText(B())}`;
        text(g, label, R.x + R.w / 2, y + 19, { font: `700 15px ${theme.font}`, color: cg });
        text(g, ctx.t('readHint'), R.x + R.w / 2, y + 40, { font: `500 11px ${theme.font}`, color: theme.muted });
      }
      y += h1 + (W ? 10 : 8);
      // Auswahl der Linienart
      const kinds: Kind[] = ['strecke', 'strahl', 'gerade'];
      if (W) {
        const rowH = 38;
        const h2 = 32 + rowH * 3;
        card({ x: R.x, y, w: R.w, h: h2 });
        title(R.x + pad, y + 17, ctx.t('lineThrough'));
        kinds.forEach((k, i) => {
          const rr = { x: R.x + 6, y: y + 30 + i * rowH, w: R.w - 12, h: rowH - 4 };
          const on = kind() === k;
          const id = `kind:${k}`;
          if (on || hover === id) {
            g.fillStyle = withAlpha(cg, on ? (theme.dark ? 0.2 : 0.11) : 0.06);
            roundRect(g, rr.x, rr.y, rr.w, rr.h, 9);
            g.fill();
            if (on) {
              g.strokeStyle = withAlpha(cg, 0.6);
              g.lineWidth = 1.2;
              g.stroke();
            }
          }
          kindIcon(k, rr.x + 10, rr.y + rr.h / 2, 58, on ? cg : withAlpha(theme.text, 0.55));
          text(g, ctx.t(k), rr.x + 80, rr.y + rr.h / 2, { font: `${on ? 700 : 600} 14px ${theme.font}`, color: on ? theme.text : theme.muted, align: 'left' });
          notation(k, rr.x + rr.w - 10, rr.y + rr.h / 2 + 1, 14, on ? cg : theme.muted, 'right');
          if (!ctx.locked) hitRect(id, rr);
        });
        y += h2 + 10;
      } else {
        const bw = (R.w - 8) / 3;
        const h2 = 50;
        kinds.forEach((k, i) => {
          const rr = { x: R.x + i * (bw + 4), y, w: bw, h: h2 };
          const on = kind() === k;
          const id = `kind:${k}`;
          card(rr, on ? cg : undefined, on ? 0.08 : 0);
          kindIcon(k, rr.x + 12, rr.y + 16, rr.w - 24, on ? cg : withAlpha(theme.text, 0.55));
          text(g, ctx.t(k), rr.x + rr.w / 2, rr.y + 36, { font: `${on ? 700 : 600} 12px ${theme.font}`, color: on ? theme.text : theme.muted });
          if (!ctx.locked) hitRect(id, rr);
        });
        y += h2 + 8;
      }
      // Erklärung, Schreibweise und Länge
      const h3 = R.y + R.h - y;
      if (h3 < 40) return;
      card({ x: R.x, y, w: R.w, h: h3 });
      const k = kind();
      const font = `500 ${W ? 13 : 12}px ${theme.font}`;
      const lh = W ? 18 : 15.5;
      const rows = wrap(ctx.t(k === 'strecke' ? 'tStrecke' : k === 'strahl' ? 'tStrahl' : 'tGerade'), R.w - 2 * pad, font);
      let yy = y + pad + 6;
      yy += textRows(rows, R.x + pad, yy, lh, font, theme.text);
      const bottom = y + h3;
      if (W) {
        // Schreibweise
        const ny = yy + 14;
        if (ny + 40 < bottom - 34) {
          text(g, ctx.t('writing'), R.x + pad, ny, { font: `600 12px ${theme.font}`, color: theme.muted, align: 'left' });
          g.font = `600 12px ${theme.font}`;
          const lw = g.measureText(ctx.t('writing')).width;
          notation(k, R.x + pad + lw + 10, ny + 1, 19, cg);
          const noteRows = wrap(ctx.t(k === 'strecke' ? 'wStrecke' : k === 'strahl' ? 'wStrahl' : 'wGerade'), R.w - 2 * pad, `500 11.5px ${theme.font}`);
          textRows(noteRows, R.x + pad, ny + 22, 15, `500 11.5px ${theme.font}`, theme.muted);
        }
      }
      const lenY = bottom - (W ? (p.ruler && k === 'strecke' ? 40 : 26) : 16);
      if (k === 'strecke') {
        const len = distance(A(), B());
        // Länge der Strecke: in Bayern als AB mit Strich darüber geschrieben
        const size = W ? 20 : 15;
        const lf = `800 ${size}px ${theme.font}`;
        g.font = lf;
        const abW = g.measureText('AB').width;
        const cw = col.warn();
        text(g, 'AB', R.x + pad, lenY, { font: lf, color: cw, align: 'left' });
        if (lang === 'de') {
          g.strokeStyle = cw;
          g.lineWidth = 1.8;
          g.beginPath();
          g.moveTo(R.x + pad + 1, lenY - size * 0.62);
          g.lineTo(R.x + pad + abW - 1, lenY - size * 0.62);
          g.stroke();
        }
        text(g, ` ${lenText(len)}`, R.x + pad + abW, lenY, { font: lf, color: cw, align: 'left' });
        if (W && p.ruler) text(g, ctx.t('lengthRuler'), R.x + pad, lenY + 20, { font: `500 11.5px ${theme.font}`, color: theme.muted, align: 'left' });
      } else {
        text(g, `${ctx.t('length')}: ${ctx.t('lengthNone')}`, R.x + pad, lenY, { font: `700 ${W ? 14 : 12.5}px ${theme.font}`, color: theme.muted, align: 'left' });
      }
    }

    function relInfo(): { head: string; body: string; color: string } {
      if (rel.kind === 'perpendicular') return { head: ctx.t('perp'), body: ctx.t('perpText'), color: col.ok() };
      if (rel.kind === 'parallel') return { head: ctx.t('para'), body: ctx.t('paraText'), color: col.warn() };
      if (rel.kind === 'intersecting') return { head: ctx.t('cut'), body: tr('cutText', { a: fmt.num(rel.angle, 0) }), color: ctx.theme.text };
      return { head: ctx.t('same'), body: ctx.t('sameText'), color: col.p() };
    }

    function panelLage(R: Rect): void {
      const g = surface.g;
      const theme = ctx.theme;
      const W = wide();
      const pad = W ? 14 : 10;
      const info = relInfo();
      const k = relPop.running ? relPop.value : 1;
      let y = R.y;
      // Lage
      const font = `500 ${W ? 13 : 12}px ${theme.font}`;
      const lh = W ? 18 : 15.5;
      const bodyRows = wrap(info.body, R.w - 2 * pad, font);
      const headSize = info.head.length > 6 ? (W ? 20 : 17) : W ? 32 : 24;
      const h1 = (W ? 30 : 12) + headSize * 1.25 + bodyRows.length * lh + (W ? 14 : 8);
      card({ x: R.x, y, w: R.w, h: h1 }, info.color, 0.06);
      let yy = y;
      if (W) {
        title(R.x + pad, y + 16, ctx.t('relTitle'));
        yy += 30;
      } else yy += 10;
      g.save();
      const hx = R.x + pad;
      const hy = yy + headSize * 0.62;
      g.translate(hx, hy);
      g.scale(k, k);
      text(g, info.head, 0, 0, { font: `800 ${headSize}px ${theme.font}`, color: info.color, align: 'left' });
      g.restore();
      yy += headSize * 1.25;
      textRows(bodyRows, R.x + pad, yy + lh / 2, lh, font, theme.text);
      y += h1 + (W ? 10 : 8);
      // Geodreieck
      const geoText = !p.geo
        ? ''
        : rel.kind === 'perpendicular'
          ? ctx.t(geoAtS() ? 'geoPerp' : 'geoPerpPar')
          : rel.kind === 'parallel'
            ? ctx.t('geoPara')
            : rel.kind === 'identical'
              ? ctx.t('geoSame')
              : ctx.t('geoCut');
      const avail = R.y + R.h - y;
      const distH = p.dist ? (W ? 92 : 50) : W ? 46 : 38;
      if (W) {
        const rows = p.geo ? wrap(geoText, R.w - 2 * pad, font) : [];
        const h2 = Math.min(avail - distH - 10, p.geo ? 30 + rows.length * lh + 12 + 40 : 92);
        card({ x: R.x, y, w: R.w, h: h2 });
        title(R.x + pad, y + 16, ctx.t('geoTitle'));
        if (p.geo) textRows(rows, R.x + pad, y + 36, lh, font, theme.text);
        else textRows(wrap(ctx.t('geoHow'), R.w - 2 * pad, `500 12px ${theme.font}`), R.x + pad, y + 36, 16, `500 12px ${theme.font}`, theme.muted);
        const bh = 30;
        button({ x: R.x + pad, y: y + h2 - bh - 10, w: R.w - 2 * pad, h: bh }, ctx.t(p.geo ? 'geoRemove' : 'geoOff'), 'geo', col.g(), !p.geo);
        y += h2 + 10;
      } else {
        // Handy: zwei Knöpfe nebeneinander
        const bh = 30;
        const bw = (R.w - 6) / 2;
        button({ x: R.x, y, w: bw, h: bh }, ctx.t(p.geo ? 'geoRemoveShort' : 'geoShort'), 'geo', col.g(), !p.geo);
        button({ x: R.x + bw + 6, y, w: bw, h: bh }, ctx.t(p.dist ? 'distHide' : 'distShortBtn'), 'dist', col.p(), !p.dist);
        y += bh + 8;
        if (p.geo) {
          const rows = wrap(geoText, R.w - 2 * pad, font);
          const h2 = rows.length * lh + 14;
          if (y + h2 <= R.y + R.h) {
            card({ x: R.x, y, w: R.w, h: h2 });
            textRows(rows, R.x + pad, y + 7 + lh / 2, lh, font, theme.text);
            y += h2 + 8;
          }
        }
      }
      // Abstand
      const h3 = Math.min(distH, R.y + R.h - y);
      if (h3 < 30) return;
      if (W) {
        card({ x: R.x, y, w: R.w, h: h3 }, p.dist ? col.p() : undefined, p.dist ? 0.05 : 0);
        if (p.dist) {
          title(R.x + pad, y + 16, ctx.t('distTitle'));
          text(g, lenShort(pointLineDistance(P(), A(), B())), R.x + pad, y + 46, { font: `800 22px ${theme.font}`, color: col.p(), align: 'left' });
          text(g, ctx.t('distText'), R.x + pad, y + 72, { font: `500 12px ${theme.font}`, color: theme.muted, align: 'left' });
          button({ x: R.x + R.w - 44, y: y + 8, w: 34, h: 24 }, '✕', 'dist', theme.muted);
        } else {
          button({ x: R.x + pad, y: y + (h3 - 30) / 2, w: R.w - 2 * pad, h: 30 }, ctx.t('distOff'), 'dist', col.p(), true);
        }
      } else if (p.dist) {
        card({ x: R.x, y, w: R.w, h: h3 }, col.p(), 0.05);
        text(g, `${ctx.t('distTitle')}: ${lenShort(pointLineDistance(P(), A(), B()))}`, R.x + pad, y + h3 / 2, { font: `700 13.5px ${theme.font}`, color: col.p(), align: 'left' });
      }
      // Merksatz im verbleibenden Platz
      y += h3 + (W ? 10 : 8);
      const rest = R.y + R.h - y;
      const key = rel.kind === 'perpendicular' ? 'notePerp' : rel.kind === 'parallel' ? 'notePara' : rel.kind === 'intersecting' ? 'noteCut' : 'noteSame';
      const nFont = `500 ${W ? 12.5 : 11.5}px ${theme.font}`;
      const nlh = W ? 17 : 15;
      const nRows = wrap(ctx.t(key), R.w - 2 * pad, nFont);
      const need = nRows.length * nlh + (W ? 40 : 14);
      if (rest >= need) {
        const h4 = W ? rest : need;
        card({ x: R.x, y, w: R.w, h: h4 });
        let ny = y + (W ? 17 : 7);
        if (W) {
          title(R.x + pad, ny, ctx.t('note'));
          ny += 14;
        }
        textRows(nRows, R.x + pad, ny + nlh / 2, nlh, nFont, theme.text);
      }
    }

    function geoAtS(): boolean {
      if (rel.kind !== 'perpendicular') return false;
      const bd = plot.bounds;
      const s = rel.s;
      return s[0] > bd.xMin + 0.5 && s[0] < bd.xMax - 0.5 && s[1] > bd.yMin + 0.5 && s[1] < bd.yMax - 0.5;
    }

    /** Kleines Symbol: Kreis mit Gerade als Passante, Tangente oder Sekante. */
    function klIcon(which: CircleRelation['kind'], cx: number, cy: number, r: number, color: string): void {
      const g = surface.g;
      g.strokeStyle = withAlpha(color, 0.8);
      g.lineWidth = 2;
      g.beginPath();
      g.arc(cx, cy, r, 0, Math.PI * 2);
      g.stroke();
      const yLine = which === 'passante' ? cy - r * 1.35 : which === 'tangente' ? cy - r : cy - r * 0.35;
      g.strokeStyle = color;
      g.lineWidth = 2.4;
      g.beginPath();
      g.moveTo(cx - r * 1.7, yLine);
      g.lineTo(cx + r * 1.7, yLine);
      g.stroke();
      g.fillStyle = color;
      if (which === 'tangente') {
        g.beginPath();
        g.arc(cx, yLine, 2.8, 0, Math.PI * 2);
        g.fill();
      } else if (which === 'sekante') {
        const dx = Math.sqrt(r * r - (r * 0.35) ** 2);
        for (const s of [-1, 1]) {
          g.beginPath();
          g.arc(cx + s * dx, yLine, 2.8, 0, Math.PI * 2);
          g.fill();
        }
      }
    }

    function panelKreis(R: Rect): void {
      const g = surface.g;
      const theme = ctx.theme;
      const W = wide();
      const pad = W ? 14 : 10;
      const ck = col.k();
      const cc = klColor();
      const k = relPop.running ? relPop.value : 1;
      let y = R.y;
      // Kreis
      const h1 = W ? 96 : 40;
      card({ x: R.x, y, w: R.w, h: h1 });
      if (W) {
        title(R.x + pad, y + 16, ctx.t('circleTitle'));
        text(g, `M${ptText(M())}`, R.x + pad, y + 40, { font: `700 16px ${theme.font}`, color: ck, align: 'left' });
        text(g, `${ctx.t('radius')} r = ${fmt.num(p.r, 1)} cm`, R.x + pad, y + 62, { font: `600 13.5px ${theme.font}`, color: theme.text, align: 'left' });
        text(g, `${ctx.t('diameter')} d = 2 · r = ${fmt.num(2 * p.r, 1)} cm`, R.x + pad, y + 81, { font: `600 13.5px ${theme.font}`, color: theme.text, align: 'left' });
      } else {
        text(g, `M${ptText(M())}   r = ${fmt.num(p.r, 1)} cm   d = ${fmt.num(2 * p.r, 1)} cm`, R.x + R.w / 2, y + 20, { font: `700 13px ${theme.font}`, color: ck });
      }
      y += h1 + (W ? 10 : 8);
      // Kreis und Gerade
      const kinds: CircleRelation['kind'][] = ['passante', 'tangente', 'sekante'];
      const font = `500 ${W ? 13 : 12}px ${theme.font}`;
      const lh = W ? 18 : 15.5;
      const rows = wrap(ctx.t(`${kl.kind}Text`), R.w - 2 * pad, font);
      const iconH = W ? 64 : 52;
      const h2 = (W ? 26 : 6) + iconH + 30 + rows.length * lh + 8;
      card({ x: R.x, y, w: R.w, h: h2 }, cc, 0.05);
      let yy = y;
      if (W) {
        title(R.x + pad, y + 16, ctx.t('klTitle'));
        yy += 24;
      } else yy += 4;
      const cw = (R.w - 2 * pad) / 3;
      kinds.forEach((kk, i) => {
        const on = kl.kind === kk;
        const cx = R.x + pad + cw * (i + 0.5);
        const color = kk === 'tangente' ? col.ok() : kk === 'sekante' ? col.p() : col.warn();
        if (on) {
          g.fillStyle = withAlpha(color, theme.dark ? 0.2 : 0.12);
          roundRect(g, cx - cw / 2 + 2, yy + 2, cw - 4, iconH - 2, 10);
          g.fill();
        }
        g.save();
        g.globalAlpha = on ? 1 : 0.45;
        klIcon(kk, cx, yy + iconH * 0.45, W ? 13 : 11, color);
        g.restore();
        text(g, ctx.t(kk), cx, yy + iconH - 9, { font: `${on ? 800 : 600} ${W ? 12 : 11}px ${theme.font}`, color: on ? color : theme.muted });
      });
      yy += iconH + 6;
      g.save();
      g.translate(R.x + pad, yy + 12);
      g.scale(k, k);
      text(g, ctx.t(kl.kind), 0, 0, { font: `800 ${W ? 20 : 17}px ${theme.font}`, color: cc, align: 'left' });
      g.restore();
      yy += 26;
      textRows(rows, R.x + pad, yy + lh / 2, lh, font, theme.text);
      y += h2 + (W ? 10 : 8);
      // Vergleich Abstand – Radius als Balken
      const h3 = R.y + R.h - y;
      if (h3 < 44) return;
      card({ x: R.x, y, w: R.w, h: h3 });
      const sym = kl.kind === 'passante' ? '>' : kl.kind === 'tangente' ? '=' : '<';
      const maxV = Math.max(kl.distance, p.r, 0.5) * 1.05;
      const nameW = W ? 62 : 56;
      const valW = W ? 58 : 54;
      const barW = R.w - 2 * pad - nameW - valW;
      const bars: [string, number, string][] = [
        [ctx.t('distShort'), kl.distance, withAlpha(theme.text, 0.65)],
        ['r', p.r, ck],
      ];
      const bh = W ? 13 : 10;
      const gapB = W ? 11 : 7;
      const contentH = (W ? 22 : 0) + 2 * bh + gapB + (W ? 14 : 8) + 8;
      let top = y + Math.max(W ? 10 : 8, (h3 - contentH) / 2);
      if (W) {
        title(R.x + pad, top + 7, ctx.t('compareTitle'));
        top += 22;
      }
      bars.forEach(([name, v, color], i) => {
        const yb = top + i * (bh + gapB);
        const isR = name === 'r';
        text(g, name, R.x + pad, yb + bh / 2, { font: isR ? `italic 700 ${W ? 15 : 13}px ${theme.mathFont}` : `700 ${W ? 12 : 11}px ${theme.font}`, color, align: 'left' });
        const x0 = R.x + pad + nameW;
        g.fillStyle = withAlpha(theme.text, 0.07);
        roundRect(g, x0, yb, barW, bh, bh / 2);
        g.fill();
        g.fillStyle = color;
        roundRect(g, x0, yb, Math.max(bh, (v / maxV) * barW), bh, bh / 2);
        g.fill();
        text(g, isR ? `${fmt.num(v, 1)} cm` : lenShort(v), R.x + R.w - pad, yb + bh / 2, { font: `700 ${W ? 12 : 11}px ${theme.font}`, color: theme.text, align: 'right' });
      });
      const ly = top + 2 * (bh + gapB) + (W ? 14 : 8);
      if (ly < y + h3 - 6) {
        const concl = `${ctx.t('distShort')} ${sym} r  ⇒  ${ctx.t(kl.kind)}`;
        text(g, concl, R.x + pad, ly, { font: `800 ${W ? 15 : 13}px ${theme.font}`, color: cc, align: 'left' });
      }
    }

    function panelSpiel(R: Rect): void {
      const g = surface.g;
      const theme = ctx.theme;
      const W = wide();
      const pad = W ? 14 : 10;
      const cp = col.p();
      const isRead = task.kind === 'read';
      let y = R.y;
      // Aufgabe: Frage und große Koordinatenangabe
      const big = W ? 36 : 25;
      const h1 = W ? 146 : 92;
      card({ x: R.x, y, w: R.w, h: h1 }, cp, 0.05);
      let yy = y;
      if (W) {
        title(R.x + pad, y + 17, tr('task', { n: taskNo }));
        yy += 40;
      } else yy += 13;
      text(g, ctx.t(isRead ? 'readTask' : 'setTask'), R.x + pad, yy, { font: `700 ${W ? 15 : 13}px ${theme.font}`, color: theme.text, align: 'left' });
      yy += W ? 36 : 25;
      const known = !isRead || !!answer;
      const sep = lang === 'de' ? ' | ' : ', ';
      const parts: [string, string][] = [
        [`${isRead ? 'Q' : 'P'}(`, theme.text],
        [known ? String(task.x) : '?', known ? col.x() : theme.muted],
        [sep, theme.muted],
        [known ? String(task.y) : '?', known ? col.y() : theme.muted],
        [')', theme.text],
      ];
      const font = `800 ${big}px ${theme.font}`;
      g.font = font;
      const s = taskPop.running ? Math.max(0.2, taskPop.value) : 1;
      g.save();
      g.translate(R.x + pad, yy);
      g.scale(s, s);
      let x = 0;
      for (const [str, color] of parts) {
        text(g, str, x, 0, { font, color, align: 'left' });
        x += g.measureText(str).width;
      }
      g.restore();
      yy += W ? 36 : 25;
      // Bedeutung von x und y
      const chips: [string, string][] = [
        [ctx.t('chipX'), col.x()],
        [ctx.t('chipY'), col.y()],
      ];
      const cf = `700 ${W ? 12 : 11}px ${theme.font}`;
      g.font = cf;
      let cx = R.x + pad;
      const ch = W ? 22 : 19;
      for (const [str, color] of chips) {
        const w = g.measureText(str).width + 16;
        g.fillStyle = withAlpha(color, theme.dark ? 0.2 : 0.1);
        roundRect(g, cx, yy - ch / 2, w, ch, ch / 2);
        g.fill();
        text(g, str, cx + w / 2, yy + 0.5, { font: cf, color });
        cx += w + 6;
      }
      y += h1 + (W ? 10 : 7);

      // Antwortmöglichkeiten beim Ablesen
      if (isRead) {
        const cols = W ? 2 : 4;
        const gap = 6;
        const bw = (R.w - (W ? 2 * pad : 0) - gap * (cols - 1)) / cols;
        const bh = W ? 36 : 32;
        const rowsN = Math.ceil(task.options.length / cols);
        const x0 = R.x + (W ? pad : 0);
        if (W) card({ x: R.x, y, w: R.w, h: rowsN * (bh + gap) - gap + 2 * 10 });
        const oy = y + (W ? 10 : 0);
        task.options.forEach((o, i) => {
          const bx = x0 + (i % cols) * (bw + gap);
          const by = oy + Math.floor(i / cols) * (bh + gap);
          const id = `opt:${i}`;
          const chosen = !!answer && samePoint(answer, o);
          const correct = samePoint(o, [task.x, task.y]);
          let color = theme.text;
          let fill = withAlpha(theme.text, hover === id && !answer ? 0.11 : theme.dark ? 0.07 : 0.045);
          if (answer && correct) {
            color = col.ok();
            fill = withAlpha(color, 0.16);
          } else if (chosen) {
            color = col.bad();
            fill = withAlpha(color, 0.14);
          }
          const dx = chosen && !correct && shake.running ? Math.sin(shake.t * Math.PI * 6) * 4 * (1 - shake.t) : 0;
          if (!W) card({ x: bx + dx, y: by, w: bw, h: bh });
          g.fillStyle = fill;
          roundRect(g, bx + dx, by, bw, bh, W ? 9 : 12);
          g.fill();
          g.strokeStyle = withAlpha(color, answer && (chosen || correct) ? 0.85 : hover === id ? 0.45 : 0.22);
          g.lineWidth = 1.3;
          g.stroke();
          text(g, ptText(o), bx + dx + bw / 2, by + bh / 2 + 0.5, { font: `700 ${W ? 15 : 12.5}px ${theme.font}`, color });
          if (!answer) hitRect(id, { x: bx, y: by, w: bw, h: bh });
        });
        y += rowsN * (bh + gap) - gap + (W ? 20 : 0) + (W ? 10 : 7);
      }

      // Rückmeldung bzw. Hinweis
      const scoreH = W ? 58 : 26;
      const avail = R.y + R.h - scoreH - (W ? 10 : 6) - y;
      const ok = verdict === 'correct';
      const fbFont = `500 ${W ? 13 : 12}px ${theme.font}`;
      const lh = W ? 18 : 15;
      if (answer && verdict) {
        const cc = ok ? col.ok() : col.bad();
        const msg = ok
          ? tr('fbRight', { x: fmt.num(task.x, 0), y: fmt.num(task.y, 0) })
          : `${tr('youSet', { p: ptText(answer) })} ${verdict === 'swapped' ? ctx.t('fbSwapped') : verdict === 'near' ? ctx.t('fbNear') : tr('fbWrong', { x: fmt.num(task.x, 0), y: fmt.num(task.y, 0) })}`;
        const nb = W ? 32 : 28;
        const headH = W ? 34 : 24;
        const textW = W ? R.w - 2 * pad : R.w - 2 * pad - 118;
        const rows = wrap(msg, textW, fbFont);
        const h2 = Math.max(nb + 16, Math.min(avail, W ? headH + rows.length * lh + nb + 18 : Math.max(headH + rows.length * lh + 6, nb + 16)));
        const sc = answerPop.running ? Math.max(0, answerPop.value) : 1;
        card({ x: R.x, y, w: R.w, h: h2 }, cc, 0.07);
        g.save();
        g.translate(R.x + pad, y + (W ? 19 : 14));
        g.scale(sc, sc);
        text(g, `${ok ? '✓' : '✗'} ${ctx.t(ok ? 'right' : 'wrong')}`, 0, 0, { font: `800 ${W ? 18 : 14}px ${theme.font}`, color: cc, align: 'left' });
        g.restore();
        const maxRows = Math.max(1, Math.floor((h2 - headH - (W ? nb + 14 : 4)) / lh));
        textRows(rows.slice(0, maxRows), R.x + pad, y + headH + lh / 2 - (W ? 2 : 3), lh, fbFont, theme.text);
        if (W) button({ x: R.x + pad, y: y + h2 - nb - 10, w: R.w - 2 * pad, h: nb }, ctx.t('next'), 'next', cp, true);
        else button({ x: R.x + R.w - pad - 108, y: y + 8, w: 108, h: nb }, ctx.t('nextShort'), 'next', cp, true);
      } else if (avail > 40) {
        const rows = wrap(ctx.t(isRead ? 'readHelp' : 'tapGrid'), R.w - 2 * pad, fbFont);
        const h2 = Math.min(avail, rows.length * lh + (W ? 24 : 14));
        card({ x: R.x, y, w: R.w, h: h2 });
        textRows(rows, R.x + pad, y + (W ? 12 : 7) + lh / 2, lh, fbFont, theme.muted);
      }

      // Punktestand
      const right = history.filter(Boolean).length;
      const ys = R.y + R.h - scoreH;
      if (W) {
        card({ x: R.x, y: ys, w: R.w, h: scoreH });
        text(g, history.length ? tr('score', { r: right, n: history.length }) : ctx.t('scoreEmpty'), R.x + pad, ys + 18, { font: `700 13.5px ${theme.font}`, color: theme.text, align: 'left' });
        if (streak >= 2) text(g, tr('streak', { s: streak }), R.x + R.w - pad, ys + 18, { font: `800 12px ${theme.font}`, color: col.warn(), align: 'right' });
        dots(R.x + pad, ys + 40, R.w - 2 * pad);
      } else {
        text(g, history.length ? tr('score', { r: right, n: history.length }) : ctx.t('scoreEmpty'), R.x + 2, ys + scoreH / 2, { font: `700 12px ${theme.font}`, color: theme.text, align: 'left' });
        dots(R.x + R.w * 0.52, ys + scoreH / 2, R.w * 0.48 - 2);
      }
    }

    /** Verlauf der letzten Antworten als Punkte (grün richtig, rot falsch). */
    function dots(x: number, y: number, w: number): void {
      const g = surface.g;
      const n = Math.max(1, Math.floor(w / 17));
      const last = history.slice(-n);
      for (let i = 0; i < n; i++) {
        const v = last[i];
        const cx = x + 7 + i * 17;
        g.beginPath();
        const grow = i === last.length - 1 && answerPop.running ? answerPop.value : 1;
        g.arc(cx, y, (v === undefined ? 4 : 6) * (v === undefined ? 1 : grow), 0, Math.PI * 2);
        g.fillStyle = v === undefined ? withAlpha(ctx.theme.text, 0.12) : v ? col.ok() : col.bad();
        g.fill();
      }
    }

    /* ---------- Antippen ---------- */
    function gridAt(px: number, py: number): Pt | null {
      const r = plot.rect;
      if (px < r.x || px > r.x + r.w || py < r.y || py > r.y + r.h) return null;
      const [wx, wy] = plot.toWorld(px, py);
      const q: Pt = [Math.round(wx), Math.round(wy)];
      if (q[0] < 0 || q[0] > X_MAX || q[1] < 0 || q[1] > Y_MAX) return null;
      if (Math.hypot(wx - q[0], wy - q[1]) > 0.45) return null;
      return q;
    }

    new TapTarget(surface, {
      hit: (px, py) => {
        for (let i = hits.length - 1; i >= 0; i--) {
          const h = hits[i]!;
          if (px >= h.r.x && px <= h.r.x + h.r.w && py >= h.r.y && py <= h.r.y + h.r.h) return h.id;
        }
        if (mode() === 'spiel' && task.kind === 'set' && !answer) {
          const q = gridAt(px, py);
          if (q) return `grid:${q[0]}:${q[1]}`;
        }
        return null;
      },
      onTap: (id) => {
        if (id.startsWith('grid:')) {
          const [, xs, ys] = id.split(':');
          submit([Number(xs), Number(ys)]);
        } else if (id.startsWith('opt:')) {
          const o = task.options[Number(id.slice(4))];
          if (o) submit(o);
        } else if (id === 'next') newTask();
        else if (ctx.locked) return;
        else if (id.startsWith('kind:')) ctx.set({ kind: id.slice(5) as Kind });
        else if (id === 'geo') ctx.set({ geo: !p.geo });
        else if (id === 'dist') ctx.set({ dist: !p.dist });
      },
      onHover: (id) => {
        hover = id;
        ctx.requestRender();
      },
    });

    /* ---------- Zeichnen ---------- */
    function render(): void {
      const now = performance.now();
      const theme = ctx.theme;
      hits = [];
      surface.begin();
      plot.resize();
      const lay = layout();
      const g = surface.g;
      // Papier mit Schatten
      const pr = plot.rect;
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.12)';
      g.shadowBlur = 14;
      g.shadowOffsetY = 3;
      g.fillStyle = theme.bg;
      roundRect(g, pr.x, pr.y, pr.w, pr.h, 10);
      g.fill();
      g.restore();
      g.save();
      roundRect(g, pr.x, pr.y, pr.w, pr.h, 10);
      g.clip();
      plot.begin();
      drawPaper();
      drawAxes();
      const m = mode();
      if (m === 'punkte') drawPunkte();
      else if (m === 'lage') drawLage();
      else if (m === 'kreis') drawKreis();
      else drawSpiel(now);
      plot.end();
      g.restore();
      g.strokeStyle = theme.dark ? '#2a3445' : '#d5dce6';
      g.lineWidth = 1;
      roundRect(g, pr.x + 0.5, pr.y + 0.5, pr.w - 1, pr.h - 1, 10);
      g.stroke();
      drawPanel(lay.panel);
      const anim = burst.running || taskPop.running || kindTw.running || rulerTw.running || geoTw.running || relPop.running || distTw.running || pathTw.running || answerPop.running || shake.running;
      if (anim || (m === 'spiel' && task.kind === 'read' && !answer && !reduced)) ctx.requestRender();
    }

    /** Zuletzt gezeichneter Parameterbereich der Linie (Startwert für den Übergang). */
    let lastShown: [number, number] = [0, 1];
    let lastRelKind = rel.kind;
    let lastKlKind = kl.kind;

    return {
      update(changed, source) {
        if (changed.has('kind') && source !== 'init') {
          // Übergang von der zuletzt gezeichneten zur neuen Linienart
          kindFrom = lastShown;
          kindTw.play();
        }
        if (changed.has('ruler') && p.ruler && source !== 'init') rulerTw.play();
        if (changed.has('geo') && p.geo && source !== 'init') geoTw.play();
        if (changed.has('dist') && p.dist && source !== 'init') distTw.play();
        if (changed.has('mx') || changed.has('my') || changed.has('mode') || source === 'replace' || source === 'init') chooseRadAngle();
        rel = lineRelation(A(), B(), C(), D());
        kl = circleLine(M(), p.r, A(), B());
        if (source !== 'init' && (rel.kind !== lastRelKind || kl.kind !== lastKlKind)) relPop.play();
        lastRelKind = rel.kind;
        lastKlKind = kl.kind;
        if ((changed.has('task') || (changed.has('mode') && mode() === 'spiel')) && source !== 'init') {
          newTask(p.task === 'read' ? 'read' : 'set');
        }
        updateReadouts();
      },

      action(id) {
        if (id === 'new') newTask();
        else if (id === 'score') {
          history = [];
          streak = 0;
          taskNo = 0;
          newTask();
        } else if ((id === 'perp' || id === 'para') && !ctx.locked) {
          const q = construct(id);
          if (q) {
            ctx.set({ dx: q[0], dy: q[1] });
            if (!p.geo) ctx.set({ geo: true });
            else geoTw.play();
          }
        }
        ctx.requestRender();
      },

      render() {
        render();
        lastShown = shownRange();
      },
      destroy: () => surface.destroy(),
    };
  },
});
