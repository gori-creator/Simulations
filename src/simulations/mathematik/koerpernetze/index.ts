import { defineSimulation, ease, foldNet, mixColor, roundRect, Surface, Tween, vec3, View3D, type Vec2, type Vec3 } from '../../../sim-core';
import { buildNet, checkCubeNet, CUBE_NETS, CYLINDER_STRIPS, mapNetPoint, type BodyFace, type BodyId, type BodyNet, type CubeCheck } from './model';

const L = (de: string, en: string) => ({ de, en });

/** Lage der Würfelaugen auf einer Fläche (Einheitsquadrat). */
const PIPS: Record<number, Vec2[]> = {
  1: [[0.5, 0.5]],
  2: [
    [0.27, 0.27],
    [0.73, 0.73],
  ],
  3: [
    [0.27, 0.27],
    [0.5, 0.5],
    [0.73, 0.73],
  ],
  4: [
    [0.27, 0.27],
    [0.73, 0.27],
    [0.27, 0.73],
    [0.73, 0.73],
  ],
  5: [
    [0.27, 0.27],
    [0.73, 0.27],
    [0.5, 0.5],
    [0.27, 0.73],
    [0.73, 0.73],
  ],
  6: [
    [0.27, 0.25],
    [0.27, 0.5],
    [0.27, 0.75],
    [0.73, 0.25],
    [0.73, 0.5],
    [0.73, 0.75],
  ],
};

const smooth = (t: number) => t * t * (3 - 2 * t);

/**
 * Körpernetze: Netze von Würfel (alle 11 Würfelnetze und falsche Netze zum
 * Prüfen), Quader, Prisma, Pyramide und Zylinder falten sich in 3D zum Körper.
 * Gegenüberliegende Flächen gleich gefärbt, Würfelaugen, Flächeninhalte und
 * Oberfläche aus dem Netz.
 */
export default defineSimulation({
  id: 'koerpernetze',
  layout: { aspect: 1.6, aspectNarrow: 0.86 },
  groups: [
    { id: 'size', label: L('Maße in cm', 'Dimensions in cm') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'body',
      type: 'choice',
      label: L('Körper', 'Solid'),
      options: [
        { value: 'wuerfel', label: L('Würfel', 'Cube') },
        { value: 'quader', label: L('Quader', 'Cuboid') },
        { value: 'prisma', label: L('Prisma', 'Prism') },
        { value: 'pyramide', label: L('Pyramide', 'Pyramid') },
        { value: 'zylinder', label: L('Zylinder', 'Cylinder') },
      ],
      default: 'wuerfel',
    },
    {
      key: 'net',
      type: 'number',
      label: L('Netz aus sechs Quadraten', 'Net of six squares'),
      help: L('Nicht jedes Netz lässt sich zu einem Würfel falten. Erst überlegen, dann falten!', 'Not every net folds into a cube. Think first, then fold!'),
      min: 1,
      max: CUBE_NETS.length,
      step: 1,
      default: 1,
      display: (v, lang) => (lang === 'de' ? `Nr. ${v} von ${CUBE_NETS.length}` : `No. ${v} of ${CUBE_NETS.length}`),
      visibleIf: (v) => v.body === 'wuerfel',
    },
    { key: 'f', type: 'number', label: L('Faltung', 'Folding'), min: 0, max: 100, step: 1, default: 0, unit: '%' },
    { key: 'a', type: 'number', group: 'size', label: L('Kante a', 'Edge a'), min: 1, max: 6, step: 0.5, default: 3, unit: 'cm', visibleIf: (v) => v.body !== 'zylinder' },
    { key: 'b', type: 'number', group: 'size', label: L('Breite b', 'Width b'), min: 1, max: 6, step: 0.5, default: 2, unit: 'cm', visibleIf: (v) => v.body === 'quader' },
    { key: 'c', type: 'number', group: 'size', label: L('Höhe c', 'Height c'), min: 1, max: 6, step: 0.5, default: 1.5, unit: 'cm', visibleIf: (v) => v.body === 'quader' },
    {
      key: 'ha',
      type: 'number',
      group: 'size',
      label: L('Höhe hₐ der Seitendreiecke', 'Height hₐ of the side triangles'),
      min: 1,
      max: 8,
      step: 0.5,
      default: 4,
      unit: 'cm',
      visibleIf: (v) => v.body === 'pyramide',
    },
    { key: 'r', type: 'number', group: 'size', label: L('Radius r', 'Radius r'), min: 0.5, max: 4, step: 0.5, default: 1.5, unit: 'cm', visibleIf: (v) => v.body === 'zylinder' },
    {
      key: 'h',
      type: 'number',
      group: 'size',
      label: L('Höhe h des Körpers', 'Height h of the solid'),
      min: 1,
      max: 8,
      step: 0.5,
      default: 4,
      unit: 'cm',
      visibleIf: (v) => v.body === 'prisma' || v.body === 'zylinder',
    },
    {
      key: 'pairs',
      type: 'boolean',
      group: 'view',
      label: L('Gegenüberliegende Flächen gleich färben', 'Colour opposite faces alike'),
      default: true,
      visibleIf: (v) => v.body === 'wuerfel' || v.body === 'quader',
    },
    { key: 'dice', type: 'boolean', group: 'view', label: L('Würfelaugen', 'Dice pips'), default: false, visibleIf: (v) => v.body === 'wuerfel' },
    { key: 'areas', type: 'boolean', group: 'view', label: L('Flächeninhalte im Netz', 'Areas in the net'), default: true },
    { key: 'dims', type: 'boolean', group: 'view', label: L('Maße', 'Dimensions'), default: true },
  ],
  actions: [{ id: 'fold', label: L('Falten', 'Fold'), primary: true }],
  readouts: [
    { key: 'check', label: L('Ist es ein Würfelnetz?', 'Is it a cube net?'), spoiler: true },
    { key: 'faces', label: L('Flächen des Netzes', 'Faces of the net') },
    { key: 'selected', label: L('Angetippte Fläche', 'Tapped face') },
    { key: 'surface', label: L('Oberflächeninhalt', 'Surface area'), spoiler: true },
  ],
  presets: [
    { id: 'start', label: L('Würfel: Kreuz', 'Cube: cross'), values: {} },
    { id: 'wrong', label: L('Ist das ein Würfelnetz?', 'Is this a cube net?'), values: { net: 3 } },
    { id: 'dice', label: L('Spielwürfel', 'Game die'), values: { net: 9, dice: true, f: 100 } },
    { id: 'cuboid', label: L('Quader 4 × 3 × 2', 'Cuboid 4 × 3 × 2'), values: { body: 'quader', a: 4, b: 3, c: 2 } },
    { id: 'pyramid', label: L('Pyramide', 'Pyramid'), values: { body: 'pyramide', a: 3, ha: 4, f: 70 } },
    { id: 'cylinder', label: L('Zylinder rollt sich', 'Cylinder rolls up'), values: { body: 'zylinder', r: 1.5, h: 4, f: 55 } },
  ],
  strings: {
    de: {
      canvas: 'Körpernetz, das sich in 3D zu einem Körper faltet; die Ansicht lässt sich drehen',
      fold: 'Falten',
      unfold: 'Aufklappen',
      wuerfel: 'Würfel',
      quader: 'Quader',
      prisma: 'Dreiseitiges Prisma',
      pyramide: 'Quadratische Pyramide',
      zylinder: 'Zylinder',
      netNo: 'Netz {n} von {m}',
      folded: '{p} % gefaltet',
      open: 'offen',
      overlap: 'doppelt',
      tap: 'Tippe auf eine Fläche.',
      yes: 'Ja – eines der 11 Würfelnetze.',
      no: 'Nein – beim Falten liegen Flächen doppelt, dafür bleibt eine Seite offen.',
      square: 'Quadrat',
      rect: 'Rechteck',
      triangle: 'Dreieck',
      circle: 'Kreis',
      mantle: 'Mantel (Rechteck)',
      opposite: 'gegenüber: gleich groß',
      facesCube: '6 gleich große Quadrate',
      facesCuboid: '3 Paare gleich großer Rechtecke',
      facesPrism: '2 gleichseitige Dreiecke (Grund- und Deckfläche) und 3 gleiche Rechtecke (Mantel)',
      facesPyramid: '1 Quadrat (Grundfläche) und 4 gleichschenklige Dreiecke (Mantel)',
      facesCylinder: '2 Kreise (Grund- und Deckfläche) und 1 Rechteck (Mantel), dessen Länge der Kreisumfang ist',
      haFix: 'hₐ muss größer als a/2 sein – gerechnet wird mit hₐ = {h} cm.',
    },
    en: {
      canvas: 'Net of a solid folding into the solid in 3D; the view can be rotated',
      fold: 'Fold',
      unfold: 'Unfold',
      wuerfel: 'Cube',
      quader: 'Cuboid',
      prisma: 'Triangular prism',
      pyramide: 'Square pyramid',
      zylinder: 'Cylinder',
      netNo: 'Net {n} of {m}',
      folded: '{p} % folded',
      open: 'open',
      overlap: 'twice',
      tap: 'Tap a face.',
      yes: 'Yes – one of the 11 cube nets.',
      no: 'No – when folded, faces overlap and one side stays open.',
      square: 'Square',
      rect: 'Rectangle',
      triangle: 'Triangle',
      circle: 'Circle',
      mantle: 'Lateral surface (rectangle)',
      opposite: 'opposite face: same size',
      facesCube: '6 equal squares',
      facesCuboid: '3 pairs of equal rectangles',
      facesPrism: '2 equilateral triangles (bases) and 3 equal rectangles (lateral surface)',
      facesPyramid: '1 square (base) and 4 isosceles triangles (lateral surface)',
      facesCylinder: '2 circles (bases) and 1 rectangle (lateral surface) whose length is the circumference',
      haFix: 'hₐ must be greater than a/2 – calculated with hₐ = {h} cm.',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const cm = (v: number, d = 2) => `${fmt.num(v, d)} cm`;
    const cm2 = (v: number, d = 2) => `${fmt.num(v, d)} cm²`;

    let selected: string | null = null;
    const view: View3D = new View3D(surface, {
      azimuth: 28,
      elevation: 38,
      elevationLimits: [6, 88],
      onTap: (px, py) => {
        const id = view.pick(px, py);
        selected = id === selected ? null : id;
        updateReadouts();
        ctx.requestRender();
      },
      tapCursor: (px: number, py: number): boolean => view.pick(px, py) !== null,
    });

    let net: BodyNet = buildNet('wuerfel', params());
    let check: CubeCheck | null = null;
    /** Angezeigte Faltung 0 … 1 (läuft beim Falten weich, der Regler folgt). */
    let shown = p.f / 100;
    let anim: { tween: Tween; from: number; to: number } | null = null;

    function params() {
      const haMin = p.a / 2 + 0.5;
      return { net: p.net, a: p.a, b: p.b, c: p.c, h: p.h, ha: Math.max(p.ha, haMin), r: p.r };
    }

    function rebuild(): void {
      net = buildNet(p.body as BodyId, params());
      check = p.body === 'wuerfel' ? checkCubeNet(net.faces, p.a) : null;
      if (selected && !net.faces.some((_, i) => faceId(i) === selected)) selected = null;
    }

    function faceId(i: number): string {
      return net.faces[i]!.mantle ? 'mantle' : `f${i}`;
    }

    function syncAction(): void {
      ctx.setAction('fold', { label: ctx.t((anim ? anim.to : shown) > 0.5 ? 'unfold' : 'fold') });
    }

    /* ---------- Ergebnisse ---------- */

    function updateReadouts(): void {
      const body = p.body as BodyId;
      const q = params();
      const a = q.a;
      if (check) ctx.readout('check', ctx.t(check.valid ? 'yes' : 'no'));
      else ctx.readout('check', null);
      const facesKey = { wuerfel: 'facesCube', quader: 'facesCuboid', prisma: 'facesPrism', pyramide: 'facesPyramid', zylinder: 'facesCylinder' }[body];
      ctx.readout('faces', ctx.t(facesKey));
      const v = (x: string) => `<var>${x}</var>`;
      const O = `${v('O')} = `;
      let html = '';
      switch (body) {
        case 'wuerfel':
          html = `${O}6 · ${v('a')}² = 6 · (${cm(a)})² = <strong>${cm2(net.surface)}</strong>`;
          break;
        case 'quader':
          html = `${O}2 · (${v('a')}${v('b')} + ${v('a')}${v('c')} + ${v('b')}${v('c')}) = 2 · (${fmt.num(a * q.b)} + ${fmt.num(a * q.c)} + ${fmt.num(q.b * q.c)}) cm² = <strong>${cm2(net.surface)}</strong>`;
          break;
        case 'prisma': {
          const G = (Math.sqrt(3) / 4) * a * a;
          html = `${O}2 · ${v('G')} + 3 · ${v('a')} · ${v('h')} ≈ 2 · ${cm2(G)} + 3 · ${cm(a)} · ${cm(q.h)} ≈ <strong>${cm2(net.surface)}</strong>`;
          break;
        }
        case 'pyramide':
          html = `${O}${v('a')}² + 4 · ½ · ${v('a')} · ${v('h')}<sub>a</sub> = ${fmt.num(a * a)} cm² + 4 · ${cm2((a * q.ha) / 2)} = <strong>${cm2(net.surface)}</strong>`;
          if (p.ha < q.ha) html += `<br><small>${tr('haFix', { h: fmt.num(q.ha) })}</small>`;
          break;
        case 'zylinder':
          html = `${O}2 · π${v('r')}² + 2π${v('r')} · ${v('h')} ≈ ${cm2(2 * Math.PI * q.r * q.r)} + ${cm2(2 * Math.PI * q.r * q.h)} ≈ <strong>${cm2(net.surface)}</strong>`;
          break;
      }
      ctx.readout('surface', { html });
      ctx.readout('selected', selectedText());
    }

    function selectedText(): string | { html: string } {
      if (!selected) return ctx.t('tap');
      const q = params();
      if (selected === 'mantle') {
        const u = 2 * Math.PI * q.r;
        return { html: `${ctx.t('mantle')}: ${cm(u)} × ${cm(q.h)} ≈ <strong>${cm2(u * q.h)}</strong>` };
      }
      const face = net.faces[Number(selected.slice(1))];
      if (!face) return ctx.t('tap');
      let html = '';
      switch (face.shape) {
        case 'square':
          html = `${ctx.t('square')}: ${cm(face.dims[0]!)} × ${cm(face.dims[1]!)} = <strong>${cm2(face.area)}</strong>`;
          break;
        case 'rect':
          html = `${ctx.t('rect')}: ${cm(face.dims[0]!)} × ${cm(face.dims[1]!)} = <strong>${cm2(face.area)}</strong>`;
          break;
        case 'triangle':
          html = `${ctx.t('triangle')}: ½ · ${cm(face.dims[0]!)} · ${cm(face.dims[1]!)} ≈ <strong>${cm2(face.area)}</strong>`;
          break;
        case 'circle':
          html = `${ctx.t('circle')}: π · (${cm(face.dims[0]!)})² ≈ <strong>${cm2(face.area)}</strong>`;
          break;
        default:
          break;
      }
      if ((p.body === 'wuerfel' || p.body === 'quader') && (!check || check.valid)) html += ` · ${ctx.t('opposite')}`;
      return { html };
    }

    /* ---------- Zeichnen ---------- */

    /** Flächenfarbe: Reihenfarbe, im hellen Modus etwas aufgehellt (wie farbiger Karton). */
    function faceColor(face: BodyFace, index: number): string {
      const s = ctx.theme.series;
      const body = p.body as BodyId;
      let color: string;
      if (body === 'wuerfel' || body === 'quader') {
        const group = !p.pairs ? 0 : check ? check.groups[index]! : face.group;
        color = [s[0]!, s[2]!, s[3]!][group]!;
      } else color = face.group === 0 ? s[3]! : s[0]!;
      return ctx.theme.dark ? color : mixColor(color, '#ffffff', 0.2);
    }

    /** Schrift und Würfelaugen auf den Flächen (dunkel auf hellem Karton). */
    function inkColor(): string {
      return ctx.theme.dark ? ctx.theme.bg : ctx.theme.text;
    }

    function markText(key: string): string {
      const q = params();
      switch (key) {
        case 'a':
          return `a = ${cm(q.a, 1)}`;
        case 'b':
          return `b = ${cm(q.b, 1)}`;
        case 'c':
          return `c = ${cm(q.c, 1)}`;
        case 'h':
          return `h = ${cm(q.h, 1)}`;
        case 'ha':
          return `hₐ = ${cm(q.ha, 1)}`;
        case 'ht':
          return 'hₐ';
        case 'r':
          return `r = ${cm(q.r, 1)}`;
        default:
          return key;
      }
    }

    function areaText(face: BodyFace): string {
      const exact = face.shape === 'square' || face.shape === 'rect' || (face.shape === 'triangle' && p.body === 'pyramide');
      return exact ? cm2(face.area, 2) : `≈ ${cm2(face.area, 1)}`;
    }

    function render(): void {
      // Faltung fortschreiben
      if (anim) {
        shown = anim.from + (anim.to - anim.from) * anim.tween.value;
        const percent = Math.round(shown * 100);
        if (percent !== p.f) ctx.set({ f: percent });
        if (!anim.tween.running) {
          shown = anim.to;
          anim = null;
          syncAction();
        }
      }
      const s = shown;
      const theme = ctx.theme;
      const faces = net.faces;
      const folded = foldNet(faces, s);
      const flat = faces.map((f) => f.points.map(([x, y]) => [x, y, 0] as Vec3));

      // Bildausschnitt: umschließende Kugel des aktuellen Zustands
      const all = folded.flat();
      const lo: [number, number, number] = [Infinity, Infinity, Infinity];
      const hi: [number, number, number] = [-Infinity, -Infinity, -Infinity];
      for (const q of all)
        for (let k = 0; k < 3; k++) {
          lo[k] = Math.min(lo[k]!, q[k]!);
          hi[k] = Math.max(hi[k]!, q[k]!);
        }
      const center: Vec3 = [(lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2, (lo[2] + hi[2]) / 2];
      let radius = 0;
      for (const q of all) radius = Math.max(radius, vec3.distance(q, center));
      const narrow = surface.width < 560;
      const fit = (narrow ? 1.02 : 0.82) + (narrow ? 0.4 : 0.6) * smooth(s);
      view.setScene({ target: center, radius: radius * fit, anchor: [0.5, 0.53] });

      view.begin();
      // Zentimeter-Gitter unter dem ebenen Netz
      const flatAll = flat.flat();
      const gx0 = Math.floor(Math.min(...flatAll.map((q) => q[0])) - 1);
      const gx1 = Math.ceil(Math.max(...flatAll.map((q) => q[0])) + 1);
      const gy0 = Math.floor(Math.min(...flatAll.map((q) => q[1])) - 1);
      const gy1 = Math.ceil(Math.max(...flatAll.map((q) => q[1])) + 1);
      view.grid({ min: [gx0, gy0], max: [gx1, gy1], step: 1, color: theme.grid });
      view.shadow(all, { alpha: 0.26 * s ** 3, blur: 26, spread: 1.02 });

      const edge = mixColor(theme.series[0]!, theme.dark ? '#000000' : '#0b1220', theme.dark ? 0.55 : 0.45);
      const highlight = theme.series[4]!;
      const settled = s < 0.02 || s > 0.98;
      const solidCenter = net.solidCenter;
      const camPos = view.camera.position;
      const wrong = check && !check.valid && s > 0.98;
      // gegenüberliegende Fläche (Würfel und Quader) zur angetippten Fläche
      const boxLike = (p.body === 'wuerfel' && check?.valid) || p.body === 'quader';
      const groups = check ? check.groups : faces.map((f) => f.group);
      const oppositeOf = (i: number): number | null => {
        if (!boxLike || !selected || selected === 'mantle') return null;
        const si = Number(selected.slice(1));
        if (si === i) return null;
        return groups[i] === groups[si] ? si : null;
      };

      let mantleLabel: string | null = null;
      faces.forEach((face, i) => {
        const pts = folded[i]!;
        const id = faceId(i);
        const isSel = selected === id;
        const isOpp = oppositeOf(i) !== null;
        let color = faceColor(face, i);
        if (isSel) color = mixColor(color, '#ffffff', 0.3);
        const overlapping = wrong && check!.overlaps.some(([x, y]) => x === i || y === i);
        const strip = face.mantle;
        const n = CYLINDER_STRIPS;
        const stripIndex = i - 1;
        const label: string | null = p.areas && settled && face.label && !(p.dice && p.body === 'wuerfel') ? areaText(face) : null;
        // Augen des Spielwürfels als Aufdruck
        let decals: { points: Vec3[]; color: string }[] | undefined;
        if (p.dice && check && p.body === 'wuerfel') {
          const [p0, p1, , p3] = pts as [Vec3, Vec3, Vec3, Vec3];
          const u = vec3.sub(p1, p0);
          const v = vec3.sub(p3, p0);
          const pipColor = inkColor();
          decals = PIPS[check.pips[i]!]!.map(([pu, pv]) =>
            Array.from({ length: 14 }, (_, k) => {
              const t = (k / 14) * Math.PI * 2;
              return vec3.add(p0, vec3.add(vec3.scale(u, pu + 0.085 * Math.cos(t)), vec3.scale(v, pv + 0.085 * Math.sin(t))));
            }),
          ).map((points) => ({ points, color: pipColor }));
        }
        // Mantel: Beschriftung separat (flach in der Mitte, gefaltet am vordersten Streifen)
        if (strip && label) mantleLabel = label;
        // Kreis mit Radius: Flächeninhalt etwas nach hinten versetzt
        const labelAt = face.shape === 'circle' && face.marks?.some((m) => m.key === 'r') ? mapNetPoint(face.points, pts, [face.points.reduce((q, v) => q + v[0], 0) / face.points.length - 0.45 * params().r, 0]) : undefined;
        view.face(pts, {
          color,
          gloss: strip ? 0.3 : 0.18,
          stroke: overlapping ? theme.series[1] : isSel || isOpp ? highlight : edge,
          width: overlapping || isSel ? 3 : isOpp ? 2.5 : 1.6,
          dash: isOpp ? [6, 4] : undefined,
          strokeEdges: strip ? [stripIndex === 0, true, stripIndex === n - 1, true] : undefined,
          id,
          decals,
          depthBias: isSel ? net.solidRadius * 0.02 : 0,
          label: label && !strip ? { text: label, size: narrow ? 11 : 13, weight: '700', at: labelAt } : undefined,
        });
      });
      if (mantleLabel) {
        let at = vec3.centroid(folded[1 + (CYLINDER_STRIPS - 1) / 2]!);
        if (s > 0.5) {
          // vorderster Streifen
          let best = Infinity;
          for (let i = 1; i <= CYLINDER_STRIPS; i++) {
            const c = vec3.centroid(folded[i]!);
            const d = view.project(c).depth;
            if (d < best) {
              best = d;
              at = c;
            }
          }
        }
        view.label(at, mantleLabel, {
          color: theme.text,
          size: narrow ? 11 : 13,
          weight: '700',
          align: 'center',
          baseline: 'middle',
          background: theme.dark ? 'rgba(15,20,30,0.78)' : 'rgba(255,255,255,0.82)',
        });
      }

      // verdeckte Kanten gestrichelt, wenn der Körper geschlossen ist
      if (s > 0.98 && p.body !== 'zylinder' && !wrong) {
        for (const pts of folded) {
          const c = vec3.centroid(pts);
          const outward = vec3.sub(c, solidCenter);
          if (vec3.dot(outward, vec3.sub(camPos, c)) > 0) continue;
          view.polyline(pts, { closed: true, color: mixColor(edge, theme.bg, 0.3), width: 1.2, dash: [5, 4], layer: 'front' });
        }
      }

      // Bemaßungen
      if (p.dims) {
        faces.forEach((face, i) => {
          for (const mark of face.marks ?? []) {
            if ((mark.when === 'flat' && s >= 0.5) || (mark.when === 'folded' && s < 0.9)) continue;
            const a = mapNetPoint(face.points, folded[i]!, mark.from);
            const b = mapNetPoint(face.points, folded[i]!, mark.to);
            if (mark.when === 'folded' && !edgeVisible(a, b, folded)) continue;
            // Höhen und Radien in verdeckten Flächen des geschlossenen Körpers weglassen
            if ((mark.dashed || mark.key === 'r') && s > 0.98 && !faceVisible(folded[i]!)) continue;
            // im ebenen Netz vom Flächenmittelpunkt weg, am Körper von dessen Mitte weg
            const away = mark.when === 'folded' ? solidCenter : vec3.centroid(folded[i]!);
            drawMark(a, b, away, markText(mark.key), mark.dashed ?? false, mark.key === 'r', mark.inside ?? false);
          }
        });
        if (p.body === 'zylinder') drawCircumference(folded);
      }

      // Falsches Netz: offene Seiten markieren
      if (wrong) {
        for (const slot of check!.missing) drawOpenSlot(slot);
        const [i] = check!.overlaps[0]!;
        view.label(vec3.centroid(folded[i]!), ctx.t('overlap'), { color: theme.series[1], size: 13, weight: '700', align: 'center', baseline: 'middle', background: mixColor(theme.bg, theme.series[1]!, 0.12) });
      }

      view.end();
      drawInfo(s, narrow);

      if (anim) ctx.requestRender();
    }

    /** Infokasten oben links: Körper, Netznummer und Fortschritt der Faltung. */
    function drawInfo(s: number, narrow: boolean): void {
      const theme = ctx.theme;
      const g = surface.g;
      const title = ctx.t(p.body as string) + (p.body === 'wuerfel' ? ` · ${tr('netNo', { n: p.net, m: CUBE_NETS.length })}` : '');
      const sub = tr('folded', { p: Math.round(s * 100) });
      const titleFont = `700 ${narrow ? 13 : 14}px ${theme.font}`;
      const subFont = `500 12px ${theme.font}`;
      g.save();
      g.font = titleFont;
      const w1 = g.measureText(title).width;
      g.font = subFont;
      const w2 = g.measureText(sub).width;
      const boxW = Math.max(w1 + 24, w2 + 110);
      g.fillStyle = theme.dark ? 'rgba(15,20,30,0.82)' : 'rgba(255,255,255,0.88)';
      roundRect(g, 10, 10, boxW, 46, 10);
      g.fill();
      g.fillStyle = theme.text;
      g.font = titleFont;
      g.textAlign = 'left';
      g.textBaseline = 'alphabetic';
      g.fillText(title, 22, 29);
      // Fortschrittsbalken der Faltung
      const barW = boxW - 24 - w2 - 10;
      g.fillStyle = mixColor(theme.muted, theme.bg, 0.75);
      roundRect(g, 22, 40, barW, 5, 2.5);
      g.fill();
      g.fillStyle = theme.series[0]!;
      roundRect(g, 22, 40, Math.max(5, barW * s), 5, 2.5);
      g.fill();
      g.fillStyle = theme.muted;
      g.font = subFont;
      g.textAlign = 'right';
      g.fillText(sub, 10 + boxW - 12, 47);
      g.restore();
    }

    /** Zeigt eine Fläche des geschlossenen Körpers zur Kamera? */
    function faceVisible(pts: Vec3[]): boolean {
      const c = vec3.centroid(pts);
      return vec3.dot(vec3.sub(c, net.solidCenter), vec3.sub(view.camera.position, c)) > 0;
    }

    /** Ist eine Kante des gefalteten Körpers sichtbar (gehört sie zu einer der Kamera zugewandten Fläche)? */
    function edgeVisible(a: Vec3, b: Vec3, folded: Vec3[][]): boolean {
      const tol = 1e-6 * Math.max(1, net.solidRadius);
      const cam = view.camera.position;
      return folded.some((pts) => {
        if (!pts.some((q) => vec3.distance(q, a) < tol) || !pts.some((q) => vec3.distance(q, b) < tol)) return false;
        const c = vec3.centroid(pts);
        return vec3.dot(vec3.sub(c, net.solidCenter), vec3.sub(cam, c)) > 0;
      });
    }

    /** Bemaßung: Text neben der Kantenmitte (vom Flächenmittelpunkt weg) bzw. gestrichelte Höhe mit Text. */
    function drawMark(a: Vec3, b: Vec3, away: Vec3, text: string, dashed: boolean, radiusLine: boolean, inside: boolean): void {
      const theme = ctx.theme;
      const mid = vec3.lerp(a, b, 0.5);
      if (dashed || radiusLine) {
        const ink = inkColor();
        view.segment(a, b, { color: ink, width: 1.6, dash: dashed ? [5, 4] : undefined, depthBias: 0.02 });
        if (radiusLine) view.point(a, { color: ink, radius: 3, depthBias: 0.02 });
        view.label(vec3.lerp(a, b, radiusLine ? 0.55 : 0.74), text, { color: ink, size: 12, weight: '700', align: 'left', baseline: 'middle', offset: [7, -1], layer: 'scene', depthBias: 0.03, halo: false });
        return;
      }
      const [mx, my] = view.toPx(mid);
      const [cx, cy] = view.toPx(away);
      let dx = mx - cx;
      let dy = my - cy;
      const len = Math.hypot(dx, dy) || 1;
      dx /= len;
      dy /= len;
      const [ax, ay] = view.toPx(a);
      const [bx, by] = view.toPx(b);
      // Text längs der Kante nicht über die Kante schieben: Abstand je nach Lage
      const along = Math.abs((bx - ax) * dy - (by - ay) * dx) / (Math.hypot(bx - ax, by - ay) || 1);
      const dist = (12 + (1 - along) * 22) * (inside ? -1 : 1);
      view.label(mid, text, { color: theme.text, size: 12, weight: '600', align: 'center', baseline: 'middle', offset: [dx * dist, dy * dist], layer: inside ? 'scene' : 'front', depthBias: 0.03 });
    }

    /** Untere Mantelkante des Zylinders: so lang wie der Kreisumfang (wickelt sich beim Falten um den Grundkreis). */
    function drawCircumference(folded: Vec3[][]): void {
      const theme = ctx.theme;
      const n = CYLINDER_STRIPS;
      const pts: Vec3[] = [folded[1]![1]!];
      for (let i = 0; i < n; i++) pts.push(folded[1 + i]![2]!);
      view.polyline(pts, { color: theme.series[1], width: 3.2, depthBias: 0.04 });
      const u = 2 * Math.PI * params().r;
      let at = pts[Math.floor(pts.length * 0.22)]!;
      if (shown >= 0.98) {
        // am gerollten Mantel: der Kamera nächster Punkt der Kante
        let best = Infinity;
        for (const q of pts) {
          const d = view.project(q).depth;
          if (d < best) {
            best = d;
            at = q;
          }
        }
      }
      view.label(at, `u = 2πr ≈ ${cm(u, 1)}`, { color: theme.series[1], size: 12, weight: '700', align: 'center', baseline: 'top', offset: [0, 10] });
    }

    function drawOpenSlot(slot: Vec3): void {
      const theme = ctx.theme;
      const h = p.a / 2;
      const c = net.solidCenter;
      const d = vec3.sub(slot, c);
      const axis = [Math.abs(d[0]), Math.abs(d[1]), Math.abs(d[2])].indexOf(Math.max(Math.abs(d[0]), Math.abs(d[1]), Math.abs(d[2])));
      const u: [number, number, number] = [0, 0, 0];
      const v: [number, number, number] = [0, 0, 0];
      u[(axis + 1) % 3] = h;
      v[(axis + 2) % 3] = h;
      const square = [
        vec3.sub(vec3.sub(slot, u), v),
        vec3.sub(vec3.add(slot, u), v),
        vec3.add(vec3.add(slot, u), v),
        vec3.add(vec3.sub(slot, u), v),
      ];
      view.face(square, { color: theme.series[1], alpha: 0.12, flat: true, stroke: theme.series[1], width: 2, dash: [6, 4], layer: 'front' });
      view.label(slot, ctx.t('open'), { color: theme.series[1], size: 13, weight: '700', align: 'center', baseline: 'middle', background: mixColor(theme.bg, theme.series[1]!, 0.12) });
    }

    return {
      update(changed, source) {
        if (source === 'input' && (changed.has('a') || changed.has('ha')) && p.body === 'pyramide' && p.ha < p.a / 2 + 0.5) {
          ctx.set({ ha: Math.ceil((p.a / 2 + 0.5) * 2) / 2 });
        }
        if (changed.has('f') && source !== 'sim') {
          anim = null;
          shown = p.f / 100;
        }
        if (['body', 'net', 'a', 'b', 'c', 'h', 'ha', 'r'].some((k) => changed.has(k))) rebuild();
        if (source === 'replace' || source === 'init') selected = null;
        syncAction();
        updateReadouts();
      },

      action(id) {
        if (id !== 'fold') return;
        const to = (anim ? anim.to : shown) > 0.5 ? 0 : 1;
        const from = shown;
        const duration = 2200 * Math.max(0.25, Math.abs(to - from));
        anim = { tween: new Tween(duration, ease.inOutCubic).play(), from, to };
        syncAction();
        ctx.requestRender();
      },

      resetView: () => view.resetView(false),

      render,

      destroy: () => surface.destroy(),
    };
  },
});
