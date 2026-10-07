import { defineSimulation, ease, mesh3d, mixColor, prefersReducedMotion, roundRect, Surface, vec3, View3D, type Vec3 } from '../../../sim-core';
import { convertVolume, cubeCell, fillPlan, planDuration, stageCount, stageOf, volume, type DropItem, type Stage, type UnitId } from './model';

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
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    { key: 'a', type: 'number', label: L('Länge a', 'Length a'), min: 1, max: MAX, step: 1, default: 5 },
    { key: 'b', type: 'number', label: L('Breite b', 'Width b'), min: 1, max: MAX, step: 1, default: 3 },
    { key: 'c', type: 'number', label: L('Höhe c', 'Height c'), min: 1, max: MAX, step: 1, default: 4 },
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
    },
    { key: 'count', type: 'boolean', group: 'view', label: L('Zählhilfe', 'Counting aid'), default: true },
    { key: 'dims', type: 'boolean', group: 'view', label: L('Kantenlängen', 'Edge lengths'), default: true },
  ],
  actions: [{ id: 'fill', label: L('Füllen', 'Fill'), primary: true }],
  readouts: [
    { key: 'count', label: L('Eingefüllt', 'Filled in') },
    { key: 'volume', label: L('Volumen', 'Volume'), spoiler: true },
    { key: 'units', label: L('In anderen Einheiten', 'In other units'), spoiler: true },
  ],
  presets: [
    { id: 'start', label: L('Quader 5 × 3 × 4', 'Cuboid 5 × 3 × 4'), values: {} },
    { id: 'cube', label: L('Würfel 3 × 3 × 3', 'Cube 3 × 3 × 3'), values: { a: 3, b: 3, c: 3, fill: 'voll' } },
    { id: 'flat', label: L('Nur eine Schicht', 'Just one layer'), values: { a: 8, b: 5, c: 1, fill: 'voll' } },
    { id: 'tower', label: L('Hoher Turm', 'Tall tower'), values: { a: 2, b: 2, c: 9, fill: 'reihe' } },
    { id: 'litre', label: L('1 Liter = 1000 cm³', '1 litre = 1000 cm³'), values: { a: 10, b: 10, c: 10, fill: 'voll' } },
    { id: 'tank', label: L('Aquarium in dm', 'Fish tank in dm'), values: { a: 6, b: 3, c: 4, unit: 'dm', fill: 'leer' } },
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
      stage_leer: 'leer',
      stage_reihe: '1 Reihe',
      stage_schicht: '1 Schicht',
      stage_voll: 'voll',
      litre: 'Liter',
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
      stage_leer: 'empty',
      stage_reihe: '1 row',
      stage_schicht: '1 layer',
      stage_voll: 'full',
      litre: 'litres',
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

    const view: View3D = new View3D(surface, { azimuth: 32, elevation: 28, elevationLimits: [-10, 85] });

    /** Fertig eingefüllte Würfel (ohne laufende Animation). */
    let count = stageCount(p.fill as Stage, p.a, p.b, p.c);
    let anim: { items: DropItem[]; start: number; from: number; to: number; duration: number } | null = null;
    let lastHandle = -Infinity;
    // weich nachgeführter Bildausschnitt
    let frame: { target: Vec3; radius: number } | null = null;
    let lastTime = performance.now();

    const total = () => volume(p.a, p.b, p.c);
    const unit = () => p.unit as UnitId;

    /* ---------- Griffe: Kanten direkt ziehen ---------- */
    const editable = () => !ctx.locked;
    const grab = () => (lastHandle = performance.now());
    view.addHandle({
      get: () => [p.b, p.a, 0],
      set: (q) => {
        grab();
        ctx.set({ a: Math.max(1, Math.min(MAX, Math.round(q[1]))) });
      },
      axis: [0, 1, 0],
      enabled: editable,
      color: () => ctx.theme.series[3]!,
    });
    view.addHandle({
      get: () => [p.b, 0, 0],
      set: (q) => {
        grab();
        ctx.set({ b: Math.max(1, Math.min(MAX, Math.round(q[0]))) });
      },
      axis: [1, 0, 0],
      enabled: editable,
      color: () => ctx.theme.series[3]!,
    });
    view.addHandle({
      get: () => [p.b, p.a, p.c],
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
        const items = fillPlan(p.a, p.b, p.c, from, to);
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
      const stage = stageOf(currentCount(), p.a, p.b, p.c);
      const upward = stage && stageCount(stage, p.a, p.b, p.c) > stageCount(p.fill as Stage, p.a, p.b, p.c);
      if (stage && stage !== p.fill && (!anim || upward)) ctx.set({ fill: stage });
      ctx.setAction('fill', { label: ctx.t(currentCount() >= total() && !anim ? 'refill' : 'fill') });
    }

    /* ---------- Ergebnisse ---------- */

    function updateReadouts(): void {
      const u = unit();
      const n = currentCount();
      const stage = stageOf(n, p.a, p.b, p.c);
      ctx.readout('count', `${tr('countText', { n })}${stage ? ` (${ctx.t(`stage_${stage}`)})` : ''}`);
      const v = (x: string) => `<var>${x}</var>`;
      const V = total();
      ctx.readout('volume', {
        html: `${v('V')} = ${v('a')} · ${v('b')} · ${v('c')} = ${p.a}&nbsp;${u} · ${p.b}&nbsp;${u} · ${p.c}&nbsp;${u} = <strong>${big(V)}&nbsp;${u}³</strong>`,
      });
      const c = convertVolume(V, u);
      const l = ctx.t('litre');
      const parts =
        u === 'cm'
          ? [`${big(V)} cm³`, `${big(c.dm3)} dm³`, `${big(c.l)} ${l}`, `${big(c.ml)} ml`]
          : u === 'dm'
            ? [`${big(V)} dm³`, `${big(c.l)} ${l}`, `${big(c.cm3)} cm³`, `${big(c.m3)} m³`]
            : [`${big(V)} m³`, `${big(c.dm3)} dm³`, `${big(c.l)} ${l}`];
      ctx.readout('units', parts.join(' = '));
    }

    /* ---------- Zeichnen ---------- */

    function cubeColor(k: number): string {
      const s = ctx.theme.series;
      const ab = p.a * p.b;
      let color: string;
      if (k < p.a) color = s[3]!;
      else if (k < ab) color = s[0]!;
      else color = Math.floor(k / ab) % 2 === 1 ? s[5]! : s[0]!;
      return ctx.theme.dark ? color : mixColor(color, '#ffffff', 0.18);
    }

    function render(): void {
      const now = performance.now();
      const dt = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;
      const { a, b, c } = p;
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
      if (now - lastHandle > 350) {
        const k = 1 - Math.exp(-dt / 0.18);
        const next = { target: vec3.lerp(frame.target, goal.target, k), radius: frame.radius + (goal.radius - frame.radius) * k };
        moving = vec3.distance(next.target, goal.target) > 0.01 || Math.abs(next.radius - goal.radius) > 0.01;
        frame = moving ? next : goal;
      } else moving = true;
      view.setScene({ target: frame.target, radius: frame.radius, anchor: [narrow ? 0.5 : 0.56, narrow ? 0.6 : 0.54] });

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

      // Würfel
      drawCubes(t);

      for (const pts of frontWalls) view.face(pts, { color: glass, alpha: 0.1, flat: true, layer: 'front' });
      drawBoxEdges(glassEdge);
      if (p.dims) drawDimensions(u);
      drawUnitCube(u);
      view.end();
      if (p.count) drawCard(u, narrow);
      if (anim || moving) ctx.requestRender();
    }

    /** Einheitenraster auf einer (hinteren) Glaswand bzw. dem Boden. */
    function drawWallGrid(pts: Vec3[], n: Vec3): void {
      const { a, b, c } = p;
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
      const { a, b, c } = p;
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
      const { a, b, c } = p;
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
          view.face(pts, { color, alpha: alpha[k]!, stroke, width: 1, gloss: 0.12 });
        }
      }
    }

    /** Kantenlängen mit Teilstrichen an den drei sichtbaren Kanten. */
    function drawDimensions(u: string): void {
      const { a, b, c } = p;
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
      edge([0, a, 0], [0, a, c], c, `c = ${c} ${u}`);
    }

    /** Einheitswürfel zum Vergleich links neben dem Quader. */
    function drawUnitCube(u: string): void {
      const th = ctx.theme;
      const x1 = p.b - 1;
      const x2 = -2.3;
      const cube = mesh3d.box([x1, x2, 0], [x1 + 1, x2 + 1, 1]);
      const color = th.dark ? th.series[3]! : mixColor(th.series[3]!, '#ffffff', 0.18);
      view.mesh(cube, { color, edgeColor: mixColor(color, th.dark ? '#000000' : '#0b1220', 0.45), edgeWidth: 1.4 });
      view.label([x1, x2 + 0.5, 1], `1 ${u}³`, { color: th.text, size: 13, weight: '700', align: 'center', baseline: 'bottom', offset: [0, -9] });
      view.label([x1 + 1, x2 + 0.5, 0], `1 ${u}`, { color: th.muted, size: 11, weight: '600', align: 'center', baseline: 'top', offset: [0, 8] });
    }

    /** Zählhilfe: Reihe → Schicht → alle Schichten → Volumen. */
    function drawCard(u: string, narrow: boolean): void {
      const th = ctx.theme;
      const g = surface.g;
      const { a, b, c } = p;
      const n = currentCount();
      const ab = a * b;
      const abc = ab * c;
      const lines: { text: string; color: string; bold?: boolean }[] = [];
      if (n === 0) lines.push({ text: ctx.t('question'), color: th.muted });
      if (n >= a && b > 1) lines.push({ text: tr('row', { a }), color: th.series[3]! });
      if (n >= ab) lines.push({ text: b > 1 ? tr('layer', { a, b, ab }) : tr('row', { a }), color: th.series[0]! });
      if (n >= abc && c > 1) lines.push({ text: tr('layers', { c, ab, abc }), color: th.series[5]! });
      if (n >= abc) lines.push({ text: `V = ${a} · ${b} · ${c} ${u}³ = ${big(abc)} ${u}³${u === 'dm' ? ` = ${big(abc)} ${ctx.t('litre')}` : ''}`, color: th.text, bold: true });
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
        const size = changed.has('a') || changed.has('b') || changed.has('c');
        if (changed.has('fill') && source !== 'sim') {
          const target = stageCount(p.fill as Stage, p.a, p.b, p.c);
          if (source === 'input') animateTo(target);
          else {
            anim = null;
            count = target;
          }
        } else if (size) {
          // neue Maße: Füllstand bleibt (z. B. „1 Schicht“), Würfel passen sich an
          anim = null;
          count = stageCount(p.fill as Stage, p.a, p.b, p.c);
        }
        syncStage();
        updateReadouts();
      },

      action(id) {
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
