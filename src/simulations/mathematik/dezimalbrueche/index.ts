import { defineSimulation, ease, mixColor, prefersReducedMotion, roundRect, softShadow, Surface, text, Tween, withAlpha, type Rect } from '../../../sim-core';
import { denominatorFactors, levelBounds, longDivision, nextRemainder, placeName, powerOfTen, predict, primeFactors, remainders, type DecimalKind, type Expansion } from './model';
import { drawFrac, drawRich, fill, fr, fracWidth, richHeight, type TextToken, type Token } from './rich';

const L = (de: string, en: string) => ({ de, en });
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
/** Abschnitt [a, b] einer Animation (0 … 1) auf 0 … 1 abbilden. */
const seg = (u: number, a: number, b: number) => clamp((u - a) / (b - a), 0, 1);

type Mode = 'teilen' | 'tafel';
/** Nenner in der Tafel: 2 … 50 (7 × 7 Kacheln). */
const TAFEL_MAX = 50;

interface Hit {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  /** Kreisförmiger Bereich (Mittelpunkt x/y, Radius r). */
  r?: number;
  cursor?: string;
}

interface MsgLine {
  tokens: Token[];
  color?: string;
}

interface DecPart {
  s: string;
  color: string;
  /** Unter dem Periodenstrich. */
  over?: boolean;
}

interface SheetGeo {
  R: Rect;
  /** Kästchengröße. */
  c: number;
  gx: number;
  gy: number;
  cols: number;
  rowsVis: number;
  bottom: number;
  msg: Rect;
  titleY: number;
}

/**
 * Endliche und periodische Dezimalbrüche: schriftliche Division auf
 * Karopapier, Schritt für Schritt animiert; sobald ein Rest wiederkehrt,
 * wird die Periode sichtbar. Dazu der Restekreis (welcher Rest folgt auf
 * welchen?), eine Zahlenstrahl-Lupe (jede Ziffer = zehnfache Vergrößerung)
 * und eine Tafel aller Nenner bis 50 mit der Regel über die Primfaktoren 2 und 5.
 */
export default defineSimulation({
  id: 'dezimalbrueche',
  layout: { aspect: 1.45, aspectNarrow: 0.46 },
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Ansicht', 'View'),
      options: [
        { value: 'teilen', label: L('Schriftlich dividieren', 'Long division') },
        { value: 'tafel', label: L('Welche Nenner?', 'Which denominators?') },
      ],
      default: 'teilen',
    },
    { key: 'z', type: 'number', label: L('Zähler', 'Numerator'), min: 1, max: 99, step: 1, default: 3 },
    { key: 'n', type: 'number', label: L('Nenner', 'Denominator'), min: 2, max: 50, step: 1, default: 7 },
    {
      key: 'bild',
      type: 'choice',
      label: L('Veranschaulichung', 'Visualisation'),
      options: [
        { value: 'kreis', label: L('Restekreis', 'Remainder circle') },
        { value: 'lupe', label: L('Zahlenstrahl-Lupe', 'Number line zoom') },
      ],
      default: 'kreis',
      visibleIf: (v) => v.mode === 'teilen',
    },
    {
      key: 'alle',
      type: 'boolean',
      label: L('Alle Restepfeile zeigen', 'Show all remainder arrows'),
      help: L('Zeigt für jeden möglichen Rest, welcher Rest beim Teilen als Nächstes kommt.', 'Shows for every possible remainder which remainder comes next.'),
      default: false,
      visibleIf: (v) => v.mode === 'teilen' && v.bild === 'kreis',
    },
    {
      key: 'show',
      type: 'boolean',
      label: L('Ganze Rechnung sofort zeigen', 'Show the whole calculation right away'),
      help: L('Ausgeschaltet rechnest du mit „Nächste Stelle“ selbst Schritt für Schritt.', 'When off, you go step by step with “Next digit”.'),
      default: true,
      visibleIf: (v) => v.mode === 'teilen',
    },
    {
      key: 'fak',
      type: 'boolean',
      label: L('Primfaktoren der Nenner zeigen', 'Show prime factors of the denominators'),
      default: false,
      visibleIf: (v) => v.mode === 'tafel',
    },
  ],
  actions: [
    { id: 'step', label: L('Nächste Stelle', 'Next digit'), primary: true, visibleIf: (v) => v.mode === 'teilen' },
    { id: 'auto', label: L('Vorrechnen', 'Play'), visibleIf: (v) => v.mode === 'teilen' },
    { id: 'restart', label: L('Von vorn', 'Start over'), visibleIf: (v) => v.mode === 'teilen' },
    { id: 'open', label: L('Schriftlich dividieren', 'Long division'), primary: true, visibleIf: (v) => v.mode === 'tafel' },
  ],
  readouts: [
    { key: 'frac', label: L('Bruch', 'Fraction') },
    { key: 'dec', label: L('Dezimalbruch', 'Decimal'), spoiler: true },
    { key: 'kind', label: L('Art', 'Type'), spoiler: true },
    { key: 'denom', label: L('Nenner (gekürzt)', 'Denominator (reduced)') },
    { key: 'rests', label: L('Reste', 'Remainders'), spoiler: true },
    { key: 'finite', label: L('Endlich bei den Nennern', 'Terminating for the denominators'), spoiler: true },
  ],
  presets: [
    { id: 'start', label: L('3/7: Periode mit 6 Ziffern', '3/7: period of 6 digits'), values: {} },
    { id: 'fin', label: L('3/8: endlich', '3/8: terminating'), values: { z: 3, n: 8 } },
    { id: 'pre', label: L('1/6: mit Vorperiode', '1/6: with pre-period'), values: { z: 1, n: 6 } },
    { id: 'long', label: L('1/17: lange Periode', '1/17: long period'), values: { z: 1, n: 17 } },
    { id: 'lupe', label: L('Lupe: 1/3', 'Zoom: 1/3'), values: { z: 1, n: 3, bild: 'lupe' } },
    { id: 'tafel', label: L('Welche Nenner? (mit Primfaktoren)', 'Which denominators? (with prime factors)'), values: { z: 1, n: 12, mode: 'tafel', fak: true } },
  ],
  strings: {
    de: {
      canvas: 'Schriftliche Division auf Karopapier mit Resten, Restekreis bzw. Zahlenstrahl-Lupe und Ergebnis als endlicher oder periodischer Dezimalbruch',
      divSign: ':',
      sheetTitle: 'Schriftliche Division',
      kreisTitle: 'Restekreis',
      lupeTitle: 'Zahlenstrahl-Lupe',
      msgStart0: '{z}\u00a0:\u00a0{n}\u00a0=\u00a00 Rest\u00a0{r}. Komma setzen und an den Rest eine Null anhängen.',
      msgStartQ: '{z}\u00a0:\u00a0{n}\u00a0=\u00a0{q} Rest\u00a0{r}. Komma setzen und an den Rest eine Null anhängen.',
      msgTap: 'Weiter mit „Nächste Stelle“ oder durch Tippen auf das Blatt.',
      msgStep: 'Rest\u00a0{r}, Null anhängen: {v}\u00a0:\u00a0{n}\u00a0=\u00a0{d} Rest\u00a0{r2}, denn {d}\u00a0·\u00a0{n}\u00a0=\u00a0{p}.',
      msgEnd: 'Rest 0: Die Division geht auf – der Dezimalbruch ist endlich.',
      msgRepeat: 'Den Rest {r} gab es schon! Ab hier wiederholt sich alles – die Ziffern sind periodisch.',
      msgGanz: '{z}\u00a0:\u00a0{n}\u00a0=\u00a0{q} – die Division geht ohne Rest auf, es gibt keine Nachkommastellen.',
      sameRest: 'gleicher Rest wie oben',
      restZero: 'Rest 0 – fertig',
      kreisStart: 'Start mit Rest {r}. Jeder Schritt führt vom Rest zum nächsten Rest.',
      kreisSoFar: 'Reste bisher: {list} – noch keiner doppelt.',
      kreisRepeat: 'Rest {r} kommt wieder: ein Kreislauf aus {k} Resten – die Periode hat {k} Ziffern.',
      kreisRepeat1: 'Rest {r} kommt sofort wieder: Die Periode hat nur 1 Ziffer.',
      kreisMax: 'Beim Teilen durch {n} gibt es nur die Reste 1 bis {m} – eine Periode hat höchstens {m} Ziffern.',
      kreisEnd: 'Rest 0 erreicht – die Division geht auf.',
      kreisEnd2: 'Bei endlichen Dezimalbrüchen endet der Weg bei 0.',
      kreisGanz: '{z} : {n} geht ohne Rest auf: Rest 0.',
      kreisAll: 'Tippe auf einen Rest, um dort zu starten.',
      lupeHint: 'Jede Stufe vergrößert den markierten Abschnitt auf das Zehnfache – seine Nummer ist die nächste Ziffer.',
      lupeRepeat: 'Der Rest {r} wiederholt sich – und damit auch das Bild in der Lupe: Die Ziffern gehen endlos so weiter.',
      lupeEnd: 'Der Wert liegt genau auf einem Teilstrich – mehr Nachkommastellen gibt es nicht.',
      lupeGanz: '{q} liegt genau auf einem Strich des Zahlenstrahls.',
      exactly: 'genau {d}',
      placeN: '{k}. Nachkommastelle',
      kFin: 'endlicher Dezimalbruch',
      kRein: 'rein periodisch',
      kMix: 'gemischt periodisch',
      kGanz: 'ganze Zahl',
      kRun: 'Rechnung läuft …',
      sFin1: '1 Nachkommastelle',
      sFin: '{k} Nachkommastellen',
      sRein: 'Periodenlänge {k}',
      sMix: 'Vorperiode {a} · Periode {b}',
      sRun1: '1 Stelle berechnet',
      sRun: '{k} Stellen berechnet',
      sRun0: 'noch keine Nachkommastelle',
      reducedTo: 'Gekürzt: {a} = {b}.',
      expFin: 'Nenner {f}: nur die Primfaktoren 2 und 5. Erweitern auf eine Zehnerpotenz: {a} = {b}.',
      expRein: 'Nenner {f}: weder 2 noch 5 als Primfaktor – die Periode beginnt direkt nach dem Komma.',
      expMix: 'Nenner {f}: {a} → Vorperiode, {b} → Periode.',
      fac1: 'Faktor {p}',
      facN: 'Faktoren {p}',
      rule: 'Ein vollständig gekürzter Bruch ist genau dann ein endlicher Dezimalbruch, wenn sein Nenner nur die Primfaktoren 2 und 5 hat. Kommen 2 oder 5 zusammen mit anderen Primfaktoren vor, gibt es eine Vorperiode.',
      ruleTitle: 'Regel',
      expGanz: '{z} ist durch {n} teilbar, also ist {a} eine ganze Zahl.',
      expWait: 'Endlich oder periodisch? Achte auf die Reste – oder auf die Primfaktoren des Nenners.',
      prime: '(Primzahl)',
      tafelTitle: 'Welche Brüche {f} sind endliche Dezimalbrüche?',
      lgFin: 'endlich',
      lgRein: 'rein periodisch',
      lgMix: 'gemischt periodisch',
      tafelStats: 'Endlich bei {k} von 49 Nennern',
      tafelHint: 'Tippe auf eine Kachel. Ein zweites Mal öffnet die schriftliche Division.',
      kindFin: 'endlich, {s}',
      kindRein: 'rein periodisch, Periodenlänge {k}',
      kindMix: 'gemischt periodisch: Vorperiode {a}, Periode {b}',
      kindGanz: 'ganze Zahl',
      actAuto: 'Vorrechnen',
      actStop: 'Anhalten',
      and: 'und',
    },
    en: {
      canvas: 'Long division on squared paper with remainders, remainder circle or number line zoom, and the result as a terminating or repeating decimal',
      divSign: '÷',
      sheetTitle: 'Long division',
      kreisTitle: 'Remainder circle',
      lupeTitle: 'Number line zoom',
      msgStart0: '{z}\u00a0÷\u00a0{n}\u00a0=\u00a00 remainder\u00a0{r}. Write the decimal point and bring down a zero.',
      msgStartQ: '{z}\u00a0÷\u00a0{n}\u00a0=\u00a0{q} remainder\u00a0{r}. Write the decimal point and bring down a zero.',
      msgTap: 'Continue with “Next digit” or by tapping the paper.',
      msgStep: 'Remainder\u00a0{r}, bring down a zero: {v}\u00a0÷\u00a0{n}\u00a0=\u00a0{d} remainder\u00a0{r2}, since {d}\u00a0·\u00a0{n}\u00a0=\u00a0{p}.',
      msgEnd: 'Remainder 0: the division ends – the decimal terminates.',
      msgRepeat: 'Remainder {r} has appeared before! From here everything repeats – the digits are periodic.',
      msgGanz: '{z}\u00a0÷\u00a0{n}\u00a0=\u00a0{q} – no remainder, so there are no decimal places.',
      sameRest: 'same remainder as above',
      restZero: 'remainder 0 – done',
      kreisStart: 'Start with remainder {r}. Each step leads from one remainder to the next.',
      kreisSoFar: 'Remainders so far: {list} – none repeated yet.',
      kreisRepeat: 'Remainder {r} comes back: a cycle of {k} remainders – the period has {k} digits.',
      kreisRepeat1: 'Remainder {r} comes back at once: the period has just 1 digit.',
      kreisMax: 'When dividing by {n}, only the remainders 1 to {m} are possible – a period has at most {m} digits.',
      kreisEnd: 'Remainder 0 reached – the division ends.',
      kreisEnd2: 'For terminating decimals the path ends at 0.',
      kreisGanz: '{z} ÷ {n} leaves no remainder: remainder 0.',
      kreisAll: 'Tap a remainder to start there.',
      lupeHint: 'Each level magnifies the marked section ten times – its number is the next digit.',
      lupeRepeat: 'Remainder {r} repeats – and so does the picture in the zoom: the digits go on like this forever.',
      lupeEnd: 'The value lies exactly on a tick mark – there are no more decimal places.',
      lupeGanz: '{q} lies exactly on a tick mark of the number line.',
      exactly: 'exactly {d}',
      placeN: 'decimal place {k}',
      kFin: 'terminating decimal',
      kRein: 'purely repeating',
      kMix: 'repeating after a pre-period',
      kGanz: 'whole number',
      kRun: 'calculating …',
      sFin1: '1 decimal place',
      sFin: '{k} decimal places',
      sRein: 'period length {k}',
      sMix: 'pre-period {a} · period {b}',
      sRun1: '1 digit so far',
      sRun: '{k} digits so far',
      sRun0: 'no decimal places yet',
      reducedTo: 'Reduced: {a} = {b}.',
      expFin: 'Denominator {f}: only the prime factors 2 and 5. Expand to a power of ten: {a} = {b}.',
      expRein: 'Denominator {f}: neither 2 nor 5 is a prime factor – the period starts right after the decimal point.',
      expMix: 'Denominator {f}: {a} → pre-period, {b} → period.',
      fac1: 'factor {p}',
      facN: 'factors {p}',
      rule: 'A fully reduced fraction is a terminating decimal exactly when its denominator has no prime factors other than 2 and 5. If 2 or 5 occur together with other prime factors, there is a pre-period.',
      ruleTitle: 'Rule',
      expGanz: '{z} is divisible by {n}, so {a} is a whole number.',
      expWait: 'Terminating or repeating? Watch the remainders – or the prime factors of the denominator.',
      prime: '(prime)',
      tafelTitle: 'Which fractions {f} give terminating decimals?',
      lgFin: 'terminating',
      lgRein: 'purely repeating',
      lgMix: 'with pre-period',
      tafelStats: 'Terminating for {k} of 49 denominators',
      tafelHint: 'Tap a tile. Tap it again to open the long division.',
      kindFin: 'terminating, {s}',
      kindRein: 'purely repeating, period length {k}',
      kindMix: 'repeating: pre-period {a}, period {b}',
      kindGanz: 'whole number',
      actAuto: 'Play',
      actStop: 'Pause',
      and: 'and',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const lang = ctx.lang;
    const reduced = prefersReducedMotion();
    const sep = lang === 'de' ? ',' : '.';
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const rich = (key: string, vars: Record<string, string | number | Token | Token[]>, base: Partial<TextToken> = {}) => fill(ctx.t(key), vars, base);
    const mode = () => p.mode as Mode;
    const isWide = () => surface.width >= 600;
    const F = () => ctx.theme.font;
    const colRest = () => ctx.theme.series[0]!;
    const colPer = () => ctx.theme.series[3]!;
    const colFin = () => ctx.theme.series[2]!;
    /** Deckkraft für beliebige Farben (auch rgb()). */
    const alpha = (c: string, a: number) => mixColor(c, c, 0, a);
    const bold = (t: string, color?: string): Token => ({ t, bold: true, color });
    const msgSize = () => (surface.width >= 780 ? 13 : 12);

    let hits: Hit[] = [];
    let hover: string | null = null;

    /* ================================================================ */
    /* Zustand der Division                                             */
    /* ================================================================ */
    let exp: Expansion = longDivision(p.z, p.n);
    let shown = 0;
    const stepTween = new Tween(1150, ease.linear);
    const revealTween = new Tween(1400, ease.linear);
    let revealPending = false;
    let auto = false;
    let autoAt = 0;
    const cam = { x: 0, y: 0 };
    let camManual = false;
    let camSnap = true;
    let lastNow = performance.now();
    let sheetDrag: { px: number; py: number; cx: number; cy: number; moved: boolean } | null = null;
    let lastSheet: SheetGeo | null = null;

    const total = () => exp.steps.length;
    const complete = () => shown >= exp.steps.length;
    const periodic = () => exp.kind === 'rein' || exp.kind === 'gemischt';
    /** Fertig und Auflösung schon gestartet (Farben/Ringe einblenden). */
    const done = () => complete() && !revealPending;
    /** Einblenden der Auflösung 0 … 1. */
    const revealMix = () => (done() ? ease.inOutCubic(revealTween.t) : 0);

    function recompute(): void {
      exp = longDivision(p.z, p.n);
      shown = p.show ? exp.steps.length : 0;
      stepTween.finish();
      revealTween.finish();
      revealPending = false;
      auto = false;
      autoAt = 0;
      camManual = false;
      camSnap = true;
    }

    function step(): boolean {
      if (complete()) return false;
      shown++;
      stepTween.play();
      if (complete()) revealPending = true;
      camManual = false;
      updateActions();
      updateReadouts();
      ctx.requestRender();
      return true;
    }

    function restart(): void {
      shown = 0;
      auto = false;
      autoAt = 0;
      stepTween.finish();
      revealTween.finish();
      revealPending = false;
      camManual = false;
      updateActions();
      ctx.requestRender();
    }

    /** Farbe der i-ten Nachkommaziffer nach der Auflösung (Vorperiode/endlich grün, Periode orange). */
    const digitColor = (i: number) => (exp.kind === 'endlich' || i <= exp.preLength ? colFin() : colPer());

    /* ================================================================ */
    /* Allgemeine Zeichenbausteine                                      */
    /* ================================================================ */

    function panel(r: Rect, radius = 14): void {
      const g = surface.g;
      g.fillStyle = withAlpha(ctx.theme.text, ctx.theme.dark ? 0.045 : 0.028);
      roundRect(g, r.x, r.y, r.w, r.h, radius);
      g.fill();
    }

    function panelTitle(r: Rect, label: string): void {
      text(surface.g, label.toUpperCase(), r.x + 14, r.y + 17, { font: `800 ${isWide() ? 11 : 10.5}px ${F()}`, color: ctx.theme.muted, align: 'left' });
    }

    function messageHeight(w: number, lines: MsgLine[], size: number): number {
      return lines.reduce((h, line) => h + richHeight(surface.g, line.tokens, size, F(), w) + 2, 0);
    }

    function message(r: Rect, lines: MsgLine[], size: number, align: 'center' | 'left' = 'center'): number {
      const g = surface.g;
      let y = r.y;
      for (const line of lines) {
        y += drawRich(g, line.tokens, align === 'center' ? r.x + r.w / 2 : r.x, y, { size, font: F(), color: line.color ?? ctx.theme.text, maxW: r.w, align });
        y += 2;
      }
      return y - r.y;
    }

    /** Text mit Rand in Hintergrundfarbe (gegen kreuzende Linien). */
    function haloText(str: string, x: number, y: number, font: string, color: string, align: CanvasTextAlign = 'center', halo = ctx.theme.bg): void {
      const g = surface.g;
      g.save();
      g.font = font;
      g.textAlign = align;
      g.textBaseline = 'middle';
      g.lineJoin = 'round';
      g.lineWidth = 4;
      g.strokeStyle = halo;
      g.strokeText(str, x, y);
      g.fillStyle = color;
      g.fillText(str, x, y);
      g.restore();
    }

    /** Teile eines Dezimalbruchs zum Zeichnen (mit Farben und Periodenstrich). */
    function decParts(e: Expansion, upto: number, final: boolean, mix = 1): DecPart[] {
      const T = ctx.theme;
      const parts: DecPart[] = [{ s: String(e.integer), color: T.text }];
      if (e.kind === 'ganz') return parts;
      parts.push({ s: sep, color: T.text });
      if (upto === 0) {
        parts.push({ s: '…', color: T.muted });
        return parts;
      }
      for (let i = 1; i <= upto; i++) {
        const d = e.digits[i - 1]!;
        if (!final) parts.push({ s: d, color: T.text });
        else parts.push({ s: d, color: mixColor(T.text, digitColor(i), mix), over: e.kind !== 'endlich' && i > e.preLength });
      }
      if (!final) parts.push({ s: '…', color: T.muted });
      return parts;
    }

    /**
     * Dezimalbruch zeichnen, (x, cy) = linker Rand bzw. Mitte und
     * Zeilenmitte. Zu lange Ziffernfolgen werden mit „…“ gekürzt.
     */
    function drawDecimal(parts: DecPart[], x: number, cy: number, size: number, maxW: number, align: 'left' | 'center', overT = 1, weight = 750): number {
      const g = surface.g;
      g.font = `${weight} ${size}px ${F()}`;
      let list = parts;
      let ws = list.map((pt) => g.measureText(pt.s).width);
      const sum = (a: number[]) => a.reduce((s, v) => s + v, 0);
      if (sum(ws) > maxW) {
        list = [...parts];
        ws = [...ws];
        if (list[list.length - 1]!.s === '…') {
          list.pop();
          ws.pop();
        }
        const ell = g.measureText('…').width;
        while (list.length > 3 && sum(ws) + ell > maxW) {
          list.pop();
          ws.pop();
        }
        list.push({ s: '…', color: ctx.theme.muted });
        ws.push(ell);
      }
      const totalW = sum(ws);
      let px = align === 'center' ? x - totalW / 2 : x;
      const base = cy + size * 0.36;
      g.textAlign = 'left';
      g.textBaseline = 'alphabetic';
      let o0: number | null = null;
      let o1 = 0;
      list.forEach((pt, i) => {
        g.fillStyle = pt.color;
        g.fillText(pt.s, px, base);
        if (pt.over) {
          if (o0 === null) o0 = px;
          o1 = px + ws[i]!;
        }
        px += ws[i]!;
      });
      if (o0 !== null && overT > 0) {
        const th = Math.max(1.6, size * 0.08);
        g.fillStyle = colPer();
        g.fillRect(o0 - 0.5, base - size * 0.9, (o1 - o0 + 1) * overT, th);
      }
      return totalW;
    }

    /** Primfaktoren als Bausteine: 2 und 5 grün, alle anderen orange. */
    function factorTokens(n: number, withValue = true): Token[] {
      const fs = primeFactors(n);
      const colorOf = (q: number) => (q === 2 || q === 5 ? colFin() : colPer());
      if (n === 1) return [bold('1')];
      if (fs.length === 1) return [bold(String(n), colorOf(n)), { t: ` ${ctx.t('prime')}` }];
      const out: Token[] = withValue ? [bold(String(n)), { t: ' = ' }] : [];
      fs.forEach((q, i) => {
        if (i > 0) out.push({ t: ' · ' });
        out.push(bold(String(q), colorOf(q)));
      });
      return out;
    }

    /** Erklärung zum Ergebnis (Kürzen, Primfaktoren, Regel). */
    function explain(e: Expansion): MsgLine[] {
      const pr = predict(e.z, e.n);
      const lines: MsgLine[] = [];
      const pre: Token[] = [];
      if (pr.n !== e.n) pre.push(...rich('reducedTo', { a: fr(e.z, e.n), b: fr(pr.z, pr.n) }), { t: ' ' });
      const f = factorTokens(pr.n);
      if (e.kind === 'ganz') lines.push({ tokens: rich('expGanz', { z: bold(String(e.z)), n: bold(String(e.n)), a: fr(e.z, e.n) }) });
      else if (e.kind === 'endlich') {
        const pw = powerOfTen(e.z, e.n)!;
        lines.push({ tokens: [...pre, ...rich('expFin', { f, a: fr(pw.z, pw.n), b: fr(pw.numerator, pw.power, colFin()) })] });
      } else if (e.kind === 'rein') lines.push({ tokens: [...pre, ...rich('expRein', { f })] });
      else {
        // Primfaktoren 2/5 (Vorperiode) und die übrigen (Periode), jeweils ohne Wiederholung
        const ps = [...new Set(primeFactors(pr.n))];
        const group = (list: number[]): Token[] => {
          const toks: Token[] = [];
          list.forEach((q, i) => {
            if (i > 0) toks.push({ t: ` ${ctx.t('and')} ` });
            toks.push(bold(String(q), q === 2 || q === 5 ? colFin() : colPer()));
          });
          return rich(list.length === 1 ? 'fac1' : 'facN', { p: toks });
        };
        lines.push({ tokens: [...pre, ...rich('expMix', { f, a: group(ps.filter((q) => q === 2 || q === 5)), b: group(ps.filter((q) => q !== 2 && q !== 5)) })] });
      }
      return lines;
    }

    function kindBadge(k: DecimalKind | 'run'): { label: string; side: string } {
      if (k === 'run') {
        const side = shown === 0 ? ctx.t('sRun0') : shown === 1 ? ctx.t('sRun1') : tr('sRun', { k: shown });
        return { label: ctx.t('kRun'), side };
      }
      if (k === 'ganz') return { label: ctx.t('kGanz'), side: '' };
      if (k === 'endlich') return { label: ctx.t('kFin'), side: exp.preLength === 1 ? ctx.t('sFin1') : tr('sFin', { k: exp.preLength }) };
      if (k === 'rein') return { label: ctx.t('kRein'), side: tr('sRein', { k: exp.periodLength }) };
      return { label: ctx.t('kMix'), side: tr('sMix', { a: exp.preLength, b: exp.periodLength }) };
    }

    /** Passt die Zusatzangabe rechts neben das Schild? */
    function badgeFits(k: DecimalKind | 'run', maxW: number): boolean {
      const g = surface.g;
      const { label, side } = kindBadge(k);
      const fs = isWide() ? 12 : 11.5;
      g.font = `750 ${fs}px ${F()}`;
      const w = g.measureText(label).width + 20;
      g.font = `650 ${fs}px ${F()}`;
      return !side || w + 10 + g.measureText(side).width <= maxW;
    }

    function drawBadge(x: number, cy: number, k: DecimalKind | 'run', mix: number, maxW = Infinity): number {
      const g = surface.g;
      const T = ctx.theme;
      const { label, side } = kindBadge(k);
      const fs = isWide() ? 12 : 11.5;
      const below = !badgeFits(k, maxW);
      g.font = `750 ${fs}px ${F()}`;
      const w = g.measureText(label).width + 20;
      const h = fs + 11;
      const y = cy - h / 2;
      const c1 = k === 'run' ? T.muted : k === 'rein' ? colPer() : colFin();
      const c2 = k === 'gemischt' ? colPer() : c1;
      g.save();
      if (k === 'gemischt') {
        const grad = g.createLinearGradient(x, 0, x + w, 0);
        grad.addColorStop(0.45, alpha(c1, (T.dark ? 0.24 : 0.15) * mix));
        grad.addColorStop(0.55, alpha(c2, (T.dark ? 0.24 : 0.15) * mix));
        g.fillStyle = grad;
      } else g.fillStyle = alpha(c1, (T.dark ? 0.22 : 0.13) * (k === 'run' ? 1 : mix));
      roundRect(g, x, y, w, h, h / 2);
      g.fill();
      if (k === 'gemischt') {
        const grad = g.createLinearGradient(x, 0, x + w, 0);
        grad.addColorStop(0.45, c1);
        grad.addColorStop(0.55, c2);
        g.strokeStyle = grad;
      } else g.strokeStyle = alpha(c1, 0.75);
      g.lineWidth = 1.3;
      roundRect(g, x + 0.5, y + 0.5, w - 1, h - 1, h / 2);
      g.stroke();
      g.restore();
      const tc = k === 'run' ? T.muted : T.dark ? T.text : mixColor(c1, T.text, 0.35);
      text(g, label, x + w / 2, cy + 0.5, { font: `750 ${fs}px ${F()}`, color: tc });
      if (side && below) text(g, side, x + 3, cy + h / 2 + 12, { font: `650 ${fs}px ${F()}`, color: T.muted, align: 'left' });
      else if (side) text(g, side, x + w + 10, cy + 0.5, { font: `650 ${fs}px ${F()}`, color: T.muted, align: 'left' });
      return w;
    }

    /* ================================================================ */
    /* Ergebniskarte                                                    */
    /* ================================================================ */

    function cardMetrics(w: number, withWait = true) {
      const wide = isWide();
      const rowA = wide ? 62 : 52;
      const ew = w - 28;
      const fits = badgeFits(exp.kind, ew) && (!withWait || badgeFits('run', ew));
      const rowB = (wide ? 28 : 26) + (fits ? 0 : 20);
      const eh = Math.max(messageHeight(ew, explain(exp), msgSize()), withWait ? messageHeight(ew, [{ tokens: [{ t: ctx.t('expWait') }] }], msgSize()) : 0);
      return { rowA, rowB, ew, eh, h: 10 + rowA + rowB + 8 + eh + 12 };
    }

    function drawCard(R: Rect, final: boolean, withWait = true): void {
      const g = surface.g;
      const T = ctx.theme;
      const wide = isWide();
      const m = cardMetrics(R.w, withWait);
      g.save();
      softShadow(g, T.dark, 12, 3);
      g.fillStyle = T.bg;
      roundRect(g, R.x, R.y, R.w, R.h, 14);
      g.fill();
      g.restore();
      g.strokeStyle = withAlpha(T.text, T.dark ? 0.14 : 0.1);
      g.lineWidth = 1;
      roundRect(g, R.x + 0.5, R.y + 0.5, R.w - 1, R.h - 1, 14);
      g.stroke();
      const mix = final ? revealMix() : 0;
      // Zeile A: Bruch = (gekürzt =) Dezimalbruch
      const fsz = wide ? 22 : 18;
      const dsz = wide ? 27 : 21;
      const pr = predict(exp.z, exp.n);
      const cy = R.y + 10 + m.rowA / 2;
      const items: { w: number; draw: (x: number) => void }[] = [];
      const fracItem = (z: number, n: number, color: string) => {
        const w = fracWidth(g, String(z), String(n), fsz, F());
        items.push({ w, draw: (x) => drawFrac(g, x + w / 2, cy, String(z), String(n), fsz, color, F()) });
      };
      const eqItem = () => {
        const w = fsz * 1.3;
        items.push({ w, draw: (x) => text(g, '=', x + w / 2, cy + 1, { font: `700 ${fsz}px ${F()}`, color: T.muted }) });
      };
      fracItem(exp.z, exp.n, colRest());
      if (pr.n !== exp.n && pr.n !== 1) {
        eqItem();
        fracItem(pr.z, pr.n, colRest());
      }
      eqItem();
      const used = items.reduce((s, it) => s + it.w, 0);
      const parts = decParts(exp, final ? total() : shown, final, mix);
      g.font = `750 ${dsz}px ${F()}`;
      const decW = Math.min(R.w - 32 - used, parts.reduce((s, pt) => s + g.measureText(pt.s).width, 0));
      let x = R.x + Math.max(16, (R.w - used - decW) / 2);
      for (const it of items) {
        it.draw(x);
        x += it.w;
      }
      drawDecimal(parts, x, cy, dsz, R.x + R.w - 16 - x, 'left', final ? mix : 0);
      // Zeile B: Art
      const by = R.y + 10 + m.rowA + (wide ? 14 : 13);
      drawBadge(R.x + 14, by, final ? exp.kind : 'run', final ? Math.max(0.35, mix) : 1, m.ew);
      // Zeile C: Erklärung
      const er: Rect = { x: R.x + 14, y: R.y + 10 + m.rowA + m.rowB + 8, w: m.ew, h: m.eh };
      if (final) {
        g.save();
        g.globalAlpha = Math.max(0.15, mix);
        message(er, explain(exp), msgSize(), 'left');
        g.restore();
      } else message(er, [{ tokens: [{ t: ctx.t('expWait') }], color: T.muted }], msgSize(), 'left');
    }

    /* ================================================================ */
    /* Schriftliche Division auf Karopapier                             */
    /* ================================================================ */

    function layoutInfo() {
      const Lz = String(p.z).length;
      const Ln = String(p.n).length;
      const Lq = String(exp.integer).length;
      /** Zeile des Rests r₀ (mit ganzzahligem Schritt darüber, falls z ≥ n). */
      const base = exp.integer > 0 ? 2 : 1;
      /** Spalte der ersten Nachkommaziffer in der Kopfzeile. */
      const dCol = Lz + Ln + Lq + 3;
      return { Lz, Ln, Lq, base, dCol };
    }

    function sheetMessage(): MsgLine[] {
      const T = ctx.theme;
      const restTok = (r: number) => bold(String(r), colRest());
      const b = (v: number) => bold(String(v));
      if (exp.kind === 'ganz') return [{ tokens: rich('msgGanz', { z: b(p.z), n: b(p.n), q: b(exp.integer) }) }];
      if (shown === 0) {
        const first = rich(exp.integer > 0 ? 'msgStartQ' : 'msgStart0', { z: b(p.z), n: b(p.n), q: b(exp.integer), r: restTok(exp.r0) });
        return [{ tokens: first }, { tokens: [{ t: ctx.t('msgTap') }], color: T.muted }];
      }
      const s = exp.steps[shown - 1]!;
      const line: MsgLine = { tokens: rich('msgStep', { r: restTok(s.from), v: b(s.value), n: b(p.n), d: b(s.digit), r2: s.rest === 0 ? bold('0', colFin()) : restTok(s.rest), p: b(s.product) }) };
      if (!done()) return [line];
      if (exp.kind === 'endlich') return [line, { tokens: [bold(ctx.t('msgEnd'), colFin())] }];
      return [line, { tokens: rich('msgRepeat', { r: bold(String(s.rest), colPer()) }, { bold: true, color: T.text }) }];
    }

    function sheetGeo(R: Rect): SheetGeo {
      const wide = isWide();
      const titleH = wide ? 36 : 30;
      const msgW = R.w - 28;
      // Platz für die Fußzeile: so viel wie der längste Text braucht
      const size = msgSize();
      const need = Math.max(messageHeight(msgW, sheetMessage(), size), wide ? 36 : 40);
      const msgH = Math.ceil(need) + 16;
      const { Lz, dCol, base } = layoutInfo();
      const needCols = Math.max(dCol + total(), Lz + total() + 1) + 2;
      // Zeilen: Kopf + Treppe + Bemerkung darunter
      const needRows = base + 2 * total() + 3;
      const inner = R.w - 16;
      const byRows = (R.y + R.h - msgH - (R.y + titleH)) / needRows;
      const c = clamp(Math.floor(Math.min(inner / needCols, byRows)), wide ? 17 : 15, wide ? 30 : 22);
      const cols = Math.floor(inner / c);
      const gx = R.x + (R.w - cols * c) / 2;
      const gy = R.y + titleH;
      const bottom = R.y + R.h - msgH;
      const rowsVis = Math.max(2, Math.floor((bottom - gy - c) / c));
      return { R, c, gx, gy, cols, rowsVis, bottom, msg: { x: R.x + 14, y: bottom + 9, w: msgW, h: msgH - 12 }, titleY: R.y + titleH / 2 + 1 };
    }

    /** Wohin die Kamera blicken soll: Der neueste Schritt muss sichtbar sein. */
    function camTarget(sg: SheetGeo): { x: number; y: number } {
      const { Lz, base } = layoutInfo();
      let lastRow = shown === 0 ? (exp.integer > 0 ? base : 0) : base + 2 * shown;
      if (done() && total() > 0) lastRow += 1; // Platz für die Bemerkung unter dem letzten Rest
      const lastCol = Lz + shown + (complete() ? 0 : 1);
      return { x: Math.max(0, lastCol + 2 - sg.cols), y: Math.max(0, lastRow - sg.rowsVis) };
    }

    function paperColors() {
      const T = ctx.theme;
      return {
        paper: T.dark ? '#161e2a' : '#fffdf8',
        edge: T.dark ? '#2b3545' : '#e3dccb',
        grid: T.dark ? 'rgba(120,150,200,0.10)' : 'rgba(70,110,190,0.12)',
      };
    }

    function cellText(s: string, x: number, y: number, c: number, color: string, weight = 600, a = 1, scale = 1): void {
      if (a <= 0) return;
      const g = surface.g;
      g.save();
      g.globalAlpha *= a;
      g.font = `${weight} ${c * 0.66 * scale}px ${F()}`;
      g.fillStyle = color;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText(s, x + c / 2, y + c / 2 + c * 0.03);
      g.restore();
    }

    function drawSheet(R: Rect, dt: number): boolean {
      const g = surface.g;
      const T = ctx.theme;
      const wide = isWide();
      const sg = sheetGeo(R);
      lastSheet = sg;
      const pc = paperColors();
      // Kamera
      const target = camTarget(sg);
      let moving = false;
      if (camSnap) {
        cam.x = target.x;
        cam.y = target.y;
        camSnap = false;
      } else if (!camManual && !sheetDrag) {
        const k = reduced ? 1 : 1 - Math.exp(-dt * 7);
        cam.x += (target.x - cam.x) * k;
        cam.y += (target.y - cam.y) * k;
        if (Math.abs(target.x - cam.x) < 0.003 && Math.abs(target.y - cam.y) < 0.003) {
          cam.x = target.x;
          cam.y = target.y;
        } else moving = true;
      }
      // Papier
      g.save();
      softShadow(g, T.dark, 14, 4);
      g.fillStyle = pc.paper;
      roundRect(g, R.x, R.y, R.w, R.h, 12);
      g.fill();
      g.restore();
      text(g, ctx.t('sheetTitle').toUpperCase(), R.x + 16, sg.titleY, { font: `800 ${wide ? 11 : 10.5}px ${F()}`, color: T.muted, align: 'left' });
      const c = sg.c;
      // Rechenbereich (verschiebbar)
      const areaTop = sg.gy + c;
      g.save();
      g.beginPath();
      g.rect(R.x + 1, areaTop, R.w - 2, sg.bottom - areaTop);
      g.clip();
      gridLines(R, sg.gx - (cam.x % 1) * c, areaTop - (cam.y % 1) * c, areaTop, sg.bottom, c, pc.grid);
      drawStaircase(sg);
      g.restore();
      // Kopfzeile (fest)
      g.save();
      g.beginPath();
      g.rect(R.x + 1, sg.gy, R.w - 2, c);
      g.clip();
      g.fillStyle = pc.paper;
      g.fillRect(R.x, sg.gy, R.w, c);
      gridLines(R, sg.gx, sg.gy, sg.gy, sg.gy + c, c, pc.grid);
      g.restore();
      if (cam.y > 0.04) {
        const sh = g.createLinearGradient(0, sg.gy + c, 0, sg.gy + c + 8);
        sh.addColorStop(0, T.dark ? 'rgba(0,0,0,0.35)' : 'rgba(16,24,40,0.10)');
        sh.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = sh;
        g.fillRect(R.x + 1, sg.gy + c, R.w - 2, 8);
      }
      drawHeader(sg);
      // Fußzeile
      g.strokeStyle = pc.edge;
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(R.x + 12, sg.bottom + 0.5);
      g.lineTo(R.x + R.w - 12, sg.bottom + 0.5);
      g.stroke();
      message(sg.msg, sheetMessage(), msgSize());
      g.strokeStyle = pc.edge;
      roundRect(g, R.x + 0.5, R.y + 0.5, R.w - 1, R.h - 1, 12);
      g.stroke();
      const scrollable = target.x > 0 || target.y > 0;
      hits.push({ id: 'sheet', x: R.x, y: R.y, w: R.w, h: sg.bottom - R.y, cursor: !complete() && !auto ? 'pointer' : scrollable ? 'grab' : '' });
      return moving;
    }

    function gridLines(R: Rect, x0: number, y0: number, top: number, bottom: number, c: number, color: string): void {
      const g = surface.g;
      g.strokeStyle = color;
      g.lineWidth = 1;
      g.beginPath();
      let x = x0 - Math.ceil((x0 - R.x) / c) * c;
      for (; x < R.x + R.w; x += c) {
        if (x <= R.x + 1) continue;
        g.moveTo(Math.round(x) + 0.5, top);
        g.lineTo(Math.round(x) + 0.5, bottom);
      }
      let y = y0 - Math.ceil((y0 - top) / c) * c;
      for (; y <= bottom + 0.5; y += c) {
        if (y < top - 0.5) continue;
        g.moveTo(R.x, Math.round(y) + 0.5);
        g.lineTo(R.x + R.w, Math.round(y) + 0.5);
      }
      g.stroke();
    }

    function drawHeader(sg: SheetGeo): void {
      const g = surface.g;
      const T = ctx.theme;
      const c = sg.c;
      const y = sg.gy;
      const X = (col: number) => sg.gx + col * c;
      const { Lz, Ln, dCol } = layoutInfo();
      const u = stepTween.running ? stepTween.t : 1;
      const mix = revealMix();
      const put = (s: string, col0: number, color: string, weight = 700) => [...s].forEach((ch, k) => cellText(ch, X(col0 + k), y, c, color, weight));
      put(String(p.z), 1, T.text);
      cellText(ctx.t('divSign'), X(Lz + 1), y, c, T.text, 700);
      put(String(p.n), Lz + 2, T.text);
      cellText('=', X(Lz + Ln + 2), y, c, T.text, 700);
      put(String(exp.integer), Lz + Ln + 3, T.text);
      if (exp.kind === 'ganz') return;
      // Ausschnitt der Nachkommaziffern
      const cap = sg.cols - 1;
      const avail = Math.max(2, cap - dCol + 1);
      let first = 1;
      let last = shown;
      let ellLeft = false;
      let ellRight = false;
      if (shown > avail) {
        if (complete()) {
          last = avail - 1;
          ellRight = true;
        } else {
          first = shown - avail + 2;
          ellLeft = true;
        }
      }
      // Komma auf der Kästchenlinie
      if (shown > 0) {
        const ca = shown === 1 && stepTween.running ? seg(u, 0, 0.25) : 1;
        g.save();
        g.globalAlpha = ca;
        text(g, sep, X(dCol) - 0.5, y + c * 0.78, { font: `800 ${c * 0.7}px ${F()}`, color: T.text });
        g.restore();
      }
      let col = dCol;
      if (ellLeft) cellText('…', X(col++), y, c, T.muted, 700);
      let o0 = -1;
      let o1 = -1;
      for (let i = first; i <= last; i++, col++) {
        const latest = i === shown && stepTween.running;
        const a = latest ? seg(u, 0.18, 0.42) : 1;
        const sc = latest ? 0.6 + 0.4 * ease.outBack(a) : 1;
        if (i === shown && !complete()) {
          // aktuelle Ziffer leicht hinterlegt
          g.fillStyle = withAlpha(colRest(), T.dark ? 0.2 : 0.12);
          roundRect(g, X(col) + 1.5, y + 1.5, c - 3, c - 3, 4);
          g.fill();
        }
        const color = done() ? mixColor(T.text, digitColor(i), mix) : T.text;
        cellText(exp.digits[i - 1]!, X(col), y, c, color, 750, a, sc);
        if (done() && periodic() && i > exp.preLength) {
          if (o0 < 0) o0 = col;
          o1 = col;
        }
      }
      if (ellRight) cellText('…', X(col), y, c, T.muted, 700);
      if (o0 >= 0 && mix > 0) {
        const x0 = X(o0) + c * 0.18;
        const x1 = X(o1 + 1) - c * 0.18;
        g.fillStyle = colPer();
        g.fillRect(x0, y + c * 0.1, (x1 - x0) * mix, Math.max(1.8, c * 0.09));
      }
    }

    function drawStaircase(sg: SheetGeo): void {
      const g = surface.g;
      const T = ctx.theme;
      const c = sg.c;
      const { Lz, base } = layoutInfo();
      const X = (col: number) => sg.gx + (col - cam.x) * c;
      const Y = (row: number) => sg.gy + (row - cam.y) * c;
      const u = stepTween.running ? stepTween.t : 1;
      const mix = revealMix();
      const zeroColor = T.dark ? 'rgba(170,180,200,0.75)' : 'rgba(90,101,119,0.8)';
      const num = (v: number, endCol: number, row: number, color: string, a = 1, dy = 0) => {
        const s = String(v);
        [...s].forEach((ch, k) => cellText(ch, X(endCol - s.length + 1 + k), Y(row) + dy, c, color, 600, a));
      };
      const underline = (fromCol: number, toCol: number, row: number, t: number, color = T.text) => {
        if (t <= 0) return;
        const x0 = X(fromCol) + 2;
        const x1 = X(toCol + 1) - 2;
        g.strokeStyle = alpha(color, 0.85);
        g.lineWidth = 1.6;
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(x0, Y(row + 1) - 1.5);
        g.lineTo(x0 + (x1 - x0) * t, Y(row + 1) - 1.5);
        g.stroke();
      };
      // ganzzahliger Teil: z − q·n
      if (exp.integer > 0) {
        const prod = exp.integer * p.n;
        const lp = String(prod).length;
        num(prod, Lz, 1, T.text);
        cellText('−', X(Lz - lp), Y(1), c, T.text);
        underline(Lz - Math.max(lp, Lz) + 1, Lz, 1, 1);
        num(exp.r0, Lz, base, exp.r0 === 0 ? colFin() : colRest());
      }
      // Markierung des neuesten Schritts
      if (shown > 0) {
        const s = exp.steps[shown - 1]!;
        const endC = Lz + shown;
        const wd = Math.max(String(s.value).length, String(s.product).length + 1);
        const row = base + 2 * (shown - 1);
        const a = done() ? 1 - mix * 0.6 : 1;
        g.fillStyle = withAlpha(colRest(), (T.dark ? 0.13 : 0.075) * a);
        roundRect(g, X(endC - wd + 1) - 3, Y(row) + 1, (wd + 0) * c + 6, 3 * c - 2, 6);
        g.fill();
      }
      for (let i = 1; i <= shown; i++) {
        const s = exp.steps[i - 1]!;
        const row = base + 2 * (i - 1);
        const endC = Lz + i;
        const anim = i === shown && stepTween.running;
        const za = anim ? seg(u, 0, 0.22) : 1;
        if (i === 1 && exp.integer === 0) num(s.from, endC - 1, row, colRest(), za);
        // angehängte Null fällt von oben herein
        cellText('0', X(endC), Y(row) - (1 - ease.outCubic(za)) * c * 0.8, c, zeroColor, 600, za);
        const pa = anim ? seg(u, 0.38, 0.6) : 1;
        const lp = String(s.product).length;
        num(s.product, endC, row + 1, T.text, pa);
        cellText('−', X(endC - lp), Y(row + 1), c, T.text, 600, pa);
        const ua = anim ? seg(u, 0.55, 0.72) : 1;
        const wd = Math.max(String(s.value).length, lp);
        underline(endC - wd + 1, endC, row + 1, ease.outCubic(ua));
        const ra = anim ? seg(u, 0.7, 0.9) : 1;
        num(s.rest, endC, row + 2, s.rest === 0 ? colFin() : colRest(), ra);
      }
      // Auflösung: gleicher Rest bzw. Rest 0
      if (done() && total() > 0 && mix > 0) {
        const last = exp.steps[total() - 1]!;
        const endC = Lz + total();
        const row = base + 2 * total();
        const ring = (endCol: number, r: number, v: number, color: string) => {
          const len = String(v).length;
          const pop = ease.outBack(clamp(mix * 1.4, 0, 1));
          const cx = X(endCol - len + 1) + (len * c) / 2;
          const cy = Y(r) + c / 2;
          const w = (len * c + 6) * pop;
          const h = (c + 4) * pop;
          g.strokeStyle = color;
          g.lineWidth = 2.2;
          roundRect(g, cx - w / 2, cy - h / 2, w, h, h / 2);
          g.stroke();
          return { x: cx - (len * c + 6) / 2, y: cy };
        };
        const pc = paperColors();
        const font = `750 ${Math.max(11, c * 0.52)}px ${F()}`;
        /** Bemerkung links bündig am Ring, aber nicht über den Blattrand hinaus. */
        const noteX = (x: number, str: string) => {
          g.font = font;
          return Math.min(x + 2, sg.R.x + sg.R.w - 10 - g.measureText(str).width);
        };
        if (exp.kind === 'endlich') {
          const a = ring(endC, row, 0, colFin());
          g.save();
          g.globalAlpha = mix;
          haloText(ctx.t('restZero'), noteX(a.x, ctx.t('restZero')), Y(row + 1) + c * 0.55, font, colFin(), 'left', pc.paper);
          g.restore();
        } else {
          const rLast = last.rest;
          const j = exp.repeatOf;
          const b = ring(endC, row, rLast, colPer());
          const a = ring(Lz + j, base + 2 * j, rLast, colPer());
          // gestrichelter Pfeil: vom neuen Rest nach links, an der Treppe vorbei nach oben zum alten
          let minCol = Lz + j - String(rLast).length + 1;
          for (let i = j + 1; i <= total(); i++) minCol = Math.min(minCol, Lz + i - String(exp.steps[i - 1]!.product).length);
          const xl = X(minCol) - c * 0.55;
          const x0 = b.x - 3;
          const y0 = b.y;
          const x1 = a.x - 3;
          const y1 = a.y;
          g.save();
          g.strokeStyle = colPer();
          g.lineWidth = 1.8;
          g.setLineDash([5, 4]);
          g.beginPath();
          const steps = 40;
          const tt = clamp(mix * 1.2 - 0.1, 0, 1);
          const P = (q: number): [number, number] => {
            const m = 1 - q;
            return [m * m * m * x0 + 3 * m * m * q * xl + 3 * m * q * q * xl + q * q * q * x1, m * m * m * y0 + 3 * m * m * q * y0 + 3 * m * q * q * y1 + q * q * q * y1];
          };
          let ex = x0;
          let ey = y0;
          let px = x0;
          let py = y0;
          for (let k = 0; k <= steps * tt; k++) {
            px = ex;
            py = ey;
            [ex, ey] = P(k / steps);
            if (k === 0) g.moveTo(ex, ey);
            else g.lineTo(ex, ey);
          }
          g.stroke();
          g.setLineDash([]);
          if (tt >= 0.99) {
            const ang = Math.atan2(ey - py, ex - px);
            g.fillStyle = colPer();
            g.beginPath();
            g.moveTo(ex, ey);
            g.lineTo(ex - Math.cos(ang - 0.45) * 7, ey - Math.sin(ang - 0.45) * 7);
            g.lineTo(ex - Math.cos(ang + 0.45) * 7, ey - Math.sin(ang + 0.45) * 7);
            g.closePath();
            g.fill();
          }
          g.restore();
          g.save();
          g.globalAlpha = mix;
          haloText(ctx.t('sameRest'), noteX(b.x, ctx.t('sameRest')), Y(row + 1) + c * 0.55, font, colPer(), 'left', pc.paper);
          g.restore();
        }
      }
    }

    /* ================================================================ */
    /* Restekreis                                                       */
    /* ================================================================ */

    function circleFooter(): MsgLine[] {
      const T = ctx.theme;
      const n = p.n;
      const rs = remainders(exp);
      if (exp.kind === 'ganz') return [{ tokens: rich('kreisGanz', { z: bold(String(p.z)), n: bold(String(n)) }) }];
      if (shown === 0) return [{ tokens: rich('kreisStart', { r: bold(String(exp.r0), colRest()) }) }, { tokens: [{ t: ctx.t('kreisAll') }], color: T.muted }];
      if (!done()) {
        const list: Token[] = [];
        rs.slice(0, shown + 1).forEach((r, i) => {
          if (i > 0) list.push({ t: ' → ', color: T.muted });
          list.push(bold(String(r), colRest()));
        });
        return [{ tokens: rich('kreisSoFar', { list }) }];
      }
      if (exp.kind === 'endlich') return [{ tokens: [bold(ctx.t('kreisEnd'), colFin())] }, { tokens: [{ t: ctx.t('kreisEnd2') }], color: T.muted }];
      const r = rs[rs.length - 1]!;
      const k = exp.periodLength;
      const first = k === 1 ? rich('kreisRepeat1', { r: bold(String(r), colPer()) }) : rich('kreisRepeat', { r: bold(String(r), colPer()), k: bold(String(k), colPer()) });
      return [{ tokens: first }, { tokens: [{ t: tr('kreisMax', { n, m: n - 1 }) }], color: T.muted }];
    }

    function drawCircle(P: Rect, now: number): boolean {
      const g = surface.g;
      const T = ctx.theme;
      const n = p.n;
      panel(P);
      panelTitle(P, ctx.t('kreisTitle'));
      // Bei wenig Platz nur die erste Zeile (die zweite steht im Lernmaterial)
      const all = circleFooter();
      let lines = surface.width >= 780 ? all : all.slice(0, 1);
      const fsz = msgSize() - 0.5;
      // Ziffern-Plaketten außen nur bei wenigen Resten (sonst zu dicht)
      const tags = n <= 13 && exp.kind !== 'ganz';
      const radius = (fh: number) => Math.min(P.w / 2 - 34 - (tags ? 14 : 0), (P.h - fh - 40) / 2 - 18 - (tags ? 10 : 0));
      let fh = messageHeight(P.w - 28, lines, fsz);
      // Wird der Kreis zu klein, entfällt der Text darunter (er steht auch auf dem Rechenblatt).
      if (radius(fh) < 52) {
        lines = [];
        fh = -6;
      }
      const top = P.y + 28;
      const bottom = P.y + P.h - fh - 12;
      const cx = P.x + P.w / 2;
      const cy = (top + bottom) / 2;
      const R = Math.max(24, radius(fh));
      const nr = clamp(Math.min(((Math.PI * R) / n) * 0.62, R * 0.15), 3.2, 13);
      const big = nr >= 8.5;
      const ang = (r: number) => -Math.PI / 2 + (2 * Math.PI * r) / n;
      const pos = (r: number): [number, number] => [cx + R * Math.cos(ang(r)), cy + R * Math.sin(ang(r))];
      const u = stepTween.running ? stepTween.t : 1;
      const mix = revealMix();
      const rs = remainders(exp);
      const visited = new Set(rs.slice(0, shown + 1));
      // Kreisbahn
      g.strokeStyle = withAlpha(T.text, T.dark ? 0.12 : 0.09);
      g.lineWidth = 1.5;
      g.beginPath();
      g.arc(cx, cy, R, 0, Math.PI * 2);
      g.stroke();
      // Pfeil zwischen zwei Resten (Bogen leicht zur Mitte gekrümmt), Fortschritt t
      const edge = (a: number, b: number, color: string, width: number, t: number) => {
        if (t <= 0) return;
        const [ax, ay] = pos(a);
        const [bx, by] = pos(b);
        g.save();
        g.strokeStyle = color;
        g.fillStyle = color;
        g.lineWidth = width;
        g.lineCap = 'round';
        let ex: number;
        let ey: number;
        let tang: number;
        if (a === b) {
          // Schleife außen am Knoten
          const lr = Math.max(7, nr * 0.95);
          const d = nr + lr * 0.75;
          const lx = cx + (R + d) * Math.cos(ang(a));
          const ly = cy + (R + d) * Math.sin(ang(a));
          const base = ang(a) + Math.PI;
          const a0 = base + 0.9;
          const a1 = base + 0.9 + (2 * Math.PI - 1.8) * t;
          g.beginPath();
          g.arc(lx, ly, lr, a0, a1);
          g.stroke();
          ex = lx + lr * Math.cos(a1);
          ey = ly + lr * Math.sin(a1);
          tang = a1 + Math.PI / 2;
        } else {
          const mx = (ax + bx) / 2;
          const my = (ay + by) / 2;
          const qx = mx + (cx - mx) * 0.22;
          const qy = my + (cy - my) * 0.22;
          const B = (s: number): [number, number] => [(1 - s) * (1 - s) * ax + 2 * (1 - s) * s * qx + s * s * bx, (1 - s) * (1 - s) * ay + 2 * (1 - s) * s * qy + s * s * by];
          // Anfang und Ende um den Knotenradius kürzen
          const len = Math.hypot(bx - ax, by - ay);
          const s0 = Math.min(0.45, (nr + 2) / len);
          const s1 = 1 - Math.min(0.45, (nr + 3) / len);
          const sEnd = s0 + (s1 - s0) * t;
          g.beginPath();
          const N = 28;
          for (let k = 0; k <= N; k++) {
            const [x, y] = B(s0 + ((sEnd - s0) * k) / N);
            if (k === 0) g.moveTo(x, y);
            else g.lineTo(x, y);
          }
          g.stroke();
          [ex, ey] = B(sEnd);
          const [px, py] = B(sEnd - 0.01);
          tang = Math.atan2(ey - py, ex - px);
        }
        const hs = Math.max(5.5, width * 2.6);
        g.beginPath();
        g.moveTo(ex + Math.cos(tang) * 1.5, ey + Math.sin(tang) * 1.5);
        g.lineTo(ex - Math.cos(tang - 0.42) * hs, ey - Math.sin(tang - 0.42) * hs);
        g.lineTo(ex - Math.cos(tang + 0.42) * hs, ey - Math.sin(tang + 0.42) * hs);
        g.closePath();
        g.fill();
        g.restore();
      };
      // alle möglichen Pfeile (blass)
      if (p.alle) {
        for (let r = 1; r < n; r++) edge(r, nextRemainder(r, n), withAlpha(T.text, T.dark ? 0.22 : 0.18), 1.2, 1);
      }
      // Weg der Division
      const edgeColor = (i: number) => (done() ? mixColor(colRest(), digitColor(i), mix) : colRest());
      for (let i = 1; i <= shown; i++) {
        const anim = i === shown && stepTween.running;
        const t = anim ? ease.inOutCubic(seg(u, 0.6, 1)) : 1;
        const wdt = n > 30 ? 1.8 : 2.4;
        edge(rs[i - 1]!, rs[i]!, edgeColor(i), wdt + (done() && periodic() && i > exp.preLength ? mix * 0.8 : 0), t);
      }
      // Knoten
      for (let r = 0; r < n; r++) {
        const [x, y] = pos(r);
        const isVisited = visited.has(r) && (r !== rs[shown] || !stepTween.running || u > 0.85 || shown === 0);
        const zero = r === 0;
        const hov = hover === `node:${r}` && !ctx.locked && r > 0;
        g.save();
        if (isVisited || hov) softShadow(g, T.dark, 6, 1.5);
        g.fillStyle = isVisited ? (zero ? colFin() : colRest()) : T.bg;
        g.beginPath();
        g.arc(x, y, nr + (hov ? 1.5 : 0), 0, Math.PI * 2);
        g.fill();
        g.restore();
        if (!isVisited) {
          g.strokeStyle = zero ? alpha(colFin(), 0.8) : withAlpha(T.text, hov ? 0.6 : 0.3);
          g.lineWidth = zero ? 2 : 1.4;
          g.beginPath();
          g.arc(x, y, nr + (hov ? 1.5 : 0), 0, Math.PI * 2);
          g.stroke();
        }
        if (big) text(g, String(r), x, y + 0.5, { font: `750 ${Math.min(13, nr * 1.02)}px ${F()}`, color: isVisited ? '#ffffff' : zero ? colFin() : T.muted });
        else if (isVisited || zero || n <= 30 || r % 5 === 0) {
          const lr = R + nr + 9;
          haloText(String(r), cx + lr * Math.cos(ang(r)), cy + lr * Math.sin(ang(r)), `${isVisited ? 750 : 600} 10px ${F()}`, isVisited ? (zero ? colFin() : colRest()) : T.muted);
        }
        if (r > 0 && !ctx.locked) hits.push({ id: `node:${r}`, x, y, w: 0, h: 0, r: Math.max(nr + 3, 9), cursor: 'pointer' });
      }
      // Ziffer, die ein Rest erzeugt, als Plakette außen am Knoten
      if (tags && big) {
        for (let i = 1; i <= shown; i++) {
          const anim = i === shown && stepTween.running;
          const ta = anim ? seg(u, 0.2, 0.45) : 1;
          if (ta <= 0) continue;
          const r = rs[i - 1]!;
          const loop = rs[i] === r;
          const lr = Math.max(7, nr * 0.95);
          const d = R + nr + (loop ? 1.75 * lr + 11 : 12);
          const x = cx + d * Math.cos(ang(r));
          const y = cy + d * Math.sin(ang(r));
          const color = edgeColor(i);
          g.save();
          g.globalAlpha *= ta;
          // eckig wie ein Kästchen auf dem Rechenblatt (Knoten sind rund)
          const hs = 8 * (anim ? ease.outBack(ta) : 1);
          g.fillStyle = color;
          roundRect(g, x - hs, y - hs, 2 * hs, 2 * hs, 3.5);
          g.fill();
          text(g, String(exp.steps[i - 1]!.digit), x, y + 0.5, { font: `800 11px ${F()}`, color: '#ffffff' });
          g.restore();
        }
      }
      // Start markieren
      if (exp.kind !== 'ganz') {
        const a = ang(exp.r0);
        if (big) haloText('Start', cx + (R - nr - 16) * Math.cos(a), cy + (R - nr - 16) * Math.sin(a), `750 10.5px ${F()}`, T.muted);
        else {
          const d0 = R - nr - 4;
          const tipX = cx + d0 * Math.cos(a);
          const tipY = cy + d0 * Math.sin(a);
          g.fillStyle = T.text;
          g.beginPath();
          g.moveTo(tipX, tipY);
          g.lineTo(tipX - Math.cos(a - 0.5) * 8, tipY - Math.sin(a - 0.5) * 8);
          g.lineTo(tipX - Math.cos(a + 0.5) * 8, tipY - Math.sin(a + 0.5) * 8);
          g.closePath();
          g.fill();
        }
      }
      // aktueller Rest: Puls
      let pulsing = false;
      if (shown > 0 && stepTween.running && u > 0.85) {
        const [x, y] = pos(rs[shown]!);
        const k = seg(u, 0.85, 1);
        g.strokeStyle = alpha(colRest(), 1 - k);
        g.lineWidth = 2;
        g.beginPath();
        g.arc(x, y, nr + 3 + k * 10, 0, Math.PI * 2);
        g.stroke();
        pulsing = true;
      }
      // wiederkehrender Rest bzw. Rest 0
      if (done() && total() > 0) {
        const r = rs[rs.length - 1]!;
        const [x, y] = pos(r);
        const color = r === 0 ? colFin() : colPer();
        const pop = ease.outBack(clamp(mix * 1.3, 0, 1));
        g.strokeStyle = color;
        g.lineWidth = 2.6;
        g.beginPath();
        g.arc(x, y, (nr + 4.5) * pop, 0, Math.PI * 2);
        g.stroke();
        if (revealTween.running) {
          const k = revealTween.t;
          g.strokeStyle = alpha(color, 1 - k);
          g.lineWidth = 2;
          g.beginPath();
          g.arc(x, y, nr + 5 + k * 22, 0, Math.PI * 2);
          g.stroke();
          pulsing = true;
        }
      }
      void now;
      message({ x: P.x + 14, y: P.y + P.h - fh - 9, w: P.w - 28, h: fh }, lines, fsz);
      return pulsing;
    }

    /* ================================================================ */
    /* Zahlenstrahl-Lupe                                                */
    /* ================================================================ */

    function lupeFooter(): MsgLine[] {
      if (exp.kind === 'ganz') return [{ tokens: rich('lupeGanz', { q: bold(String(exp.integer)) }) }];
      if (!done()) return [{ tokens: [{ t: ctx.t('lupeHint') }], color: ctx.theme.muted }];
      if (exp.kind === 'endlich') return [{ tokens: [bold(ctx.t('lupeEnd'), colFin())] }];
      const rs = remainders(exp);
      return [{ tokens: rich('lupeRepeat', { r: bold(String(rs[rs.length - 1]), colPer()) }) }];
    }

    function drawLupe(P: Rect): void {
      const g = surface.g;
      const T = ctx.theme;
      const wide = isWide();
      panel(P);
      panelTitle(P, ctx.t('lupeTitle'));
      const lines = lupeFooter();
      const fsz = msgSize() - 0.5;
      const fh = messageHeight(P.w - 28, lines, fsz);
      const u = stepTween.running ? stepTween.t : 1;
      const mix = revealMix();
      const tot = total();
      const fin = done();
      let last: number;
      if (exp.kind === 'ganz') last = 0;
      else if (fin) last = tot - 1;
      else last = shown;
      const top = P.y + 34;
      const bottom = P.y + P.h - fh - 16;
      // so viele Stufen, wie bequem Platz haben
      const maxLv = clamp(Math.floor((bottom - top) / 74), 1, wide ? 3 : 2);
      const first = Math.max(0, last - maxLv + 1);
      const count = last - first + 1;
      const lh = Math.min(wide ? 86 : 80, (bottom - top) / count);
      const y0 = top + (bottom - top - lh * count) / 2 + lh * 0.5 + 4;
      const x0 = P.x + 26;
      const x1 = P.x + P.w - 26;
      const X = (t: number) => x0 + (x1 - x0) * t;
      const rs = remainders(exp);
      const levelY = (j: number) => y0 + (j - first) * lh;
      const levelAlpha = (j: number) => (!fin && j === shown && stepTween.running ? seg(u, 0.3, 0.75) : 1);
      if (first > 0) text(g, '⋮', (x0 + x1) / 2, top - 6, { font: `800 14px ${F()}`, color: T.muted });
      // Trichter vom markierten Abschnitt einer Stufe zur nächsten (zuerst, damit Beschriftungen darüber liegen)
      for (let j = first + 1; j <= last; j++) {
        const la = levelAlpha(j);
        if (la <= 0) continue;
        const d = exp.steps[j - 1]!.digit;
        const yu = levelY(j - 1) + 6;
        const yd = levelY(j) - 34;
        const color = fin ? mixColor(colRest(), digitColor(j), mix) : colRest();
        g.save();
        g.globalAlpha = la;
        g.fillStyle = alpha(color, T.dark ? 0.12 : 0.08);
        g.beginPath();
        g.moveTo(X(d / 10), yu);
        g.lineTo(X((d + 1) / 10), yu);
        g.lineTo(x1, yd);
        g.lineTo(x0, yd);
        g.closePath();
        g.fill();
        g.strokeStyle = alpha(color, 0.45);
        g.lineWidth = 1.2;
        g.setLineDash([4, 4]);
        g.beginPath();
        g.moveTo(X(d / 10), yu);
        g.lineTo(x0, yd);
        g.moveTo(X((d + 1) / 10), yu);
        g.lineTo(x1, yd);
        g.stroke();
        g.restore();
      }
      for (let j = first; j <= last; j++) {
        const y = levelY(j);
        const la = levelAlpha(j);
        if (la <= 0) continue;
        g.save();
        g.globalAlpha = la;
        // Stellenname
        const pname = placeName(j + 1, lang) ?? tr('placeN', { k: j + 1 });
        text(g, pname, x0 - 4, y - 25, { font: `700 ${wide ? 11 : 10.5}px ${F()}`, color: T.muted, align: 'left' });
        // Strahl und Teilstriche
        g.strokeStyle = T.axis;
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(x0, y);
        g.lineTo(x1, y);
        g.stroke();
        for (let k = 0; k <= 10; k++) {
          const h = k === 0 || k === 10 ? 9 : k === 5 ? 6.5 : 4.5;
          g.lineWidth = k === 0 || k === 10 ? 2.2 : 1.3;
          g.beginPath();
          g.moveTo(X(k / 10), y - h);
          g.lineTo(X(k / 10), y + h);
          g.stroke();
        }
        // Ziffer dieser Stufe (die (j+1)-te Nachkommastelle), falls schon berechnet
        const known = j < shown || (fin && j <= last);
        const terminal = fin && exp.kind === 'endlich' && j === tot - 1;
        const d = known && exp.kind !== 'ganz' ? exp.steps[j]!.digit : -1;
        const da = j === shown - 1 && stepTween.running ? seg(u, 0.18, 0.42) : 1;
        const color = fin ? mixColor(colRest(), digitColor(j + 1), mix) : colRest();
        if (d >= 0 && !terminal) {
          g.save();
          g.globalAlpha *= da;
          g.fillStyle = alpha(color, T.dark ? 0.32 : 0.24);
          g.fillRect(X(d / 10), y - 6, X((d + 1) / 10) - X(d / 10), 12);
          g.strokeStyle = color;
          g.lineWidth = 1.6;
          g.strokeRect(X(d / 10), y - 6, X((d + 1) / 10) - X(d / 10), 12);
          g.restore();
        }
        // Nummern der Abschnitte
        for (let k = 0; k < 10; k++) {
          const xc = X((k + 0.5) / 10);
          if (k === d && !terminal) {
            g.save();
            g.globalAlpha *= da;
            g.fillStyle = color;
            g.beginPath();
            g.arc(xc, y - 15, 7.5, 0, Math.PI * 2);
            g.fill();
            text(g, String(k), xc, y - 14.5, { font: `800 11px ${F()}`, color: '#ffffff' });
            g.restore();
          } else text(g, String(k), xc, y - 14.5, { font: `600 ${wide ? 10 : 9.5}px ${F()}`, color: withAlpha(T.text, 0.38) });
        }
        // Grenzen
        const [lb, rb] = levelBounds(exp, j, sep);
        haloText(lb, X(0), y + 19, `700 ${wide ? 11.5 : 11}px ${F()}`, T.text);
        haloText(rb, X(1), y + 19, `700 ${wide ? 11.5 : 11}px ${F()}`, T.text);
        // genaue Lage des Werts: Rest/Nenner
        const v = (rs[j] ?? 0) / p.n;
        const vx = X(v);
        if (terminal || exp.kind === 'ganz') {
          const tk = exp.kind === 'ganz' ? 0 : exp.steps[j]!.digit / 10;
          const tx = X(tk);
          g.strokeStyle = colFin();
          g.lineWidth = 2.4;
          g.beginPath();
          g.arc(tx, y, 8 * ease.outBack(clamp(mix * 1.3, 0, 1)), 0, Math.PI * 2);
          g.stroke();
          const label = tr('exactly', { d: `${exp.integer}${exp.kind === 'ganz' ? '' : sep + exp.digits}` });
          g.save();
          g.globalAlpha *= exp.kind === 'ganz' ? 1 : mix;
          haloText(label, clamp(tx, x0 + 64, x1 - 64), y + 21, `750 ${wide ? 11.5 : 11}px ${F()}`, colFin());
          g.restore();
        } else {
          g.fillStyle = T.text;
          g.beginPath();
          g.moveTo(vx, y + 3);
          g.lineTo(vx - 4.5, y + 11);
          g.lineTo(vx + 4.5, y + 11);
          g.closePath();
          g.fill();
          g.fillStyle = T.bg;
          g.beginPath();
          g.arc(vx, y, 3.6, 0, Math.PI * 2);
          g.fill();
          g.strokeStyle = T.text;
          g.lineWidth = 1.6;
          g.stroke();
        }
        g.restore();
      }
      message({ x: P.x + 14, y: P.y + P.h - fh - 10, w: P.w - 28, h: fh }, lines, fsz);
    }

    /* ================================================================ */
    /* Ansicht „Schriftlich dividieren“                                 */
    /* ================================================================ */

    function teilenGeo() {
      const W = surface.width;
      const H = surface.height;
      const wide = isWide();
      const pad = wide ? 14 : 8;
      const gap = wide ? 14 : 8;
      if (wide) {
        // mittlere Breiten (Tablet): rechte Spalte etwas breiter
        const sw = Math.round(W * (W >= 780 ? 0.52 : 0.47));
        const sheet: Rect = { x: pad, y: pad, w: sw - pad, h: H - 2 * pad };
        const rx = sw + gap;
        const rw = W - rx - pad;
        const ch = cardMetrics(rw).h;
        const card: Rect = { x: rx, y: pad, w: rw, h: ch };
        const viz: Rect = { x: rx, y: pad + ch + gap, w: rw, h: H - pad - (pad + ch + gap) };
        return { sheet, card, viz };
      }
      const cw = W - 2 * pad;
      const ch = cardMetrics(cw).h;
      const card: Rect = { x: pad, y: pad, w: cw, h: ch };
      const vizH = Math.round(H * 0.34);
      const viz: Rect = { x: pad, y: H - pad - vizH, w: cw, h: vizH };
      const sheet: Rect = { x: pad, y: pad + ch + gap, w: cw, h: viz.y - gap - (pad + ch + gap) };
      return { sheet, card, viz };
    }

    function drawTeilen(now: number, dt: number): boolean {
      if (revealPending && !stepTween.running) {
        revealPending = false;
        revealTween.play();
        updateActions();
      }
      if (auto) {
        if (complete()) {
          auto = false;
          updateActions();
        } else if (!stepTween.running) {
          if (autoAt === 0) autoAt = now + (reduced ? 700 : 260);
          else if (now >= autoAt) {
            autoAt = 0;
            step();
          }
        }
      }
      const geo = teilenGeo();
      drawCard(geo.card, done());
      const moving = drawSheet(geo.sheet, dt);
      let pulsing = false;
      if (p.bild === 'lupe') drawLupe(geo.viz);
      else pulsing = drawCircle(geo.viz, now);
      return stepTween.running || revealTween.running || revealPending || auto || moving || pulsing;
    }

    /* ================================================================ */
    /* Ansicht „Welche Nenner?“                                         */
    /* ================================================================ */

    function tafelGeo() {
      const W = surface.width;
      const H = surface.height;
      const wide = isWide();
      const pad = wide ? 14 : 8;
      const gap = wide ? 5 : 4;
      if (wide) {
        const gw = Math.round(W * 0.6);
        const head: Rect = { x: pad, y: pad, w: gw - pad, h: 52 };
        const grid: Rect = { x: pad, y: pad + 52, w: gw - pad, h: H - 2 * pad - 52 };
        const detail: Rect = { x: gw + 14, y: pad, w: W - gw - 14 - pad, h: H - 2 * pad };
        return { wide, head, grid, detail, gap, tw: (grid.w - 6 * gap) / 7, th: (grid.h - 6 * gap) / 7 };
      }
      const head: Rect = { x: pad, y: pad, w: W - 2 * pad, h: 58 };
      const tw = (W - 2 * pad - 6 * gap) / 7;
      const grid: Rect = { x: pad, y: pad + 58, w: W - 2 * pad, h: 7 * tw + 6 * gap };
      const detail: Rect = { x: pad, y: grid.y + grid.h + 10, w: W - 2 * pad, h: H - pad - (grid.y + grid.h + 10) };
      return { wide, head, grid, detail, gap, tw, th: tw };
    }

    function kindColor(k: DecimalKind): string {
      return k === 'rein' ? colPer() : colFin();
    }

    /** Primfaktoren für eine Kachel: kompakt mit Hochzahlen, weggekürzte durchgestrichen. */
    function tileFactors(z: number, n: number): { s: string; color: string; struck: boolean }[] {
      const fs = denominatorFactors(z, n);
      const sup = (e: number) => (e === 1 ? '' : String(e).replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)]!));
      const out: { s: string; color: string; struck: boolean }[] = [];
      for (const cancelled of [false, true]) {
        const counts = new Map<number, number>();
        for (const f of fs) if (f.cancelled === cancelled) counts.set(f.p, (counts.get(f.p) ?? 0) + 1);
        for (const [q, e] of counts) {
          if (out.length) out.push({ s: '·', color: ctx.theme.muted, struck: false });
          out.push({ s: `${q}${sup(e)}`, color: cancelled ? ctx.theme.muted : q === 2 || q === 5 ? colFin() : colPer(), struck: cancelled });
        }
      }
      return out;
    }

    function drawTile(n: number, x: number, y: number, w: number, h: number, wide: boolean): void {
      const g = surface.g;
      const T = ctx.theme;
      const pr = predict(p.z, n);
      const sel = n === p.n;
      const hov = hover === `tile:${n}`;
      const lift = hov ? 2 : 0;
      const ty = y - lift;
      const r = Math.min(10, w * 0.18);
      g.save();
      softShadow(g, T.dark, sel ? 12 : hov ? 10 : 5, sel ? 3 : 1.5);
      g.fillStyle = T.bg;
      roundRect(g, x, ty, w, h, r);
      g.fill();
      g.restore();
      g.save();
      roundRect(g, x, ty, w, h, r);
      g.clip();
      const aFill = T.dark ? 0.22 : 0.14;
      if (pr.kind === 'gemischt') {
        g.fillStyle = alpha(colFin(), aFill);
        g.beginPath();
        g.moveTo(x, ty);
        g.lineTo(x + w, ty);
        g.lineTo(x, ty + h);
        g.closePath();
        g.fill();
        g.fillStyle = alpha(colPer(), aFill);
        g.beginPath();
        g.moveTo(x + w, ty);
        g.lineTo(x + w, ty + h);
        g.lineTo(x, ty + h);
        g.closePath();
        g.fill();
      } else {
        g.fillStyle = alpha(kindColor(pr.kind), aFill);
        g.fillRect(x, ty, w, h);
      }
      g.restore();
      if (pr.kind === 'gemischt') {
        const grad = g.createLinearGradient(x, ty, x + w, ty + h);
        grad.addColorStop(0.45, alpha(colFin(), 0.7));
        grad.addColorStop(0.55, alpha(colPer(), 0.7));
        g.strokeStyle = sel ? T.text : grad;
      } else g.strokeStyle = sel ? T.text : alpha(kindColor(pr.kind), 0.6);
      g.lineWidth = sel ? 2.4 : 1.2;
      roundRect(g, x + 0.5, ty + 0.5, w - 1, h - 1, r);
      g.stroke();
      // Inhalt
      const fsz = wide ? 13 : 11;
      const hasLine = wide || p.fak;
      const fy = ty + (hasLine ? h * 0.4 : h / 2);
      drawFrac(g, x + w / 2, fy, String(p.z), String(n), fsz, T.text, F(), 750);
      if (!hasLine) return;
      const ly = ty + h * 0.8;
      if (p.fak) {
        const parts = tileFactors(p.z, n);
        const fs = wide ? 10.5 : 9.5;
        g.font = `750 ${fs}px ${F()}`;
        const ws = parts.map((pt) => g.measureText(pt.s).width + (pt.s === '·' ? 1 : 0));
        const tw = ws.reduce((s, v) => s + v, 0);
        let px = x + w / 2 - tw / 2;
        parts.forEach((pt, i) => {
          text(g, pt.s, px + ws[i]! / 2, ly, { font: `750 ${fs}px ${F()}`, color: pt.color });
          if (pt.struck) {
            g.strokeStyle = pt.color;
            g.lineWidth = 1.2;
            g.beginPath();
            g.moveTo(px - 1, ly + 3);
            g.lineTo(px + ws[i]! + 1, ly - 3);
            g.stroke();
          }
          px += ws[i]!;
        });
      } else {
        const e = longDivision(p.z, n);
        drawDecimal(decParts(e, e.steps.length, true, 1), x + w / 2, ly, 10.5, w - 8, 'center', 1, 650);
      }
    }

    function drawTafel(): boolean {
      const g = surface.g;
      const T = ctx.theme;
      const geo = tafelGeo();
      const { wide, head, grid, detail, gap, tw, th } = geo;
      // Überschrift und Legende
      const titleTokens = rich('tafelTitle', { f: fr(p.z, 'n', colRest()) }, { bold: true });
      const tsz = wide ? 14 : 12.5;
      drawRich(g, titleTokens, head.x + 2, head.y + 1, { size: tsz, font: F(), color: T.text, maxW: head.w, align: 'left' });
      const ly = head.y + head.h - 12;
      let lx = head.x + 2;
      const chip = (label: string, kind: DecimalKind) => {
        const s = 12;
        g.save();
        roundRect(g, lx, ly - s / 2, s, s, 3);
        g.clip();
        if (kind === 'gemischt') {
          g.fillStyle = alpha(colFin(), 0.55);
          g.fillRect(lx, ly - s / 2, s, s);
          g.fillStyle = alpha(colPer(), 0.55);
          g.beginPath();
          g.moveTo(lx + s, ly - s / 2);
          g.lineTo(lx + s, ly + s / 2);
          g.lineTo(lx, ly + s / 2);
          g.closePath();
          g.fill();
        } else {
          g.fillStyle = alpha(kindColor(kind), 0.55);
          g.fillRect(lx, ly - s / 2, s, s);
        }
        g.restore();
        const fs = wide ? 11.5 : 11;
        text(g, label, lx + s + 5, ly + 0.5, { font: `650 ${fs}px ${F()}`, color: T.muted, align: 'left' });
        g.font = `650 ${fs}px ${F()}`;
        lx += s + 5 + g.measureText(label).width + (wide ? 16 : 10);
      };
      chip(ctx.t('lgFin'), 'endlich');
      chip(ctx.t('lgRein'), 'rein');
      chip(ctx.t('lgMix'), 'gemischt');
      // Kacheln
      for (let n = 2; n <= TAFEL_MAX; n++) {
        const i = n - 2;
        const x = grid.x + (i % 7) * (tw + gap);
        const y = grid.y + Math.floor(i / 7) * (th + gap);
        drawTile(n, x, y, tw, th, wide);
        hits.push({ id: `tile:${n}`, x, y, w: tw, h: th, cursor: ctx.locked ? '' : 'pointer' });
      }
      // Detailkarte
      const m = cardMetrics(detail.w, false);
      const card: Rect = { x: detail.x, y: detail.y, w: detail.w, h: m.h };
      drawCard(card, true, false);
      // Statistik und Hinweis
      let count = 0;
      for (let n = 2; n <= TAFEL_MAX; n++) {
        const k = predict(p.z, n).kind;
        if (k === 'endlich' || k === 'ganz') count++;
      }
      const sz = msgSize();
      const info: Rect = { x: detail.x + 4, y: card.y + card.h + (wide ? 16 : 8), w: detail.w - 8, h: 0 };
      const bottom = detail.y + detail.h;
      // Regel unten in der rechten Spalte (nur, wenn Platz ist)
      const ruleLines: MsgLine[] = [{ tokens: [{ t: ctx.t('rule') }] }];
      const ruleH = messageHeight(detail.w - 28, ruleLines, sz - 0.5) + 40;
      let infoBottom = bottom;
      if (bottom - ruleH > info.y + (wide ? 70 : 0)) {
        const box: Rect = { x: detail.x, y: bottom - ruleH, w: detail.w, h: ruleH };
        panel(box);
        panelTitle(box, ctx.t('ruleTitle'));
        message({ x: box.x + 14, y: box.y + 30, w: box.w - 28, h: ruleH - 40 }, ruleLines, sz - 0.5, 'left');
        infoBottom = box.y - (wide ? 8 : 3);
      }
      // Statistik und Hinweis, soweit sie passen
      const stats: MsgLine[] = [{ tokens: [bold(tr('tafelStats', { k: count }), colFin())] }, { tokens: [{ t: ctx.t('tafelHint') }], color: T.muted }];
      while (stats.length && info.y + messageHeight(info.w, stats, sz) > infoBottom) stats.pop();
      message(info, stats, sz, 'left');
      return false;
    }

    /* ================================================================ */
    /* Ergebnisse und Aktionen                                          */
    /* ================================================================ */
    const frac = (z: number, n: number) => `<span class="frac"><span>${z}</span><span>${n}</span></span>`;

    function decHtml(e: Expansion): string {
      if (e.kind === 'ganz') return String(e.integer);
      return `${e.integer}${sep}${e.pre}${e.period ? `<span style="text-decoration: overline">${e.period}</span>` : ''}`;
    }

    function updateReadouts(): void {
      const pr = predict(p.z, p.n);
      ctx.readout('frac', { html: pr.n === 1 ? `${frac(p.z, p.n)} = ${pr.z}` : pr.n !== p.n ? `${frac(p.z, p.n)} = ${frac(pr.z, pr.n)}` : frac(p.z, p.n) });
      ctx.readout('dec', { html: decHtml(exp) });
      let kind: string;
      if (exp.kind === 'ganz') kind = ctx.t('kindGanz');
      else if (exp.kind === 'endlich') {
        const pw = powerOfTen(p.z, p.n)!;
        kind = `${tr('kindFin', { s: exp.preLength === 1 ? ctx.t('sFin1') : tr('sFin', { k: exp.preLength }) })}: ${frac(pw.z, pw.n)} = ${frac(pw.numerator, pw.power)}`;
      } else if (exp.kind === 'rein') kind = tr('kindRein', { k: exp.periodLength });
      else kind = tr('kindMix', { a: exp.preLength, b: exp.periodLength });
      ctx.readout('kind', { html: kind });
      const fs = primeFactors(pr.n);
      ctx.readout('denom', pr.n === 1 ? '1' : fs.length === 1 ? `${pr.n} ${ctx.t('prime')}` : `${pr.n} = ${fs.join(' · ')}`);
      if (mode() === 'teilen') {
        const rs = remainders(exp);
        ctx.readout('rests', exp.kind === 'ganz' ? '0' : `${rs.join(', ')}${periodic() ? ', …' : ''}`);
        ctx.readout('finite', null);
      } else {
        ctx.readout('rests', null);
        const list: number[] = [];
        for (let n = 2; n <= TAFEL_MAX; n++) {
          const k = predict(p.z, n).kind;
          if (k === 'endlich' || k === 'ganz') list.push(n);
        }
        ctx.readout('finite', list.join(', '));
      }
    }

    function updateActions(): void {
      ctx.setAction('step', { enabled: !complete() && !auto });
      ctx.setAction('auto', { label: ctx.t(auto ? 'actStop' : 'actAuto'), enabled: total() > 0 });
      ctx.setAction('restart', { enabled: shown > 0 || auto });
    }

    /* ---------- Zeiger ---------- */
    function hitAt(px: number, py: number): Hit | null {
      for (let i = hits.length - 1; i >= 0; i--) {
        const h = hits[i]!;
        if (h.r !== undefined) {
          if (Math.hypot(px - h.x, py - h.y) <= h.r) return h;
        } else if (px >= h.x && px <= h.x + h.w && py >= h.y && py <= h.y + h.h) return h;
      }
      return null;
    }

    surface.addTarget({
      contains: (px: number, py: number) => hitAt(px, py) !== null,
      pointerDown: (pt: { px: number; py: number }) => {
        const h = hitAt(pt.px, pt.py);
        if (!h) return false;
        if (h.id === 'sheet') sheetDrag = { px: pt.px, py: pt.py, cx: cam.x, cy: cam.y, moved: false };
        else if (h.id.startsWith('node:')) {
          const r = Number(h.id.slice(5));
          if (!ctx.locked && r > 0) ctx.set({ z: r });
        } else if (h.id.startsWith('tile:')) {
          const n = Number(h.id.slice(5));
          if (!ctx.locked) {
            if (n === p.n) ctx.set({ mode: 'teilen' });
            else ctx.set({ n });
          }
        }
        ctx.requestRender();
        return true;
      },
      pointerMove: (pt: { px: number; py: number }) => {
        if (!sheetDrag || !lastSheet) return;
        const dx = pt.px - sheetDrag.px;
        const dy = pt.py - sheetDrag.py;
        if (!sheetDrag.moved && Math.hypot(dx, dy) < 6) return;
        sheetDrag.moved = true;
        const target = camTarget(lastSheet);
        camManual = true;
        cam.x = clamp(sheetDrag.cx - dx / lastSheet.c, 0, target.x);
        cam.y = clamp(sheetDrag.cy - dy / lastSheet.c, 0, target.y);
        surface.setCursor('grabbing');
        ctx.requestRender();
      },
      pointerUp: () => {
        if (sheetDrag && !sheetDrag.moved && !auto) step();
        sheetDrag = null;
        ctx.requestRender();
      },
      hover: (pt: { px: number; py: number } | null) => {
        const h = pt ? hitAt(pt.px, pt.py) : null;
        const id = h ? h.id : null;
        if (id !== hover) {
          hover = id;
          ctx.requestRender();
        }
        surface.setCursor(h ? (h.cursor ?? 'pointer') : '');
      },
      wheel: () => false,
    });

    return {
      update(changed) {
        if (changed.has('z') || changed.has('n')) recompute();
        else if (changed.has('show')) {
          shown = p.show ? total() : 0;
          stepTween.finish();
          revealTween.finish();
          revealPending = false;
          auto = false;
          camManual = false;
          camSnap = true;
        }
        if (changed.has('mode')) {
          auto = false;
          camSnap = true;
        }
        updateReadouts();
        updateActions();
      },

      action(id) {
        if (id === 'step') {
          auto = false;
          step();
        } else if (id === 'auto') {
          if (auto) auto = false;
          else {
            if (complete()) {
              shown = 0;
              revealTween.finish();
              revealPending = false;
              camManual = false;
            }
            auto = true;
            autoAt = 0;
            step();
          }
        } else if (id === 'restart') restart();
        else if (id === 'open') {
          if (!ctx.locked) ctx.set({ mode: 'teilen' });
        }
        updateActions();
        ctx.requestRender();
      },

      render() {
        const now = performance.now();
        const dt = Math.min(0.1, (now - lastNow) / 1000);
        lastNow = now;
        hits = [];
        surface.begin();
        const anim = mode() === 'teilen' ? drawTeilen(now, dt) : drawTafel();
        if (anim) ctx.requestRender();
      },

      destroy: () => surface.destroy(),
    };
  },
});
