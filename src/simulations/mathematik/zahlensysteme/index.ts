import { defineSimulation, roundRect, Surface, text, withAlpha } from '../../../sim-core';
import { addWritten, babylonDigits, digitChar, divisionSteps, mayaDigits, toBase, toDigits, toRoman } from './model';

const L = (de: string, en: string) => ({ de, en });
const MAX_N = 4095;

type Mode = 'stellen' | 'umrechnen' | 'rechnen' | 'kulturen';

const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const SUB = '₀₁₂₃₄₅₆₇₈₉';
const sup = (k: number) => String(k).replace(/\d/g, (d) => SUP[Number(d)]!);
const sub = (k: number) => String(k).replace(/\d/g, (d) => SUB[Number(d)]!);

/**
 * Zahlensysteme: Stellenwerttafel zu beliebiger Basis (mit Bündeln),
 * Divisionsverfahren, schriftliche Addition und Zahlschriften anderer Kulturen.
 */
export default defineSimulation({
  id: 'zahlensysteme',
  layout: { aspect: 1.6, aspectNarrow: 0.85 },
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Ansicht', 'View'),
      options: [
        { value: 'stellen', label: L('Stellenwerttafel', 'Place value table') },
        { value: 'umrechnen', label: L('Umrechnen', 'Converting') },
        { value: 'rechnen', label: L('Schriftlich addieren', 'Written addition') },
        { value: 'kulturen', label: L('Andere Kulturen', 'Other cultures') },
      ],
      default: 'stellen',
      display: 'buttons',
    },
    { key: 'n', type: 'number', label: L('Zahl (im Zehnersystem)', 'Number (in base ten)'), min: 0, max: MAX_N, step: 1, default: 11, visibleIf: (v) => v.mode !== 'rechnen' },
    { key: 'base', type: 'number', label: L('Basis', 'Base'), min: 2, max: 16, step: 1, default: 2, visibleIf: (v) => v.mode !== 'kulturen' },
    { key: 'x', type: 'number', label: L('1. Summand (im Zehnersystem)', '1st addend (in base ten)'), min: 0, max: 255, step: 1, default: 11, visibleIf: (v) => v.mode === 'rechnen' },
    { key: 'y', type: 'number', label: L('2. Summand (im Zehnersystem)', '2nd addend (in base ten)'), min: 0, max: 255, step: 1, default: 6, visibleIf: (v) => v.mode === 'rechnen' },
  ],
  hint: (v) =>
    v.mode === 'umrechnen'
      ? L('Teile immer wieder durch die Basis und notiere die Reste. Von unten nach oben gelesen ergeben sie die Zahl im neuen System.', 'Keep dividing by the base and note the remainders. Read from bottom to top, they give the number in the new system.')
      : v.mode === 'rechnen'
        ? L('Wie im Zehnersystem – nur gibt es schon einen Übertrag, sobald eine Stelle die Basis erreicht.', 'Just like in base ten – except that you carry as soon as a place reaches the base.')
        : v.mode === 'kulturen'
          ? L('Die Maya bündelten in Zwanzigern, die Babylonier in Sechzigern. Die Römer kannten gar kein Stellenwertsystem.', 'The Maya grouped in twenties, the Babylonians in sixties. The Romans had no place value system at all.')
          : L('Ist eine Stelle voll (so viele Plättchen wie die Basis), wird gebündelt: Sie werden zu einem Plättchen in der nächsten Stelle links.', 'When a place is full (as many counters as the base), you regroup: they become one counter in the next place to the left.'),
  readouts: [
    { key: 'dec', label: L('Zehnersystem', 'Base ten') },
    { key: 'rep', label: L('Darstellung', 'Representation'), spoiler: true },
    { key: 'max', label: L('Größte Zahl mit gleich vielen Stellen', 'Largest number with as many digits') },
    { key: 'sum', label: L('Summe', 'Sum'), spoiler: true },
  ],
  presets: [
    { id: 'bin11', label: L('11 im Zweiersystem', '11 in binary'), values: { mode: 'stellen', n: 11, base: 2 } },
    { id: 'hexFF', label: L('255 hexadezimal', '255 in hexadecimal'), values: { mode: 'stellen', n: 255, base: 16 } },
    { id: 'div13', label: L('13 umrechnen', 'Convert 13'), values: { mode: 'umrechnen', n: 13, base: 2 } },
    { id: 'add', label: L('1011₂ + 110₂', '1011₂ + 110₂'), values: { mode: 'rechnen', x: 11, y: 6, base: 2 } },
    { id: 'jahr', label: L('Die Zahl 2026', 'The number 2026'), values: { mode: 'kulturen', n: 2026 } },
  ],
  strings: {
    de: {
      canvas: 'Darstellung der Zahl im gewählten Stellenwertsystem: Stellenwerttafel, Divisionsverfahren, schriftliche Addition oder Zahlschriften anderer Kulturen',
      place: 'Stellenwert',
      digit: 'Ziffer',
      rest: 'Rest',
      readUp: 'von unten nach oben lesen',
      back: 'zurück:',
      carry: 'Übertrag',
      roman: 'Römisch',
      maya: 'Maya (Basis 20)',
      babylon: 'Babylonisch (Basis 60)',
      noZero: 'keine Null',
      tooBig: 'zu groß',
      maxVal: '{b}{k} − 1 = {v}',
    },
    en: {
      canvas: 'The number in the chosen place value system: place value table, repeated division, written addition or numeral systems of other cultures',
      place: 'Place value',
      digit: 'Digit',
      rest: 'remainder',
      readUp: 'read from bottom to top',
      back: 'back:',
      carry: 'carry',
      roman: 'Roman',
      maya: 'Maya (base 20)',
      babylon: 'Babylonian (base 60)',
      noZero: 'no zero',
      tooBig: 'too large',
      maxVal: '{b}{k} − 1 = {v}',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const mode = () => p.mode as Mode;
    const int = (v: number) => fmt.num(v, 0);
    const inBase = (v: number, b: number) => (b === 10 ? toBase(v, b) : `${toBase(v, b)}${sub(b)}`);

    function updateReadouts(): void {
      const show: Record<string, string | null> = {};
      if (mode() === 'rechnen') {
        show.dec = `${int(p.x)} + ${int(p.y)} = ${int(p.x + p.y)}`;
        show.sum = `${inBase(p.x, p.base)} + ${inBase(p.y, p.base)} = ${inBase(p.x + p.y, p.base)}`;
      } else if (mode() === 'kulturen') {
        show.dec = int(p.n);
        show.rep = toRoman(p.n) ?? ctx.t(p.n === 0 ? 'noZero' : 'tooBig');
      } else {
        show.dec = int(p.n);
        show.rep = inBase(p.n, p.base);
        const k = toDigits(p.n, p.base).length;
        show.max = tr('maxVal', { b: p.base, k: sup(k), v: int(p.base ** k - 1) });
      }
      for (const key of ['dec', 'rep', 'max', 'sum']) ctx.readout(key, show[key] ?? null);
    }

    /** Text, der bei Platzmangel kleiner gesetzt wird. */
    function fitText(g: CanvasRenderingContext2D, t: string, x: number, y: number, maxW: number, weight: number, size: number, color: string, align: CanvasTextAlign = 'left', min = 9): void {
      const th = ctx.theme;
      g.font = `${weight} ${size}px ${th.font}`;
      const w = g.measureText(t).width;
      const s = w > maxW ? Math.max(min, Math.floor((size * maxW) / w)) : size;
      text(g, t, x, y, { font: `${weight} ${s}px ${th.font}`, color, align });
    }

    /* ---------- Stellenwerttafel ---------- */
    function drawPlaces(g: CanvasRenderingContext2D, W: number, H: number): void {
      const th = ctx.theme;
      const b = p.base;
      const digits = toDigits(p.n, b);
      const cols = Math.max(digits.length, 4);
      const padded = [...Array(cols - digits.length).fill(-1), ...digits];
      const x0 = 14;
      const cw = Math.min(W < 560 ? 96 : 130, (W - 28) / cols);
      const left = x0 + (W - 28 - cw * cols) / 2;
      const narrow = W < 560;
      const fs = narrow ? 12 : 15;
      const rowHead = 20;
      const rowVal = 46;
      const rowDig = Math.max(56, H * 0.12);
      const top = 16;
      const boxTop = top + rowHead + rowVal + rowDig;
      const boxH = Math.max(80, H - boxTop - 74);
      const c0 = th.series[0]!;
      const c1 = th.series[1]!;
      const terms: string[] = [];
      for (let i = 0; i < cols; i++) {
        const k = cols - 1 - i;
        const x = left + i * cw;
        const d = padded[i]!;
        const used = d >= 0;
        g.fillStyle = withAlpha(c0, i % 2 === 0 ? 0.07 : 0.03);
        roundRect(g, x + 1, top, cw - 2, boxTop + boxH - top, 8);
        g.fill();
        const pw = b ** k;
        text(g, `${b}${sup(k)}`, x + cw / 2, top + rowHead / 2 + 2, { font: `700 ${fs}px ${th.font}`, color: th.muted });
        // bei schmalen Spalten versetzt, damit sich lange Stellenwerte nicht berühren
        const stagger = cw < 44 && i % 2 === 1 ? 15 : cw < 44 ? -6 : 0;
        fitText(g, int(pw), x + cw / 2, top + rowHead + rowVal / 2 + stagger, cw + 10, 600, fs, th.text, 'center', 6);
        text(g, used ? digitChar(d) : '0', x + cw / 2, top + rowHead + rowVal + rowDig / 2, { font: `800 ${Math.min(rowDig * 0.7, cw * 0.75)}px ${th.font}`, color: used ? c1 : withAlpha(th.muted, 0.35) });
        // Plättchen (Bündeln)
        if (used && d > 0) {
          const perCol = 5;
          const nCol = Math.ceil(d / perCol);
          const r = Math.max(2.5, Math.min(cw / (2.6 * Math.max(nCol, 2)), boxH / (2.6 * perCol)));
          const gx = x + cw / 2 - ((nCol - 1) * r * 2.4) / 2;
          for (let j = 0; j < d; j++) {
            const cx = gx + Math.floor(j / perCol) * r * 2.4;
            const cy = boxTop + 10 + r + (j % perCol) * r * 2.4;
            g.fillStyle = c1;
            g.beginPath();
            g.arc(cx, cy, r, 0, Math.PI * 2);
            g.fill();
          }
        }
        if (used) terms.push(`${d}·${int(pw)}`);
      }
      const sy = boxTop + boxH + 28;
      const full = `${inBase(p.n, b)} = ${terms.join(' + ')} = ${int(p.n)}`;
      g.font = `700 ${fs + 3}px ${ctx.theme.font}`;
      let ny = sy + 28;
      if (g.measureText(full).width * 0.7 > W - 28) {
        // zu lang: auf zwei Zeilen verteilen
        const half = Math.ceil(terms.length / 2);
        fitText(g, `${inBase(p.n, b)} = ${terms.slice(0, half).join(' + ')} +`, W / 2, sy - 6, W - 28, 700, fs + 1, th.text, 'center');
        fitText(g, `${terms.slice(half).join(' + ')} = ${int(p.n)}`, W / 2, sy + 16, W - 28, 700, fs + 1, th.text, 'center');
        ny = sy + 40;
      } else fitText(g, full, W / 2, sy, W - 28, 700, fs + 3, th.text, 'center');
      const hexNote = b > 10 ? 'A = 10, B = 11, C = 12, D = 13, E = 14, F = 15' : '';
      if (hexNote) fitText(g, hexNote, W / 2, ny, W - 28, 500, fs, th.muted, 'center');
    }

    /* ---------- Divisionsverfahren ---------- */
    function drawDivision(g: CanvasRenderingContext2D, W: number, H: number): void {
      const th = ctx.theme;
      const b = p.base;
      const steps = divisionSteps(p.n, b);
      const narrow = W < 560;
      const lh = Math.min(38, (H - 110) / (steps.length + 1));
      const fs = Math.max(11, Math.min(narrow ? 16 : 20, Math.floor(lh * 0.6)));
      const xEq = narrow ? W * 0.52 : W * 0.38;
      const xRest = xEq + (narrow ? W * 0.26 : 150);
      const top = 26;
      text(g, ctx.t('rest'), xRest, top, { font: `600 ${fs - 2}px ${th.font}`, color: th.muted });
      steps.forEach((s, i) => {
        const y = top + lh * (i + 1);
        text(g, `${int(s.n)} : ${b} =`, xEq - 8, y, { font: `600 ${fs}px ${th.font}`, color: th.text, align: 'right' });
        text(g, int(s.q), xEq + 4, y, { font: `600 ${fs}px ${th.font}`, color: th.text, align: 'left' });
        g.fillStyle = withAlpha(th.series[1]!, 0.14);
        roundRect(g, xRest - fs * 0.9, y - lh * 0.42, fs * 1.8, lh * 0.84, 6);
        g.fill();
        text(g, digitChar(s.r), xRest, y, { font: `800 ${fs + 2}px ${th.font}`, color: th.series[1]! });
      });
      // Pfeil nach oben
      const ax = xRest + fs * 1.6;
      const yTop = top + lh;
      const yBot = top + lh * steps.length;
      g.strokeStyle = th.series[1]!;
      g.lineWidth = 2.5;
      g.beginPath();
      g.moveTo(ax, yBot + 6);
      g.lineTo(ax, yTop - 6);
      g.stroke();
      g.fillStyle = th.series[1]!;
      g.beginPath();
      g.moveTo(ax, yTop - 14);
      g.lineTo(ax - 6, yTop - 3);
      g.lineTo(ax + 6, yTop - 3);
      g.closePath();
      g.fill();
      if (!narrow) text(g, ctx.t('readUp'), ax + 12, (yTop + yBot) / 2, { font: `500 ${fs - 4}px ${th.font}`, color: th.series[1]!, align: 'left' });
      const ry = yBot + lh + 14;
      fitText(g, `${int(p.n)} = ${inBase(p.n, b)}`, W / 2, ry, W - 28, 800, fs + 4, th.series[1]!, 'center');
      const digits = toDigits(p.n, b);
      const back = digits.map((d, i) => `${digitChar(d)}·${b}${sup(digits.length - 1 - i)}`).join(' + ');
      fitText(g, `${ctx.t('back')} ${inBase(p.n, b)} = ${back} = ${int(p.n)}`, W / 2, ry + fs + 16, W - 28, 500, fs - 2, th.muted, 'center');
    }

    /* ---------- schriftliche Addition ---------- */
    function drawAddition(g: CanvasRenderingContext2D, W: number, H: number): void {
      const th = ctx.theme;
      const b = p.base;
      const a = addWritten(p.x, p.y, b);
      const len = a.sum.length;
      const cw = Math.min(64, (W - 80) / (len + 1));
      const fs = Math.min(34, cw * 0.62);
      const right = W / 2 + ((len + 1) * cw) / 2;
      const colX = (i: number) => right - (len - i) * cw + cw / 2;
      const top = Math.max(30, H * 0.14);
      const lh = Math.min(H * 0.17, fs * 1.9);
      const lead = (d: number[]) => {
        const k = d.findIndex((v) => v !== 0);
        return k < 0 ? d.length - 1 : k;
      };
      const row = (d: number[], y: number, color: string, weight = 700) => {
        const s = lead(d);
        d.forEach((v, i) => {
          if (i >= s) text(g, digitChar(v), colX(i), y, { font: `${weight} ${fs}px ${th.font}`, color });
        });
      };
      row(a.x, top + lh * 0.5, th.text);
      text(g, '+', colX(0) - cw, top + lh * 1.5, { font: `700 ${fs}px ${th.font}`, color: th.text });
      row(a.y, top + lh * 1.5, th.text);
      // Überträge
      a.carry.forEach((c, i) => {
        if (c) text(g, '1', colX(i) - cw * 0.3, top + lh * 2.15, { font: `700 ${Math.round(fs * 0.5)}px ${th.font}`, color: th.series[3]! });
      });
      text(g, ctx.t('carry'), colX(0) - cw * 1.2, top + lh * 2.15, { font: `600 ${Math.max(10, Math.round(fs * 0.36))}px ${th.font}`, color: th.series[3]!, align: 'right' });
      g.strokeStyle = th.text;
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(colX(0) - cw * 1.4, top + lh * 2.45);
      g.lineTo(colX(len - 1) + cw * 0.5, top + lh * 2.45);
      g.stroke();
      row(a.sum, top + lh * 3, th.series[1]!, 800);
      // Basis anzeigen
      text(g, sub(b), colX(len - 1) + cw * 0.62, top + lh * 3 + fs * 0.25, { font: `600 ${Math.round(fs * 0.55)}px ${th.font}`, color: th.muted, align: 'left' });
      fitText(g, `${int(p.x)} + ${int(p.y)} = ${int(p.x + p.y)}`, W / 2, Math.min(H - 20, top + lh * 4.2), W - 28, 500, 15, th.muted, 'center');
    }

    /* ---------- andere Kulturen ---------- */
    function drawCultures(g: CanvasRenderingContext2D, W: number, H: number): void {
      const th = ctx.theme;
      const narrow = W < 560;
      const fs = narrow ? 12 : 14;
      const n = p.n;
      const c0 = th.series[0]!;
      const c3 = th.series[3]!;
      const panels = narrow
        ? [
            { x: 10, y: 8, w: W - 20, h: H * 0.2 },
            { x: 10, y: 8 + H * 0.22, w: (W - 30) / 2, h: H * 0.76 },
            { x: 20 + (W - 30) / 2, y: 8 + H * 0.22, w: (W - 30) / 2, h: H * 0.76 },
          ]
        : [
            { x: 10, y: 10, w: W * 0.3, h: H - 20 },
            { x: 20 + W * 0.3, y: 10, w: W * 0.3, h: H - 20 },
            { x: 30 + W * 0.6, y: 10, w: W * 0.4 - 40, h: H - 20 },
          ];
      const titles = [ctx.t('roman'), ctx.t('maya'), ctx.t('babylon')];
      panels.forEach((r, i) => {
        g.fillStyle = withAlpha(c0, 0.05);
        roundRect(g, r.x, r.y, r.w, r.h, 10);
        g.fill();
        text(g, titles[i]!, r.x + r.w / 2, r.y + 16, { font: `700 ${fs}px ${th.font}`, color: th.muted });
      });
      // Römisch
      const R = panels[0]!;
      const rom = toRoman(n);
      fitText(g, rom ?? ctx.t(n === 0 ? 'noZero' : 'tooBig'), R.x + R.w / 2, R.y + R.h / 2 + 8, R.w - 20, 800, rom ? Math.min(46, R.h * 0.4) : fs + 2, rom ? c0 : th.muted, 'center');
      // Maya: Stellen untereinander, höchste oben
      const M = panels[1]!;
      const md = mayaDigits(n);
      const lvlH = Math.min(70, (M.h - 40) / md.length);
      const unit = Math.min(lvlH / 5.5, M.w / 9);
      md.forEach((d, i) => {
        const cy = M.y + 34 + lvlH * i;
        const cx = M.x + M.w / 2;
        const k = md.length - 1 - i;
        text(g, `·20${sup(k)}`, M.x + M.w - 6, cy + lvlH / 2, { font: `500 ${fs - 2}px ${th.font}`, color: th.muted, align: 'right' });
        if (d.zero) {
          g.strokeStyle = c3;
          g.lineWidth = 2;
          g.beginPath();
          g.ellipse(cx - unit, cy + lvlH / 2, unit * 2.2, unit * 1.1, 0, 0, Math.PI * 2);
          g.stroke();
          g.beginPath();
          g.moveTo(cx - unit * 3, cy + lvlH / 2);
          g.quadraticCurveTo(cx - unit, cy + lvlH / 2 - unit, cx + unit, cy + lvlH / 2);
          g.stroke();
          return;
        }
        const rows = (d.dots > 0 ? 1 : 0) + d.bars;
        let y = cy + lvlH / 2 - (rows * unit * 1.3) / 2 + unit * 0.65;
        if (d.dots > 0) {
          for (let j = 0; j < d.dots; j++) {
            g.fillStyle = c3;
            g.beginPath();
            g.arc(cx - unit + (j - (d.dots - 1) / 2) * unit * 1.25, y, unit * 0.45, 0, Math.PI * 2);
            g.fill();
          }
          y += unit * 1.3;
        }
        for (let j = 0; j < d.bars; j++) {
          g.fillStyle = c3;
          roundRect(g, cx - unit * 3.4, y - unit * 0.35, unit * 4.8, unit * 0.7, unit * 0.3);
          g.fill();
          y += unit * 1.3;
        }
      });
      // Babylonisch: Stellen nebeneinander
      const B = panels[2]!;
      const bd = babylonDigits(n);
      const gw = (B.w - 20) / bd.length;
      const s = Math.min(gw / 10, B.h / 9, 12);
      bd.forEach((d, i) => {
        const gx = B.x + 10 + gw * i;
        const cy = B.y + B.h / 2;
        const k = bd.length - 1 - i;
        text(g, `·60${sup(k)}`, gx + gw / 2, B.y + B.h - 16, { font: `500 ${fs - 2}px ${th.font}`, color: th.muted });
        if (d.tens === 0 && d.ones === 0) {
          g.strokeStyle = withAlpha(th.muted, 0.6);
          g.setLineDash([3, 3]);
          g.strokeRect(gx + gw * 0.25, cy - s * 2, gw * 0.5, s * 4);
          g.setLineDash([]);
          return;
        }
        let x = gx + gw / 2 - ((d.tens * s * 1.3 + Math.min(3, d.ones) * s * 1.2) / 2);
        g.strokeStyle = c0;
        g.fillStyle = c0;
        g.lineWidth = Math.max(1.5, s * 0.25);
        // Winkelhaken für Zehner
        for (let j = 0; j < d.tens; j++) {
          g.beginPath();
          g.moveTo(x + s, cy - s * 1.1);
          g.lineTo(x, cy);
          g.lineTo(x + s, cy + s * 1.1);
          g.stroke();
          x += s * 1.3;
        }
        // Keile für Einer, je 3 in einer Reihe
        const rowsN = Math.ceil(d.ones / 3);
        for (let j = 0; j < d.ones; j++) {
          const cx = x + (j % 3) * s * 1.2 + s * 0.5;
          const yy = cy - ((rowsN - 1) * s * 1.5) / 2 + Math.floor(j / 3) * s * 1.5;
          g.beginPath();
          g.moveTo(cx - s * 0.45, yy - s * 0.7);
          g.lineTo(cx + s * 0.45, yy - s * 0.7);
          g.lineTo(cx, yy - s * 0.2);
          g.closePath();
          g.fill();
          g.beginPath();
          g.moveTo(cx, yy - s * 0.3);
          g.lineTo(cx, yy + s * 0.6);
          g.stroke();
        }
      });
    }

    function render(): void {
      const g = surface.begin();
      const W = surface.width;
      const H = surface.height;
      if (mode() === 'umrechnen') drawDivision(g, W, H);
      else if (mode() === 'rechnen') drawAddition(g, W, H);
      else if (mode() === 'kulturen') drawCultures(g, W, H);
      else drawPlaces(g, W, H);
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
