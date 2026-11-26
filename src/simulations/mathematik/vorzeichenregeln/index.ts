import { defineSimulation, drawArrowHead, prefersReducedMotion, roundRect, Surface, text, withAlpha } from '../../../sim-core';
import { balanceAfter, checkDrill, jumps, makeDrill, partialProducts, patternRows, product, productSign, quotient, sign, tempAfter, type Drill } from './model';

const L = (de: string, en: string) => ({ de, en });

type Mode = 'strahl' | 'muster' | 'schulden' | 'teilen' | 'tafel' | 'viele' | 'alltag' | 'ueben';

/**
 * Vorzeichenregeln beim Multiplizieren und Dividieren: Sprünge am
 * Zahlenstrahl mit Gegenzahl, Permanenzprinzip (Muster fortsetzen),
 * Schuldenmodell, Division als Umkehrung, Einmaleins-Tafel mit Vorzeichen,
 * viele Faktoren und Potenzen, Temperatur im Tagesverlauf und Kopfrechnen.
 */
export default defineSimulation({
  id: 'vorzeichenregeln',
  animated: true,
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
        { value: 'tafel', label: L('Einmaleins-Tafel mit Vorzeichen', 'Times table with signs') },
        { value: 'viele', label: L('Viele Faktoren und Potenzen', 'Many factors and powers') },
        { value: 'alltag', label: L('Alltag: Temperatur im Tagesverlauf', 'Everyday: temperature over the day') },
        { value: 'ueben', label: L('Üben: Kopfrechnen', 'Practice: mental arithmetic') },
      ],
      default: 'strahl',
      display: 'menu',
    },
    { key: 'a', type: 'number', label: L('erster Faktor a', 'first factor a'), min: -6, max: 6, step: 1, default: -3, visibleIf: (v) => v.mode === 'strahl' || v.mode === 'muster' || v.mode === 'tafel' },
    { key: 'b', type: 'number', label: L('zweiter Faktor b', 'second factor b'), min: -6, max: 6, step: 1, default: -4, visibleIf: (v) => v.mode === 'strahl' || v.mode === 'muster' || v.mode === 'tafel' },
    { key: 'nf', type: 'number', label: L('Anzahl der Faktoren', 'Number of factors'), min: 2, max: 8, step: 1, default: 5, visibleIf: (v) => v.mode === 'viele' },
    { key: 'nn', type: 'number', label: L('davon negativ', 'of which negative'), min: 0, max: 8, step: 1, default: 3, visibleIf: (v) => v.mode === 'viele' },
    { key: 'fv', type: 'number', label: L('Betrag jedes Faktors', 'Size of each factor'), min: 1, max: 3, step: 1, default: 2, visibleIf: (v) => v.mode === 'viele' },
    { key: 'ts', type: 'number', label: L('Temperatur jetzt', 'Temperature now'), min: -10, max: 20, step: 1, default: 2, unit: '°C', visibleIf: (v) => v.mode === 'alltag' },
    { key: 'rt', type: 'number', label: L('Änderung pro Stunde', 'Change per hour'), min: -5, max: 5, step: 1, default: -3, unit: '°C', visibleIf: (v) => v.mode === 'alltag' },
    { key: 'hh', type: 'number', label: L('Stunden (− = vorher)', 'Hours (− = earlier)'), min: -6, max: 6, step: 1, default: -4, unit: 'h', visibleIf: (v) => v.mode === 'alltag' },
    { key: 'dq', type: 'number', label: L('Aufgabe Nr.', 'Task no.'), min: 1, max: 999, step: 1, default: 1, visibleIf: (v) => v.mode === 'ueben' },
    { key: 'da', type: 'text', label: L('Deine Antwort', 'Your answer'), default: '', maxLength: 8, placeholder: L('eine Zahl oder + / −', 'a number or + / −'), visibleIf: (v) => v.mode === 'ueben' },
    { key: 'st', type: 'number', label: L('Kontostand vorher', 'Balance before'), min: -40, max: 40, step: 5, default: -20, unit: '€', visibleIf: (v) => v.mode === 'schulden' },
    { key: 'k', type: 'number', label: L('Karten: dazu (+) oder weg (−)', 'Cards: added (+) or removed (−)'), min: -6, max: 6, step: 1, default: -3, visibleIf: (v) => v.mode === 'schulden' },
    { key: 'w', type: 'number', label: L('Wert einer Karte (− = Schuldschein)', 'Value of one card (− = IOU)'), min: -6, max: 6, step: 1, default: -5, unit: '€', visibleIf: (v) => v.mode === 'schulden' },
    { key: 'dd', type: 'number', label: L('Dividend', 'Dividend'), min: -36, max: 36, step: 1, default: -12, visibleIf: (v) => v.mode === 'teilen' },
    { key: 'dv', type: 'number', label: L('Divisor', 'Divisor'), min: -6, max: 6, step: 1, default: 3, visibleIf: (v) => v.mode === 'teilen' },
  ],
  hint: (v) =>
    v.mode === 'muster'
      ? L('Geht der erste Faktor um 1 nach unten, ändert sich das Ergebnis immer um denselben Betrag. Setze das Muster über die Null hinaus fort.', 'When the first factor goes down by 1, the result always changes by the same amount. Continue the pattern past zero.')
      : v.mode === 'tafel'
        ? L('Die Tafel zerfällt in vier Viertel: Oben rechts und unten links ist alles negativ, sonst positiv.', 'The table splits into four quarters: top right and bottom left are negative, the rest positive.')
        : v.mode === 'viele'
          ? L('Zähle die Minuszeichen: Bei einer geraden Anzahl ist das Produkt positiv, bei einer ungeraden negativ.', 'Count the minus signs: with an even number the product is positive, with an odd number negative.')
          : v.mode === 'alltag'
            ? L('Fällt die Temperatur um 3 °C pro Stunde, war sie vor 4 Stunden höher: (−3) · (−4) = +12.', 'If the temperature falls by 3 °C per hour, it was higher 4 hours ago: (−3) · (−4) = +12.')
            : v.mode === 'ueben'
              ? L('Rechne im Kopf. Bei „Vorzeichen?“ genügt + oder −.', 'Work it out in your head. For “sign?” just enter + or −.')
              : v.mode === 'schulden'
        ? L('Schuldscheine wegnehmen macht das Konto besser – minus mal minus ergibt plus.', 'Taking away IOUs makes the account better – minus times minus gives plus.')
        : v.mode === 'teilen'
          ? L('Dividieren ist die Umkehrung des Multiplizierens. Deshalb gelten dieselben Vorzeichenregeln.', 'Dividing undoes multiplying, so the same sign rules apply.')
          : L('Ein negativer erster Faktor bedeutet: erst springen, dann an der Null spiegeln (Gegenzahl).', 'A negative first factor means: jump first, then reflect at zero (opposite number).'),
  actions: [
    { id: 'play', label: L('Abspielen', 'Play'), primary: true, visibleIf: (v) => v.mode === 'alltag' || v.mode === 'viele' },
    { id: 'dcheck', label: L('Prüfen', 'Check'), primary: true, visibleIf: (v) => v.mode === 'ueben' },
    { id: 'dnext', label: L('Nächste Aufgabe', 'Next task'), visibleIf: (v) => v.mode === 'ueben' },
  ],
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
    { id: 'divpm', label: L('20 : (−4)', '20 : (−4)'), values: { mode: 'teilen', dd: 20, dv: -4 } },
    { id: 'tafel', label: L('Tafel: (−3) · (−4)', 'Table: (−3) · (−4)'), values: { mode: 'tafel', a: -3, b: -4 } },
    { id: 'tafel2', label: L('Tafel: 5 · (−6)', 'Table: 5 · (−6)'), values: { mode: 'tafel', a: 5, b: -6 } },
    { id: 'even', label: L('Vier negative Faktoren', 'Four negative factors'), values: { mode: 'viele', nf: 4, nn: 4, fv: 2 } },
    { id: 'odd', label: L('(−2)⁵: ungerade Hochzahl', '(−2)⁵: odd exponent'), values: { mode: 'viele', nf: 5, nn: 5, fv: 2 } },
    { id: 'mixed', label: L('Gemischt: 3 von 6 negativ', 'Mixed: 3 of 6 negative'), values: { mode: 'viele', nf: 6, nn: 3, fv: 1 } },
    { id: 'night', label: L('Kälteeinbruch: vor 4 Stunden?', 'Cold snap: 4 hours ago?'), values: { mode: 'alltag', ts: 2, rt: -3, hh: -4 } },
    { id: 'warm', label: L('Erwärmung: in 5 Stunden', 'Warming: in 5 hours'), values: { mode: 'alltag', ts: -6, rt: 2, hh: 5 } },
    { id: 'drill', label: L('Üben: Kopfrechnen', 'Practice: mental arithmetic'), values: { mode: 'ueben', dq: 1, da: '' } },
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
      vTitle: '{n} Faktoren, davon {k} negativ',
      vEven: '{k} Minuszeichen – eine gerade Anzahl: Das Produkt ist positiv.',
      vOdd: '{k} Minuszeichen – eine ungerade Anzahl: Das Produkt ist negativ.',
      vPow: 'Gleiche Faktoren: {f} = {p}',
      vStep: 'Zwischenergebnis',
      aNow: 'jetzt',
      aThen: '{h} h',
      aText: '{r} °C pro Stunde · {h} h = {d} °C',
      aRes: 'Temperatur dann: {t} °C',
      aPast: 'vorher',
      aFuture: 'nachher',
      tTitle: 'Einmaleins von −6 bis 6',
      dTitle: 'Kopfrechnen',
      dHow: 'Gib das Ergebnis ein und drücke „Prüfen“.',
      dSign: 'Vorzeichen des Produkts? (+ oder −)',
      dOk: 'Richtig!',
      dNo: 'Noch nicht.',
      dSol: 'Lösung: {a}',
      dScore: '{k} von {n} richtig · Serie {s}',
      dHint_mul: 'Erst die Beträge malnehmen, dann das Vorzeichen: gleich → +, verschieden → −.',
      dHint_div: 'Wie beim Malnehmen: gleiche Vorzeichen → +, verschiedene → −.',
      dHint_three: 'Zähle die negativen Faktoren.',
      dHint_pow: 'Gerade Hochzahl → +, ungerade Hochzahl → −.',
      dHint_mix: 'Punkt vor Strich: erst malnehmen, dann addieren.',
      dHint_sign: 'Gerade Anzahl Minuszeichen → +, ungerade → −.',
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
      vTitle: '{n} factors, {k} of them negative',
      vEven: '{k} minus signs – an even number: the product is positive.',
      vOdd: '{k} minus signs – an odd number: the product is negative.',
      vPow: 'Equal factors: {f} = {p}',
      vStep: 'running result',
      aNow: 'now',
      aThen: '{h} h',
      aText: '{r} °C per hour · {h} h = {d} °C',
      aRes: 'temperature then: {t} °C',
      aPast: 'earlier',
      aFuture: 'later',
      tTitle: 'Times table from −6 to 6',
      dTitle: 'Mental arithmetic',
      dHow: 'Enter the result and press “Check”.',
      dSign: 'Sign of the product? (+ or −)',
      dOk: 'Correct!',
      dNo: 'Not yet.',
      dSol: 'Solution: {a}',
      dScore: '{k} of {n} correct · streak {s}',
      dHint_mul: 'Multiply the sizes first, then the sign: same → +, different → −.',
      dHint_div: 'As with multiplying: same signs → +, different → −.',
      dHint_three: 'Count the negative factors.',
      dHint_pow: 'Even exponent → +, odd exponent → −.',
      dHint_mix: 'Multiplication before addition.',
      dHint_sign: 'Even number of minus signs → +, odd → −.',
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

    /* Zustand: Alltag (Animation 0…1) und Kopfrechnen */
    let ta = 1;
    let playing = false;
    let drill: Drill = makeDrill(1);
    let drRes: boolean | null = null;
    let drTries = 0;
    let drScore = { right: 0, all: 0, streak: 0 };
    let drBad = false;

    function factors(): number[] {
      const nn = Math.min(p.nn, p.nf);
      return Array.from({ length: p.nf }, (_, i) => (i < nn ? -p.fv : p.fv));
    }

    function updateReadouts(): void {
      if (mode() === 'tafel') {
        ctx.readout('term', `${par(p.a)} · ${par(p.b)}`);
        ctx.readout('res', `= ${n(p.a * p.b)}`);
        const s0 = sign(p.a) * sign(p.b);
        ctx.readout('rule', s0 === 0 ? ctx.t('ruleZero') : ctx.t(s0 > 0 ? 'ruleSame' : 'ruleDiff'));
        return;
      }
      if (mode() === 'viele') {
        const f = factors();
        ctx.readout('term', f.map((x, i) => (i ? par(x) : n(x))).join(' · '));
        ctx.readout('res', `= ${n(product(f))}`);
        const k = f.filter((x) => x < 0).length;
        ctx.readout('rule', tr(k % 2 === 0 ? 'vEven' : 'vOdd', { k }));
        return;
      }
      if (mode() === 'alltag') {
        ctx.readout('term', tr('aText', { r: par(p.rt), h: par(p.hh), d: n(p.rt * p.hh) }));
        ctx.readout('res', tr('aRes', { t: n(tempAfter(p.ts, p.rt, p.hh)) }));
        const s0 = sign(p.rt) * sign(p.hh);
        ctx.readout('rule', s0 === 0 ? ctx.t('ruleZero') : ctx.t(s0 > 0 ? 'ruleSame' : 'ruleDiff'));
        return;
      }
      if (mode() === 'ueben') {
        ctx.readout('term', drill.task);
        ctx.readout('res', drRes ? (drill.kind === 'sign' ? (drill.answer > 0 ? '+' : '−') : n(drill.answer)) : '–');
        ctx.readout('rule', tr('dScore', { k: drScore.right, n: drScore.all, s: drScore.streak }));
        return;
      }
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

    /* ---------- Einmaleins-Tafel ---------- */
    function drawTafel(g: CanvasRenderingContext2D, W: number, H: number): void {
      const th = ctx.theme;
      const narrow = W < 560;
      const N = 6;
      const cells = 2 * N + 2;
      const cs = Math.min((W - 20) / cells, (H - 40) / cells);
      const gx = (W - cells * cs) / 2;
      const gy = 30 + (H - 40 - cells * cs) / 2;
      text(g, ctx.t('tTitle'), W / 2, 16, { font: `700 ${narrow ? 12 : 14}px ${th.font}`, color: th.text });
      const fsz = Math.max(8, Math.min(14, cs * 0.42));
      for (let i = 0; i < cells; i++) {
        for (let j = 0; j < cells; j++) {
          const a = N - (i - 1);
          const b = j - 1 - N;
          const x = gx + j * cs;
          const y = gy + i * cs;
          if (i === 0 && j === 0) {
            text(g, '·', x + cs / 2, y + cs / 2, { font: `700 ${fsz + 2}px ${th.font}`, color: th.muted });
            continue;
          }
          if (i === 0 || j === 0) {
            const v = i === 0 ? b : a;
            if (i === 0 && j > cells - 1) continue;
            const sel = (i === 0 && b === p.b) || (j === 0 && a === p.a);
            g.fillStyle = withAlpha(th.grid, sel ? 0.9 : 0.4);
            g.fillRect(x + 1, y + 1, cs - 2, cs - 2);
            text(g, n(v), x + cs / 2, y + cs / 2 + 1, { font: `700 ${fsz}px ${th.font}`, color: th.text });
            continue;
          }
          if (a < -N || b > N) continue;
          const v = a * b;
          const pos = v > 0;
          const sel = a === p.a && b === p.b;
          const line = a === p.a || b === p.b;
          g.fillStyle = v === 0 ? withAlpha(th.grid, 0.25) : withAlpha(th.series[pos ? 2 : 1]!, sel ? 0.55 : line ? 0.22 : 0.1);
          g.fillRect(x + 1, y + 1, cs - 2, cs - 2);
          if (sel) {
            g.strokeStyle = th.series[pos ? 2 : 1]!;
            g.lineWidth = 2;
            g.strokeRect(x + 1, y + 1, cs - 2, cs - 2);
          }
          if (cs > 22 || sel) text(g, n(v), x + cs / 2, y + cs / 2 + 1, { font: `${sel ? 800 : 500} ${fsz}px ${th.font}`, color: v === 0 ? th.muted : th.series[pos ? 2 : 1]! });
        }
      }
    }

    /* ---------- Viele Faktoren ---------- */
    function drawViele(g: CanvasRenderingContext2D, W: number, H: number): void {
      const th = ctx.theme;
      const narrow = W < 560;
      const f = factors();
      const parts = partialProducts(f);
      const k = f.filter((x) => x < 0).length;
      text(g, tr('vTitle', { n: f.length, k }), W / 2, 22, { font: `700 ${narrow ? 13 : 15}px ${th.font}`, color: th.text });
      // Faktoren als Kärtchen, darunter das laufende Zwischenergebnis
      const cw = Math.min(70, (W - 30) / f.length - 8);
      const total = f.length * (cw + 8) - 8;
      const x0 = (W - total) / 2;
      const y0 = H * 0.2;
      const show = playing || ta < 1 ? Math.min(f.length, Math.floor(ta * (f.length + 0.999))) : f.length;
      f.forEach((x, i) => {
        const cx = x0 + i * (cw + 8);
        roundRect(g, cx, y0, cw, cw * 0.8, 8);
        g.fillStyle = withAlpha(x < 0 ? th.series[1]! : th.series[2]!, 0.15);
        g.fill();
        g.strokeStyle = x < 0 ? th.series[1]! : th.series[2]!;
        g.lineWidth = 2;
        g.stroke();
        text(g, n(x), cx + cw / 2, y0 + cw * 0.4, { font: `800 ${Math.round(cw * 0.32)}px ${th.font}`, color: x < 0 ? th.series[1]! : th.series[2]! });
        if (i < show) {
          const v = parts[i]!;
          const py = y0 + cw * 0.8 + 36;
          text(g, n(v), cx + cw / 2, py, { font: `700 ${narrow ? 12 : 14}px ${th.font}`, color: v < 0 ? th.series[1]! : th.series[2]! });
          if (i > 0 && f[i]! < 0) text(g, '↺', cx + cw / 2, py + 20, { font: `600 12px ${th.font}`, color: th.muted });
        }
      });
      text(g, ctx.t('vStep'), x0, y0 + cw * 0.8 + 16, { font: `500 11px ${th.font}`, color: th.muted, align: 'left' });
      // Ergebnis groß
      const res = product(f);
      text(g, `= ${n(res)}`, W / 2, H * 0.68, { font: `800 ${narrow ? 26 : 34}px ${th.font}`, color: res < 0 ? th.series[1]! : th.series[2]! });
      const ruleTxt = ctx.t(k % 2 === 0 ? 'vEven' : 'vOdd').replace('{k}', String(k));
      const ruleLines = narrow ? ruleTxt.split(': ') : [ruleTxt];
      ruleLines.forEach((ln, i) => text(g, ln, W / 2, H * 0.68 + (narrow ? 28 : 38) + i * 16, { font: `500 ${narrow ? 12 : 14}px ${th.font}`, color: th.muted }));
      if (k === f.length || k === 0) {
        const b = f[0]!;
        const sup = String(f.length).replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)]!);
        text(g, tr('vPow', { f: `${par(b)}${sup}`, p: n(res) }), W / 2, H * 0.68 + (narrow ? 64 : 64), { font: `600 ${narrow ? 12 : 14}px ${th.font}`, color: th.text });
      }
      // Vorzeichen-Kette: + → − → + …
      const sy = H * 0.9;
      let sgn = 1;
      const chain: string[] = ['+'];
      for (const x of f) {
        if (x < 0) sgn = -sgn;
        chain.push(sgn > 0 ? '+' : '−');
      }
      text(g, chain.join('  →  '), W / 2, sy, { font: `700 ${narrow ? 12 : 14}px ${th.font}`, color: th.muted });
    }

    /* ---------- Alltag: Temperatur ---------- */
    function drawAlltag(g: CanvasRenderingContext2D, W: number, H: number): void {
      const th = ctx.theme;
      const narrow = W < 560;
      const x0 = 40;
      const x1 = W - 30;
      const yAx = H * 0.78;
      const tAt = (h: number) => tempAfter(p.ts, p.rt, h);
      const lo = Math.min(-12, ...[-6, 6].map(tAt), p.ts) - 2;
      const hi = Math.max(22, ...[-6, 6].map(tAt), p.ts) + 2;
      const px = (h: number) => x0 + ((h + 6) / 12) * (x1 - x0);
      const py = (t: number) => yAx - ((t - lo) / (hi - lo)) * (yAx - 30);
      // Zeitachse
      g.strokeStyle = th.axis;
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(x0, yAx);
      g.lineTo(x1, yAx);
      g.stroke();
      for (let h = -6; h <= 6; h++) {
        g.beginPath();
        g.moveTo(px(h), yAx - 4);
        g.lineTo(px(h), yAx + 4);
        g.stroke();
        if (!narrow || h % 2 === 0) text(g, h === 0 ? ctx.t('aNow') : n(h), px(h), yAx + 16, { font: `500 11px ${th.font}`, color: h === 0 ? th.text : th.muted });
      }
      text(g, ctx.t('aPast'), px(-3), yAx + 34, { font: `600 11px ${th.font}`, color: th.muted });
      text(g, ctx.t('aFuture'), px(3), yAx + 34, { font: `600 11px ${th.font}`, color: th.muted });
      // 0-°C-Linie
      g.strokeStyle = withAlpha(th.series[0]!, 0.5);
      g.setLineDash([5, 4]);
      g.beginPath();
      g.moveTo(x0, py(0));
      g.lineTo(x1, py(0));
      g.stroke();
      g.setLineDash([]);
      text(g, '0 °C', x0 - 4, py(0), { font: `500 10px ${th.font}`, color: th.series[0]!, align: 'right' });
      // Verlauf der Temperatur (Gerade)
      g.strokeStyle = withAlpha(th.text, 0.35);
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(px(-6), py(tAt(-6)));
      g.lineTo(px(6), py(tAt(6)));
      g.stroke();
      // Bewegung vom Jetzt zum Ziel
      const h = p.hh * ta;
      const T = tAt(h);
      g.strokeStyle = p.rt * p.hh >= 0 ? th.series[2]! : th.series[1]!;
      g.lineWidth = 4;
      g.beginPath();
      g.moveTo(px(0), py(p.ts));
      g.lineTo(px(h), py(T));
      g.stroke();
      g.fillStyle = th.text;
      g.beginPath();
      g.arc(px(0), py(p.ts), 5, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = T >= 0 ? th.series[1]! : th.series[0]!;
      g.beginPath();
      g.arc(px(h), py(T), 8, 0, Math.PI * 2);
      g.fill();
      text(g, `${n(T)} °C`, px(h), py(T) - 18, { font: `800 ${narrow ? 14 : 16}px ${th.font}`, color: th.text });
      text(g, tr('aText', { r: par(p.rt), h: par(p.hh), d: n(p.rt * p.hh) }), W / 2, 18, { font: `600 ${narrow ? 12 : 14}px ${th.font}`, color: th.text });
    }

    /* ---------- Kopfrechnen ---------- */
    function drawDrill(g: CanvasRenderingContext2D, W: number, H: number): void {
      const th = ctx.theme;
      const narrow = W < 560;
      text(g, ctx.t('dTitle'), W / 2, 22, { font: `700 ${narrow ? 13 : 15}px ${th.font}`, color: th.series[0]! });
      if (drill.kind === 'sign') text(g, ctx.t('dSign'), W / 2, 50, { font: `600 ${narrow ? 12 : 14}px ${th.font}`, color: th.muted });
      const fs = Math.min(narrow ? 30 : 46, W / (drill.task.length * 0.62 + 4));
      const ans = drRes ? (drill.kind === 'sign' ? (drill.answer > 0 ? '+' : '−') : n(drill.answer)) : p.da.trim() || '?';
      text(g, `${drill.task} = ${ans}`, W / 2, H * 0.36, { font: `800 ${fs}px ${th.font}`, color: drRes === null ? th.text : drRes ? th.series[2]! : th.series[1]! });
      if (drBad) text(g, ctx.t('dHow'), W / 2, H * 0.52, { font: `600 14px ${th.font}`, color: th.series[3]! });
      else if (drRes !== null) {
        text(g, ctx.t(drRes ? 'dOk' : 'dNo'), W / 2, H * 0.52, { font: `800 ${narrow ? 20 : 26}px ${th.font}`, color: drRes ? th.series[2]! : th.series[1]! });
        text(g, ctx.t(`dHint_${drill.kind}`), W / 2, H * 0.62, { font: `500 ${narrow ? 12 : 14}px ${th.font}`, color: th.muted });
        if (!drRes && drTries >= 2) text(g, tr('dSol', { a: drill.kind === 'sign' ? (drill.answer > 0 ? '+' : '−') : n(drill.answer) }), W / 2, H * 0.7, { font: `700 14px ${th.font}`, color: th.text });
      } else text(g, ctx.t('dHow'), W / 2, H * 0.52, { font: `500 14px ${th.font}`, color: th.muted });
      const done = Math.min(10, drScore.all);
      for (let i = 0; i < 10; i++) {
        g.beginPath();
        g.arc(W / 2 - 90 + i * 20, H - 24, 6, 0, Math.PI * 2);
        g.fillStyle = i < done ? (i < drScore.right ? th.series[2]! : th.series[1]!) : withAlpha(th.muted, 0.25);
        g.fill();
      }
    }

    function render(): void {
      if (mode() === 'tafel' || mode() === 'viele' || mode() === 'alltag' || mode() === 'ueben') {
        const g0 = surface.begin();
        const W0 = surface.width;
        const H0 = surface.height;
        if (mode() === 'tafel') drawTafel(g0, W0, H0);
        else if (mode() === 'viele') drawViele(g0, W0, H0);
        else if (mode() === 'alltag') drawAlltag(g0, W0, H0);
        else drawDrill(g0, W0, H0);
        return;
      }
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

    function checkDr(): void {
      const r = checkDrill(drill, p.da);
      if (r === null) {
        drBad = true;
        return;
      }
      drBad = false;
      drRes = r;
      drTries += 1;
      if (drTries === 1) drScore = { right: drScore.right + (r ? 1 : 0), all: drScore.all + 1, streak: r ? drScore.streak + 1 : 0 };
    }

    return {
      update(changed, source) {
        if (source === 'init' || source === 'replace' || changed.has('dq')) {
          drill = makeDrill(p.dq);
          drRes = null;
          drTries = 0;
          drBad = false;
        }
        if (changed.has('da')) {
          if (drRes === false) drRes = null;
          drBad = false;
        }
        if (['mode', 'rt', 'hh', 'ts', 'nf', 'nn', 'fv'].some((k) => changed.has(k))) {
          ta = 1;
          playing = false;
        }
        updateReadouts();
      },
      action(id) {
        if (id === 'play') {
          if (prefersReducedMotion()) ta = 1;
          else {
            ta = 0;
            playing = true;
            ctx.clock.play();
          }
        } else if (id === 'dcheck') checkDr();
        else if (id === 'dnext') {
          ctx.set({ dq: p.dq >= 999 ? 1 : p.dq + 1, da: '' });
          return;
        }
        updateReadouts();
        ctx.requestRender();
      },
      tick(dt) {
        if (!playing) {
          ctx.clock.pause();
          return;
        }
        ta = Math.min(1, ta + dt / 2.5);
        if (ta >= 1) playing = false;
      },
      render,
      destroy: () => surface.destroy(),
    };
  },
});
