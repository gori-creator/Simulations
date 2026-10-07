import { defineSimulation, ease, prefersReducedMotion, roundRect, seededRandom, Surface, text, withAlpha, type Rect } from '../../../sim-core';
import {
  buildTree,
  digitSum,
  divisibilityChecks,
  divisors,
  factorPowers,
  gcd,
  isPrime,
  lcm,
  nodesOf,
  primeFactors,
  sharedFactors,
  sieve,
  treeDepth,
  type SplitStrategy,
  type TreeNode,
} from './model';

const L = (de: string, en: string) => ({ de, en });
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** Zahl als tiefgestellter Index (T₂₄). */
const sub = (n: number) => String(n).replace(/\d/g, (d) => '₀₁₂₃₄₅₆₇₈₉'[Number(d)]!);

type Mode = 'baum' | 'sieb' | 'ggt';

interface Piece {
  text: string;
  color: string;
  /** Hochgestellt (Exponent). */
  sup?: boolean;
  bold?: boolean;
}

/**
 * Primfaktorzerlegung und Teilbarkeit: Faktorbaum, der sich animiert
 * verzweigt (mit Teilbarkeitsregeln), Sieb des Eratosthenes sowie ggT und kgV
 * über gemeinsame Primfaktoren im Mengenbild.
 */
export default defineSimulation({
  id: 'primfaktoren',
  layout: { aspect: 1.6, aspectNarrow: 0.68 },
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Ansicht', 'View'),
      options: [
        { value: 'baum', label: L('Faktorbaum', 'Factor tree') },
        { value: 'sieb', label: L('Sieb des Eratosthenes', 'Sieve of Eratosthenes') },
        { value: 'ggt', label: L('ggT und kgV', 'GCD and LCM') },
      ],
      default: 'baum',
    },
    { key: 'n', type: 'number', label: L('Zahl', 'Number'), min: 2, max: 999, step: 1, default: 360, visibleIf: (v) => v.mode === 'baum' },
    {
      key: 'split',
      type: 'choice',
      label: L('Zerlegen in', 'Split into'),
      options: [
        { value: 'mitte', label: L('zwei Faktoren', 'two factors') },
        { value: 'klein', label: L('kleinsten Primfaktor', 'smallest prime factor') },
      ],
      default: 'mitte',
      visibleIf: (v) => v.mode === 'baum',
    },
    { key: 'max', type: 'number', label: L('Zahlen bis', 'Numbers up to'), min: 20, max: 150, step: 10, default: 100, visibleIf: (v) => v.mode === 'sieb' },
    {
      key: 'cols',
      type: 'choice',
      label: L('Spalten', 'Columns'),
      help: L('Mit 6 Spalten stehen alle Primzahlen ab 5 in zwei Spalten.', 'With 6 columns all primes from 5 on lie in two columns.'),
      options: [
        { value: '10', label: L('10 Spalten', '10 columns') },
        { value: '6', label: L('6 Spalten', '6 columns') },
      ],
      default: '10',
      visibleIf: (v) => v.mode === 'sieb',
    },
    { key: 'a', type: 'number', label: L('Erste Zahl a', 'First number a'), min: 2, max: 200, step: 1, default: 24, visibleIf: (v) => v.mode === 'ggt' },
    { key: 'b', type: 'number', label: L('Zweite Zahl b', 'Second number b'), min: 2, max: 200, step: 1, default: 36, visibleIf: (v) => v.mode === 'ggt' },
    {
      key: 'show',
      type: 'boolean',
      label: L('Ergebnis sofort zeigen', 'Show the result right away'),
      help: L('Ausgeschaltet geht es Schritt für Schritt mit den Knöpfen.', 'When off, you go step by step with the buttons.'),
      default: true,
    },
  ],
  actions: [
    { id: 'split', label: L('Zerlegen', 'Split'), primary: true, visibleIf: (v) => v.mode === 'baum' },
    { id: 'splitAll', label: L('Ganz zerlegen', 'Split completely'), visibleIf: (v) => v.mode === 'baum' },
    { id: 'other', label: L('Anderer Baum', 'Another tree'), visibleIf: (v) => v.mode === 'baum' },
    { id: 'sieve', label: L('Nächste Primzahl', 'Next prime'), primary: true, visibleIf: (v) => v.mode === 'sieb' },
    { id: 'sieveAll', label: L('Bis zum Ende', 'Run to the end'), visibleIf: (v) => v.mode === 'sieb' },
    { id: 'sort', label: L('Faktoren zuordnen', 'Sort the factors'), primary: true, visibleIf: (v) => v.mode === 'ggt' },
    { id: 'reset', label: L('Von vorn', 'Start over') },
  ],
  readouts: [
    { key: 'factors', label: L('Primfaktorzerlegung', 'Prime factorisation'), spoiler: true },
    { key: 'divisors', label: L('Teiler', 'Divisors'), spoiler: true },
    { key: 'primes', label: L('Primzahlen', 'Primes'), spoiler: true },
    { key: 'gcd', label: L('Größter gemeinsamer Teiler', 'Greatest common divisor'), spoiler: true },
    { key: 'lcm', label: L('Kleinstes gemeinsames Vielfaches', 'Least common multiple'), spoiler: true },
    { key: 'common', label: L('Teilermengen', 'Sets of divisors'), spoiler: true },
  ],
  presets: [
    { id: 'start', label: L('Faktorbaum von 360', 'Factor tree of 360'), values: {} },
    { id: 'ladder', label: L('Kleinster Primfaktor zuerst', 'Smallest prime first'), values: { n: 360, split: 'klein' } },
    { id: 'power', label: L('512 = 2⁹', '512 = 2⁹'), values: { n: 512 } },
    { id: 'sieve', label: L('Sieb bis 100', 'Sieve up to 100'), values: { mode: 'sieb', show: false } },
    { id: 'six', label: L('Sieb mit 6 Spalten', 'Sieve with 6 columns'), values: { mode: 'sieb', cols: '6', max: 120 } },
    { id: 'ggt', label: L('ggT und kgV von 24 und 36', 'GCD and LCM of 24 and 36'), values: { mode: 'ggt' } },
  ],
  strings: {
    de: {
      canvas: 'Faktorbaum, Sieb des Eratosthenes oder Mengenbild der Primfaktoren zweier Zahlen',
      isPrime: '{n} ist eine Primzahl.',
      tapHint: 'Tippe auf eine Zahl, um sie zu zerlegen.',
      checkTitle: 'Ist {n} teilbar durch …?',
      endDigit: 'Endziffer {d}',
      digitSum: 'Quersumme {s} = {q}',
      r2yes: 'Endziffer {d} ist gerade',
      r2no: 'Endziffer {d} ist ungerade',
      r3: 'Quersumme {q}',
      r4: 'letzte zwei Ziffern: {z}',
      r5: 'Endziffer {d}',
      r6yes: 'durch 2 und durch 3',
      r6no: 'nicht durch 2 und 3 zugleich',
      r9: 'Quersumme {q}',
      r10: 'Endziffer {d}',
      r25: 'letzte zwei Ziffern: {z}',
      one: '1 ist keine Primzahl.',
      stepStart: 'Streiche zuerst die 1. Dann ist die kleinste nicht gestrichene Zahl eine Primzahl – streiche ihre Vielfachen.',
      stepPrime: '{p} ist eine Primzahl. Ihre Vielfachen werden gestrichen.',
      stepDone: 'Fertig: Alle übrigen Zahlen sind Primzahlen.',
      stepWhy: 'Ab {p} ist nichts mehr zu tun: {p} · {p} = {sq} > {max}.',
      multiplesOf: 'Vielfache von {p}',
      primesUpTo: 'Primzahlen bis {max}: {count}',
      factorsOf: 'Primfaktoren von {n}',
      gcdLabel: 'ggT({a}; {b})',
      lcmLabel: 'kgV({a}; {b})',
      coprime: 'teilerfremd',
      divisorsOf: 'T',
      multiplesSet: 'V',
      tipPrime: '{n} ist eine Primzahl',
      tipOne: '1 ist weder Primzahl noch zusammengesetzt',
      common: 'gemeinsam',
      divCount: '{n} hat {c} Teiler: {list}',
    },
    en: {
      canvas: 'Factor tree, sieve of Eratosthenes or set diagram of the prime factors of two numbers',
      isPrime: '{n} is a prime number.',
      tapHint: 'Tap a number to split it.',
      checkTitle: 'Is {n} divisible by …?',
      endDigit: 'last digit {d}',
      digitSum: 'digit sum {s} = {q}',
      r2yes: 'last digit {d} is even',
      r2no: 'last digit {d} is odd',
      r3: 'digit sum {q}',
      r4: 'last two digits: {z}',
      r5: 'last digit {d}',
      r6yes: 'by 2 and by 3',
      r6no: 'not by both 2 and 3',
      r9: 'digit sum {q}',
      r10: 'last digit {d}',
      r25: 'last two digits: {z}',
      one: '1 is not a prime number.',
      stepStart: 'First cross out 1. Then the smallest number not crossed out is a prime – cross out its multiples.',
      stepPrime: '{p} is a prime. Its multiples are crossed out.',
      stepDone: 'Done: all remaining numbers are primes.',
      stepWhy: 'Nothing left to do from {p} on: {p} · {p} = {sq} > {max}.',
      multiplesOf: 'multiples of {p}',
      primesUpTo: 'Primes up to {max}: {count}',
      factorsOf: 'Prime factors of {n}',
      gcdLabel: 'gcd({a}, {b})',
      lcmLabel: 'lcm({a}, {b})',
      coprime: 'coprime',
      divisorsOf: 'D',
      multiplesSet: 'M',
      tipPrime: '{n} is a prime number',
      tipOne: '1 is neither prime nor composite',
      common: 'common',
      divCount: '{n} has {c} divisors: {list}',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const lang = ctx.lang;
    const reduced = prefersReducedMotion();
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const mode = () => p.mode as Mode;
    const isWide = () => surface.width >= 600;
    const dot = ' · ';
    const onColor = () => (ctx.theme.dark ? '#10161f' : '#ffffff');

    /** Jede Primzahl hat immer dieselbe Farbe (Baum, Sieb und Mengenbild). */
    function primeColor(q: number): string {
      const s = ctx.theme.series;
      const map: Record<number, string | undefined> = { 2: s[0], 3: s[2], 5: s[3], 7: s[4], 11: s[1], 13: s[5] };
      return map[q] ?? ctx.theme.text;
    }

    let lastFrame = performance.now();
    let hover: string | null = null;
    let hits: { id: string; x: number; y: number; r: number }[] = [];

    /* ================================================================ */
    /* Faktorbaum                                                       */
    /* ================================================================ */
    let seed: number | null = null;
    let tree: TreeNode = buildTree(p.n, p.split as SplitStrategy);
    let open = new Set<number>();
    const born = new Map<number, number>();
    const shown = new Map<number, [number, number]>();
    let selected = -1;
    let autoTree = 0;

    function rebuildTree(): void {
      const strategy: SplitStrategy = seed !== null ? 'zufall' : (p.split as SplitStrategy);
      tree = buildTree(p.n, strategy, seed !== null ? seededRandom(seed) : Math.random);
      open = new Set();
      born.clear();
      shown.clear();
      selected = -1;
      autoTree = 0;
    }

    function openAll(animate: boolean): void {
      const now = performance.now();
      for (const node of nodesOf(tree)) {
        if (!node.children) continue;
        open.add(node.id);
        for (const c of node.children) born.set(c.id, animate && !reduced ? now + node.depth * 220 : -1e9);
      }
    }

    function visibleNodes(): TreeNode[] {
      const out: TreeNode[] = [];
      const walk = (node: TreeNode) => {
        out.push(node);
        if (node.children && open.has(node.id)) node.children.forEach(walk);
      };
      walk(tree);
      return out;
    }

    /** Nächster noch nicht zerlegter Knoten (Breitensuche). */
    function nextClosed(): TreeNode | null {
      const vis = new Set(visibleNodes().map((n) => n.id));
      return nodesOf(tree).find((n) => n.children && vis.has(n.id) && !open.has(n.id)) ?? null;
    }

    function openNode(node: TreeNode): void {
      if (!node.children || open.has(node.id)) return;
      open.add(node.id);
      const now = performance.now();
      for (const c of node.children) born.set(c.id, reduced ? -1e9 : now);
      selected = node.id;
      updateReadouts();
    }

    const treeComplete = () => nextClosed() === null;

    interface TreeGeo {
      area: Rect;
      panel: Rect | null;
      formulaY: number;
      levelH: number;
      r: number;
    }

    function treeGeo(): TreeGeo {
      const W = surface.width;
      const H = surface.height;
      const wide = isWide();
      const area: Rect = wide ? { x: 12, y: 12, w: W * 0.66 - 18, h: H - 84 } : { x: 8, y: 8, w: W - 16, h: H * 0.6 - 48 };
      const panel: Rect | null = wide ? { x: W * 0.66 + 4, y: 12, w: W * 0.34 - 16, h: H - 24 } : { x: 8, y: H * 0.6 + 26, w: W - 16, h: H * 0.4 - 32 };
      const depth = Math.max(1, treeDepth(tree));
      const leaves = Math.max(1, nodesOf(tree).filter((n) => !n.children).length);
      const levelH = Math.min(wide ? 96 : 66, (area.h - 50) / depth);
      const r = clamp(Math.min(levelH * 0.34, (area.w / leaves) * 0.44), 12, wide ? 26 : 20);
      return { area, panel, formulaY: wide ? H - 40 : H * 0.6 + 2, levelH, r };
    }

    /** Ziel-Positionen: Blätter gleichmäßig verteilt, innere Knoten über ihren Kindern. */
    function treeLayout(geo: TreeGeo): Map<number, [number, number]> {
      const vis = visibleNodes();
      const leaves = vis.filter((n) => !(n.children && open.has(n.id)));
      const slot = geo.area.w / leaves.length;
      const pos = new Map<number, [number, number]>();
      const depth = treeDepth(tree);
      const top = geo.area.y + Math.max(geo.r + 6, (geo.area.h - depth * geo.levelH) / 2);
      let i = 0;
      const place = (node: TreeNode): number => {
        let x: number;
        if (node.children && open.has(node.id)) {
          const xs = node.children.map(place);
          x = (xs[0]! + xs[1]!) / 2;
        } else x = geo.area.x + slot * (i++ + 0.5);
        pos.set(node.id, [x, top + node.depth * geo.levelH]);
        return x;
      };
      place(tree);
      return pos;
    }

    function drawTree(now: number, dt: number): boolean {
      const g = surface.g;
      const theme = ctx.theme;
      const geo = treeGeo();
      const target = treeLayout(geo);
      const vis = visibleNodes();
      let moving = false;
      // Positionen weich nachführen; neue Knoten wachsen aus dem Elternknoten
      const parentOf = new Map<number, TreeNode>();
      for (const node of nodesOf(tree)) if (node.children) for (const c of node.children) parentOf.set(c.id, node);
      for (const node of vis) {
        const t = target.get(node.id)!;
        const cur = shown.get(node.id);
        if (!cur) {
          const parent = parentOf.get(node.id);
          shown.set(node.id, parent ? [...(shown.get(parent.id) ?? t)] as [number, number] : [...t] as [number, number]);
        }
        const c = shown.get(node.id)!;
        const k = reduced ? 1 : Math.min(1, dt * 9);
        c[0] += (t[0] - c[0]) * k;
        c[1] += (t[1] - c[1]) * k;
        if (Math.abs(t[0] - c[0]) > 0.3 || Math.abs(t[1] - c[1]) > 0.3) moving = true;
      }
      const grow = (id: number) => {
        const b = born.get(id);
        if (b === undefined) return 1;
        const u = clamp((now - b) / 520, 0, 1);
        if (u < 1) moving = true;
        return u;
      };
      // Kanten
      for (const node of vis) {
        if (!node.children || !open.has(node.id)) continue;
        const [px, py] = shown.get(node.id)!;
        for (const c of node.children) {
          const u = grow(c.id);
          if (u <= 0) continue;
          const [cx, cy] = shown.get(c.id)!;
          const e = ease.outCubic(u);
          g.strokeStyle = withAlpha(theme.text, 0.35);
          g.lineWidth = 2;
          g.lineCap = 'round';
          g.beginPath();
          g.moveTo(px, py + geo.r * 0.9);
          g.lineTo(lerp(px, cx, e), lerp(py + geo.r * 0.9, cy - geo.r * 0.9, e));
          g.stroke();
        }
        // Malpunkt zwischen den Kindern
        const [a, b] = node.children;
        const ua = grow(a.id);
        if (ua >= 1) {
          const [ax, ay] = shown.get(a.id)!;
          const [bx] = shown.get(b.id)!;
          if (bx - ax > geo.r * 2.6) text(g, '·', (ax + bx) / 2, ay, { font: `800 ${Math.round(geo.r * 1.1)}px ${theme.font}`, color: theme.muted });
        }
      }
      // Knoten
      for (const node of vis) {
        const u = grow(node.id);
        if (u <= 0) continue;
        const [x, y] = shown.get(node.id)!;
        const scale = ease.outBack(u);
        const prime = isPrime(node.value);
        const closed = !!node.children && !open.has(node.id);
        const r = geo.r * scale;
        g.save();
        if (prime) {
          const color = primeColor(node.value);
          g.shadowColor = withAlpha(color, 0.55);
          g.shadowBlur = 10;
          const grad = g.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
          grad.addColorStop(0, withAlpha(color, 0.75));
          grad.addColorStop(1, color);
          g.fillStyle = grad;
          g.beginPath();
          g.arc(x, y, r, 0, Math.PI * 2);
          g.fill();
        } else {
          g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.16)';
          g.shadowBlur = 8;
          g.shadowOffsetY = 2;
          g.fillStyle = theme.bg;
          g.beginPath();
          g.arc(x, y, r, 0, Math.PI * 2);
          g.fill();
          g.shadowColor = 'transparent';
          g.fillStyle = withAlpha(theme.text, theme.dark ? 0.08 : 0.03);
          g.fill();
          g.strokeStyle = withAlpha(theme.text, closed ? 0.6 : 0.3);
          g.lineWidth = closed ? 2 : 1.5;
          if (closed) g.setLineDash([4, 3]);
          g.stroke();
          g.setLineDash([]);
        }
        g.restore();
        if (selected === node.id || hover === `node:${node.id}`) {
          g.strokeStyle = withAlpha(theme.series[0]!, 0.7);
          g.lineWidth = 3;
          g.beginPath();
          g.arc(x, y, r + 4, 0, Math.PI * 2);
          g.stroke();
        }
        const digits = String(node.value).length;
        const size = Math.min(geo.r * (digits >= 3 ? 0.78 : 0.95), 20) * scale;
        if (size > 3) text(g, String(node.value), x, y + 0.5, { font: `800 ${size}px ${theme.font}`, color: prime ? onColor() : theme.text });
        hits.push({ id: `node:${node.id}`, x, y, r: Math.max(geo.r, 16) });
      }
      // Hinweis für unzerlegte Zahlen
      if (!treeComplete() && !autoTree) text(g, ctx.t('tapHint'), geo.area.x + geo.area.w / 2, geo.area.y + geo.area.h + 8, { font: `600 ${isWide() ? 12.5 : 11}px ${theme.font}`, color: theme.muted });
      drawTreeFormula(geo);
      if (geo.panel) drawRules(geo.panel);
      return moving;
    }

    /** Zerlegung als Produkt der momentanen Blätter, am Ende in Potenzschreibweise. */
    function drawTreeFormula(geo: TreeGeo): void {
      const theme = ctx.theme;
      const n = p.n;
      const vis = visibleNodes();
      const leaves = vis.filter((x) => !(x.children && open.has(x.id))).map((x) => x.value);
      const pieces: Piece[] = [{ text: `${n} = `, color: theme.text, bold: true }];
      if (isPrime(n)) {
        pieces.length = 0;
        pieces.push({ text: tr('isPrime', { n }), color: primeColor(n), bold: true });
      } else if (leaves.length === 1) {
        pieces.push({ text: '?', color: theme.muted, bold: true });
      } else {
        const done = treeComplete();
        const list = done ? leaves.slice().sort((a, b) => a - b) : leaves;
        list.forEach((v, i) => {
          if (i) pieces.push({ text: dot, color: theme.muted });
          pieces.push({ text: String(v), color: isPrime(v) ? primeColor(v) : theme.text, bold: true });
        });
        if (done) {
          const pw = factorPowers(n);
          if (pw.some((q) => q.e > 1)) {
            pieces.push({ text: ' = ', color: theme.text });
            pw.forEach((q, i) => {
              if (i) pieces.push({ text: dot, color: theme.muted });
              pieces.push({ text: String(q.p), color: primeColor(q.p), bold: true });
              if (q.e > 1) pieces.push({ text: String(q.e), color: primeColor(q.p), bold: true, sup: true });
            });
          }
        }
      }
      drawPieces(pieces, surface.width * (isWide() ? 0.33 : 0.5), geo.formulaY, isWide() ? 22 : 17, (isWide() ? surface.width * 0.64 : surface.width) - 16);
    }

    /** Farbige Teile mit Exponenten zentriert zeichnen (schrumpft bei Bedarf). */
    function drawPieces(pieces: Piece[], cx: number, cy: number, size: number, maxW: number, align: 'center' | 'left' = 'center'): number {
      const g = surface.g;
      const theme = ctx.theme;
      const fontOf = (q: Piece, s: number) => `${q.bold ? 800 : 600} ${q.sup ? s * 0.62 : s}px ${theme.font}`;
      let s = size;
      let total = 0;
      for (; s > 9; s -= 1) {
        total = pieces.reduce((w, q) => {
          g.font = fontOf(q, s);
          return w + g.measureText(q.text).width + (q.sup ? 1 : 0);
        }, 0);
        if (total <= maxW) break;
      }
      let x = align === 'center' ? cx - total / 2 : cx;
      for (const q of pieces) {
        g.font = fontOf(q, s);
        const w = g.measureText(q.text).width;
        text(g, q.text, x + (q.sup ? 1 : 0), q.sup ? cy - s * 0.38 : cy, { font: fontOf(q, s), color: q.color, align: 'left' });
        x += w + (q.sup ? 1 : 0);
      }
      return total;
    }

    /** Teilbarkeitsregeln für die ausgewählte Zahl. */
    function drawRules(R: Rect): void {
      const g = surface.g;
      const theme = ctx.theme;
      const wide = isWide();
      const node = nodesOf(tree).find((x) => x.id === selected) ?? tree;
      const n = node.value;
      const checks = divisibilityChecks(n);
      const digits = String(n).split('');
      const ok = theme.series[2]!;
      const no = withAlpha(theme.muted, 0.8);
      if (wide) {
        g.fillStyle = withAlpha(theme.text, theme.dark ? 0.05 : 0.03);
        roundRect(g, R.x, R.y, R.w, R.h, 14);
        g.fill();
        const size = clamp(R.w / 20, 11.5, 14.5);
        text(g, tr('checkTitle', { n }), R.x + 14, R.y + 22, { font: `800 ${size + 1.5}px ${theme.font}`, color: theme.text, align: 'left' });
        text(g, tr('endDigit', { d: n % 10 }), R.x + 14, R.y + 44, { font: `600 ${size - 0.5}px ${theme.font}`, color: theme.muted, align: 'left' });
        text(g, tr('digitSum', { s: digits.join(' + '), q: digitSum(n) }), R.x + 14, R.y + 62, { font: `600 ${size - 0.5}px ${theme.font}`, color: theme.muted, align: 'left' });
        const top = R.y + 84;
        const rowH = Math.min(34, (R.h - 96) / checks.length);
        checks.forEach((c, i) => {
          const y = top + i * rowH + rowH / 2;
          const color = c.divisible ? (isPrime(c.divisor) ? primeColor(c.divisor) : ok) : no;
          g.fillStyle = c.divisible ? color : withAlpha(theme.muted, 0.15);
          roundRect(g, R.x + 12, y - 11, 30, 22, 7);
          g.fill();
          text(g, String(c.divisor), R.x + 27, y + 0.5, { font: `800 ${size}px ${theme.font}`, color: c.divisible ? onColor() : theme.muted });
          text(g, c.divisible ? '✓' : '✗', R.x + 54, y + 0.5, { font: `800 ${size + 1}px ${theme.font}`, color: c.divisible ? ok : no });
          text(g, ruleText(c, n), R.x + 68, y + 0.5, { font: `${c.divisible ? 700 : 600} ${size - 1}px ${theme.font}`, color: c.divisible ? theme.text : theme.muted, align: 'left' });
        });
        return;
      }
      // schmal: kompakte Plaketten
      text(g, `${tr('checkTitle', { n })}  ${tr('digitSum', { s: digits.join('+'), q: digitSum(n) })}`, R.x + R.w / 2, R.y + 8, { font: `700 11.5px ${theme.font}`, color: theme.text });
      const cols = 4;
      const bw = (R.w - (cols - 1) * 6) / cols;
      checks.forEach((c, i) => {
        const x = R.x + (i % cols) * (bw + 6);
        const y = R.y + 22 + Math.floor(i / cols) * 30;
        const color = c.divisible ? (isPrime(c.divisor) ? primeColor(c.divisor) : ok) : withAlpha(theme.muted, 0.15);
        g.fillStyle = color;
        roundRect(g, x, y, bw, 24, 8);
        g.fill();
        text(g, `${c.divisible ? '✓' : '✗'} ${c.divisor}`, x + bw / 2, y + 12.5, { font: `800 12px ${theme.font}`, color: c.divisible ? onColor() : theme.muted });
      });
    }

    function ruleText(c: ReturnType<typeof divisibilityChecks>[number], n: number): string {
      const d = n % 10;
      const z = n < 10 ? String(n) : String(n % 100).padStart(2, '0');
      switch (c.divisor) {
        case 2:
          return tr(c.divisible ? 'r2yes' : 'r2no', { d });
        case 3:
          return tr('r3', { q: c.value });
        case 4:
          return tr('r4', { z });
        case 5:
          return tr('r5', { d });
        case 6:
          return tr(c.divisible ? 'r6yes' : 'r6no');
        case 9:
          return tr('r9', { q: c.value });
        case 10:
          return tr('r10', { d });
        default:
          return tr('r25', { z });
      }
    }

    /* ================================================================ */
    /* Sieb des Eratosthenes                                            */
    /* ================================================================ */
    let sv = sieve(p.max);
    /** Fortschritt: 0 = nichts, 1 = 1 gestrichen, 1 + k = k Primzahlen gesiebt, steps + 2 = fertig. */
    let stage = 0;
    let stageStart = -1e9;
    let autoSieve = false;
    let tipCell = -1;
    const finalStage = () => sv.steps.length + 2;

    function stepDuration(s: number): number {
      if (reduced) return 0;
      if (s === 1) return 450;
      if (s === finalStage()) return 900;
      const step = sv.steps[s - 2];
      return 450 + (step ? step.crossed.length + step.already.length : 0) * crossDelay(s) + 250;
    }

    function crossDelay(s: number): number {
      const step = sv.steps[s - 2];
      const count = step ? step.crossed.length + step.already.length : 1;
      return clamp(1600 / count, 22, 95);
    }

    function advanceSieve(): void {
      if (stage >= finalStage()) stage = 0;
      stage++;
      stageStart = performance.now();
      updateReadouts();
    }

    /** Zustand einer Zelle zum Zeitpunkt `now`. */
    function cellState(k: number, now: number): { kind: 'plain' | 'one' | 'prime' | 'crossed'; by: number; t: number; flash: number } {
      const fs = finalStage();
      const running = now - stageStart;
      const done = (s: number) => stage > s || (stage === s && running >= stepDuration(s));
      if (k === 1) {
        if (stage >= 1) return { kind: 'one', by: 0, t: stage === 1 ? clamp(running / 400, 0, 1) : 1, flash: 0 };
        return { kind: 'plain', by: 0, t: 0, flash: 0 };
      }
      // Primzahl, die selbst siebt
      const si = sv.steps.findIndex((s) => s.prime === k);
      if (si >= 0) {
        const s = si + 2;
        if (stage > s || (stage === s && running > 0)) return { kind: 'prime', by: k, t: stage === s ? clamp(running / 350, 0, 1) : 1, flash: 0 };
        if (stage === fs) return { kind: 'prime', by: k, t: 1, flash: 0 };
        return { kind: 'plain', by: 0, t: 0, flash: 0 };
      }
      const by = sv.crossedBy[k] ?? 0;
      if (by) {
        const s = sv.steps.findIndex((x) => x.prime === by) + 2;
        let flash = 0;
        if (stage >= 2 && stage < fs && stage !== s) {
          const cur = sv.steps[stage - 2]!;
          const j = cur.already.indexOf(k);
          if (j >= 0 && stage > s) {
            const idx = cur.crossed.filter((m) => m < k).length + j;
            const at = 450 + idx * crossDelay(stage);
            const dtf = running - at;
            if (dtf > 0 && dtf < 300) flash = 1 - dtf / 300;
          }
        }
        if (stage > s || (stage === s && done(s))) return { kind: 'crossed', by, t: 1, flash };
        if (stage === s) {
          const step = sv.steps[s - 2]!;
          const order = [...step.crossed, ...step.already].sort((x, y) => x - y);
          const at = 450 + order.indexOf(k) * crossDelay(s);
          const u = clamp((running - at) / 160, 0, 1);
          if (u > 0) return { kind: 'crossed', by, t: u, flash: 0 };
        }
        return { kind: 'plain', by: 0, t: 0, flash };
      }
      // Übrig gebliebene Primzahl
      if (stage === fs) {
        const idx = sv.primes.indexOf(k);
        const u = clamp((running - idx * 18) / 300, 0, 1);
        if (u > 0) return { kind: 'prime', by: k, t: u, flash: 0 };
      }
      return { kind: 'plain', by: 0, t: 0, flash: 0 };
    }

    interface SieveGeo {
      grid: Rect;
      panel: Rect;
      cols: number;
      cw: number;
      ch: number;
      /** Viele Zeilen werden auf zwei Blöcke nebeneinander verteilt. */
      perBlock: number;
      blockGap: number;
    }

    function sieveGeo(): SieveGeo {
      const W = surface.width;
      const H = surface.height;
      const wide = isWide();
      const cols = Number(p.cols);
      const rows = Math.ceil(p.max / cols);
      const area: Rect = wide ? { x: 12, y: 12, w: W * 0.64 - 18, h: H - 24 } : { x: 8, y: 8, w: W - 16, h: H * 0.7 - 12 };
      const panel: Rect = wide ? { x: W * 0.64 + 4, y: 12, w: W * 0.36 - 16, h: H - 24 } : { x: 8, y: H * 0.7 + 4, w: W - 16, h: H * 0.3 - 10 };
      const blocks = cols === 6 && rows > 14 ? 2 : 1;
      const perBlock = Math.ceil(rows / blocks);
      const blockGap = blocks > 1 ? (wide ? 18 : 10) : 0;
      const colsTotal = cols * blocks;
      const usableW = area.w - blockGap * (blocks - 1);
      const ch = Math.min(area.h / perBlock, (usableW / colsTotal) * 0.95, 48);
      const cw = Math.min(usableW / colsTotal, ch * (cols === 6 ? 1.9 : 1.25));
      const gw = cw * colsTotal + blockGap * (blocks - 1);
      const gh = ch * perBlock;
      return { grid: { x: area.x + (area.w - gw) / 2, y: area.y + (area.h - gh) / 2, w: gw, h: gh }, panel, cols, cw, ch, perBlock, blockGap };
    }

    /** Linke obere Ecke der Zelle für die Zahl k. */
    function cellXY(geo: SieveGeo, k: number): [number, number] {
      const i = k - 1;
      const row = Math.floor(i / geo.cols);
      const block = Math.floor(row / geo.perBlock);
      return [geo.grid.x + block * (geo.cols * geo.cw + geo.blockGap) + (i % geo.cols) * geo.cw, geo.grid.y + (row % geo.perBlock) * geo.ch];
    }

    /** Siebende Primzahlen in ihrer Farbe, alle übrigen Primzahlen kräftig in Textfarbe. */
    function sieveColor(q: number): string {
      return sv.steps.some((s) => s.prime === q) ? primeColor(q) : ctx.theme.text;
    }

    function drawSieve(now: number): boolean {
      const g = surface.g;
      const theme = ctx.theme;
      const geo = sieveGeo();
      const { cols, cw, ch } = geo;
      const running = stage > 0 && now - stageStart < stepDuration(stage);
      const fontSize = clamp(ch * 0.42, 9, 17);
      for (let k = 1; k <= p.max; k++) {
        const i = k - 1;
        const [x, y] = cellXY(geo, k);
        const st = cellState(k, now);
        const cx = x + cw / 2;
        const cy = y + ch / 2;
        // Zelle
        g.fillStyle = st.kind === 'prime' ? withAlpha(sieveColor(st.by), 0.14 * st.t) : withAlpha(theme.text, (i + Math.floor(i / cols)) % 2 ? 0.025 : 0.045);
        roundRect(g, x + 1.5, y + 1.5, cw - 3, ch - 3, Math.min(8, ch * 0.2));
        g.fill();
        if (st.flash > 0) {
          g.fillStyle = withAlpha(primeColor(sv.steps[stage - 2]?.prime ?? 2), 0.35 * st.flash);
          roundRect(g, x + 1.5, y + 1.5, cw - 3, ch - 3, Math.min(8, ch * 0.2));
          g.fill();
        }
        if (tipCell === k || hover === `cell:${k}`) {
          g.strokeStyle = withAlpha(theme.series[0]!, 0.7);
          g.lineWidth = 2;
          roundRect(g, x + 1.5, y + 1.5, cw - 3, ch - 3, Math.min(8, ch * 0.2));
          g.stroke();
        }
        const crossed = st.kind === 'crossed' || st.kind === 'one';
        text(g, String(k), cx, cy + 0.5, {
          font: `${st.kind === 'prime' ? 800 : 600} ${fontSize}px ${theme.font}`,
          color: st.kind === 'prime' ? sieveColor(st.by) : crossed ? withAlpha(theme.muted, 0.75) : theme.text,
        });
        if (st.kind === 'prime') {
          g.strokeStyle = sieveColor(st.by);
          g.lineWidth = 2.2;
          g.beginPath();
          const rr = Math.min(ch * 0.42, cw * 0.42, fontSize * 1.25);
          g.arc(cx, cy, rr, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ease.outCubic(st.t));
          g.stroke();
        } else if (crossed) {
          const color = st.kind === 'one' ? theme.muted : primeColor(st.by);
          const half = Math.min(cw, ch) * 0.34;
          g.strokeStyle = color;
          g.lineWidth = 2.4;
          g.lineCap = 'round';
          g.beginPath();
          g.moveTo(cx - half, cy + half * 0.75);
          g.lineTo(cx - half + 2 * half * st.t, cy + half * 0.75 - 1.5 * half * st.t);
          g.stroke();
        }
        hits.push({ id: `cell:${k}`, x: cx, y: cy, r: Math.min(cw, ch) * 0.5 });
      }
      if (tipCell > 0 && tipCell <= p.max) drawCellTip(geo, tipCell);
      drawSievePanel(geo.panel, now);
      if (autoSieve && !running) {
        if (stage >= finalStage()) autoSieve = false;
        else advanceSieve();
      }
      return running || autoSieve;
    }

    function factorPieces(n: number, color = true): Piece[] {
      const theme = ctx.theme;
      const pieces: Piece[] = [];
      factorPowers(n).forEach((q, i) => {
        if (i) pieces.push({ text: dot, color: theme.muted });
        pieces.push({ text: String(q.p), color: color ? primeColor(q.p) : theme.text, bold: true });
        if (q.e > 1) pieces.push({ text: String(q.e), color: color ? primeColor(q.p) : theme.text, bold: true, sup: true });
      });
      return pieces;
    }

    function drawCellTip(geo: SieveGeo, k: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const [cx0, y] = cellXY(geo, k);
      const x = cx0 + geo.cw / 2;
      const pieces: Piece[] =
        k === 1
          ? [{ text: tr('tipOne'), color: theme.text, bold: true }]
          : isPrime(k)
            ? [{ text: tr('tipPrime', { n: k }), color: primeColor(k), bold: true }]
            : [{ text: `${k} = `, color: theme.text, bold: true }, ...factorPieces(k)];
      const size = isWide() ? 14 : 12.5;
      // Breite messen
      g.font = `800 ${size}px ${theme.font}`;
      const w = pieces.reduce((s, q) => {
        g.font = `${q.bold ? 800 : 600} ${q.sup ? size * 0.62 : size}px ${theme.font}`;
        return s + g.measureText(q.text).width;
      }, 0) + 22;
      const bx = clamp(x - w / 2, 4, surface.width - w - 4);
      const by = y - 34 < 4 ? y + geo.ch + 4 : y - 34;
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.6)' : 'rgba(16,24,40,0.22)';
      g.shadowBlur = 12;
      g.shadowOffsetY = 3;
      g.fillStyle = theme.bg;
      roundRect(g, bx, by, w, 30, 10);
      g.fill();
      g.restore();
      g.strokeStyle = withAlpha(theme.text, 0.15);
      g.lineWidth = 1;
      roundRect(g, bx, by, w, 30, 10);
      g.stroke();
      drawPieces(pieces, bx + 11, by + 15.5, size, w, 'left');
    }

    function drawSievePanel(R: Rect, now: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const wide = isWide();
      const fs = finalStage();
      const size = wide ? clamp(R.w / 21, 11.5, 14.5) : 11.5;
      // Erklärung des aktuellen Schritts
      let msg = ctx.t('stepStart');
      if (stage >= 2 && stage < fs) msg = tr('stepPrime', { p: sv.steps[stage - 2]!.prime });
      if (stage === fs) {
        const last = sv.steps[sv.steps.length - 1]?.prime ?? 1;
        const nextP = sv.primes.find((q) => q > last) ?? last + 1;
        msg = `${ctx.t('stepDone')} ${tr('stepWhy', { p: nextP, sq: nextP * nextP, max: p.max })}`;
      }
      if (stage === 1) msg = ctx.t('one');
      const lines = wrap(msg, R.w - (wide ? 28 : 8), `600 ${size}px ${theme.font}`);
      if (wide) {
        g.fillStyle = withAlpha(theme.text, theme.dark ? 0.05 : 0.03);
        roundRect(g, R.x, R.y, R.w, R.h, 14);
        g.fill();
      }
      let y = R.y + (wide ? 22 : 8);
      const count = stage === fs ? sv.primes.length : 0;
      text(g, stage === fs ? tr('primesUpTo', { max: p.max, count }) : `${lang === 'de' ? 'Primzahlen bis' : 'Primes up to'} ${p.max}`, R.x + (wide ? 14 : R.w / 2), y, {
        font: `800 ${size + 2}px ${theme.font}`,
        color: theme.text,
        align: wide ? 'left' : 'center',
      });
      y += wide ? 26 : 18;
      lines.forEach((line) => {
        text(g, line, R.x + (wide ? 14 : R.w / 2), y, { font: `600 ${size}px ${theme.font}`, color: theme.muted, align: wide ? 'left' : 'center' });
        y += size * 1.35;
      });
      // Legende: Vielfache der siebenden Primzahlen
      y += wide ? 12 : 4;
      const itemH = wide ? 30 : 22;
      const perRow = wide ? 1 : 2;
      const iw = wide ? R.w - 28 : (R.w - 8) / perRow;
      sv.steps.forEach((step, i) => {
        const s = i + 2;
        const active = stage === s && now - stageStart < stepDuration(s);
        const doneStep = stage > s || stage === fs;
        const ix = R.x + (wide ? 14 : 4 + (i % perRow) * iw);
        const iy = y + Math.floor(i / perRow) * itemH;
        const color = primeColor(step.prime);
        g.fillStyle = active ? withAlpha(color, 0.22) : 'transparent';
        roundRect(g, ix - 4, iy - itemH / 2 + 2, iw, itemH - 4, 8);
        g.fill();
        g.strokeStyle = doneStep || active ? color : withAlpha(theme.muted, 0.4);
        g.lineWidth = 2.4;
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(ix + 2, iy + 5);
        g.lineTo(ix + 16, iy - 5);
        g.stroke();
        const label = `${tr('multiplesOf', { p: step.prime })}${wide ? ` (${step.crossed.length})` : ''}`;
        text(g, label, ix + 24, iy + 0.5, { font: `${active ? 800 : 600} ${size}px ${theme.font}`, color: doneStep || active ? theme.text : theme.muted, align: 'left' });
      });
    }

    function wrap(textValue: string, maxW: number, font: string): string[] {
      const g = surface.g;
      g.font = font;
      const rows: string[] = [];
      let cur = '';
      for (const w of textValue.split(' ')) {
        const next = cur ? `${cur} ${w}` : w;
        if (g.measureText(next).width > maxW && cur) {
          rows.push(cur);
          cur = w;
        } else cur = next;
      }
      if (cur) rows.push(cur);
      return rows;
    }

    /* ================================================================ */
    /* ggT und kgV im Mengenbild                                        */
    /* ================================================================ */
    let sorted = p.show;
    let sortStart = -1e9;
    const SORT_MS = 1500;

    interface Ball {
      p: number;
      /** Startplätze in den Zeilen „a = …“ und „b = …“ (zwei bei gemeinsamen Faktoren). */
      from: [number, number][];
      to: [number, number];
    }

    function ggtGeo(): { venn: Rect; panel: Rect; rowY: [number, number]; rowX: number; rowSize: number } {
      const W = surface.width;
      const H = surface.height;
      if (isWide()) {
        const panel: Rect = { x: W * 0.55 + 4, y: 12, w: W * 0.45 - 16, h: H - 24 };
        return { venn: { x: 12, y: 12, w: W * 0.55 - 18, h: H - 24 }, panel, rowY: [panel.y + 30, panel.y + 70], rowX: panel.x + 16, rowSize: clamp(panel.w / 17, 15, 22) };
      }
      return { venn: { x: 8, y: 64, w: W - 16, h: H - 64 - 76 }, panel: { x: 8, y: 8, w: W - 16, h: H - 16 }, rowY: [22, 48], rowX: 14, rowSize: 15 };
    }

    /** Zeile „24 = 2 · 2 · 2 · 3“ zeichnen; liefert die Mittelpunkte der Faktoren. */
    function factorLine(n: number, x0: number, y: number, size: number): [number, number][] {
      const g = surface.g;
      const theme = ctx.theme;
      const font = `800 ${size}px ${theme.font}`;
      const centers: [number, number][] = [];
      let x = x0;
      const put = (s: string, color: string, center = false) => {
        g.font = font;
        const w = g.measureText(s).width;
        text(g, s, x, y, { font, color, align: 'left' });
        if (center) centers.push([x + w / 2, y]);
        x += w;
      };
      put(`${n} = `, theme.text);
      primeFactors(n).forEach((q, i) => {
        if (i) put(dot, theme.muted);
        put(String(q), primeColor(q), true);
      });
      if (isPrime(n)) text(g, ` (${lang === 'de' ? 'Primzahl' : 'prime'})`, x, y + 1, { font: `600 ${size * 0.72}px ${theme.font}`, color: theme.muted, align: 'left' });
      return centers;
    }

    /** Plätze auf einem Sechseckraster um (cx, cy), die `test` erfüllen, nach Abstand sortiert. */
    function hexSlots(test: (x: number, y: number) => boolean, cx: number, cy: number, k: number, step: number, reach: number): [number, number][] {
      const pts: [number, number][] = [];
      const rows = Math.ceil(reach / (step * 0.87));
      const cols = Math.ceil(reach / step);
      for (let j = -rows; j <= rows; j++) {
        for (let i = -cols; i <= cols; i++) {
          const x = cx + (i + (Math.abs(j) % 2 ? 0.5 : 0)) * step;
          const y = cy + j * step * 0.87;
          if (test(x, y)) pts.push([x, y]);
        }
      }
      pts.sort((u, v) => Math.hypot(u[0] - cx, (u[1] - cy) * 1.2) - Math.hypot(v[0] - cx, (v[1] - cy) * 1.2));
      return pts.slice(0, k);
    }

    function drawGgt(now: number): boolean {
      const g = surface.g;
      const theme = ctx.theme;
      const wide = isWide();
      const { venn: V, panel: P, rowY, rowX, rowSize } = ggtGeo();
      const a = p.a;
      const b = p.b;
      const f = sharedFactors(a, b);
      const gg = gcd(a, b);
      const kg = lcm(a, b);
      const u = sorted ? clamp((now - sortStart) / SORT_MS, 0, 1) : 0;
      const showRes = sorted && u >= 1;
      const green = theme.series[2]!;

      // Mengenbild: zwei Kreise, die Schnittmenge enthält die gemeinsamen Primfaktoren
      const R = Math.min(V.h * (wide ? 0.38 : 0.42), V.w * 0.31);
      const cy = V.y + V.h * (wide ? 0.53 : 0.5);
      const dx = R * 0.5;
      const ca: [number, number] = [V.x + V.w / 2 - dx, cy];
      const cb: [number, number] = [V.x + V.w / 2 + dx, cy];
      const dA = (x: number, y: number) => Math.hypot(x - ca[0], y - ca[1]);
      const dB = (x: number, y: number) => Math.hypot(x - cb[0], y - cb[1]);
      g.save();
      g.fillStyle = withAlpha(theme.text, theme.dark ? 0.06 : 0.035);
      for (const c of [ca, cb]) {
        g.beginPath();
        g.arc(c[0], c[1], R, 0, Math.PI * 2);
        g.fill();
      }
      g.beginPath();
      g.arc(ca[0], ca[1], R, 0, Math.PI * 2);
      g.clip();
      g.beginPath();
      g.arc(cb[0], cb[1], R, 0, Math.PI * 2);
      g.fillStyle = withAlpha(green, showRes ? 0.18 : 0.07);
      g.fill();
      g.restore();
      g.lineWidth = 2.2;
      for (const [c, color] of [
        [ca, theme.series[0]!],
        [cb, theme.series[3]!],
      ] as const) {
        g.strokeStyle = withAlpha(color, 0.8);
        g.beginPath();
        g.arc(c[0], c[1], R, 0, Math.PI * 2);
        g.stroke();
      }
      if (showRes) {
        // kgV: alle Kugeln zusammen (Umriss der Vereinigung)
        g.save();
        g.strokeStyle = withAlpha(theme.series[4]!, 0.7);
        g.setLineDash([7, 5]);
        g.lineWidth = 2;
        const ang = Math.acos(dx / (R + 9));
        g.beginPath();
        g.arc(ca[0], ca[1], R + 9, ang, Math.PI * 2 - ang);
        g.arc(cb[0], cb[1], R + 9, Math.PI + ang, Math.PI - ang);
        g.closePath();
        g.stroke();
        g.restore();
      }
      const labelFont = `800 ${wide ? 14 : 12}px ${theme.font}`;
      text(g, tr('factorsOf', { n: a }), ca[0] - R * 0.45, cy - R - (showRes ? 22 : 13), { font: labelFont, color: theme.series[0]! });
      text(g, tr('factorsOf', { n: b }), cb[0] + R * 0.45, cy - R - (showRes ? 22 : 13), { font: labelFont, color: theme.series[3]! });

      // Plätze für die Kugeln (bei vielen Faktoren kleiner)
      let rb = clamp(R * 0.19, 9, wide ? 21 : 16);
      let lens: [number, number][] = [];
      let left: [number, number][] = [];
      let right: [number, number][] = [];
      for (let tries = 0; tries < 8; tries++) {
        const step = rb * 2.3;
        lens = hexSlots((x, y) => dA(x, y) < R - rb && dB(x, y) < R - rb, V.x + V.w / 2, cy, f.common.length, step, R);
        left = hexSlots((x, y) => dA(x, y) < R - rb && dB(x, y) > R + rb * 0.5, ca[0] - R * 0.42, cy, f.onlyA.length, step, R);
        right = hexSlots((x, y) => dB(x, y) < R - rb && dA(x, y) > R + rb * 0.5, cb[0] + R * 0.42, cy, f.onlyB.length, step, R);
        if (lens.length === f.common.length && left.length === f.onlyA.length && right.length === f.onlyB.length) break;
        rb *= 0.86;
      }

      // Zeilen mit den Primfaktoren (Startplätze der Kugeln)
      const fromA = factorLine(a, rowX, rowY[0], rowSize);
      const fromB = factorLine(b, rowX, rowY[1], rowSize);
      const fa = primeFactors(a);
      const fb = primeFactors(b);
      const usedA = new Set<number>();
      const usedB = new Set<number>();
      const take = (pos: [number, number][], factors: number[], used: Set<number>, q: number): [number, number] => {
        const i = factors.findIndex((x, j) => x === q && !used.has(j));
        used.add(i);
        return pos[i] ?? pos[0]!;
      };
      const balls: Ball[] = [];
      f.common.forEach((q, i) => balls.push({ p: q, from: [take(fromA, fa, usedA, q), take(fromB, fb, usedB, q)], to: lens[i] ?? [V.x + V.w / 2, cy] }));
      f.onlyA.forEach((q, i) => balls.push({ p: q, from: [take(fromA, fa, usedA, q)], to: left[i] ?? ca }));
      f.onlyB.forEach((q, i) => balls.push({ p: q, from: [take(fromB, fb, usedB, q)], to: right[i] ?? cb }));
      if (sorted) {
        balls.forEach((ball, i) => {
          const delay = (i / Math.max(1, balls.length)) * 0.4;
          const v = ease.inOutCubic(clamp((u - delay) / 0.6, 0, 1));
          if (v <= 0) return;
          if (ball.from.length === 2 && v >= 1) {
            drawBall(ball.to[0], ball.to[1], rb, ball.p);
            return;
          }
          for (const from of ball.from) {
            const x = lerp(from[0], ball.to[0], v);
            const y = lerp(from[1], ball.to[1], v) - Math.sin(Math.PI * v) * 40;
            drawBall(x, y, rb * lerp(0.7, 1, v), ball.p);
          }
        });
      }
      if (showRes) {
        // Beschriftung im Bild: Schnittmenge = ggT, alles zusammen = kgV
        const tag = (label: string, x: number, y: number, color: string) => {
          g.font = `800 ${wide ? 13 : 11.5}px ${theme.font}`;
          const w = g.measureText(label).width + 16;
          g.fillStyle = color;
          roundRect(g, x - w / 2, y - 11, w, 22, 11);
          g.fill();
          text(g, label, x, y + 0.5, { font: `800 ${wide ? 13 : 11.5}px ${theme.font}`, color: onColor() });
        };
        tag(`${lang === 'de' ? 'ggT' : 'gcd'} = ${gg}`, V.x + V.w / 2, cy + R * 0.86 - 4, green);
        tag(`${lang === 'de' ? 'kgV' : 'lcm'} = ${kg}`, V.x + V.w / 2, cy + R + (wide ? 26 : 22), theme.series[4]!);
      }

      // Ergebnisse
      const gcdPieces: Piece[] = [{ text: `${tr('gcdLabel', { a, b })} = `, color: theme.text, bold: true }];
      const lcmPieces: Piece[] = [{ text: `${tr('lcmLabel', { a, b })} = `, color: theme.text, bold: true }];
      if (showRes) {
        if (f.common.length) {
          f.common.forEach((q, i) => {
            if (i) gcdPieces.push({ text: dot, color: theme.muted });
            gcdPieces.push({ text: String(q), color: primeColor(q), bold: true });
          });
          gcdPieces.push({ text: ` = ${gg}`, color: theme.text, bold: true });
        } else gcdPieces.push({ text: `1 (${ctx.t('coprime')})`, color: theme.text, bold: true });
        [...f.common, ...f.onlyA, ...f.onlyB]
          .sort((x, z) => x - z)
          .forEach((q, i) => {
            if (i) lcmPieces.push({ text: dot, color: theme.muted });
            lcmPieces.push({ text: String(q), color: primeColor(q), bold: true });
          });
        lcmPieces.push({ text: ` = ${kg}`, color: theme.text, bold: true });
      } else {
        gcdPieces.push({ text: '?', color: theme.muted, bold: true });
        lcmPieces.push({ text: '?', color: theme.muted, bold: true });
      }
      if (wide) {
        const size = clamp(P.w / 19, 13, 19);
        let y = rowY[1] + size * 3;
        g.fillStyle = withAlpha(green, showRes ? 0.13 : 0.05);
        roundRect(g, P.x + 4, y - size * 1.05, P.w - 8, size * 2.1, 10);
        g.fill();
        drawPieces(gcdPieces, P.x + 14, y, size, P.w - 28, 'left');
        y += size * 2.4;
        g.fillStyle = withAlpha(theme.series[4]!, showRes ? 0.11 : 0.04);
        roundRect(g, P.x + 4, y - size * 1.05, P.w - 8, size * 2.1, 10);
        g.fill();
        drawPieces(lcmPieces, P.x + 14, y, size, P.w - 28, 'left');
        y += size * 2.6;
        y = drawSet(ctx.t('divisorsOf'), a, divisors(a), divisors(b), gg, P.x + 12, y, P.w - 24, showRes);
        y = drawSet(ctx.t('divisorsOf'), b, divisors(b), divisors(a), gg, P.x + 12, y + 4, P.w - 24, showRes);
        y = drawMultiples(a, kg, P.x + 12, y + 12, P.w - 24, showRes);
        drawMultiples(b, kg, P.x + 12, y + 4, P.w - 24, showRes);
      } else {
        const H = surface.height;
        drawPieces(gcdPieces, P.x + 6, H - 52, 14, P.w - 12, 'left');
        drawPieces(lcmPieces, P.x + 6, H - 24, 14, P.w - 12, 'left');
      }
      return sorted && u < 1;
    }

    function drawBall(x: number, y: number, r: number, q: number): void {
      const g = surface.g;
      const color = primeColor(q);
      g.save();
      g.shadowColor = ctx.theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.2)';
      g.shadowBlur = 6;
      g.shadowOffsetY = 2;
      const grad = g.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
      grad.addColorStop(0, withAlpha(color, 0.7));
      grad.addColorStop(1, color);
      g.fillStyle = grad;
      g.beginPath();
      g.arc(x, y, r, 0, Math.PI * 2);
      g.fill();
      g.restore();
      text(g, String(q), x, y + 0.5, { font: `800 ${Math.max(9, r * (q >= 10 ? 0.85 : 1.05))}px ${ctx.theme.font}`, color: onColor() });
    }

    /** Teilermenge mit hervorgehobenen gemeinsamen Teilern. */
    function drawSet(name: string, n: number, set: number[], other: number[], gg: number, x: number, y: number, maxW: number, highlight: boolean): number {
      const theme = ctx.theme;
      const pieces: Piece[] = [
        { text: name, color: theme.text, bold: true },
        { text: sub(n), color: theme.text, bold: true },
        { text: ' = { ', color: theme.muted },
      ];
      set.forEach((d, i) => {
        if (i) pieces.push({ text: ', ', color: theme.muted });
        const common = highlight && other.includes(d);
        pieces.push({ text: String(d), color: common ? (d === gg ? theme.series[2]! : theme.text) : theme.muted, bold: common });
      });
      pieces.push({ text: ' }', color: theme.muted });
      return drawWrappedPieces(pieces, x, y, 13, maxW);
    }

    function drawMultiples(n: number, kg: number, x: number, y: number, maxW: number, highlight: boolean): number {
      const theme = ctx.theme;
      const k = kg / n;
      const list = k <= 7 ? Array.from({ length: k + 1 }, (_, i) => n * (i + 1)) : [n, 2 * n, 3 * n, kg];
      const pieces: Piece[] = [
        { text: ctx.t('multiplesSet'), color: theme.text, bold: true },
        { text: sub(n), color: theme.text, bold: true },
        { text: ' = { ', color: theme.muted },
      ];
      list.forEach((m, i) => {
        if (i) pieces.push({ text: k > 7 && i === 3 ? ', …, ' : ', ', color: theme.muted });
        const isK = highlight && m === kg;
        pieces.push({ text: String(m), color: isK ? theme.series[4]! : theme.muted, bold: isK });
      });
      pieces.push({ text: ', … }', color: theme.muted });
      return drawWrappedPieces(pieces, x, y, 13, maxW);
    }

    /** Teile linksbündig mit Zeilenumbruch zeichnen; gibt die y-Position nach dem Block zurück. */
    function drawWrappedPieces(pieces: Piece[], x0: number, y0: number, size: number, maxW: number): number {
      const g = surface.g;
      let x = x0;
      let y = y0;
      for (const q of pieces) {
        const font = `${q.bold ? 800 : 600} ${size}px ${ctx.theme.font}`;
        g.font = font;
        const w = g.measureText(q.text).width;
        if (x + w > x0 + maxW && q.text.trim() !== ',' && x > x0 + 30) {
          x = x0 + 18;
          y += size * 1.45;
        }
        text(g, q.text, x, y, { font, color: q.color, align: 'left' });
        x += w;
      }
      return y + size * 1.5;
    }

    /* ================================================================ */
    /* Ergebnisse                                                       */
    /* ================================================================ */
    function updateReadouts(): void {
      const m = mode();
      const pw = (n: number) =>
        factorPowers(n)
          .map((q) => (q.e > 1 ? `${q.p}<sup>${q.e}</sup>` : String(q.p)))
          .join(' · ');
      if (m === 'baum') {
        const n = p.n;
        ctx.readout('factors', { html: isPrime(n) ? tr('isPrime', { n }) : `${n} = ${primeFactors(n).join(' · ')}${factorPowers(n).some((q) => q.e > 1) ? ` = ${pw(n)}` : ''}` });
        const ds = divisors(n);
        ctx.readout('divisors', tr('divCount', { n, c: ds.length, list: ds.join(', ') }));
      } else {
        ctx.readout('factors', null);
        ctx.readout('divisors', null);
      }
      if (m === 'sieb') {
        ctx.readout('primes', `${sv.primes.join(', ')} (${sv.primes.length})`);
      } else ctx.readout('primes', null);
      if (m === 'ggt') {
        const a = p.a;
        const b = p.b;
        const f = sharedFactors(a, b);
        const gg = gcd(a, b);
        ctx.readout('gcd', `${tr('gcdLabel', { a, b })} = ${f.common.length ? `${f.common.join(' · ')} = ` : ''}${gg}${gg === 1 ? ` (${ctx.t('coprime')})` : ''}`);
        ctx.readout('lcm', `${tr('lcmLabel', { a, b })} = ${[...f.common, ...f.onlyA, ...f.onlyB].sort((x, y) => x - y).join(' · ')} = ${lcm(a, b)}`);
        const da = divisors(a);
        const db = divisors(b);
        const common = da.filter((d) => db.includes(d));
        const T = ctx.t('divisorsOf');
        ctx.readout('common', {
          html: `${T}<sub>${a}</sub> = {${da.join(', ')}}<br>${T}<sub>${b}</sub> = {${db.join(', ')}}<br>${lang === 'de' ? 'gemeinsame Teiler' : 'common divisors'}: {${common.join(', ')}}`,
        });
      } else {
        ctx.readout('gcd', null);
        ctx.readout('lcm', null);
        ctx.readout('common', null);
      }
    }

    function resetMode(source: 'show' | 'reset'): void {
      const m = mode();
      const showAll = source === 'show' && p.show;
      if (m === 'baum') {
        open = new Set();
        born.clear();
        shown.clear();
        autoTree = 0;
        selected = -1;
        if (showAll) openAll(false);
      } else if (m === 'sieb') {
        autoSieve = false;
        tipCell = -1;
        stage = showAll ? finalStage() : 0;
        stageStart = -1e9;
      } else {
        sorted = showAll;
        sortStart = -1e9;
      }
    }

    /* ---------- Zeiger ---------- */
    function hitAt(px: number, py: number): string | null {
      let best: string | null = null;
      let bestD = Infinity;
      for (const h of hits) {
        const d = Math.hypot(h.x - px, h.y - py);
        if (d <= h.r && d < bestD) {
          best = h.id;
          bestD = d;
        }
      }
      return best;
    }

    surface.addTarget({
      contains: (px: number, py: number) => hitAt(px, py) !== null,
      pointerDown: (pt: { px: number; py: number }) => {
        const id = hitAt(pt.px, pt.py);
        if (!id) return false;
        const [kind, arg] = id.split(':');
        const k = Number(arg);
        if (kind === 'node') {
          const node = nodesOf(tree).find((x) => x.id === k);
          if (node) {
            if (node.children && !open.has(node.id)) openNode(node);
            else selected = node.id;
          }
        } else if (kind === 'cell') tipCell = tipCell === k ? -1 : k;
        ctx.requestRender();
        return true;
      },
      pointerMove: () => {},
      pointerUp: () => {},
      hover: (pt: { px: number; py: number } | null) => {
        const id = pt ? hitAt(pt.px, pt.py) : null;
        if (id !== hover) {
          hover = id;
          ctx.requestRender();
        }
        surface.setCursor(id ? 'pointer' : '');
      },
      wheel: () => false,
    });

    // Startzustand
    if (p.show) openAll(false);
    stage = p.show ? finalStage() : 0;

    return {
      update(changed, source) {
        if (changed.has('n') || changed.has('split')) {
          seed = null;
          rebuildTree();
          if (p.show) openAll(source !== 'init');
        }
        if (changed.has('max')) sv = sieve(p.max);
        if (changed.has('max') || changed.has('cols')) {
          autoSieve = false;
          tipCell = -1;
          stage = p.show ? finalStage() : 0;
          stageStart = -1e9;
        }
        if (changed.has('a') || changed.has('b')) {
          sorted = p.show;
          sortStart = p.show && source !== 'init' && !reduced ? performance.now() - SORT_MS * 0.4 : -1e9;
        }
        if (changed.has('show') || (changed.has('mode') && source !== 'init')) resetMode('show');
        updateReadouts();
      },

      action(id) {
        const now = performance.now();
        switch (id) {
          case 'split': {
            if (treeComplete()) {
              open = new Set();
              shown.clear();
              born.clear();
            }
            const node = nextClosed();
            if (node) openNode(node);
            break;
          }
          case 'splitAll':
            if (treeComplete()) {
              open = new Set();
              shown.clear();
              born.clear();
            }
            autoTree = now;
            break;
          case 'other':
            seed = Math.floor(Math.random() * 1e9);
            rebuildTree();
            autoTree = now;
            break;
          case 'sieve':
            autoSieve = false;
            advanceSieve();
            break;
          case 'sieveAll':
            if (stage >= finalStage()) stage = 0;
            autoSieve = true;
            advanceSieve();
            break;
          case 'sort':
            sorted = true;
            sortStart = reduced ? -1e9 : now;
            break;
          case 'reset':
            resetMode('reset');
            break;
        }
        updateReadouts();
        ctx.requestRender();
      },

      render() {
        const now = performance.now();
        const dt = Math.min(0.1, (now - lastFrame) / 1000);
        lastFrame = now;
        hits = [];
        surface.begin();
        let animating = false;
        const m = mode();
        if (m === 'baum') {
          if (autoTree && now - autoTree > 380) {
            const node = nextClosed();
            if (node) {
              openNode(node);
              autoTree = now;
            } else autoTree = 0;
          }
          animating = drawTree(now, dt) || autoTree > 0;
        } else if (m === 'sieb') animating = drawSieve(now);
        else animating = drawGgt(now);
        if (animating) ctx.requestRender();
      },

      destroy: () => surface.destroy(),
    };
  },
});
