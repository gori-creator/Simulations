import { defineSimulation, Surface, text, withAlpha } from '../../../sim-core';
import { arrowHeads, deviation, hatches, ring, type Pt } from './model';

const L = (de: string, en: string) => ({ de, en });
type Mode = 'mueller' | 'ebbinghaus' | 'zoellner' | 'hering';

/**
 * Unterhaltsame Geometrie: optische Täuschungen (Müller-Lyer, Ebbinghaus,
 * Zöllner, Hering) zum Selbst-Einstellen und Nachmessen.
 */
export default defineSimulation({
  id: 'optische-taeuschungen',
  layout: { aspect: 1.5, aspectNarrow: 0.95 },
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Täuschung', 'Illusion'),
      options: [
        { value: 'mueller', label: L('Pfeile (Müller-Lyer)', 'Arrows (Müller-Lyer)') },
        { value: 'ebbinghaus', label: L('Kreise (Ebbinghaus)', 'Circles (Ebbinghaus)') },
        { value: 'zoellner', label: L('Schräge Linien (Zöllner)', 'Slanted lines (Zöllner)') },
        { value: 'hering', label: L('Strahlen (Hering)', 'Rays (Hering)') },
      ],
      default: 'mueller',
      display: 'menu',
    },
    { key: 'set', type: 'number', label: L('Stelle gleich groß ein (%)', 'Adjust until equal (%)'), min: 70, max: 130, step: 1, default: 100, visibleIf: (v) => v.mode === 'mueller' || v.mode === 'ebbinghaus' },
    { key: 'w', type: 'number', label: L('Neigung der kurzen Striche', 'Slant of the short strokes'), min: 15, max: 75, step: 5, default: 45, unit: '°', visibleIf: (v) => v.mode === 'zoellner' },
    { key: 'reveal', type: 'boolean', label: L('Auflösen (nachmessen)', 'Reveal (measure)'), default: false },
  ],
  hint: (v) =>
    v.mode === 'zoellner' || v.mode === 'hering'
      ? L('Sind die langen Linien gerade und parallel? Schalte „Auflösen“ ein.', 'Are the long lines straight and parallel? Switch on “Reveal”.')
      : L('Stelle mit dem Regler ein, bis beide gleich groß aussehen – dann schalte „Auflösen“ ein.', 'Use the slider until both look the same size – then switch on “Reveal”.'),
  readouts: [
    { key: 'frage', label: L('Frage', 'Question') },
    { key: 'wahr', label: L('Auflösung', 'Answer'), spoiler: true },
  ],
  presets: [
    { id: 'ml', label: L('Müller-Lyer', 'Müller-Lyer'), values: { mode: 'mueller', set: 100, reveal: false } },
    { id: 'eb', label: L('Ebbinghaus', 'Ebbinghaus'), values: { mode: 'ebbinghaus', set: 100, reveal: false } },
    { id: 'zo', label: L('Zöllner', 'Zöllner'), values: { mode: 'zoellner', w: 45, reveal: false } },
    { id: 'he', label: L('Hering', 'Hering'), values: { mode: 'hering', reveal: false } },
  ],
  strings: {
    de: {
      canvas: 'Optische Täuschung; mit „Auflösen“ erscheinen Hilfslinien zum Nachmessen',
      qML: 'Welche waagerechte Linie ist länger?',
      qEB: 'Welcher orange Kreis in der Mitte ist größer?',
      qZO: 'Laufen die langen Linien parallel?',
      qHE: 'Sind die beiden roten Linien gerade?',
      equal: 'Bei 100 % sind beide genau gleich groß. Deine Einstellung: {s} % ({d}).',
      bigger: '{v} % zu groß',
      smaller: '{v} % zu klein',
      exact: 'genau richtig',
      parallel: 'Die langen Linien sind exakt parallel – die kurzen Striche täuschen das Auge.',
      straight: 'Beide Linien sind exakt gerade – die Strahlen lassen sie gebogen wirken.',
      same: 'gleich lang',
    },
    en: {
      canvas: 'Optical illusion; “Reveal” shows guide lines for measuring',
      qML: 'Which horizontal line is longer?',
      qEB: 'Which orange circle in the middle is larger?',
      qZO: 'Do the long lines run parallel?',
      qHE: 'Are the two red lines straight?',
      equal: 'At 100 % both are exactly the same size. Your setting: {s} % ({d}).',
      bigger: '{v} % too large',
      smaller: '{v} % too small',
      exact: 'exactly right',
      parallel: 'The long lines are exactly parallel – the short strokes fool the eye.',
      straight: 'Both lines are exactly straight – the rays make them look curved.',
      same: 'same length',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const mode = () => p.mode as Mode;

    function updateReadouts(): void {
      const m = mode();
      ctx.readout('frage', ctx.t(m === 'mueller' ? 'qML' : m === 'ebbinghaus' ? 'qEB' : m === 'zoellner' ? 'qZO' : 'qHE'));
      if (m === 'mueller' || m === 'ebbinghaus') {
        const d = deviation(p.set);
        const dt = d === 0 ? ctx.t('exact') : tr(d > 0 ? 'bigger' : 'smaller', { v: Math.abs(d) });
        ctx.readout('wahr', tr('equal', { s: p.set, d: dt }));
      } else ctx.readout('wahr', ctx.t(m === 'zoellner' ? 'parallel' : 'straight'));
    }

    function line(g: CanvasRenderingContext2D, a: Pt, b: Pt, color: string, width: number, dash?: number[]): void {
      g.save();
      if (dash) g.setLineDash(dash);
      g.strokeStyle = color;
      g.lineWidth = width;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(a[0], a[1]);
      g.lineTo(b[0], b[1]);
      g.stroke();
      g.restore();
    }

    function drawMueller(g: CanvasRenderingContext2D, W: number, H: number): void {
      const th = ctx.theme;
      const L0 = Math.min(W * 0.5, 420);
      const cx = W / 2;
      const y1 = H * 0.32;
      const y2 = H * 0.68;
      const L2 = (L0 * p.set) / 100;
      const head = Math.min(50, L0 * 0.16);
      const lw = Math.max(3, W * 0.005);
      line(g, [cx - L0 / 2, y1], [cx + L0 / 2, y1], th.text, lw);
      for (const [a, b] of arrowHeads(cx - L0 / 2, cx + L0 / 2, y1, head, false)) line(g, a, b, th.text, lw);
      line(g, [cx - L2 / 2, y2], [cx + L2 / 2, y2], th.text, lw);
      for (const [a, b] of arrowHeads(cx - L2 / 2, cx + L2 / 2, y2, head, true)) line(g, a, b, th.text, lw);
      if (p.reveal) {
        const col = th.series[1]!;
        for (const x of [cx - L0 / 2, cx + L0 / 2]) line(g, [x, y1 - 40], [x, y2 + 40], col, 1.5, [6, 5]);
        line(g, [cx - L0 / 2, y1], [cx + L0 / 2, y1], withAlpha(col, 0.7), lw + 2);
        line(g, [cx - L2 / 2, y2], [cx + L2 / 2, y2], withAlpha(th.series[2]!, 0.7), lw + 2);
      }
    }

    function drawEbbinghaus(g: CanvasRenderingContext2D, W: number, H: number): void {
      const th = ctx.theme;
      const r0 = Math.min(W * 0.045, H * 0.07);
      const r2 = (r0 * p.set) / 100;
      const cxL = W * 0.28;
      const cxR = W * 0.72;
      const cy = H * 0.5;
      const disk = (x: number, y: number, r: number, c: string) => {
        g.fillStyle = c;
        g.beginPath();
        g.arc(x, y, r, 0, Math.PI * 2);
        g.fill();
      };
      for (const [x, y] of ring(cxL, cy, r0 * 3.1, 6)) disk(x, y, r0 * 1.7, withAlpha(th.series[0]!, 0.65));
      for (const [x, y] of ring(cxR, cy, r0 * 1.9, 8)) disk(x, y, r0 * 0.45, withAlpha(th.series[0]!, 0.65));
      disk(cxL, cy, r0, th.series[3]!);
      disk(cxR, cy, r2, th.series[3]!);
      if (p.reveal) {
        const col = th.series[1]!;
        const by = H * 0.88;
        line(g, [cxL - r0, by], [cxL + r0, by], col, 4);
        line(g, [cxR - r2, by], [cxR + r2, by], th.series[2]!, 4);
        line(g, [cxL - r0, cy], [cxL - r0, by], col, 1, [4, 4]);
        line(g, [cxL + r0, cy], [cxL + r0, by], col, 1, [4, 4]);
        line(g, [cxR - r2, cy], [cxR - r2, by], th.series[2]!, 1, [4, 4]);
        line(g, [cxR + r2, cy], [cxR + r2, by], th.series[2]!, 1, [4, 4]);
      }
    }

    function drawZoellner(g: CanvasRenderingContext2D, W: number, H: number): void {
      const th = ctx.theme;
      const n = 6;
      const gapX = W / (n + 1);
      const lw = Math.max(2.5, W * 0.004);
      for (let i = 0; i < n; i++) {
        const x = gapX * (i + 0.6);
        const a: Pt = [x, H * 0.08];
        const b: Pt = [x + Math.min(H * 0.35, gapX * 1.1), H * 0.92];
        line(g, a, b, p.reveal ? th.series[1]! : th.text, lw);
        if (!p.reveal) for (const [s, e] of hatches(a, b, 14, Math.min(46, gapX * 0.7), p.w, i % 2 === 1)) line(g, s, e, th.text, lw * 0.8);
      }
    }

    function drawHering(g: CanvasRenderingContext2D, W: number, H: number): void {
      const th = ctx.theme;
      const cx = W / 2;
      const cy = H / 2;
      const R = Math.hypot(W, H);
      if (!p.reveal) {
        g.strokeStyle = withAlpha(th.text, 0.7);
        g.lineWidth = 1.2;
        for (let k = 0; k < 48; k++) {
          const a = (Math.PI * k) / 24;
          g.beginPath();
          g.moveTo(cx, cy);
          g.lineTo(cx + R * Math.cos(a), cy + R * Math.sin(a));
          g.stroke();
        }
      }
      const off = Math.min(W * 0.12, H * 0.2);
      line(g, [W * 0.08, cy - off], [W * 0.92, cy - off], th.series[1]!, 4);
      line(g, [W * 0.08, cy + off], [W * 0.92, cy + off], th.series[1]!, 4);
      if (p.reveal) {
        text(g, '↔', W / 2, cy, { font: `700 18px ${th.font}`, color: th.muted });
      }
    }

    return {
      update() {
        updateReadouts();
      },
      render() {
        const g = surface.begin();
        const W = surface.width;
        const H = surface.height;
        if (mode() === 'ebbinghaus') drawEbbinghaus(g, W, H);
        else if (mode() === 'zoellner') drawZoellner(g, W, H);
        else if (mode() === 'hering') drawHering(g, W, H);
        else drawMueller(g, W, H);
      },
      destroy: () => surface.destroy(),
    };
  },
});
