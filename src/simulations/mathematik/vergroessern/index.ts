import { defineSimulation, ease, mesh3d, mixColor, prefersReducedMotion, roundRect, Surface, text, vec3, View3D, withAlpha, type Rect, type Vec3 } from '../../../sim-core';
import { cells, scaleArea, scaleLength, scaleVolume, unitCuts, type Dims } from './model';

const L = (de: string, en: string) => ({ de, en });
type Obj = 'w' | 'q';
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const KMAX = 4;
/** Maße des Ausgangskörpers: Tiefe (x₁), Breite (x₂), Höhe (x₃) in cm. */
const BASE: Record<Obj, Dims> = { w: [1, 1, 1], q: [1, 2, 1] };

/**
 * Vergrößern mit dem Streckfaktor k: Eine Strecke wird k-mal so lang, ein
 * Quadrat bzw. Rechteck besteht aus k² Einheitsflächen, ein Würfel bzw.
 * Quader aus k³ Einheitswürfeln (3D, drehbar, baut sich Schicht für Schicht
 * auf). Eine kleine Kurve vergleicht k, k² und k³.
 */
export default defineSimulation({
  id: 'vergroessern',
  layout: { aspect: 1.62, aspectNarrow: 0.5 },
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    { key: 'k', type: 'number', label: L('Streckfaktor k', 'Scale factor k'), min: 0.5, max: KMAX, step: 0.5, default: 2 },
    {
      key: 'obj',
      type: 'choice',
      label: L('Ausgangskörper', 'Starting solid'),
      options: [
        { value: 'w', label: L('Würfel 1 cm × 1 cm × 1 cm', 'Cube 1 cm × 1 cm × 1 cm') },
        { value: 'q', label: L('Quader 1 cm × 2 cm × 1 cm', 'Cuboid 1 cm × 2 cm × 1 cm') },
      ],
      default: 'w',
    },
    { key: 'show', type: 'boolean', group: 'view', label: L('Faktoren zeigen', 'Show the factors'), help: L('Aus: k², k³ und die neuen Werte selbst bestimmen.', 'Off: find k², k³ and the new values yourself.'), default: true },
  ],
  actions: [{ id: 'build', label: L('Würfel neu aufbauen', 'Rebuild the cubes'), primary: true }],
  readouts: [
    { key: 'len', label: L('Länge', 'Length'), spoiler: true },
    { key: 'area', label: L('Flächeninhalt', 'Area'), spoiler: true },
    { key: 'vol', label: L('Volumen', 'Volume'), spoiler: true },
  ],
  presets: [
    { id: 'two', label: L('k = 2: 4-fache Fläche, 8-faches Volumen', 'k = 2: 4 times the area, 8 times the volume'), values: {} },
    { id: 'three', label: L('k = 3', 'k = 3'), values: { k: 3 } },
    { id: 'four', label: L('k = 4: 64 Würfel', 'k = 4: 64 cubes'), values: { k: 4 } },
    { id: 'half', label: L('k = 0,5: Verkleinern', 'k = 0.5: reducing'), values: { k: 0.5 } },
    { id: 'quader', label: L('Quader mit k = 2', 'Cuboid with k = 2'), values: { obj: 'q', k: 2 } },
    { id: 'frac', label: L('k = 1,5', 'k = 1.5'), values: { k: 1.5 } },
  ],
  strings: {
    de: {
      canvas: 'Drei Ansichten zum Streckfaktor k: eine Strecke und ihr Bild, ein Rechteck aus Einheitsquadraten und ein Körper aus Einheitswürfeln (drehbar); daneben eine Übersicht der Faktoren k, k² und k³.',
      lenT: 'Länge · k',
      areaT: 'Flächeninhalt · k²',
      volT: 'Volumen · k³',
      sumT: 'Was passiert mit …',
      len: 'Länge',
      area: 'Fläche',
      vol: 'Volumen',
      orig: 'Original',
      image: 'Bild',
      units: '{n} Einheitsquadrate',
      cubes: '{n} Einheitswürfel',
      merke: 'Alle Längen werden mit k multipliziert, Flächen mit k², Volumina mit k³. Darum wächst das Volumen viel schneller als die Fläche.',
      half: 'k < 1: Verkleinerung',
      lenRead: '{a} → {b} (· {k})',
      areaRead: '{a} → {b} (· {k}² = · {k2})',
      volRead: '{a} → {b} (· {k}³ = · {k3})',
      chart: 'Faktor',
    },
    en: {
      canvas: 'Three views of the scale factor k: a segment and its image, a rectangle made of unit squares and a solid made of unit cubes (rotatable); next to it an overview of the factors k, k² and k³.',
      lenT: 'Length · k',
      areaT: 'Area · k²',
      volT: 'Volume · k³',
      sumT: 'What happens to …',
      len: 'length',
      area: 'area',
      vol: 'volume',
      orig: 'original',
      image: 'image',
      units: '{n} unit squares',
      cubes: '{n} unit cubes',
      merke: 'All lengths are multiplied by k, areas by k², volumes by k³. That is why the volume grows much faster than the area.',
      half: 'k < 1: reduction',
      lenRead: '{a} → {b} (· {k})',
      areaRead: '{a} → {b} (· {k}² = · {k2})',
      volRead: '{a} → {b} (· {k}³ = · {k3})',
      chart: 'factor',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const reduced = prefersReducedMotion();
    const th = () => ctx.theme;
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (m, k: string) => String(vars[k] ?? m));
    const wideLayout = () => surface.width >= 640 || surface.width >= surface.height * 1.3;
    const F = (w: number, n: number) => (surface.width >= 640 ? w : n);
    const font = (weight: number, size: number) => `${weight} ${size}px ${th().font}`;
    const obj = () => p.obj as Obj;
    const n = (v: number) => fmt.num(Math.round(v * 1000) / 1000, 3);

    const col = {
      len: () => th().series[0]!,
      area: () => th().series[2]!,
      vol: () => th().series[4]!,
      orig: () => th().series[3]!,
    };

    /* ---------- Aufteilung ---------- */
    type Lay = { view: Rect; len: Rect; area: Rect; sum: Rect };
    function layout(): Lay {
      const W = surface.width;
      const H = surface.height;
      const gap = F(10, 8);
      if (wideLayout()) {
        const lw = Math.round(clamp(W * 0.36, 230, 340));
        const lh = Math.round(clamp(H * 0.22, 92, 120));
        const ah = Math.round((H - lh - 2 * gap) * 0.55);
        return {
          len: { x: 2, y: 2, w: lw, h: lh },
          area: { x: 2, y: 2 + lh + gap, w: lw, h: ah },
          sum: { x: 2, y: 2 + lh + gap + ah + gap, w: lw, h: H - lh - ah - 2 * gap - 4 },
          view: { x: lw + gap + 2, y: 2, w: W - lw - gap - 4, h: H - 4 },
        };
      }
      const vh = Math.round(H * 0.4);
      const rh = Math.round(H * 0.25);
      const half = (W - 4 - gap) / 2;
      return {
        view: { x: 2, y: 2, w: W - 4, h: vh },
        len: { x: 2, y: vh + gap, w: half, h: rh },
        area: { x: 2 + half + gap, y: vh + gap, w: half, h: rh },
        sum: { x: 2, y: vh + rh + 2 * gap, w: W - 4, h: H - vh - rh - 2 * gap - 2 },
      };
    }

    const view = new View3D(surface, { region: () => layout().view, azimuth: 35, elevation: 24, elevationLimits: [-5, 80] });

    /* ---------- Zustand ---------- */
    let kShown = p.k;
    let build: { t0: number } | null = reduced ? null : { t0: performance.now() };
    let frame: { target: Vec3; radius: number } | null = null;
    let lastFrame = performance.now();
    const BUILD_LAYER = 0.55;

    function updateReadouts(): void {
      const b = BASE[obj()];
      const L0 = b[1];
      const A0 = b[0] * b[1];
      const V0 = b[0] * b[1] * b[2];
      const k = p.k;
      ctx.readout('len', tr('lenRead', { a: `${n(L0)} cm`, b: `${n(scaleLength(L0, k))} cm`, k: n(k) }));
      ctx.readout('area', tr('areaRead', { a: `${n(A0)} cm²`, b: `${n(scaleArea(A0, k))} cm²`, k: n(k), k2: n(k * k) }));
      ctx.readout('vol', tr('volRead', { a: `${n(V0)} cm³`, b: `${n(scaleVolume(V0, k))} cm³`, k: n(k), k3: n(k ** 3) }));
      ctx.setAction('build', { enabled: true });
    }

    /* ---------- Bausteine ---------- */
    function card(r: Rect, accent?: string, tint = 0): void {
      const g = surface.g;
      const theme = th();
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
    function title(x: number, y: number, label: string, color = th().muted): void {
      text(surface.g, label, x, y, { font: font(700, F(12, 11)), color, align: 'left' });
    }
    /* ---------- Länge ---------- */
    function lenPanel(R: Rect): void {
      const g = surface.g;
      const theme = th();
      const pad = F(14, 10);
      card(R);
      title(R.x + pad, R.y + 16, ctx.t('lenT'), col.len());
      const L0 = BASE[obj()][1];
      const k = kShown;
      const u = (R.w - 2 * pad - 54) / (Math.max(k, 2) * L0);
      const bar = (y: number, len: number, color: string, label: string) => {
        const x0 = R.x + pad;
        const w = len * u;
        const grad = g.createLinearGradient(0, y - 6, 0, y + 6);
        grad.addColorStop(0, withAlpha(color, 0.95));
        grad.addColorStop(1, withAlpha(color, 0.7));
        g.fillStyle = grad;
        roundRect(g, x0, y - 6, Math.max(2, w), 12, 4);
        g.fill();
        // Einheitsteilung
        g.strokeStyle = theme.dark ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.85)';
        g.lineWidth = 1.5;
        let x = 0;
        for (const s of unitCuts(len)) {
          x += s;
          if (x < len - 1e-6) {
            g.beginPath();
            g.moveTo(x0 + x * u, y - 6);
            g.lineTo(x0 + x * u, y + 6);
            g.stroke();
          }
        }
        text(g, label, x0 + w + 6, y, { font: font(700, F(12, 11)), color, align: 'left' });
      };
      const top = R.y + 30;
      const span = R.h - 30 - 8;
      bar(top + span * 0.28, L0, col.orig(), `${n(L0)} cm`);
      bar(top + span * 0.75, L0 * k, col.len(), `${p.show ? n(L0 * p.k) : '?'} cm`);
    }

    /* ---------- Fläche ---------- */
    function areaPanel(R: Rect): void {
      const g = surface.g;
      const theme = th();
      const pad = F(14, 10);
      card(R);
      title(R.x + pad, R.y + 16, ctx.t('areaT'), col.area());
      const b = BASE[obj()];
      const w0 = b[1];
      const d0 = b[0];
      const k = kShown;
      const top = R.y + 28;
      const avW = R.w - 2 * pad;
      const avH = R.h - 28 - 26;
      const kk = Math.max(k, 2);
      const s = Math.min(avW / (kk * w0), avH / (kk * d0));
      const W = w0 * k * s;
      const Hh = d0 * k * s;
      const x0 = R.x + pad + (avW - W) / 2;
      const y0 = top + (avH - Hh) / 2;
      // Zellen
      let yy = 0;
      let row = 0;
      for (const sy of unitCuts(d0 * k)) {
        let xx = 0;
        let colI = 0;
        for (const sx of unitCuts(w0 * k)) {
          const inOrig = xx < w0 - 1e-9 && yy < d0 - 1e-9;
          const c = inOrig ? col.orig() : (row + colI) % 2 === 0 ? col.area() : mixColor(col.area(), theme.bg, 0.3);
          g.fillStyle = withAlpha(c, inOrig ? 0.85 : theme.dark ? 0.55 : 0.45);
          g.fillRect(x0 + xx * s + 0.5, y0 + Hh - (yy + sy) * s + 0.5, sx * s - 1, sy * s - 1);
          xx += sx;
          colI++;
        }
        yy += sy;
        row++;
      }
      g.strokeStyle = theme.text;
      g.lineWidth = 2;
      g.strokeRect(x0, y0, W, Hh);
      const cnt = scaleArea(w0 * d0, p.k);
      text(g, p.show ? tr('units', { n: n(cnt) }) : '?', R.x + R.w / 2, R.y + R.h - 12, { font: font(700, F(12.5, 11)), color: col.area() });
    }

    /* ---------- 3D ---------- */
    function cellColor(layer: number, inOrig: boolean): string {
      const theme = th();
      if (inOrig) return theme.dark ? col.orig() : mixColor(col.orig(), '#ffffff', 0.15);
      const c = layer % 2 === 0 ? col.vol() : th().series[5]!;
      return theme.dark ? c : mixColor(c, '#ffffff', 0.2);
    }

    function drawView(now: number): boolean {
      const theme = th();
      const b = BASE[obj()];
      const k = kShown;
      const d: Dims = [b[0] * k, b[1] * k, b[2] * k];
      const R = layout().view;
      // Szene: Bild und links daneben das Original
      const left = -b[1] - 0.9;
      const goal = { target: [d[0] / 2, (d[1] + left) / 2, d[2] / 2.2] as Vec3, radius: 0.55 * Math.hypot(d[0], d[1] - left, d[2]) + 0.4 };
      if (!frame) frame = goal;
      const kk = reduced ? 1 : 1 - Math.exp(-0.016 * 6);
      frame = { target: vec3.lerp(frame.target, goal.target, kk), radius: frame.radius + (goal.radius - frame.radius) * kk };
      const moving = vec3.distance(frame.target, goal.target) > 0.005 || Math.abs(frame.radius - goal.radius) > 0.005;
      view.setScene({ target: frame.target, radius: frame.radius, anchor: [0.5, 0.56] });
      view.begin();
      view.grid({ min: [-1, left - 1], max: [Math.max(d[0], 1) + 1, Math.max(d[1], 2) + 1], step: 1, color: theme.gridMinor, fade: true });
      view.shadow(
        [
          [0, 0, 0],
          [d[0], 0, 0],
          [d[0], d[1], 0],
          [0, d[1], 0],
        ],
        { alpha: 0.18, blur: 20, spread: 1.04 },
      );
      const cam = view.camera.position;
      const list = cells(d);
      const layers = Math.max(1, Math.ceil(d[2] - 1e-9));
      const t = build ? (now - build.t0) / 1000 : Infinity;
      let anim = false;
      for (const c of list) {
        const layer = Math.round(c.at[2]);
        let off = 0;
        let alpha = 1;
        if (build) {
          const q = clamp((t - layer * BUILD_LAYER) / 0.6, 0, 1);
          if (q < 1) anim = true;
          if (q <= 0) continue;
          off = (1 - ease.outCubic(q)) * 1.8;
          alpha = Math.min(1, q * 3);
        }
        const inOrig = c.at[0] > d[0] - b[0] - 1e-9 && c.at[1] < b[1] - 1e-9 && c.at[2] < b[2] - 1e-9;
        const color = cellColor(layer, inOrig);
        const stroke = mixColor(color, theme.dark ? '#000000' : '#0b1220', theme.dark ? 0.5 : 0.42);
        const [x, y, z] = c.at;
        const [sx, sy, sz] = c.size;
        const z0 = z + off;
        const faces: { n: Vec3; pts: Vec3[] }[] = [
          { n: [1, 0, 0], pts: [[x + sx, y, z0], [x + sx, y + sy, z0], [x + sx, y + sy, z0 + sz], [x + sx, y, z0 + sz]] },
          { n: [-1, 0, 0], pts: [[x, y, z0], [x, y + sy, z0], [x, y + sy, z0 + sz], [x, y, z0 + sz]] },
          { n: [0, 1, 0], pts: [[x, y + sy, z0], [x + sx, y + sy, z0], [x + sx, y + sy, z0 + sz], [x, y + sy, z0 + sz]] },
          { n: [0, -1, 0], pts: [[x, y, z0], [x + sx, y, z0], [x + sx, y, z0 + sz], [x, y, z0 + sz]] },
          { n: [0, 0, 1], pts: [[x, y, z0 + sz], [x + sx, y, z0 + sz], [x + sx, y + sy, z0 + sz], [x, y + sy, z0 + sz]] },
        ];
        for (const f of faces) {
          const ctr = vec3.centroid(f.pts);
          if (vec3.dot(f.n, vec3.sub(cam, ctr)) <= 0) continue;
          view.face(f.pts, { color, alpha, stroke, width: 1, gloss: 0.12 });
        }
      }
      // Original daneben (zum Vergleich), wenn vergrößert
      if (p.k !== 1) {
        const oy = -b[1] - 0.9;
        const o0: Vec3 = [d[0] - b[0], oy, 0];
        const o1: Vec3 = [d[0], oy + b[1], b[2]];
        view.mesh(
          mesh3d.box(o0, o1),
          { color: cellColor(0, true), edgeColor: mixColor(col.orig(), theme.dark ? '#000000' : '#0b1220', 0.45), edgeWidth: 1.4 },
        );
        view.label([d[0] - b[0] / 2, oy + b[1] / 2, b[2]], ctx.t('orig'), { color: theme.muted, size: 12, weight: '700', align: 'center', baseline: 'bottom', offset: [0, -8] });
      }
      view.end();
      // Titel und Zählung als Überlagerung
      const g = surface.g;
      const pad = 12;
      const V0 = b[0] * b[1] * b[2];
      const lab = `${ctx.t('volT')}`;
      g.save();
      g.font = font(700, F(12.5, 11.5));
      const tw = g.measureText(lab).width + 18;
      g.fillStyle = theme.dark ? 'rgba(15,20,30,0.85)' : 'rgba(255,255,255,0.9)';
      roundRect(g, R.x + pad, R.y + pad, tw, 24, 12);
      g.fill();
      text(g, lab, R.x + pad + tw / 2, R.y + pad + 12.5, { font: font(700, F(12.5, 11.5)), color: col.vol() });
      const cntT = p.show ? tr('cubes', { n: n(scaleVolume(V0, p.k)) }) : '?';
      g.font = font(800, F(15, 13));
      const cw = g.measureText(cntT).width + 22;
      g.fillStyle = theme.dark ? 'rgba(15,20,30,0.85)' : 'rgba(255,255,255,0.9)';
      roundRect(g, R.x + R.w - pad - cw, R.y + R.h - pad - 30, cw, 30, 15);
      g.fill();
      text(g, cntT, R.x + R.w - pad - cw / 2, R.y + R.h - pad - 14.5, { font: font(800, F(15, 13)), color: col.vol() });
      g.restore();
      if (build && !anim && t > layers * BUILD_LAYER + 0.7) build = null;
      return moving || anim;
    }

    /* ---------- Übersicht ---------- */
    function sumPanel(R: Rect): void {
      const g = surface.g;
      const theme = th();
      const pad = F(14, 10);
      card(R);
      title(R.x + pad, R.y + 16, ctx.t('sumT'));
      const b = BASE[obj()];
      const k = p.k;
      const rows: [string, string, string, string][] = [
        [ctx.t('len'), `${n(b[1])} cm`, p.show ? `${n(b[1] * k)} cm` : '?', p.show ? `· ${n(k)}` : '· ?'],
        [ctx.t('area'), `${n(b[0] * b[1])} cm²`, p.show ? `${n(scaleArea(b[0] * b[1], k))} cm²` : '?', p.show ? `· ${n(k * k)}` : '· ?'],
        [ctx.t('vol'), `${n(b[0] * b[1] * b[2])} cm³`, p.show ? `${n(scaleVolume(b[0] * b[1] * b[2], k))} cm³` : '?', p.show ? `· ${n(k ** 3)}` : '· ?'],
      ];
      const colors = [col.len(), col.area(), col.vol()];
      const lh = F(22, 19);
      const f = font(600, F(12.5, 11.5));
      rows.forEach((r, i) => {
        const y = R.y + 36 + i * lh;
        g.fillStyle = colors[i]!;
        roundRect(g, R.x + pad, y - 5, 10, 10, 3);
        g.fill();
        text(g, r[0], R.x + pad + 16, y, { font: font(700, F(12.5, 11.5)), color: theme.text, align: 'left' });
        text(g, `${r[1]} → ${r[2]}`, R.x + R.w * 0.36, y, { font: f, color: theme.text, align: 'left' });
        text(g, r[3], R.x + R.w - pad, y, { font: font(800, F(13, 12)), color: colors[i]!, align: 'right' });
      });
      // kleine Kurve k, k², k³
      const cy = R.y + 36 + 3 * lh + 4;
      const ch = R.y + R.h - cy - 22;
      if (ch < 50) return;
      const cx0 = R.x + pad + 26;
      const cx1 = R.x + R.w - pad - 22;
      const yMax = Math.max(8, KMAX ** 3 * 0.25, k ** 3 * 1.15);
      const X = (v: number) => lerp(cx0, cx1, v / KMAX);
      const Y = (v: number) => cy + ch - (Math.min(v, yMax) / yMax) * ch;
      g.strokeStyle = withAlpha(theme.text, 0.4);
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(cx0, cy);
      g.lineTo(cx0, cy + ch);
      g.lineTo(cx1, cy + ch);
      g.stroke();
      text(g, ctx.t('chart'), cx0 - 4, cy + 4, { font: font(600, 10.5), color: theme.muted, align: 'right' });
      text(g, 'k', cx1 + 10, cy + ch + 4, { font: `italic 700 12px ${theme.mathFont}`, color: theme.muted, align: 'left' });
      for (let v = 1; v <= KMAX; v++) text(g, String(v), X(v), cy + ch + 12, { font: font(600, 10.5), color: theme.muted });
      const curves: [(v: number) => number, string, string][] = [
        [(v) => v, col.len(), 'k'],
        [(v) => v * v, col.area(), 'k²'],
        [(v) => v ** 3, col.vol(), 'k³'],
      ];
      for (const [fn, c, name] of curves) {
        g.strokeStyle = c;
        g.lineWidth = 2.2;
        g.beginPath();
        let last: [number, number] = [0, 0];
        for (let i = 0; i <= 80; i++) {
          const v = (KMAX * i) / 80;
          if (fn(v) > yMax * 1.02) break;
          const pt: [number, number] = [X(v), Y(fn(v))];
          if (i) g.lineTo(pt[0], pt[1]);
          else g.moveTo(pt[0], pt[1]);
          last = pt;
        }
        g.stroke();
        text(g, name, last[0] + 4, last[1] - 2, { font: `italic 700 12px ${theme.mathFont}`, color: c, align: 'left' });
        // aktueller Wert
        const vk = fn(kShown);
        if (vk <= yMax) {
          g.beginPath();
          g.arc(X(kShown), Y(vk), 4, 0, Math.PI * 2);
          g.fillStyle = c;
          g.fill();
        }
      }
      g.strokeStyle = withAlpha(theme.text, 0.35);
      g.setLineDash([3, 3]);
      g.beginPath();
      g.moveTo(X(kShown), cy);
      g.lineTo(X(kShown), cy + ch);
      g.stroke();
      g.setLineDash([]);
    }

    /* ---------- Rendern ---------- */
    function render(): void {
      const now = performance.now();
      const dt = Math.min(0.05, (now - lastFrame) / 1000);
      lastFrame = now;
      let moving = false;
      if (Math.abs(kShown - p.k) > 1e-3) {
        kShown += (p.k - kShown) * (reduced ? 1 : 1 - Math.exp(-dt * 6));
        moving = true;
      } else kShown = p.k;
      surface.begin();
      const lay = layout();
      const m3 = drawView(now);
      lenPanel(lay.len);
      areaPanel(lay.area);
      sumPanel(lay.sum);
      if (moving || m3 || build) ctx.requestRender();
    }

    return {
      update(changed, source) {
        if ((changed.has('obj') || source === 'replace') && !reduced) build = { t0: performance.now() };
        updateReadouts();
        ctx.requestRender();
      },
      action(id) {
        if (id === 'build' && !reduced) {
          build = { t0: performance.now() };
          ctx.requestRender();
        }
      },
      resetView: () => view.resetView(false),
      render,
      destroy: () => surface.destroy(),
    };
  },
});
