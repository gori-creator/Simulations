import { defineSimulation, ease, prefersReducedMotion, roundRect, Surface, text, Tween, withAlpha, type Rect } from '../../../sim-core';
import { drawFrog, drawPenguin, drawPiggy, drawSnowflake, drawSun, groundShadow } from './figures';
import { absolute, change, compute, num, opposite, operand, randomTask, rewrite, story, termText, viewRange, walkPlan, type Lang, type Op, type Scene } from './model';

const L = (de: string, en: string) => ({ de, en });
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Ablauf einer Rechnung im Laufmodell. */
interface Walk {
  t0: number;
  intro: number;
  turn: number;
  hop: number;
  move: number;
  outro: number;
}

interface WalkState {
  phase: 'start' | 'intro' | 'turn' | 'walk' | 'outro' | 'done';
  /** Lage der Figur auf der Zahlengeraden. */
  pos: number;
  /** Blickrichtung (−1…1, Zwischenwerte beim Umdrehen). */
  facing: number;
  /** Sprunghöhe 0…1. */
  hop: number;
  /** Umklappen des Pfeils der zweiten Zahl (0…1). */
  flip: number;
  /** Erscheinen der Figur beim Start (0…1). */
  appear: number;
}

interface Hit {
  id: 'start' | 'end';
  x: number;
  y: number;
}

/**
 * Ganze Zahlen an der Zahlengeraden addieren und subtrahieren: Pfeilmodell und
 * Laufmodell (das Rechenzeichen gibt die Blickrichtung, das Vorzeichen die
 * Laufrichtung an), dazu Thermometer, Meeresspiegel und Kontostand.
 */
export default defineSimulation({
  id: 'zahlengerade',
  dragHint: true,
  layout: { aspect: 1.6, aspectNarrow: 0.72 },
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'scene',
      type: 'choice',
      label: L('Darstellung', 'Representation'),
      options: [
        { value: 'gerade', label: L('Zahlengerade', 'Number line') },
        { value: 'thermo', label: L('Thermometer', 'Thermometer') },
        { value: 'meer', label: L('Meeresspiegel', 'Sea level') },
        { value: 'konto', label: L('Kontostand', 'Bank balance') },
      ],
      default: 'gerade',
    },
    { key: 'a', type: 'number', label: L('Erste Zahl (Start)', 'First number (start)'), min: -20, max: 20, step: 1, default: -3 },
    {
      key: 'op',
      type: 'choice',
      label: L('Rechenzeichen', 'Operation'),
      options: [
        { value: 'plus', label: L('+ addieren', '+ add') },
        { value: 'minus', label: L('− subtrahieren', '− subtract') },
      ],
      default: 'plus',
    },
    { key: 'b', type: 'number', label: L('Zweite Zahl', 'Second number'), min: -20, max: 20, step: 1, default: 7 },
    {
      key: 'show',
      type: 'boolean',
      label: L('Ergebnis sofort zeigen', 'Show the result right away'),
      help: L('Ausgeschaltet erscheint das Ergebnis erst nach „Los!“.', 'When off, the result only appears after “Go!”.'),
      default: true,
    },
    { key: 'abs', type: 'boolean', group: 'view', label: L('Betrag und Gegenzahl zeigen', 'Show absolute value and opposite'), default: false },
  ],
  actions: [
    { id: 'go', label: L('Los!', 'Go!'), primary: true },
    { id: 'new', label: L('Neue Aufgabe', 'New task') },
  ],
  readouts: [
    { key: 'term', label: L('Rechnung', 'Calculation') },
    { key: 'rule', label: L('Rechenregel', 'Rule') },
    { key: 'result', label: L('Ergebnis', 'Result'), spoiler: true },
    { key: 'context', label: L('Erklärung', 'Explanation') },
    { key: 'abs', label: L('Betrag und Gegenzahl', 'Absolute value and opposite') },
  ],
  presets: [
    { id: 'start', label: L('−3 + 7', '−3 + 7'), values: {} },
    { id: 'plusNeg', label: L('Negative Zahl addieren', 'Adding a negative number'), values: { a: 5, b: -8 } },
    { id: 'minusNeg', label: L('Negative Zahl subtrahieren', 'Subtracting a negative number'), values: { a: 2, op: 'minus', b: -4 } },
    { id: 'cold', label: L('Kälteeinbruch', 'Cold snap'), values: { scene: 'thermo', a: 4, op: 'minus', b: 9 } },
    { id: 'dive', label: L('Der Pinguin taucht', 'The penguin dives'), values: { scene: 'meer', a: 6, b: -14 } },
    { id: 'debt', label: L('Schulden werden gestrichen', 'A debt is cancelled'), values: { scene: 'konto', a: -15, op: 'minus', b: -10 } },
  ],
  strings: {
    de: {
      canvas: 'Zahlengerade mit Pfeilen für die Rechnung und einer Figur, die vom Start aus läuft',
      s1: 'Start bei {a}',
      s2plus: '+ heißt: Blick nach rechts',
      s2minus: '− heißt: umdrehen',
      s3fwd: '{b} ist positiv: {n} Schritte vorwärts',
      s3back: '{b} ist negativ: {n} Schritte rückwärts',
      s3zero: '0 Schritte: stehen bleiben',
      walkText: 'Start bei {a}. {s2}. {s3}.',
      debt: 'Schulden',
      credit: 'Guthaben',
      unitC: '°C',
      unitM: 'Höhe in m',
      unitE: 'Kontostand in €',
      freezing: 'Gefrierpunkt',
      sea: 'Meeresspiegel',
      start: 'Start',
      result: 'Ergebnis',
      ruleMinus: 'Subtrahieren heißt: die Gegenzahl addieren.',
      rulePlus: 'Eine negative Zahl addieren heißt: ihre Gegenzahl subtrahieren.',
      absText: '|{a}| = {abs}, Gegenzahl von {a} ist {opp}',
      absLabel: 'Betrag {v}',
      oppLabel: 'Gegenzahl',
      change: 'Änderung',
    },
    en: {
      canvas: 'Number line with arrows for the calculation and a figure walking from the start',
      s1: 'Start at {a}',
      s2plus: '+ means: face right',
      s2minus: '− means: turn around',
      s3fwd: '{b} is positive: {n} steps forwards',
      s3back: '{b} is negative: {n} steps backwards',
      s3zero: '0 steps: stand still',
      walkText: 'Start at {a}. {s2}. {s3}.',
      debt: 'Debt',
      credit: 'Credit',
      unitC: '°C',
      unitM: 'Height in m',
      unitE: 'Balance in €',
      freezing: 'Freezing point',
      sea: 'Sea level',
      start: 'Start',
      result: 'Result',
      ruleMinus: 'Subtracting means adding the opposite.',
      rulePlus: 'Adding a negative number means subtracting its opposite.',
      absText: '|{a}| = {abs}, the opposite of {a} is {opp}',
      absLabel: 'abs. value {v}',
      oppLabel: 'opposite',
      change: 'Change',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const lang = ctx.lang as Lang;
    const reduced = prefersReducedMotion();
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));

    const op = () => p.op as Op;
    const scene = () => p.scene as Scene;
    const vertical = () => scene() === 'thermo' || scene() === 'meer';
    const result = () => compute(p.a, op(), p.b);

    let walk: Walk | null = null;
    let revealed = p.show;
    let figPos = revealed ? result() : p.a;
    let figFacing = revealed ? walkPlan(op(), p.b).facing : 1;
    let lastFrame = performance.now();
    let range = targetRange();
    let rangeFrom = range;
    const rangeTween = new Tween(550, ease.inOutCubic);
    const pop = new Tween(500, ease.outBack);
    let dragging: Hit['id'] | null = null;
    let dragRange: [number, number] | null = null;
    let hover: Hit['id'] | null = null;
    let hits: Hit[] = [];

    const colA = () => ctx.theme.series[0]!;
    const colB = () => ctx.theme.series[3]!;
    const colR = () => ctx.theme.series[2]!;

    function targetRange(): [number, number] {
      const values = [p.a, result()];
      if (op() === 'minus') values.push(p.a + p.b);
      // Ohne sofortiges Ergebnis verrät der Ausschnitt die Richtung nicht
      if (!p.show) values.push(p.a + p.b, p.a - p.b);
      if (p.abs) values.push(-p.a);
      return viewRange(values, vertical() ? 10 : 12);
    }

    function currentRange(): [number, number] {
      if (dragRange) return dragRange;
      if (!rangeTween.running) return range;
      const t = rangeTween.value;
      return [lerp(rangeFrom[0], range[0], t), lerp(rangeFrom[1], range[1], t)];
    }

    function retarget(): void {
      const next = targetRange();
      if (next[0] === range[0] && next[1] === range[1]) return;
      rangeFrom = currentRange();
      range = next;
      if (reduced) rangeTween.finish();
      else rangeTween.play();
    }

    /* ---------- Ablauf ---------- */
    function startWalk(): void {
      const plan = walkPlan(op(), p.b);
      const v = vertical();
      const hop = clamp(2.4 / Math.max(1, plan.steps), 0.16, 0.36);
      walk = {
        t0: performance.now(),
        intro: 0.45,
        turn: plan.turn ? 0.75 : 0,
        hop,
        move: v ? clamp(plan.steps * 0.11, 0.5, 2.2) : plan.steps * hop,
        outro: 0.55,
      };
      if (reduced) finishWalk();
      ctx.requestRender();
    }

    function finishWalk(): void {
      walk = null;
      revealed = true;
      figPos = result();
      figFacing = walkPlan(op(), p.b).facing;
      pop.play();
      updateReadouts();
    }

    function walkState(now: number): WalkState {
      const plan = walkPlan(op(), p.b);
      const a = p.a;
      if (!walk) {
        return { phase: revealed ? 'done' : 'start', pos: figPos, facing: figFacing, hop: 0, flip: revealed ? 1 : 0, appear: 1 };
      }
      let t = (now - walk.t0) / 1000;
      if (t < walk.intro) return { phase: 'intro', pos: a, facing: 1, hop: 0, flip: 0, appear: ease.outBack(t / walk.intro) };
      t -= walk.intro;
      if (t < walk.turn) {
        const u = t / walk.turn;
        return { phase: 'turn', pos: a, facing: Math.cos(Math.PI * ease.inOutCubic(u)), hop: Math.sin(Math.PI * u) * 0.35, flip: ease.inOutCubic(u), appear: 1 };
      }
      t -= walk.turn;
      if (t < walk.move) {
        if (vertical()) {
          const u = ease.inOutCubic(t / walk.move);
          return { phase: 'walk', pos: a + plan.dir * plan.steps * u, facing: plan.facing, hop: 0, flip: 1, appear: 1 };
        }
        const k = Math.min(plan.steps - 1, Math.floor(t / walk.hop));
        const u = clamp((t - k * walk.hop) / walk.hop, 0, 1);
        return { phase: 'walk', pos: a + plan.dir * (k + ease.inOutCubic(u)), facing: plan.facing, hop: Math.sin(Math.PI * u), flip: 1, appear: 1 };
      }
      t -= walk.move;
      if (t < walk.outro) {
        const u = t / walk.outro;
        return { phase: 'outro', pos: result(), facing: plan.facing, hop: Math.sin(Math.PI * u) * 0.3, flip: 1, appear: 1 };
      }
      finishWalk();
      return { phase: 'done', pos: figPos, facing: figFacing, hop: 0, flip: 1, appear: 1 };
    }

    /* ---------- Ergebnisse ---------- */
    function steps(): [string, string, string] {
      const plan = walkPlan(op(), p.b);
      const s3 = p.b === 0 ? tr('s3zero') : tr(plan.backward ? 's3back' : 's3fwd', { b: num(p.b), n: plan.steps });
      return [tr('s1', { a: num(p.a) }), tr(op() === 'plus' ? 's2plus' : 's2minus'), s3];
    }

    function updateReadouts(): void {
      const a = p.a;
      const b = p.b;
      const term = termText(a, op(), b);
      ctx.readout('term', term);
      const rw = rewrite(a, op(), b);
      ctx.readout('rule', rw ? `${term} = ${rw}. ${tr(op() === 'minus' ? 'ruleMinus' : 'rulePlus')}` : null);
      ctx.readout('result', `${term} = ${num(result())}`);
      const sc = scene();
      if (sc === 'gerade' || sc === 'konto') {
        const [s1, s2, s3] = steps();
        ctx.readout('context', `${s1}. ${s2}. ${s3}.`);
      } else {
        const st = story(sc, a, op(), b, lang);
        ctx.readout('context', `${st.start} ${st.change}`);
      }
      ctx.readout('abs', tr('absText', { a: num(a), abs: absolute(a), opp: num(opposite(a)) }));
      ctx.setAction('new', { enabled: !ctx.locked });
    }

    /* ---------- Geometrie ---------- */
    function isWide(): boolean {
      return surface.width >= 600;
    }

    interface HLayout {
      eqY: number;
      eqSize: number;
      ruleY: number;
      x0: number;
      x1: number;
      lineY: number;
      arrowY: number;
      ghostY: number;
      figH: number;
      chipsY: number;
    }

    function hLayout(): HLayout {
      const W = surface.width;
      const H = surface.height;
      const wide = isWide();
      const eqSize = wide ? clamp(H * 0.085, 26, 48) : clamp(H * 0.065, 22, 30);
      const figH = wide ? clamp(H * 0.17, 40, 96) : clamp(H * 0.11, 34, 54);
      const lineY = wide ? H * 0.64 : H * 0.6;
      const arrowY = lineY - figH * 1.75;
      return {
        eqY: wide ? H * 0.115 : H * 0.085,
        eqSize,
        ruleY: wide ? H * 0.115 + eqSize * 0.95 : H * 0.085 + eqSize * 1.05,
        x0: wide ? 44 : 22,
        x1: W - (wide ? 52 : 30),
        lineY,
        arrowY,
        ghostY: arrowY - (wide ? 30 : 24),
        figH,
        chipsY: wide ? H - 30 : H - 70,
      };
    }

    /* ---------- Zeichnen: allgemeine Teile ---------- */
    interface Part {
      text: string;
      color: string;
    }

    /** Gleichung mit farbigen Teilen, zentriert. */
    function drawEquation(cx: number, cy: number, size: number, maxW: number, now: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const st = walkState(now);
      const showResult = st.phase === 'done' || st.phase === 'outro';
      const parts: Part[] = [
        { text: num(p.a), color: colA() },
        { text: ` ${op() === 'plus' ? '+' : '−'} `, color: theme.text },
        { text: operand(p.b), color: colB() },
        { text: ' = ', color: theme.text },
        { text: showResult ? num(result()) : '?', color: showResult ? colR() : theme.muted },
      ];
      let s = size;
      let total = 0;
      for (; s > 12; s -= 1) {
        g.font = `800 ${s}px ${theme.font}`;
        total = parts.reduce((w, q) => w + g.measureText(q.text).width, 0);
        if (total <= maxW) break;
      }
      let x = cx - total / 2;
      const popScale = pop.running ? pop.value : 1;
      parts.forEach((q, i) => {
        const w = g.measureText(q.text).width;
        if (i === 4 && showResult && pop.running) {
          g.save();
          g.translate(x + w / 2, cy);
          g.scale(popScale, popScale);
          text(g, q.text, 0, 0, { font: `800 ${s}px ${theme.font}`, color: q.color });
          g.restore();
        } else text(g, q.text, x, cy, { font: `800 ${s}px ${theme.font}`, color: q.color, align: 'left' });
        x += w;
      });
    }

    /** Zweite Zeile: Umformung nach der Rechenregel („= 2 + 4“). */
    function drawRewrite(cx: number, cy: number, size: number): void {
      const rw = rewrite(p.a, op(), p.b);
      if (!rw) return;
      const g = surface.g;
      const theme = ctx.theme;
      const d = opposite(p.b);
      const parts: Part[] = [
        { text: '= ', color: theme.muted },
        { text: num(p.a), color: colA() },
        { text: op() === 'minus' ? ' + ' : ' − ', color: theme.muted },
        { text: op() === 'minus' ? operand(d) : String(Math.abs(p.b)), color: colB() },
      ];
      const font = `700 ${size}px ${theme.font}`;
      g.font = font;
      const total = parts.reduce((w, q) => w + g.measureText(q.text).width, 0);
      const note = op() === 'minus' ? ` (${lang === 'de' ? 'Gegenzahl addieren' : 'add the opposite'})` : '';
      const noteFont = `600 ${Math.round(size * 0.75)}px ${theme.font}`;
      g.font = noteFont;
      const noteW = g.measureText(note).width;
      let x = cx - (total + noteW) / 2;
      g.font = font;
      for (const q of parts) {
        text(g, q.text, x, cy, { font, color: q.color, align: 'left' });
        g.font = font;
        x += g.measureText(q.text).width;
      }
      if (note) text(g, note, x, cy + 1, { font: noteFont, color: theme.muted, align: 'left' });
    }

    function pill(label: string, x: number, y: number, fill: string, color: string, size: number, minX = 2, maxX = surface.width - 2): [number, number] {
      const g = surface.g;
      const font = `800 ${size}px ${ctx.theme.font}`;
      g.font = font;
      const w = g.measureText(label).width + size * 1.1;
      const h = size * 1.7;
      const left = clamp(x - w / 2, minX, maxX - w);
      g.fillStyle = fill;
      roundRect(g, left, y - h / 2, w, h, h / 2);
      g.fill();
      text(g, label, left + w / 2, y + 0.5, { font, color });
      return [left, left + w];
    }

    const onColor = () => (ctx.theme.dark ? '#10161f' : '#ffffff');

    /** Pfeil zwischen zwei Punkten (waagerecht oder senkrecht) mit Spitze. */
    function arrow(x0: number, y0: number, x1: number, y1: number, color: string, width: number, opts: { dash?: number[]; alpha?: number } = {}): void {
      const g = surface.g;
      const len = Math.hypot(x1 - x0, y1 - y0);
      if (len < 1) return;
      const ux = (x1 - x0) / len;
      const uy = (y1 - y0) / len;
      const head = Math.min(width * 3.2, len * 0.6);
      g.save();
      g.globalAlpha = opts.alpha ?? 1;
      g.strokeStyle = color;
      g.fillStyle = color;
      g.lineWidth = width;
      g.lineCap = 'round';
      g.setLineDash(opts.dash ?? []);
      g.beginPath();
      g.moveTo(x0, y0);
      g.lineTo(x1 - ux * head * 0.7, y1 - uy * head * 0.7);
      g.stroke();
      g.setLineDash([]);
      g.beginPath();
      g.moveTo(x1, y1);
      g.lineTo(x1 - ux * head - uy * head * 0.55, y1 - uy * head + ux * head * 0.55);
      g.lineTo(x1 - ux * head + uy * head * 0.55, y1 - uy * head - ux * head * 0.55);
      g.closePath();
      g.fill();
      g.restore();
    }

    /** Kleines Schild mitten auf einem senkrechten Pfeil. */
    function arrowTag(label: string, x: number, y: number, font: string, ghost: boolean): void {
      const g = surface.g;
      g.font = font;
      const w = g.measureText(label).width + 12;
      const h = 20;
      g.fillStyle = ctx.theme.bg;
      roundRect(g, x - w / 2, y - h / 2, w, h, h / 2);
      g.fill();
      g.strokeStyle = withAlpha(colB(), ghost ? 0.5 : 1);
      g.lineWidth = 1.5;
      if (ghost) g.setLineDash([4, 3]);
      g.stroke();
      g.setLineDash([]);
      text(g, label, x, y + 0.5, { font, color: colB() });
    }

    /* ---------- Zeichnen: waagerechte Zahlengerade (Zahlengerade, Konto) ---------- */
    function drawHorizontal(now: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const lay = hLayout();
      const wide = isWide();
      const [lo, hi] = currentRange();
      const xOf = (v: number) => lay.x0 + ((v - lo) / (hi - lo)) * (lay.x1 - lay.x0);
      const unit = (lay.x1 - lay.x0) / (hi - lo);
      const y = lay.lineY;
      const st = walkState(now);
      const isKonto = scene() === 'konto';
      const r = result();
      const a = p.a;
      const showResult = st.phase === 'done';

      drawEquation(surface.width / 2, lay.eqY, lay.eqSize, surface.width - 24, now);
      if (isKonto) {
        const s = story('konto', a, op(), p.b, lang);
        const line = `${s.start} ${s.change}${showResult ? ` ${s.result}` : ''}`;
        const size = wide ? 15 : 12;
        const font = `600 ${size}px ${theme.font}`;
        g.font = font;
        const rows: string[] = [];
        let cur = '';
        for (const w of line.split(' ')) {
          const next = cur ? `${cur} ${w}` : w;
          if (g.measureText(next).width > surface.width - 28 && cur) {
            rows.push(cur);
            cur = w;
          } else cur = next;
        }
        rows.push(cur);
        rows.forEach((row, i) => text(g, row, surface.width / 2, lay.ruleY + i * size * 1.35, { font, color: theme.muted }));
      } else drawRewrite(surface.width / 2, lay.ruleY, wide ? 18 : 14);

      // Bereiche (Konto: Schulden und Guthaben)
      const xz = xOf(0);
      if (isKonto) {
        g.fillStyle = withAlpha(theme.series[1]!, theme.dark ? 0.16 : 0.1);
        roundRect(g, lay.x0 - 14, y - 16, xz - lay.x0 + 14, 32, 8);
        g.fill();
        g.fillStyle = withAlpha(theme.series[2]!, theme.dark ? 0.16 : 0.1);
        roundRect(g, xz, y - 16, lay.x1 + 14 - xz, 32, 8);
        g.fill();
        const f = `700 ${wide ? 12 : 10.5}px ${theme.font}`;
        if (xz - lay.x0 > 70) text(g, ctx.t('debt'), lay.x0 - 6, y - 26, { font: f, color: theme.series[1]!, align: 'left' });
        if (lay.x1 - xz > 70) text(g, ctx.t('credit'), lay.x1 + 6, y - 26, { font: f, color: theme.series[2]!, align: 'right' });
      }

      // Zahlengerade
      g.strokeStyle = theme.axis;
      g.lineWidth = 2.5;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(lay.x0 - 16, y);
      g.lineTo(lay.x1 + 16, y);
      g.stroke();
      g.fillStyle = theme.axis;
      g.beginPath();
      g.moveTo(lay.x1 + 26, y);
      g.lineTo(lay.x1 + 14, y - 6);
      g.lineTo(lay.x1 + 14, y + 6);
      g.closePath();
      g.fill();
      const labelEvery = unit >= 24 ? 1 : unit * 5 >= 26 ? 5 : 10;
      const tickFont = `600 ${wide ? 13 : 11}px ${theme.font}`;
      const avoid: [number, number][] = [];
      // Start- und Ergebnis-Schild unter der Geraden
      const pillSize = wide ? 13.5 : 11.5;
      const pillY = y + (wide ? 24 : 21);
      if (Math.abs(st.pos - r) < 1e-6 && showResult && r !== a) avoid.push(pill(num(r), xOf(r), pillY, colR(), onColor(), pillSize));
      avoid.push(pill(num(a), xOf(a), pillY, colA(), onColor(), pillSize));
      for (let v = Math.ceil(lo); v <= Math.floor(hi); v++) {
        const x = xOf(v);
        const major = v % 5 === 0;
        if (unit >= 5 || major) {
          g.strokeStyle = v === 0 ? theme.text : theme.axis;
          g.lineWidth = v === 0 ? 2.5 : major ? 2 : 1.3;
          const h = v === 0 ? 11 : major ? 8 : 5;
          g.beginPath();
          g.moveTo(x, y - h);
          g.lineTo(x, y + h);
          g.stroke();
        }
        if (v % labelEvery === 0 || v === 0) {
          g.font = tickFont;
          const half = g.measureText(num(v)).width / 2 + 4;
          if (avoid.some(([l, rr]) => x + half > l && x - half < rr)) continue;
          text(g, num(v), x, pillY, { font: v === 0 ? `800 ${wide ? 14 : 12}px ${theme.font}` : tickFont, color: v === 0 ? theme.text : theme.muted });
        }
      }

      // Betrag und Gegenzahl
      if (p.abs) drawAbsH(xOf, y, showResult);

      // Pfeile
      const plan = walkPlan(op(), p.b);
      const xa = xOf(a);
      const aw = wide ? 5 : 4;
      if (op() === 'minus') {
        // Pfeil der zweiten Zahl (gestrichelt) – beim Umdrehen klappt er in die Gegenrichtung
        const xb = xOf(a + p.b);
        arrow(xa, lay.ghostY, xb, lay.ghostY, colB(), aw - 1.5, { dash: [7, 6], alpha: 0.55 });
        if (p.b !== 0) {
          const f = `700 ${wide ? 13 : 11}px ${theme.font}`;
          text(g, operand(p.b), (xa + xb) / 2, lay.ghostY - 13, { font: f, color: colB() });
        }
        if (st.phase === 'turn') {
          const end = a + p.b * Math.cos(Math.PI * st.flip);
          const lift = Math.sin(Math.PI * st.flip) * 14;
          arrow(xa, lay.arrowY - lift, xOf(end), lay.arrowY - lift, colB(), aw, { alpha: 0.85 });
        }
      }
      const moving = st.phase === 'walk' || st.phase === 'outro' || st.phase === 'done';
      if (moving && plan.steps > 0) {
        const xe = xOf(st.pos);
        if (st.phase === 'walk') arrow(xa, lay.arrowY, xOf(r), lay.arrowY, colB(), aw, { alpha: 0.18 });
        arrow(xa, lay.arrowY, xe, lay.arrowY, colB(), aw);
        // Hilfslinien zur Geraden
        g.save();
        g.setLineDash([3, 4]);
        g.strokeStyle = withAlpha(theme.muted, 0.7);
        g.lineWidth = 1.2;
        g.beginPath();
        g.moveTo(xa, lay.arrowY);
        g.lineTo(xa, y);
        if (st.phase !== 'walk') {
          g.moveTo(xOf(r), lay.arrowY);
          g.lineTo(xOf(r), y);
        }
        g.stroke();
        g.restore();
        if (st.phase !== 'walk') {
          const d = change(op(), p.b);
          text(g, d > 0 ? `+${d}` : num(d), (xa + xOf(r)) / 2, lay.arrowY - 14, { font: `800 ${wide ? 15 : 12.5}px ${theme.font}`, color: colB() });
        }
        if (st.phase === 'done' || st.phase === 'outro') hits.push({ id: 'end', x: xOf(r), y: lay.arrowY });
      }

      // Figur
      const fx = xOf(st.pos);
      const lift = st.hop * lay.figH * 0.5;
      groundShadow(g, fx, y, lay.figH * 0.42, st.hop, theme.dark);
      g.save();
      if (st.appear < 1) {
        g.translate(fx, y);
        g.scale(st.appear, st.appear);
        g.translate(-fx, -y);
      }
      if (isKonto) drawPiggy(g, fx, y - 1 - lift, lay.figH * 0.95, st.facing, st.phase === 'walk' ? st.pos * Math.PI * 2 : 0);
      else drawFrog(g, fx, y - 1 - lift, lay.figH, st.facing, st.phase === 'walk' ? st.hop : 0);
      g.restore();
      hits.push({ id: 'start', x: xa, y });
      if (!ctx.locked && !walk && (hover === 'start' || dragging === 'start')) ring(xa, y, colA());
      if (!ctx.locked && !walk && (hover === 'end' || dragging === 'end') && moving) ring(xOf(r), lay.arrowY, colB());
      if (!walk) handleDot(xa, y, colA());

      drawChips(lay, st);
    }

    function ring(x: number, y: number, color: string): void {
      const g = surface.g;
      g.fillStyle = withAlpha(color, 0.22);
      g.beginPath();
      g.arc(x, y, 16, 0, Math.PI * 2);
      g.fill();
    }

    function handleDot(x: number, y: number, color: string): void {
      const g = surface.g;
      g.fillStyle = color;
      g.strokeStyle = ctx.theme.bg;
      g.lineWidth = 2;
      g.beginPath();
      g.arc(x, y, 5.5, 0, Math.PI * 2);
      g.fill();
      g.stroke();
    }

    function drawAbsH(xOf: (v: number) => number, y: number, showResult: boolean): void {
      const g = surface.g;
      const theme = ctx.theme;
      const wide = isWide();
      const a = p.a;
      const by = y + (wide ? 50 : 42);
      const font = `700 ${wide ? 12 : 10.5}px ${theme.font}`;
      const bracket = (v0: number, v1: number, yy: number, color: string, label: string) => {
        const x0 = xOf(v0);
        const x1 = xOf(v1);
        g.strokeStyle = color;
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(x0, yy - 6);
        g.lineTo(x0, yy);
        g.lineTo(x1, yy);
        g.lineTo(x1, yy - 6);
        g.stroke();
        if (label) text(g, label, (x0 + x1) / 2, yy + 11, { font, color });
      };
      if (a !== 0) {
        bracket(0, a, by, colA(), tr('absLabel', { v: absolute(a) }));
        g.save();
        g.setLineDash([4, 3]);
        bracket(0, -a, by, withAlpha(colA(), 0.6), `${tr('oppLabel')} ${num(-a)}`);
        g.restore();
        // Gegenzahl als hohler Punkt
        g.strokeStyle = colA();
        g.fillStyle = ctx.theme.bg;
        g.lineWidth = 2.5;
        g.beginPath();
        g.arc(xOf(-a), y, 6, 0, Math.PI * 2);
        g.fill();
        g.stroke();
      }
      const r = result();
      if (showResult && r !== 0) bracket(0, r, by + (wide ? 26 : 22), colR(), tr('absLabel', { v: absolute(r) }));
    }

    function drawChips(lay: HLayout, st: WalkState): void {
      const g = surface.g;
      const theme = ctx.theme;
      const wide = isWide();
      const labels = steps();
      const active = st.phase === 'intro' ? 0 : st.phase === 'turn' ? 1 : st.phase === 'walk' ? 2 : -1;
      const font = `700 ${wide ? 13 : 11.5}px ${theme.font}`;
      g.font = font;
      const items = labels.map((l, i) => `${'①②③'[i]} ${l}`);
      const widths = items.map((l) => g.measureText(l).width + 22);
      const h = wide ? 28 : 22;
      const draw = (i: number, x: number, y: number) => {
        const on = active === i || (active < 0 && st.phase === 'done');
        const isOn = active === i;
        g.fillStyle = isOn ? colB() : withAlpha(theme.text, on ? 0.08 : 0.05);
        roundRect(g, x, y - h / 2, widths[i]!, h, h / 2);
        g.fill();
        text(g, items[i]!, x + widths[i]! / 2, y + 0.5, { font, color: isOn ? onColor() : theme.text });
      };
      const total = widths.reduce((s, w) => s + w, 0) + 16;
      if (wide && total < surface.width - 20) {
        let x = surface.width / 2 - total / 2;
        widths.forEach((w, i) => {
          draw(i, x, lay.chipsY);
          x += w + 8;
        });
      } else {
        widths.forEach((w, i) => draw(i, surface.width / 2 - w / 2, lay.chipsY + i * (h + 4) - (h + 4) + 4));
      }
    }

    /* ---------- Zeichnen: senkrechte Skala (Thermometer, Meer) ---------- */
    function vLayout(): { scene: Rect; info: Rect } {
      const W = surface.width;
      const H = surface.height;
      if (isWide()) return { scene: { x: 10, y: 10, w: W * 0.5 - 15, h: H - 20 }, info: { x: W * 0.5 + 5, y: 10, w: W * 0.5 - 15, h: H - 20 } };
      return { scene: { x: 8, y: 8, w: W - 16, h: H * 0.64 - 12 }, info: { x: 8, y: H * 0.64, w: W - 16, h: H * 0.36 - 8 } };
    }

    function drawVertical(now: number): void {
      const { scene: S, info } = vLayout();
      const st = walkState(now);
      if (scene() === 'thermo') drawThermo(S, st);
      else drawSea(S, st, now);
      drawInfo(info, st, now);
    }

    /** Skala: Teilstriche und Zahlen links (side = −1) oder rechts (side = 1) von x. */
    function drawVScale(x: number, yOf: (v: number) => number, lo: number, hi: number, side: 1 | -1, unitLabel: string): void {
      const g = surface.g;
      const theme = ctx.theme;
      const spacing = Math.abs(yOf(1) - yOf(0));
      const every = spacing >= 16 ? 1 : spacing * 5 >= 22 ? 5 : 10;
      const font = `600 ${isWide() ? 12.5 : 11}px ${theme.font}`;
      for (let v = Math.ceil(lo); v <= Math.floor(hi); v++) {
        const y = yOf(v);
        const major = v % 5 === 0;
        if (spacing >= 4 || major) {
          g.strokeStyle = v === 0 ? theme.text : theme.axis;
          g.lineWidth = v === 0 ? 2.5 : major ? 1.8 : 1.1;
          const len = v === 0 ? 14 : major ? 10 : 6;
          g.beginPath();
          g.moveTo(x, y);
          g.lineTo(x + side * len, y);
          g.stroke();
        }
        if (v % every === 0) {
          text(g, num(v), x + side * 18, y, { font: v === 0 ? `800 ${isWide() ? 14 : 12}px ${theme.font}` : font, color: v === 0 ? theme.text : theme.muted, align: side > 0 ? 'left' : 'right' });
        }
      }
      text(g, unitLabel, x + side * 4, yOf(hi) - 18, { font: `700 ${isWide() ? 12.5 : 11}px ${theme.font}`, color: theme.text, align: side > 0 ? 'left' : 'right' });
    }

    /** Pfeile und Markierungen neben einer senkrechten Skala. */
    function drawVArrows(xArrow: number, xGhost: number, yOf: (v: number) => number, st: WalkState, pillX: number, maxX: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const wide = isWide();
      const a = p.a;
      const r = result();
      const aw = wide ? 5 : 4;
      const ya = yOf(a);
      const f = `700 ${wide ? 13 : 11}px ${theme.font}`;
      if (op() === 'minus' && p.b !== 0) {
        const yb = yOf(a + p.b);
        arrow(xGhost, ya, xGhost, yb, colB(), aw - 1.5, { dash: [7, 6], alpha: 0.55 });
        arrowTag(operand(p.b), xGhost, (ya + yb) / 2, f, true);
        if (st.phase === 'turn') {
          const end = a + p.b * Math.cos(Math.PI * st.flip);
          const shift = Math.sin(Math.PI * st.flip) * 12;
          arrow(xArrow + shift, ya, xArrow + shift, yOf(end), colB(), aw, { alpha: 0.85 });
        }
      }
      const moving = st.phase === 'walk' || st.phase === 'outro' || st.phase === 'done';
      if (moving && p.b !== 0) {
        if (st.phase === 'walk') arrow(xArrow, ya, xArrow, yOf(r), colB(), aw, { alpha: 0.18 });
        arrow(xArrow, ya, xArrow, yOf(st.pos), colB(), aw);
        if (st.phase !== 'walk') {
          const d = change(op(), p.b);
          arrowTag(d > 0 ? `+${d}` : num(d), xArrow, (ya + yOf(r)) / 2, `800 ${wide ? 14 : 12}px ${theme.font}`, false);
          hits.push({ id: 'end', x: xArrow, y: yOf(r) });
        }
      }
      // Start und Ergebnis als Schilder mit Hilfslinien
      const showResult = st.phase === 'done';
      const unit = scene() === 'thermo' ? ' °C' : ' m';
      const size = wide ? 13 : 11;
      g.save();
      g.setLineDash([3, 4]);
      g.lineWidth = 1.2;
      g.strokeStyle = withAlpha(colA(), 0.8);
      g.beginPath();
      g.moveTo(xArrow - 18, ya);
      g.lineTo(pillX - 26, ya);
      g.stroke();
      if (showResult && r !== a) {
        g.strokeStyle = withAlpha(colR(), 0.8);
        g.beginPath();
        g.moveTo(xArrow - 18, yOf(r));
        g.lineTo(pillX - 26, yOf(r));
        g.stroke();
      }
      g.restore();
      let ra = ya;
      let rr = yOf(r);
      if (showResult && r !== a && Math.abs(ra - rr) < size * 1.9) {
        const mid = (ra + rr) / 2;
        const off = (size * 1.9) / 2;
        if (ra < rr) {
          ra = mid - off;
          rr = mid + off;
        } else {
          ra = mid + off;
          rr = mid - off;
        }
      }
      pill(num(a) + unit, pillX, ra, colA(), onColor(), size, pillX - 60, maxX);
      if (showResult && r !== a) pill(num(r) + unit, pillX, rr, colR(), onColor(), size, pillX - 60, maxX);
      hits.push({ id: 'start', x: xArrow, y: ya });
      if (!ctx.locked && !walk && (hover === 'start' || dragging === 'start')) ring(xArrow, ya, colA());
      if (!ctx.locked && !walk && (hover === 'end' || dragging === 'end') && moving) ring(xArrow, yOf(r), colB());
      if (!walk) handleDot(xArrow, ya, colA());
    }

    function drawThermo(S: Rect, st: WalkState): void {
      const g = surface.g;
      const theme = ctx.theme;
      const wide = isWide();
      const [lo, hi] = currentRange();
      const top = S.y + 40;
      const bottom = S.y + S.h - (wide ? 70 : 58);
      const yOf = (v: number) => bottom - ((v - lo) / (hi - lo)) * (bottom - top);
      // Hintergrund: oben warm, unten kalt
      const bg = g.createLinearGradient(0, S.y, 0, S.y + S.h);
      bg.addColorStop(0, withAlpha(theme.series[3]!, theme.dark ? 0.16 : 0.12));
      bg.addColorStop(0.5, withAlpha(theme.text, 0.02));
      bg.addColorStop(1, withAlpha(theme.series[0]!, theme.dark ? 0.2 : 0.14));
      g.fillStyle = bg;
      roundRect(g, S.x, S.y, S.w, S.h, 16);
      g.fill();
      drawSun(g, S.x + S.w - 34, S.y + 34, wide ? 11 : 9, theme.series[3]!);
      drawSnowflake(g, S.x + S.w - 34, S.y + S.h - 34, wide ? 15 : 12, theme.series[0]!);

      const tx = S.x + S.w * (wide ? 0.3 : 0.28);
      const tw = wide ? 22 : 18;
      const bulbR = tw * 1.05;
      const bulbY = bottom + 22 + bulbR * 0.6;
      // Gefrierpunkt
      const y0 = yOf(0);
      g.save();
      g.setLineDash([5, 5]);
      g.strokeStyle = withAlpha(theme.series[0]!, 0.6);
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(S.x + 12, y0);
      g.lineTo(S.x + S.w - 12, y0);
      g.stroke();
      g.restore();
      const nearIcon = Math.abs(y0 - (S.y + 34)) < 28 || Math.abs(y0 - (S.y + S.h - 34)) < 28;
      text(g, ctx.t('freezing'), S.x + S.w - (nearIcon ? 62 : 14), y0 - 9, { font: `600 ${wide ? 11.5 : 10}px ${theme.font}`, color: withAlpha(theme.series[0]!, 0.95), align: 'right' });

      // Glasröhre
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.18)';
      g.shadowBlur = 10;
      g.shadowOffsetY = 3;
      g.fillStyle = theme.dark ? '#1c2533' : '#ffffff';
      roundRect(g, tx - tw / 2 - 4, top - 18, tw + 8, bulbY - top + 18, (tw + 8) / 2);
      g.fill();
      g.beginPath();
      g.arc(tx, bulbY, bulbR + 4, 0, Math.PI * 2);
      g.fill();
      g.restore();
      g.strokeStyle = withAlpha(theme.text, 0.25);
      g.lineWidth = 1.5;
      roundRect(g, tx - tw / 2 - 4, top - 18, tw + 8, bulbY - top + 18, (tw + 8) / 2);
      g.stroke();
      // Flüssigkeit
      const liquid = theme.series[1]!;
      const ly = clamp(yOf(st.pos), top - 10, bottom + 10);
      g.fillStyle = liquid;
      roundRect(g, tx - tw / 2 + 3, ly, tw - 6, bulbY - ly, (tw - 6) / 2);
      g.fill();
      g.beginPath();
      g.arc(tx, bulbY, bulbR, 0, Math.PI * 2);
      g.fill();
      // Glanz
      g.fillStyle = 'rgba(255,255,255,0.45)';
      roundRect(g, tx - tw / 2 + 4, top - 10, 3.5, bulbY - top - bulbR, 2);
      g.fill();
      g.beginPath();
      g.arc(tx - bulbR * 0.35, bulbY - bulbR * 0.35, bulbR * 0.22, 0, Math.PI * 2);
      g.fill();
      // Skala links
      drawVScale(tx - tw / 2 - 8, yOf, lo, hi, -1, ctx.t('unitC'));

      const xArrow = tx + tw / 2 + (wide ? 46 : 34);
      const xGhost = xArrow + (wide ? 44 : 36);
      drawVArrows(xArrow, xGhost, yOf, st, S.x + S.w - (wide ? 48 : 40), S.x + S.w - 6);
    }

    function drawSea(S: Rect, st: WalkState, now: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const wide = isWide();
      const [lo, hi] = currentRange();
      const top = S.y + 40;
      const bottom = S.y + S.h - 26;
      const yOf = (v: number) => bottom - ((v - lo) / (hi - lo)) * (bottom - top);
      const y0 = yOf(0);
      g.save();
      roundRect(g, S.x, S.y, S.w, S.h, 16);
      g.clip();
      // Himmel
      const sky = g.createLinearGradient(0, S.y, 0, y0);
      sky.addColorStop(0, theme.dark ? '#16243a' : '#bfe0f7');
      sky.addColorStop(1, theme.dark ? '#24364f' : '#eaf6ff');
      g.fillStyle = sky;
      g.fillRect(S.x, S.y, S.w, y0 - S.y);
      // Wasser
      const sea = g.createLinearGradient(0, y0, 0, S.y + S.h);
      sea.addColorStop(0, theme.dark ? '#1d5f86' : '#4aa7d8');
      sea.addColorStop(1, theme.dark ? '#0a2236' : '#11507e');
      g.fillStyle = sea;
      g.fillRect(S.x, y0, S.w, S.y + S.h - y0);
      // Lichtstrahlen im Wasser
      g.fillStyle = 'rgba(255,255,255,0.05)';
      for (let i = 0; i < 4; i++) {
        const x = S.x + S.w * (0.15 + i * 0.24);
        g.beginPath();
        g.moveTo(x, y0);
        g.lineTo(x + 26, y0);
        g.lineTo(x + 70, S.y + S.h);
        g.lineTo(x + 20, S.y + S.h);
        g.closePath();
        g.fill();
      }

      // Eisberg (zum größten Teil unter Wasser)
      const ix = S.x + S.w * 0.04;
      const iw = S.w * 0.3;
      const peak = Math.min(y0 - 30, top + 4);
      const deep = Math.min(bottom + 10, y0 + (bottom - y0) * 0.92);
      const berg: [number, number][] = [
        [ix + iw * 0.05, y0],
        [ix + iw * 0.2, lerp(y0, peak, 0.55)],
        [ix + iw * 0.38, peak],
        [ix + iw * 0.55, lerp(y0, peak, 0.7)],
        [ix + iw * 0.72, lerp(y0, peak, 0.35)],
        [ix + iw * 0.95, y0],
        [ix + iw * 1.05, lerp(y0, deep, 0.35)],
        [ix + iw * 0.92, lerp(y0, deep, 0.8)],
        [ix + iw * 0.6, deep],
        [ix + iw * 0.2, lerp(y0, deep, 0.85)],
        [ix - iw * 0.05, lerp(y0, deep, 0.4)],
      ];
      const ice = g.createLinearGradient(ix, 0, ix + iw, 0);
      ice.addColorStop(0, '#ffffff');
      ice.addColorStop(1, '#cfe9f7');
      g.fillStyle = ice;
      g.beginPath();
      berg.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
      g.closePath();
      g.fill();
      // Facetten für Tiefe
      g.fillStyle = 'rgba(110,170,210,0.32)';
      g.beginPath();
      g.moveTo(ix + iw * 0.38, peak);
      g.lineTo(ix + iw * 0.55, lerp(y0, peak, 0.7));
      g.lineTo(ix + iw * 0.72, lerp(y0, peak, 0.35));
      g.lineTo(ix + iw * 0.95, y0);
      g.lineTo(ix + iw * 1.05, lerp(y0, deep, 0.35));
      g.lineTo(ix + iw * 0.92, lerp(y0, deep, 0.8));
      g.lineTo(ix + iw * 0.6, deep);
      g.lineTo(ix + iw * 0.48, lerp(y0, deep, 0.4));
      g.closePath();
      g.fill();
      g.fillStyle = 'rgba(255,255,255,0.6)';
      g.beginPath();
      g.moveTo(ix + iw * 0.38, peak);
      g.lineTo(ix + iw * 0.2, lerp(y0, peak, 0.55));
      g.lineTo(ix + iw * 0.3, lerp(y0, peak, 0.4));
      g.closePath();
      g.fill();
      // Unterwasserteil abdunkeln
      g.save();
      g.beginPath();
      g.rect(S.x, y0, S.w, S.y + S.h - y0);
      g.clip();
      g.fillStyle = theme.dark ? 'rgba(10,40,70,0.55)' : 'rgba(30,110,170,0.45)';
      g.beginPath();
      berg.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
      g.closePath();
      g.fill();
      g.restore();
      // Wellen
      g.strokeStyle = theme.dark ? 'rgba(160,215,245,0.9)' : 'rgba(255,255,255,0.95)';
      g.lineWidth = 2.5;
      g.beginPath();
      const phase = walk ? now / 600 : 0;
      for (let x = S.x; x <= S.x + S.w; x += 4) {
        const yy = y0 + Math.sin(x / 14 + phase) * 2;
        if (x === S.x) g.moveTo(x, yy);
        else g.lineTo(x, yy);
      }
      g.stroke();
      g.restore();
      // Beschriftung „Meeresspiegel“ dort, wo sie Pfeilschilder und Schilder nicht verdeckt
      const busy = [yOf(p.a), yOf(result()), (yOf(p.a) + yOf(result())) / 2];
      if (op() === 'minus') busy.push((yOf(p.a) + yOf(p.a + p.b)) / 2);
      const seaY = [y0 - 10, y0 + 13].find((cand) => busy.every((b) => Math.abs(b - cand) > 15));
      if (seaY !== undefined) {
        const above = seaY < y0;
        text(g, ctx.t('sea'), S.x + S.w - 12, seaY, { font: `700 ${wide ? 11.5 : 10}px ${theme.font}`, color: above ? (theme.dark ? '#cfe9f7' : '#11507e') : '#e8f6ff', align: 'right' });
      }

      // Skala
      const sx = S.x + S.w * 0.44;
      g.strokeStyle = theme.text;
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(sx, top - 8);
      g.lineTo(sx, bottom + 8);
      g.stroke();
      const scaleBg = theme.dark ? 'rgba(16,22,31,0.55)' : 'rgba(255,255,255,0.6)';
      g.fillStyle = scaleBg;
      roundRect(g, sx - 3, top - 30, 40, bottom - top + 42, 8);
      g.fill();
      drawVScale(sx, yOf, lo, hi, 1, ctx.t('unitM'));

      // Pinguin: über Wasser auf dem Eisberg, unter Wasser schwimmend
      const s = wide ? clamp(S.h * 0.13, 32, 64) : clamp(S.h * 0.12, 26, 40);
      const py = yOf(st.pos);
      // rechte Kante des Eisbergs über Wasser (vom Gipfel zur Wasserlinie)
      const edge = [berg[2]!, berg[3]!, berg[4]!, berg[5]!];
      let standX = edge[3]![0];
      for (let i = 0; i < 3; i++) {
        const [xa, ya] = edge[i]!;
        const [xb, yb] = edge[i + 1]!;
        if (py >= ya && py <= yb) standX = lerp(xa, xb, (py - ya) / Math.max(1, yb - ya));
      }
      if (py < edge[0]![1]) standX = edge[0]![0];
      const swimX = sx - s * 0.95;
      // Übergang an der Wasserlinie: zwischen 0 und −1 vom Stehen zum Schwimmen
      const k = clamp(-st.pos, 0, 1);
      const d = change(op(), p.b);
      const swimAngle = st.phase === 'walk' ? (d > 0 ? 0.25 : Math.PI - 0.25) : Math.PI / 2 - 0.25;
      const angle = lerp(0, swimAngle, ease.inOutCubic(k));
      const px = lerp(standX - s * 0.22, swimX, k);
      const flap = st.phase === 'walk' ? Math.sin(now / 120) * 0.3 : 0.12;
      drawPenguin(g, px, py + s * 0.48 * k, s, 1, angle, flap);
      if (k >= 1) {
        // Luftblasen
        g.strokeStyle = 'rgba(255,255,255,0.7)';
        g.lineWidth = 1.3;
        for (let i = 0; i < 3; i++) {
          const t = walk ? (now / 900 + i / 3) % 1 : 0.2 + i * 0.3;
          g.beginPath();
          g.arc(px + s * 0.35 + Math.sin(t * 6 + i) * 3, py - s * 0.15 - t * s * 1.1, 2 + i, 0, Math.PI * 2);
          g.stroke();
        }
      }

      const xArrow = sx + (wide ? 64 : 54);
      const xGhost = xArrow + (wide ? 44 : 36);
      drawVArrows(xArrow, xGhost, yOf, st, S.x + S.w - (wide ? 46 : 38), S.x + S.w - 6);
    }

    /** Rechte bzw. untere Spalte: Gleichung, Umformung und Text zur Sachsituation. */
    function drawInfo(R: Rect, st: WalkState, now: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const wide = isWide();
      const sc = scene() as Exclude<Scene, 'gerade'>;
      const s = story(sc, p.a, op(), p.b, lang);
      const showResult = st.phase === 'done';
      const lines: [string, string, boolean][] = [
        [s.start, colA(), st.phase === 'intro'],
        [s.change, colB(), st.phase === 'turn' || st.phase === 'walk'],
        [showResult ? s.result : '?', colR(), st.phase === 'outro' || st.phase === 'done'],
      ];
      const eqSize = wide ? clamp(R.w * 0.1, 26, 50) : 25;
      const rwSize = wide ? 17 : 13;
      const size = wide ? clamp(R.w * 0.04, 13, 17) : 12;
      const rowGap = size * 1.3;
      const disc = wide ? 11 : 8;
      const textX = R.x + (wide ? 24 : 6) + disc * 2 + 10;
      const maxW = R.x + R.w - (wide ? 20 : 4) - textX;
      const font = `600 ${size}px ${theme.font}`;
      const bold = `700 ${size}px ${theme.font}`;
      // Zeilen umbrechen und Höhe bestimmen
      g.font = bold;
      const wrapped = lines.map(([line]) => {
        const rows: string[] = [];
        let cur = '';
        for (const w of line.split(' ')) {
          const next = cur ? `${cur} ${w}` : w;
          if (g.measureText(next).width > maxW && cur) {
            rows.push(cur);
            cur = w;
          } else cur = next;
        }
        rows.push(cur);
        return rows;
      });
      const between = wide ? size * 1.1 : size * 0.55;
      const storyH = wrapped.reduce((h, rows) => h + Math.max(disc * 2, rows.length * rowGap), 0) + between * 2;
      const pad = wide ? 18 : 0;
      const hasRw = rewrite(p.a, op(), p.b) !== null;
      const headH = eqSize * 1.1 + (hasRw ? rwSize * 1.9 : 0);
      const gap = wide ? 26 : 10;
      const total = headH + gap + storyH + pad * 2;
      let y = R.y + Math.max(wide ? 10 : 2, (R.h - total) / 2);
      drawEquation(R.x + R.w / 2, y + eqSize * 0.55, eqSize, R.w - 12, now);
      if (hasRw) drawRewrite(R.x + R.w / 2, y + eqSize * 1.1 + rwSize * 0.8, rwSize);
      y += headH + gap;
      if (wide) {
        g.fillStyle = withAlpha(theme.text, theme.dark ? 0.05 : 0.035);
        roundRect(g, R.x + 6, y, R.w - 12, storyH + pad * 2, 14);
        g.fill();
        y += pad;
      }
      lines.forEach(([, color, on], i) => {
        const rows = wrapped[i]!;
        const h = Math.max(disc * 2, rows.length * rowGap);
        const cy = y + h / 2;
        const dx = R.x + (wide ? 24 : 6) + disc;
        g.fillStyle = on ? color : withAlpha(color, 0.55);
        g.beginPath();
        g.arc(dx, y + disc, disc, 0, Math.PI * 2);
        g.fill();
        text(g, String(i + 1), dx, y + disc + 0.5, { font: `800 ${disc * 1.15}px ${theme.font}`, color: onColor() });
        const top = cy - ((rows.length - 1) * rowGap) / 2;
        rows.forEach((row, k) => text(g, row, textX, top + k * rowGap, { font: on ? bold : font, color: on ? theme.text : withAlpha(theme.text, 0.82), align: 'left' }));
        y += h + between;
      });
    }

    /* ---------- Zeiger ---------- */
    function hitAt(px: number, py: number): Hit | null {
      if (ctx.locked || walk) return null;
      let best: Hit | null = null;
      let bestD = 22;
      for (const h of hits) {
        const d = Math.hypot(h.x - px, h.y - py);
        if (d < bestD) {
          best = h;
          bestD = d;
        }
      }
      return best;
    }

    function valueAt(px: number, py: number): number {
      const [lo, hi] = currentRange();
      if (vertical()) {
        const { scene: S } = vLayout();
        const wide = isWide();
        const top = S.y + 40;
        const bottom = scene() === 'thermo' ? S.y + S.h - (wide ? 70 : 58) : S.y + S.h - 26;
        return lo + ((bottom - py) / (bottom - top)) * (hi - lo);
      }
      const lay = hLayout();
      return lo + ((px - lay.x0) / (lay.x1 - lay.x0)) * (hi - lo);
    }

    surface.addTarget({
      contains: (px: number, py: number) => dragging !== null || hitAt(px, py) !== null,
      pointerDown: (pt: { px: number; py: number }) => {
        const h = hitAt(pt.px, pt.py);
        if (!h) return false;
        dragging = h.id;
        dragRange = currentRange();
        ctx.requestRender();
        return true;
      },
      pointerMove: (pt: { px: number; py: number }) => {
        if (!dragging) return;
        const v = clamp(Math.round(valueAt(pt.px, pt.py)), Math.ceil(dragRange![0]), Math.floor(dragRange![1]));
        if (dragging === 'start') ctx.set({ a: clamp(v, -20, 20) });
        else {
          const b = op() === 'plus' ? v - p.a : p.a - v;
          ctx.set({ b: clamp(b, -20, 20) });
        }
      },
      pointerUp: () => {
        if (!dragging) return;
        dragging = null;
        dragRange = null;
        rangeFrom = currentRange();
        range = rangeFrom;
        retarget();
        ctx.requestRender();
      },
      hover: (pt: { px: number; py: number } | null) => {
        const h = pt ? hitAt(pt.px, pt.py) : null;
        const id = h?.id ?? null;
        if (id !== hover) {
          hover = id;
          ctx.requestRender();
        }
        surface.setCursor(id ? (vertical() ? 'ns-resize' : 'ew-resize') : '');
      },
      wheel: () => false,
    });

    return {
      update(changed, source) {
        const relevant = ['a', 'b', 'op', 'scene', 'abs'].some((k) => changed.has(k));
        if (changed.has('show')) revealed = p.show;
        if (relevant || changed.has('show')) {
          walk = null;
          if (!p.show && (changed.has('a') || changed.has('b') || changed.has('op'))) revealed = false;
          const target = revealed ? result() : p.a;
          const facing = revealed ? walkPlan(op(), p.b).facing : 1;
          if (source === 'init' || source === 'replace' || changed.has('scene') || reduced) {
            figPos = target;
            figFacing = facing;
          }
          if (!dragging) retarget();
          if (source === 'init') {
            rangeTween.finish();
            range = targetRange();
          }
        }
        updateReadouts();
      },

      action(id) {
        if (id === 'go') startWalk();
        else if (id === 'new' && !ctx.locked) {
          const t = randomTask(Math.random);
          ctx.set({ a: t.a, op: t.op, b: t.b });
        }
        ctx.requestRender();
      },

      render() {
        const now = performance.now();
        const dt = Math.min(0.1, (now - lastFrame) / 1000);
        lastFrame = now;
        // Figur im Ruhezustand weich nachführen
        let moving = false;
        if (!walk) {
          const target = revealed ? result() : p.a;
          const facing = revealed ? walkPlan(op(), p.b).facing : 1;
          if (Math.abs(target - figPos) > 0.005) {
            figPos += (target - figPos) * Math.min(1, dt * 9);
            moving = true;
          } else figPos = target;
          if (Math.abs(facing - figFacing) > 0.01) {
            figFacing += Math.sign(facing - figFacing) * Math.min(Math.abs(facing - figFacing), dt * 5);
            moving = true;
          } else figFacing = facing;
        }
        hits = [];
        surface.begin();
        if (vertical()) drawVertical(now);
        else drawHorizontal(now);
        if (walk || moving || rangeTween.running || pop.running) ctx.requestRender();
      },

      destroy: () => surface.destroy(),
    };
  },
});
