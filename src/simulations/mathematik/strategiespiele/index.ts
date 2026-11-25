import { defineSimulation, roundRect, Surface, TapTarget, text, withAlpha } from '../../../sim-core';
import { bestMove, isLosing, nimMove, nimSum } from './model';

const L = (de: string, en: string) => ({ de, en });
type Mode = 'ein' | 'mehr';

/**
 * Strategiespiele: „Nimm“ mit einem Haufen (1 bis k Hölzer, wer das letzte
 * nimmt, gewinnt) und Nim mit drei Haufen, jeweils gegen den Computer,
 * mit einblendbarer Gewinnstrategie.
 */
export default defineSimulation({
  id: 'strategiespiele',
  layout: { aspect: 1.6, aspectNarrow: 0.95 },
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Spiel', 'Game'),
      options: [
        { value: 'ein', label: L('Ein Haufen', 'One pile') },
        { value: 'mehr', label: L('Drei Haufen (Nim)', 'Three piles (Nim)') },
      ],
      default: 'ein',
      display: 'buttons',
    },
    { key: 'n', type: 'number', label: L('Hölzer am Anfang', 'Sticks at the start'), min: 5, max: 30, step: 1, default: 15, visibleIf: (v) => v.mode === 'ein' },
    { key: 'k', type: 'number', label: L('Höchstens nehmen', 'Take at most'), min: 2, max: 5, step: 1, default: 3, visibleIf: (v) => v.mode === 'ein' },
    { key: 'h1', type: 'number', label: L('Haufen 1', 'Pile 1'), min: 1, max: 9, step: 1, default: 3, visibleIf: (v) => v.mode === 'mehr' },
    { key: 'h2', type: 'number', label: L('Haufen 2', 'Pile 2'), min: 1, max: 9, step: 1, default: 4, visibleIf: (v) => v.mode === 'mehr' },
    { key: 'h3', type: 'number', label: L('Haufen 3', 'Pile 3'), min: 1, max: 9, step: 1, default: 5, visibleIf: (v) => v.mode === 'mehr' },
    {
      key: 'first',
      type: 'choice',
      label: L('Wer beginnt?', 'Who starts?'),
      options: [
        { value: 'ich', label: L('ich', 'me') },
        { value: 'pc', label: L('Computer', 'computer') },
      ],
      default: 'ich',
      display: 'buttons',
    },
    { key: 'hint', type: 'boolean', label: L('Strategie zeigen', 'Show the strategy'), default: false },
  ],
  actions: [{ id: 'neu', label: L('Neues Spiel', 'New game'), primary: true }],
  hint: (v) =>
    v.mode === 'mehr'
      ? L('Tippe auf ein Holz: Es wird mit allen darüber weggenommen. Wer das letzte nimmt, gewinnt.', 'Tap a stick: it is taken away together with all sticks above it. Whoever takes the last one wins.')
      : L('Tippe, wie viele Hölzer du nimmst. Wer das letzte Holz nimmt, gewinnt. Findest du heraus, wie der Computer immer gewinnt?', 'Tap how many sticks you take. Whoever takes the last stick wins. Can you work out how the computer always wins?'),
  readouts: [
    { key: 'status', label: L('Spielstand', 'Game') },
    { key: 'tip', label: L('Strategie', 'Strategy'), spoiler: true },
  ],
  presets: [
    { id: 'klassik', label: L('15 Hölzer, 1 bis 3', '15 sticks, 1 to 3'), values: { mode: 'ein', n: 15, k: 3, first: 'ich', hint: false } },
    { id: 'pc', label: L('Computer beginnt bei 12', 'Computer starts at 12'), values: { mode: 'ein', n: 12, k: 3, first: 'pc', hint: false } },
    { id: 'nim', label: L('Nim 3 – 4 – 5', 'Nim 3 – 4 – 5'), values: { mode: 'mehr', h1: 3, h2: 4, h3: 5, first: 'ich', hint: false } },
  ],
  strings: {
    de: {
      canvas: 'Spielfeld mit Streichhölzern; darunter Tasten, um Hölzer zu nehmen, und auf Wunsch die Gewinn- und Verlustpositionen',
      you: 'Du bist am Zug – {r} Hölzer übrig.',
      pcTook: 'Der Computer hat {t} genommen. Du bist am Zug – {r} übrig.',
      youWin: 'Du hast das letzte Holz genommen – gewonnen!',
      pcWin: 'Der Computer hat das letzte Holz genommen.',
      take: 'nimm {t}',
      tip1: 'Lass immer ein Vielfaches von {m} übrig ({list} …). Dann kann der Gegner nicht gewinnen.',
      tipNow: ' Jetzt: {r} Hölzer → nimm {t}.',
      tipLose: ' Jetzt: {r} ist ein Vielfaches von {m} – eine Verlustposition, wenn der Computer richtig spielt.',
      tipNim: 'Schreibe die Haufen im Zweiersystem und bilde die Nim-Summe (Stellen ohne Übertrag addieren, 1 + 1 = 0). Lass immer die Nim-Summe 0 übrig.',
      nimNow: ' Jetzt: Nim-Summe {s}.',
      lose: 'Verlust',
      win: 'Gewinn',
      sum: 'Nim-Summe',
      pile: 'Haufen',
    },
    en: {
      canvas: 'Game board with sticks; below it buttons for taking sticks and, if you like, the winning and losing positions',
      you: 'Your turn – {r} sticks left.',
      pcTook: 'The computer took {t}. Your turn – {r} left.',
      youWin: 'You took the last stick – you win!',
      pcWin: 'The computer took the last stick.',
      take: 'take {t}',
      tip1: 'Always leave a multiple of {m} ({list} …). Then your opponent cannot win.',
      tipNow: ' Now: {r} sticks → take {t}.',
      tipLose: ' Now: {r} is a multiple of {m} – a losing position if the computer plays well.',
      tipNim: 'Write the piles in binary and form the nim-sum (add the digits without carrying, 1 + 1 = 0). Always leave a nim-sum of 0.',
      nimNow: ' Now: nim-sum {s}.',
      lose: 'lose',
      win: 'win',
      sum: 'nim-sum',
      pile: 'pile',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const mode = () => p.mode as Mode;

    /* Spielzustand (gehört nicht in den Link) */
    let rest = 0;
    let heaps: number[] = [];
    let lastPc: number | null = null;
    let lastPcHeap: number | null = null;
    let winner: 'ich' | 'pc' | null = null;

    function pcMove(): void {
      if (mode() === 'ein') {
        const t = bestMove(rest, p.k);
        rest -= t;
        lastPc = t;
        if (rest === 0) winner = 'pc';
      } else {
        const m = nimMove(heaps);
        let i: number;
        let to: number;
        if (m) [i, to] = m;
        else {
          i = heaps.indexOf(Math.max(...heaps));
          to = heaps[i]! - 1;
        }
        lastPc = heaps[i]! - to;
        lastPcHeap = i;
        heaps[i] = to;
        if (heaps.every((h) => h === 0)) winner = 'pc';
      }
    }

    function reset(): void {
      rest = p.n;
      heaps = [p.h1, p.h2, p.h3];
      lastPc = null;
      lastPcHeap = null;
      winner = null;
      if (p.first === 'pc') pcMove();
    }
    reset();

    let hits: { id: string; x: number; y: number; w: number; h: number }[] = [];
    new TapTarget(surface, {
      hit: (px, py) => {
        if (ctx.locked || winner) return null;
        const h = hits.find((r) => px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h);
        return h ? h.id : null;
      },
      onTap: (id) => {
        if (id.startsWith('take')) {
          const t = Number(id.slice(4));
          rest -= t;
          if (rest === 0) winner = 'ich';
          else pcMove();
        } else if (id.startsWith('h')) {
          const [hi, si] = id.slice(1).split('_').map(Number) as [number, number];
          heaps[hi] = si;
          if (heaps.every((h) => h === 0)) winner = 'ich';
          else pcMove();
        }
        updateReadouts();
      },
    });

    function updateReadouts(): void {
      const left = mode() === 'ein' ? rest : heaps.reduce((a, b) => a + b, 0);
      const status = winner === 'ich' ? ctx.t('youWin') : winner === 'pc' ? ctx.t('pcWin') : lastPc !== null ? tr('pcTook', { t: lastPc, r: left }) : tr('you', { r: left });
      ctx.readout('status', status);
      if (mode() === 'ein') {
        const m = p.k + 1;
        let tip = tr('tip1', { m, list: [m, 2 * m, 3 * m].join(', ') });
        if (!winner) tip += isLosing(rest, p.k) ? tr('tipLose', { r: rest, m }) : tr('tipNow', { r: rest, t: bestMove(rest, p.k) });
        ctx.readout('tip', tip);
      } else {
        ctx.readout('tip', ctx.t('tipNim') + (winner ? '' : tr('nimNow', { s: nimSum(heaps) })));
      }
    }

    /** Ein Streichholz zeichnen. */
    function stick(g: CanvasRenderingContext2D, x: number, y: number, len: number, alpha = 1, color?: string): void {
      const th = ctx.theme;
      g.save();
      g.globalAlpha = alpha;
      g.strokeStyle = color ?? withAlpha(th.series[3]!, 0.75);
      g.lineWidth = Math.max(3, len * 0.09);
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(x, y + len);
      g.lineTo(x, y + len * 0.18);
      g.stroke();
      g.fillStyle = th.series[1]!;
      g.beginPath();
      g.ellipse(x, y + len * 0.12, len * 0.075, len * 0.13, 0, 0, Math.PI * 2);
      g.fill();
      g.restore();
    }

    function drawSingle(g: CanvasRenderingContext2D, W: number, H: number): void {
      const th = ctx.theme;
      const total = p.n;
      const gap = Math.min(56, (W - 40) / total);
      const len = Math.min(150, H * 0.3, gap * 3.2);
      const x0 = (W - gap * (total - 1)) / 2;
      const y0 = H * 0.08;
      for (let i = 0; i < total; i++) {
        const gone = i >= rest;
        const byPc = lastPc !== null && i >= rest && i < rest + lastPc;
        stick(g, x0 + i * gap, y0, len, gone ? (byPc ? 0.35 : 0.08) : 1);
      }
      // Tasten
      const k = p.k;
      const bw = Math.min(150, (W - 40) / k - 10);
      const bh = W > 700 ? 56 : 44;
      const by = y0 + len + 30;
      const bx0 = (W - (k * (bw + 10) - 10)) / 2;
      for (let t = 1; t <= k; t++) {
        const can = !winner && t <= rest;
        const x = bx0 + (t - 1) * (bw + 10);
        g.fillStyle = can ? withAlpha(th.series[0]!, 0.18) : withAlpha(th.muted, 0.08);
        roundRect(g, x, by, bw, bh, 10);
        g.fill();
        g.strokeStyle = can ? th.series[0]! : withAlpha(th.muted, 0.4);
        g.lineWidth = 2;
        g.stroke();
        text(g, tr('take', { t }), x + bw / 2, by + bh / 2, { font: `700 ${W > 700 ? 19 : 15}px ${th.font}`, color: can ? th.series[0]! : th.muted });
        if (can) hits.push({ id: `take${t}`, x, y: by, w: bw, h: bh });
      }
      // Zahlenstrahl der Positionen
      if (p.hint) {
        const ly = by + bh + 50;
        const step = Math.min(48, (W - 40) / total);
        const lx0 = (W - step * total) / 2;
        g.strokeStyle = th.axis;
        g.lineWidth = 1.5;
        g.beginPath();
        g.moveTo(lx0, ly);
        g.lineTo(lx0 + step * total, ly);
        g.stroke();
        for (let i = 0; i <= total; i++) {
          const x = lx0 + i * step;
          const lose = isLosing(i, k);
          g.fillStyle = lose ? th.series[1]! : withAlpha(th.series[2]!, 0.7);
          g.beginPath();
          g.arc(x, ly, i === rest ? 8 : 4.5, 0, Math.PI * 2);
          g.fill();
          if (i === rest) {
            g.strokeStyle = th.text;
            g.lineWidth = 2;
            g.stroke();
          }
          if (total <= 20 || i % 2 === 0) text(g, String(i), x, ly + 20, { font: `600 ${W > 700 ? 14 : 11}px ${th.font}`, color: lose ? th.series[1]! : th.muted });
        }
        text(g, `● ${ctx.t('lose')}`, lx0, ly - 18, { font: `700 12px ${th.font}`, color: th.series[1]!, align: 'left' });
        text(g, `● ${ctx.t('win')}`, lx0 + 90, ly - 18, { font: `700 12px ${th.font}`, color: th.series[2]!, align: 'left' });
      }
    }

    function drawMulti(g: CanvasRenderingContext2D, W: number, H: number): void {
      const th = ctx.theme;
      const maxH = Math.max(p.h1, p.h2, p.h3);
      const colW = W / (p.hint ? 4.2 : 3);
      const len = Math.min(150, colW * 0.55);
      const rowH = Math.min(len * 0.32, (H - 60) / (maxH + 1));
      const base = H - 40;
      [p.h1, p.h2, p.h3].forEach((full, hi) => {
        const cx = colW * (hi + 0.5);
        for (let s = 0; s < full; s++) {
          const y = base - (s + 1) * rowH;
          const present = s < heaps[hi]!;
          const byPc = lastPcHeap === hi && lastPc !== null && s >= heaps[hi]! && s < heaps[hi]! + lastPc;
          // liegendes Holz
          g.save();
          g.translate(cx, y + rowH / 2);
          g.rotate(-Math.PI / 2);
          stick(g, 0, -len / 2, len, present ? 1 : byPc ? 0.35 : 0.08);
          g.restore();
          if (present && !winner) hits.push({ id: `h${hi}_${s}`, x: cx - len / 2 - 6, y, w: len + 12, h: rowH });
        }
        text(g, `${ctx.t('pile')} ${hi + 1}: ${heaps[hi]}`, cx, base + 18, { font: `700 13px ${th.font}`, color: th.text });
      });
      if (p.hint) {
        const x0 = colW * 3 + 10;
        const fs = 14;
        const bin = (v: number) => v.toString(2).padStart(4, '0');
        heaps.forEach((h, i) => text(g, `${h} = ${bin(h)}`, x0, H * 0.3 + i * 24, { font: `600 ${fs}px ${th.font}`, color: th.text, align: 'left' }));
        g.strokeStyle = th.axis;
        g.beginPath();
        g.moveTo(x0, H * 0.3 + 62);
        g.lineTo(x0 + 110, H * 0.3 + 62);
        g.stroke();
        const s = nimSum(heaps);
        text(g, `${ctx.t('sum')}: ${bin(s)}`, x0, H * 0.3 + 80, { font: `800 ${fs}px ${th.font}`, color: s === 0 ? th.series[1]! : th.series[2]!, align: 'left' });
      }
    }

    return {
      update(changed) {
        if (['mode', 'n', 'k', 'h1', 'h2', 'h3', 'first'].some((key) => changed.has(key))) reset();
        updateReadouts();
      },
      action(id) {
        if (id === 'neu') {
          reset();
          updateReadouts();
          ctx.requestRender();
        }
      },
      render() {
        const g = surface.begin();
        hits = [];
        if (mode() === 'ein') drawSingle(g, surface.width, surface.height);
        else drawMulti(g, surface.width, surface.height);
      },
      destroy: () => surface.destroy(),
    };
  },
});
