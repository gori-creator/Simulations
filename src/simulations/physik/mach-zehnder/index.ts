import { defineSimulation, roundRect, Surface, text, withAlpha, type Rect } from '../../../sim-core';
import { detectorProbabilities, rng, whichWayKnown, type Setup } from './model';

const L = (de: string, en: string) => ({ de, en });

interface Photon {
  t: number;
  /** gewählter Weg bei Welcher-Weg-Information: 0 oben, 1 unten */
  arm: number;
  /** Detektor 0 oder 1, entschieden beim zweiten Strahlteiler */
  det: number;
}

/**
 * Mach-Zehnder-Interferometer mit einzelnen Photonen: Zählraten an zwei
 * Detektoren, Phasenschieber, Welcher-Weg-Markierung und zweiter Strahlteiler.
 */
export default defineSimulation({
  id: 'mach-zehnder',
  animated: true,
  layout: { aspect: 1.6, aspectNarrow: 0.95 },
  params: [
    { key: 'phase', type: 'number', label: L('Phasenverschiebung im oberen Weg', 'Phase shift in the upper path'), min: 0, max: 360, step: 5, default: 0, unit: '°' },
    { key: 'bs2', type: 'boolean', label: L('Zweiter Strahlteiler eingesetzt', 'Second beam splitter in place'), default: true },
    { key: 'mark', type: 'boolean', label: L('Weg markieren (Polarisationsfilter)', 'Mark the path (polarising filters)'), default: false },
    {
      key: 'licht',
      type: 'choice',
      label: L('Lichtquelle', 'Light source'),
      options: [
        { value: 'einzeln', label: L('einzelne Photonen', 'single photons') },
        { value: 'laser', label: L('Laserlicht (sehr viele Photonen)', 'laser light (very many photons)') },
      ],
      default: 'einzeln',
    },
  ],
  hint: L(
    'Starte die Quelle und beobachte die Zähler. Jedes Photon wird nur an einem Detektor registriert – trotzdem entsteht Interferenz.',
    'Start the source and watch the counters. Each photon is registered at only one detector – yet interference appears.',
  ),
  actions: [
    { id: 'reset', label: L('Zähler zurücksetzen', 'Reset counters') },
  ],
  readouts: [
    { key: 'count', label: L('Zählraten', 'Counts') },
    { key: 'prob', label: L('Wahrscheinlichkeiten', 'Probabilities'), spoiler: true },
    { key: 'way', label: L('Welcher Weg?', 'Which path?') },
  ],
  presets: [
    { id: 'same', label: L('Gleiche Wege', 'Equal paths'), values: { phase: 0, bs2: true, mark: false } },
    { id: 'half', label: L('Halbe Wellenlänge', 'Half a wavelength'), values: { phase: 180, bs2: true, mark: false } },
    { id: 'mark', label: L('Weg markiert', 'Path marked'), values: { phase: 0, bs2: true, mark: true } },
    { id: 'nobs', label: L('Ohne zweiten Strahlteiler', 'Without second beam splitter'), values: { phase: 0, bs2: false, mark: false } },
  ],
  strings: {
    de: {
      canvas: 'Mach-Zehnder-Interferometer: Quelle, zwei Strahlteiler, zwei Spiegel, Phasenschieber und zwei Detektoren mit Zählern; Photonen laufen als Punkte durch die Anordnung',
      countVal: 'Detektor 1: {a}, Detektor 2: {b} (Anteil an Detektor 1: {r} %)',
      probVal: 'P₁ = {p1} %, P₂ = {p2} %',
      wayKnown: 'Der Weg ist grundsätzlich feststellbar – es gibt keine Interferenz, jeder Detektor bekommt die Hälfte.',
      wayUnknown: 'Der Weg ist nicht feststellbar – beide Möglichkeiten überlagern sich und interferieren.',
      source: 'Quelle',
      bs: 'Strahlteiler',
      mirror: 'Spiegel',
      det: 'Detektor',
      shift: 'Phasenschieber',
      pol: 'Pol.-Filter',
    },
    en: {
      canvas: 'Mach-Zehnder interferometer: source, two beam splitters, two mirrors, phase shifter and two detectors with counters; photons travel through the setup as dots',
      countVal: 'detector 1: {a}, detector 2: {b} (share at detector 1: {r} %)',
      probVal: 'P₁ = {p1} %, P₂ = {p2} %',
      wayKnown: 'The path can in principle be determined – there is no interference, each detector gets half.',
      wayUnknown: 'The path cannot be determined – both possibilities superpose and interfere.',
      source: 'source',
      bs: 'beam splitter',
      mirror: 'mirror',
      det: 'detector',
      shift: 'phase shifter',
      pol: 'pol. filter',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string | number>) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const random = rng(12345);
    let photons: Photon[] = [];
    let counts: [number, number] = [0, 0];
    let spawn = 0;
    const flash = [0, 0];

    const setup = (): Setup => ({ phase: (p.phase * Math.PI) / 180, bs2: p.bs2, marked: p.mark });

    function updateReadouts(): void {
      const n = counts[0] + counts[1];
      ctx.readout('count', tr('countVal', { a: counts[0], b: counts[1], r: n ? fmt.num((100 * counts[0]) / n, 0) : '–' }));
      const [p1, p2] = detectorProbabilities(setup());
      ctx.readout('prob', tr('probVal', { p1: fmt.num(100 * p1, 0), p2: fmt.num(100 * p2, 0) }));
      ctx.readout('way', ctx.t(whichWayKnown(setup()) ? 'wayKnown' : 'wayUnknown'));
    }

    function geom(r: Rect) {
      const narrow = surface.width < 600;
      const x0 = r.x + (narrow ? 44 : 60);
      const x1 = r.x + r.w * (narrow ? 0.3 : 0.3);
      const x2 = r.x + r.w * (narrow ? 0.72 : 0.68);
      const y1 = r.y + r.h * 0.62;
      const y2 = r.y + r.h * 0.2;
      return { x0, x1, x2, y1, y2, xd: r.x + r.w - (narrow ? 26 : 50), yd: r.y + r.h - 26 };
    }

    /** Position eines Photons; arm 0 = oberer Weg (über den Spiegel oben links), 1 = unterer Weg. */
    function pos(t: number, arm: number, det: number, r: Rect): [number, number] {
      const G = geom(r);
      const lerp = (a: [number, number], b: [number, number], f: number): [number, number] => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
      if (t < 0.25) return lerp([G.x0, G.y1], [G.x1, G.y1], t / 0.25);
      if (t < 0.75) {
        const f = (t - 0.25) / 0.5;
        // oben: BS1 → Spiegel (x1, y2) → BS2 (x2, y2); unten: BS1 → Spiegel (x2, y1) → BS2 (x2, y2)
        if (arm === 0) return f < 0.5 ? lerp([G.x1, G.y1], [G.x1, G.y2], f * 2) : lerp([G.x1, G.y2], [G.x2, G.y2], (f - 0.5) * 2);
        return f < 0.5 ? lerp([G.x1, G.y1], [G.x2, G.y1], f * 2) : lerp([G.x2, G.y1], [G.x2, G.y2], (f - 0.5) * 2);
      }
      const f = (t - 0.75) / 0.25;
      if (!p.bs2) {
        // ohne BS2: oberer Weg geht weiter nach rechts (D1), unterer nach oben → wir lenken ihn zu D2 nach oben
        return arm === 0 ? lerp([G.x2, G.y2], [G.xd, G.y2], f) : lerp([G.x2, G.y2], [G.x2, r.y + 14], f);
      }
      return det === 0 ? lerp([G.x2, G.y2], [G.xd, G.y2], f) : lerp([G.x2, G.y2], [G.x2, r.y + 14], f);
    }

    function draw(): void {
      const g = surface.g;
      const th = ctx.theme;
      const r: Rect = { x: 0, y: 0, w: surface.width, h: surface.height };
      const G = geom(r);
      const narrow = surface.width < 600;
      const fs = narrow ? 10 : 12;
      const laser = p.licht === 'laser';
      const beam = withAlpha(th.series[1]!, laser ? 0.7 : 0.18);
      g.strokeStyle = beam;
      g.lineWidth = laser ? 5 : 3;
      const [p1, p2] = detectorProbabilities(setup());
      g.beginPath();
      g.moveTo(G.x0, G.y1);
      g.lineTo(G.x1, G.y1);
      g.lineTo(G.x2, G.y1);
      g.lineTo(G.x2, G.y2);
      g.moveTo(G.x1, G.y1);
      g.lineTo(G.x1, G.y2);
      g.lineTo(G.x2, G.y2);
      g.stroke();
      // Ausgänge (Breite ∝ Wahrscheinlichkeit beim Laser)
      for (const [k, to] of [
        [0, [G.xd, G.y2]],
        [1, [G.x2, r.y + 14]],
      ] as const) {
        const pk = k === 0 ? p1 : p2;
        g.strokeStyle = withAlpha(th.series[1]!, laser ? 0.15 + 0.75 * pk : 0.18);
        g.lineWidth = laser ? 1 + 8 * pk : 3;
        g.beginPath();
        g.moveTo(G.x2, G.y2);
        g.lineTo(to[0], to[1]);
        g.stroke();
      }
      // Quelle
      roundRect(g, G.x0 - 30, G.y1 - 14, 34, 28, 6);
      g.fillStyle = th.text;
      g.fill();
      text(g, ctx.t('source'), G.x0 - 13, G.y1 + 26, { font: `600 ${fs}px ${th.font}`, color: th.muted });
      // Strahlteiler (halbdurchlässig), Spiegel
      const bs = (x: number, y: number, on: boolean) => {
        g.strokeStyle = on ? th.series[0]! : withAlpha(th.muted, 0.35);
        g.lineWidth = 6;
        g.setLineDash(on ? [] : [4, 4]);
        g.beginPath();
        g.moveTo(x - 16, y + 16);
        g.lineTo(x + 16, y - 16);
        g.stroke();
        g.setLineDash([]);
      };
      const mirror = (x: number, y: number) => {
        g.strokeStyle = th.text;
        g.lineWidth = 6;
        g.beginPath();
        g.moveTo(x - 16, y + 16);
        g.lineTo(x + 16, y - 16);
        g.stroke();
      };
      bs(G.x1, G.y1, true);
      bs(G.x2, G.y2, p.bs2);
      mirror(G.x1, G.y2);
      mirror(G.x2, G.y1);
      text(g, ctx.t('bs'), G.x1 + 4, G.y1 + 30, { font: `600 ${fs}px ${th.font}`, color: th.muted });
      text(g, ctx.t('mirror'), G.x1 - 4, G.y2 - 26, { font: `600 ${fs}px ${th.font}`, color: th.muted });
      text(g, ctx.t('mirror'), G.x2 + 4, G.y1 + 30, { font: `600 ${fs}px ${th.font}`, color: th.muted });
      // Phasenschieber im oberen Weg
      const px = (G.x1 + G.x2) / 2;
      g.fillStyle = withAlpha(th.series[4]!, 0.25 + (0.5 * p.phase) / 360);
      g.fillRect(px - 10, G.y2 - 16, 20, 32);
      text(g, narrow ? `Δφ = ${fmt.num(p.phase, 0)}°` : `${ctx.t('shift')} ${fmt.num(p.phase, 0)}°`, px, G.y2 - 26, { font: `600 ${fs}px ${th.font}`, color: th.muted });
      if (p.mark) {
        g.fillStyle = withAlpha(th.series[3]!, 0.5);
        g.fillRect(G.x1 - 12, (G.y1 + G.y2) / 2 - 8, 24, 16);
        g.fillRect((G.x1 + G.x2) / 2 - 8, G.y1 - 12, 16, 24);
        text(g, ctx.t('pol'), G.x1 - 18, (G.y1 + G.y2) / 2, { font: `600 ${fs}px ${th.font}`, color: th.series[3]!, align: 'right' });
      }
      // Detektoren mit Zählern
      const detBox = (x: number, y: number, k: number) => {
        roundRect(g, x - 18, y - 18, 36, 36, 8);
        g.fillStyle = flash[k]! > 0 ? th.series[2]! : withAlpha(th.text, 0.85);
        g.fill();
        text(g, String(counts[k]), x, y, { font: `700 ${narrow ? 11 : 13}px ${th.font}`, color: th.bg });
        // Beschriftung: Detektor 1 unter dem Kasten (rechtsbündig), Detektor 2 rechts daneben
        if (k === 0) text(g, `${ctx.t('det')} 1`, x + 18, y + 30, { font: `600 ${fs}px ${th.font}`, color: th.muted, align: 'right' });
        else text(g, `${ctx.t('det')} 2`, x + 24, y, { font: `600 ${fs}px ${th.font}`, color: th.muted, align: 'left' });
      };
      detBox(G.xd, G.y2, 0);
      detBox(G.x2, r.y + 14 + 18, 1);
      // Photonen
      if (!laser) {
        for (const ph of photons) {
          const both = ph.t >= 0.25 && ph.t < 0.75 && !whichWayKnown(setup());
          const arms = both ? [0, 1] : [ph.arm];
          for (const arm of arms) {
            const [x, y] = pos(ph.t, arm, ph.det, r);
            g.fillStyle = withAlpha(th.series[1]!, both ? 0.55 : 1);
            g.beginPath();
            g.arc(x, y, both ? 5 : 6, 0, Math.PI * 2);
            g.fill();
          }
        }
      }
      // Zählbalken
      const n = counts[0] + counts[1];
      const bx = r.x + (narrow ? 36 : 60);
      const by = r.y + r.h - 46;
      const bw = Math.min(r.w * 0.36, 220);
      for (let k = 0; k < 2; k++) {
        const share = n ? counts[k]! / n : 0;
        roundRect(g, bx, by + k * 20, bw, 14, 4);
        g.fillStyle = withAlpha(th.muted, 0.2);
        g.fill();
        roundRect(g, bx, by + k * 20, bw * share, 14, 4);
        g.fillStyle = k === 0 ? th.series[0]! : th.series[3]!;
        g.fill();
        text(g, `D${k + 1}`, bx - 4, by + k * 20 + 7, { font: `700 11px ${th.font}`, color: th.text, align: 'right' });
      }
    }

    return {
      update(changed) {
        if (changed.has('phase') || changed.has('bs2') || changed.has('mark')) {
          counts = [0, 0];
          photons = [];
        }
        updateReadouts();
      },
      action() {
        counts = [0, 0];
        photons = [];
        updateReadouts();
        ctx.requestRender();
      },
      tick(dt) {
        const laser = p.licht === 'laser';
        spawn += dt;
        const every = laser ? 0.02 : 0.5;
        while (spawn > every) {
          spawn -= every;
          const [p1] = detectorProbabilities(setup());
          const arm = random() < 0.5 ? 0 : 1;
          let det: number;
          if (!p.bs2) det = arm;
          else det = random() < p1 ? 0 : 1;
          if (laser) {
            counts[det as 0 | 1]++;
          } else photons.push({ t: 0, arm, det });
        }
        for (const ph of photons) ph.t += dt * 0.6;
        const done = photons.filter((ph) => ph.t >= 1);
        for (const ph of done) {
          counts[ph.det as 0 | 1]++;
          flash[ph.det] = 0.2;
        }
        photons = photons.filter((ph) => ph.t < 1);
        flash[0] = Math.max(0, flash[0]! - dt);
        flash[1] = Math.max(0, flash[1]! - dt);
        updateReadouts();
      },
      resetTime() {
        photons = [];
        counts = [0, 0];
        updateReadouts();
      },
      render() {
        surface.begin();
        draw();
      },
      destroy: () => surface.destroy(),
    };
  },
});
