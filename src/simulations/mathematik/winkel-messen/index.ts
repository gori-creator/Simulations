import { defineSimulation, ease, prefersReducedMotion, roundRect, Surface, text, Tween, withAlpha, type Rect } from '../../../sim-core';
import { angleType, dirDiff, dragAngle, idealPose, makeTask, measure, norm, points, type AngleType, type Leg, type Measurement, type Task, type TaskKind } from './model';

const L = (de: string, en: string) => ({ de, en });
type Mode = 'messen' | 'spiel';
type ToolKind = 'geo' | 'voll' | 'kein';
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const rad = (deg: number) => (deg * Math.PI) / 180;
const isMode = (m: Mode) => (v: Record<string, unknown>) => v.mode === m;

/** Lage des Messgeräts: Nullpunkt relativ zum Scheitel (in Einheiten der Geodreieck-Halbkante) und Drehung. */
interface Pose {
  u: number;
  v: number;
  phi: number;
}

interface Hit {
  id: string;
  r: Rect;
}

type Drag =
  | { kind: 'leg'; leg: Leg }
  | { kind: 'move'; du: number; dv: number }
  | { kind: 'rotate'; off: number }
  | { kind: 'bar'; r: Rect }
  | { kind: 'est'; r: Rect };

/**
 * Winkel schätzen und messen: zwei ziehbare Schenkel, ein Geodreieck (oder
 * Vollkreis-Winkelmesser), das man verschieben und drehen kann, Winkelarten
 * mit Farben, überstumpfe Winkel über den Ergänzungswinkel und ein Schätzspiel.
 */
export default defineSimulation({
  id: 'winkel-messen',
  dragHint: true,
  layout: { aspect: 1.6, aspectNarrow: 0.58 },
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Modus', 'Mode'),
      options: [
        { value: 'messen', label: L('Messen', 'Measure') },
        { value: 'spiel', label: L('Schätzspiel', 'Estimation game') },
      ],
      default: 'messen',
    },
    { key: 'alpha', type: 'number', label: L('Winkel α', 'Angle α'), min: 0, max: 360, step: 1, default: 50, unit: '°', visibleIf: isMode('messen') },
    {
      key: 'a1',
      type: 'number',
      label: L('Lage des Schenkels [SA', 'Direction of the arm SA'),
      min: 0,
      max: 359,
      step: 1,
      default: 20,
      unit: '°',
      help: L('Dreht den ganzen Winkel. 0° heißt: [SA zeigt nach rechts.', 'Rotates the whole angle. 0° means SA points to the right.'),
      visibleIf: isMode('messen'),
    },
    {
      key: 'tool',
      type: 'choice',
      label: L('Messgerät', 'Measuring tool'),
      options: [
        { value: 'geo', label: L('Geodreieck', 'Set square') },
        { value: 'voll', label: L('Vollkreis', 'Full circle') },
        { value: 'kein', label: L('keines', 'none') },
      ],
      default: 'geo',
      visibleIf: isMode('messen'),
    },
    {
      key: 'task',
      type: 'choice',
      label: L('Aufgaben', 'Tasks'),
      options: [
        { value: 'mix', label: L('Abwechselnd', 'Mixed') },
        { value: 'schaetzen', label: L('Schätzen', 'Estimate') },
        { value: 'zeichnen', label: L('Zeichnen', 'Draw') },
      ],
      default: 'mix',
      visibleIf: isMode('spiel'),
    },
    { key: 'show', type: 'boolean', group: 'view', label: L('Winkelgröße anzeigen', 'Show the size of the angle'), help: L('Ausgeschaltet muss man die Größe am Messgerät ablesen.', 'When off, read the size from the measuring tool.'), default: true, visibleIf: isMode('messen') },
    { key: 'names', type: 'boolean', group: 'view', label: L('Bezeichnungen S, A, B', 'Labels S, A, B'), default: true },
  ],
  actions: [
    { id: 'place', label: L('Messgerät anlegen', 'Place the tool'), primary: true, visibleIf: (v) => v.mode === 'messen' && v.tool !== 'kein' },
    { id: 'random', label: L('Zufälliger Winkel', 'Random angle'), visibleIf: isMode('messen') },
    { id: 'check', label: L('Prüfen', 'Check'), primary: true, visibleIf: isMode('spiel') },
    { id: 'new', label: L('Neue Aufgabe', 'New task'), visibleIf: isMode('spiel') },
  ],
  readouts: [
    { key: 'angle', label: L('Winkel', 'Angle'), spoiler: true },
    { key: 'type', label: L('Winkelart', 'Type of angle'), spoiler: true },
    { key: 'read', label: L('Ablesen', 'Reading'), spoiler: true },
    { key: 'score', label: L('Punktestand', 'Score') },
  ],
  presets: [
    { id: 'start', label: L('Spitzer Winkel', 'Acute angle'), values: {} },
    { id: 'stumpf', label: L('Stumpfer Winkel, schräg', 'Obtuse angle, tilted'), values: { alpha: 125, a1: 200 } },
    { id: 'recht', label: L('Rechter Winkel', 'Right angle'), values: { alpha: 90, a1: 35 } },
    { id: 'ueber', label: L('Überstumpfer Winkel', 'Reflex angle'), values: { alpha: 230, a1: 10 } },
    { id: 'voll', label: L('Mit dem Vollkreis messen', 'Measuring with a full circle'), values: { alpha: 230, a1: 10, tool: 'voll' } },
    { id: 'spiel', label: L('Schätzspiel', 'Estimation game'), values: { mode: 'spiel' } },
  ],
  strings: {
    de: {
      canvas: 'Winkel mit zwei ziehbaren Schenkeln und einem Geodreieck zum Messen, rechts die Winkelart und eine Messanleitung',
      angleTitle: 'Winkel α = ∢ASB',
      null: 'Nullwinkel',
      spitz: 'spitzer Winkel',
      recht: 'rechter Winkel',
      stumpf: 'stumpfer Winkel',
      gestreckt: 'gestreckter Winkel',
      ueberstumpf: 'überstumpfer Winkel',
      voll: 'Vollwinkel',
      barSpitz: 'spitz',
      barStumpf: 'stumpf',
      barUeber: 'überstumpf',
      howGeo: 'Messen mit dem Geodreieck',
      howVoll: 'Messen mit dem Vollkreis',
      howNone: 'Messgerät',
      step1: 'Nullpunkt auf den Scheitel S',
      step2Geo: 'Zeichenkante auf einen Schenkel',
      step2Voll: 'Nulllinie auf einen Schenkel',
      step3: 'An der Skala ablesen, die dort bei 0 beginnt',
      step3Outer: 'Jetzt an der äußeren Skala ablesen.',
      step3Inner: 'Jetzt an der inneren Skala ablesen.',
      step3Full: 'Jetzt am Vollkreis ablesen.',
      complementHint: 'Ergänzungswinkel β: α = 360° − β',
      notUnder: 'Der andere Schenkel liegt nicht unter der Skala – dreh das Geodreieck auf die andere Seite.',
      readOuter: '{v}° (äußere Skala)',
      readInner: '{v}° (innere Skala)',
      readFull: '{v}°',
      complement: 'α = 360° − {b}° = {a}°',
      complementShort: 'Ergänzungswinkel gemessen',
      place: 'Geodreieck anlegen',
      placeVoll: 'Winkelmesser anlegen',
      noTool: 'Wähle ein Messgerät, um den Winkel zu messen.',
      tipNull: 'Beim Nullwinkel liegen beide Schenkel aufeinander.',
      tipSpitz: 'Spitze Winkel sind größer als 0° und kleiner als 90°.',
      tipRecht: 'Ein rechter Winkel misst genau 90°. Man kennzeichnet ihn mit einem Viertelkreis und einem Punkt.',
      tipStumpf: 'Stumpfe Winkel sind größer als 90° und kleiner als 180°.',
      tipGestreckt: 'Beim gestreckten Winkel (180°) bilden die beiden Schenkel eine Gerade.',
      tipUeber: 'Überstumpfe Winkel liegen zwischen 180° und 360°. Miss den Ergänzungswinkel β und rechne α = 360° − β.',
      tipUeberVoll: 'Überstumpfe Winkel liegen zwischen 180° und 360°. Mit dem Vollkreis kann man sie direkt ablesen – mit dem Geodreieck über den Ergänzungswinkel: α = 360° − β.',
      tipVoll: 'Beim Vollwinkel (360°) wurde der Schenkel einmal ganz herumgedreht.',
      tipEstimate: 'Schätzhilfe: Vergleiche mit dem rechten Winkel (90°) und dem gestreckten Winkel (180°).',
      note: 'Merke',
      task: 'Aufgabe {n}',
      kindEst: 'Schätzen',
      kindDraw: 'Zeichnen',
      qEst: 'Wie groß ist der Winkel α?',
      qDraw: 'Zeichne einen Winkel von',
      yourEst: 'Deine Schätzung',
      drawHint: 'Drehe den Schenkel [SB am Griff, bis α so groß ist. Dann „Prüfen“.',
      check: 'Prüfen',
      next: 'Nächste Aufgabe ›',
      nextShort: 'Weiter ›',
      actual: 'Gemessen',
      yours: 'Deine Schätzung',
      drawn: 'Gezeichnet',
      wanted: 'Verlangt',
      dev: 'Abweichung',
      p3: 'Volltreffer!',
      p2: 'Sehr gut!',
      p1: 'Gut geschätzt!',
      p0: 'Daneben.',
      plus: '+{p} Punkte',
      score: '{p} Punkte aus {n} Aufgaben',
      score1: '{p} Punkte aus 1 Aufgabe',
      avg: '⌀ Abweichung {d}°',
      scoreEmpty: 'Noch keine Aufgabe gelöst',
      readoutAngle: 'α = ∢ASB = {a}°',
      readoutRead: '{r}',
      readoutNot: 'Messgerät noch nicht richtig angelegt',
      scoreRead: '{p} Punkte aus {n} Aufgaben, ⌀ Abweichung {d}°',
      scoreRead1: '{p} Punkte aus 1 Aufgabe, Abweichung {d}°',
      refs: 'Zum Vergleich',
      isType: 'Ein Winkel von {a}° ist ein {t}.',
      lastRead: 'Letzte Aufgabe: {t}° verlangt bzw. gezeigt, {g}° geantwortet',
      deg: '°',
    },
    en: {
      canvas: 'Angle with two draggable arms and a set square for measuring, with the type of angle and measuring steps',
      angleTitle: 'Angle α = ∠ASB',
      null: 'zero angle',
      spitz: 'acute angle',
      recht: 'right angle',
      stumpf: 'obtuse angle',
      gestreckt: 'straight angle',
      ueberstumpf: 'reflex angle',
      voll: 'full angle',
      barSpitz: 'acute',
      barStumpf: 'obtuse',
      barUeber: 'reflex',
      howGeo: 'Measuring with the set square',
      howVoll: 'Measuring with a full circle',
      howNone: 'Measuring tool',
      step1: 'Zero mark on the vertex S',
      step2Geo: 'Edge along one arm',
      step2Voll: 'Zero line along one arm',
      step3: 'Read the scale that starts at 0 on that arm',
      step3Outer: 'Now read the outer scale.',
      step3Inner: 'Now read the inner scale.',
      step3Full: 'Now read the full circle.',
      complementHint: 'Other angle β: α = 360° − β',
      notUnder: 'The other arm is not under the scale – turn the set square to the other side.',
      readOuter: '{v}° (outer scale)',
      readInner: '{v}° (inner scale)',
      readFull: '{v}°',
      complement: 'α = 360° − {b}° = {a}°',
      complementShort: 'measured the other angle',
      place: 'Place the set square',
      placeVoll: 'Place the protractor',
      noTool: 'Choose a measuring tool to measure the angle.',
      tipNull: 'For a zero angle both arms lie on top of each other.',
      tipSpitz: 'Acute angles are greater than 0° and less than 90°.',
      tipRecht: 'A right angle measures exactly 90°. It is marked with a small square or a quarter circle with a dot.',
      tipStumpf: 'Obtuse angles are greater than 90° and less than 180°.',
      tipGestreckt: 'For a straight angle (180°) the two arms form a straight line.',
      tipUeber: 'Reflex angles lie between 180° and 360°. Measure the other angle β and calculate α = 360° − β.',
      tipUeberVoll: 'Reflex angles lie between 180° and 360°. With a full circle you can read them directly – with a set square via the other angle: α = 360° − β.',
      tipVoll: 'For a full angle (360°) the arm has turned once all the way round.',
      tipEstimate: 'Estimating tip: compare with a right angle (90°) and a straight angle (180°).',
      note: 'Remember',
      task: 'Task {n}',
      kindEst: 'Estimate',
      kindDraw: 'Draw',
      qEst: 'How large is the angle α?',
      qDraw: 'Draw an angle of',
      yourEst: 'Your estimate',
      drawHint: 'Turn the arm SB at its handle until α has this size. Then press “Check”.',
      check: 'Check',
      next: 'Next task ›',
      nextShort: 'Next ›',
      actual: 'Measured',
      yours: 'Your estimate',
      drawn: 'Drawn',
      wanted: 'Asked for',
      dev: 'Difference',
      p3: 'Bull’s eye!',
      p2: 'Very good!',
      p1: 'Good estimate!',
      p0: 'Missed.',
      plus: '+{p} points',
      score: '{p} points from {n} tasks',
      score1: '{p} points from 1 task',
      avg: '⌀ difference {d}°',
      scoreEmpty: 'No task solved yet',
      readoutAngle: 'α = ∠ASB = {a}°',
      readoutRead: '{r}',
      readoutNot: 'Measuring tool not placed correctly yet',
      scoreRead: '{p} points from {n} tasks, ⌀ difference {d}°',
      scoreRead1: '{p} points from 1 task, difference {d}°',
      refs: 'For comparison',
      isType: 'Type of angle at {a}°: {t}.',
      lastRead: 'Last task: {t}° asked or shown, {g}° answered',
      deg: '°',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const reduced = prefersReducedMotion();
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (m, k: string) => String(vars[k] ?? m));
    const mode = () => p.mode as Mode;
    const wide = () => surface.width >= 640;
    const onColor = () => (ctx.theme.dark ? '#10161f' : '#ffffff');

    const typeColor = (t: AngleType): string => {
      const s = ctx.theme.series;
      switch (t) {
        case 'spitz':
          return s[2]!;
        case 'recht':
          return s[0]!;
        case 'stumpf':
          return s[3]!;
        case 'gestreckt':
          return s[4]!;
        case 'ueberstumpf':
          return s[1]!;
        case 'voll':
          return s[5]!;
        default:
          return ctx.theme.muted;
      }
    };

    /* ---------- Zustand ---------- */
    let pose: Pose = { u: 0, v: 0, phi: 0 };
    /** Am Schenkel „eingerastet“: folgt dem Schenkel, wenn sich der Winkel ändert. */
    let attach: { leg: Leg; off: 0 | 180 } | null = null;
    let poseFrom: Pose = pose;
    let poseTo: Pose = pose;
    let attachTo: { leg: Leg; off: 0 | 180 } | null = null;
    const placeTw = new Tween(900, ease.inOutCubic);
    const typePop = new Tween(450, ease.outBack);
    let lastType: AngleType = angleType(p.alpha);
    let drag: Drag | null = null;
    let hover: string | null = null;
    let hits: Hit[] = [];

    // Schätzspiel
    let taskNo = 1;
    let task: Task = makeTask(Math.random, firstKind());
    let est = 90;
    let drawn = startDrawn(task);
    let answered = false;
    let history: { pts: number; dev: number }[] = [];
    let lastAnswer = 0;
    const resultPop = new Tween(520, ease.outBack);
    const taskPop = new Tween(450, ease.outBack);

    function firstKind(): TaskKind {
      return p.task === 'zeichnen' ? 'zeichnen' : 'schaetzen';
    }

    function startDrawn(t: Task): number {
      // Startlage beim Zeichnen: deutlich vom Ziel entfernt
      return t.target > 150 ? 60 : 200;
    }

    /** Aktueller Winkel (Messen: Parameter; Spiel: Aufgabe bzw. gezeichneter Winkel). */
    const alpha = (): number => (mode() === 'spiel' ? (task.kind === 'zeichnen' ? drawn : task.target) : p.alpha);
    const a1 = (): number => (mode() === 'spiel' ? task.a1 : p.a1);
    const toolKind = (): ToolKind => (mode() === 'spiel' ? 'geo' : (p.tool as ToolKind));
    const toolVisible = () => toolKind() !== 'kein' && (mode() === 'messen' || answered);
    const dirOf = (leg: Leg) => norm(leg === 'A' ? a1() : a1() + alpha());
    /** Darf die Größe gezeigt werden? (Messen: Schalter; Spiel: erst nach dem Prüfen) */
    const reveal = () => (mode() === 'messen' ? p.show : answered);

    /* ---------- Aufteilung ---------- */
    function layout(): { scene: Rect; panel: Rect; S: [number, number]; G: number } {
      const W = surface.width;
      const H = surface.height;
      if (wide()) {
        const panelW = Math.round(clamp(W * 0.33, 250, 300));
        const scene = { x: 0, y: 0, w: W - panelW - 12, h: H };
        const G = Math.min(scene.w, scene.h) / 2 - 16;
        return { scene, panel: { x: W - panelW, y: 2, w: panelW - 2, h: H - 4 }, S: [scene.x + scene.w / 2, scene.y + scene.h / 2], G };
      }
      const scene = { x: 0, y: 0, w: W, h: Math.min(W, H * 0.6) };
      const G = Math.min(scene.w, scene.h) / 2 - 10;
      return { scene, panel: { x: 2, y: scene.h + 8, w: W - 4, h: H - scene.h - 10 }, S: [scene.x + scene.w / 2, scene.y + scene.h / 2], G };
    }

    /** Punkt in Richtung `deg` im Abstand `r` (Pixel) vom Scheitel. */
    function polar(deg: number, r: number): [number, number] {
      const { S } = layout();
      return [S[0] + r * Math.cos(rad(deg)), S[1] - r * Math.sin(rad(deg))];
    }

    /* ---------- Messgerät ---------- */
    /** Aktuelle Lage (mit Einrasten und Animation). */
    function currentPose(): Pose {
      if (placeTw.running) {
        const t = placeTw.value;
        let d = norm(poseTo.phi - poseFrom.phi);
        if (d > 180) d -= 360;
        return { u: poseFrom.u + (poseTo.u - poseFrom.u) * t, v: poseFrom.v + (poseTo.v - poseFrom.v) * t, phi: poseFrom.phi + d * t };
      }
      if (attach) return { u: 0, v: 0, phi: norm(dirOf(attach.leg) + attach.off) };
      return pose;
    }

    function finishPlace(): void {
      if (attachTo) {
        attach = attachTo;
        pose = { u: 0, v: 0, phi: norm(dirOf(attachTo.leg) + attachTo.off) };
      } else {
        pose = poseTo;
        attach = null;
      }
      attachTo = null;
    }

    /** Messgerät richtig anlegen (mit Animation). */
    function placeTool(animate = true): void {
      const kind = toolKind();
      if (kind === 'kein') return;
      const ideal = idealPose(kind === 'voll' ? 'voll' : 'geo', a1(), alpha());
      poseFrom = currentPose();
      attachTo = { leg: ideal.leg, off: 0 };
      poseTo = { u: 0, v: 0, phi: ideal.phi };
      if (animate && !reduced) placeTw.play();
      else {
        placeTw.finish();
        finishPlace();
      }
      ctx.requestRender();
    }

    /** Messgerät zur Seite legen (zum Üben des Anlegens). */
    function parkTool(): void {
      attach = null;
      placeTw.finish();
      pose = { u: 0.42, v: -0.62, phi: 12 };
    }

    function measurement(): Measurement | null {
      if (!toolVisible() || placeTw.running) return null;
      const cp = currentPose();
      const atS = Math.hypot(cp.u, cp.v) < 1e-6;
      return measure(toolKind() === 'voll' ? 'voll' : 'geo', { atS, phi: cp.phi }, a1(), alpha());
    }

    /** Lokale Koordinaten (u längs der Zeichenkante, v ins Geodreieck hinein) → Pixel. */
    function toolToPx(cp: Pose, u: number, v: number): [number, number] {
      const { S, G } = layout();
      const c = Math.cos(rad(cp.phi));
      const s = Math.sin(rad(cp.phi));
      const wx = cp.u + u * c - v * s;
      const wy = cp.v + u * s + v * c;
      return [S[0] + wx * G, S[1] - wy * G];
    }

    function pxToTool(cp: Pose, px: number, py: number): [number, number] {
      const { S, G } = layout();
      const wx = (px - S[0]) / G - cp.u;
      const wy = -(py - S[1]) / G - cp.v;
      const c = Math.cos(rad(cp.phi));
      const s = Math.sin(rad(cp.phi));
      return [wx * c + wy * s, -wx * s + wy * c];
    }

    function insideTool(px: number, py: number): boolean {
      if (!toolVisible()) return false;
      const cp = currentPose();
      const [u, v] = pxToTool(cp, px, py);
      if (toolKind() === 'voll') return Math.hypot(u, v) <= VOLL_R;
      return v >= -0.01 && v <= 1 - Math.abs(u);
    }

    const VOLL_R = 0.8;
    /** Drehgriffe (Symbole) in lokalen Koordinaten: in den Ecken bzw. auf dem Zahlenring. */
    let rotChoice: [number, number][] | null = null;
    function rotHandles(): [number, number][] {
      if (drag?.kind === 'rotate' && rotChoice) return rotChoice;
      const cands: [number, number][] =
        toolKind() === 'voll'
          ? [
              [0, -0.48],
              [0, 0.48],
              [0.48, 0],
              [-0.48, 0],
            ]
          : [
              [-0.79, 0.1],
              [0.79, 0.1],
              [-0.21, 0.75],
              [0.21, 0.75],
            ];
      // Die zwei Stellen, die am weitesten von den Schenkeln entfernt sind
      const cp = currentPose();
      const { S, G } = layout();
      const legs = (['A', 'B'] as Leg[]).map((l) => polar(dirOf(l), G * 0.95));
      const segDist = (x: number, y: number, [lx, ly]: [number, number]) => {
        const dx = lx - S[0];
        const dy = ly - S[1];
        const t = clamp(((x - S[0]) * dx + (y - S[1]) * dy) / (dx * dx + dy * dy || 1), 0, 1);
        return Math.hypot(x - S[0] - t * dx, y - S[1] - t * dy);
      };
      const score = (c: [number, number]) => {
        const [x, y] = toolToPx(cp, c[0], c[1]);
        return Math.min(...legs.map((l) => segDist(x, y, l)));
      };
      rotChoice = cands
        .map((c) => ({ c, d: score(c) }))
        .sort((a, b) => b.d - a.d)
        .slice(0, 2)
        .map((e) => e.c);
      return rotChoice;
    }

    /** Drehzone: außerhalb der Winkelskala (Geodreieck) bzw. auf dem Zahlenring (Vollkreis). */
    function inRotZone(px: number, py: number): boolean {
      const cp = currentPose();
      const [u, v] = pxToTool(cp, px, py);
      const r = Math.hypot(u, v);
      if (toolKind() === 'voll') return r > 0.56 && r <= VOLL_R;
      return v >= -0.01 && v <= 1 - Math.abs(u) && r > 0.74;
    }

    /* ---------- Ergebnisse ---------- */
    function typeName(t: AngleType): string {
      return ctx.t(t);
    }

    function updateReadouts(): void {
      if (mode() === 'spiel') {
        ctx.readout('angle', answered ? tr('readoutAngle', { a: fmt.num(alpha(), 0) }) : null);
        ctx.readout('type', answered ? typeName(angleType(alpha())) : null);
        ctx.readout('read', null);
        const n = history.length;
        const pts = history.reduce((s, h) => s + h.pts, 0);
        const avg = n ? history.reduce((s, h) => s + h.dev, 0) / n : 0;
        ctx.readout('score', n ? tr(n === 1 ? 'scoreRead1' : 'scoreRead', { p: pts, n, d: fmt.num(avg, 0) }) : ctx.t('scoreEmpty'));
        ctx.setAction('check', { enabled: !answered });
        return;
      }
      ctx.readout('score', null);
      ctx.readout('angle', tr('readoutAngle', { a: fmt.num(p.alpha, 0) }));
      ctx.readout('type', typeName(angleType(p.alpha)));
      const m = measurement();
      if (toolKind() === 'kein') ctx.readout('read', null);
      else if (!m || !m.ok) ctx.readout('read', ctx.t(m && !m.ok && m.reason === 'notUnder' ? 'notUnder' : 'readoutNot'));
      else ctx.readout('read', readingText(m));
    }

    function readingText(m: Extract<Measurement, { ok: true }>): string {
      const base = m.scale === 'full' ? tr('readFull', { v: m.reading }) : tr(m.scale === 'outer' ? 'readOuter' : 'readInner', { v: m.reading });
      if (m.what === 'complement' && alpha() !== 180) return `${base} → ${tr('complement', { b: m.reading, a: fmt.num(alpha(), 0) })}`;
      return base;
    }

    /* ---------- Zeichnen: Bausteine ---------- */
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
      str = str.replace(/ ([=−]) /g, ' $1 ');
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

    function textRows(rows: string[], x: number, y: number, lh: number, font: string, color: string): number {
      rows.forEach((row, i) => text(surface.g, row, x, y + i * lh, { font, color, align: 'left', baseline: 'middle' }));
      return rows.length * lh;
    }

    function title(x: number, y: number, label: string): void {
      text(surface.g, label, x, y, { font: `700 ${wide() ? 12 : 11}px ${ctx.theme.font}`, color: ctx.theme.muted, align: 'left' });
    }

    function button(r: Rect, label: string, id: string, color: string, filled = false, enabled = true): void {
      const g = surface.g;
      const theme = ctx.theme;
      const hov = hover === id && enabled;
      g.save();
      if (!enabled) g.globalAlpha = 0.45;
      g.fillStyle = filled ? color : withAlpha(color, hov ? 0.16 : theme.dark ? 0.12 : 0.08);
      roundRect(g, r.x, r.y, r.w, r.h, Math.min(r.h / 2, 12));
      g.fill();
      if (filled && hov) {
        g.fillStyle = 'rgba(255,255,255,0.12)';
        g.fill();
      }
      g.strokeStyle = withAlpha(color, filled ? 1 : 0.6);
      g.lineWidth = 1.3;
      g.stroke();
      text(g, label, r.x + r.w / 2, r.y + r.h / 2 + 0.5, { font: `700 ${wide() ? 13 : 12}px ${theme.font}`, color: filled ? onColor() : color });
      g.restore();
      if (enabled) hits.push({ id, r });
    }

    /* ---------- Zeichnen: Szene ---------- */
    function drawPaper(R: Rect, G: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.12)';
      g.shadowBlur = 14;
      g.shadowOffsetY = 3;
      g.fillStyle = theme.bg;
      roundRect(g, R.x + 2, R.y + 2, R.w - 4, R.h - 4, 12);
      g.fill();
      g.restore();
      g.save();
      roundRect(g, R.x + 2, R.y + 2, R.w - 4, R.h - 4, 12);
      g.clip();
      // Kästchen: 0,5 cm des (gedachten) 16-cm-Geodreiecks
      const k = G / 16;
      const { S } = layout();
      g.lineWidth = 1;
      g.strokeStyle = theme.gridMinor;
      g.beginPath();
      for (let x = S[0] - Math.ceil((S[0] - R.x) / k) * k; x <= R.x + R.w; x += k) {
        g.moveTo(Math.round(x) + 0.5, R.y);
        g.lineTo(Math.round(x) + 0.5, R.y + R.h);
      }
      for (let y = S[1] - Math.ceil((S[1] - R.y) / k) * k; y <= R.y + R.h; y += k) {
        g.moveTo(R.x, Math.round(y) + 0.5);
        g.lineTo(R.x + R.w, Math.round(y) + 0.5);
      }
      g.stroke();
      g.restore();
      g.strokeStyle = theme.dark ? '#2a3445' : '#d5dce6';
      g.lineWidth = 1;
      roundRect(g, R.x + 2.5, R.y + 2.5, R.w - 5, R.h - 5, 12);
      g.stroke();
    }

    /** Winkelfeld mit Bogen bzw. Kennzeichnung des rechten Winkels. */
    function drawAngleMark(G: number, aDir: number, al: number, color: string, k: number): void {
      const g = surface.g;
      const { S } = layout();
      const theme = ctx.theme;
      if (al <= 0) return;
      const r = G * (al > 180 ? 0.2 : 0.26) * k;
      if (al === 90) {
        // Viertelkreis mit Punkt
        const rr = G * 0.17 * k;
        g.beginPath();
        g.moveTo(S[0], S[1]);
        g.arc(S[0], S[1], rr, -rad(aDir), -rad(aDir + 90), true);
        g.closePath();
        g.fillStyle = withAlpha(color, theme.dark ? 0.28 : 0.18);
        g.fill();
        g.beginPath();
        g.arc(S[0], S[1], rr, -rad(aDir), -rad(aDir + 90), true);
        g.strokeStyle = color;
        g.lineWidth = 2.2;
        g.stroke();
        const [dx, dy] = polar(aDir + 45, rr * 0.52);
        g.beginPath();
        g.arc(dx, dy, 3, 0, Math.PI * 2);
        g.fillStyle = color;
        g.fill();
        return;
      }
      g.beginPath();
      g.moveTo(S[0], S[1]);
      g.arc(S[0], S[1], r, -rad(aDir), -rad(aDir + al), true);
      g.closePath();
      g.fillStyle = withAlpha(color, theme.dark ? 0.24 : 0.15);
      g.fill();
      g.beginPath();
      g.arc(S[0], S[1], r, -rad(aDir), -rad(aDir + al), true);
      g.strokeStyle = color;
      g.lineWidth = 2.6;
      g.stroke();
    }

    /** Schenkel als Halbgerade: kräftig, zum Ende hin auslaufend. */
    function drawLeg(dir: number, len: number, color: string, width = 3.4, dash?: number[]): void {
      const g = surface.g;
      const { S } = layout();
      const [ex, ey] = polar(dir, len);
      const grad = g.createLinearGradient(S[0], S[1], ex, ey);
      grad.addColorStop(0, color);
      grad.addColorStop(0.82, color);
      grad.addColorStop(1, withAlpha(color, 0));
      g.save();
      g.strokeStyle = grad;
      g.lineWidth = width;
      g.lineCap = 'round';
      if (dash) g.setLineDash(dash);
      g.beginPath();
      g.moveTo(S[0], S[1]);
      g.lineTo(ex, ey);
      g.stroke();
      g.restore();
    }

    function haloText(str: string, x: number, y: number, font: string, color: string, align: CanvasTextAlign = 'center'): void {
      const g = surface.g;
      g.save();
      g.font = font;
      g.textAlign = align;
      g.textBaseline = 'middle';
      g.lineJoin = 'round';
      g.lineWidth = 4;
      g.strokeStyle = ctx.theme.bg;
      g.strokeText(str, x, y);
      g.fillStyle = color;
      g.fillText(str, x, y);
      g.restore();
    }

    function drawScene(): void {
      const g = surface.g;
      const theme = ctx.theme;
      const { scene, S, G } = layout();
      drawPaper(scene, G);
      const al = alpha();
      const aDir = a1();
      const bDir = norm(aDir + al);
      const t = angleType(al);
      // Ohne angezeigte Größe verrät auch die Farbe die Winkelart nicht
      const revealType = mode() === 'messen' ? p.show : answered;
      const tc = revealType ? typeColor(t) : theme.series[4]!;
      const k = typePop.running ? Math.max(0.3, typePop.value) : 1;
      const legLen = G * 0.97;
      const ink = theme.text;

      // Spiel: Geisterschenkel (Schätzung bzw. verlangter Winkel) nach dem Prüfen
      if (mode() === 'spiel' && answered) {
        const ghost = task.kind === 'schaetzen' ? lastAnswer : task.target;
        const gc = theme.series[4]!;
        if (ghost !== al) {
        const gDir = norm(aDir + ghost);
        // Abweichung als schmaler Bogen
        const lo = Math.min(ghost, al);
        const hi = Math.max(ghost, al);
        if (hi - lo > 0.5) {
          g.beginPath();
          g.arc(S[0], S[1], G * 0.42, -rad(aDir + lo), -rad(aDir + hi), true);
          g.strokeStyle = withAlpha(gc, 0.85);
          g.lineWidth = 5;
          g.lineCap = 'butt';
          g.stroke();
        }
        drawLeg(gDir, legLen * 0.9, withAlpha(gc, 0.9), 2.6, [9, 7]);
        const [gx0, gy0] = polar(gDir, G * 0.99);
        const lx = clamp(gx0, scene.x + 70, scene.x + scene.w - 70);
        const ly = clamp(gy0, scene.y + 14, scene.y + scene.h - 14);
        haloText(task.kind === 'schaetzen' ? `${ctx.t('yours')}: ${ghost}°` : `${ctx.t('wanted')}: ${ghost}°`, lx, ly, `700 ${wide() ? 13 : 11.5}px ${theme.font}`, gc);
        }
      }

      drawAngleMark(G, aDir, al, tc, k);
      if (al === 360) {
        g.beginPath();
        g.arc(S[0], S[1], G * 0.2 * k, 0, Math.PI * 2);
        g.strokeStyle = tc;
        g.lineWidth = 2.6;
        g.stroke();
      }
      drawLeg(aDir, legLen, ink);
      drawLeg(bDir, legLen, ink);

      // Bezeichnung des Winkels im Winkelfeld
      const showVal = mode() === 'messen' ? p.show : answered;
      if (al > 0) {
        const mid = al === 360 ? aDir + 180 : aDir + al / 2;
        const f = `italic 700 ${wide() ? 22 : 18}px ${theme.mathFont}`;
        const vf = `800 ${wide() ? 17 : 14}px ${theme.font}`;
        g.font = f;
        const w1 = g.measureText('α').width;
        g.font = vf;
        const vtxt = ` = ${fmt.num(al, 0)}°`;
        const w2 = showVal ? g.measureText(vtxt).width : 0;
        // Beim Vollwinkel die Beschriftung ganz außerhalb des Kreisbogens
        const rr = al === 360 ? G * 0.2 + (w1 + w2) / 2 + 12 : al === 90 ? G * 0.3 : al > 180 ? G * 0.3 : G * 0.37;
        const [lx, ly] = polar(mid, rr);
        if (showVal) {
          const x0 = lx - (w1 + w2) / 2;
          haloText('α', x0, ly, f, tc, 'left');
          haloText(vtxt, x0 + w1, ly + 1, vf, tc, 'left');
        } else haloText('α', lx, ly, f, tc);
      }

      // Scheitel und Punkte
      if (p.names) {
        // Nullwinkel: S unter den Schenkel, sonst gegenüber dem Winkelfeld
        const opp = al === 0 ? aDir - 90 : al === 360 ? aDir + 180 : aDir + al / 2 + 180;
        const [sx, sy] = polar(opp, wide() ? 20 : 16);
        haloText('S', sx, sy, `700 ${wide() ? 17 : 15}px ${theme.font}`, ink);
      }
      g.beginPath();
      g.arc(S[0], S[1], 4.5, 0, Math.PI * 2);
      g.fillStyle = ink;
      g.fill();

      // Messgerät
      if (toolVisible()) {
        if (toolKind() === 'voll') drawVoll();
        else drawGeo();
      }

      // Griffe an den Schenkeln
      for (const leg of ['A', 'B'] as Leg[]) {
        const dir = leg === 'A' ? aDir : bDir;
        const [hx, hy] = polar(dir, G * 0.92);
        const can = legEditable(leg);
        if (can) {
          const on = hover === `leg${leg}` || (drag?.kind === 'leg' && drag.leg === leg);
          g.beginPath();
          g.arc(hx, hy, on ? 15 : 12, 0, Math.PI * 2);
          g.fillStyle = withAlpha(leg === 'A' ? theme.series[0]! : tc, on ? 0.3 : 0.18);
          g.fill();
        }
        // Punkt als Kreuzchen
        g.save();
        g.lineCap = 'round';
        g.strokeStyle = theme.bg;
        g.lineWidth = 6;
        g.beginPath();
        g.moveTo(hx - 5, hy - 5);
        g.lineTo(hx + 5, hy + 5);
        g.moveTo(hx + 5, hy - 5);
        g.lineTo(hx - 5, hy + 5);
        g.stroke();
        g.strokeStyle = ink;
        g.lineWidth = 2.6;
        g.stroke();
        g.restore();
        if (p.names && !(leg === 'B' && (al === 0 || al === 360))) {
          // Beschriftung neben dem Kreuzchen, außerhalb des Winkelfelds
          const n = rad(dir + (leg === 'A' ? -90 : 90));
          const d = wide() ? 19 : 16;
          haloText(leg, hx + Math.cos(n) * d, hy - Math.sin(n) * d, `700 ${wide() ? 16 : 14}px ${theme.font}`, ink);
        }
      }
    }

    function legEditable(leg: Leg): boolean {
      if (ctx.locked && mode() === 'messen') return false;
      if (mode() === 'messen') return true;
      return leg === 'B' && task.kind === 'zeichnen' && !answered;
    }

    /** Geodreieck (Kantenlänge 16 cm, hier mit Halbkante G) mit cm- und Winkelskalen. */
    function drawGeo(): void {
      const g = surface.g;
      const theme = ctx.theme;
      const { G } = layout();
      const cp = currentPose();
      const P = (u: number, v: number) => toolToPx(cp, u, v);
      const m = measurement();
      const okM = m && m.ok ? m : null;
      const tc = reveal() ? typeColor(angleType(alpha())) : theme.series[0]!;
      const strong = reveal();
      // Körper
      const tri = [P(-1, 0), P(1, 0), P(0, 1)];
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.55)' : 'rgba(16,24,40,0.18)';
      g.shadowBlur = 16;
      g.shadowOffsetY = 5;
      g.beginPath();
      tri.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
      g.closePath();
      g.fillStyle = theme.dark ? 'rgba(170,200,240,0.12)' : 'rgba(232,243,255,0.42)';
      g.fill();
      g.restore();
      g.strokeStyle = withAlpha(theme.text, 0.55);
      g.lineWidth = 1.4;
      g.beginPath();
      tri.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
      g.closePath();
      g.stroke();
      const ink = withAlpha(theme.text, 0.78);
      const faint = withAlpha(theme.text, theme.dark ? 0.24 : 0.2);
      // Parallelen zur Zeichenkante (außerhalb der Winkelskala)
      const R = 0.7;
      g.strokeStyle = faint;
      g.lineWidth = 1;
      g.beginPath();
      for (let v = 1 / 16; v < 0.95; v += 1 / 16) {
        const half = 1 - v - 0.03;
        if (half <= 0.02) continue;
        if (v >= R) {
          const [x0, y0] = P(-half, v);
          const [x1, y1] = P(half, v);
          g.moveTo(x0, y0);
          g.lineTo(x1, y1);
        } else {
          const inner = Math.sqrt(R * R - v * v) + 0.03;
          if (half > inner) {
            for (const s of [-1, 1]) {
              const [x0, y0] = P(s * inner, v);
              const [x1, y1] = P(s * half, v);
              g.moveTo(x0, y0);
              g.lineTo(x1, y1);
            }
          }
        }
      }
      g.stroke();
      // cm-Skala auf der Zeichenkante
      const mmPx = G / 80;
      g.strokeStyle = ink;
      g.beginPath();
      for (let kk = -75; kk <= 75; kk++) {
        if (mmPx < 2.6 && kk % 5 !== 0) continue;
        const len = kk % 10 === 0 ? 0.055 : kk % 5 === 0 ? 0.038 : 0.022;
        const [x0, y0] = P(kk / 80, 0);
        const [x1, y1] = P(kk / 80, len);
        g.moveTo(x0, y0);
        g.lineTo(x1, y1);
      }
      g.stroke();
      // Winkelskala: Bogen mit Gradstrichen
      const degPx = (G * R * Math.PI) / 180;
      g.beginPath();
      for (let d = 0; d <= 180; d++) {
        if (degPx < 2.2 && d % 5 !== 0) continue;
        const len = d % 10 === 0 ? 0.06 : d % 5 === 0 ? 0.04 : 0.022;
        const c = Math.cos(rad(d));
        const s = Math.sin(rad(d));
        const [x0, y0] = P(R * c, R * s);
        const [x1, y1] = P((R - len) * c, (R - len) * s);
        g.moveTo(x0, y0);
        g.lineTo(x1, y1);
      }
      g.lineWidth = 1;
      g.stroke();
      g.beginPath();
      for (let i = 0; i <= 60; i++) {
        const d = i * 3;
        const [x, y] = P(R * Math.cos(rad(d)), R * Math.sin(rad(d)));
        if (i) g.lineTo(x, y);
        else g.moveTo(x, y);
      }
      g.stroke();
      // Mittellinie und Nullmarke
      const [m0x, m0y] = P(0, 0);
      const [m1x, m1y] = P(0, 0.3);
      g.strokeStyle = ink;
      g.lineWidth = 1.2;
      g.beginPath();
      g.moveTo(m0x, m0y);
      g.lineTo(m1x, m1y);
      g.stroke();
      // Zahlen: aufrecht zum Geodreieck
      const rotation = -rad(cp.phi);
      const fs = Math.max(8.5, G * 0.043);
      const numFont = (bold: boolean) => `${bold ? 800 : 600} ${bold ? fs * 1.12 : fs}px ${theme.font}`;
      const outerOn = okM && okM.scale === 'outer';
      const innerOn = okM && okM.scale === 'inner';
      const drawNum = (str: string, u: number, v: number, color: string, bold: boolean) => {
        const [x, y] = P(u, v);
        g.save();
        g.translate(x, y);
        g.rotate(rotation);
        text(g, str, 0, 0, { font: numFont(bold), color });
        g.restore();
      };
      for (let d = 0; d <= 180; d += 10) {
        const c = Math.cos(rad(d));
        const s = Math.sin(rad(d));
        drawNum(String(d), 0.6 * c, 0.6 * s, outerOn ? tc : innerOn ? withAlpha(theme.text, 0.3) : ink, strong && !!outerOn && okM?.reading === d);
        drawNum(String(180 - d), 0.5 * c, 0.5 * s, innerOn ? tc : outerOn ? withAlpha(theme.text, 0.3) : withAlpha(theme.text, 0.62), strong && !!innerOn && okM?.reading === 180 - d);
      }
      for (let c = -7; c <= 7; c++) drawNum(String(Math.abs(c)), c / 8, 0.1, ink, false);
      // Ablesestelle
      if (okM) {
        const otherDir = dirOf(okM.edge === 'A' ? 'B' : 'A');
        const theta = norm(otherDir - cp.phi);
        const th = theta > 359.5 ? 0 : Math.min(180, theta);
        const [cx, cy] = P(R * Math.cos(rad(th)), R * Math.sin(rad(th)));
        g.beginPath();
        g.arc(cx, cy, 7, 0, Math.PI * 2);
        g.strokeStyle = tc;
        g.lineWidth = 2.5;
        g.stroke();
        g.beginPath();
        g.arc(cx, cy, 2.5, 0, Math.PI * 2);
        g.fillStyle = tc;
        g.fill();
      }
      // Drehgriff
      drawRotHandle(cp);
    }

    function drawRotHandle(cp: Pose): void {
      if (!toolEditable()) return;
      for (const [hu, hv] of rotHandles()) rotIcon(...toolToPx(cp, hu, hv));
    }

    function rotIcon(x: number, y: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const on = hover === 'rot' || drag?.kind === 'rotate';
      const c = theme.series[0]!;
      g.beginPath();
      g.arc(x, y, on ? 16 : 14, 0, Math.PI * 2);
      g.fillStyle = on ? c : withAlpha(c, 0.85);
      g.fill();
      g.strokeStyle = theme.bg;
      g.lineWidth = 2;
      g.stroke();
      // Drehpfeil
      g.strokeStyle = onColor();
      g.lineWidth = 2;
      g.lineCap = 'round';
      g.beginPath();
      g.arc(x, y, 6.5, -2.6, 1.2);
      g.stroke();
      const ex = x + 6.5 * Math.cos(1.2);
      const ey = y + 6.5 * Math.sin(1.2);
      g.fillStyle = onColor();
      g.beginPath();
      g.moveTo(ex + 3.5, ey - 1);
      g.lineTo(ex - 2.5, ey + 3.8);
      g.lineTo(ex - 2.2, ey - 3.2);
      g.closePath();
      g.fill();
    }

    /** Vollkreis-Winkelmesser (0° bis 360° gegen den Uhrzeigersinn). */
    function drawVoll(): void {
      const g = surface.g;
      const theme = ctx.theme;
      const { G } = layout();
      const cp = currentPose();
      const P = (u: number, v: number) => toolToPx(cp, u, v);
      const m = measurement();
      const okM = m && m.ok ? m : null;
      const tc = reveal() ? typeColor(angleType(alpha())) : theme.series[0]!;
      const [cx, cy] = P(0, 0);
      const Rp = VOLL_R * G;
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.55)' : 'rgba(16,24,40,0.18)';
      g.shadowBlur = 16;
      g.shadowOffsetY = 5;
      g.beginPath();
      g.arc(cx, cy, Rp, 0, Math.PI * 2);
      g.fillStyle = theme.dark ? 'rgba(170,200,240,0.13)' : 'rgba(232,243,255,0.5)';
      g.fill();
      g.restore();
      g.beginPath();
      g.arc(cx, cy, Rp, 0, Math.PI * 2);
      g.strokeStyle = withAlpha(theme.text, 0.55);
      g.lineWidth = 1.4;
      g.stroke();
      g.beginPath();
      g.arc(cx, cy, Rp * 0.42, 0, Math.PI * 2);
      g.strokeStyle = withAlpha(theme.text, 0.18);
      g.lineWidth = 1;
      g.stroke();
      const ink = withAlpha(theme.text, 0.78);
      const degPx = (Rp * Math.PI) / 180;
      g.strokeStyle = ink;
      g.beginPath();
      for (let d = 0; d < 360; d++) {
        if (degPx < 2.2 && d % 5 !== 0) continue;
        const len = d % 10 === 0 ? 0.075 : d % 5 === 0 ? 0.05 : 0.028;
        const c = Math.cos(rad(d));
        const s = Math.sin(rad(d));
        const [x0, y0] = P((VOLL_R - 0.005) * c, (VOLL_R - 0.005) * s);
        const [x1, y1] = P((VOLL_R - len) * c, (VOLL_R - len) * s);
        g.moveTo(x0, y0);
        g.lineTo(x1, y1);
      }
      g.lineWidth = 1;
      g.stroke();
      // Nulllinie
      const [z1x, z1y] = P(VOLL_R, 0);
      g.strokeStyle = withAlpha(theme.series[1]!, 0.85);
      g.lineWidth = 1.6;
      g.beginPath();
      g.moveTo(cx, cy);
      g.lineTo(z1x, z1y);
      g.stroke();
      // Mittelkreuz
      g.strokeStyle = ink;
      g.lineWidth = 1.2;
      g.beginPath();
      const [a0x, a0y] = P(-0.06, 0);
      const [a1x, a1y] = P(0.06, 0);
      const [b0x, b0y] = P(0, -0.06);
      const [b1x, b1y] = P(0, 0.06);
      g.moveTo(a0x, a0y);
      g.lineTo(a1x, a1y);
      g.moveTo(b0x, b0y);
      g.lineTo(b1x, b1y);
      g.stroke();
      // Zahlen
      const fs = Math.max(8.5, G * 0.042);
      const step = Rp < 150 ? 30 : 10;
      for (let d = 0; d < 360; d += step) {
        const c = Math.cos(rad(d));
        const s = Math.sin(rad(d));
        const [x, y] = P((VOLL_R - 0.14) * c, (VOLL_R - 0.14) * s);
        const on = reveal() && okM && okM.reading % 360 === d;
        g.save();
        g.translate(x, y);
        g.rotate(-rad(cp.phi + d - 90));
        text(g, String(d), 0, 0, { font: `${on ? 800 : 600} ${on ? fs * 1.15 : fs}px ${theme.font}`, color: on ? tc : ink });
        g.restore();
      }
      if (okM) {
        const otherDir = dirOf(okM.edge === 'A' ? 'B' : 'A');
        const th = norm(otherDir - cp.phi);
        const [mx, my] = P((VOLL_R - 0.03) * Math.cos(rad(th)), (VOLL_R - 0.03) * Math.sin(rad(th)));
        g.beginPath();
        g.arc(mx, my, 7, 0, Math.PI * 2);
        g.strokeStyle = tc;
        g.lineWidth = 2.5;
        g.stroke();
      }
      drawRotHandle(cp);
    }

    function toolEditable(): boolean {
      return mode() === 'messen' && !ctx.locked && toolVisible() && !placeTw.running;
    }

    /* ---------- Seitenleiste: Messen ---------- */
    /** Winkelarten-Leiste von 0° bis 360° mit Zeiger. */
    function typeBar(x: number, y: number, w: number, reveal = true): void {
      const g = surface.g;
      const theme = ctx.theme;
      const W = wide();
      const h = W ? 10 : 9;
      const X = (d: number) => x + (d / 360) * w;
      const segs: [number, number, AngleType, string][] = [
        [0, 90, 'spitz', ctx.t('barSpitz')],
        [90, 180, 'stumpf', ctx.t('barStumpf')],
        [180, 360, 'ueberstumpf', ctx.t('barUeber')],
      ];
      const cur: AngleType | null = reveal ? angleType(alpha()) : null;
      segs.forEach(([a, b, t, label]) => {
        const on = cur === t;
        g.fillStyle = withAlpha(typeColor(t), on ? 0.95 : 0.35);
        roundRect(g, X(a) + 1, y, X(b) - X(a) - 2, h, h / 2);
        g.fill();
        text(g, label, (X(a) + X(b)) / 2, y + h + (W ? 12 : 11), { font: `${on ? 800 : 600} ${W ? 11.5 : 10.5}px ${theme.font}`, color: on ? typeColor(t) : theme.muted });
      });
      // Marken bei 0°, 90°, 180°, 360°
      for (const [d, t] of [
        [0, 'null'],
        [90, 'recht'],
        [180, 'gestreckt'],
        [360, 'voll'],
      ] as [number, AngleType][]) {
        const on = cur === t;
        const xx = X(d);
        g.strokeStyle = on ? typeColor(t) : withAlpha(theme.text, 0.45);
        g.lineWidth = on ? 3 : 1.5;
        g.beginPath();
        g.moveTo(xx, y - 4);
        g.lineTo(xx, y + h + 4);
        g.stroke();
        text(g, `${d}°`, clamp(xx, x + 8, x + w - 10), y - (W ? 11 : 10), { font: `${on ? 800 : 600} ${W ? 10.5 : 10}px ${theme.font}`, color: on ? typeColor(t) : theme.muted });
      }
      if (!cur) return;
      // Zeiger
      const xa = X(alpha());
      const c = typeColor(cur);
      g.beginPath();
      g.moveTo(xa, y + h / 2 + 1);
      g.lineTo(xa - 6, y - 8);
      g.lineTo(xa + 6, y - 8);
      g.closePath();
      g.fillStyle = c;
      g.fill();
      g.beginPath();
      g.arc(xa, y + h / 2, h * 0.75, 0, Math.PI * 2);
      g.fillStyle = theme.bg;
      g.fill();
      g.strokeStyle = c;
      g.lineWidth = 2.5;
      g.stroke();
      if (mode() === 'messen' && !ctx.locked) hits.push({ id: 'bar', r: { x: x - 6, y: y - 14, w: w + 12, h: h + 22 } });
    }

    interface CheckItem {
      state: 'ok' | 'open' | 'warn' | 'plain';
      label: string;
      font: string;
      color?: string;
    }

    /** Höhe eines Eintrags der Checkliste (für die Kartenhöhe). */
    function checkHeight(it: CheckItem, maxW: number): number {
      const lh = wide() ? 16 : 14.5;
      const rows = wrap(it.label, maxW - 26, it.font);
      return Math.max(20, rows.length * lh + 4);
    }

    /** Eintrag der Checkliste: Häkchen bzw. Nummer, Text oben bündig. */
    function checkRow(x: number, y: number, it: CheckItem, maxW: number, n: number): number {
      const g = surface.g;
      const theme = ctx.theme;
      const lh = wide() ? 16 : 14.5;
      const cy = y + 9;
      if (it.state !== 'plain') {
        const c = it.state === 'ok' ? typeColor('spitz') : it.state === 'warn' ? theme.series[1]! : withAlpha(theme.text, 0.35);
        g.beginPath();
        g.arc(x + 9, cy, 9, 0, Math.PI * 2);
        if (it.state === 'open') {
          g.strokeStyle = c;
          g.lineWidth = 1.6;
          g.stroke();
          text(g, String(n), x + 9, cy + 0.5, { font: `700 10.5px ${theme.font}`, color: theme.muted });
        } else {
          g.fillStyle = c;
          g.fill();
          text(g, it.state === 'ok' ? '✓' : '!', x + 9, cy + 0.5, { font: `800 11px ${theme.font}`, color: onColor() });
        }
      }
      const rows = wrap(it.label, maxW - 26, it.font);
      textRows(rows, x + 26, cy, lh, it.font, it.color ?? (it.state === 'open' ? theme.muted : theme.text));
      return Math.max(20, rows.length * lh + 4);
    }

    function panelMessen(R: Rect): void {
      const g = surface.g;
      const theme = ctx.theme;
      const W = wide();
      const pad = W ? 14 : 10;
      const al = alpha();
      const t = angleType(al);
      const tc = p.show ? typeColor(t) : theme.series[4]!;
      const k = typePop.running ? typePop.value : 1;
      let y = R.y;
      // Karte 1: Winkel und Winkelart
      const h1 = W ? 150 : 104;
      card({ x: R.x, y, w: R.w, h: h1 }, tc, 0.05);
      let yy = y;
      if (W) {
        title(R.x + pad, y + 17, ctx.t('angleTitle'));
        yy += 48;
      } else yy += 20;
      const big = W ? 34 : 24;
      const valTxt = p.show ? `α = ${fmt.num(al, 0)}°` : 'α = ?';
      g.font = `800 ${big}px ${theme.font}`;
      const vw = g.measureText(valTxt).width;
      text(g, valTxt, R.x + pad, yy, { font: `800 ${big}px ${theme.font}`, color: p.show ? tc : theme.muted, align: 'left' });
      typeBar(R.x + pad + 4, y + h1 - (W ? 42 : 34), R.w - 2 * pad - 8, p.show);
      // Winkelart als Etikett (nur, wenn die Größe angezeigt wird)
      const name = p.show ? typeName(t) : '';
      const cf = `800 ${W ? 12.5 : 11.5}px ${theme.font}`;
      g.font = cf;
      const cw = g.measureText(name).width + 18;
      const ch = W ? 24 : 21;
      let cx = R.x + pad + vw + 12;
      let cy = yy - ch / 2;
      if (cx + cw > R.x + R.w - pad) {
        cx = R.x + pad;
        cy = yy + big * 0.55;
      }
      if (name) {
        g.save();
        g.translate(cx + cw / 2, cy + ch / 2);
        g.scale(k, k);
        g.fillStyle = tc;
        roundRect(g, -cw / 2, -ch / 2, cw, ch, ch / 2);
        g.fill();
        text(g, name, 0, 0.5, { font: cf, color: onColor() });
        g.restore();
      }
      y += h1 + (W ? 10 : 7);

      // Karte 2: Messanleitung mit Häkchen
      const tool = toolKind();
      const m = measurement();
      const avail = R.y + R.h - y;
      if (tool === 'kein') {
        const rows = wrap(ctx.t('noTool'), R.w - 2 * pad, `500 12.5px ${theme.font}`);
        const h2 = Math.min(avail, rows.length * 17 + 24);
        card({ x: R.x, y, w: R.w, h: h2 });
        textRows(rows, R.x + pad, y + 12 + 8, 17, `500 12.5px ${theme.font}`, theme.muted);
        y += h2 + 10;
      } else {
        const font = `500 ${W ? 12.5 : 11.5}px ${theme.font}`;
        const bold = `700 ${W ? 13.5 : 12}px ${theme.font}`;
        const atS = m !== null && !(m.ok === false && m.reason === 'notAtS');
        const edge = m !== null && (m.ok || m.reason === 'notUnder');
        const items: CheckItem[] = [
          { state: atS ? 'ok' : 'open', label: ctx.t('step1'), font },
          { state: edge ? 'ok' : 'open', label: ctx.t(tool === 'voll' ? 'step2Voll' : 'step2Geo'), font },
        ];
        if (m && m.ok && !p.show) {
          items.push({ state: 'ok', label: ctx.t(m.scale === 'full' ? 'step3Full' : m.scale === 'outer' ? 'step3Outer' : 'step3Inner'), font });
          if (m.what === 'complement' && al !== 180) items.push({ state: 'plain', label: ctx.t('complementHint'), font: bold });
        } else if (m && m.ok) {
          const res = m.scale === 'full' ? tr('readFull', { v: m.reading }) : tr(m.scale === 'outer' ? 'readOuter' : 'readInner', { v: m.reading });
          items.push({ state: 'ok', label: res, font: bold });
          if (m.what === 'complement' && al !== 180) items.push({ state: 'plain', label: tr('complement', { b: m.reading, a: fmt.num(al, 0) }), font: `800 ${W ? 15 : 13}px ${theme.font}`, color: tc });
        } else if (m && !m.ok && m.reason === 'notUnder') {
          items.push({ state: 'warn', label: ctx.t('notUnder'), font: `600 ${W ? 12 : 11}px ${theme.font}`, color: theme.series[1]! });
        } else items.push({ state: 'open', label: ctx.t('step3'), font });
        const gap = W ? 5 : 2;
        const listH = items.reduce((sum, it) => sum + checkHeight(it, R.w - 2 * pad) + gap, 0);
        const withButton = W && !ctx.locked;
        const h2 = Math.min(avail, (W ? 40 : 10) + listH + (withButton ? 46 : 4));
        card({ x: R.x, y, w: R.w, h: h2 });
        let ry = y + (W ? 10 : 6);
        if (W) {
          title(R.x + pad, ry + 7, ctx.t(tool === 'voll' ? 'howVoll' : 'howGeo'));
          ry += 26;
        }
        items.forEach((it, i) => {
          ry += checkRow(R.x + pad, ry, it, R.w - 2 * pad, i + 1) + gap;
        });
        if (withButton) {
          const ok = m && m.ok;
          button({ x: R.x + pad, y: y + h2 - 42, w: R.w - 2 * pad, h: 30 }, ctx.t(tool === 'voll' ? 'placeVoll' : 'place'), 'place', theme.series[0]!, !ok);
        }
        y += h2 + 10;
      }

      // Karte 3: Merksatz
      if (!W) return;
      const rest = R.y + R.h - y;
      const tipKey = { null: 'tipNull', spitz: 'tipSpitz', recht: 'tipRecht', stumpf: 'tipStumpf', gestreckt: 'tipGestreckt', ueberstumpf: tool === 'voll' ? 'tipUeberVoll' : 'tipUeber', voll: 'tipVoll' }[t];
      const nf = `500 12.5px ${theme.font}`;
      const rows = wrap(ctx.t(tipKey), R.w - 2 * pad, nf);
      if (rest < rows.length * 17 + 36) return;
      card({ x: R.x, y, w: R.w, h: rest });
      title(R.x + pad, y + 17, ctx.t('note'));
      textRows(rows, R.x + pad, y + 38, 17, nf, theme.text);
      const est = wrap(ctx.t('tipEstimate'), R.w - 2 * pad, `500 11.5px ${theme.font}`);
      const ey = y + 38 + rows.length * 17 + 6;
      if (ey + est.length * 15 < y + rest - 6) textRows(est, R.x + pad, ey, 15, `500 11.5px ${theme.font}`, theme.muted);
    }

    /* ---------- Seitenleiste: Schätzspiel ---------- */
    function estSlider(x: number, y: number, w: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const h = 8;
      const X = (d: number) => x + (d / 360) * w;
      for (const [a, b, t] of [
        [0, 90, 'spitz'],
        [90, 180, 'stumpf'],
        [180, 360, 'ueberstumpf'],
      ] as [number, number, AngleType][]) {
        g.fillStyle = withAlpha(typeColor(t), 0.3);
        roundRect(g, X(a) + 1, y - h / 2, X(b) - X(a) - 2, h, h / 2);
        g.fill();
      }
      for (const d of [0, 90, 180, 270, 360]) {
        text(g, `${d}°`, clamp(X(d), x + 8, x + w - 10), y + 15, { font: `600 10px ${theme.font}`, color: theme.muted });
      }
      const xk = X(est);
      const on = hover === 'est' || drag?.kind === 'est';
      g.beginPath();
      g.arc(xk, y, on ? 11 : 9.5, 0, Math.PI * 2);
      g.fillStyle = theme.series[4]!;
      g.fill();
      g.strokeStyle = theme.bg;
      g.lineWidth = 2.5;
      g.stroke();
      if (!answered) hits.push({ id: 'est', r: { x: x - 10, y: y - 14, w: w + 20, h: 28 } });
    }

    /** Kleine Vergleichswinkel (45°, 90°, 180°, 270°) als Schätzhilfe. */
    function refAngles(x: number, y: number, w: number, h: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const list = [45, 90, 180, 270];
      const cw = w / list.length;
      const r = Math.min(cw * 0.3, (h - 16) * 0.42);
      list.forEach((d, i) => {
        const cx = x + cw * (i + 0.5);
        const cy = y + r + 4;
        const c = typeColor(angleType(d));
        g.beginPath();
        g.moveTo(cx, cy);
        g.arc(cx, cy, r * 0.45, 0, -rad(d), true);
        g.closePath();
        g.fillStyle = withAlpha(c, 0.22);
        g.fill();
        g.strokeStyle = theme.text;
        g.lineWidth = 2;
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(cx + r, cy);
        g.lineTo(cx, cy);
        g.lineTo(cx + r * Math.cos(rad(d)), cy - r * Math.sin(rad(d)));
        g.stroke();
        text(g, `${d}°`, cx, y + h - 6, { font: `700 11px ${theme.font}`, color: c });
      });
    }

    function panelSpiel(R: Rect): void {
      const g = surface.g;
      const theme = ctx.theme;
      const W = wide();
      const pad = W ? 14 : 10;
      const pc = theme.series[4]!;
      const isEst = task.kind === 'schaetzen';
      let y = R.y;
      // Karte 1: Aufgabe
      const h1 = W ? 104 : 58;
      card({ x: R.x, y, w: R.w, h: h1 }, pc, 0.05);
      const s = taskPop.running ? Math.max(0.3, taskPop.value) : 1;
      if (W) {
        title(R.x + pad, y + 17, `${tr('task', { n: taskNo })} · ${ctx.t(isEst ? 'kindEst' : 'kindDraw')}`);
        text(g, ctx.t(isEst ? 'qEst' : 'qDraw'), R.x + pad, y + 42, { font: `700 15px ${theme.font}`, color: theme.text, align: 'left' });
        g.save();
        g.translate(R.x + pad, y + 76);
        g.scale(s, s);
        text(g, isEst ? (answered ? `α = ${task.target}°` : 'α = ?') : `${task.target}°`, 0, 0, { font: `800 30px ${theme.font}`, color: isEst && !answered ? theme.muted : pc, align: 'left' });
        g.restore();
      } else {
        text(g, ctx.t(isEst ? 'qEst' : 'qDraw'), R.x + pad, y + 17, { font: `700 13px ${theme.font}`, color: theme.text, align: 'left' });
        text(g, isEst ? (answered ? `α = ${task.target}°` : 'α = ?') : `${task.target}°`, R.x + pad, y + 41, { font: `800 22px ${theme.font}`, color: isEst && !answered ? theme.muted : pc, align: 'left' });
        text(g, `${tr('task', { n: taskNo })} · ${ctx.t(isEst ? 'kindEst' : 'kindDraw')}`, R.x + R.w - pad, y + 17, { font: `600 11px ${theme.font}`, color: theme.muted, align: 'right' });
      }
      y += h1 + (W ? 10 : 7);

      const scoreH = W ? 70 : 24;
      const avail = R.y + R.h - scoreH - (W ? 10 : 6) - y;
      if (!answered) {
        // Karte 2: Eingabe
        const h2 = Math.min(avail, W ? 214 : 122);
        card({ x: R.x, y, w: R.w, h: h2 });
        if (isEst) {
          if (W) title(R.x + pad, y + 17, ctx.t('yourEst'));
          const vy = y + (W ? 46 : 20);
          text(g, `${est}°`, R.x + pad, vy, { font: `800 ${W ? 26 : 20}px ${theme.font}`, color: pc, align: 'left' });
          if (!W) text(g, ctx.t('yourEst'), R.x + pad + 62, vy + 1, { font: `600 11.5px ${theme.font}`, color: theme.muted, align: 'left' });
          const bw = W ? 34 : 32;
          button({ x: R.x + R.w - pad - 2 * bw - 6, y: vy - 14, w: bw, h: 28 }, '−', 'minus', pc);
          button({ x: R.x + R.w - pad - bw, y: vy - 14, w: bw, h: 28 }, '+', 'plus', pc);
          estSlider(R.x + pad + 8, vy + (W ? 36 : 30), R.w - 2 * pad - 16);
          if (W) {
            const top = vy + 64;
            const bottom = y + h2 - 50;
            if (bottom - top > 34) refAngles(R.x + pad, top, R.w - 2 * pad, bottom - top);
          }
        } else {
          const rows = wrap(ctx.t('drawHint'), R.w - 2 * pad, `500 ${W ? 13 : 12}px ${theme.font}`);
          const lh = W ? 18 : 15.5;
          textRows(rows, R.x + pad, y + (W ? 20 : 14), lh, `500 ${W ? 13 : 12}px ${theme.font}`, theme.text);
          // Vergleichswinkel als Schätzhilfe
          const ry = y + (W ? 20 : 14) + rows.length * lh + (W ? 8 : 2);
          const bottom = y + h2 - (W ? 54 : 44);
          if (bottom - ry > 34) refAngles(R.x + pad, ry, R.w - 2 * pad, bottom - ry);
        }
        const bh = W ? 32 : 28;
        button({ x: R.x + pad, y: y + h2 - bh - (W ? 12 : 8), w: R.w - 2 * pad, h: bh }, ctx.t('check'), 'check', pc, true);
      } else {
        // Karte 2: Ergebnis
        const last = history[history.length - 1]!;
        const pts = last.pts;
        const rc = pts === 3 ? typeColor('spitz') : pts === 2 ? theme.series[5]! : pts === 1 ? theme.series[3]! : theme.series[1]!;
        const h2 = Math.min(avail, W ? 200 : 100);
        card({ x: R.x, y, w: R.w, h: h2 }, rc, 0.07);
        const sc = resultPop.running ? Math.max(0.2, resultPop.value) : 1;
        g.save();
        g.translate(R.x + pad, y + (W ? 22 : 15));
        g.scale(sc, sc);
        text(g, `${ctx.t(`p${pts}`)}  ${tr('plus', { p: pts })}`, 0, 0, { font: `800 ${W ? 18 : 14.5}px ${theme.font}`, color: rc, align: 'left' });
        g.restore();
        const rows: [string, string][] = isEst
          ? [
              [ctx.t('actual'), `${task.target}°`],
              [ctx.t('yours'), `${lastAnswer}°`],
              [ctx.t('dev'), `${last.dev}°`],
            ]
          : [
              [ctx.t('wanted'), `${task.target}°`],
              [ctx.t('drawn'), `${lastAnswer}°`],
              [ctx.t('dev'), `${last.dev}°`],
            ];
        if (W) {
          rows.forEach(([a, b], i) => {
            const ry = y + 50 + i * 21;
            text(g, a, R.x + pad, ry, { font: `${i === 2 ? 700 : 500} 13px ${theme.font}`, color: theme.text, align: 'left' });
            text(g, b, R.x + R.w - pad, ry, { font: `800 14px ${theme.font}`, color: i === 2 ? rc : theme.text, align: 'right' });
          });
          const kindOf = tr('isType', { a: task.target, t: typeName(angleType(task.target)) });
          const kr = wrap(kindOf, R.w - 2 * pad, `500 12px ${theme.font}`);
          if (118 + kr.length * 16 <= h2 - 46) textRows(kr, R.x + pad, y + 124, 16, `500 12px ${theme.font}`, theme.muted);
        } else {
          text(g, `${rows[0]![0]} ${rows[0]![1]}  ·  ${rows[1]![0]} ${rows[1]![1]}`, R.x + pad, y + 37, { font: `500 12px ${theme.font}`, color: theme.text, align: 'left' });
          text(g, `${rows[2]![0]}: ${rows[2]![1]}`, R.x + pad, y + 56, { font: `800 13px ${theme.font}`, color: rc, align: 'left' });
        }
        const bh = W ? 32 : 28;
        button({ x: R.x + pad, y: y + h2 - bh - (W ? 12 : 8), w: R.w - 2 * pad, h: bh }, ctx.t(W ? 'next' : 'next'), 'new', pc, true);
      }

      // Punktestand
      const ys = R.y + R.h - scoreH;
      const n = history.length;
      const total = history.reduce((sum, h) => sum + h.pts, 0);
      const avg = n ? history.reduce((sum, h) => sum + h.dev, 0) / n : 0;
      const dots = (x: number, yy: number, w: number) => {
        const cnt = Math.max(1, Math.floor(w / 17));
        const last = history.slice(-cnt);
        for (let i = 0; i < cnt; i++) {
          const h = last[i];
          g.beginPath();
          g.arc(x + 7 + i * 17, yy, h ? 6 : 4, 0, Math.PI * 2);
          g.fillStyle = !h ? withAlpha(theme.text, 0.12) : h.pts === 3 ? typeColor('spitz') : h.pts === 2 ? theme.series[5]! : h.pts === 1 ? theme.series[3]! : theme.series[1]!;
          g.fill();
        }
      };
      if (W) {
        card({ x: R.x, y: ys, w: R.w, h: scoreH });
        text(g, n ? tr(n === 1 ? 'score1' : 'score', { p: total, n }) : ctx.t('scoreEmpty'), R.x + pad, ys + 17, { font: `700 13px ${theme.font}`, color: theme.text, align: 'left' });
        if (n) text(g, tr('avg', { d: fmt.num(avg, 0) }), R.x + pad, ys + 34, { font: `600 11.5px ${theme.font}`, color: theme.muted, align: 'left' });
        dots(R.x + pad, ys + 54, R.w - 2 * pad);
      } else {
        text(g, n ? tr(n === 1 ? 'score1' : 'score', { p: total, n }) : ctx.t('scoreEmpty'), R.x + 2, ys + scoreH / 2, { font: `700 12px ${theme.font}`, color: theme.text, align: 'left' });
        dots(R.x + R.w * 0.55, ys + scoreH / 2, R.w * 0.45 - 2);
      }
    }

    /* ---------- Spielablauf ---------- */
    function nextKind(): TaskKind {
      if (p.task === 'schaetzen' || p.task === 'zeichnen') return p.task;
      return task.kind === 'schaetzen' ? 'zeichnen' : 'schaetzen';
    }

    function newTask(kind?: TaskKind): void {
      task = makeTask(Math.random, kind ?? nextKind(), task.target);
      drawn = startDrawn(task);
      est = 90;
      answered = false;
      taskNo++;
      parkTool();
      taskPop.play();
      updateReadouts();
      ctx.requestRender();
    }

    function check(): void {
      if (answered || mode() !== 'spiel') return;
      answered = true;
      lastAnswer = task.kind === 'schaetzen' ? est : drawn;
      const dev = Math.abs(lastAnswer - task.target);
      history = [...history, { pts: points(dev), dev }].slice(-200);
      resultPop.play();
      // Zum Nachmessen: Geodreieck kommt angeflogen
      pose = { u: 0.9, v: -1.4, phi: 30 };
      attach = null;
      placeTool(true);
      updateReadouts();
      ctx.requestRender();
    }

    /* ---------- Zeiger ---------- */
    function hitAt(px: number, py: number): string | null {
      for (let i = hits.length - 1; i >= 0; i--) {
        const h = hits[i]!;
        if (px >= h.r.x && px <= h.r.x + h.r.w && py >= h.r.y && py <= h.r.y + h.r.h) return h.id;
      }
      const { G } = layout();
      for (const leg of ['B', 'A'] as Leg[]) {
        if (!legEditable(leg)) continue;
        const [hx, hy] = polar(dirOf(leg), G * 0.92);
        if (Math.hypot(px - hx, py - hy) < 20) return `leg${leg}`;
      }
      if (toolEditable()) {
        const cp = currentPose();
        for (const [hu, hv] of rotHandles()) {
          const [rx, ry] = toolToPx(cp, hu, hv);
          if (Math.hypot(px - rx, py - ry) < 18) return 'rot';
        }
        if (inRotZone(px, py)) return 'rot';
        if (insideTool(px, py)) return 'body';
      }
      return null;
    }

    function pointerAngle(px: number, py: number): number {
      const { S } = layout();
      return norm((Math.atan2(-(py - S[1]), px - S[0]) * 180) / Math.PI);
    }

    function setLeg(leg: Leg, px: number, py: number): void {
      const dir = pointerAngle(px, py);
      if (mode() === 'spiel') {
        drawn = dragAngle(drawn, dir - task.a1, 0);
        ctx.requestRender();
        return;
      }
      if (leg === 'B') {
        ctx.set({ alpha: dragAngle(p.alpha, dir - p.a1) });
      } else {
        // [SA drehen, [SB bleibt liegen
        const bDir = norm(p.a1 + p.alpha);
        let newA = Math.round(dir);
        // In der Nähe von 0°, 90°, … einrasten
        for (const m of [0, 90, 180, 270, 360]) if (Math.abs(newA - m) <= 2) newA = m % 360;
        const al = dragAngle(p.alpha, bDir - newA);
        // [SB bleibt liegen, auch wenn der Winkel bei 0° bzw. 360° anschlägt
        ctx.set({ a1: Math.round(norm(bDir - al)) % 360, alpha: al });
      }
    }

    function snapCandidates(): number[] {
      const dA = dirOf('A');
      const dB = dirOf('B');
      return toolKind() === 'voll' ? [dA, dB] : [dA, dB, dA + 180, dB + 180];
    }

    /** Nach dem Loslassen bzw. beim Ziehen: am Scheitel und an Schenkeln einrasten. */
    function settle(): void {
      const { G } = layout();
      if (Math.hypot(pose.u, pose.v) * G < 14) pose = { ...pose, u: 0, v: 0 };
      attach = null;
      if (pose.u === 0 && pose.v === 0) {
        for (const leg of ['A', 'B'] as Leg[]) {
          for (const off of toolKind() === 'voll' ? [0] : [0, 180]) {
            if (dirDiff(pose.phi, dirOf(leg) + off) < 0.5) {
              attach = { leg, off: off as 0 | 180 };
              return;
            }
          }
        }
      }
    }

    surface.addTarget({
      contains: (px: number, py: number) => drag !== null || hitAt(px, py) !== null,
      pointerDown: (q: { px: number; py: number }) => {
        const id = hitAt(q.px, q.py);
        if (!id) return false;
        if (id === 'legA' || id === 'legB') drag = { kind: 'leg', leg: id === 'legA' ? 'A' : 'B' };
        else if (id === 'rot') {
          const cp = currentPose();
          pose = cp;
          attach = null;
          const [cx, cy] = toolToPx(cp, 0, 0);
          const ang = (Math.atan2(-(q.py - cy), q.px - cx) * 180) / Math.PI;
          drag = { kind: 'rotate', off: cp.phi - ang };
        } else if (id === 'body') {
          const cp = currentPose();
          pose = cp;
          attach = null;
          const { S, G } = layout();
          drag = { kind: 'move', du: cp.u - (q.px - S[0]) / G, dv: cp.v + (q.py - S[1]) / G };
        } else if (id === 'bar' || id === 'est') {
          const h = hits.find((x) => x.id === id)!;
          drag = { kind: id, r: h.r };
          moveSlider(q.px);
        } else {
          tap(id);
          return true;
        }
        surface.setCursor('grabbing');
        ctx.requestRender();
        return true;
      },
      pointerMove: (q: { px: number; py: number }) => {
        if (!drag) return;
        if (drag.kind === 'leg') setLeg(drag.leg, q.px, q.py);
        else if (drag.kind === 'move') {
          const { S, G } = layout();
          let u = (q.px - S[0]) / G + drag.du;
          let v = -(q.py - S[1]) / G + drag.dv;
          // Magnet am Scheitel
          if (Math.hypot(u, v) * G < 14) {
            u = 0;
            v = 0;
          }
          pose = { u: clamp(u, -1.2, 1.2), v: clamp(v, -1.2, 1.2), phi: pose.phi };
          updateReadouts();
        } else if (drag.kind === 'rotate') {
          const [cx, cy] = toolToPx(pose, 0, 0);
          let phi = norm((Math.atan2(-(q.py - cy), q.px - cx) * 180) / Math.PI + drag.off);
          // Magnet an den Schenkeln
          for (const c of snapCandidates()) if (dirDiff(phi, c) < 5) phi = norm(c);
          pose = { ...pose, phi };
          updateReadouts();
        } else moveSlider(q.px);
        ctx.requestRender();
      },
      pointerUp: () => {
        if (!drag) return;
        if (drag.kind === 'move' || drag.kind === 'rotate') {
          settle();
          updateReadouts();
        }
        drag = null;
        surface.setCursor('');
        ctx.requestRender();
      },
      hover: (q: { px: number; py: number } | null) => {
        const id = q ? hitAt(q.px, q.py) : null;
        if (id !== hover) {
          hover = id;
          ctx.requestRender();
        }
        surface.setCursor(!id ? '' : id === 'body' ? 'move' : id === 'rot' || id.startsWith('leg') ? 'grab' : 'pointer');
      },
      wheel: () => false,
    });

    function moveSlider(px: number): void {
      if (!drag || (drag.kind !== 'bar' && drag.kind !== 'est')) return;
      const r = drag.r;
      const x0 = r.x + (drag.kind === 'bar' ? 6 : 10);
      const w = r.w - (drag.kind === 'bar' ? 12 : 20);
      const d = Math.round(clamp(((px - x0) / w) * 360, 0, 360));
      if (drag.kind === 'bar') {
        if (!ctx.locked) ctx.set({ alpha: d });
      } else est = d;
      ctx.requestRender();
    }

    function tap(id: string): void {
      if (id === 'place') placeTool(true);
      else if (id === 'check') check();
      else if (id === 'new') newTask();
      else if (id === 'minus') est = clamp(est - 1, 0, 360);
      else if (id === 'plus') est = clamp(est + 1, 0, 360);
      updateReadouts();
      ctx.requestRender();
    }

    /* ---------- Rendern ---------- */
    function render(): void {
      hits = [];
      surface.begin();
      if (placeTw.running === false && attachTo) {
        finishPlace();
        updateReadouts();
      }
      const lay = layout();
      drawScene();
      if (mode() === 'messen') panelMessen(lay.panel);
      else panelSpiel(lay.panel);
      if (placeTw.running || typePop.running || resultPop.running || taskPop.running) ctx.requestRender();
    }

    // Anfangszustand: richtig angelegt
    placeTool(false);

    return {
      update(changed, source) {
        const t = angleType(alpha());
        if (t !== lastType && source !== 'init') typePop.play();
        lastType = t;
        if (changed.has('tool') || source === 'replace') {
          if (toolKind() !== 'kein') placeTool(source !== 'init' && changed.has('tool'));
        }
        if ((changed.has('task') || (changed.has('mode') && mode() === 'spiel')) && source !== 'init') {
          newTask(p.task === 'zeichnen' ? 'zeichnen' : 'schaetzen');
          return;
        }
        if (changed.has('mode') && mode() === 'messen' && source !== 'init') placeTool(false);
        updateReadouts();
      },

      action(id) {
        if (id === 'place') placeTool(true);
        else if (id === 'random' && !ctx.locked) {
          const r = Math.random;
          const al = [Math.round(15 + r() * 70), Math.round(95 + r() * 80), Math.round(185 + r() * 160)][Math.floor(r() * 3)]!;
          parkTool();
          ctx.set({ alpha: al, a1: Math.floor(r() * 72) * 5, show: false });
        } else if (id === 'check') check();
        else if (id === 'new') newTask();
        updateReadouts();
        ctx.requestRender();
      },

      render,
      destroy: () => surface.destroy(),
    };
  },
});
