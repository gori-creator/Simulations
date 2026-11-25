import { defineSimulation, drawArrowHead, roundRect, Surface, text, withAlpha } from '../../../sim-core';
import { balanceAfter, jumps, patternRows, quotient, sign } from './model';

const L = (de: string, en: string) => ({ de, en });

type Mode = 'strahl' | 'muster' | 'schulden' | 'teilen';

/**
 * Vorzeichenregeln beim Multiplizieren und Dividieren: Sprünge am
 * Zahlenstrahl mit Gegenzahl, Permanenzprinzip (Muster fortsetzen),
 * Schuldenmodell und Division als Umkehrung.
 */
export default defineSimulation({
  id: 'vorzeichenregeln',
  layout: { aspect: 1.6, aspectNarrow: 0.8 },
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Ansicht', 'View'),
      options: [
        { value: 'strahl', label: L('Zahlenstrahl', 'Number line') },
        { value: 'muster', label: L('Muster fortsetzen', 'Continue the pattern') },
        { value: 'schulden', label: L('Schuldenmodell', 'Debt model') },
        { value: 'teilen', label: L('Dividieren', 'Dividing') },
      ],
      default: 'strahl',
      display: 'buttons',
    },
    { key: 'a', type: 'number', label: L('erster Faktor a', 'first factor a'), min: -6, max: 6, step: 1, default: -3, visibleIf: (v) => v.mode === 'strahl' || v.mode === 'muster' },
    { key: 'b', type: 'number', label: L('zweiter Faktor b', 'second factor b'), min: -6, max: 6, step: 1, default: -4, visibleIf: (v) => v.mode === 'strahl' || v.mode === 'muster' },
    { key: 'st', type: 'number', label: L('Kontostand vorher', 'Balance before'), min: -40, max: 40, step: 5, default: -20, unit: '€', visibleIf: (v) => v.mode === 'schulden' },
    { key: 'k', type: 'number', label: L('Karten: dazu (+) oder weg (−)', 'Cards: added (+) or removed (−)'), min: -6, max: 6, step: 1, default: -3, visibleIf: (v) => v.mode === 'schulden' },
    { key: 'w', type: 'number', label: L('Wert einer Karte (− = Schuldschein)', 'Value of one card (− = IOU)'), min: -6, max: 6, step: 1, default: -5, unit: '€', visibleIf: (v) => v.mode === 'schulden' },
    { key: 'dd', type: 'number', label: L('Dividend', 'Dividend'), min: -36, max: 36, step: 1, default: -12, visibleIf: (v) => v.mode === 'teilen' },
    { key: 'dv', type: 'number', label: L('Divisor', 'Divisor'), min: -6, max: 6, step: 1, default: 3, visibleIf: (v) => v.mode === 'teilen' },
  ],
  hint: (v) =>
    v.mode === 'muster'
      ? L('Geht der erste Faktor um 1 nach unten, ändert sich das Ergebnis immer um denselben Betrag. Setze das Muster über die Null hinaus fort.', 'When the first factor goes down by 1, the result always changes by the same amount. Continue the pattern past zero.')
      : v.mode === 'schulden'
        ? L('Schuldscheine wegnehmen macht das Konto besser – minus mal minus ergibt plus.', 'Taking away IOUs makes the account better – minus times minus gives plus.')
        : v.mode === 'teilen'
          ? L('Dividieren ist die Umkehrung des Multiplizierens. Deshalb gelten dieselben Vorzeichenregeln.', 'Dividing undoes multiplying, so the same sign rules apply.')
          : L('Ein negativer erster Faktor bedeutet: erst springen, dann an der Null spiegeln (Gegenzahl).', 'A negative first factor means: jump first, then reflect at zero (opposite number).'),
  readouts: [
    { key: 'term', label: L('Aufgabe', 'Task') },
    { key: 'res', label: L('Ergebnis', 'Result'), spoiler: true },
    { key: 'rule', label: L('Regel', 'Rule') },
  ],
  presets: [
    { id: 'mm', label: L('(−3) · (−4)', '(−3) · (−4)'), values: { mode: 'strahl', a: -3, b: -4 } },
    { id: 'pm', label: L('3 · (−4)', '3 · (−4)'), values: { mode: 'strahl', a: 3, b: -4 } },
    { id: 'muster', label: L('Muster mit −2', 'Pattern with −2'), values: { mode: 'muster', a: -2, b: -2 } },
    { id: 'streichen', label: L('Schulden streichen', 'Cancel debts'), values: { mode: 'schulden', st: -20, k: -3, w: -5 } },
    { id: 'div', label: L('−12 : (−3)', '−12 : (−3)'), values: { mode: 'teilen', dd: -12, dv: -3 } },
  ],
  strings: {
    de: {
      canvas: 'Zahlenstrahl mit Sprüngen für die Rechnung, darunter eine Erklärung und eine Tabelle der Vorzeichenregeln',
      ruleSame: 'gleiche Vorzeichen → Ergebnis positiv',
      ruleDiff: 'verschiedene Vorzeichen → Ergebnis negativ',
      ruleZero: 'Ist ein Faktor 0, ist das Ergebnis 0.',
      ruleZeroDiv: '0 geteilt durch eine Zahl ist 0.',
      divZero: 'nicht erlaubt – durch 0 kann man nicht teilen',
      jumpsLine: '{n} Sprünge der Länge {b}',
      noJump: '0 Sprünge: Ergebnis 0',
      mirror: 'Gegenzahl',
      negFirst: 'a ist negativ → Gegenzahl nehmen',
      posFirst: 'a ist positiv → so bleibt es',
      step: '{d} je Zeile',
      table: 'Vorzeichen',
      first: '1. Zahl',
      second: '2. Zahl',
      before: 'vorher',
      after: 'nachher',
      add: '{n} Karten dazu',
      remove: '{n} Karten weg',
      noCards: 'keine Karte',
      better: 'Das Konto wird um {d} € besser.',
      worse: 'Das Konto wird um {d} € schlechter.',
      same: 'Der Kontostand bleibt gleich.',
      ask: 'Gesucht: Welche Zahl ergibt mal {b} genau {a}?',
      check: 'Probe: {c} · {b} = {a}',
      divNo: 'Keine Zahl ergibt mal 0 genau {a}.',
      divNoZ: 'Mal 0 ergibt jede Zahl 0 – das Ergebnis wäre nicht eindeutig.',
      euro: '{v} €',
    },
    en: {
      canvas: 'Number line with jumps for the calculation, below it an explanation and a table of the sign rules',
      ruleSame: 'same signs → result positive',
      ruleDiff: 'different signs → result negative',
      ruleZero: 'If one factor is 0, the result is 0.',
      ruleZeroDiv: '0 divided by a number is 0.',
      divZero: 'not allowed – you cannot divide by 0',
      jumpsLine: '{n} jumps of length {b}',
      noJump: '0 jumps: result 0',
      mirror: 'opposite',
      negFirst: 'a is negative → take the opposite',
      posFirst: 'a is positive → it stays as it is',
      step: '{d} per row',
      table: 'Signs',
      first: '1st number',
      second: '2nd number',
      before: 'before',
      after: 'after',
      add: '{n} cards added',
      remove: '{n} cards removed',
      noCards: 'no card',
      better: 'The account gets better by €{d}.',
      worse: 'The account gets worse by €{d}.',
      same: 'The balance stays the same.',
      ask: 'Wanted: which number times {b} gives exactly {a}?',
      check: 'Check: {c} · {b} = {a}',
      divNo: 'No number times 0 gives exactly {a}.',
      divNoZ: 'Every number times 0 gives 0 – the result would not be unique.',
      euro: '€{v}',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const mode = () => p.mode as Mode;
    /** Zahl, negative Zahlen in Klammern (für Rechenausdrücke). */
    const n = (x: number, d = 0) => fmt.num(x === 0 ? 0 : x, d);
    const par = (x: number, d = 0) => (x < 0 ? `(${n(x, d)})` : n(x, d));
    const qDec = (q: number) => (fmt.isExact(q, 0) ? 0 : 2);

    /** Die beiden Zahlen, deren Vorzeichen die Regel bestimmen. */
    function operands(): [number, number] {
      if (mode() === 'schulden') return [p.k, p.w];
      if (mode() === 'teilen') return [p.dd, p.dv];
      return [p.a, p.b];
    }

    function updateReadouts(): void {
      const [x, y] = operands();
      let term = '';
      let res = '';
      if (mode() === 'teilen') {
        term = `${n(x)} : ${par(y)}`;
        const q = quotient(x, y);
        res = q === null ? ctx.t('divZero') : `${fmt.rel(q, 2)} ${n(q, qDec(q))}`;
      } else if (mode() === 'schulden') {
        term = `${n(p.st)} + ${par(p.k)} · ${par(p.w)}`;
        res = `= ${tr('euro', { v: n(balanceAfter(p.st, p.k, p.w)) })}`;
      } else {
        term = `${par(x)} · ${par(y)}`;
        res = `= ${n(x * y)}`;
      }
      const s = sign(x) * sign(y);
      const rule = y === 0 && mode() === 'teilen' ? ctx.t('divZero') : s === 0 ? ctx.t(mode() === 'teilen' ? 'ruleZeroDiv' : 'ruleZero') : ctx.t(s > 0 ? 'ruleSame' : 'ruleDiff');
      ctx.readout('term', term);
      ctx.readout('res', res);
      ctx.readout('rule', rule);
    }

    /* ---------------- Zeichnen ---------------- */

    function niceRange(vals: number[]): number {
      const m = Math.max(6, ...vals.map((v) => Math.abs(v))) + 1;
      if (m <= 10) return Math.ceil(m / 2) * 2;
      if (m <= 20) return Math.ceil(m / 4) * 4;
      return Math.ceil(m / 10) * 10;
    }

    interface Jump {
      from: number;
      to: number;
    }

    function scene(): { jumps: Jump[]; mirror: Jump | null; result: number | null; extra: number[]; label: string } {
      if (mode() === 'schulden') {
        const step = p.k < 0 ? -p.w : p.w;
        const js = Array.from({ length: Math.abs(p.k) }, (_, i) => ({ from: p.st + i * step, to: p.st + (i + 1) * step }));
        return { jumps: js, mirror: null, result: balanceAfter(p.st, p.k, p.w), extra: [p.st], label: par(step) };
      }
      let a = p.a;
      let b = p.b;
      if (mode() === 'teilen') {
        const q = quotient(p.dd, p.dv);
        if (q === null) return { jumps: [], mirror: null, result: null, extra: [p.dd], label: '' };
        a = p.dv;
        b = q;
      }
      const js = jumps(a, b);
      const end = Math.abs(a) * b;
      const mirror = a < 0 && end !== 0 ? { from: end, to: -end } : null;
      return { jumps: js, mirror, result: a * b === 0 ? 0 : a * b, extra: [end], label: par(b, mode() === 'teilen' ? qDec(b) : 0) };
    }

    function render(): void {
      const g = surface.begin();
      const th = ctx.theme;
      const W = surface.width;
      const H = surface.height;
      const narrow = W < 560;
      const fs = narrow ? 12 : 14;
      const sc = scene();
      const R = niceRange([...sc.extra, sc.result ?? 0, ...sc.jumps.map((j) => j.to), ...(mode() === 'muster' ? patternRows(p.b, Math.max(3, p.a), Math.min(-3, p.a)).map((r) => r.value) : [])]);
      const x0 = 22;
      const x1 = W - 22;
      const px = (v: number) => x0 + ((v + R) / (2 * R)) * (x1 - x0);
      const lineY = Math.round(H * (narrow ? 0.27 : 0.3));
      const unit = (x1 - x0) / (2 * R);

      // Zahlenstrahl
      g.strokeStyle = th.axis;
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(x0 - 8, lineY);
      g.lineTo(x1 + 8, lineY);
      g.stroke();
      drawArrowHead(g, x1 + 12, lineY, 0, 9, th.axis);
      const labStep = R <= 10 ? (unit > 22 ? 1 : 2) : R <= 20 ? (unit > 14 ? 2 : 4) : unit > 8 ? 5 : 10;
      for (let v = -R; v <= R; v++) {
        const big = v % labStep === 0;
        if (!big && unit < 5) continue;
        g.strokeStyle = big ? th.axis : th.grid;
        g.lineWidth = v === 0 ? 2 : 1;
        g.beginPath();
        g.moveTo(px(v), lineY - (big ? 6 : 3));
        g.lineTo(px(v), lineY + (big ? 6 : 3));
        g.stroke();
        if (big) text(g, n(v), px(v), lineY + 16, { font: `${v === 0 ? 700 : 500} ${fs - 1}px ${th.font}`, color: v === 0 ? th.text : th.muted });
      }

      // Muster: alle Ergebnisse der Tabelle als schwache Punkte
      if (mode() === 'muster') {
        for (const r of patternRows(p.b, Math.max(3, p.a), Math.min(-3, p.a))) {
          g.fillStyle = withAlpha(th.series[r.a < 0 ? 1 : 0]!, 0.3);
          g.beginPath();
          g.arc(px(r.value), lineY, 4, 0, Math.PI * 2);
          g.fill();
        }
      }

      // Startmarke im Schuldenmodell
      if (mode() === 'schulden') {
        g.fillStyle = th.muted;
        g.beginPath();
        g.arc(px(p.st), lineY, 5, 0, Math.PI * 2);
        g.fill();
        text(g, ctx.t('before'), px(p.st), lineY + 32, { font: `600 ${fs - 1}px ${th.font}`, color: th.muted });
      }

      // Sprünge als Bögen über dem Strahl
      const faded = sc.mirror !== null;
      const jc = th.series[mode() === 'schulden' ? (p.k * p.w >= 0 ? 2 : 1) : 0]!;
      const maxH = lineY - 34;
      sc.jumps.forEach((j, i) => {
        const a = px(j.from);
        const b = px(j.to);
        const h = Math.min(maxH, 14 + Math.abs(b - a) * 0.45);
        const col = faded ? withAlpha(jc, 0.45) : jc;
        g.strokeStyle = col;
        g.lineWidth = 2.2;
        g.beginPath();
        g.moveTo(a, lineY - 2);
        g.quadraticCurveTo((a + b) / 2, lineY - 2 * h, b, lineY - 2);
        g.stroke();
        const ang = Math.atan2(h, (b - a) / 2) * (b > a ? 1 : -1);
        drawArrowHead(g, b, lineY - 2, b > a ? ang : Math.PI - ang, 9, col);
        if (i === 0 && sc.label) text(g, sc.label, (a + b) / 2, lineY - h - 12, { font: `700 ${fs}px ${th.font}`, color: col });
      });

      // Spiegelung an der Null (Gegenzahl)
      if (sc.mirror) {
        const a = px(sc.mirror.from);
        const b = px(sc.mirror.to);
        const h = Math.min(H * 0.07, 12 + Math.abs(b - a) * 0.12);
        g.strokeStyle = th.series[1]!;
        g.lineWidth = 2.2;
        g.setLineDash([6, 4]);
        g.beginPath();
        g.moveTo(a, lineY + 24);
        g.quadraticCurveTo((a + b) / 2, lineY + 24 + 2 * h, b, lineY + 24);
        g.stroke();
        g.setLineDash([]);
        const ang = Math.atan2(-h, (b - a) / 2) * (b > a ? 1 : -1);
        drawArrowHead(g, b, lineY + 24, b > a ? ang : Math.PI - ang, 9, th.series[1]!);
        text(g, ctx.t('mirror'), (a + b) / 2, lineY + 24 + h + 12, { font: `600 ${fs - 1}px ${th.font}`, color: th.series[1]! });
      }

      // Ergebnis
      if (sc.result !== null) {
        const col = sc.mirror ? th.series[1]! : mode() === 'schulden' ? th.text : th.series[0]!;
        g.fillStyle = col;
        g.beginPath();
        g.arc(px(sc.result), lineY, 6.5, 0, Math.PI * 2);
        g.fill();
        g.strokeStyle = th.bg;
        g.lineWidth = 2;
        g.stroke();
        if (mode() === 'schulden') text(g, ctx.t('after'), px(sc.result), lineY + 32, { font: `600 ${fs - 1}px ${th.font}`, color: th.text });
      }

      // Unterer Bereich: Erklärung links, Vorzeichentabelle rechts
      const top = Math.round(H * (narrow ? 0.47 : 0.52));
      const tableW = narrow ? Math.min(150, W * 0.4) : Math.min(260, W * 0.3);
      const panel = { x: 14, y: top, w: W - tableW - 40, h: H - top - 12 };
      drawPanel(g, panel, fs);
      drawSignTable(g, { x: W - tableW - 14, y: top, w: tableW, h: Math.min(H - top - 12, narrow ? 150 : 190) }, fs);
    }

    function drawPanel(g: CanvasRenderingContext2D, r: { x: number; y: number; w: number; h: number }, fs: number): void {
      const th = ctx.theme;
      const lines: { t: string; c: string; b?: boolean }[] = [];
      if (mode() === 'muster') {
        drawPattern(g, r, fs);
        return;
      }
      if (mode() === 'schulden') {
        drawCards(g, r, fs);
        return;
      }
      if (mode() === 'strahl') {
        const a = p.a;
        const b = p.b;
        lines.push({ t: a === 0 ? ctx.t('noJump') : tr('jumpsLine', { n: Math.abs(a), b: par(b) }), c: th.series[0]! });
        if (a !== 0) lines.push({ t: `${Math.abs(a)} · ${par(b)} = ${n(Math.abs(a) * b)}`, c: th.series[0]!, b: true });
        if (a !== 0) lines.push({ t: ctx.t(a < 0 ? 'negFirst' : 'posFirst'), c: a < 0 ? th.series[1]! : th.muted });
        if (a < 0) lines.push({ t: `${par(a)} · ${par(b)} = ${n(a * b)}`, c: th.series[1]!, b: true });
      } else {
        const q = quotient(p.dd, p.dv);
        lines.push({ t: `${n(p.dd)} : ${par(p.dv)} = ?`, c: th.text, b: true });
        if (p.dv === 0) {
          lines.push({ t: ctx.t('divZero'), c: th.series[1]! });
          lines.push({ t: p.dd === 0 ? ctx.t('divNoZ') : tr('divNo', { a: n(p.dd) }), c: th.muted });
        } else if (q !== null) {
          lines.push({ t: tr('ask', { b: par(p.dv), a: n(p.dd) }), c: th.muted });
          const d = qDec(q);
          lines.push({ t: tr('check', { c: par(q, d), b: par(p.dv), a: n(p.dd) }), c: th.series[0]! });
          lines.push({ t: `${n(p.dd)} : ${par(p.dv)} ${fmt.rel(q, 2)} ${n(q, d)}`, c: th.series[sign(q) < 0 ? 1 : 0]!, b: true });
        }
      }
      const lh = Math.min(fs * 2, r.h / Math.max(lines.length, 1));
      lines.forEach((l, i) => wrapText(g, l.t, r.x + 4, r.y + lh * (i + 0.5), r.w - 8, `${l.b ? 700 : 500} ${l.b ? fs + 2 : fs}px ${th.font}`, l.c));
    }

    /** Einzeiliger Text, bei Platzmangel verkleinert. */
    function wrapText(g: CanvasRenderingContext2D, t: string, x: number, y: number, maxW: number, font: string, color: string): void {
      g.font = font;
      const w = g.measureText(t).width;
      if (w > maxW) {
        const m = /(\d+)px/.exec(font);
        const size = m ? Math.max(10, Math.floor((Number(m[1]) * maxW) / w)) : 10;
        font = font.replace(/\d+px/, `${size}px`);
      }
      text(g, t, x, y, { font, color, align: 'left' });
    }

    function drawPattern(g: CanvasRenderingContext2D, r: { x: number; y: number; w: number; h: number }, fs: number): void {
      const th = ctx.theme;
      const rows = patternRows(p.b, Math.max(3, p.a), Math.min(-3, p.a));
      const rh = Math.min(fs * 1.9, r.h / rows.length);
      const size = Math.min(fs + 1, Math.floor(rh * 0.72));
      const xEq = r.x + Math.min(r.w * 0.42, 130);
      rows.forEach((row, i) => {
        const y = r.y + rh * (i + 0.5);
        const sel = row.a === p.a;
        if (sel) {
          g.fillStyle = withAlpha(th.series[row.a < 0 ? 1 : 0]!, 0.14);
          roundRect(g, r.x, y - rh / 2 + 1, Math.min(r.w, xEq - r.x + 90), rh - 2, 6);
          g.fill();
        }
        const col = row.a < 0 ? th.series[1]! : th.text;
        text(g, `${par(row.a)} · ${par(p.b)}`, xEq - 12, y, { font: `${sel ? 700 : 500} ${size}px ${th.font}`, color: col, align: 'right' });
        text(g, `= ${n(row.value)}`, xEq - 4, y, { font: `${sel ? 700 : 500} ${size}px ${th.font}`, color: col, align: 'left' });
        if (i > 0 && p.b !== 0) {
          const xs = xEq + 76;
          if (xs + 60 < r.x + r.w) {
            text(g, (p.b < 0 ? '+' : '−') + n(Math.abs(p.b)), xs + 8, y - rh / 2, { font: `600 ${size - 1}px ${th.font}`, color: th.series[2]!, align: 'left' });
          }
        }
        if (row.a === 0 && i < rows.length - 1) {
          g.strokeStyle = th.grid;
          g.lineWidth = 1;
          g.setLineDash([3, 3]);
          g.beginPath();
          g.moveTo(r.x, y + rh / 2);
          g.lineTo(Math.min(r.x + r.w, xEq + 130), y + rh / 2);
          g.stroke();
          g.setLineDash([]);
        }
      });
    }

    function drawCards(g: CanvasRenderingContext2D, r: { x: number; y: number; w: number; h: number }, fs: number): void {
      const th = ctx.theme;
      const k = p.k;
      const w = p.w;
      const head = k === 0 ? ctx.t('noCards') : tr(k > 0 ? 'add' : 'remove', { n: Math.abs(k) });
      text(g, head, r.x + 4, r.y + fs * 0.8, { font: `700 ${fs + 1}px ${th.font}`, color: k < 0 ? th.series[3]! : th.series[2]!, align: 'left' });
      const cw = Math.min(64, (r.w - 8) / Math.max(1, Math.abs(k)) - 6);
      const ch = Math.min(cw * 0.72, r.h * 0.34);
      const cy = r.y + fs * 1.8;
      const colCard = w < 0 ? th.series[1]! : w > 0 ? th.series[2]! : th.muted;
      for (let i = 0; i < Math.abs(k); i++) {
        const x = r.x + 4 + i * (cw + 6);
        g.fillStyle = withAlpha(colCard, k < 0 ? 0.08 : 0.16);
        roundRect(g, x, cy, cw, ch, 6);
        g.fill();
        g.strokeStyle = withAlpha(colCard, k < 0 ? 0.5 : 1);
        g.lineWidth = 1.5;
        g.stroke();
        text(g, tr('euro', { v: (w > 0 ? '+' : '') + n(w) }), x + cw / 2, cy + ch / 2, { font: `700 ${Math.min(fs, Math.floor(cw / 3.6))}px ${th.font}`, color: withAlpha(colCard, k < 0 ? 0.6 : 1) });
        if (k < 0) {
          g.strokeStyle = th.series[3]!;
          g.lineWidth = 2.5;
          g.beginPath();
          g.moveTo(x + 4, cy + ch - 4);
          g.lineTo(x + cw - 4, cy + 4);
          g.stroke();
        }
      }
      const d = k * w;
      const msg = d === 0 ? ctx.t('same') : tr(d > 0 ? 'better' : 'worse', { d: n(Math.abs(d)) });
      const y2 = cy + ch + fs * 1.6;
      wrapText(g, `${par(k)} · ${par(w)} = ${n(d)}`, r.x + 4, y2, r.w - 8, `700 ${fs + 2}px ${th.font}`, d < 0 ? th.series[1]! : d > 0 ? th.series[2]! : th.text);
      wrapText(g, msg, r.x + 4, y2 + fs * 1.8, r.w - 8, `500 ${fs}px ${th.font}`, th.muted);
    }

    function drawSignTable(g: CanvasRenderingContext2D, r: { x: number; y: number; w: number; h: number }, fs: number): void {
      const th = ctx.theme;
      const [x, y] = operands();
      const op = mode() === 'teilen' ? ':' : '·';
      const valid = !(mode() === 'teilen' && y === 0) && x !== 0 && y !== 0;
      const sx = sign(x);
      const sy = sign(y);
      text(g, ctx.t('table'), r.x + r.w / 2, r.y + fs * 0.7, { font: `700 ${fs}px ${th.font}`, color: th.text });
      const gy = r.y + fs * 1.6;
      const cs = Math.min((r.w - 4) / 3, (r.h - fs * 1.6) / 3);
      const gx = r.x + (r.w - 3 * cs) / 2;
      const cells = [
        ['', '+', '−'],
        ['+', '+', '−'],
        ['−', '−', '+'],
      ];
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const cx = gx + j * cs;
          const cy = gy + i * cs;
          const head = i === 0 || j === 0;
          const hit = valid && i > 0 && j > 0 && (i === 1 ? 1 : -1) === sx && (j === 1 ? 1 : -1) === sy;
          const hitRow = i > 0 && j === 0 && x !== 0 && (i === 1 ? 1 : -1) === sx;
          const hitCol = j > 0 && i === 0 && y !== 0 && (j === 1 ? 1 : -1) === sy;
          if (i === 0 && j === 0) {
            text(g, op, cx + cs / 2, cy + cs / 2, { font: `700 ${fs + 6}px ${th.font}`, color: th.muted });
            continue;
          }
          const val = cells[i]![j]!;
          const pos = val === '+';
          g.fillStyle = hit ? withAlpha(th.series[pos ? 2 : 1]!, 0.3) : head ? withAlpha(th.grid, hitRow || hitCol ? 0.9 : 0.35) : withAlpha(th.series[pos ? 2 : 1]!, 0.08);
          roundRect(g, cx + 2, cy + 2, cs - 4, cs - 4, 6);
          g.fill();
          if (hit) {
            g.strokeStyle = th.series[pos ? 2 : 1]!;
            g.lineWidth = 2.5;
            g.stroke();
          }
          text(g, val, cx + cs / 2, cy + cs / 2 + 1, { font: `700 ${Math.round(cs * 0.42)}px ${th.font}`, color: head ? th.text : th.series[pos ? 2 : 1]! });
        }
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
