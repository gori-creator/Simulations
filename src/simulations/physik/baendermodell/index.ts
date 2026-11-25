import { defineSimulation, Plot, Surface, subText, text, withAlpha, type Rect } from '../../../sim-core';
import {
  bandEdges,
  conductivity,
  intrinsicDensity,
  LEVELS,
  MATERIALS,
  resistance,
  splitLevels,
  SUPER,
} from './model';

const L = (de: string, en: string) => ({ de, en });
const SUP: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' };
const E_MIN = -13;
const E_MAX = 0;
const METAL_EF = 1.5;

function split(w: number, h: number): { scene: Rect; chart: Rect } {
  if (w >= 700) {
    const sw = Math.round(w * 0.56);
    return { scene: { x: 0, y: 0, w: sw, h }, chart: { x: sw, y: 0, w: w - sw, h } };
  }
  const sh = Math.round(h * 0.56);
  return { scene: { x: 0, y: 0, w, h: sh }, chart: { x: 0, y: sh, w, h: h - sh } };
}

/** Fester Zufallswert je Platz (für gleichbleibende Bilder). */
function hash(i: number): number {
  const v = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return v - Math.floor(v);
}

/**
 * Bändermodell: Aus Atomniveaus werden Bänder, Leiter/Halbleiter/Isolator
 * unterscheiden sich durch die Bandlücke, Supraleiter verlieren unter T_c
 * ihren Widerstand und verdrängen Magnetfelder.
 */
export default defineSimulation({
  id: 'baendermodell',
  animated: true,
  layout: { aspect: 1.7, aspectNarrow: 1 },
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Ansicht', 'View'),
      options: [
        { value: 'abstand', label: L('Bänder entstehen', 'How bands form') },
        { value: 'stoffe', label: L('Leiter, Halbleiter, Isolator', 'Conductor, semiconductor, insulator') },
        { value: 'supra', label: L('Supraleitung', 'Superconductivity') },
      ],
      default: 'abstand',
      display: 'buttons',
    },
    { key: 'N', type: 'number', label: L('Anzahl der Atome', 'Number of atoms'), min: 1, max: 30, step: 1, default: 6, visibleIf: (v) => v.mode === 'abstand' },
    { key: 'd', type: 'number', label: L('Abstand der Atome (relativ zum Gitter)', 'Distance between atoms (relative to lattice)'), min: 0.6, max: 3, step: 0.05, default: 1, visibleIf: (v) => v.mode === 'abstand' },
    {
      key: 'stoff',
      type: 'choice',
      label: L('Stoff', 'Material'),
      options: [
        { value: 'cu', label: L('Kupfer', 'copper') },
        { value: 'ge', label: L('Germanium', 'germanium') },
        { value: 'si', label: L('Silizium', 'silicon') },
        { value: 'c', label: L('Diamant', 'diamond') },
      ],
      default: 'si',
      display: 'buttons',
      visibleIf: (v) => v.mode === 'stoffe',
    },
    { key: 'T', type: 'number', label: L('Temperatur', 'Temperature'), min: 50, max: 800, step: 10, default: 300, unit: 'K', visibleIf: (v) => v.mode === 'stoffe' },
    {
      key: 'sl',
      type: 'choice',
      label: L('Supraleiter', 'Superconductor'),
      options: [
        { value: 'hg', label: L('Quecksilber', 'mercury') },
        { value: 'pb', label: L('Blei', 'lead') },
        { value: 'nb', label: L('Niob', 'niobium') },
      ],
      default: 'hg',
      display: 'buttons',
      visibleIf: (v) => v.mode === 'supra',
    },
    { key: 'Ts', type: 'number', label: L('Temperatur', 'Temperature'), min: 0, max: 20, step: 0.1, default: 3, unit: 'K', visibleIf: (v) => v.mode === 'supra' },
  ],
  hint: (v) =>
    v.mode === 'stoffe'
      ? L('Erwärme Silizium und Kupfer: Wer leitet warm besser, wer schlechter?', 'Heat up silicon and copper: which conducts better when warm, which worse?')
      : v.mode === 'supra'
        ? L('Kühle unter die Sprungtemperatur: Der Widerstand verschwindet, und das Magnetfeld wird hinausgedrängt.', 'Cool below the critical temperature: the resistance vanishes and the magnetic field is pushed out.')
        : L('Bringe immer mehr Atome zusammen und verkleinere ihren Abstand: Aus einzelnen Niveaus werden Bänder.', 'Bring more and more atoms together and reduce their distance: single levels turn into bands.'),
  readouts: [
    { key: 'lv', label: L('Niveaus', 'Levels') },
    { key: 'gap', label: L('Zwischen den Bändern', 'Between the bands'), spoiler: true },
    { key: 'eg', label: L('Bandlücke', 'Band gap') },
    { key: 'n', label: L('Freie Elektronen', 'Free electrons'), spoiler: true },
    { key: 'sigma', label: L('Leitfähigkeit', 'Conductivity'), spoiler: true },
    { key: 'tc', label: L('Sprungtemperatur', 'Critical temperature') },
    { key: 'R', label: L('Widerstand', 'Resistance'), spoiler: true },
  ],
  presets: [
    { id: 'atom', label: L('Einzelnes Atom', 'Single atom'), values: { mode: 'abstand', N: 1, d: 1 } },
    { id: 'kristall', label: L('Kristall (30 Atome)', 'Crystal (30 atoms)'), values: { mode: 'abstand', N: 30, d: 1 } },
    { id: 'si', label: L('Silizium, warm', 'Silicon, warm'), values: { mode: 'stoffe', stoff: 'si', T: 500 } },
    { id: 'cu', label: L('Kupfer', 'Copper'), values: { mode: 'stoffe', stoff: 'cu', T: 300 } },
    { id: 'supra', label: L('Blei unter 7,2 K', 'Lead below 7.2 K'), values: { mode: 'supra', sl: 'pb', Ts: 5 } },
  ],
  strings: {
    de: {
      canvasAbstand: 'Reihe von Atomen und darunter ihre Energieniveaus, die sich zu Bändern aufspalten; daneben Diagramm der Bänder über dem Atomabstand',
      canvasStoffe: 'Bänderschema mit Valenzband, Leitungsband und Bandlücke; Elektronen als Punkte, Löcher als Kreise; daneben Diagramm der Leitfähigkeit über der Temperatur',
      canvasSupra: 'Kugel im Magnetfeld: oberhalb der Sprungtemperatur gehen die Feldlinien hindurch, darunter werden sie verdrängt; daneben Diagramm Widerstand über Temperatur',
      lvVal: '{N} Atome → {N} Niveaus je Band',
      gapVal: 'Bandlücke ≈ {g} eV',
      overlap: 'Bänder überlappen',
      egVal: 'E<sub>g</sub> = {g} eV',
      egMetal: 'keine (Metall: Band nur halb gefüllt)',
      nVal: 'n ≈ {n} pro cm³',
      nMetal: 'n ≈ 8,5 · 10²² pro cm³ (etwa ein Elektron je Atom)',
      sigmaVal: 'σ ≈ {s} S/m',
      tcVal: 'T<sub>c</sub> = {t} K',
      Rzero: 'R = 0 (supraleitend)',
      Rval: 'R ≈ {r} · R(20 K)',
      energy: 'Energie',
      atoms: 'Atome',
      band1: 'Band 1',
      band2: 'Band 2',
      level1: 'Niveau 1',
      level2: 'Niveau 2',
      gap: 'Lücke',
      cb: 'Leitungsband',
      vb: 'Valenzband',
      band: 'Band (halb gefüllt)',
      EF: 'E_F',
      Eg: 'E_g',
      dAx: 'Abstand d',
      EAx: 'E in eV',
      TAx: 'T in K',
      sAx: 'lg(σ in S/m)',
      RAx: 'R / R(20 K)',
      superOn: 'supraleitend: R = 0, Feld verdrängt',
      superOff: 'normalleitend',
      B: 'B',
    },
    en: {
      canvasAbstand: 'Row of atoms with their energy levels below, which split into bands; next to it a graph of the bands against atomic distance',
      canvasStoffe: 'Band diagram with valence band, conduction band and band gap; electrons as dots, holes as circles; next to it a graph of conductivity against temperature',
      canvasSupra: 'Sphere in a magnetic field: above the critical temperature the field lines pass through, below they are pushed out; next to it a graph of resistance against temperature',
      lvVal: '{N} atoms → {N} levels per band',
      gapVal: 'band gap ≈ {g} eV',
      overlap: 'bands overlap',
      egVal: 'E<sub>g</sub> = {g} eV',
      egMetal: 'none (metal: band only half filled)',
      nVal: 'n ≈ {n} per cm³',
      nMetal: 'n ≈ 8.5 · 10²² per cm³ (about one electron per atom)',
      sigmaVal: 'σ ≈ {s} S/m',
      tcVal: 'T<sub>c</sub> = {t} K',
      Rzero: 'R = 0 (superconducting)',
      Rval: 'R ≈ {r} · R(20 K)',
      energy: 'energy',
      atoms: 'atoms',
      band1: 'band 1',
      band2: 'band 2',
      level1: 'level 1',
      level2: 'level 2',
      gap: 'gap',
      cb: 'conduction band',
      vb: 'valence band',
      band: 'band (half filled)',
      EF: 'E_F',
      Eg: 'E_g',
      dAx: 'distance d',
      EAx: 'E in eV',
      TAx: 'T in K',
      sAx: 'lg(σ in S/m)',
      RAx: 'R / R(20 K)',
      superOn: 'superconducting: R = 0, field expelled',
      superOff: 'normal conducting',
      B: 'B',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvasAbstand'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const sci = (v: number): string => {
      if (v === 0) return '0';
      const e = Math.floor(Math.log10(Math.abs(v)));
      const m = v / Math.pow(10, e);
      if (e >= -2 && e <= 3) return fmt.num(v, e < 0 ? 3 : 1);
      return `${fmt.num(m, 1)} · 10${String(e).replace(/./g, (c) => SUP[c] ?? c)}`;
    };
    const plot = new Plot(surface, {
      x: [0.6, 3],
      y: [E_MIN, E_MAX],
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

    function gapAt(d: number): number {
      return bandEdges(LEVELS[1]!, d)[0] - bandEdges(LEVELS[0]!, d)[1];
    }

    function updateReadouts(): void {
      const all = ['lv', 'gap', 'eg', 'n', 'sigma', 'tc', 'R'];
      const show: Record<string, string | { html: string } | null> = {};
      if (p.mode === 'abstand') {
        show.lv = tr('lvVal', { N: p.N });
        const g = gapAt(p.d);
        show.gap = g > 0 ? tr('gapVal', { g: fmt.num(g, 1) }) : ctx.t('overlap');
      } else if (p.mode === 'stoffe') {
        const m = MATERIALS[p.stoff]!;
        show.eg = m.Eg === 0 ? ctx.t('egMetal') : { html: tr('egVal', { g: fmt.num(m.Eg, 2) }) };
        show.n = m.Eg === 0 ? ctx.t('nMetal') : tr('nVal', { n: sci(intrinsicDensity(m.Eg, p.T)) });
        show.sigma = tr('sigmaVal', { s: sci(conductivity(m, p.T)) });
      } else {
        const Tc = SUPER[p.sl]!.Tc;
        show.tc = { html: tr('tcVal', { t: fmt.num(Tc, 2) }) };
        const R = resistance(p.Ts, Tc);
        show.R = R === 0 ? ctx.t('Rzero') : tr('Rval', { r: fmt.num(R, 2) });
      }
      for (const k of all) ctx.readout(k, show[k] ?? null);
    }

    /* ---------------- Bänder entstehen ---------------- */
    function drawAbstand(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const N = p.N;
      // Atome
      const rowY = r.y + Math.max(26, r.h * 0.12);
      const rowL = r.x + 84;
      const rowR = r.x + r.w - 12;
      const maxSp = (rowR - rowL - 20) / Math.max(N - 1, 1);
      const sp = Math.min(maxSp, 14 * p.d + 6);
      const rad = Math.max(2.5, Math.min(9, sp * 0.3));
      for (let i = 0; i < N; i++) {
        const x = (rowL + rowR) / 2 + (i - (N - 1) / 2) * sp;
        g.fillStyle = withAlpha(th.text, 0.25);
        g.strokeStyle = th.text;
        g.lineWidth = 1.2;
        g.beginPath();
        g.arc(x, rowY, rad, 0, Math.PI * 2);
        g.fill();
        g.stroke();
      }
      subText(g, `${N} ${ctx.t('atoms')}`, r.x + 10, rowY, { size: 12, family: th.font, weight: 600, color: th.muted, align: 'left', halo: th.bg });

      // Energieniveaus
      const top = rowY + 26;
      const bottom = r.y + r.h - 14;
      const Y = (E: number) => top + ((E_MAX - E) / (E_MAX - E_MIN)) * (bottom - top);
      const xA = r.x + r.w * 0.3;
      const xB = r.x + r.w * 0.78;
      g.strokeStyle = th.muted;
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(r.x + r.w * 0.22, bottom);
      g.lineTo(r.x + r.w * 0.22, top);
      g.stroke();
      text(g, `↑ ${ctx.t('energy')}`, r.x + r.w * 0.22 - 4, top - 10, { font: `600 12px ${th.font}`, color: th.muted, align: 'left' });
      const colors = [th.series[0]!, th.series[1]!];
      LEVELS.forEach((lev, li) => {
        const es = splitLevels(lev, N, p.d);
        g.strokeStyle = colors[li]!;
        g.lineWidth = N > 15 ? 1 : 2;
        for (const E of es) {
          g.beginPath();
          g.moveTo(xA, Y(E));
          g.lineTo(xB, Y(E));
          g.stroke();
        }
        const [lo, hi] = bandEdges(lev, p.d);
        const label = N >= 8 ? ctx.t(li === 0 ? 'band1' : 'band2') : ctx.t(li === 0 ? 'level1' : 'level2');
        text(g, label, xB + 8, Y((lo + hi) / 2), { font: `600 12px ${th.font}`, color: colors[li]!, align: 'left' });
      });
      const gap = gapAt(p.d);
      if (N >= 8 && gap > 0.3) {
        const yTop = Y(bandEdges(LEVELS[1]!, p.d)[0]);
        const yBot = Y(bandEdges(LEVELS[0]!, p.d)[1]);
        const xg = (xA + xB) / 2;
        g.strokeStyle = th.series[3]!;
        g.lineWidth = 1.5;
        g.beginPath();
        g.moveTo(xg, yTop + 2);
        g.lineTo(xg, yBot - 2);
        g.stroke();
        subText(g, ctx.t('gap'), xg + 6, (yTop + yBot) / 2, { size: 12, family: th.font, weight: 600, color: th.series[3]!, align: 'left', halo: th.bg });
      }
    }

    function chartAbstand(): void {
      const th = ctx.theme;
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      const colors = [th.series[0]!, th.series[1]!];
      LEVELS.forEach((lev, li) => {
        plot.fillBetween(
          (d) => bandEdges(lev, d)[0],
          (d) => bandEdges(lev, d)[1],
          0.6,
          3,
          { fill: colors[li]!, alpha: 0.25 },
        );
        plot.fn((d) => bandEdges(lev, d)[0], { color: colors[li]!, width: 1.5, from: 0.6, to: 3 });
        plot.fn((d) => bandEdges(lev, d)[1], { color: colors[li]!, width: 1.5, from: 0.6, to: 3 });
        for (const E of splitLevels(lev, p.N, p.d)) plot.point(p.d, E, { color: colors[li]!, radius: 2.5 });
      });
      plot.vline(p.d, { color: th.text, dash: [5, 4], width: 1 });
      plot.end();
    }

    /* ---------------- Leiter, Halbleiter, Isolator ---------------- */
    function drawStoffe(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const m = MATERIALS[p.stoff]!;
      const lo = -3;
      const hi = m.Eg === 0 ? 5 : m.Eg + 3.6;
      const top = r.y + 22;
      const bottom = r.y + r.h - 14;
      const Y = (E: number) => top + ((hi - E) / (hi - lo)) * (bottom - top);
      const xA = r.x + r.w * 0.16;
      const xB = r.x + r.w * 0.66;
      const cols = 16;
      const dx = (xB - xA) / cols;
      const e = th.series[0]!;
      const bandFill = withAlpha(th.muted, 0.16);
      const drawBand = (E1: number, E2: number) => {
        g.fillStyle = bandFill;
        g.fillRect(xA, Y(E2), xB - xA, Y(E1) - Y(E2));
        g.strokeStyle = th.text;
        g.lineWidth = 1.2;
        g.strokeRect(xA, Y(E2), xB - xA, Y(E1) - Y(E2));
      };
      const dot = (x: number, y: number, filled: boolean) => {
        g.beginPath();
        g.arc(x, y, 3.2, 0, Math.PI * 2);
        if (filled) {
          g.fillStyle = e;
          g.fill();
        } else {
          g.strokeStyle = e;
          g.lineWidth = 1.5;
          g.stroke();
        }
      };
      const labX = xB + 8;
      const lab = (s: string, E: number, color = th.text) => subText(g, s, labX, Y(E), { size: 12, family: th.font, weight: 600, color, align: 'left', halo: th.bg });

      if (m.Eg === 0) {
        drawBand(-3, 4);
        const rows = Math.max(3, Math.floor((Y(-3) - Y(METAL_EF)) / 11));
        for (let j = 0; j < rows; j++) {
          for (let i = 0; i < cols; i++) {
            const E = -3 + ((j + 0.5) / rows) * (METAL_EF + 3);
            const jit = Math.sin(t * 2 + i * 1.7 + j) * 2;
            dot(xA + (i + 0.5) * dx + jit, Y(E), true);
          }
        }
        lab(ctx.t('band'), 1);
        g.setLineDash([5, 4]);
        g.strokeStyle = th.series[3]!;
        g.beginPath();
        g.moveTo(xA - 8, Y(METAL_EF));
        g.lineTo(xB + 4, Y(METAL_EF));
        g.stroke();
        g.setLineDash([]);
        subText(g, ctx.t('EF'), xA - 12, Y(METAL_EF), { size: 13, family: th.mathFont, weight: 700, color: th.series[3]!, align: 'right', halo: th.bg });
        return;
      }

      drawBand(-3, 0);
      drawBand(m.Eg, m.Eg + 3);
      lab(ctx.t('vb'), -1.5);
      lab(ctx.t('cb'), m.Eg + 1.5);
      const n = intrinsicDensity(m.Eg, p.T);
      const count = Math.max(0, Math.min(cols * 2, Math.round(2.5 * (Math.log10(Math.max(n, 1)) - 7))));
      // Valenzband voll; die obersten Plätze werden zu Löchern
      const rows = Math.max(3, Math.floor((Y(-3) - Y(0)) / 11));
      const holes = new Set<number>();
      for (let k = 0; k < count; k++) holes.add(Math.floor(hash(k + 1) * cols) + cols * (k % 2));
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const E = -3 + ((j + 0.5) / rows) * 3;
          const slot = (rows - 1 - j) * cols + i;
          dot(xA + (i + 0.5) * dx, Y(E), !holes.has(slot));
        }
      }
      // Leitungselektronen bewegen sich frei
      for (let k = 0; k < count; k++) {
        const u = (hash(k + 50) + t * (0.05 + 0.08 * hash(k + 7))) % 1;
        const E = m.Eg + 0.25 + hash(k + 90) * 1.2;
        dot(xA + 4 + u * (xB - xA - 8), Y(E), true);
      }
      // Bandlücke
      const xg = xA + (xB - xA) * 0.5;
      if (Y(0) - Y(m.Eg) > 14) {
        g.strokeStyle = th.series[3]!;
        g.lineWidth = 1.5;
        g.beginPath();
        g.moveTo(xg, Y(m.Eg) + 2);
        g.lineTo(xg, Y(0) - 2);
        g.stroke();
      }
      subText(g, `${ctx.t('Eg')} = ${fmt.num(m.Eg, 2)} eV`, labX, Y(m.Eg / 2), { size: 13, family: th.mathFont, weight: 700, color: th.series[3]!, align: 'left', halo: th.bg });
    }

    function chartStoffe(): void {
      const th = ctx.theme;
      const m = MATERIALS[p.stoff]!;
      const f = (T: number) => Math.log10(Math.max(conductivity(m, T), 1e-40));
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      for (const id of ['cu', 'ge', 'si', 'c']) {
        if (id === m.id) continue;
        const mm = MATERIALS[id]!;
        plot.fn((T) => Math.max(-40, Math.log10(Math.max(conductivity(mm, T), 1e-40))), { color: withAlpha(th.muted, 0.5), width: 1, from: 50, to: 800 });
      }
      plot.fn((T) => Math.max(-40, f(T)), { color: th.series[1]!, width: 2.5, from: 50, to: 800 });
      const y = f(p.T);
      if (y >= -12) plot.point(p.T, y, { color: th.series[1]!, radius: 5 });
      plot.end();
    }

    /* ---------------- Supraleitung ---------------- */
    function drawSupra(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const Tc = SUPER[p.sl]!.Tc;
      const sc = p.Ts < Tc;
      const cx = r.x + r.w / 2;
      const cy = r.y + r.h * 0.46;
      const a = Math.min(r.w, r.h) * 0.2;
      const Lx = r.w / 2 - 12;
      // Feldlinien
      g.strokeStyle = th.series[0]!;
      g.lineWidth = 1.5;
      const lines = 11;
      for (let i = 0; i < lines; i++) {
        const y0 = ((i - (lines - 1) / 2) / ((lines - 1) / 2)) * (r.h * 0.34);
        g.beginPath();
        if (!sc) {
          g.moveTo(cx - Lx, cy + y0);
          g.lineTo(cx + Lx, cy + y0);
        } else {
          // Feldlinien um eine Kugel herum (Strömung um einen Zylinder, Abstand in Einheiten von a)
          let x = -Lx / a;
          let y = y0 / a;
          if (Math.abs(y) < 0.02) y = y < 0 ? -0.02 : 0.02;
          g.moveTo(cx + x * a, cy + y * a);
          for (let k = 0; k < 2000 && x < Lx / a; k++) {
            const r2 = x * x + y * y;
            const r4 = r2 * r2;
            const u = 1 - (x * x - y * y) / r4;
            const v = (-2 * x * y) / r4;
            const s = Math.hypot(u, v) || 1;
            x += (0.02 * u) / s;
            y += (0.02 * v) / s;
            g.lineTo(cx + x * a, cy + y * a);
          }
        }
        g.stroke();
      }
      // Pfeilspitzen rechts
      for (let i = 0; i < lines; i += 2) {
        const y0 = ((i - (lines - 1) / 2) / ((lines - 1) / 2)) * (r.h * 0.34);
        const x = cx + Lx - 4;
        g.fillStyle = th.series[0]!;
        g.beginPath();
        g.moveTo(x + 6, cy + y0);
        g.lineTo(x - 4, cy + y0 - 4);
        g.lineTo(x - 4, cy + y0 + 4);
        g.closePath();
        g.fill();
      }
      // Kugel
      g.fillStyle = sc ? withAlpha(th.series[2]!, 0.35) : withAlpha(th.muted, 0.3);
      g.strokeStyle = th.text;
      g.lineWidth = 2;
      g.beginPath();
      g.arc(cx, cy, a * 0.98, 0, Math.PI * 2);
      if (sc) g.fill();
      else {
        g.save();
        g.globalAlpha = 0.5;
        g.fill();
        g.restore();
      }
      g.stroke();
      subText(g, ctx.t(sc ? 'superOn' : 'superOff'), cx, r.y + r.h - 14, { size: 13, family: th.font, weight: 700, color: sc ? th.series[2]! : th.muted, halo: th.bg });
      subText(g, ctx.t('B'), cx - Lx + 4, cy - r.h * 0.34 - 12, { size: 14, family: th.mathFont, weight: 700, color: th.series[0]!, align: 'left', halo: th.bg });
    }

    function chartSupra(): void {
      const th = ctx.theme;
      const Tc = SUPER[p.sl]!.Tc;
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      plot.fn((T) => resistance(T, Tc), { color: th.series[1]!, width: 2.5, from: Tc + 1e-6, to: 20 });
      plot.segment([0, 0], [Tc, 0], { color: th.series[1]!, width: 2.5 });
      plot.segment([Tc, 0], [Tc, resistance(Tc, Tc)], { color: th.series[1]!, width: 2.5, dash: [4, 3] });
      plot.point(p.Ts, resistance(p.Ts, Tc), { color: th.series[1]!, radius: 5 });
      plot.end();
    }

    return {
      update() {
        const lab = p.mode === 'stoffe' ? 'canvasStoffe' : p.mode === 'supra' ? 'canvasSupra' : 'canvasAbstand';
        surface.canvas.setAttribute('aria-label', ctx.t(lab));
        if (p.mode === 'abstand') {
          plot.setRangePadded([0.6, 3], [E_MIN, E_MAX], { left: 40, right: 12, top: 22, bottom: 24 });
          plot.setAxes({ x: { label: ctx.t('dAx') }, y: { label: ctx.t('EAx') } });
        } else if (p.mode === 'stoffe') {
          plot.setRangePadded([50, 800], [-12, 9], { left: 40, right: 12, top: 22, bottom: 24 });
          plot.setAxes({ x: { label: ctx.t('TAx') }, y: { label: ctx.t('sAx') } });
        } else {
          plot.setRangePadded([0, 20], [0, 1.1], { left: 40, right: 12, top: 22, bottom: 24 });
          plot.setAxes({ x: { label: ctx.t('TAx') }, y: { label: ctx.t('RAx') } });
        }
        updateReadouts();
      },
      tick(dt) {
        t += Math.min(dt, 0.05);
      },
      resetTime() {
        t = 0;
      },
      render() {
        surface.begin();
        const sp = split(surface.width, surface.height);
        plot.resize();
        if (p.mode === 'abstand') {
          drawAbstand(sp.scene);
          chartAbstand();
        } else if (p.mode === 'stoffe') {
          drawStoffe(sp.scene);
          chartStoffe();
        } else {
          drawSupra(sp.scene);
          chartSupra();
        }
      },
      destroy: () => surface.destroy(),
    };
  },
});
