import { defineSimulation, drawImageFit, prefersReducedMotion, roundRect, seededRandom, softShadow, Surface, text, Tween, ease, withAlpha, type Rect } from '../../../sim-core';
import { binomialCoefficient, binomialMean, binomialPmf, binomialSd, checkGalton, dropBalls, galtonTask, randomPath, roundedRelation, statsFromCounts, type GaltonTask } from './model';

const L = (de: string, en: string) => ({ de, en });
/** Sekunden pro Reihe (Fallzeit von Nagel zu Nagel). */
const ROW_TIME = 0.16;
const MAX_FLYING = 600;

interface Ball {
  path: number[];
  /** Zeit seit dem Start in Sekunden. */
  t: number;
  /** Fach am Ende (Anzahl der Abpraller nach rechts). */
  bin: number;
  hue: number;
  /** Fallphase ins Fach: Höhe (Pixel) und Geschwindigkeit. */
  fallY?: number;
  fallStart?: number;
  fallV?: number;
}

interface Geometry {
  board: Rect;
  bins: Rect;
  top: number;
  dx: number;
  dy: number;
  cx: number;
  ballR: number;
  pegR: number;
}

/**
 * Galtonbrett: Kugeln prallen an n Nagelreihen jeweils mit Wahrscheinlichkeit p
 * nach rechts ab. Die Anzahl k der Rechts-Abpraller bestimmt das Fach – so
 * entsteht die Binomialverteilung B(n; p). Dazu Übungsaufgaben: Anzahl der
 * Wege zu einem Fach und Wahrscheinlichkeit für ein Fach.
 */
export default defineSimulation({
  id: 'galtonbrett',
  animated: true,
  layout: { aspect: 1.25, aspectNarrow: 0.78 },
  groups: [
    { id: 'theory', label: L('Theorie einblenden', 'Show theory') },
    { id: 'anim', label: L('Automatisch', 'Automatic') },
  ],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Thema', 'Topic'),
      options: [
        { value: 'board', label: L('Kugeln fallen lassen', 'Dropping balls') },
        { value: 'quiz', label: L('Üben: Wege und Wahrscheinlichkeiten', 'Practice: paths and probabilities') },
      ],
      default: 'board',
    },
    { key: 'q', type: 'number', label: L('Aufgabe Nr.', 'Task no.'), min: 1, max: 999, step: 1, default: 1, visibleIf: (v) => v.mode === 'quiz' },
    { key: 'ans', type: 'text', label: L('Deine Antwort', 'Your answer'), default: '', maxLength: 16, placeholder: L('z. B. 6 oder 37,5', 'e.g. 6 or 37.5'), visibleIf: (v) => v.mode === 'quiz' },
    { key: 'n', type: 'number', label: L('Anzahl der Nagelreihen n', 'Number of rows n'), min: 1, max: 16, step: 1, default: 8, visibleIf: (v) => v.mode !== 'quiz' },
    { key: 'p', type: 'number', label: L('Wahrscheinlichkeit für „rechts“ p', 'Probability of “right” p'), min: 0.05, max: 0.95, step: 0.05, default: 0.5, visibleIf: (v) => v.mode !== 'quiz' },
    { key: 'binomial', type: 'boolean', group: 'theory', label: L('Erwartete Anzahl je Fach (Binomialverteilung)', 'Expected count per bin (binomial distribution)'), default: false },
    { key: 'normal', type: 'boolean', group: 'theory', label: L('Glockenkurve (Normalverteilung)', 'Bell curve (normal distribution)'), default: false },
    { key: 'pascal', type: 'boolean', group: 'theory', label: L('Anzahl der Wege an den Nägeln (Pascal’sches Dreieck)', 'Number of paths at the pegs (Pascal’s triangle)'), default: false },
    { key: 'path', type: 'boolean', group: 'theory', label: L('Weg der letzten Kugel', 'Path of the last ball'), default: true },
    { key: 'rate', type: 'number', group: 'anim', label: L('Kugeln pro Sekunde', 'Balls per second'), min: 1, max: 80, step: 1, default: 8 },
  ],
  actions: [
    { id: 'one', label: L('1 Kugel', '1 ball'), primary: true },
    { id: 'ten', label: L('10 Kugeln', '10 balls') },
    { id: 'hundred', label: L('100 Kugeln', '100 balls') },
    { id: 'instant', label: L('1000 sofort', '1000 instantly') },
    { id: 'reset', label: L('Leeren', 'Empty') },
    { id: 'check', label: L('Prüfen', 'Check'), primary: true, visibleIf: (v) => v.mode === 'quiz' },
    { id: 'newq', label: L('Neue Aufgabe', 'New task'), visibleIf: (v) => v.mode === 'quiz' },
  ],
  images: {
    board: 'holzbrett.webp',
    ball: 'stahlkugel.webp',
  },
  readouts: [
    { key: 'task', label: L('Aufgabe', 'Task') },
    { key: 'verdict', label: L('Rückmeldung', 'Feedback') },
    { key: 'count', label: L('Anzahl der Kugeln', 'Number of balls') },
    { key: 'last', label: L('Letzte Kugel', 'Last ball') },
    { key: 'stats', label: L('Mittelwert und Standardabweichung (Versuch)', 'Mean and standard deviation (experiment)') },
    { key: 'theory', label: L('Erwartungswert und Standardabweichung (Theorie)', 'Expected value and standard deviation (theory)'), spoiler: true },
  ],
  presets: [
    { id: 'start', label: L('Symmetrisch', 'Symmetric'), values: {} },
    { id: 'skew', label: L('Schief (p = 0,7)', 'Skewed (p = 0.7)'), values: { p: 0.7, binomial: true } },
    { id: 'pascal', label: L('Pascal’sches Dreieck', 'Pascal’s triangle'), values: { n: 6, pascal: true, binomial: true } },
    { id: 'bell', label: L('16 Reihen mit Glockenkurve', '16 rows with bell curve'), values: { n: 16, normal: true, binomial: true, rate: 40 } },
  ],
  strings: {
    de: {
      canvas: 'Galtonbrett mit Nagelreihen, fallenden Kugeln und nummerierten Auffangfächern; wahlweise mit der Anzahl der Wege an den Nägeln, der erwarteten Anzahl je Fach (waagerechte Striche) und der Glockenkurve',
      right: 'R',
      left: 'L',
      pathText: '{path} → {k}-mal rechts → Fach {k}',
      none: 'noch keine',
      stats: 'x̄ {mean}, s {sd}',
      theory: 'μ = n · p = {mu}, σ = √(n · p · (1 − p)) {sigma}',
      binomial: 'B({n}; {p})',
      bin: 'k',
      qPaths: 'Aufgabe {q}: Wie viele Wege führen bei {n} Reihen in Fach {k}?',
      qProb: 'Aufgabe {q}: n = {n}, p = {p}. Mit welcher Wahrscheinlichkeit landet eine Kugel in Fach {k}? (in %, eine Nachkommastelle)',
      okPaths: 'Richtig! Es gibt {v} Wege – das steht im Pascal’schen Dreieck.',
      okPaths1: 'Richtig! Es gibt nur 1 Weg: immer in dieselbe Richtung.',
      okProb: 'Richtig! P(X = {k}) = {c} · {p}^{k} · {q1}^{nk} ≈ {v} %',
      noPaths: 'Noch nicht. Tipp: An jedem Nagel addieren sich die Wege der beiden Nägel darüber.',
      noProb: 'Noch nicht. Tipp: P(X = k) = (Anzahl der Wege) · pᵏ · (1 − p)ⁿ⁻ᵏ, dann mal 100.',
      emptyMsg: 'Trag dein Ergebnis unter „Deine Antwort“ ein und tippe auf „Prüfen“.',
      wait: 'Deine Antwort fehlt noch.',
      target: 'Fach {k}?',
    },
    en: {
      canvas: 'Galton board with rows of pegs, falling balls and numbered collecting bins; optionally with the number of paths at the pegs, the expected count per bin (horizontal marks) and the bell curve',
      right: 'R',
      left: 'L',
      pathText: '{path} → {k} times right → bin {k}',
      none: 'none yet',
      stats: 'x̄ {mean}, s {sd}',
      theory: 'μ = n · p = {mu}, σ = √(n · p · (1 − p)) {sigma}',
      binomial: 'B({n}; {p})',
      bin: 'k',
      qPaths: 'Task {q}: With {n} rows, how many paths lead into bin {k}?',
      qProb: 'Task {q}: n = {n}, p = {p}. What is the probability that a ball lands in bin {k}? (in %, one decimal place)',
      okPaths: 'Correct! There are {v} paths – you can find them in Pascal’s triangle.',
      okPaths1: 'Correct! There is only 1 path: always the same way.',
      okProb: 'Correct! P(X = {k}) = {c} · {p}^{k} · {q1}^{nk} ≈ {v} %',
      noPaths: 'Not yet. Tip: at each peg, add the paths of the two pegs above it.',
      noProb: 'Not yet. Tip: P(X = k) = (number of paths) · pᵏ · (1 − p)ⁿ⁻ᵏ, then times 100.',
      emptyMsg: 'Enter your result under “Your answer” and tap “Check”.',
      wait: 'Your answer is still missing.',
      target: 'bin {k}?',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string | number>) =>
      ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));

    let task: GaltonTask = galtonTask(1, seededRandom(1));
    let taskState: { ok: boolean; got: number | null } | null = null;
    const quiz = () => p.mode === 'quiz';
    const solved = () => taskState?.ok === true;
    // Beim Üben gelten n und p der Aufgabe
    const N = () => (quiz() ? task.n : p.n);
    const Pp = () => (quiz() ? task.p : p.p);
    let counts: number[] = [];
    let flying: Ball[] = [];
    let queued = 0;
    let carry = 0;
    let lastPath: number[] | null = null;
    let lastBin = -1;
    let hueSeed = 0;
    /** Kugeln, die „sofort“ einsortiert wurden, wachsen animiert in die Fächer. */
    const grow = new Tween(900, ease.outCubic);
    let growFrom: number[] = [];
    let lastFrame = performance.now();
    const pulse: { bin: number; t: number }[] = [];

    function reset(): void {
      counts = Array.from({ length: N() + 1 }, () => 0);
      growFrom = counts.slice();
      flying = [];
      queued = 0;
      carry = 0;
      lastPath = null;
      lastBin = -1;
      pulse.length = 0;
      grow.finish();
      updateReadouts();
    }

    function launch(count: number): void {
      // Reduzierte Bewegung: Kugeln landen ohne Flug sofort im Fach.
      if (prefersReducedMotion()) {
        for (let i = 0; i < count; i++) {
          const path = randomPath(N(), Pp(), Math.random);
          land({ path, t: 0, bin: path.reduce((s, v) => s + v, 0), hue: 0 });
        }
        return;
      }
      for (let i = 0; i < count && flying.length < MAX_FLYING; i++) {
        const path = randomPath(N(), Pp(), Math.random);
        flying.push({ path, t: -i * 0.06, bin: path.reduce((s, v) => s + v, 0), hue: (hueSeed++ * 47) % 360 });
      }
    }

    function land(ball: Ball): void {
      counts[ball.bin] = (counts[ball.bin] ?? 0) + 1;
      lastPath = ball.path;
      lastBin = ball.bin;
      if (!prefersReducedMotion()) {
        pulse.push({ bin: ball.bin, t: performance.now() });
        if (pulse.length > 30) pulse.shift();
      }
      updateReadouts();
    }

    /** „= 2“ bei exakten Werten, sonst „≈ 1,30“ (zwei Stellen, mit Endnull). */
    const rel = (value: number) => {
      const r = roundedRelation(value, 2);
      return `${r.exact ? '=' : '≈'} ${r.exact ? fmt.num(value, 2) : fmt.fixed(value, 2)}`;
    };

    function taskText(): string {
      const pText = fmt.num(task.p, 1);
      return task.kind === 'paths' ? tr('qPaths', { q: p.q, n: task.n, k: task.k }) : tr('qProb', { q: p.q, n: task.n, p: pText, k: task.k });
    }

    function feedback(): { text: string; color: string } | null {
      if (!taskState) return null;
      if (taskState.got === null) return { text: ctx.t('wait'), color: ctx.theme.muted };
      if (taskState.ok) {
        if (task.kind === 'paths') return { text: tr(task.answer === 1 ? 'okPaths1' : 'okPaths', { v: task.answer }), color: ctx.theme.series[2]! };
        const sup = (x: number) => String(x).replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)]!);
        const text0 = tr('okProb', { k: task.k, c: binomialCoefficient(task.n, task.k), p: fmt.num(task.p, 1), q1: fmt.num(1 - task.p, 1), v: fmt.num(task.answer, 1), nk: task.n - task.k })
          .replace(`^${task.k}`, sup(task.k))
          .replace(`^${task.n - task.k}`, sup(task.n - task.k));
        return { text: text0, color: ctx.theme.series[2]! };
      }
      return { text: ctx.t(task.kind === 'paths' ? 'noPaths' : 'noProb'), color: ctx.theme.series[1]! };
    }

    function newTask(): void {
      task = galtonTask(p.q, seededRandom(p.q * 7919 + 67));
      taskState = null;
    }

    function wrapText(value: string, maxW: number, font: string): string[] {
      const g = surface.g;
      g.font = font;
      const lines: string[] = [];
      let line = '';
      for (const w of value.split(' ')) {
        const next = line ? `${line} ${w}` : w;
        if (g.measureText(next).width > maxW && line) {
          lines.push(line);
          line = w;
        } else line = next;
      }
      if (line) lines.push(line);
      return lines;
    }

    /** Aufgabenkarte oben auf dem Brett und Markierung des gefragten Fachs. */
    function drawQuiz(geo: Geometry): void {
      const g = surface.g;
      const theme = ctx.theme;
      // gefragtes Fach
      const x = binX(geo, task.k);
      g.save();
      g.strokeStyle = theme.series[3]!;
      g.lineWidth = 3;
      g.setLineDash([6, 4]);
      roundRect(g, x - geo.dx / 2 + 2, geo.bins.y + 2, geo.dx - 4, geo.bins.h - 4, 6);
      g.stroke();
      g.restore();
      const label = solved() ? (task.kind === 'paths' ? String(task.answer) : `${fmt.num(task.answer, 1)} %`) : '?';
      const fs = Math.max(12, Math.min(20, geo.dx * 0.45));
      g.font = `800 ${fs}px ${theme.font}`;
      const tw = g.measureText(label).width + 12;
      g.fillStyle = withAlpha(theme.bg, 0.92);
      roundRect(g, x - tw / 2, geo.bins.y + geo.bins.h * 0.35 - fs * 0.7, tw, fs * 1.4, 6);
      g.fill();
      text(g, label, x, geo.bins.y + geo.bins.h * 0.35, { font: `800 ${fs}px ${theme.font}`, color: theme.series[3]! });
      // Karte
      const card: Rect = { x: geo.board.x + 8, y: geo.board.y + 6, w: geo.board.w - 16, h: 0 };
      const fb = feedback();
      const size = surface.width < 520 ? 12 : 14;
      const lines = wrapText(taskText(), card.w - 20, `600 ${size}px ${theme.font}`);
      const fbLines = fb ? wrapText(fb.text, card.w - 20, `700 ${size}px ${theme.font}`) : [];
      card.h = (lines.length + fbLines.length) * size * 1.3 + 12;
      g.fillStyle = withAlpha(theme.bg, 0.94);
      roundRect(g, card.x, card.y, card.w, card.h, 8);
      g.fill();
      g.textAlign = 'left';
      g.textBaseline = 'top';
      let y = card.y + 6;
      g.font = `600 ${size}px ${theme.font}`;
      g.fillStyle = theme.text;
      for (const l of lines) {
        g.fillText(l, card.x + 10, y);
        y += size * 1.3;
      }
      g.font = `700 ${size}px ${theme.font}`;
      g.fillStyle = fb?.color ?? theme.text;
      for (const l of fbLines) {
        g.fillText(l, card.x + 10, y);
        y += size * 1.3;
      }
    }

    function updateReadouts(): void {
      ctx.readout('task', quiz() ? taskText() : null);
      const fb = feedback();
      ctx.readout('verdict', quiz() ? (fb ? fb.text : ctx.t('emptyMsg')) : null);
      const stats = statsFromCounts(counts);
      ctx.readout('count', fmt.num(stats.total, 0));
      if (lastPath) {
        const path = lastPath.length ? lastPath.map((v) => ctx.t(v ? 'right' : 'left')).join(' ') : '–';
        ctx.readout('last', tr('pathText', { path, k: lastBin }));
      } else ctx.readout('last', ctx.t('none'));
      ctx.readout('stats', stats.total ? tr('stats', { mean: rel(stats.mean), sd: rel(stats.sd) }) : '–');
      ctx.readout('theory', tr('theory', { mu: fmt.num(binomialMean(N(), Pp()), 2), sigma: rel(binomialSd(N(), Pp())) }));
    }

    /* ---------- Geometrie ---------- */
    function geometry(): Geometry {
      const w = surface.width;
      const h = surface.height;
      const wide = w >= 640;
      const board: Rect = wide ? { x: w * 0.06, y: 10, w: w * 0.88, h: h - 20 } : { x: 6, y: 6, w: w - 12, h: h - 12 };
      const n = N();
      const binsH = board.h * 0.36;
      // beim Üben Platz für die Aufgabenkarte oben lassen
      const extra = p.mode === 'quiz' ? (w < 520 ? 66 : 44) : 0;
      const pegArea = board.h - binsH - 56 - extra;
      const dx = Math.min((board.w - 24) / (n + 1.6), 64);
      const dy = Math.min(dx * 0.9, pegArea / Math.max(n, 1));
      const top = board.y + 52 + extra;
      const bottomPegs = top + (n - 1) * dy;
      const binsTop = bottomPegs + Math.max(18, dy * 0.6);
      const bins: Rect = { x: board.x + 10, y: binsTop, w: board.w - 20, h: board.y + board.h - 10 - binsTop };
      const ballR = Math.max(2.2, Math.min(dx * 0.17, 7.5));
      const pegR = Math.max(1.8, Math.min(dx * 0.075, 4.2));
      return { board, bins, top, dx, dy, cx: board.x + board.w / 2, ballR, pegR };
    }

    const pegX = (geo: Geometry, row: number, j: number) => geo.cx + (j - row / 2) * geo.dx;
    const pegY = (geo: Geometry, row: number) => geo.top + row * geo.dy;
    const binX = (geo: Geometry, k: number) => geo.cx + (k - N() / 2) * geo.dx;

    interface BinScale {
      /** Höhe pro Kugel in Pixeln (gemittelt über eine Reihe). */
      unit: number;
      /** Werden einzelne Kugeln gezeichnet (sonst Balken)? */
      balls: boolean;
      perRow: number;
      rowH: number;
    }

    /** Wie hoch werden die Fächer gefüllt – als Kugelstapel oder (wenn es zu viele sind) als Balken? */
    function binScale(geo: Geometry): BinScale {
      const total = counts.reduce((s, c) => s + c, 0);
      const maxCount = Math.max(1, ...counts);
      const expectedMax = p.binomial || p.normal ? total * Math.max(...counts.map((_, k) => binomialPmf(N(), k, Pp()))) : 0;
      const perRow = Math.max(1, Math.floor((geo.dx * 0.86) / (2 * geo.ballR)));
      const rowH = geo.ballR * 2 * 0.9;
      const avail = geo.bins.h * 0.88;
      const ballUnit = rowH / perRow;
      const needed = Math.max(Math.ceil(maxCount / perRow) * rowH, expectedMax * ballUnit);
      const balls = needed <= avail;
      return { unit: balls ? ballUnit : avail / Math.max(maxCount, expectedMax, 1), balls, perRow, rowH };
    }

    /** Platz der i-ten Kugel (ab 0) im Fach k. */
    function slot(geo: Geometry, scale: BinScale, k: number, index: number): [number, number] {
      const bottom = geo.bins.y + geo.bins.h;
      if (!scale.balls) return [binX(geo, k), bottom - geo.ballR - index * scale.unit];
      const row = Math.floor(index / scale.perRow);
      const col = index % scale.perRow;
      const width = scale.perRow * 2 * geo.ballR;
      const shift = scale.perRow > 1 ? (row % 2 ? 0.22 : -0.22) * geo.ballR : 0;
      return [binX(geo, k) - width / 2 + geo.ballR + col * 2 * geo.ballR + shift, bottom - geo.ballR - row * scale.rowH];
    }

    /** Position einer Kugel auf dem Weg durch die Nagelreihen (oder `null`, wenn sie im Fall ins Fach ist). */
    function ballPosition(geo: Geometry, ball: Ball): [number, number] | null {
      const n = N();
      const lift = geo.pegR + geo.ballR + 1;
      const t = ball.t / ROW_TIME;
      if (t < 0) return null;
      // Einlauf von oben bis zum ersten Nagel
      if (t < 1) {
        const u = t;
        return [geo.cx, geo.top - 40 - lift + 40 * u * u];
      }
      const seg = Math.floor(t - 1);
      if (seg >= n) return null;
      const u = t - 1 - seg;
      let j = 0;
      for (let i = 0; i < seg; i++) j += ball.path[i]!;
      const dir = ball.path[seg]!;
      const x0 = pegX(geo, seg, j);
      const y0 = pegY(geo, seg) - lift;
      const x1 = seg + 1 < n ? pegX(geo, seg + 1, j + dir) : binX(geo, j + dir);
      const y1 = seg + 1 < n ? pegY(geo, seg + 1) - lift : pegY(geo, seg) + geo.dy * 0.9;
      // Abprall: seitlich ausweichen, kleiner Hüpfer nach oben, dann Fall
      const ux = ease.inOutCubic(u);
      const hop = Math.sin(Math.PI * Math.min(1, u * 1.15)) * geo.dy * 0.28;
      return [x0 + (x1 - x0) * ux, y0 + (y1 - y0) * u * u - hop];
    }

    /* ---------- Zeichnen ---------- */
    function drawBall(g: CanvasRenderingContext2D, x: number, y: number, r: number, hue: number, alpha = 1): void {
      const img = ctx.images.get('ball');
      g.save();
      g.globalAlpha = alpha;
      if (img) {
        g.drawImage(img, x - r, y - r, r * 2, r * 2);
      } else {
        const grad = g.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, `hsl(${hue} 55% 72%)`);
        grad.addColorStop(1, `hsl(${hue} 60% 34%)`);
        g.fillStyle = grad;
        g.beginPath();
        g.arc(x, y, r, 0, Math.PI * 2);
        g.fill();
      }
      g.restore();
    }

    function drawBoard(geo: Geometry): void {
      const g = surface.g;
      const theme = ctx.theme;
      const { board } = geo;
      g.save();
      softShadow(g, theme.dark, 24, 8);
      roundRect(g, board.x, board.y, board.w, board.h, 16);
      g.fillStyle = theme.dark ? '#2a2119' : '#d9b98a';
      g.fill();
      g.restore();
      g.save();
      roundRect(g, board.x, board.y, board.w, board.h, 16);
      g.clip();
      const wood = ctx.images.get('board');
      if (wood) {
        drawImageFit(g, wood, board, 'cover');
        if (theme.dark) {
          g.fillStyle = 'rgba(0,0,0,0.45)';
          g.fillRect(board.x, board.y, board.w, board.h);
        }
      } else {
        // Holzmaserung als Vektorgrafik
        const grad = g.createLinearGradient(board.x, 0, board.x + board.w, 0);
        const base = theme.dark ? ['#3a2c20', '#2c2118', '#3a2c20'] : ['#e3c697', '#d2ad78', '#e0c08e'];
        grad.addColorStop(0, base[0]!);
        grad.addColorStop(0.5, base[1]!);
        grad.addColorStop(1, base[2]!);
        g.fillStyle = grad;
        g.fillRect(board.x, board.y, board.w, board.h);
        g.strokeStyle = theme.dark ? 'rgba(0,0,0,0.25)' : 'rgba(120,80,40,0.10)';
        g.lineWidth = 1.2;
        for (let i = 0; i < 26; i++) {
          const x = board.x + (board.w * (i + 0.5)) / 26;
          g.beginPath();
          g.moveTo(x, board.y);
          for (let y = board.y; y <= board.y + board.h; y += 24) {
            g.lineTo(x + Math.sin(y * 0.021 + i * 1.7) * 5 + Math.sin(y * 0.007 + i) * 7, y);
          }
          g.stroke();
        }
      }
      // Glasscheibe: leichter Glanz
      const shine = g.createLinearGradient(board.x, board.y, board.x + board.w * 0.6, board.y + board.h);
      shine.addColorStop(0, 'rgba(255,255,255,0.16)');
      shine.addColorStop(0.35, 'rgba(255,255,255,0.02)');
      shine.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = shine;
      g.fillRect(board.x, board.y, board.w, board.h);
      g.restore();
      // Trichter oben
      const fy = geo.top - 40;
      g.fillStyle = theme.dark ? 'rgba(10,10,14,0.7)' : 'rgba(60,40,20,0.55)';
      g.beginPath();
      g.moveTo(geo.cx - 44, board.y + 8);
      g.lineTo(geo.cx + 44, board.y + 8);
      g.lineTo(geo.cx + geo.ballR + 3, fy);
      g.lineTo(geo.cx - geo.ballR - 3, fy);
      g.closePath();
      g.fill();
    }

    function drawPegs(geo: Geometry): void {
      const g = surface.g;
      const n = N();
      const showPascal = (p.pascal || (quiz() && solved())) && geo.dx >= 24;
      for (let row = 0; row < n; row++) {
        for (let j = 0; j <= row; j++) {
          const x = pegX(geo, row, j);
          const y = pegY(geo, row);
          g.fillStyle = 'rgba(0,0,0,0.25)';
          g.beginPath();
          g.arc(x + 1, y + 1.5, geo.pegR, 0, Math.PI * 2);
          g.fill();
          const grad = g.createRadialGradient(x - geo.pegR * 0.4, y - geo.pegR * 0.4, 0.5, x, y, geo.pegR);
          grad.addColorStop(0, '#fff6d5');
          grad.addColorStop(0.45, '#d4a73c');
          grad.addColorStop(1, '#7a5a17');
          g.fillStyle = grad;
          g.beginPath();
          g.arc(x, y, geo.pegR, 0, Math.PI * 2);
          g.fill();
          if (showPascal) {
            const label = fmt.num(binomialCoefficient(row, j), 0);
            const size = Math.max(9, Math.min(13, geo.dx * 0.26));
            g.font = `700 ${size}px ${ctx.theme.font}`;
            const tw = g.measureText(label).width + 8;
            g.fillStyle = withAlpha(ctx.theme.bg, 0.88);
            roundRect(g, x - tw / 2, y - geo.pegR - size - 8, tw, size + 4, 4);
            g.fill();
            text(g, label, x, y - geo.pegR - size / 2 - 6, { font: `700 ${size}px ${ctx.theme.font}`, color: ctx.theme.text });
          }
        }
      }
    }

    function drawPath(geo: Geometry): void {
      if (!p.path || !lastPath || lastPath.length !== N()) return;
      const g = surface.g;
      const color = ctx.theme.series[0]!;
      g.save();
      g.strokeStyle = withAlpha(color, 0.85);
      g.lineWidth = 3;
      g.lineJoin = 'round';
      g.shadowColor = color;
      g.shadowBlur = 8;
      g.beginPath();
      let j = 0;
      g.moveTo(geo.cx, geo.top - 30);
      for (let row = 0; row < N(); row++) {
        g.lineTo(pegX(geo, row, j), pegY(geo, row) - geo.pegR - 2);
        j += lastPath[row]!;
      }
      g.lineTo(binX(geo, j), geo.bins.y + 6);
      g.stroke();
      g.restore();
    }

    function drawBins(geo: Geometry, now: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const n = N();
      const { bins } = geo;
      const bottom = bins.y + bins.h;
      const scale = binScale(geo);
      const { unit, balls } = scale;
      const half = geo.dx / 2;
      const growT = grow.value;
      // Fachrückwand
      g.fillStyle = withAlpha(theme.bg, theme.dark ? 0.35 : 0.28);
      g.fillRect(binX(geo, 0) - half, bins.y, geo.dx * (n + 1), bins.h);
      for (let k = 0; k <= n; k++) {
        const x = binX(geo, k);
        const count = grow.running ? (growFrom[k] ?? 0) + ((counts[k] ?? 0) - (growFrom[k] ?? 0)) * growT : (counts[k] ?? 0);
        const pulseAge = pulse.filter((q) => q.bin === k).reduce((m, q) => Math.min(m, now - q.t), Infinity);
        const glow = pulseAge < 400 ? 1 - pulseAge / 400 : 0;
        if (balls && !grow.running) {
          // Einzelne Kugeln, in Reihen leicht versetzt gestapelt
          for (let i = 0; i < count; i++) {
            const [bx, by] = slot(geo, scale, k, i);
            drawBall(g, bx, by, geo.ballR, (k * 53 + i * 29) % 360);
          }
        } else {
          const h = count * unit;
          const grad = g.createLinearGradient(x - half, 0, x + half, 0);
          const c = theme.series[0]!;
          grad.addColorStop(0, withAlpha(c, 0.55));
          grad.addColorStop(0.5, withAlpha(c, 0.95));
          grad.addColorStop(1, withAlpha(c, 0.55));
          g.fillStyle = grad;
          roundRect(g, x - half * 0.78, bottom - h, half * 1.56, h, Math.min(4, h / 2));
          g.fill();
        }
        if (glow > 0) {
          g.fillStyle = withAlpha(theme.bg, 0.35 * glow);
          g.fillRect(x - half, bins.y, geo.dx, bins.h);
        }
      }
      // Trennwände
      g.strokeStyle = theme.dark ? 'rgba(220,200,170,0.55)' : 'rgba(70,45,20,0.7)';
      g.lineWidth = 2;
      for (let k = 0; k <= n + 1; k++) {
        const x = binX(geo, k) - half;
        g.beginPath();
        g.moveTo(x, bins.y);
        g.lineTo(x, bottom);
        g.stroke();
      }
      g.beginPath();
      g.moveTo(binX(geo, 0) - half, bottom);
      g.lineTo(binX(geo, n) + half, bottom);
      g.stroke();

      // Theorie: erwartete Anzahl je Fach und Glockenkurve
      const total = counts.reduce((s, c) => s + c, 0);
      if (total > 0 && p.binomial) {
        g.strokeStyle = theme.series[1]!;
        g.lineWidth = 3;
        for (let k = 0; k <= n; k++) {
          const e = total * binomialPmf(n, k, Pp());
          const y = bottom - e * unit;
          const x = binX(geo, k);
          g.beginPath();
          g.moveTo(x - half * 0.85, y);
          g.lineTo(x + half * 0.85, y);
          g.stroke();
        }
      }
      if (total > 0 && p.normal && n >= 2) {
        const mu = binomialMean(n, Pp());
        const sigma = binomialSd(n, Pp());
        g.strokeStyle = theme.series[2]!;
        g.lineWidth = 2.5;
        g.beginPath();
        const steps = 160;
        for (let i = 0; i <= steps; i++) {
          const kx = -0.5 + ((n + 1) * i) / steps;
          const density = Math.exp(-((kx - mu) ** 2) / (2 * sigma * sigma)) / (sigma * Math.sqrt(2 * Math.PI));
          const x = binX(geo, kx);
          const y = bottom - total * density * unit;
          if (i === 0) g.moveTo(x, y);
          else g.lineTo(x, y);
        }
        g.stroke();
      }
      // Beschriftung der Fächer
      const labelSize = Math.max(10, Math.min(14, geo.dx * 0.3));
      const labelColor = theme.text;
      const pillBg = withAlpha(theme.bg, theme.dark ? 0.7 : 0.8);
      for (let k = 0; k <= n; k++) {
        g.save();
        g.fillStyle = pillBg;
        roundRect(g, binX(geo, k) - labelSize * 0.8, bins.y + 4, labelSize * 1.6, labelSize + 6, 5);
        g.fill();
        g.restore();
        text(g, String(k), binX(geo, k), bins.y + 7 + labelSize / 2, { font: `700 ${labelSize}px ${theme.font}`, color: labelColor });
        const c = counts[k] ?? 0;
        if (c > 0 && geo.dx >= 26) {
          const shown = grow.running ? Math.round((growFrom[k] ?? 0) + (c - (growFrom[k] ?? 0)) * growT) : c;
          // über Säule und Erwartungsstrich, damit sich beide nicht überdecken
          const mark = p.binomial ? total * binomialPmf(n, k, Pp()) : 0;
          const stackH = balls && !grow.running ? Math.ceil(shown / scale.perRow) * scale.rowH + geo.ballR * 0.2 : shown * unit;
          const y = Math.max(bins.y + labelSize + 22, bottom - Math.max(stackH, mark * unit) - 10);
          text(g, fmt.num(shown, 0), binX(geo, k), y, { font: `600 ${Math.max(9, labelSize - 2)}px ${theme.font}`, color: labelColor });
        }
      }
      // Legende
      const items: [string, string][] = [];
      if (p.binomial) items.push([tr('binomial', { n, p: fmt.num(Pp(), 2) }), theme.series[1]!]);
      if (p.normal && n >= 2) items.push(['N(μ; σ²)', theme.series[2]!]);
      items.forEach(([label, color], i) => {
        const x = geo.board.x + 18;
        const y = geo.board.y + 22 + i * 22;
        g.fillStyle = pillBg;
        g.font = `700 13px ${theme.font}`;
        roundRect(g, x - 8, y - 10, g.measureText(label).width + 36, 20, 6);
        g.fill();
        g.strokeStyle = color;
        g.lineWidth = 3;
        g.beginPath();
        g.moveTo(x, y);
        g.lineTo(x + 16, y);
        g.stroke();
        text(g, label, x + 22, y + 1, { font: `700 13px ${theme.font}`, color: labelColor, align: 'left' });
      });
    }

    function drawFlying(geo: Geometry): void {
      const g = surface.g;
      const scale = binScale(geo);
      for (const ball of flying) {
        if (ball.t < 0) continue;
        const pos = ballPosition(geo, ball);
        if (pos) drawBall(g, pos[0], pos[1], geo.ballR, ball.hue);
        else if (ball.fallY !== undefined) {
          // Beim Fallen seitlich zum freien Platz im Fach gleiten
          const [sx, sy] = slot(geo, scale, ball.bin, counts[ball.bin] ?? 0);
          const start = ball.fallStart ?? ball.fallY;
          const u = Math.min(1, Math.max(0, (ball.fallY - start) / Math.max(1, sy - start)));
          drawBall(g, binX(geo, ball.bin) + (sx - binX(geo, ball.bin)) * ease.outCubic(u), ball.fallY, geo.ballR, ball.hue);
        }
      }
    }

    function step(dt: number, geo: Geometry): void {
      const scale = binScale(geo);
      const keep: Ball[] = [];
      for (const ball of flying) {
        ball.t += dt;
        if (ball.t / ROW_TIME - 1 >= N()) {
          if (ball.fallY === undefined) {
            ball.fallY = pegY(geo, Math.max(0, N() - 1)) + geo.dy * 0.9 - geo.pegR - geo.ballR - 1;
            ball.fallStart = ball.fallY;
            ball.fallV = geo.dy / ROW_TIME;
          }
          ball.fallV = (ball.fallV ?? 0) + 2600 * dt;
          ball.fallY += (ball.fallV ?? 0) * dt;
          const stackTop = slot(geo, scale, ball.bin, counts[ball.bin] ?? 0)[1];
          if (ball.fallY >= stackTop) {
            land(ball);
            continue;
          }
        }
        keep.push(ball);
      }
      flying = keep;
    }

    reset();

    return {
      update(changed, source) {
        if (changed.has('q') || source === 'init' || source === 'replace') newTask();
        if (changed.has('ans') && taskState && !taskState.ok) taskState = null;
        if ((changed.has('n') || changed.has('p') || changed.has('q') || changed.has('mode')) && source !== 'init') reset();
        if (counts.length !== N() + 1) reset();
        updateReadouts();
      },

      action(id) {
        if (id === 'check') {
          taskState = checkGalton(task, p.ans);
          updateReadouts();
          const fb = feedback();
          if (fb) ctx.announce(fb.text);
          ctx.requestRender();
          return;
        }
        if (id === 'newq') {
          ctx.set({ q: p.q >= 999 ? 1 : p.q + 1, ans: '' });
          return;
        }
        switch (id) {
          case 'one':
            launch(1);
            break;
          case 'ten':
            launch(10);
            break;
          case 'hundred':
            if (prefersReducedMotion()) launch(100);
            else queued += 100;
            break;
          case 'instant': {
            growFrom = counts.slice();
            const drop = dropBalls(N(), Pp(), 1000, Math.random);
            drop.counts.forEach((c, k) => (counts[k] = (counts[k] ?? 0) + c));
            lastPath = drop.lastPath;
            lastBin = drop.lastBin;
            grow.play();
            updateReadouts();
            break;
          }
          case 'reset':
            ctx.clock.pause();
            reset();
            break;
        }
        lastFrame = performance.now();
        ctx.requestRender();
      },

      tick(dt) {
        carry += dt * p.rate;
        const m = Math.floor(carry);
        carry -= m;
        if (m > 0) launch(Math.min(m, 20));
      },

      resetTime() {
        reset();
      },

      render() {
        const now = performance.now();
        const dt = Math.min(0.05, (now - lastFrame) / 1000);
        lastFrame = now;
        const geo = geometry();
        if (queued > 0) {
          const m = Math.min(queued, Math.max(1, Math.round(dt * 60)));
          launch(m);
          queued -= m;
        }
        step(dt, geo);
        surface.begin();
        drawBoard(geo);
        drawPath(geo);
        drawPegs(geo);
        drawBins(geo, now);
        drawFlying(geo);
        if (quiz()) drawQuiz(geo);
        if (flying.length || queued > 0 || grow.running || pulse.some((q) => now - q.t < 400)) ctx.requestRender();
      },

      destroy: () => surface.destroy(),
    };
  },
});
