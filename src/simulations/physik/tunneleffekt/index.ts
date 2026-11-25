import { defineSimulation, Plot, Surface, subText, text, withAlpha, type Rect } from '../../../sim-core';
import { ATOM_R, kappa, SCAN_L, solveBarrier, stmCurrent, surfaceAtoms, surfaceHeight } from './model';

const L = (de: string, en: string) => ({ de, en });
const X_MIN = -1.6;
const X_MAX = 3.6;
const E_TOP = 12;
const ATOMS = surfaceAtoms();
/** Abtastgeschwindigkeit der Spitze in nm/s. */
const SCAN_SPEED = 0.35;

function split(w: number, h: number): { scene: Rect; chart: Rect } {
  if (w >= 700) {
    const sw = Math.round(w * 0.58);
    return { scene: { x: 0, y: 0, w: sw, h }, chart: { x: sw, y: 0, w: w - sw, h } };
  }
  const sh = Math.round(h * 0.56);
  return { scene: { x: 0, y: 0, w, h: sh }, chart: { x: 0, y: sh, w, h: h - sh } };
}

/**
 * Tunneleffekt: Wellenfunktion eines Elektrons an einer Energiebarriere
 * und das Rastertunnelmikroskop, das mit dem Tunnelstrom Atome abtastet.
 */
export default defineSimulation({
  id: 'tunneleffekt',
  animated: true,
  layout: { aspect: 1.7, aspectNarrow: 1 },
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Versuch', 'Experiment'),
      options: [
        { value: 'barriere', label: L('Elektron an einer Barriere', 'Electron at a barrier') },
        { value: 'stm', label: L('Rastertunnelmikroskop', 'Scanning tunnelling microscope') },
      ],
      default: 'barriere',
      display: 'buttons',
    },
    { key: 'E', type: 'number', label: L('Energie des Elektrons', 'Electron energy'), min: 0.5, max: 10, step: 0.1, default: 3, unit: 'eV', visibleIf: (v) => v.mode === 'barriere' },
    { key: 'V', type: 'number', label: L('Höhe der Barriere', 'Barrier height'), min: 1, max: 10, step: 0.1, default: 5, unit: 'eV', visibleIf: (v) => v.mode === 'barriere' },
    { key: 'd', type: 'number', label: L('Breite der Barriere', 'Barrier width'), min: 0.1, max: 2, step: 0.05, default: 0.4, unit: 'nm', visibleIf: (v) => v.mode === 'barriere' },
    { key: 'h', type: 'number', label: L('Abstand der Spitze', 'Tip distance'), min: 0.3, max: 1, step: 0.05, default: 0.5, unit: 'nm', visibleIf: (v) => v.mode === 'stm' },
  ],
  hint: (v) =>
    v.mode === 'stm'
      ? L(
          'Drücke Start: Die Spitze fährt in fester Höhe über die Atome. Wo der Abstand kleiner ist, fließt viel mehr Strom.',
          'Press play: the tip moves at a fixed height over the atoms. Where the gap is smaller, much more current flows.',
        )
      : L(
          'Das Elektron hat weniger Energie als die Barriere hoch ist – trotzdem kommt rechts ein kleiner Teil der Welle an.',
          'The electron has less energy than the barrier is high – yet a small part of the wave arrives on the right.',
        ),
  readouts: [
    { key: 'T', label: L('Durchlasswahrscheinlichkeit', 'Transmission probability'), spoiler: true },
    { key: 'kap', label: L('Abklingen in der Barriere', 'Decay in the barrier') },
    { key: 'I', label: L('Tunnelstrom', 'Tunnelling current'), spoiler: true },
    { key: 'fak', label: L('0,1 nm näher', '0.1 nm closer') },
  ],
  presets: [
    { id: 'dünn', label: L('Dünne Barriere', 'Thin barrier'), values: { mode: 'barriere', E: 3, V: 5, d: 0.3 } },
    { id: 'dick', label: L('Dicke Barriere', 'Thick barrier'), values: { mode: 'barriere', E: 3, V: 5, d: 1 } },
    { id: 'über', label: L('Energie über der Barriere', 'Energy above the barrier'), values: { mode: 'barriere', E: 7, V: 5, d: 0.5 } },
    { id: 'stm', label: L('Rastertunnelmikroskop', 'Tunnelling microscope'), values: { mode: 'stm', h: 0.5 } },
  ],
  strings: {
    de: {
      canvasB: 'Energiediagramm mit einer rechteckigen Barriere; die Welle des Elektrons läuft von links ein, wird in der Barriere schwächer und kommt rechts mit kleiner Amplitude an; daneben Diagramm der Durchlasswahrscheinlichkeit über der Breite',
      canvasS: 'Metallspitze über einer Reihe von Atomen mit einer Lücke und einem aufgesetzten Atom; daneben der gemessene Tunnelstrom über dem Ort',
      TVal: 'T ≈ {T}',
      kapVal: 'κ ≈ {k} pro nm: ψ fällt je {l} nm auf 1/e',
      kapOver: 'Energie über der Barriere: kein Abklingen',
      IVal: 'I ≈ {I} nA',
      fakVal: 'Strom etwa {f}-mal so groß',
      E: 'E',
      V0: 'V₀',
      d: 'd',
      xAx: 'x in nm',
      tAx: 'lg T',
      dAx: 'd in nm',
      IAx: 'lg(I in nA)',
      tip: 'Spitze',
      vac: 'Lücke',
      ad: 'aufgesetztes Atom',
    },
    en: {
      canvasB: 'Energy diagram with a rectangular barrier; the electron wave comes in from the left, gets weaker inside the barrier and arrives on the right with a small amplitude; next to it a graph of transmission against width',
      canvasS: 'Metal tip above a row of atoms with a vacancy and an adatom; next to it the measured tunnelling current against position',
      TVal: 'T ≈ {T}',
      kapVal: 'κ ≈ {k} per nm: ψ drops to 1/e every {l} nm',
      kapOver: 'energy above the barrier: no decay',
      IVal: 'I ≈ {I} nA',
      fakVal: 'current about {f} times as large',
      E: 'E',
      V0: 'V₀',
      d: 'd',
      xAx: 'x in nm',
      tAx: 'lg T',
      dAx: 'd in nm',
      IAx: 'lg(I in nA)',
      tip: 'tip',
      vac: 'vacancy',
      ad: 'adatom',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvasB'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const SUP: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' };
    const sci = (v: number): string => {
      const e = Math.floor(Math.log10(v));
      if (e >= -2) return fmt.num(v, e >= 0 ? 2 : 3);
      return `${fmt.num(v / Math.pow(10, e), 1)} · 10${String(e).replace(/./g, (c) => SUP[c] ?? c)}`;
    };
    const plot = new Plot(surface, {
      x: [0, 2],
      y: [-12, 0],
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
    let xs = SCAN_L;
    let trace: [number, number][] = [];
    const gapAt = (x: number) => p.h + ATOM_R - surfaceHeight(x, ATOMS);

    function fullTrace(): [number, number][] {
      const out: [number, number][] = [];
      for (let i = 0; i <= 300; i++) {
        const x = (i / 300) * SCAN_L;
        out.push([x, stmCurrent(gapAt(x))]);
      }
      return out;
    }

    function resetScan(): void {
      xs = SCAN_L;
      trace = fullTrace();
    }

    function updateReadouts(): void {
      if (p.mode === 'barriere') {
        const s = solveBarrier(p.E, p.V, p.d);
        ctx.readout('T', tr('TVal', { T: sci(s.T) }));
        const k = kappa(p.E, p.V);
        ctx.readout('kap', k > 0 ? tr('kapVal', { k: fmt.num(k, 1), l: fmt.num(1 / k, 2) }) : ctx.t('kapOver'));
        ctx.readout('I', null);
        ctx.readout('fak', null);
      } else {
        const x = Math.min(xs, SCAN_L);
        ctx.readout('I', tr('IVal', { I: sci(stmCurrent(gapAt(x))) }));
        ctx.readout('fak', tr('fakVal', { f: fmt.num(stmCurrent(0.4) / stmCurrent(0.5), 0) }));
        ctx.readout('T', null);
        ctx.readout('kap', null);
      }
    }

    /* ---------------- Barriere ---------------- */
    function drawBarrier(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const left = r.x + 14;
      const right = r.x + r.w - 14;
      const top = r.y + 24;
      const bottom = r.y + r.h - 20;
      const X = (x: number) => left + ((x - X_MIN) / (X_MAX - X_MIN)) * (right - left);
      const Y = (E: number) => bottom - (E / E_TOP) * (bottom - top);
      const dShow = Math.min(p.d, X_MAX - 0.3);
      // Barriere
      g.fillStyle = withAlpha(th.muted, 0.22);
      g.fillRect(X(0), Y(p.V), X(dShow) - X(0), bottom - Y(p.V));
      g.strokeStyle = th.text;
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(left, bottom);
      g.lineTo(X(0), bottom);
      g.lineTo(X(0), Y(p.V));
      g.lineTo(X(dShow), Y(p.V));
      g.lineTo(X(dShow), bottom);
      g.lineTo(right, bottom);
      g.stroke();
      // Energie des Elektrons
      const yE = Y(p.E);
      g.setLineDash([5, 4]);
      g.strokeStyle = th.muted;
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(left, yE);
      g.lineTo(right, yE);
      g.stroke();
      g.setLineDash([]);
      // Welle
      const s = solveBarrier(p.E, p.V, p.d);
      const amp = (bottom - top) * 0.13;
      const w = 2 * Math.PI * 0.8 * t;
      const c = Math.cos(w);
      const sn = Math.sin(w);
      g.strokeStyle = th.series[0]!;
      g.lineWidth = 2;
      g.beginPath();
      const N = 500;
      for (let i = 0; i <= N; i++) {
        const x = X_MIN + ((X_MAX - X_MIN) * i) / N;
        const z = s.psi(x);
        const re = z[0] * c + z[1] * sn; // Re(ψ·e^{−iωt})
        const px = X(x);
        const py = yE - re * amp;
        if (i) g.lineTo(px, py);
        else g.moveTo(px, py);
      }
      g.stroke();
      // |ψ| als Hülle
      g.strokeStyle = withAlpha(th.series[1]!, 0.8);
      g.lineWidth = 1.5;
      g.beginPath();
      for (let i = 0; i <= N; i++) {
        const x = X_MIN + ((X_MAX - X_MIN) * i) / N;
        const z = s.psi(x);
        const py = yE - Math.hypot(z[0], z[1]) * amp;
        if (i) g.lineTo(X(x), py);
        else g.moveTo(X(x), py);
      }
      g.stroke();
      // Beschriftung
      const lab = (str: string, x: number, y: number, color: string, align: CanvasTextAlign = 'left') =>
        subText(g, str, x, y, { size: 14, family: th.mathFont, weight: 700, color, align, halo: th.bg });
      lab(ctx.t('E'), left + 4, yE + 14, th.muted);
      lab(ctx.t('V0'), X(dShow) + 6, Y(p.V) - 10, th.text);
      lab(ctx.t('d'), (X(0) + X(dShow)) / 2, bottom + 10, th.text, 'center');
      text(g, `|ψ|`, right - 4, yE - Math.hypot(...s.psi(X_MAX)) * amp - 10, { font: `600 12px ${th.mathFont}`, color: th.series[1]!, align: 'right' });
    }

    function chartBarrier(): void {
      const th = ctx.theme;
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      plot.fn((d) => Math.max(-40, Math.log10(solveBarrier(p.E, p.V, Math.max(d, 1e-4)).T)), { color: th.series[1]!, width: 2.5, from: 0, to: 2 });
      const y = Math.log10(solveBarrier(p.E, p.V, p.d).T);
      if (y >= -12) plot.point(p.d, y, { color: th.series[1]!, radius: 5 });
      plot.end();
    }

    /* ---------------- Rastertunnelmikroskop ---------------- */
    function drawStm(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const s = Math.min((r.w - 24) / (SCAN_L + 0.8), (r.h - 30) / 1.9);
      const x0 = r.x + (r.w - SCAN_L * s) / 2;
      g.save();
      g.beginPath();
      g.rect(r.x, r.y, r.w, r.h);
      g.clip();
      const yBase = r.y + r.h - 22 - 0.3 * s;
      const P = (x: number, y: number): [number, number] => [x0 + x * s, yBase - y * s];
      // Atome
      for (const a of ATOMS) {
        const [px, py] = P(a.x, a.y);
        g.fillStyle = withAlpha(a.y > 0 ? th.series[2]! : th.series[0]!, 0.55);
        g.strokeStyle = th.text;
        g.lineWidth = 1;
        g.beginPath();
        g.arc(px, py, ATOM_R * s, 0, Math.PI * 2);
        g.fill();
        g.stroke();
      }
      const [vx, vy] = P(0.9, 0);
      text(g, ctx.t('vac'), vx, vy + ATOM_R * s + 12, { font: `600 11px ${th.font}`, color: th.muted });
      const [ax, ay] = P(2.25, 0.26);
      subText(g, ctx.t('ad'), ax, ay - ATOM_R * s - 10, { size: 11, family: th.font, weight: 600, color: th.muted, halo: th.bg });
      // Spitze
      const x = Math.min(xs, SCAN_L);
      const tipY = p.h + ATOM_R;
      const [tx, ty] = P(x, tipY);
      const I = stmCurrent(gapAt(x));
      g.fillStyle = withAlpha(th.text, 0.25);
      g.strokeStyle = th.text;
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(tx, ty);
      g.lineTo(tx - 0.35 * s, r.y + 8);
      g.lineTo(tx + 0.35 * s, r.y + 8);
      g.closePath();
      g.fill();
      g.stroke();
      // Tunnelstrom als leuchtender Strich
      const [, sy] = P(x, surfaceHeight(x, ATOMS));
      g.strokeStyle = withAlpha(th.series[3]!, Math.min(1, 0.15 + 0.5 * Math.log10(1 + I * 3)));
      g.lineWidth = 2 + Math.min(6, I * 1.2);
      g.beginPath();
      g.moveTo(tx, ty + 2);
      g.lineTo(tx, sy - 2);
      g.stroke();
      const right = tx > r.x + r.w * 0.6;
      subText(g, ctx.t('tip'), right ? tx - 0.4 * s : tx + 0.4 * s, r.y + 20, { size: 12, family: th.font, weight: 600, color: th.muted, align: right ? 'right' : 'left', halo: th.bg });
      g.restore();
    }

    function chartStm(): void {
      const th = ctx.theme;
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      const shown = trace.filter((q) => q[0] <= xs + 1e-9).map(([x, I]): [number, number] => [x, Math.max(-3.5, Math.log10(I))]);
      if (shown.length > 1) plot.polyline(shown, { color: th.series[3]!, width: 2.5 });
      plot.end();
    }

    resetScan();

    return {
      update(changed, source) {
        surface.canvas.setAttribute('aria-label', ctx.t(p.mode === 'stm' ? 'canvasS' : 'canvasB'));
        if (source === 'init' || changed.has('h') || changed.has('mode')) resetScan();
        if (p.mode === 'barriere') {
          plot.setRangePadded([0, 2], [-12, 0], { left: 40, right: 12, top: 22, bottom: 24 });
          plot.setAxes({ x: { label: ctx.t('dAx') }, y: { label: ctx.t('tAx') } });
        } else {
          plot.setRangePadded([0, SCAN_L], [-3, 3], { left: 40, right: 12, top: 22, bottom: 24 });
          plot.setAxes({ x: { label: ctx.t('xAx') }, y: { label: ctx.t('IAx') } });
        }
        updateReadouts();
      },
      tick(dt) {
        const h = Math.min(dt, 0.05);
        t += h;
        if (p.mode === 'stm') {
          if (xs >= SCAN_L) {
            xs = 0;
            trace = [];
          }
          xs = Math.min(SCAN_L, xs + h * SCAN_SPEED);
          trace.push([xs, stmCurrent(gapAt(xs))]);
          updateReadouts();
        }
      },
      resetTime() {
        t = 0;
        resetScan();
        updateReadouts();
      },
      render() {
        surface.begin();
        const sp = split(surface.width, surface.height);
        plot.resize();
        if (p.mode === 'barriere') {
          drawBarrier(sp.scene);
          chartBarrier();
        } else {
          drawStm(sp.scene);
          chartStm();
        }
      },
      destroy: () => surface.destroy(),
    };
  },
});
