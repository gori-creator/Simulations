import { defineSimulation, ease, Plot, Surface, Tween, withAlpha } from '../../../sim-core';
import { expand, piecesFirst, type Formula } from './model';

const L = (de: string, en: string) => ({ de, en });
type Pt = [number, number];

/**
 * Binomische Formeln am Quadrat: Das Quadrat wird in Teilflächen zerlegt
 * (Animation). Bei der dritten Formel wird ein Streifen gedreht und angelegt,
 * sodass aus a² − b² ein Rechteck (a + b)(a − b) entsteht.
 */
export default defineSimulation({
  id: 'binomische-formeln',
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'formula',
      type: 'choice',
      label: L('Formel', 'Formula'),
      options: [
        { value: '1', label: L('(a + b)²', '(a + b)²') },
        { value: '2', label: L('(a − b)²', '(a − b)²') },
        { value: '3', label: L('(a + b)(a − b)', '(a + b)(a − b)') },
      ],
      default: '1',
    },
    { key: 'a', type: 'number', label: L('Seitenlänge a', 'Side length a'), min: 1, max: 10, step: 0.5, default: 5 },
    { key: 'b', type: 'number', label: L('Seitenlänge b', 'Side length b'), min: 0.5, max: 6, step: 0.5, default: 2 },
    { key: 'numbers', type: 'boolean', group: 'view', label: L('Zahlenwerte einsetzen', 'Show numerical values'), default: true },
    { key: 'grid', type: 'boolean', group: 'view', label: L('Kästchen (Einheitsquadrate)', 'Unit squares'), default: true },
  ],
  actions: [{ id: 'toggle', label: L('Zerlegen', 'Split apart'), primary: true }],
  readouts: [
    { key: 'formula', label: L('Formel', 'Formula') },
    { key: 'numbers', label: L('Mit Zahlen', 'With numbers'), spoiler: true },
    { key: 'hint', label: L('Hinweis', 'Note') },
  ],
  presets: [
    { id: 'first', label: L('1. Formel', '1st formula'), values: {} },
    { id: 'second', label: L('2. Formel', '2nd formula'), values: { formula: '2', a: 6, b: 2 } },
    { id: 'third', label: L('3. Formel', '3rd formula'), values: { formula: '3', a: 6, b: 2 } },
    { id: 'big', label: L('a = 8, b = 3', 'a = 8, b = 3'), values: { a: 8, b: 3 } },
  ],
  strings: {
    de: {
      canvas: 'Quadrat, das in die Teilflächen einer binomischen Formel zerlegt wird',
      split: 'Zerlegen',
      join: 'Zusammensetzen',
      rotate: 'Streifen umlegen',
      back: 'Zurücklegen',
      needAB: 'Für diese Formel muss a größer als b sein.',
      hint1: 'Das große Quadrat hat die Seitenlänge a + b. Es besteht aus a², b² und zwei Rechtecken a · b.',
      hint2: 'Von a² werden zwei Streifen a · b abgezogen. Das kleine Quadrat b² wird dabei doppelt abgezogen und muss einmal wieder dazu.',
      hint3: 'Nimm von a² das Quadrat b² weg. Der übrige Streifen lässt sich so umlegen, dass ein Rechteck mit den Seiten a + b und a − b entsteht.',
      removed: 'wird entfernt',
      twice: 'doppelt abgezogen',
    },
    en: {
      canvas: 'Square divided into the parts of a binomial formula',
      split: 'Split apart',
      join: 'Put together',
      rotate: 'Move the strip',
      back: 'Move back',
      needAB: 'For this formula a must be greater than b.',
      hint1: 'The large square has side length a + b. It consists of a², b² and two rectangles a · b.',
      hint2: 'Two strips a · b are removed from a². The small square b² is removed twice, so it has to be added back once.',
      hint3: 'Remove the square b² from a². The remaining strip can be moved so that a rectangle with sides a + b and a − b is formed.',
      removed: 'is removed',
      twice: 'removed twice',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const plot = new Plot(surface, { x: [-1, 9], y: [-1, 9], pan: false, zoom: false });
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tween = new Tween(1100, ease.inOutCubic);
    let split = false;
    let startP = 0;
    let targetP = 0;
    let rangeKey = '';

    const color = () => ({
      a2: ctx.theme.series[0]!,
      ab: ctx.theme.series[3]!,
      b2: ctx.theme.series[1]!,
      rest: ctx.theme.series[2]!,
      lshape: ctx.theme.series[4]!,
    });

    /** Fortschritt 0 (zusammen) … 1 (zerlegt). */
    const progress = () => startP + (targetP - startP) * tween.value;

    function updateActionLabel(): void {
      const key = p.formula === '3' ? (split ? 'back' : 'rotate') : split ? 'join' : 'split';
      ctx.setAction('toggle', { label: ctx.t(key) });
    }

    function fitRange(): void {
      const s = p.formula === '3' ? p.a + p.b : p.formula === '2' ? p.a : p.a + p.b;
      const key = `${p.formula}:${s}`;
      if (key === rangeKey) return;
      rangeKey = key;
      const margin = 0.16 * s + 0.9;
      const extra = p.formula === '3' ? 0 : 0.1 * s + 0.4;
      plot.setRange([-margin, s + extra + margin * 0.6], [-margin, s + extra + margin * 0.6]);
    }

    function rect(x: number, y: number, w: number, h: number, c: string, alpha = 0.26, dash?: number[]): void {
      const pts: Pt[] = [
        [x, y],
        [x + w, y],
        [x + w, y + h],
        [x, y + h],
      ];
      plot.polygon(pts, { fill: c, alpha });
      plot.polygon(pts, { stroke: c, width: 2.5, dash });
    }

    function unitGrid(x: number, y: number, w: number, h: number): void {
      if (!p.grid) return;
      const g = surface.g;
      g.save();
      g.beginPath();
      g.rect(plot.px(x), plot.py(y + h), w * plot.scale.x, h * plot.scale.y);
      g.clip();
      g.strokeStyle = withAlpha(ctx.theme.text, 0.12);
      g.lineWidth = 1;
      g.beginPath();
      for (let gx = Math.ceil(x); gx <= x + w; gx++) {
        g.moveTo(Math.round(plot.px(gx)) + 0.5, plot.py(y));
        g.lineTo(Math.round(plot.px(gx)) + 0.5, plot.py(y + h));
      }
      for (let gy = Math.ceil(y); gy <= y + h; gy++) {
        g.moveTo(plot.px(x), Math.round(plot.py(gy)) + 0.5);
        g.lineTo(plot.px(x + w), Math.round(plot.py(gy)) + 0.5);
      }
      g.stroke();
      g.restore();
    }

    function areaLabel(x: number, y: number, term: string, value: number, c: string): void {
      const size = Math.max(13, Math.min(22, plot.scale.x * 0.55));
      plot.text(x, y, term, { math: true, size: size + 2, color: c, align: 'center', baseline: 'middle', weight: 'bold', offset: [0, p.numbers ? -size * 0.45 : 0] });
      if (p.numbers) {
        plot.text(x, y, `= ${fmt.num(value)}`, { size: size - 2, color: c, align: 'center', baseline: 'middle', offset: [0, size * 0.65] });
      }
    }

    /** Bemaßung entlang einer waagerechten oder senkrechten Kante. */
    function dimension(x1: number, y1: number, x2: number, y2: number, label: string, side: 'below' | 'left' | 'above' | 'right'): void {
      const off = 18;
      const [px1, py1] = plot.toPx(x1, y1);
      const [px2, py2] = plot.toPx(x2, y2);
      const dx = side === 'left' ? -off : side === 'right' ? off : 0;
      const dy = side === 'below' ? off : side === 'above' ? -off : 0;
      const g = surface.g;
      g.strokeStyle = ctx.theme.muted;
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(px1 + dx, py1 + dy);
      g.lineTo(px2 + dx, py2 + dy);
      const t = 5;
      if (dy !== 0) {
        g.moveTo(px1 + dx, py1 + dy - t);
        g.lineTo(px1 + dx, py1 + dy + t);
        g.moveTo(px2 + dx, py2 + dy - t);
        g.lineTo(px2 + dx, py2 + dy + t);
      } else {
        g.moveTo(px1 + dx - t, py1 + dy);
        g.lineTo(px1 + dx + t, py1 + dy);
        g.moveTo(px2 + dx - t, py2 + dy);
        g.lineTo(px2 + dx + t, py2 + dy);
      }
      g.stroke();
      const mx = (px1 + px2) / 2 + dx * 1.9;
      const my = (py1 + py2) / 2 + dy * 1.6;
      plot.textPx(mx, my, label, { math: true, size: 16, color: ctx.theme.text, align: 'center', baseline: 'middle' });
    }

    function drawFirst(t: number): void {
      const { a, b } = p;
      const c = color();
      const gap = (0.08 * (a + b) + 0.35) * t;
      const offsets: Record<number, Pt> = { 0: [0, 0], 1: [gap, 0], 2: [0, gap], 3: [gap, gap] };
      piecesFirst(a, b).forEach((piece, i) => {
        const [ox, oy] = offsets[i]!;
        const x = piece.x + ox;
        const y = piece.y + oy;
        unitGrid(x, y, piece.w, piece.h);
        rect(x, y, piece.w, piece.h, c[piece.key === 'rest' ? 'rest' : piece.key]);
        const term = piece.key === 'a2' ? 'a²' : piece.key === 'b2' ? 'b²' : 'a · b';
        areaLabel(x + piece.w / 2, y + piece.h / 2, term, piece.w * piece.h, c[piece.key === 'rest' ? 'rest' : piece.key]);
      });
      dimension(0, 0, a, 0, 'a', 'below');
      dimension(a + gap, 0, a + b + gap, 0, 'b', 'below');
      dimension(0, 0, 0, a, 'a', 'left');
      dimension(0, a + gap, 0, a + b + gap, 'b', 'left');
    }

    function drawSecond(t: number): void {
      const { a, b } = p;
      const c = color();
      const r = a - b;
      const gap = (0.1 * a + 0.4) * t;
      // ganzes Quadrat a² als Umriss
      plot.polygon(
        [
          [0, 0],
          [a, 0],
          [a, a],
          [0, a],
        ],
        { stroke: c.a2, width: 2, dash: [6, 5] },
      );
      unitGrid(0, 0, r, r);
      rect(0, 0, r, r, c.rest, 0.3);
      areaLabel(r / 2, r / 2, '(a − b)²', r * r, c.rest);
      // zwei Streifen a·b (rechts und oben), die sich in b² überlappen
      rect(r + gap, 0, b, a, c.ab, 0.2);
      rect(0, r + gap, a, b, c.ab, 0.2);
      rect(r + gap, r, b, b, c.b2, 0.35);
      rect(r, r + gap, b, b, c.b2, 0.35);
      if (t > 0.5) {
        areaLabel(r + gap + b / 2, r / 2, 'a · b', a * b, c.ab);
        areaLabel(r / 2, r + gap + b / 2, 'a · b', a * b, c.ab);
      }
      plot.text(r + gap / 2 + b / 2, r + gap / 2 + b / 2, 'b²', { math: true, size: 16, color: c.b2, align: 'center', baseline: 'middle', weight: 'bold' });
      if (t > 0.5) {
        plot.text(r + gap / 2 + b / 2, r + gap / 2 + b / 2, ctx.t('twice'), { size: 12, color: c.b2, align: 'center', baseline: 'top', offset: [0, 12], weight: '600' });
      }
      dimension(0, 0, r, 0, 'a − b', 'below');
      dimension(r + gap, 0, a + gap, 0, 'b', 'below');
      dimension(0, 0, 0, a, 'a', 'left');
    }

    function drawThird(t: number): void {
      const { a, b } = p;
      const c = color();
      const r = a - b;
      // fehlendes Quadrat b² (oben rechts) als gestrichelter Umriss
      const removedAlpha = 1 - t;
      if (removedAlpha > 0.02) {
        plot.polygon(
          [
            [r, r],
            [a, r],
            [a, a],
            [r, a],
          ],
          { fill: c.b2, alpha: 0.12 * removedAlpha, stroke: withAlpha(c.b2, removedAlpha), width: 2, dash: [5, 5] },
        );
        plot.text(r + b / 2, r + b / 2, `b² ${ctx.t('removed')}`, { size: 12, color: withAlpha(c.b2, removedAlpha), align: 'center', baseline: 'middle' });
      }
      // unterer Teil a × (a − b) bleibt liegen
      unitGrid(0, 0, a, r);
      rect(0, 0, a, r, c.lshape, 0.26);
      // oberer Streifen (a − b) × b wird gedreht und rechts angelegt
      const angle = (-Math.PI / 2) * t;
      const c0: Pt = [r / 2, r + b / 2];
      const c1: Pt = [a + b / 2, r / 2];
      const cx = c0[0] + (c1[0] - c0[0]) * t;
      const cy = c0[1] + (c1[1] - c0[1]) * t;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const corners: Pt[] = (
        [
          [-r / 2, -b / 2],
          [r / 2, -b / 2],
          [r / 2, b / 2],
          [-r / 2, b / 2],
        ] as Pt[]
      ).map(([x, y]) => [cx + x * cos - y * sin, cy + x * sin + y * cos]);
      plot.polygon(corners, { fill: c.lshape, alpha: 0.4 });
      plot.polygon(corners, { stroke: c.lshape, width: 2.5 });
      if (t < 0.05) {
        areaLabel(a / 2, r / 2, 'a · (a − b)', a * r, c.lshape);
        areaLabel(r / 2, r + b / 2, 'b · (a − b)', b * r, c.lshape);
        dimension(0, 0, a, 0, 'a', 'below');
        dimension(0, 0, 0, a, 'a', 'left');
      } else if (t > 0.95) {
        areaLabel((a + b) / 2, r / 2, '(a + b)(a − b)', (a + b) * r, c.lshape);
        dimension(0, 0, a + b, 0, 'a + b', 'below');
        dimension(0, 0, 0, r, 'a − b', 'left');
      }
    }

    return {
      update(changed) {
        if (changed.has('formula')) {
          split = false;
          startP = 0;
          targetP = 0;
          tween.finish();
        }
        updateActionLabel();
        fitRange();
        const e = expand(p.formula as Formula, p.a, p.b);
        const s = (k: number, text: string) => `<span style="color:var(--series-${k});font-weight:700">${text}</span>`;
        const sq = '<sup>2</sup>';
        const v = (x: string) => `<var>${x}</var>`;
        const formulas: Record<Formula, string> = {
          '1': `(${v('a')} + ${v('b')})${sq} = ${s(1, `${v('a')}${sq}`)} + ${s(4, `2${v('a')}${v('b')}`)} + ${s(2, `${v('b')}${sq}`)}`,
          '2': `(${v('a')} − ${v('b')})${sq} = ${s(1, `${v('a')}${sq}`)} − ${s(4, `2${v('a')}${v('b')}`)} + ${s(2, `${v('b')}${sq}`)}`,
          '3': `(${v('a')} + ${v('b')})(${v('a')} − ${v('b')}) = ${s(1, `${v('a')}${sq}`)} − ${s(2, `${v('b')}${sq}`)}`,
        };
        ctx.readout('formula', { html: formulas[p.formula as Formula] });
        const n = (x: number) => fmt.num(x);
        const nums: Record<Formula, string> = {
          '1': `(${n(p.a)} + ${n(p.b)})² = ${n(e.left)} = ${n(e.terms[0]!)} + ${n(e.terms[1]!)} + ${n(e.terms[2]!)}`,
          '2': `(${n(p.a)} − ${n(p.b)})² = ${n(e.left)} = ${n(e.terms[0]!)} − ${n(-e.terms[1]!)} + ${n(e.terms[2]!)}`,
          '3': `(${n(p.a)} + ${n(p.b)})(${n(p.a)} − ${n(p.b)}) = ${n(e.left)} = ${n(e.terms[0]!)} − ${n(-e.terms[1]!)}`,
        };
        const valid = p.formula === '1' || p.a > p.b;
        ctx.readout('numbers', valid ? nums[p.formula as Formula] : ctx.t('needAB'));
        ctx.readout('hint', ctx.t(`hint${p.formula}`));
      },

      action(id) {
        if (id !== 'toggle') return;
        // Auch mitten in der Animation an der aktuellen Stelle weitermachen
        startP = progress();
        split = !split;
        targetP = split ? 1 : 0;
        tween.play(Math.max(150, 1100 * Math.abs(targetP - startP)));
        updateActionLabel();
      },

      render() {
        fitRange();
        const t = progress();
        surface.begin();
        plot.begin();
        if (p.formula !== '1' && p.a <= p.b) {
          plot.textPx(plot.rect.x + plot.rect.w / 2, plot.rect.y + plot.rect.h / 2, ctx.t('needAB'), {
            size: 17,
            color: ctx.theme.muted,
            align: 'center',
            baseline: 'middle',
          });
        } else if (p.formula === '1') drawFirst(t);
        else if (p.formula === '2') drawSecond(t);
        else drawThird(t);
        plot.end();
        if (tween.running) ctx.requestRender();
      },

      destroy: () => surface.destroy(),
    };
  },
});
