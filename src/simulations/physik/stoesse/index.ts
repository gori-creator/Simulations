import { defineSimulation, ease, Plot, roundRect, shade, Surface, text, Tween, withAlpha, type Rect } from '../../../sim-core';
import { balance, planRun, restitution, stateAt, TRACK, type CollisionType, type Run, type RunState } from './model';

const L = (de: string, en: string) => ({ de, en });
type Which = 1 | 2;
type Range = [number, number];

/** Länge der Geschwindigkeitspfeile: Anteil der Bühnenbreite pro 1 m/s. */
const ARROW = 0.13;
/** Masse eines leeren Gleiters in kg (der Rest liegt als Massestücke obendrauf). */
const GLIDER_MASS = 0.05;
const PHYSICS = ['type', 'k', 'm1', 'v1', 'm2', 'v2'];

/** „Schöne“ Schrittweite (1, 2, 2,5, 5 · 10^k) von mindestens x. */
function niceStep(x: number): number {
  if (!(x > 0)) return 1;
  const p = 10 ** Math.floor(Math.log10(x));
  for (const m of [1, 2, 2.5, 5, 10]) if (m * p >= x - 1e-12) return m * p;
  return 10 * p;
}

/** Wertebereich eines Diagramms: enthält 0, etwas Luft und endet auf runden Werten. */
function niceRange(values: number[]): Range {
  let lo = Math.min(0, ...values);
  let hi = Math.max(0, ...values);
  if (hi - lo < 1e-9) return [-0.5, 0.5];
  const step = niceStep((hi - lo) / 5);
  hi = hi > 0 ? Math.ceil((hi + (hi - lo) * 0.08) / step - 1e-9) * step : 0;
  lo = lo < 0 ? -Math.ceil((-lo + (hi - lo) * 0.08) / step - 1e-9) * step : 0;
  if (hi === 0) hi = step / 2;
  if (lo === 0 && hi > 0) lo = -step / 2;
  return [lo, hi];
}

const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));

/** Bühne aufteilen: oben die Luftkissenbahn, darunter Diagramm und Bilanz. */
function regions(w: number, h: number): { scene: Rect; chart: Rect; bal: Rect } {
  if (w >= 640) {
    const sh = Math.round(h * 0.42);
    const top = sh + 10;
    const cw = Math.round((w - 10) * 0.55);
    return { scene: { x: 0, y: 0, w, h: sh }, chart: { x: 0, y: top, w: cw, h: h - top }, bal: { x: cw + 10, y: top, w: w - cw - 10, h: h - top } };
  }
  const sh = Math.round(h * 0.36);
  const bh = Math.round(h * 0.29);
  return {
    scene: { x: 0, y: 0, w, h: sh },
    bal: { x: 0, y: sh + 8, w, h: bh },
    chart: { x: 0, y: sh + bh + 16, w, h: h - sh - bh - 16 },
  };
}

/** Zerlegt die Zusatzmasse in Massestücke (0,5 kg, 0,1 kg, 0,05 kg) für den Stapel auf dem Gleiter. */
function pieces(m: number): number[] {
  let rest = Math.round((m - GLIDER_MASS) * 100);
  const out: number[] = [];
  for (const size of [50, 10, 5]) {
    while (rest >= size) {
      out.push(size);
      rest -= size;
    }
  }
  return out;
}

/**
 * Elastische und unelastische Stöße auf der Luftkissenbahn: Zwei Gleiter mit
 * wählbaren Massen und Geschwindigkeiten stoßen zusammen. Impuls und
 * Bewegungsenergie vor und nach dem Stoß, Schwerpunkt, t-v- und t-x-Diagramm.
 */
export default defineSimulation({
  id: 'stoesse',
  animated: true,
  dragHint: true,
  layout: { aspect: 1.28, aspectNarrow: 0.5 },
  groups: [
    { id: 'g1', label: L('Gleiter 1 (links)', 'Glider 1 (left)') },
    { id: 'g2', label: L('Gleiter 2 (rechts)', 'Glider 2 (right)') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'type',
      type: 'choice',
      label: L('Stoßart', 'Type of collision'),
      options: [
        { value: 'el', label: L('elastisch', 'elastic') },
        { value: 'part', label: L('teilelastisch', 'partially elastic') },
        { value: 'inel', label: L('vollkommen unelastisch', 'perfectly inelastic') },
      ],
      default: 'el',
    },
    {
      key: 'k',
      type: 'number',
      label: L('Stoßzahl k', 'Coefficient of restitution k'),
      help: L(
        'k = Relativgeschwindigkeit nachher : vorher. k = 1 heißt elastisch, k = 0 vollkommen unelastisch.',
        'k = relative speed after : before. k = 1 means elastic, k = 0 perfectly inelastic.',
      ),
      min: 0,
      max: 1,
      step: 0.05,
      default: 0.5,
      visibleIf: (v) => v.type === 'part',
    },
    { key: 'm1', type: 'number', group: 'g1', label: L('Masse m₁', 'Mass m₁'), min: 0.05, max: 2, step: 0.05, default: 0.2, unit: 'kg' },
    {
      key: 'v1',
      type: 'number',
      group: 'g1',
      label: L('Geschwindigkeit v₁', 'Velocity v₁'),
      help: L('Positiv: nach rechts, negativ: nach links. Auch durch Ziehen am Pfeil.', 'Positive: to the right, negative: to the left. You can also drag the arrow.'),
      min: -1,
      max: 1,
      step: 0.05,
      default: 0.5,
      unit: 'm/s',
    },
    { key: 'm2', type: 'number', group: 'g2', label: L('Masse m₂', 'Mass m₂'), min: 0.05, max: 2, step: 0.05, default: 0.4, unit: 'kg' },
    { key: 'v2', type: 'number', group: 'g2', label: L('Geschwindigkeit v₂', 'Velocity v₂'), min: -1, max: 1, step: 0.05, default: 0, unit: 'm/s' },
    {
      key: 'chart',
      type: 'choice',
      group: 'view',
      label: L('Diagramm', 'Graph'),
      options: [
        { value: 'v', label: L('t-v-Diagramm', 'velocity–time') },
        { value: 'x', label: L('t-x-Diagramm', 'position–time') },
      ],
      default: 'v',
    },
    { key: 'com', type: 'boolean', group: 'view', label: L('Schwerpunkt S und seine Geschwindigkeit', 'Centre of mass S and its velocity'), default: true },
    { key: 'slow', type: 'boolean', group: 'view', label: L('Zeitlupe', 'Slow motion'), default: false },
  ],
  actions: [{ id: 'go', label: L('Stoß starten', 'Start collision'), primary: true }],
  readouts: [
    { key: 'p', label: L('Impulserhaltung', 'Conservation of momentum') },
    { key: 'vs', label: L('Geschwindigkeit des Schwerpunkts', 'Velocity of the centre of mass'), spoiler: true },
    { key: 'after', label: L('Nach dem Stoß', 'After the collision'), spoiler: true },
    { key: 'energy', label: L('Bewegungsenergie', 'Kinetic energy'), spoiler: true },
    { key: 'now', label: L('Momentan', 'Right now') },
  ],
  presets: [
    { id: 'start', label: L('Leicht trifft schwer (elastisch)', 'Light hits heavy (elastic)'), values: {} },
    { id: 'equal', label: L('Gleiche Massen tauschen', 'Equal masses swap'), values: { m2: 0.2 } },
    { id: 'velcro', label: L('Klettband: Gleiter haften', 'Velcro: gliders stick'), values: { type: 'inel', m2: 0.2 } },
    { id: 'wall', label: L('Wie gegen eine Wand', 'Like hitting a wall'), values: { m1: 0.05, m2: 2 } },
    { id: 'rest', label: L('Ruhe nach dem Stoß', 'At rest after the collision'), values: { type: 'inel', v2: -0.25 } },
    { id: 'part', label: L('Teilelastisch (k = 0,5)', 'Partially elastic (k = 0.5)'), values: { type: 'part', m2: 0.2 } },
  ],
  strings: {
    de: {
      canvas: 'Luftkissenbahn mit zwei Gleitern, Geschwindigkeitspfeilen und Schwerpunkt; darunter ein Diagramm und die Bilanz von Impuls und Bewegungsenergie vor und nach dem Stoß',
      axisT: 't in s',
      axisV: 'v in m/s',
      axisX: 'x in m',
      scale: 'x in m',
      titleV: 't-v-Diagramm',
      titleX: 't-x-Diagramm',
      empty: '„Stoß starten“ – hier entsteht das Diagramm.',
      emptyShort: 'Hier entsteht das Diagramm.',
      hit: 'Stoß',
      before: 'vor dem Stoß',
      afterPhase: 'nach dem Stoß',
      none: 'kein Stoß',
      noneLong: 'kein Stoß: Gleiter 1 holt Gleiter 2 nicht ein',
      el: 'elastisch · k = 1',
      inel: 'vollkommen unelastisch · k = 0',
      part: 'teilelastisch · k = {k}',
      elShort: 'k = 1',
      inelShort: 'k = 0',
      partShort: 'k = {k}',
      balP: 'Impuls p in kg·m/s',
      balE: 'Bewegungsenergie E in mJ',
      rowBefore: 'vorher',
      rowAfter: 'nachher',
      pending: 'nach dem Stoß',
      noCollision: 'kein Stoß',
      sum: 'Summe',
      internal: 'innere Energie',
      g1: 'Gleiter 1',
      g2: 'Gleiter 2',
      now: 't = {t} s · v₁ = {v1} m/s · v₂ = {v2} m/s · Schwerpunkt bei x = {xs} m',
      afterNone: 'Kein Stoß: Die Gleiter nähern sich nicht (v₁ ≤ v₂).',
      energyText: 'vorher {e0} mJ · nachher {e1} mJ · in innere Energie umgewandelt: {loss} mJ ({pct} %)',
      footBefore: 'Erst vorhersagen, dann „Stoß starten“!',
      footAfter: 'Impuls erhalten · {pct} % der Bewegungsenergie in innere Energie umgewandelt',
      footAfterShort: 'Impuls erhalten · {pct} % → innere Energie',
      footNone: 'Kein Stoß: Jeder Gleiter behält Impuls und Energie.',
    },
    en: {
      canvas: 'Air track with two gliders, velocity arrows and the centre of mass; below a graph and the balance of momentum and kinetic energy before and after the collision',
      axisT: 't in s',
      axisV: 'v in m/s',
      axisX: 'x in m',
      scale: 'x in m',
      titleV: 'velocity–time graph',
      titleX: 'position–time graph',
      empty: '“Start collision” – the graph appears here.',
      emptyShort: 'The graph appears here.',
      hit: 'collision',
      before: 'before the collision',
      afterPhase: 'after the collision',
      none: 'no collision',
      noneLong: 'no collision: glider 1 does not catch up with glider 2',
      el: 'elastic · k = 1',
      inel: 'perfectly inelastic · k = 0',
      part: 'partially elastic · k = {k}',
      elShort: 'k = 1',
      inelShort: 'k = 0',
      partShort: 'k = {k}',
      balP: 'Momentum p in kg·m/s',
      balE: 'Kinetic energy E in mJ',
      rowBefore: 'before',
      rowAfter: 'after',
      pending: 'after the collision',
      noCollision: 'no collision',
      sum: 'total',
      internal: 'internal energy',
      g1: 'Glider 1',
      g2: 'Glider 2',
      now: 't = {t} s · v₁ = {v1} m/s · v₂ = {v2} m/s · centre of mass at x = {xs} m',
      afterNone: 'No collision: the gliders do not approach each other (v₁ ≤ v₂).',
      energyText: 'before {e0} mJ · after {e1} mJ · converted into internal energy: {loss} mJ ({pct} %)',
      footBefore: 'Predict first, then press “Start collision”!',
      footAfter: 'Momentum conserved · {pct} % of the kinetic energy converted into internal energy',
      footAfterShort: 'Momentum conserved · {pct} % → internal energy',
      footNone: 'No collision: each glider keeps its momentum and energy.',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string>) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? '');
    const narrow = () => surface.width < 640;
    const colorOf = (which: Which) => ctx.theme.series[which === 1 ? 0 : 1]!;
    const comColor = () => ctx.theme.series[4]!;
    const heatColor = () => ctx.theme.series[3]!;

    /* ---------- Koordinatensysteme ---------- */
    const scene = new Plot(surface, {
      x: [0, TRACK.length],
      y: [0, 1],
      equalAspect: false,
      pan: false,
      zoom: false,
      controls: false,
      region: (w, h) => regions(w, h).scene,
    });
    const chartRect = (r: Rect): Rect => ({ x: r.x + 2, y: r.y + 30, w: r.w - 4, h: r.h - 32 });
    const chart = new Plot(surface, {
      x: [0, 1],
      y: [-1, 1],
      equalAspect: false,
      pan: false,
      zoom: false,
      controls: false,
      region: (w, h) => chartRect(regions(w, h).chart),
      xAxis: { label: ctx.t('axisT') },
      yAxis: { label: ctx.t('axisV') },
    });
    let sceneKey = '';
    function fitScene(): void {
      const key = `${narrow()}`;
      if (key === sceneKey) return;
      sceneKey = key;
      scene.setRangePadded([0, TRACK.length], [0, 1], narrow() ? { left: 24, right: 16 } : { left: 40, right: 26 });
    }

    /* ---------- Zustand ---------- */
    const k = () => restitution(p.type as CollisionType, p.k);
    const makeRun = (): Run => planRun(p.m1, p.v1, p.m2, p.v2, k());
    let run: Run = makeRun();
    let t = 0;
    /** Beim Ziehen am Pfeil bleiben die Gleiter stehen; danach gleiten sie an den neuen Start. */
    let dragging = false;
    let anchor: { x1: number; x2: number } | null = null;
    let moveFrom: { x1: number; x2: number } | null = null;
    const move = new Tween(420, ease.inOutCubic);
    const burst = new Tween(650, ease.outCubic);
    const reveal = new Tween(700, ease.outCubic);

    function shown(): RunState {
      const s = stateAt(run, t);
      if (t > 0) return s;
      let x1 = s.x1;
      let x2 = s.x2;
      if (dragging && anchor) [x1, x2] = [anchor.x1, anchor.x2];
      else if (move.running && moveFrom) [x1, x2] = [lerp(moveFrom.x1, x1, move.value), lerp(moveFrom.x2, x2, move.value)];
      return { ...s, x1, x2, xs: (run.m1 * x1 + run.m2 * x2) / (run.m1 + run.m2) };
    }

    /* ---------- Ergebnisse ---------- */
    const unit = (v: number, d: number, u: string) => `${fmt.num(v, d)} ${u}`;
    const V = (name: string, sub: string, prime = false) => `<var>${name}</var><sub>${sub}</sub>${prime ? '′' : ''}`;
    const par = (str: string, v: number) => (v < 0 ? `(${str})` : str);
    const frac = (a: string, b: string) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`;

    function updateNow(): void {
      const s = shown();
      ctx.readout('now', tr('now', { t: fmt.fixed(s.t, 2), v1: fmt.num(s.v1, 3), v2: fmt.num(s.v2, 3), xs: fmt.num(s.xs, 3) }));
    }

    function updateReadouts(): void {
      const b = balance(run);
      const P = b.p1 + b.p2;
      const M = run.m1 + run.m2;
      const vs = P / M;
      ctx.readout('p', {
        html:
          `${V('m', '1')}·${V('v', '1')} + ${V('m', '2')}·${V('v', '2')} = ${V('m', '1')}·${V('v', '1', true)} + ${V('m', '2')}·${V('v', '2', true)}<br>` +
          `${unit(run.m1, 2, 'kg')} · ${par(unit(run.v1, 2, 'm/s'), run.v1)} + ${unit(run.m2, 2, 'kg')} · ${par(unit(run.v2, 2, 'm/s'), run.v2)} = <strong>${unit(P, 3, 'kg·m/s')}</strong>`,
      });
      ctx.readout('vs', {
        html: `${V('v', 'S')} = ${frac(`${V('m', '1')}·${V('v', '1')} + ${V('m', '2')}·${V('v', '2')}`, `${V('m', '1')} + ${V('m', '2')}`)} = ${frac(unit(P, 3, 'kg·m/s'), unit(M, 2, 'kg'))} ≈ <strong>${unit(vs, 3, 'm/s')}</strong>`,
      });
      if (!run.collides) {
        ctx.readout('after', ctx.t('afterNone'));
        ctx.readout('energy', null);
      } else {
        const kk = fmt.num(run.k, 2);
        if (run.k === 0) ctx.readout('after', { html: `${V('v', '1', true)} = ${V('v', '2', true)} = ${V('v', 'S')} ≈ <strong>${unit(run.w1, 3, 'm/s')}</strong> (${ctx.lang === 'de' ? 'gemeinsam' : 'together'})` });
        else {
          // elastisch: v′ = 2·v_S − v; allgemein: v′ = v_S − k·(v − v_S)
          const rhs = (i: string) => (run.k === 1 ? `2 · ${V('v', 'S')} − ${V('v', i)}` : `${V('v', 'S')} − ${kk} · (${V('v', i)} − ${V('v', 'S')})`);
          ctx.readout('after', {
            html:
              `${V('v', '1', true)} = ${rhs('1')} ≈ <strong>${unit(run.w1, 3, 'm/s')}</strong><br>` +
              `${V('v', '2', true)} = ${rhs('2')} ≈ <strong>${unit(run.w2, 3, 'm/s')}</strong>`,
          });
        }
        const e0 = b.e1 + b.e2;
        const e1 = b.f1 + b.f2;
        ctx.readout(
          'energy',
          tr('energyText', {
            e0: fmt.num(e0 * 1000, 2),
            e1: fmt.num(e1 * 1000, 2),
            loss: fmt.num(b.loss * 1000, 2),
            pct: fmt.num(e0 > 0 ? (b.loss / e0) * 100 : 0, 1),
          }),
        );
      }
      updateNow();
    }

    /* ---------- Geometrie der Szene ---------- */
    function geo() {
      const r = regions(surface.width, surface.height).scene;
      const small = narrow();
      const tableH = Math.round(r.h * 0.1);
      const tableTop = r.y + r.h - tableH;
      const ridgeH = small ? 5 : 7;
      const beamH = small ? 10 : 14;
      const below = small ? 44 : 58;
      const beamBottom = tableTop - below;
      const trackY = beamBottom - beamH - ridgeH;
      const len = scene.px(TRACK.glider) - scene.px(0);
      const gliderH = clamp(len * 0.27, 16, 30);
      const unitPx = Math.max(5, len * 0.1);
      return { r, small, tableTop, ridgeH, beamH, beamBottom, trackY, len, gliderH, unitPx, kv: ARROW * r.w * (small ? 1.25 : 1) };
    }
    type Geo = ReturnType<typeof geo>;

    /** Höhe des Massestapels in px. */
    function stackHeight(m: number, G: Geo): number {
      return pieces(m).reduce((h, q) => h + (q === 50 ? G.unitPx : q === 10 ? G.unitPx * 0.42 : G.unitPx * 0.24), 0);
    }

    /** Lage des Geschwindigkeitspfeils eines Gleiters (Pixel). */
    function arrowGeo(which: Which, s: RunState, G: Geo): { x0: number; x1: number; y: number } {
      const cx = scene.px(which === 1 ? s.x1 : s.x2);
      const v = which === 1 ? s.v1 : s.v2;
      const top = G.trackY + G.ridgeH * 0.5 - G.gliderH - stackHeight(which === 1 ? run.m1 : run.m2, G);
      let y = top - (G.small ? 12 : 16);
      // Liegen beide Pfeile auf gleicher Höhe übereinander, den zweiten etwas höher setzen
      if (which === 2) {
        const other = arrowGeo(1, s, G);
        const a = [Math.min(cx, cx + v * G.kv) - 40, Math.max(cx, cx + v * G.kv) + 40];
        const b = [Math.min(other.x0, other.x1) - 40, Math.max(other.x0, other.x1) + 40];
        if (Math.abs(other.y - y) < 30 && a[0]! < b[1]! && b[0]! < a[1]!) y = Math.min(y, other.y - 30);
      }
      return { x0: cx, x1: cx + v * G.kv, y };
    }

    /* ---------- Ziehen an den Pfeilspitzen ---------- */
    const editable = () => !ctx.locked && t === 0 && !ctx.clock.playing;
    for (const which of [1, 2] as const) {
      scene.addHandle({
        get: () => {
          const G = geo();
          const a = arrowGeo(which, shown(), G);
          return scene.toWorld(a.x1, a.y);
        },
        set: (x) => {
          if (!dragging) {
            const s = shown();
            anchor = { x1: s.x1, x2: s.x2 };
            dragging = true;
          }
          const G = geo();
          const s = shown();
          const base = scene.px(which === 1 ? s.x1 : s.x2);
          const v = (scene.px(x) - base) / G.kv;
          ctx.set(which === 1 ? { v1: v } : { v2: v });
        },
        axis: 'x',
        enabled: editable,
        color: () => colorOf(which),
      });
    }
    const release = () => {
      if (!dragging) return;
      dragging = false;
      moveFrom = anchor;
      anchor = null;
      move.play();
      ctx.requestRender();
    };
    surface.canvas.addEventListener('pointerup', release);
    surface.canvas.addEventListener('pointercancel', release);

    /* ---------- Zeichnen: Bausteine ---------- */
    function pill(x: number, y: number, label: string, color: string, align: 'left' | 'right' | 'center', size = 12): number {
      const g = surface.g;
      const theme = ctx.theme;
      g.font = `700 ${size}px ${theme.font}`;
      const w = g.measureText(label).width + 16;
      const h = size + 11;
      const x0 = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.12)';
      g.shadowBlur = 6;
      g.shadowOffsetY = 1;
      g.fillStyle = theme.dark ? 'rgba(16,22,31,0.9)' : 'rgba(255,255,255,0.94)';
      roundRect(g, x0, y, w, h, h / 2);
      g.fill();
      g.restore();
      g.strokeStyle = withAlpha(color, 0.45);
      g.lineWidth = 1;
      roundRect(g, x0 + 0.5, y + 0.5, w - 1, h - 1, h / 2);
      g.stroke();
      text(g, label, x0 + w / 2, y + h / 2 + 0.5, { font: `700 ${size}px ${theme.font}`, color });
      return w;
    }

    function card(r: Rect): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.10)';
      g.shadowBlur = 12;
      g.shadowOffsetY = 3;
      g.fillStyle = theme.bg;
      roundRect(g, r.x + 1, r.y + 1, r.w - 2, r.h - 2, 12);
      g.fill();
      g.restore();
      g.strokeStyle = theme.dark ? '#273142' : '#e1e6ee';
      g.lineWidth = 1.2;
      roundRect(g, r.x + 1.5, r.y + 1.5, r.w - 3, r.h - 3, 12);
      g.stroke();
    }

    /** Waagerechter Pfeil in Pixeln. */
    function hArrow(x0: number, x1: number, y: number, color: string, width: number, head = 9): void {
      const g = surface.g;
      const len = x1 - x0;
      if (Math.abs(len) < 1.5) {
        g.fillStyle = color;
        g.beginPath();
        g.arc(x0, y, width * 0.9, 0, Math.PI * 2);
        g.fill();
        return;
      }
      const dir = Math.sign(len);
      const h = Math.min(head, Math.abs(len) * 0.6);
      g.strokeStyle = color;
      g.lineWidth = width;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(x0, y);
      g.lineTo(x1 - dir * h * 0.7, y);
      g.stroke();
      g.fillStyle = color;
      g.beginPath();
      g.moveTo(x1, y);
      g.lineTo(x1 - dir * h, y - h * 0.55);
      g.lineTo(x1 - dir * h, y + h * 0.55);
      g.closePath();
      g.fill();
    }

    function haloText(label: string, x: number, y: number, size: number, color: string, align: CanvasTextAlign = 'center', weight = 700, math = false): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.font = math ? `italic ${weight} ${size}px ${theme.mathFont}` : `${weight} ${size}px ${theme.font}`;
      g.textAlign = align;
      g.textBaseline = 'middle';
      g.lineWidth = 3.5;
      g.lineJoin = 'round';
      g.strokeStyle = theme.dark ? 'rgba(16,22,31,0.85)' : 'rgba(244,247,251,0.92)';
      g.strokeText(label, x, y);
      g.fillStyle = color;
      g.fillText(label, x, y);
    }

    /** Text mit tiefgestellten Teilen: „v_{S} = 0,2 m/s“. */
    function parts(str: string): { t: string; sub: boolean }[] {
      const out: { t: string; sub: boolean }[] = [];
      const re = /_\{([^}]*)\}/g;
      let last = 0;
      let m: RegExpExecArray | null;
      while ((m = re.exec(str))) {
        if (m.index > last) out.push({ t: str.slice(last, m.index), sub: false });
        out.push({ t: m[1]!, sub: true });
        last = re.lastIndex;
      }
      if (last < str.length) out.push({ t: str.slice(last), sub: false });
      return out;
    }

    function richWidth(str: string, size: number, weight = 700): number {
      const g = surface.g;
      return parts(str).reduce((w, q) => {
        g.font = `${weight} ${q.sub ? Math.round(size * 0.74) : size}px ${ctx.theme.font}`;
        return w + g.measureText(q.t).width;
      }, 0);
    }

    function richText(str: string, x: number, y: number, size: number, color: string, align: CanvasTextAlign = 'center', halo = true, weight = 700): number {
      const g = surface.g;
      const theme = ctx.theme;
      const list = parts(str);
      const total = richWidth(str, size, weight);
      const start = align === 'left' ? x : align === 'right' ? x - total : x - total / 2;
      g.textAlign = 'left';
      g.textBaseline = 'middle';
      for (const pass of halo ? [0, 1] : [1]) {
        let cx = start;
        for (const q of list) {
          const s = q.sub ? Math.round(size * 0.74) : size;
          g.font = `${weight} ${s}px ${theme.font}`;
          const yy = y + (q.sub ? size * 0.3 : 0);
          if (pass === 0) {
            g.lineWidth = 3.5;
            g.lineJoin = 'round';
            g.strokeStyle = theme.dark ? 'rgba(16,22,31,0.85)' : 'rgba(244,247,251,0.92)';
            g.strokeText(q.t, cx, yy);
          } else {
            g.fillStyle = color;
            g.fillText(q.t, cx, yy);
          }
          cx += g.measureText(q.t).width;
        }
      }
      return total;
    }

    /* ---------- Zeichnen: Luftkissenbahn ---------- */
    function drawBackground(G: Geo): void {
      const g = surface.g;
      const { r } = G;
      const dark = ctx.theme.dark;
      const wall = g.createLinearGradient(0, r.y, 0, G.tableTop);
      wall.addColorStop(0, dark ? '#172131' : '#f3f6fa');
      wall.addColorStop(1, dark ? '#0f1723' : '#dfe6ee');
      g.fillStyle = wall;
      g.fillRect(r.x, r.y, r.w, G.tableTop - r.y);
      // dezente Wandfliesen
      g.strokeStyle = dark ? 'rgba(255,255,255,0.025)' : 'rgba(30,45,70,0.04)';
      g.lineWidth = 1;
      const tile = G.small ? 34 : 46;
      g.beginPath();
      for (let x = r.x + tile; x < r.x + r.w; x += tile) {
        g.moveTo(Math.round(x) + 0.5, r.y);
        g.lineTo(Math.round(x) + 0.5, G.tableTop);
      }
      for (let y = G.tableTop - tile; y > r.y; y -= tile) {
        g.moveTo(r.x, Math.round(y) + 0.5);
        g.lineTo(r.x + r.w, Math.round(y) + 0.5);
      }
      g.stroke();
      const table = g.createLinearGradient(0, G.tableTop, 0, r.y + r.h);
      table.addColorStop(0, dark ? '#4a3a2b' : '#c49a6c');
      table.addColorStop(1, dark ? '#33281e' : '#9c7349');
      g.fillStyle = table;
      g.fillRect(r.x, G.tableTop, r.w, r.y + r.h - G.tableTop);
      g.fillStyle = 'rgba(255,255,255,0.22)';
      g.fillRect(r.x, G.tableTop, r.w, 1.5);
    }

    function drawTrack(G: Geo): void {
      const g = surface.g;
      const dark = ctx.theme.dark;
      const x0 = scene.px(0);
      const x1 = scene.px(TRACK.length);
      const cap = G.small ? 7 : 10;
      const bodyTop = G.trackY + G.ridgeH;
      // Stützen
      for (const f of [0.1, 0.9]) {
        const x = lerp(x0, x1, f);
        const legW = G.small ? 6 : 8;
        const grad = g.createLinearGradient(x - legW / 2, 0, x + legW / 2, 0);
        grad.addColorStop(0, dark ? '#4b5463' : '#7d8794');
        grad.addColorStop(0.5, dark ? '#7a8494' : '#c3cad3');
        grad.addColorStop(1, dark ? '#3c4451' : '#6b7480');
        g.fillStyle = grad;
        g.fillRect(x - legW / 2, G.beamBottom, legW, G.tableTop - G.beamBottom);
        g.fillStyle = dark ? '#2b313b' : '#4a525d';
        roundRect(g, x - legW * 2.2, G.tableTop - 5, legW * 4.4, 5, 2);
        g.fill();
      }
      // Luftschlauch zum Gebläse (links unten aus dem Bild)
      g.save();
      g.lineCap = 'round';
      g.strokeStyle = dark ? '#0b0e13' : '#2d333c';
      g.lineWidth = G.small ? 7 : 10;
      g.beginPath();
      const hx = x0 - cap;
      const hy = bodyTop + G.beamH / 2;
      const lay = G.tableTop - g.lineWidth / 2 - 1;
      const bend = Math.max(G.r.x + 8, hx - (G.small ? 12 : 18));
      g.moveTo(hx, hy);
      g.quadraticCurveTo(bend, hy, bend, (hy + lay) / 2);
      g.quadraticCurveTo(bend, lay, bend - 14, lay);
      g.lineTo(G.r.x - 10, lay);
      g.stroke();
      g.strokeStyle = 'rgba(255,255,255,0.14)';
      g.lineWidth = 2;
      g.stroke();
      g.restore();
      // Balken (Aluminiumprofil)
      const body = g.createLinearGradient(0, bodyTop, 0, G.beamBottom);
      body.addColorStop(0, dark ? '#a7b0bc' : '#eef1f5');
      body.addColorStop(0.45, dark ? '#7f8896' : '#c7ced8');
      body.addColorStop(1, dark ? '#59616e' : '#99a3b0');
      g.fillStyle = body;
      g.fillRect(x0, bodyTop, x1 - x0, G.beamH);
      // Dreiecksprofil oben (mit Luftlöchern)
      const ridge = g.createLinearGradient(0, G.trackY, 0, bodyTop);
      ridge.addColorStop(0, dark ? '#c3cad4' : '#ffffff');
      ridge.addColorStop(1, dark ? '#8a93a0' : '#d3d9e1');
      g.fillStyle = ridge;
      g.beginPath();
      g.moveTo(x0, bodyTop);
      g.lineTo(x0 + 3, G.trackY);
      g.lineTo(x1 - 3, G.trackY);
      g.lineTo(x1, bodyTop);
      g.closePath();
      g.fill();
      g.fillStyle = dark ? 'rgba(10,14,20,0.55)' : 'rgba(40,50,62,0.45)';
      const holeStep = G.small ? 9 : 12;
      for (let x = x0 + holeStep; x < x1 - 4; x += holeStep) {
        g.beginPath();
        g.arc(x, G.trackY + G.ridgeH * 0.55, 0.9, 0, Math.PI * 2);
        g.fill();
      }
      g.fillStyle = 'rgba(0,0,0,0.18)';
      g.fillRect(x0, G.beamBottom - 1.5, x1 - x0, 1.5);
      // Skala auf der Vorderseite
      const ink = dark ? '#1d232c' : '#38414d';
      g.strokeStyle = ink;
      g.lineWidth = 1;
      g.beginPath();
      for (let i = 0; i <= Math.round(TRACK.length * 20); i++) {
        const x = Math.round(scene.px(i * 0.05)) + 0.5;
        const len = i % 10 === 0 ? G.beamH * 0.8 : i % 2 === 0 ? G.beamH * 0.5 : G.beamH * 0.28;
        g.moveTo(x, G.beamBottom);
        g.lineTo(x, G.beamBottom - len);
      }
      g.stroke();
      // Endstücke mit Gummiband
      for (const side of [-1, 1]) {
        const x = side < 0 ? x0 - cap : x1;
        const top = G.trackY - (G.small ? 9 : 13);
        const grad = g.createLinearGradient(x, 0, x + cap, 0);
        grad.addColorStop(0, dark ? '#353c47' : '#4d5561');
        grad.addColorStop(1, dark ? '#232831' : '#323840');
        g.fillStyle = grad;
        roundRect(g, x, top, cap, G.beamBottom - top + 2, 2);
        g.fill();
        g.strokeStyle = dark ? '#c9b48a' : '#a5875a';
        g.lineWidth = 1.6;
        const bx = side < 0 ? x + cap + 2 : x - 2;
        g.beginPath();
        g.moveTo(bx, top + 2);
        g.quadraticCurveTo(bx + side * -1, (top + G.trackY) / 2, bx, G.trackY - 1);
        g.stroke();
      }
      // Beschriftung der Skala
      const labelY = G.beamBottom + (G.small ? 8 : 10);
      const step = G.small ? 0.4 : 0.2;
      const font = `600 ${G.small ? 10.5 : 11}px ${ctx.theme.font}`;
      const last = Math.round(TRACK.length / step);
      for (let i = 0; i <= last; i++) {
        const x = scene.px(i * step);
        // Auf schmalen Bildschirmen steht die Einheit an der letzten Zahl
        const label = G.small && i === last ? `${fmt.num(i * step, 1)} m` : fmt.num(i * step, 1);
        text(g, label, G.small && i === last ? x + 4 : x, labelY, { font, color: ctx.theme.muted, align: G.small && i === last ? 'right' : 'center' });
      }
      if (!G.small) text(g, ctx.t('scale'), x1 + cap, labelY + 13, { font: `600 10.5px ${ctx.theme.font}`, color: ctx.theme.muted, align: 'right' });
    }

    function drawStack(cx: number, bottom: number, m: number, G: Geo): number {
      const g = surface.g;
      const list = pieces(m);
      let y = bottom;
      if (!list.length) return y;
      // Stift, auf dem die Massestücke stecken
      const total = stackHeight(m, G);
      g.fillStyle = ctx.theme.dark ? '#6c7480' : '#8b939e';
      g.fillRect(cx - 1, bottom - total - 3, 2, total + 3);
      for (const q of list) {
        const h = q === 50 ? G.unitPx : q === 10 ? G.unitPx * 0.42 : G.unitPx * 0.24;
        const w = G.len * (q === 50 ? 0.5 : 0.4);
        const brass = g.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0);
        brass.addColorStop(0, '#8d6a24');
        brass.addColorStop(0.3, '#f0d27a');
        brass.addColorStop(0.55, '#d4ad4c');
        brass.addColorStop(1, '#7c5b1c');
        g.fillStyle = brass;
        roundRect(g, cx - w / 2, y - h, w, h, Math.min(2.5, h / 3));
        g.fill();
        if (h > 3) {
          g.fillStyle = 'rgba(255,255,255,0.3)';
          g.fillRect(cx - w / 2 + 2, y - h + 0.8, w - 4, 1);
        }
        g.fillStyle = 'rgba(60,40,5,0.35)';
        g.fillRect(cx - w / 2 + 1, y - 0.8, w - 2, 0.8);
        y -= h;
      }
      return y;
    }

    /** Beschriftung der Gleiter: 0 = „m₁ = … kg“, 1 = „… kg“, 2 = nur die Nummer – für beide gleich. */
    function labelLevel(G: Geo): number {
      const g = surface.g;
      g.font = `700 ${G.small ? 10 : 11}px ${ctx.theme.font}`;
      const plate = G.len - clamp(G.len * 0.075, 3, 7);
      let level = 0;
      for (const [i, m] of [[1, run.m1], [2, run.m2]] as const) {
        const wl = g.measureText(`m${i === 1 ? '₁' : '₂'} = ${fmt.num(m, 2)} kg`).width;
        const ws = g.measureText(`${fmt.num(m, 2)} kg`).width;
        level = Math.max(level, wl < plate - 14 ? 0 : ws < plate - 8 ? 1 : 2);
      }
      return level;
    }

    function drawGlider(which: Which, x: number, G: Geo, contactGlow: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const color = colorOf(which);
      const cx = scene.px(x);
      const len = G.len;
      const bump = clamp(len * 0.075, 3, 7);
      const bottom = G.trackY + G.ridgeH * 0.75;
      const top = G.trackY + G.ridgeH * 0.5 - G.gliderH;
      const type = p.type as CollisionType;
      // Platte ist um den Puffer kürzer; der Puffer zeigt zum anderen Gleiter
      const left = cx - len / 2 + (which === 2 ? bump : 0);
      const right = cx + len / 2 - (which === 1 ? bump : 0);
      // Schatten auf dem Profil (Luftkissen)
      g.fillStyle = theme.dark ? 'rgba(0,0,0,0.35)' : 'rgba(20,30,45,0.16)';
      g.beginPath();
      g.ellipse(cx, G.trackY + G.ridgeH + 1.5, len * 0.48, 2.2, 0, 0, Math.PI * 2);
      g.fill();
      // Platte
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.22)';
      g.shadowBlur = 6;
      g.shadowOffsetY = 2;
      const plate = g.createLinearGradient(0, top, 0, bottom);
      plate.addColorStop(0, shade(color, theme.dark ? 0.25 : 0.32));
      plate.addColorStop(0.5, color);
      plate.addColorStop(1, shade(color, -0.32));
      g.fillStyle = plate;
      roundRect(g, left, top, right - left, bottom - top, 3);
      g.fill();
      g.restore();
      g.fillStyle = 'rgba(255,255,255,0.45)';
      g.fillRect(left + 3, top + 1.5, right - left - 6, 1.2);
      g.fillStyle = 'rgba(0,0,0,0.22)';
      g.fillRect(left + 2, bottom - 3, right - left - 4, 1.5);
      // Beschriftung
      const mass = which === 1 ? run.m1 : run.m2;
      const longLabel = `m${which === 1 ? '₁' : '₂'} = ${fmt.num(mass, 2)} kg`;
      const size = G.small ? 10 : 11;
      g.font = `700 ${size}px ${theme.font}`;
      const level = labelLevel(G);
      const label = level === 0 ? longLabel : level === 1 ? `${fmt.num(mass, 2)} kg` : String(which);
      const labelW = g.measureText(label).width;
      text(g, label, (left + right) / 2, (top + bottom) / 2 + 0.5, { font: `700 ${size}px ${theme.font}`, color: '#ffffff' });
      // Nieten (nur, wenn neben der Schrift Platz ist)
      if (labelW + 26 < right - left) {
        g.fillStyle = 'rgba(255,255,255,0.55)';
        for (const fx of [0.07, 0.93]) {
          g.beginPath();
          g.arc(lerp(left, right, fx), (top + bottom) / 2, 1.3, 0, Math.PI * 2);
          g.fill();
        }
      }
      // Puffer
      const px = which === 1 ? right : left;
      const dir = which === 1 ? 1 : -1;
      const by0 = top + 2;
      const by1 = bottom - 2;
      if (type === 'el') {
        // Federbügel aus Stahl
        g.strokeStyle = theme.dark ? '#d5dbe3' : '#6b7480';
        g.lineWidth = 1.8;
        g.beginPath();
        g.moveTo(px, by0);
        g.quadraticCurveTo(px + dir * bump * 2, (by0 + by1) / 2, px, by1);
        g.stroke();
      } else if (type === 'part') {
        // Gummipuffer
        g.fillStyle = theme.dark ? '#262a31' : '#30343b';
        roundRect(g, which === 1 ? px : px - bump, by0 + 1, bump, by1 - by0 - 2, Math.min(4, bump / 1.5));
        g.fill();
      } else {
        // Klettband
        g.fillStyle = theme.dark ? '#3a3f47' : '#4b5059';
        g.fillRect(which === 1 ? px : px - bump, by0, bump, by1 - by0);
        g.strokeStyle = 'rgba(255,255,255,0.28)';
        g.lineWidth = 1;
        g.beginPath();
        for (let y = by0 + 2; y < by1 - 1; y += 2.5) {
          const xx = which === 1 ? px + bump : px - bump;
          g.moveTo(xx, y);
          g.lineTo(xx + dir * 1.6, y + 1);
        }
        g.stroke();
      }
      if (contactGlow > 0) {
        const gx = which === 1 ? cx + len / 2 : cx - len / 2;
        const rad = G.gliderH * 1.4;
        const glow = g.createRadialGradient(gx, (top + bottom) / 2, 1, gx, (top + bottom) / 2, rad);
        glow.addColorStop(0, withAlpha(heatColor(), 0.55 * contactGlow));
        glow.addColorStop(1, withAlpha(heatColor(), 0));
        g.fillStyle = glow;
        g.fillRect(gx - rad, (top + bottom) / 2 - rad, rad * 2, rad * 2);
      }
      drawStack(cx, top + 0.5, mass, G);
    }

    function drawScene(): void {
      const G = geo();
      const g = scene.begin();
      const theme = ctx.theme;
      const { r, small } = G;
      g.save();
      g.beginPath();
      roundRect(g, r.x, r.y, r.w, r.h, 12);
      g.clip();
      drawBackground(G);
      drawTrack(G);
      const s = shown();

      // Schwerpunkt mit Geschwindigkeitspfeil
      if (p.com) {
        const sx = scene.px(s.xs);
        const sy = G.beamBottom + (small ? 30 : 38);
        g.strokeStyle = withAlpha(comColor(), 0.6);
        g.lineWidth = 1.2;
        g.setLineDash([3, 3]);
        g.beginPath();
        g.moveTo(sx, G.beamBottom + 1);
        g.lineTo(sx, sy - 7);
        g.stroke();
        g.setLineDash([]);
        hArrow(sx, sx + s.vs * G.kv, sy, comColor(), 2.5, 8);
        // Schwerpunkt-Symbol (Kreis mit zwei gefüllten Vierteln)
        const rr = small ? 5.5 : 6.5;
        g.fillStyle = theme.dark ? '#10161f' : '#ffffff';
        g.beginPath();
        g.arc(sx, sy, rr, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = comColor();
        for (const a0 of [0, Math.PI]) {
          g.beginPath();
          g.moveTo(sx, sy);
          g.arc(sx, sy, rr, a0 - Math.PI / 2, a0);
          g.closePath();
          g.fill();
        }
        g.strokeStyle = comColor();
        g.lineWidth = 1.5;
        g.beginPath();
        g.arc(sx, sy, rr, 0, Math.PI * 2);
        g.stroke();
        const lab = `v_{S} = ${fmt.num(s.vs, 2)} m/s`;
        const tip = sx + s.vs * G.kv;
        const right = s.vs >= 0;
        const lw = richWidth(lab, small ? 11 : 12);
        let lx = right ? Math.max(tip, sx + rr) + 8 : Math.min(tip, sx - rr) - 8;
        let align: CanvasTextAlign = right ? 'left' : 'right';
        if (right && lx + lw > r.x + r.w - 6) [lx, align] = [Math.min(tip, sx - rr) - 8, 'right'];
        if (!right && lx - lw < r.x + 6) [lx, align] = [Math.max(tip, sx + rr) + 8, 'left'];
        richText(lab, lx, sy - 1, small ? 11 : 12, comColor(), align);
        haloText('S', sx, sy + rr + (small ? 8 : 9), small ? 11 : 12, comColor(), 'center', 700, true);
      }

      // Gleiter
      const glow = burst.running ? (1 - burst.value) * Math.min(1, balance(run).loss / Math.max(1e-12, balance(run).e1 + balance(run).e2) * 1.6) : 0;
      drawGlider(1, s.x1, G, glow);
      drawGlider(2, s.x2, G, glow);

      // Stoßblitz
      if (burst.running && run.collides) {
        const c = stateAt(run, run.tc);
        const cx = scene.px((c.x1 + c.x2) / 2);
        const cy = G.trackY - G.gliderH * 0.4;
        const u = burst.value;
        g.strokeStyle = withAlpha(theme.dark ? '#ffe9a3' : '#f5b400', 0.9 * (1 - u));
        g.lineWidth = 2.5;
        g.beginPath();
        g.arc(cx, cy, 6 + u * G.gliderH * 1.6, 0, Math.PI * 2);
        g.stroke();
        g.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2 + 0.2;
          const r0 = 8 + u * G.gliderH * 0.9;
          const r1 = r0 + 6 * (1 - u) + 2;
          g.beginPath();
          g.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
          g.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
          g.stroke();
        }
      }

      // Geschwindigkeitspfeile
      const prime = s.after ? '′' : '';
      for (const which of [1, 2] as const) {
        const a = arrowGeo(which, s, G);
        const v = which === 1 ? s.v1 : s.v2;
        const color = colorOf(which);
        hArrow(a.x0, a.x1, a.y, color, small ? 3 : 3.5, small ? 9 : 11);
        const label = `v_{${which}}${prime} = ${fmt.num(v, 2)} m/s`;
        const lw = richWidth(label, small ? 11 : 12.5);
        const mid = (a.x0 + a.x1) / 2;
        const lx = clamp(mid, r.x + lw / 2 + 6, r.x + r.w - lw / 2 - 6);
        richText(label, lx, a.y - (small ? 13 : 15), small ? 11 : 12.5, color);
      }

      // Anzeigen oben
      const size = small ? 11 : 12;
      const wT = pill(r.x + 8, r.y + 8, `t = ${fmt.fixed(s.t, 2)} s`, theme.text, 'left', size);
      const phase = !run.collides ? (small ? ctx.t('none') : ctx.t('noneLong')) : s.after ? ctx.t('afterPhase') : ctx.t('before');
      pill(r.x + 8 + wT + 6, r.y + 8, phase, !run.collides ? heatColor() : s.after ? comColor() : theme.muted, 'left', size);
      const type = p.type as CollisionType;
      const kText = fmt.num(run.k, 2);
      const typeLabel = small ? tr(`${type}Short`, { k: kText }) : tr(type, { k: kText });
      if (!(small && !run.collides)) pill(r.x + r.w - 8, r.y + 8, typeLabel, theme.text, 'right', size);
      g.restore();
      scene.end();
    }

    /* ---------- Zeichnen: Diagramm ---------- */
    function drawChart(R: Rect): void {
      const theme = ctx.theme;
      const g = surface.g;
      const small = narrow();
      const mode = p.chart === 'x' ? 'x' : 'v';
      card(R);
      text(g, ctx.t(mode === 'v' ? 'titleV' : 'titleX'), R.x + 14, R.y + 17, { font: `700 ${small ? 12 : 13}px ${theme.font}`, color: theme.text, align: 'left' });
      // Legende
      const q = mode === 'v' ? 'v' : 'x';
      const items: [string, string, boolean][] = [
        [`${q}_{1}`, colorOf(1), false],
        [`${q}_{2}`, colorOf(2), false],
      ];
      if (p.com) items.push([`${q}_{S}`, comColor(), true]);
      let lx = R.x + R.w - 14;
      for (const [label, color, dashed] of [...items].reverse()) {
        const w = richText(label, lx, R.y + 16, small ? 12 : 13, color, 'right', false);
        lx -= w + 6;
        g.strokeStyle = color;
        g.lineWidth = 2.5;
        g.setLineDash(dashed ? [4, 3] : []);
        g.beginPath();
        g.moveTo(lx - 16, R.y + 17);
        g.lineTo(lx, R.y + 17);
        g.stroke();
        g.setLineDash([]);
        lx -= 16 + 12;
      }

      const T = run.tEnd;
      const yr: Range =
        mode === 'v' ? niceRange([run.v1, run.v2, run.w1, run.w2]) : [0, TRACK.length];
      chart.setRangePadded([0, T], yr, { left: small ? 40 : 46, right: 12, top: 10, bottom: 24 });
      chart.begin();
      chart.grid({ minor: false });
      chart.axes();
      if (run.collides) {
        chart.vline(run.tc, { color: theme.muted, width: 1.2, dash: [4, 4], alpha: 0.8 });
        chart.text(run.tc, chart.bounds.yMax, ctx.t('hit'), { color: theme.muted, size: 11, weight: '600', align: 'left', baseline: 'top', offset: [4, 4] });
      }
      const now = t;
      const tc = run.collides ? run.tc : Infinity;
      if (mode === 'v') {
        const series = (v: number, w: number, color: string, width: number) => {
          const a = Math.min(now, tc);
          if (a > 0) chart.polyline([[0, v], [a, v]], { color, width });
          if (now > tc) {
            chart.segment([tc, v], [tc, w], { color, width: 1.5, dash: [3, 3], alpha: 0.8 });
            chart.polyline([[tc, w], [now, w]], { color, width });
          }
        };
        series(run.v2, run.w2, colorOf(2), 4);
        series(run.v1, run.w1, colorOf(1), 2.6);
        if (p.com && now > 0) chart.polyline([[0, stateAt(run, 0).vs], [now, stateAt(run, 0).vs]], { color: comColor(), width: 2, dash: [6, 4] });
        const s = shown();
        chart.point(now, s.v2, { color: colorOf(2), radius: 5 });
        chart.point(now, s.v1, { color: colorOf(1), radius: 4.5 });
      } else {
        const pts = (which: Which): [number, number][] => {
          const list: [number, number][] = [];
          const times = [0, ...(now > tc ? [tc] : []), now];
          for (const tt of times) {
            const s = stateAt(run, tt);
            list.push([tt, which === 1 ? s.x1 : s.x2]);
          }
          return list;
        };
        const half = TRACK.glider / 2;
        for (const which of [1, 2] as const) {
          const line = pts(which);
          if (now > 0) {
            const upper = line.map(([tt, x]) => [tt, x + half] as [number, number]);
            const lower = line.map(([tt, x]) => [tt, x - half] as [number, number]).reverse();
            chart.polygon([...upper, ...lower], { fill: colorOf(which), alpha: 0.14 });
            chart.polyline(line, { color: colorOf(which), width: 2.6 });
          }
        }
        if (p.com && now > 0) {
          const s0 = stateAt(run, 0);
          const s1 = stateAt(run, now);
          chart.polyline([[0, s0.xs], [now, s1.xs]], { color: comColor(), width: 2, dash: [6, 4] });
        }
        const s = shown();
        chart.point(now, s.x1, { color: colorOf(1), radius: 4.5 });
        chart.point(now, s.x2, { color: colorOf(2), radius: 4.5 });
      }
      if (now > 0) chart.vline(now, { color: theme.text, width: 1.2, alpha: 0.35 });
      else {
        const cr = chart.rect;
        const msg = ctx.t(small ? 'emptyShort' : 'empty');
        g.font = `600 ${small ? 11.5 : 12.5}px ${theme.font}`;
        const w = g.measureText(msg).width + 24;
        g.fillStyle = theme.dark ? 'rgba(16,22,31,0.88)' : 'rgba(255,255,255,0.9)';
        const my = cr.y + Math.max(30, cr.h * 0.24);
        roundRect(g, cr.x + cr.w / 2 - w / 2 + 12, my - 14, w, 28, 14);
        g.fill();
        text(g, msg, cr.x + cr.w / 2 + 12, my, { font: g.font, color: theme.muted });
      }
      chart.end();
    }

    /* ---------- Zeichnen: Bilanz ---------- */
    function drawBalance(R: Rect): void {
      const g = surface.g;
      const theme = ctx.theme;
      const small = narrow();
      card(R);
      const b = balance(run);
      const done = run.collides && t >= run.tc;
      const grow = done ? (reveal.running ? reveal.value : 1) : 0;
      const pad = small ? 10 : 14;
      const labelW = small ? 54 : 64;
      const valueW = small ? 46 : 54;
      const x0 = R.x + pad + labelW;
      const x1 = R.x + R.w - pad - valueW;
      const head = small ? 14 : 16;
      const legendH = small ? 16 : 18;
      const gapSec = small ? 8 : 12;
      const footH = small ? 0 : 26;
      const avail = R.h - 2 * pad - legendH - 2 * (head + 6) - gapSec - 6 - footH;
      const rowP = clamp((avail * 0.56) / 2, 28, 56);
      const rowE = clamp((avail * 0.44) / 2, 20, 42);
      const total = legendH + 6 + 2 * (head + 6) + gapSec + 2 * rowP + 2 * rowE + footH;
      let y = R.y + Math.max(pad, (R.h - total) / 2);
      const fontS = `600 ${small ? 11 : 12}px ${theme.font}`;
      const fontH = `700 ${small ? 12 : 13}px ${theme.font}`;
      const fontV = `700 ${small ? 11.5 : 13}px ${theme.font}`;
      const aw = small ? 3 : Math.min(4.5, 2.5 + rowP / 22);

      // Legende
      const legend: [string, string, 'line' | 'hatch'][] = [
        [small ? '1' : ctx.t('g1'), colorOf(1), 'line'],
        [small ? '2' : ctx.t('g2'), colorOf(2), 'line'],
        [small ? 'Σ' : ctx.t('sum'), comColor(), 'line'],
        [ctx.t('internal'), heatColor(), 'hatch'],
      ];
      const fontL = `600 ${small ? 10.5 : 11.5}px ${theme.font}`;
      g.font = fontL;
      let lx = R.x + pad;
      const ly = y + legendH / 2;
      for (const [label, color, kind] of legend) {
        if (kind === 'hatch') hatchRect(lx, ly - 5, 11, 10, color);
        else {
          g.fillStyle = color;
          roundRect(g, lx, ly - 4, 11, 8, 2);
          g.fill();
        }
        text(g, label, lx + 15, ly, { font: fontL, color: kind === 'hatch' ? color : theme.muted, align: 'left' });
        g.font = fontL;
        lx += 15 + g.measureText(label).width + (small ? 10 : 14);
      }
      y += legendH + 6;

      const placeholder = (yy: number, h: number) => {
        g.strokeStyle = withAlpha(theme.muted, 0.45);
        g.lineWidth = 1;
        g.setLineDash([4, 4]);
        roundRect(g, x0 + 0.5, yy + 3.5, x1 - x0 + valueW - 1, h - 7, 6);
        g.stroke();
        g.setLineDash([]);
        text(g, run.collides ? ctx.t('pending') : ctx.t('noCollision'), (x0 + x1 + valueW) / 2, yy + h / 2, { font: `600 ${small ? 10.5 : 11.5}px ${theme.font}`, color: theme.muted });
      };
      const rowLabel = (label: string, yy: number, h: number, i: number) => {
        text(g, label, R.x + pad, yy + h / 2, { font: fontS, color: theme.muted, align: 'left' });
        if (i === 1) {
          g.strokeStyle = withAlpha(theme.muted, 0.18);
          g.lineWidth = 1;
          g.beginPath();
          g.moveTo(R.x + pad, Math.round(yy) + 0.5);
          g.lineTo(R.x + R.w - pad, Math.round(yy) + 0.5);
          g.stroke();
        }
      };

      // Impuls (Pfeile hintereinander gehängt; Summe darunter)
      text(g, ctx.t('balP'), R.x + pad, y + head / 2, { font: fontH, color: theme.text, align: 'left' });
      y += head + 6;
      const sums = [0, b.p1, b.p1 + b.p2, b.q1, b.q1 + b.q2];
      let lo = Math.min(...sums);
      let hi = Math.max(...sums);
      if (hi - lo < 1e-9) [lo, hi] = [-1, 1];
      const span = hi - lo;
      const X = (v: number) => x0 + 8 + ((v - lo) / span) * (x1 - x0 - 16);
      const zero = X(0);
      const rowsP: [string, number, number, boolean][] = [
        [ctx.t('rowBefore'), b.p1, b.p2, true],
        [ctx.t('rowAfter'), b.q1, b.q2, done],
      ];
      rowsP.forEach(([label, a, c, visible], i) => {
        const yy = y + i * rowP;
        rowLabel(label, yy, rowP, i);
        if (!visible) {
          placeholder(yy, rowP);
          return;
        }
        const u = i === 0 ? 1 : grow;
        g.strokeStyle = withAlpha(theme.text, 0.4);
        g.lineWidth = 1;
        g.setLineDash([3, 3]);
        g.beginPath();
        g.moveTo(Math.round(zero) + 0.5, yy + 3);
        g.lineTo(Math.round(zero) + 0.5, yy + rowP - 3);
        g.stroke();
        g.setLineDash([]);
        const ya = yy + rowP * 0.24;
        const yb = yy + rowP * 0.47;
        const yc = yy + rowP * 0.76;
        hArrow(zero, X(a * u), ya, colorOf(1), aw, 9);
        g.strokeStyle = withAlpha(colorOf(2), 0.5);
        g.lineWidth = 1;
        g.setLineDash([2, 2]);
        g.beginPath();
        g.moveTo(X(a * u), ya);
        g.lineTo(X(a * u), yb);
        g.stroke();
        g.setLineDash([]);
        hArrow(X(a * u), X((a + c) * u), yb, colorOf(2), aw, 9);
        hArrow(zero, X((a + c) * u), yc, comColor(), aw + 0.5, 10);
        if (u > 0.98) text(g, fmt.num(a + c, 3), R.x + R.w - pad, yc, { font: fontV, color: comColor(), align: 'right' });
      });
      y += rowP * 2 + gapSec;

      // Bewegungsenergie (gestapelte Balken, gleicher Maßstab vorher und nachher)
      text(g, ctx.t('balE'), R.x + pad, y + head / 2, { font: fontH, color: theme.text, align: 'left' });
      y += head + 6;
      const e0 = b.e1 + b.e2;
      const EX = (v: number) => x0 + (e0 > 0 ? (v / e0) * (x1 - x0) : 0);
      const barH = clamp(rowE * 0.5, 10, 20);
      const rowsE: [string, number[], boolean][] = [
        [ctx.t('rowBefore'), [b.e1, b.e2], true],
        [ctx.t('rowAfter'), [b.f1, b.f2, b.loss], done],
      ];
      rowsE.forEach(([label, list, visible], i) => {
        const yy = y + i * rowE;
        rowLabel(label, yy, rowE, i);
        if (!visible) {
          placeholder(yy, rowE);
          return;
        }
        const u = i === 0 ? 1 : grow;
        const by = yy + (rowE - barH) / 2;
        g.fillStyle = withAlpha(theme.muted, 0.12);
        roundRect(g, x0, by, x1 - x0, barH, 3);
        g.fill();
        g.save();
        roundRect(g, x0, by, x1 - x0, barH, 3);
        g.clip();
        let acc = 0;
        list.forEach((value, j) => {
          const xa = EX(acc * u);
          const xb = EX((acc + value) * u);
          acc += value;
          if (xb - xa <= 0.3) return;
          if (j === 2) {
            hatchRect(xa, by, xb - xa, barH, heatColor());
            const pct = e0 > 0 ? (value / e0) * 100 : 0;
            const lab = `${fmt.num(pct, 0)} %`;
            g.font = `700 ${small ? 10 : 11}px ${theme.font}`;
            if (xb - xa > g.measureText(lab).width + 8 && u > 0.98) text(g, lab, (xa + xb) / 2, by + barH / 2 + 0.5, { font: g.font, color: theme.dark ? '#ffffff' : '#5c2300' });
          } else {
            const grad = g.createLinearGradient(0, by, 0, by + barH);
            const col = colorOf(j === 0 ? 1 : 2);
            grad.addColorStop(0, shade(col, 0.18));
            grad.addColorStop(1, shade(col, -0.12));
            g.fillStyle = grad;
            g.fillRect(xa, by, xb - xa, barH);
            g.fillStyle = 'rgba(255,255,255,0.65)';
            g.fillRect(xb - 1, by, 1, barH);
          }
        });
        g.restore();
        if (u > 0.98) {
          const sum = list.reduce((s2, v) => s2 + v, 0);
          text(g, fmt.num(sum * 1000, 1), R.x + R.w - pad, yy + rowE / 2, { font: fontV, color: theme.text, align: 'right' });
        }
      });
      if (footH > 0) {
        const fy = y + 2 * rowE + footH / 2 + 4;
        const pct = fmt.num(e0 > 0 ? (b.loss / e0) * 100 : 0, 0);
        let msg = !run.collides ? ctx.t('footNone') : done ? tr('footAfter', { pct }) : t === 0 ? ctx.t('footBefore') : '';
        const fontF = `600 ${small ? 11 : 12}px ${theme.font}`;
        g.font = fontF;
        if (g.measureText(msg).width > R.w - 2 * pad && done) msg = tr('footAfterShort', { pct });
        text(g, msg, R.x + R.w / 2, fy, { font: fontF, color: done ? comColor() : theme.muted });
      }
    }

    function hatchRect(x: number, y: number, w: number, h: number, color: string): void {
      const g = surface.g;
      g.save();
      g.fillStyle = withAlpha(color, 0.35);
      g.fillRect(x, y, w, h);
      g.beginPath();
      g.rect(x, y, w, h);
      g.clip();
      g.strokeStyle = color;
      g.lineWidth = 1.5;
      g.beginPath();
      for (let d = -h; d < w + h; d += 5) {
        g.moveTo(x + d, y + h);
        g.lineTo(x + d + h, y);
      }
      g.stroke();
      g.restore();
      g.strokeStyle = color;
      g.lineWidth = 1;
      g.strokeRect(x + 0.5, y + 0.5, Math.max(0, w - 1), h - 1);
    }

    /* ---------- Ablauf ---------- */
    function startMove(from: { x1: number; x2: number }): void {
      moveFrom = from;
      move.play();
    }

    fitScene();

    return {
      update(changed, source) {
        const physics = PHYSICS.some((key) => changed.has(key));
        if (physics || source === 'replace' || source === 'init') {
          const before = shown();
          run = makeRun();
          if (source !== 'sim') {
            ctx.clock.pause();
            const was = t;
            t = 0;
            burst.finish();
            reveal.finish();
            if (source !== 'init' && (was > 0 || Math.abs(before.x1 - run.x1) + Math.abs(before.x2 - run.x2) > 1e-6)) startMove({ x1: before.x1, x2: before.x2 });
          }
        }
        if (changed.has('chart')) chart.setAxes({ y: { label: ctx.t(p.chart === 'x' ? 'axisX' : 'axisV') } });
        updateReadouts();
      },

      action(id) {
        if (id === 'go') {
          t = 0;
          move.finish();
          burst.finish();
          reveal.finish();
          ctx.clock.play();
        }
      },

      tick(dt) {
        if (move.running) move.finish();
        if (t >= run.tEnd) {
          t = 0;
          reveal.finish();
        }
        const before = t;
        t = Math.min(run.tEnd, t + dt * (p.slow ? 0.25 : 1));
        if (run.collides && before < run.tc && t >= run.tc) {
          burst.play();
          reveal.play();
        }
        if (t >= run.tEnd) ctx.clock.pause();
        updateNow();
      },

      resetTime() {
        t = 0;
        burst.finish();
        reveal.finish();
        updateNow();
      },

      render() {
        const reg = regions(surface.width, surface.height);
        fitScene();
        scene.resize();
        chart.resize();
        surface.begin();
        drawScene();
        drawChart(reg.chart);
        drawBalance(reg.bal);
        if (move.running || burst.running || reveal.running) ctx.requestRender();
      },

      destroy: () => {
        surface.canvas.removeEventListener('pointerup', release);
        surface.canvas.removeEventListener('pointercancel', release);
        surface.destroy();
      },
    };
  },
});
