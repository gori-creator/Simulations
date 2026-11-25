import { defineSimulation, Surface, text, withAlpha } from '../../../sim-core';
import { body, front, oblique, roofArea, roofSlope, side, top, type BodyId, type P2, type V3 } from './model';

const L = (de: string, en: string) => ({ de, en });
type Mode = 'dreitafel' | 'schraeg' | 'wahre';

/**
 * Baupläne und Bauzeichnungen: Dreitafelprojektion (Grund-, Auf- und
 * Seitenriss), Schrägbild mit wählbarem Winkel und Verkürzungsfaktor und
 * wahre Größe der Dachfläche.
 */
export default defineSimulation({
  id: 'bauzeichnungen',
  layout: { aspect: 1.4, aspectNarrow: 0.95 },
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Darstellung', 'View'),
      options: [
        { value: 'dreitafel', label: L('Dreitafelprojektion', 'Three-view drawing') },
        { value: 'schraeg', label: L('Schrägbild', 'Oblique drawing') },
        { value: 'wahre', label: L('Wahre Größe', 'True size') },
      ],
      default: 'dreitafel',
      display: 'buttons',
    },
    {
      key: 'body',
      type: 'choice',
      label: L('Gebäude', 'Building'),
      options: [
        { value: 'haus', label: L('Haus mit Satteldach', 'House with gable roof') },
        { value: 'walm', label: L('Haus mit Walmdach', 'House with hip roof') },
        { value: 'winkel', label: L('Winkelbau mit Flachdach', 'L-shaped building, flat roof') },
      ],
      default: 'haus',
      display: 'menu',
    },
    { key: 'a', type: 'number', label: L('Länge a', 'Length a'), min: 4, max: 14, step: 0.5, default: 10, unit: 'm' },
    { key: 'b', type: 'number', label: L('Breite b', 'Width b'), min: 3, max: 10, step: 0.5, default: 6, unit: 'm' },
    { key: 'h', type: 'number', label: L('Wandhöhe h', 'Wall height h'), min: 2, max: 8, step: 0.5, default: 3, unit: 'm' },
    { key: 'd', type: 'number', label: L('Dachhöhe', 'Roof height'), min: 0.5, max: 6, step: 0.5, default: 4, unit: 'm', visibleIf: (v) => v.body !== 'winkel' },
    { key: 'al', type: 'number', label: L('Winkel der Tiefenlinien', 'Angle of the depth lines'), min: 15, max: 75, step: 5, default: 45, unit: '°', visibleIf: (v) => v.mode === 'schraeg' },
    { key: 'k', type: 'number', label: L('Verkürzungsfaktor', 'Shortening factor'), min: 0.3, max: 1, step: 0.05, default: 0.5, visibleIf: (v) => v.mode === 'schraeg' },
  ],
  hint: (v) =>
    v.mode === 'wahre'
      ? L('Die Dachschräge ist im Grundriss verkürzt. In wahrer Größe erscheint sie nur im Seitenriss.', 'The roof slope is shortened in the plan. Only the side view shows it in true size.')
      : v.mode === 'schraeg'
        ? L('Vorderansicht in wahrer Größe, Tiefen schräg und verkürzt. Üblich: 45° und Faktor ½ (Kavalierprojektion).', 'Front view in true size, depths drawn at a slant and shortened. Usual: 45° and factor ½.')
        : L('Jede Ansicht zeigt den Körper senkrecht von einer Seite. Gleiche Punkte liegen auf denselben Ordnungslinien.', 'Each view shows the solid straight on from one side. The same points lie on the same projection lines.'),
  readouts: [
    { key: 'mass', label: L('Maße', 'Dimensions') },
    { key: 'info', label: L('Wahre Größen', 'True sizes'), spoiler: true },
  ],
  presets: [
    { id: 'haus', label: L('Einfamilienhaus', 'Family house'), values: { mode: 'dreitafel', body: 'haus', a: 10, b: 6, h: 3, d: 4 } },
    { id: 'walm', label: L('Walmdach', 'Hip roof'), values: { mode: 'dreitafel', body: 'walm', a: 12, b: 8, h: 3, d: 3 } },
    { id: 'kav', label: L('Schrägbild 45°, ½', 'Oblique 45°, ½'), values: { mode: 'schraeg', body: 'haus', al: 45, k: 0.5 } },
    { id: 'dach', label: L('Dachfläche in wahrer Größe', 'Roof surface in true size'), values: { mode: 'wahre', body: 'haus', a: 10, b: 6, h: 3, d: 4 } },
  ],
  strings: {
    de: {
      canvas: 'Bauzeichnung eines Gebäudes: Grund-, Auf- und Seitenriss, Schrägbild oder Vergleich der Dachfläche im Grundriss mit ihrer wahren Größe',
      aufriss: 'Aufriss (von vorn)',
      seitenriss: 'Seitenriss (von links)',
      grundriss: 'Grundriss (von oben)',
      schraeg: 'Schrägbild',
      profil: 'Seitenriss: Dachschräge in wahrer Länge',
      imGrund: 'im Grundriss',
      wahr: 'wahre Größe',
      mass: 'a = {a} m, b = {b} m, Wand {h} m, First {f} m hoch',
      massW: 'a = {a} m, b = {b} m, Höhe {h} m (Flachdach)',
      info: 'Dachschräge s = √({b2}² + {d}²) ≈ {s} m (im Grundriss nur {b2} m); Dachfläche ≈ {A} m² (im Grundriss {G} m²)',
      infoW: 'Flachdach: Alle Flächen liegen parallel zu einer Tafel und erscheinen dort in wahrer Größe.',
      front: 'Vorderfläche in wahrer Größe',
    },
    en: {
      canvas: 'Building drawing: plan, front and side view, oblique drawing, or comparison of the roof surface in the plan with its true size',
      aufriss: 'Front view',
      seitenriss: 'Side view (from the left)',
      grundriss: 'Plan (from above)',
      schraeg: 'Oblique drawing',
      profil: 'Side view: roof slope in true length',
      imGrund: 'in the plan',
      wahr: 'true size',
      mass: 'a = {a} m, b = {b} m, wall {h} m, ridge {f} m high',
      massW: 'a = {a} m, b = {b} m, height {h} m (flat roof)',
      info: 'Roof slope s = √({b2}² + {d}²) ≈ {s} m (only {b2} m in the plan); roof surface ≈ {A} m² ({G} m² in the plan)',
      infoW: 'Flat roof: all faces are parallel to a projection plane and appear there in true size.',
      front: 'front face in true size',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const mode = () => p.mode as Mode;
    const id = () => p.body as BodyId;
    const n = (v: number, d = 2) => fmt.num(v, d);
    const dRoof = () => (id() === 'winkel' ? 0 : p.d);

    function updateReadouts(): void {
      if (id() === 'winkel') {
        ctx.readout('mass', tr('massW', { a: n(p.a, 1), b: n(p.b, 1), h: n(p.h, 1) }));
        ctx.readout('info', ctx.t('infoW'));
        return;
      }
      ctx.readout('mass', tr('mass', { a: n(p.a, 1), b: n(p.b, 1), h: n(p.h, 1), f: n(p.h + p.d, 1) }));
      const s = roofSlope(id(), p.a, p.b, p.h, p.d)!;
      const A = roofArea(id(), p.a, p.b, p.h, p.d)!;
      ctx.readout('info', tr('info', { b2: n(p.b / 2, 2), d: n(p.d, 1), s: n(s.real, 2), A: n(A.real, 1), G: n(A.inTop, 1) }));
    }

    /** Kanten eines Körpers in einer Projektion zeichnen. */
    function drawEdges(g: CanvasRenderingContext2D, proj: (p: V3) => P2, map: (q: P2) => P2, color: string, width = 2, highlight?: (a: V3, b: V3) => string | null): void {
      const B = body(id(), p.a, p.b, p.h, dRoof());
      for (const [i, j] of B.edges) {
        const A = B.vertices[i]!;
        const C = B.vertices[j]!;
        const [x1, y1] = map(proj(A));
        const [x2, y2] = map(proj(C));
        const hc = highlight ? highlight(A, C) : null;
        g.strokeStyle = hc ?? color;
        g.lineWidth = hc ? width + 1 : width;
        g.beginPath();
        g.moveTo(x1, y1);
        g.lineTo(x2, y2);
        g.stroke();
      }
    }

    function dashed(g: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color: string): void {
      g.save();
      g.setLineDash([4, 5]);
      g.strokeStyle = color;
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(x1, y1);
      g.lineTo(x2, y2);
      g.stroke();
      g.restore();
    }

    function drawThreeView(g: CanvasRenderingContext2D, W: number, H: number): void {
      const th = ctx.theme;
      const X = p.a;
      const Y = p.b;
      const Z = p.h + dRoof();
      const m = 26;
      const gapU = 0.18 * Math.max(X, Y, Z);
      const s = Math.min((W - 2 * m) / (X + Y + gapU), (H - 2 * m - 30) / (Z + Y + gapU));
      const ox = m;
      const oyA = m + 18 + Z * s; // Grundlinie des Aufrisses
      const oxS = ox + (X + gapU) * s;
      const oyG = oyA + gapU * s; // obere Kante des Grundrisses
      const fs = Math.max(11, Math.min(14, s * 0.9));
      const col = th.series[0]!;
      // Ordnungslinien
      const B = body(id(), p.a, p.b, p.h, dRoof());
      for (const v of B.vertices) {
        dashed(g, ox + v[0] * s, oyA - v[2] * s, ox + v[0] * s, oyG + v[1] * s, withAlpha(th.muted, 0.5));
        dashed(g, ox + v[0] * s, oyA - v[2] * s, oxS + (Y - v[1]) * s, oyA - v[2] * s, withAlpha(th.muted, 0.5));
      }
      drawEdges(g, front, ([x, z]) => [ox + x * s, oyA - z * s], col);
      drawEdges(g, side, ([y, z]) => [oxS + (Y - y) * s, oyA - z * s], th.series[3]!);
      drawEdges(g, top, ([x, y]) => [ox + x * s, oyG + y * s], th.series[2]!);
      const short = (k: string) => (W < 600 ? ctx.t(k).replace(/\s*\(.*\)$/, '') : ctx.t(k));
      text(g, short('aufriss'), ox, m + 4, { font: `700 ${fs}px ${th.font}`, color: col, align: 'left' });
      text(g, short('seitenriss'), oxS, m + 4, { font: `700 ${fs}px ${th.font}`, color: th.series[3]!, align: 'left' });
      text(g, short('grundriss'), ox, oyG + Y * s + 16, { font: `700 ${fs}px ${th.font}`, color: th.series[2]!, align: 'left' });
      // Maße
      text(g, `${n(p.a, 1)} m`, ox + (X * s) / 2, oyA + 12, { font: `600 ${fs - 1}px ${th.font}`, color: th.muted });
      text(g, `${n(p.b, 1)} m`, oxS + (Y * s) / 2, oyA + 12, { font: `600 ${fs - 1}px ${th.font}`, color: th.muted });
    }

    function drawOblique(g: CanvasRenderingContext2D, W: number, H: number): void {
      const th = ctx.theme;
      const B = body(id(), p.a, p.b, p.h, dRoof());
      const pts = B.vertices.map((v) => oblique(v, p.al, p.k));
      const xs = pts.map((q) => q[0]);
      const ys = pts.map((q) => q[1]);
      const m = 30;
      const w = Math.max(...xs) - Math.min(...xs);
      const h = Math.max(...ys) - Math.min(...ys);
      const s = Math.min((W - 2 * m) / w, (H - 2 * m - 20) / h);
      const ox = (W - w * s) / 2 - Math.min(...xs) * s;
      const oy = (H + h * s) / 2 + Math.min(...ys) * s + 10;
      const frontEdge = (A: V3, C: V3) => (A[1] === 0 && C[1] === 0 ? th.series[1]! : null);
      // Bodenrechteck leicht füllen
      g.fillStyle = withAlpha(th.series[0]!, 0.08);
      g.beginPath();
      const floor = id() === 'winkel' ? B.vertices.slice(0, 6) : B.vertices.slice(0, 4);
      floor.forEach((v, i) => {
        const [x, y] = oblique(v, p.al, p.k);
        if (i === 0) g.moveTo(ox + x * s, oy - y * s);
        else g.lineTo(ox + x * s, oy - y * s);
      });
      g.closePath();
      g.fill();
      drawEdges(g, (v) => oblique(v, p.al, p.k), ([x, y]) => [ox + x * s, oy - y * s], th.series[0]!, 2, frontEdge);
      text(g, `${ctx.t('schraeg')}: ${n(p.al, 0)}°, k = ${n(p.k, 2)}`, 14, 16, { font: `700 14px ${th.font}`, color: th.text, align: 'left' });
      text(g, ctx.t('front'), 14, 36, { font: `600 13px ${th.font}`, color: th.series[1]!, align: 'left' });
    }

    function drawTrue(g: CanvasRenderingContext2D, W: number, H: number): void {
      const th = ctx.theme;
      const narrow = W < 600;
      if (id() === 'winkel') {
        drawThreeView(g, W, H);
        return;
      }
      const sl = roofSlope(id(), p.a, p.b, p.h, p.d)!;
      const half = p.b / 2;
      // links: Seitenriss (Profil)
      const panelW = narrow ? W - 20 : W * 0.42;
      const panelH = narrow ? H * 0.42 : H - 40;
      const s1 = Math.min((panelW - 40) / p.b, (panelH - 60) / (p.h + p.d));
      const ox = 20 + (panelW - p.b * s1) / 2;
      const oy = 30 + panelH - 20;
      drawEdges(g, side, ([y, z]) => [ox + (p.b - y) * s1, oy - z * s1], th.muted);
      // Dachschräge hervorheben
      g.strokeStyle = th.series[1]!;
      g.lineWidth = 4;
      g.beginPath();
      g.moveTo(ox + p.b * s1, oy - p.h * s1);
      g.lineTo(ox + half * s1, oy - (p.h + p.d) * s1);
      g.stroke();
      text(g, `s ≈ ${n(sl.real, 2)} m`, ox + (p.b - half / 2) * s1 + 10, oy - (p.h + p.d / 2) * s1 - 6, { font: `700 13px ${th.font}`, color: th.series[1]!, align: 'left' });
      text(g, `${n(half, 2)} m`, ox + (p.b - half / 2) * s1, oy - p.h * s1 + 14, { font: `600 12px ${th.font}`, color: th.muted });
      text(g, ctx.t('profil'), 20, 18, { font: `700 13px ${th.font}`, color: th.text, align: 'left' });
      // rechts/unten: Dachfläche im Grundriss und in wahrer Größe
      const rx = narrow ? 20 : W * 0.5;
      const ry = narrow ? H * 0.5 : 30;
      const rw = narrow ? W - 40 : W * 0.46;
      const rh = narrow ? H * 0.46 : H - 60;
      const inset = id() === 'walm' ? Math.min(half, p.a / 2) : 0;
      const s2 = Math.min(rw / p.a, (rh - 80) / (half + sl.real));
      const shape = (depth: number, y0: number, color: string, label: string) => {
        const x0 = rx + (rw - p.a * s2) / 2;
        g.fillStyle = withAlpha(color, 0.18);
        g.strokeStyle = color;
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(x0, y0 + depth * s2);
        g.lineTo(x0 + p.a * s2, y0 + depth * s2);
        g.lineTo(x0 + (p.a - inset) * s2, y0);
        g.lineTo(x0 + inset * s2, y0);
        g.closePath();
        g.fill();
        g.stroke();
        g.font = `700 13px ${th.font}`;
        const fitsInside = g.measureText(label).width < (p.a - 2 * inset) * s2 - 8 && depth * s2 > 20;
        if (fitsInside) text(g, label, x0 + (p.a * s2) / 2, y0 + (depth * s2) / 2, { font: `700 13px ${th.font}`, color });
        else text(g, label, x0 + (p.a * s2) / 2, y0 + depth * s2 + 13, { font: `700 12px ${th.font}`, color });
      };
      shape(half, ry + 18, th.series[2]!, `${ctx.t('imGrund')}: ${n(half, 2)} m`);
      shape(sl.real, ry + 18 + half * s2 + 40, th.series[1]!, `${ctx.t('wahr')}: ${n(sl.real, 2)} m`);
    }

    return {
      update() {
        updateReadouts();
      },
      render() {
        const g = surface.begin();
        const W = surface.width;
        const H = surface.height;
        if (mode() === 'schraeg') drawOblique(g, W, H);
        else if (mode() === 'wahre') drawTrue(g, W, H);
        else drawThreeView(g, W, H);
      },
      destroy: () => surface.destroy(),
    };
  },
});
