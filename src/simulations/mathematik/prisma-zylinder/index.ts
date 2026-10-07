import { defineSimulation, ease, mesh3d, mixColor, roundRect, Surface, Tween, vec3, View3D, type Mesh3D, type Vec3 } from '../../../sim-core';
import { circleBase, polygonBase, regularPolygon, rollCircle, rollPolygon, slices, solid, triangleBase, type BaseShape, type Pt } from './model';

const L = (de: string, en: string) => ({ de, en });
/** Abschnitte des Reglers „Abrollen“: bis 80 % rollt der Körper, danach klappen Grund- und Deckfläche herunter. */
const ROLL_END = 0.8;
const smooth = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (t: number) => Math.max(0, Math.min(1, t));

/**
 * Prisma und Zylinder: Volumen V = G · h durch Stapeln von Schichten,
 * Oberfläche durch Abrollen (jede Seitenfläche hinterlässt ihren Abdruck, der
 * Mantel ist ein Rechteck u × h). Der Zylinder als Grenzfall des n-Eck-Prismas.
 */
export default defineSimulation({
  id: 'prisma-zylinder',
  layout: { aspect: 1.6, aspectNarrow: 0.82 },
  groups: [
    { id: 'size', label: L('Maße in cm', 'Dimensions in cm') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Thema', 'Topic'),
      options: [
        { value: 'volumen', label: L('Volumen: Schichten', 'Volume: layers') },
        { value: 'oberflaeche', label: L('Oberfläche: abrollen', 'Surface: roll out') },
      ],
      default: 'volumen',
    },
    {
      key: 'base',
      type: 'choice',
      label: L('Grundfläche', 'Base'),
      options: [
        { value: 'dreieck', label: L('Dreieck', 'Triangle') },
        { value: 'neck', label: L('n-Eck', 'n-gon') },
        { value: 'kreis', label: L('Kreis (Zylinder)', 'Circle (cylinder)') },
      ],
      default: 'neck',
    },
    {
      key: 'n',
      type: 'number',
      label: L('Eckenzahl n', 'Number of vertices n'),
      help: L('Regelmäßiges n-Eck. Je mehr Ecken, desto näher kommt das Prisma dem Zylinder.', 'Regular n-gon. The more vertices, the closer the prism gets to the cylinder.'),
      min: 3,
      max: 40,
      step: 1,
      default: 6,
      visibleIf: (v) => v.base === 'neck',
    },
    {
      key: 'r',
      type: 'number',
      group: 'size',
      label: L('Radius r', 'Radius r'),
      help: L('Beim n-Eck: Radius des Umkreises.', 'For the n-gon: radius of the circumcircle.'),
      min: 1,
      max: 4,
      step: 0.5,
      default: 2,
      unit: 'cm',
      visibleIf: (v) => v.base !== 'dreieck',
    },
    { key: 'g', type: 'number', group: 'size', label: L('Grundseite g', 'Base side g'), min: 1, max: 8, step: 0.5, default: 4, unit: 'cm', visibleIf: (v) => v.base === 'dreieck' },
    { key: 'hg', type: 'number', group: 'size', label: L('Dreieckshöhe h_g', 'Triangle height h_g'), min: 1, max: 6, step: 0.5, default: 3, unit: 'cm', visibleIf: (v) => v.base === 'dreieck' },
    { key: 'h', type: 'number', group: 'size', label: L('Körperhöhe h', 'Height h of the solid'), min: 1, max: 8, step: 0.5, default: 4, unit: 'cm' },
    { key: 'roll', type: 'number', label: L('Abrollen', 'Rolling out'), min: 0, max: 100, step: 1, default: 0, unit: '%', visibleIf: (v) => v.mode === 'oberflaeche' },
    {
      key: 'ghost',
      type: 'boolean',
      group: 'view',
      label: L('Zylinder zum Vergleich', 'Cylinder for comparison'),
      default: false,
      visibleIf: (v) => v.base === 'neck' && v.mode === 'volumen',
    },
    { key: 'calc', type: 'boolean', group: 'view', label: L('Rechnung im Bild', 'Calculation in the picture'), default: true },
  ],
  actions: [
    { id: 'stack', label: L('Schichten stapeln', 'Stack layers'), primary: true, visibleIf: (v) => v.mode === 'volumen' },
    { id: 'roll', label: L('Abrollen', 'Roll out'), primary: true, visibleIf: (v) => v.mode === 'oberflaeche' },
  ],
  readouts: [
    { key: 'G', label: L('Grundfläche', 'Base area') },
    { key: 'u', label: L('Umfang der Grundfläche', 'Perimeter of the base') },
    { key: 'V', label: L('Volumen', 'Volume'), spoiler: true },
    { key: 'O', label: L('Oberfläche', 'Surface area'), spoiler: true },
    { key: 'cmp', label: L('Vergleich mit dem Zylinder', 'Compared with the cylinder'), spoiler: true },
  ],
  presets: [
    { id: 'start', label: L('Sechseckprisma', 'Hexagonal prism'), values: {} },
    { id: 'triangle', label: L('Dreiecksprisma', 'Triangular prism'), values: { base: 'dreieck', g: 4, hg: 3, h: 5 } },
    { id: 'limit', label: L('Fast ein Zylinder', 'Almost a cylinder'), values: { n: 24, ghost: true } },
    { id: 'cylinder', label: L('Zylinder', 'Cylinder'), values: { base: 'kreis', r: 2, h: 4 } },
    { id: 'roll-hex', label: L('Sechseckprisma abrollen', 'Roll a hexagonal prism'), values: { mode: 'oberflaeche', roll: 45 } },
    { id: 'roll-cyl', label: L('Zylindernetz', 'Net of a cylinder'), values: { mode: 'oberflaeche', base: 'kreis', r: 1.5, h: 4, roll: 100 } },
  ],
  strings: {
    de: {
      canvas: 'Prisma oder Zylinder in 3D: aus Schichten gestapelt oder auf dem Boden abgerollt; die Ansicht lässt sich drehen',
      layers1: '1 Schicht',
      layersN: '{n} Schichten',
      baseArea: 'Grundfläche G',
      oneLayer: '1 Schicht (1 cm hoch): G · 1 cm',
      allLayers: '{n} Schichten: V = G · h',
      cylinder: 'Zylinder: V = πr² · h',
      rolled: 'abgerollt',
      mantle: 'Mantel: M = u · h',
      bases: 'Grund- und Deckfläche: 2 · G',
      surface: 'O = 2 · G + M',
      net: 'Netz',
      start: 'Startfläche',
      stack: 'Schichten stapeln',
      roll: 'Abrollen',
      again: 'Noch einmal',
      percent: 'Das Prisma hat {p} % des Zylindervolumens.',
    },
    en: {
      canvas: 'Prism or cylinder in 3D: stacked from layers or rolled out on the floor; the view can be rotated',
      layers1: '1 layer',
      layersN: '{n} layers',
      baseArea: 'Base area G',
      oneLayer: '1 layer (1 cm thick): G · 1 cm',
      allLayers: '{n} layers: V = G · h',
      cylinder: 'Cylinder: V = πr² · h',
      rolled: 'rolled out',
      mantle: 'Lateral surface: M = u · h',
      bases: 'Two bases: 2 · G',
      surface: 'O = 2 · G + M',
      net: 'Net',
      start: 'starting face',
      stack: 'Stack layers',
      roll: 'Roll out',
      again: 'Once more',
      percent: 'The prism has {p} % of the cylinder’s volume.',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const cm = (v: number, d = 2) => `${fmt.num(v, d)} cm`;
    const cm2 = (v: number, d = 2) => `${fmt.num(v, d)} cm²`;
    const cm3 = (v: number, d = 2) => `${fmt.num(v, d)} cm³`;

    const VIEWS = { volumen: { azimuth: 30, elevation: 22 }, oberflaeche: { azimuth: 22, elevation: 38 } } as const;
    const view = new View3D(surface, { ...VIEWS.volumen, elevationLimits: [-20, 88] });

    let base: BaseShape = polygonBase(6, 2);
    /** Schichten, die gerade sichtbar sind (beim Stapeln wachsend). */
    let stackAnim: { tween: Tween } | null = null;
    let rollShown = p.roll / 100;
    let rollAnim: { tween: Tween; from: number; to: number } | null = null;
    let frame: { target: Vec3; radius: number } | null = null;
    let lastTime = performance.now();

    function rebuild(): void {
      base = p.base === 'dreieck' ? triangleBase(p.g, p.hg) : p.base === 'kreis' ? circleBase(p.r) : polygonBase(p.n, p.r);
      // Dreieck mit der Spitze zur Kamera drehen, damit zwei Seitenflächen sichtbar sind (Seite 0 bleibt Seite 0)
      if (p.base === 'dreieck') base = { ...base, points: base.points.map(([x, y]) => [-x, -y] as Pt) };
    }

    /** Querschnitt zum Abrollen (u entlang des Bodens, w nach oben), Seite 0 unten. */
    function crossSection(): Pt[] {
      return base.points.map(([x1, x2]) => [x2, -x1] as Pt);
    }

    /* ---------- Ergebnisse ---------- */

    function updateReadouts(): void {
      const v = (x: string) => `<var>${x}</var>`;
      const s = solid(base, p.h);
      let gHtml = '';
      let uHtml = '';
      if (p.base === 'dreieck') {
        gHtml = `${v('G')} = ½ · ${v('g')} · ${v('h')}<sub>g</sub> = ½ · ${cm(p.g)} · ${cm(p.hg)} = <strong>${cm2(base.area)}</strong>`;
        uHtml = `${v('u')} = ${cm(p.g)} + 2 · ${cm(base.sides[1]!)} ≈ <strong>${cm(base.perimeter)}</strong>`;
      } else if (p.base === 'neck') {
        const q = regularPolygon(p.n, p.r);
        gHtml = `${v('G')} = ${p.n} · ½ · ${v('s')} · ${v('ρ')} ≈ ${p.n} · ½ · ${cm(q.side)} · ${cm(q.apothem)} ≈ <strong>${cm2(base.area)}</strong>`;
        uHtml = `${v('u')} = ${p.n} · ${v('s')} ≈ ${p.n} · ${cm(q.side)} ≈ <strong>${cm(base.perimeter)}</strong>`;
      } else {
        gHtml = `${v('G')} = π · ${v('r')}² = π · (${cm(p.r)})² ≈ <strong>${cm2(base.area)}</strong>`;
        uHtml = `${v('u')} = 2π · ${v('r')} ≈ <strong>${cm(base.perimeter)}</strong>`;
      }
      ctx.readout('G', { html: gHtml });
      ctx.readout('u', { html: uHtml });
      ctx.readout('V', { html: `${v('V')} = ${v('G')} · ${v('h')} ≈ ${cm2(base.area)} · ${cm(p.h)} ≈ <strong>${cm3(s.volume)}</strong>` });
      ctx.readout('O', {
        html: `${v('O')} = 2 · ${v('G')} + ${v('u')} · ${v('h')} ≈ 2 · ${cm2(base.area)} + ${cm(base.perimeter)} · ${cm(p.h)} ≈ <strong>${cm2(s.surface)}</strong>`,
      });
      if (p.base === 'neck') {
        const cyl = solid(circleBase(p.r), p.h);
        ctx.readout('cmp', {
          html: `${v('V')}<sub>${ctx.lang === 'de' ? 'Zyl' : 'cyl'}</sub> = π${v('r')}²${v('h')} ≈ ${cm3(cyl.volume)} · ${tr('percent', { p: fmt.num((100 * s.volume) / cyl.volume, 1) })}`,
        });
      } else ctx.readout('cmp', null);
    }

    function syncActions(): void {
      ctx.setAction('roll', { label: ctx.t((rollAnim ? rollAnim.to : rollShown) >= 1 && !rollAnim ? 'again' : 'roll') });
    }

    /* ---------- Farben ---------- */

    const tint = (c: string) => (ctx.theme.dark ? c : mixColor(c, '#ffffff', 0.18));
    const edgeOf = (c: string) => mixColor(c, ctx.theme.dark ? '#000000' : '#0b1220', ctx.theme.dark ? 0.5 : 0.45);

    /* ---------- Zeichnen ---------- */

    function render(): void {
      const now = performance.now();
      const dt = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;
      const narrow = surface.width < 560;
      let animating = false;

      if (rollAnim) {
        rollShown = rollAnim.from + (rollAnim.to - rollAnim.from) * rollAnim.tween.value;
        const percent = Math.round(rollShown * 100);
        if (percent !== p.roll) ctx.set({ roll: percent });
        if (!rollAnim.tween.running) {
          rollShown = rollAnim.to;
          rollAnim = null;
          syncActions();
        } else animating = true;
      }
      if (stackAnim?.tween.running) animating = true;

      const goal = p.mode === 'volumen' ? volumeFrame() : surfaceFrame();
      if (!frame) frame = goal;
      const k = 1 - Math.exp(-dt / 0.2);
      frame = { target: vec3.lerp(frame.target, goal.target, k), radius: frame.radius + (goal.radius - frame.radius) * k };
      const settling = vec3.distance(frame.target, goal.target) > 0.005 || Math.abs(frame.radius - goal.radius) > 0.005;
      // schmal: Abdruck etwas nach rechts, damit links Platz für die Beschriftung h bleibt
      const ax = narrow ? (p.mode === 'oberflaeche' ? 0.6 : 0.5) : 0.57;
      view.setScene({ target: frame.target, radius: frame.radius, anchor: [ax, narrow ? 0.6 : 0.53] });

      view.begin();
      if (p.mode === 'volumen') drawVolume();
      else drawSurface();
      view.end();
      if (p.calc) drawCard(narrow);
      if (animating || settling) ctx.requestRender();
    }

    function baseRadius(): number {
      return Math.max(...base.points.map(([x, y]) => Math.hypot(x, y)));
    }

    function volumeFrame(): { target: Vec3; radius: number } {
      const R = Math.max(baseRadius(), p.ghost && p.base === 'neck' ? p.r : 0);
      return { target: [0, -0.35 * R, p.h * 0.45], radius: Math.hypot(R * 1.15, p.h / 2) * 1.12 + 0.4 };
    }

    function surfaceFrame(): { target: Vec3; radius: number } {
      const P = base.perimeter;
      const R = baseRadius();
      const narrow = surface.width < 560;
      return { target: [0, 0.12 * R, 0.3 * R], radius: 0.5 * Math.hypot(P + 2 * R, p.h + 4 * R) * (narrow ? 0.74 : 0.66) + 0.4 };
    }

    /* ---------- Volumen: Schichten ---------- */

    function prismMesh(z0: number, z1: number): Mesh3D {
      return mesh3d.prism(base.points, z0, z1);
    }

    function drawVolume(): void {
      const th = ctx.theme;
      const parts = slices(p.h);
      const R = baseRadius();
      // Bodengitter und Schatten
      const G = Math.ceil(R + 2);
      view.grid({ min: [-G, -G], max: [G, G], step: 1, color: th.gridMinor });
      view.shadow(
        base.points.map(([x, y]) => [x, y, 0] as Vec3),
        { alpha: 0.2, blur: 22, spread: 1.05 },
      );
      // Schichten (beim Stapeln fallen sie nacheinander herunter)
      const t = stackAnim ? (performance.now() - (stackStart ?? 0)) / 1000 : Infinity;
      const smoothEdges = p.base === 'kreis';
      parts.forEach(([z0, z1], i) => {
        let dz = 0;
        let alpha = 1;
        if (stackAnim) {
          const q = clamp01((t - i * 0.42) / 0.55);
          if (q <= 0) return;
          dz = (1 - ease.outCubic(q)) * 2.2;
          alpha = Math.min(1, q * 3);
        }
        const color = tint(i % 2 === 0 ? th.series[0]! : th.series[5]!);
        const top = i === parts.length - 1;
        view.mesh(prismMesh(z0 + dz, z1 + dz), {
          color,
          alpha,
          edgeColor: edgeOf(color),
          edgeWidth: 1.4,
          edgeAngle: smoothEdges ? 20 : 3,
          gloss: smoothEdges ? 0.3 : 0.16,
          face: (f) =>
            f === 1 && top && !stackAnim && p.calc
              ? { label: { text: `G ≈ ${cm2(base.area, 2)}`, size: surface.width < 560 ? 11 : 13 } }
              : undefined,
        });
      });
      // verdeckte Kanten des ganzen Körpers
      // (bei vielen Ecken nur Unruhe – dann weglassen)
      if (!stackAnim && base.points.length <= 16) view.mesh(prismMesh(0, p.h), { edges: false, hiddenEdges: true, edgeColor: edgeOf(tint(th.series[0]!)), edgeAngle: smoothEdges ? 20 : 3, face: () => null });
      // Vergleichszylinder
      if (p.ghost && p.base === 'neck') {
        const cyl = mesh3d.cylinder(p.r, p.h, 72);
        view.mesh(cyl, { color: th.series[4], alpha: 0.13, flat: true, edgeColor: th.series[4], edgeWidth: 1.6, edgeAngle: 20, cull: false });
      }
      drawHeight(parts.length);
    }

    let stackStart: number | null = null;

    /** Höhe h mit Zentimeter-Teilung an der rechten Kante. */
    function drawHeight(layers: number): void {
      const th = ctx.theme;
      // Ecke, die im Bild am weitesten rechts liegt
      let best = base.points[0]!;
      let bestX = -Infinity;
      for (const pt of base.points) {
        const x = view.toPx([pt[0], pt[1], 0])[0];
        if (x > bestX) {
          bestX = x;
          best = pt;
        }
      }
      const out = vec3.normalize([best[0], best[1], 0]);
      const off = 0.45;
      const a: Vec3 = [best[0] + out[0] * off, best[1] + out[1] * off, 0];
      const b: Vec3 = [a[0], a[1], p.h];
      view.segment(a, b, { color: th.muted, width: 1.6, layer: 'front' });
      for (let i = 0; i <= layers; i++) {
        const z = Math.min(p.h, i);
        const q: Vec3 = [a[0], a[1], z];
        view.custom(
          q,
          (g) => {
            const [x, y] = view.toPx(q);
            g.strokeStyle = th.muted;
            g.lineWidth = 1.4;
            g.beginPath();
            g.moveTo(x - 4, y);
            g.lineTo(x + 4, y);
            g.stroke();
          },
          'front',
        );
      }
      view.label([a[0], a[1], p.h / 2], `h = ${cm(p.h, 1)}`, { color: th.text, size: 13, weight: '700', align: 'left', baseline: 'middle', offset: [10, 0] });
    }

    /* ---------- Oberfläche: Abrollen ---------- */

    function drawSurface(): void {
      const th = ctx.theme;
      const s = rollShown;
      const H = p.h / 2;
      const P = base.perimeter;
      const R = baseRadius();
      const cylinder = p.base === 'kreis';
      const theta = 2 * Math.PI * smooth(clamp01(s / ROLL_END));
      const fade = clamp01((s - ROLL_END) / 0.06);
      const fold = smooth(clamp01((s - ROLL_END - 0.03) / (1 - ROLL_END - 0.03)));
      const shift = -P / 2;
      const toWorld = (u: number, w: number, x1: number): Vec3 => [x1, u + shift, w];

      // Boden
      view.grid({ min: [-Math.ceil(H + 2 * R + 1), Math.floor(shift - 1)], max: [Math.ceil(H + 2 * R + 1), Math.ceil(-shift + 2 * R + 1)], step: 1, color: th.gridMinor });

      const mantle = tint(th.series[0]!);
      const startColor = tint(mixColor(th.series[0]!, th.series[1]!, 0.55));
      const baseColor = tint(th.series[3]!);

      // Abdrücke auf dem Boden
      let printed: number;
      let pose: Pt[];
      let faces = 0;
      if (cylinder) {
        const c = rollCircle(p.r, theta);
        printed = c.printed;
        pose = base.points.map(([x1, x2]) => {
          // Kreis-Querschnitt um den Mittelpunkt gedreht (im Uhrzeigersinn)
          const u0 = x2;
          const w0 = -x1;
          const cs = Math.cos(-c.angle);
          const sn = Math.sin(-c.angle);
          return [c.center[0] + u0 * cs - w0 * sn, c.center[1] + u0 * sn + w0 * cs] as Pt;
        });
      } else {
        const r = rollPolygon(crossSection(), theta);
        printed = r.printed;
        pose = r.points;
        faces = r.faces;
      }
      const sides = base.sides;
      const printRect = (u0: number, u1: number, color: string, label?: string) =>
        view.face([toWorld(u0, 0, -H), toWorld(u1, 0, -H), toWorld(u1, 0, H), toWorld(u0, 0, H)], {
          color,
          flat: false,
          stroke: edgeOf(color),
          width: 1.2,
          layer: 'back',
          label: label ? { text: label, size: surface.width < 560 ? 11 : 13 } : undefined,
        });
      if (cylinder) {
        if (printed > 1e-6) {
          // Abdruck der markierten Startstreifen (zwei der 72 Mantelstreifen ab der Mitte des ersten)
          const seam = Math.min(printed, (3 * Math.PI * p.r) / base.points.length);
          printRect(0, seam, startColor);
          printRect(seam, printed, mantle);
        }
      } else {
        let u = 0;
        for (let j = 0; j < Math.min(faces, sides.length); j++) {
          printRect(u, u + sides[j]!, j === 0 ? startColor : mantle);
          u += sides[j]!;
        }
      }
      const complete = printed >= P - 1e-6;
      if (complete && fold > 0.98 && p.calc) {
        view.label(toWorld(P / 2, 0, 0), `M ≈ ${cm2(P * p.h, 2)}`, { color: th.text, size: 13, weight: '700', align: 'center', baseline: 'middle', background: th.dark ? 'rgba(15,20,30,0.78)' : 'rgba(255,255,255,0.85)' });
      }

      // rollender Körper (blendet am Ende aus)
      const alpha = 1 - fade;
      if (alpha > 0.01) {
        const m = mesh3d.prism(pose, -H, H);
        const mesh: Mesh3D = { vertices: m.vertices.map(([x, y, z]) => [z, x + shift, y] as Vec3), faces: m.faces };
        view.mesh(mesh, {
          color: mantle,
          alpha,
          edgeColor: edgeOf(mantle),
          edgeWidth: 1.5,
          edgeAngle: cylinder ? 20 : 3,
          gloss: cylinder ? 0.3 : 0.16,
          face: (f) => (f < 2 ? { color: baseColor } : f === 2 || (cylinder && f === 3) ? { color: startColor } : undefined),
        });
      }

      // Grund- und Deckfläche klappen an den Mantel
      if (complete && fade > 0) {
        const j = cylinder ? 0 : Math.floor(sides.length / 2);
        const at = cylinder ? P / 2 : sides.slice(0, j).reduce((a, b) => a + b, 0);
        // Querschnitt so legen, dass seine Seite j bei u = at auf dem Boden liegt
        let flat: Pt[];
        if (cylinder) {
          flat = crossSection().map(([u, w]) => [u + at, w + p.r] as Pt);
        } else {
          const cs = crossSection();
          const n = cs.length;
          const a = cs[j]!;
          const b = cs[(j + 1) % n]!;
          const ang = -Math.atan2(b[1] - a[1], b[0] - a[0]);
          flat = cs.map(([u, w]) => {
            const x = u - a[0];
            const y = w - a[1];
            return [at + x * Math.cos(ang) - y * Math.sin(ang), x * Math.sin(ang) + y * Math.cos(ang)] as Pt;
          });
        }
        const angle = fold * (Math.PI / 2);
        for (const side of [1, -1]) {
          const pts = flat.map(([u, w]) => toWorld(u, w * Math.cos(angle), side * (H + w * Math.sin(angle))));
          view.face(pts, {
            color: baseColor,
            alpha: Math.min(1, fade * 1.5),
            stroke: edgeOf(baseColor),
            width: 1.4,
            gloss: 0.15,
            label: fold > 0.98 && p.calc ? { text: `G ≈ ${cm2(base.area, 2)}`, size: surface.width < 560 ? 11 : 12 } : undefined,
          });
        }
      }

      // Maße am Abdruck: Länge (abgerollt bzw. u) und Höhe h
      if (printed > 0.2) {
        const label = complete ? `u ≈ ${cm(P, 2)}` : `${ctx.t('rolled')}: ${cm(printed, 1)}`;
        const a = toWorld(0, 0, H + 0.35);
        const b = toWorld(printed, 0, H + 0.35);
        view.segment(a, b, { color: th.series[1], width: 2.2, layer: 'back' });
        // Beschriftung im linken Viertel, damit sie nicht unter der angeklappten Grundfläche liegt
        view.label(vec3.lerp(a, b, complete ? 0.22 : 0.5), label, { color: th.series[1], size: 13, weight: '700', align: 'center', baseline: 'top', offset: [0, 8] });
      }
      const ha = toWorld(0, 0, -H);
      const hb = toWorld(0, 0, H);
      view.label(vec3.lerp(ha, hb, 0.5), `h = ${cm(p.h, 1)}`, { color: th.text, size: 13, weight: '700', align: 'right', baseline: 'middle', offset: [-12, 0] });
    }

    /* ---------- Rechnung im Bild ---------- */

    function drawCard(narrow: boolean): void {
      const th = ctx.theme;
      const g = surface.g;
      const sld = solid(base, p.h);
      const lines: { text: string; color?: string; bold?: boolean }[] = [];
      let head = '';
      if (p.mode === 'volumen') {
        const parts = slices(p.h);
        const t = stackAnim && stackStart !== null ? (performance.now() - stackStart) / 1000 : Infinity;
        const shown = Math.min(parts.length, Math.max(0, Math.floor((t - 0.55) / 0.42) + 1));
        const count = stackAnim ? shown : parts.length;
        const layersText = fmt.num(Math.min(count, p.h), 1);
        head = count === 1 ? ctx.t('layers1') : tr('layersN', { n: layersText });
        lines.push({ text: `${ctx.t('baseArea')} ≈ ${cm2(base.area)}`, color: th.series[0]! });
        if (count >= 1) lines.push({ text: `${ctx.t('oneLayer')} ≈ ${cm3(base.area)}`, color: th.series[5]! });
        if (count >= parts.length) lines.push({ text: `${tr('allLayers', { n: fmt.num(p.h, 1) })} ≈ ${cm3(sld.volume)}`, bold: true });
        if (p.ghost && p.base === 'neck') lines.push({ text: `${ctx.t('cylinder')} ≈ ${cm3(Math.PI * p.r * p.r * p.h)}`, color: th.series[4]! });
      } else {
        const theta = 2 * Math.PI * smooth(clamp01(rollShown / ROLL_END));
        const printed = p.base === 'kreis' ? rollCircle(p.r, theta).printed : rollPolygon(crossSection(), theta).printed;
        const complete = printed >= base.perimeter - 1e-6;
        const folded = rollShown >= 0.999;
        head = folded ? ctx.t('net') : `${ctx.t('rolled')}: ${cm(rollShown > 0 ? printed : 0, 1)}`;
        if (complete) lines.push({ text: `${ctx.t('mantle')} ≈ ${cm(base.perimeter)} · ${cm(p.h, 1)} ≈ ${cm2(sld.mantle)}`, color: th.series[0]! });
        if (folded) lines.push({ text: `${ctx.t('bases')} ≈ ${cm2(2 * base.area)}`, color: th.series[3]! });
        if (folded) lines.push({ text: `${ctx.t('surface')} ≈ ${cm2(sld.surface)}`, bold: true });
      }
      const size = narrow ? 12 : 13;
      g.save();
      let w = 0;
      for (const line of lines) {
        g.font = `${line.bold ? 800 : 600} ${size}px ${th.font}`;
        w = Math.max(w, g.measureText(line.text).width + (line.bold ? 0 : 16));
      }
      g.font = `800 ${narrow ? 17 : 19}px ${th.font}`;
      w = Math.max(w, g.measureText(head).width);
      const lineH = size + 9;
      const boxW = Math.min(surface.width - 20, w + 30);
      const boxH = (narrow ? 38 : 42) + lines.length * lineH;
      g.fillStyle = th.dark ? 'rgba(15,20,30,0.84)' : 'rgba(255,255,255,0.9)';
      roundRect(g, 10, 10, boxW, boxH, 12);
      g.fill();
      g.strokeStyle = th.dark ? 'rgba(255,255,255,0.08)' : 'rgba(16,24,40,0.08)';
      g.lineWidth = 1;
      g.stroke();
      g.textAlign = 'left';
      g.textBaseline = 'alphabetic';
      g.fillStyle = th.text;
      g.font = `800 ${narrow ? 17 : 19}px ${th.font}`;
      const top = narrow ? 34 : 37;
      g.fillText(head, 24, top);
      lines.forEach((line, i) => {
        const y = top + 6 + (i + 1) * lineH - 4;
        if (line.color) {
          g.fillStyle = line.color;
          roundRect(g, 24, y - size + 2, 9, 9, 2);
          g.fill();
        }
        g.fillStyle = th.text;
        g.font = `${line.bold ? 800 : 600} ${size}px ${th.font}`;
        g.fillText(line.text, line.color ? 40 : 24, y);
      });
      g.restore();
    }

    rebuild();

    return {
      update(changed, source) {
        if (['base', 'n', 'r', 'g', 'hg'].some((k) => changed.has(k))) rebuild();
        if (changed.has('roll') && source !== 'sim') {
          rollAnim = null;
          rollShown = p.roll / 100;
        }
        if (changed.has('mode') || source === 'init' || source === 'replace') {
          const v = VIEWS[p.mode as keyof typeof VIEWS];
          view.setInitialView(v);
          if (source === 'input' || source === 'replace') view.animateTo(v, 700);
          else if (source === 'init') view.setCamera(v);
          stackAnim = null;
        }
        if (changed.has('h') || changed.has('base')) stackAnim = null;
        syncActions();
        updateReadouts();
      },

      action(id) {
        if (id === 'stack') {
          stackAnim = { tween: new Tween(slices(p.h).length * 420 + 600, ease.linear).play() };
          stackStart = performance.now();
          if (!stackAnim.tween.running) stackAnim = null;
        } else if (id === 'roll') {
          const from = rollShown >= 1 ? 0 : rollShown;
          rollAnim = { tween: new Tween(6500 * Math.max(0.2, 1 - from), ease.linear).play(), from, to: 1 };
          syncActions();
        }
        ctx.requestRender();
      },

      resetView: () => view.resetView(false),

      render() {
        if (stackAnim && !stackAnim.tween.running) stackAnim = null;
        render();
      },

      destroy: () => surface.destroy(),
    };
  },
});
