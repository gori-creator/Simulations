import { defineSimulation, Surface, View3D } from '../../../sim-core';
import { counts, DUAL_OF, dual, PLATONIC, solid, type Poly, type SolidId } from './model';

const L = (de: string, en: string) => ({ de, en });

const NAMES: Record<SolidId, { de: string; en: string }> = {
  tetra: L('Tetraeder', 'tetrahedron'),
  hexa: L('Würfel (Hexaeder)', 'cube (hexahedron)'),
  okta: L('Oktaeder', 'octahedron'),
  dodeka: L('Dodekaeder', 'dodecahedron'),
  ikosa: L('Ikosaeder', 'icosahedron'),
  prisma: L('Prisma', 'prism'),
  pyramide: L('Pyramide', 'pyramid'),
};

/**
 * Platonische Körper drehbar in 3D: Ecken, Kanten und Flächen zählen,
 * Eulerscher Polyedersatz (auch für Prisma und Pyramide) und dualer Körper.
 */
export default defineSimulation({
  id: 'platonische-koerper',
  layout: { aspect: 1.5, aspectNarrow: 0.95 },
  params: [
    {
      key: 'k',
      type: 'choice',
      label: L('Körper', 'Solid'),
      options: (Object.keys(NAMES) as SolidId[]).map((id) => ({ value: id, label: NAMES[id] })),
      default: 'ikosa',
      display: 'menu',
    },
    { key: 'n', type: 'number', label: L('Ecken der Grundfläche', 'Vertices of the base'), min: 3, max: 10, step: 1, default: 5, visibleIf: (v) => v.k === 'prisma' || v.k === 'pyramide' },
    {
      key: 'mark',
      type: 'choice',
      label: L('Markieren', 'Highlight'),
      options: [
        { value: 'keine', label: L('nichts', 'nothing') },
        { value: 'ecken', label: L('Ecken', 'vertices') },
        { value: 'flaechen', label: L('Flächen nummerieren', 'number the faces') },
      ],
      default: 'keine',
      display: 'buttons',
    },
    { key: 'dual', type: 'boolean', label: L('dualen Körper einzeichnen', 'draw the dual solid'), default: false, visibleIf: (v) => v.k !== 'prisma' && v.k !== 'pyramide' },
  ],
  hint: () =>
    L(
      'Drehe den Körper durch Ziehen. Zähle Ecken, Kanten und Flächen – und rechne e − k + f.',
      'Drag to turn the solid. Count the vertices, edges and faces – and work out V − E + F.',
    ),
  readouts: [
    { key: 'name', label: L('Körper', 'Solid') },
    { key: 'cnt', label: L('Ecken, Kanten, Flächen', 'Vertices, edges, faces'), spoiler: true },
    { key: 'euler', label: L('Eulerscher Polyedersatz', 'Euler’s polyhedron formula'), spoiler: true },
    { key: 'form', label: L('Aufbau', 'Structure'), spoiler: true },
    { key: 'dual', label: L('Dualer Körper', 'Dual solid') },
  ],
  presets: [
    { id: 'tetra', label: L('Tetraeder', 'Tetrahedron'), values: { k: 'tetra', mark: 'ecken', dual: false } },
    { id: 'wuerfel', label: L('Würfel mit Oktaeder', 'Cube with octahedron'), values: { k: 'hexa', mark: 'keine', dual: true } },
    { id: 'dodeka', label: L('Dodekaeder', 'Dodecahedron'), values: { k: 'dodeka', mark: 'flaechen', dual: false } },
    { id: 'prisma', label: L('Euler am Prisma', 'Euler for a prism'), values: { k: 'prisma', n: 6, mark: 'ecken' } },
  ],
  strings: {
    de: {
      canvas: 'Drehbarer Körper in 3D mit sichtbaren und gestrichelten verdeckten Kanten',
      cnt: 'e = {e} Ecken, k = {k} Kanten, f = {f} Flächen',
      euler: 'e − k + f = {e} − {k} + {f} = {r}',
      formP: 'lauter gleiche {s}, an jeder Ecke treffen {d} zusammen',
      formO: 'Flächen mit {s} Ecken, an den Ecken treffen {d} Flächen zusammen – kein platonischer Körper',
      tri: 'gleichseitige Dreiecke',
      quad: 'Quadrate',
      pent: 'regelmäßige Fünfecke',
      dual: '{d} (Flächenmitten werden zu Ecken)',
      self: 'Tetraeder – das Tetraeder ist zu sich selbst dual',
      none: 'nur für platonische Körper',
      and: ' und ',
    },
    en: {
      canvas: 'Rotatable solid in 3D with visible edges and dashed hidden edges',
      cnt: 'V = {e} vertices, E = {k} edges, F = {f} faces',
      euler: 'V − E + F = {e} − {k} + {f} = {r}',
      formP: 'all faces are identical {s}, {d} meet at every vertex',
      formO: 'faces with {s} vertices, {d} faces meet at the vertices – not a Platonic solid',
      tri: 'equilateral triangles',
      quad: 'squares',
      pent: 'regular pentagons',
      dual: '{d} (face centres become vertices)',
      self: 'tetrahedron – the tetrahedron is dual to itself',
      none: 'only for Platonic solids',
      and: ' and ',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const id = () => p.k as SolidId;
    const name = (s: SolidId) => NAMES[s][ctx.lang];
    const view = new View3D(surface, { azimuth: 30, elevation: 20, radius: 1.15, zoom: false, controls: false });

    let body: Poly = solid('ikosa');
    let dualBody: Poly | null = null;
    let key = '';

    function rebuild(): void {
      const k = `${p.k}|${p.n}`;
      if (k === key) return;
      key = k;
      body = solid(id(), p.n);
      dualBody = PLATONIC.includes(id()) ? dual(body) : null;
    }

    function updateReadouts(): void {
      const c = counts(body);
      ctx.readout('name', name(id()).replace(/^./, (ch) => ch.toUpperCase()));
      ctx.readout('cnt', tr('cnt', { e: c.e, k: c.k, f: c.f }));
      ctx.readout('euler', tr('euler', { e: c.e, k: c.k, f: c.f, r: c.e - c.k + c.f }));
      const sideName = (s: number) => ctx.t(s === 3 ? 'tri' : s === 4 ? 'quad' : 'pent');
      const platonic = PLATONIC.includes(id());
      ctx.readout(
        'form',
        platonic
          ? tr('formP', { s: sideName(c.faceSides[0]!), d: c.vertexDegrees[0]! })
          : tr('formO', { s: c.faceSides.join(ctx.t('and')), d: c.vertexDegrees.join(ctx.t('and')) }),
      );
      const d = DUAL_OF[id()];
      ctx.readout('dual', !d ? ctx.t('none') : d === 'tetra' ? ctx.t('self') : tr('dual', { d: name(d).replace(/^./, (ch) => ch.toUpperCase()) }));
    }

    function render(): void {
      const th = ctx.theme;
      surface.begin();
      view.resize();
      view.begin();
      const col = th.series[0]!;
      view.mesh(body, {
        color: col,
        alpha: p.dual ? 0.28 : 0.82,
        edgeColor: th.text,
        edgeWidth: 2,
        edgeAngle: 1,
        hiddenEdges: true,
        gloss: 0.25,
        cull: false,
      });
      if (p.mark === 'flaechen') {
        body.faces.forEach((f, i) => {
          const c: [number, number, number] = [0, 0, 0];
          for (const v of f) {
            c[0] += body.vertices[v]![0] / f.length;
            c[1] += body.vertices[v]![1] / f.length;
            c[2] += body.vertices[v]![2] / f.length;
          }
          view.label([c[0] * 1.02, c[1] * 1.02, c[2] * 1.02], String(i + 1), { size: 13, weight: '700', layer: 'scene', color: th.text });
        });
      }
      if (p.mark === 'ecken') for (const v of body.vertices) view.point(v, { color: th.series[1]!, radius: 5.5 });
      if (p.dual && dualBody) {
        view.mesh(dualBody, { color: th.series[3]!, alpha: 0.75, edgeColor: th.series[3]!, edgeWidth: 1.8, edgeAngle: 1, gloss: 0.2, cull: false });
      }
      view.end();
    }

    return {
      update() {
        rebuild();
        updateReadouts();
      },
      render,
      destroy: () => surface.destroy(),
    };
  },
});
