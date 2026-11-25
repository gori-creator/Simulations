import { defineSimulation, roundRect, Surface, TapTarget, text, withAlpha } from '../../../sim-core';
import { apply, classify, equivalent, PAIRS, rows, SYMBOL, type Op } from './model';

const L = (de: string, en: string) => ({ de, en });
type Mode = 'verknuepfung' | 'vergleich';

const OP_LABEL: Record<Op, { de: string; en: string }> = {
  and: L('und (Konjunktion)', 'and (conjunction)'),
  or: L('oder (Disjunktion)', 'or (disjunction)'),
  not: L('nicht (Negation)', 'not (negation)'),
  impl: L('wenn … dann (Implikation)', 'if … then (implication)'),
  equiv: L('genau dann, wenn (Äquivalenz)', 'if and only if (equivalence)'),
  xor: L('entweder … oder (XOR)', 'either … or (XOR)'),
  nand: L('nicht beide (NAND)', 'not both (NAND)'),
  nor: L('weder … noch (NOR)', 'neither … nor (NOR)'),
};
const GATE: Record<Op, { sym: string; neg: boolean }> = {
  and: { sym: '&', neg: false },
  or: { sym: '≥1', neg: false },
  not: { sym: '1', neg: true },
  impl: { sym: '→', neg: false },
  equiv: { sym: '=', neg: false },
  xor: { sym: '=1', neg: false },
  nand: { sym: '&', neg: true },
  nor: { sym: '≥1', neg: true },
};

/**
 * Aussagenlogik: Verknüpfungen als Schaltglied mit Schaltern und Lampe
 * und als Wahrheitstafel; Vergleich zweier Formeln (De Morgan, Kontraposition …).
 */
export default defineSimulation({
  id: 'aussagenlogik',
  layout: { aspect: 1.6, aspectNarrow: 0.95 },
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Ansicht', 'View'),
      options: [
        { value: 'verknuepfung', label: L('Verknüpfungen', 'Connectives') },
        { value: 'vergleich', label: L('Formeln vergleichen', 'Compare formulas') },
      ],
      default: 'verknuepfung',
      display: 'buttons',
    },
    {
      key: 'op',
      type: 'choice',
      label: L('Verknüpfung', 'Connective'),
      options: (Object.keys(OP_LABEL) as Op[]).map((o) => ({ value: o, label: OP_LABEL[o] })),
      default: 'and',
      display: 'menu',
      visibleIf: (v) => v.mode === 'verknuepfung',
    },
    {
      key: 'pair',
      type: 'choice',
      label: L('Formelpaar', 'Pair of formulas'),
      options: PAIRS.map((p) => ({ value: p.id, label: L(`${p.left}  und  ${p.right}`, `${p.left}  and  ${p.right}`) })),
      default: 'demorgan1',
      display: 'menu',
      visibleIf: (v) => v.mode === 'vergleich',
    },
    { key: 'a', type: 'boolean', label: L('A ist wahr', 'A is true'), default: true },
    { key: 'b', type: 'boolean', label: L('B ist wahr', 'B is true'), default: false },
    { key: 'c', type: 'boolean', label: L('C ist wahr', 'C is true'), default: false, visibleIf: (v) => v.mode === 'vergleich' && PAIRS.find((p) => p.id === v.pair)?.vars === 3 },
  ],
  hint: (v) =>
    v.mode === 'vergleich'
      ? L('Zwei Formeln sind gleichwertig, wenn ihre Spalten in jeder Zeile übereinstimmen.', 'Two formulas are equivalent if their columns agree in every row.')
      : L('Tippe auf die Schalter A und B oder auf eine Zeile der Tafel.', 'Tap the switches A and B or a row of the table.'),
  readouts: [
    { key: 'formel', label: L('Formel', 'Formula') },
    { key: 'satz', label: L('Gelesen', 'Read as') },
    { key: 'wert', label: L('Wahrheitswert', 'Truth value'), spoiler: true },
    { key: 'art', label: L('Ergebnis', 'Result'), spoiler: true },
  ],
  presets: [
    { id: 'und', label: L('Und-Schaltung', 'AND gate'), values: { mode: 'verknuepfung', op: 'and', a: true, b: true } },
    { id: 'impl', label: L('Wenn … dann', 'If … then'), values: { mode: 'verknuepfung', op: 'impl', a: false, b: true } },
    { id: 'demorgan', label: L('De Morgan', 'De Morgan'), values: { mode: 'vergleich', pair: 'demorgan1' } },
    { id: 'umkehr', label: L('Umkehrung ist nicht gleichwertig', 'The converse is not equivalent'), values: { mode: 'vergleich', pair: 'umkehr', a: false, b: true } },
  ],
  strings: {
    de: {
      canvas: 'Schaltglied mit den Schaltern A und B und einer Lampe sowie die Wahrheitstafel der Verknüpfung; im Vergleich eine Wahrheitstafel für zwei Formeln',
      w: 'w',
      f: 'f',
      true: 'wahr',
      false: 'falsch',
      and: 'A und B',
      or: 'A oder B (oder beide)',
      not: 'nicht A',
      impl: 'wenn A, dann B',
      equiv: 'A genau dann, wenn B',
      xor: 'entweder A oder B',
      nand: 'nicht A und B zugleich',
      nor: 'weder A noch B',
      equal: 'gleich?',
      eqYes: 'Die Formeln sind gleichwertig (äquivalent).',
      eqNo: 'Nicht gleichwertig – sie unterscheiden sich in {n} Zeile(n).',
      tautologie: 'Tautologie (immer wahr)',
      kontradiktion: 'Kontradiktion (immer falsch)',
      erfuellbar: 'erfüllbar',
      sides: 'links: {l}; rechts: {r}',
      lamp: 'Lampe',
      on: 'an',
      off: 'aus',
    },
    en: {
      canvas: 'Logic gate with switches A and B and a lamp, plus the truth table of the connective; in the comparison a truth table for two formulas',
      w: 'T',
      f: 'F',
      true: 'true',
      false: 'false',
      and: 'A and B',
      or: 'A or B (or both)',
      not: 'not A',
      impl: 'if A, then B',
      equiv: 'A if and only if B',
      xor: 'either A or B',
      nand: 'not both A and B',
      nor: 'neither A nor B',
      equal: 'equal?',
      eqYes: 'The formulas are equivalent.',
      eqNo: 'Not equivalent – they differ in {n} row(s).',
      tautologie: 'tautology (always true)',
      kontradiktion: 'contradiction (always false)',
      erfuellbar: 'satisfiable',
      sides: 'left: {l}; right: {r}',
      lamp: 'lamp',
      on: 'on',
      off: 'off',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const mode = () => p.mode as Mode;
    const op = () => p.op as Op;
    const pair = () => PAIRS.find((q) => q.id === p.pair) ?? PAIRS[0]!;
    const tv = (b: boolean) => ctx.t(b ? 'w' : 'f');

    /** Antippbare Bereiche (werden beim Zeichnen gesetzt). */
    let hits: { id: string; x: number; y: number; w: number; h: number }[] = [];
    new TapTarget(surface, {
      hit: (px, py) => {
        if (ctx.locked) return null;
        const h = hits.find((r) => px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h);
        return h ? h.id : null;
      },
      onTap: (id) => {
        if (id === 'A') ctx.set({ a: !p.a });
        else if (id === 'B') ctx.set({ b: !p.b });
        else if (id.startsWith('row')) {
          const r = rows(mode() === 'vergleich' ? pair().vars : 2)[Number(id.slice(3))]!;
          ctx.set({ a: r.A, b: r.B, c: r.C });
        }
      },
    });

    function updateReadouts(): void {
      if (mode() === 'verknuepfung') {
        const v = apply(op(), p.a, p.b);
        ctx.readout('formel', SYMBOL[op()]);
        ctx.readout('satz', ctx.t(op()));
        ctx.readout('wert', `${ctx.t(v ? 'true' : 'false')} (${ctx.t('lamp')} ${ctx.t(v ? 'on' : 'off')})`);
        ctx.readout('art', null);
      } else {
        const q = pair();
        ctx.readout('formel', `${q.left}   |   ${q.right}`);
        ctx.readout('satz', tr('sides', { l: ctx.t(classify(q.f, q.vars)), r: ctx.t(classify(q.g, q.vars)) }));
        const r = { A: p.a, B: p.b, C: p.c };
        ctx.readout('wert', `${tv(q.f(r))} | ${tv(q.g(r))}`);
        const diff = rows(q.vars).filter((x) => q.f(x) !== q.g(x)).length;
        ctx.readout('art', equivalent(q) ? ctx.t('eqYes') : tr('eqNo', { n: diff }));
      }
    }

    /** Wahrheitstafel zeichnen. */
    function table(g: CanvasRenderingContext2D, X: number, Y: number, W: number, H: number, heads: string[], data: boolean[][], current: number, skipLast = false): void {
      const th = ctx.theme;
      const nRows = data.length + 1;
      const rh = Math.min(42, H / nRows);
      const cw = W / heads.length;
      const fs = Math.max(11, Math.min(17, rh * 0.45, cw * 0.22));
      heads.forEach((hd, j) => {
        g.font = `700 ${fs}px ${th.font}`;
        const w = g.measureText(hd).width;
        const size = w > cw - 6 ? Math.max(9, Math.floor((fs * (cw - 6)) / w)) : fs;
        text(g, hd, X + cw * (j + 0.5), Y + rh / 2, { font: `700 ${size}px ${th.font}`, color: th.text });
      });
      g.strokeStyle = th.axis;
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(X, Y + rh);
      g.lineTo(X + W, Y + rh);
      g.stroke();
      data.forEach((row, i) => {
        const y = Y + rh * (i + 1);
        if (i === current) {
          g.fillStyle = withAlpha(th.series[0]!, 0.16);
          roundRect(g, X, y + 2, W, rh - 4, 6);
          g.fill();
        }
        hits.push({ id: `row${i}`, x: X, y, w: W, h: rh });
        row.forEach((v, j) => {
          if (skipLast && j === row.length - 1) return;
          const col = v ? th.series[2]! : th.series[1]!;
          text(g, tv(v), X + cw * (j + 0.5), y + rh / 2, { font: `${i === current ? 800 : 600} ${fs}px ${th.font}`, color: col });
        });
      });
    }

    function drawGate(g: CanvasRenderingContext2D, X: number, Y: number, W: number, H: number): void {
      const th = ctx.theme;
      const v = apply(op(), p.a, p.b);
      const one = op() === 'not';
      const gw = Math.min(170, W * 0.26);
      const gh = Math.min(220, H * 0.56);
      const gx = X + W * 0.42;
      const gy = Y + (H - gh) / 2;
      const inY = one ? [gy + gh / 2] : [gy + gh * 0.28, gy + gh * 0.72];
      const sw = Math.min(84, W * 0.17);
      const sh = Math.min(46, H * 0.13);
      const swX = X + 10;
      const wire = (on: boolean) => (on ? th.series[3]! : th.muted);
      // Schalter
      (one ? ['A'] : ['A', 'B']).forEach((name, k) => {
        const on = name === 'A' ? p.a : p.b;
        const y = inY[k]! - sh / 2;
        g.fillStyle = on ? withAlpha(th.series[2]!, 0.25) : withAlpha(th.series[1]!, 0.15);
        roundRect(g, swX, y, sw, sh, sh / 2);
        g.fill();
        g.strokeStyle = on ? th.series[2]! : th.series[1]!;
        g.lineWidth = 2;
        g.stroke();
        const kx = on ? swX + sw - sh / 2 : swX + sh / 2;
        g.fillStyle = on ? th.series[2]! : th.series[1]!;
        g.beginPath();
        g.arc(kx, y + sh / 2, sh * 0.36, 0, Math.PI * 2);
        g.fill();
        text(g, `${name} = ${tv(on)}`, swX + sw + 8, inY[k]! - 13, { font: `700 ${Math.min(16, sh * 0.42)}px ${th.font}`, color: th.text, align: 'left' });
        hits.push({ id: name, x: swX - 4, y: y - 4, w: sw + 8, h: sh + 8 });
        g.strokeStyle = wire(on);
        g.lineWidth = 3;
        g.beginPath();
        g.moveTo(swX + sw, inY[k]!);
        g.lineTo(gx, inY[k]!);
        g.stroke();
      });
      // Schaltglied
      g.fillStyle = withAlpha(th.series[0]!, 0.1);
      g.fillRect(gx, gy, gw, gh);
      g.strokeStyle = th.text;
      g.lineWidth = 2.5;
      g.strokeRect(gx, gy, gw, gh);
      text(g, GATE[op()].sym, gx + gw / 2, gy + gh / 2, { font: `800 ${Math.min(30, gw * 0.3)}px ${th.font}`, color: th.text });
      let ox = gx + gw;
      if (GATE[op()].neg) {
        g.beginPath();
        g.arc(ox + 7, gy + gh / 2, 7, 0, Math.PI * 2);
        g.fillStyle = th.bg;
        g.fill();
        g.stroke();
        ox += 14;
      }
      // Ausgang und Lampe
      const lx = X + W - Math.min(50, W * 0.12);
      const lr = Math.min(26, H * 0.09);
      g.strokeStyle = wire(v);
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(ox, gy + gh / 2);
      g.lineTo(lx - lr, gy + gh / 2);
      g.stroke();
      if (v) {
        const grad = g.createRadialGradient(lx, gy + gh / 2, 2, lx, gy + gh / 2, lr * 2.2);
        grad.addColorStop(0, withAlpha(th.series[3]!, 0.55));
        grad.addColorStop(1, withAlpha(th.series[3]!, 0));
        g.fillStyle = grad;
        g.beginPath();
        g.arc(lx, gy + gh / 2, lr * 2.2, 0, Math.PI * 2);
        g.fill();
      }
      g.fillStyle = v ? th.series[3]! : withAlpha(th.muted, 0.25);
      g.beginPath();
      g.arc(lx, gy + gh / 2, lr, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = th.text;
      g.lineWidth = 2;
      g.stroke();
      text(g, tv(v), lx, gy + gh / 2 + lr + 16, { font: `800 15px ${th.font}`, color: v ? th.series[2]! : th.series[1]! });
    }

    function render(): void {
      const g = surface.begin();
      const W = surface.width;
      const H = surface.height;
      const narrow = W < 600;
      hits = [];
      if (mode() === 'verknuepfung') {
        const R2 = rows(2);
        const data = R2.map((r) => (op() === 'not' ? [r.A, apply('not', r.A, r.B)] : [r.A, r.B, apply(op(), r.A, r.B)]));
        const heads = op() === 'not' ? ['A', SYMBOL.not] : ['A', 'B', SYMBOL[op()]];
        const cur = R2.findIndex((r) => r.A === p.a && (op() === 'not' || r.B === p.b));
        if (narrow) {
          drawGate(g, 8, 8, W - 16, H * 0.5 - 8);
          table(g, 16, H * 0.52, W - 32, H * 0.46, heads, op() === 'not' ? data.filter((_, i) => i % 2 === 0) : data, op() === 'not' ? Math.floor(cur / 2) : cur);
        } else {
          drawGate(g, 12, 12, W * 0.58, H - 24);
          table(g, W * 0.62, H * 0.12, W * 0.35, H * 0.7, heads, op() === 'not' ? data.filter((_, i) => i % 2 === 0) : data, op() === 'not' ? Math.floor(cur / 2) : cur);
        }
        if (op() === 'not') hits = hits.map((h) => (h.id.startsWith('row') ? { ...h, id: `row${Number(h.id.slice(3)) * 2}` } : h));
      } else {
        const q = pair();
        const R = rows(q.vars);
        const vars = q.vars === 3 ? ['A', 'B', 'C'] : ['A', 'B'];
        const heads = [...vars, q.left, q.right, ctx.t('equal')];
        const data = R.map((r) => [...vars.map((k) => r[k as 'A' | 'B' | 'C']), q.f(r), q.g(r), q.f(r) === q.g(r)]);
        const cur = R.findIndex((r) => r.A === p.a && r.B === p.b && (q.vars === 2 || r.C === p.c));
        const X = narrow ? 8 : W * 0.08;
        table(g, X, 16, W - 2 * X, H - 32, heads, data, cur, true);
        // Spalte „gleich?“ mit Häkchen statt w/f überschreiben
        const th = ctx.theme;
        const nRows = data.length + 1;
        const rh = Math.min(42, (H - 32) / nRows);
        const cw = (W - 2 * X) / heads.length;
        data.forEach((row, i) => {
          const eq = row[row.length - 1]!;
          const cx = X + cw * (heads.length - 0.5);
          const cy = 16 + rh * (i + 1) + rh / 2;
          text(g, eq ? '✓' : '✗', cx, cy, { font: `800 ${Math.min(20, rh * 0.55)}px ${th.font}`, color: eq ? th.series[2]! : th.series[1]! });
        });
      }
    }

    return {
      update() {
        updateReadouts();
      },
      render,
      destroy: () => surface.destroy(),
    };
  },
});
