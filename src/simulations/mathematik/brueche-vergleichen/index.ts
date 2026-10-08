import { defineSimulation, ease, prefersReducedMotion, roundRect, softShadow, Surface, text, Tween, withAlpha, type Rect } from '../../../sim-core';
import {
  canReduceBy,
  commonDenominator,
  commonNumerator,
  compare,
  denominatorName,
  equivalents,
  expand,
  fitsRow,
  gcd,
  orderingTask,
  randomPair,
  reduce,
  reduceBy,
  reduceObstacle,
  relationSign,
  sortAscending,
  type Fraction,
  type Level,
} from './model';
import { drawFrac, drawRich, fill, fr, fracWidth, richHeight, type Token } from './rich';

const L = (de: string, en: string) => ({ de, en });
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

type Mode = 'vergleich' | 'kuerzen' | 'ordnen';
/** Größter Nenner beim Erweitern (feiner wird nicht geschnitten). */
const MAX_N = 100;

interface Hit {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  /** Kreisförmiger Bereich (Mittelpunkt x/y, Radius r) statt Rechteck. */
  r?: number;
  cursor?: string;
}

interface BarSpec {
  x: number;
  y: number;
  w: number;
  h: number;
  /** Anzahl der gezeigten Ganzen. */
  units: number;
  /** Teile pro Ganzes und gefärbte Teile. */
  n: number;
  z: number;
  /** Zusätzliche feine Schnitte: jedes Teil in k Teile (Fortschritt e von 0 bis 1). */
  k: number;
  e: number;
  color: string;
  hover?: number;
  /** Nummern in den gefärbten (feinen) Stücken einblenden (0…1). */
  count?: number;
}

interface Step {
  f: Fraction;
  op: 'start' | 'erw' | 'kurz';
  k: number;
}

interface Card {
  f: Fraction;
  /** Platz in der geordneten Reihe (−1: noch in der Auswahl). */
  slot: number;
  /** Startpunkt und Startzeit des Flugs in die Reihe. */
  from: [number, number] | null;
  fly0: number;
  shake0: number;
}

/**
 * Brüche erweitern, kürzen und vergleichen: zwei Brüche als Streifen oder
 * Kreise mit gemeinsamem Zahlenstrahl; Gleichnamigmachen bzw. Zähler
 * angleichen als animiertes Feinerschneiden. Dazu Erweitern und Kürzen mit
 * Gruppen-Klammern und Bruchwand sowie ein Spiel zum Ordnen von Brüchen.
 */
export default defineSimulation({
  id: 'brueche-vergleichen',
  dragHint: true,
  layout: { aspect: 1.6, aspectNarrow: 0.66 },
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Ansicht', 'View'),
      options: [
        { value: 'vergleich', label: L('Vergleichen', 'Compare') },
        { value: 'kuerzen', label: L('Erweitern und Kürzen', 'Expand and reduce') },
        { value: 'ordnen', label: L('Brüche ordnen', 'Order fractions') },
      ],
      default: 'vergleich',
    },
    { key: 'z1', type: 'number', label: L('Erster Bruch: Zähler', 'First fraction: numerator'), min: 0, max: 24, step: 1, default: 3, visibleIf: (v) => v.mode === 'vergleich' },
    { key: 'n1', type: 'number', label: L('Erster Bruch: Nenner', 'First fraction: denominator'), min: 1, max: 12, step: 1, default: 4, visibleIf: (v) => v.mode === 'vergleich' },
    { key: 'z2', type: 'number', label: L('Zweiter Bruch: Zähler', 'Second fraction: numerator'), min: 0, max: 24, step: 1, default: 5, visibleIf: (v) => v.mode === 'vergleich' },
    { key: 'n2', type: 'number', label: L('Zweiter Bruch: Nenner', 'Second fraction: denominator'), min: 1, max: 12, step: 1, default: 6, visibleIf: (v) => v.mode === 'vergleich' },
    {
      key: 'weg',
      type: 'choice',
      label: L('Vergleichen über', 'Compare using'),
      options: [
        { value: 'nenner', label: L('gleichen Nenner', 'common denominator') },
        { value: 'zaehler', label: L('gleichen Zähler', 'common numerator') },
      ],
      default: 'nenner',
      visibleIf: (v) => v.mode === 'vergleich',
    },
    {
      key: 'form',
      type: 'choice',
      label: L('Darstellung', 'Representation'),
      options: [
        { value: 'streifen', label: L('Streifen', 'Bars') },
        { value: 'kreis', label: L('Kreise', 'Circles') },
      ],
      default: 'streifen',
      visibleIf: (v) => v.mode === 'vergleich',
    },
    {
      key: 'show',
      type: 'boolean',
      label: L('Vergleichszeichen sofort zeigen', 'Show the comparison sign right away'),
      help: L('Ausgeschaltet tippst du selbst auf <, = oder >.', 'When off, you tap <, = or > yourself.'),
      default: true,
      visibleIf: (v) => v.mode === 'vergleich',
    },
    { key: 'z', type: 'number', label: L('Zähler', 'Numerator'), min: 0, max: 200, step: 1, default: 12, visibleIf: (v) => v.mode === 'kuerzen' },
    { key: 'n', type: 'number', label: L('Nenner', 'Denominator'), min: 1, max: 100, step: 1, default: 18, visibleIf: (v) => v.mode === 'kuerzen' },
    {
      key: 'f',
      type: 'number',
      label: L('Erweitern bzw. kürzen mit', 'Expand or reduce by'),
      help: L('Die Klammern unter dem Streifen zeigen Gruppen aus so vielen Stücken.', 'The brackets under the bar show groups of this many pieces.'),
      min: 2,
      max: 12,
      step: 1,
      default: 2,
      visibleIf: (v) => v.mode === 'kuerzen',
    },
    {
      key: 'stufe',
      type: 'choice',
      label: L('Schwierigkeit', 'Difficulty'),
      options: [
        { value: 'leicht', label: L('leicht', 'easy') },
        { value: 'mittel', label: L('mittel', 'medium') },
        { value: 'schwer', label: L('schwer', 'hard') },
      ],
      default: 'mittel',
      visibleIf: (v) => v.mode === 'ordnen',
    },
    { key: 'anz', type: 'number', label: L('Anzahl der Brüche', 'Number of fractions'), min: 3, max: 6, step: 1, default: 4, visibleIf: (v) => v.mode === 'ordnen' },
  ],
  actions: [
    { id: 'expand', label: L('Gleichnamig machen', 'Common denominator'), primary: true, visibleIf: (v) => v.mode === 'vergleich' },
    { id: 'task', label: L('Neue Aufgabe', 'New task'), visibleIf: (v) => v.mode === 'vergleich' },
    { id: 'erw', label: L('Erweitern', 'Expand'), primary: true, visibleIf: (v) => v.mode === 'kuerzen' },
    { id: 'kurz', label: L('Kürzen', 'Reduce'), visibleIf: (v) => v.mode === 'kuerzen' },
    { id: 'full', label: L('Vollständig kürzen', 'Reduce fully'), visibleIf: (v) => v.mode === 'kuerzen' },
    { id: 'round', label: L('Neue Runde', 'New round'), primary: true, visibleIf: (v) => v.mode === 'ordnen' },
    { id: 'hint', label: L('Tipp: Streifen zeigen', 'Hint: show bars'), visibleIf: (v) => v.mode === 'ordnen' },
    { id: 'solve', label: L('Auflösen', 'Solve'), visibleIf: (v) => v.mode === 'ordnen' },
  ],
  readouts: [
    { key: 'fracs', label: L('Brüche', 'Fractions') },
    { key: 'common', label: L('Erweitern', 'Expanding'), spoiler: true },
    { key: 'compare', label: L('Vergleich', 'Comparison'), spoiler: true },
    { key: 'decimal', label: L('Als Dezimalzahl', 'As decimals'), spoiler: true },
    { key: 'chain', label: L('Rechenweg', 'Steps') },
    { key: 'ggt', label: L('Größter gemeinsamer Teiler', 'Greatest common divisor'), spoiler: true },
    { key: 'reduced', label: L('Vollständig gekürzt', 'Fully reduced'), spoiler: true },
    { key: 'family', label: L('Gleichwertige Brüche', 'Equivalent fractions'), spoiler: true },
    { key: 'score', label: L('Spielstand', 'Score') },
    { key: 'order', label: L('Richtige Reihenfolge', 'Correct order'), spoiler: true },
  ],
  presets: [
    { id: 'start', label: L('3/4 oder 5/6?', '3/4 or 5/6?'), values: {} },
    { id: 'close', label: L('Knapp: 5/8 und 3/5', 'Close: 5/8 and 3/5'), values: { z1: 5, n1: 8, z2: 3, n2: 5 } },
    { id: 'numer', label: L('Gleicher Zähler: 4/9 und 6/11', 'Same numerator: 4/9 and 6/11'), values: { z1: 4, n1: 9, z2: 6, n2: 11, weg: 'zaehler' } },
    { id: 'improper', label: L('Unechte Brüche in Kreisen', 'Improper fractions as circles'), values: { z1: 7, n1: 4, z2: 5, n2: 3, form: 'kreis' } },
    { id: 'reduce', label: L('12/18 kürzen', 'Reduce 12/18'), values: { mode: 'kuerzen' } },
    { id: 'game', label: L('Brüche ordnen (Spiel)', 'Order fractions (game)'), values: { mode: 'ordnen' } },
  ],
  strings: {
    de: {
      canvas: 'Brüche als Streifen oder Kreise mit Zahlenstrahl; beim Erweitern werden die Teile feiner geschnitten, beim Kürzen zusammengefasst',
      ask: 'Welcher Bruch ist größer? Tippe auf <, = oder >.',
      tipN: 'Tipp: Mache die Brüche gleichnamig.',
      tipZ: 'Tipp: Bringe beide Brüche auf den gleichen Zähler.',
      nowN: 'Jetzt sind beide in {name} geteilt – vergleiche die Zähler.',
      nowZ: 'Jetzt haben beide {z} Stücke – welche Stücke sind größer?',
      less: '{a} ist kleiner als {b}.',
      more: '{a} ist größer als {b}.',
      equal: '{a} und {b} sind gleich groß.',
      whyN: 'Begründe es mit „Gleichnamig machen“.',
      whyZ: 'Begründe es mit „Zähler angleichen“.',
      cmpN: '{x}\u00a0{na} {verb} {cmp} {y}\u00a0{nb}, also gilt {a}\u00a0{sign}\u00a0{b}.',
      isOne: 'ist',
      isMany: 'sind',
      cmpLess: 'weniger als',
      cmpMore: 'mehr als',
      cmpEq: 'genauso viel wie',
      pieces: 'Stücke',
      piece: 'Stück',
      hauptnenner: 'Hauptnenner: kgV({n1}; {n2}) = {N}',
      cmpZ: 'Beide haben {z}\u00a0Stücke. {na} sind {cmp} als {nb}, also gilt {a}\u00a0{sign}\u00a0{b}.',
      smaller: 'kleiner',
      larger: 'größer',
      eqZ: 'Beide haben {z} gleich große Stücke, also gilt {a} = {b}.',
      ruleZ: 'Gleicher Zähler: Je größer der Nenner, desto kleiner die Stücke.',
      zeroZ: 'Mit dem Zähler 0 klappt das nicht – ein Bruch mit dem Zähler 0 ist 0.',
      sameN: 'Die Brüche sind schon gleichnamig – vergleiche die Zähler.',
      sameZ: 'Die Zähler sind schon gleich – vergleiche die Größe der Stücke.',
      diff: 'Unterschied {d}',
      whole: '1 Ganzes',
      wholes: '{u} Ganze',
      right: 'Richtig!',
      wrongGuess: 'Nicht ganz – vergleiche noch einmal genau.',
      actN: 'Gleichnamig machen',
      actZ: 'Zähler angleichen',
      actBack: 'Zurück zu den Ausgangsbrüchen',
      canK: 'Kürzen mit {f} geht: {z} und {n} sind durch {f} teilbar.',
      noKn: 'Kürzen mit {f} geht nicht: {n} ist nicht durch {f} teilbar.',
      noKz: 'Kürzen mit {f} geht nicht: {z} ist nicht durch {f} teilbar – die Färbung endet mitten in einer Gruppe.',
      noKb: 'Kürzen mit {f} geht nicht: Weder {z} noch {n} ist durch {f} teilbar.',
      isRed: '{a} ist vollständig gekürzt: Zähler und Nenner haben außer 1 keinen gemeinsamen Teiler.',
      notRed: '{a} ist noch nicht vollständig gekürzt.',
      erwDone: 'Erweitert mit {k}: Jedes Stück wurde in {k} gleiche Teile geschnitten – der Anteil bleibt gleich.',
      kurzDone: 'Gekürzt mit {k}: Je {k} Stücke wurden zu einem zusammengefasst – der Anteil bleibt gleich.',
      tooBig: 'Der Nenner würde größer als 100 – so fein schneiden wir hier nicht.',
      already: '{a} ist schon vollständig gekürzt.',
      groups: 'Gruppen zu je {f} Stücken',
      wallTitle: 'Bruchwand: Gleichwertige Brüche enden an derselben Stelle.',
      actErw: 'Erweitern mit {f}',
      actKurz: 'Kürzen mit {f}',
      instr: 'Tippe die Brüche der Größe nach an – den kleinsten zuerst.',
      smallest: 'kleinster',
      largest: 'größter',
      good: 'Richtig: {f} ist der kleinste der übrigen Brüche.',
      bad: 'Nicht ganz: {s} ist kleiner als {f}.',
      done: 'Geschafft! Alle Brüche sind richtig geordnet.',
      doneOne: 'Geschafft – mit einem Fehler. Noch eine Runde?',
      doneMany: 'Geschafft – mit {m} Fehlern. Noch eine Runde?',
      solved: 'So lautet die richtige Reihenfolge.',
      hintOn: 'Tipp: Streifen zeigen',
      hintOff: 'Streifen ausblenden',
      odTip: 'Tipp: Überlege zuerst, ob ein Bruch kleiner oder größer als {h} ist. Bei knappen Fällen hilft der Hauptnenner.',
      odEmpty: 'Hier erscheinen die geordneten Brüche.',
      score: 'Runde {r} · Fehler in dieser Runde: {m}',
      perfect: 'Fehlerfrei geschafft: {p} von {t} Runden',
      ggt: 'ggT({z}; {n}) = {g}',
      reducedSame: '(schon vollständig gekürzt)',
      and: 'und',
    },
    en: {
      canvas: 'Fractions as bars or circles with a number line; expanding cuts the parts finer, reducing joins them',
      ask: 'Which fraction is larger? Tap <, = or >.',
      tipN: 'Hint: give both fractions a common denominator.',
      tipZ: 'Hint: give both fractions the same numerator.',
      nowN: 'Now both are cut into {name} – compare the numerators.',
      nowZ: 'Now both have {z} pieces – which pieces are larger?',
      less: '{a} is less than {b}.',
      more: '{a} is greater than {b}.',
      equal: '{a} and {b} are equal.',
      whyN: 'Explain it with “Common denominator”.',
      whyZ: 'Explain it with “Equal numerators”.',
      cmpN: '{x}\u00a0{na} {verb} {cmp} {y}\u00a0{nb}, so {a}\u00a0{sign}\u00a0{b}.',
      isOne: 'is',
      isMany: 'are',
      cmpLess: 'less than',
      cmpMore: 'more than',
      cmpEq: 'as much as',
      pieces: 'pieces',
      piece: 'piece',
      hauptnenner: 'Common denominator: lcm({n1}, {n2}) = {N}',
      cmpZ: 'Both have {z}\u00a0pieces. {na} are {cmp} than {nb}, so {a}\u00a0{sign}\u00a0{b}.',
      smaller: 'smaller',
      larger: 'larger',
      eqZ: 'Both have {z} pieces of equal size, so {a} = {b}.',
      ruleZ: 'Same numerator: the larger the denominator, the smaller the pieces.',
      zeroZ: 'This does not work with numerator 0 – a fraction with numerator 0 is 0.',
      sameN: 'The fractions already have the same denominator – compare the numerators.',
      sameZ: 'The numerators are already equal – compare the size of the pieces.',
      diff: 'difference {d}',
      whole: '1 whole',
      wholes: '{u} wholes',
      right: 'Correct!',
      wrongGuess: 'Not quite – compare once more.',
      actN: 'Common denominator',
      actZ: 'Equal numerators',
      actBack: 'Back to the original fractions',
      canK: 'Reducing by {f} works: {z} and {n} are divisible by {f}.',
      noKn: 'Reducing by {f} does not work: {n} is not divisible by {f}.',
      noKz: 'Reducing by {f} does not work: {z} is not divisible by {f} – the shading ends inside a group.',
      noKb: 'Reducing by {f} does not work: neither {z} nor {n} is divisible by {f}.',
      isRed: '{a} is fully reduced: numerator and denominator have no common divisor except 1.',
      notRed: '{a} is not fully reduced yet.',
      erwDone: 'Expanded by {k}: every piece was cut into {k} equal parts – the amount stays the same.',
      kurzDone: 'Reduced by {k}: every {k} pieces were joined into one – the amount stays the same.',
      tooBig: 'The denominator would exceed 100 – we do not cut that finely here.',
      already: '{a} is already fully reduced.',
      groups: 'groups of {f} pieces',
      wallTitle: 'Fraction wall: equivalent fractions end at the same place.',
      actErw: 'Expand by {f}',
      actKurz: 'Reduce by {f}',
      instr: 'Tap the fractions in order of size – the smallest first.',
      smallest: 'smallest',
      largest: 'largest',
      good: 'Right: {f} is the smallest of the remaining fractions.',
      bad: 'Not quite: {s} is less than {f}.',
      done: 'Done! All fractions are in the right order.',
      doneOne: 'Done – with one mistake. Another round?',
      doneMany: 'Done – with {m} mistakes. Another round?',
      solved: 'This is the correct order.',
      hintOn: 'Hint: show bars',
      hintOff: 'Hide bars',
      odTip: 'Hint: first decide whether a fraction is less or greater than {h}. For close cases, use a common denominator.',
      odEmpty: 'The ordered fractions appear here.',
      score: 'Round {r} · mistakes this round: {m}',
      perfect: 'Without mistakes: {p} of {t} rounds',
      ggt: 'gcd({z}, {n}) = {g}',
      reducedSame: '(already fully reduced)',
      and: 'and',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const lang = ctx.lang;
    const fmt = ctx.fmt;
    const reduced = prefersReducedMotion();
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const rich = (key: string, vars: Record<string, string | number | Token | Token[]>, color?: string) => fill(ctx.t(key), vars, color ? { color } : {});
    const mode = () => p.mode as Mode;
    const isWide = () => surface.width >= 600;
    const F = () => ctx.theme.font;
    const colA = () => ctx.theme.series[0]!;
    const colB = () => ctx.theme.series[3]!;
    const colOk = () => ctx.theme.series[2]!;
    const colBad = () => ctx.theme.series[1]!;
    const colOp = () => ctx.theme.series[4]!;
    const name = (n: number, count: number) => denominatorName(n, count, lang);

    let hits: Hit[] = [];
    let hover: string | null = null;

    /* ================================================================ */
    /* Allgemeine Zeichenbausteine                                      */
    /* ================================================================ */

    /** Hintergrundfläche eines Bereichs. */
    function panel(r: Rect, radius = 14): void {
      const g = surface.g;
      g.fillStyle = withAlpha(ctx.theme.text, ctx.theme.dark ? 0.045 : 0.028);
      roundRect(g, r.x, r.y, r.w, r.h, radius);
      g.fill();
    }

    /**
     * Bruchstreifen: n Teile pro Ganzes, z gefärbt. Feine Schnitte für das
     * Erweitern wachsen gestaffelt von oben nach unten (Fortschritt e).
     */
    function drawBar(s: BarSpec): void {
      const g = surface.g;
      const theme = ctx.theme;
      const unitW = s.w / s.units;
      const pieceW = unitW / s.n;
      const total = s.units * s.n;
      const zClamped = Math.min(s.z, total);
      const zw = zClamped * pieceW;
      const r = Math.min(10, s.h * 0.2);
      g.save();
      softShadow(g, theme.dark, 10, 3);
      g.fillStyle = theme.bg;
      roundRect(g, s.x, s.y, s.w, s.h, r);
      g.fill();
      g.restore();
      g.save();
      roundRect(g, s.x, s.y, s.w, s.h, r);
      g.clip();
      g.fillStyle = withAlpha(s.color, theme.dark ? 0.12 : 0.07);
      g.fillRect(s.x, s.y, s.w, s.h);
      if (zw > 0) {
        const grad = g.createLinearGradient(0, s.y, 0, s.y + s.h);
        grad.addColorStop(0, withAlpha(s.color, 0.72));
        grad.addColorStop(0.55, s.color);
        grad.addColorStop(1, s.color);
        g.fillStyle = grad;
        g.fillRect(s.x, s.y, zw, s.h);
        g.fillStyle = 'rgba(255,255,255,0.16)';
        g.fillRect(s.x, s.y, zw, s.h * 0.28);
      }
      // feine Schnitte (Erweitern)
      if (s.k > 1 && s.e > 0) {
        const sub = total * s.k;
        const fine = pieceW / s.k < 6;
        const dense = pieceW / s.k < 3.5;
        for (let j = 1; j < sub; j++) {
          if (j % s.k === 0) continue;
          const x = s.x + (j * pieceW) / s.k;
          const delay = (j / sub) * 0.45;
          const u = clamp((s.e - delay) / 0.55, 0, 1);
          if (u <= 0) continue;
          const inside = x < s.x + zw - 0.5;
          g.strokeStyle = inside ? withAlpha(theme.bg, dense ? 0.32 : 0.8) : withAlpha(s.color, dense ? 0.22 : theme.dark ? 0.5 : 0.42);
          g.lineWidth = dense ? 0.7 : fine ? 0.9 : 1.3;
          g.beginPath();
          g.moveTo(x, s.y);
          g.lineTo(x, s.y + s.h * ease.outCubic(u));
          g.stroke();
        }
      }
      // Hauptschnitte
      for (let j = 1; j < total; j++) {
        const x = s.x + j * pieceW;
        const whole = j % s.n === 0;
        const inside = x < s.x + zw - 0.5;
        g.strokeStyle = inside ? theme.bg : withAlpha(s.color, theme.dark ? 0.75 : 0.6);
        g.lineWidth = whole ? 4 : pieceW < 8 ? 1.3 : 2.4;
        g.beginPath();
        g.moveTo(x, s.y);
        g.lineTo(x, s.y + s.h);
        g.stroke();
      }
      // Stücke durchzählen (nur wenn alle Stücke gleich groß sind)
      if (s.count && s.count > 0) {
        const pw = pieceW / s.k;
        const shaded = zClamped * s.k;
        if (pw >= 15) {
          const fs = Math.min(12.5, pw * 0.48);
          g.globalAlpha = s.count;
          for (let j = 0; j < shaded; j++) text(g, String(j + 1), s.x + (j + 0.5) * pw, s.y + s.h - fs * 0.95, { font: `750 ${fs}px ${F()}`, color: theme.dark ? 'rgba(16,22,31,0.8)' : 'rgba(255,255,255,0.95)' });
          g.globalAlpha = 1;
        }
      }
      if (s.hover !== undefined && s.hover >= 0 && s.hover < total) {
        g.fillStyle = withAlpha(theme.text, theme.dark ? 0.16 : 0.12);
        g.fillRect(s.x + s.hover * pieceW, s.y, pieceW, s.h);
      }
      g.restore();
      g.strokeStyle = withAlpha(s.color, 0.9);
      g.lineWidth = 1.6;
      roundRect(g, s.x, s.y, s.w, s.h, r);
      g.stroke();
    }

    /** Kreis (Torte): n Sektoren, die ersten z gefärbt; feine Schnitte wachsen nach außen. */
    function drawPie(cx: number, cy: number, rad: number, n: number, z: number, k: number, e: number, color: string, hoverSector: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const step = (Math.PI * 2) / n;
      const a0 = -Math.PI / 2;
      g.save();
      softShadow(g, theme.dark, 12, 3);
      g.fillStyle = theme.bg;
      g.beginPath();
      g.arc(cx, cy, rad, 0, Math.PI * 2);
      g.fill();
      g.restore();
      g.fillStyle = withAlpha(color, theme.dark ? 0.12 : 0.07);
      g.beginPath();
      g.arc(cx, cy, rad, 0, Math.PI * 2);
      g.fill();
      if (z > 0) {
        const grad = g.createRadialGradient(cx - rad * 0.3, cy - rad * 0.35, rad * 0.1, cx, cy, rad);
        grad.addColorStop(0, withAlpha(color, 0.72));
        grad.addColorStop(1, color);
        g.fillStyle = grad;
        g.beginPath();
        if (z >= n) g.arc(cx, cy, rad, 0, Math.PI * 2);
        else {
          g.moveTo(cx, cy);
          g.arc(cx, cy, rad, a0, a0 + z * step);
          g.closePath();
        }
        g.fill();
      }
      if (hoverSector >= 0) {
        g.fillStyle = withAlpha(theme.text, theme.dark ? 0.16 : 0.12);
        g.beginPath();
        g.moveTo(cx, cy);
        g.arc(cx, cy, rad, a0 + hoverSector * step, a0 + (hoverSector + 1) * step);
        g.closePath();
        g.fill();
      }
      g.lineCap = 'round';
      if (k > 1 && e > 0) {
        const sub = n * k;
        // Bogenlänge eines feinen Stücks am Rand: sehr fein → zurückhaltend zeichnen
        const dense = (Math.PI * 2 * rad) / sub < 11;
        for (let j = 0; j < sub; j++) {
          if (j % k === 0) continue;
          const delay = (j / sub) * 0.45;
          const u = clamp((e - delay) / 0.55, 0, 1);
          if (u <= 0) continue;
          const a = a0 + (j * step) / k;
          const inside = j / k < z;
          g.strokeStyle = inside ? withAlpha(theme.bg, dense ? 0.4 : 0.8) : withAlpha(color, dense ? 0.25 : theme.dark ? 0.5 : 0.42);
          g.lineWidth = dense ? 0.8 : 1.3;
          g.beginPath();
          g.moveTo(cx, cy);
          g.lineTo(cx + Math.cos(a) * rad * ease.outCubic(u), cy + Math.sin(a) * rad * ease.outCubic(u));
          g.stroke();
        }
      }
      if (n > 1) {
        for (let j = 0; j < n; j++) {
          const a = a0 + j * step;
          const inside = j === 0 ? z >= n : j < z;
          g.strokeStyle = inside ? theme.bg : withAlpha(color, theme.dark ? 0.75 : 0.6);
          g.lineWidth = n > 24 ? 1.3 : 2.4;
          g.beginPath();
          g.moveTo(cx, cy);
          g.lineTo(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad);
          g.stroke();
        }
      }
      g.strokeStyle = withAlpha(color, 0.9);
      g.lineWidth = 1.6;
      g.beginPath();
      g.arc(cx, cy, rad, 0, Math.PI * 2);
      g.stroke();
    }

    /** Kleiner Bruch in einer abgerundeten Plakette (für Zahlenstrahl und Bruchwand). */
    function fracPill(cx: number, cy: number, f: Fraction, color: string, size: number, solid = false): Rect {
      const g = surface.g;
      const theme = ctx.theme;
      const w = fracWidth(g, String(f.z), String(f.n), size, F()) + 10;
      const h = size * 2.3;
      const r: Rect = { x: cx - w / 2, y: cy - h / 2, w, h };
      g.save();
      softShadow(g, theme.dark, 8, 2);
      g.fillStyle = solid ? color : theme.bg;
      roundRect(g, r.x, r.y, r.w, r.h, 8);
      g.fill();
      g.restore();
      if (!solid) {
        g.fillStyle = withAlpha(color, theme.dark ? 0.2 : 0.1);
        roundRect(g, r.x, r.y, r.w, r.h, 8);
        g.fill();
        g.strokeStyle = withAlpha(color, 0.7);
        g.lineWidth = 1.4;
        roundRect(g, r.x, r.y, r.w, r.h, 8);
        g.stroke();
      }
      drawFrac(g, cx, cy, String(f.z), String(f.n), size, solid ? (theme.dark ? '#10161f' : '#ffffff') : color, F());
      return r;
    }

    /** Bogen mit Pfeilspitze und Beschriftung (Erweitern „·3“ / Kürzen „:2“). */
    function opArc(x0: number, x1: number, y: number, up: boolean, label: string, t: number, color: string, size: number): void {
      if (t <= 0) return;
      const g = surface.g;
      const theme = ctx.theme;
      const lift = (up ? -1 : 1) * size * 0.85;
      const cxp = (x0 + x1) / 2;
      const steps = 24;
      g.save();
      g.globalAlpha *= Math.min(1, t * 1.6);
      g.strokeStyle = color;
      g.lineWidth = 1.8;
      g.lineCap = 'round';
      g.beginPath();
      let ex = x0;
      let ey = y;
      let px = x0;
      let py = y;
      for (let i = 0; i <= steps * t; i++) {
        const u = i / steps;
        px = ex;
        py = ey;
        ex = (1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * cxp + u * u * x1;
        ey = (1 - u) * (1 - u) * y + 2 * (1 - u) * u * (y + lift) + u * u * y;
        if (i === 0) g.moveTo(ex, ey);
        else g.lineTo(ex, ey);
      }
      g.stroke();
      if (t >= 0.98) {
        const ang = Math.atan2(ey - py, ex - px);
        const hs = 6.5;
        g.fillStyle = color;
        g.beginPath();
        g.moveTo(ex, ey);
        g.lineTo(ex - Math.cos(ang - 0.45) * hs, ey - Math.sin(ang - 0.45) * hs);
        g.lineTo(ex - Math.cos(ang + 0.45) * hs, ey - Math.sin(ang + 0.45) * hs);
        g.closePath();
        g.fill();
      }
      // Beschriftung am Scheitel
      const ly = y + lift / 2;
      const fs = Math.max(11, size * 0.46);
      g.font = `800 ${fs}px ${F()}`;
      const lw = g.measureText(label).width + 10;
      g.fillStyle = theme.bg;
      roundRect(g, cxp - lw / 2, ly - fs * 0.7, lw, fs * 1.4, fs * 0.5);
      g.fill();
      text(g, label, cxp, ly + 0.5, { font: `800 ${fs}px ${F()}`, color });
      g.restore();
    }

    /** Höhe der Hinweiszeilen (wie `message`). */
    function messageHeight(w: number, lines: { tokens: Token[]; size?: number }[]): number {
      const wide = isWide();
      return lines.reduce((h, line) => h + richHeight(surface.g, line.tokens, line.size ?? (wide ? 14.5 : 12.5), F(), w) + 2, 0);
    }

    /** Hinweiszeile(n) in einem Bereich zentriert. */
    function message(r: Rect, lines: { tokens: Token[]; color?: string; size?: number }[]): void {
      const g = surface.g;
      const theme = ctx.theme;
      const wide = isWide();
      let y = r.y;
      for (const line of lines) {
        const size = line.size ?? (wide ? 14.5 : 12.5);
        y += drawRich(g, line.tokens, r.x + r.w / 2, y, { size, font: F(), color: line.color ?? theme.text, maxW: r.w, align: 'center' });
        y += 2;
      }
    }

    const bold = (t: string, color?: string): Token => ({ t, bold: true, color });

    /** Text mit Hintergrund-Rand, damit kreuzende Linien ihn nicht stören. */
    function haloText(str: string, x: number, y: number, font: string, color: string, align: CanvasTextAlign = 'center'): void {
      const g = surface.g;
      g.save();
      g.font = font;
      g.textAlign = align;
      g.textBaseline = 'middle';
      g.lineJoin = 'round';
      g.lineWidth = 4;
      g.strokeStyle = ctx.theme.bg;
      g.strokeText(str, x, y);
      g.fillStyle = color;
      g.fillText(str, x, y);
      g.restore();
    }

    /* ================================================================ */
    /* Vergleichen                                                      */
    /* ================================================================ */
    const A = (): Fraction => ({ z: p.z1, n: p.n1 });
    const B = (): Fraction => ({ z: p.z2, n: p.n2 });
    let expanded = false;
    let expDir = -1;
    const expTween = new Tween(1250, ease.inOutCubic);
    const expProgress = () => (expDir > 0 ? expTween.value : 1 - expTween.value);
    let revealed = p.show;
    let guessedRight = false;
    const wrongGuesses = new Set<string>();
    let shake = { id: '', t0: -1e9 };
    const pop = new Tween(700, ease.outBack);
    let lastK: [number, number] = [1, 1];
    let barDrag: { which: 'A' | 'B'; x0: number; moved: boolean } | null = null;

    function factors(): { k1: number; k2: number; ok: boolean } {
      const a = A();
      const b = B();
      if (p.weg === 'zaehler') {
        const c = commonNumerator(a, b);
        return c ? { k1: c.k1, k2: c.k2, ok: true } : { k1: 1, k2: 1, ok: false };
      }
      const c = commonDenominator(a, b);
      return { k1: c.k1, k2: c.k2, ok: true };
    }

    const vgUnits = () => clamp(Math.ceil(Math.max(p.z1 / p.n1, p.z2 / p.n2, 1) - 1e-9), 1, 3);

    function vgGeo() {
      const W = surface.width;
      const H = surface.height;
      const wide = isWide();
      const pad = wide ? 18 : 10;
      const fH = wide ? 118 : 100;
      // Platz für die Hinweiszeilen: so viel, wie der Text braucht (beim
      // Gleichnamigmachen schon ab Beginn der Animation für den Endtext).
      const msgW = W - 2 * pad - 8;
      const { k1, k2, ok } = factors();
      let need = messageHeight(msgW, vgMessage(expProgress(), k1, k2, ok));
      if (expanded) need = Math.max(need, messageHeight(msgW, vgMessage(1, k1, k2, ok)));
      const msgH = Math.max(wide ? 60 : 92, Math.ceil(need) + 8);
      const lineH = wide ? 106 : 108;
      const formula: Rect = { x: pad, y: 4, w: W - 2 * pad, h: fH };
      const mid: Rect = { x: pad, y: fH + 8, w: W - 2 * pad, h: H - fH - 8 - lineH - msgH };
      const gutter = wide ? 72 : 46;
      const x0 = pad + gutter;
      const x1 = W - pad - (wide ? 26 : 18);
      const lineY = mid.y + mid.h + 40;
      const msg: Rect = { x: pad + 4, y: H - msgH + 2, w: W - 2 * pad - 8, h: msgH - 6 };
      const bh = Math.min(wide ? 58 : 54, (mid.h - 40) / 2);
      const gap = (mid.h - 2 * bh) / 3;
      const barA: Rect = { x: x0, y: mid.y + gap, w: x1 - x0, h: bh };
      const barB: Rect = { x: x0, y: mid.y + 2 * gap + bh, w: x1 - x0, h: bh };
      return { W, H, wide, pad, formula, mid, x0, x1, lineY, msg, barA, barB, gutter };
    }

    function guessButtons(cx: number, cy: number, size: number, now: number): number {
      const g = surface.g;
      const theme = ctx.theme;
      const bs = Math.round(size * 1.45);
      const gap = 6;
      const total = bs * 3 + gap * 2;
      const signs = ['<', '=', '>'];
      signs.forEach((sign, i) => {
        const id = `guess:${sign}`;
        let x = cx - total / 2 + i * (bs + gap);
        const wrong = wrongGuesses.has(sign);
        if (shake.id === id) {
          const u = (now - shake.t0) / 450;
          if (u < 1) x += Math.sin(u * Math.PI * 6) * 5 * (1 - u);
        }
        const y = cy - bs / 2;
        const hov = hover === id && !wrong;
        g.save();
        if (!wrong) softShadow(g, theme.dark, hov ? 12 : 8, hov ? 3 : 2);
        g.fillStyle = wrong ? withAlpha(colBad(), theme.dark ? 0.16 : 0.08) : hov ? withAlpha(colA(), theme.dark ? 0.3 : 0.12) : theme.bg;
        roundRect(g, x, y - (hov ? 2 : 0), bs, bs, 10);
        g.fill();
        g.restore();
        g.strokeStyle = wrong ? withAlpha(colBad(), 0.6) : withAlpha(theme.text, hov ? 0.5 : 0.22);
        g.lineWidth = 1.5;
        roundRect(g, x, y - (hov ? 2 : 0), bs, bs, 10);
        g.stroke();
        text(g, sign, x + bs / 2, cy - (hov ? 2 : 0) + 1, { font: `800 ${size * 0.95}px ${F()}`, color: wrong ? withAlpha(colBad(), 0.7) : theme.text });
        if (wrong) {
          g.strokeStyle = withAlpha(colBad(), 0.7);
          g.lineWidth = 2;
          g.beginPath();
          g.moveTo(x + 7, y + bs - 7);
          g.lineTo(x + bs - 7, y + 7);
          g.stroke();
        }
        if (!wrong) hits.push({ id, x, y, w: bs, h: bs });
      });
      return total;
    }

    function drawFormula(R: Rect, e: number, k1: number, k2: number, now: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const wide = isWide();
      const a = A();
      const b = B();
      const ax = expand(a, k1);
      const bx = expand(b, k2);
      const showA = k1 > 1;
      const showB = k2 > 1;
      const sz = (s: string) => String(s);
      let size = wide ? 34 : 24;
      let m = { wa: 0, wax: 0, wb: 0, wbx: 0, eqW: 0, relW: 0, gap: 0, side: 0 };
      for (; size > 12; size -= 1) {
        const wa = fracWidth(g, sz(String(a.z)), String(a.n), size, F());
        const wax = fracWidth(g, String(ax.z), String(ax.n), size, F());
        const wb = fracWidth(g, String(b.z), String(b.n), size, F());
        const wbx = fracWidth(g, String(bx.z), String(bx.n), size, F());
        const eqW = size * 0.9;
        const gap = size * 0.38;
        const relW = revealed ? size * 1.6 : Math.round(size * 1.45) * 3 + 12;
        const left = wa + (showA ? (eqW + wax + gap * 2) * e : 0);
        const right = wb + (showB ? (eqW + wbx + gap * 2) * e : 0);
        const side = Math.max(left, right);
        m = { wa, wax, wb, wbx, eqW, relW, gap, side };
        if (side * 2 + relW + gap * 2 <= R.w - 8) break;
      }
      const cx = R.x + R.w / 2;
      const cy = R.y + R.h / 2 + 2;
      const { wa, wax, wb, wbx, eqW, relW, gap } = m;
      const xRelL = cx - relW / 2 - gap;
      const xRelR = cx + relW / 2 + gap;
      // erster Bruch
      const aC = showA ? xRelL - (wax + gap * 2 + eqW) * e - wa / 2 : xRelL - wa / 2;
      drawFrac(g, aC, cy, String(a.z), String(a.n), size, colA(), F());
      if (showA && e > 0) {
        g.save();
        g.globalAlpha = clamp(e * 1.4 - 0.2, 0, 1);
        const eqC = xRelL - wax - gap - eqW / 2;
        text(g, '=', eqC, cy + 1, { font: `700 ${size * 0.95}px ${F()}`, color: theme.muted });
        drawFrac(g, xRelL - wax / 2, cy, String(ax.z), String(ax.n), size, colA(), F());
        g.restore();
        const yTop = cy - size * 1.02;
        const yBot = cy + size * 1.02;
        opArc(aC + wa * 0.15, xRelL - wax * 0.6, yTop, true, `·${k1}`, clamp(e * 1.3 - 0.15, 0, 1), colOp(), size);
        opArc(aC + wa * 0.15, xRelL - wax * 0.6, yBot, false, `·${k1}`, clamp(e * 1.3 - 0.15, 0, 1), colOp(), size);
      }
      // zweiter Bruch
      const bC = showB ? xRelR + (wbx + gap * 2 + eqW) * e + wb / 2 : xRelR + wb / 2;
      drawFrac(g, bC, cy, String(b.z), String(b.n), size, colB(), F());
      if (showB && e > 0) {
        g.save();
        g.globalAlpha = clamp(e * 1.4 - 0.2, 0, 1);
        const eqC = xRelR + wbx + gap + eqW / 2;
        text(g, '=', eqC, cy + 1, { font: `700 ${size * 0.95}px ${F()}`, color: theme.muted });
        drawFrac(g, xRelR + wbx / 2, cy, String(bx.z), String(bx.n), size, colB(), F());
        g.restore();
        const yTop = cy - size * 1.02;
        const yBot = cy + size * 1.02;
        opArc(bC - wb * 0.15, xRelR + wbx * 0.6, yTop, true, `·${k2}`, clamp(e * 1.3 - 0.15, 0, 1), colOp(), size);
        opArc(bC - wb * 0.15, xRelR + wbx * 0.6, yBot, false, `·${k2}`, clamp(e * 1.3 - 0.15, 0, 1), colOp(), size);
      }
      // Vergleichszeichen oder Tipp-Knöpfe
      if (revealed) {
        const sign = relationSign(compare(a, b));
        const s = pop.running ? ease.outBack(pop.t) : 1;
        if (guessedRight) {
          g.fillStyle = withAlpha(colOk(), theme.dark ? 0.22 : 0.14);
          g.beginPath();
          g.arc(cx, cy, size * 0.85 * s, 0, Math.PI * 2);
          g.fill();
        }
        text(g, sign, cx, cy + 1, { font: `800 ${size * 1.35 * s}px ${F()}`, color: guessedRight ? colOk() : theme.text });
      } else guessButtons(cx, cy, size, now);
    }

    function drawNumberLine(geo: ReturnType<typeof vgGeo>, units: number, e: number, k1: number, k2: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const { x0, x1, lineY: y, wide } = geo;
      const unitW = (x1 - x0) / units;
      const X = (v: number) => x0 + Math.min(v, units + 0.04) * unitW;
      const a = A();
      const b = B();
      // Achse
      g.strokeStyle = theme.axis;
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(x0 - 12, y);
      g.lineTo(x1 + 14, y);
      g.stroke();
      g.fillStyle = theme.axis;
      g.beginPath();
      g.moveTo(x1 + 22, y);
      g.lineTo(x1 + 11, y - 5.5);
      g.lineTo(x1 + 11, y + 5.5);
      g.closePath();
      g.fill();
      // gemeinsame Einteilung nach dem Gleichnamigmachen
      if (p.weg === 'nenner' && e > 0.4 && (k1 > 1 || k2 > 1) && unitW / (a.n * k1) >= 4) {
        const N = a.n * k1;
        g.strokeStyle = withAlpha(colOp(), 0.55 * clamp((e - 0.4) / 0.6, 0, 1));
        g.lineWidth = 1;
        for (let j = 1; j < units * N; j++) {
          const x = X(j / N);
          g.beginPath();
          g.moveTo(x, y - 4);
          g.lineTo(x, y + 4);
          g.stroke();
        }
      }
      // Einteilung des ersten Bruchs oben, des zweiten unten
      g.lineWidth = 1.6;
      g.strokeStyle = withAlpha(colA(), 0.8);
      for (let j = 1; j < units * a.n; j++) {
        if (j % a.n === 0) continue;
        const x = X(j / a.n);
        g.beginPath();
        g.moveTo(x, y);
        g.lineTo(x, y - 8);
        g.stroke();
      }
      g.strokeStyle = withAlpha(colB(), 0.85);
      for (let j = 1; j < units * b.n; j++) {
        if (j % b.n === 0) continue;
        const x = X(j / b.n);
        g.beginPath();
        g.moveTo(x, y);
        g.lineTo(x, y + 8);
        g.stroke();
      }
      // ganze Zahlen
      for (let u = 0; u <= units; u++) {
        const x = X(u);
        g.strokeStyle = theme.axis;
        g.lineWidth = 2.4;
        g.beginPath();
        g.moveTo(x, y - 11);
        g.lineTo(x, y + 11);
        g.stroke();
        text(g, String(u), x, y + 23, { font: `800 ${wide ? 15 : 13}px ${F()}`, color: theme.text });
      }
      // Punkte mit Fähnchen
      const fs = wide ? 13.5 : 12;
      const va = a.z / a.n;
      const vb = b.z / b.n;
      const clampX = (x: number) => clamp(x, x0 - 4, x1 + 6);
      const pillA = fracPill(clampX(X(va)), y - 33, a, colA(), fs);
      g.fillStyle = withAlpha(colA(), 0.8);
      g.beginPath();
      g.moveTo(X(va), y - 6);
      g.lineTo(X(va) - 4.5, pillA.y + pillA.h);
      g.lineTo(X(va) + 4.5, pillA.y + pillA.h);
      g.closePath();
      g.fill();
      const pillB = fracPill(clampX(X(vb)), y + 52, b, colB(), fs);
      g.fillStyle = withAlpha(colB(), 0.8);
      g.beginPath();
      g.moveTo(X(vb), y + 6);
      g.lineTo(X(vb) - 4.5, pillB.y);
      g.lineTo(X(vb) + 4.5, pillB.y);
      g.closePath();
      g.fill();
      for (const [v, c] of [
        [vb, colB()],
        [va, colA()],
      ] as const) {
        g.fillStyle = theme.bg;
        g.beginPath();
        g.arc(X(v), y, 7, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = c;
        g.beginPath();
        g.arc(X(v), y, 5, 0, Math.PI * 2);
        g.fill();
      }
    }

    /** Hervorhebung des Unterschieds zwischen den Streifenenden. */
    function drawDifference(geo: ReturnType<typeof vgGeo>, units: number): void {
      const a = A();
      const b = B();
      const c = compare(a, b);
      if (c === 0) return;
      const g = surface.g;
      const theme = ctx.theme;
      const unitW = (geo.x1 - geo.x0) / units;
      const xa = geo.x0 + Math.min(a.z / a.n, units) * unitW;
      const xb = geo.x0 + Math.min(b.z / b.n, units) * unitW;
      const lo = Math.min(xa, xb);
      const hi = Math.max(xa, xb);
      const top = geo.barA.y - 6;
      const bot = geo.barB.y + geo.barB.h + 6;
      g.save();
      g.fillStyle = withAlpha(colOp(), theme.dark ? 0.16 : 0.09);
      g.fillRect(lo, top, hi - lo, bot - top);
      g.beginPath();
      g.rect(lo, top, hi - lo, bot - top);
      g.clip();
      g.strokeStyle = withAlpha(colOp(), theme.dark ? 0.35 : 0.25);
      g.lineWidth = 1;
      for (let x = lo - (bot - top); x < hi; x += 7) {
        g.beginPath();
        g.moveTo(x, bot);
        g.lineTo(x + (bot - top), top);
        g.stroke();
      }
      g.restore();
      // Beschriftung zwischen den Streifen
      const d = reduce(Math.abs(a.z * b.n - b.z * a.n), a.n * b.n);
      const tokens = fill(ctx.t('diff'), { d: fr(d.z, d.n, colOp()) }, { color: colOp(), bold: true });
      const size = geo.wide ? 12.5 : 11.5;
      const cy = (geo.barA.y + geo.barA.h + geo.barB.y) / 2;
      g.font = `750 ${size}px ${F()}`;
      const tw = g.measureText(ctx.t('diff').replace('{d}', '')).width + fracWidth(g, String(d.z), String(d.n), size * 0.82, F()) + 16;
      const cx = clamp((lo + hi) / 2, geo.x0 + tw / 2, geo.x1 - tw / 2);
      const h = size * 2.4;
      g.save();
      softShadow(g, theme.dark, 8, 2);
      g.fillStyle = theme.bg;
      roundRect(g, cx - tw / 2, cy - h / 2, tw, h, h / 2);
      g.fill();
      g.restore();
      g.strokeStyle = withAlpha(colOp(), 0.6);
      g.lineWidth = 1.3;
      roundRect(g, cx - tw / 2, cy - h / 2, tw, h, h / 2);
      g.stroke();
      drawRich(g, tokens, cx, cy - size * 0.975, { size, font: F(), color: colOp(), maxW: 400, align: 'center' });
    }

    function vgMessage(e: number, k1: number, k2: number, ok: boolean): { tokens: Token[]; color?: string; size?: number }[] {
      const theme = ctx.theme;
      const a = A();
      const b = B();
      const c = compare(a, b);
      const sign = relationSign(c);
      const fa = fr(a.z, a.n, colA());
      const fb = fr(b.z, b.n, colB());
      const nenner = p.weg === 'nenner';
      const already = k1 === 1 && k2 === 1;
      const done = expanded && e > 0.85;
      const muted = theme.muted;
      const lines: { tokens: Token[]; color?: string }[] = [];
      const relKey = c < 0 ? 'less' : c > 0 ? 'more' : 'equal';
      const relTokens = () => rich(relKey, { a: fa, b: fb }).map((t) => ('t' in t ? { ...t, bold: true } : t));
      if (!ok) {
        lines.push({ tokens: revealed ? relTokens() : [bold(ctx.t('ask'))] });
        lines.push({ tokens: [{ t: ctx.t('zeroZ') }], color: muted });
        return lines;
      }
      if (!revealed) {
        lines.push({ tokens: [bold(ctx.t(wrongGuesses.size ? 'wrongGuess' : 'ask'), wrongGuesses.size ? colBad() : undefined)] });
        if (done) {
          const ax = expand(a, k1);
          const nm = name(ax.n, 2);
          lines.push({ tokens: nenner ? rich('nowN', { name: nm ?? `${ax.n}-tel` }) : rich('nowZ', { z: ax.z }), color: muted });
        } else if (already) lines.push({ tokens: [{ t: ctx.t(nenner ? 'sameN' : 'sameZ') }], color: muted });
        else lines.push({ tokens: [{ t: ctx.t(nenner ? 'tipN' : 'tipZ') }], color: muted });
        return lines;
      }
      if (!done && !already) {
        lines.push({ tokens: guessedRight ? [bold(`${ctx.t('right')} `, colOk()), ...relTokens()] : relTokens() });
        lines.push({ tokens: [{ t: ctx.t(nenner ? 'whyN' : 'whyZ') }], color: muted });
        return lines;
      }
      const ax = expand(a, k1);
      const bx = expand(b, k2);
      if (nenner) {
        const na = name(ax.n, ax.z) ?? ctx.t(ax.z === 1 ? 'piece' : 'pieces');
        const nb = name(bx.n, bx.z) ?? ctx.t(bx.z === 1 ? 'piece' : 'pieces');
        lines.push({
          tokens: rich('cmpN', {
            x: bold(String(ax.z), colA()),
            na: bold(na, colA()),
            verb: ctx.t(ax.z === 1 ? 'isOne' : 'isMany'),
            cmp: ctx.t(c < 0 ? 'cmpLess' : c > 0 ? 'cmpMore' : 'cmpEq'),
            y: bold(String(bx.z), colB()),
            nb: bold(nb, colB()),
            a: fa,
            sign: bold(sign),
            b: fb,
          }),
        });
        if (!already) lines.push({ tokens: [{ t: tr('hauptnenner', { n1: a.n, n2: b.n, N: ax.n }) }], color: muted });
        else lines.push({ tokens: [{ t: ctx.t('sameN') }], color: muted });
      } else {
        if (c === 0) lines.push({ tokens: rich('eqZ', { z: bold(String(ax.z)), a: fa, b: fb }) });
        else {
          const na = name(ax.n, 2) ?? '';
          const nb = name(bx.n, 2) ?? '';
          const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
          lines.push({
            tokens: rich('cmpZ', {
              z: bold(String(ax.z)),
              na: bold(cap(na), colA()),
              cmp: ctx.t(ax.n > bx.n ? 'smaller' : 'larger'),
              nb: bold(nb, colB()),
              a: fa,
              sign: bold(sign),
              b: fb,
            }),
          });
        }
        lines.push({ tokens: [{ t: ctx.t(already ? 'sameZ' : 'ruleZ') }], color: muted });
      }
      return lines;
    }

    function drawVergleich(now: number): boolean {
      const g = surface.g;
      const theme = ctx.theme;
      const geo = vgGeo();
      const { k1, k2, ok } = factors();
      const e = expProgress();
      const units = vgUnits();
      const a = A();
      const b = B();
      panel(geo.formula);
      drawFormula(geo.formula, e, k1, k2, now);
      if (p.form === 'kreis') drawPies(geo, e, k1, k2);
      else {
        if (revealed) drawDifference(geo, units);
        const hovA = hover?.startsWith('barA') ? Number(hover.split(':')[1]) : -1;
        const hovB = hover?.startsWith('barB') ? Number(hover.split(':')[1]) : -1;
        const count = expanded && (k1 > 1 || k2 > 1) ? clamp((e - 0.75) / 0.25, 0, 1) : 0;
        drawBar({ ...geo.barA, units, n: a.n, z: a.z, k: k1, e, color: colA(), hover: hovA, count });
        drawBar({ ...geo.barB, units, n: b.n, z: b.z, k: k2, e, color: colB(), hover: hovB, count });
        if (p.weg === 'zaehler' && count > 0 && a.z > 0 && b.z > 0) unitPieces(geo, units, k1, k2, count);
        hits.push({ id: 'barA', ...geo.barA, cursor: ctx.locked ? '' : 'pointer' });
        hits.push({ id: 'barB', ...geo.barB, cursor: ctx.locked ? '' : 'pointer' });
        // Bruchbeschriftung links neben den Streifen (wechselt beim Erweitern)
        for (const [f, k, bar, col] of [
          [a, k1, geo.barA, colA()],
          [b, k2, geo.barB, colB()],
        ] as const) {
          const fx = expand(f, k);
          const size = geo.wide ? 17 : 14;
          const cx = geo.pad + geo.gutter / 2 - 4;
          const cy = bar.y + bar.h / 2;
          const t = k > 1 ? clamp((e - 0.35) / 0.3, 0, 1) : 0;
          g.save();
          g.globalAlpha = 1 - t;
          drawFrac(g, cx, cy, String(f.z), String(f.n), size, col, F());
          g.globalAlpha = t;
          drawFrac(g, cx, cy, String(fx.z), String(fx.n), size, col, F());
          g.restore();
        }
        // Ganze beschriften
        if (units > 1) {
          const unitW = (geo.x1 - geo.x0) / units;
          for (let u = 1; u <= units; u++) {
            const x = geo.x0 + u * unitW;
            text(g, u === 1 ? ctx.t('whole') : tr('wholes', { u }), x - 6, geo.barA.y - 9, { font: `650 ${geo.wide ? 11.5 : 10.5}px ${F()}`, color: theme.muted, align: 'right' });
          }
        }
        // Führungslinien vom Streifenende zum Zahlenstrahl
        const unitW = (geo.x1 - geo.x0) / units;
        for (const [f, bar, col] of [
          [a, geo.barA, colA()],
          [b, geo.barB, colB()],
        ] as const) {
          const x = geo.x0 + Math.min(f.z / f.n, units) * unitW;
          g.save();
          g.strokeStyle = withAlpha(col, 0.55);
          g.lineWidth = 1.5;
          g.setLineDash([4, 4]);
          g.beginPath();
          g.moveTo(x, bar.y - 4);
          g.lineTo(x, geo.lineY - 6);
          g.stroke();
          g.restore();
        }
      }
      drawNumberLine(geo, units, e, k1, k2);
      message(geo.msg, vgMessage(e, k1, k2, ok));
      const shaking = now - shake.t0 < 450;
      return expTween.running || pop.running || shaking || !!barDrag;
    }

    /** Gleicher Zähler: je ein Stück hervorheben und seine Größe anschreiben. */
    function unitPieces(geo: ReturnType<typeof vgGeo>, units: number, k1: number, k2: number, alpha: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const unitW = (geo.x1 - geo.x0) / units;
      for (const [f, k, bar, col, up] of [
        [A(), k1, geo.barA, colA(), true],
        [B(), k2, geo.barB, colB(), false],
      ] as const) {
        const N = f.n * k;
        const w = unitW / N;
        g.save();
        g.globalAlpha = alpha;
        g.strokeStyle = theme.text;
        g.lineWidth = 2.5;
        roundRect(g, bar.x + 1.5, bar.y + 1.5, w - 3, bar.h - 3, 4);
        g.stroke();
        const label = `1 ${ctx.t('piece')} = 1/${N}`;
        const fs = geo.wide ? 12 : 11;
        g.font = `750 ${fs}px ${F()}`;
        const lw = g.measureText(label).width + 14;
        const ly = up ? bar.y - 15 : bar.y + bar.h + 15;
        const lx = bar.x;
        g.fillStyle = theme.bg;
        roundRect(g, lx, ly - 10, lw, 20, 10);
        g.fill();
        g.strokeStyle = col;
        g.lineWidth = 1.4;
        roundRect(g, lx, ly - 10, lw, 20, 10);
        g.stroke();
        text(g, label, lx + lw / 2, ly + 0.5, { font: `750 ${fs}px ${F()}`, color: col });
        g.restore();
      }
    }

    function drawPies(geo: ReturnType<typeof vgGeo>, e: number, k1: number, k2: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const a = A();
      const b = B();
      const mid = geo.mid;
      const count = clamp(Math.ceil(Math.max(a.z / a.n, b.z / b.n, 1) - 1e-9), 1, 3);
      const gap = geo.wide ? 18 : 12;
      // Nebeneinander (breit oder nur ein Ganzes) bzw. untereinander (schmal)
      const stacked = !geo.wide && count > 1;
      const half = stacked ? mid.w : mid.w / 2;
      const rowH = stacked ? mid.h / 2 : mid.h;
      const rad = Math.min((rowH - (stacked ? 14 : 20)) / 2, (half - (stacked ? 70 : 30) - gap * (count - 1)) / count / 2);
      for (const [f, k, side, col, id] of [
        [a, k1, 0, colA(), 'pieA'],
        [b, k2, 1, colB(), 'pieB'],
      ] as const) {
        const groupW = count * rad * 2 + (count - 1) * gap;
        const gx = stacked ? mid.x + geo.gutter + (mid.w - geo.gutter - groupW) / 2 : mid.x + side * half + (half - groupW) / 2;
        const cy = stacked ? mid.y + rowH * (side + 0.5) : mid.y + mid.h / 2;
        if (stacked) {
          const fx = expand(f, k);
          const t = k > 1 ? clamp((e - 0.35) / 0.3, 0, 1) : 0;
          g.save();
          g.globalAlpha = 1 - t;
          drawFrac(g, mid.x + geo.gutter / 2 - 4, cy, String(f.z), String(f.n), 14, col, F());
          g.globalAlpha = t;
          drawFrac(g, mid.x + geo.gutter / 2 - 4, cy, String(fx.z), String(fx.n), 14, col, F());
          g.restore();
        }
        for (let i = 0; i < count; i++) {
          const cx = gx + rad + i * (rad * 2 + gap);
          const zi = clamp(f.z - i * f.n, 0, f.n);
          const hov = hover?.startsWith(`${id}:${i}:`) ? Number(hover.split(':')[2]) : -1;
          drawPie(cx, cy, rad, f.n, zi, k, e, col, hov);
          hits.push({ id: `${id}:${i}`, x: cx, y: cy, w: 0, h: 0, r: rad, cursor: ctx.locked ? '' : 'pointer' });
        }
      }
      // Trennlinie
      g.strokeStyle = withAlpha(theme.text, 0.1);
      g.lineWidth = 1;
      g.beginPath();
      if (stacked) {
        g.moveTo(mid.x + 10, mid.y + rowH);
        g.lineTo(mid.x + mid.w - 10, mid.y + rowH);
      } else {
        g.moveTo(mid.x + half, mid.y + 10);
        g.lineTo(mid.x + half, mid.y + mid.h - 10);
      }
      g.stroke();
    }

    function guess(sign: string): void {
      const c = relationSign(compare(A(), B()));
      if (sign === c) {
        revealed = true;
        guessedRight = true;
        pop.play();
      } else {
        wrongGuesses.add(sign);
        shake = { id: `guess:${sign}`, t0: performance.now() };
      }
      updateReadouts();
    }

    function setBarValue(which: 'A' | 'B', px: number, tap: boolean): void {
      if (ctx.locked) return;
      const geo = vgGeo();
      const units = vgUnits();
      const f = which === 'A' ? A() : B();
      const unitW = (geo.x1 - geo.x0) / units;
      const u = ((px - geo.x0) / unitW) * f.n;
      const max = Math.min(24, units * f.n);
      let z = tap ? clamp(Math.ceil(u), 0, max) : clamp(Math.round(u), 0, max);
      if (tap && z === f.z && z > 0) z -= 1;
      if (z !== f.z) ctx.set(which === 'A' ? { z1: z } : { z2: z });
    }

    function setPieValue(which: 'A' | 'B', i: number, px: number, py: number): void {
      if (ctx.locked) return;
      const h = hits.find((x) => x.id === `pie${which}:${i}`);
      if (!h) return;
      const f = which === 'A' ? A() : B();
      let ang = Math.atan2(py - h.y, px - h.x) + Math.PI / 2;
      if (ang < 0) ang += Math.PI * 2;
      const j = Math.min(f.n - 1, Math.floor((ang / (Math.PI * 2)) * f.n));
      let z = i * f.n + j + 1;
      if (z === f.z) z -= 1;
      z = Math.min(z, 24);
      ctx.set(which === 'A' ? { z1: z } : { z2: z });
    }

    function pieSectorAt(id: string, px: number, py: number): number {
      const h = hits.find((x) => x.id === id);
      const which = id.startsWith('pieA') ? A() : B();
      if (!h) return -1;
      let ang = Math.atan2(py - h.y, px - h.x) + Math.PI / 2;
      if (ang < 0) ang += Math.PI * 2;
      return Math.min(which.n - 1, Math.floor((ang / (Math.PI * 2)) * which.n));
    }

    /* ================================================================ */
    /* Erweitern und Kürzen                                             */
    /* ================================================================ */
    let chain: Step[] = [{ f: { z: p.z, n: p.n }, op: 'start', k: 1 }];
    let fromAction = false;
    let kAnim: { kind: 'erw' | 'kurz'; from: Fraction; to: Fraction; k: number } | null = null;
    const kTween = new Tween(1150, ease.inOutCubic);
    let notice: { tokens: Token[]; color: string; t0: number } | null = null;
    let refuse = -1e9;
    let stripDrag: { x0: number; moved: boolean } | null = null;

    const kzUnits = () => (p.z > p.n ? 2 : 1);

    function kzGeo() {
      const W = surface.width;
      const H = surface.height;
      const wide = isWide();
      const pad = wide ? 18 : 10;
      const chainR: Rect = { x: pad, y: 4, w: W - 2 * pad, h: wide ? 106 : 92 };
      const x0 = pad + (wide ? 10 : 4);
      const x1 = W - pad - (wide ? 10 : 4);
      const stripY = chainR.y + chainR.h + (wide ? 22 : 20);
      const stripH = wide ? 52 : 44;
      const bracketY = stripY + stripH + 6;
      const verdictY = bracketY + (wide ? 22 : 20);
      const verdict: Rect = { x: pad + 4, y: verdictY, w: W - 2 * pad - 8, h: 0 };
      verdict.h = messageHeight(verdict.w, kzVerdict());
      const wallY = verdictY + verdict.h + (wide ? 10 : 8);
      const wall: Rect = { x: x0, y: wallY, w: x1 - x0, h: H - wallY - 6 };
      return { W, H, wide, pad, chainR, x0, x1, strip: { x: x0, y: stripY, w: x1 - x0, h: stripH } as Rect, bracketY, verdict, wall };
    }

    function drawChain(R: Rect, now: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const wide = isWide();
      const t = kTween.running && kAnim ? kTween.value : 1;
      let size = wide ? 30 : 23;
      const widths = (s: number) => chain.map((st) => fracWidth(g, String(st.f.z), String(st.f.n), s, F()));
      let first = 0;
      let ws = widths(size);
      const eqW = (s: number) => s * 1.9;
      const totalOf = (from: number, s: number) => ws.slice(from).reduce((acc, w) => acc + w, 0) + (chain.length - from - 1) * eqW(s);
      while (totalOf(first, size) > R.w - 30) {
        if (size > (wide ? 22 : 17)) {
          size -= 1;
          ws = widths(size);
        } else first++;
      }
      const total = totalOf(first, size);
      let x = R.x + R.w / 2 - total / 2;
      const cy = R.y + R.h / 2 + 2;
      if (first > 0) text(g, '…', x - 16, cy, { font: `700 ${size * 0.8}px ${F()}`, color: theme.muted });
      for (let i = first; i < chain.length; i++) {
        const st = chain[i]!;
        const w = ws[i]!;
        const last = i === chain.length - 1;
        const newest = last && kAnim && kTween.running;
        g.save();
        if (newest) g.globalAlpha = clamp((t - 0.35) / 0.4, 0, 1);
        const color = last ? colA() : withAlpha(theme.text, 0.78);
        drawFrac(g, x + w / 2, cy, String(st.f.z), String(st.f.n), size, color, F());
        g.restore();
        if (i < chain.length - 1) {
          const next = chain[i + 1]!;
          const nextNew = i + 1 === chain.length - 1 && kAnim && kTween.running;
          const eq = eqW(size);
          g.save();
          if (nextNew) g.globalAlpha = clamp((t - 0.2) / 0.4, 0, 1);
          text(g, '=', x + w + eq / 2, cy + 1, { font: `700 ${size * 0.95}px ${F()}`, color: theme.muted });
          g.restore();
          const label = next.op === 'erw' ? `·${next.k}` : `:${next.k}`;
          const arcT = nextNew ? clamp(t * 1.4, 0, 1) : 1;
          const xa = x + w * 0.62;
          const xb = x + w + eq + ws[i + 1]! * 0.38;
          opArc(xa, xb, cy - size * 1.02, true, label, arcT, colOp(), size);
          opArc(xa, xb, cy + size * 1.02, false, label, arcT, colOp(), size);
          x += w + eq;
        } else x += w;
      }
      void now;
    }

    function drawBrackets(geo: ReturnType<typeof kzGeo>, now: number): void {
      const g = surface.g;
      const units = kzUnits();
      const n = p.n;
      const f = p.f;
      const total = units * n;
      const pieceW = geo.strip.w / total;
      const y = geo.bracketY;
      const groups = Math.ceil(total / f);
      const shakeU = (now - refuse) / 500;
      const dx = shakeU < 1 ? Math.sin(shakeU * Math.PI * 6) * 5 * (1 - shakeU) : 0;
      const zBad = p.z % f !== 0;
      const fade = kAnim && kTween.running ? clamp((kTween.t - 0.75) / 0.25, 0, 1) : 1;
      g.save();
      g.globalAlpha = fade;
      g.lineCap = 'round';
      g.lineJoin = 'round';
      for (let i = 0; i < groups; i++) {
        const j0 = i * f;
        const j1 = Math.min(total, j0 + f);
        const partial = j1 - j0 < f;
        const hasCut = zBad && p.z > j0 && p.z < j1;
        const bad = partial || hasCut;
        const xa = geo.strip.x + j0 * pieceW + 2 + dx;
        const xb = geo.strip.x + j1 * pieceW - 2 + dx;
        if (xb - xa < 3) continue;
        const color = bad ? colBad() : withAlpha(colOp(), 0.85);
        g.strokeStyle = color;
        g.lineWidth = bad ? 2.2 : 1.8;
        if (partial) g.setLineDash([4, 3]);
        const h = 7;
        g.beginPath();
        g.moveTo(xa, y);
        g.quadraticCurveTo(xa, y + h, xa + Math.min(6, (xb - xa) / 4), y + h);
        g.lineTo((xa + xb) / 2 - 4, y + h);
        g.lineTo((xa + xb) / 2, y + h + 4);
        g.lineTo((xa + xb) / 2 + 4, y + h);
        g.lineTo(xb - Math.min(6, (xb - xa) / 4), y + h);
        g.quadraticCurveTo(xb, y + h, xb, y);
        g.stroke();
        g.setLineDash([]);
      }
      // Schnittstelle des gefärbten Teils markieren, wenn sie mitten in einer Gruppe liegt
      if (zBad && p.z > 0 && p.z < total) {
        const x = geo.strip.x + p.z * pieceW + dx;
        g.strokeStyle = colBad();
        g.lineWidth = 2.5;
        g.beginPath();
        g.moveTo(x, geo.strip.y + 2);
        g.lineTo(x, geo.strip.y + geo.strip.h + 6);
        g.stroke();
      }
      g.restore();
    }

    function kzVerdict(): { tokens: Token[]; color?: string }[] {
      const theme = ctx.theme;
      const f0: Fraction = { z: p.z, n: p.n };
      const f = p.f;
      const lines: { tokens: Token[]; color?: string }[] = [];
      const ok = theme.series[2]!;
      const bad = colBad();
      if (notice && performance.now() - notice.t0 < 3200) lines.push({ tokens: notice.tokens, color: notice.color });
      else {
        const obstacle = reduceObstacle(f0, f);
        const vars = { f: bold(String(f), colOp()), z: bold(String(f0.z)), n: bold(String(f0.n)) };
        if (obstacle === 'ok') lines.push({ tokens: [bold('✓ ', ok), ...rich('canK', vars)] });
        else lines.push({ tokens: [bold('✗ ', bad), ...rich(obstacle === 'nenner' ? 'noKn' : obstacle === 'zaehler' ? 'noKz' : 'noKb', vars)] });
      }
      const red = reduce(f0.z, f0.n);
      if (f0.z !== 0 && gcd(f0.z, f0.n) === 1) lines.push({ tokens: rich('isRed', { a: fr(f0.z, f0.n, colA()) }), color: theme.muted });
      else if (f0.z !== 0 || f0.n !== red.n) lines.push({ tokens: rich('notRed', { a: fr(f0.z, f0.n, colA()) }), color: theme.muted });
      return lines;
    }

    function drawWall(R: Rect, now: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const wide = isWide();
      const units = kzUnits();
      const f0: Fraction = { z: p.z, n: p.n };
      const v = f0.z / f0.n;
      const rows = 12;
      const titleH = 26;
      const rh = Math.min(wide ? 24 : 22, (R.h - titleH - 4) / rows);
      const top = R.y + titleH;
      const X = (val: number) => R.x + (val / units) * R.w;
      text(g, ctx.t('wallTitle'), R.x + R.w / 2, R.y + 7, { font: `650 ${wide ? 12 : 11}px ${F()}`, color: theme.muted });
      const lineX = X(Math.min(v, units));
      for (let r = 1; r <= rows; r++) {
        const y = top + (r - 1) * rh;
        const tiles = r * units;
        const tw = R.w / tiles;
        const fit = fitsRow(f0, r);
        const current = r === f0.n;
        // Grund
        g.fillStyle = withAlpha(theme.text, theme.dark ? 0.06 : 0.04);
        g.fillRect(R.x, y + 1, R.w, rh - 2);
        // bis zum Wert getönt
        g.fillStyle = withAlpha(colA(), fit !== null ? (theme.dark ? 0.75 : 0.7) : theme.dark ? 0.2 : 0.14);
        g.fillRect(R.x, y + 1, lineX - R.x, rh - 2);
        // Fugen
        g.strokeStyle = theme.bg;
        g.lineWidth = 2;
        for (let j = 1; j < tiles; j++) {
          const x = R.x + j * tw;
          g.beginPath();
          g.moveTo(x, y + 1);
          g.lineTo(x, y + rh - 1);
          g.stroke();
        }
        // Stammbruch-Beschriftung in breiten Kacheln
        const fs = Math.min(10.5, rh * 0.52);
        if (tw >= 34 && rh >= 14) {
          // Platz der Plakette rechts (bzw. links) vom Wert freihalten
          const pillRight = lineX + 64 <= R.x + R.w;
          const pillFrom = fit === null ? Infinity : pillRight ? lineX - 4 : lineX - 64;
          const pillTo = fit === null ? -Infinity : pillRight ? lineX + 62 : lineX + 4;
          g.font = `600 ${fs}px ${F()}`;
          const lw = g.measureText(`1/${r}`).width;
          for (let j = 0; j < tiles; j++) {
            const cx = R.x + (j + 0.5) * tw;
            if (cx > pillFrom && cx < pillTo) continue;
            // Beschriftung nicht von der Wertlinie zerschneiden lassen
            if (Math.abs(cx - lineX) < lw / 2 + 4) continue;
            const inside = cx < lineX;
            text(g, `1/${r}`, cx, y + rh / 2 + 0.5, { font: `600 ${fs}px ${F()}`, color: inside && fit !== null ? (theme.dark ? '#10161f' : '#ffffff') : withAlpha(theme.text, inside ? 0.7 : 0.45) });
          }
        }
        if (current) {
          g.strokeStyle = colA();
          g.lineWidth = 2;
          g.strokeRect(R.x - 1, y, R.w + 2, rh);
        }
        hits.push({ id: `wall:${r}`, x: R.x, y, w: R.w, h: rh, cursor: ctx.locked ? '' : 'pointer' });
        if (hover?.startsWith(`wall:${r}:`)) {
          const j = Number(hover.split(':')[2]);
          g.fillStyle = withAlpha(theme.text, theme.dark ? 0.18 : 0.12);
          g.fillRect(R.x + j * tw, y + 1, tw, rh - 2);
        }
      }
      // senkrechte Linie beim Wert
      g.strokeStyle = theme.text;
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(lineX, top - 4);
      g.lineTo(lineX, top + rows * rh + 4);
      g.stroke();
      g.fillStyle = theme.text;
      g.beginPath();
      g.moveTo(lineX, top - 2);
      g.lineTo(lineX - 5, top - 9);
      g.lineTo(lineX + 5, top - 9);
      g.closePath();
      g.fill();
      // Beschriftung der gleichwertigen Brüche
      const fs = wide ? 11.5 : 10.5;
      for (let r = 1; r <= rows; r++) {
        const fit = fitsRow(f0, r);
        if (fit === null) continue;
        const y = top + (r - 1) * rh + rh / 2;
        const label = `${fit}/${r}`;
        g.font = `800 ${fs}px ${F()}`;
        const w = g.measureText(label).width + 12;
        const right = lineX + 6 + w <= R.x + R.w;
        const x = right ? lineX + 6 : lineX - 6 - w;
        const h = Math.min(rh - 3, fs + 7);
        g.fillStyle = theme.bg;
        roundRect(g, x, y - h / 2, w, h, h / 2);
        g.fill();
        g.strokeStyle = colA();
        g.lineWidth = 1.4;
        roundRect(g, x, y - h / 2, w, h, h / 2);
        g.stroke();
        text(g, label, x + w / 2, y + 0.5, { font: `800 ${fs}px ${F()}`, color: colA() });
      }
      void now;
    }

    function drawKuerzen(now: number): boolean {
      const g = surface.g;
      const theme = ctx.theme;
      const geo = kzGeo();
      panel(geo.chainR);
      drawChain(geo.chainR, now);
      const units = kzUnits();
      const animating = !!kAnim && kTween.running;
      if (animating && kAnim) {
        const e = kTween.value;
        const fromUnits = kAnim.from.z > kAnim.from.n ? 2 : 1;
        if (kAnim.kind === 'erw') drawBar({ ...geo.strip, units: fromUnits, n: kAnim.from.n, z: kAnim.from.z, k: kAnim.k, e, color: colA() });
        else drawBar({ ...geo.strip, units: fromUnits, n: kAnim.to.n, z: kAnim.to.z, k: kAnim.k, e: 1 - e, color: colA() });
      } else {
        const hovIdx = hover?.startsWith('strip:') ? Number(hover.split(':')[1]) : -1;
        drawBar({ ...geo.strip, units, n: p.n, z: p.z, k: 1, e: 0, color: colA(), hover: hovIdx });
      }
      hits.push({ id: 'strip', ...geo.strip, cursor: ctx.locked ? '' : 'pointer' });
      if (!animating || kTween.t > 0.75) drawBrackets(geo, now);
      // Beschriftung „Gruppen zu je f Stücken“ rechts über dem Streifen
      text(g, tr('groups', { f: p.f }), geo.strip.x + geo.strip.w, geo.strip.y - 9, { font: `650 ${geo.wide ? 11.5 : 10.5}px ${F()}`, color: colOp(), align: 'right' });
      if (units > 1) text(g, ctx.t('whole'), geo.strip.x + geo.strip.w / 2 - 6, geo.strip.y - 9, { font: `650 ${geo.wide ? 11.5 : 10.5}px ${F()}`, color: theme.muted, align: 'right' });
      message(geo.verdict, kzVerdict());
      drawWall(geo.wall, now);
      const noticeOn = notice && now - notice.t0 < 3300;
      return kTween.running || now - refuse < 500 || !!noticeOn || !!stripDrag;
    }

    function kzAction(kind: 'erw' | 'kurz' | 'full'): void {
      if (ctx.locked) return;
      const f0: Fraction = { z: p.z, n: p.n };
      let k = kind === 'full' ? gcd(f0.z, f0.n) : p.f;
      const now = performance.now();
      if (kind === 'erw') {
        if (f0.n * k > MAX_N || f0.z * k > 200) {
          notice = { tokens: [bold('✗ ', colBad()), { t: ctx.t('tooBig') }], color: ctx.theme.text, t0: now };
          refuse = now;
          ctx.requestRender();
          return;
        }
      } else if (kind === 'full') {
        if (f0.z === 0) k = f0.n;
        if (k <= 1) {
          notice = { tokens: rich('already', { a: fr(f0.z, f0.n, colA()) }), color: ctx.theme.text, t0: now };
          ctx.requestRender();
          return;
        }
      } else if (!canReduceBy(f0, k)) {
        refuse = now;
        notice = null;
        ctx.requestRender();
        return;
      }
      const to = kind === 'erw' ? expand(f0, k) : reduceBy(f0, k);
      kAnim = { kind: kind === 'erw' ? 'erw' : 'kurz', from: f0, to, k };
      kTween.play();
      chain.push({ f: to, op: kind === 'erw' ? 'erw' : 'kurz', k });
      notice = { tokens: [bold('✓ ', colOk()), { t: tr(kind === 'erw' ? 'erwDone' : 'kurzDone', { k }) }], color: ctx.theme.text, t0: now };
      fromAction = true;
      ctx.set({ z: to.z, n: to.n });
    }

    function setStripValue(px: number, tap: boolean): void {
      if (ctx.locked) return;
      const geo = kzGeo();
      const units = kzUnits();
      const u = ((px - geo.strip.x) / geo.strip.w) * units * p.n;
      const max = Math.min(200, units * p.n);
      let z = tap ? clamp(Math.ceil(u), 0, max) : clamp(Math.round(u), 0, max);
      if (tap && z === p.z && z > 0) z -= 1;
      if (z !== p.z) ctx.set({ z });
    }

    /* ================================================================ */
    /* Brüche ordnen                                                    */
    /* ================================================================ */
    let cards: Card[] = [];
    let placed: number[] = [];
    let mistakes = 0;
    let roundNo = 0;
    let perfect = 0;
    let finished = 0;
    let hintOn = false;
    let solvedByButton = false;
    let doneAt = -1e9;
    let odMsg: { tokens: Token[]; color?: string } | null = null;
    const FLY_MS = 520;

    function newRound(): void {
      const list = orderingTask(p.stufe as Level, p.anz);
      cards = list.map((f) => ({ f, slot: -1, from: null, fly0: -1e9, shake0: -1e9 }));
      placed = [];
      mistakes = 0;
      roundNo++;
      solvedByButton = false;
      doneAt = -1e9;
      odMsg = null;
      updateReadouts();
    }

    const odUnits = () => (cards.some((c) => c.f.z > c.f.n) ? 2 : 1);

    function odGeo() {
      const W = surface.width;
      const H = surface.height;
      const wide = isWide();
      const pad = wide ? 18 : 10;
      const count = Math.max(1, cards.length);
      const signW = wide ? 30 : 14;
      const cw = Math.min(wide ? 116 : 76, (W - 2 * pad - (count - 1) * signW) / count);
      const ch = wide ? (hintOn ? 108 : 94) : hintOn ? 90 : 78;
      const head = wide ? 30 : 40;
      const poolY = head + 8;
      const orderY = poolY + ch + (wide ? 44 : 36);
      const lineY = orderY + ch + (wide ? 64 : 56);
      const x0 = pad + (wide ? 34 : 18);
      const x1 = W - pad - (wide ? 34 : 22);
      const msgH = wide ? 52 : 74;
      const msg: Rect = { x: pad + 4, y: H - msgH, w: W - 2 * pad - 8, h: msgH - 4 };
      const rowW = count * cw + (count - 1) * signW;
      const poolX = (i: number) => W / 2 - rowW / 2 + i * (cw + signW);
      return { W, H, wide, pad, cw, ch, head, poolY, orderY, lineY, x0, x1, msg, signW, poolX, slotX: poolX };
    }

    function cardPos(i: number, now: number, geo: ReturnType<typeof odGeo>): [number, number] {
      const c = cards[i]!;
      if (c.slot < 0) return [geo.poolX(i), geo.poolY];
      const target: [number, number] = [geo.slotX(c.slot), geo.orderY];
      if (!c.from) return target;
      const u = clamp((now - c.fly0) / FLY_MS, 0, 1);
      if (u >= 1) return target;
      const e = ease.inOutCubic(u);
      return [lerp(c.from[0], target[0], e), lerp(c.from[1], target[1], e) - Math.sin(Math.PI * u) * 26];
    }

    function drawCard(i: number, x: number, y: number, geo: ReturnType<typeof odGeo>, now: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const c = cards[i]!;
      const inPool = c.slot < 0;
      const hov = inPool && hover === `card:${i}`;
      const shakeU = (now - c.shake0) / 480;
      const shaking = shakeU < 1;
      const dx = shaking ? Math.sin(shakeU * Math.PI * 6) * 6 * (1 - shakeU) : 0;
      const lift = hov ? 3 : 0;
      const cx = x + dx;
      const cy = y - lift;
      g.save();
      softShadow(g, theme.dark, hov ? 16 : 10, hov ? 5 : 3);
      g.fillStyle = theme.bg;
      roundRect(g, cx, cy, geo.cw, geo.ch, 12);
      g.fill();
      g.restore();
      const placedOk = !inPool;
      if (placedOk) {
        g.fillStyle = withAlpha(colOk(), theme.dark ? 0.16 : 0.08);
        roundRect(g, cx, cy, geo.cw, geo.ch, 12);
        g.fill();
      } else if (hov) {
        g.fillStyle = withAlpha(colA(), theme.dark ? 0.14 : 0.06);
        roundRect(g, cx, cy, geo.cw, geo.ch, 12);
        g.fill();
      }
      g.strokeStyle = shaking ? colBad() : placedOk ? withAlpha(colOk(), 0.8) : hov ? colA() : withAlpha(theme.text, 0.2);
      g.lineWidth = shaking || placedOk || hov ? 2 : 1.3;
      roundRect(g, cx, cy, geo.cw, geo.ch, 12);
      g.stroke();
      const size = geo.wide ? 27 : 20;
      const fy = cy + (hintOn ? geo.ch * 0.42 : geo.ch / 2);
      drawFrac(g, cx + geo.cw / 2, fy, String(c.f.z), String(c.f.n), size, placedOk ? theme.text : colA(), F());
      if (hintOn) {
        const units = odUnits();
        const bw = geo.cw - 16;
        const bx = cx + 8;
        const by = cy + geo.ch - (geo.wide ? 20 : 18);
        const bh = geo.wide ? 10 : 9;
        g.fillStyle = withAlpha(colA(), theme.dark ? 0.16 : 0.1);
        roundRect(g, bx, by, bw, bh, 3);
        g.fill();
        g.fillStyle = colA();
        roundRect(g, bx, by, (bw * Math.min(c.f.z / c.f.n, units)) / units, bh, 3);
        g.fill();
        g.strokeStyle = theme.bg;
        g.lineWidth = 1;
        // Teilstriche nur, wenn sie sich nicht zu einer Fläche verdichten
        const parts = bw / (units * c.f.n) >= 3 ? units * c.f.n : 0;
        for (let j = 1; j < parts; j++) {
          const x2 = bx + (bw * j) / (units * c.f.n);
          g.beginPath();
          g.moveTo(x2, by);
          g.lineTo(x2, by + bh);
          g.stroke();
        }
        if (units > 1) {
          g.strokeStyle = theme.text;
          g.lineWidth = 1.5;
          g.beginPath();
          g.moveTo(bx + bw / 2, by - 2);
          g.lineTo(bx + bw / 2, by + bh + 2);
          g.stroke();
        }
      }
      if (inPool) hits.push({ id: `card:${i}`, x: cx, y: cy, w: geo.cw, h: geo.ch });
    }

    function drawOrdnen(now: number): boolean {
      const g = surface.g;
      const theme = ctx.theme;
      const geo = odGeo();
      const count = cards.length;
      message({ x: geo.pad, y: 6, w: geo.W - 2 * geo.pad, h: geo.head }, [{ tokens: [bold(ctx.t('instr'))], size: geo.wide ? 14.5 : 12.5 }]);
      // leere Plätze
      for (let i = 0; i < count; i++) {
        const x = geo.poolX(i);
        if (cards[i]!.slot >= 0) {
          g.save();
          g.setLineDash([5, 4]);
          g.strokeStyle = withAlpha(theme.text, 0.18);
          g.lineWidth = 1.3;
          roundRect(g, x, geo.poolY, geo.cw, geo.ch, 12);
          g.stroke();
          g.restore();
        }
      }
      // geordnete Reihe
      panel({ x: geo.slotX(0) - 10, y: geo.orderY - 10, w: count * geo.cw + (count - 1) * geo.signW + 20, h: geo.ch + 20 }, 16);
      for (let s = 0; s < count; s++) {
        const x = geo.slotX(s);
        const filled = placed.length > s;
        if (!filled) {
          g.save();
          g.setLineDash([5, 4]);
          g.strokeStyle = withAlpha(theme.text, 0.22);
          g.lineWidth = 1.3;
          roundRect(g, x, geo.orderY, geo.cw, geo.ch, 12);
          g.stroke();
          g.restore();
          text(g, `${s + 1}.`, x + geo.cw / 2, geo.orderY + geo.ch / 2, { font: `700 ${geo.wide ? 16 : 13}px ${F()}`, color: withAlpha(theme.text, 0.25) });
        }
        if (s < count - 1) text(g, '<', x + geo.cw + geo.signW / 2, geo.orderY + geo.ch / 2 + 1, { font: `800 ${geo.wide ? 22 : 15}px ${F()}`, color: placed.length > s + 1 ? theme.text : withAlpha(theme.text, 0.3) });
      }
      // Zahlenstrahl mit den eingeordneten Brüchen
      drawOrderLine(geo, now);
      haloText(ctx.t('smallest'), geo.slotX(0), geo.orderY + geo.ch + 22, `650 ${geo.wide ? 12 : 11}px ${F()}`, theme.muted, 'left');
      haloText(ctx.t('largest'), geo.slotX(count - 1) + geo.cw, geo.orderY + geo.ch + 22, `650 ${geo.wide ? 12 : 11}px ${F()}`, theme.muted, 'right');
      // Karten: erst die in der Auswahl, dann die fliegenden/platzierten
      let flying = false;
      for (let i = 0; i < count; i++) if (cards[i]!.slot < 0) drawCard(i, ...cardPos(i, now, geo), geo, now);
      for (let i = 0; i < count; i++) {
        const c = cards[i]!;
        if (c.slot < 0) continue;
        const [x, y] = cardPos(i, now, geo);
        // Flug und anschließendes Einblenden der Plakette am Zahlenstrahl
        if (now - c.fly0 < FLY_MS + 420) flying = true;
        drawCard(i, x, y, geo, now);
      }
      // Rückmeldung
      const done = placed.length === count && count > 0;
      let lines: { tokens: Token[]; color?: string }[] = [];
      if (done) {
        const ok = solvedByButton ? ctx.t('solved') : mistakes === 0 ? ctx.t('done') : mistakes === 1 ? ctx.t('doneOne') : tr('doneMany', { m: mistakes });
        const s = now - doneAt < 700 ? ease.outBack(clamp((now - doneAt) / 700, 0, 1)) : 1;
        lines = [{ tokens: [bold(ok, solvedByButton ? theme.text : colOk())] }];
        if (!solvedByButton && s < 1) flying = true;
      } else if (odMsg) lines = [odMsg];
      else lines = [{ tokens: rich('odTip', { h: fr(1, 2) }), color: theme.muted }];
      if (lines.length) message(geo.msg, lines);
      const shaking = cards.some((c) => now - c.shake0 < 480);
      return flying || shaking;
    }

    function drawOrderLine(geo: ReturnType<typeof odGeo>, now: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const units = odUnits();
      const { x0, x1, lineY: y } = geo;
      const unitW = (x1 - x0) / units;
      const X = (v: number) => x0 + v * unitW;
      g.strokeStyle = theme.axis;
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(x0 - 10, y);
      g.lineTo(x1 + 12, y);
      g.stroke();
      g.fillStyle = theme.axis;
      g.beginPath();
      g.moveTo(x1 + 20, y);
      g.lineTo(x1 + 9, y - 5.5);
      g.lineTo(x1 + 9, y + 5.5);
      g.closePath();
      g.fill();
      for (let j = 0; j <= units * 4; j++) {
        const x = X(j / 4);
        const whole = j % 4 === 0;
        g.strokeStyle = whole ? theme.axis : withAlpha(theme.axis, 0.45);
        g.lineWidth = whole ? 2.4 : 1.3;
        g.beginPath();
        g.moveTo(x, y - (whole ? 10 : 5));
        g.lineTo(x, y + (whole ? 10 : 5));
        g.stroke();
        if (whole) text(g, String(j / 4), x, y + 22, { font: `800 ${geo.wide ? 14 : 12.5}px ${F()}`, color: theme.text });
      }
      // eingeordnete Brüche: Punkt + Plakette, Verbindung zur Karte
      const fs = geo.wide ? 12.5 : 11;
      const order = placed.map((i) => cards[i]!);
      if (!order.length) text(g, ctx.t('odEmpty'), (x0 + x1) / 2, y + 46, { font: `600 ${geo.wide ? 12.5 : 11.5}px ${F()}`, color: withAlpha(theme.muted, 0.8) });
      // Plaketten in einer Reihe unter dem Strahl: Die Reihenfolge ist schon
      // aufsteigend, also nur nach rechts schieben, bis sich nichts überlappt,
      // und am rechten Rand wieder zurück.
      const shown = order.filter((c) => now - c.fly0 >= FLY_MS);
      const widths = shown.map((c) => fracWidth(g, String(c.f.z), String(c.f.n), fs, F()) + 10);
      const lx = shown.map((c) => X(c.f.z / c.f.n));
      const gapPx = 5;
      for (let i = 1; i < lx.length; i++) lx[i] = Math.max(lx[i]!, lx[i - 1]! + (widths[i - 1]! + widths[i]!) / 2 + gapPx);
      const right = geo.W - geo.pad;
      for (let i = lx.length - 1; i >= 0; i--) {
        const lim = i === lx.length - 1 ? right - widths[i]! / 2 : lx[i + 1]! - (widths[i]! + widths[i + 1]!) / 2 - gapPx;
        lx[i] = Math.min(lx[i]!, lim);
      }
      shown.forEach((c, s) => {
        const ci = cards.indexOf(c);
        const v = c.f.z / c.f.n;
        const px = X(v);
        const age = clamp((now - c.fly0 - FLY_MS) / 400, 0, 1);
        // Verbindung von der Karte zum Punkt
        const [cx, cy] = cardPos(ci, now, geo);
        const sx = cx + geo.cw / 2;
        const sy = cy + geo.ch + 4;
        g.save();
        g.globalAlpha = age * 0.7;
        g.strokeStyle = withAlpha(colA(), 0.55);
        g.lineWidth = 1.4;
        g.setLineDash([3, 4]);
        g.beginPath();
        g.moveTo(sx, sy);
        g.bezierCurveTo(sx, sy + 26, px, y - 40, px, y - 8);
        g.stroke();
        g.restore();
        // Plakette unterhalb, mit Knick-Linie zum Punkt
        const qx = lx[s]!;
        const ly = y + 54;
        g.save();
        g.globalAlpha = age;
        g.strokeStyle = withAlpha(colA(), 0.6);
        g.lineWidth = 1.2;
        g.beginPath();
        g.moveTo(px, y + 6);
        g.lineTo(px, y + 14);
        g.lineTo(qx, ly - fs * 1.15 - 6);
        g.lineTo(qx, ly - fs * 1.15);
        g.stroke();
        fracPill(qx, ly, c.f, colA(), fs);
        g.fillStyle = theme.bg;
        g.beginPath();
        g.arc(px, y, 6.5, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = colA();
        g.beginPath();
        g.arc(px, y, 4.8, 0, Math.PI * 2);
        g.fill();
        g.restore();
      });
    }

    function tapCard(i: number): void {
      const c = cards[i];
      if (!c || c.slot >= 0) return;
      const now = performance.now();
      const remaining = cards.filter((x) => x.slot < 0);
      const smallest = sortAscending(remaining.map((x) => x.f))[0]!;
      if (compare(c.f, smallest) === 0) {
        const geo = odGeo();
        c.from = [geo.poolX(i), geo.poolY];
        c.fly0 = reduced ? -1e9 : now;
        c.slot = placed.length;
        placed.push(i);
        odMsg = { tokens: rich('good', { f: fr(c.f.z, c.f.n, colA()) }), color: ctx.theme.text };
        if (placed.length === cards.length) {
          doneAt = now;
          finished++;
          if (mistakes === 0) perfect++;
        }
      } else {
        mistakes++;
        c.shake0 = now;
        odMsg = { tokens: rich('bad', { s: fr(smallest.z, smallest.n, colOk()), f: fr(c.f.z, c.f.n, colBad()) }), color: ctx.theme.text };
      }
      updateReadouts();
    }

    function solveAll(): void {
      const geo = odGeo();
      const now = performance.now();
      const rest = cards.map((c, i) => ({ c, i })).filter((x) => x.c.slot < 0);
      rest.sort((a, b) => compare(a.c.f, b.c.f));
      rest.forEach(({ c, i }, j) => {
        c.from = [geo.poolX(i), geo.poolY];
        c.fly0 = reduced ? -1e9 : now + j * 260;
        c.slot = placed.length;
        placed.push(i);
      });
      if (rest.length) {
        solvedByButton = true;
        doneAt = now;
      }
      updateReadouts();
    }

    /* ================================================================ */
    /* Ergebnisse und Aktionen                                          */
    /* ================================================================ */
    const frac = (z: number, n: number) => `<span class="frac"><span>${z}</span><span>${n}</span></span>`;
    const dec = (v: number) => {
      const exact = Math.abs(Math.round(v * 1000) - v * 1000) < 1e-9;
      return `${exact ? '' : '≈ '}${fmt.num(v, 3)}`;
    };

    function updateReadouts(): void {
      const m = mode();
      const keysVg = ['fracs', 'common', 'compare', 'decimal'];
      const keysKz = ['chain', 'ggt', 'reduced', 'family'];
      const keysOd = ['score', 'order'];
      for (const k of [...keysVg, ...keysKz, ...keysOd]) if (!(m === 'vergleich' ? keysVg : m === 'kuerzen' ? keysKz : keysOd).includes(k)) ctx.readout(k, null);
      if (m === 'vergleich') {
        const a = A();
        const b = B();
        const c = compare(a, b);
        const sign = relationSign(c).replace('<', '&lt;').replace('>', '&gt;');
        ctx.readout('fracs', { html: `${frac(a.z, a.n)} ${ctx.t('and')} ${frac(b.z, b.n)}` });
        const { k1, k2, ok } = factors();
        if (p.weg === 'zaehler') {
          ctx.readout(
            'common',
            ok ? { html: `${lang === 'de' ? 'gleicher Zähler' : 'common numerator'} ${a.z * k1}: ${frac(a.z, a.n)} = ${frac(a.z * k1, a.n * k1)}, ${frac(b.z, b.n)} = ${frac(b.z * k2, b.n * k2)}` } : ctx.t('zeroZ'),
          );
        } else {
          const N = a.n * k1;
          ctx.readout('common', { html: `${tr('hauptnenner', { n1: a.n, n2: b.n, N })}: ${frac(a.z, a.n)} = ${frac(a.z * k1, N)}, ${frac(b.z, b.n)} = ${frac(b.z * k2, N)}` });
        }
        ctx.readout('compare', { html: `${frac(a.z, a.n)} ${sign} ${frac(b.z, b.n)}${k1 > 1 || k2 > 1 ? `, ${lang === 'de' ? 'denn' : 'since'} ${frac(a.z * k1, a.n * k1)} ${sign} ${frac(b.z * k2, b.n * k2)}` : ''}` });
        const decOf = (f: Fraction) => {
          const d = dec(f.z / f.n);
          return `${frac(f.z, f.n)} ${d.startsWith('≈') ? d : `= ${d}`}`;
        };
        ctx.readout('decimal', { html: `${decOf(a)}, ${decOf(b)}` });
      } else if (m === 'kuerzen') {
        const parts = chain.slice(-6).map((s) => frac(s.f.z, s.f.n));
        ctx.readout('chain', { html: `${chain.length > 6 ? '… = ' : ''}${parts.join(' = ')}` });
        const g0 = gcd(p.z, p.n);
        ctx.readout('ggt', tr('ggt', { z: p.z, n: p.n, g: p.z === 0 ? p.n : g0 }));
        const r = reduce(p.z, p.n);
        ctx.readout('reduced', { html: r.n === p.n && r.z === p.z ? `${frac(p.z, p.n)} ${ctx.t('reducedSame')}` : `${frac(p.z, p.n)} = ${frac(r.z, r.n)}` });
        const red0 = reduce(p.z, p.n);
        const fam = equivalents({ z: p.z, n: p.n }, red0.n * 6);
        ctx.readout('family', { html: `${fam.map((f) => frac(f.z, f.n)).join(' = ')} = …` });
      } else {
        ctx.readout('score', { html: `${tr('score', { r: roundNo, m: mistakes })}<br>${tr('perfect', { p: perfect, t: finished })}` });
        const sorted = sortAscending(cards.map((c) => c.f));
        ctx.readout('order', { html: sorted.map((f) => frac(f.z, f.n)).join(' &lt; ') });
      }
    }

    function updateActions(): void {
      const { k1, k2, ok } = factors();
      const already = k1 === 1 && k2 === 1;
      ctx.setAction('expand', { label: expanded ? ctx.t('actBack') : ctx.t(p.weg === 'zaehler' ? 'actZ' : 'actN'), enabled: expanded || (ok && !already) });
      ctx.setAction('task', { enabled: !ctx.locked });
      ctx.setAction('erw', { label: tr('actErw', { f: p.f }), enabled: !ctx.locked });
      ctx.setAction('kurz', { label: tr('actKurz', { f: p.f }), enabled: !ctx.locked });
      ctx.setAction('full', { enabled: !ctx.locked });
      ctx.setAction('hint', { label: ctx.t(hintOn ? 'hintOff' : 'hintOn') });
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

    /** Feinere Kennung für Hervorhebungen (Teilstück unter dem Zeiger). */
    function hoverId(h: Hit, px: number, py: number): string {
      if (h.id === 'barA' || h.id === 'barB') {
        if (ctx.locked) return h.id;
        const f = h.id === 'barA' ? A() : B();
        const units = vgUnits();
        return `${h.id}:${Math.floor(((px - h.x) / h.w) * units * f.n)}`;
      }
      if (h.id.startsWith('pie')) return ctx.locked ? h.id : `${h.id}:${pieSectorAt(h.id, px, py)}`;
      if (h.id === 'strip') return ctx.locked ? h.id : `strip:${Math.floor(((px - h.x) / h.w) * kzUnits() * p.n)}`;
      if (h.id.startsWith('wall:')) {
        const r = Number(h.id.split(':')[1]);
        return ctx.locked ? h.id : `${h.id}:${Math.floor(((px - h.x) / h.w) * kzUnits() * r)}`;
      }
      return h.id;
    }

    surface.addTarget({
      contains: (px: number, py: number) => hitAt(px, py) !== null,
      pointerDown: (pt: { px: number; py: number }) => {
        const h = hitAt(pt.px, pt.py);
        if (!h) return false;
        const id = h.id;
        if (id === 'barA' || id === 'barB') {
          if (ctx.locked) return true;
          barDrag = { which: id === 'barA' ? 'A' : 'B', x0: pt.px, moved: false };
          setBarValue(barDrag.which, pt.px, true);
        } else if (id.startsWith('pieA:') || id.startsWith('pieB:')) {
          setPieValue(id.startsWith('pieA') ? 'A' : 'B', Number(id.split(':')[1]), pt.px, pt.py);
        } else if (id.startsWith('guess:')) guess(id.slice(6));
        else if (id === 'strip') {
          if (ctx.locked) return true;
          stripDrag = { x0: pt.px, moved: false };
          setStripValue(pt.px, true);
        } else if (id.startsWith('wall:')) {
          if (ctx.locked) return true;
          const r = Number(id.split(':')[1]);
          const j = Math.floor(((pt.px - h.x) / h.w) * kzUnits() * r);
          ctx.set({ z: clamp(j + 1, 1, 200), n: r });
        } else if (id.startsWith('card:')) tapCard(Number(id.slice(5)));
        ctx.requestRender();
        return true;
      },
      pointerMove: (pt: { px: number; py: number }) => {
        if (barDrag) {
          if (!barDrag.moved && Math.abs(pt.px - barDrag.x0) < 5) return;
          barDrag.moved = true;
          setBarValue(barDrag.which, pt.px, false);
        } else if (stripDrag) {
          if (!stripDrag.moved && Math.abs(pt.px - stripDrag.x0) < 5) return;
          stripDrag.moved = true;
          setStripValue(pt.px, false);
        }
      },
      pointerUp: () => {
        barDrag = null;
        stripDrag = null;
        ctx.requestRender();
      },
      hover: (pt: { px: number; py: number } | null) => {
        const h = pt ? hitAt(pt.px, pt.py) : null;
        const id = h && pt ? hoverId(h, pt.px, pt.py) : null;
        if (id !== hover) {
          hover = id;
          ctx.requestRender();
        }
        surface.setCursor(h ? (h.cursor ?? 'pointer') : '');
      },
      wheel: () => false,
    });

    return {
      update(changed, source) {
        // Werte begrenzen: höchstens zwei Ganze
        if (source === 'input') {
          if (p.z1 > 2 * p.n1) ctx.set({ z1: 2 * p.n1 });
          if (p.z2 > 2 * p.n2) ctx.set({ z2: 2 * p.n2 });
          if (p.z > 2 * p.n) ctx.set({ z: 2 * p.n });
        }
        const vgChanged = ['z1', 'n1', 'z2', 'n2', 'weg'].some((k) => changed.has(k));
        if (vgChanged || changed.has('show') || (changed.has('mode') && source !== 'init')) {
          if (!p.show) revealed = false;
          else revealed = true;
          guessedRight = false;
          wrongGuesses.clear();
        }
        if (changed.has('mode') && source !== 'init') {
          expanded = false;
          expDir = -1;
          expTween.finish();
        }
        if (expanded) {
          const { k1, k2, ok } = factors();
          if (!ok || (k1 === 1 && k2 === 1)) {
            expanded = false;
            expDir = -1;
            expTween.finish();
          } else if (k1 !== lastK[0] || k2 !== lastK[1]) {
            expDir = 1;
            expTween.play(650);
          }
          lastK = [k1, k2];
        }
        if (changed.has('z') || changed.has('n')) {
          if (!fromAction) {
            chain = [{ f: { z: p.z, n: p.n }, op: 'start', k: 1 }];
            kAnim = null;
            kTween.finish();
            notice = null;
          }
          fromAction = false;
        }
        if (changed.has('f')) notice = null;
        if (mode() === 'ordnen' && (cards.length === 0 || ((changed.has('stufe') || changed.has('anz')) && source !== 'init'))) newRound();
        updateReadouts();
        updateActions();
      },

      action(id) {
        switch (id) {
          case 'expand': {
            const { k1, k2, ok } = factors();
            if (!expanded && (!ok || (k1 === 1 && k2 === 1))) break;
            expanded = !expanded;
            expDir = expanded ? 1 : -1;
            lastK = [k1, k2];
            expTween.play(expanded ? 1250 : 800);
            break;
          }
          case 'task': {
            if (ctx.locked) break;
            const [a, b] = randomPair();
            expanded = false;
            expDir = -1;
            expTween.finish();
            ctx.set({ z1: a.z, n1: a.n, z2: b.z, n2: b.n });
            break;
          }
          case 'erw':
            kzAction('erw');
            break;
          case 'kurz':
            kzAction('kurz');
            break;
          case 'full':
            kzAction('full');
            break;
          case 'round':
            newRound();
            break;
          case 'hint':
            hintOn = !hintOn;
            break;
          case 'solve':
            solveAll();
            break;
        }
        updateActions();
        ctx.requestRender();
      },

      render() {
        const now = performance.now();
        hits = [];
        surface.begin();
        let anim = false;
        const m = mode();
        if (m === 'vergleich') anim = drawVergleich(now);
        else if (m === 'kuerzen') anim = drawKuerzen(now);
        else anim = drawOrdnen(now);
        if (anim) ctx.requestRender();
      },

      destroy: () => surface.destroy(),
    };
  },
});
