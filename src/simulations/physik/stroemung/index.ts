import { defineSimulation, Plot, Surface, subText, text, withAlpha, type Rect } from '../../../sim-core';
import {
  airfoil,
  areaRatioAt,
  bernoulliDrop,
  continuity,
  flowKind,
  G,
  inverse,
  joukowski,
  liftCoefficient,
  liftForce,
  outline,
  RHO_WATER,
  reynolds,
  STALL_DEG,
  zetaRate,
  type C,
  type FlowKind,
} from './model';

const L = (de: string, en: string) => ({ de, en });
const DEG = Math.PI / 180;
const WING = airfoil(0.1, 0.08);
/** Überdruck vor der Engstelle in m Wassersäule (Bezugswert der Steigrohre). */
const H1 = 0.5;
/** Sichtbare Höhe der Steigrohre in m. */
const H_TUBE = 0.65;
const X_MAX = 3.4;
const Y_MAX = 1.7;
/** Tempo der Luftteilchen (Modelleinheiten je Sekunde) und Abstand der Reihen in s. */
const SPEED = 1.3;
const SPAWN = 1.2;

function split(w: number, h: number): { scene: Rect; chart: Rect } {
  if (w >= 700) {
    const sw = Math.round(w * 0.64);
    return { scene: { x: 0, y: 0, w: sw, h }, chart: { x: sw, y: 0, w: w - sw, h } };
  }
  const sh = Math.round(h * 0.62);
  return { scene: { x: 0, y: 0, w, h: sh }, chart: { x: 0, y: sh, w, h: h - sh } };
}

/** Geschwindigkeitsprofil über den Querschnitt (s ∈ [−1, 1], Mittelwert 1). */
function profile(s: number, kind: FlowKind): number {
  const lam = 1.5 * (1 - s * s);
  const turb = (8 / 7) * Math.pow(Math.max(0, 1 - Math.abs(s)), 1 / 7);
  if (kind === 'laminar') return lam;
  if (kind === 'turbulent') return turb;
  return 0.5 * (lam + turb);
}

interface PipeParticle {
  u: number;
  s: number;
}

interface WingParticle {
  zeta: C;
  age: number;
}

/**
 * Strömungsphysik: Rohr mit Engstelle (Kontinuität, Bernoulli, Reynolds-Zahl)
 * und Tragflügel (Stromlinien, Zirkulation, dynamischer Auftrieb).
 */
export default defineSimulation({
  id: 'stroemung',
  animated: true,
  layout: { aspect: 1.7, aspectNarrow: 0.95 },
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Versuch', 'Experiment'),
      options: [
        { value: 'rohr', label: L('Rohr mit Engstelle', 'Pipe with constriction') },
        { value: 'fluegel', label: L('Tragflügel', 'Wing') },
      ],
      default: 'rohr',
      display: 'buttons',
    },
    { key: 'v1', type: 'number', label: L('Geschwindigkeit vor der Engstelle', 'Speed before the constriction'), min: 0.01, max: 2, step: 0.01, default: 0.4, unit: 'm/s', visibleIf: (v) => v.mode === 'rohr' },
    { key: 'd', type: 'number', label: L('Rohrdurchmesser', 'Pipe diameter'), min: 0.2, max: 10, step: 0.1, default: 0.5, unit: 'cm', visibleIf: (v) => v.mode === 'rohr' },
    { key: 'eng', type: 'number', label: L('Querschnitt der Engstelle', 'Cross-section of the constriction'), min: 10, max: 100, step: 5, default: 25, unit: '%', visibleIf: (v) => v.mode === 'rohr' },
    { key: 'v', type: 'number', label: L('Fluggeschwindigkeit', 'Airspeed'), min: 0, max: 90, step: 1, default: 40, unit: 'm/s', visibleIf: (v) => v.mode === 'fluegel' },
    { key: 'alpha', type: 'number', label: L('Anstellwinkel', 'Angle of attack'), min: -6, max: 24, step: 1, default: 6, unit: '°', visibleIf: (v) => v.mode === 'fluegel' },
    { key: 'A', type: 'number', label: L('Flügelfläche', 'Wing area'), min: 1, max: 120, step: 1, default: 16, unit: 'm²', visibleIf: (v) => v.mode === 'fluegel' },
  ],
  hint: (v) =>
    v.mode === 'fluegel'
      ? L(
          'Drücke Start: Die Luftteilchen starten in Reihen. Oben kommen sie früher hinten an – dort ist die Luft schneller und der Druck kleiner.',
          'Press play: the air particles start in rows. Above the wing they reach the back sooner – the air is faster there and the pressure lower.',
        )
      : L(
          'Drücke Start: In der Engstelle fließt das Wasser schneller. Die Steigrohre zeigen, dass der Druck dort kleiner ist.',
          'Press play: in the constriction the water flows faster. The standpipes show that the pressure there is lower.',
        ),
  readouts: [
    { key: 'speed', label: L('Geschwindigkeiten', 'Speeds') },
    { key: 'dp', label: L('Druckunterschied', 'Pressure difference'), spoiler: true },
    { key: 're', label: L('Strömungsart', 'Type of flow') },
    { key: 'cA', label: L('Auftriebsbeiwert', 'Lift coefficient') },
    { key: 'F', label: L('Auftriebskraft', 'Lift force'), spoiler: true },
  ],
  presets: [
    { id: 'laminar', label: L('Rohr: ruhig (laminar)', 'Pipe: smooth (laminar)'), values: { mode: 'rohr', v1: 0.4, d: 0.5, eng: 25 } },
    { id: 'turbulent', label: L('Rohr: verwirbelt (turbulent)', 'Pipe: swirling (turbulent)'), values: { mode: 'rohr', v1: 0.8, d: 2, eng: 25 } },
    { id: 'reise', label: L('Flügel: Reiseflug', 'Wing: cruise'), values: { mode: 'fluegel', v: 55, alpha: 3, A: 16 } },
    { id: 'start', label: L('Flügel: Start', 'Wing: take-off'), values: { mode: 'fluegel', v: 30, alpha: 12, A: 16 } },
    { id: 'abriss', label: L('Flügel: Strömungsabriss', 'Wing: stall'), values: { mode: 'fluegel', v: 30, alpha: 20, A: 16 } },
  ],
  strings: {
    de: {
      canvasRohr: 'Waagerechtes Rohr mit Engstelle, Wasserteilchen strömen von links nach rechts; drei Steigrohre zeigen den Druck vor, in und hinter der Engstelle',
      canvasFluegel: 'Tragflügel im Luftstrom mit Stromlinien und Luftteilchen; Pfeil für die Auftriebskraft; daneben Diagramm Auftriebsbeiwert über Anstellwinkel',
      speedRohr: 'v₁ = {v1} m/s, v₂ = {v2} m/s ({f}-fach)',
      dpVal: 'Δp = {dp} Pa (Δh = {dh} cm Wassersäule)',
      reVal: 'Re₁ ≈ {r1}: {k1}; Engstelle Re₂ ≈ {r2}: {k2}',
      laminar: 'laminar',
      transition: 'Übergang',
      turbulent: 'turbulent',
      cAVal: 'c<sub>A</sub> ≈ {c}{stall}',
      stall: ' – Strömungsabriss!',
      FVal: 'F<sub>A</sub> ≈ {F} kN (trägt etwa {m} kg)',
      v1: 'v₁',
      v2: 'v₂',
      A1: 'A₁',
      A2: 'A₂',
      sog: 'Sog',
      plus: 'Überdruck',
      minus: 'Unterdruck',
      lift: 'F_A',
      wind: 'Anströmung',
      cA: 'c_A',
      alpha: 'α in °',
      abriss: 'Abriss',
      sep: 'Strömung löst sich ab',
    },
    en: {
      canvasRohr: 'Horizontal pipe with a constriction, water particles flow from left to right; three standpipes show the pressure before, in and after the constriction',
      canvasFluegel: 'Wing in an air stream with streamlines and air particles; arrow for the lift force; next to it a graph of lift coefficient against angle of attack',
      speedRohr: 'v₁ = {v1} m/s, v₂ = {v2} m/s ({f} times)',
      dpVal: 'Δp = {dp} Pa (Δh = {dh} cm of water)',
      reVal: 'Re₁ ≈ {r1}: {k1}; constriction Re₂ ≈ {r2}: {k2}',
      laminar: 'laminar',
      transition: 'transition',
      turbulent: 'turbulent',
      cAVal: 'c<sub>L</sub> ≈ {c}{stall}',
      stall: ' – stall!',
      FVal: 'F<sub>L</sub> ≈ {F} kN (carries about {m} kg)',
      v1: 'v₁',
      v2: 'v₂',
      A1: 'A₁',
      A2: 'A₂',
      sog: 'suction',
      plus: 'higher pressure',
      minus: 'lower pressure',
      lift: 'F_L',
      wind: 'airflow',
      cA: 'c_L',
      alpha: 'α in °',
      abriss: 'stall',
      sep: 'flow separates',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvasRohr'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string | number>) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const plot = new Plot(surface, {
      x: [-6, 24],
      y: [-0.4, 1.9],
      equalAspect: false,
      pan: false,
      zoom: false,
      controls: false,
      region: (w, h) => {
        const r = split(w, h).chart;
        return { x: r.x + 6, y: r.y + 6, w: r.w - 12, h: r.h - 12 };
      },
    });

    // deterministischer Zufall, damit Bilder und Bildtests gleich bleiben
    let seed = 12345;
    const rnd = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };

    /* ---------------- Rohr ---------------- */
    const N_PIPE = 260;
    let pipe: PipeParticle[] = [];
    const ratio = () => p.eng / 100;
    const d1 = () => p.d / 100;
    const v2 = () => continuity(p.v1, ratio());
    const re1 = () => reynolds(p.v1, d1());
    const re2 = () => reynolds(v2(), d1() * Math.sqrt(ratio()));

    function resetPipe(): void {
      seed = 12345;
      pipe = Array.from({ length: N_PIPE }, () => ({ u: rnd(), s: rnd() * 1.9 - 0.95 }));
    }

    function kindAt(u: number): FlowKind {
      const a = areaRatioAt(u, ratio());
      // Re ∝ v·d ∝ (1/a)·√a = 1/√a
      return flowKind(re1() / Math.sqrt(a));
    }

    /* ---------------- Flügel ---------------- */
    let streamlines: [number, number][][] = [];
    let wing: WingParticle[] = [];
    let spawnTimer = 0;
    let swirl = 0;
    const alphaFlow = () => Math.min(p.alpha, STALL_DEG) * DEG;

    /** Flügelebene → Anzeige: Drehung um −α, damit die Luft waagerecht strömt. */
    const toDisplay = (z: C): [number, number] => {
      const a = p.alpha * DEG;
      return [z[0] * Math.cos(a) + z[1] * Math.sin(a), -z[0] * Math.sin(a) + z[1] * Math.cos(a)];
    };
    const fromDisplay = (x: number, y: number): C => {
      const a = p.alpha * DEG;
      return [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
    };

    function pushOut(zeta: C): C {
      const dx = zeta[0] - WING.mu[0];
      const dy = zeta[1] - WING.mu[1];
      const r = Math.hypot(dx, dy);
      if (r >= WING.R * 1.002) return zeta;
      const k = (WING.R * 1.002) / Math.max(r, 1e-9);
      return [WING.mu[0] + dx * k, WING.mu[1] + dy * k];
    }

    function advance(zeta: C, dt: number): C {
      // Mittelpunktverfahren in der ζ-Ebene
      const a = alphaFlow();
      const k1 = zetaRate(zeta, WING, a);
      const mid = pushOut([zeta[0] + (k1[0] * dt) / 2, zeta[1] + (k1[1] * dt) / 2]);
      const k2 = zetaRate(mid, WING, a);
      return pushOut([zeta[0] + k2[0] * dt, zeta[1] + k2[1] * dt]);
    }

    const seedsY = () => {
      const ys: number[] = [];
      for (let y = -1.5; y <= 1.5 + 1e-9; y += 0.25) ys.push(Math.round(y * 100) / 100);
      return ys;
    };

    function buildStreamlines(): void {
      streamlines = [];
      for (const y of seedsY()) {
        let zeta = pushOut(inverse(fromDisplay(-X_MAX - 0.2, y), WING));
        const line: [number, number][] = [];
        for (let i = 0; i < 900; i++) {
          const d = toDisplay(joukowski(zeta));
          line.push(d);
          if (d[0] > X_MAX + 0.2 || Math.abs(d[1]) > Y_MAX + 0.6) break;
          zeta = advance(zeta, 0.02);
        }
        streamlines.push(line);
      }
    }

    function spawnColumn(): void {
      for (const y of seedsY()) wing.push({ zeta: pushOut(inverse(fromDisplay(-X_MAX - 0.1, y + 0.125), WING)), age: 0 });
    }

    function moveWing(h: number): void {
      for (const q of wing) {
        q.zeta = advance(q.zeta, h * SPEED);
        q.age += h;
      }
      wing = wing.filter((q) => {
        const d = toDisplay(joukowski(q.zeta));
        return d[0] < X_MAX + 0.3 && Math.abs(d[1]) < Y_MAX + 0.8 && q.age < 20;
      });
    }

    function resetWing(): void {
      // Bild von Anfang an gefüllt: einige Reihen schon vorab laufen lassen
      wing = [];
      for (let k = 0; k < 4; k++) {
        spawnColumn();
        for (let i = 0; i < SPAWN / 0.05; i++) moveWing(0.05);
      }
      spawnColumn();
      spawnTimer = 0;
    }

    /* ---------------- Ergebnisse ---------------- */
    function updateReadouts(): void {
      if (p.mode === 'rohr') {
        const dp = bernoulliDrop(p.v1, v2());
        ctx.readout('speed', tr('speedRohr', { v1: fmt.num(p.v1, 2), v2: fmt.num(v2(), 2), f: fmt.num(1 / ratio(), 1) }));
        ctx.readout('dp', tr('dpVal', { dp: fmt.num(dp, 0), dh: fmt.num((dp / (RHO_WATER * G)) * 100, 1) }));
        ctx.readout('re', tr('reVal', { r1: fmt.num(re1(), 0), k1: ctx.t(flowKind(re1())), r2: fmt.num(re2(), 0), k2: ctx.t(flowKind(re2())) }));
        ctx.readout('cA', null);
        ctx.readout('F', null);
      } else {
        const cA = liftCoefficient(WING, p.alpha);
        const F = liftForce(cA, p.v, p.A);
        ctx.readout('speed', null);
        ctx.readout('dp', null);
        ctx.readout('re', null);
        ctx.readout('cA', { html: tr('cAVal', { c: fmt.num(cA, 2), stall: p.alpha > STALL_DEG ? ctx.t('stall') : '' }) });
        ctx.readout('F', { html: tr('FVal', { F: fmt.num(F / 1000, 1), m: fmt.num(Math.max(0, F / G), 0) }) });
      }
    }

    /* ---------------- Zeichnen: Rohr ---------------- */
    function drawPipe(): void {
      const g = surface.g;
      const th = ctx.theme;
      const W = surface.width;
      const Hh = surface.height;
      const x0 = W * 0.05;
      const x1 = W * 0.95;
      const cy = Hh * 0.68;
      const Rh = Math.min(Hh * 0.17, W * 0.13);
      const X = (u: number) => x0 + (x1 - x0) * u;
      const half = (u: number) => Rh * Math.sqrt(areaRatioAt(u, ratio()));
      const water = th.series[0]!;

      // Wasser im Rohr
      g.fillStyle = withAlpha(water, 0.12);
      g.beginPath();
      for (let i = 0; i <= 200; i++) g.lineTo(X(i / 200), cy - half(i / 200));
      for (let i = 200; i >= 0; i--) g.lineTo(X(i / 200), cy + half(i / 200));
      g.closePath();
      g.fill();

      // Steigrohre
      const tubes = [0.17, 0.5, 0.83];
      const top = Math.max(26, Hh * 0.06);
      const hScale = (cy - Rh - top) / H_TUBE;
      const dh = bernoulliDrop(p.v1, v2()) / (RHO_WATER * G);
      const tw = Math.max(8, Math.min(14, W * 0.018));
      for (const u of tubes) {
        const xc = X(u);
        const base = cy - half(u);
        const level = u === 0.5 ? H1 - dh : H1;
        const lv = Math.max(0, Math.min(H_TUBE, level));
        g.fillStyle = withAlpha(water, 0.35);
        g.fillRect(xc - tw / 2, base - lv * hScale, tw, lv * hScale);
        g.strokeStyle = th.text;
        g.lineWidth = 1.5;
        g.beginPath();
        g.moveTo(xc - tw / 2, base);
        g.lineTo(xc - tw / 2, top);
        g.moveTo(xc + tw / 2, base);
        g.lineTo(xc + tw / 2, top);
        g.stroke();
        if (level < 0) text(g, ctx.t('sog'), xc, base - 12, { font: `700 12px ${th.font}`, color: th.series[3]!, baseline: 'bottom' });
      }
      // Bezugslinie auf Höhe der äußeren Wasserstände
      const yRef = cy - Rh - H1 * hScale;
      g.setLineDash([5, 4]);
      g.strokeStyle = th.muted;
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(X(0.1), yRef);
      g.lineTo(X(0.9), yRef);
      g.stroke();
      g.setLineDash([]);
      // Δh am mittleren Rohr
      if (dh > 0.005) {
        const xm = X(0.5) + tw / 2 + 8;
        const y2 = cy - half(0.5) - Math.max(0, H1 - dh) * hScale;
        g.strokeStyle = th.series[3]!;
        g.lineWidth = 1.5;
        g.beginPath();
        g.moveTo(xm, yRef);
        g.lineTo(xm, Math.min(y2, cy - half(0.5)));
        g.stroke();
        text(g, 'Δh', xm + 4, (yRef + y2) / 2, { font: `700 12px ${th.font}`, color: th.series[3]!, align: 'left' });
      }

      // Rohrwände (Wände um die Steigrohr-Öffnungen herum unterbrochen)
      g.strokeStyle = th.text;
      g.lineWidth = 2.5;
      for (const sgn of [-1, 1]) {
        g.beginPath();
        let pen = false;
        for (let i = 0; i <= 400; i++) {
          const u = i / 400;
          const x = X(u);
          const gap = sgn < 0 && tubes.some((t) => Math.abs(x - X(t)) < tw / 2);
          if (gap) {
            pen = false;
            continue;
          }
          const y = cy + sgn * half(u);
          if (pen) g.lineTo(x, y);
          else g.moveTo(x, y);
          pen = true;
        }
        g.stroke();
      }

      // Teilchen
      for (const q of pipe) {
        const hh = half(q.u);
        g.fillStyle = water;
        g.beginPath();
        g.arc(X(q.u), cy + q.s * hh * 0.92, 2.4, 0, Math.PI * 2);
        g.fill();
      }

      // Beschriftung
      const lab = `600 13px ${th.mathFont}`;
      text(g, `${ctx.t('A1')}, ${ctx.t('v1')}`, X(0.17), cy + Rh + 18, { font: lab, color: th.text });
      text(g, `${ctx.t('A2')}, ${ctx.t('v2')}`, X(0.5), cy + Math.max(half(0.5), Rh * 0.3) + 18, { font: lab, color: th.text });
      text(g, `${ctx.t('A1')}, ${ctx.t('v1')}`, X(0.83), cy + Rh + 18, { font: lab, color: th.text });
    }

    function tickPipe(dt: number): void {
      const base = 0.05 + 0.1 * Math.sqrt(p.v1 / 2);
      for (const q of pipe) {
        const a = areaRatioAt(q.u, ratio());
        const kind = kindAt(q.u);
        q.u += dt * base * (1 / a) * profile(q.s, kind) * 0.8;
        if (kind !== 'laminar') {
          const amp = kind === 'turbulent' ? 2.2 : 0.8;
          q.s += (rnd() - 0.5) * amp * dt * 4;
          q.s = Math.max(-0.97, Math.min(0.97, q.s));
        }
        if (q.u > 1) {
          q.u -= 1;
          q.s = rnd() * 1.9 - 0.95;
        }
      }
    }

    /* ---------------- Zeichnen: Flügel ---------------- */
    function drawWing(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const s = Math.min((r.w - 16) / (2 * X_MAX), (r.h - 16) / (2 * Y_MAX));
      const cx = r.x + r.w / 2;
      const cy = r.y + r.h / 2;
      const P = (q: [number, number]): [number, number] => [cx + q[0] * s, cy - q[1] * s];
      g.save();
      g.beginPath();
      g.rect(r.x, r.y, r.w, r.h);
      g.clip();

      // Stromlinien
      g.strokeStyle = withAlpha(th.muted, 0.55);
      g.lineWidth = 1;
      for (const line of streamlines) {
        g.beginPath();
        line.forEach((q, i) => {
          const [x, y] = P(q);
          if (i) g.lineTo(x, y);
          else g.moveTo(x, y);
        });
        g.stroke();
      }

      // abgelöste Strömung bei großem Anstellwinkel
      const stalled = p.alpha > STALL_DEG;
      if (stalled) {
        const k = Math.min(1, (p.alpha - STALL_DEG) / 8);
        const te = P(toDisplay(joukowski([1, 0])));
        for (let i = 0; i < 5; i++) {
          const ex = te[0] + (0.15 + i * 0.32) * s;
          const ey = te[1] - (0.35 + 0.25 * k + 0.05 * i) * s;
          const rad = (0.16 + 0.04 * i) * s;
          g.strokeStyle = withAlpha(th.series[3]!, 0.7);
          g.lineWidth = 1.5;
          g.beginPath();
          g.arc(ex, ey, rad, swirl + i, swirl + i + Math.PI * 1.4);
          g.stroke();
        }
        subText(g, ctx.t('sep'), r.x + r.w - 8, r.y + 16, { size: 12, family: th.font, weight: 600, color: th.series[3]!, align: 'right', halo: th.bg });
      }

      // Profil
      const prof = outline(WING).map((z) => P(toDisplay(z)));
      g.fillStyle = withAlpha(th.text, 0.18);
      g.strokeStyle = th.text;
      g.lineWidth = 2;
      g.beginPath();
      prof.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
      g.closePath();
      g.fill();
      g.stroke();

      // Luftteilchen
      g.fillStyle = th.series[0]!;
      for (const q of wing) {
        const [x, y] = P(toDisplay(joukowski(q.zeta)));
        g.beginPath();
        g.arc(x, y, 3, 0, Math.PI * 2);
        g.fill();
      }

      // Druckhinweise
      const top = P(toDisplay(joukowski([WING.mu[0], WING.mu[1] + WING.R])));
      const bot = P(toDisplay(joukowski([WING.mu[0], WING.mu[1] - WING.R])));
      subText(g, `− ${ctx.t('minus')}`, top[0] - 0.35 * s, top[1] - 0.42 * s, { size: 12, family: th.font, weight: 600, color: th.series[2]!, align: 'right', halo: th.bg });
      subText(g, `+ ${ctx.t('plus')}`, bot[0] - 0.35 * s, bot[1] + 0.38 * s, { size: 12, family: th.font, weight: 600, color: th.series[2]!, align: 'right', halo: th.bg });

      // Auftriebspfeil
      const cA = liftCoefficient(WING, p.alpha);
      if (cA > 0.02) {
        const len = Math.min(1.35, cA * 0.6) * s;
        const ax = cx + 0.1 * s;
        const ay = cy - 0.05 * s;
        g.strokeStyle = th.series[1]!;
        g.fillStyle = th.series[1]!;
        g.lineWidth = 3;
        g.beginPath();
        g.moveTo(ax, ay);
        g.lineTo(ax, ay - len);
        g.stroke();
        g.beginPath();
        g.moveTo(ax, ay - len - 10);
        g.lineTo(ax - 7, ay - len + 2);
        g.lineTo(ax + 7, ay - len + 2);
        g.closePath();
        g.fill();
        subText(g, ctx.t('lift'), ax + 10, ay - len, { size: 14, family: th.mathFont, weight: 700, color: th.series[1]!, align: 'left', halo: th.bg });
      }

      // Anströmung
      const wy = r.y + 16;
      text(g, `${ctx.t('wind')} →`, r.x + 10, wy, { font: `600 12px ${th.font}`, color: th.muted, align: 'left' });
      g.restore();
    }

    function drawChart(): void {
      const th = ctx.theme;
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      plot.fn((a) => liftCoefficient(WING, a), { color: th.series[1]!, width: 2, from: -6, to: 24 });
      plot.vline(STALL_DEG, { color: th.series[3]!, dash: [5, 4], width: 1 });
      plot.text(STALL_DEG, 1.8, ctx.t('abriss'), { color: th.series[3]!, align: 'left', offset: [4, 0], size: 11 });
      plot.point(p.alpha, liftCoefficient(WING, p.alpha), { color: th.series[1]!, radius: 5 });
      plot.end();
    }

    resetPipe();
    resetWing();

    return {
      update(changed, source) {
        if (source === 'init' || changed.has('alpha') || changed.has('mode')) {
          buildStreamlines();
          resetWing();
        }
        if (changed.has('eng') || changed.has('mode')) resetPipe();
        surface.canvas.setAttribute('aria-label', ctx.t(p.mode === 'fluegel' ? 'canvasFluegel' : 'canvasRohr'));
        plot.setRangePadded([-6, 24], [-0.4, 1.9], { left: 40, right: 12, top: 22, bottom: 24 });
        plot.setAxes({ x: { label: ctx.t('alpha') }, y: { label: ctx.t('cA') } });
        updateReadouts();
      },
      tick(dt) {
        const h = Math.min(dt, 0.05);
        if (p.mode === 'rohr') {
          tickPipe(h);
          return;
        }
        swirl += h * 3;
        spawnTimer += h;
        if (spawnTimer > SPAWN) {
          spawnTimer = 0;
          spawnColumn();
        }
        moveWing(h);
      },
      resetTime() {
        resetPipe();
        resetWing();
      },
      render() {
        surface.begin();
        if (p.mode === 'rohr') {
          drawPipe();
          return;
        }
        const sp = split(surface.width, surface.height);
        plot.resize();
        drawWing(sp.scene);
        drawChart();
      },
      destroy: () => surface.destroy(),
    };
  },
});
