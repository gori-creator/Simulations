import { defineSimulation, drawCard, ease, mixColor, Plot, roundRect, Surface, Tween, View3D, withAlpha, type Rect, type Vec3 } from '../../../sim-core';
import {
  applyOps,
  backSubstitution,
  feq,
  fneg,
  fracText,
  fval,
  gauss,
  isEchelon,
  isZero,
  lineInBox,
  ONE,
  opText,
  parseOp,
  parseSystem,
  planeBoxPolygon,
  randomSystem,
  ranks,
  ROMAN,
  solve,
  systemText,
  type Frac,
  type GaussStep,
  type Matrix,
  type Op,
  type Solution,
  type V3,
} from './model';

const L = (de: string, en: string) => ({ de, en });

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Gauß-Verfahren: Ein lineares Gleichungssystem wird Schritt für Schritt
 * auf Stufenform gebracht – automatisch oder mit eigenen Umformungen wie
 * „III − 2 · I“. Links die erweiterte Koeffizientenmatrix (oder die
 * Gleichungen) mit Pivot, neuen Nullen und Umformung, rechts die Geometrie:
 * bei drei Unbekannten je Gleichung eine Ebene, bei zwei eine Gerade. Die
 * Ebenen drehen sich bei jeder Umformung, die gemeinsame Lösung bleibt.
 */
export default defineSimulation({
  id: 'gauss-verfahren',
  dragHint: true,
  layout: { aspect: 1.6, aspectNarrow: 0.48 },
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'lgs',
      type: 'text',
      label: L('Gleichungssystem', 'System of equations'),
      default: 'x + y + z = 6; 2y + 5z = -4; 2x + 5y - z = 27',
      maxLength: 160,
      placeholder: L('z. B. x + y = 3; x − y = 1', 'e.g. x + y = 3; x − y = 1'),
      help: L(
        'Gleichungen mit „;“ trennen. Unbekannte x, y, z, w oder x1, x2 …; Zahlen mit Komma, Brüche wie 1/2x. Höchstens 5 Gleichungen und 5 Unbekannte.',
        'Separate equations with “;”. Unknowns x, y, z, w or x1, x2 …; decimals, fractions like 1/2x. At most 5 equations and 5 unknowns.',
      ),
    },
    {
      key: 'mode',
      type: 'choice',
      label: L('Vorgehen', 'Approach'),
      options: [
        { value: 'auto', label: L('Schritt für Schritt vorgemacht', 'Shown step by step') },
        { value: 'self', label: L('Selbst umformen', 'Transform yourself') },
      ],
      default: 'auto',
    },
    { key: 'k', type: 'number', label: L('Schritt', 'Step'), min: 0, max: 40, step: 1, default: 0, visibleIf: (v) => v.mode === 'auto' },
    {
      key: 'op',
      type: 'text',
      label: L('Nächste Umformung', 'Next row operation'),
      default: '',
      maxLength: 30,
      placeholder: L('z. B. III − 2·I', 'e.g. III − 2·I'),
      help: L(
        'Die linke Zeile wird ersetzt: „III − 2·I“, „2·III + 3·II“, „I ↔ II“ (tauschen), „II : 2“ (teilen).',
        'The row on the left is replaced: “III − 2·I”, “2·III + 3·II”, “I ↔ II” (swap), “II : 2” (divide).',
      ),
      visibleIf: (v) => v.mode === 'self',
    },
    {
      key: 'ops',
      type: 'text',
      label: L('Bisherige Umformungen', 'Operations so far'),
      default: '',
      maxLength: 240,
      placeholder: L('noch keine', 'none yet'),
      visibleIf: (v) => v.mode === 'self',
    },
    { key: 'int', type: 'boolean', label: L('Ohne Brüche rechnen (ganzzahlig)', 'Avoid fractions (integers only)'), default: true, visibleIf: (v) => v.mode === 'auto' },
    { key: 'jordan', type: 'boolean', label: L('Weiter bis zur Diagonalform (Gauß-Jordan)', 'Continue to diagonal form (Gauss–Jordan)'), default: false, visibleIf: (v) => v.mode === 'auto' },
    { key: 'eq', type: 'boolean', group: 'view', label: L('Als Gleichungen statt Matrix', 'As equations instead of a matrix'), default: false },
    { key: 'geo', type: 'boolean', group: 'view', label: L('Geometrie (Ebenen bzw. Geraden)', 'Geometry (planes or lines)'), default: true },
    { key: 'show', type: 'boolean', group: 'view', label: L('Lösung zeigen', 'Show solution'), default: true },
  ],
  resultsParam: 'show',
  actions: [
    { id: 'prev', label: L('◀ Zurück', '◀ Back'), visibleIf: (v) => v.mode === 'auto' },
    { id: 'next', label: L('Weiter ▶', 'Next ▶'), primary: true, visibleIf: (v) => v.mode === 'auto' },
    { id: 'end', label: L('Bis zum Ende', 'To the end'), visibleIf: (v) => v.mode === 'auto' },
    { id: 'apply', label: L('Umformen', 'Apply'), primary: true, visibleIf: (v) => v.mode === 'self' },
    { id: 'undo', label: L('Rückgängig', 'Undo'), visibleIf: (v) => v.mode === 'self' },
    { id: 'tip', label: L('Tipp', 'Hint'), visibleIf: (v) => v.mode === 'self' },
    { id: 'new', label: L('Neue Aufgabe', 'New task') },
  ],
  readouts: [
    { key: 'size', label: L('System', 'System') },
    { key: 'rank', label: L('Rang', 'Rank') },
    { key: 'kind', label: L('Lösbarkeit', 'Solvability'), spoiler: true },
    { key: 'sol', label: L('Lösungsmenge', 'Solution set'), spoiler: true },
  ],
  presets: [
    { id: 'book', label: L('Eindeutige Lösung (5 | 3 | −2)', 'Unique solution (5 | 3 | −2)'), values: { lgs: 'x + y + z = 6; 2y + 5z = -4; 2x + 5y - z = 27', mode: 'auto', k: 0 } },
    { id: 'frac', label: L('Mit Brüchen rechnen: 2x + 3y − z = 5 …', 'With fractions: 2x + 3y − z = 5 …'), values: { lgs: '2x + 3y - z = 5; 3x - 2y + 2z = 3; 5x + y - 3z = -2', mode: 'auto', k: 0, int: false } },
    { id: 'none', label: L('Keine Lösung (Widerspruch)', 'No solution (contradiction)'), values: { lgs: 'x + y + z = 1; x - y + 2z = 3; 2x + 3z = 5', mode: 'auto', k: 0 } },
    { id: 'line', label: L('Unendlich viele: Schnittgerade', 'Infinitely many: line of intersection'), values: { lgs: 'x + y + z = 6; x - y + 2z = 3; 2x + 3z = 9', mode: 'auto', k: 0 } },
    { id: 'plane', label: L('Unendlich viele: drei gleiche Ebenen', 'Infinitely many: three identical planes'), values: { lgs: 'x + 2y - z = 2; 2x + 4y - 2z = 4; -x - 2y + z = -2', mode: 'auto', k: 0 } },
    { id: 'two', label: L('Zwei Unbekannte: Geraden', 'Two unknowns: lines'), values: { lgs: 'x + y = 3; x - y = 1', mode: 'auto', k: 0 } },
    { id: 'over', label: L('Überbestimmt: 3 Gleichungen, 2 Unbekannte', 'Overdetermined: 3 equations, 2 unknowns'), values: { lgs: 'x + y = 3; x - y = 1; 2x + y = 6', mode: 'auto', k: 0 } },
    { id: 'under', label: L('Unterbestimmt: 2 Gleichungen, 3 Unbekannte', 'Underdetermined: 2 equations, 3 unknowns'), values: { lgs: 'x + 2y - z = 1; 2x + y + z = 5', mode: 'auto', k: 0 } },
    { id: 'four', label: L('Vier Unbekannte x₁ … x₄', 'Four unknowns x₁ … x₄'), values: { lgs: 'x1 + x2 + x3 + x4 = 10; x1 - x2 = -1; x3 - x4 = -1; 2x1 + x3 = 5', mode: 'auto', k: 0 } },
    { id: 'jordan', label: L('Gauß-Jordan bis zur Diagonalform', 'Gauss–Jordan to diagonal form'), values: { lgs: 'x + y + z = 6; 2y + 5z = -4; 2x + 5y - z = 27', mode: 'auto', k: 0, jordan: true } },
    { id: 'self', label: L('Übung: selbst umformen', 'Practice: transform yourself'), values: { lgs: 'x + y + z = 6; 2y + 5z = -4; 2x + 5y - z = 27', mode: 'self', op: 'III - 2·I', ops: '' } },
  ],
  strings: {
    de: {
      canvas: 'Links die erweiterte Koeffizientenmatrix (oder die Gleichungen) mit der aktuellen Zeilenumformung, rechts die Gleichungen als Ebenen oder Geraden mit der gemeinsamen Lösung.',
      start: 'Start: Ziel ist die Stufenform – unter den führenden Zahlen nur Nullen.',
      stepOf: 'Schritt {k} von {n}',
      swap: 'Zeilen tauschen, damit oben in Spalte {v} keine 0 steht.',
      comb: 'Erzeugt in Zeile {r} eine 0 in Spalte {v}.',
      combUp: 'Erzeugt oberhalb der Stufe eine 0 in Spalte {v}.',
      scale: 'Zeile {r} durch einen Faktor teilen – kleinere Zahlen.',
      norm: 'Führende Zahl in Zeile {r} auf 1 bringen.',
      echelon: 'Stufenform erreicht ✓',
      diagonal: 'Diagonalform erreicht ✓ – die Lösung steht in der rechten Spalte.',
      notYet: 'Noch keine Stufenform.',
      back: 'Rückwärts einsetzen',
      none: 'Zeile {r}: 0 = {c} ist falsch – Widerspruch. Das System hat keine Lösung.',
      infinite: 'Zu wenige Stufen: {f} frei wählbar – unendlich viele Lösungen.',
      unique: 'genau eine Lösung',
      noneShort: 'keine Lösung',
      infShort: 'unendlich viele Lösungen',
      param: 'Setze {v} = {p}:',
      empty: 'Bitte Gleichungen eingeben, z. B. x + y = 3; x − y = 1.',
      eqErr: 'Gleichung {l}: Es fehlt genau ein „=“.',
      tokErr: 'Gleichung {l} lässt sich ab Zeichen {p} nicht lesen.',
      nonlin: 'Gleichung {l} ist nicht linear (Produkte oder Potenzen von Unbekannten).',
      varsErr: 'Bitte 1 bis 5 Unbekannte verwenden.',
      rowsErr: 'Höchstens 5 Gleichungen.',
      opErr: 'Die Umformung „{o}“ lässt sich nicht lesen.',
      opRow: 'Diese Zeile gibt es nicht.',
      opTarget: 'Links und rechts muss eine andere Zeile stehen.',
      opZero: 'Mit 0 malnehmen oder durch 0 teilen ist verboten – dabei ginge Information verloren.',
      yourOps: 'Deine Umformungen',
      none0: 'noch keine',
      tip: 'Tipp: {o}',
      tipDone: 'Fertig – jetzt rückwärts einsetzen.',
      noGeo: 'Mit {n} Unbekannten gibt es kein Bild im Raum – die Rechnung funktioniert genauso.',
      noGeo1: 'Eine Unbekannte: jede Gleichung ist ein Punkt auf der Zahlengeraden.',
      planeOf: 'Ebene {r}',
      lineOf: 'Gerade {r}',
      sameSet: 'Jede Umformung dreht die Ebenen – die gemeinsamen Punkte bleiben gleich.',
      contra: 'kein gemeinsamer Punkt',
      zeroRow: '0 = 0',
      hidden: 'Lösung verdeckt',
      rules: 'Erlaubte Umformungen (ändern die Lösungen nicht):',
      rule1: 'zwei Zeilen tauschen: I ↔ II',
      rule2: 'eine Zeile mit einer Zahl ≠ 0 malnehmen: 2 · II',
      rule3: 'ein Vielfaches einer Zeile addieren: III − 2 · I',
      size: '{m} Gleichungen, {n} Unbekannte',
      rankText: 'Rang {r} (erweitert {a})',
    },
    en: {
      canvas: 'On the left the augmented matrix (or the equations) with the current row operation, on the right the equations as planes or lines with their common solution.',
      start: 'Start: the goal is row echelon form – only zeros below the leading entries.',
      stepOf: 'Step {k} of {n}',
      swap: 'Swap rows so that column {v} does not start with 0.',
      comb: 'Creates a 0 in column {v} of row {r}.',
      combUp: 'Creates a 0 in column {v} above the step.',
      scale: 'Divide row {r} by a common factor – smaller numbers.',
      norm: 'Make the leading entry of row {r} equal to 1.',
      echelon: 'Row echelon form reached ✓',
      diagonal: 'Diagonal form reached ✓ – the solution is in the right column.',
      notYet: 'Not in row echelon form yet.',
      back: 'Back substitution',
      none: 'Row {r}: 0 = {c} is false – contradiction. The system has no solution.',
      infinite: 'Too few steps: {f} can be chosen freely – infinitely many solutions.',
      unique: 'exactly one solution',
      noneShort: 'no solution',
      infShort: 'infinitely many solutions',
      param: 'Let {v} = {p}:',
      empty: 'Please enter equations, e.g. x + y = 3; x − y = 1.',
      eqErr: 'Equation {l}: exactly one “=” is needed.',
      tokErr: 'Equation {l} cannot be read from character {p} on.',
      nonlin: 'Equation {l} is not linear (products or powers of unknowns).',
      varsErr: 'Please use 1 to 5 unknowns.',
      rowsErr: 'At most 5 equations.',
      opErr: 'The operation “{o}” cannot be read.',
      opRow: 'This row does not exist.',
      opTarget: 'The rows on the left and right must differ.',
      opZero: 'Multiplying or dividing by 0 is not allowed – information would be lost.',
      yourOps: 'Your operations',
      none0: 'none yet',
      tip: 'Hint: {o}',
      tipDone: 'Done – now substitute backwards.',
      noGeo: 'With {n} unknowns there is no picture in space – the computation works just the same.',
      noGeo1: 'One unknown: every equation is a point on the number line.',
      planeOf: 'plane {r}',
      lineOf: 'line {r}',
      sameSet: 'Every operation turns the planes – the common points stay the same.',
      contra: 'no common point',
      zeroRow: '0 = 0',
      hidden: 'solution hidden',
      rules: 'Allowed row operations (they keep the solutions):',
      rule1: 'swap two rows: I ↔ II',
      rule2: 'multiply a row by a number ≠ 0: 2 · II',
      rule3: 'add a multiple of another row: III − 2 · I',
      size: '{m} equations, {n} unknowns',
      rankText: 'rank {r} (augmented {a})',
    },
  },
  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const th = () => ctx.theme;
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const F = (f: Frac) => fracText(f);
    const roman = (i: number) => ROMAN[i] ?? String(i + 1);

    /* -------------------------------------------------------------- */
    /* Zustand                                                         */
    /* -------------------------------------------------------------- */

    type Parsed = { ok: true; vars: string[]; m0: Matrix } | { ok: false; msg: string };
    let sys: Parsed = parse();
    /** Schritte im vorgemachten Modus. */
    let steps: GaussStep[] = [];
    /** Eigene Umformungen im Übungsmodus. */
    let own: { ops: Op[]; history: Matrix[]; error?: number } = { ops: [], history: [] };
    /** Fehlermeldung der zuletzt eingegebenen Umformung. */
    let opError: string | null = null;
    /** Angezeigte Matrix und die vorherige (für die Überblendung). */
    let cur: Matrix = [];
    let prev: Matrix = [];
    /** Letzte Umformung (für Markierungen). */
    let lastOp: Op | null = null;
    let lastPivot: [number, number] | null = null;

    function parse(): Parsed {
      const r = parseSystem(p.lgs);
      if (r.ok) return { ok: true, vars: r.sys.vars, m0: r.sys.m };
      const l = (r.line ?? 0) + 1;
      const msg =
        r.msg === 'empty'
          ? tr('empty')
          : r.msg === 'eq'
            ? tr('eqErr', { l })
            : r.msg === 'nonlinear'
              ? tr('nonlin', { l })
              : r.msg === 'vars'
                ? tr('varsErr')
                : r.msg === 'rows'
                  ? tr('rowsErr')
                  : tr('tokErr', { l, p: (r.pos ?? 0) + 1 });
      return { ok: false, msg };
    }

    function recompute(): void {
      if (!sys.ok) {
        steps = [];
        own = { ops: [], history: [] };
        cur = [];
        prev = [];
        return;
      }
      steps = gauss(sys.m0, { integer: p.int, jordan: p.jordan });
      own = applyOps(sys.m0, p.ops);
      const before = cur;
      if (p.mode === 'auto') {
        const k = clamp(Math.round(p.k), 0, steps.length);
        cur = k === 0 ? sys.m0 : steps[k - 1]!.m;
        const st = k > 0 ? steps[k - 1]! : null;
        lastOp = st?.op ?? null;
        lastPivot = st?.pivot ?? null;
        prev = k > 0 ? (k === 1 ? sys.m0 : steps[k - 2]!.m) : sys.m0;
      } else {
        cur = own.history[own.history.length - 1] ?? sys.m0;
        prev = own.history.length > 1 ? own.history[own.history.length - 2]! : sys.m0;
        lastOp = own.ops[own.ops.length - 1] ?? null;
        lastPivot = null;
      }
      if (before.length !== cur.length) prev = cur;
    }
    recompute();

    const nVars = () => (sys.ok ? sys.vars.length : 0);
    const stepCount = () => steps.length;
    const kNow = () => clamp(Math.round(p.k), 0, steps.length);
    /** Ende erreicht (Lösung auswerten)? */
    const atEnd = () => (p.mode === 'auto' ? kNow() >= stepCount() : isEchelon(cur));
    const solution = (): Solution | null => (sys.ok ? solve(sys.m0) : null);

    /* -------------------------------------------------------------- */
    /* Animation                                                       */
    /* -------------------------------------------------------------- */

    /** Übergang von der vorigen zur aktuellen Matrix. */
    const morph = new Tween(900, ease.inOutCubic);
    /** Neues System: Karte baut sich auf. */
    const build = new Tween(900, ease.outCubic);
    build.play();

    /* -------------------------------------------------------------- */
    /* Farben                                                          */
    /* -------------------------------------------------------------- */

    const rowColor = (i: number) => th().series[[0, 1, 4, 5, 3][i] ?? 0]!;
    const GOOD = () => th().series[2]!;
    const BAD = () => th().series[3]!;
    const font = (w: number, s: number) => `${w} ${s}px ${th().font}`;

    /* -------------------------------------------------------------- */
    /* Layout                                                          */
    /* -------------------------------------------------------------- */

    const wide = () => surface.width >= 640 && surface.width >= surface.height * 1.2;
    function regions(): { card: Rect; geo: Rect } {
      const w = surface.width;
      const h = surface.height;
      const pad = 10;
      const geo = p.geo;
      if (wide()) {
        const cw = geo ? Math.round(w * 0.54) : w - 2 * pad;
        return { card: { x: pad, y: pad, w: cw - pad, h: h - 2 * pad }, geo: { x: cw + pad, y: pad, w: w - cw - 2 * pad, h: h - 2 * pad } };
      }
      const ch = geo ? Math.round(h * 0.56) : h - 2 * pad;
      return { card: { x: pad, y: pad, w: w - 2 * pad, h: ch }, geo: { x: pad, y: ch + 2 * pad, w: w - 2 * pad, h: h - ch - 3 * pad } };
    }

    /* -------------------------------------------------------------- */
    /* Matrix bzw. Gleichungen zeichnen                                */
    /* -------------------------------------------------------------- */

    /** Breite eines Eintrags (Brüche gestapelt). */
    function entryWidth(g: CanvasRenderingContext2D, f: Frac, size: number): number {
      if (f.d === 1) {
        g.font = font(600, size);
        return g.measureText(F(f)).width;
      }
      g.font = font(600, size * 0.78);
      const s = f.n < 0 ? '−' : '';
      g.font = font(600, size * 0.78);
      const w = Math.max(g.measureText(String(Math.abs(f.n))).width, g.measureText(String(f.d)).width);
      g.font = font(600, size);
      return w + (s ? g.measureText('−').width + 1 : 0) + 2;
    }

    /** Eintrag zeichnen (rechtsbündig bei x). */
    function drawEntry(g: CanvasRenderingContext2D, f: Frac, x: number, y: number, size: number, color: string, alpha: number): void {
      g.save();
      g.globalAlpha *= alpha;
      g.fillStyle = color;
      g.textBaseline = 'middle';
      g.textAlign = 'right';
      if (f.d === 1) {
        g.font = font(600, size);
        g.fillText(F(f), x, y);
      } else {
        const fs = size * 0.78;
        g.font = font(600, fs);
        const n = String(Math.abs(f.n));
        const d = String(f.d);
        const w = Math.max(g.measureText(n).width, g.measureText(d).width);
        g.textAlign = 'center';
        g.fillText(n, x - w / 2, y - fs * 0.62);
        g.fillText(d, x - w / 2, y + fs * 0.66);
        g.fillRect(x - w - 1, y - 0.6, w + 2, 1.3);
        if (f.n < 0) {
          g.font = font(600, size);
          g.textAlign = 'right';
          g.fillText('−', x - w - 3, y);
        }
      }
      g.restore();
    }

    /** Text eines Koeffizienten in der Gleichungsschreibweise: „+ 2y“, „− y“, leer bei 0. */
    function eqTerm(f: Frac, v: string, first: boolean): { sign: string; coef: Frac | null; v: string } | null {
      if (isZero(f)) return null;
      const neg = f.n < 0;
      const a = neg ? fneg(f) : f;
      return { sign: neg ? '−' : first ? '' : '+', coef: feq(a, ONE) ? null : a, v };
    }

    interface Layout {
      x0: number;
      colX: number[]; // rechter Rand je Spalte (inkl. rechter Seite)
      rowY: number[];
      rowH: number;
      size: number;
      width: number;
      barX: number;
    }

    function layoutMatrix(g: CanvasRenderingContext2D, m: Matrix, R: Rect, top: number, maxH: number): Layout {
      const rows = m.length;
      const cols = m[0]!.length;
      let size = R.w < 380 ? 15 : R.w < 520 ? 17 : 19;
      const labelW = 34;
      const opW = R.w < 420 ? 0 : Math.min(150, R.w * 0.27);
      for (let tries = 0; tries < 14; tries++) {
        const widths: number[] = [];
        for (let c = 0; c < cols; c++) {
          let w = 0;
          for (const mm of [m, prev.length === m.length ? prev : m]) for (const r of mm) w = Math.max(w, entryWidth(g, r[c]!, size) + (p.eq && c < cols - 1 ? size * 1.6 : 0));
          widths.push(Math.max(w, size * 0.9));
        }
        const gap = size * (p.eq ? 0.9 : 1.25);
        const total = widths.reduce((s, w) => s + w, 0) + gap * cols + size * 1.2;
        const rowH = size * 2.05;
        if ((total + labelW + opW <= R.w - 24 && rows * rowH <= maxH) || size <= 11) {
          const x0 = R.x + 12 + labelW;
          const colX: number[] = [];
          let x = x0 + size * 0.5;
          for (let c = 0; c < cols; c++) {
            if (c === cols - 1) x += size * 0.9;
            x += gap + widths[c]!;
            colX.push(x);
          }
          const barX = colX[cols - 2]! + gap * 0.55 + size * 0.45;
          const rowY = Array.from({ length: rows }, (_, i) => top + rowH * (i + 0.5));
          return { x0, colX, rowY, rowH, size, width: x - x0 + size * 0.6, barX };
        }
        size -= 0.75;
      }
      throw new Error('unreachable');
    }

    /** Matrix mit Klammern, Kopf, Zeilennamen, Markierungen; liefert die Unterkante. */
    function drawMatrix(g: CanvasRenderingContext2D, R: Rect, top: number, maxH: number): number {
      if (!sys.ok || !cur.length) return top;
      const t = th();
      const m = cur;
      const rows = m.length;
      const cols = m[0]!.length;
      const nv = cols - 1;
      const Lay = layoutMatrix(g, m, R, top + 22, maxH - 22);
      const { colX, rowY, rowH, size, barX } = Lay;
      const k = morph.running ? morph.value : 1;
      const appear = build.value;
      // Kopf: Unbekannte
      g.save();
      g.globalAlpha = appear;
      g.textAlign = 'right';
      g.textBaseline = 'middle';
      for (let c = 0; c < cols; c++) {
        if (c >= nv) continue;
        g.font = `italic ${font(600, size * 0.8)}`;
        g.fillStyle = t.muted;
        g.fillText(sys.vars[c]!, colX[c]!, top + 8);
      }
      g.restore();
      // Zeilen: Positionen beim Tauschen
      const swap = lastOp?.kind === 'swap' && morph.running ? lastOp : null;
      const yOf = (i: number) => {
        if (!swap) return rowY[i]!;
        if (i === swap.i) return lerp(rowY[swap.j]!, rowY[swap.i]!, k);
        if (i === swap.j) return lerp(rowY[swap.i]!, rowY[swap.j]!, k);
        return rowY[i]!;
      };
      const changedRow = lastOp && lastOp.kind !== 'swap' ? lastOp.i : -1;
      const srcRow = lastOp?.kind === 'comb' ? lastOp.j : -1;
      // Hintergrund der geänderten Zeile
      if (changedRow >= 0 && changedRow < rows) {
        g.save();
        g.globalAlpha = 0.5 + 0.5 * k;
        g.fillStyle = withAlpha(rowColor(changedRow), t.dark ? 0.16 : 0.09);
        roundRect(g, Lay.x0 - 30, yOf(changedRow) - rowH / 2 + 2, Lay.width + 34, rowH - 4, 9);
        g.fill();
        g.restore();
      }
      if (srcRow >= 0 && srcRow < rows) {
        g.save();
        g.strokeStyle = withAlpha(rowColor(srcRow), 0.55);
        g.setLineDash([4, 4]);
        g.lineWidth = 1.2;
        roundRect(g, Lay.x0 - 30, yOf(srcRow) - rowH / 2 + 3, Lay.width + 34, rowH - 6, 9);
        g.stroke();
        g.restore();
      }
      // Klammern und Strich
      if (!p.eq) {
        const yTop = rowY[0]! - rowH / 2 + 2;
        const yBot = rowY[rows - 1]! + rowH / 2 - 2;
        g.save();
        g.globalAlpha = appear;
        g.strokeStyle = t.text;
        g.lineWidth = 1.8;
        const xl = Lay.x0 + size * 0.15;
        const xr = Lay.x0 + Lay.width;
        g.beginPath();
        g.moveTo(xl + 7, yTop);
        g.lineTo(xl, yTop);
        g.lineTo(xl, yBot);
        g.lineTo(xl + 7, yBot);
        g.moveTo(xr - 7, yTop);
        g.lineTo(xr, yTop);
        g.lineTo(xr, yBot);
        g.lineTo(xr - 7, yBot);
        g.stroke();
        g.strokeStyle = withAlpha(t.text, 0.55);
        g.lineWidth = 1.2;
        g.beginPath();
        g.moveTo(barX, yTop + 3);
        g.lineTo(barX, yBot - 3);
        g.stroke();
        g.restore();
      }
      // Stufenlinie (unter den führenden Einträgen) im Endzustand
      const echelon = isEchelon(m);
      // Einträge
      for (let i = 0; i < rows; i++) {
        const y = yOf(i);
        const a = clamp(appear * 1.4 - i * 0.15, 0, 1);
        // Zeilenname
        g.save();
        g.globalAlpha = a;
        g.font = font(800, size * 0.82);
        g.fillStyle = rowColor(i);
        g.textAlign = 'right';
        g.textBaseline = 'middle';
        g.fillText(roman(i), Lay.x0 - 6, y);
        g.restore();
        const lead = m[i]!.slice(0, nv).findIndex((v) => !isZero(v));
        let first = true;
        for (let c = 0; c < cols; c++) {
          const v = m[i]![c]!;
          const old = prev.length === rows ? prev[i]?.[c] : undefined;
          const changed = old !== undefined && !feq(old, v) && i === changedRow;
          const newZero = changed && isZero(v);
          let col = t.text;
          if (isZero(v) && c < nv) col = withAlpha(t.text, p.eq ? 0 : 0.35);
          if (newZero) col = GOOD();
          if (c === lead && echelon) col = rowColor(i);
          // Pivot hervorheben
          if (lastPivot && lastPivot[0] === (swap ? -1 : i) && lastPivot[1] === c && c < nv) {
            g.save();
            g.fillStyle = withAlpha(t.series[4]!, t.dark ? 0.3 : 0.18);
            g.beginPath();
            g.arc(colX[c]! - entryWidth(g, v, size) / 2, y, size * 0.92, 0, Math.PI * 2);
            g.fill();
            g.restore();
          }
          if (newZero && morph.running) {
            // grüner Ring wächst um die neue Null
            g.save();
            g.strokeStyle = withAlpha(GOOD(), 1 - k);
            g.lineWidth = 2;
            g.beginPath();
            g.arc(colX[c]! - entryWidth(g, v, size) / 2, y, size * (0.5 + 0.9 * k), 0, Math.PI * 2);
            g.stroke();
            g.restore();
          }
          if (p.eq) {
            if (c < nv) {
              const term = eqTerm(v, sys.vars[c]!, first);
              if (!term) continue;
              first = false;
              // „± Koeffizient Variable“ rechtsbündig in der Spalte
              g.save();
              g.globalAlpha = a;
              g.font = `italic ${font(600, size)}`;
              const vw = g.measureText(term.v).width;
              g.fillStyle = col === withAlpha(t.text, 0.35) ? t.text : col;
              g.textAlign = 'right';
              g.textBaseline = 'middle';
              g.fillText(term.v, colX[c]!, y);
              g.restore();
              let xx = colX[c]! - vw - 2;
              if (term.coef) {
                drawEntry(g, term.coef, xx, y, size, col === withAlpha(t.text, 0.35) ? t.text : col, a);
                xx -= entryWidth(g, term.coef, size) + 2;
              }
              if (term.sign) {
                g.save();
                g.globalAlpha = a;
                g.font = font(600, size);
                g.fillStyle = t.text;
                g.textAlign = 'right';
                g.textBaseline = 'middle';
                g.fillText(term.sign, xx - 3, y);
                g.restore();
              }
            } else {
              if (first) {
                g.save();
                g.globalAlpha = a;
                g.font = font(600, size);
                g.fillStyle = t.text;
                g.textAlign = 'right';
                g.textBaseline = 'middle';
                g.fillText('0', colX[nv - 1]!, y);
                g.restore();
              }
              g.save();
              g.globalAlpha = a;
              g.font = font(600, size);
              g.fillStyle = t.muted;
              g.textAlign = 'center';
              g.textBaseline = 'middle';
              g.fillText('=', barX, y);
              g.restore();
              drawEntry(g, v, colX[c]!, y, size, isZero(v) || !first ? t.text : BAD(), a);
            }
            continue;
          }
          // Überblendung alter → neuer Wert
          if (changed && morph.running && old) {
            drawEntry(g, old, colX[c]!, y - (1 - k) * 0 - k * size * 0.6, size, t.muted, a * (1 - k));
            drawEntry(g, v, colX[c]!, y + (1 - k) * size * 0.6, size, col, a * k);
          } else drawEntry(g, v, colX[c]!, y, size, col, a);
        }
        // Widerspruchszeile 0 = c
        if (lead < 0 && !isZero(m[i]![nv]!)) {
          g.save();
          g.strokeStyle = withAlpha(BAD(), 0.8);
          g.lineWidth = 2;
          roundRect(g, Lay.x0 - 30, y - rowH / 2 + 3, Lay.width + 34, rowH - 6, 9);
          g.stroke();
          g.restore();
        }
      }
      // Umformung rechts neben der geänderten Zeile
      if (lastOp) {
        const target = lastOp.kind === 'swap' ? Math.min(lastOp.i, lastOp.j) : lastOp.i;
        const xo = Lay.x0 + Lay.width + 12;
        const label = opText(lastOp);
        g.save();
        g.globalAlpha = morph.running ? Math.min(1, k * 2) : 1;
        let s = size * 0.78;
        g.font = font(700, s);
        while (s > 10 && g.measureText(label).width > R.x + R.w - xo - 12) {
          s -= 0.5;
          g.font = font(700, s);
        }
        const fits = g.measureText(label).width <= R.x + R.w - xo - 12;
        const yo = fits ? yOf(target) : rowY[rows - 1]! + rowH * 0.95;
        const xx = fits ? xo : Lay.x0;
        const w = g.measureText(label).width + 16;
        g.fillStyle = withAlpha(rowColor(target), t.dark ? 0.26 : 0.15);
        roundRect(g, xx, yo - s * 0.9, w, s * 1.8, s * 0.9);
        g.fill();
        g.fillStyle = mixColor(rowColor(target), t.text, 0.25);
        g.textBaseline = 'middle';
        g.fillText(label, xx + 8, yo + 0.5);
        if (lastOp.kind === 'swap' && fits) {
          // Doppelpfeil zwischen den getauschten Zeilen
          g.strokeStyle = withAlpha(t.text, 0.5);
          g.lineWidth = 1.4;
          g.beginPath();
          g.moveTo(xo - 6, rowY[lastOp.i]!);
          g.lineTo(xo - 3, rowY[lastOp.i]!);
          g.lineTo(xo - 3, rowY[lastOp.j]!);
          g.lineTo(xo - 6, rowY[lastOp.j]!);
          g.stroke();
        }
        g.restore();
        if (!fits) return rowY[rows - 1]! + rowH * 1.6;
      }
      return rowY[rows - 1]! + rowH * 0.7;
    }

    /* -------------------------------------------------------------- */
    /* Textzeilen unter der Matrix                                     */
    /* -------------------------------------------------------------- */

    interface Seg {
      s: string;
      c?: string;
      w?: number;
      i?: boolean;
    }
    function segLine(g: CanvasRenderingContext2D, segs: Seg[], x: number, y: number, maxW: number, size: number, alpha = 1): number {
      let s = size;
      const width = (z: number) =>
        segs.reduce((sum, sg) => {
          g.font = `${sg.i ? 'italic ' : ''}${font(sg.w ?? 500, z)}`;
          return sum + g.measureText(sg.s).width;
        }, 0);
      while (s > 10.5 && width(s) > maxW) s -= 0.5;
      g.save();
      g.globalAlpha *= alpha;
      g.textBaseline = 'middle';
      g.textAlign = 'left';
      let cx = x;
      let cy = y;
      for (const sg of segs) {
        g.font = `${sg.i ? 'italic ' : ''}${font(sg.w ?? 500, s)}`;
        for (const wd of g.measureText(sg.s).width > maxW * 0.5 ? sg.s.split(/(?<= )/) : [sg.s]) {
          const w = g.measureText(wd).width;
          if (cx + w > x + maxW && cx > x + 20) {
            cx = x + 14;
            cy += s * 1.4;
          }
          g.fillStyle = sg.c ?? th().text;
          g.fillText(wd, cx, cy);
          cx += w;
        }
      }
      g.restore();
      return cy - y + s * 1.45;
    }

    /** Beschreibung des aktuellen Schritts. */
    function stepText(): Seg[] {
      const t = th();
      if (!sys.ok) return [];
      if (p.mode === 'self') {
        if (!lastOp) return [{ s: tr('start'), c: t.muted }];
        return [{ s: `${tr('yourOps')}: `, c: t.muted }, { s: own.ops.map((o) => opText(o)).join(' ; '), c: t.text, w: 600 }];
      }
      const k = kNow();
      if (k === 0) return [{ s: tr('start'), c: t.muted }];
      const st = steps[k - 1]!;
      const v = sys.vars[st.pivot[1]] ?? '';
      const r = roman(st.op.kind === 'swap' ? st.op.i : st.op.i);
      const head: Seg = { s: `${tr('stepOf', { k, n: steps.length })}:  `, c: t.muted, w: 600 };
      const opS: Seg = { s: `${opText(st.op)}  `, c: rowColor(st.op.i), w: 700 };
      let what = '';
      if (st.op.kind === 'swap') what = tr('swap', { v });
      else if (st.op.kind === 'scale') what = st.phase === 'normalize' ? tr('norm', { r }) : tr('scale', { r });
      else what = st.phase === 'backward' ? tr('combUp', { v }) : tr('comb', { r, v });
      return [head, opS, { s: what, c: t.text }];
    }

    /** Kasten „Erlaubte Umformungen“ unten in der Karte, wenn Platz ist. */
    function drawRules(g: CanvasRenderingContext2D, R: Rect, yUsed: number): void {
      const t = th();
      const size = R.w < 380 ? 12 : 13.5;
      const lines = [tr('rule1'), tr('rule2'), tr('rule3')];
      const h = size * 1.5 * (lines.length + 1) + 14;
      const y = R.y + R.h - h - 10;
      if (y < yUsed + 10) return;
      g.save();
      g.strokeStyle = withAlpha(t.text, 0.18);
      g.setLineDash([4, 4]);
      roundRect(g, R.x + 10, y, R.w - 20, h, 10);
      g.stroke();
      g.restore();
      let yy = y + size * 1.2;
      yy += segLine(g, [{ s: tr('rules'), c: t.muted, w: 700 }], R.x + 22, yy, R.w - 44, size);
      for (const l of lines) yy += segLine(g, [{ s: `•  ${l}`, c: t.muted }], R.x + 26, yy - 4, R.w - 48, size - 0.5) - 2;
    }

    function drawInfo(g: CanvasRenderingContext2D, R: Rect, y0: number): number {
      const t = th();
      const x = R.x + 16;
      const maxW = R.w - 32;
      const size = R.w < 380 ? 13 : R.w < 520 ? 14 : 15;
      let y = y0 + 6;
      if (!sys.ok) {
        return y + segLine(g, [{ s: sys.msg, c: BAD(), w: 600 }], x, y, maxW, size);
      }
      y += segLine(g, stepText(), x, y, maxW, size);
      if (p.mode === 'self' && opError) y += segLine(g, [{ s: opError, c: BAD(), w: 600 }], x, y, maxW, size - 0.5);
      const ech = isEchelon(cur);
      if (p.mode === 'self' || atEnd()) {
        const diag = ech && isDiagonal(cur);
        y += segLine(g, [{ s: ech ? (diag ? tr('diagonal') : tr('echelon')) : tr('notYet'), c: ech ? GOOD() : t.muted, w: 700 }], x, y + 2, maxW, size) + 2;
      }
      if (!ech || !atEnd()) return y;
      // Auswertung am Ende
      if (!p.show) return y + segLine(g, [{ s: tr('hidden'), c: t.muted }], x, y, maxW, size - 1);
      drawSolution(g, x, y, maxW, size, R.y + R.h - 12);
      return R.y + R.h;
    }

    /** Reduzierte Stufenform: führende Einsen, darüber und darunter nur Nullen. */
    function isDiagonal(m: Matrix): boolean {
      if (!isEchelon(m)) return false;
      const nv = m[0]!.length - 1;
      return m.every((r) => {
        const lead = r.slice(0, nv).findIndex((v) => !isZero(v));
        if (lead < 0) return true;
        return feq(r[lead]!, ONE) && m.every((o) => o === r || isZero(o[lead]!));
      });
    }

    /** Lösungsmenge mit Rückwärtseinsetzen. */
    function drawSolution(g: CanvasRenderingContext2D, x: number, y0: number, maxW: number, size: number, bottom: number): void {
      if (!sys.ok) return;
      const t = th();
      const vars = sys.vars;
      const nv = vars.length;
      let y = y0;
      const sol = solution()!;
      const box = (h: number, col: string) => {
        g.save();
        g.fillStyle = withAlpha(col, t.dark ? 0.15 : 0.08);
        roundRect(g, x - 8, y - size * 0.95, maxW + 16, Math.min(h, bottom - y + size * 0.95), 10);
        g.fill();
        g.restore();
      };
      if (sol.kind === 'none') {
        const r = cur.findIndex((row) => row.slice(0, nv).every(isZero) && !isZero(row[nv]!));
        box(size * 3.2, BAD());
        y += segLine(g, [{ s: tr('none', { r: roman(Math.max(0, r)), c: F(cur[Math.max(0, r)]![nv]!) }), c: BAD(), w: 600 }], x, y, maxW, size);
        segLine(g, [{ s: 'L = { }', c: BAD(), w: 800 }], x, y, maxW, size + 1);
        return;
      }
      if (sol.kind === 'unique') {
        const back = backSubstitution(cur);
        const lines = back && !isDiagonal(cur) ? back : null;
        const need = size * (2.4 + (lines ? lines.length * 1.5 : 0));
        box(need, GOOD());
        if (lines && y + need < bottom + 10) {
          y += segLine(g, [{ s: `${tr('back')}:`, c: t.muted, w: 600 }], x, y, maxW, size - 1);
          for (const b of lines) {
            const row = cur[b.row]!;
            const segs: Seg[] = [{ s: `${roman(b.row)}:  `, c: rowColor(b.row), w: 800 }];
            // a·v + Σ (bekannte eingesetzt) = r  ⇒  v = …
            segs.push({ s: `${coefStr(row[b.col]!)}`, c: t.text, w: 600 }, { s: vars[b.col]!, c: t.text, w: 600, i: true });
            for (const [c, val] of b.known) {
              const a = row[c]!;
              const neg = a.n < 0;
              segs.push({ s: ` ${neg ? '−' : '+'} ${coefStr(neg ? fneg(a) : a, true)}`, c: t.text }, { s: val.n < 0 ? `(${F(val)})` : F(val), c: GOOD(), w: 700 });
            }
            segs.push({ s: ` = ${F(row[nv]!)}   ⇒   `, c: t.text }, { s: vars[b.col]!, c: GOOD(), w: 700, i: true }, { s: ` = ${F(b.value)}`, c: GOOD(), w: 700 });
            y += segLine(g, segs, x + 6, y, maxW - 6, size - 0.5);
          }
        }
        segLine(g, [{ s: 'L = { (', c: GOOD(), w: 800 }, { s: sol.x.map(F).join(' | '), c: GOOD(), w: 800 }, { s: ') }', c: GOOD(), w: 800 }], x, y + 2, maxW, size + 1);
        return;
      }
      // unendlich viele
      const names = ['t', 's', 'r', 'q'];
      const freeNames = sol.free.map((c) => vars[c]!).join(', ');
      box(size * (3.6 + nv * 1.35), t.series[5]!);
      y += segLine(g, [{ s: tr('infinite', { f: freeNames }), c: t.text, w: 600 }], x, y, maxW, size - 0.5);
      y += segLine(g, [{ s: tr('param', { v: freeNames, p: sol.free.map((_, k) => names[k]).join(', ') }), c: t.muted }], x, y, maxW, size - 1);
      for (let c = 0; c < nv; c++) {
        const parts: string[] = [];
        if (!isZero(sol.p[c]!) || sol.dirs.every((d) => isZero(d[c]!))) parts.push(F(sol.p[c]!));
        sol.dirs.forEach((d, k) => {
          const a = d[c]!;
          if (isZero(a)) return;
          const neg = a.n < 0;
          const abs = neg ? fneg(a) : a;
          const coef = feq(abs, ONE) ? '' : `${F(abs)}·`;
          parts.push(parts.length ? `${neg ? '−' : '+'} ${coef}${names[k]}` : `${neg ? '−' : ''}${coef}${names[k]}`);
        });
        if (y > bottom - size) break;
        y += segLine(g, [{ s: vars[c]!, c: t.series[5], w: 700, i: true }, { s: ` = ${parts.join(' ')}`, c: t.text, w: 600 }], x + 10, y, maxW - 10, size - 0.5);
      }
    }
    function coefStr(a: Frac, keepOne = false): string {
      if (feq(a, ONE) && !keepOne) return '';
      if (feq(a, frac1neg)) return '−';
      return `${F(a)}·`;
    }
    const frac1neg = fneg(ONE);

    function drawCardBody(g: CanvasRenderingContext2D, R: Rect): void {
      const t = th();
      drawCard(g, R, t, rowColor(0));
      if (!sys.ok) {
        const end = drawInfo(g, R, R.y + 16);
        drawRules(g, R, end);
        return;
      }
      const rows = cur.length;
      const maxH = Math.min(R.h * 0.56, (rows + 1) * 48 + 24);
      const bottom = drawMatrix(g, R, R.y + 10, maxH);
      const end = drawInfo(g, R, bottom + 8);
      drawRules(g, R, end);
    }

    /* -------------------------------------------------------------- */
    /* Geometrie                                                       */
    /* -------------------------------------------------------------- */

    let geoRect: Rect = { x: 0, y: 0, w: 100, h: 100 };
    const view = new View3D(surface, { azimuth: 32, elevation: 22, elevationLimits: [-80, 89], distance: 5.2, region: () => geoRect });
    const plot = new Plot(surface, {
      x: [-6, 6],
      y: [-6, 6],
      equalAspect: true,
      zoom: false,
      pan: false,
      controls: false,
      region: () => ({ x: geoRect.x + 4, y: geoRect.y + 4, w: geoRect.w - 8, h: geoRect.h - 8 }),
      xAxis: { label: 'x' },
      yAxis: { label: 'y' },
    });

    /** Zeile als normierte Ebene/Gerade (n, d) mit |n| = 1; null bei Nullzeile. */
    function normRow(r: Frac[], nv: number): { n: number[]; d: number } | null {
      const n = r.slice(0, nv).map(fval);
      const l = Math.hypot(...n);
      if (l < 1e-12) return null;
      return { n: n.map((v) => v / l), d: fval(r[nv]!) / l };
    }
    /** Zwischen zwei Ebenen überblenden (gleiche Orientierung wählen). */
    function blendRow(a: { n: number[]; d: number } | null, b: { n: number[]; d: number } | null, k: number): { n: number[]; d: number } | null {
      if (!a || !b) return k < 0.5 ? a : b;
      const s = a.n.reduce((sum, v, i) => sum + v * b.n[i]!, 0) < 0 ? -1 : 1;
      const n = a.n.map((v, i) => lerp(v * s, b.n[i]!, k));
      const l = Math.hypot(...n);
      if (l < 1e-6) return k < 0.5 ? a : b;
      return { n: n.map((v) => v / l), d: lerp(a.d * s, b.d, k) / l };
    }

    /** Ausdehnung des Würfels: Lösung gut sichtbar. */
    function extent(): number {
      const sol = solution();
      let e = 5;
      if (sol?.kind === 'unique') e = Math.max(4, ...sol.x.map((v) => Math.abs(fval(v)) + 1.5));
      if (sol?.kind === 'infinite') e = Math.max(4, ...sol.p.map((v) => Math.abs(fval(v)) + 1.5));
      return Math.min(e, 12);
    }

    function rowsNow(nv: number): ({ n: number[]; d: number } | null)[] {
      const k = morph.running ? morph.value : 1;
      const swap = lastOp?.kind === 'swap';
      return cur.map((r, i) => {
        const b = normRow(r, nv);
        if (!morph.running || swap || prev.length !== cur.length) return b;
        return blendRow(normRow(prev[i]!, nv), b, k);
      });
    }

    function drawGeo(g: CanvasRenderingContext2D, R: Rect): void {
      const t = th();
      geoRect = R;
      drawCard(g, R, t);
      if (!sys.ok) return;
      const nv = nVars();
      if (nv === 3) draw3D(R);
      else if (nv === 2) draw2D();
      else {
        g.save();
        segLine(g, [{ s: nv === 1 ? tr('noGeo1') : tr('noGeo', { n: nv }), c: t.muted, w: 600 }], R.x + 18, R.y + R.h / 2 - 10, R.w - 36, 15);
        g.restore();
      }
    }

    function draw3D(R: Rect): void {
      const t = th();
      const E = extent();
      view.setScene({ target: [0, 0, 0], radius: E * 1.45, anchor: [0.5, 0.52] });
      view.resize();
      view.begin();
      view.axes({ min: -E, max: E + 0.6, color: withAlpha(t.axis, 0.75), width: 1.3, labels: [sys.ok ? sys.vars[0]! : 'x', sys.ok ? sys.vars[1]! : 'y', sys.ok ? sys.vars[2]! : 'z'], ticks: E > 7 ? 2 : 1, numbers: false });
      const rows = rowsNow(3);
      rows.forEach((r, i) => {
        if (!r) return;
        const poly = planeBoxPolygon(r.n as unknown as V3, r.d, -E, E);
        if (poly.length < 3) return;
        const col = rowColor(i);
        const hl = lastOp && lastOp.kind !== 'swap' && lastOp.i === i && morph.running;
        view.face(poly as unknown as Vec3[], { color: col, alpha: (t.dark ? 0.3 : 0.24) * (hl ? 1.3 : 1), flat: true, stroke: withAlpha(col, 0.75), width: hl ? 2.4 : 1.4 });
        // Name an der Ecke mit dem größten x₃ (gut sichtbar)
        const top = [...poly].sort((a, b) => b[2] - a[2] + (b[0] - a[0]) * 0.2)[0]!;
        view.label(top as unknown as Vec3, roman(i), { color: col, size: 13, weight: '800', offset: [6, -6], align: 'left' });
      });
      const sol = solution();
      if (sol && p.show) {
        if (sol.kind === 'unique') {
          const P = sol.x.map(fval) as unknown as Vec3;
          // Lotlinien zur Grundebene
          view.segment([P[0], P[1], 0], P, { color: withAlpha(t.text, 0.4), width: 1, dash: [3, 4], layer: 'front' });
          view.segment([P[0], 0, 0], [P[0], P[1], 0], { color: withAlpha(t.text, 0.3), width: 1, dash: [3, 4], layer: 'front' });
          view.segment([0, P[1], 0], [P[0], P[1], 0], { color: withAlpha(t.text, 0.3), width: 1, dash: [3, 4], layer: 'front' });
          view.point(P, { color: t.text, radius: 6, layer: 'front' });
          const [px] = view.toPx(P);
          const right = px > R.x + R.w * 0.55;
          view.label(P, `(${sol.x.map(F).join(' | ')})`, { color: t.text, size: 13, weight: '800', offset: [right ? -10 : 10, -12], align: right ? 'right' : 'left', background: withAlpha(t.bg, 0.8) });
        } else if (sol.kind === 'infinite' && sol.free.length === 1) {
          const P = sol.p.map(fval);
          const D = sol.dirs[0]!.map(fval);
          // Gerade im Würfel abschneiden
          const ts: number[] = [];
          for (let c = 0; c < 3; c++) {
            if (Math.abs(D[c]!) < 1e-12) continue;
            ts.push((-E - P[c]!) / D[c]!, (E - P[c]!) / D[c]!);
          }
          ts.sort((a, b) => a - b);
          const inside = (q: number[]) => q.every((v) => Math.abs(v) <= E + 1e-6);
          const pts = ts.map((s) => P.map((v, c) => v + s * D[c]!)).filter(inside);
          if (pts.length >= 2) {
            view.segment(pts[0] as unknown as Vec3, pts[pts.length - 1] as unknown as Vec3, { color: t.text, width: 3.2, layer: 'front' });
            view.point(P as unknown as Vec3, { color: t.text, radius: 4.5, layer: 'front' });
          }
        }
      }
      view.end();
      // Hinweis unten
      const g = surface.g;
      const msg = sol?.kind === 'none' ? tr('contra') : tr('sameSet');
      segLine(g, [{ s: msg, c: sol?.kind === 'none' ? BAD() : t.muted, w: 600 }], R.x + 12, R.y + 16, R.w - 120, 12);
    }

    function draw2D(): void {
      const t = th();
      const E = extent();
      plot.setRange([-E, E], [-E, E]);
      plot.resize();
      plot.begin();
      plot.grid({ minor: true });
      plot.axes();
      const rows = rowsNow(2);
      rows.forEach((r, i) => {
        if (!r) return;
        const seg = lineInBox(r.n[0]!, r.n[1]!, r.d, -E * 1.5, E * 1.5);
        if (!seg) return;
        const col = rowColor(i);
        plot.segment(seg[0], seg[1], { color: col, width: 2.6 });
        // Name nahe dem Rand
        const q: [number, number] = [lerp(seg[0][0], seg[1][0], 0.82), lerp(seg[0][1], seg[1][1], 0.82)];
        if (Math.abs(q[0]) < E && Math.abs(q[1]) < E) plot.text(q[0], q[1], roman(i), { color: col, size: 13, weight: 'bold', offset: [8, -8], halo: true });
      });
      const sol = solution();
      if (sol && p.show && sol.kind === 'unique') {
        const [x, y] = sol.x.map(fval) as [number, number];
        plot.point(x, y, { color: t.text, radius: 6 });
        plot.text(x, y, `(${sol.x.map(F).join(' | ')})`, { color: t.text, size: 13, weight: 'bold', offset: [10, -14], align: 'left', halo: true });
      }
      plot.end();
    }

    /* -------------------------------------------------------------- */
    /* Ergebnisse                                                      */
    /* -------------------------------------------------------------- */

    function updateReadouts(): void {
      if (!sys.ok) {
        ctx.readout('size', sys.msg);
        ['rank', 'kind', 'sol'].forEach((k) => ctx.readout(k, null));
        return;
      }
      ctx.readout('size', tr('size', { m: sys.m0.length, n: sys.vars.length }));
      const r = ranks(sys.m0);
      ctx.readout('rank', tr('rankText', { r: r.rank, a: r.rankAug }));
      const sol = solution()!;
      ctx.readout('kind', sol.kind === 'unique' ? tr('unique') : sol.kind === 'none' ? tr('noneShort') : tr('infShort'));
      if (sol.kind === 'unique') ctx.readout('sol', `L = { (${sol.x.map(F).join(' | ')}) }`);
      else if (sol.kind === 'none') ctx.readout('sol', 'L = { }');
      else {
        const names = ['t', 's', 'r', 'q'];
        const vec = (v: Frac[]) => `(${v.map(F).join(' | ')})`;
        ctx.readout('sol', `x⃗ = ${vec(sol.p)} ${sol.dirs.map((d, k) => `+ ${names[k]} · ${vec(d)}`).join(' ')}`);
      }
    }

    /* -------------------------------------------------------------- */
    /* Aktionen                                                        */
    /* -------------------------------------------------------------- */

    function opMessage(msg: string, o: string): string {
      return msg === 'row' ? tr('opRow') : msg === 'target' ? tr('opTarget') : msg === 'zero' ? tr('opZero') : tr('opErr', { o });
    }

    function applyOwn(): void {
      if (!sys.ok) return;
      const r = parseOp(p.op, cur.length);
      if (!r.ok) {
        opError = r.msg === 'empty' ? null : opMessage(r.msg, p.op);
        ctx.requestRender();
        return;
      }
      opError = null;
      const txt = opText(r.op, '-');
      ctx.set({ ops: p.ops.trim() ? `${p.ops.trim()}; ${txt}` : txt, op: '' });
    }

    function undoOwn(): void {
      const parts = p.ops
        .split(';')
        .map((s) => s.trim())
        .filter(Boolean);
      parts.pop();
      opError = null;
      ctx.set({ ops: parts.join('; ') });
    }

    function tipOwn(): void {
      if (!sys.ok) return;
      const nxt = gauss(cur)[0];
      if (!nxt) {
        opError = null;
        ctx.set({ op: '' });
        return;
      }
      ctx.set({ op: opText(nxt.op, '-') });
    }

    function newTask(): void {
      const n = sys.ok && sys.vars.length >= 2 && sys.vars.length <= 4 ? sys.vars.length : 3;
      const vars = n <= 3 ? ['x', 'y', 'z'].slice(0, n) : ['x1', 'x2', 'x3', 'x4'];
      const roll = Math.random();
      const kind = roll < 0.7 ? 'unique' : roll < 0.85 ? 'none' : 'infinite';
      const m = randomSystem(n, Math.random, kind);
      ctx.set({ lgs: systemText(vars, m), k: 0, ops: '', op: '' });
    }

    /* -------------------------------------------------------------- */
    /* Ablauf                                                          */
    /* -------------------------------------------------------------- */

    let lastKey = '';
    return {
      update(changed, source) {
        if (changed.has('lgs') || source === 'init' || source === 'replace') {
          sys = parse();
          if (source === 'input' && changed.has('lgs')) ctx.set({ k: 0, ops: '' });
          build.play();
        }
        if (changed.has('lgs') || changed.has('k') || changed.has('ops') || changed.has('int') || changed.has('jordan') || changed.has('mode') || source === 'init' || source === 'replace') {
          recompute();
          const key = `${p.lgs}|${p.mode}|${kNow()}|${p.ops}|${p.int}|${p.jordan}`;
          if (key !== lastKey && source !== 'init' && (changed.has('k') || changed.has('ops'))) morph.play();
          lastKey = key;
        }
        if (changed.has('op')) opError = null;
        if (changed.has('geo') || changed.has('eq')) build.play(500);
        updateReadouts();
      },
      action(id) {
        if (ctx.locked) return;
        if (id === 'next') ctx.set({ k: Math.min(stepCount(), kNow() + 1) });
        if (id === 'prev') ctx.set({ k: Math.max(0, kNow() - 1) });
        if (id === 'end') ctx.set({ k: stepCount() });
        if (id === 'apply') applyOwn();
        if (id === 'undo') undoOwn();
        if (id === 'tip') tipOwn();
        if (id === 'new') newTask();
      },
      resetView() {
        view.resetView();
        plot.resetView();
      },
      render() {
        const g = surface.begin();
        const R = regions();
        drawCardBody(g, R.card);
        view.setControlsVisible(p.geo && nVars() === 3);
        if (p.geo) drawGeo(g, R.geo);
        if (morph.running || build.running) ctx.requestRender();
      },
      destroy: () => surface.destroy(),
    };
  },
});
