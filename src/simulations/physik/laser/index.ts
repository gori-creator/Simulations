import { defineSimulation, Plot, Surface, subText, text, withAlpha, type Rect } from '../../../sim-core';
import { inversion, lowerLevel, outputPower, step, thresholdPump, type LaserState, type Levels } from './model';

const L = (de: string, en: string) => ({ de, en });
const H = 0.002;
const WINDOW = 30;
/** Modellzeit (in Lebensdauern τ) je Sekunde Echtzeit. */
const SPEED = 2;
const N_ATOMS = 40;

function split(w: number, h: number): { scene: Rect; chart: Rect } {
  if (w >= 700) {
    const sw = Math.round(w * 0.6);
    return { scene: { x: 0, y: 0, w: sw, h }, chart: { x: sw, y: 0, w: w - sw, h } };
  }
  const sh = Math.round(h * 0.56);
  return { scene: { x: 0, y: 0, w, h: sh }, chart: { x: 0, y: sh, w, h: h - sh } };
}

function hash(i: number): number {
  const v = Math.sin(i * 91.345 + 12.7) * 43758.5453;
  return v - Math.floor(v);
}

/** Reihenfolge, in der die Atome angeregt gezeichnet werden (fest, gemischt). */
const ORDER = Array.from({ length: N_ATOMS }, (_, i) => i).sort((a, b) => hash(a) - hash(b));

interface Photon {
  x: number;
  dir: 1 | -1;
  row: number;
}

/**
 * Laser: Pumpen erzeugt Besetzungsinversion, stimulierte Emission verstärkt
 * das Licht zwischen zwei Spiegeln, ein Teil tritt als Laserstrahl aus.
 */
export default defineSimulation({
  id: 'laser',
  animated: true,
  layout: { aspect: 1.7, aspectNarrow: 1 },
  params: [
    {
      key: 'stufen',
      type: 'choice',
      label: L('Lasertyp', 'Laser type'),
      options: [
        { value: '3', label: L('Drei Niveaus (Rubin)', 'three levels (ruby)') },
        { value: '4', label: L('Vier Niveaus (Nd:YAG)', 'four levels (Nd:YAG)') },
      ],
      default: '3',
      display: 'buttons',
    },
    { key: 'W', type: 'number', label: L('Pumpstärke', 'Pump rate'), min: 0, max: 5, step: 0.05, default: 2, help: L('Wie oft pro Lebensdauer ein Atom im Grundzustand angeregt wird.', 'How often per lifetime an atom in the ground state is excited.') },
    { key: 'R', type: 'number', label: L('Reflexion des Auskoppelspiegels', 'Reflectance of output mirror'), min: 90, max: 99.9, step: 0.1, default: 99, unit: '%' },
  ],
  hint: L(
    'Drücke Start und erhöhe die Pumpstärke langsam: Erst oberhalb der Schwelle springt der Laser an – zuerst mit kurzen Lichtblitzen.',
    'Press play and slowly increase the pump rate: only above the threshold does the laser switch on – at first with short flashes of light.',
  ),
  readouts: [
    { key: 'inv', label: L('Besetzung', 'Population') },
    { key: 'laser', label: L('Laser', 'Laser'), spoiler: true },
    { key: 'th', label: L('Pumpschwelle', 'Pump threshold') },
  ],
  presets: [
    { id: 'unter', label: L('Unter der Schwelle', 'Below threshold'), values: { stufen: '3', W: 0.8, R: 99 } },
    { id: 'rubin', label: L('Rubinlaser', 'Ruby laser'), values: { stufen: '3', W: 2, R: 99 } },
    { id: 'vier', label: L('Vierniveau-Laser, schwach gepumpt', 'Four-level laser, weak pumping'), values: { stufen: '4', W: 0.2, R: 99 } },
    { id: 'spiegel', label: L('Schlechter Spiegel', 'Poor mirror'), values: { stufen: '3', W: 2, R: 90 } },
  ],
  strings: {
    de: {
      canvas: 'Links das Energieniveauschema mit Pumpen und Laserübergang, rechts der Resonator mit zwei Spiegeln, angeregten Atomen, Photonen und austretendem Strahl; daneben Diagramm von Besetzungsinversion und Laserlicht über der Zeit',
      invYes: 'N₂ − N₁ = {d}: Besetzungsinversion',
      invNo: 'N₂ − N₁ = {d}: keine Inversion',
      laserOn: 'an – Ausgangsleistung ≈ {p} (relativ)',
      laserOff: 'aus (unter der Schwelle)',
      thVal: 'W ≈ {w} (jetzt {f} % davon)',
      pump: 'Pumpen',
      fast: 'schnell',
      las: 'Laser',
      meta: 'langlebig',
      E0: 'Grundzustand',
      mirror: 'Spiegel 100 %',
      out: 'teildurchlässig',
      tAx: 't in τ',
      inv: 'Inversion',
      light: 'Laserlicht',
      yAx: 'relativ',
    },
    en: {
      canvas: 'On the left the energy level diagram with pumping and laser transition, on the right the resonator with two mirrors, excited atoms, photons and the emerging beam; next to it a graph of population inversion and laser light over time',
      invYes: 'N₂ − N₁ = {d}: population inversion',
      invNo: 'N₂ − N₁ = {d}: no inversion',
      laserOn: 'on – output power ≈ {p} (relative)',
      laserOff: 'off (below threshold)',
      thVal: 'W ≈ {w} (now {f} % of it)',
      pump: 'pumping',
      fast: 'fast',
      las: 'laser',
      meta: 'long-lived',
      E0: 'ground state',
      mirror: 'mirror 100 %',
      out: 'partly transparent',
      tAx: 't in τ',
      inv: 'inversion',
      light: 'laser light',
      yAx: 'relative',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const plot = new Plot(surface, {
      x: [0, WINDOW],
      y: [-1, 2.1],
      equalAspect: false,
      pan: false,
      zoom: false,
      controls: false,
      region: (w, h) => {
        const r = split(w, h).chart;
        return { x: r.x + 6, y: r.y + 6, w: r.w - 12, h: r.h - 12 };
      },
    });

    const levels = (): Levels => (p.stufen === '4' ? 4 : 3);
    const Rf = () => p.R / 100;
    let s: LaserState = { N2: 0, n: 0 };
    let t = 0;
    let hist: { t: number; inv: number; n: number }[] = [];
    let photons: Photon[] = [];
    let seed = 1;
    const rnd = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };

    function advance(dtModel: number): void {
      const k = Math.max(1, Math.round(dtModel / H));
      for (let i = 0; i < k; i++) s = step(s, p.W, Rf(), levels(), H);
      t += k * H;
      hist.push({ t, inv: inversion(s.N2, levels()), n: Math.min(2, s.n / 2) });
      while (hist.length && hist[0]!.t < t - WINDOW) hist.shift();
    }

    function reset(prerun: boolean): void {
      s = { N2: 0, n: 0 };
      t = 0;
      hist = [{ t: 0, inv: inversion(0, levels()), n: 0 }];
      photons = [];
      seed = 1;
      if (prerun) for (let i = 0; i < 12 / 0.05; i++) advance(0.05);
    }

    function updateReadouts(): void {
      const d = inversion(s.N2, levels());
      ctx.readout('inv', tr(d > 0 ? 'invYes' : 'invNo', { d: fmt.num(d, 3) }));
      const P = outputPower(s.n, Rf());
      const W0 = thresholdPump(Rf(), levels());
      ctx.readout('laser', P > 0.01 ? tr('laserOn', { p: fmt.num(P, 2) }) : ctx.t('laserOff'));
      ctx.readout('th', tr('thVal', { w: fmt.num(W0, 2), f: fmt.num((p.W / W0) * 100, 0) }));
    }

    function drawLevels(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const four = levels() === 4;
      const top = r.y + 26;
      const bottom = r.y + r.h - 30;
      const Y = (e: number) => bottom - e * (bottom - top);
      const xL = r.x + 16;
      const xR = r.x + r.w - 10;
      const lineW = (xR - xL) * 0.7;
      const lx = xL + (xR - xL) * 0.26;
      const eG = 0;
      const eLow = four ? 0.18 : 0;
      const eUp = 0.62;
      const ePump = 0.95;
      const ground = 1 - s.N2;
      const lvl = (e: number, pop: number, label: string, below = false) => {
        const y = Y(e);
        g.fillStyle = withAlpha(th.series[0]!, 0.35);
        g.fillRect(lx, y - 9, lineW * Math.min(1, pop), 9);
        g.strokeStyle = th.text;
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(lx, y);
        g.lineTo(lx + lineW, y);
        g.stroke();
        if (label) subText(g, label, lx, below ? y + 12 : y - 17, { size: 11, family: th.font, weight: 600, color: th.muted, align: 'left', halo: th.bg });
      };
      lvl(eG, ground, ctx.t('E0'), true);
      if (four) lvl(eLow, lowerLevel(s.N2, 4), '');
      lvl(eUp, s.N2, ctx.t('meta'));
      lvl(ePump, 0, '');
      const arrow = (x: number, e1: number, e2: number, color: string, width: number, dash: number[] = []) => {
        const y1 = Y(e1);
        const y2 = Y(e2);
        g.strokeStyle = color;
        g.fillStyle = color;
        g.lineWidth = width;
        g.setLineDash(dash);
        g.beginPath();
        g.moveTo(x, y1);
        g.lineTo(x, y2 + (y2 > y1 ? -6 : 6));
        g.stroke();
        g.setLineDash([]);
        const dir = y2 > y1 ? 1 : -1;
        g.beginPath();
        g.moveTo(x, y2);
        g.lineTo(x - 5, y2 - dir * 9);
        g.lineTo(x + 5, y2 - dir * 9);
        g.closePath();
        g.fill();
      };
      const xp = xL + (xR - xL) * 0.1;
      arrow(xp, eG, ePump, th.series[2]!, 1 + Math.min(4, p.W));
      g.save();
      g.translate(xp + 12, Y(ePump / 2));
      g.rotate(-Math.PI / 2);
      subText(g, ctx.t('pump'), 0, 0, { size: 11, family: th.font, weight: 600, color: th.series[2]!, halo: th.bg });
      g.restore();
      arrow(lx + lineW * 0.8, ePump, eUp, th.muted, 1.5, [4, 3]);
      subText(g, ctx.t('fast'), lx + lineW * 0.8 - 6, Y(ePump) + 14, { size: 11, family: th.font, weight: 600, color: th.muted, align: 'right', halo: th.bg });
      const P = outputPower(s.n, Rf());
      arrow(lx + lineW * 0.45, eUp, eLow, th.series[3]!, 1.5 + Math.min(4, P * 3));
      subText(g, ctx.t('las'), lx + lineW * 0.45 + 6, Y((eUp + eLow) / 2), { size: 11, family: th.font, weight: 700, color: th.series[3]!, align: 'left', halo: th.bg });
    }

    function drawCavity(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const cy = r.y + r.h * 0.5;
      const xL = r.x + 12;
      const xR = r.x + r.w - Math.max(40, r.w * 0.18);
      const hgt = Math.min(r.h * 0.5, 140);
      // Strahl nach außen
      const P = outputPower(s.n, Rf());
      const a = P / (P + 0.4);
      if (a > 0.01) {
        g.fillStyle = withAlpha(th.series[3]!, 0.15 + 0.75 * a);
        g.fillRect(xR, cy - 5, r.x + r.w - xR, 10);
      }
      // Lasermedium
      g.fillStyle = withAlpha(th.muted, 0.12);
      g.fillRect(xL + 10, cy - hgt / 2, xR - xL - 20, hgt);
      // Atome
      const cols = 10;
      const rows = 4;
      const exc = Math.round(s.N2 * N_ATOMS);
      const excited = new Set(ORDER.slice(0, exc));
      for (let i = 0; i < N_ATOMS; i++) {
        const c = i % cols;
        const rr = Math.floor(i / cols);
        const x = xL + 20 + ((c + 0.5) / cols) * (xR - xL - 40);
        const y = cy - hgt / 2 + ((rr + 0.5) / rows) * hgt;
        g.beginPath();
        g.arc(x, y, Math.max(3, Math.min(6, hgt / 18)), 0, Math.PI * 2);
        if (excited.has(i)) {
          g.fillStyle = th.series[0]!;
          g.fill();
        } else {
          g.strokeStyle = withAlpha(th.series[0]!, 0.7);
          g.lineWidth = 1.2;
          g.stroke();
        }
      }
      // Photonen
      g.strokeStyle = th.series[3]!;
      g.lineWidth = 2;
      for (const ph of photons) {
        const x = xL + ph.x * (xR - xL);
        const y = cy - hgt / 2 + ((ph.row + 0.5) / 6) * hgt;
        g.beginPath();
        for (let k = 0; k <= 12; k++) {
          const px = x - ph.dir * k * 1.6;
          const py = y + Math.sin(k * 1.3) * 3;
          if (k) g.lineTo(px, py);
          else g.moveTo(px, py);
        }
        g.stroke();
      }
      // Spiegel
      g.fillStyle = th.text;
      g.fillRect(xL, cy - hgt / 2 - 10, 5, hgt + 20);
      g.fillStyle = withAlpha(th.text, 0.45);
      g.fillRect(xR - 5, cy - hgt / 2 - 10, 5, hgt + 20);
      text(g, ctx.t('mirror'), xL, cy - hgt / 2 - 22, { font: `600 11px ${th.font}`, color: th.muted, align: 'left' });
      text(g, ctx.t('out'), xR, cy + hgt / 2 + 22, { font: `600 11px ${th.font}`, color: th.muted, align: 'right' });
    }

    function syncPhotons(dt: number): void {
      const target = Math.min(48, Math.round(14 * Math.log10(1 + s.n * 50)));
      while (photons.length < target) photons.push({ x: 0.05 + rnd() * 0.9, dir: rnd() < 0.5 ? 1 : -1, row: Math.floor(rnd() * 6) });
      while (photons.length > target) photons.pop();
      for (const ph of photons) {
        ph.x += ph.dir * dt * 0.9;
        if (ph.x > 0.98) {
          ph.x = 0.98;
          ph.dir = -1;
        }
        if (ph.x < 0.02) {
          ph.x = 0.02;
          ph.dir = 1;
        }
      }
    }

    function drawChart(): void {
      const th = ctx.theme;
      const t0 = Math.max(0, t - WINDOW);
      plot.setRangePadded([t0, t0 + WINDOW], [-1, 2.1], { left: 36, right: 12, top: 22, bottom: 24 });
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      plot.polyline(
        hist.map((q) => [q.t, q.inv]),
        { color: th.series[0]!, width: 2 },
      );
      plot.polyline(
        hist.map((q) => [q.t, q.n]),
        { color: th.series[3]!, width: 2 },
      );
      plot.text(t0 + 1, 1.95, ctx.t('light'), { color: th.series[3]!, align: 'left', size: 11 });
      plot.text(t0 + 1, -0.85, ctx.t('inv'), { color: th.series[0]!, align: 'left', size: 11 });
      plot.end();
    }

    reset(true);
    syncPhotons(0);

    return {
      update(_changed, source) {
        // Steht die Uhr, zeigt das Bild gleich den eingeschwungenen Zustand der neuen Einstellung.
        if (source === 'init' || !ctx.clock.playing) {
          reset(true);
          syncPhotons(0);
        }
        plot.setAxes({ x: { label: ctx.t('tAx') }, y: { label: ctx.t('yAx') } });
        updateReadouts();
      },
      tick(dt) {
        const h = Math.min(dt, 0.05);
        advance(h * SPEED);
        syncPhotons(h);
        updateReadouts();
      },
      resetTime() {
        reset(false);
        syncPhotons(0);
        updateReadouts();
      },
      render() {
        surface.begin();
        const sp = split(surface.width, surface.height);
        const sc = sp.scene;
        const lw = Math.round(sc.w * 0.4);
        drawLevels({ x: sc.x, y: sc.y, w: lw, h: sc.h });
        drawCavity({ x: sc.x + lw, y: sc.y, w: sc.w - lw, h: sc.h });
        plot.resize();
        drawChart();
      },
      destroy: () => surface.destroy(),
    };
  },
});
