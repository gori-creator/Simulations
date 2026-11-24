import { defineSimulation, ease, mesh3d, mixColor, prefersReducedMotion, roundRect, seededRandom, Surface, vec3, View3D, type Vec3 } from '../../../sim-core';
import {
  checkCuboid,
  convertVolume,
  cubeCell,
  cuboidTask,
  fillPlan,
  planDuration,
  stageCount,
  stageOf,
  surfaceArea,
  volume,
  type CuboidTask,
  type DropItem,
  type Stage,
  type UnitId,
} from './model';

const L = (de: string, en: string) => ({ de, en });
const MAX = 10;
/** Richtungen der sechs Würfelflächen: Normale und Nachbarzelle (Spalte, Reihe, Schicht). */
const FACES: { n: Vec3; d: [number, number, number] }[] = [
  { n: [1, 0, 0], d: [0, -1, 0] }, // vorn (+x₁): Reihe davor
  { n: [-1, 0, 0], d: [0, 1, 0] },
  { n: [0, 1, 0], d: [1, 0, 0] }, // rechts (+x₂)
  { n: [0, -1, 0], d: [-1, 0, 0] },
  { n: [0, 0, 1], d: [0, 0, 1] }, // oben
  { n: [0, 0, -1], d: [0, 0, -1] },
];

/** Ecken einer Würfelfläche (Einheitswürfel mit Ecke p) in Richtung der Normalen n. */
function cubeFace(p: Vec3, n: Vec3): Vec3[] {
  const [x, y, z] = p;
  if (n[0] !== 0) {
    const X = n[0] > 0 ? x + 1 : x;
    return [
      [X, y, z],
      [X, y + 1, z],
      [X, y + 1, z + 1],
      [X, y, z + 1],
    ];
  }
  if (n[1] !== 0) {
    const Y = n[1] > 0 ? y + 1 : y;
    return [
      [x, Y, z],
      [x + 1, Y, z],
      [x + 1, Y, z + 1],
      [x, Y, z + 1],
    ];
  }
  const Z = n[2] > 0 ? z + 1 : z;
  return [
    [x, y, Z],
    [x + 1, y, Z],
    [x + 1, y + 1, Z],
    [x, y + 1, Z],
  ];
}

/**
 * Volumen von Quadern: Einheitswürfel füllen den Quader Reihe für Reihe und
 * Schicht für Schicht. Zählhilfe V = a · b · c, Einheiten cm³, dm³ (Liter) und m³.
 */
export default defineSimulation({
  id: 'quader-volumen',
  dragHint: true,
  layout: { aspect: 1.6, aspectNarrow: 0.82 },
  images: { wood: 'holz.webp' },
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Thema', 'Topic'),
      options: [
        { value: 'fill', label: L('Volumen: mit Würfeln füllen', 'Volume: filling with cubes') },
        { value: 'surface', label: L('Oberfläche und Netz', 'Surface area and net') },
        { value: 'quiz', label: L('Üben', 'Practice') },
      ],
      default: 'fill',
    },
    { key: 'q', type: 'number', label: L('Aufgabe Nr.', 'Task no.'), min: 1, max: 999, step: 1, default: 1, visibleIf: (v) => v.mode === 'quiz' },
    { key: 'ans', type: 'text', label: L('Deine Antwort', 'Your answer'), default: '', maxLength: 16, placeholder: L('z. B. 60', 'e.g. 60'), visibleIf: (v) => v.mode === 'quiz' },
    { key: 'a', type: 'number', label: L('Länge a', 'Length a'), min: 1, max: MAX, step: 1, default: 5, visibleIf: (v) => v.mode !== 'quiz' },
    { key: 'b', type: 'number', label: L('Breite b', 'Width b'), min: 1, max: MAX, step: 1, default: 3, visibleIf: (v) => v.mode !== 'quiz' },
    { key: 'c', type: 'number', label: L('Höhe c', 'Height c'), min: 1, max: MAX, step: 1, default: 4, visibleIf: (v) => v.mode !== 'quiz' },
    {
      key: 'unit',
      type: 'choice',
      label: L('Einheit', 'Unit'),
      options: [
        { value: 'cm', label: L('cm', 'cm') },
        { value: 'dm', label: L('dm', 'dm') },
        { value: 'm', label: L('m', 'm') },
      ],
      default: 'cm',
      visibleIf: (v) => v.mode !== 'quiz',
    },
    {
      key: 'fill',
      type: 'choice',
      label: L('Füllstand', 'Fill level'),
      options: [
        { value: 'leer', label: L('leer', 'empty') },
        { value: 'reihe', label: L('1 Reihe', '1 row') },
        { value: 'schicht', label: L('1 Schicht', '1 layer') },
        { value: 'voll', label: L('voll', 'full') },
      ],
      default: 'schicht',
      visibleIf: (v) => v.mode === 'fill',
    },
    { key: 'count', type: 'boolean', group: 'view', label: L('Zählhilfe', 'Counting aid'), default: true },
    { key: 'dims', type: 'boolean', group: 'view', label: L('Kantenlängen', 'Edge lengths'), default: true },
  ],
  hint: (v) => {
    if (v.mode === 'quiz') return L('Tipp: Rechne mit Stift und Papier, trag das Ergebnis unter „Deine Antwort“ ein und tippe auf „Prüfen“.', 'Tip: Work it out with pen and paper, enter the result under “Your answer” and tap “Check”.');
    return L('Tipp: Dreh den Quader mit einem Finger, um ihn von allen Seiten zu sehen.', 'Tip: Rotate the cuboid with one finger to see it from all sides.');
  },
  actions: [
    { id: 'fill', label: L('Füllen', 'Fill'), primary: true, visibleIf: (v) => v.mode === 'fill' },
    { id: 'check', label: L('Prüfen', 'Check'), primary: true, visibleIf: (v) => v.mode === 'quiz' },
    { id: 'newq', label: L('Neue Aufgabe', 'New task'), visibleIf: (v) => v.mode === 'quiz' },
  ],
  readouts: [
    { key: 'task', label: L('Aufgabe', 'Task') },
    { key: 'verdict', label: L('Rückmeldung', 'Feedback') },
    { key: 'surface', label: L('Oberfläche', 'Surface area'), spoiler: true },
    { key: 'count', label: L('Eingefüllt', 'Filled in'), spoiler: true },
    { key: 'volume', label: L('Volumen', 'Volume'), spoiler: true },
    { key: 'units', label: L('In anderen Einheiten', 'In other units'), spoiler: true },
  ],
  resultsParam: 'count',
  presets: [
    { id: 'start', label: L('Quader 5 × 3 × 4', 'Cuboid 5 × 3 × 4'), values: {} },
    { id: 'cube', label: L('Würfel 3 × 3 × 3', 'Cube 3 × 3 × 3'), values: { a: 3, b: 3, c: 3, fill: 'voll' } },
    { id: 'flat', label: L('Nur eine Schicht', 'Just one layer'), values: { a: 8, b: 5, c: 1, fill: 'voll' } },
    { id: 'tower', label: L('Hoher Turm', 'Tall tower'), values: { a: 2, b: 2, c: 9, fill: 'reihe' } },
    { id: 'litre', label: L('1 Liter = 1000 cm³', '1 litre = 1000 cm³'), values: { a: 10, b: 10, c: 10, fill: 'voll' } },
    { id: 'tank', label: L('Aquarium in dm', 'Fish tank in dm'), values: { a: 6, b: 3, c: 4, unit: 'dm', fill: 'leer' } },
    { id: 'surface', label: L('Oberfläche und Netz', 'Surface area and net'), values: { mode: 'surface' } },
    { id: 'quiz', label: L('Üben', 'Practice'), values: { mode: 'quiz', q: 1, ans: '' } },
  ],
  strings: {
    de: {
      canvas: 'Quader aus Glas, der mit Einheitswürfeln gefüllt wird; die Ansicht lässt sich drehen',
      cubes: 'Würfel',
      cube1: 'Würfel',
      row: '1 Reihe: {a} Würfel',
      layer: '1 Schicht: {b} Reihen · {a} = {ab} Würfel',
      layers: '{c} Schichten · {ab} = {abc} Würfel',
      layerSingle: 'nur 1 Schicht: {abc} Würfel',
      question: 'Wie viele Würfel passen hinein?',
      unitCube: 'Einheitswürfel',
      refill: 'Neu füllen',
      fill: 'Füllen',
      countText: '{n} Einheitswürfel',
      countText1: '1 Einheitswürfel',
      stage_leer: 'leer',
      stage_reihe: '1 Reihe',
      stage_schicht: '1 Schicht',
      stage_voll: 'voll',
      litre: 'Liter',
      litre1: 'Liter',
      net: 'Netz des Quaders',
      faceAB: 'oben/unten',
      faceAC: 'vorn/hinten',
      faceBC: 'links/rechts',
      surfText: 'O = 2 · ({ab} + {ac} + {bc}) = {o} {u}²',
      qV: 'Aufgabe {q}: Ein Quader ist {a} {u} lang, {b} {u} breit und {c} {u} hoch. Berechne das Volumen in {u}³.',
      qO: 'Aufgabe {q}: Ein Quader ist {a} {u} lang, {b} {u} breit und {c} {u} hoch. Berechne die Oberfläche in {u}².',
      qEdge: 'Aufgabe {q}: Ein Quader hat das Volumen {v} {u}³. Er ist {a} {u} lang und {b} {u} breit. Wie hoch ist er (in {u})?',
      qLitre: 'Aufgabe {q}: Ein Becken ist {a} {u} lang, {b} {u} breit und {c} {u} tief. Wie viele Liter passen hinein?',
      okMsg: 'Richtig! {calc}',
      hV: 'V = a · b · c',
      hO: 'O = 2 · (a · b + a · c + b · c) – sechs Flächen, je zwei gleich groß.',
      hEdge: 'c = V : (a · b)',
      hLitre: '1 dm³ = 1 Liter, 1 m³ = 1000 Liter.',
      noMsg: 'Noch nicht. Tipp: {hint}',
      emptyMsg: 'Trag dein Ergebnis unter „Deine Antwort“ ein und tippe auf „Prüfen“.',
      wait: 'Deine Antwort fehlt noch.',
    },
    en: {
      canvas: 'Glass cuboid being filled with unit cubes; the view can be rotated',
      cubes: 'cubes',
      cube1: 'cube',
      row: '1 row: {a} cubes',
      layer: '1 layer: {b} rows · {a} = {ab} cubes',
      layers: '{c} layers · {ab} = {abc} cubes',
      layerSingle: 'just 1 layer: {abc} cubes',
      question: 'How many cubes fit inside?',
      unitCube: 'unit cube',
      refill: 'Fill again',
      fill: 'Fill',
      countText: '{n} unit cubes',
      countText1: '1 unit cube',
      stage_leer: 'empty',
      stage_reihe: '1 row',
      stage_schicht: '1 layer',
      stage_voll: 'full',
      litre: 'litres',
      litre1: 'litre',
      net: 'Net of the cuboid',
      faceAB: 'top/bottom',
      faceAC: 'front/back',
      faceBC: 'left/right',
      surfText: 'S = 2 · ({ab} + {ac} + {bc}) = {o} {u}²',
      qV: 'Task {q}: A cuboid is {a} {u} long, {b} {u} wide and {c} {u} high. Calculate its volume in {u}³.',
      qO: 'Task {q}: A cuboid is {a} {u} long, {b} {u} wide and {c} {u} high. Calculate its surface area in {u}².',
      qEdge: 'Task {q}: A cuboid has a volume of {v} {u}³. It is {a} {u} long and {b} {u} wide. How high is it (in {u})?',
      qLitre: 'Task {q}: A tank is {a} {u} long, {b} {u} wide and {c} {u} deep. How many litres does it hold?',
      okMsg: 'Correct! {calc}',
      hV: 'V = a · b · c',
      hO: 'S = 2 · (a · b + a · c + b · c) – six faces, two of each size.',
      hEdge: 'c = V : (a · b)',
      hLitre: '1 dm³ = 1 litre, 1 m³ = 1000 litres.',
      noMsg: 'Not yet. Tip: {hint}',
      emptyMsg: 'Enter your result under “Your answer” and tap “Check”.',
      wait: 'Your answer is still missing.',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    /** Ganze Zahlen ab 10 000 mit schmalem Leerzeichen gruppieren. */
    const big = (v: number, d = 3) => {
      const s = fmt.num(v, d);
      return Math.abs(v) >= 10000 && Number.isInteger(v) ? s.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : s;
    };

    // Üben: Maße der Aufgabe
    let task: CuboidTask = cuboidTask(1, seededRandom(1));
    let taskState: { ok: boolean; got: number | null } | null = null;
    const quiz = () => p.mode === 'quiz';
    const solved = () => taskState?.ok === true;
    const A = () => (quiz() ? task.a : p.a);
    const B = () => (quiz() ? task.b : p.b);
    const C = () => (quiz() ? task.c : p.c);
    const view: View3D = new View3D(surface, { azimuth: 32, elevation: 28, elevationLimits: [-10, 85] });

    /** Fertig eingefüllte Würfel (ohne laufende Animation). */
    let count = stageCount(p.fill as Stage, A(), B(), C());
    let anim: { items: DropItem[]; start: number; from: number; to: number; duration: number } | null = null;
    let lastHandle = -Infinity;
    // weich nachgeführter Bildausschnitt
    let frame: { target: Vec3; radius: number } | null = null;
    let lastTime = performance.now();

    const total = () => volume(A(), B(), C());
    const unit = () => (quiz() ? task.unit : (p.unit as UnitId));

    /* ---------- Griffe: Kanten direkt ziehen ---------- */
    const editable = () => !ctx.locked && !quiz();
    const grab = () => (lastHandle = performance.now());
    view.addHandle({
      get: () => [B(), A(), 0],
      set: (q) => {
        grab();
        ctx.set({ a: Math.max(1, Math.min(MAX, Math.round(q[1]))) });
      },
      axis: [0, 1, 0],
      enabled: editable,
      color: () => ctx.theme.series[3]!,
    });
    view.addHandle({
      get: () => [B(), 0, 0],
      set: (q) => {
        grab();
        ctx.set({ b: Math.max(1, Math.min(MAX, Math.round(q[0]))) });
      },
      axis: [1, 0, 0],
      enabled: editable,
      color: () => ctx.theme.series[3]!,
    });
    view.addHandle({
      get: () => [B(), A(), C()],
      set: (q) => {
        grab();
        ctx.set({ c: Math.max(1, Math.min(MAX, Math.round(q[2]))) });
      },
      axis: [0, 0, 1],
      enabled: editable,
      color: () => ctx.theme.series[3]!,
    });

    /* ---------- Animation ---------- */

    function animateTo(to: number, from = currentCount()): void {
      const reduced = prefersReducedMotion();
      if (reduced || to === from) {
        anim = null;
        count = to;
        syncStage();
        return;
      }
      if (to > from) {
        const items = fillPlan(A(), B(), C(), from, to);
        anim = { items, start: performance.now(), from, to, duration: planDuration(items) };
      } else {
        // Würfel heben sich ab und verschwinden
        anim = { items: [{ from: to, to: from, kind: 'layer', start: 0, duration: 0.45 }], start: performance.now(), from, to, duration: 0.45 };
      }
      count = Math.min(from, to);
      ctx.requestRender();
    }

    /** Wie viele Würfel sitzen gerade fest an ihrem Platz? */
    function currentCount(): number {
      if (!anim) return count;
      if (anim.to < anim.from) return anim.to;
      const t = (performance.now() - anim.start) / 1000;
      let n = anim.from;
      for (const item of anim.items) if (t >= item.start + item.duration) n = Math.max(n, item.to);
      return n;
    }

    /**
     * Füllstand-Regler an die eingefüllten Würfel anpassen. Während einer
     * Animation nur nach oben (sonst spränge die Auswahl zurück).
     */
    function syncStage(): void {
      const stage = stageOf(currentCount(), A(), B(), C());
      const upward = stage && stageCount(stage, A(), B(), C()) > stageCount(p.fill as Stage, A(), B(), C());
      if (stage && stage !== p.fill && (!anim || upward)) ctx.set({ fill: stage });
      ctx.setAction('fill', { label: ctx.t(currentCount() >= total() && !anim ? 'refill' : 'fill') });
    }

    /* ---------- Ergebnisse ---------- */

    function updateReadouts(): void {
      for (const k of ['task', 'verdict', 'surface']) ctx.readout(k, null);
      if (quiz()) {
        for (const k of ['count', 'volume', 'units']) ctx.readout(k, null);
        ctx.readout('task', taskText());
        const fb = feedback();
        ctx.readout('verdict', fb ? fb.text : ctx.t('emptyMsg'));
        return;
      }
      if (p.mode === 'surface') {
        const a = A(), b = B(), c = C();
        ctx.readout('surface', tr('surfText', { ab: a * b, ac: a * c, bc: b * c, o: big(surfaceArea(a, b, c)), u: unit() }));
        ctx.readout('count', null);
      }
      const u = unit();
      const n = currentCount();
      const stage = stageOf(n, A(), B(), C());
      ctx.readout('count', `${tr(n === 1 ? 'countText1' : 'countText', { n })}${stage ? ` (${ctx.t(`stage_${stage}`)})` : ''}`);
      const v = (x: string) => `<var>${x}</var>`;
      const V = total();
      ctx.readout('volume', {
        html: `${v('V')} = ${v('a')} · ${v('b')} · ${v('c')} = ${A()}&nbsp;${u} · ${B()}&nbsp;${u} · ${C()}&nbsp;${u} = <strong>${big(V)}&nbsp;${u}³</strong>`,
      });
      const c = convertVolume(V, u);
      // Einzahl nur bei genau 1 (EN „1 litre“, aber „0.5 litres“)
      const l = ctx.t(c.l === 1 ? 'litre1' : 'litre');
      const parts =
        u === 'cm'
          ? [`${big(V)} cm³`, `${big(c.dm3)} dm³`, `${big(c.l)} ${l}`, `${big(c.ml)} ml`]
          : u === 'dm'
            ? [`${big(V)} dm³`, `${big(c.l)} ${l}`, `${big(c.cm3)} cm³`, `${big(c.m3)} m³`]
            : [`${big(V)} m³`, `${big(c.dm3)} dm³`, `${big(c.l)} ${l}`];
      ctx.readout('units', parts.join(' = '));
    }

    /* ---------- Zeichnen ---------- */

    /**
     * Holzmaserung: Der Einheitswürfel ist naturbelassen, die gezählten Würfel
     * bleiben bunt (Foto mit der Würfelfarbe multipliziert). Ohne Foto einfarbig.
     */
    function woodTexture(painted = true) {
      const image = ctx.images.get('wood');
      if (!image) return undefined;
      return painted ? { image, size: 4, alpha: 0.3, blend: 'multiply' as const } : { image, size: 4 };
    }

    function cubeColor(k: number): string {
      const s = ctx.theme.series;
      const ab = A() * B();
      let color: string;
      if (k < A()) color = s[3]!;
      else if (k < ab) color = s[0]!;
      else color = Math.floor(k / ab) % 2 === 1 ? s[5]! : s[0]!;
      return ctx.theme.dark ? color : mixColor(color, '#ffffff', 0.18);
    }

    function render(): void {
      const now = performance.now();
      const dt = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;
      const a = A(), b = B(), c = C();
      const theme = ctx.theme;
      const u = unit();
      const narrow = surface.width < 560;

      // laufende Animation: Stand bestimmen, Füllstand mitführen
      let t = 0;
      if (anim) {
        t = (now - anim.start) / 1000;
        if (t >= anim.duration) {
          count = anim.to;
          anim = null;
          syncStage();
          updateReadouts();
        } else {
          syncStage();
          updateReadouts();
        }
      }

      // Bildausschnitt (beim Ziehen an den Kanten eingefroren, sonst weich nachgeführt)
      const goal = { target: [b / 2, (a - 2.6) / 2, c / 2.1] as Vec3, radius: 0.5 * Math.hypot(a + 2.6, b, c) * (narrow ? 1.05 : 1.0) + 0.6 };
      if (!frame) frame = goal;
      let moving = false;
      if (now - lastHandle <= 350) moving = true;
      // reduzierte Bewegung: Bildausschnitt springt sofort
      else if (prefersReducedMotion()) frame = goal;
      else {
        const k = 1 - Math.exp(-dt / 0.18);
        const next = { target: vec3.lerp(frame.target, goal.target, k), radius: frame.radius + (goal.radius - frame.radius) * k };
        moving = vec3.distance(next.target, goal.target) > 0.01 || Math.abs(next.radius - goal.radius) > 0.01;
        frame = moving ? next : goal;
      }
      const surfaceMode = p.mode === 'surface';
      const anchor: [number, number] = surfaceMode ? (narrow ? [0.5, 0.36] : [0.32, 0.56]) : quiz() ? (narrow ? [0.5, 0.6] : [0.62, 0.56]) : [narrow ? 0.5 : 0.56, narrow ? 0.6 : 0.54];
      view.setScene({ target: frame.target, radius: frame.radius * (surfaceMode && narrow ? 1.25 : surfaceMode ? 1.1 : 1), anchor });

      view.begin();
      const cam = view.camera.position;
      const facing = (n: Vec3, pt: Vec3) => vec3.dot(n, vec3.sub(cam, pt)) > 0;

      // Boden
      view.grid({ min: [-2, -4], max: [b + 2, a + 2], step: 1, color: theme.gridMinor, fade: true });
      view.shadow(
        [
          [0, 0, 0],
          [b, 0, 0],
          [b, a, 0],
          [0, a, 0],
        ],
        { alpha: 0.16, blur: 20, spread: 1.04 },
      );

      // Glaswände: hintere Wände mit Einheitenraster hinter allem, vordere Wände darüber
      const box = mesh3d.box([0, 0, 0], [b, a, c]);
      const glass = theme.dark ? mixColor(theme.series[0]!, theme.bg, 0.55) : mixColor(theme.series[0]!, '#ffffff', 0.6);
      const glassEdge = mixColor(theme.series[0]!, theme.dark ? '#ffffff' : '#0b1220', theme.dark ? 0.25 : 0.35);
      const frontWalls: Vec3[][] = [];
      for (const face of box.faces) {
        const pts = face.map((i) => box.vertices[i]!);
        const n = vec3.normal(pts);
        const center = vec3.centroid(pts);
        if (facing(n, center)) {
          frontWalls.push(pts);
          continue;
        }
        view.face(pts, { color: glass, alpha: theme.dark ? 0.35 : 0.45, flat: true, layer: 'back' });
        drawWallGrid(pts, n);
      }

      // Würfel (nur beim Füllen)
      if (p.mode === 'fill') drawCubes(t);

      if (surfaceMode) drawColoredFaces(frontWalls);
      else for (const pts of frontWalls) view.face(pts, { color: glass, alpha: 0.1, flat: true, layer: 'front' });
      drawBoxEdges(glassEdge);
      if (p.dims || quiz()) drawDimensions(u);
      if (p.mode === 'fill') drawUnitCube(u);
      view.end();
      if (surfaceMode) drawNet(u, narrow);
      else if (quiz()) drawTaskCard(narrow);
      else if (p.count) drawCard(u, narrow);
      if (anim || moving) ctx.requestRender();
    }

    /** Einheitenraster auf einer (hinteren) Glaswand bzw. dem Boden. */
    function drawWallGrid(pts: Vec3[], n: Vec3): void {
      const a = A(), b = B(), c = C();
      const color = mixColor(ctx.theme.series[0]!, ctx.theme.bg, 0.45);
      const lines: [Vec3, Vec3][] = [];
      const x = pts[0]![0];
      const y = pts[0]![1];
      const z = pts[0]![2];
      if (n[2] !== 0) {
        for (let i = 1; i < b; i++) lines.push([[i, 0, z], [i, a, z]]);
        for (let j = 1; j < a; j++) lines.push([[0, j, z], [b, j, z]]);
      } else if (n[0] !== 0) {
        for (let j = 1; j < a; j++) lines.push([[x, j, 0], [x, j, c]]);
        for (let k = 1; k < c; k++) lines.push([[x, 0, k], [x, a, k]]);
      } else {
        for (let i = 1; i < b; i++) lines.push([[i, y, 0], [i, y, c]]);
        for (let k = 1; k < c; k++) lines.push([[0, y, k], [b, y, k]]);
      }
      for (const [p0, p1] of lines) view.segment(p0, p1, { color, width: 1, alpha: 0.7, layer: 'back' });
    }

    function drawBoxEdges(color: string): void {
      // alle zwölf Kanten des Glaskastens: hintere dünn (hinter den Würfeln), vordere kräftig
      const a = A(), b = B(), c = C();
      const cam = view.camera.position;
      const box = mesh3d.box([0, 0, 0], [b, a, c]);
      const center: Vec3 = [b / 2, a / 2, c / 2];
      const front = box.faces.map((face) => {
        const pts = face.map((i) => box.vertices[i]!);
        const fc = vec3.centroid(pts);
        return vec3.dot(vec3.sub(fc, center), vec3.sub(cam, fc)) > 0;
      });
      const edges = new Map<string, number[]>();
      box.faces.forEach((face, f) => {
        for (let i = 0; i < 4; i++) {
          const x = face[i]!;
          const y = face[(i + 1) % 4]!;
          const key = x < y ? `${x}-${y}` : `${y}-${x}`;
          edges.set(key, [...(edges.get(key) ?? []), f]);
        }
      });
      for (const [key, fs] of edges) {
        const [i, j] = key.split('-').map(Number) as [number, number];
        const visible = fs.some((f) => front[f]);
        view.segment(box.vertices[i]!, box.vertices[j]!, visible ? { color, width: 2, layer: 'front' } : { color, width: 1.2, alpha: 0.6, layer: 'back' });
      }
    }

    function drawCubes(t: number): void {
      const a = A(), b = B(), c = C();
      const n = a * b * c;
      const cam = view.camera.position;
      // Gruppe je Würfel: 0 = fest, i + 1 = fällt mit Abschnitt i, −1 = nicht da
      const group = new Int16Array(n).fill(-1);
      const offset = new Float32Array(n);
      const alpha = new Float32Array(n).fill(1);
      const settled = anim ? Math.min(anim.from, anim.to) : count;
      for (let k = 0; k < Math.min(settled, n); k++) group[k] = 0;
      if (anim) {
        anim.items.forEach((item, i) => {
          const q = Math.max(0, Math.min(1, (t - item.start) / item.duration));
          if (anim!.to > anim!.from && q <= 0) return;
          for (let k = item.from; k < Math.min(item.to, n); k++) {
            if (anim!.to > anim!.from) {
              group[k] = q >= 1 ? 0 : i + 1;
              offset[k] = (1 - ease.outCubic(q)) * (item.kind === 'cube' ? 2.2 : 1.8);
              alpha[k] = Math.min(1, q * 3.5);
            } else {
              group[k] = 1;
              offset[k] = ease.inCubic(q) * 1.6;
              alpha[k] = 1 - q;
            }
          }
        });
      }
      const wood = woodTexture();
      const index = (col: number, row: number, layer: number) => (col < 0 || row < 0 || layer < 0 || col >= a || row >= b || layer >= c ? -1 : layer * a * b + row * a + col);
      for (let k = 0; k < n; k++) {
        const g = group[k]!;
        if (g < 0 || alpha[k]! <= 0.01) continue;
        const { col, row, layer } = cubeCell(k, a, b);
        const corner: Vec3 = [b - 1 - row, col, layer + offset[k]!];
        const color = cubeColor(k);
        const stroke = mixColor(color, ctx.theme.dark ? '#000000' : '#0b1220', ctx.theme.dark ? 0.5 : 0.42);
        for (const { n: normal, d } of FACES) {
          const nb = index(col + d[0], row + d[1], layer + d[2]);
          if (nb >= 0 && group[nb] === g && offset[nb] === offset[k]) continue;
          const pts = cubeFace(corner, normal);
          const center = vec3.centroid(pts);
          if (vec3.dot(normal, vec3.sub(cam, center)) <= 0) continue;
          view.face(pts, { color, alpha: alpha[k]!, stroke, width: 1, gloss: 0.12, texture: wood });
        }
      }
    }

    /** Kantenlängen mit Teilstrichen an den drei sichtbaren Kanten. */
    function drawDimensions(u: string): void {
      const a = A(), b = B(), c = C();
      const th = ctx.theme;
      const center = view.toPx([b / 2, a / 2, c / 2]);
      const edge = (from: Vec3, to: Vec3, steps: number, text: string) => {
        const [ax, ay] = view.toPx(from);
        const [bx, by] = view.toPx(to);
        const mx = (ax + bx) / 2;
        const my = (ay + by) / 2;
        let dx = mx - center[0];
        let dy = my - center[1];
        const len = Math.hypot(dx, dy) || 1;
        dx /= len;
        dy /= len;
        // Teilstriche nach außen
        for (let i = 0; i <= steps; i++) {
          const q = vec3.lerp(from, to, i / steps);
          view.custom(
            q,
            (g) => {
              const [x, y] = view.toPx(q);
              g.strokeStyle = th.muted;
              g.lineWidth = 1.4;
              g.beginPath();
              g.moveTo(x + dx * 3, y + dy * 3);
              g.lineTo(x + dx * 9, y + dy * 9);
              g.stroke();
            },
            'front',
          );
        }
        const along = Math.abs((bx - ax) * dy - (by - ay) * dx) / (Math.hypot(bx - ax, by - ay) || 1);
        const dist = 22 + (1 - along) * 26;
        view.label(vec3.lerp(from, to, 0.5), text, { color: th.text, size: 13, weight: '700', align: 'center', baseline: 'middle', offset: [dx * dist, dy * dist] });
      };
      edge([b, 0, 0], [b, a, 0], a, `a = ${a} ${u}`);
      edge([b, a, 0], [0, a, 0], b, `b = ${b} ${u}`);
      // Höhe an der hinteren rechten Kante (rechter Umriss), damit die Zahl neben dem Quader steht
      edge([0, a, 0], [0, a, c], c, quiz() && task.kind === 'edge' && !solved() ? `c = ? ${u}` : `c = ${c} ${u}`);
    }

    /** Einheitswürfel zum Vergleich links neben dem Quader. */
    function drawUnitCube(u: string): void {
      const th = ctx.theme;
      const x1 = B() - 1;
      const x2 = -2.3;
      const cube = mesh3d.box([x1, x2, 0], [x1 + 1, x2 + 1, 1]);
      const color = th.dark ? th.series[3]! : mixColor(th.series[3]!, '#ffffff', 0.18);
      view.mesh(cube, { color, texture: woodTexture(false), edgeColor: mixColor(color, th.dark ? '#000000' : '#0b1220', 0.45), edgeWidth: 1.4 });
      view.label([x1, x2 + 0.5, 1], `1 ${u}³`, { color: th.text, size: 13, weight: '700', align: 'center', baseline: 'bottom', offset: [0, -9] });
      view.label([x1 + 1, x2 + 0.5, 0], `1 ${u}`, { color: th.muted, size: 11, weight: '600', align: 'center', baseline: 'top', offset: [0, 8] });
    }

    /** Farbe der Flächenpaare: oben/unten, vorn/hinten, links/rechts. */
    function pairColor(n: Vec3): string {
      const th = ctx.theme;
      if (Math.abs(n[2]) > 0.5) return th.series[0]!;
      if (Math.abs(n[0]) > 0.5) return th.series[3]!;
      return th.series[5]!;
    }

    function drawColoredFaces(front: Vec3[][]): void {
      const th = ctx.theme;
      const a = A(), b = B(), c = C();
      for (const pts of front) {
        const n = vec3.normal(pts);
        view.face(pts, { color: pairColor(n), alpha: th.dark ? 0.7 : 0.6, flat: true, layer: 'front' });
        const area = Math.abs(n[2]) > 0.5 ? a * b : Math.abs(n[0]) > 0.5 ? a * c : b * c;
        view.label(vec3.centroid(pts), `${area} ${unit()}²`, { color: th.text, size: 13, weight: '800', align: 'center', baseline: 'middle' });
      }
    }

    /** Aufgeklapptes Netz: Kreuzform mit allen sechs Flächen. */
    function drawNet(u: string, narrow: boolean): void {
      const th = ctx.theme;
      const g = surface.g;
      const a = A(), b = B(), c = C();
      const W = surface.width;
      const H = surface.height;
      // rechts bzw. unten, frei von den Zoom-Knöpfen (oben rechts) und dem Hinweis „Zum Drehen ziehen“ (unten links)
      const box = narrow ? { x: 10, y: H * 0.6, w: W - 20, h: H * 0.4 - 40 } : { x: W * 0.56, y: 14, w: W * 0.44 - 72, h: H - 28 };
      g.save();
      g.fillStyle = th.dark ? 'rgba(15,20,30,0.84)' : 'rgba(255,255,255,0.9)';
      roundRect(g, box.x, box.y, box.w, box.h, 12);
      g.fill();
      g.textAlign = 'center';
      g.textBaseline = 'alphabetic';
      g.fillStyle = th.text;
      g.font = `700 13px ${th.font}`;
      g.fillText(ctx.t('net'), box.x + box.w / 2, box.y + 20);
      // Netz: Reihe [b×c][a×c][b×c][a×c], darüber und darunter a×b über der zweiten Fläche
      const netW = 2 * a + 2 * b;
      const netH = c + 2 * b;
      const textH = 44;
      const s = Math.min((box.w - 24) / netW, (box.h - 34 - textH) / netH);
      const x0 = box.x + (box.w - netW * s) / 2;
      const y0 = box.y + 30 + (box.h - 34 - textH - netH * s) / 2;
      const rect = (x: number, y: number, w: number, h: number, color: string, label: string) => {
        g.fillStyle = mixColor(color, th.bg, 0.45);
        g.fillRect(x0 + x * s, y0 + y * s, w * s, h * s);
        g.strokeStyle = color;
        g.lineWidth = 1.5;
        g.strokeRect(x0 + x * s, y0 + y * s, w * s, h * s);
        if (w * s > 22 && h * s > 14) {
          g.fillStyle = th.text;
          g.font = `700 ${Math.max(9, Math.min(12, s * 0.9))}px ${th.font}`;
          g.textBaseline = 'middle';
          g.fillText(label, x0 + (x + w / 2) * s, y0 + (y + h / 2) * s);
        }
      };
      const cA = th.series[0]!;
      const cF = th.series[3]!;
      const cS = th.series[5]!;
      rect(0, b, b, c, cS, `${b * c}`);
      rect(b, b, a, c, cF, `${a * c}`);
      rect(b + a, b, b, c, cS, `${b * c}`);
      rect(2 * b + a, b, a, c, cF, `${a * c}`);
      rect(b, 0, a, b, cA, `${a * b}`);
      rect(b, b + c, a, b, cA, `${a * b}`);
      g.textBaseline = 'alphabetic';
      g.fillStyle = th.text;
      g.font = `800 ${narrow ? 12 : 14}px ${th.font}`;
      g.fillText(tr('surfText', { ab: a * b, ac: a * c, bc: b * c, o: big(surfaceArea(a, b, c)), u }), box.x + box.w / 2, box.y + box.h - 22);
      g.font = `600 11px ${th.font}`;
      g.fillStyle = th.muted;
      g.fillText(`${ctx.t('faceAB')}: ${a}·${b} · ${ctx.t('faceAC')}: ${a}·${c} · ${ctx.t('faceBC')}: ${b}·${c}`, box.x + box.w / 2, box.y + box.h - 6);
      g.restore();
    }

    function taskText(): string {
      const t = task;
      const vars = { q: p.q, a: t.a, b: t.b, c: t.c, u: t.unit, v: big(volume(t.a, t.b, t.c)) };
      return tr(t.kind === 'V' ? 'qV' : t.kind === 'O' ? 'qO' : t.kind === 'edge' ? 'qEdge' : 'qLitre', vars);
    }

    function calcText(): string {
      const t = task;
      const u = t.unit;
      if (t.kind === 'V') return `V = ${t.a} · ${t.b} · ${t.c} = ${big(t.answer)} ${u}³`;
      if (t.kind === 'O') return `${ctx.lang === 'de' ? 'O' : 'S'} = 2 · (${t.a * t.b} + ${t.a * t.c} + ${t.b * t.c}) = ${big(t.answer)} ${u}²`;
      if (t.kind === 'edge') return `c = ${big(volume(t.a, t.b, t.c))} : (${t.a} · ${t.b}) = ${t.c} ${u}`;
      return `V = ${big(volume(t.a, t.b, t.c))} ${u}³ = ${big(t.answer)} ${ctx.t(t.answer === 1 ? 'litre1' : 'litre')}`;
    }

    function feedback(): { text: string; color: string } | null {
      if (!taskState) return null;
      if (taskState.got === null) return { text: ctx.t('wait'), color: ctx.theme.muted };
      if (taskState.ok) return { text: tr('okMsg', { calc: calcText() }), color: ctx.theme.series[2]! };
      const hint = task.kind === 'V' ? 'hV' : task.kind === 'O' ? 'hO' : task.kind === 'edge' ? 'hEdge' : 'hLitre';
      return { text: tr('noMsg', { hint: ctx.t(hint) }), color: ctx.theme.series[1]! };
    }

    function wrapText(value: string, maxW: number, font: string): string[] {
      const g = surface.g;
      g.font = font;
      const lines: string[] = [];
      let line = '';
      for (const w of value.split(' ')) {
        const next = line ? `${line} ${w}` : w;
        if (g.measureText(next).width > maxW && line) {
          lines.push(line);
          line = w;
        } else line = next;
      }
      if (line) lines.push(line);
      return lines;
    }

    function drawTaskCard(narrow: boolean): void {
      const th = ctx.theme;
      const g = surface.g;
      const boxW = narrow ? surface.width - 80 : Math.min(360, surface.width * 0.38);
      const size = narrow ? 13 : 15;
      const fb = feedback();
      const lines = wrapText(taskText(), boxW - 28, `600 ${size}px ${th.font}`);
      const fbLines = fb ? wrapText(fb.text, boxW - 28, `700 ${size}px ${th.font}`) : [];
      const lineH = size * 1.35;
      const boxH = 20 + (lines.length + fbLines.length) * lineH + (fb ? 8 : 0);
      g.save();
      g.fillStyle = th.dark ? 'rgba(15,20,30,0.84)' : 'rgba(255,255,255,0.92)';
      roundRect(g, 10, 10, boxW, boxH, 12);
      g.fill();
      g.textAlign = 'left';
      g.textBaseline = 'top';
      let y = 20;
      g.font = `600 ${size}px ${th.font}`;
      g.fillStyle = th.text;
      for (const l of lines) {
        g.fillText(l, 24, y);
        y += lineH;
      }
      if (fb) {
        y += 8;
        g.font = `700 ${size}px ${th.font}`;
        g.fillStyle = fb.color;
        for (const l of fbLines) {
          g.fillText(l, 24, y);
          y += lineH;
        }
      }
      g.restore();
    }

    /** Zählhilfe: Reihe → Schicht → alle Schichten → Volumen. */
    function drawCard(u: string, narrow: boolean): void {
      const th = ctx.theme;
      const g = surface.g;
      const a = A(), b = B(), c = C();
      const n = currentCount();
      const ab = a * b;
      const abc = ab * c;
      const lines: { text: string; color: string; bold?: boolean }[] = [];
      if (n === 0) lines.push({ text: ctx.t('question'), color: th.muted });
      if (n >= a && b > 1) lines.push({ text: tr('row', { a }), color: th.series[3]! });
      if (n >= ab) lines.push({ text: b > 1 ? tr('layer', { a, b, ab }) : tr('row', { a }), color: th.series[0]! });
      if (n >= abc && c > 1) lines.push({ text: tr('layers', { c, ab, abc }), color: th.series[5]! });
      if (n >= abc) lines.push({ text: `V = ${a} · ${b} · ${c} ${u}³ = ${big(abc)} ${u}³${u === 'dm' ? ` = ${big(abc)} ${ctx.t(abc === 1 ? 'litre1' : 'litre')}` : ''}`, color: th.text, bold: true });
      const size = narrow ? 12 : 13;
      const head = `${n}`;
      const headLabel = n === 1 ? ctx.t('cube1') : ctx.t('cubes');
      g.save();
      g.font = `600 ${size}px ${th.font}`;
      let w = 0;
      for (const line of lines) {
        g.font = `${line.bold ? 800 : 600} ${size}px ${th.font}`;
        w = Math.max(w, g.measureText(line.text).width + 22);
      }
      g.font = `800 ${narrow ? 22 : 26}px ${th.font}`;
      const hw = g.measureText(head).width;
      g.font = `600 ${size}px ${th.font}`;
      w = Math.max(w, hw + 8 + g.measureText(headLabel).width);
      const lineH = size + 9;
      const boxW = Math.min(surface.width - 20, w + 28);
      const boxH = (narrow ? 40 : 46) + lines.length * lineH;
      g.fillStyle = th.dark ? 'rgba(15,20,30,0.84)' : 'rgba(255,255,255,0.9)';
      roundRect(g, 10, 10, boxW, boxH, 12);
      g.fill();
      g.strokeStyle = th.dark ? 'rgba(255,255,255,0.08)' : 'rgba(16,24,40,0.08)';
      g.lineWidth = 1;
      g.stroke();
      g.textBaseline = 'alphabetic';
      g.textAlign = 'left';
      g.fillStyle = th.text;
      g.font = `800 ${narrow ? 22 : 26}px ${th.font}`;
      const top = narrow ? 36 : 41;
      g.fillText(head, 24, top);
      g.fillStyle = th.muted;
      g.font = `600 ${size}px ${th.font}`;
      g.fillText(headLabel, 24 + hw + 8, top);
      lines.forEach((line, i) => {
        const y = top + 8 + (i + 1) * lineH - 4;
        if (!line.bold) {
          g.fillStyle = line.color;
          roundRect(g, 24, y - size + 2, 9, 9, 2);
          g.fill();
        }
        g.fillStyle = line.bold ? th.text : th.text;
        g.font = `${line.bold ? 800 : 600} ${size}px ${th.font}`;
        g.fillText(line.text, line.bold ? 24 : 40, y);
      });
      g.restore();
    }

    return {
      update(changed, source) {
        if (changed.has('q') || source === 'init' || source === 'replace') {
          task = cuboidTask(p.q, seededRandom(p.q * 7919 + 97));
          taskState = null;
        }
        if (changed.has('ans') && taskState && !taskState.ok) taskState = null;
        const size = changed.has('a') || changed.has('b') || changed.has('c');
        if (changed.has('fill') && source !== 'sim') {
          const target = stageCount(p.fill as Stage, A(), B(), C());
          if (source === 'input') animateTo(target);
          else {
            anim = null;
            count = target;
          }
        } else if (size) {
          // neue Maße: Füllstand bleibt (z. B. „1 Schicht“), Würfel passen sich an
          anim = null;
          count = stageCount(p.fill as Stage, A(), B(), C());
        }
        syncStage();
        updateReadouts();
      },

      action(id) {
        if (id === 'check') {
          taskState = checkCuboid(task, p.ans);
          updateReadouts();
          const fb = feedback();
          if (fb) ctx.announce(fb.text);
          ctx.requestRender();
          return;
        }
        if (id === 'newq') {
          ctx.set({ q: p.q >= 999 ? 1 : p.q + 1, ans: '' });
          return;
        }
        if (id !== 'fill') return;
        const from = currentCount() >= total() ? 0 : currentCount();
        if (from === 0) ctx.set({ fill: 'leer' });
        animateTo(total(), from);
        syncStage();
        updateReadouts();
      },

      resetView: () => view.resetView(false),

      render,

      destroy: () => surface.destroy(),
    };
  },
});
