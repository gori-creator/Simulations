import { defineSimulation, ease, prefersReducedMotion, roundRect, Surface, text, Tween, withAlpha, type Rect } from '../../../sim-core';
import {
  applySteps,
  decrementSteps,
  digitCount,
  digitsOf,
  expandedForm,
  groupDigits,
  groupName,
  incrementSteps,
  MAX_NUMBER,
  numberWords,
  PLACE_COUNT,
  placeName,
  placeShort,
  roundingPlaceName,
  pow10,
  roundingNeighbors,
  roundTo,
  wordParts,
  type CarryStep,
  type Lang,
} from './model';

const L = (de: string, en: string) => ({ de, en });

/** Dauer der Schritte in der Stellenwerttafel in ms. */
const DURATION = { add: 240, remove: 220, bundle: 900, unbundle: 900, shift: 650 } as const;
const SLOTS = 10;

type Step = CarryStep | { kind: 'shift'; place: number; dir: 1 | -1; from: number[] };
interface Running {
  step: Step;
  start: number;
  dur: number;
}

interface Column {
  place: number;
  x: number;
  w: number;
  row: number;
}

interface Geo {
  wide: boolean;
  cols: Column[];
  rowTop: number[];
  groupH: number;
  headH: number;
  frameH: number;
  digitH: number;
  btnH: number;
  gap: number;
  pitch: number;
  number: Rect;
  line: Rect;
  font: number;
}

interface Hit {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface View {
  oa: number;
  os: number;
  da: number;
  ds: number;
}

/** Hex-Farbe mit Weiß (t > 0) oder Schwarz (t < 0) mischen. */
function shade(hex: string, t: number): string {
  const m = /^#([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return hex;
  const v = parseInt(m[1]!, 16);
  const target = t > 0 ? 255 : 0;
  const k = Math.abs(t);
  const c = [(v >> 16) & 255, (v >> 8) & 255, v & 255].map((x) => Math.round(x + (target - x) * k));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Stellenwertsystem und Runden: Stellenwerttafel mit Plättchen (Bündeln und
 * Entbündeln), Zahlwort in Dreiergruppen und ein Zahlenstrahl mit Lupe, an dem
 * auf eine wählbare Stelle gerundet wird.
 */
export default defineSimulation({
  id: 'stellenwerte',
  dragHint: true,
  layout: { aspect: 1.5, aspectNarrow: 0.5 },
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    { key: 'n', type: 'number', label: L('Zahl', 'Number'), min: 0, max: MAX_NUMBER, step: 1, default: 4253718 },
    {
      key: 'r',
      type: 'number',
      label: L('Runden auf', 'Round to the nearest'),
      help: L('Tipp: Tippe auch auf eine Spaltenüberschrift der Stellenwerttafel.', 'Tip: you can also tap a column heading in the place value chart.'),
      min: 1,
      max: 11,
      step: 1,
      default: 3,
      display: (v, lang) => roundingPlaceName(v, lang as Lang),
    },
    {
      key: 'show',
      type: 'boolean',
      label: L('Gerundete Zahl sofort zeigen', 'Show the rounded number right away'),
      help: L('Ausgeschaltet erscheint das Ergebnis erst nach „Runden“.', 'When off, the result only appears after “Round”.'),
      default: true,
    },
    { key: 'words', type: 'boolean', group: 'view', label: L('Zahlwort anzeigen', 'Show the number in words'), default: true },
  ],
  actions: [
    { id: 'round', label: L('Runden', 'Round'), primary: true },
    { id: 'times10', label: L('· 10', '× 10') },
    { id: 'div10', label: L(': 10', '÷ 10') },
    { id: 'random', label: L('Zufallszahl', 'Random number') },
  ],
  readouts: [
    { key: 'number', label: L('Zahl', 'Number') },
    { key: 'words', label: L('In Worten', 'In words'), spoiler: true },
    { key: 'expanded', label: L('Zerlegung in Stellenwerte', 'Expanded form') },
    { key: 'neighbors', label: L('Nachbarzahlen', 'Neighbouring numbers') },
    { key: 'rounded', label: L('Gerundet', 'Rounded'), spoiler: true },
  ],
  presets: [
    { id: 'start', label: L('Vier Millionen …', 'Four million …'), values: {} },
    { id: 'million', label: L('Kurz vor einer Million', 'Just below a million'), values: { n: 999999, r: 5 } },
    { id: 'mid', label: L('Genau in der Mitte', 'Exactly halfway'), values: { n: 4253500, r: 3 } },
    { id: 'carry', label: L('Aufrunden mit Übertrag', 'Rounding up with carrying'), values: { n: 2996481, r: 4 } },
    { id: 'billion', label: L('Eine Milliarde', 'A billion (10⁹)'), values: { n: 1000000000, r: 8 } },
    { id: 'tens', label: L('Runden auf Zehner', 'Rounding to tens'), values: { n: 347, r: 1 } },
  ],
  strings: {
    de: {
      canvas: 'Stellenwerttafel mit Plättchen und Ziffern, die Zahl in Worten und ein Zahlenstrahl mit Lupe zum Runden',
      roundTo: 'Runden auf {place}',
      down: '← abrunden',
      up: 'aufrunden →',
      mid: 'Mitte',
      bundle: 'Bündeln: 10 {a} = 1 {b}',
      unbundle: 'Entbündeln: 1 {a} = 10 {b}',
      value: '{d} {p} = {v}',
      full: 'Mehr als 9 Plättchen: bündeln!',
      rule: '· Die {place}ziffer {d} entscheidet.',
    },
    en: {
      canvas: 'Place value chart with counters and digits, the number in words and a number line with a magnifier for rounding',
      roundTo: 'Rounding to the nearest {place}',
      down: '← round down',
      up: 'round up →',
      mid: 'halfway',
      bundle: 'Regroup: 10 {a} = 1 {b}',
      unbundle: 'Exchange: 1 {a} = 10 {b}',
      value: '{d} {p} = {v}',
      full: 'More than 9 counters: regroup!',
      rule: '· The {place} digit {d} decides.',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const lang = ctx.lang as Lang;
    const tr = (key: string, vars: Record<string, string | number>) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const reduced = prefersReducedMotion();
    /** Gegliederte Zahl für die Zeichenfläche (normales Leerzeichen ist dort besser sichtbar). */
    const gd = (value: number) => groupDigits(value, lang).replace(/\u202f/g, ' ');

    /* ---------- Zustand der Plättchen-Animation ---------- */
    let base = digitsOf(p.n);
    let queue: Step[] = [];
    let running: Running | null = null;
    /** Erwarteter Wert nach eigenen Schritten (dann kein Zurücksetzen in `update`). */
    let expected: number | null = null;
    const presence: number[][] = Array.from({ length: PLACE_COUNT }, (_, k) => Array.from({ length: SLOTS }, (_, i) => (i < base[k]! ? 1 : 0)));
    const roll = Array.from({ length: PLACE_COUNT }, () => ({ from: '', to: '', start: -1e9, dir: 1 }));
    let lastFrame = performance.now();

    /* ---------- Zahlenstrahl ---------- */
    let view: View = targetView();
    let viewFrom: View = view;
    const viewTween = new Tween(520, ease.inOutCubic);
    /** Bogen von der Zahl zur gerundeten Zahl: Start (ms) und Dauer. */
    const SLIDE = reduced ? 0 : 800;
    let slideStart = -1e9;
    const slideU = (now: number) => (SLIDE <= 0 ? 1 : clamp((now - slideStart) / SLIDE, 0, 1));
    let revealed = p.show;
    /** Nach „Runden“ erscheint das Ergebnis erst, wenn der Bogen angekommen ist. */
    let revealAt = 0;
    let dragging = false;
    let dragView: View | null = null;

    /* ---------- Zeiger ---------- */
    let hits: Hit[] = [];
    let hover: string | null = null;
    let focus = -1;

    const groupColor = (group: number) => {
      const s = ctx.theme.series;
      return [s[0], s[2], s[3], s[4], s[1]][group] ?? s[0]!;
    };
    const accent = () => ctx.theme.series[1]!;

    function targetView(): View {
      const r = p.r;
      const unit = pow10(r);
      const big = pow10(r + 1);
      return { oa: Math.floor(p.n / big) * big, os: big, da: Math.floor(p.n / unit) * unit, ds: unit };
    }

    function currentView(): View {
      if (dragging && dragView) return dragView;
      if (!viewTween.running) return view;
      const t = viewTween.value;
      const n = p.n;
      const mix = (a0: number, s0: number, a1: number, s1: number): [number, number] => {
        const s = Math.exp(lerp(Math.log(s0), Math.log(s1), t));
        const f = lerp((n - a0) / s0, (n - a1) / s1, t);
        return [n - f * s, s];
      };
      const [oa, os] = mix(viewFrom.oa, viewFrom.os, view.oa, view.os);
      const [da, ds] = mix(viewFrom.da, viewFrom.ds, view.da, view.ds);
      return { oa, os, da, ds };
    }

    function retarget(animate: boolean): void {
      const next = targetView();
      if (next.oa === view.oa && next.os === view.os && next.da === view.da && next.ds === view.ds) return;
      viewFrom = currentView();
      view = next;
      if (animate && !reduced) viewTween.play();
      else viewTween.finish();
    }

    function startSlide(): void {
      slideStart = performance.now() + (viewTween.running ? 520 * (1 - viewTween.t) : 0);
    }

    /* ---------- Geometrie ---------- */
    function geometry(): Geo {
      const W = surface.width;
      const H = surface.height;
      const wide = W >= 600;
      if (wide) {
        const pad = 10;
        const gapX = 10;
        const colW = (W - pad * 2 - gapX * 3) / PLACE_COUNT;
        const groupH = clamp(H * 0.042, 20, 30);
        const headH = clamp(H * 0.037, 18, 26);
        const pitch = clamp(Math.min(colW * 0.36, (H * 0.43 - groupH - headH - 80) / 5.5), 10, 30);
        const frameH = pitch * 5.5;
        const digitH = clamp(pitch * 2.05, 30, 60);
        const btnH = clamp(pitch * 1.35, 24, 36);
        const gap = 4;
        const cols: Column[] = [];
        for (let place = 0; place < PLACE_COUNT; place++) {
          const i = PLACE_COUNT - 1 - place;
          cols.push({ place, x: pad + i * colW + Math.floor(i / 3) * gapX, w: colW, row: 0 });
        }
        const tableBottom = 8 + groupH + headH + frameH + digitH + btnH + gap * 4;
        const numberH = clamp(H * 0.15, 64, 120);
        const number: Rect = { x: pad, y: tableBottom + 4, w: W - pad * 2, h: numberH };
        const line: Rect = { x: pad, y: number.y + numberH + 4, w: W - pad * 2, h: H - (number.y + numberH + 4) - 8 };
        return { wide, cols, rowTop: [8], groupH, headH, frameH, digitH, btnH, gap, pitch, number, line, font: clamp(W / 62, 12, 18) };
      }
      const pad = 8;
      const gapX = 8;
      const colW = (W - pad * 2 - gapX) / 6;
      const groupH = 18;
      const headH = 16;
      const pitch = clamp(Math.min(colW * 0.27, (H * 0.26 - 90) / 5.5), 9, 16);
      const frameH = pitch * 5.5;
      const digitH = clamp(pitch * 2.5, 28, 40);
      const btnH = 26;
      const gap = 3;
      const rowH = groupH + headH + frameH + digitH + btnH + gap * 4;
      const cols: Column[] = [];
      for (let place = 0; place < PLACE_COUNT; place++) {
        const row = place >= 6 ? 0 : 1;
        const i = 5 - (place % 6);
        cols.push({ place, x: pad + i * colW + Math.floor(i / 3) * gapX, w: colW, row });
      }
      const rowTop = [6, 6 + rowH + 6];
      const tableBottom = rowTop[1]! + rowH;
      const numberH = clamp(H * 0.14, 70, 110);
      const number: Rect = { x: pad, y: tableBottom + 4, w: W - pad * 2, h: numberH };
      const line: Rect = { x: pad, y: number.y + numberH + 4, w: W - pad * 2, h: H - (number.y + numberH + 4) - 6 };
      return { wide, cols, rowTop, groupH, headH, frameH, digitH, btnH, gap, pitch, number, line, font: 12 };
    }

    /** y-Position eines Teils einer Spalte. */
    function partY(geo: Geo, col: Column, part: 'group' | 'head' | 'frame' | 'digit' | 'btn'): number {
      let y = geo.rowTop[col.row]!;
      if (part === 'group') return y;
      y += geo.groupH + geo.gap;
      if (part === 'head') return y;
      y += geo.headH + geo.gap;
      if (part === 'frame') return y;
      y += geo.frameH + geo.gap;
      if (part === 'digit') return y;
      return y + geo.digitH + geo.gap;
    }

    /** Mittelpunkt des Platzes i (0…9) im Zehnerfeld der Spalte: links von unten nach oben, dann rechts. */
    function slotPos(geo: Geo, place: number, i: number): [number, number] {
      const col = geo.cols[place]!;
      const cx = col.x + col.w / 2;
      const top = partY(geo, col, 'frame');
      const side = i < 5 ? -1 : 1;
      const row = i % 5;
      return [cx + side * geo.pitch * 0.55, top + geo.frameH - geo.pitch * 0.75 - row * geo.pitch];
    }

    function frameCenter(geo: Geo, place: number): [number, number] {
      const col = geo.cols[place]!;
      return [col.x + col.w / 2, partY(geo, col, 'frame') + geo.frameH / 2];
    }

    /* ---------- Schritte (Bündeln / Entbündeln) ---------- */
    function durationOf(step: Step): number {
      if (reduced) return 0;
      const speed = 1 + Math.min(3, queue.length * 0.6);
      return DURATION[step.kind] / speed;
    }

    function enqueue(steps: Step[]): void {
      if (reduced) {
        for (const s of steps) finishStep(s);
        return;
      }
      queue.push(...steps);
      if (!running) startNext(performance.now());
      ctx.requestRender();
    }

    function startNext(at: number): void {
      const step = queue.shift();
      running = step ? { step, start: at, dur: durationOf(step) } : null;
      if (running?.step.kind === 'unbundle') {
        const k = running.step.place;
        presence[k]![base[k]! - 1] = 0;
      }
    }

    function finishStep(step: Step): void {
      if (step.kind === 'shift') {
        const value = fromDigitsSafe(step.from);
        base = digitsOf(step.dir > 0 ? value * 10 : value / 10);
        for (let k = 0; k < PLACE_COUNT; k++) for (let i = 0; i < SLOTS; i++) presence[k]![i] = i < base[k]! ? 1 : 0;
        return;
      }
      const k = step.place;
      if (step.kind === 'bundle') {
        for (let i = 0; i < SLOTS; i++) presence[k]![i] = 0;
        presence[k + 1]![base[k + 1]!] = 1;
      } else if (step.kind === 'unbundle') {
        for (let i = 0; i < SLOTS; i++) presence[k - 1]![i] = 1;
      }
      base = applySteps(base, [step]);
    }

    function fromDigitsSafe(d: readonly number[]): number {
      return d.reduce((s, x, k) => s + x * pow10(k), 0);
    }

    function advance(now: number): void {
      while (running && now >= running.start + running.dur) {
        const end = running.start + running.dur;
        finishStep(running.step);
        startNext(end);
      }
    }

    function resetAnimation(): void {
      queue = [];
      running = null;
      expected = null;
      base = digitsOf(p.n);
    }

    /** Ziel-Anzahl der Plättchen je Spalte (für das sanfte Ein- und Ausblenden). */
    function targetCounts(): number[] {
      const c = base.slice();
      if (running) {
        const s = running.step;
        if (s.kind === 'add') c[s.place] = c[s.place]! + 1;
        else if (s.kind === 'remove') c[s.place] = c[s.place]! - 1;
        else if (s.kind === 'unbundle') c[s.place] = c[s.place]! - 1;
      }
      return c;
    }

    /** Angezeigte Ziffern (während eines Schritts auch „10“). */
    function shownDigits(now: number): number[] {
      const c = base.slice();
      if (!running) return c;
      const s = running.step;
      const u = running.dur > 0 ? (now - running.start) / running.dur : 1;
      if (s.kind === 'add' && u > 0.3) c[s.place] = c[s.place]! + 1;
      else if (s.kind === 'remove' && u > 0.3) c[s.place] = c[s.place]! - 1;
      else if (s.kind === 'bundle' && u > 0.45) c[s.place] = 0;
      else if (s.kind === 'unbundle') {
        if (u > 0.1) c[s.place] = c[s.place]! - 1;
        if (u > 0.55) c[s.place - 1] = c[s.place - 1]! + 10;
      }
      return c;
    }

    function step(place: number, delta: 1 | -1): void {
      if (ctx.locked) return;
      // Wenn noch Schritte laufen, von deren Endstand aus weiterrechnen
      const pending = [...(running ? [running.step] : []), ...queue];
      const carries = pending.filter((s): s is CarryStep => s.kind !== 'shift');
      if (carries.length !== pending.length) return;
      const after = applySteps(base, carries);
      const steps = delta > 0 ? incrementSteps(after, place) : decrementSteps(after, place);
      if (!steps) return;
      const value = fromDigitsSafe(applySteps(after, steps));
      expected = value;
      enqueue(steps);
      ctx.set({ n: value });
    }

    function shift(dir: 1 | -1): void {
      if (ctx.locked) return;
      const value = dir > 0 ? p.n * 10 : p.n / 10;
      if (value > MAX_NUMBER || !Number.isInteger(value) || p.n === 0) return;
      resetAnimation();
      expected = value;
      enqueue([{ kind: 'shift', place: 0, dir, from: digitsOf(p.n) }]);
      ctx.set({ n: value });
    }

    /* ---------- Ergebnisse ---------- */
    function updateReadouts(): void {
      const n = p.n;
      ctx.readout('number', `${groupDigits(n, lang)} (${digitCount(n)} ${lang === 'de' ? (digitCount(n) === 1 ? 'Stelle' : 'Stellen') : digitCount(n) === 1 ? 'digit' : 'digits'})`);
      ctx.readout('words', numberWords(n, lang, true));
      const parts = expandedForm(n);
      if (parts.length === 0) ctx.readout('expanded', '0');
      else {
        const short = parts.map((q) => `${q.digit} ${placeShort(q.place, lang)}`).join(' + ');
        const long = parts.map((q) => groupDigits(q.value, lang)).join(' + ');
        ctx.readout('expanded', { html: `${short}<br>= ${long}` });
      }
      const nb = roundingNeighbors(n, p.r);
      const and = lang === 'de' ? 'und' : 'and';
      ctx.readout('neighbors', `${groupDigits(nb.lower, lang)} ${and} ${groupDigits(nb.upper, lang)} (${ctx.t('mid')}: ${groupDigits(nb.mid, lang)})`);
      ctx.readout('rounded', `${groupDigits(n, lang)} ≈ ${groupDigits(roundTo(n, p.r), lang)}`);
      ctx.setAction('div10', { enabled: n % 10 === 0 && n > 0 && !ctx.locked });
      ctx.setAction('times10', { enabled: n * 10 <= MAX_NUMBER && n > 0 && !ctx.locked });
      ctx.setAction('random', { enabled: !ctx.locked });
    }

    /* ---------- Zeichnen: Stellenwerttafel ---------- */
    function drawCounter(x: number, y: number, r: number, color: string, scale = 1): void {
      const g = surface.g;
      const rr = r * scale;
      if (rr < 0.4) return;
      g.fillStyle = ctx.theme.dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.18)';
      g.beginPath();
      g.ellipse(x, y + rr * 0.28, rr * 0.98, rr * 0.92, 0, 0, Math.PI * 2);
      g.fill();
      const grad = g.createRadialGradient(x - rr * 0.38, y - rr * 0.42, rr * 0.08, x, y, rr);
      grad.addColorStop(0, shade(color, 0.62));
      grad.addColorStop(0.55, color);
      grad.addColorStop(1, shade(color, -0.32));
      g.fillStyle = grad;
      g.beginPath();
      g.arc(x, y, rr, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = shade(color, -0.4);
      g.globalAlpha = 0.35;
      g.lineWidth = 1;
      g.stroke();
      g.globalAlpha = 1;
    }

    function drawTable(geo: Geo, now: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const digits = shownDigits(now);
      const shiftStep = running?.step.kind === 'shift' ? running.step : null;
      let highest = 0;
      for (let k = 0; k < PLACE_COUNT; k++) if (digits[k]! > 0) highest = k;
      if (shiftStep) {
        const before = shiftStep.from;
        for (let k = 0; k < PLACE_COUNT; k++) if (before[k]! > 0) highest = Math.max(highest, Math.min(PLACE_COUNT - 1, k + Math.max(0, shiftStep.dir)));
      }
      const r = p.r;
      const fontBig = Math.round(geo.digitH * 0.62);

      // Gruppen-Bänder
      for (let group = 0; group < 4; group++) {
        const right = geo.cols[group * 3]!;
        const left = geo.cols[group * 3 + 2]!;
        const y = geo.rowTop[left.row]!;
        const color = groupColor(group);
        const active = highest >= group * 3;
        g.fillStyle = withAlpha(color, active ? 0.16 : 0.07);
        roundRect(g, left.x + 1, y, right.x + right.w - left.x - 2, geo.groupH, 7);
        g.fill();
        text(g, groupName(group, lang), (left.x + right.x + right.w) / 2, y + geo.groupH / 2 + 0.5, {
          font: `700 ${geo.wide ? clamp(geo.groupH * 0.56, 11, 15) : 11}px ${theme.font}`,
          color: active ? shade(color, theme.dark ? 0.15 : -0.15) : withAlpha(theme.muted, 0.8),
        });
      }

      // Rundungsstelle hervorheben
      const rc = geo.cols[r]!;
      const ry0 = partY(geo, rc, 'head') - 2;
      const ry1 = partY(geo, rc, 'btn') + geo.btnH;
      g.fillStyle = withAlpha(accent(), theme.dark ? 0.12 : 0.08);
      roundRect(g, rc.x + 2, ry0, rc.w - 4, ry1 - ry0, 9);
      g.fill();
      g.strokeStyle = withAlpha(accent(), 0.55);
      g.lineWidth = 1.5;
      g.stroke();

      for (const col of geo.cols) {
        const k = col.place;
        const cx = col.x + col.w / 2;
        const color = groupColor(Math.floor(k / 3));
        const headY = partY(geo, col, 'head');
        const isRound = k === r;
        const isDeciding = k === r - 1;
        const hovered = hover === `head:${k}`;
        text(g, placeShort(k, lang), cx, headY + geo.headH / 2 + 1, {
          font: `${isRound ? 800 : 700} ${geo.wide ? clamp(geo.headH * 0.62, 11, 16) : 11}px ${theme.font}`,
          color: isRound ? accent() : hovered ? theme.text : theme.muted,
        });

        // Zehnerfeld
        const fy = partY(geo, col, 'frame');
        const fw = geo.pitch * 2.25;
        g.fillStyle = withAlpha(theme.text, theme.dark ? 0.05 : 0.035);
        roundRect(g, cx - fw / 2, fy, fw, geo.frameH, geo.pitch * 0.45);
        g.fill();
        g.strokeStyle = withAlpha(theme.text, 0.1);
        g.lineWidth = 1;
        g.stroke();
        for (let i = 0; i < SLOTS; i++) {
          const [sx, sy] = slotPos(geo, k, i);
          g.beginPath();
          g.arc(sx, sy, geo.pitch * 0.36, 0, Math.PI * 2);
          g.strokeStyle = withAlpha(theme.text, 0.09);
          g.stroke();
        }
        if (!shiftStep) {
          const special = running && ((running.step.kind === 'bundle' && running.step.place === k) || (running.step.kind === 'unbundle' && running.step.place - 1 === k && (now - running.start) / running.dur > 0.5));
          if (!special) {
            for (let i = 0; i < SLOTS; i++) {
              const pr = presence[k]![i]!;
              if (pr <= 0.01) continue;
              const [sx, sy] = slotPos(geo, k, i);
              drawCounter(sx, sy, geo.pitch * 0.4, color, ease.outBack(Math.min(1, pr)));
            }
          }
        }

        // Ziffernplättchen
        const dy = partY(geo, col, 'digit');
        const tw = Math.min(col.w * 0.84, geo.pitch * 3.2);
        const tx = cx - tw / 2;
        const th = geo.digitH;
        const d = digits[k]!;
        const leading = k > highest;
        g.save();
        if (leading) {
          g.setLineDash([4, 4]);
          g.strokeStyle = withAlpha(theme.text, 0.2);
          g.lineWidth = 1.2;
          roundRect(g, tx, dy, tw, th, 8);
          g.stroke();
        } else {
          g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.14)';
          g.shadowBlur = 6;
          g.shadowOffsetY = 2;
          g.fillStyle = theme.bg;
          roundRect(g, tx, dy, tw, th, 8);
          g.fill();
          g.shadowColor = 'transparent';
          g.fillStyle = withAlpha(theme.text, theme.dark ? 0.07 : 0.015);
          g.fill();
          g.strokeStyle = isDeciding ? accent() : withAlpha(color, focus === k || hover === `tile:${k}` ? 0.9 : 0.45);
          g.lineWidth = isDeciding || focus === k ? 2.2 : 1.3;
          g.stroke();
          // farbige Kante oben (Gruppe)
          g.save();
          roundRect(g, tx, dy, tw, th, 8);
          g.clip();
          g.fillStyle = withAlpha(color, 0.85);
          g.fillRect(tx, dy, tw, 3);
          g.restore();
        }
        g.restore();
        if (!shiftStep) {
          const label = leading ? '' : String(d);
          drawRolling(k, label, cx, dy, tw, th, fontBig, d >= 10 ? accent() : theme.text, now);
        }

        // Knöpfe − und +
        const by = partY(geo, col, 'btn') + 3;
        const bh = geo.btnH - 6;
        const bw = (tw - 4) / 2;
        const canMinus = p.n >= pow10(k) && !ctx.locked;
        const canPlus = p.n + pow10(k) <= MAX_NUMBER && !ctx.locked;
        const buttons: [string, number, boolean, string][] = [
          [`minus:${k}`, tx, canMinus, '−'],
          [`plus:${k}`, tx + bw + 4, canPlus, '+'],
        ];
        for (const [id, bx, enabled, sym] of buttons) {
          const hot = hover === id && enabled;
          g.fillStyle = hot ? withAlpha(color, 0.3) : withAlpha(theme.text, theme.dark ? 0.09 : 0.06);
          roundRect(g, bx, by, bw, bh, Math.min(7, bh / 2));
          g.fill();
          if (enabled) {
            g.strokeStyle = hot ? withAlpha(color, 0.7) : withAlpha(theme.text, 0.14);
            g.lineWidth = 1;
            g.stroke();
          }
          text(g, sym, bx + bw / 2, by + bh / 2 + 0.5, {
            font: `700 ${geo.wide ? clamp(bh * 0.62, 13, 20) : 15}px ${theme.font}`,
            color: enabled ? (hot ? shade(color, theme.dark ? 0.2 : -0.2) : theme.text) : withAlpha(theme.muted, 0.35),
          });
          hits.push({ id, x: bx, y: by, w: bw, h: bh });
        }
        hits.push({ id: `tile:${k}`, x: tx, y: dy, w: tw, h: th });
        hits.push({ id: `tile:${k}`, x: cx - fw / 2, y: fy, w: fw, h: geo.frameH });
        hits.push({ id: `head:${k}`, x: col.x, y: headY - 2, w: col.w, h: geo.headH + 4 });
      }

      // Trennlinie rechts der Rundungsstelle
      if (r > 0) {
        const x = rc.x + rc.w + (r % 3 === 0 ? 5 : 0);
        const y0 = partY(geo, rc, 'head') - 4;
        const y1 = partY(geo, rc, 'btn') + geo.btnH + 2;
        if (geo.cols[r - 1]!.row === rc.row) {
          g.save();
          g.setLineDash([5, 4]);
          g.strokeStyle = withAlpha(accent(), 0.8);
          g.lineWidth = 2;
          g.beginPath();
          g.moveTo(x, y0);
          g.lineTo(x, y1);
          g.stroke();
          g.restore();
        }
      }

      if (shiftStep) drawShift(geo, shiftStep, now);
      else if (running) drawCarry(geo, now);
      drawTooltip(geo, digits);
    }

    /** Ziffer mit kurzer „Zählwerk“-Animation beim Wechsel. */
    function drawRolling(k: number, label: string, cx: number, y: number, w: number, h: number, size: number, color: string, now: number): void {
      const g = surface.g;
      const state = roll[k]!;
      if (label !== state.to) {
        const a = Number(state.to || '0');
        const b = Number(label || '0');
        state.from = state.to;
        state.to = label;
        state.start = reduced ? -1e9 : now;
        state.dir = b >= a ? 1 : -1;
      }
      const u = clamp((now - state.start) / 220, 0, 1);
      const font = `800 ${label.length > 1 ? size * 0.8 : size}px ${ctx.theme.font}`;
      g.save();
      roundRect(g, cx - w / 2, y, w, h, 8);
      g.clip();
      if (u < 1) {
        const e = ease.outCubic(u);
        text(g, state.from, cx, y + h / 2 + 1 - state.dir * e * h * 0.8, { font, color: withAlpha(color, 1 - e) });
        text(g, state.to, cx, y + h / 2 + 1 + state.dir * (1 - e) * h * 0.8, { font, color });
        ctx.requestRender();
      } else text(g, state.to, cx, y + h / 2 + 1, { font, color });
      g.restore();
    }

    function drawCarry(geo: Geo, now: number): void {
      if (!running) return;
      const g = surface.g;
      const s = running.step;
      if (s.kind !== 'bundle' && s.kind !== 'unbundle') return;
      const u = clamp((now - running.start) / Math.max(1, running.dur), 0, 1);
      const rad = geo.pitch * 0.4;
      if (s.kind === 'bundle') {
        const k = s.place;
        const color = groupColor(Math.floor(k / 3));
        const nextColor = groupColor(Math.floor((k + 1) / 3));
        const [fx, fy] = frameCenter(geo, k);
        const [tx, ty] = slotPos(geo, k + 1, base[k + 1]!);
        if (u < 0.45) {
          const e = ease.inOutCubic(u / 0.45);
          for (let i = 0; i < SLOTS; i++) {
            const [sx, sy] = slotPos(geo, k, i);
            drawCounter(lerp(sx, fx, e), lerp(sy, fy, e), rad, color, 1 - 0.25 * e);
          }
          // leuchtender Ring „10“
          g.strokeStyle = withAlpha(accent(), 0.6 * e);
          g.lineWidth = 2.5;
          g.beginPath();
          g.arc(fx, fy, geo.pitch * (1.6 - 0.6 * e), 0, Math.PI * 2);
          g.stroke();
        } else {
          const v = (u - 0.45) / 0.55;
          const e = ease.inOutCubic(v);
          const x = lerp(fx, tx, e);
          const y = lerp(fy, ty, e) - Math.sin(Math.PI * e) * geo.pitch * 1.2;
          const scale = v < 0.15 ? 1.5 + 0.3 * Math.sin((v / 0.15) * Math.PI) : 1.5 - 0.5 * e;
          g.save();
          g.shadowColor = withAlpha(nextColor, 0.9);
          g.shadowBlur = 14 * (1 - e);
          drawCounter(x, y, rad, nextColor, scale);
          g.restore();
        }
        bubble(geo, k, tr('bundle', { a: placeShort(k, lang), b: placeShort(k + 1, lang) }));
      } else {
        const k = s.place;
        const color = groupColor(Math.floor(k / 3));
        const prevColor = groupColor(Math.floor((k - 1) / 3));
        const [sx, sy] = slotPos(geo, k, base[k]! - 1);
        const [fx, fy] = frameCenter(geo, k - 1);
        if (u < 0.5) {
          const e = ease.inOutCubic(u / 0.5);
          drawCounter(lerp(sx, fx, e), lerp(sy, fy, e) - Math.sin(Math.PI * e) * geo.pitch * 1.2, rad, e > 0.5 ? prevColor : color, 1 + 0.5 * e);
        } else {
          const e = ease.outCubic((u - 0.5) / 0.5);
          for (let i = 0; i < SLOTS; i++) {
            const [qx, qy] = slotPos(geo, k - 1, i);
            drawCounter(lerp(fx, qx, e), lerp(fy, qy, e), rad, prevColor, 1.5 - 0.5 * e);
          }
        }
        bubble(geo, k - 1, tr('unbundle', { a: placeShort(k, lang), b: placeShort(k - 1, lang) }));
      }
    }

    /** Hinweis-Blase zwischen Spalte `place` und der Spalte links davon. */
    function bubble(geo: Geo, place: number, label: string): void {
      const g = surface.g;
      const theme = ctx.theme;
      const a = geo.cols[place]!;
      const b = geo.cols[Math.min(PLACE_COUNT - 1, place + 1)]!;
      const cx = a.row === b.row ? (a.x + b.x + b.w) / 2 : a.x + a.w / 2;
      const y = partY(geo, a, 'frame') + geo.frameH * 0.12;
      const font = `700 ${geo.wide ? 13 : 11.5}px ${theme.font}`;
      g.font = font;
      const w = g.measureText(label).width + 18;
      const x = clamp(cx - w / 2, 4, surface.width - w - 4);
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.2)';
      g.shadowBlur = 10;
      g.shadowOffsetY = 3;
      g.fillStyle = theme.text;
      roundRect(g, x, y - 13, w, 26, 13);
      g.fill();
      g.restore();
      text(g, label, x + w / 2, y + 0.5, { font, color: theme.bg });
    }

    function drawShift(geo: Geo, s: Extract<Step, { kind: 'shift' }>, now: number): void {
      if (!running) return;
      const u = ease.inOutCubic(clamp((now - running.start) / Math.max(1, running.dur), 0, 1));
      const theme = ctx.theme;
      const fontBig = Math.round(geo.digitH * 0.62);
      let highest = 0;
      for (let k = 0; k < PLACE_COUNT; k++) if (s.from[k]! > 0) highest = k;
      for (let k = 0; k <= highest; k++) {
        const to = k + s.dir;
        const d = s.from[k]!;
        const alpha = to < 0 || to >= PLACE_COUNT ? 1 - u : 1;
        if (alpha <= 0.01) continue;
        const toPlace = clamp(to, 0, PLACE_COUNT - 1);
        const color = groupColor(Math.floor((u < 0.5 ? k : toPlace) / 3));
        const g = surface.g;
        g.save();
        g.globalAlpha = alpha;
        for (let i = 0; i < d; i++) {
          const [ax, ay] = slotPos(geo, k, i);
          const [bx, by] = slotPos(geo, toPlace, i);
          drawCounter(lerp(ax, bx, u), lerp(ay, by, u) - Math.sin(Math.PI * u) * geo.pitch * 0.8, geo.pitch * 0.4, color);
        }
        const ca = geo.cols[k]!;
        const cb = geo.cols[toPlace]!;
        const x = lerp(ca.x + ca.w / 2, cb.x + cb.w / 2, u);
        const y = lerp(partY(geo, ca, 'digit'), partY(geo, cb, 'digit'), u);
        text(g, String(d), x, y + geo.digitH / 2 + 1, { font: `800 ${fontBig}px ${theme.font}`, color: theme.text });
        g.restore();
      }
      if (s.dir > 0) {
        const c0 = geo.cols[0]!;
        surface.g.save();
        surface.g.globalAlpha = u;
        text(surface.g, '0', c0.x + c0.w / 2, partY(geo, c0, 'digit') + geo.digitH / 2 + 1, { font: `800 ${fontBig}px ${theme.font}`, color: theme.text });
        surface.g.restore();
      }
    }

    function drawTooltip(geo: Geo, digits: number[]): void {
      const place = focus >= 0 ? focus : hover?.startsWith('tile:') ? Number(hover.slice(5)) : -1;
      if (place < 0 || running) return;
      let highest = 0;
      for (let k = 0; k < PLACE_COUNT; k++) if (digits[k]! > 0) highest = k;
      if (place > highest) return;
      const d = digits[place]!;
      const label = tr('value', { d, p: placeShort(place, lang), v: gd(d * pow10(place)) });
      const col = geo.cols[place]!;
      const g = surface.g;
      const theme = ctx.theme;
      const font = `700 ${geo.wide ? 13 : 11.5}px ${theme.font}`;
      g.font = font;
      const w = g.measureText(label).width + 18;
      const x = clamp(col.x + col.w / 2 - w / 2, 4, surface.width - w - 4);
      const y = partY(geo, col, 'frame') + 4;
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.2)';
      g.shadowBlur = 10;
      g.shadowOffsetY = 3;
      g.fillStyle = groupColor(Math.floor(place / 3));
      roundRect(g, x, y, w, 24, 12);
      g.fill();
      g.restore();
      text(g, label, x + w / 2, y + 12.5, { font, color: theme.dark ? '#10161f' : '#ffffff' });
    }

    /* ---------- Zeichnen: Zahl und Zahlwort ---------- */
    function drawNumber(geo: Geo): void {
      const g = surface.g;
      const theme = ctx.theme;
      const r = geo.number;
      const n = p.n;
      const digits = String(n);
      const size = geo.wide ? clamp(r.h * (p.words ? 0.42 : 0.6), 24, 52) : clamp(r.h * (p.words ? 0.32 : 0.5), 22, 34);
      g.font = `800 ${size}px ${theme.font}`;
      const adv = g.measureText('0').width;
      const sepW = lang === 'de' ? size * 0.3 : g.measureText(',').width + size * 0.04;
      const groups = Math.ceil(digits.length / 3);
      const total = digits.length * adv + (groups - 1) * sepW;
      let x = r.x + r.w / 2 - total / 2;
      const y = p.words ? r.y + size * 0.62 : r.y + r.h / 2;
      for (let i = 0; i < digits.length; i++) {
        const place = digits.length - 1 - i;
        const color = groupColor(Math.floor(place / 3));
        text(g, digits[i]!, x + adv / 2, y, { font: `800 ${size}px ${theme.font}`, color: shade(color, theme.dark ? 0.12 : -0.12) });
        x += adv;
        if (place % 3 === 0 && place > 0) {
          if (lang === 'en') text(g, ',', x + sepW / 2, y + size * 0.12, { font: `800 ${size}px ${theme.font}`, color: theme.muted });
          x += sepW;
        }
      }
      if (!p.words) return;
      drawWords({ x: r.x, y: y + size * 0.62, w: r.w, h: r.y + r.h - (y + size * 0.62) }, geo);
    }

    interface Piece {
      text: string;
      color: string;
    }
    interface Word {
      pieces: Piece[];
      /** Umbruch nach diesem Wort: Leerzeichen oder Trennstrich. */
      after: 'space' | 'hyphen';
    }

    function wordsLayout(): Word[] {
      const theme = ctx.theme;
      const words: Word[] = [];
      let current: Word = { pieces: [], after: 'space' };
      const flush = (after: 'space' | 'hyphen') => {
        if (current.pieces.length) {
          current.after = after;
          words.push(current);
        }
        current = { pieces: [], after: 'space' };
      };
      for (const part of wordParts(p.n, lang)) {
        if (part.space) flush('space');
        const color = shade(groupColor(part.group), theme.dark ? 0.15 : -0.18);
        const tokens = part.text.split(/(­| )/);
        for (const tok of tokens) {
          if (tok === '­') flush('hyphen');
          else if (tok === ' ') flush('space');
          else if (tok) current.pieces.push({ text: tok, color });
        }
      }
      flush('space');
      return words;
    }

    function drawWords(r: Rect, geo: Geo): void {
      const g = surface.g;
      const theme = ctx.theme;
      const words = wordsLayout();
      const maxLines = geo.wide ? 2 : 3;
      let size = geo.wide ? clamp(surface.width / 50, 14, 20) : 13;
      let lines: Word[][] = [];
      const widthOf = (w: Word) => w.pieces.reduce((s, q) => s + g.measureText(q.text).width, 0);
      for (; size >= 10; size -= 1) {
        g.font = `600 ${size}px ${theme.font}`;
        const space = g.measureText(' ').width;
        const hyphen = g.measureText('-').width;
        lines = [[]];
        let width = 0;
        for (const word of words) {
          const line = lines[lines.length - 1]!;
          const prev = line[line.length - 1];
          const ww = widthOf(word);
          const join = prev ? (prev.after === 'space' ? space : 0) : 0;
          if (prev && width + join + ww + (word.after === 'hyphen' ? hyphen : 0) > r.w - 12) {
            lines.push([word]);
            width = ww;
          } else {
            line.push(word);
            width += join + ww;
          }
        }
        if (lines.length <= maxLines) break;
      }
      g.font = `600 ${size}px ${theme.font}`;
      const space = g.measureText(' ').width;
      const lineH = size * 1.32;
      const top = r.y + Math.max(0, (r.h - lines.length * lineH) / 2) + lineH / 2;
      lines.slice(0, maxLines).forEach((line, li) => {
        const parts: Piece[] = [];
        line.forEach((word, wi) => {
          parts.push(...word.pieces);
          const last = wi === line.length - 1;
          if (!last && word.after === 'space') parts.push({ text: ' ', color: theme.muted });
          if (last && word.after === 'hyphen' && li < lines.length - 1) parts.push({ text: '-', color: theme.muted });
        });
        const total = parts.reduce((s, q) => s + (q.text === ' ' ? space : g.measureText(q.text).width), 0);
        let x = r.x + r.w / 2 - total / 2;
        for (const q of parts) {
          text(g, q.text, x, top + li * lineH, { font: `600 ${size}px ${theme.font}`, color: q.color, align: 'left' });
          x += q.text === ' ' ? space : g.measureText(q.text).width;
        }
      });
    }

    /* ---------- Zeichnen: Zahlenstrahl mit Lupe ---------- */
    /** Lage der beiden Zahlenstrahlen im Feld unten. */
    function lineFrame(geo: Geo): { x0: number; x1: number; yO: number; yD: number } {
      const r = geo.line;
      return {
        x0: r.x + (geo.wide ? 30 : 20),
        x1: r.x + r.w - (geo.wide ? 34 : 26),
        yO: r.y + (geo.wide ? 52 : 44),
        yD: r.y + r.h - (geo.wide ? 70 : 64),
      };
    }

    /** Zahlenstrahl-Ausschnitt [a, a + span] mit Teilstrichen, die beim Zoomen weich ein- und ausblenden. */
    function drawScale(a: number, span: number, x0: number, x1: number, y: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const W = x1 - x0;
      const xOf = (v: number) => x0 + ((v - a) / span) * W;
      g.strokeStyle = theme.axis;
      g.lineWidth = 2;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(x0 - 12, y);
      g.lineTo(x1 + 12, y);
      g.stroke();
      // Pfeilspitze: Der Zahlenstrahl geht weiter
      g.fillStyle = theme.axis;
      g.beginPath();
      g.moveTo(x1 + 20, y);
      g.lineTo(x1 + 11, y - 4.5);
      g.lineTo(x1 + 11, y + 4.5);
      g.closePath();
      g.fill();
      const top = Math.floor(Math.log10(span) + 1e-9) + 1;
      for (let pw = top; pw >= 0; pw--) {
        const unit = pow10(pw);
        const spacing = (unit / span) * W;
        if (spacing < 3.5) break;
        const t = clamp((Math.log10(spacing) - Math.log10(3.5)) / (Math.log10(70) - Math.log10(3.5)), 0, 1);
        const h = 2.5 + 8 * t;
        g.strokeStyle = withAlpha(theme.axis, 0.3 + 0.7 * t);
        g.lineWidth = t > 0.8 ? 1.6 : 1.1;
        g.beginPath();
        const first = Math.ceil((a - 1e-6) / unit) * unit;
        for (let v = first; v <= a + span + 1e-6; v += unit) {
          if (pw < top && v % (unit * 10) === 0 && ((unit * 10) / span) * W >= 3.5) continue;
          const x = xOf(v);
          g.moveTo(x, y - h);
          g.lineTo(x, y + h);
        }
        g.stroke();
      }
    }

    function pill(label: string, x: number, y: number, opts: { fill: string; color: string; size: number; align?: 'left' | 'right' | 'center' }): [number, number] {
      const g = surface.g;
      const font = `700 ${opts.size}px ${ctx.theme.font}`;
      g.font = font;
      const w = g.measureText(label).width + opts.size * 1.1;
      const h = opts.size * 1.75;
      let left = x - w / 2;
      if (opts.align === 'left') left = x;
      if (opts.align === 'right') left = x - w;
      left = clamp(left, 2, surface.width - w - 2);
      g.fillStyle = opts.fill;
      roundRect(g, left, y - h / 2, w, h, h / 2);
      g.fill();
      text(g, label, left + w / 2, y + 0.5, { font, color: opts.color });
      return [left, left + w];
    }

    function drawLine(geo: Geo, now: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const r = geo.line;
      const n = p.n;
      const v = currentView();
      const nb = roundingNeighbors(n, p.r);
      const rounded = roundTo(n, p.r);
      const wide = geo.wide;
      const { x0, x1, yO, yD } = lineFrame(geo);
      const onAccent = theme.dark ? '#10161f' : '#ffffff';

      g.fillStyle = withAlpha(theme.text, theme.dark ? 0.04 : 0.025);
      roundRect(g, r.x, r.y, r.w, r.h, 14);
      g.fill();

      // Überschrift: Rundungsstelle, entscheidende Ziffer und Ergebnis
      const titleSize = wide ? clamp(geo.font, 13, 17) : 12.5;
      const titleY = r.y + (wide ? 19 : 16);
      const title = tr('roundTo', { place: roundingPlaceName(p.r, lang) });
      text(g, title, r.x + 14, titleY, { font: `700 ${titleSize}px ${theme.font}`, color: theme.text, align: 'left' });
      g.font = `700 ${titleSize}px ${theme.font}`;
      const titleW = g.measureText(title).width;
      const shown = revealed && now >= revealAt;
      const res = shown ? gd(rounded) : '?';
      const eq = `${gd(n)} ≈ `;
      const eqFont = `800 ${titleSize + 1}px ${theme.font}`;
      g.font = eqFont;
      const resW = g.measureText(res).width;
      const eqW = g.measureText(eq).width;
      const right = r.x + r.w - 14;
      const showEq = titleW + eqW + resW + 40 < r.w;
      text(g, res, right, titleY, { font: eqFont, color: accent(), align: 'right' });
      text(g, showEq ? eq : '≈ ', right - resW, titleY, { font: eqFont, color: theme.text, align: 'right' });
      const digit = digitsOf(n)[p.r - 1] ?? 0;
      const hint = tr('rule', { place: placeName(p.r - 1, lang), d: digit });
      const hintFont = `600 ${titleSize - 1}px ${theme.font}`;
      g.font = hintFont;
      const hintW = g.measureText(hint).width;
      if (wide && titleW + hintW + eqW + resW + 70 < r.w) {
        text(g, hint, r.x + 14 + titleW + 10, titleY, { font: hintFont, color: accent(), align: 'left' });
      }

      const xo = (val: number) => x0 + ((val - v.oa) / v.os) * (x1 - x0);
      const xd = (val: number) => x0 + ((val - v.da) / v.ds) * (x1 - x0);
      const settled = !viewTween.running && !dragging;
      const small = wide ? 11.5 : 10;

      // Lupe: Ausschnitt der oberen Linie, vergrößert unten
      const b0 = clamp(xo(v.da), x0 - 12, x1 + 12);
      const b1 = clamp(xo(v.da + v.ds), x0 - 12, x1 + 12);
      g.fillStyle = withAlpha(accent(), theme.dark ? 0.08 : 0.055);
      g.beginPath();
      g.moveTo(b0, yO + 7);
      g.lineTo(b1, yO + 7);
      g.lineTo(x1, yD);
      g.lineTo(x0, yD);
      g.closePath();
      g.fill();
      g.save();
      g.setLineDash([4, 4]);
      g.strokeStyle = withAlpha(accent(), 0.5);
      g.lineWidth = 1.2;
      g.beginPath();
      g.moveTo(b0, yO + 7);
      g.lineTo(x0, yD - 10);
      g.moveTo(b1, yO + 7);
      g.lineTo(x1, yD - 10);
      g.stroke();
      g.restore();

      // obere Linie (Übersicht) mit hervorgehobenem Ausschnitt
      g.fillStyle = withAlpha(accent(), 0.3);
      roundRect(g, b0, yO - 7, Math.max(3, b1 - b0), 14, 4);
      g.fill();
      drawScale(v.oa, v.os, x0, x1, yO);
      const labelFont = `600 ${small}px ${theme.font}`;
      if (!viewTween.running) {
        text(g, gd(Math.round(v.oa)), x0 - 6, yO - 15, { font: labelFont, color: theme.muted, align: 'left' });
        text(g, gd(Math.round(v.oa + v.os)), x1 + 6, yO - 15, { font: labelFont, color: theme.muted, align: 'right' });
      }
      const nx = xo(n);
      g.fillStyle = theme.text;
      g.beginPath();
      g.moveTo(nx, yO + 3);
      g.lineTo(nx - 5, yO + 12);
      g.lineTo(nx + 5, yO + 12);
      g.closePath();
      g.fill();

      // untere Linie (vergrößerter Ausschnitt)
      const xm = xd(nb.mid);
      const xl = xd(nb.lower);
      const xu = xd(nb.upper);
      const upHalf = n >= nb.mid;
      g.fillStyle = withAlpha(accent(), 0.18);
      if (settled && shown) {
        if (upHalf) g.fillRect(xm, yD - 5, xu - xm, 10);
        else g.fillRect(xl, yD - 5, xm - xl, 10);
      }
      drawScale(v.da, v.ds, x0, x1, yD);
      g.save();
      g.setLineDash([3, 3]);
      g.strokeStyle = theme.muted;
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(xm, yD - 20);
      g.lineTo(xm, yD + 6);
      g.stroke();
      g.restore();

      // Ziffern der Zehntel-Abschnitte: Sie entsprechen der entscheidenden Ziffer
      const seg = (xu - xl) / 10;
      if (settled && seg >= 13) {
        for (let d = 0; d < 10; d++) {
          const cx = xl + (d + 0.5) * seg;
          if (d === digit) {
            g.fillStyle = accent();
            g.beginPath();
            g.arc(cx, yD + 15, small * 0.85, 0, Math.PI * 2);
            g.fill();
            text(g, String(d), cx, yD + 15.5, { font: `800 ${small}px ${theme.font}`, color: onAccent });
          } else text(g, String(d), cx, yD + 15.5, { font: `600 ${small}px ${theme.font}`, color: withAlpha(theme.muted, 0.85) });
        }
      }

      // Nachbarzahlen an den Enden, Mitte
      const slideT = settled ? ease.inOutCubic(slideU(now)) : 0;
      const sliding = slideU(now) < 1;
      const done = revealed && settled && !sliding;
      let leftEnd = xl;
      let rightEnd = xu;
      const pillY = yD + 38;
      if (settled) {
        const endPill = (val: number, x: number, align: 'left' | 'right') => {
          const isResult = done && val === rounded;
          return pill(gd(val), x + (align === 'left' ? -10 : 10), pillY, {
            fill: isResult ? accent() : withAlpha(theme.text, theme.dark ? 0.13 : 0.08),
            color: isResult ? onAccent : theme.text,
            size: wide ? 12.5 : 10.5,
            align,
          });
        };
        leftEnd = endPill(nb.lower, xl, 'left')[1];
        rightEnd = endPill(nb.upper, xu, 'right')[0];
        const mid = gd(nb.mid);
        g.font = labelFont;
        const mw = g.measureText(mid).width;
        if (xm - mw / 2 > leftEnd + 8 && xm + mw / 2 < rightEnd - 8) text(g, mid, xm, pillY, { font: labelFont, color: theme.muted });
      }
      // Zonen
      const zoneY = pillY + (wide ? 21 : 19);
      const zoneSize = wide ? 12.5 : 11;
      if (settled) {
        const down = shown && !upHalf;
        const up = shown && upHalf;
        text(g, ctx.t('down'), (xl + xm) / 2, zoneY, { font: `${down ? 800 : 600} ${zoneSize}px ${theme.font}`, color: down ? accent() : theme.muted });
        text(g, ctx.t('up'), (xm + xu) / 2, zoneY, { font: `${up ? 800 : 600} ${zoneSize}px ${theme.font}`, color: up ? accent() : theme.muted });
      }

      // Rundungsbogen von der Zahl zur gerundeten Zahl
      const xn = xd(n);
      const xr = xd(rounded);
      if (revealed && settled && (sliding || done) && Math.abs(xr - xn) > 1) {
        const e = done ? 1 : slideT;
        const lift = Math.min(40, Math.abs(xr - xn) * 0.35 + 10);
        const yy = yD - 3;
        g.strokeStyle = accent();
        g.lineWidth = 2.5;
        g.lineCap = 'round';
        g.beginPath();
        const steps = 40;
        for (let i = 0; i <= Math.round(steps * e); i++) {
          const t = i / steps;
          const y = yy - Math.sin(Math.PI * t) * lift;
          if (i === 0) g.moveTo(lerp(xn, xr, t), y);
          else g.lineTo(lerp(xn, xr, t), y);
        }
        g.stroke();
        if (done) {
          const t0 = 0.9;
          const ang = Math.atan2(yy - (yy - Math.sin(Math.PI * t0) * lift), xr - lerp(xn, xr, t0));
          g.fillStyle = accent();
          g.save();
          g.translate(xr, yy);
          g.rotate(ang);
          g.beginPath();
          g.moveTo(1, 0);
          g.lineTo(-10, -5.5);
          g.lineTo(-10, 5.5);
          g.closePath();
          g.fill();
          g.restore();
        } else drawCounter(lerp(xn, xr, e), yy - Math.sin(Math.PI * e) * lift, 7, accent());
      }

      // Zahl als Stecknadel
      const size = wide ? 13.5 : 11.5;
      const pinY = yD - (wide ? 44 : 40);
      g.strokeStyle = theme.text;
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(xn, pinY + 8);
      g.lineTo(xn, yD);
      g.stroke();
      g.fillStyle = theme.text;
      g.beginPath();
      g.arc(xn, yD, 4.5, 0, Math.PI * 2);
      g.fill();
      const [pl, pr] = pill(gd(n), xn, pinY, { fill: theme.text, color: theme.bg, size });
      if ((dragging || hover === 'line') && !ctx.locked) {
        g.strokeStyle = withAlpha(theme.series[0]!, 0.75);
        g.lineWidth = 3;
        roundRect(g, pl - 3.5, pinY - size * 0.875 - 3.5, pr - pl + 7, size * 1.75 + 7, size * 0.875 + 3.5);
        g.stroke();
      }
      // „Mitte“ über der gestrichelten Linie, wenn die Stecknadel nicht im Weg ist
      g.font = labelFont;
      const midW = g.measureText(ctx.t('mid')).width;
      if (settled && (xm + midW / 2 + 6 < pl || xm - midW / 2 - 6 > pr)) text(g, ctx.t('mid'), xm, yD - 27, { font: labelFont, color: theme.muted });

      hits.push({ id: 'line', x: x0 - 14, y: pinY - size, w: x1 - x0 + 28, h: yD + 24 - (pinY - size) });
      if (viewTween.running || (sliding && revealed) || now < revealAt) ctx.requestRender();
    }

    /* ---------- Zeiger ---------- */
    const hitAt = (px: number, py: number): Hit | null => {
      for (let i = hits.length - 1; i >= 0; i--) {
        const h = hits[i]!;
        if (px >= h.x && px <= h.x + h.w && py >= h.y && py <= h.y + h.h) return h;
      }
      return null;
    };

    function dragTo(px: number): void {
      const { x0, x1 } = lineFrame(geometry());
      const v = dragView ?? currentView();
      const unit = pow10(Math.max(0, p.r - 2));
      const raw = v.da + ((px - x0) / (x1 - x0)) * v.ds;
      const value = clamp(Math.round(raw / unit) * unit, v.da, v.da + v.ds);
      if (value !== p.n) ctx.set({ n: Math.min(MAX_NUMBER, value) });
    }

    surface.addTarget({
      contains: (px: number, py: number) => dragging || hitAt(px, py) !== null,
      pointerDown: (pt: { px: number; py: number }) => {
        const h = hitAt(pt.px, pt.py);
        if (!h) return false;
        const [kind, arg] = h.id.split(':');
        const place = Number(arg);
        if (kind === 'plus' || kind === 'minus') {
          focus = -1;
          step(place, kind === 'plus' ? 1 : -1);
        } else if (kind === 'tile') {
          focus = focus === place ? -1 : place;
        } else if (kind === 'head') {
          if (!ctx.locked && place >= 1) ctx.set({ r: place });
        } else if (kind === 'line') {
          if (ctx.locked) return true;
          dragging = true;
          dragView = currentView();
          viewTween.finish();
          dragTo(pt.px);
        }
        ctx.requestRender();
        return true;
      },
      pointerMove: (pt: { px: number; py: number }) => {
        if (dragging) dragTo(pt.px);
      },
      pointerUp: () => {
        if (dragging) {
          dragging = false;
          dragView = null;
          viewFrom = view;
          retarget(true);
          if (p.show) startSlide();
          ctx.requestRender();
        }
      },
      hover: (pt: { px: number; py: number } | null) => {
        const h = pt ? hitAt(pt.px, pt.py) : null;
        const id = h?.id ?? null;
        if (id !== hover) {
          hover = id;
          ctx.requestRender();
        }
        const editable = !ctx.locked && id !== null && !id.startsWith('tile');
        surface.setCursor(id === null ? '' : id === 'line' ? (editable ? 'ew-resize' : '') : editable || id.startsWith('tile') ? 'pointer' : '');
      },
      wheel: () => false,
    });

    /* ---------- Rahmen ---------- */
    function syncPresence(dt: number): boolean {
      const target = targetCounts();
      let moving = false;
      const special = running && (running.step.kind === 'bundle' || running.step.kind === 'shift');
      for (let k = 0; k < PLACE_COUNT; k++) {
        if (special && running!.step.kind === 'bundle' && running!.step.place === k) continue;
        for (let i = 0; i < SLOTS; i++) {
          const want = i < target[k]! ? 1 : 0;
          const cur = presence[k]![i]!;
          if (reduced) {
            presence[k]![i] = want;
            continue;
          }
          const next = cur + (want - cur) * Math.min(1, dt * 16);
          presence[k]![i] = Math.abs(next - want) < 0.01 ? want : next;
          if (presence[k]![i] !== want) moving = true;
        }
      }
      return moving;
    }

    return {
      update(changed, source) {
        if (changed.has('n')) {
          if (expected === null || p.n !== expected) resetAnimation();
          expected = null;
          if (!p.show) revealed = false;
          focus = -1;
        }
        if (changed.has('r') && !p.show) revealed = false;
        if (changed.has('show')) revealed = p.show;
        if (changed.has('n') || changed.has('r')) {
          if (!dragging) retarget(source !== 'init');
          if (p.show && source !== 'init' && !dragging) startSlide();
        }
        updateReadouts();
      },

      action(id) {
        if (id === 'round') {
          if (!revealed) revealAt = performance.now() + (reduced ? 0 : 520 + SLIDE);
          revealed = true;
          if (!viewTween.running) {
            viewFrom = { oa: view.oa, os: view.os * 10, da: view.oa, ds: view.os };
            if (!reduced) viewTween.play();
          }
          startSlide();
        } else if (id === 'times10') shift(1);
        else if (id === 'div10') shift(-1);
        else if (id === 'random' && !ctx.locked) {
          const len = 3 + Math.floor(Math.random() * 7);
          let value = 1 + Math.floor(Math.random() * 9);
          for (let i = 1; i < len; i++) value = value * 10 + Math.floor(Math.random() * 10);
          const r = 1 + Math.floor(Math.random() * (len - 1));
          ctx.set({ n: value, r });
        }
        ctx.requestRender();
      },

      render() {
        const now = performance.now();
        const dt = Math.min(0.1, (now - lastFrame) / 1000);
        lastFrame = now;
        advance(now);
        const moving = syncPresence(dt);
        hits = [];
        const geo = geometry();
        surface.begin();
        drawTable(geo, now);
        drawNumber(geo);
        drawLine(geo, now);
        if (moving || running || queue.length) ctx.requestRender();
      },

      destroy: () => surface.destroy(),
    };
  },
});
