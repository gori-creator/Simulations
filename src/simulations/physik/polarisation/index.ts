import { defineSimulation, Plot, Surface, subText, text, withAlpha, type Rect } from '../../../sim-core';
import { chain, criticalAngle, refractionAngle, wavelengthRatio } from './model';

const L = (de: string, en: string) => ({ de, en });
const DEG = Math.PI / 180;
/** Halbe Breite und halbe Höhe des Huygens-Ausschnitts in Wellenlängen λ₁. */
const HX = 5;
const HY = 3.2;

function split(w: number, h: number): { scene: Rect; chart: Rect } {
  if (w >= 700) {
    const sw = Math.round(w * 0.64);
    return { scene: { x: 0, y: 0, w: sw, h }, chart: { x: sw, y: 0, w: w - sw, h } };
  }
  const sh = Math.round(h * 0.6);
  return { scene: { x: 0, y: 0, w, h: sh }, chart: { x: 0, y: sh, w, h: h - sh } };
}

/** Pseudozufälliger Winkel für unpolarisiertes Licht (fest je Stelle und Zeitschritt). */
function hashAngle(i: number, j: number): number {
  const v = Math.sin(i * 127.1 + j * 311.7) * 43758.5453;
  return (v - Math.floor(v)) * Math.PI;
}

/**
 * Polarisation (Filterkette, Gesetz von Malus) und Brechung im Wellenmodell
 * (Wellenfronten, Elementarwellen nach Huygens, Totalreflexion).
 */
export default defineSimulation({
  id: 'polarisation',
  animated: true,
  layout: { aspect: 1.7, aspectNarrow: 0.95 },
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Versuch', 'Experiment'),
      options: [
        { value: 'pol', label: L('Polarisationsfilter', 'Polarising filters') },
        { value: 'huygens', label: L('Brechung im Wellenmodell', 'Refraction in the wave model') },
      ],
      default: 'pol',
      display: 'buttons',
    },
    { key: 'th1', type: 'number', label: L('Winkel Polarisator', 'Angle of polariser'), min: 0, max: 180, step: 5, default: 0, unit: '°', visibleIf: (v) => v.mode === 'pol' },
    { key: 'mitte', type: 'boolean', label: L('drittes Filter in der Mitte', 'third filter in the middle'), default: false, visibleIf: (v) => v.mode === 'pol' },
    { key: 'th3', type: 'number', label: L('Winkel mittleres Filter', 'Angle of middle filter'), min: 0, max: 180, step: 5, default: 45, unit: '°', visibleIf: (v) => v.mode === 'pol' && v.mitte === true },
    { key: 'th2', type: 'number', label: L('Winkel Analysator', 'Angle of analyser'), min: 0, max: 180, step: 5, default: 60, unit: '°', visibleIf: (v) => v.mode === 'pol' },
    { key: 'alpha', type: 'number', label: L('Einfallswinkel', 'Angle of incidence'), min: 5, max: 80, step: 1, default: 40, unit: '°', visibleIf: (v) => v.mode === 'huygens' },
    { key: 'n', type: 'number', label: L('Brechzahl n = c₁/c₂', 'Refractive index n = c₁/c₂'), min: 0.5, max: 2.5, step: 0.05, default: 1.5, visibleIf: (v) => v.mode === 'huygens' },
  ],
  hint: (v) =>
    v.mode === 'huygens'
      ? L(
          'Drücke Start: Jeder Punkt der Grenzfläche, den die Welle erreicht, sendet eine Elementarwelle aus. Ihre gemeinsame Tangente ist die neue Wellenfront.',
          'Press play: every point of the boundary the wave reaches sends out a wavelet. Their common tangent is the new wave front.',
        )
      : L(
          'Drehe den Analysator: Bei 90° zum Polarisator wird es dunkel. Was passiert, wenn du ein drittes Filter dazwischen stellst?',
          'Turn the analyser: at 90° to the polariser it goes dark. What happens if you put a third filter in between?',
        ),
  readouts: [
    { key: 'I', label: L('Helligkeit am Schirm', 'Brightness on the screen'), spoiler: true },
    { key: 'delta', label: L('Winkel zwischen den Filtern', 'Angle between the filters') },
    { key: 'beta', label: L('Brechungswinkel', 'Angle of refraction'), spoiler: true },
    { key: 'lam', label: L('Wellenlänge und Tempo im 2. Stoff', 'Wavelength and speed in medium 2') },
  ],
  presets: [
    { id: 'malus', label: L('Zwei Filter, 60°', 'Two filters, 60°'), values: { mode: 'pol', th1: 0, th2: 60, mitte: false } },
    { id: 'gekreuzt', label: L('Gekreuzte Filter', 'Crossed filters'), values: { mode: 'pol', th1: 0, th2: 90, mitte: false } },
    { id: 'drei', label: L('Drittes Filter dazwischen', 'Third filter in between'), values: { mode: 'pol', th1: 0, th2: 90, mitte: true, th3: 45 } },
    { id: 'glas', label: L('Luft → Glas', 'Air → glass'), values: { mode: 'huygens', alpha: 40, n: 1.5 } },
    { id: 'total', label: L('Glas → Luft: Totalreflexion', 'Glass → air: total internal reflection'), values: { mode: 'huygens', alpha: 50, n: 0.65 } },
  ],
  strings: {
    de: {
      canvasPol: 'Lichtbündel von einer Lampe durch zwei oder drei Polarisationsfilter auf einen Schirm, mit schwingendem elektrischem Feld; daneben Diagramm der Helligkeit über dem Winkel des letzten Filters',
      canvasHuy: 'Ebene Welle trifft schräg auf eine Grenzfläche; Wellenfronten, Elementarwellen und Strahlen zeigen die Brechung',
      IVal: 'I = {p} · I₀ ({pc} %)',
      dVal: 'Δθ = {d}°',
      dVal3: 'Δθ = {a}° und {b}°',
      betaVal: 'β ≈ {b}°',
      betaTR: 'Totalreflexion (Grenzwinkel {g}°)',
      lamVal: 'λ₂ = {r} · λ₁,  c₂ = {r} · c₁',
      lamp: 'Lampe',
      screen: 'Schirm',
      unpol: 'unpolarisiert',
      f1: 'θ₁',
      f2: 'θ₂',
      f3: 'θ₃',
      Irel: 'I / I₀',
      thLast: 'Winkel Analysator in °',
      m1: 'Stoff 1',
      m2: 'Stoff 2',
      lot: 'Lot',
      total: 'Totalreflexion',
    },
    en: {
      canvasPol: 'Light beam from a lamp through two or three polarising filters onto a screen, with the oscillating electric field; next to it a graph of brightness against the angle of the last filter',
      canvasHuy: 'A plane wave hits a boundary at an angle; wave fronts, wavelets and rays show the refraction',
      IVal: 'I = {p} · I₀ ({pc} %)',
      dVal: 'Δθ = {d}°',
      dVal3: 'Δθ = {a}° and {b}°',
      betaVal: 'β ≈ {b}°',
      betaTR: 'total internal reflection (critical angle {g}°)',
      lamVal: 'λ₂ = {r} · λ₁,  c₂ = {r} · c₁',
      lamp: 'lamp',
      screen: 'screen',
      unpol: 'unpolarised',
      f1: 'θ₁',
      f2: 'θ₂',
      f3: 'θ₃',
      Irel: 'I / I₀',
      thLast: 'angle of analyser in °',
      m1: 'medium 1',
      m2: 'medium 2',
      lot: 'normal',
      total: 'total internal reflection',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvasPol'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string | number>) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const plot = new Plot(surface, {
      x: [0, 180],
      y: [0, 0.55],
      equalAspect: false,
      pan: false,
      zoom: false,
      controls: false,
      region: (w, h) => {
        const r = split(w, h).chart;
        return { x: r.x + 6, y: r.y + 6, w: r.w - 12, h: r.h - 12 };
      },
    });

    let t = 0;
    /** Startzeit: Die hervorgehobene Wellenfront hat die Grenzfläche schon halb überquert. */
    const t0 = () => (p.mode === 'huygens' ? HX * Math.sin(p.alpha * DEG) + 0.6 : 0);

    const filters = (): number[] => (p.mitte ? [p.th1, p.th3, p.th2] : [p.th1, p.th2]);
    const absDelta = (a: number, b: number) => {
      const d = Math.abs(a - b) % 180;
      return Math.min(d, 180 - d);
    };

    function updateReadouts(): void {
      if (p.mode === 'pol') {
        const I = chain(filters());
        ctx.readout('I', tr('IVal', { p: fmt.num(I, 3), pc: fmt.num(I * 100, 1) }));
        ctx.readout(
          'delta',
          p.mitte ? tr('dVal3', { a: fmt.num(absDelta(p.th1, p.th3), 0), b: fmt.num(absDelta(p.th3, p.th2), 0) }) : tr('dVal', { d: fmt.num(absDelta(p.th1, p.th2), 0) }),
        );
        ctx.readout('beta', null);
        ctx.readout('lam', null);
      } else {
        const b = refractionAngle(p.alpha, p.n);
        const g = criticalAngle(p.n);
        ctx.readout('beta', b === null ? tr('betaTR', { g: fmt.num(g ?? 0, 1) }) : tr('betaVal', { b: fmt.num(b, 1) }));
        ctx.readout('lam', tr('lamVal', { r: fmt.num(wavelengthRatio(p.n), 2) }));
        ctx.readout('I', null);
        ctx.readout('delta', null);
      }
    }

    /* ---------------- Polarisation ---------------- */
    function drawPol(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const y0 = r.y + r.h * 0.52;
      const xL = r.x + 46;
      const xR = r.x + r.w - 46;
      const R = Math.max(26, Math.min(r.h * 0.3, r.w * 0.11));
      const P = (x: number, y: number, z: number): [number, number] => [x - 0.42 * z, y0 - y + 0.26 * z];
      const angles = filters();
      const pos = p.mitte ? [0.24, 0.5, 0.76] : [0.3, 0.7];
      const fx = pos.map((u) => xL + (xR - xL) * u);
      const names = p.mitte ? [ctx.t('f1'), ctx.t('f3'), ctx.t('f2')] : [ctx.t('f1'), ctx.t('f2')];
      const fieldColor = th.series[0]!;

      // Lichtbündel als Achse
      g.strokeStyle = withAlpha(th.muted, 0.6);
      g.lineWidth = 1;
      g.setLineDash([4, 4]);
      g.beginPath();
      g.moveTo(xL, y0);
      g.lineTo(xR, y0);
      g.stroke();
      g.setLineDash([]);

      // Amplituden in den Abschnitten
      const A0 = R * 0.75;
      const amps: number[] = [A0];
      const dirs: number[] = [0];
      for (let i = 0; i < angles.length; i++) {
        if (i === 0) amps.push(A0 / Math.SQRT2);
        else amps.push(amps[i]! * Math.cos((angles[i]! - angles[i - 1]!) * DEG));
        dirs.push(angles[i]! * DEG);
      }
      const edges = [xL + 14, ...fx, xR - 10];
      const k = (2 * Math.PI) / 70;
      const omega = 2 * Math.PI * 0.9;
      const drawFilter = (x: number, ang: number, name: string) => {
        const pts: [number, number][] = [];
        for (let i = 0; i <= 48; i++) {
          const a = (i / 48) * 2 * Math.PI;
          pts.push(P(x, R * Math.cos(a), R * Math.sin(a)));
        }
        g.fillStyle = withAlpha(th.muted, 0.14);
        g.strokeStyle = th.text;
        g.lineWidth = 1.5;
        g.beginPath();
        pts.forEach(([px, py], i) => (i ? g.lineTo(px, py) : g.moveTo(px, py)));
        g.closePath();
        g.fill();
        g.stroke();
        // Durchlassrichtung: parallele Linien
        const c = Math.cos(ang * DEG);
        const s = Math.sin(ang * DEG);
        g.strokeStyle = withAlpha(th.text, 0.55);
        g.lineWidth = 1;
        for (const o of [-0.6, -0.3, 0, 0.3, 0.6]) {
          const half = Math.sqrt(1 - o * o) * R * 0.95;
          // Mittelpunkt der Linie senkrecht zur Durchlassrichtung verschoben
          const oy = -s * o * R;
          const oz = c * o * R;
          const a = P(x, oy - c * half, oz - s * half);
          const b = P(x, oy + c * half, oz + s * half);
          g.beginPath();
          g.moveTo(a[0], a[1]);
          g.lineTo(b[0], b[1]);
          g.stroke();
        }
        subText(g, `${name} = ${fmt.num(ang, 0)}°`, x, y0 + R + 22, { size: 13, family: th.mathFont, weight: 600, color: th.text, halo: th.bg });
      };

      // Feld abschnittsweise; die Filter werden dazwischen gezeichnet (Tiefenwirkung)
      for (let seg = 0; seg < edges.length - 1; seg++) {
        const a = edges[seg]!;
        const b = edges[seg + 1]!;
        g.lineWidth = 2;
        for (let x = a + 6; x < b - 4; x += 9) {
          const phase = Math.cos(k * x - omega * t);
          let ang = dirs[seg]!;
          let amp = amps[seg]!;
          if (seg === 0) {
            ang = hashAngle(Math.round(x), Math.floor(t * 5));
            amp = A0;
          }
          const e = amp * phase;
          const tip = P(x, e * Math.cos(ang), e * Math.sin(ang));
          const base = P(x, 0, 0);
          g.strokeStyle = withAlpha(fieldColor, seg === 0 ? 0.45 : 0.9);
          g.beginPath();
          g.moveTo(base[0], base[1]);
          g.lineTo(tip[0], tip[1]);
          g.stroke();
        }
        if (seg < fx.length) drawFilter(fx[seg]!, angles[seg]!, names[seg]!);
      }

      // Lampe
      g.fillStyle = th.series[2]!;
      g.beginPath();
      g.arc(xL, y0, 12, 0, Math.PI * 2);
      g.fill();
      text(g, ctx.t('lamp'), xL, y0 + R + 22, { font: `600 12px ${th.font}`, color: th.muted });
      text(g, ctx.t('unpol'), (edges[0]! + edges[1]!) / 2, y0 - R - 14, { font: `600 12px ${th.font}`, color: th.muted });

      // Schirm mit Helligkeit
      const I = chain(angles) / 0.5;
      const sw = 12;
      const sh = R * 1.6;
      g.fillStyle = withAlpha(th.series[2]!, 0.1 + 0.85 * I);
      g.fillRect(xR - sw / 2, y0 - sh / 2, sw, sh);
      g.strokeStyle = th.text;
      g.lineWidth = 1.5;
      g.strokeRect(xR - sw / 2, y0 - sh / 2, sw, sh);
      text(g, ctx.t('screen'), xR, y0 + R + 22, { font: `600 12px ${th.font}`, color: th.muted });
    }

    function drawChart(): void {
      const th = ctx.theme;
      const others = p.mitte ? [p.th1, p.th3] : [p.th1];
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      plot.fn((x) => chain([...others, x]), { color: th.series[1]!, width: 2, from: 0, to: 180 });
      plot.point(p.th2, chain(filters()), { color: th.series[1]!, radius: 5 });
      plot.end();
    }

    /* ---------------- Huygens ---------------- */
    function drawHuygens(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const s = Math.min((r.w - 12) / (2 * HX), (r.h - 12) / (2 * HY));
      const cx = r.x + r.w / 2;
      const cy = r.y + r.h / 2;
      const P = (x: number, y: number): [number, number] => [cx + x * s, cy - y * s];
      const left = cx - HX * s;
      const right = cx + HX * s;
      const top = cy - HY * s;
      const bottom = cy + HY * s;
      const a = p.alpha * DEG;
      const sa = Math.sin(a);
      const bDeg = refractionAngle(p.alpha, p.n);
      const tir = bDeg === null;
      const b = (bDeg ?? 0) * DEG;
      const c2 = 1 / p.n;
      const shift = HX * sa;

      // Stoff 2 einfärben
      g.fillStyle = withAlpha(th.series[0]!, 0.09);
      g.fillRect(left, cy, right - left, bottom - cy);
      g.strokeStyle = th.text;
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(left, cy);
      g.lineTo(right, cy);
      g.stroke();

      /** Gerade k·r = d im Halbraum (oben/unten) zeichnen. */
      const front = (kx: number, ky: number, d: number, upper: boolean, color: string, width: number, dash: number[] = []) => {
        g.save();
        g.beginPath();
        if (upper) g.rect(left, top, right - left, cy - top);
        else g.rect(left, cy, right - left, bottom - cy);
        g.clip();
        const L2 = 20;
        const ox = d * kx;
        const oy = d * ky;
        const p1 = P(ox - ky * L2, oy + kx * L2);
        const p2 = P(ox + ky * L2, oy - kx * L2);
        g.strokeStyle = color;
        g.lineWidth = width;
        g.setLineDash(dash);
        g.beginPath();
        g.moveTo(p1[0], p1[1]);
        g.lineTo(p2[0], p2[1]);
        g.stroke();
        g.restore();
      };

      const k1: [number, number] = [sa, -Math.cos(a)];
      const k2: [number, number] = [Math.sin(b), -Math.cos(b)];
      const kr: [number, number] = [sa, Math.cos(a)];
      const faint = withAlpha(th.muted, 0.6);
      const cycle = Math.ceil(2 * HX * sa + 3);
      const mH = t - (t % cycle);
      const tau = t - mH;
      const mMin = Math.floor(t) - 30;
      for (let m = mMin; m <= Math.floor(t) + 30; m++) {
        const ph = t - m;
        if (Math.abs(m - mH) < 1e-9) continue;
        front(k1[0], k1[1], ph - shift, true, faint, 1);
        if (!tir) front(k2[0], k2[1], c2 * ph - HX * Math.sin(b), false, faint, 1);
        else front(kr[0], kr[1], ph - shift, true, withAlpha(th.series[3]!, 0.45), 1, [4, 4]);
      }
      // hervorgehobene Wellenfront
      const hi = th.series[1]!;
      front(k1[0], k1[1], tau - shift, true, hi, 3);
      if (!tir) front(k2[0], k2[1], c2 * tau - HX * Math.sin(b), false, hi, 3);
      else front(kr[0], kr[1], tau - shift, true, th.series[3]!, 3);

      // Elementarwellen von der Grenzfläche
      const N = 10;
      const speed2 = tir ? 1 : c2;
      g.save();
      g.beginPath();
      if (tir) g.rect(left, top, right - left, cy - top);
      else g.rect(left, cy, right - left, bottom - cy);
      g.clip();
      for (let j = 0; j <= N; j++) {
        const xj = -HX + (2 * HX * j) / N;
        const tj = (xj + HX) * sa;
        if (tau <= tj) continue;
        const rad = speed2 * (tau - tj) * s;
        const [px, py] = P(xj, 0);
        g.strokeStyle = withAlpha(tir ? th.series[3]! : th.series[0]!, 0.8);
        g.lineWidth = 1.5;
        g.beginPath();
        g.arc(px, py, rad, 0, Math.PI * 2);
        g.stroke();
        g.fillStyle = th.series[0]!;
        g.beginPath();
        g.arc(px, py, 3, 0, Math.PI * 2);
        g.fill();
      }
      g.restore();

      // Lot und Strahlen
      g.strokeStyle = th.muted;
      g.lineWidth = 1;
      g.setLineDash([5, 4]);
      g.beginPath();
      g.moveTo(cx, top + 6);
      g.lineTo(cx, bottom - 6);
      g.stroke();
      g.setLineDash([]);
      const ray = (dx: number, dy: number, len: number, color: string, outward: boolean) => {
        const o = P(0, 0);
        const e = P(dx * len, dy * len);
        const [from, to] = outward ? [o, e] : [e, o];
        g.strokeStyle = color;
        g.fillStyle = color;
        g.lineWidth = 2.5;
        g.beginPath();
        g.moveTo(from[0], from[1]);
        g.lineTo(to[0], to[1]);
        g.stroke();
        const ang = Math.atan2(to[1] - from[1], to[0] - from[0]);
        const hx = from[0] + (to[0] - from[0]) * 0.6;
        const hy = from[1] + (to[1] - from[1]) * 0.6;
        g.beginPath();
        g.moveTo(hx + 9 * Math.cos(ang), hy + 9 * Math.sin(ang));
        g.lineTo(hx - 6 * Math.cos(ang) - 5 * Math.sin(ang), hy - 6 * Math.sin(ang) + 5 * Math.cos(ang));
        g.lineTo(hx - 6 * Math.cos(ang) + 5 * Math.sin(ang), hy - 6 * Math.sin(ang) - 5 * Math.cos(ang));
        g.closePath();
        g.fill();
      };
      const rl = Math.min(HY * 0.9, 2.8);
      ray(-sa, Math.cos(a), rl, th.text, false);
      if (!tir) ray(Math.sin(b), -Math.cos(b), rl, th.text, true);
      else ray(sa, Math.cos(a), rl, th.series[3]!, true);

      // Winkelbögen
      const o = P(0, 0);
      const ra = 0.9 * s;
      g.strokeStyle = th.text;
      g.lineWidth = 1.5;
      g.beginPath();
      g.arc(o[0], o[1], ra, -Math.PI / 2 - a, -Math.PI / 2);
      g.stroke();
      subText(g, 'α', o[0] - (ra + 12) * Math.sin(a / 2), o[1] - (ra + 12) * Math.cos(a / 2), { size: 14, family: th.mathFont, weight: 700, color: th.text, halo: th.bg });
      if (!tir) {
        g.beginPath();
        g.arc(o[0], o[1], ra, Math.PI / 2 - b, Math.PI / 2);
        g.stroke();
        subText(g, 'β', o[0] + (ra + 12) * Math.sin(b / 2), o[1] + (ra + 12) * Math.cos(b / 2), { size: 14, family: th.mathFont, weight: 700, color: th.text, halo: th.bg });
      }

      // Beschriftung
      text(g, ctx.t('m1'), left + 8, top + 14, { font: `600 12px ${th.font}`, color: th.muted, align: 'left' });
      text(g, ctx.t('m2'), left + 8, cy + 16, { font: `600 12px ${th.font}`, color: th.muted, align: 'left' });
      text(g, ctx.t('lot'), cx + 6, top + 14, { font: `600 12px ${th.font}`, color: th.muted, align: 'left' });
      if (tir) subText(g, ctx.t('total'), right - 8, cy + 18, { size: 13, family: th.font, weight: 700, color: th.series[3]!, align: 'right', halo: th.bg });
    }

    return {
      update(changed, source) {
        if (source === 'init' || changed.has('mode') || changed.has('alpha') || changed.has('n')) t = t0();
        surface.canvas.setAttribute('aria-label', ctx.t(p.mode === 'huygens' ? 'canvasHuy' : 'canvasPol'));
        plot.setRangePadded([0, 180], [0, 0.55], { left: 40, right: 12, top: 22, bottom: 24 });
        plot.setAxes({ x: { label: ctx.t('thLast') }, y: { label: ctx.t('Irel') } });
        updateReadouts();
      },
      tick(dt) {
        t += Math.min(dt, 0.05) * (p.mode === 'huygens' ? 0.8 : 1);
      },
      resetTime() {
        t = t0();
      },
      render() {
        surface.begin();
        if (p.mode === 'huygens') {
          drawHuygens({ x: 0, y: 0, w: surface.width, h: surface.height });
          return;
        }
        const sp = split(surface.width, surface.height);
        plot.resize();
        drawPol(sp.scene);
        drawChart();
      },
      destroy: () => surface.destroy(),
    };
  },
});
