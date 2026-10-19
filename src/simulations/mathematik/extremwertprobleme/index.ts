import { defineSimulation, ease, mixColor, Plot, prefersReducedMotion, roundRect, Surface, text, Tween, withAlpha, type Rect } from '../../../sim-core';
import { formula, type FormulaStyle } from './formula';
import {
  boxDeriv,
  boxOptimum,
  boxVolume,
  canDeriv,
  canHeight,
  canOptimum,
  canSurface,
  coneCylHeight,
  coneDeriv,
  coneOptimum,
  coneVolume,
  lifeDeriv,
  lifeOptimum,
  lifeSines,
  lifeTime,
  rectArea,
  rectDeriv,
  rectF,
  rectOptimum,
  secondDeriv,
  type Life,
  type ProbKey,
} from './model';

const L = (de: string, en: string) => ({ de, en });
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const START: Record<ProbKey, number> = { box: 2, can: 3, rect: 0.8, cone: 2, life: 24 };
/** Feste Maße beim Rettungsschwimmer (m): Sand, Wasser, seitlicher Abstand. */
const LIFE = { a: 20, b: 30, d: 60 };
const CONE_R = 6;
const SCAN_MS = 3200;
const FOLD_MS = 2600;

/**
 * Extremwertprobleme mit Differentialrechnung: offene Schachtel aus einem
 * Karton (mit Faltanimation), Dose mit kleinster Oberfläche, Rechteck unter
 * einer e-Funktion, größter Zylinder in einem Kegel und der kürzeste Weg
 * eines Rettungsschwimmers (mit Brechungsgesetz und Wettrennen). Links das
 * Bild, das sich mit der Variablen verändert, darunter der Graph der
 * Zielfunktion mit Tangente und Randwerten und der Streifen der Ableitung
 * mit Vorzeichenwechsel; daneben der Lösungsweg von der Zielfunktion über
 * notwendige und hinreichende Bedingung und den Randwertvergleich bis zum
 * Optimum. „Abtasten“ lässt den Graphen der Zielfunktion durch Probieren
 * entstehen.
 */
export default defineSimulation({
  id: 'extremwertprobleme',
  dragHint: true,
  layout: { aspect: 1.45, aspectNarrow: 0.38 },
  groups: [
    { id: 'data', label: L('Daten', 'Data') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'prob',
      type: 'choice',
      label: L('Problem', 'Problem'),
      options: [
        { value: 'box', label: L('Schachtel aus Karton', 'Box from a sheet of card') },
        { value: 'can', label: L('Dose mit kleinster Oberfläche', 'Can with the smallest surface') },
        { value: 'rect', label: L('Rechteck unter einer e-Funktion', 'Rectangle under an exponential') },
        { value: 'cone', label: L('Größter Zylinder im Kegel', 'Largest cylinder in a cone') },
        { value: 'life', label: L('Rettungsschwimmer: schnellster Weg', 'Lifeguard: fastest route') },
      ],
      default: 'box',
    },
    { key: 'x', type: 'number', label: L('Variable (x, r bzw. u)', 'Variable (x, r or u)'), min: 0, max: 60, step: 0.05, default: 2, help: L('Auch den Punkt auf dem Graphen ziehen.', 'You can also drag the point on the graph.') },
    { key: 'a', type: 'number', group: 'data', label: L('Karton: Länge a', 'Card: length a'), min: 16, max: 40, step: 1, default: 30, unit: 'cm', visibleIf: (v) => v.prob === 'box' },
    { key: 'b', type: 'number', group: 'data', label: L('Karton: Breite b', 'Card: width b'), min: 10, max: 30, step: 1, default: 20, unit: 'cm', visibleIf: (v) => v.prob === 'box' },
    { key: 'v', type: 'number', group: 'data', label: L('Volumen der Dose', 'Volume of the can'), min: 250, max: 2000, step: 50, default: 1000, unit: 'cm³', visibleIf: (v) => v.prob === 'can' },
    { key: 'ch', type: 'number', group: 'data', label: L('Höhe des Kegels', 'Height of the cone'), min: 6, max: 18, step: 1, default: 12, unit: 'cm', visibleIf: (v) => v.prob === 'cone' },
    { key: 'v1', type: 'number', group: 'data', label: L('Laufen auf Sand', 'Running on sand'), min: 2, max: 8, step: 0.5, default: 7, unit: 'm/s', visibleIf: (v) => v.prob === 'life' },
    { key: 'v2', type: 'number', group: 'data', label: L('Schwimmen', 'Swimming'), min: 1, max: 8, step: 0.5, default: 2, unit: 'm/s', visibleIf: (v) => v.prob === 'life' },
    { key: 'der', type: 'boolean', group: 'view', label: L('Ableitung zeigen', 'Show the derivative'), default: true },
    { key: 'show', type: 'boolean', group: 'view', label: L('Lösungsweg zeigen', 'Show the solution'), help: L('Aus: Optimum selbst berechnen.', 'Off: work out the optimum yourself.'), default: true },
  ],
  actions: [
    { id: 'opt', label: L('Zum Optimum', 'Go to the optimum'), primary: true },
    { id: 'scan', label: L('Abtasten', 'Scan') },
    { id: 'fold', label: L('Falten', 'Fold'), visibleIf: (v) => v.prob === 'box' },
    { id: 'race', label: L('Wettrennen', 'Race'), visibleIf: (v) => v.prob === 'life' },
  ],
  readouts: [
    { key: 'cur', label: L('Aktueller Wert', 'Current value'), spoiler: true },
    { key: 'opt', label: L('Optimum', 'Optimum'), spoiler: true },
  ],
  presets: [
    { id: 'box', label: L('Schachtel 30 cm × 20 cm', 'Box 30 cm × 20 cm'), values: {} },
    { id: 'square', label: L('Quadratischer Karton', 'Square sheet'), values: { prob: 'box', a: 24, b: 24, x: 2 } },
    { id: 'can', label: L('1-Liter-Dose', '1-litre can'), values: { prob: 'can', v: 1000, x: 3 } },
    { id: 'can330', label: L('Getränkedose 330 ml', 'Drinks can 330 ml'), values: { prob: 'can', v: 350, x: 3.3 } },
    { id: 'rect', label: L('Rechteck unter 3e^(−0,5x)', 'Rectangle under 3e^(−0.5x)'), values: { prob: 'rect', x: 0.8 } },
    { id: 'cone', label: L('Zylinder im Kegel', 'Cylinder in a cone'), values: { prob: 'cone', ch: 12, x: 2 } },
    { id: 'life', label: L('Rettungsschwimmer', 'Lifeguard'), values: { prob: 'life', v1: 7, v2: 2, x: 24 } },
    { id: 'lifeEq', label: L('Gleich schnell: gerade Linie', 'Equal speeds: straight line'), values: { prob: 'life', v1: 4, v2: 4, x: 40 } },
  ],
  strings: {
    de: {
      canvas: 'Links ein Bild des Problems (Karton mit ausgeschnittenen Ecken und Schachtel, Dose, Rechteck unter einem Graphen, Zylinder im Kegel oder Strand mit Laufweg), das sich mit der Variablen ändert; darunter der Graph der Zielfunktion mit ziehbarem Punkt, Tangente und Randwerten und der Graph der Ableitung mit Vorzeichen. Daneben der Lösungsweg.',
      stepsT: 'Lösungsweg',
      s1: '1. Zielfunktion',
      s2: '2. Nebenbedingung',
      s3: '3. Definitionsbereich',
      s4: '4. Notwendige Bedingung',
      s5: '5. Hinreichende Bedingung',
      s6: '6. Ränder',
      s7: '7. Ergebnis',
      goal: 'Zielfunktion',
      deriv: 'Ableitung',
      box1: 'V = Länge · Breite · Höhe',
      box2: 'Höhe x; Länge a − 2x, Breite b − 2x',
      can2: 'V = πr²h  ⇒  h = V/(πr²)',
      rect1: 'A = Breite · Höhe',
      rect2: 'Ecke auf dem Graphen: Höhe = f(u)',
      cone1: 'V = πr² · h',
      cone2: 'Strahlensatz: h = H · (1 − r/R)',
      life1: 'T = Laufzeit + Schwimmzeit',
      life2: 'Wege mit Pythagoras',
      numeric: 'numerisch',
      snell: 'Brechungsgesetz',
      max: 'Maximum',
      min: 'Minimum',
      inf: 'O → ∞ für r → 0 und r → ∞',
      zeroEnds: 'Randwerte 0 – kleiner als im Innern',
      rectEnds: 'A(0) = 0 und A(u) → 0 für u → ∞',
      worse: 'größer als im Innern',
      vzw_max: 'Vorzeichen + → −',
      vzw_min: 'Vorzeichen − → +',
      sheet: 'Karton',
      box: 'Schachtel',
      can: 'Dose',
      cone: 'Kegel: R = 6 cm, H = {h} cm',
      sand: 'Sand',
      water: 'Wasser',
      guard: 'Rettungsschwimmer',
      person: 'Person',
      straight: 'gerade Linie',
      chosen: 'gewählter Weg',
      optimal: 'schnellster Weg',
      race: 'Zeit',
    },
    en: {
      canvas: 'Left: a picture of the problem (sheet with cut-out corners and box, can, rectangle under a graph, cylinder in a cone or beach with route) that changes with the variable; below it the graph of the objective function with a draggable point, tangent and boundary values, and the graph of the derivative with its sign. Next to it the solution.',
      stepsT: 'Solution',
      s1: '1. Objective function',
      s2: '2. Constraint',
      s3: '3. Domain',
      s4: '4. Necessary condition',
      s5: '5. Sufficient condition',
      s6: '6. Boundaries',
      s7: '7. Result',
      goal: 'objective',
      deriv: 'derivative',
      box1: 'V = length · width · height',
      box2: 'height x; length a − 2x, width b − 2x',
      can2: 'V = πr²h  ⇒  h = V/(πr²)',
      rect1: 'A = width · height',
      rect2: 'corner on the graph: height = f(u)',
      cone1: 'V = πr² · h',
      cone2: 'intercept theorem: h = H · (1 − r/R)',
      life1: 'T = running time + swimming time',
      life2: 'distances by Pythagoras',
      numeric: 'numerically',
      snell: 'law of refraction',
      max: 'maximum',
      min: 'minimum',
      inf: 'S → ∞ for r → 0 and r → ∞',
      zeroEnds: 'boundary values 0 – smaller than inside',
      rectEnds: 'A(0) = 0 and A(u) → 0 for u → ∞',
      worse: 'larger than inside',
      vzw_max: 'sign + → −',
      vzw_min: 'sign − → +',
      sheet: 'sheet',
      box: 'box',
      can: 'can',
      cone: 'cone: R = 6 cm, H = {h} cm',
      sand: 'sand',
      water: 'water',
      guard: 'lifeguard',
      person: 'swimmer',
      straight: 'straight line',
      chosen: 'chosen route',
      optimal: 'fastest route',
      race: 'time',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const reduced = prefersReducedMotion();
    const th = () => ctx.theme;
    const wideLayout = () => surface.width >= 640 || surface.width >= surface.height * 1.3;
    const F = (w: number, n: number) => (surface.width >= 640 ? w : n);
    const font = (weight: number, size: number) => `${weight} ${size}px ${th().font}`;
    const prob = () => p.prob as ProbKey;
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (m, k: string) => String(vars[k] ?? m));
    const n2 = (v: number) => fmt.num(v, 2);
    const n1 = (v: number) => fmt.num(v, 1);
    const Q = (s: string) => (p.show ? s : '?');

    const col = {
      Z: () => th().series[0]!,
      x: () => th().series[3]!,
      cut: () => th().series[1]!,
      opt: () => th().series[2]!,
      fill: () => th().series[4]!,
      tan: () => th().series[5]!,
    };

    /* ---------- Problemdaten ---------- */
    const life = (): Life => ({ ...LIFE, v1: p.v1, v2: p.v2 });
    const cone = () => ({ R: CONE_R, H: p.ch });
    function domain(): [number, number] {
      switch (prob()) {
        case 'box':
          return [0, Math.min(p.a, p.b) / 2];
        case 'can':
          return [0.5, 12];
        case 'rect':
          return [0, 7];
        case 'cone':
          return [0, CONE_R];
        case 'life':
          return [0, LIFE.d];
      }
    }
    /** Ränder gehören beim Rettungsschwimmer zum Definitionsbereich. */
    const closed = () => prob() === 'life';
    function Z(x: number): number {
      switch (prob()) {
        case 'box':
          return boxVolume({ a: p.a, b: p.b }, x);
        case 'can':
          return canSurface(p.v, x);
        case 'rect':
          return rectArea(x);
        case 'cone':
          return coneVolume(cone(), x);
        case 'life':
          return lifeTime(life(), x);
      }
    }
    function dZ(x: number): number {
      switch (prob()) {
        case 'box':
          return boxDeriv({ a: p.a, b: p.b }, x);
        case 'can':
          return canDeriv(p.v, x);
        case 'rect':
          return rectDeriv(x);
        case 'cone':
          return coneDeriv(cone(), x);
        case 'life':
          return lifeDeriv(life(), x);
      }
    }
    function xOpt(): number {
      switch (prob()) {
        case 'box':
          return boxOptimum({ a: p.a, b: p.b });
        case 'can':
          return canOptimum(p.v);
        case 'rect':
          return rectOptimum;
        case 'cone':
          return coneOptimum(cone());
        case 'life':
          return lifeOptimum(life());
      }
    }
    const isMin = () => prob() === 'can' || prob() === 'life';
    const margin = () => (closed() ? 0 : 0.05);
    const xEff = () => {
      const [lo, hi] = domain();
      return clamp(p.x, lo + margin(), hi - margin());
    };
    const varName = () => (prob() === 'can' || prob() === 'cone' ? 'r' : prob() === 'rect' ? 'u' : 'x');
    const zName = () => ({ box: 'V', can: 'O', rect: 'A', cone: 'V', life: 'T' })[prob()];
    const unitZ = () => ({ box: 'cm³', can: 'cm²', rect: 'FE', cone: 'cm³', life: 's' })[prob()];
    const unitX = () => ({ box: 'cm', can: 'cm', rect: 'LE', cone: 'cm', life: 'm' })[prob()];
    const zDigits = () => (prob() === 'life' || prob() === 'rect' ? 2 : 1);
    const nz = (v: number) => fmt.num(v, zDigits());

    /* ---------- Aufteilung ---------- */
    function regions(): { pic: Rect; graph: Rect; der: Rect | null; col: Rect } {
      const w = surface.width;
      const h = surface.height;
      let left: Rect;
      let colR: Rect;
      if (!wideLayout()) {
        const ph = Math.round(clamp(w * 1.45, 360, h * 0.6));
        left = { x: 0, y: 0, w, h: ph };
        colR = { x: 2, y: ph + 6, w: w - 4, h: h - ph - 8 };
      } else {
        const cw = Math.round(clamp(w * 0.37, 270, 370));
        left = { x: 0, y: 0, w: w - cw - 10, h };
        colR = { x: w - cw, y: 2, w: cw - 2, h: h - 4 };
      }
      const t1 = Math.round(left.h * 0.45);
      const rest = left.h - t1 - 6;
      const gh = p.der ? Math.round(rest * 0.66) : rest;
      const graph = { x: left.x, y: left.y + t1 + 6, w: left.w, h: gh };
      const der = p.der ? { x: left.x, y: graph.y + gh + 4, w: left.w, h: rest - gh - 4 } : null;
      return { pic: { ...left, h: t1 }, graph, der, col: colR };
    }
    const plot = new Plot(surface, { x: [0, 10], y: [0, 1000], equalAspect: false, pan: false, zoom: false, controls: false, region: () => regions().graph, xAxis: { label: '' }, yAxis: { label: '' } });
    const plotD = new Plot(surface, { x: [0, 10], y: [-1, 1], equalAspect: false, pan: false, zoom: false, controls: false, region: () => regions().der ?? { x: 0, y: 0, w: 1, h: 1 }, xAxis: { label: '' }, yAxis: { label: '' } });

    /* ---------- Zustand ---------- */
    let shownX = reduced ? xEff() : domain()[0] + (domain()[1] - domain()[0]) * 0.04;
    let lastFrame = performance.now();
    let dragging = 0;
    const toOpt = new Tween(1400, ease.inOutCubic);
    let optFrom = shownX;
    let optEnd = false;
    const scan = new Tween(SCAN_MS, ease.inOutCubic);
    const fold = new Tween(FOLD_MS, ease.linear);
    const race = new Tween(6000, ease.linear);
    /** Rennzeiten (s): gewählter Weg, gerade Linie, Optimum. */
    let raceT = { cur: 1, straight: 1, opt: 1, x: 0 };
    /** Endstand des Rennens bleibt stehen, bis sich etwas ändert. */
    let raceOn = false;

    const busy = () => toOpt.running || scan.running || race.running;
    const snapX = (x: number) => (prob() === 'life' ? Math.round(x * 2) / 2 : Math.round(x * 20) / 20);
    for (const pl of [plot, plotD]) {
      pl.addHandle({
        get: () => [shownX, pl === plot ? Z(shownX) : 0],
        set: (x) => {
          dragging = performance.now();
          const [lo, hi] = domain();
          ctx.set({ x: clamp(snapX(x), lo + margin(), hi - margin()) });
        },
        axis: 'x',
        enabled: () => !ctx.locked && !busy() && (pl === plot || !!p.der),
        color: () => col.x(),
      });
    }

    /* ---------- Ergebnisse ---------- */
    function updateReadouts(): void {
      const x = xEff();
      const d = zDigits();
      const eq = (v: number, k: number) => (Math.abs(v - Math.round(v * 10 ** k) / 10 ** k) < 1e-9 ? '=' : '≈');
      ctx.readout('cur', `${varName()} = ${n2(x)} ${unitX()}: ${zName()} ${eq(Z(x), d)} ${nz(Z(x))} ${unitZ()}`);
      const xo = xOpt();
      ctx.readout('opt', `${varName()} ${eq(xo, 2)} ${n2(xo)} ${unitX()}: ${zName()} ${eq(Z(xo), d)} ${nz(Z(xo))} ${unitZ()}`);
    }

    /* ---------- Bausteine ---------- */
    function card(r: Rect, accent?: string, tint = 0): void {
      const g = surface.g;
      const theme = th();
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.10)';
      g.shadowBlur = 12;
      g.shadowOffsetY = 3;
      g.fillStyle = theme.dark ? '#151c27' : '#ffffff';
      roundRect(g, r.x, r.y, r.w, r.h, 12);
      g.fill();
      g.restore();
      if (accent && tint > 0) {
        g.fillStyle = withAlpha(accent, theme.dark ? tint * 1.6 : tint);
        roundRect(g, r.x, r.y, r.w, r.h, 12);
        g.fill();
      }
      g.strokeStyle = accent ? withAlpha(accent, 0.55) : theme.dark ? '#273142' : '#e3e8ef';
      g.lineWidth = 1.2;
      roundRect(g, r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1, 12);
      g.stroke();
    }
    function title(x: number, y: number, label: string, color = th().muted): void {
      text(surface.g, label, x, y, { font: font(700, F(12, 11)), color, align: 'left' });
    }
    const fstyle = (size: number, color = th().text, weight = 600): FormulaStyle => ({
      size,
      font: th().font,
      mathFont: th().mathFont,
      color,
      weight,
      palette: { z: col.Z(), x: col.x(), o: col.opt(), c: col.cut(), m: th().muted },
    });
    function fitFormula(src: string, maxW: number, size: number, color = th().text, weight = 600) {
      const g = surface.g;
      let s = size;
      let box = formula(g, src, fstyle(s, color, weight));
      while (box.w > maxW && s > 9) {
        s -= 0.5;
        box = formula(g, src, fstyle(s, color, weight));
      }
      return box;
    }
    function label(x: number, y: number, str: string, color: string, align: CanvasTextAlign = 'center', size = F(12, 11)): void {
      const g = surface.g;
      g.save();
      g.font = font(700, size);
      g.textAlign = align;
      g.textBaseline = 'middle';
      g.lineJoin = 'round';
      g.lineWidth = 4;
      g.strokeStyle = th().bg;
      g.strokeText(str, x, y);
      g.fillStyle = color;
      g.fillText(str, x, y);
      g.restore();
    }
    function poly(pts: [number, number][], fill: string | null, stroke: string | null, lw = 1.4): void {
      const g = surface.g;
      g.beginPath();
      g.moveTo(...pts[0]!);
      for (const q of pts.slice(1)) g.lineTo(...q);
      g.closePath();
      if (fill) {
        g.fillStyle = fill;
        g.fill();
      }
      if (stroke) {
        g.strokeStyle = stroke;
        g.lineWidth = lw;
        g.stroke();
      }
    }

    /* ---------- Bilder ---------- */
    function drawBox(R: Rect): void {
      const g = surface.g;
      const theme = th();
      const { a, b } = p;
      const x = shownX;
      // Karton (links, Draufsicht)
      const sheetW = R.w * 0.42;
      const sc = Math.min((sheetW - 30) / a, (R.h - 50) / b);
      const sx = R.x + 20;
      const sy = R.y + (R.h - b * sc) / 2 + 6;
      g.fillStyle = withAlpha(col.fill(), theme.dark ? 0.22 : 0.14);
      g.fillRect(sx, sy, a * sc, b * sc);
      g.strokeStyle = theme.text;
      g.lineWidth = 1.6;
      g.strokeRect(sx, sy, a * sc, b * sc);
      g.fillStyle = withAlpha(col.cut(), theme.dark ? 0.5 : 0.35);
      for (const [cx, cy] of [
        [0, 0],
        [a - x, 0],
        [0, b - x],
        [a - x, b - x],
      ] as const) {
        g.fillRect(sx + cx * sc, sy + cy * sc, x * sc, x * sc);
      }
      g.save();
      g.setLineDash([4, 4]);
      g.strokeStyle = withAlpha(theme.text, 0.5);
      g.beginPath();
      g.moveTo(sx + x * sc, sy);
      g.lineTo(sx + x * sc, sy + b * sc);
      g.moveTo(sx + (a - x) * sc, sy);
      g.lineTo(sx + (a - x) * sc, sy + b * sc);
      g.moveTo(sx, sy + x * sc);
      g.lineTo(sx + a * sc, sy + x * sc);
      g.moveTo(sx, sy + (b - x) * sc);
      g.lineTo(sx + a * sc, sy + (b - x) * sc);
      g.stroke();
      g.restore();
      label(sx + (a * sc) / 2, sy - 10, `a = ${n1(a)} cm`, theme.muted);
      label(sx - 4, sy + (b * sc) / 2, `b`, theme.muted, 'right');
      label(sx + (x * sc) / 2, sy + (x * sc) / 2, 'x', col.cut());
      text(g, ctx.t('sheet'), sx, R.y + 12, { font: font(700, F(12, 11)), color: theme.muted, align: 'left' });

      // Schachtel (rechts, Schrägbild) – die Seitenlaschen klappen beim Falten hoch
      const L0 = a - 2 * x;
      const B0 = b - 2 * x;
      const phi = fold.running ? (Math.PI / 2) * ease.inOutCubic(clamp(fold.t * 1.25 - 0.1, 0, 1)) : Math.PI / 2;
      const k = 0.36;
      const bx0 = R.x + R.w * 0.47;
      const bw = R.w * 0.51;
      const c = Math.cos(phi) * x;
      const s = Math.sin(phi) * x;
      // Maßstab nach der aktuellen Ausdehnung (flach größer als gefaltet), höchstens 1,6-mal der Karton
      const ew = L0 + 2 * c + (B0 + 2 * c) * k;
      const eh = s + (B0 + 2 * c) * k;
      const sc2 = Math.min((bw - 30) / ew, (R.h - 60) / eh, sc * 1.6);
      const ox = bx0 + (bw - ew * sc2) / 2 + c * sc2;
      const oy = R.y + R.h - 30 - c * k * sc2;
      const P = (u: number, v: number, w: number): [number, number] => [ox + (u + v * k) * sc2, oy - (w + v * k) * sc2];
      const al = (v: number) => withAlpha(col.fill(), theme.dark ? v * 1.3 : v);
      const st = theme.text;
      // Malreihenfolge: hinten, links, Boden, rechts, vorne
      poly([P(0, B0, 0), P(L0, B0, 0), P(L0, B0 + c, s), P(0, B0 + c, s)], al(0.2), st);
      poly([P(0, 0, 0), P(0, B0, 0), P(-c, B0, s), P(-c, 0, s)], al(0.26), st);
      poly([P(0, 0, 0), P(L0, 0, 0), P(L0, B0, 0), P(0, B0, 0)], al(0.12), st);
      poly([P(L0, 0, 0), P(L0, B0, 0), P(L0 + c, B0, s), P(L0 + c, 0, s)], al(0.32), st);
      poly([P(0, 0, 0), P(L0, 0, 0), P(L0, -c, s), P(0, -c, s)], al(0.38), st);
      const [lx, ly] = P(L0 / 2, -c, 0);
      label(lx, ly + 12, `${n1(L0)} cm`, theme.muted);
      const [hx, hy] = P(L0 + c, 0, s / 2);
      label(hx + 6, hy, `x = ${n2(x)}`, col.cut(), 'left');
      text(g, ctx.t('box'), bx0 + 10, R.y + 12, { font: font(700, F(12, 11)), color: theme.muted, align: 'left' });
    }

    function drawCan(R: Rect): void {
      const g = surface.g;
      const theme = th();
      const r = shownX;
      const h = canHeight(p.v, r);
      const maxW = 2 * 12;
      const maxH = canHeight(p.v, 2.2);
      const sc = Math.min((R.w * 0.8) / maxW, (R.h - 50) / Math.min(maxH, 40));
      const cx = R.x + R.w / 2;
      const yb = R.y + R.h - 24;
      const hw = r * sc;
      const hh = Math.min(h * sc, R.h - 50);
      const e = Math.max(4, hw * 0.25);
      g.fillStyle = withAlpha(col.fill(), theme.dark ? 0.3 : 0.2);
      g.beginPath();
      g.ellipse(cx, yb, hw, e, 0, 0, Math.PI);
      g.lineTo(cx - hw, yb - hh);
      g.ellipse(cx, yb - hh, hw, e, 0, Math.PI, 0, true);
      g.closePath();
      g.fill();
      g.strokeStyle = theme.text;
      g.lineWidth = 1.6;
      g.beginPath();
      g.ellipse(cx, yb - hh, hw, e, 0, 0, Math.PI * 2);
      g.moveTo(cx - hw, yb - hh);
      g.lineTo(cx - hw, yb);
      g.ellipse(cx, yb, hw, e, 0, Math.PI, 0, true);
      g.lineTo(cx + hw, yb - hh);
      g.stroke();
      g.strokeStyle = col.cut();
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(cx, yb - hh);
      g.lineTo(cx + hw, yb - hh);
      g.stroke();
      label(cx + hw / 2, yb - hh - 12, `r = ${n2(r)} cm`, col.cut());
      label(cx + hw + 10, yb - hh / 2, `h ≈ ${n2(h)} cm${h * sc > R.h - 50 ? ' (…)' : ''}`, theme.muted, 'left');
      text(g, `${ctx.t('can')}: V = ${fmt.num(p.v, 0)} cm³`, R.x + 12, R.y + 12, { font: font(700, F(12, 11)), color: theme.muted, align: 'left' });
    }

    function drawRect(R: Rect): void {
      const g = surface.g;
      const theme = th();
      const u = shownX;
      const X0 = R.x + 30;
      const Y0 = R.y + R.h - 20;
      const sx = (R.w - 50) / 7;
      const sy = (R.h - 40) / 3.3;
      const P = (x: number, y: number): [number, number] => [X0 + x * sx, Y0 - y * sy];
      g.strokeStyle = withAlpha(theme.text, 0.5);
      g.lineWidth = 1.2;
      g.beginPath();
      g.moveTo(...P(0, 0));
      g.lineTo(...P(7, 0));
      g.moveTo(...P(0, 0));
      g.lineTo(...P(0, 3.2));
      g.stroke();
      const [r0x, r0y] = P(0, rectF(u));
      const [r1x, r1y] = P(u, 0);
      g.fillStyle = withAlpha(col.fill(), theme.dark ? 0.35 : 0.25);
      g.fillRect(r0x, r0y, r1x - r0x, r1y - r0y);
      g.strokeStyle = col.cut();
      g.lineWidth = 2;
      g.strokeRect(r0x, r0y, r1x - r0x, r1y - r0y);
      g.strokeStyle = col.Z();
      g.lineWidth = 2.6;
      g.beginPath();
      for (let i = 0; i <= 100; i++) {
        const x = (7 * i) / 100;
        const [qx, qy] = P(x, rectF(x));
        if (i) g.lineTo(qx, qy);
        else g.moveTo(qx, qy);
      }
      g.stroke();
      g.beginPath();
      g.arc(...P(u, rectF(u)), 5, 0, Math.PI * 2);
      g.fillStyle = col.x();
      g.fill();
      label(...P(5, rectF(5) + 0.45), 'f(x) = 3e^(−0,5x)', col.Z());
      label(...P(u / 2, -0.25), `u = ${n2(u)}`, col.cut());
    }

    function drawCone(R: Rect): void {
      const g = surface.g;
      const theme = th();
      const { R: CR, H } = cone();
      const r = shownX;
      const hc = coneCylHeight(cone(), r);
      const sc = Math.min((R.w * 0.62) / (2 * CR), (R.h - 56) / Math.max(H, 9));
      const cx = R.x + R.w * 0.42;
      const yb = R.y + R.h - 26;
      const e = (rr: number) => Math.max(2, rr * sc * 0.22);
      // Kegel
      g.fillStyle = withAlpha(col.Z(), theme.dark ? 0.12 : 0.07);
      g.beginPath();
      g.moveTo(cx, yb - H * sc);
      g.lineTo(cx - CR * sc, yb);
      g.ellipse(cx, yb, CR * sc, e(CR), 0, Math.PI, 0, true);
      g.closePath();
      g.fill();
      g.strokeStyle = withAlpha(theme.text, 0.75);
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(cx - CR * sc, yb);
      g.lineTo(cx, yb - H * sc);
      g.lineTo(cx + CR * sc, yb);
      g.ellipse(cx, yb, CR * sc, e(CR), 0, 0, Math.PI);
      g.stroke();
      g.save();
      g.setLineDash([4, 4]);
      g.beginPath();
      g.ellipse(cx, yb, CR * sc, e(CR), 0, Math.PI, Math.PI * 2);
      g.stroke();
      g.restore();
      // Zylinder
      const top = yb - hc * sc;
      g.fillStyle = withAlpha(col.fill(), theme.dark ? 0.4 : 0.28);
      g.beginPath();
      g.ellipse(cx, yb, r * sc, e(r), 0, 0, Math.PI);
      g.lineTo(cx - r * sc, top);
      g.ellipse(cx, top, r * sc, e(r), 0, Math.PI, 0, true);
      g.closePath();
      g.fill();
      g.strokeStyle = col.fill();
      g.lineWidth = 2;
      g.beginPath();
      g.ellipse(cx, top, r * sc, e(r), 0, 0, Math.PI * 2);
      g.moveTo(cx - r * sc, top);
      g.lineTo(cx - r * sc, yb);
      g.ellipse(cx, yb, r * sc, e(r), 0, Math.PI, 0, true);
      g.lineTo(cx + r * sc, top);
      g.stroke();
      // Maße: r und h, Strahlensatz-Dreieck
      g.strokeStyle = col.cut();
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(cx, top);
      g.lineTo(cx + r * sc, top);
      g.stroke();
      label(cx + (r * sc) / 2, top - 12, `r = ${n2(r)}`, col.cut());
      g.strokeStyle = col.x();
      g.beginPath();
      g.moveTo(cx + r * sc + 10, yb);
      g.lineTo(cx + r * sc + 10, top);
      g.stroke();
      label(cx + r * sc + 16, yb - (hc * sc) / 2, `h = ${n2(hc)}`, col.x(), 'left');
      text(g, tr('cone', { h: fmt.num(H, 0) }), R.x + 12, R.y + 12, { font: font(700, F(12, 11)), color: theme.muted, align: 'left' });
    }

    function drawLife(R: Rect): void {
      const g = surface.g;
      const theme = th();
      const l = life();
      const x = shownX;
      const pad = 18;
      const sc = Math.min((R.w - 2 * pad - 40) / l.d, (R.h - 40) / (l.a + l.b));
      const X0 = R.x + (R.w - l.d * sc) / 2;
      const ys = R.y + 22 + l.a * sc;
      const P = (u: number, v: number): [number, number] => [X0 + u * sc, ys + v * sc];
      // Sand und Wasser
      g.fillStyle = withAlpha(col.x(), theme.dark ? 0.16 : 0.12);
      g.fillRect(R.x + 4, R.y + 4, R.w - 8, ys - R.y - 4);
      g.fillStyle = withAlpha(col.tan(), theme.dark ? 0.22 : 0.16);
      g.fillRect(R.x + 4, ys, R.w - 8, R.y + R.h - 4 - ys);
      g.strokeStyle = withAlpha(col.tan(), 0.8);
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(R.x + 4, ys);
      g.lineTo(R.x + R.w - 4, ys);
      g.stroke();
      const sf = font(700, F(11, 10));
      text(g, ctx.t('sand'), R.x + R.w - 12, R.y + 14, { font: sf, color: mixColor(col.x(), theme.text, 0.3), align: 'right' });
      text(g, ctx.t('water'), R.x + R.w - 12, R.y + R.h - 14, { font: sf, color: mixColor(col.tan(), theme.text, 0.3), align: 'right' });
      const A = P(0, -l.a);
      const S = P(l.d, l.b);
      // gerade Linie
      g.save();
      g.setLineDash([5, 5]);
      g.strokeStyle = withAlpha(theme.muted, 0.8);
      g.lineWidth = 1.4;
      g.beginPath();
      g.moveTo(...A);
      g.lineTo(...S);
      g.stroke();
      g.restore();
      // Optimum
      const xo = xOpt();
      if (p.show) {
        g.strokeStyle = withAlpha(col.opt(), 0.65);
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(...A);
        g.lineTo(...P(xo, 0));
        g.lineTo(...S);
        g.stroke();
      }
      // gewählter Weg
      const E = P(x, 0);
      g.strokeStyle = col.cut();
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(...A);
      g.lineTo(...E);
      g.lineTo(...S);
      g.stroke();
      // Lot und Winkel
      g.save();
      g.setLineDash([3, 3]);
      g.strokeStyle = theme.muted;
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(E[0], E[1] - 34);
      g.lineTo(E[0], E[1] + 34);
      g.stroke();
      g.restore();
      const a1 = Math.atan2(x, l.a);
      const a2 = Math.atan2(l.d - x, l.b);
      g.strokeStyle = col.x();
      g.lineWidth = 1.6;
      g.beginPath();
      g.arc(E[0], E[1], 22, -Math.PI / 2 - a1, -Math.PI / 2);
      g.stroke();
      g.strokeStyle = col.tan();
      g.beginPath();
      g.arc(E[0], E[1], 22, Math.PI / 2 - a2, Math.PI / 2);
      g.stroke();
      label(E[0] - 12, E[1] - 30, 'α₁', col.x(), 'right', F(11, 10));
      label(E[0] + 12, E[1] + 30, 'α₂', mixColor(col.tan(), theme.text, 0.2), 'left', F(11, 10));
      label(E[0], E[1] + 12, `x = ${n1(x)} m`, col.cut(), 'center', F(11, 10));
      // Personen
      for (const [pt, c, name, al] of [
        [A, col.x(), ctx.t('guard'), 'left'],
        [S, col.Z(), ctx.t('person'), 'right'],
      ] as const) {
        g.fillStyle = c;
        g.beginPath();
        g.arc(pt[0], pt[1], 6, 0, Math.PI * 2);
        g.fill();
        label(pt[0] + (al === 'left' ? 10 : -10), pt[1], name, c, al === 'left' ? 'left' : 'right', F(11, 10));
      }
      label(A[0] - 8, (A[1] + ys) / 2, `${l.a} m`, theme.muted, 'right', 10);
      label(S[0] + 8, (S[1] + ys) / 2, `${l.b} m`, theme.muted, 'left', 10);
      label((A[0] + S[0]) / 2, R.y + R.h - 14, `${l.d} m`, theme.muted, 'center', 10);
      // Wettrennen: Punkte laufen mit maßstäblicher Zeit
      if (raceOn) {
        const tNow = race.value * raceT.cur * 1.15;
        const at = (xe: number, tt: number): [number, number] => {
          const d1 = Math.hypot(l.a, xe);
          const t1 = d1 / l.v1;
          const Ep = P(xe, 0);
          if (tt <= t1) return [lerp(A[0], Ep[0], tt / t1), lerp(A[1], Ep[1], tt / t1)];
          const t2 = Math.hypot(l.b, l.d - xe) / l.v2;
          const f = clamp((tt - t1) / t2, 0, 1);
          return [lerp(Ep[0], S[0], f), lerp(Ep[1], S[1], f)];
        };
        const racers: [number, string][] = [[(l.a * l.d) / (l.a + l.b), theme.muted]];
        if (p.show) racers.push([xo, col.opt()]);
        racers.push([raceT.x, col.cut()]);
        for (const [xe, c] of racers) {
          g.fillStyle = c;
          g.strokeStyle = theme.bg;
          g.lineWidth = 2;
          g.beginPath();
          g.arc(...at(xe, tNow), 6.5, 0, Math.PI * 2);
          g.fill();
          g.stroke();
        }
        text(g, `${ctx.t('race')}: ${n1(Math.min(tNow, raceT.cur * 1.15))} s`, R.x + 12, R.y + 14, { font: font(700, F(12, 11)), color: theme.text, align: 'left' });
        // Legende
        const lf = font(700, 10);
        let lx = R.x + 12;
        for (const [c, name] of [
          [col.cut(), ctx.t('chosen')],
          [theme.muted, ctx.t('straight')],
          ...(p.show ? [[col.opt(), ctx.t('optimal')] as const] : []),
        ] as const) {
          g.fillStyle = c;
          g.beginPath();
          g.arc(lx + 4, R.y + 32, 4, 0, Math.PI * 2);
          g.fill();
          g.font = lf;
          text(g, name, lx + 11, R.y + 32, { font: lf, color: c, align: 'left' });
          lx += 18 + g.measureText(name).width;
        }
      }
    }
    /* ---------- Graph der Zielfunktion ---------- */
    function yRange(): [number, number] {
      const [lo, hi] = domain();
      let yMax = -Infinity;
      let yMin = Infinity;
      for (let i = 0; i <= 100; i++) {
        const v = Z(lo + ((hi - lo) * clamp(i, 1, 99)) / 100);
        yMax = Math.max(yMax, v);
        yMin = Math.min(yMin, v);
      }
      if (prob() === 'can') return [0, Math.min(yMax, yMin * 3) * 1.12];
      if (prob() === 'life') {
        const pad = (yMax - yMin) * 0.15;
        return [Math.max(0, yMin - pad * 2), yMax + pad];
      }
      return [0, yMax * 1.12];
    }
    function drawGraph(): void {
      const g = surface.g;
      const theme = th();
      const [lo, hi] = domain();
      plot.setRangePadded([lo, hi], yRange(), { left: F(46, 40), bottom: F(24, 22), top: 22, right: 14 });
      plot.begin();
      plot.grid();
      plot.axes();
      const r = plot.rect;
      const x = shownX;
      const eps = closed() ? 0 : 1e-3;
      // Abtasten: Graph entsteht nur bis zur aktuellen Stelle, Probierpunkte bleiben stehen
      const to = scan.running ? x : hi - eps;
      if (scan.running) {
        for (let i = 0; i <= 12; i++) {
          const xs = lo + ((hi - lo) * (i + 0.5)) / 13;
          if (xs > x) break;
          plot.point(xs, Z(xs), { color: withAlpha(col.Z(), 0.6), radius: 3.5 });
        }
      }
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.6)' : mixColor(col.Z(), '#ffffff', 0.5, 0.6);
      g.shadowBlur = 5;
      plot.fn(Z, { color: col.Z(), width: 3, from: lo + eps, to });
      g.restore();
      const m = dZ(x);
      const span = (hi - lo) * 0.12;
      plot.segment([x - span, Z(x) - m * span], [x + span, Z(x) + m * span], { color: col.tan(), width: 2 });
      if (p.show && !scan.running) {
        const xo = xOpt();
        plot.vline(xo, { color: withAlpha(col.opt(), 0.5), width: 1.4, dash: [5, 4] });
        plot.point(xo, Z(xo), { color: col.opt(), radius: 5.5, hollow: true });
        // Randwerte
        if (closed()) for (const xe of [lo, hi]) plot.point(xe, Z(xe), { color: col.cut(), radius: 5 });
        else if (prob() !== 'can') for (const xe of [lo, hi]) plot.point(xe, Z(xe), { color: col.cut(), radius: 4, hollow: true });
      }
      plot.point(x, Z(x), { color: col.x(), radius: 6.5 });
      const zn = zName();
      const vn = varName();
      text(g, `${ctx.t('goal')}: ${zn}(${vn}) in ${unitZ()}`, plot.px(lo) + 8, r.y + 10, { font: font(700, F(12, 11)), color: col.Z(), align: 'left' });
      if (!p.der) text(g, `${vn} in ${unitX()}`, r.x + r.w - 4, plot.py(yRange()[0]) - 12, { font: font(600, F(11, 10)), color: theme.muted, align: 'right' });
      const [px, py] = plot.toPx(x, Z(x));
      label(clamp(px, r.x + 50, r.x + r.w - 50), py - 16, `${zn} ≈ ${nz(Z(x))}`, col.x());
      plot.end();
    }

    /** Streifen mit dem Graphen der Ableitung: grün positiv, rot negativ. */
    function drawDeriv(): void {
      const g = surface.g;
      const theme = th();
      const [lo, hi] = domain();
      let mx = 0;
      for (let i = 10; i <= 90; i++) mx = Math.max(mx, Math.abs(dZ(lo + ((hi - lo) * i) / 100)));
      mx = mx || 1;
      plotD.setRangePadded([lo, hi], [-mx * 1.1, mx * 1.1], { left: F(46, 40), bottom: F(20, 18), top: 6, right: 14 });
      plotD.begin();
      plotD.axes();
      const r = plotD.rect;
      const yc = (v: number) => clamp(v, -mx * 1.6, mx * 1.6);
      const eps = closed() ? 0 : 1e-3;
      const to = scan.running ? shownX : hi - eps;
      plotD.fillBetween((u) => Math.max(yc(dZ(u)), 0), () => 0, lo + eps, to, { fill: withAlpha(col.opt(), theme.dark ? 0.35 : 0.24) });
      plotD.fillBetween((u) => Math.min(yc(dZ(u)), 0), () => 0, lo + eps, to, { fill: withAlpha(col.cut(), theme.dark ? 0.35 : 0.24) });
      plotD.fn((u) => yc(dZ(u)), { color: col.tan(), width: 2.2, from: lo + eps, to });
      if (p.show && !scan.running) plotD.point(xOpt(), 0, { color: col.opt(), radius: 4.5 });
      plotD.segment([shownX, 0], [shownX, yc(dZ(shownX))], { color: col.x(), width: 2 });
      plotD.point(shownX, 0, { color: col.x(), radius: 5 });
      const d = dZ(shownX);
      const sign = Math.abs(d) < mx * 1e-3 ? '= 0' : d > 0 ? '> 0' : '< 0';
      text(g, `${ctx.t('deriv')}: ${zName()}′(${varName()}) ${sign}`, plotD.px(lo) + 8, r.y + 8, { font: font(700, F(11.5, 10.5)), color: mixColor(col.tan(), theme.text, 0.2), align: 'left' });
      text(g, `${varName()} in ${unitX()}`, r.x + r.w - 4, plotD.py(0) - 10, { font: font(600, F(11, 10)), color: theme.muted, align: 'right' });
      plotD.end();
    }

    /* ---------- Lösungsweg ---------- */
    function stepsCard(R: Rect): void {
      const g = surface.g;
      const theme = th();
      const pad = F(14, 12);
      card(R, col.Z(), 0.03);
      title(R.x + pad, R.y + 16, ctx.t('stepsT'), col.Z());
      const maxW = R.w - 2 * pad - 6;
      const fs = F(13, 12);
      const lf = font(700, F(11.5, 10.5));
      const xo = xOpt();
      const pr = prob();
      const vn = varName();
      const zn = zName();
      let y = R.y + 24;
      const line = (src: string, color = theme.text) => {
        if (y > R.y + R.h - 14) return;
        const b = fitFormula(src, maxW, fs, color);
        b.draw(g, R.x + pad + 6, y + b.asc);
        y += b.asc + b.desc + 5;
      };
      const head = (k: string) => {
        if (y > R.y + R.h - 20) return;
        text(g, ctx.t(k), R.x + pad, y + 9, { font: lf, color: theme.muted, align: 'left' });
        y += 17;
      };
      const a = n1(p.a);
      const b = n1(p.b);
      const l = life();
      const H = fmt.num(p.ch, 0);
      head('s1');
      if (pr === 'box') line(`\\t{${ctx.t('box1')}}`);
      else if (pr === 'can') line(`O = 2πr² + 2πrh`);
      else if (pr === 'rect') line(`\\t{${ctx.t('rect1')}}`);
      else if (pr === 'cone') line(`\\t{${ctx.t('cone1')}}`);
      else line(`\\t{${ctx.t('life1')}}`);
      head('s2');
      if (pr === 'box') {
        line(`\\t{${ctx.t('box2')}}`);
        line(`\\c{z}{V(x) = x(${a} − 2x)(${b} − 2x)}`);
      } else if (pr === 'can') {
        line(`\\t{${ctx.t('can2')}}`);
        line(`\\c{z}{O(r) = 2πr² + \\f{${fmt.num(2 * p.v, 0)}}{r}}`);
      } else if (pr === 'rect') {
        line(`\\t{${ctx.t('rect2')}}`);
        line(`\\c{z}{A(u) = u · 3e^{−0,5u}}`);
      } else if (pr === 'cone') {
        // Steigung H/R als ganze Zahl oder als Bruch
        const k = p.ch % CONE_R === 0 ? fmt.num(p.ch / CONE_R, 0) : `\\f{${H}}{6}`;
        line(`\\t{${ctx.t('cone2')}} = ${H} − ${k}r`);
        line(`\\c{z}{V(r) = πr²(${H} − ${k}r)}`);
      } else {
        line(`\\t{${ctx.t('life2')}}: \\r{20² + x²},  \\r{30² + (60 − x)²}`);
        line(`\\c{z}{T(x) = \\f{\\r{400 + x²}}{${fmt.num(l.v1, 1)}} + \\f{\\r{900 + (60 − x)²}}{${fmt.num(l.v2, 1)}}}`);
      }
      head('s3');
      if (pr === 'box') line(`0 < x < ${n1(Math.min(p.a, p.b) / 2)}`);
      else if (pr === 'cone') line(`0 < r < 6`);
      else if (pr === 'life') line(`0 ≤ x ≤ 60`);
      else line(`${vn} > 0`);
      head('s4');
      if (pr === 'box') line(`V′(x) = 12x² − ${fmt.num(4 * (p.a + p.b), 0)}x + ${fmt.num(p.a * p.b, 0)} = 0`);
      else if (pr === 'can') line(`O′(r) = 4πr − \\f{${fmt.num(2 * p.v, 0)}}{r²} = 0  ⇒  r = \\t{∛}(\\f{V}{2π})`);
      else if (pr === 'rect') line(`A′(u) = 3e^{−0,5u}(1 − 0,5u) = 0  ⇒  u = 2`);
      else if (pr === 'cone') line(`V′(r) = π(${fmt.num(2 * p.ch, 0)}r − ${fmt.num((3 * p.ch) / CONE_R, 1)}r²) = 0  ⇒  r = 4`);
      else {
        line(`T′(x) = \\f{x}{${fmt.num(l.v1, 1)}\\r{400 + x²}} − \\f{60 − x}{${fmt.num(l.v2, 1)}\\r{900 + (60 − x)²}} = 0`);
        line(`\\t{${ctx.t('numeric')}:} x ≈ ${Q(n2(xo))}`);
      }
      head('s5');
      const d2 = secondDeriv(dZ, xo);
      const kind = isMin() ? 'min' : 'max';
      line(`${zn}″(${Q(n2(xo))}) ${p.show ? `≈ ${fmt.num(d2, Math.abs(d2) < 1 ? 3 : 1)}` : ''} ${isMin() ? '> 0' : '< 0'};  ${zn}′: \\t{${ctx.t(`vzw_${kind}`)}}`);
      head('s6');
      if (pr === 'box') line(`\\t{V(0) = V(${n1(Math.min(p.a, p.b) / 2)}) = 0: ${ctx.t('zeroEnds')}}`);
      else if (pr === 'can') line(`\\t{${ctx.t('inf')}}`);
      else if (pr === 'rect') line(`\\t{${ctx.t('rectEnds')}}`);
      else if (pr === 'cone') line(`\\t{V(0) = V(6) = 0: ${ctx.t('zeroEnds')}}`);
      else line(`T(0) ≈ ${Q(n2(Z(0)))} \\t{s},  T(60) ≈ ${Q(n2(Z(60)))} \\t{s}  \\t{– ${ctx.t('worse')}}`);
      head('s7');
      const eqX = Math.abs(xo - Math.round(xo * 100) / 100) < 1e-9 ? '=' : '≈';
      line(`\\c{o}{${vn} ${eqX} ${Q(n2(xo))} \\t{${unitX()}},  ${zn} ≈ ${Q(nz(Z(xo)))} \\t{${unitZ()}}  (\\t{${ctx.t(kind)}})}`);
      if (!p.show) return;
      if (pr === 'box') line(`\\t{${ctx.t('box')}:} ${n1(p.a - 2 * xo)} × ${n1(p.b - 2 * xo)} × ${n2(xo)} \\t{cm}`, theme.muted);
      if (pr === 'can') line(`h ≈ ${n2(canHeight(p.v, xo))} \\t{cm} = 2r`, theme.muted);
      if (pr === 'cone') line(`h = ${n2(coneCylHeight(cone(), xo))} \\t{cm};  \\f{V_{Zyl}}{V_{Kegel}} = \\f{4}{9}`, theme.muted);
      if (pr === 'life') {
        const [s1] = lifeSines(l, xo);
        line(`\\t{${ctx.t('snell')}:} \\f{\\t{sin} α₁}{v₁} = \\f{\\t{sin} α₂}{v₂} = ${fmt.num(s1 / l.v1, 4)}`, theme.muted);
      }
    }

    /* ---------- Rendern ---------- */
    function render(): void {
      const now = performance.now();
      const dt = Math.min(0.05, (now - lastFrame) / 1000);
      lastFrame = now;
      if (dragging && now - dragging > 250) dragging = 0;
      let moving = false;
      const [lo, hi] = domain();
      if (toOpt.running) shownX = lerp(optFrom, xOpt(), toOpt.value);
      else if (scan.running) shownX = lerp(lo + margin(), hi - margin(), scan.value);
      else {
        const goal = xEff();
        if (dragging || reduced || Math.abs(goal - shownX) < 1e-3 * (hi - lo)) shownX = goal;
        else {
          shownX += (goal - shownX) * (1 - Math.exp(-dt * 7));
          moving = true;
        }
      }
      surface.begin();
      plot.resize();
      plotD.resize();
      const R = regions();
      const pr = prob();
      if (pr === 'box') drawBox(R.pic);
      else if (pr === 'can') drawCan(R.pic);
      else if (pr === 'rect') drawRect(R.pic);
      else if (pr === 'cone') drawCone(R.pic);
      else drawLife(R.pic);
      drawGraph();
      if (R.der) drawDeriv();
      stepsCard(R.col);
      if (moving || dragging || busy() || fold.running) ctx.requestRender();
      else if (optEnd) {
        optEnd = false;
        ctx.set({ x: snapX(xOpt()) });
      }
    }

    return {
      update(changed, source) {
        if (changed.has('prob') && source === 'input') ctx.set({ x: START[prob()] });
        if (changed.has('prob') && source !== 'init') shownX = xEff();
        if (['prob', 'x', 'v1', 'v2'].some((k) => changed.has(k)) && !race.running) raceOn = false;
        updateReadouts();
        ctx.requestRender();
      },
      action(id) {
        if (id === 'opt') {
          optFrom = shownX;
          toOpt.play(reduced ? 1 : 1400);
          optEnd = true;
        } else if (id === 'scan') scan.play(reduced ? 1 : SCAN_MS);
        else if (id === 'fold') fold.play(reduced ? 1 : FOLD_MS);
        else if (id === 'race' && prob() === 'life') {
          const l = life();
          const straight = (l.a * l.d) / (l.a + l.b);
          raceT = { cur: Math.max(lifeTime(l, xEff()), lifeTime(l, straight)), straight: lifeTime(l, straight), opt: lifeTime(l, xOpt()), x: xEff() };
          // maßstäblich: 1 s Rennzeit ≈ 0,25 s Animation
          race.play(reduced ? 1 : clamp(raceT.cur * 250, 3000, 9000));
          raceOn = true;
        }
        ctx.requestRender();
      },
      render,
      destroy: () => surface.destroy(),
    };
  },
});
